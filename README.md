# SIE — Sistema de Inteligência Eleitoral (protótipo)

Protótipo navegável de uma plataforma de inteligência comportamental eleitoral — o "Google Analytics das Eleições". Contexto demonstrativo: Paraná · Ciclo 2026.

> **Aviso:** todos os dados são simulados e todos os nomes de pessoas são fictícios. Este é um protótipo de conceito para apresentação — não coleta, processa nem exibe dados reais.

## Módulos

| # | Módulo | Conteúdo |
|---|---|---|
| 01 | Centro de Comando | KPIs de coleta, projeção 90 dias, share de voz, feed de sinais |
| 02 | Assinaturas Comportamentais | Perfis agregados com espectro ideológico e radar de afinidades |
| 03 | Mapa de Calor | Choropleth real do Paraná (399 municípios) com 4 lentes + drill-down por bairro |
| 04 | Radiografia de Pautas | Rede de co-engajamento temático, ranking de tração, sentimento |
| 05 | Monitor Preditivo | Curva de adoção em 3 fases, ondas emergentes, governança do modelo |
| 06 | Playbook Tático | Recomendações estratégicas priorizadas por frente de ação |

## Stack

- HTML/CSS/JS vanilla, sem build — abre direto (`index.html`) ou em qualquer host estático
- [ECharts 5](https://echarts.apache.org/) vendorado em `assets/`
- GeoJSON dos municípios do PR ([geodata-br](https://github.com/tbrugz/geodata-br)) embutido em `assets/parana-geo.js`
- Design system: AIME (light theme, primary `#1C4B6A`, accent `#45AEAA`, Roboto ≥14px)

## Deploy

Site 100% estático — na Vercel basta importar o repositório (framework preset: **Other**, sem build command, output directory: raiz).

## Estrutura

```
index.html          shell (nav, topbar, ticker)
css/styles.css      design tokens + componentes compartilhados
js/app.js           runtime (registro de views, tema ECharts, helpers)
js/data.js          dados simulados centralizados
js/views/*.js       uma view por módulo
assets/             ECharts + geoJSON do Paraná
```
