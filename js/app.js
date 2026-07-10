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
    color: ['#1C4B6A', '#45AEAA', '#3FB950', '#D29922', '#58A6FF', '#F85149'],
    backgroundColor: 'transparent',
    textStyle: { color: '#4B5563', fontFamily: FONT_DISPLAY, fontSize: 12 },
    axisPointer: {
      lineStyle: { color: 'rgba(28,75,106,0.35)' },
      label: { backgroundColor: '#1C4B6A', color: '#FFFFFF', fontFamily: FONT_MONO }
    },
    categoryAxis: {
      axisLine: { lineStyle: { color: '#ECEFF3' } },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontFamily: FONT_MONO, fontSize: 12 },
      splitLine: { show: false }
    },
    valueAxis: {
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6B7280', fontFamily: FONT_MONO, fontSize: 12 },
      splitLine: { lineStyle: { color: '#ECEFF3' } }
    },
    legend: {
      textStyle: { color: '#4B5563', fontFamily: FONT_DISPLAY, fontSize: 12 },
      icon: 'rect', itemWidth: 10, itemHeight: 3
    },
    tooltip: {
      backgroundColor: '#FFFFFF',
      borderColor: '#ECEFF3',
      borderWidth: 1,
      textStyle: { color: '#1F2937', fontFamily: FONT_DISPLAY, fontSize: 14 },
      extraCssText: 'box-shadow: 0 4px 12px rgba(28,73,108,0.10), 0 12px 32px rgba(28,73,108,0.12); border-radius: 8px;'
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
    inst.setOption(option);
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
    var dur = opts.dur || 1100;
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
    if (activeView === id) return;
    activeView = id;

    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.classList.toggle('active', n.dataset.view === id);
    });
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.dataset.view === id);
    });

    var def = views[id];
    var container = document.getElementById('view-' + id);
    if (def && !def.rendered) {
      def.rendered = true;
      def.render(container);
    }
    // gráficos escondidos têm tamanho 0 — redimensiona ao exibir
    requestAnimationFrame(function () {
      (charts[id] || []).forEach(function (c) { c.resize(); });
    });
    document.getElementById('main').scrollTop = 0;
  }

  // ---------- boot ----------
  function boot() {
    // nav
    document.querySelectorAll('.nav-item').forEach(function (n) {
      n.addEventListener('click', function () { activate(n.dataset.view); });
    });

    // relógio
    var clockEl = document.getElementById('clock');
    function tick() {
      var d = new Date();
      function p(x) { return x < 10 ? '0' + x : x; }
      clockEl.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' BRT';
    }
    tick();
    setInterval(tick, 1000);

    // ticker
    var track = document.getElementById('ticker-track');
    track.innerHTML = DATA.ticker.map(function (t) { return '<span>' + t + '</span>'; }).join('');

    // resize global
    window.addEventListener('resize', function () {
      (charts[activeView] || []).forEach(function (c) { c.resize(); });
    });

    activate('overview');
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
      cyan: '#1C4B6A', cyanHi: '#143A52', orange: '#D29922', orangeHi: '#9A6700',
      accent: '#45AEAA', accentHover: '#37908D', info: '#58A6FF',
      pos: '#3FB950', neg: '#F85149', warn: '#D29922',
      esq: '#D29922', centro: '#6B7280', dir: '#1C4B6A',
      textHi: '#1F2937', text: '#4B5563', textLow: '#6B7280',
      bg0: '#F5F7FA', bg1: '#FFFFFF', bg2: '#F0F4F8', bg3: '#E4EAF1', line: '#ECEFF3'
    },
    boot: boot
  };
})();
