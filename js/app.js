/* ============================================================
   SIE — runtime do shell: registro de views, navegação,
   helpers de gráfico (tema compartilhado), relógio e ticker.
   ============================================================ */
window.SIE = (function () {

  var DATA = window.SIE_DATA;
  var views = {};           // id -> { render(container), rendered }
  var charts = {};          // viewId -> [echartsInstance]
  var activeView = null;
  var territory = { name: 'Paraná', code: 'PR' };
  var baseData = null;
  var territories = [
    { name: 'Brasil', code: 'BR' },
    { name: 'Acre', code: 'AC' }, { name: 'Alagoas', code: 'AL' }, { name: 'Amapá', code: 'AP' },
    { name: 'Amazonas', code: 'AM' }, { name: 'Bahia', code: 'BA' }, { name: 'Ceará', code: 'CE' },
    { name: 'Distrito Federal', code: 'DF' }, { name: 'Espírito Santo', code: 'ES' }, { name: 'Goiás', code: 'GO' },
    { name: 'Maranhão', code: 'MA' }, { name: 'Mato Grosso', code: 'MT' }, { name: 'Mato Grosso do Sul', code: 'MS' },
    { name: 'Minas Gerais', code: 'MG' }, { name: 'Pará', code: 'PA' }, { name: 'Paraíba', code: 'PB' },
    { name: 'Paraná', code: 'PR' }, { name: 'Pernambuco', code: 'PE' }, { name: 'Piauí', code: 'PI' },
    { name: 'Rio de Janeiro', code: 'RJ' }, { name: 'Rio Grande do Norte', code: 'RN' }, { name: 'Rio Grande do Sul', code: 'RS' },
    { name: 'Rondônia', code: 'RO' }, { name: 'Roraima', code: 'RR' }, { name: 'Santa Catarina', code: 'SC' },
    { name: 'São Paulo', code: 'SP' }, { name: 'Sergipe', code: 'SE' }, { name: 'Tocantins', code: 'TO' }
  ];

  var TERRITORY_PROFILES = {
    // volume = escala relativa de sinais/grupos, com Brasil = 1,00.
    // Os valores são mockados para preservar proporção, não representam medição real.
    BR: { volume: 1.00, municipios: 5570, ativos: 4860, locais: ['São Paulo', 'Brasília', 'Rio de Janeiro', 'Salvador', 'Belo Horizonte', 'Fortaleza', 'Curitiba', 'Recife', 'Porto Alegre', 'Manaus', 'Goiânia', 'Belém'], regiao: 'Brasil' },
    PR: { volume: 0.055, municipios: 399, ativos: 371, locais: ['Toledo', 'Cascavel', 'Maringá', 'Guarapuava', 'Curitiba', 'São José dos Pinhais', 'Ponta Grossa', 'Apucarana', 'Foz do Iguaçu', 'Colombo', 'Londrina', 'Paranaguá'], regiao: 'Paraná' },
    SP: { volume: 0.225, municipios: 645, ativos: 592, locais: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'São José dos Campos', 'Sorocaba', 'Bauru', 'Piracicaba', 'Guarulhos', 'Osasco', 'Santo André', 'Franca'], regiao: 'São Paulo' },
    MG: { volume: 0.105, municipios: 853, ativos: 761, locais: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Montes Claros', 'Uberaba', 'Governador Valadares', 'Ipatinga', 'Divinópolis', 'Poços de Caldas', 'Sete Lagoas', 'Varginha'], regiao: 'Minas Gerais' }
  };

  function territoryProfile(item) {
    if (TERRITORY_PROFILES[item.code]) return TERRITORY_PROFILES[item.code];
    var seed = 0;
    for (var i = 0; i < item.code.length; i++) seed += item.code.charCodeAt(i);
    var municipios = 80 + (seed * 17) % 420;
    return { volume: Math.max(0.003, municipios / 5570), municipios: municipios, ativos: Math.round(municipios * 0.89), locais: [item.name, 'Capital regional', 'Polo metropolitano', 'Centro-Oeste', 'Litoral', 'Interior norte', 'Interior sul', 'Região central', 'Vale principal', 'Eixo econômico', 'Zona urbana', 'Zona rural'], regiao: item.name };
  }

  function scale(value, factor, min, max) {
    var next = value * factor;
    if (min != null) next = Math.max(min, next);
    if (max != null) next = Math.min(max, next);
    return Math.round(next * 10) / 10;
  }

  function hashCode(value) {
    var h = 0;
    for (var i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
    return h;
  }

  // Fechar distribuições na precisão exibida, sem acumular erro de arredondamento.
  function percentages(values, precision) {
    var unit = Math.pow(10, precision), total = values.reduce(function (a, b) { return a + b; }, 0);
    var result = values.map(function (v) { return Math.round(v / total * 100 * unit) / unit; });
    result[result.length - 1] = Math.round((100 - result.slice(0, -1).reduce(function (a, b) { return a + b; }, 0)) * unit) / unit;
    return result;
  }

  function alignSeries(values, target) {
    var offset = target - values[values.length - 1];
    return values.map(function (v, i) { return Math.round(Math.max(0, Math.min(100, v + offset * i / (values.length - 1))) * 10) / 10; });
  }

  function applyTerritoryData(item) {
    if (!baseData) {
      baseData = JSON.parse(JSON.stringify(DATA));
      baseData.prand = DATA.prand;
    }
    var next = JSON.parse(JSON.stringify(baseData));
    next.prand = DATA.prand;
    var profile = territoryProfile(item);
    var factor = profile.volume;
    var relativeScale = factor / TERRITORY_PROFILES.PR.volume;
    var shift = item.code === 'PR' ? 0 : (hashCode(item.code) % 9) - 4;

    next.meta = { name: item.name, code: item.code, municipios: profile.municipios, locais: profile.locais, regiao: profile.regiao, nacional: item.code === 'BR' };
    next.kpis.municipios = profile.municipios;
    next.kpis.municipiosAtivos = Math.min(profile.municipios, Math.round(profile.ativos * 378 / 371));
    next.kpis.sinais24h = Math.round(next.kpis.sinais24h * relativeScale);
    next.kpis.gruposAtivos = Math.round(next.kpis.gruposAtivos * relativeScale);
    next.kpis.precisaoModelo = scale(next.kpis.precisaoModelo, 0.99 + (hashCode(item.code) % 3) / 100, 88, 97);
    next.kpis.ondasEmergentes = Math.max(1, Math.round(next.kpis.ondasEmergentes * Math.min(2.4, Math.max(0.7, Math.sqrt(relativeScale))) + shift / 2));
    next.kpis.alertasCrise = Math.max(0, Math.round(next.kpis.alertasCrise * Math.min(2.2, Math.max(0.6, Math.sqrt(relativeScale))) + shift / 4));

    next.candidatos.forEach(function (c, i) {
      c.proj = scale(c.proj, 0.94 + ((hashCode(item.code + c.id) % 13) / 100), 8, 58);
      c.delta = Math.round((c.delta + shift / 3 + (i - 1) * 0.2) * 10) / 10;
    });
    var shares = percentages(next.candidatos.map(function (c) { return c.proj; }), 1);
    next.candidatos.forEach(function (c, i) { c.proj = shares[i]; });
    next.candidatos[3].delta = -Math.round(next.candidatos.slice(0, 3).reduce(function (sum, c) { return sum + c.delta; }, 0) * 10) / 10;
    ['hv', 'rb', 'mt'].forEach(function (id) {
      var candidate = next.candidatos.find(function (c) { return c.id === id; });
      next.projSeries[id] = alignSeries(next.projSeries[id], candidate.proj);
      // A variação de sete dias usa a mesma referência da curva.
      next.projSeries[id][next.projSeries[id].length - 8] = Math.round((candidate.proj - candidate.delta) * 10) / 10;
    });
    next.perfis.forEach(function (p, i) {
      p.tamanho = Math.round(p.tamanho * relativeScale);
      p.engajamento = scale(p.engajamento, 0.94 + i * 0.02 + (hashCode(item.code) % 4) / 100, 2, 18);
      p.coesao = Math.round(Math.max(30, Math.min(96, p.coesao + shift + i)));
      Object.keys(p.espectro).forEach(function (key) { p.espectro[key] = Math.max(1, Math.round(p.espectro[key] + shift * (key === 'centro' ? 0.2 : 0.4))); });
      var keys = Object.keys(p.espectro), distribution = percentages(keys.map(function (key) { return p.espectro[key]; }), 0);
      keys.forEach(function (key, j) { p.espectro[key] = distribution[j]; });
      Object.keys(p.radar).forEach(function (key) { p.radar[key] = Math.round(Math.max(20, Math.min(98, p.radar[key] + shift))); });
    });

    var anchors = {};
    profile.locais.forEach(function (nome, i) {
      var source = baseData.mapaAncoras[Object.keys(baseData.mapaAncoras)[i % Object.keys(baseData.mapaAncoras).length]];
      anchors[nome] = {
        tendencia: Math.round(Math.max(0, Math.min(100, source.tendencia + shift + i % 4 * 2))),
        engajamento: Math.round(Math.max(0, Math.min(100, source.engajamento + shift + i % 5 * 2))),
        crescimento: Math.round(Math.max(0, Math.min(100, source.crescimento + shift + i % 3 * 3))),
        influencia: Math.round(Math.max(0, Math.min(100, source.influencia + shift + i % 4 * 2))),
        lider: ['hv', 'rb', 'mt'][i % 3]
      };
    });
    next.mapaAncoras = anchors;
    next.bairrosCuritiba = next.bairrosCuritiba.map(function (b, i) { b.nome = profile.locais[i]; b.engajamento = Math.round(Math.max(20, Math.min(98, b.engajamento + shift))); b.tendencia = Math.round(Math.max(0, Math.min(100, b.tendencia + shift))); return b; });
    next.pautas.forEach(function (p, i) { p.tracao = Math.round(Math.max(20, Math.min(98, p.tracao + shift + (i % 3) * 2))); p.cresc7d = Math.round(p.cresc7d + shift / 2); p.sentimento = Math.round(Math.max(-90, Math.min(90, p.sentimento + shift * 2))); p.engaj = scale(p.engaj, 0.98 + (hashCode(item.code + p.id) % 5) / 100, 1, 15); });
    Object.keys(next.pautasSeries).forEach(function (key) { next.pautasSeries[key] = alignSeries(next.pautasSeries[key], next.pautas.find(function (p) { return p.id === key; }).tracao); });
    next.ondas.forEach(function (onda, i) { onda.regiao = profile.regiao + (i === 0 ? '' : ' · leitura regional'); onda.cresc = Math.round(onda.cresc + shift * 4); });

    // Os contadores e textos repetidos refletem o mesmo cenário territorial.
    next.kpis.ondasEmergentes = next.ondas.filter(function (o) { return o.fase < 3; }).length;
    next.feed[0].txt = '<strong>Onda emergente</strong> — "' + next.ondas[0].tema + '" cresce ' + next.ondas[0].cresc + '% em 72h em ' + item.name;
    next.ticker[0] = '<b>' + next.kpis.municipiosAtivos + '</b> municípios na base analisada · ' + item.code;
    next.ticker[1] = '<span class="sig-warn">▲ ' + next.ondas[0].cresc + '%</span> pauta "' + next.ondas[0].tema + '" · ' + item.name + ' · fase 2';
    next.ticker[2] = '<b>' + fmtCompact(next.kpis.sinais24h) + '</b> sinais públicos processados nas últimas 24h';
    next.ticker[3] = '<span class="sig-up">' + fmtDelta(next.candidatos[0].delta, 'pp') + '</span> projeção do Candidato X · janela de 7 dias';
    next.ticker[6] = 'Precisão estimada <b>' + fmtPct(next.kpis.precisaoModelo, 1) + '</b> · cenário simulado';

    Object.keys(next).forEach(function (key) { DATA[key] = next[key]; });
  }

  // ---------- tema ECharts compartilhado (AIME light) ----------
  var FONT_MONO = "'Roboto Mono', Consolas, monospace";
  var FONT_DISPLAY = "'Roboto', 'Segoe UI', sans-serif";

  // chart-1..5 do AIME: primary / accent / success / warning / info (+ error)
  var THEME = {
    color: ['#005BAA', '#07884F', '#07884F', '#FFCB05', '#0072BC', '#BA3436'],
    backgroundColor: 'transparent',
    textStyle: { color: '#444B4C', fontFamily: FONT_DISPLAY, fontSize: 12 },
    axisPointer: {
      lineStyle: { color: 'rgba(0,91,170,0.35)' },
      label: { backgroundColor: '#005BAA', color: '#FFFFFF', fontFamily: FONT_MONO }
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: '#E5E8E3' } },
      axisTick: { show: false },
      axisLabel: { color: '#626C70', fontFamily: FONT_MONO, fontSize: 12 },
      splitLine: { show: false }
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#626C70', fontFamily: FONT_MONO, fontSize: 12 },
      splitLine: { lineStyle: { color: '#E5E8E3' } }
    },
    legend: {
      textStyle: { color: '#444B4C', fontFamily: FONT_DISPLAY, fontSize: 12 },
      icon: 'rect', itemWidth: 10, itemHeight: 3
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      borderColor: '#E5E8E3',
      borderWidth: 1,
      textStyle: { color: '#17191C', fontFamily: FONT_DISPLAY, fontSize: 14 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(0,91,170,0.10), 0 12px 32px rgba(0,91,170,0.12); border-radius: 8px;'
    }
  };
  echarts.registerTheme('sie', THEME);

  // registra o mapa do Paraná (geoJSON embutido via parana-geo.js)
  if (window.PARANA_GEO) {
    echarts.registerMap('parana', window.PARANA_GEO);
  }

  // ---------- helpers ----------
  function chart(el, option, viewId) {
    var inst = echarts.init(el, 'sie', { renderer: 'canvas' });
    option.animation = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!option.animation && option.series) option.series.forEach(function (s) { if (s.type === 'effectScatter') s.type = 'scatter'; });
    inst.setOption(option);
    el.setAttribute('role', 'img');
    var panel = el.closest('.panel');
    var label = panel && panel.querySelector('.panel-title');
    el.setAttribute('aria-label', label ? label.textContent : 'Gráfico');
    if (viewId) {
      (charts[viewId] = charts[viewId] || []).push(inst);
    }
    return inst;
  }

  function fmtInt(n) {
    return n.toLocaleString('pt-BR');
  }
  function fmtCompact(n) {
    if (n >= 1e6) return (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'M';
    if (n >= 1e3) return (n / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
    return String(n);
  }
  function fmtPct(n, dec) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: dec == null ? 1 : dec, maximumFractionDigits: dec == null ? 1 : dec }) + '%';
  }
  function fmtDelta(n, suffix) {
    var s = (n > 0 ? '+' : '') + n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    return s + (suffix || '');
  }

  // contador animado (para KPIs)
  function animateCount(el, target, opts) {
    opts = opts || {};
    var dur = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : (opts.dur || 1100);
    var dec = opts.dec || 0;
    var suffix = opts.suffix || '';
    var compact = opts.compact;
    var start = null;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      var val = target * eased;
      el.textContent = (compact ? fmtCompact(Math.round(val)) :
        val.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec })) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ---------- navegação ----------
  function activate(id) {
    if (!views[id]) { location.replace('#overview'); return; }
    document.body.classList.remove('menu-open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
    if (activeView === id) return;
    activeView = id;
    var published = id === 'pesquisas';
    document.querySelector('.context-strip').innerHTML = published
      ? '<span><i></i> Pesquisas publicadas · ' + territory.name + '</span><span>Catálogo revisado em 15 set 2026</span>'
      : '<span><i></i> Referências públicas</span><span>Revisadas em 15 set 2026</span>';
    document.querySelector('.live-badge').textContent = 'Fontes públicas';
    document.querySelector('.footer-note').textContent = published ? 'Pesquisas publicadas · curadoria manual · sem atualização automática' : 'Curadoria manual · sem atualização automática';
    document.querySelector('.ticker-label').textContent = published ? 'SIE / PESQUISAS' : 'SIE / PAINEL';
    document.querySelector('.ctx').innerHTML = '<span id="context-location">' + territory.name + '</span> <span class="sep">/</span> <span class="cycle">Eleições 2026</span>';


    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.toggle('active', n.dataset.view === id);
      if (n.dataset.view === id) n.setAttribute('aria-current', 'page');
      else n.removeAttribute('aria-current');
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.dataset.view === id);
    });

    var def = views[id];
    var container = document.getElementById('view-' + id);
    if (def && !def.rendered) {
      def.render(container);
      def.rendered = true;
      var heading = container.querySelector('.view-title');
      if (heading && heading.tagName !== 'H1') {
        var h = document.createElement('h1'); h.className = heading.className; h.textContent = heading.textContent; heading.replaceWith(h);
      }
    }
    // gráficos escondidos têm tamanho 0 — redimensiona ao exibir
    requestAnimationFrame(function () {
      (charts[id] || []).forEach(function (c) { c.resize(); });
    });
    document.getElementById('main').scrollTop = 0;
    var title = container.querySelector('.view-title');
    document.title = 'SIE — ' + (title ? title.textContent : 'Centro de Comando');
    if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
  }

  function rerenderActiveView() {
    Object.keys(charts).forEach(function (id) {
      (charts[id] || []).forEach(function (instance) { instance.dispose(); });
      charts[id] = [];
    });
    Object.keys(views).forEach(function (id) {
      views[id].rendered = false;
      var container = document.getElementById('view-' + id);
      if (container) container.innerHTML = '';
    });
    var current = activeView || 'overview';
    activeView = null;
    activate(current);
  }

  // ---------- boot ----------
  function boot() {
    document.querySelector('.skip-link').addEventListener('click', function (e) { e.preventDefault(); document.getElementById('main').focus(); });
    window.addEventListener('hashchange', function () { activate(location.hash.slice(1) || 'overview'); });
    var toggle = document.getElementById('menu-toggle');
    function closeMenu() { document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded', 'false'); }
    toggle.addEventListener('click', function () {
      var open = document.body.classList.toggle('menu-open'); toggle.setAttribute('aria-expanded', String(open));
      if (open) document.querySelector('.nav-item.active').focus();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('menu-open')) { closeMenu(); toggle.focus(); } });
    document.getElementById('main').addEventListener('click', closeMenu);
    document.querySelectorAll('.nav-item').forEach(function (n) { n.addEventListener('click', closeMenu); });

    // seletor global de território
    var picker = document.getElementById('territory-picker');
    var trigger = document.getElementById('territory-trigger');
    var menu = document.getElementById('territory-menu');
    var search = document.getElementById('territory-search');
    var options = document.getElementById('territory-options');
    function renderTerritories(filter) {
      var query = (filter || '').trim().toLocaleLowerCase('pt-BR');
      var matches = territories.filter(function (item) { return !query || (item.name + ' ' + item.code).toLocaleLowerCase('pt-BR').indexOf(query) !== -1; });
      options.innerHTML = matches.length ? matches.map(function (item) {
        return '<button class="territory-option' + (item.code === territory.code ? ' is-selected' : '') + '" type="button" role="option" aria-selected="' + (item.code === territory.code) + '" data-territory="' + item.code + '"><span class="territory-option-code">' + item.code + '</span><span>' + item.name + '</span></button>';
      }).join('') : '<div class="territory-empty">Nenhum território encontrado.</div>';
    }
    function setTerritory(item) {
      territory = item;
      applyTerritoryData(item);
      document.getElementById('territory-code').textContent = item.code;
      document.getElementById('workspace-label').textContent = 'WORKSPACE / ' + item.name.toUpperCase();
      document.getElementById('context-location').textContent = item.name;
      document.querySelector('.territory-note').textContent = 'Dados demonstrativos recalculados para ' + item.name + '. A cobertura disponível varia conforme o território.';
      renderTerritories(search.value);
      trigger.setAttribute('aria-label', 'Território atual: ' + item.name + '. Abrir seletor');
      closeTerritory();
      rerenderActiveView();
    }
    function closeTerritory() { menu.classList.remove('is-open'); trigger.setAttribute('aria-expanded', 'false'); }
    renderTerritories('');
    trigger.setAttribute('aria-label', 'Território atual: ' + territory.name + '. Abrir seletor');
    trigger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open'); trigger.setAttribute('aria-expanded', String(open));
      if (open) { search.focus(); search.select(); }
    });
    search.addEventListener('input', function () { renderTerritories(search.value); });
    options.addEventListener('click', function (e) {
      var button = e.target.closest('[data-territory]');
      if (!button) return;
      var selected = territories.find(function (item) { return item.code === button.dataset.territory; });
      if (selected) setTerritory(selected);
    });
    document.addEventListener('click', function (e) { if (!picker.contains(e.target)) closeTerritory(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { closeTerritory(); trigger.focus(); } });

    // relógio
    var clockEl = document.getElementById('clock');
    function tick() {
      var d = new Date();
      clockEl.textContent = d.toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit' }) + ' Brasília';
      clockEl.dateTime = d.toISOString();
    }
    tick();
    setInterval(tick, 1000);

    // resize global
    window.addEventListener('resize', function () {
      (charts[activeView] || []).forEach(function (c) { c.resize(); });
    });

    applyTerritoryData(territory);
    document.querySelector('.territory-note').textContent = 'Dados demonstrativos recalculados para ' + territory.name + '. A cobertura disponível varia conforme o território.';
    activate(location.hash.slice(1) || 'overview');
  }

  return {
    DATA: DATA,
    registerView: function (id, def) { views[id] = def; },
    chart: chart,
    animateCount: animateCount,
    fmt: { int: fmtInt, compact: fmtCompact, pct: fmtPct, delta: fmtDelta },
    fonts: { mono: FONT_MONO, display: FONT_DISPLAY },
    colors: {
      // chaves mantidas do v1; valores AIME (cyan=primary, orange=warning)
      cyan: '#005BAA', cyanHi: '#004880', orange: '#FFCB05', orangeHi: '#806300',
      accent: '#07884F', accentHover: '#06663C', info: '#0072BC',
      pos: '#07884F', neg: '#BA3436', warn: '#FFCB05',
      esq: '#FFCB05', centro: '#626C70', dir: '#005BAA',
      textHi: '#17191C', text: '#444B4C', textLow: '#626C70',
      bg0: '#FAFAF8', bg1: '#FFFFFF', bg2: '#F2F3F0', bg3: '#E7EBE7', line: '#E5E8E3'
    },
    territory: function () { return territory; },
    boot: boot
  };
})();
