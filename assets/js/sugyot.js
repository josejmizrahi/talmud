/* ============================================================================
   sugyot.js — Mapeo automático de sugiot del Bavli
   ============================================================================
   Carga el "Mishnah Map.csv" de Sefaria que mapea cada mishná del Bavli
   a su posición exacta en el daf:

      Book, Mishnah Chapter, Start Mishnah, End Mishnah,
      Start Daf, Start Line, End Daf, End Line

   Eso define los límites naturales de cada sugiá: el material talmúdico
   entre dos mishnayot consecutivas ES una sugiá.

   Total: 523 mishnayot del Bavli mapeadas a posición exacta.
   ============================================================================ */

const Sugyot = (function() {

  const CSV_URL = 'https://raw.githubusercontent.com/Sefaria/Sefaria-Project/master/data/Mishnah%20Map.csv';
  const CACHE_KEY = 'sefaria-mishnah-map';
  const CACHE_TTL = 1000 * 60 * 60 * 24 * 30; // 30 días

  let mapaCargado = null; // { book: [filas] }

  /* ----- Parse CSV ----- */
  function parsearCSV(texto) {
    const lineas = texto.split('\n').filter(l => l.trim());
    if (lineas.length < 2) return [];
    const headers = lineas[0].split(',').map(h => h.trim());
    const filas = [];
    for (let i = 1; i < lineas.length; i++) {
      const partes = lineas[i].split(',').map(p => p.trim());
      if (partes.length < headers.length) continue;
      const fila = {};
      headers.forEach((h, idx) => { fila[h] = partes[idx]; });
      filas.push(fila);
    }
    return filas;
  }

  /* ----- Cargar el CSV con caché ----- */
  async function cargar() {
    if (mapaCargado) return mapaCargado;

    // Intentar caché localStorage
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const { ts, data } = JSON.parse(raw);
        if (Date.now() - ts < CACHE_TTL) {
          mapaCargado = data;
          return mapaCargado;
        }
      }
    } catch (e) { /* sigue al fetch */ }

    // Fetch desde GitHub
    const resp = await fetch(CSV_URL);
    if (!resp.ok) throw new Error(`No se pudo cargar Mishnah Map: ${resp.status}`);
    const texto = await resp.text();
    const filas = parsearCSV(texto);

    // Indexar por libro
    const porLibro = {};
    filas.forEach(f => {
      const libro = f['Book'];
      if (!libro) return;
      if (!porLibro[libro]) porLibro[libro] = [];
      porLibro[libro].push({
        capitulo: parseInt(f['Mishnah Chapter']) || 1,
        startMishnah: parseInt(f['Start Mishnah']) || 1,
        endMishnah: parseInt(f['End Mishnah']) || 1,
        startDaf: f['Start Daf'],       // ej: "2a"
        startLine: parseInt(f['Start Line']) || 1,
        endDaf: f['End Daf'],
        endLine: parseInt(f['End Line']) || 1
      });
    });

    mapaCargado = porLibro;

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: porLibro }));
    } catch (e) { /* localStorage lleno, no es crítico */ }

    return mapaCargado;
  }

  /* ----- Comparar refs tipo "2a" / "2b" / "3a" para ordenarlos ----- */
  function refANumero(refDaf) {
    if (!refDaf) return 0;
    const m = refDaf.match(/^(\d+)([ab])$/);
    if (!m) return 0;
    return parseInt(m[1]) * 2 + (m[2] === 'b' ? 1 : 0);
  }

  /* ----- Obtener sugiot de un daf específico -----
     Para Berakhot 2a (libro="Berakhot", daf="2a") devuelve todas las mishnayot
     cuyo rango [startDaf:startLine, endDaf:endLine] incluye al daf 2a.
  */
  async function deDaf(libroEs, daf) {
    const mapa = await cargar();
    const filas = mapa[libroEs] || [];
    const num = refANumero(daf);

    return filas.filter(f => {
      const s = refANumero(f.startDaf);
      const e = refANumero(f.endDaf);
      return num >= s && num <= e;
    }).map(f => ({
      ...f,
      mishnaRef: `Mishnah ${libroEs} ${f.capitulo}:${f.startMishnah}${
        f.endMishnah > f.startMishnah ? '-' + f.endMishnah : ''
      }`,
      cubreCompletamenteEsteDaf: refANumero(f.startDaf) < num && refANumero(f.endDaf) > num,
      empiezaEnEsteDaf: f.startDaf === daf,
      terminaEnEsteDaf: f.endDaf === daf,
      continuaEnSiguienteDaf: refANumero(f.endDaf) > num
    }));
  }

  /* ----- Detectar a qué sugiá pertenece un segmento ------
     Dado un número de segmento dentro de un daf, devuelve la sugiá
     correspondiente (la mishná más reciente antes o en ese segmento).
  */
  function sugiaDeSegmento(sugyot, daf, segmento) {
    if (!sugyot || sugyot.length === 0) return null;
    const num = refANumero(daf);

    // Encontrar la mishná más reciente cuyo inicio ≤ (daf, segmento) y final ≥ (daf, segmento)
    for (const s of sugyot) {
      const startN = refANumero(s.startDaf);
      const endN = refANumero(s.endDaf);

      // ¿Está el (daf, segmento) dentro del rango de esta sugiá?
      let despuesDelInicio = false;
      let antesDelFinal = false;

      if (num > startN) despuesDelInicio = true;
      else if (num === startN && segmento >= s.startLine) despuesDelInicio = true;

      if (num < endN) antesDelFinal = true;
      else if (num === endN && segmento <= s.endLine) antesDelFinal = true;

      if (despuesDelInicio && antesDelFinal) return s;
    }
    return null;
  }

  /* ----- Total de sugiot mapeadas ----- */
  async function estadisticas() {
    const mapa = await cargar();
    let totalMishnayot = 0;
    let totalLibros = 0;
    Object.values(mapa).forEach(filas => {
      totalLibros++;
      totalMishnayot += filas.length;
    });
    return { totalMishnayot, totalLibros };
  }

  return {
    cargar,
    deDaf,
    sugiaDeSegmento,
    estadisticas
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sugyot;
}
