(function () {
  var D=window.SIE_POLLS;
  function esc(value){return String(value==null?'':value).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function date(value){return value?value.split('-').reverse().join('/'):'Não informado na fonte consultada';}
  function number(value,suffix){return value==null?'Não informado na fonte consultada':value.toLocaleString('pt-BR')+(suffix||'');}
  SIE.registerView('pesquisas',{render:function(container){
    var filters={office:'all',institute:'all',uf:'all',round:'all',search:'',sort:'newest'};
    container.innerHTML=`
      <div class="view-head"><div class="view-kicker">MÓDULO 08 · PESQUISAS PUBLICADAS</div><h1 class="view-title">Central de Pesquisas</h1><p class="view-sub">Consulte cada levantamento por instituto, cargo e abrangência. Resultados publicados, cenários separados e fontes para conferência.</p></div>
      <div class="poll-summary"><div><span class="tag pos">CURADORIA DE FONTES</span><h2>As pesquisas, uma a uma.</h2><p>Catálogo revisado em <strong>${date(D.reviewed)}</strong>. Atualização editorial, sem sincronização automática com os institutos. Este recorte não é um catálogo exaustivo.</p></div><div class="poll-summary-count"><strong>${D.polls.length}</strong><span>levantamentos<br>${D.institutes.length} institutos</span></div></div>
      <div class="poll-tabs" role="group" aria-label="Filtrar pesquisas por cargo">${Object.keys(D.offices).map(function(key){return '<button type="button" data-office="'+key+'" aria-pressed="'+(key==='all')+'">'+D.offices[key]+'</button>';}).join('')}</div>
      <form class="poll-filters" aria-label="Filtros de pesquisas">
        <label>Instituto<select name="institute"><option value="all">Todos os institutos</option>${D.institutes.map(function(i){return '<option>'+i+'</option>';}).join('')}</select></label>
        <label>Abrangência<select name="uf"><option value="all">Todas as abrangências</option><option value="BR">Brasil · nacional</option><option value="PR">Paraná</option><option value="MG">Minas Gerais</option></select></label>
        <label>Turno<select name="round"><option value="all">Todos os turnos</option><option value="1">1º turno</option><option value="2">2º turno</option><option value="unico">Turno único · Senado</option></select></label>
        <label>Ordenação<select name="sort"><option value="newest">Mais recentes primeiro</option><option value="oldest">Mais antigas primeiro</option></select></label>
        <label class="poll-search">Buscar<input name="search" type="search" placeholder="Candidato, instituto ou registro" autocomplete="off"></label>
        <button class="action-button" type="reset">Limpar filtros</button>
      </form>
      <div class="poll-results-head"><p id="poll-count" role="status" aria-live="polite"></p><span>Ordenado pela data de publicação</span></div>
      <div class="poll-list" id="poll-list"></div>
      <aside class="poll-reading panel"><h2 class="panel-title">Como ler os resultados</h2><p>Compare apenas cenários de mesmo cargo, abrangência, turno e tipo de pergunta. A margem de erro faz parte da leitura; este módulo não calcula médias, tendências nem probabilidade de vitória.</p><p>As fontes estão identificadas em cada ficha. “Não cadastrado” significa ausência neste catálogo, não ausência de pesquisas publicadas.</p></aside>`;
    var list=container.querySelector('#poll-list');
    function rows(results){return results.map(function(r){return '<div class="poll-result"><div><span>'+esc(r.name)+'</span><strong>'+number(r.value,'%')+'</strong></div><div class="poll-bar" aria-hidden="true"><i style="width:'+r.value+'%"></i></div></div>';}).join('');}
    function panel(p,s,index){return '<section class="poll-scenario"><h3>'+esc(s.label)+'</h3><div class="poll-unit">Percentual informado pela fonte · escala de 0 a 100%</div>'+rows(s.results.slice(0,4))+(s.results.length>4?'<details class="poll-more"><summary>Ver todos os '+s.results.length+' resultados</summary>'+rows(s.results.slice(4))+'</details>':'')+'<p class="poll-small">'+esc(s.note)+'</p>'+(s.source?'<a class="poll-source" href="'+esc(s.source)+'" target="_blank" rel="noopener noreferrer">Fonte deste cenário ↗</a>':'')+'</section>';}
    function card(p){
      var scenarios=p.scenarios.filter(function(s){return filters.round==='all'||filters.round===s.round;});
      return '<article class="panel poll-card"><header class="poll-card-head"><div class="poll-institute"><span class="poll-monogram" aria-hidden="true">'+esc(p.institute==='Real Time Big Data'?'RT':p.institute.slice(0,2).toUpperCase())+'</span><div><h2>'+esc(p.institute)+'</h2><p>'+D.offices[p.office]+' · '+esc(p.region)+'</p></div></div><div class="poll-published"><span class="tag '+(p.scenarios.length?'cyan':'orange')+'">'+(p.scenarios.length?'Resultados publicados':'Ficha parcial')+'</span><time datetime="'+p.published+'">Publicado em '+date(p.published)+'</time></div></header>'+
      '<div class="poll-facts"><div><span>Campo</span><strong>'+date(p.start)+' a '+date(p.end)+'</strong></div><div><span>Amostra</span><strong>'+number(p.sample)+' entrevistas</strong></div><div><span>Margem de erro</span><strong>± '+number(p.margin,' p.p.')+'</strong></div><div><span>Registro informado pela fonte</span><strong>'+esc(p.registration || 'Não transcrito')+'</strong></div></div>'+
      (scenarios.length?'<div class="poll-scenarios">'+scenarios.map(function(s,i){return panel(p,s,i);}).join('')+'</div>':'<div class="poll-partial"><strong>Relatório disponível no instituto</strong><p>'+esc(p.note)+'</p></div>')+
      '<details class="poll-method"><summary>Ficha técnica e procedência</summary><dl><div><dt>Nível de confiança</dt><dd>'+number(p.confidence,'%')+'</dd></div><div><dt>Método de coleta</dt><dd>'+esc(p.method || 'Não transcrito da fonte consultada')+'</dd></div><div><dt>Contratante</dt><dd>'+esc(p.sponsor || 'Não informado na página consultada')+'</dd></div><div><dt>Revisão do catálogo</dt><dd>'+date(D.reviewed)+'</dd></div></dl><p class="poll-small">Registro reproduzido da fonte indicada, sem verificação independente no PesqEle. A seleção acima não inclui necessariamente todos os cenários da publicação.</p></details>'+
      '<footer class="poll-card-foot"><span>Fonte: '+esc(p.sourceName)+'</span><a class="action-button" href="'+esc(p.source)+'" target="_blank" rel="noopener noreferrer">Consultar publicação ↗</a></footer></article>';
    }
    function paint(){
      var result=D.select(filters);
      container.querySelector('#poll-count').textContent=result.length+' de '+D.polls.length+' pesquisas · '+D.offices[filters.office];
      list.innerHTML=result.length?result.map(card).join(''):'<div class="panel poll-empty"><span aria-hidden="true">◎</span><h2>Nenhuma pesquisa cadastrada neste recorte</h2><p>Não há levantamento no catálogo para a combinação selecionada. Tente outro cargo, instituto ou abrangência.</p><button type="button" class="action-button" id="poll-empty-reset">Limpar filtros</button></div>';
      container.querySelectorAll('[data-office]').forEach(function(button){button.setAttribute('aria-pressed',String(button.dataset.office===filters.office));});
      var reset=container.querySelector('#poll-empty-reset');if(reset)reset.addEventListener('click',clear);
    }
    function clear(){filters={office:'all',institute:'all',uf:'all',round:'all',search:'',sort:'newest'};container.querySelectorAll('select,input').forEach(function(el){el.value=filters[el.name];});paint();}
    container.querySelectorAll('[data-office]').forEach(function(button){button.addEventListener('click',function(){filters.office=button.dataset.office;paint();});});
    container.querySelector('form').addEventListener('submit',function(e){e.preventDefault();});
    container.querySelector('form').addEventListener('reset',function(e){e.preventDefault();clear();});
    container.querySelectorAll('select').forEach(function(el){el.addEventListener('change',function(){filters[el.name]=el.value;paint();});});
    container.querySelector('input').addEventListener('input',function(e){filters.search=e.target.value;paint();});
    paint();
  }});
})();
