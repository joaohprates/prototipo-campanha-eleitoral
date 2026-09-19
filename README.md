# SIE — Sistema de Inteligência Eleitoral

Protótipo estático navegável para apresentação. Oito módulos, com dados sintéticos e uma área de referências oficiais.

## Executar

Abra `index.html` ou execute na raiz:

```sh
python -m http.server 4173 --bind 127.0.0.1
```

Acesse http://127.0.0.1:4173. Não exige build, instalação ou credenciais.

## O que funciona

- Navegação por links `#overview`, `#perfis`, `#mapa`, `#pautas`, `#preditivo`, `#playbook` , `#fontes` e `#pesquisas`, inclusive voltar/avançar e acesso direto.
- Menu para celular, navegação por teclado, indicação da página ativa e respeito à preferência de movimento reduzido.
- Gráficos ECharts e quatro lentes existentes do mapa.
- Fontes com filtro por status, exportação CSV do filtro atual e impressão/salvar PDF pelo navegador.
- Layout compartilhado adaptável, sem build e sem backend.

## Dados e referências

**Os nomes, indicadores, perfis, projeções e análises dos módulos 01 a 06 são fictícios.** As séries usam a referência demonstrativa de **19/09/2026**. A atualização do cenário não representa coleta real nem validação desses números.

Referências verificadas em **15/09/2026**:

- [Calendário 2026 — TSE](https://www.tse.jus.br/comunicacao/noticias/2026/Marco/eleicoes-2026-confira-as-principais-datas-do-calendario-eleitoral): primeiro turno em 04/10 e eventual segundo turno em 25/10.
- [Central Eleições 2026 — TSE](https://www.tse.jus.br/eleicoes/eleicoes-2026).

As referências são editoriais, sem sincronização automática. Não há coleta de redes sociais, autenticação, modelo de IA conectado, backtesting ou validação estatística dos percentuais exibidos. O mapa geográfico vem de `assets/parana-geo.js`; os valores sobre ele são simulados. Não há certificado de conformidade legal implícito na interface.

## Estrutura

- `index.html`: shell, menu, área principal e rodapé.
- `css/styles.css`: tokens, componentes, layouts responsivos e impressão.
- `js/app.js`: runtime, navegação e acessibilidade compartilhada.
- `js/data.js`: base demonstrativa original.
- `js/views/*.js`: módulos; `fontes.js` contém referências e exportação.
- `assets/`: ECharts e geometria local do Paraná.

Tema editorial inspirado na referência Steep fornecida: tipografia restaurada para Roboto, cartões de 24 px, sombras mínimas e controles em pílula. Paleta conferida em [Materiais — Flávio Bolsonaro](https://www.flaviobolsonaro.com.br/materiais): azul `#005BAA`, verde `#07884F`, verde vivo `#12B24B`, amarelo `#FFCB05` e fundo quente `#FFF8E3`. Estilos em `css/editorial-theme.css`.

Fontes tipográficas Roboto e Roboto Mono via Google Fonts, com fallback local. Gráficos e base demonstrativa carregam de arquivos locais.

## Validação

```sh
node tests/smoke.mjs
```

Teste de sintaxe e exportação de referências (filtro, cabeçalho, codificação UTF-8 e conteúdo). A revisão manual das sete telas foi feita em 1440 × 1000 e 390 × 844. O diálogo de impressão e a gravação final do download dependem do navegador.

## Publicação

Hospedagem estática: raiz do projeto como diretório público, sem comando de build. Nenhuma publicação remota faz parte desta revisão.


## Central de Pesquisas

O módulo `#pesquisas` é separado da base fictícia dos módulos 01–06. A curadoria inicial de 15/09/2026 contém cinco levantamentos publicados, de AtlasIntel, Datafolha, Real Time Big Data e Quaest, abrangendo Brasil, Paraná e Minas Gerais. A publicação da AtlasIntel tem apenas ficha resumida conferida; percentuais e registro não foram transcritos. Cada registro contém sua URL de procedência, campo, publicação, amostra e margem.

Filtros: Presidente, Governador, Senador, Deputado federal, Deputado estadual; instituto; abrangência; turno; busca por nome/registro e ordenação. Ausência no catálogo não significa ausência de pesquisas existentes. Primeiro e segundo turnos permanecem em cenários distintos. Senado identifica a base para as duas vagas. Não se calculam médias nem se normalizam percentuais transcritos.

**Atualização editorial, não automática:** editar `js/polls-data.js` com novos registros e respectivas fontes; atualizar a data de revisão no catálogo e no shell de `js/app.js`. Não há integração dos institutos ou promessa de cobertura exaustiva. Os registros do TSE são reproduzidos das fontes, sem consulta independente ao PesqEle. Os dados técnicos seguem a publicação indicada em cada ficha; divergências entre veículos não são combinadas.

Validação adicional: `node tests/polls.mjs`.
