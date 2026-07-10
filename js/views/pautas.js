/* ============================================================
   SIE — view 'pautas' (MÓDULO 04 · INTERPRETAÇÃO)
   Radiografia de Pautas — rede de co-engajamento temático,
   ranking de tração, sentimento líquido e sparklines 30d.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('pautas', { render: render });

  /* ---------- helpers ---------- */
  function hexA(hex, a) {
    var r = parseInt(hex.slice(1, 3), 16),
        g = parseInt(hex.slice(3, 5), 16),
        b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
  }
  function sgn(v) { return (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v); }

  // últimos 30 dias (rótulos dd/mm, mesma âncora fixa do protótipo)
  var dias30 = (function () {
    var out = [], base = new Date(2026, 6, 10);
    for (var i = 29; i >= 0; i--) {
      var d = new Date(base.getTime() - i * 86400000);
      out.push((d.getDate() < 10 ? '0' : '') + d.getDate() + '/' +
               (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1));
    }
    return out;
  })();

  /* ---------- render ---------- */
  function render(container) {
    var pautaById = {};
    D.pautas.forEach(function (p) { pautaById[p.id] = p; });

    var byTracao = D.pautas.slice().sort(function (a, b) { return b.tracao - a.tracao; });
    var pedagio = pautaById.pedagio;
    var conexoesSeg = D.pautasLinks.filter(function (l) {
      return l[0] === 'seguranca' || l[1] === 'seguranca';
    }).length;
    var pedIni = D.pautasSeries.pedagio[0];
    var pedFim = D.pautasSeries.pedagio[D.pautasSeries.pedagio.length - 1];

    /* --- ranking de tração (HTML) --- */
    var rankRows = byTracao.map(function (p, i) {
      var hot = p.central || p.emergente;
      var tag = p.emergente
        ? '<span class="tag warn">EMERGENTE ' + sgn(p.cresc7d) + '%</span>'
        : '<span class="tag ' + (p.cresc7d > 0 ? 'pos' : 'neg') + '">' + F.delta(p.cresc7d, '%') + '</span>';
      return '<div class="pt-rank-row' + (hot ? ' hot' : '') + '">' +
          '<div class="pt-rank-line">' +
            '<span class="pt-rank-idx">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
            '<span class="pt-rank-name">' + p.nome + '</span>' +
            '<span class="pt-rank-val">' + p.tracao + '</span>' +
            tag +
          '</div>' +
          '<div class="bar"><i class="' + (hot ? 'orange' : '') + '" style="width:' + p.tracao + '%"></i></div>' +
        '</div>';
    }).join('');

    /* --- células das sparklines --- */
    // col = cor da linha; txt = variante escura p/ texto sobre branco
    var sparkDefs = [
      { id: 'seguranca',  col: C.orange,   txt: C.orangeHi },
      { id: 'pedagio',    col: C.orangeHi, txt: C.orangeHi },
      { id: 'educacao',   col: C.cyan,     txt: C.cyan },
      { id: 'mobilidade', col: C.accent,   txt: C.accentHover }
    ];
    var sparkCells = sparkDefs.map(function (s) {
      var p = pautaById[s.id];
      var vals = D.pautasSeries[s.id];
      var last = vals[vals.length - 1];
      var tag = p.emergente
        ? '<span class="tag warn">FASE 2 · ' + sgn(p.cresc7d) + '%</span>'
        : '<span class="tag ' + (p.cresc7d > 0 ? 'pos' : 'neg') + '">' + F.delta(p.cresc7d, '%') + '</span>';
      return '<div class="pt-spark">' +
          '<div class="pt-spark-head">' +
            '<span class="pt-spark-name">' + p.nome + '</span>' +
            '<span class="pt-spark-val" style="color:' + s.txt + '">' + last + '</span>' +
            tag +
          '</div>' +
          '<div class="pt-spark-chart" data-spark="' + s.id + '"></div>' +
        '</div>';
    }).join('');

    container.innerHTML = `
      <div class="view-head reveal">
        <style>
          .pt-top{display:grid;grid-template-columns:minmax(0,1fr) 332px;gap:16px;margin-bottom:16px}
          @media(max-width:1280px){.pt-top{grid-template-columns:1fr}}
          .pt-rank-row{padding:8px 0 9px;border-bottom:1px solid var(--line-soft)}
          .pt-rank-row:last-of-type{border-bottom:none}
          .pt-rank-line{display:flex;align-items:center;gap:8px;margin-bottom:6px}
          .pt-rank-idx{font-family:var(--f-mono);font-size:14px;color:var(--text-low);width:22px;flex:none}
          .pt-rank-name{font-family:var(--f-display);font-size:14px;font-weight:500;color:var(--text);flex:1;letter-spacing:.02em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .pt-rank-row.hot .pt-rank-name{color:var(--text-hi)}
          .pt-rank-val{font-family:var(--f-mono);font-size:14px;color:var(--cyan-hi);font-variant-numeric:tabular-nums}
          .pt-rank-row.hot .pt-rank-val{color:var(--orange-hi)}
          .pt-net-legend{display:flex;flex-wrap:wrap;gap:14px;margin-top:10px;font-family:var(--f-mono);font-size:14px;letter-spacing:.05em;color:var(--text-low);text-transform:uppercase}
          .pt-net-legend i{width:9px;height:9px;border-radius:50%;display:inline-block;margin-right:5px;vertical-align:-1px}
          .pt-net-hint{margin-left:auto;opacity:.8}
          .pt-sparks{display:grid;grid-template-columns:1fr 1fr;gap:14px 18px}
          .pt-spark-head{display:flex;align-items:center;gap:8px;margin-bottom:4px}
          .pt-spark-name{font-family:var(--f-display);font-size:14px;font-weight:500;color:var(--text-hi);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .pt-spark-val{font-family:var(--f-mono);font-size:14px;font-variant-numeric:tabular-nums}
          .pt-spark-chart{height:86px}
          .pt-note{margin-top:13px;padding:10px 14px;border:1px solid rgba(210,153,34,.25);border-left:2px solid var(--warn);background:rgba(210,153,34,.06);font-size:14px;line-height:1.5;color:var(--text);border-radius:12px}
          .pt-note b{color:var(--orange-hi);font-weight:600}
          .pt-note.cyan{border-color:rgba(28,75,106,.25);border-left-color:var(--cyan);background:rgba(28,75,106,.05)}
          .pt-note.cyan b{color:var(--cyan-hi)}
        </style>
        <div class="view-kicker">MÓDULO 04 · INTERPRETAÇÃO</div>
        <div class="view-title">Radiografia de Pautas</div>
        <div class="view-sub">Compreender a intenção de voto é apenas o resultado. Nossa IA identifica as causas estruturais mapeando os temas que mais geram engajamento genuíno na população.</div>
      </div>

      <div class="pt-top reveal">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Rede de co-engajamento temático</div>
            <div class="panel-meta">${D.kpis.municipios} MUNICÍPIOS · JANELA 90D</div>
          </div>
          <div class="chart chart-xl" data-el="net"></div>
          <div class="pt-net-legend">
            <span><i style="background:${C.orange}"></i>Pauta dominante</span>
            <span><i style="background:${C.warn};border:2px solid ${C.orangeHi}"></i>Onda emergente</span>
            <span><i style="background:${C.cyan}"></i>Pautas correlacionadas</span>
            <span class="pt-net-hint">ESPESSURA = CO-ENGAJAMENTO · ARRASTE PARA EXPLORAR</span>
          </div>
        </div>

        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Ranking de tração</div>
            <div class="panel-meta">${D.pautas.length} PAUTAS · ÍNDICE 0–100</div>
          </div>
          ${rankRows}
          <div class="pt-note cyan">
            <b>◈ LEITURA TÁTICA:</b> Segurança Pública é o eixo gravitacional do debate — ${conexoesSeg} conexões diretas de co-engajamento. Pedágio é a única pauta em aceleração anômala (${sgn(pedagio.cresc7d)}% em 7 dias).
          </div>
        </div>
      </div>

      <div class="grid cols-2 reveal">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Sentimento líquido por pauta</div>
            <div class="panel-meta">NLP PT-BR · ESCALA −100 A +100</div>
          </div>
          <div class="chart chart-lg" data-el="sent"></div>
        </div>

        <div class="panel alert">
          <div class="panel-head">
            <div class="panel-title">Tração 30 dias — pautas-chave</div>
            <div class="panel-meta">ÍNDICE DIÁRIO · ${dias30[0]} → ${dias30[29]}</div>
          </div>
          <div class="pt-sparks">${sparkCells}</div>
          <div class="pt-note">
            <b>▲ ONDA EMERGENTE:</b> "Pedágio" saiu de ${pedIni} para ${pedFim} pontos de tração em 30 dias — eixo ${D.ondas[0].regiao}. ${D.ondas[0].acao}.
          </div>
        </div>
      </div>
    `;

    /* ============ 1. rede de pautas (graph force) ============ */
    var others = D.pautas.filter(function (p) { return !p.central; });
    var nodes = D.pautas.map(function (p) {
      var node = {
        id: p.id, name: p.nome, value: p.tracao, pauta: p,
        symbolSize: 14 + p.tracao * 0.55,
        draggable: true
      };
      // posições iniciais: central no centro, demais em anel (layout estável)
      if (p.central) {
        node.x = 0; node.y = 0;
      } else {
        var k = others.indexOf(p), ang = (k / others.length) * Math.PI * 2 - Math.PI / 2;
        node.x = Math.cos(ang) * 240; node.y = Math.sin(ang) * 240;
      }
      if (p.central) {
        node.itemStyle = {
          color: C.orange, borderColor: C.orangeHi, borderWidth: 1.5
        };
        node.label = {
          position: 'bottom', distance: 8,
          formatter: '{t|' + p.nome + '}\n{s|' + p.nota.toLowerCase() + '}',
          rich: {
            t: { fontFamily: SIE.fonts.display, fontSize: 12, fontWeight: 700, color: C.textHi, align: 'center' },
            s: { fontFamily: SIE.fonts.mono, fontSize: 10, color: C.text, align: 'center', padding: [3, 0, 0, 0] }
          }
        };
      } else if (p.emergente) {
        node.itemStyle = {
          color: C.warn, borderColor: C.orangeHi, borderWidth: 2
        };
        node.label = {
          position: 'bottom', distance: 6,
          formatter: '{t|' + p.nome + '}\n{e|▲ EMERGENTE ' + sgn(p.cresc7d) + '%}',
          rich: {
            t: { fontFamily: SIE.fonts.display, fontSize: 12, fontWeight: 600, color: C.textHi, align: 'center' },
            e: { fontFamily: SIE.fonts.mono, fontSize: 10, color: C.orangeHi, align: 'center', padding: [3, 0, 0, 0] }
          }
        };
      } else {
        node.itemStyle = {
          color: C.cyan, opacity: 0.32 + (p.tracao / 100) * 0.62
        };
      }
      return node;
    });

    var links = D.pautasLinks.map(function (l) {
      var col = hexA(C.cyan, 0.26);
      if (l[0] === 'seguranca' || l[1] === 'seguranca') col = hexA(C.orange, 0.3);
      if (l[0] === 'pedagio' || l[1] === 'pedagio') col = hexA(C.warn, 0.4);
      return {
        source: l[0], target: l[1], value: l[2],
        lineStyle: { width: l[2] / 18, color: col, curveness: 0.12 }
      };
    });

    SIE.chart(container.querySelector('[data-el="net"]'), {
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          if (p.dataType === 'edge') {
            return '<b>' + pautaById[p.data.source].nome + ' ⇄ ' + pautaById[p.data.target].nome + '</b><br/>' +
              'Co-engajamento: ' + p.data.value + '/100';
          }
          var d = p.data.pauta;
          return '<b>' + d.nome + '</b><br/>' +
            'Tração: ' + d.tracao + '/100 &nbsp;·&nbsp; 7d: ' + sgn(d.cresc7d) + '%<br/>' +
            'Sentimento líquido: ' + sgn(d.sentimento) + '<br/>' +
            'Engajamento: ' + F.pct(d.engaj);
        }
      },
      series: [{
        type: 'graph', layout: 'force', roam: true,
        scaleLimit: { min: 0.55, max: 2.2 },
        force: { repulsion: 320, edgeLength: [70, 150], gravity: 0.12, friction: 0.15 },
        data: nodes, links: links,
        label: {
          show: true, position: 'bottom', distance: 5,
          fontFamily: SIE.fonts.display, fontSize: 11, color: C.textHi
        },
        lineStyle: { color: hexA(C.cyan, 0.26), curveness: 0.12 },
        emphasis: {
          focus: 'adjacency', scale: true,
          lineStyle: { width: 4 },
          label: { color: C.textHi }
        }
      }]
    }, 'pautas');

    /* ============ 2. sentimento líquido (barras divergentes) ============ */
    var porSentimento = D.pautas.slice().sort(function (a, b) { return a.sentimento - b.sentimento; });
    SIE.chart(container.querySelector('[data-el="sent"]'), {
      grid: { left: 6, right: 36, top: 10, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          var d = p.data.pauta, v = d.sentimento;
          var cls = v >= 20 ? 'favorável' : v >= 0 ? 'levemente positivo' : v > -50 ? 'negativo' : 'crítico';
          return '<b>' + d.nome + '</b><br/>' +
            'Sentimento líquido: ' + sgn(v) + ' (' + cls + ')<br/>' +
            'Tração: ' + d.tracao + '/100 &nbsp;·&nbsp; 7d: ' + sgn(d.cresc7d) + '%';
        }
      },
      xAxis: {
        type: 'value', min: -100, max: 100, splitNumber: 4,
        axisLabel: { formatter: function (v) { return sgn(v); } }
      },
      yAxis: {
        type: 'category', inverse: true,
        data: porSentimento.map(function (p) { return p.nome; }),
        axisLine: { show: false }, axisTick: { show: false },
        axisLabel: { color: C.text, fontSize: 11 }
      },
      series: [{
        type: 'bar', barWidth: 9,
        data: porSentimento.map(function (p) {
          var v = p.sentimento;
          var col = v >= 0 ? C.pos : (v <= -50 ? C.neg : C.orange);
          return {
            value: v, pauta: p,
            itemStyle: {
              color: hexA(col, 0.85),
              borderRadius: v >= 0 ? [0, 2, 2, 0] : [2, 0, 0, 2]
            },
            label: {
              show: true, position: v >= 0 ? 'right' : 'left',
              formatter: sgn(v),
              fontFamily: SIE.fonts.mono, fontSize: 11, color: C.text
            }
          };
        }),
        markLine: {
          symbol: 'none', silent: true,
          label: { show: false },
          lineStyle: { color: '#D1D5DB', type: 'solid', width: 1 },
          data: [{ xAxis: 0 }]
        }
      }]
    }, 'pautas');

    /* ============ 3. sparklines 30d ============ */
    sparkDefs.forEach(function (s) {
      var vals = D.pautasSeries[s.id];
      var last = vals[vals.length - 1];
      SIE.chart(container.querySelector('[data-spark="' + s.id + '"]'), {
        grid: { left: 3, right: 3, top: 8, bottom: 3 },
        tooltip: {
          trigger: 'axis', confine: true,
          axisPointer: { lineStyle: { color: hexA(s.col, 0.5) } },
          formatter: function (ps) {
            var p = ps[0];
            return p.axisValue + '<br/>Tração: <b>' + p.data + '</b>/100';
          }
        },
        xAxis: { type: 'category', data: dias30, show: false, boundaryGap: false },
        yAxis: {
          type: 'value', show: false,
          min: function (e) { return Math.max(0, Math.floor(e.min - (e.max - e.min) * 0.3)); },
          max: function (e) { return Math.ceil(e.max + (e.max - e.min) * 0.15); }
        },
        series: [
          {
            type: 'line', data: vals, smooth: 0.35, symbol: 'none',
            lineStyle: { width: 1.8, color: s.col },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: hexA(s.col, 0.14) },
                { offset: 1, color: hexA(s.col, 0) }
              ])
            }
          },
          {
            type: 'scatter', data: [[dias30.length - 1, last]], symbolSize: 6, z: 3,
            itemStyle: {
              color: s.col, borderColor: '#FFFFFF', borderWidth: 1.5
            },
            tooltip: { show: false }
          }
        ]
      }, 'pautas');
    });
  }
})();
