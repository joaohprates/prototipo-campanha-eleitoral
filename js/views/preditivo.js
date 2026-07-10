/* ============================================================
   SIE — view 'preditivo'
   MÓDULO 05 · MODELAGEM PREDITIVA
   Curva de adoção em 3 fases, ondas monitoradas, governança.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('preditivo', { render: render });

  // acentos por fase: 1 = ciano (invisível p/ pesquisas), 2 = laranja (intervenção), 3 = vermelho (tarde)
  var FASE_ACC = { 1: C.cyan, 2: C.orange, 3: C.neg };
  var FASE_TAG = { 1: 'tag cyan', 2: 'tag orange', 3: 'tag' };
  var SPARK_COL = { 1: C.cyan, 2: C.orange, 3: C.centro };

  function rgba(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }

  function render(container) {
    var dias = D.ondaDias;
    var o0 = D.ondas[0];
    var f1End = Math.round((dias.length - 1) * 0.4);  // fim da fase 1 (~40%)
    var f2End = Math.round((dias.length - 1) * 0.7);  // fim da fase 2 (~70%)

    container.innerHTML = `
      <div class="view-head reveal">
      <style>
        .pd-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 14px; }
        .pd-acao-top {
          margin-left: auto; font-family: var(--f-mono); font-size: 14px;
          letter-spacing: 0.06em; color: #9A6700;
        }
        .pd-card { display: flex; flex-direction: column; }
        .pd-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
        .pd-tema { font-family: var(--f-display); font-weight: 600; font-size: 15.5px; color: var(--text-hi); line-height: 1.25; }
        .pd-regiao { font-family: var(--f-mono); font-size: 14px; color: var(--text-low); letter-spacing: 0.06em; margin-top: 5px; }
        .pd-cresc { font-size: 26px; }
        .pd-fact { margin-top: 9px; }
        .pd-fact-k {
          font-family: var(--f-mono); font-size: 14px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-low); display: block; margin-bottom: 2px;
        }
        .pd-fact-v { font-family: var(--f-mono); font-size: 14px; color: var(--text); line-height: 1.45; }
        .pd-acaoline {
          margin-top: 12px; padding: 8px 11px; font-size: 14px; line-height: 1.45;
          border-left: 3px solid var(--cyan); background: var(--cyan-dim); color: #1F2937;
          border-radius: 12px;
        }
        .pd-spark { margin-top: 12px; }
        .pd-fasepanel { display: flex; gap: 15px; align-items: flex-start; }
        .pd-fase-num {
          font-family: var(--f-mono); font-size: 32px; font-weight: 600; line-height: 1;
          flex: none; opacity: 0.9;
        }
        .pd-fase-nome { font-family: var(--f-display); font-weight: 600; font-size: 15px; color: var(--text-hi); letter-spacing: 0.02em; }
        .pd-fase-desc { font-size: 14px; color: var(--text-low); line-height: 1.5; margin-top: 4px; }
        .pd-quote { font-size: 14px; line-height: 1.75; color: var(--text); border-left: 3px solid var(--accent); padding: 2px 0 2px 15px; max-width: 860px; }
        .pd-quote strong { color: var(--cyan); font-weight: 600; }
        .pd-pillars {
          font-family: var(--f-mono); font-size: 14px; letter-spacing: 0.06em;
          text-transform: uppercase; color: var(--text-low); text-align: center;
          margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--line-soft);
        }
        .pd-pillars b { color: var(--text); font-weight: 500; }
      </style>
        <div class="view-kicker">MÓDULO 05 · MONITOR PREDITIVO</div>
        <div class="view-title">Detectando Ondas Antes Que Virem Tsunamis</div>
        <div class="view-sub">Machine Learning transforma sinais comportamentais históricos e em tempo real em projeções eleitorais. O sistema alerta no ponto de intervenção estratégica — antes das pesquisas tradicionais.</div>
      </div>

      <section class="panel alert reveal" style="margin-bottom:16px">
        <div class="panel-head">
          <div class="panel-title">Onda em fase 2 — Pedágio nas rodovias</div>
          <div class="panel-meta">MODELO PREDITIVO · PRECISÃO ${F.pct(D.kpis.precisaoModelo)} · BACKTESTING 2024 · JANELA ${dias.length} DIAS</div>
        </div>
        <div class="pd-status">
          <span class="tag orange">FASE 2 · PONTO DE INTERVENÇÃO</span>
          <span class="tag warn">▲ ${F.delta(o0.cresc, '%')} EM 72H</span>
          <span class="tag">◈ ${o0.regiao.toUpperCase()}</span>
          <span class="tag">JANELA ${o0.janela.toUpperCase()}</span>
          <span class="pd-acao-top">⚠ ${o0.acao}</span>
        </div>
        <div class="chart chart-lg pd-mainchart"></div>
      </section>

      <div class="grid cols-3 reveal" style="margin-bottom:16px">
        ${D.ondas.map(function (o, i) {
          var acc = FASE_ACC[o.fase];
          return `
          <div class="panel pd-card${o.fase === 2 ? ' alert' : ''}">
            <div class="pd-card-top">
              <div>
                <div class="pd-tema">${o.tema}</div>
                <div class="pd-regiao">◈ ${o.regiao.toUpperCase()}</div>
              </div>
              <span class="${FASE_TAG[o.fase]}">FASE ${o.fase}</span>
            </div>
            <div class="kpi-value pd-cresc" style="color:${acc}">+<span class="pd-cresc-num" data-n="${o.cresc}">0</span>%</div>
            <div class="kpi-label">crescimento de volume</div>
            <div class="pd-fact">
              <span class="pd-fact-k">Engajamento inicial</span>
              <span class="pd-fact-v">${F.pct(o.engajInicial)}</span>
            </div>
            <div class="pd-fact">
              <span class="pd-fact-k">Janela</span>
              <span class="pd-fact-v">${o.janela}</span>
            </div>
            <div class="pd-acaoline" style="border-left-color:${acc}">${o.acao}</div>
            <div class="chart-sm pd-spark" data-i="${i}"></div>
          </div>`;
        }).join('')}
      </div>

      <div class="grid cols-3 reveal" style="margin-bottom:16px">
        ${D.fases.map(function (f) {
          return `
          <div class="panel pd-fasepanel">
            <div class="pd-fase-num" style="color:${FASE_ACC[f.n]}">0${f.n}</div>
            <div>
              <div class="pd-fase-nome">${f.nome}</div>
              <div class="pd-fase-desc">${f.desc}</div>
            </div>
          </div>`;
        }).join('')}
      </div>

      <section class="panel reveal">
        <div class="panel-head">
          <div class="panel-title">Governança do modelo</div>
          <div class="panel-meta">LGPD · DADOS PÚBLICOS AGREGADOS · SEM IDENTIFICAÇÃO INDIVIDUAL</div>
        </div>
        <div class="pd-quote">“O objetivo do algoritmo não é prever o voto do indivíduo. O sistema modela padrões coletivos em escala populacional. <strong>O indivíduo é anônimo; a multidão é previsível.</strong>”</div>
        <div class="pd-pillars"><b>▲ Monitoramento de emergentes</b> &nbsp;·&nbsp; <b>⚠ Prevenção de crises</b> &nbsp;·&nbsp; <b>◎ Rastreio de crescimento fora do radar</b></div>
      </section>
    `;

    // ---------- gráfico principal: curva de adoção em 3 fases ----------
    SIE.chart(container.querySelector('.pd-mainchart'), {
      grid: { left: 8, right: 16, top: 48, bottom: 6, containLabel: true },
      tooltip: {
        trigger: 'axis',
        formatter: function (ps) {
          var p = ps[0], i = p.dataIndex;
          var fase = i <= f1End ? 'Fase 1 · Sinais espontâneos'
                   : i <= f2End ? 'Fase 2 · Ponto de intervenção'
                   : 'Fase 3 · Onda estabelecida';
          return '<b>' + p.axisValue + '</b> — ' + fase +
            '<br/>Volume relativo: <b>' + p.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '</b> / 100';
        }
      },
      xAxis: {
        type: 'category', data: dias, boundaryGap: false,
        axisLabel: { interval: 5 }
      },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [
        {
          name: 'Volume da pauta',
          type: 'line',
          data: o0.volume,
          symbol: 'none',
          smooth: 0.25,
          z: 5,
          lineStyle: { color: C.orange, width: 2.5 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(210,153,34,0.16)' },
              { offset: 1, color: 'rgba(210,153,34,0)' }
            ])
          },
          markArea: {
            silent: true,
            data: [
              [
                { xAxis: dias[0], itemStyle: { color: 'rgba(28,75,106,0.05)' },
                  label: { formatter: 'FASE 1 · SINAIS ESPONTÂNEOS', position: 'insideTop', distance: 10, color: '#1C4B6A', fontFamily: SIE.fonts.mono, fontSize: 11 } },
                { xAxis: dias[f1End] }
              ],
              [
                { xAxis: dias[f1End], itemStyle: { color: 'rgba(210,153,34,0.10)' },
                  label: { formatter: 'PONTO DE INTERVENÇÃO\n— A IA ALERTA AQUI', position: 'insideTop', distance: 10, color: '#9A6700', fontFamily: SIE.fonts.mono, fontSize: 12, fontWeight: 600, lineHeight: 17, align: 'center' } },
                { xAxis: dias[f2End] }
              ],
              [
                { xAxis: dias[f2End], itemStyle: { color: 'rgba(248,81,73,0.06)' },
                  label: { formatter: 'FASE 3 · ONDA ESTABELECIDA', position: 'insideTop', distance: 10, color: '#C62828', fontFamily: SIE.fonts.mono, fontSize: 11 } },
                { xAxis: dias[dias.length - 1] }
              ]
            ]
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#6B7280', type: 'dashed', width: 1.2 },
            label: { formatter: 'HOJE', position: 'insideEndBottom', distance: 6, color: '#6B7280', fontFamily: SIE.fonts.mono, fontSize: 11 },
            data: [{ xAxis: dias[dias.length - 1] }]
          }
        },
        {
          // ponto onde o alerta foi emitido — volume ainda baixo, fase 2 recém-iniciada
          name: 'Alerta emitido',
          type: 'effectScatter',
          coordinateSystem: 'cartesian2d',
          data: [[dias[f1End + 4], o0.volume[f1End + 4]]],
          symbolSize: 9,
          z: 6,
          itemStyle: { color: C.orangeHi },
          rippleEffect: { brushType: 'stroke', scale: 3.4, period: 3 },
          tooltip: { show: false }
        }
      ]
    }, 'preditivo');

    // ---------- sparklines dos cards de onda ----------
    container.querySelectorAll('.pd-spark').forEach(function (el) {
      var o = D.ondas[+el.dataset.i];
      var col = SPARK_COL[o.fase];
      SIE.chart(el, {
        grid: { left: 4, right: 4, top: 14, bottom: 6 },
        tooltip: {
          trigger: 'axis',
          confine: true,
          formatter: function (ps) {
            var p = ps[0];
            return p.axisValue + ' · volume <b>' + p.value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + '</b> / 100';
          }
        },
        xAxis: { type: 'category', data: dias, show: false, boundaryGap: false },
        yAxis: { type: 'value', show: false, min: 0, max: 100 },
        series: [{
          type: 'line',
          data: o.volume,
          symbol: 'none',
          smooth: 0.25,
          lineStyle: { color: col, width: 1.8 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: rgba(col, 0.14) },
              { offset: 1, color: rgba(col, 0) }
            ])
          }
        }]
      }, 'preditivo');
    });

    // ---------- contadores animados ----------
    container.querySelectorAll('.pd-cresc-num').forEach(function (el) {
      SIE.animateCount(el, +el.dataset.n, { dur: 1200 });
    });
  }
})();
