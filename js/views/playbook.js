/* ============================================================
   SIE — View: Playbook Tático (MÓDULO 06 · AÇÃO)
   Seis frentes de recomendação estratégica geradas pelo modelo.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('playbook', { render: render });

  var PRIO = {
    critica: { label: 'CRÍTICA', cls: 'neg' },
    alta:    { label: 'ALTA',    cls: 'orange' },
    media:   { label: 'MÉDIA',   cls: '' }
  };

  function render(container) {
    var mods = D.playbook;

    // contagem por prioridade
    var total = 0, nCrit = 0, nAlta = 0, nMedia = 0;
    mods.forEach(function (m) {
      m.recs.forEach(function (r) {
        total++;
        if (r.prio === 'critica') nCrit++;
        else if (r.prio === 'alta') nAlta++;
        else nMedia++;
      });
    });
    var pCrit = (nCrit / total * 100), pAlta = (nAlta / total * 100), pMedia = (nMedia / total * 100);

    // -------- cartão de módulo --------
    function modCard(m, idx) {
      var recsHtml = m.recs.map(function (r) {
        var p = PRIO[r.prio] || PRIO.media;
        return '<div class="pb-rec">' +
          '<span class="tag ' + p.cls + ' pb-prio-tag">' + p.label + '</span>' +
          '<span class="pb-rec-txt">' + r.txt + '</span>' +
          '<span class="tag cyan pb-imp">' + r.impacto + '</span>' +
        '</div>';
      }).join('');

      var isAlert = m.id === 'crises';
      return '<div class="panel pb-mod' + (isAlert ? ' alert' : '') + '">' +
        '<div class="pb-mod-top">' +
          '<div class="pb-icon">' + m.icone + '</div>' +
          '<div class="pb-mod-id">' +
            '<div class="pb-name">' + m.nome + '</div>' +
            '<div class="pb-desc">' + m.desc + '</div>' +
          '</div>' +
          '<div class="panel-meta">06.' + (idx + 1) + ' · ' + m.recs.length + ' REC</div>' +
        '</div>' +
        '<div class="pb-recs">' + recsHtml + '</div>' +
      '</div>';
    }

    container.innerHTML = `
      <div class="view-head reveal">
      <style>
        /* escopo .pb- — Playbook Tático */
        .pb-mono-kpi { font-family: var(--f-mono); font-size: 23px; letter-spacing: 0.02em; color: var(--cyan-hi); }
        .pb-prio-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 11px; }
        .pb-prio-row { display: flex; align-items: center; justify-content: space-between; }
        .pb-prio-row .tag { font-size: 14px; padding: 2px 8px; }
        .pb-prio-n { font-family: var(--f-mono); font-size: 14px; color: var(--text-hi); font-variant-numeric: tabular-nums; }
        .pb-priobar { display: flex; height: 5px; border-radius: 2px; overflow: hidden; background: var(--bg-3); margin-bottom: 9px; }
        .pb-priobar i { display: block; height: 100%; }
        .pb-mod { transition: border-color 0.2s, transform 0.2s; }
        .pb-mod:hover { border-color: rgba(0, 91, 170, 0.25); transform: translateY(-2px); }
        .pb-mod.alert:hover { border-color: rgba(255, 203, 5, 0.35); }
        .pb-mod-top { display: flex; gap: 13px; align-items: flex-start; margin-bottom: 8px; }
        .pb-icon {
          flex: none; width: 46px; height: 46px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 24px; line-height: 1; color: var(--cyan);
          border: none; background: var(--cyan-dim);
        }
        .pb-mod-id { flex: 1; min-width: 0; }
        .pb-name { font-family: var(--f-display); font-weight: 600; font-size: 15px; color: var(--text-hi); letter-spacing: 0.02em; line-height: 1.25; }
        .pb-desc { font-size: 14px; color: var(--text-low); margin-top: 3px; line-height: 1.45; }
        .pb-recs { margin-top: 4px; }
        .pb-rec { display: flex; gap: 9px; align-items: flex-start; padding: 9px 0; border-top: 1px solid var(--line-soft); }
        .pb-prio-tag { flex: none; font-size: 14px; padding: 2px 8px; margin-top: 1px; letter-spacing: 0.04em; }
        .pb-rec-txt { flex: 1; font-size: 14px; line-height: 1.45; color: var(--text); min-width: 0; }
        .pb-imp { flex: none; font-size: 14px; padding: 2px 8px; margin-top: 1px; max-width: 150px; white-space: normal; text-align: right; line-height: 1.35; }
        .pb-foot { display: flex; align-items: center; justify-content: space-between; gap: 22px; flex-wrap: wrap; }
        .pb-cta {
          font-family: var(--f-body); font-size: 14px; font-weight: 500; letter-spacing: 0;
          color: #FFFFFF; background: var(--cyan); border: none;
          border-radius: 16px; min-height: 44px; padding: 0 22px; cursor: pointer;
          display: inline-flex; align-items: center; gap: 11px;
          transition: background 0.18s, box-shadow 0.18s;
        }
        .pb-cta:hover { background: var(--cyan-hi); box-shadow: 0 4px 12px rgba(28, 73, 108, 0.25); }
        .pb-cta .pb-arrow { color: inherit; font-size: 14px; }
        .pb-note {
          font-family: var(--f-mono); font-size: 14px; color: var(--text-low);
          letter-spacing: 0.02em; line-height: 1.65; max-width: 520px;
          display: flex; align-items: center; gap: 12px;
        }
        .pb-note .tag { flex: none; }
      </style>
        <div class="view-kicker">MÓDULO 06 · AÇÃO</div>
        <div class="view-title">Playbook Tático</div>
        <div class="view-sub">Transformando dados em votos: recomendações estratégicas diretas para o comando da campanha.</div>
      </div>

      <div class="grid cols-4 reveal" style="margin-bottom:16px">
        <div class="panel">
          <div class="kpi-value" id="pb-kpi-total">0</div>
          <div class="kpi-label">Recomendações ativas</div>
          <div class="kpi-delta up">▲ ${F.int(3)} novas nas últimas 24h</div>
        </div>
        <div class="panel">
          <div class="pb-prio-list">
            <div class="pb-prio-row"><span class="tag neg">CRÍTICA</span><span class="pb-prio-n">${F.int(nCrit)}</span></div>
            <div class="pb-prio-row"><span class="tag orange">ALTA</span><span class="pb-prio-n">${F.int(nAlta)}</span></div>
            <div class="pb-prio-row"><span class="tag">MÉDIA</span><span class="pb-prio-n">${F.int(nMedia)}</span></div>
          </div>
          <div class="pb-priobar">
            <i style="width:${pCrit}%;background:${C.neg}"></i>
            <i style="width:${pAlta}%;background:${C.orange}"></i>
            <i style="width:${pMedia}%;background:#C7CDD6"></i>
          </div>
          <div class="kpi-label">Distribuição por prioridade</div>
        </div>
        <div class="panel">
          <div class="kpi-value" style="color:var(--pos)">+3,1pp</div>
          <div class="kpi-label">Impacto agregado estimado</div>
          <div class="kpi-delta up">potencial · execução integral em 14 dias</div>
        </div>
        <div class="panel">
          <div class="kpi-value pb-mono-kpi">10 jul 2026</div>
          <div class="kpi-label">Referência do cenário</div>
          <div class="kpi-delta flat">base fixa · sem atualização automática</div>
        </div>
      </div>

      <div class="grid cols-3 reveal" style="margin-bottom:16px">
        ${mods.map(modCard).join('')}
      </div>

      <div class="panel pb-foot reveal">
        <a class="action-button" href="#fontes">Consultar fontes e limitações →</a>
        <div class="pb-note">
          <span class="tag">DEMO</span>
          <span>Sem modelo conectado ou validação dos impactos exibidos.</span>
        </div>
      </div>
    `;

    // KPI animado — total de recomendações
    SIE.animateCount(container.querySelector('#pb-kpi-total'), total, { dur: 900 });
  }
})();
