/* ============================================================================
   detector-disputas.js — Detección automática de מחלוקות (disputas)
   ============================================================================
   El Talmud sigue patrones formulaicos cuando registra disputas:

     • Patrón A:  "X אומר ... וחכמים אומרים ..."
     • Patrón B:  "X אומר ... Y אומר ..."
     • Patrón C:  "תניא X אומר ... Y אומר ..."
     • Patrón D:  "אמר ר X ... אמר ר Y ..."

   Cuando detectamos estos patrones, podemos extraer las posiciones
   y generar una tabla comparativa automática.
   ============================================================================ */

const DetectorDisputas = (function() {

  /* ----- Patrones de disputa ----- */
  const PATRONES_DISPUTA = [
    // Patrón A: "X אומר ... וחכמים אומרים ..."
    {
      regex: /(?:רבי\s+\S+|רבן\s+\S+(?:\s+בן\s+\S+)?|רב\s+\S+|בית\s+שמאי|בית\s+הלל)\s+(?:אומר|אמר)([^.]*?)\s*(?:וחכמים|חכמים)\s+(?:אומרים|אמרו)([^.]*)/g,
      tipo: 'tana-vs-jajamim',
      descripcion: 'Tana individual contra Jajamim (consenso)'
    },
    // Patrón B genérico de dos posiciones en yuxtaposición
    {
      regex: /(רבי\s+\S+|רב\s+\S+|רבן\s+\S+(?:\s+בן\s+\S+)?)\s+(?:אומר|אמר)([^.]*?)\s+(?:ו)?(רבי\s+\S+|רב\s+\S+|רבן\s+\S+(?:\s+בן\s+\S+)?)\s+(?:אומר|אמר)([^.]*)/g,
      tipo: 'tana-vs-tana',
      descripcion: 'Disputa entre dos autoridades'
    },
    // Beit Shamai vs Beit Hilel
    {
      regex: /בית\s+שמאי\s+(?:אומרים|אומר)([^.]*?)\s*(?:ו?בית\s+הלל)\s+(?:אומרים|אומר)([^.]*)/g,
      tipo: 'shamai-vs-hilel',
      descripcion: 'Beit Shamai contra Beit Hilel'
    }
  ];

  /* ----- Función principal ----- */
  function detectar(textoHebreo) {
    if (!textoHebreo) return [];
    const disputas = [];

    PATRONES_DISPUTA.forEach(p => {
      const regex = new RegExp(p.regex.source, p.regex.flags);
      let match;
      while ((match = regex.exec(textoHebreo)) !== null) {
        // Determinar formato según número de grupos capturados
        const grupos = match.slice(1).filter(g => g !== undefined);

        if (p.tipo === 'tana-vs-jajamim' && grupos.length >= 2) {
          const tanaNombre = (match[0].match(/^(\S+(?:\s+\S+)?(?:\s+בן\s+\S+)?)/) || [])[1] || 'Tana';
          disputas.push({
            tipo: p.tipo,
            descripcion: p.descripcion,
            partes: [
              { nombre: tanaNombre, posicion: limpiar(grupos[0]) },
              { nombre: 'חכמים (Jajamim)', posicion: limpiar(grupos[1]) }
            ]
          });
        } else if (p.tipo === 'tana-vs-tana' && grupos.length >= 4) {
          disputas.push({
            tipo: p.tipo,
            descripcion: p.descripcion,
            partes: [
              { nombre: grupos[0], posicion: limpiar(grupos[1]) },
              { nombre: grupos[2], posicion: limpiar(grupos[3]) }
            ]
          });
        } else if (p.tipo === 'shamai-vs-hilel' && grupos.length >= 2) {
          disputas.push({
            tipo: p.tipo,
            descripcion: p.descripcion,
            partes: [
              { nombre: 'בית שמאי', posicion: limpiar(grupos[0]) },
              { nombre: 'בית הלל',  posicion: limpiar(grupos[1]) }
            ]
          });
        }
      }
    });

    // Deduplicar por contenido similar
    return deduplicar(disputas);
  }

  function limpiar(texto) {
    if (!texto) return '';
    return texto.trim()
      .replace(/^[\s,\.;:]+|[\s,\.;:]+$/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 200); // truncar si es muy larga
  }

  function deduplicar(disputas) {
    const vistas = new Set();
    return disputas.filter(d => {
      const key = d.partes.map(p => p.posicion.slice(0, 50)).join('|');
      if (vistas.has(key)) return false;
      vistas.add(key);
      return true;
    });
  }

  /* ----- Render HTML de las disputas como tablas comparativas ----- */
  function renderHTML(disputas) {
    if (!disputas || disputas.length === 0) return '';

    return disputas.map((d, i) => {
      const filas = d.partes.map(parte => `
        <tr>
          <td class="disputa-nombre">${parte.nombre}</td>
          <td class="disputa-posicion" dir="rtl">${parte.posicion}</td>
        </tr>
      `).join('');

      return `
        <div class="disputa-card">
          <div class="disputa-header">
            <span class="disputa-num">${i + 1}</span>
            <span class="disputa-tipo">${d.descripcion}</span>
          </div>
          <table class="disputa-tabla">
            <thead>
              <tr><th>Autoridad</th><th>Posición</th></tr>
            </thead>
            <tbody>${filas}</tbody>
          </table>
        </div>
      `;
    }).join('');
  }

  return { detectar, renderHTML };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DetectorDisputas;
}
