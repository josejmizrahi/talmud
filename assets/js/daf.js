/* ============================================================================
   daf.js — Carga el contenido de cualquier daf desde Sefaria
   Lee el ref desde ?ref= en la URL, ej: daf.html?ref=Berakhot.2a
   ============================================================================ */

const Daf = (function() {

  // Diccionario de masejtot inglés → hebreo (para el header)
  const NOMBRE_HE = {
    'Berakhot': 'ברכות', 'Shabbat': 'שבת', 'Eruvin': 'עירובין',
    'Pesachim': 'פסחים', 'Shekalim': 'שקלים', 'Yoma': 'יומא',
    'Sukkah': 'סוכה', 'Beitzah': 'ביצה', 'Rosh Hashanah': 'ראש השנה',
    'Taanit': 'תענית', 'Megillah': 'מגילה', 'Moed Katan': 'מועד קטן',
    'Chagigah': 'חגיגה', 'Yevamot': 'יבמות', 'Ketubot': 'כתובות',
    'Nedarim': 'נדרים', 'Nazir': 'נזיר', 'Sotah': 'סוטה',
    'Gittin': 'גיטין', 'Kiddushin': 'קידושין', 'Bava Kamma': 'בבא קמא',
    'Bava Metzia': 'בבא מציעא', 'Bava Batra': 'בבא בתרא',
    'Sanhedrin': 'סנהדרין', 'Makkot': 'מכות', 'Shevuot': 'שבועות',
    'Avodah Zarah': 'עבודה זרה', 'Horayot': 'הוריות', 'Zevachim': 'זבחים',
    'Menachot': 'מנחות', 'Chullin': 'חולין', 'Bekhorot': 'בכורות',
    'Arakhin': 'ערכין', 'Temurah': 'תמורה', 'Keritot': 'כריתות',
    'Meilah': 'מעילה', 'Tamid': 'תמיד', 'Niddah': 'נדה'
  };

  // Parsea un ref tipo "Berakhot.2a" → { masejet: 'Berakhot', amud: '2a' }
  function parsearRef(ref) {
    const m = ref.match(/^(.+?)\.(\d+[ab])$/);
    if (!m) return null;
    return { masejet: m[1], amud: m[2], ref: ref };
  }

  // Anterior/siguiente amud
  function anteriorAmud(ref) {
    const p = parsearRef(ref);
    if (!p) return null;
    const num = parseInt(p.amud);
    const letra = p.amud.endsWith('a') ? 'a' : 'b';
    if (num === 2 && letra === 'a') return null; // 2a es el primer daf
    if (letra === 'b') return `${p.masejet}.${num}a`;
    return `${p.masejet}.${num - 1}b`;
  }

  function siguienteAmud(ref) {
    const p = parsearRef(ref);
    if (!p) return null;
    const num = parseInt(p.amud);
    const letra = p.amud.endsWith('a') ? 'a' : 'b';
    if (letra === 'a') return `${p.masejet}.${num}b`;
    return `${p.masejet}.${num + 1}a`;
  }

  // Marca/desmarca daf como estudiado
  function tooglEstudiado(ref) {
    const KEY = 'codex-estudiados';
    const estudiados = JSON.parse(localStorage.getItem(KEY) || '[]');
    const idx = estudiados.indexOf(ref);
    if (idx >= 0) estudiados.splice(idx, 1);
    else {
      estudiados.push(ref);
      // Fecha de estudio en otro objeto
      const fechas = JSON.parse(localStorage.getItem('codex-fechas') || '{}');
      fechas[ref] = new Date().toISOString();
      localStorage.setItem('codex-fechas', JSON.stringify(fechas));
    }
    localStorage.setItem(KEY, JSON.stringify(estudiados));
    return idx < 0;
  }

  function estaEstudiado(ref) {
    const estudiados = JSON.parse(localStorage.getItem('codex-estudiados') || '[]');
    return estudiados.includes(ref);
  }

  /* ----- Renderizado del header ----- */

  function renderHeader(ref) {
    const p = parsearRef(ref);
    if (!p) return;

    const masejetHe = NOMBRE_HE[p.masejet] || p.masejet;
    document.querySelector('.folio-header .meta:first-child').innerHTML =
      `Masejet ${p.masejet}`;
    document.querySelector('.folio-header h1').textContent =
      p.amud.replace('a', '.').replace('b', ':');
    document.querySelector('.folio-header .subtitle').textContent =
      `${masejetHe} · ${p.amud}`;
    document.querySelector('.folio-header .meta:last-child').innerHTML =
      `<a href="vistas/masejet.html?ref=${p.masejet}" style="color: var(--sepia); text-decoration: none;">← Ver masejet</a>`;

    document.title = `${p.masejet} ${p.amud} · Codex Talmudicus`;
  }

  /* ----- Renderizado del texto ----- */

  function limpiarHTML(html) {
    if (!html) return '';
    // Sefaria envuelve algunas cosas en <small>, <sup>, etc - los conservamos
    // Pero limpiamos <span class="footnote"> que rompen el flujo
    return html.replace(/<sup[^>]*class="footnote-marker"[^>]*>.*?<\/sup>/gi, '')
               .replace(/<i[^>]*class="footnote"[^>]*>.*?<\/i>/gi, '');
  }

  async function cargarTexto(ref) {
    const cont = document.getElementById('texto-daf');
    cont.innerHTML = '<div class="loading">Cargando texto desde Sefaria...</div>';

    try {
      const data = await SefariaClient.texto(ref);
      const versiones = data.versions || [];
      const versionHe = versiones.find(v =>
        v.language === 'he' || v.actualLanguage === 'he' ||
        v.direction === 'rtl' || /hebrew/i.test(v.versionTitle || '')
      );
      const versionEn = versiones.find(v =>
        v.language === 'en' || v.actualLanguage === 'en' ||
        (v.direction === 'ltr' && /english/i.test(v.versionTitle || ''))
      );

      const segHe = Array.isArray(versionHe?.text) ? versionHe.text : [];
      const segEn = Array.isArray(versionEn?.text) ? versionEn.text : [];

      cont.innerHTML = '';

      if (segHe.length === 0) {
        cont.innerHTML = '<div class="error-box">No hay texto disponible para este ref.</div>';
        return;
      }

      // Detectar dónde acaba la mishná y empieza la gemara
      // Heurística: si el primer segmento tiene "GEMARA" o "גמ׳" empieza con gemara
      // En Berajot 2a la mishná y gemara están juntas
      segHe.forEach((he, i) => {
        const seg = document.createElement('article');
        // Detectar si este segmento es mishná o gemara — heurística simple
        const esMishna = i === 0 && (he.includes('משנה') || segHe.length > 6);
        seg.className = 'segment ' + (esMishna ? 'mishna' : 'gemara');
        seg.innerHTML = `
          <div class="segment-meta">
            <span>${esMishna ? 'משנה — Mishná' : 'גמרא — Guemará'}</span>
            <span class="ref">${ref}:${i + 1}</span>
          </div>
          <div class="he">${limpiarHTML(he)}</div>
          ${segEn[i] ? `<div class="en">${limpiarHTML(segEn[i])}</div>` : ''}
        `;
        cont.appendChild(seg);
      });

      ponerStatus(`Texto cargado · ${segHe.length} segmentos`, 'ok');
    } catch (err) {
      console.error(err);
      cont.innerHTML = `<div class="error-box">No se pudo cargar el texto: ${err.message}</div>`;
      ponerStatus('Error al cargar texto', 'error');
    }
  }

  /* ----- Topics ----- */

  async function cargarTopics(ref) {
    const cont = document.getElementById('topics-list');
    try {
      const topics = await SefariaClient.topicsDeRef(ref);
      cont.innerHTML = '';
      if (!topics || topics.length === 0) {
        cont.innerHTML = '<div class="empty-state">Sefaria no tiene topics indexados para este daf todavía.</div>';
        return;
      }
      topics.sort((a, b) => (b.order?.pr || 0) - (a.order?.pr || 0));
      topics.slice(0, 15).forEach(t => {
        const a = document.createElement('a');
        a.className = 'chip';
        a.href = `https://www.sefaria.org/topics/${t.topic}`;
        a.target = '_blank';
        a.rel = 'noopener';
        const titulo = (t.title?.he || t.title?.en || t.topic);
        a.textContent = titulo;
        if (/[\u0590-\u05FF]/.test(titulo)) a.classList.add('he');
        if (t.description?.en) a.title = t.description.en;
        cont.appendChild(a);
      });
    } catch (err) {
      console.error(err);
      cont.innerHTML = '<div class="empty-state">No se pudieron cargar los topics.</div>';
    }
  }

  /* ----- Comentarios: Rashi y Tosafot (prioridad) + el resto ----- */

  async function cargarComentarios(ref) {
    const cont = document.getElementById('comentarios-list');
    try {
      const links = await SefariaClient.links(ref);
      cont.innerHTML = '';

      if (!Array.isArray(links) || links.length === 0) {
        cont.innerHTML = '<div class="empty-state">Sin links indexados.</div>';
        return;
      }

      // Filtrar solo categoría Commentary
      const comentarios = links.filter(l => l.category === 'Commentary');

      // Agrupar por collectiveTitle (= nombre del comentarista)
      const porComentarista = {};
      comentarios.forEach(l => {
        const nombre = l.collectiveTitle?.en || l.index_title;
        if (!porComentarista[nombre]) porComentarista[nombre] = [];
        porComentarista[nombre].push(l);
      });

      // Orden prioritario: Rashi, Tosafot, después el resto alfabético
      const prioridad = ['Rashi', 'Tosafot', 'Rashbam', 'Ritva', 'Rashba', 'Ramban', 'Meiri', 'Maharsha'];
      const nombres = Object.keys(porComentarista).sort((a, b) => {
        const ia = prioridad.indexOf(a);
        const ib = prioridad.indexOf(b);
        if (ia >= 0 && ib >= 0) return ia - ib;
        if (ia >= 0) return -1;
        if (ib >= 0) return 1;
        return a.localeCompare(b);
      });

      if (nombres.length === 0) {
        cont.innerHTML = '<div class="empty-state">No hay comentarios indexados.</div>';
        return;
      }

      nombres.forEach(nombre => {
        const items = porComentarista[nombre];
        const heNombre = items[0]?.collectiveTitle?.he || '';
        const detalles = document.createElement('details');
        detalles.className = 'commentary-item';
        detalles.innerHTML = `
          <summary>
            <span><strong>${nombre}</strong> ${heNombre ? `<span style="color: var(--sepia); font-size: 0.9rem;">— ${heNombre}</span>` : ''}</span>
            <span class="ref-tag">${items.length} ${items.length === 1 ? 'parte' : 'partes'}</span>
          </summary>
          <div class="content" data-loaded="false" data-ref="${items[0].sourceRef}">
            <em style="color: var(--sepia);">Click para cargar el texto...</em>
          </div>
        `;
        // Lazy-load: solo cargar el comentario cuando se expanda
        detalles.addEventListener('toggle', async function() {
          if (!detalles.open) return;
          const content = detalles.querySelector('.content');
          if (content.dataset.loaded === 'true') return;
          await cargarTextoComentario(content, items);
        });
        cont.appendChild(detalles);
      });
    } catch (err) {
      console.error(err);
      cont.innerHTML = '<div class="empty-state">No se pudieron cargar los comentarios.</div>';
    }
  }

  async function cargarTextoComentario(contenedor, items) {
    contenedor.innerHTML = '<div class="loading">Cargando...</div>';
    try {
      // Pedir el texto de todos los segmentos del comentario sobre este daf
      // Tomamos el ref base del primer item y truncamos al título del comentario
      const refBase = items[0].sourceRef.replace(/:\d+$/, ''); // ej: "Rashi on Berakhot 2a"
      const data = await SefariaClient.texto(refBase);
      const versiones = data.versions || [];
      const versionHe = versiones.find(v =>
        v.language === 'he' || v.actualLanguage === 'he' || v.direction === 'rtl'
      );
      const versionEn = versiones.find(v =>
        v.language === 'en' || v.actualLanguage === 'en'
      );

      const segHe = Array.isArray(versionHe?.text) ?
        versionHe.text : (versionHe?.text ? [versionHe.text] : []);
      const segEn = Array.isArray(versionEn?.text) ?
        versionEn.text : (versionEn?.text ? [versionEn.text] : []);

      contenedor.innerHTML = '';
      if (segHe.length === 0 && segEn.length === 0) {
        contenedor.innerHTML = '<em style="color: var(--sepia);">Sefaria no tiene texto para este comentario.</em>';
        contenedor.dataset.loaded = 'true';
        return;
      }

      const maxItems = Math.max(segHe.length, segEn.length);
      let html = '';
      for (let i = 0; i < maxItems; i++) {
        if (segHe[i] || segEn[i]) {
          html += `<div style="margin-bottom: 0.75rem; padding-bottom: 0.75rem; ${i < maxItems - 1 ? 'border-bottom: 1px dotted var(--pergamino-sombra);' : ''}">`;
          if (segHe[i]) html += `<div>${limpiarHTML(segHe[i])}</div>`;
          if (segEn[i]) html += `<div class="en">${limpiarHTML(segEn[i])}</div>`;
          html += `</div>`;
        }
      }
      contenedor.innerHTML = html;
      contenedor.dataset.loaded = 'true';
    } catch (err) {
      console.error(err);
      contenedor.innerHTML = `<em style="color: var(--rojo);">Error: ${err.message}</em>`;
    }
  }

  /* ----- Paralelos en el Talmud ----- */

  async function cargarParalelos(ref) {
    const cont = document.getElementById('paralelos-list');
    try {
      const links = await SefariaClient.links(ref);
      if (!Array.isArray(links)) {
        cont.innerHTML = '<div class="empty-state">No hay paralelos disponibles.</div>';
        return;
      }
      const paralelos = links.filter(l => l.category === 'Talmud' && l.sourceRef !== ref);

      if (paralelos.length === 0) {
        cont.innerHTML = '<div class="empty-state">Sefaria no tiene paralelos talmúdicos indexados.</div>';
        return;
      }

      // Deduplicar por sourceRef
      const unicos = [...new Map(paralelos.map(p => [p.sourceRef, p])).values()];

      cont.innerHTML = '<ul style="list-style: none; font-size: 0.95rem;">';
      unicos.slice(0, 12).forEach(p => {
        // Detectar si ese ref también está en nuestro Shas para enlazar internamente
        const m = p.sourceRef.match(/^(.+?)\s+(\d+[ab])/);
        let href;
        if (m) {
          const internalRef = `${m[1]}.${m[2]}`;
          href = `../daf.html?ref=${encodeURIComponent(internalRef)}`;
        } else {
          href = `https://www.sefaria.org/${encodeURIComponent(p.sourceRef)}`;
        }
        cont.querySelector('ul').insertAdjacentHTML('beforeend',
          `<li style="padding: 4px 0; border-bottom: 1px dotted var(--pergamino-sombra);">
            <a href="${href}" style="color: var(--tinta); text-decoration: none; display: flex; justify-content: space-between; gap: 0.75rem;">
              <span>${p.collectiveTitle?.en || p.index_title}</span>
              <span style="color: var(--sepia); font-family: var(--font-mono); font-size: 0.75rem;">${p.sourceRef.replace(p.index_title + ' ', '')}</span>
            </a>
          </li>`
        );
      });
      cont.querySelector('ul').insertAdjacentHTML('beforeend', `</ul>`);
    } catch (err) {
      console.error(err);
      cont.innerHTML = '<div class="empty-state">Error al cargar paralelos.</div>';
    }
  }

  /* ----- Diagrama personalizado (si existe) -----
     Busca dos tipos de diagrama en este orden:
       1. diagramas/{slug}.html  → diagrama interactivo (con scripts)
       2. diagramas/{slug}.svg   → diagrama estático
     Si ninguno existe, muestra un placeholder discreto.
  */

  async function cargarDiagrama(ref) {
    const cont = document.getElementById('diagrama-frame');
    const slug = ref.toLowerCase().replace(/\./g, '-').replace(/\s+/g, '-');

    // 1. Intentar HTML interactivo primero
    try {
      const respHtml = await fetch(`diagramas/${slug}.html`);
      if (respHtml.ok) {
        const htmlText = await respHtml.text();
        cont.innerHTML = `<div class="diagram-frame interactivo">${htmlText}<div class="caption">Diagrama interactivo · click en cualquier elemento</div></div>`;
        // Ejecutar scripts manualmente (innerHTML no los ejecuta automáticamente)
        ejecutarScripts(cont);
        return;
      }
    } catch (e) { /* sigue al fallback */ }

    // 2. Fallback a SVG estático
    try {
      const respSvg = await fetch(`diagramas/${slug}.svg`);
      if (respSvg.ok) {
        const svgText = await respSvg.text();
        cont.innerHTML = `<div class="diagram-frame">${svgText}<div class="caption">Diagrama del daf</div></div>`;
        return;
      }
    } catch (e) { /* sigue al placeholder */ }

    // 3. Placeholder discreto si no hay ninguno
    cont.innerHTML = `<div class="diagram-empty">
      ✦ Aún no hay diagrama visual para este daf.<br>
      Pídelo a Claude y guárdalo como <code>diagramas/${slug}.html</code> (interactivo) o <code>diagramas/${slug}.svg</code> (estático).
    </div>`;
  }

  /* Ejecuta los <script> embebidos en un fragmento HTML cargado con innerHTML.
     innerHTML no ejecuta scripts por seguridad; los re-creamos y reemplazamos. */
  function ejecutarScripts(contenedor) {
    const scripts = contenedor.querySelectorAll('script');
    scripts.forEach(viejo => {
      const nuevo = document.createElement('script');
      // Copiar atributos (src, type, etc.)
      Array.from(viejo.attributes).forEach(attr => nuevo.setAttribute(attr.name, attr.value));
      nuevo.textContent = viejo.textContent;
      viejo.parentNode.replaceChild(nuevo, viejo);
    });
  }

  /* ----- Notas personales ----- */

  function inicializarNotas(ref) {
    const KEY = `codex-notes:${ref}`;
    const textarea = document.getElementById('notes-input');
    const saved = document.getElementById('notes-saved');

    textarea.value = localStorage.getItem(KEY) || '';

    let timer;
    textarea.addEventListener('input', () => {
      localStorage.setItem(KEY, textarea.value);
      saved.classList.add('show');
      clearTimeout(timer);
      timer = setTimeout(() => saved.classList.remove('show'), 1200);
    });
  }

  /* ----- Navegación ----- */

  function inicializarNav(ref) {
    const anterior = anteriorAmud(ref);
    const siguiente = siguienteAmud(ref);

    const elAnt = document.getElementById('nav-anterior');
    const elSig = document.getElementById('nav-siguiente');

    if (anterior) elAnt.innerHTML = `← ${anterior.replace(/^.*?\./, '')}`;
    else elAnt.style.visibility = 'hidden';

    if (anterior) elAnt.href = `daf.html?ref=${encodeURIComponent(anterior)}`;
    if (siguiente) elSig.href = `daf.html?ref=${encodeURIComponent(siguiente)}`;
    if (siguiente) elSig.innerHTML = `${siguiente.replace(/^.*?\./, '')} →`;

    // Botón "marcar estudiado"
    const btn = document.getElementById('mark-done');
    function actualizarBoton() {
      if (estaEstudiado(ref)) {
        btn.textContent = '✦ Estudiado';
        btn.classList.add('activo');
      } else {
        btn.textContent = 'Marcar estudiado';
        btn.classList.remove('activo');
      }
    }
    actualizarBoton();
    btn.addEventListener('click', () => {
      tooglEstudiado(ref);
      actualizarBoton();
    });
  }

  /* ----- Status ----- */

  function ponerStatus(msg, tipo) {
    const txt = document.getElementById('status-text');
    const dot = document.getElementById('status-dot');
    if (txt) txt.textContent = msg;
    if (dot) dot.className = 'status-dot ' + (tipo || '');
  }

  /* ----- Init ----- */

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || 'Berakhot.2a';

    const parsed = parsearRef(ref);
    if (!parsed) {
      document.querySelector('main').innerHTML = `<div class="error-box">Ref inválido: ${ref}</div>`;
      return;
    }

    renderHeader(ref);
    inicializarNav(ref);
    inicializarNotas(ref);

    ponerStatus('Conectando con Sefaria...');

    // Cargar todo en paralelo
    cargarTexto(ref);
    cargarTopics(ref);
    cargarComentarios(ref);
    cargarParalelos(ref);
    cargarDiagrama(ref);
  }

  return {
    init,
    anteriorAmud,
    siguienteAmud,
    parsearRef,
    estaEstudiado,
    NOMBRE_HE
  };
})();

document.addEventListener('DOMContentLoaded', Daf.init);
