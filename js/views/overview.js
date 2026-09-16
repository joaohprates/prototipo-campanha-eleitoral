/* ============================================================
   SIE — VIEW: overview (Módulo 01 · Coleta Contínua)
   Centro de Comando — visão geral do war room.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('overview', { render: render });

  // hex -> rgba
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }

  function render(container) {
    var k = D.kpis;
    var meta = D.meta || { name: 'Paraná', regiao: 'Paraná' };
    var cobertura = Math.round(k.municipiosAtivos / k.municipios * 1000) / 10; // 93,0
    var maxProj = Math.max.apply(null, D.candidatos.map(function (c) { return c.proj; }));

    var espectroLabel = { esq: 'esquerda', centro: 'centro', dir: 'direita' };
    var espectroCor = { esq: C.esq, centro: C.centro, dir: C.dir };

    // ---------- HTML ----------
    container.innerHTML = `
      <div class="view-head reveal">
        <style>
          .ov-row{margin-bottom:16px}
          .ov-kpi .kpi-value{display:flex;align-items:baseline;gap:3px}
          .ov-frac{font-family:var(--f-mono);font-size:14px;font-weight:400;color:var(--text-low)}
          .ov-covbar{margin-top:10px}
          .ov-cand{padding:11px 0;border-bottom:1px solid var(--line-soft)}
          .ov-cand:last-of-type{border-bottom:none;padding-bottom:4px}
          .ov-cand-top{display:flex;align-items:center;gap:9px;margin-bottom:7px}
          .ov-sigla{font-family:var(--f-mono);font-size:14px;letter-spacing:.06em;width:40px;text-align:center;padding:2px 0;border:1px solid;border-radius:6px;flex:none}
          .ov-nome{font-size:14px;color:var(--text-hi);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
          .ov-proj{font-family:var(--f-mono);font-size:16px;font-weight:600;color:var(--text-hi);font-variant-numeric:tabular-nums}
          .ov-cand-foot{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
          .ov-cand-foot .kpi-delta{margin-top:0}
          .ov-esp{font-family:var(--f-mono);font-size:14px;letter-spacing:.06em;text-transform:uppercase}
          .ov-note{margin-top:12px;padding-top:10px;border-top:1px solid var(--line-soft);font-family:var(--f-mono);font-size:14px;letter-spacing:.02em;color:var(--text-low);line-height:1.6}
          .ov-feed-tag{font-size:14px;padding:1px 8px;margin-right:7px;vertical-align:0}
          .ov-onda{padding:11px 0;border-bottom:1px solid var(--line-soft)}
          .ov-onda:first-of-type{padding-top:3px}
          .ov-onda:last-of-type{border-bottom:none}
          .ov-onda-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:4px}
          .ov-onda-tema{font-size:14px;font-weight:600;color:var(--text-hi)}
          .ov-onda-meta{font-family:var(--f-mono);font-size:14px;color:var(--text-low);letter-spacing:.04em;margin-bottom:7px}
          .ov-spark{width:100%;height:36px}
          .ov-mod-link{margin-top:12px;padding-top:10px;border-top:1px solid var(--line-soft);font-family:var(--f-mono);font-size:14px;letter-spacing:.06em;color:var(--cyan);text-transform:uppercase}
        </style>
        <div class="view-kicker">MÓDULO 01 · COLETA CONTÍNUA</div>
        <div class="view-title">Centro de Comando</div>
        <div class="view-sub">Uma visão integrada: indicadores, séries históricas e contexto territorial de ${meta.name}.</div>
      </div>

      <div class="hero-calendar"><div><div class="eyebrow">${meta.name.toUpperCase()} / CICLO ELEITORAL 2026</div><h2>O contexto completo, em um só lugar.</h2><p>Primeiro turno em 4 de outubro · calendário oficial do TSE.</p><a href="#fontes">Consultar fontes e calendário ↗</a></div><div class="calendar-date"><strong>04</strong><span>OUTUBRO<br>2026</span></div></div>
      <!-- linha 1: KPIs -->
      <div class="grid cols-4 ov-row reveal">
        <div class="panel ov-kpi">
          <div class="kpi-value" data-kpi="sinais">0</div>
          <div class="kpi-label">Sinais públicos · 24h</div>
          <div class="kpi-delta ${k.sinaisDelta >= 0 ? 'up' : 'down'}">${k.sinaisDelta >= 0 ? '▲' : '▼'} ${F.delta(k.sinaisDelta, '%')} vs. dia anterior</div>
        </div>
        <div class="panel ov-kpi">
          <div class="kpi-value" data-kpi="grupos">0</div>
          <div class="kpi-label">Grupos comportamentais ativos</div>
          <div class="kpi-delta ${k.gruposDelta >= 0 ? 'up' : 'down'}">${k.gruposDelta >= 0 ? '▲' : '▼'} ${F.delta(k.gruposDelta, '%')} na semana</div>
        </div>
        <div class="panel ov-kpi">
          <div class="kpi-value"><span data-kpi="mun">0</span><span class="ov-frac">/${k.municipios} municípios</span></div>
          <div class="kpi-label">Cobertura territorial · PR</div>
          <div class="bar ov-covbar"><i style="width:${cobertura}%"></i></div>
          <div class="kpi-delta flat">${F.pct(cobertura, 1)} do estado na base analisada</div>
        </div>
        <div class="panel ov-kpi">
          <div class="kpi-value" data-kpi="precisao">0%</div>
          <div class="kpi-label">Precisão estimada</div>
          <div class="kpi-delta ${k.precisaoDelta >= 0 ? 'up' : 'down'}">${k.precisaoDelta >= 0 ? '▲' : '▼'} ${F.delta(k.precisaoDelta, 'pp')} na série</div>
        </div>
      </div>

      <!-- linha 2: projeção + intenção -->
      <div class="grid cols-3 ov-row reveal">
        <div class="panel span-2">
          <div class="panel-head">
            <div class="panel-title">Evolução do cenário</div>
            <div class="panel-meta">90 DIAS · BASE FIXA EM 10 JUL 2026</div>
          </div>
          <div class="chart chart-lg ov-chart-proj"></div>
        </div>
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Cenário eleitoral</div>
            <div class="panel-meta">10 JUL 2026</div>
          </div>
          ${D.candidatos.map(function (c) {
            var cls = c.delta > 0 ? 'up' : (c.delta < 0 ? 'down' : 'flat');
            var arrow = c.delta > 0 ? '▲' : (c.delta < 0 ? '▼' : '—');
            var esp = c.espectro
              ? '<span class="ov-esp" style="color:' + (c.espectro === 'esq' ? C.orangeHi : espectroCor[c.espectro]) + '">' + espectroLabel[c.espectro] + '</span>'
              : '<span class="ov-esp" style="color:var(--text-low)">sem alinhamento</span>';
            return `
            <div class="ov-cand">
              <div class="ov-cand-top">
                <span class="ov-sigla" style="color:${c.cor === C.orange ? C.orangeHi : c.cor};border-color:${rgba(c.cor, 0.45)};background:${rgba(c.cor, 0.08)}">${c.sigla}</span>
                <span class="ov-nome">${c.nome}</span>
                <span class="ov-proj">${F.pct(c.proj, 1)}</span>
              </div>
              <div class="bar"><i style="width:${(c.proj / maxProj * 100).toFixed(1)}%;background:linear-gradient(90deg, ${rgba(c.cor, 0.55)}, ${c.cor})"></i></div>
              <div class="ov-cand-foot">
                <span class="kpi-delta ${cls}">${arrow} ${F.delta(c.delta, 'pp')} · 7 dias</span>
                ${esp}
              </div>
            </div>`;
          }).join('')}
          <div class="ov-note">Leitura comparativa de cenário. Os valores não representam intenção de voto medida.</div>
        </div>
      </div>

      <!-- linha 3: share of voice + feed + ondas -->
      <div class="grid cols-3 reveal">
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Share de voz · plataforma</div>
            <div class="panel-meta">JANELA 7 DIAS</div>
          </div>
          <div class="chart ov-chart-plat"></div>
        </div>
        <div class="panel">
          <div class="panel-head">
            <div class="panel-title">Feed de sinais</div>
            <div class="panel-meta">EXEMPLOS SIMULADOS</div>
          </div>
          ${D.feed.map(function (f) {
            var tag = f.nivel === 'alerta' ? '<span class="tag orange ov-feed-tag">ALERTA</span>'
              : f.nivel === 'warn' ? '<span class="tag warn ov-feed-tag">ATENÇÃO</span>' : '';
            return `
            <div class="feed-item">
              <div class="feed-time">${f.t}</div>
              <div class="feed-body">${tag}${f.txt}</div>
            </div>`;
          }).join('')}
        </div>
        <div class="panel alert">
          <div class="panel-head">
            <div class="panel-title">Ondas no radar</div>
            <div class="panel-meta">${D.ondas.length} PAUTAS RASTREADAS</div>
          </div>
          ${D.ondas.map(function (o, ix) {
            var tagCls = o.fase === 2 ? 'tag orange' : (o.fase === 1 ? 'tag cyan' : 'tag');
            var crescCls = o.cresc >= 0 ? 'up' : 'down';
            return `
            <div class="ov-onda">
              <div class="ov-onda-top">
                <span class="ov-onda-tema">${o.tema}</span>
                <span class="${tagCls}">FASE ${o.fase}</span>
              </div>
              <div class="ov-onda-meta"><span class="kpi-delta ${crescCls}" style="margin-top:0">${o.cresc >= 0 ? '▲' : '▼'} ${F.delta(o.cresc, '%')}</span> · ${o.regiao}</div>
              <div class="ov-spark" data-spark="${ix}"></div>
            </div>`;
          }).join('')}
          <a class="ov-mod-link" style="display:block" href="#preditivo">Ver curvas de tendência →</a>
        </div>
      </div>
    `;

    // ---------- KPIs animados ----------
    SIE.animateCount(container.querySelector('[data-kpi="sinais"]'), k.sinais24h, { compact: true });
    SIE.animateCount(container.querySelector('[data-kpi="grupos"]'), k.gruposAtivos, { compact: true });
    SIE.animateCount(container.querySelector('[data-kpi="mun"]'), k.municipiosAtivos, { dur: 900 });
    SIE.animateCount(container.querySelector('[data-kpi="precisao"]'), k.precisaoModelo, { dec: 1, suffix: '%' });

    // ---------- gráfico: projeção 90 dias ----------
    var byId = {};
    D.candidatos.forEach(function (c) { byId[c.id] = c; });
    var evCor = { alerta: C.warn, positivo: C.pos, neutro: C.centro };
    // variantes escuras para TEXTO sobre branco (warn/pos puros não têm contraste em label pequeno)
    var evCorTxt = { alerta: '#806300', positivo: '#2E7D32', neutro: C.centro };

    function linha(id, width, comArea) {
      var c = byId[id];
      var s = {
        name: c.sigla + ' · ' + c.nome,
        type: 'line',
        data: D.projSeries[id],
        smooth: 0.35,
        showSymbol: false,
        lineStyle: { width: width, color: c.cor },
        itemStyle: { color: c.cor },
        emphasis: { focus: 'series' }
      };
      if (comArea) {
        s.areaStyle = {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: rgba(c.cor, 0.12) },
            { offset: 1, color: rgba(c.cor, 0) }
          ])
        };
        s.markLine = {
          symbol: ['none', 'none'],
          animation: false,
          data: D.projSeries.eventos.map(function (e) {
            var cor = evCor[e.tipo] || C.centro;
            return {
              xAxis: D.projSeries.dias[e.diaIdx],
              lineStyle: { color: cor, type: 'dashed', width: 1, opacity: 0.75 },
              label: {
                formatter: e.label, position: 'insideEndTop',
                color: evCorTxt[e.tipo] || C.centro, fontSize: 11, fontFamily: SIE.fonts.mono
              }
            };
          })
        };
      }
      return s;
    }

    SIE.chart(container.querySelector('.ov-chart-proj'), {
      legend: { top: 0, right: 0, itemGap: 20 },
      grid: { left: 6, right: 18, top: 36, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'axis',
        formatter: function (ps) {
          var out = '<div style="color:#626C70;margin-bottom:4px">' + ps[0].axisValue + ' · projeção</div>';
          ps.forEach(function (p) {
            out += p.marker + ' ' + p.seriesName.split(' · ')[0] + '  <b>' +
              p.value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%</b><br>';
          });
          return out;
        }
      },
      xAxis: { type: 'category', boundaryGap: false, data: D.projSeries.dias, axisLabel: { interval: 14 } },
      yAxis: { type: 'value', min: 12, max: 38, axisLabel: { formatter: '{value}%' } },
      series: [linha('hv', 2.5, true), linha('rb', 2, false), linha('mt', 1.5, false)]
    }, 'overview');

    // ---------- gráfico: share of voice ----------
    var plat = D.plataformas.slice().reverse(); // Instagram no topo
    SIE.chart(container.querySelector('.ov-chart-plat'), {
      grid: { left: 6, right: 92, top: 8, bottom: 4, containLabel: true },
      tooltip: {
        trigger: 'item',
        formatter: function (p) {
          var pl = plat[p.dataIndex];
          return '<b>' + pl.nome + '</b><br>share de voz  <b>' + pl.share + '%</b><br>engajamento  ' +
            pl.engaj.toLocaleString('pt-BR', { minimumFractionDigits: 1 }) + '%<br>crescimento 7d  ' + F.delta(pl.cresc, '%');
        }
      },
      xAxis: { type: 'value', max: 40, axisLabel: { formatter: '{value}%' } },
      yAxis: { type: 'category', data: plat.map(function (p) { return p.nome; }) },
      series: [{
        type: 'bar',
        data: plat.map(function (p) { return p.share; }),
        barWidth: 13,
        showBackground: true,
        backgroundStyle: { color: 'rgba(0,91,170,0.06)', borderRadius: [0, 2, 2, 0] },
        itemStyle: {
          borderRadius: [0, 2, 2, 0],
          color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
            { offset: 0, color: rgba(C.cyan, 0.35) },
            { offset: 1, color: C.cyan }
          ])
        },
        label: {
          show: true, position: 'right', distance: 8,
          formatter: function (p) {
            var pl = plat[p.dataIndex];
            var cls = pl.cresc >= 0 ? 'pos' : 'neg';
            return '{share|' + p.value + '%}  {' + cls + '|' + F.delta(pl.cresc, '%') + '}';
          },
          rich: {
            share: { color: '#17191C', fontFamily: SIE.fonts.mono, fontSize: 12, fontWeight: 600 },
            pos: { color: '#2E7D32', fontFamily: SIE.fonts.mono, fontSize: 12 },
            neg: { color: '#C62828', fontFamily: SIE.fonts.mono, fontSize: 12 }
          }
        }
      }]
    }, 'overview');

    // ---------- sparklines: ondas no radar ----------
    var faseCor = { 1: C.cyan, 2: C.orange, 3: C.centro };
    container.querySelectorAll('[data-spark]').forEach(function (el) {
      var o = D.ondas[+el.dataset.spark];
      var cor = faseCor[o.fase];
      SIE.chart(el, {
        grid: { left: 0, right: 0, top: 3, bottom: 3 },
        xAxis: { type: 'category', show: false, boundaryGap: false, data: D.ondaDias },
        yAxis: { type: 'value', show: false, min: 0 },
        series: [{
          type: 'line', data: o.volume, smooth: true, showSymbol: false, silent: true,
          lineStyle: { width: 1.5, color: cor },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: rgba(cor, 0.14) },
              { offset: 1, color: rgba(cor, 0) }
            ])
          }
        }]
      }, 'overview');
    });
  }
})();
