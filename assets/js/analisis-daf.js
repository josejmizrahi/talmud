/* ============================================================================
   analisis-daf.js — Capa AUTOMÁTICA de análisis estructural del daf
   Integra: TalmudTerminology + Rabbanim + DetectorDisputas + Sefaria links.
   ============================================================================ */

const AnalisisDaf = (function() {

  const MASEJTOT_BAVLI = new Set([
    'Berakhot','Shabbat','Eruvin','Pesachim','Shekalim','Yoma','Sukkah','Beitzah',
    'Rosh Hashanah','Taanit','Megillah','Moed Katan','Chagigah','Yevamot','Ketubot',
    'Nedarim','Nazir','Sotah','Gittin','Kiddushin','Bava Kamma','Bava Metzia',
    'Bava Batra','Sanhedrin','Makkot','Shevuot','Avodah Zarah','Horayot','Zevachim',
    'Menachot','Chullin','Bekhorot','Arakhin','Temurah','Keritot','Meilah','Tamid','Niddah'
  ]);

  function categorizarLinks(links) {
    const result = {
      pesukim: [], paralelos: [], comentarios: {},
      mishna: [], halaja: [], midrash: [], otros: []
    };
    if (!Array.isArray(links)) return result;
    links.forEach(l => {
      const cat = l.category;
      if (cat === 'Tanakh') result.pesukim.push(l);
      else if (cat === 'Talmud') result.paralelos.push(l);
      else if (cat === 'Commentary') {
        const nombre = l.collectiveTitle?.en || l.index_title;
        result.comentarios[nombre] = (result.comentarios[nombre] || 0) + 1;
      }
      else if (cat === 'Mishnah') result.mishna.push(l);
      else if (cat === 'Halakhah') result.halaja.push(l);
      else if (cat === 'Midrash') result.midrash.push(l);
      else result.otros.push(l);
    });
    result.pesukim = [...new Map(result.pesukim.map(p => [p.sourceRef, p])).values()];
    result.paralelos = [...new Map(result.paralelos.map(p => [p.sourceRef, p])).values()];
    return result;
  }

  function render(contenedor, datos) {
    const { ref, textoCompleto, links, terminologia, rabbanim, disputas } = datos;
    const linksCat = categorizarLinks(links);
    const palabrasTotal = textoCompleto.split(/\s+/).length;

    contenedor.innerHTML = `
      <div class="analisis-block">
        <div class="analisis-eyebrow">Anatomía automática · análisis estructural</div>
        <h2 class="analisis-titulo">El daf, por dentro</h2>

        <div class="stats-row">
          <div class="stat"><div class="num">${palabrasTotal}</div><div class="label">Palabras</div></div>
          <div class="stat"><div class="num">${linksCat.pesukim.length}</div><div class="label">Pesukim</div></div>
          <div class="stat"><div class="num">${linksCat.paralelos.length}</div><div class="label">Paralelos</div></div>
          <div class="stat"><div class="num">${rabbanim.length}</div><div class="label">Sabios</div></div>
          <div class="stat"><div class="num">${disputas.length}</div><div class="label">Disputas</div></div>
        </div>

        ${renderMapaVoces(terminologia)}
        ${renderRabbanim(rabbanim)}
        ${renderDisputas(disputas)}
        ${renderPesukim(linksCat.pesukim)}
        ${renderComentarios(linksCat.comentarios)}
        ${renderParalelos(linksCat.paralelos)}
        ${renderOtros(linksCat)}
      </div>
    `;
  }

  function renderMapaVoces(terminologia) {
    const grupos = terminologia.grupos;
    if (grupos.length === 0) return '';
    const totalPorTipo = grupos.reduce((acc, g) => acc + g.totalCount, 0);

    const barras = grupos.map(g => {
      const pct = totalPorTipo > 0 ? (g.totalCount / totalPorTipo * 100) : 0;
      return `
        <div class="categoria-bar">
          <div class="categoria-bar-label">
            <span class="categoria-icono" style="background:${g.info.color}">${g.info.icono}</span>
            <span class="categoria-nombre">${g.info.label}</span>
            <span class="categoria-count">${g.totalCount}</span>
          </div>
          <div class="categoria-bar-track">
            <div class="categoria-bar-fill" style="width:${pct}%;background:${g.info.color}"></div>
          </div>
        </div>
      `;
    }).join('');

    const detalles = grupos.map(g => `
      <details class="patron-grupo">
        <summary>
          <span class="categoria-icono" style="background:${g.info.color}">${g.info.icono}</span>
          ${g.info.label} <span style="color:var(--sepia);font-size:0.85em">(${g.patrones.length} patrones · ${g.totalCount} apariciones)</span>
        </summary>
        <table class="patron-tabla">
          <thead><tr><th>Patrón</th><th>Significa</th><th>Explicación</th><th>×</th></tr></thead>
          <tbody>
            ${g.patrones.map(p => `
              <tr>
                <td class="he-cell">${p.he}</td>
                <td>${p.significa}</td>
                <td class="explica-cell">${p.explica}</td>
                <td class="num-cell">${p.count}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </details>
    `).join('');

    return `
      <details class="analisis-section" open>
        <summary><span class="chev">▾</span> Mapa de voces y argumentación</summary>
        <div class="section-body">
          <p class="section-lead">El Talmud usa terminología formulaica. Cada categoría reúne los marcadores arameos que cumplen esa función discursiva en la sugiá.</p>
          <div class="categoria-barras">${barras}</div>
          <details class="sub-details" style="margin-top:1.5rem">
            <summary><span class="chev">▸</span> Ver todos los patrones detectados con su explicación</summary>
            <div class="patrones-grupos">${detalles}</div>
          </details>
        </div>
      </details>
    `;
  }

  function renderRabbanim(rabbanim) {
    if (!rabbanim || rabbanim.length === 0) return '';
    const cards = rabbanim.slice(0, 30).map(r => {
      const genInfo = Rabbanim.GENERACIONES[r.gen] || {};
      const centroLabel = r.centro === 'EI' ? 'Eretz Israel' : 'Babel';
      return `
        <div class="rabbi-card" style="border-left-color:${genInfo.color || '#888'}">
          <div class="rabbi-header">
            <div class="rabbi-he" dir="rtl">${r.he}</div>
            <span class="rabbi-count">${r.count}×</span>
          </div>
          <div class="rabbi-nombre">${r.nombre_es}</div>
          <div class="rabbi-meta">
            <span class="rabbi-gen" style="color:${genInfo.color}">${genInfo.nombre || r.gen}</span> ·
            <span>${centroLabel}</span> ·
            <span>${r.tipo === 'tana' ? 'Tana' : 'Amorá'}</span>
          </div>
          <div class="rabbi-info">${r.info}</div>
        </div>
      `;
    }).join('');
    const stats = Rabbanim.estadisticas(rabbanim);

    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Sabios mencionados (${rabbanim.length} distintos · ${stats.totalTanaim + stats.totalAmoraim} menciones)</summary>
        <div class="section-body">
          <p class="section-lead">Detección automática de rabbanim citados por nombre, con su generación, centro de actividad y rol.</p>
          <div class="rabbanim-stats">
            <div class="stat-pill"><span class="stat-pill-num">${stats.totalTanaim}</span><span class="stat-pill-label">menciones de tanaim</span></div>
            <div class="stat-pill"><span class="stat-pill-num">${stats.totalAmoraim}</span><span class="stat-pill-label">menciones de amoraim</span></div>
            <div class="stat-pill"><span class="stat-pill-num">${stats.porCentro.EI || 0}</span><span class="stat-pill-label">de Eretz Israel</span></div>
            <div class="stat-pill"><span class="stat-pill-num">${stats.porCentro.BB || 0}</span><span class="stat-pill-label">de Babel</span></div>
          </div>
          <div class="rabbanim-grid">${cards}</div>
        </div>
      </details>
    `;
  }

  function renderDisputas(disputas) {
    if (!disputas || disputas.length === 0) return '';
    const cards = DetectorDisputas.renderHTML(disputas);
    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Disputas detectadas (${disputas.length})</summary>
        <div class="section-body">
          <p class="section-lead">Disputas (machloket) extraídas por patrones formulaicos del Talmud: "X אומר ... Y אומר".</p>
          <div class="disputas-list">${cards}</div>
        </div>
      </details>
    `;
  }

  function renderPesukim(pesukim) {
    if (!pesukim || pesukim.length === 0) return '';
    const cards = pesukim.slice(0, 30).map(p => `
      <a href="https://www.sefaria.org/${encodeURIComponent(p.sourceRef)}" target="_blank" rel="noopener" class="pasuk-card">
        <div class="pasuk-ref">${p.sourceRef}</div>
        <div class="pasuk-meta">${p.category} · ${p.index_title}</div>
      </a>
    `).join('');
    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Pesukim citados (${pesukim.length})</summary>
        <div class="section-body">
          <p class="section-lead">Versos bíblicos referenciados, según el mapeo de Sefaria.</p>
          <div class="pesukim-grid">${cards}</div>
          ${pesukim.length > 30 ? `<p class="more-note">+${pesukim.length - 30} pesukim más</p>` : ''}
        </div>
      </details>
    `;
  }

  function renderComentarios(comentariosMap) {
    const entries = Object.entries(comentariosMap).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) return '';
    const max = entries[0][1];
    const total = entries.reduce((a, [_, n]) => a + n, 0);
    const barras = entries.slice(0, 12).map(([nombre, n]) => `
      <div class="bar-item">
        <div class="bar-label">${nombre}</div>
        <div class="bar-track">
          <div class="bar-fill" style="width:${(n/max*100).toFixed(1)}%">
            <span class="bar-num">${n}</span>
          </div>
        </div>
      </div>
    `).join('');
    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Distribución de comentarios (${total} partes en ${entries.length} obras)</summary>
        <div class="section-body">
          <p class="section-lead">Cantidad de segmentos por comentario clásico sobre este daf.</p>
          <div class="bars-list">${barras}</div>
        </div>
      </details>
    `;
  }

  function renderParalelos(paralelos) {
    if (!paralelos || paralelos.length === 0) return '';
    const cards = paralelos.slice(0, 20).map(p => {
      const m = p.sourceRef.match(/^(.+?)\s+(\d+[ab])/);
      const esBavli = m && MASEJTOT_BAVLI.has(m[1]);
      const href = esBavli
        ? `daf.html?ref=${encodeURIComponent(`${m[1]}.${m[2]}`)}`
        : `https://www.sefaria.org/${encodeURIComponent(p.sourceRef)}`;
      const target = esBavli ? '' : 'target="_blank" rel="noopener"';
      return `
        <a href="${href}" ${target} class="paralelo-card">
          <div class="paralelo-ref">${p.sourceRef}</div>
          <div class="paralelo-meta">${p.index_title}${esBavli ? ' · click para abrir' : ' · Sefaria'}</div>
        </a>
      `;
    }).join('');
    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Paralelos talmúdicos (${paralelos.length})</summary>
        <div class="section-body">
          <p class="section-lead">Lugares del Talmud donde aparece material relacionado.</p>
          <div class="paralelos-list">${cards}</div>
          ${paralelos.length > 20 ? `<p class="more-note">+${paralelos.length - 20} paralelos más</p>` : ''}
        </div>
      </details>
    `;
  }

  function renderOtros(linksCat) {
    const totalOtros = linksCat.mishna.length + linksCat.halaja.length + linksCat.midrash.length;
    if (totalOtros === 0) return '';
    const grupos = [];
    if (linksCat.mishna.length > 0)  grupos.push(grupoChips('Mishnayot', linksCat.mishna));
    if (linksCat.halaja.length > 0)  grupos.push(grupoChips('Halajá (códigos)', linksCat.halaja));
    if (linksCat.midrash.length > 0) grupos.push(grupoChips('Midrash', linksCat.midrash));
    return `
      <details class="analisis-section">
        <summary><span class="chev">▸</span> Otras conexiones (${totalOtros})</summary>
        <div class="section-body">${grupos.join('')}</div>
      </details>
    `;
  }

  function grupoChips(titulo, items) {
    return `
      <div class="otros-group">
        <h4>${titulo} (${items.length})</h4>
        <div class="chips-list">
          ${items.slice(0, 15).map(l => `
            <a href="https://www.sefaria.org/${encodeURIComponent(l.sourceRef)}" target="_blank" rel="noopener" class="mini-chip">${l.sourceRef}</a>
          `).join('')}
        </div>
      </div>
    `;
  }

  async function generar(ref, textoCompleto) {
    const contenedor = document.getElementById('analisis-frame');
    if (!contenedor) return;
    contenedor.innerHTML = '<div class="loading">Analizando estructura del daf...</div>';

    try {
      const links = await SefariaClient.links(ref);

      const detecciones = TalmudTerminology.detectarEnTexto(textoCompleto);
      const terminologia = {
        detecciones,
        grupos: TalmudTerminology.agruparPorTipo(detecciones),
        estadisticas: TalmudTerminology.estadisticasGenerales(detecciones)
      };

      const rabbanim = Rabbanim.detectarEnTexto(textoCompleto);
      const disputas = DetectorDisputas.detectar(textoCompleto);

      render(contenedor, { ref, textoCompleto, links, terminologia, rabbanim, disputas });
    } catch (err) {
      console.error('Error en análisis:', err);
      contenedor.innerHTML = `<div class="error-box">No se pudo generar el análisis: ${err.message}</div>`;
    }
  }

  return { generar };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnalisisDaf;
}
