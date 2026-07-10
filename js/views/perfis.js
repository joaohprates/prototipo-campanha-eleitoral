/* ============================================================
   SIE — VIEW: perfis (MÓDULO 02 · PERFILAMENTO)
   Assinaturas Comportamentais — cards de perfil com gauge de
   espectro, radar comparado de afinidade temática e doutrina.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('perfis', { render: render });

  // acentos por assinatura (A=primary, B=warning, C=cinza — consistente com o radar)
  // c = cor da série (traços de gráfico) · t = variante escura p/ TEXTO sobre fundo claro
  // bd = borda tonal · dim = fundo tonal · area = areaStyle do radar
  var ACC = {
    A: { c: C.cyan,   t: C.cyan,     bd: 'rgba(28,75,106,0.25)',   dim: 'rgba(28,75,106,0.12)',   area: 'rgba(28,75,106,0.16)' },
    B: { c: C.orange, t: C.orangeHi, bd: 'rgba(210,153,34,0.25)',  dim: 'rgba(210,153,34,0.12)',  area: 'rgba(210,153,34,0.16)' },
    C: { c: C.centro, t: C.centro,   bd: 'rgba(107,114,128,0.25)', dim: 'rgba(107,114,128,0.12)', area: 'rgba(107,114,128,0.14)' }
  };

  function dominante(e) {
    var m = [
      // cor aqui é TEXTO sobre branco → warning usa a variante escura (#9A6700)
      ['ESQUERDA', e.esquerda, C.orangeHi],
      ['CENTRO', e.centro, C.centro],
      ['DIREITA', e.direita, C.dir]
    ];
    m.sort(function (a, b) { return b[1] - a[1]; });
    return m[0];
  }

  function picoAfinidade(p) {
    var best = null;
    Object.keys(p.radar).forEach(function (k) {
      if (!best || p.radar[k] > best[1]) best = [k, p.radar[k]];
    });
    return best;
  }

  function render(container) {
    var dims = Object.keys(D.perfis[0].radar);

    // divergência entre assinaturas por dimensão (leitura tática do radar)
    var spread = dims.map(function (d) {
      var vals = D.perfis.map(function (p) { return p.radar[d]; });
      return { dim: d, delta: Math.max.apply(null, vals) - Math.min.apply(null, vals) };
    }).sort(function (a, b) { return b.delta - a.delta; });
    var maxDiv = spread[0], minDiv = spread[spread.length - 1];

    var cardsHtml = D.perfis.map(function (p) {
      var acc = ACC[p.id];
      var dom = dominante(p.espectro);
      var up = p.tendencia >= 0;
      return `
        <article class="panel pf-card${p.id === 'B' ? ' alert' : ''}">
          <div class="pf-top">
            <div class="pf-id" style="color:${acc.t};border-color:${acc.bd};background:${acc.dim}">${p.id}</div>
            <div>
              <div class="pf-nome">${p.nome}</div>
              <div class="pf-resumo">${p.resumo}</div>
            </div>
          </div>

          <div class="pf-kpis">
            <div>
              <div class="kpi-value" id="pf-t-${p.id}">0</div>
              <div class="kpi-label">Tamanho est.</div>
            </div>
            <div>
              <div class="kpi-value" id="pf-e-${p.id}">0</div>
              <div class="kpi-label">Engajamento</div>
            </div>
            <div>
              <div class="kpi-value" id="pf-c-${p.id}">0</div>
              <div class="kpi-label">Coesão</div>
            </div>
          </div>

          <div class="pf-gauge-wrap">
            <div class="pf-gauge" id="pf-gauge-${p.id}"></div>
            <div class="pf-gauge-core">
              <b style="color:${dom[2]}">${F.pct(dom[1], 0)}</b>
              <span style="color:${dom[2]}">${dom[0]}</span>
            </div>
          </div>
          <div class="pf-spectro">
            <span><i style="background:var(--esq)"></i>Esquerda <b>${F.pct(p.espectro.esquerda, 0)}</b></span>
            <span><i style="background:var(--centro)"></i>Centro <b>${F.pct(p.espectro.centro, 0)}</b></span>
            <span><i style="background:var(--dir)"></i>Direita <b>${F.pct(p.espectro.direita, 0)}</b></span>
          </div>

          <div class="pf-sec">Temas dominantes</div>
          <div class="pf-tags">
            ${p.temas.map(function (t, i) {
              var cls = i === 0 ? (p.id === 'A' ? ' cyan' : p.id === 'B' ? ' orange' : '') : '';
              return '<span class="tag' + cls + '">' + t + '</span>';
            }).join('')}
          </div>

          <div class="pf-sec">Concentração territorial</div>
          <div class="pf-regioes">◈ ${p.regioes.join(' · ')}</div>

          <div class="pf-foot">
            <span class="kpi-delta ${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${F.delta(p.tendencia)} pp · 30 dias</span>
            <span class="pf-code">SIE·ASSIN-${p.id}</span>
          </div>
        </article>`;
    }).join('');

    container.innerHTML = `
      <div class="view-head reveal">
        <style>
          .pf-top { display: flex; gap: 14px; align-items: flex-start; margin-bottom: 13px; }
          .pf-id {
            font-family: var(--f-display); font-weight: 700; font-size: 32px; line-height: 1;
            width: 52px; height: 52px; flex: none; display: flex; align-items: center; justify-content: center;
            border: 1px solid; border-radius: 12px;
          }
          .pf-nome { font-family: var(--f-display); font-size: 15.5px; font-weight: 600; color: var(--text-hi); letter-spacing: 0.02em; }
          .pf-resumo { font-size: 14px; color: var(--text-low); line-height: 1.45; margin-top: 3px; }
          .pf-kpis {
            display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
            padding: 10px 0 9px; border-top: 1px solid var(--line-soft); border-bottom: 1px solid var(--line-soft);
          }
          .pf-kpis .kpi-value { font-size: 19px; }
          .pf-kpis .kpi-label { margin-top: 2px; }
          .pf-gauge-wrap { position: relative; margin-top: 4px; }
          .pf-gauge { width: 100%; height: 128px; }
          .pf-gauge-core { position: absolute; left: 0; right: 0; bottom: 8px; text-align: center; pointer-events: none; }
          .pf-gauge-core b { display: block; font-family: var(--f-display); font-size: 23px; font-weight: 700; line-height: 1; }
          .pf-gauge-core span { font-family: var(--f-mono); font-size: 14px; letter-spacing: 0.06em; opacity: 0.85; }
          .pf-spectro {
            display: flex; justify-content: space-between; gap: 8px;
            font-family: var(--f-mono); font-size: 14px; color: var(--text-low); margin-top: 4px; letter-spacing: 0.04em;
          }
          .pf-spectro b { color: var(--text-hi); font-weight: 600; }
          .pf-spectro i { width: 8px; height: 8px; border-radius: 2px; display: inline-block; margin-right: 5px; vertical-align: -1px; }
          .pf-sec {
            font-family: var(--f-mono); font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase;
            color: var(--text-low); margin: 13px 0 7px;
          }
          .pf-tags { display: flex; flex-wrap: wrap; gap: 6px; }
          .pf-regioes { font-family: var(--f-mono); font-size: 14px; color: var(--text); letter-spacing: 0.03em; }
          .pf-foot {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 14px; padding-top: 10px; border-top: 1px solid var(--line-soft);
          }
          .pf-foot .kpi-delta { margin-top: 0; }
          .pf-code { font-family: var(--f-mono); font-size: 14px; color: var(--text-low); letter-spacing: 0.06em; }
          .pf-radar-body { display: grid; grid-template-columns: 1.55fr 1fr; gap: 22px; align-items: stretch; }
          .pf-radar-chart { width: 100%; height: 420px; }
          .pf-insights { border-left: 1px solid var(--line-soft); padding-left: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; }
          .pf-ins-head {
            display: flex; justify-content: space-between; font-family: var(--f-mono);
            font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 5px;
          }
          .pf-ins-head .rt { color: var(--text-low); }
          .pf-ins-line { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
          .pf-ins-line b { font-family: var(--f-display); font-size: 15px; font-weight: 600; color: var(--text-hi); letter-spacing: 0.02em; }
          .pf-ins-line .num { font-family: var(--f-mono); font-size: 14px; color: var(--text); font-variant-numeric: tabular-nums; }
          .pf-ins-flag { font-size: 14px; color: var(--text); line-height: 1.5; display: flex; gap: 9px; align-items: flex-start; }
          .pf-ins-flag .tag { flex: none; margin-top: 1px; }
          .pf-ins-flag b { color: var(--text-hi); font-weight: 600; }
          .pf-ins-sep { height: 1px; background: var(--line-soft); margin: 2px 0; }
          .pf-doctrine { display: flex; align-items: center; justify-content: space-between; gap: 26px; flex-wrap: wrap; }
          .pf-doct-kicker {
            font-family: var(--f-mono); font-size: 14px; letter-spacing: 0.06em; text-transform: uppercase;
            color: var(--orange-hi); margin-bottom: 6px; display: flex; align-items: center; gap: 8px;
          }
          .pf-doct-kicker::before { content: ''; width: 18px; height: 1px; background: var(--orange); }
          .pf-doct-text { font-size: 14px; color: var(--text); line-height: 1.55; max-width: 640px; }
          .pf-doct-text strong { color: var(--text-hi); }
          .pf-doctrine .spectrum-legend { flex: none; }
          @media (max-width: 1280px) {
            .pf-radar-body { grid-template-columns: 1fr; }
            .pf-insights { border-left: none; padding-left: 0; border-top: 1px solid var(--line-soft); padding-top: 16px; }
          }
        </style>
        <div class="view-kicker">MÓDULO 02 · PERFILAMENTO</div>
        <div class="view-title">Assinaturas Comportamentais</div>
        <div class="view-sub">Índices de afinidade absolutos baseados no consumo real de conteúdo, não em respostas de questionários. O fim do achismo.</div>
      </div>

      <div class="grid cols-3 reveal">
        ${cardsHtml}
      </div>

      <div class="panel reveal" style="margin-top:16px">
        <div class="panel-head">
          <div class="panel-title">Afinidade temática comparada</div>
          <div class="panel-meta">ÍNDICE 0–100 · CONSUMO OBSERVADO · JANELA 30D</div>
        </div>
        <div class="pf-radar-body">
          <div class="pf-radar-chart" id="pf-radar"></div>
          <div class="pf-insights">
            <div class="pf-sec" style="margin:0">Leitura tática</div>
            ${D.perfis.map(function (p) {
              var pico = picoAfinidade(p);
              var acc = ACC[p.id];
              return `
              <div>
                <div class="pf-ins-head">
                  <span style="color:${acc.t}">Assinatura ${p.id}</span>
                  <span class="rt">Pico de afinidade</span>
                </div>
                <div class="pf-ins-line"><b>${pico[0]}</b><span class="num">${F.int(pico[1])} / 100</span></div>
                <div class="bar"><i style="width:${pico[1]}%;background:linear-gradient(90deg,${acc.c},${acc.c})"></i></div>
              </div>`;
            }).join('')}
            <div class="pf-ins-sep"></div>
            <div class="pf-ins-flag">
              <span class="tag orange">Δ ${F.int(maxDiv.delta)} pts</span>
              <span><b>${maxDiv.dim}</b> é o eixo de maior divergência entre as três assinaturas — máximo poder de segmentação de mensagem.</span>
            </div>
            <div class="pf-ins-flag">
              <span class="tag cyan">Δ ${F.int(minDiv.delta)} pts</span>
              <span><b>${minDiv.dim}</b> é o território de consenso — uma única narrativa atende os três perfis.</span>
            </div>
          </div>
        </div>
      </div>

      <div class="panel alert reveal pf-doctrine" style="margin-top:16px">
        <div>
          <div class="pf-doct-kicker">Princípio operacional</div>
          <div class="pf-doct-text">Trata-se de <strong>comportamento observado</strong>, não de opinião declarada. O sistema lê as <strong>entrelinhas do consumo digital</strong>.</div>
        </div>
        <div class="spectrum-legend">
          <span class="sw-esq"><i></i>Esquerda</span>
          <span class="sw-centro"><i></i>Centro</span>
          <span class="sw-dir"><i></i>Direita</span>
        </div>
      </div>
    `;

    // ---------- KPIs animados ----------
    D.perfis.forEach(function (p) {
      SIE.animateCount(container.querySelector('#pf-t-' + p.id), p.tamanho, { compact: true });
      SIE.animateCount(container.querySelector('#pf-e-' + p.id), p.engajamento, { dec: 1, suffix: '%' });
      SIE.animateCount(container.querySelector('#pf-c-' + p.id), p.coesao, { suffix: '%' });
    });

    // ---------- gauges de espectro (meia-lua) ----------
    D.perfis.forEach(function (p) {
      var e = p.espectro;
      var total = e.esquerda + e.centro + e.direita;
      SIE.chart(container.querySelector('#pf-gauge-' + p.id), {
        tooltip: {
          trigger: 'item',
          confine: true,
          formatter: function (pr) {
            return pr.marker + ' ' + pr.name + ' — <b>' + F.pct(pr.value, 0) + '</b> dos sinais da assinatura ' + p.id;
          }
        },
        series: [{
          type: 'pie',
          startAngle: 180,
          clockwise: true,
          center: ['50%', '86%'],
          radius: ['116%', '158%'],
          label: { show: false },
          labelLine: { show: false },
          emphasis: { scale: true, scaleSize: 3 },
          data: [
            { value: e.esquerda, name: 'Esquerda', itemStyle: { color: C.esq, borderColor: C.bg1, borderWidth: 2, borderRadius: 3 } },
            { value: e.centro, name: 'Centro', itemStyle: { color: C.centro, borderColor: C.bg1, borderWidth: 2, borderRadius: 3 } },
            { value: e.direita, name: 'Direita', itemStyle: { color: C.dir, borderColor: C.bg1, borderWidth: 2, borderRadius: 3 } },
            // metade inferior — trilha clara (fecha o semicírculo)
            { value: total, name: '', itemStyle: { color: '#F0F4F8', borderWidth: 0 }, tooltip: { show: false }, emphasis: { disabled: true } }
          ]
        }]
      }, 'perfis');
    });

    // ---------- radar comparado ----------
    var dimsR = dims;
    SIE.chart(container.querySelector('#pf-radar'), {
      tooltip: {
        trigger: 'item',
        confine: true,
        formatter: function (pr) {
          var rows = dimsR.map(function (d, i) {
            return d + ' <b style="color:#1F2937;float:right;margin-left:14px">' + F.int(pr.value[i]) + '</b>';
          }).join('<br>');
          return '<b style="color:' + pr.color + '">' + pr.name + '</b><br>' + rows;
        }
      },
      legend: {
        top: 4, right: 4, orient: 'vertical', itemGap: 8,
        data: D.perfis.map(function (p) { return p.id + ' · ' + p.nome; })
      },
      radar: {
        indicator: dimsR.map(function (d) { return { name: d, max: 100 }; }),
        center: ['50%', '54%'],
        radius: '68%',
        splitNumber: 4,
        axisName: { color: C.textLow, fontFamily: SIE.fonts.mono, fontSize: 12 },
        axisLine: { lineStyle: { color: C.line } },
        splitLine: { lineStyle: { color: C.line } },
        splitArea: { areaStyle: { color: ['rgba(28,75,106,0)', 'rgba(28,75,106,0.02)'] } }
      },
      series: [{
        type: 'radar',
        symbol: 'circle',
        symbolSize: 3.5,
        data: D.perfis.map(function (p) {
          var acc = ACC[p.id];
          return {
            name: p.id + ' · ' + p.nome,
            value: dimsR.map(function (d) { return p.radar[d]; }),
            lineStyle: { color: acc.c, width: 2 },
            itemStyle: { color: acc.c },
            areaStyle: { color: acc.area }
          };
        })
      }]
    }, 'perfis');
  }
})();
