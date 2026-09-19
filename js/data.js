/* ============================================================
   SIE — dados simulados (protótipo)
   Todos os nomes de pessoas são fictícios. Valores gerados
   para demonstração do conceito do deck.
   ============================================================ */
window.SIE_DATA = (function () {

  // ---------- candidatos (fictícios) ----------
  var candidatos = [
    // cores = paleta categórica do espectro (AIME): dir=primary, esq=warning, centro=cinza
    { id: 'hv', nome: 'Helena Vasconcelos', sigla: 'HV', cor: '#005BAA', proj: 35.2, delta: 0.6, espectro: 'dir' },
    { id: 'rb', nome: 'Ricardo Bittencourt', sigla: 'RB', cor: '#FFCB05', proj: 30.5, delta: -0.4, espectro: 'esq' },
    { id: 'mt', nome: 'Marcos Tavares', sigla: 'MT', cor: '#626C70', proj: 17.5, delta: 0.3, espectro: 'centro' },
    { id: 'ind', nome: 'Indecisos / Outros', sigla: '—', cor: '#C7CDD6', proj: 16.8, delta: -0.5, espectro: null }
  ];

  // ---------- série de projeção (90 dias) ----------
  // gerada deterministicamente: random(i) pseudo-aleatório com seed fixa
  function prand(seed) {
    var x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
  var dias = [];
  var hoje = new Date(2026, 6, 10); // 10 jul 2026 (fixo p/ protótipo)
  for (var i = 89; i >= 0; i--) {
    var d = new Date(hoje.getTime() - i * 86400000);
    dias.push((d.getDate() < 10 ? '0' : '') + d.getDate() + '/' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1));
  }
  function serie(base, drift, vol, seed) {
    var out = [], v = base;
    for (var i = 0; i < 90; i++) {
      v += drift + (prand(seed + i) - 0.5) * vol;
      out.push(Math.round(v * 10) / 10);
    }
    return out;
  }
  var projSeries = {
    dias: dias,
    hv: serie(30.2, 0.055, 0.75, 11),
    rb: serie(32.9, -0.017, 0.8, 23),
    mt: serie(16.2, 0.016, 0.6, 37),
    eventos: [
      { diaIdx: 18, label: 'Debate regional', tipo: 'neutro' },
      { diaIdx: 44, label: 'Crise: pedágio', tipo: 'alerta' },
      { diaIdx: 71, label: 'Agenda: segurança', tipo: 'positivo' }
    ]
  };
  // converge o fim de cada série à projeção atual (coerência com o card "hoje")
  ['hv', 'rb', 'mt'].forEach(function (id, k) {
    var alvo = candidatos[k].proj;
    var s = projSeries[id];
    var off = alvo - s[s.length - 1];
    for (var m = 0; m < s.length; m++) s[m] = Math.round((s[m] + off * m / (s.length - 1)) * 10) / 10;
  });

  // ---------- KPIs gerais ----------
  var kpis = {
    sinais24h: 9100000,          // sinais públicos coletados nas últimas 24h
    sinaisDelta: Math.round((9100000 / 8412930 - 1) * 1000) / 10,          // %
    gruposAtivos: 1334494,       // agrupamentos comportamentais anônimos ativos
    gruposDelta: Math.round((1334494 / 1284402 - 1) * 1000) / 10,
    municipios: 399,             // cobertura territorial PR
    municipiosAtivos: 378,
    precisaoModelo: 94.8,        // % backtesting
    precisaoDelta: +0.6,
    ondasEmergentes: 2,          // pautas em fase 1-2
    alertasCrise: 2
  };

  // ---------- share of voice por plataforma ----------
  var plataformas = [
    { nome: 'Instagram', share: 35, engaj: 8.5, cresc: 6.5 },
    { nome: 'TikTok', share: 29, engaj: 12, cresc: 18.8 },
    { nome: 'YouTube', share: 15, engaj: 6.2, cresc: 2.6 },
    { nome: 'X', share: 12, engaj: 4.4, cresc: -3.1 },
    { nome: 'Facebook', share: 9, engaj: 3.6, cresc: -7.4 }
  ];

  // ---------- feed de sinais (visão geral + ticker) ----------
  var feed = [
    { t: '15:07', txt: '<strong>Onda emergente</strong> — "pedágio" cresce 358% em 72h no eixo Cascavel–Foz', nivel: 'alerta' },
    { t: '14:53', txt: 'Assinatura <strong>Perfil B</strong> amplia engajamento em pauta <strong>Educação</strong> (+24% em Londrina)', nivel: 'info' },
    { t: '14:32', txt: '<strong>RMC</strong>: tração de Segurança Pública mantém 1º lugar pelo 10º dia consecutivo', nivel: 'info' },
    { t: '14:16', txt: 'Vídeo de <strong>RB</strong> sobre tarifa zero atinge 1,3M visualizações em 6h — pico fora do padrão', nivel: 'alerta' },
    { t: '13:55', txt: 'Cluster <strong>Agro Noroeste</strong> reduz volume −7% na semana; atenção à janela de reengajamento', nivel: 'warn' },
    { t: '13:30', txt: '<strong>HV</strong> ganha tração orgânica em Maringá após agenda de mobilidade urbana', nivel: 'info' },
    { t: '13:09', txt: 'Narrativa adversária sobre saúde regional perde força −28% após pico de sexta', nivel: 'info' }
  ];

  var ticker = [
    '<b>PR-399</b> municípios sob cobertura contínua',
    '<span class="sig-warn">▲ 358%</span> pauta "pedágio" — eixo Cascavel–Foz — fase 2',
    '<b>9,1M</b> sinais públicos processados nas últimas 24h',
    '<span class="sig-up">▲ 0,6pp</span> projeção HV — janela de 7 dias',
    'Segurança Pública lidera tração na <b>RMC</b> — 10º dia',
    '<span class="sig-up">+24%</span> engajamento Educação — Perfil B — Londrina',
    'Modelo preditivo recalibrado — precisão <b>94,8%</b> (backtesting 2024)',
    '<span class="sig-warn">Atenção</span> cluster Agro Noroeste −7% volume semanal'
  ];

  // ---------- assinaturas comportamentais (página 6 do deck) ----------
  var perfis = [
    {
      id: 'A', nome: 'Núcleo Agro-Tradição',
      resumo: 'Interior produtivo. Alta coesão, consumo denso de conteúdo de agronegócio e segurança.',
      tamanho: 473850, engajamento: 9, coesao: 94,
      espectro: { esquerda: 9, centro: 16, direita: 75 },
      temas: ['Segurança', 'Agronegócio', 'Economia', 'Religião'],
      radar: { Economia: 81, 'Segurança': 96, 'Saúde': 44, 'Educação': 32, Emprego: 60, Infraestrutura: 74 },
      regioes: ['Noroeste', 'Campos Gerais', 'Centro-Sul'],
      tendencia: 1.9
    },
    {
      id: 'B', nome: 'Jovem Urbano-Digital',
      resumo: 'Capitais e polos universitários. Volátil, alto compartilhamento, sensível a pautas de educação e emprego.',
      tamanho: 766776, engajamento: 12.3, coesao: 61,
      espectro: { esquerda: 61, centro: 26, direita: 13 },
      temas: ['Educação', 'Emprego', 'Mobilidade', 'Cultura'],
      radar: { Economia: 57, 'Segurança': 41, 'Saúde': 61, 'Educação': 94, Emprego: 91, Infraestrutura: 46 },
      regioes: ['Curitiba', 'Londrina', 'Maringá'],
      tendencia: 4.9
    },
    {
      id: 'C', nome: 'Centro Pragmático',
      resumo: 'Classe média urbana e periferia consolidada. Decide tarde, responde a economia e saúde no bolso.',
      tamanho: 947568, engajamento: 5.2, coesao: 50,
      espectro: { esquerda: 27, centro: 49, direita: 24 },
      temas: ['Economia', 'Saúde', 'Emprego', 'Serviços'],
      radar: { Economia: 92, 'Segurança': 63, 'Saúde': 86, 'Educação': 55, Emprego: 75, Infraestrutura: 57 },
      regioes: ['RMC', 'Ponta Grossa', 'Cascavel'],
      tendencia: -0.8
    }
  ];

  // ---------- mapa de calor (página 7) ----------
  // métricas selecionáveis (lentes do deck)
  var mapaLentes = [
    { id: 'tendencia', label: 'Tendência ideológica predominante' },
    { id: 'engajamento', label: 'Intensidade de engajamento da base' },
    { id: 'crescimento', label: 'Crescimento de candidatos e narrativas' },
    { id: 'influencia', label: 'Evolução temporal das manchas de influência' }
  ];
  // âncoras regionais: valores conhecidos p/ cidades-chave (0-100 nas 4 lentes)
  // tendencia: -1 = polo esquerda(laranja), 100 = polo direita(ciano)
  var mapaAncoras = {
    'Curitiba':          { tendencia: 60, engajamento: 95, crescimento: 63, influencia: 90, lider: 'hv' },
    'Londrina':          { tendencia: 47, engajamento: 77, crescimento: 73, influencia: 77, lider: 'rb' },
    'Maringá':           { tendencia: 66, engajamento: 76, crescimento: 61, influencia: 69, lider: 'hv' },
    'Ponta Grossa':      { tendencia: 54, engajamento: 64, crescimento: 43, influencia: 60, lider: 'mt' },
    'Cascavel':          { tendencia: 74, engajamento: 82, crescimento: 89, influencia: 69, lider: 'hv' },
    'Foz do Iguaçu':     { tendencia: 48, engajamento: 81, crescimento: 93, influencia: 60, lider: 'rb' },
    'São José dos Pinhais': { tendencia: 57, engajamento: 69, crescimento: 50, influencia: 65, lider: 'hv' },
    'Colombo':           { tendencia: 50, engajamento: 57, crescimento: 44, influencia: 58, lider: 'rb' },
    'Guarapuava':        { tendencia: 62, engajamento: 56, crescimento: 42, influencia: 47, lider: 'hv' },
    'Paranaguá':         { tendencia: 43, engajamento: 65, crescimento: 46, influencia: 54, lider: 'rb' },
    'Toledo':            { tendencia: 77, engajamento: 68, crescimento: 63, influencia: 60, lider: 'hv' },
    'Apucarana':         { tendencia: 49, engajamento: 59, crescimento: 48, influencia: 48, lider: 'mt' }
  };
  // bairros de Curitiba (drill-down demonstrativo "bairro por bairro")
  var bairrosCuritiba = [
    { nome: 'Centro', tendencia: 45, engajamento: 91, cresc: 11 },
    { nome: 'Água Verde', tendencia: 68, engajamento: 74, cresc: 3 },
    { nome: 'Boqueirão', tendencia: 53, engajamento: 67, cresc: 8 },
    { nome: 'Cajuru', tendencia: 41, engajamento: 72, cresc: 14 },
    { nome: 'CIC', tendencia: 37, engajamento: 77, cresc: 20 },
    { nome: 'Santa Felicidade', tendencia: 74, engajamento: 61, cresc: -4 },
    { nome: 'Portão', tendencia: 59, engajamento: 65, cresc: 5 },
    { nome: 'Sítio Cercado', tendencia: 40, engajamento: 80, cresc: 17 },
    { nome: 'Batel', tendencia: 80, engajamento: 69, cresc: 1 },
    { nome: 'Tatuquara', tendencia: 35, engajamento: 74, cresc: 23 }
  ];

  // ---------- radiografia de pautas (página 8) ----------
  var pautas = [
    { id: 'seguranca', nome: 'Segurança Pública', tracao: 96, cresc7d: 11, sentimento: -63, engaj: 9.4, central: true,
      nota: 'Alta tração em áreas metropolitanas' },
    { id: 'economia', nome: 'Economia', tracao: 84, cresc7d: 2, sentimento: -39, engaj: 7.2 },
    { id: 'saude', nome: 'Saúde', tracao: 75, cresc7d: 7, sentimento: -52, engaj: 7 },
    { id: 'emprego', nome: 'Emprego', tracao: 74, cresc7d: 9, sentimento: -39, engaj: 6.4 },
    { id: 'educacao', nome: 'Educação', tracao: 67, cresc7d: 10, sentimento: -20, engaj: 6.3 },
    { id: 'agro', nome: 'Agronegócio', tracao: 57, cresc7d: 4, sentimento: 34, engaj: 5 },
    { id: 'religiao', nome: 'Religião', tracao: 49, cresc7d: 2, sentimento: 43, engaj: 5.1 },
    { id: 'mobilidade', nome: 'Mobilidade Urbana', tracao: 47, cresc7d: 18, sentimento: -45, engaj: 4.8 },
    { id: 'pedagio', nome: 'Pedágio', tracao: 40, cresc7d: 56, sentimento: -68, engaj: 8.1, emergente: true },
    { id: 'moradia', nome: 'Moradia', tracao: 82, cresc7d: 32, sentimento: -30, engaj: 7.8, emergente: true }
  ];
  // arestas da rede (pauta central conecta às demais; pesos = correlação de co-engajamento)
  var pautasLinks = [
    ['seguranca', 'economia', 64], ['seguranca', 'saude', 50], ['seguranca', 'emprego', 57],
    ['seguranca', 'educacao', 40], ['seguranca', 'mobilidade', 35], ['seguranca', 'religiao', 43],
    ['economia', 'emprego', 79], ['economia', 'agro', 60], ['economia', 'pedagio', 46],
    ['saude', 'moradia', 31], ['educacao', 'emprego', 53], ['mobilidade', 'pedagio', 65],
    ['agro', 'religiao', 38], ['saude', 'educacao', 36]
  ];
  // séries de tração 30d por pauta-chave (sparklines)
  function serie30(base, drift, vol, seed) {
    var out = [], v = base;
    for (var i = 0; i < 30; i++) { v += drift + (prand(seed + i) - 0.5) * vol; out.push(Math.max(0, Math.round(v))); }
    return out;
  }
  var pautasSeries = {
    seguranca: serie30(82, 0.5, 6, 101),
    pedagio: serie30(8, 1.3, 3, 113),
    educacao: serie30(50, 0.55, 5, 127),
    mobilidade: serie30(32, 0.5, 5, 131)
  };

  // ---------- monitor preditivo (página 9) ----------
  // curva de adoção com 3 fases
  var ondaDias = [];
  for (var j = 41; j >= 0; j--) {
    var dd = new Date(hoje.getTime() - j * 86400000);
    ondaDias.push((dd.getDate() < 10 ? '0' : '') + dd.getDate() + '/' + (dd.getMonth() + 1 < 10 ? '0' : '') + (dd.getMonth() + 1));
  }
  function logistic(n, mid, k, max) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(Math.round(max / (1 + Math.exp(-k * (i - mid))) * 10) / 10);
    return out;
  }
  var ondas = [
    {
      tema: 'Pedágio nas rodovias', fase: 2, cresc: 358, regiao: 'Cascavel–Foz do Iguaçu',
      volume: logistic(42, 29, 0.29, 98), engajInicial: 8.1,
      janela: '4–8 dias até estabelecer', acao: 'Intervenção estratégica recomendada AGORA'
    },
    {
      tema: 'Segurança nas escolas', fase: 1, cresc: 87, regiao: 'RMC',
      volume: logistic(42, 43, 0.23, 63), engajInicial: 7.3,
      janela: '11–17 dias até ponto de intervenção', acao: 'Monitorar — sinais espontâneos de alto engajamento'
    },
    {
      tema: 'Tarifa de transporte', fase: 3, cresc: 11, regiao: 'Curitiba / Londrina',
      volume: logistic(42, 15, 0.34, 90), engajInicial: 4.5,
      janela: 'Onda estabelecida — pesquisas tradicionais captando agora', acao: 'Posicionamento reativo — custo de entrada alto'
    }
  ];
  var fases = [
    { n: 1, nome: 'Sinais Espontâneos', desc: 'Baixo volume, alto engajamento inicial. Invisível para pesquisas.' },
    { n: 2, nome: 'Ponto de Intervenção Estratégica', desc: 'A IA alerta a campanha aqui. Custo mínimo, impacto máximo.' },
    { n: 3, nome: 'Onda Estabelecida', desc: 'Pesquisas tradicionais finalmente captam o assunto. Tarde para liderar.' }
  ];

  // ---------- playbook tático (página 11) ----------
  var playbook = [
    {
      id: 'territorio', icone: '◈', nome: 'Estratégia Territorial',
      desc: 'Escolha matemática de bairros e municípios prioritários.',
      recs: [
        { txt: 'Priorizar corredor Cascavel → Toledo: crescimento 89 vs presença atual 43', prio: 'alta', impacto: '+1,5pp projetado' },
        { txt: 'Reforço em Tatuquara e CIC (Curitiba): engajamento alto, cobertura baixa', prio: 'alta', impacto: '+19k alcance/dia' },
        { txt: 'Reduzir investimento em Batel: saturação 93%, retorno marginal', prio: 'media', impacto: '−R$ 34k/sem realocáveis' }
      ]
    },
    {
      id: 'recursos', icone: '▤', nome: 'Alocação de Recursos',
      desc: 'Distribuição de verba eleitoral onde a conversão é maior.',
      recs: [
        { txt: 'Realocar 23% da verba de Facebook → TikTok (conversão 3,2x no Perfil B)', prio: 'alta', impacto: 'CPE −36%' },
        { txt: 'Janela de mídia 18h–21h no interior: engajamento 2,5x vs média', prio: 'media', impacto: '+10% retenção' }
      ]
    },
    {
      id: 'discurso', icone: '◎', nome: 'Construção de Discurso',
      desc: 'Adequação cirúrgica da mensagem para cada demografia.',
      recs: [
        { txt: 'Perfil A: enquadrar segurança via "proteção da propriedade rural"', prio: 'alta', impacto: 'afinidade +29%' },
        { txt: 'Perfil B: educação → "primeiro emprego"; evitar enquadramento fiscal', prio: 'alta', impacto: 'rejeição −13%' },
        { txt: 'Perfil C: bolso primeiro — saúde e tarifa antes de pauta identitária', prio: 'media', impacto: 'considerar 2º turno' }
      ]
    },
    {
      id: 'agendas', icone: '▣', nome: 'Agendas Públicas',
      desc: 'Definição de projetos baseados no que a população realmente demanda.',
      recs: [
        { txt: 'Plano de segurança escolar RMC antecipa onda fase 1 detectada', prio: 'alta', impacto: 'pioneirismo' },
        { txt: 'Mobilidade em Londrina: demanda reprimida 4º mês consecutivo', prio: 'media', impacto: 'espaço aberto' }
      ]
    },
    {
      id: 'crises', icone: '⛨', nome: 'Gestão de Crises',
      desc: 'Antecipação de ataques e respostas a movimentos adversários.',
      recs: [
        { txt: 'Narrativa "pedágio" será usada contra incumbente em 4–8 dias — preparar resposta', prio: 'critica', impacto: 'blindagem' },
        { txt: 'Vídeo RB tarifa zero: responder com dado, não confronto (sentimento −69%)', prio: 'alta', impacto: 'contenção 36h' }
      ]
    },
    {
      id: 'oportunidades', icone: '◉', nome: 'Mapeamento de Oportunidades',
      desc: 'Identificação de vácuos de liderança em nichos específicos.',
      recs: [
        { txt: 'Vácuo de liderança em "agro jovem" (18–29 interior): nenhum candidato ocupa', prio: 'alta', impacto: '~126k grupo' },
        { txt: 'Pauta ambiental no litoral sem dono político há 43 dias', prio: 'media', impacto: 'nicho 36k' }
      ]
    }
  ];

  return {
    candidatos: candidatos,
    projSeries: projSeries,
    kpis: kpis,
    plataformas: plataformas,
    feed: feed,
    ticker: ticker,
    perfis: perfis,
    mapaLentes: mapaLentes,
    mapaAncoras: mapaAncoras,
    bairrosCuritiba: bairrosCuritiba,
    pautas: pautas,
    pautasLinks: pautasLinks,
    pautasSeries: pautasSeries,
    ondaDias: ondaDias,
    ondas: ondas,
    fases: fases,
    playbook: playbook,
    prand: prand
  };
})();
