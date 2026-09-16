/* Referências verificadas manualmente em 15/09/2026. Sem integração remota. */
(function () {
  var sourceUrl = 'https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-confira-as-principais-datas-do-calendario-eleitoral';
  var sources = [
    { kind:'oficial', label:'REFERÊNCIA OFICIAL', name:'Calendário eleitoral 2026', description:'1º turno em 4 de outubro. Eventual 2º turno em 25 de outubro. Datas consultadas no Tribunal Superior Eleitoral.', url:sourceUrl, link:'Consultar calendário no TSE', date:'15/09/2026' },
    { kind:'oficial', label:'REFERÊNCIA OFICIAL', name:'Central das Eleições 2026', description:'Página do TSE para consultar informações sobre as eleições. Referência externa; nenhum dado é importado automaticamente.', url:'https://www.tse.jus.br/eleicoes/eleicoes-2026', link:'Abrir central do TSE', date:'15/09/2026' },
    { kind:'demo', label:'BASE DEMONSTRATIVA', name:'Indicadores e análises', description:'Nomes fictícios e séries sintéticas com referência em 10/07/2026. Não são pesquisas, amostras representativas ou previsões validadas.', url:null, date:'10/07/2026' },
    { kind:'pending', label:'SEM CONEXÃO', name:'Plataformas e modelo', description:'Não há coleta de redes sociais, API, modelo de IA ou backtesting conectado. Percentuais e sinais exibidos ilustram a interface.', url:null, date:'Não se aplica' }
  ];
  SIE.registerView('fontes', { render:function (container) {
    container.innerHTML = `
      <div class="view-head"><div class="view-kicker">MÓDULO 07 · TRANSPARÊNCIA</div><h1 class="view-title">Fontes e metodologia</h1><p class="view-sub">Saiba de onde vem cada informação, quando foi revisada e quais são os limites desta demonstração.</p></div>
      <div class="hero-calendar"><div><div class="eyebrow">ELEIÇÕES GERAIS / 2026</div><h2>Informação com origem identificada.</h2><p>Referências oficiais e dados de exemplo, com status explícito.</p></div><div class="calendar-date"><strong>04</strong><span>OUTUBRO<br>PRIMEIRO TURNO</span></div></div>
      <div class="source-filter"><label for="source-kind">Exibir fontes</label><select id="source-kind"><option value="all">Todas as fontes</option><option value="oficial">Referências oficiais</option><option value="demo">Base demonstrativa</option><option value="pending">Sem conexão</option></select><span class="source-count" id="source-count" role="status"></span></div>
      <div class="grid cols-2" id="source-cards"></div>
      <div class="sources-actions"><button type="button" class="action-button primary" id="export-sources">↓ Exportar fontes (CSV)</button><button type="button" class="action-button" id="print-sources">Imprimir / salvar PDF</button></div><p class="export-status" id="export-status" role="status"></p>
      <div class="grid cols-2"><article class="panel"><div class="panel-head"><h2 class="panel-title">Calendário de referência</h2><span class="tag cyan">TSE · 2026</span></div><ul class="calendar-list"><li><time datetime="2026-10-04">04 OUT 2026</time><div><strong>Primeiro turno</strong><p>Eleições gerais.</p></div></li><li><time datetime="2026-10-25">25 OUT 2026</time><div><strong>Segundo turno</strong><p>Quando necessário, para presidente e governadores.</p></div></li></ul><p style="margin-top:16px;font-size:12px"><a href="${sourceUrl}" target="_blank" rel="noopener noreferrer">Ver publicação oficial ↗</a></p></article>
      <article class="panel"><div class="panel-head"><h2 class="panel-title">Como interpretar o protótipo</h2></div><ul class="method-list"><li>As métricas dos módulos 01 a 06 são exemplos fixos. Recarregar a página não atualiza a base.</li><li>O desenho geográfico vem do arquivo local do Paraná; os valores sobre o mapa são simulados.</li><li>Índices de afinidade, precisão e impacto não possuem validação estatística neste protótipo.</li><li>Não há cadastro de pessoas, autenticação, integração ou armazenamento de dados de eleitores.</li><li>A data de revisão das referências não altera a data das séries demonstrativas.</li></ul></article></div>`;
    function filtered() { var kind = container.querySelector('#source-kind').value; return sources.filter(function(s) {return kind === 'all' || s.kind === kind;}); }
    function paint() {
      var visible = filtered();
      container.querySelector('#source-count').textContent = visible.length + ' de ' + sources.length + ' fontes';
      container.querySelector('#source-cards').innerHTML = visible.map(function(s) {return '<article class="panel source-card"><span class="source-status ' + s.kind + '">' + s.label + '</span><h2>' + s.name + '</h2><p>' + s.description + '</p>' + (s.url ? '<a href="' + s.url + '" target="_blank" rel="noopener noreferrer">' + s.link + ' ↗</a>' : '<span class="panel-meta">Referência: ' + s.date + '</span>') + '</article>';}).join('');
    }
    container.querySelector('#source-kind').addEventListener('change', paint);
    container.querySelector('#export-sources').addEventListener('click', function () {
      var rows = [['Fonte','Status','Descrição','Referência / consulta','URL']].concat(filtered().map(function(s) {return [s.name,s.label,s.description,s.date,s.url || ''];}));
      var csv = '\uFEFF' + rows.map(function(row) { return row.map(function(v) {return '"' + String(v).replace(/"/g,'""') + '"';}).join(';');}).join('\r\n');
      var url = URL.createObjectURL(new Blob([csv], {type:'text/csv;charset=utf-8'}));
      var a = document.createElement('a'); a.href=url; a.download='sie-fontes-2026-09-15.csv'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){URL.revokeObjectURL(url);},1000);
      container.querySelector('#export-status').textContent = 'Arquivo preparado com ' + filtered().length + ' fontes do filtro atual.';
    });
    container.querySelector('#print-sources').addEventListener('click', function() { window.print(); });
    paint();
  }});
})();
