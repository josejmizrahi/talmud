/* ============================================================================
   Vista Daf · motor genérico
   Lee data/vista-daf/{slug}.json y renderiza la sugyá completa con:
     - texto del daf línea a línea (hebreo + glosa española)
     - overlays clickeables sobre las unidades analíticas
     - panel jevruta con diálogo de voces
     - controles de modo (texto / análisis / jevruta) y navegación entre dapim
   El motor no sabe nada del contenido. Para añadir un daf nuevo basta con
   crear data/vista-daf/{slug}.json siguiendo el schema de README.md.
   ============================================================================ */

const VOCES = {
  'stam':         { etiqueta: 'stam haShas',     color: '#6b4423', sigilo: '⊙', lado: 'izq' },
  'tana':         { etiqueta: 'tana',             color: '#b8860b', sigilo: 'מ', lado: 'der' },
  'r-eliezer':    { etiqueta: 'R. Eliezer',      color: '#1e3a5f', sigilo: 'א', lado: 'der' },
  'r-gamliel':    { etiqueta: 'Rabán Gamliel',   color: '#1e3a5f', sigilo: 'ג', lado: 'der' },
  'r-yehoshua':   { etiqueta: 'R. Yehoshua',     color: '#1e3a5f', sigilo: 'י', lado: 'der' },
  'r-meir':       { etiqueta: 'R. Meir',          color: '#1e3a5f', sigilo: 'מ', lado: 'der' },
  'r-yehuda':     { etiqueta: 'R. Yehuda',       color: '#1e3a5f', sigilo: 'י', lado: 'der' },
  'r-yose':       { etiqueta: 'R. Yose',          color: '#1e3a5f', sigilo: 'י', lado: 'der' },
  'r-chanina':    { etiqueta: 'R. Janina',       color: '#1e3a5f', sigilo: 'ח', lado: 'der' },
  'r-akiva':      { etiqueta: 'R. Akiva',         color: '#1e3a5f', sigilo: 'ע', lado: 'der' },
  'chachamim':    { etiqueta: 'Jajamim',          color: '#5a3a8a', sigilo: 'ח', lado: 'der' },
  'rav':          { etiqueta: 'Rav',              color: '#1e6b5a', sigilo: 'ר', lado: 'der' },
  'shmuel':       { etiqueta: 'Shmuel',           color: '#1e6b5a', sigilo: 'ש', lado: 'der' },
  'rabbah-sheila':{ etiqueta: 'Rabbá b. Sheila', color: '#1e6b5a', sigilo: 'ר', lado: 'der' },
  'r-natan':      { etiqueta: 'R. Natán',         color: '#1e3a5f', sigilo: 'נ', lado: 'der' },
  'rav-oshaya':   { etiqueta: 'Rav Oshaya',       color: '#1e6b5a', sigilo: 'ר', lado: 'der' },
  'r-zeira':      { etiqueta: 'R. Zeira',         color: '#1e6b5a', sigilo: 'ז', lado: 'der' },
  'rav-ashi':     { etiqueta: 'Rav Ashi',         color: '#1e6b5a', sigilo: 'א', lado: 'der' },
  'rava':         { etiqueta: 'Ravá',             color: '#1e6b5a', sigilo: 'ר', lado: 'der' },
  'rav-aja':      { etiqueta: 'Rav Aja b. Bizna', color: '#1e6b5a', sigilo: 'א', lado: 'der' },
  'mar':          { etiqueta: 'amar mar',         color: '#8b6635', sigilo: '⋯', lado: 'izq' },
  'chavruta':     { etiqueta: 'jevruta',          color: '#8b1a1a', sigilo: '✦', lado: 'centro' },
  'eliyahu':      { etiqueta: 'Eliyahu',          color: '#b8860b', sigilo: 'א', lado: 'der' }
};

const TIPOS = {
  'mishna':     { etiqueta: 'mishná' },
  'memra':      { etiqueta: 'memrá' },
  'kushya':     { etiqueta: 'kushyá' },
  'havayya':    { etiqueta: 'havayya' },
  'teruts':     { etiqueta: 'teruts' },
  'baraita':    { etiqueta: 'baraita' },
  'nafka-mina': { etiqueta: 'nafka mina' },
  'maase':      { etiqueta: 'maasé' }
};

/* ----- carga de datos ----- */

function refToSlug(ref) {
  // "Berakhot 2a" → "berakhot-2a"
  return ref.toLowerCase().replace(/\./g, ' ').replace(/\s+/g, '-').replace(/^-+|-+$/g, '');
}

async function cargarDaf(ref) {
  const slug = refToSlug(ref);
  const resp = await fetch(`data/vista-daf/${slug}.json`);
  if (!resp.ok) throw new Error(`No existe data/vista-daf/${slug}.json (${resp.status})`);
  return resp.json();
}

/* ----- renderizado ----- */

let SPEC = null;
let UNIDAD_ACTIVA = null;

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function envolverEnOverlay(textoHebreo, anotaciones, spec) {
  // Para cada anotación, busca su match dentro del texto y lo envuelve con
  // <span class="overlay" data-id="X" data-tipo="Y">. Si no hay match,
  // envuelve la línea entera. Soporta múltiples overlays anidados en la
  // misma línea aplicándolos en orden de aparición.
  if (!anotaciones || anotaciones.length === 0) return escapeHtml(textoHebreo);

  // Mapeamos posiciones de match en el texto original (no escapado).
  const tokens = []; // { start, end, unidad }
  for (const id of anotaciones) {
    const u = spec.unidades.find(x => x.id === id);
    if (!u) continue;
    let start = 0, end = textoHebreo.length;
    if (u.match) {
      const idx = textoHebreo.indexOf(u.match);
      if (idx >= 0) {
        start = idx;
        end = idx + u.match.length;
      }
    }
    tokens.push({ start, end, unidad: u });
  }
  // Construimos array de cortes (puntos donde abre o cierra un overlay).
  // Para mantenerlo simple, no manejamos solapamientos parciales — solo
  // overlays disjuntos o que cubren la línea entera. En caso de solapamiento
  // los más cortos ganan (más específicos).
  tokens.sort((a, b) => (b.end - b.start) - (a.end - a.start)); // larger first
  // Apply largest first so smaller can override — actually we render in
  // bottom-up order. Let's just emit them as ordered ranges.
  // Sort by start
  tokens.sort((a, b) => a.start - b.start);

  // Render por trozos
  let out = '';
  let cursor = 0;
  for (const t of tokens) {
    if (t.start < cursor) continue; // solapamiento — ignoramos el segundo
    if (t.start > cursor) {
      out += escapeHtml(textoHebreo.slice(cursor, t.start));
    }
    const inner = textoHebreo.slice(t.start, t.end);
    const u = t.unidad;
    const tipoLabel = TIPOS[u.tipo] ? TIPOS[u.tipo].etiqueta : u.tipo;
    out += `<span class="overlay" data-id="${escapeHtml(u.id)}" data-tipo="${escapeHtml(u.tipo)}" tabindex="0" role="button" aria-label="${escapeHtml(u.etiqueta || u.titulo)}">${escapeHtml(inner)}<span class="overlay-label">${escapeHtml(tipoLabel)}</span></span>`;
    cursor = t.end;
  }
  if (cursor < textoHebreo.length) {
    out += escapeHtml(textoHebreo.slice(cursor));
  }
  return out;
}

function renderLineas(spec) {
  const cont = document.getElementById('vista-daf-texto');
  cont.innerHTML = spec.lineas.map(L => `
    <div class="linea" data-linea="${L.n}">
      <div class="linea-numero">${L.n}</div>
      ${L.tag ? `<span class="linea-tag">${escapeHtml(L.tag)}</span>` : ''}
      <div class="linea-he" lang="he">${envolverEnOverlay(L.he, L.anota, spec)}</div>
      ${L.es ? `<div class="linea-es">${escapeHtml(L.es)}</div>` : ''}
    </div>
  `).join('');
}

function renderTOC(spec) {
  const cont = document.getElementById('toc-unidades');
  cont.innerHTML = `
    <h4>Índice de unidades · ${spec.unidades.length} movidas</h4>
    <ol>${spec.unidades.map((u, i) => `
      <li data-id="${escapeHtml(u.id)}" data-tipo="${escapeHtml(u.tipo)}">
        <span class="toc-tipo"></span>
        <span><strong>${i + 1}.</strong> ${escapeHtml(u.etiqueta || u.titulo)}</span>
      </li>
    `).join('')}</ol>
  `;
  cont.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => abrirUnidad(li.dataset.id, true));
  });
}

function ladoTurno(voz, override) {
  if (override) return override;
  const v = VOCES[voz];
  return v ? v.lado : 'izq';
}

function renderTurno(t) {
  const v = VOCES[t.voz] || { etiqueta: t.voz, color: '#3d2f23', sigilo: '·', lado: 'izq' };
  const lado = ladoTurno(t.voz, t.lado);
  const etiqueta = t.etiqueta || v.etiqueta;
  return `
    <div class="turno lado-${lado}" style="color: ${v.color}">
      <div class="turno-chip">
        <span class="voz-sigilo" style="background: ${v.color}">${escapeHtml(v.sigilo || '·')}</span>
        <span>${escapeHtml(etiqueta)}</span>
      </div>
      <div class="turno-cuerpo">${escapeHtml(t.texto)}</div>
    </div>
  `;
}

function renderPanel(unidad) {
  const panel = document.getElementById('jevruta-panel');
  if (!unidad) {
    panel.classList.add('vacia');
    panel.innerHTML = `<p class="jevruta-vacio">Selecciona cualquier caja resaltada sobre el texto para abrir el panel jevruta — verás la cita en su contexto, su función dialéctica, y un diálogo de voces que recrea la conversación de la sugyá.</p>`;
    return;
  }
  panel.classList.remove('vacia');
  const tipo = TIPOS[unidad.tipo] || { etiqueta: unidad.tipo };
  const idx = SPEC.unidades.findIndex(u => u.id === unidad.id);
  const prev = idx > 0 ? SPEC.unidades[idx - 1] : null;
  const next = idx < SPEC.unidades.length - 1 ? SPEC.unidades[idx + 1] : null;

  const botonDiagrama = unidad.diagrama ? `
    <button class="jevruta-diagrama-btn" id="jev-ver-diagrama" aria-pressed="false">
      <span class="icono">◈</span>
      <span>${escapeHtml(unidad.diagrama.titulo || 'Ver diagrama relacionado')}</span>
      <span class="flecha">↓</span>
    </button>
  ` : '';

  panel.innerHTML = `
    <div class="jevruta-tag">${escapeHtml(tipo.etiqueta)} · línea${unidad.lineas.length > 1 ? 's' : ''} ${unidad.lineas.join(', ')}</div>
    <h3 class="jevruta-titulo">${escapeHtml(unidad.titulo)}</h3>
    <div class="jevruta-resumen">${escapeHtml(unidad.resumen)}</div>
    <div class="jevruta-dialogo">
      ${(unidad.dialogo || []).map(renderTurno).join('')}
    </div>
    ${botonDiagrama}
    <div class="jevruta-nav">
      <button id="jev-prev" ${!prev ? 'disabled' : ''}>← anterior</button>
      <button id="jev-next" ${!next ? 'disabled' : ''}>siguiente →</button>
    </div>
  `;
  if (prev) document.getElementById('jev-prev').addEventListener('click', () => abrirUnidad(prev.id, true));
  if (next) document.getElementById('jev-next').addEventListener('click', () => abrirUnidad(next.id, true));

  if (unidad.diagrama) {
    const btn = document.getElementById('jev-ver-diagrama');
    btn.addEventListener('click', () => mostrarDiagrama(unidad.diagrama, btn));
    // si el diagrama ya está abierto, actualízalo automáticamente al cambiar de unidad
    if (document.getElementById('diagrama-relacionado').hidden === false) {
      mostrarDiagrama(unidad.diagrama, btn);
    }
  } else {
    // si no hay diagrama para esta unidad, ocultamos el que esté abierto
    ocultarDiagrama();
  }
}

/* ----- diagrama relacionado (embed o auto-gen) ----- */

let DIAGRAMA_SRC_ACTUAL = null;  // cache: si el src no cambió, solo re-trigger highlight

async function mostrarDiagrama(diagrama, btnSrc) {
  const sec = document.getElementById('diagrama-relacionado');
  const titulo = document.getElementById('diagrama-relacionado-titulo');
  const frame = document.getElementById('diagrama-relacionado-frame');
  sec.hidden = false;
  titulo.textContent = diagrama.titulo || 'Diagrama relacionado';
  if (btnSrc) btnSrc.setAttribute('aria-pressed', 'true');

  if (diagrama.src) {
    if (diagrama.src !== DIAGRAMA_SRC_ACTUAL) {
      try {
        const resp = await fetch(diagrama.src);
        if (!resp.ok) throw new Error('no encontrado: ' + diagrama.src);
        const html = await resp.text();
        frame.innerHTML = html;
        ejecutarScripts(frame);
        DIAGRAMA_SRC_ACTUAL = diagrama.src;
      } catch (e) {
        frame.innerHTML = `<p style="color:var(--rojo);font-style:italic;">No se pudo cargar el diagrama (${escapeHtml(e.message)}).</p>`;
        DIAGRAMA_SRC_ACTUAL = null;
        return;
      }
    }
    if (diagrama.highlight) {
      requestAnimationFrame(() => {
        const target = frame.querySelector(`[data-id="${CSS.escape(diagrama.highlight)}"]`);
        if (target && typeof target.click === 'function') target.click();
      });
    }
  } else if (diagrama.tipo) {
    // gancho para auto-generación futura (tipo + datos). Por ahora, placeholder.
    frame.innerHTML = `<p style="color:var(--sepia);font-style:italic;">Auto-generación de diagramas tipo "${escapeHtml(diagrama.tipo)}" todavía no implementada.</p>`;
    DIAGRAMA_SRC_ACTUAL = null;
  }

  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ocultarDiagrama() {
  const sec = document.getElementById('diagrama-relacionado');
  sec.hidden = true;
  // marcar botón como no-presionado (si existe)
  const btn = document.getElementById('jev-ver-diagrama');
  if (btn) btn.setAttribute('aria-pressed', 'false');
}

/* Ejecuta los <script> embebidos en un fragmento HTML cargado con innerHTML.
   innerHTML no ejecuta scripts por seguridad; los re-creamos y reemplazamos. */
function ejecutarScripts(contenedor) {
  const scripts = contenedor.querySelectorAll('script');
  scripts.forEach(viejo => {
    const nuevo = document.createElement('script');
    Array.from(viejo.attributes).forEach(attr => nuevo.setAttribute(attr.name, attr.value));
    nuevo.textContent = viejo.textContent;
    viejo.parentNode.replaceChild(nuevo, viejo);
  });
}

function abrirUnidad(id, scroll) {
  const unidad = SPEC.unidades.find(u => u.id === id);
  if (!unidad) return;
  UNIDAD_ACTIVA = unidad;
  document.querySelectorAll('.overlay').forEach(el => {
    el.classList.toggle('activa', el.dataset.id === id);
  });
  document.querySelectorAll('.toc-unidades li').forEach(li => {
    li.classList.toggle('activa', li.dataset.id === id);
  });
  renderPanel(unidad);
  if (scroll) {
    const primeraCaja = document.querySelector(`.overlay[data-id="${CSS.escape(id)}"]`);
    if (primeraCaja) primeraCaja.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function wireOverlays() {
  document.querySelectorAll('.overlay').forEach(el => {
    el.addEventListener('click', () => abrirUnidad(el.dataset.id, false));
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrirUnidad(el.dataset.id, false);
      }
    });
  });
}

function setModo(modo) {
  const shell = document.querySelector('.vista-daf-shell');
  shell.classList.remove('modo-texto', 'modo-analisis', 'modo-jevruta');
  shell.classList.add('modo-' + modo);
  document.querySelectorAll('.vista-daf-controles .modo-grupo button').forEach(b => {
    b.classList.toggle('activo', b.dataset.modo === modo);
  });
  if (modo === 'jevruta' && SPEC.unidades.length > 0 && !UNIDAD_ACTIVA) {
    abrirUnidad(SPEC.unidades[0].id, true);
  }
}

function wireControles() {
  document.querySelectorAll('.vista-daf-controles .modo-grupo button').forEach(b => {
    b.addEventListener('click', () => setModo(b.dataset.modo));
  });
  document.getElementById('selector-daf').addEventListener('change', e => {
    location.search = '?ref=' + encodeURIComponent(e.target.value);
  });
  document.getElementById('diagrama-cerrar').addEventListener('click', ocultarDiagrama);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !document.getElementById('diagrama-relacionado').hidden) {
      ocultarDiagrama();
    }
  });
}

function renderTop(spec) {
  document.getElementById('vista-daf-titulo').textContent = spec.titulo || spec.ref;
  const breadcrumb = document.getElementById('vista-daf-breadcrumb');
  breadcrumb.innerHTML = `
    <a href="./">codex talmudicus</a> ·
    <a href="./?ref=${encodeURIComponent(spec.ref)}">${escapeHtml(spec.ref)}</a> ·
    vista jevruta
  `;
  const nav = document.getElementById('navegacion-daf');
  nav.innerHTML = '';
  if (spec.anterior) {
    nav.innerHTML += `<a href="?ref=${encodeURIComponent(spec.anterior)}">← ${escapeHtml(spec.anterior.split(' ').pop())}</a>`;
  }
  if (spec.siguiente) {
    nav.innerHTML += `<a href="?ref=${encodeURIComponent(spec.siguiente)}">${escapeHtml(spec.siguiente.split(' ').pop())} →</a>`;
  }
  const intro = document.getElementById('vista-daf-intro');
  if (spec.introduccion) {
    intro.textContent = spec.introduccion;
    intro.style.display = 'block';
  } else {
    intro.style.display = 'none';
  }
  // selector
  const sel = document.getElementById('selector-daf');
  const opciones = ['Berakhot 2a', 'Berakhot 2b', 'Berakhot 3b']; // expandible cuando haya más specs
  sel.innerHTML = opciones.map(o => `<option value="${o}" ${o === spec.ref ? 'selected' : ''}>${o}</option>`).join('');
}

/* ----- init ----- */

async function init() {
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref') || 'Berakhot 2a';
  try {
    SPEC = await cargarDaf(ref);
  } catch (err) {
    document.body.innerHTML = `<div style="padding:3rem;font-family:Georgia,serif;color:#8b1a1a;">
      <h2>No hay vista jevruta para ${escapeHtml(ref)}</h2>
      <p>${escapeHtml(err.message)}</p>
      <p>Para añadir un daf nuevo, crea <code>data/vista-daf/${escapeHtml(refToSlug(ref))}.json</code> siguiendo el schema de <code>data/vista-daf/README.md</code>.</p>
    </div>`;
    return;
  }
  renderTop(SPEC);
  renderLineas(SPEC);
  renderTOC(SPEC);
  renderPanel(null);
  wireOverlays();
  wireControles();
  setModo('analisis');
}

document.addEventListener('DOMContentLoaded', init);
