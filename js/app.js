/* ============================================================
   SIE — runtime do shell: registro de views, navegação,
   helpers de gráfico (tema compartilhado), relógio e ticker.
   ============================================================ */
window.SIE = (function () {

  var DATA = window.SIE_DATA;
  var views = {};           // id -> { render(container), rendered }
  var charts = {};          // viewId -> [echartsInstance]
  var activeView = null;

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
      ? '<span><i></i> Pesquisas publicadas · Brasil e estados</span><span>Catálogo revisado em 15 set 2026</span>'
      : '<span><i></i> Referências públicas</span><span>Revisadas em 15 set 2026</span>';
    document.querySelector('.live-badge').textContent = 'Fontes públicas';
    document.querySelector('.footer-note').textContent = published ? 'Pesquisas publicadas · curadoria manual · sem atualização automática' : 'Curadoria manual · sem atualização automática';
    document.querySelector('.ticker-label').textContent = published ? 'SIE / PESQUISAS' : 'SIE / PAINEL';
    document.querySelector('.ctx').innerHTML = (published ? 'Brasil e estados' : 'Paraná') + ' <span class="sep">/</span> <span class="cycle">Eleições 2026</span>';


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
    boot: boot
  };
})();
