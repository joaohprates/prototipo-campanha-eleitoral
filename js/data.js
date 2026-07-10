/* ============================================================
   SIE — dados simulados (protótipo)
   Todos os nomes de pessoas são fictícios. Valores gerados
   para demonstração do conceito do deck.
   ============================================================ */
window.SIE_DATA = (function () {

  // ---------- candidatos (fictícios) ----------
  var candidatos = [
    // cores = paleta categórica do espectro (AIME): dir=primary, esq=warning, centro=cinza
    { id: 'hv', nome: 'Helena Vasconcelos', sigla: 'HV', cor: '#1C4B6A', proj: 34.6, delta: +1.8, espectro: 'dir' },
    { id: 'rb', nome: 'Ricardo Bittencourt', sigla: 'RB', cor: '#D29922', proj: 30.9, delta: -0.7, espectro: 'esq' },
    { id: 'mt', nome: 'Marcos Tavares', sigla: 'MT', cor: '#6B7280', proj: 17.2, delta: +0.4, espectro: 'centro' },
    { id: 'ind', nome: 'Indecisos / Outros', sigla: '—', cor: '#C7CDD6', proj: 17.3, delta: -1.5, espectro: null }
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
    hv: serie(29.8, 0.055, 0.75, 11),
    rb: serie(32.5, -0.017, 0.8, 23),
    mt: serie(15.8, 0.016, 0.6, 37),
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
    sinais24h: 8412930,          // sinais públicos coletados nas últimas 24h
    sinaisDelta: +12.4,          // %
    gruposAtivos: 1284402,       // agrupamentos comportamentais anônimos ativos
    gruposDelta: +3.1,
    municipios: 399,             // cobertura territorial PR
    municipiosAtivos: 371,
    precisaoModelo: 94.2,        // % backtesting
    precisaoDelta: +0.8,
    ondasEmergentes: 3,          // pautas em fase 1-2
    alertasCrise: 1
  };

  // ---------- share of voice por plataforma ----------
  var plataformas = [
    { nome: 'Instagram', share: 34, engaj: 8.2, cresc: +6.1 },
    { nome: 'TikTok', share: 27, engaj: 11.7, cresc: +18.4 },
    { nome: 'YouTube', share: 16, engaj: 5.9, cresc: +2.2 },
    { nome: 'X', share: 13, engaj: 4.1, cresc: -3.5 },
    { nome: 'Facebook', share: 10, engaj: 3.3, cresc: -7.8 }
  ];

  // ---------- feed de sinais (visão geral + ticker) ----------
  var feed = [
    { t: '14:32', txt: '<strong>Onda emergente</strong> — "pedágio" cresce 340% em 72h no eixo Cascavel–Foz', nivel: 'alerta' },
    { t: '14:18', txt: 'Assinatura <strong>Perfil B</strong> amplia engajamento em pauta <strong>Educação</strong> (+22% em Londrina)', nivel: 'info' },
    { t: '13:57', txt: '<strong>RMC</strong>: tração de Segurança Pública mantém 1º lugar pelo 9º dia consecutivo', nivel: 'info' },
    { t: '13:41', txt: 'Vídeo de <strong>RB</strong> sobre tarifa zero atinge 1,2M visualizações em 6h — pico fora do padrão', nivel: 'alerta' },
    { t: '13:20', txt: 'Cluster <strong>Agro Noroeste</strong> reduz volume −8% na semana; atenção à janela de reengajamento', nivel: 'warn' },
    { t: '12:55', txt: '<strong>HV</strong> ganha tração orgânica em Maringá após agenda de mobilidade urbana', nivel: 'info' },
    { t: '12:34', txt: 'Narrativa adversária sobre saúde regional perde força −31% após pico de sexta', nivel: 'info' }
  ];

  var ticker = [
    '<b>PR-399</b> municípios sob cobertura contínua',
    '<span class="sig-warn">▲ 340%</span> pauta "pedágio" — eixo Cascavel–Foz — fase 2',
    '<b>8,4M</b> sinais públicos processados nas últimas 24h',
    '<span class="sig-up">▲ 1,8pp</span> projeção HV — janela de 7 dias',
    'Segurança Pública lidera tração na <b>RMC</b> — 9º dia',
    '<span class="sig-up">+22%</span> engajamento Educação — Perfil B — Londrina',
    'Modelo preditivo recalibrado — precisão <b>94,2%</b> (backtesting 2024)',
    '<span class="sig-warn">Atenção</span> cluster Agro Noroeste −8% volume semanal'
  ];

  // ---------- assinaturas comportamentais (página 6 do deck) ----------
  var perfis = [
    {
      id: 'A', nome: 'Núcleo Agro-Tradição',
      resumo: 'Interior produtivo. Alta coesão, consumo denso de conteúdo de agronegócio e segurança.',
      tamanho: 486000, engajamento: 8.7, coesao: 91,
      espectro: { esquerda: 8, centro: 15, direita: 77 },
      temas: ['Segurança', 'Agronegócio', 'Economia', 'Religião'],
      radar: { Economia: 82, 'Segurança': 94, 'Saúde': 41, 'Educação': 33, Emprego: 58, Infraestrutura: 71 },
      regioes: ['Noroeste', 'Campos Gerais', 'Centro-Sul'],
      tendencia: +2.1
    },
    {
      id: 'B', nome: 'Jovem Urbano-Digital',
      resumo: 'Capitais e polos universitários. Volátil, alto compartilhamento, sensível a pautas de educação e emprego.',
      tamanho: 743000, engajamento: 11.9, coesao: 62,
      espectro: { esquerda: 63, centro: 25, direita: 12 },
      temas: ['Educação', 'Emprego', 'Mobilidade', 'Cultura'],
      radar: { Economia: 55, 'Segurança': 38, 'Saúde': 62, 'Educação': 92, Emprego: 88, Infraestrutura: 47 },
      regioes: ['Curitiba', 'Londrina', 'Maringá'],
      tendencia: +4.6
    },
    {
      id: 'C', nome: 'Centro Pragmático',
      resumo: 'Classe média urbana e periferia consolidada. Decide tarde, responde a economia e saúde no bolso.',
      tamanho: 912000, engajamento: 5.4, coesao: 48,
      espectro: { esquerda: 26, centro: 51, direita: 23 },
      temas: ['Economia', 'Saúde', 'Emprego', 'Serviços'],
      radar: { Economia: 89, 'Segurança': 64, 'Saúde': 84, 'Educação': 52, Emprego: 76, Infraestrutura: 55 },
      regioes: ['RMC', 'Ponta Grossa', 'Cascavel'],
      tendencia: -1.2
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
  // tendencia: 0 = polo esquerda(laranja), 100 = polo direita(ciano)
  var mapaAncoras = {
    'Curitiba':          { tendencia: 58, engajamento: 92, crescimento: 64, influencia: 88, lider: 'hv' },
    'Londrina':          { tendencia: 44, engajamento: 78, crescimento: 71, influencia: 74, lider: 'rb' },
    'Maringá':           { tendencia: 67, engajamento: 74, crescimento: 58, influencia: 70, lider: 'hv' },
    'Ponta Grossa':      { tendencia: 52, engajamento: 61, crescimento: 44, influencia: 58, lider: 'mt' },
    'Cascavel':          { tendencia: 71, engajamento: 83, crescimento: 87, influencia: 66, lider: 'hv' },
    'Foz do Iguaçu':     { tendencia: 49, engajamento: 79, crescimento: 90, influencia: 61, lider: 'rb' },
    'São José dos Pinhais': { tendencia: 55, engajamento: 66, crescimento: 51, influencia: 63, lider: 'hv' },
    'Colombo':           { tendencia: 47, engajamento: 58, crescimento: 42, influencia: 55, lider: 'rb' },
    'Guarapuava':        { tendencia: 63, engajamento: 54, crescimento: 39, influencia: 48, lider: 'hv' },
    'Paranaguá':         { tendencia: 41, engajamento: 62, crescimento: 47, influencia: 52, lider: 'rb' },
    'Toledo':            { tendencia: 74, engajamento: 69, crescimento: 61, influencia: 57, lider: 'hv' },
    'Apucarana':         { tendencia: 50, engajamento: 57, crescimento: 45, influencia: 49, lider: 'mt' }
  };
  // bairros de Curitiba (drill-down demonstrativo "bairro por bairro")
  var bairrosCuritiba = [
    { nome: 'Centro', tendencia: 43, engajamento: 88, cresc: +12 },
    { nome: 'Água Verde', tendencia: 66, engajamento: 71, cresc: +4 },
    { nome: 'Boqueirão', tendencia: 51, engajamento: 64, cresc: +9 },
    { nome: 'Cajuru', tendencia: 39, engajamento: 69, cresc: +15 },
    { nome: 'CIC', tendencia: 35, engajamento: 74, cresc: +21 },
    { nome: 'Santa Felicidade', tendencia: 72, engajamento: 58, cresc: -3 },
    { nome: 'Portão', tendencia: 57, engajamento: 62, cresc: +6 },
    { nome: 'Sítio Cercado', tendencia: 38, engajamento: 77, cresc: +18 },
    { nome: 'Batel', tendencia: 78, engajamento: 66, cresc: +2 },
    { nome: 'Tatuquara', tendencia: 33, engajamento: 71, cresc: +24 }
  ];

  // ---------- radiografia de pautas (página 8) ----------
  var pautas = [
    { id: 'seguranca', nome: 'Segurança Pública', tracao: 94, cresc7d: +8, sentimento: -62, engaj: 9.1, central: true,
      nota: 'Alta tração em áreas metropolitanas' },
    { id: 'economia', nome: 'Economia', tracao: 81, cresc7d: +3, sentimento: -41, engaj: 6.8 },
    { id: 'saude', nome: 'Saúde', tracao: 76, cresc7d: +5, sentimento: -55, engaj: 7.2 },
    { id: 'emprego', nome: 'Emprego', tracao: 72, cresc7d: +6, sentimento: -38, engaj: 6.1 },
    { id: 'educacao', nome: 'Educação', tracao: 64, cresc7d: +11, sentimento: -22, engaj: 5.9 },
    { id: 'agro', nome: 'Agronegócio', tracao: 58, cresc7d: +2, sentimento: +31, engaj: 5.2 },
    { id: 'religiao', nome: 'Religião', tracao: 47, cresc7d: -1, sentimento: +44, engaj: 4.8 },
    { id: 'mobilidade', nome: 'Mobilidade Urbana', tracao: 44, cresc7d: +19, sentimento: -47, engaj: 4.4 },
    { id: 'pedagio', nome: 'Pedágio', tracao: 41, cresc7d: +54, sentimento: -71, engaj: 8.3, emergente: true },
    { id: 'moradia', nome: 'Moradia', tracao: 33, cresc7d: +4, sentimento: -29, engaj: 3.1 }
  ];
  // arestas da rede (pauta central conecta às demais; pesos = correlação de co-engajamento)
  var pautasLinks = [
    ['seguranca', 'economia', 62], ['seguranca', 'saude', 48], ['seguranca', 'emprego', 55],
    ['seguranca', 'educacao', 38], ['seguranca', 'mobilidade', 33], ['seguranca', 'religiao', 41],
    ['economia', 'emprego', 77], ['economia', 'agro', 58], ['economia', 'pedagio', 44],
    ['saude', 'moradia', 29], ['educacao', 'emprego', 51], ['mobilidade', 'pedagio', 63],
    ['agro', 'religiao', 36], ['saude', 'educacao', 34]
  ];
  // séries de tração 30d por pauta-chave (sparklines)
  function serie30(base, drift, vol, seed) {
    var out = [], v = base;
    for (var i = 0; i < 30; i++) { v += drift + (prand(seed + i) - 0.5) * vol; out.push(Math.max(0, Math.round(v))); }
    return out;
  }
  var pautasSeries = {
    seguranca: serie30(80, 0.5, 6, 101),
    pedagio: serie30(6, 1.3, 3, 113),
    educacao: serie30(48, 0.55, 5, 127),
    mobilidade: serie30(30, 0.5, 5, 131)
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
      tema: 'Pedágio nas rodovias', fase: 2, cresc: +340, regiao: 'Cascavel–Foz do Iguaçu',
      volume: logistic(42, 30, 0.28, 100), engajInicial: 8.3,
      janela: '5–9 dias até estabelecer', acao: 'Intervenção estratégica recomendada AGORA'
    },
    {
      tema: 'Segurança nas escolas', fase: 1, cresc: +85, regiao: 'RMC',
      volume: logistic(42, 44, 0.22, 60), engajInicial: 6.9,
      janela: '12–18 dias até ponto de intervenção', acao: 'Monitorar — sinais espontâneos de alto engajamento'
    },
    {
      tema: 'Tarifa de transporte', fase: 3, cresc: +12, regiao: 'Curitiba / Londrina',
      volume: logistic(42, 14, 0.35, 88), engajInicial: 4.2,
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
        { txt: 'Priorizar corredor Cascavel → Toledo: crescimento 87 vs presença atual 41', prio: 'alta', impacto: '+1,4pp projetado' },
        { txt: 'Reforço em Tatuquara e CIC (Curitiba): engajamento alto, cobertura baixa', prio: 'alta', impacto: '+18k alcance/dia' },
        { txt: 'Reduzir investimento em Batel: saturação 94%, retorno marginal', prio: 'media', impacto: '−R$ 32k/sem realocáveis' }
      ]
    },
    {
      id: 'recursos', icone: '▤', nome: 'Alocação de Recursos',
      desc: 'Distribuição de verba eleitoral onde a conversão é maior.',
      recs: [
        { txt: 'Realocar 22% da verba de Facebook → TikTok (conversão 3,1x no Perfil B)', prio: 'alta', impacto: 'CPE −38%' },
        { txt: 'Janela de mídia 19h–22h no interior: engajamento 2,4x vs média', prio: 'media', impacto: '+9% retenção' }
      ]
    },
    {
      id: 'discurso', icone: '◎', nome: 'Construção de Discurso',
      desc: 'Adequação cirúrgica da mensagem para cada demografia.',
      recs: [
        { txt: 'Perfil A: enquadrar segurança via "proteção da propriedade rural"', prio: 'alta', impacto: 'afinidade +31%' },
        { txt: 'Perfil B: educação → "primeiro emprego"; evitar enquadramento fiscal', prio: 'alta', impacto: 'rejeição −12%' },
        { txt: 'Perfil C: bolso primeiro — saúde e tarifa antes de pauta identitária', prio: 'media', impacto: 'considerar 2º turno' }
      ]
    },
    {
      id: 'agendas', icone: '▣', nome: 'Agendas Públicas',
      desc: 'Definição de projetos baseados no que a população realmente demanda.',
      recs: [
        { txt: 'Plano de segurança escolar RMC antecipa onda fase 1 detectada', prio: 'alta', impacto: 'pioneirismo' },
        { txt: 'Mobilidade em Londrina: demanda reprimida 3º mês consecutivo', prio: 'media', impacto: 'espaço aberto' }
      ]
    },
    {
      id: 'crises', icone: '⛨', nome: 'Gestão de Crises',
      desc: 'Antecipação de ataques e respostas a movimentos adversários.',
      recs: [
        { txt: 'Narrativa "pedágio" será usada contra incumbente em 5–9 dias — preparar resposta', prio: 'critica', impacto: 'blindagem' },
        { txt: 'Vídeo RB tarifa zero: responder com dado, não confronto (sentimento −71%)', prio: 'alta', impacto: 'contenção 48h' }
      ]
    },
    {
      id: 'oportunidades', icone: '◉', nome: 'Mapeamento de Oportunidades',
      desc: 'Identificação de vácuos de liderança em nichos específicos.',
      recs: [
        { txt: 'Vácuo de liderança em "agro jovem" (18–29 interior): nenhum candidato ocupa', prio: 'alta', impacto: '~120k grupo' },
        { txt: 'Pauta ambiental no litoral sem dono político há 40 dias', prio: 'media', impacto: 'nicho 34k' }
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
