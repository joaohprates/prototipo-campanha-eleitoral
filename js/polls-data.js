/* Published poll catalogue. Editorial review: 2026-09-15.
   Values are transcribed as published, never normalized or averaged.
   A record is one poll; scenarios remain nested within that poll. */
window.SIE_POLLS = (function () {
  var offices = {all:'Todos os cargos',presidente:'Presidente',governador:'Governador',senador:'Senador',deputado_federal:'Deputado federal',deputado_estadual:'Deputado estadual'};
  var institutes = ['AtlasIntel','Datafolha','Real Time Big Data','Quaest'];
  function scenario(label, round, rows, note) {return {label:label,round:round,results:rows.map(function(r){return {name:r[0],value:r[1]};}),note:note || 'Percentuais publicados pela fonte. Totais podem variar por arredondamento; não foram normalizados.'};}
  var polls = [
    {id:'quaest-br-20260914',institute:'Quaest',office:'presidente',region:'Brasil',uf:'BR',published:'2026-09-14',start:'2026-09-10',end:'2026-09-13',sample:2004,margin:2,confidence:95,registration:'BR-03607/2026',method:null,sponsor:'Editora Globo e Globo Comunicação e Participações S.A.',sourceName:'Gazeta do Povo',source:'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/quaest-presidente-setembro-2026-3/',scenarios:[
      scenario('1º turno · estimulada','1',[['Lula',36],['Flávio Bolsonaro',31],['Augusto Cury',7],['Renan Santos',4],['Ronaldo Caiado',4],['Romeu Zema',1],['Clariana Barão',0],['Edmilson Costa',0],['Hertz Dias',0],['Rui Costa Pimenta',0],['Samara',0],['Wilson Grassi',0],['Branco/nulo/não vai votar',7],['Indecisos',10]]),
      scenario('2º turno · Lula × Flávio Bolsonaro','2',[['Flávio Bolsonaro',42],['Lula',40],['Branco/nulo/não vai votar',13],['Indecisos',5]])]},
    {id:'datafolha-br-20260911',institute:'Datafolha',office:'presidente',region:'Brasil',uf:'BR',published:'2026-09-11',start:'2026-09-08',end:'2026-09-10',sample:2002,margin:2,confidence:95,registration:'BR-01833/2026',method:null,sponsor:'Folha e TV Globo',sourceName:'Exame',source:'https://exame.com/brasil/pesquisa-datafolha-lula-tem-39-e-flavio-bolsonaro-35-no-1o-turno/',scenarios:[
      scenario('1º turno · estimulada · votos totais','1',[['Lula',39],['Flávio Bolsonaro',35],['Augusto Cury',6],['Ronaldo Caiado',4],['Renan Santos',3],['Romeu Zema',2],['Samara Martins',1],['Rui Costa Pimenta',1],['Clariana Barão',1],['Edmilson Costa',1],['Wilson Grassi',0],['Hertz Dias',0],['Branco/nulo/nenhum',6],['Indecisos',4]]),
      Object.assign(scenario('2º turno · Lula × Flávio Bolsonaro','2',[['Lula',46],['Flávio Bolsonaro',44],['Branco/nulo/nenhum',8],['Indecisos',1]]),{source:'https://exame.com/brasil/datafolha-lula-tem-46-e-flavio-bolsonaro-44-no-segundo-turno/'})]},
    {id:'rtbd-pr-20260911',institute:'Real Time Big Data',office:'governador',region:'Paraná',uf:'PR',published:'2026-09-11',start:'2026-09-04',end:'2026-09-08',sample:1600,margin:2,confidence:95,registration:'PR-08220/2026',method:null,sponsor:'Real Time Big Data',sourceName:'Gazeta do Povo',source:'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-eleitoral-2026/real-time-big-data-governador-parana-setembro-2026/',scenarios:[
      scenario('1º turno · estimulada','1',[['Sergio Moro',35],['Sandro Alex',25],['Requião Filho',21],['Luiz França',2],['Adriano Funileiro',0],['Alexandre Salomão',0],['Samuel de Mattos',0],['Tayná Miessa',0],['Nulo/branco',6],['Não sabe/não respondeu',10]]),
      scenario('2º turno · Moro × Sandro Alex','2',[['Sergio Moro',43],['Sandro Alex',36],['Nulo/branco',10],['Não sabe/não respondeu',11]])]},
    {id:'datafolha-mg-20260911',institute:'Datafolha',office:'senador',region:'Minas Gerais',uf:'MG',published:'2026-09-11',start:'2026-09-08',end:'2026-09-10',sample:1204,margin:3,confidence:95,registration:'MG-01611/2026',method:null,sponsor:'Globo e Folha de S.Paulo',sourceName:'Exame',source:'https://exame.com/brasil/datafolha-para-senador-em-minas-marilia-viana-aecio-savio-e-aro-empatam-tecnicamente/',scenarios:[
      scenario('Senado · estimulada · total para as duas vagas','unico',[['Marília Campos',12],['Carlos Viana',10],['Aécio Neves',10],['Domingos Sávio',8],['Marcelo Aro',6],['Áurea Carolina',3],['Ana Luiza do MLB',2],['Marco Antônio Superman',2],['Victória Mello Vic',2],['Arcanjo Pimenta',1],['Manoel Carvalho',1],['Juiz Ramon Moreira',1],['Carlin Moura',1],['Fidélis Alcântara',1],['Tião Pessoa',1],['Jordano Metalúrgico',0],['Indecisos',20],['Branco/nulo/nenhum',18]],'A fonte apresenta o total para as duas vagas. Não equivale a um cenário presidencial nem a uma disputa de segundo turno. Valores mantidos como publicados.')]},
    {id:'atlas-br-20260910',institute:'AtlasIntel',office:'presidente',region:'Brasil',uf:'BR',published:'2026-09-10',start:'2026-09-04',end:'2026-09-09',sample:5000,margin:1,confidence:null,registration:null,method:null,sponsor:null,sourceName:'AtlasIntel · publicação do instituto',source:'https://atlasintel.org/poll/brazil-national-2026-09-10',scenarios:[],announcedRounds:['1','2'],note:'Publicação e ficha resumida conferidas no site do instituto. Resultados e registro ainda não transcritos: consulte o relatório original. Não há percentuais estimados neste cartão.'}
  ];
  function normalize(s){return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();}
  function select(filters) {
    filters=filters || {};
    return polls.filter(function(p){
      return (!filters.office || filters.office==='all' || filters.office===p.office)
        && (!filters.institute || filters.institute==='all' || filters.institute===p.institute)
        && (!filters.uf || filters.uf==='all' || filters.uf===p.uf)
        && (!filters.round || filters.round==='all' || p.scenarios.some(function(s){return s.round===filters.round;}) || (p.announcedRounds || []).includes(filters.round))
        && normalize([p.institute,p.region,offices[p.office],p.registration,p.scenarios.map(function(s){return s.results.map(function(r){return r.name;}).join(' ');}).join(' ')].join(' ')).includes(normalize(filters.search).trim());
    }).sort(function(a,b){return filters.sort==='oldest' ? a.published.localeCompare(b.published) : b.published.localeCompare(a.published);});
  }
  return {reviewed:'2026-09-15',offices:offices,institutes:institutes,polls:polls,select:select};
})();
