/* ============================================================
   SIE — view 'mapa' · MÓDULO 03 · GEORREFERENCIAMENTO
   Choropleth do Paraná (399 municípios) com 4 lentes táticas,
   praças-chave e drill-down demonstrativo de Curitiba.
   ============================================================ */
(function () {
  var D = SIE.DATA, C = SIE.colors, F = SIE.fmt;

  SIE.registerView('mapa', { render: render });

  // ---------- configuração das lentes ----------
  var LENTES = {
    tendencia: {
      curto: 'Tendência', rotulo: 'Índice espectral', corHi: C.cyan, seed: 17,
      vmColor: [C.esq, '#EDF0F4', C.dir], vmText: ['POLO DIREITA', 'POLO ESQUERDA']
    },
    engajamento: {
      curto: 'Engajamento', rotulo: 'Engajamento da base', corHi: C.accentHover, seed: 29,
      vmColor: ['#EDF2F7', C.accent], vmText: ['ALTO', 'BAIXO']
    },
    crescimento: {
      curto: 'Crescimento', rotulo: 'Crescimento de narrativas', corHi: '#806300', seed: 41,
      vmColor: ['#EDF2F7', C.orange], vmText: ['ACELERADO', 'ESTÁVEL']
    },
    influencia: {
      curto: 'Influência', rotulo: 'Mancha de influência', corHi: '#2F6FB2', seed: 53,
      vmColor: ['#EDF2F7', C.info], vmText: ['DENSA', 'DIFUSA']
    }
  };

  var lenteAtual = 'tendencia';
  var mapInst = null;

  // nomes dos 399 municípios direto do geoJSON registrado
  var NOMES = (window.PARANA_GEO && window.PARANA_GEO.features || []).map(function (f) {
    return f.properties.name;
  });

  function candDe(id) {
    for (var i = 0; i < D.candidatos.length; i++) if (D.candidatos[i].id === id) return D.candidatos[i];
    return null;
  }

  // hash determinístico simples (soma de charCodes) — sem Math.random
  function hashNome(n) {
    var h = 0;
    for (var i = 0; i < n.length; i++) h += n.charCodeAt(i);
    return h;
  }

  function valorDe(nome, lente) {
    var a = D.mapaAncoras[nome];
    if (a) return a[lente];
    return Math.round(15 + D.prand(hashNome(nome) * 0.7919 + LENTES[lente].seed) * 70);
  }

  function dadosDe(lente) {
    return NOMES.map(function (nome) {
      var item = { name: nome, value: valorDe(nome, lente) };
      if (D.mapaAncoras[nome]) {
        item.itemStyle = { borderColor: '#FFCB05', borderWidth: 1.2 };
      }
      return item;
    });
  }

  function vmDe(lente) {
    var L = LENTES[lente];
    return {
      type: 'continuous', min: 0, max: 100, calculable: false,
      orient: 'horizontal', left: 14, bottom: 10,
      itemWidth: 9, itemHeight: 130,
      inRange: { color: L.vmColor },
      text: L.vmText,
      textStyle: { color: C.textLow, fontFamily: SIE.fonts.mono, fontSize: 12 }
    };
  }

  function ttFormatter(p) {
    if (!p || p.value == null || isNaN(p.value)) {
      return '<div style="font-family:' + SIE.fonts.display + ';color:' + C.textHi + '">' + p.name + '</div>' +
        '<div style="color:' + C.textLow + ';font-size:12px">sem leitura na janela atual</div>';
    }
    var L = LENTES[lenteAtual];
    var v = Math.round(p.value);
    var html = '<div style="font-family:' + SIE.fonts.display + ';font-size:14px;font-weight:600;color:' +
      C.textHi + ';margin-bottom:4px">' + p.name + '</div>';
    html += '<div>' + L.rotulo + ': <b style="color:' + L.corHi + '">' + v +
      '</b><span style="color:' + C.textLow + '"> / 100</span></div>';
    if (lenteAtual === 'tendencia') {
      var campo = v >= 60 ? { t: 'campo direita', c: C.dir } :
                  v <= 40 ? { t: 'campo esquerda', c: C.esq } :
                            { t: 'território em disputa', c: C.centro };
      html += '<div style="color:' + campo.c + ';font-size:12px;margin-top:2px">◈ ' + campo.t + '</div>';
    }
    var a = D.mapaAncoras[p.name];
    if (a) {
      var cand = candDe(a.lider);
      html += '<div style="margin-top:6px;padding-top:5px;border-top:1px solid ' + C.line + '">' +
        '<span style="color:' + cand.cor + '">●</span> Líder local: <b style="color:' + cand.cor + '">' +
        cand.sigla + '</b> — ' + cand.nome + '</div>' +
        '<div style="color:#806300;font-size:11px;letter-spacing:.06em;margin-top:3px">PRAÇA-CHAVE · LEITURA CONSOLIDADA</div>';
    } else {
      html += '<div style="color:' + C.textLow + ';font-size:11px;letter-spacing:.06em;margin-top:5px">ESTIMATIVA DO MODELO · JANELA 7D</div>';
    }
    return html;
  }

  function serieDe(lente) {
    var meta = D.meta || { name: 'Paraná', code: 'PR' };
    if (meta.code !== 'PR') {
      return {
        name: meta.name, type: 'bar',
        barWidth: 18,
        itemStyle: { color: C.cyan, borderRadius: [3, 3, 0, 0] },
        emphasis: { itemStyle: { color: C.accent } },
        data: Object.keys(D.mapaAncoras).map(function (nome) { return { name: nome, value: valorDe(nome, lente) }; })
      };
    }
    return {
      name: meta.name, type: 'map', map: 'parana',
      roam: true, scaleLimit: { min: 0.9, max: 8 },
      top: 10, bottom: 46, left: 16, right: 16,
      itemStyle: { areaColor: '#EDF0F4', borderColor: '#FFFFFF', borderWidth: 0.8 },
      emphasis: {
        itemStyle: {
          areaColor: 'rgba(0,91,170,0.14)', borderColor: C.cyan, borderWidth: 1.2
        },
        label: { show: true, color: '#17191C', fontFamily: SIE.fonts.mono, fontSize: 11, fontWeight: 600 }
      },
      select: { disabled: true },
      label: { show: false },
      data: dadosDe(lente)
    };
  }

  function linhasAncoras(lente) {
    var rows = Object.keys(D.mapaAncoras).map(function (nome) {
      var a = D.mapaAncoras[nome];
      return { nome: nome, valor: a[lente], lider: a.lider };
    }).sort(function (x, y) { return y.valor - x.valor; });

    return rows.map(function (r, i) {
      var c = candDe(r.lider);
      var rank = (i + 1 < 10 ? '0' : '') + (i + 1);
      return '<tr>' +
        '<td class="num" style="color:var(--text-low)">' + rank + '</td>' +
        '<td style="color:var(--text-hi)">' + r.nome + '</td>' +
        '<td class="num" style="color:' + LENTES[lente].corHi + '">' + F.int(r.valor) + '</td>' +
        '<td><span class="tag" title="' + c.nome + '" style="color:' + c.cor + ';border-color:' + c.cor + '55;background:' + c.cor + '1a">' + c.sigla + '</span></td>' +
        '</tr>';
    }).join('');
  }

  function resumoLideres() {
    var cont = {};
    Object.keys(D.mapaAncoras).forEach(function (n) {
      var id = D.mapaAncoras[n].lider;
      cont[id] = (cont[id] || 0) + 1;
    });
    return Object.keys(cont).map(function (id) {
      var c = candDe(id);
      return '<span><i style="background:' + c.cor + '"></i>' + c.sigla + ' <b>' + cont[id] + '</b></span>';
    }).join('');
  }

  function setLente(lente, container) {
    lenteAtual = lente;
    container.querySelectorAll('.mp-seg-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.lente === lente);
      b.setAttribute('aria-pressed', String(b.dataset.lente === lente));
    });
    var lObj = null;
    for (var i = 0; i < D.mapaLentes.length; i++) if (D.mapaLentes[i].id === lente) lObj = D.mapaLentes[i];
    container.querySelector('#mp-lens-desc').textContent = 'LENTE ATIVA — ' + lObj.label.toUpperCase();
    container.querySelector('#mp-ancoras').innerHTML = linhasAncoras(lente);
    container.querySelector('#mp-ancoras-meta').textContent = 'ORDENADO POR ' + LENTES[lente].curto.toUpperCase();
    if (mapInst) {
      mapInst.setOption({ visualMap: vmDe(lente), series: [{ data: dadosDe(lente) }] });
    }
  }

  // ---------- render ----------
  function render(container) {
    var meta = D.meta || { name: 'Paraná', code: 'PR', regiao: 'Paraná' };
    var isMap = meta.code === 'PR';
    var segBtns = D.mapaLentes.map(function (l) {
      return '<button class="mp-seg-btn' + (l.id === lenteAtual ? ' active' : '') +
        '" data-lente="' + l.id + '">' + LENTES[l.id].curto + '</button>';
    }).join('');

    var bairros = D.bairrosCuritiba.slice().sort(function (a, b) { return b.engajamento - a.engajamento; });
    var bairrosHtml = bairros.map(function (b) {
      var tagCls = b.cresc >= 0 ? 'pos' : 'neg';
      return '<div class="mp-bairro">' +
        '<div class="mp-bairro-top">' +
          '<span class="mp-bairro-nome">' + b.nome + '</span>' +
          '<span class="tag ' + tagCls + '">' + F.delta(b.cresc, '%') + '</span>' +
        '</div>' +
        '<div class="mp-row"><span class="mp-row-lab">ENG</span>' +
          '<div class="bar"><i data-w="' + b.engajamento + '" style="width:0%"></i></div>' +
          '<span class="mp-row-val">' + F.int(b.engajamento) + '</span></div>' +
        '<div class="mp-row"><span class="mp-row-lab">ESP</span>' +
          '<div class="mp-spec"><i style="left:' + b.tendencia + '%"></i></div>' +
          '<span class="mp-row-val">' + F.int(b.tendencia) + '</span></div>' +
        '</div>';
    }).join('');

    var lentesLista = D.mapaLentes.map(function (l, i) {
      return '<div class="mp-lente-item"><span>0' + (i + 1) + '</span>' + l.label + '</div>';
    }).join('');

    container.innerHTML =
      '<div class="view-head reveal">' +
        '<style>' +
          '.mp-seg{display:inline-flex;gap:2px;background:var(--bg-2);border-radius:12px;padding:3px;}' +
          '.mp-seg-btn{appearance:none;border:none;background:transparent;color:var(--text-low);font-family:var(--f-body);font-size:14px;font-weight:500;padding:6px 14px;border-radius:9px;cursor:pointer;transition:background .15s,color .15s,box-shadow .15s;}' +
          '.mp-seg-btn:hover{color:var(--text-hi);}' +
          '.mp-seg-btn.active{background:#FFFFFF;color:var(--cyan);box-shadow:0 1px 3px rgba(0,91,170,.12);}' +
          '.mp-lens-row{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-bottom:10px;}' +
          '.mp-lens-desc{font-family:var(--f-mono);font-size:14px;letter-spacing:.04em;color:var(--text-low);}' +
          '.mp-side-foot{margin-top:14px;padding-top:12px;border-top:1px solid var(--line-soft);font-family:var(--f-mono);font-size:14px;color:var(--text-low);letter-spacing:.02em;line-height:1.8;}' +
          '.mp-lideres{display:flex;gap:14px;margin-bottom:8px;font-size:14px;letter-spacing:.04em;color:var(--text);}' +
          '.mp-lideres i{display:inline-block;width:8px;height:8px;border-radius:2px;margin-right:5px;vertical-align:-1px;}' +
          '.mp-lideres b{color:var(--text-hi);font-weight:600;}' +
          '.mp-drill{display:flex;gap:24px;align-items:stretch;}' +
          '.mp-bairros{flex:1;display:grid;grid-template-columns:1fr 1fr;gap:12px 28px;}' +
          '.mp-bairro{padding:9px 0 7px;border-bottom:1px solid var(--line-soft);}' +
          '.mp-bairro-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px;}' +
          '.mp-bairro-nome{font-family:var(--f-display);font-size:14px;font-weight:600;color:var(--text-hi);letter-spacing:.01em;}' +
          '.mp-row{display:grid;grid-template-columns:36px 1fr 34px;align-items:center;gap:9px;margin-bottom:5px;}' +
          '.mp-row-lab{font-family:var(--f-mono);font-size:14px;letter-spacing:.04em;color:var(--text-low);}' +
          '.mp-row-val{font-family:var(--f-mono);font-size:14px;color:var(--text);text-align:right;font-variant-numeric:tabular-nums;}' +
          '.mp-spec{height:4px;border-radius:2px;background:linear-gradient(90deg,#FFCB05,#E5E7EB 50%,#005BAA);position:relative;}' +
          '.mp-spec i{position:absolute;top:50%;transform:translate(-50%,-50%);width:10px;height:10px;border-radius:50%;background:#FFFFFF;border:2px solid var(--cyan);}' +
          '.mp-lentes{width:252px;flex:none;border-left:1px solid var(--line-soft);padding-left:22px;display:flex;flex-direction:column;gap:14px;}' +
          '.mp-lentes-title{font-family:var(--f-mono);font-size:14px;letter-spacing:.06em;text-transform:uppercase;color:var(--cyan);}' +
          '.mp-lente-item{font-family:var(--f-mono);font-size:14px;line-height:1.5;color:var(--text);padding:6px 0;border-bottom:1px solid var(--line-soft);}' +
          '.mp-lente-item span{color:var(--orange-hi);margin-right:9px;}' +
          '.mp-lentes .spectrum-legend{flex-direction:column;gap:7px;}' +
          '.mp-lentes-note{font-family:var(--f-mono);font-size:14px;color:var(--text-low);line-height:1.7;letter-spacing:.02em;}' +
          '@media (max-width:1280px){.mp-drill{flex-direction:column;}.mp-lentes{width:auto;border-left:none;padding-left:0;border-top:1px solid var(--line-soft);padding-top:16px;}}' +
        '</style>' +
        '<div class="view-kicker">MÓDULO 03 · GEORREFERENCIAMENTO</div>' +
        '<div class="view-title">Mapa de Calor Eleitoral</div>' +
        '<div class="view-sub">Explore a leitura territorial de ' + meta.name + ' e seus recortes prioritários.</div>' +
      '</div>' +

      '<div class="grid cols-3 reveal">' +
        '<div class="panel span-2">' +
          '<div class="panel-head">' +
            '<div class="panel-title">' + (isMap ? 'Mancha territorial' : 'Leitura territorial') + ' — ' + meta.name + '</div>' +
            '<div class="panel-meta">' + F.int(D.kpis.municipios) + ' MUNICÍPIOS · ' + F.int(D.kpis.municipiosAtivos) + ' NA BASE DEMONSTRATIVA</div>' +
          '</div>' +
          '<div class="mp-lens-row">' +
            '<div class="mp-seg">' + segBtns + '</div>' +
            '<div class="mp-lens-desc" id="mp-lens-desc"></div>' +
          '</div>' +
          '<div class="chart chart-xl" id="mp-map"></div>' +
        '</div>' +

        '<div class="panel">' +
          '<div class="panel-head">' +
            '<div class="panel-title">Praças-chave</div>' +
            '<div class="panel-meta" id="mp-ancoras-meta"></div>' +
          '</div>' +
          '<table class="table">' +
            '<thead><tr><th>#</th><th>Município</th><th>Índice</th><th>Líder</th></tr></thead>' +
            '<tbody id="mp-ancoras"></tbody>' +
          '</table>' +
          '<div class="mp-side-foot">' +
            '<div class="mp-lideres">' + resumoLideres() + '</div>' +
            'ÍNDICE = leitura da lente ativa (0–100), janela de 7 dias.<br>' +
            'Lente Tendência: tom claro = território em disputa.<br>' +
            'Praças-chave destacadas no mapa com contorno dourado.' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="panel reveal" style="margin-top:16px">' +
        '<div class="panel-head">' +
          '<div class="panel-title">' + (isMap ? 'Curitiba — bairro a bairro' : 'Recortes prioritários — ' + meta.name) + '</div>' +
          '<div class="panel-meta">' + (isMap ? 'DRILL-DOWN DEMONSTRATIVO · ' : 'LEITURA COMPARATIVA · ') + F.int(D.bairrosCuritiba.length) + ' RECORTES · JANELA 7D</div>' +
        '</div>' +
        '<div class="mp-drill">' +
          '<div class="mp-bairros">' + bairrosHtml + '</div>' +
          '<div class="mp-lentes">' +
            '<div class="mp-lentes-title">Lentes de análise</div>' +
            '<div>' + lentesLista + '</div>' +
            '<div class="spectrum-legend">' +
              '<span class="sw-esq"><i></i>Esquerda</span>' +
              '<span class="sw-centro"><i></i>Centro</span>' +
              '<span class="sw-dir"><i></i>Direita</span>' +
            '</div>' +
            '<div class="mp-lentes-note">ENG = intensidade de engajamento da base (0–100).<br>' +
            'ESP = posição média do bairro no espectro: 0 polo esquerda → 100 polo direita.<br>' +
            'Tag % = crescimento de narrativas na semana.</div>' +
          '</div>' +
        '</div>' +
      '</div>';

    // ---------- gráfico principal ----------
    var mapOption = {
      tooltip: { trigger: 'item', formatter: ttFormatter },
      visualMap: isMap ? vmDe(lenteAtual) : { show: false },
      xAxis: isMap ? undefined : { type: 'category', data: Object.keys(D.mapaAncoras), axisLabel: { interval: 0, rotate: 35, color: C.textLow, fontSize: 10 } },
      yAxis: isMap ? undefined : { type: 'value', min: 0, max: 100, axisLabel: { color: C.textLow, fontFamily: SIE.fonts.mono } },
      series: [serieDe(lenteAtual)]
    };
    mapInst = SIE.chart(container.querySelector('#mp-map'), mapOption, 'mapa');

    // estado inicial (tabela, descrição da lente)
    setLente(lenteAtual, container);

    // troca de lente
    container.querySelectorAll('.mp-seg-btn').forEach(function (b) {
      b.addEventListener('click', function () { setLente(b.dataset.lente, container); });
    });

    // barras de engajamento animadas
    requestAnimationFrame(function () {
      container.querySelectorAll('.mp-bairros .bar > i').forEach(function (i) {
        i.style.width = i.dataset.w + '%';
      });
    });
  }
})();
