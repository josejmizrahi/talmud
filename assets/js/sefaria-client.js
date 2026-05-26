/* ============================================================================
   sefaria-client.js — Cliente de la API de Sefaria
   - Caché agresiva en localStorage para no machacar la API
   - Todos los endpoints que necesitamos
   - Manejo de errores con fallbacks
   ============================================================================ */

const SefariaClient = (function() {
  const BASE = 'https://www.sefaria.org/api';
  const CACHE_PREFIX = 'sefaria-cache:';
  const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 días - los textos cambian poco

  /* ----- Sistema de caché ----- */

  function cacheGet(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > CACHE_TTL) {
        localStorage.removeItem(CACHE_PREFIX + key);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function cacheSet(key, data) {
    try {
      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
    } catch (e) {
      // Si localStorage está lleno, limpiar entradas viejas
      if (e.name === 'QuotaExceededError') {
        limpiarCacheVieja();
        try {
          localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ ts: Date.now(), data }));
        } catch (e2) {
          console.warn('No se pudo cachear:', key);
        }
      }
    }
  }

  function limpiarCacheVieja() {
    const ahora = Date.now();
    const claves = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    claves.forEach(k => {
      try {
        const { ts } = JSON.parse(localStorage.getItem(k));
        if (ahora - ts > CACHE_TTL / 2) localStorage.removeItem(k);
      } catch (e) {
        localStorage.removeItem(k);
      }
    });
  }

  /* ----- Fetch con caché ----- */

  async function pedir(endpoint, opciones = {}) {
    const cacheable = opciones.cache !== false;
    const key = endpoint;

    if (cacheable) {
      const cached = cacheGet(key);
      if (cached) return cached;
    }

    const url = `${BASE}/${endpoint}`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Sefaria API ${resp.status}: ${endpoint}`);
    const data = await resp.json();

    if (cacheable) cacheSet(key, data);
    return data;
  }

  /* ----- Endpoints ----- */

  /**
   * Texto de un ref (hebreo + inglés).
   * GET /api/v3/texts/{ref}?version=hebrew&version=english
   */
  async function texto(ref) {
    const r = encodeURIComponent(ref);
    return await pedir(`v3/texts/${r}?version=hebrew&version=english`);
  }

  /**
   * Pasajes/sugiot que contienen un ref.
   * GET /api/passages/{ref}
   */
  async function passages(ref) {
    const r = encodeURIComponent(ref);
    try {
      return await pedir(`passages/${r}`);
    } catch (e) {
      return null;
    }
  }

  /**
   * Todos los links (comentarios, paralelos, etc.) a este ref.
   * GET /api/links/{ref}?with_text=0
   */
  async function links(ref) {
    const r = encodeURIComponent(ref);
    return await pedir(`links/${r}?with_text=0`);
  }

  /**
   * Topics asociados a este ref.
   * GET /api/ref-topic-links/{ref}
   */
  async function topicsDeRef(ref) {
    const r = encodeURIComponent(ref);
    try {
      return await pedir(`ref-topic-links/${r}`);
    } catch (e) {
      return [];
    }
  }

  /**
   * Detalle de un topic.
   * GET /api/v2/topics/{slug}
   */
  async function topic(slug) {
    return await pedir(`v2/topics/${encodeURIComponent(slug)}`);
  }

  /**
   * Calendario diario (Daf Yomí, Parashá, etc.).
   * GET /api/calendars?year=Y&month=M&day=D
   */
  async function calendario(fecha = new Date()) {
    const y = fecha.getFullYear();
    const m = fecha.getMonth() + 1;
    const d = fecha.getDate();
    return await pedir(`calendars?year=${y}&month=${m}&day=${d}`, { cache: false });
  }

  /**
   * Búsqueda en el corpus completo.
   * POST /api/search-wrapper
   */
  async function buscar(query, opciones = {}) {
    const cuerpo = {
      query,
      type: 'text',
      size: opciones.size || 20,
      from: opciones.from || 0,
      field: 'exact',
      sort_type: 'relevance',
      ...(opciones.filtros && { filters: opciones.filtros })
    };
    const resp = await fetch(`${BASE}/search-wrapper`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo)
    });
    if (!resp.ok) throw new Error(`Búsqueda falló: ${resp.status}`);
    return await resp.json();
  }

  /**
   * Texto de un comentario específico sobre un ref. Ej: textoDeComentario('Rashi', 'Berakhot.2a')
   */
  async function textoDeComentario(comentario, refBase) {
    const ref = `${comentario} on ${refBase}`.replace(/\s+/g, ' ');
    return await texto(ref);
  }

  /**
   * Limpia toda la caché.
   */
  function limpiarCache() {
    const claves = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    claves.forEach(k => localStorage.removeItem(k));
    return claves.length;
  }

  /**
   * Cuenta entradas en caché.
   */
  function estadisticasCache() {
    const claves = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
    let bytes = 0;
    claves.forEach(k => bytes += (localStorage.getItem(k) || '').length);
    return { entradas: claves.length, kb: (bytes / 1024).toFixed(1) };
  }

  return {
    texto,
    passages,
    links,
    topicsDeRef,
    topic,
    calendario,
    buscar,
    textoDeComentario,
    limpiarCache,
    estadisticasCache,
    BASE
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SefariaClient;
}
