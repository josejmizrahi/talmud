#!/usr/bin/env node
/**
 * generate-manifest.js
 *
 * Lee vault/ (notas markdown con frontmatter YAML) y genera
 * diagramas/manifest.json con el knowledge graph completo.
 *
 * Estructura del manifest:
 *   { perek, descripcion, diagramas, sabios, pesukim, conceptos, conexiones }
 *
 * Conexiones:
 *   - "fuertes" (editoriales): inferidas de puente_desde.tipo
 *   - "débiles" (co-referencias): inferidas de sabios/pesukim/conceptos compartidos
 *
 * Uso: node scripts/generate-manifest.js
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const ROOT = path.join(__dirname, '..');
const VAULT = path.join(ROOT, 'vault');
const OUT = path.join(ROOT, 'diagramas', 'manifest.json');

const PEREK = 'Berajot · perek 1 · mishná 1:1';
const DESCRIPCION =
  'Diagramas temáticos del primer perek de Berajot (mishná 1:1). ' +
  'Cada tema captura una sugyá completa, incluso si vuelve a aparecer ' +
  'en daf posteriores. Orden cronológico de primera aparición.';

/* ---------- Lectura del vault ---------- */

function parseFrontmatter(content) {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  try {
    return yaml.load(m[1]) || {};
  } catch (e) {
    console.warn(`  yaml error: ${e.message}`);
    return null;
  }
}

function readVaultDir(subdir) {
  const dir = path.join(VAULT, subdir);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'))
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf-8');
      const fm = parseFrontmatter(content);
      if (!fm) return null;
      return { _file: f, ...fm };
    })
    .filter(Boolean);
}

/* ---------- Auto-completar entradas faltantes ---------- */

function inferEntries(refs, existing, type) {
  const known = new Set(existing.map(e => e.slug));
  const inferred = [];
  const seen = new Set();
  for (const ref of refs) {
    if (!ref || known.has(ref) || seen.has(ref)) continue;
    seen.add(ref);
    inferred.push({
      slug: ref,
      nombre: ref.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      _inferred: true,
    });
  }
  return inferred;
}

/* ---------- Conexiones del grafo ---------- */

function buildConexiones(temas) {
  const edges = [];

  // Editoriales (puente_desde explícito) — fuertes
  const sorted = [...temas].sort((a, b) => (a.orden || 0) - (b.orden || 0));
  for (let i = 1; i < sorted.length; i++) {
    const t = sorted[i];
    const prev = sorted[i - 1];
    if (!t.puente_desde || !t.puente_desde.tipo) continue;
    if (t.puente_desde.tipo === 'apertura') continue;
    edges.push({
      from: prev.slug,
      to: t.slug,
      categoria: 'editorial',
      tipo: t.puente_desde.tipo,
      texto: t.puente_desde.texto || '',
      peso: 3,
    });
  }

  // Co-referencias (sabios/pesukim/conceptos compartidos) — débiles
  for (let i = 0; i < temas.length; i++) {
    for (let j = i + 1; j < temas.length; j++) {
      const a = temas[i], b = temas[j];
      const co = (kind) => {
        const aSet = new Set(a[kind] || []);
        return (b[kind] || []).filter(x => aSet.has(x));
      };
      const sabios = co('sabios');
      const pesukim = co('pesukim');
      const conceptos = co('conceptos');
      sabios.forEach(via => edges.push({
        from: a.slug, to: b.slug, categoria: 'co-referencia', tipo: 'co-sabio', via, peso: 1,
      }));
      pesukim.forEach(via => edges.push({
        from: a.slug, to: b.slug, categoria: 'co-referencia', tipo: 'co-pasuk', via, peso: 1,
      }));
      conceptos.forEach(via => edges.push({
        from: a.slug, to: b.slug, categoria: 'co-referencia', tipo: 'co-concepto', via, peso: 1,
      }));
    }
  }

  return edges;
}

/* ---------- Validación ---------- */

function validate(temas, sabios, pesukim, conceptos) {
  const errors = [];
  const known = {
    sabios: new Set(sabios.map(s => s.slug)),
    pesukim: new Set(pesukim.map(p => p.slug)),
    conceptos: new Set(conceptos.map(c => c.slug)),
  };
  for (const t of temas) {
    if (!t.slug) errors.push(`tema sin slug: ${t._file}`);
    if (!t.orden) errors.push(`tema ${t.slug}: sin orden`);
    if (!t.titulo) errors.push(`tema ${t.slug}: sin titulo`);
    for (const ref of (t.sabios || [])) {
      if (!known.sabios.has(ref)) {} // suelto, las notas auxiliares son opcionales
    }
  }
  // Detectar órdenes duplicadas
  const seenOrdenes = new Map();
  for (const t of temas) {
    if (seenOrdenes.has(t.orden)) {
      errors.push(`orden ${t.orden} duplicado: ${seenOrdenes.get(t.orden)} y ${t.slug}`);
    }
    seenOrdenes.set(t.orden, t.slug);
  }
  return errors;
}

/* ---------- Main ---------- */

function main() {
  console.log('Leyendo vault…');
  const temas = readVaultDir('temas');
  let sabios = readVaultDir('sabios');
  let pesukim = readVaultDir('pesukim');
  let conceptos = readVaultDir('conceptos');

  console.log(`  · ${temas.length} temas`);
  console.log(`  · ${sabios.length} sabios (notas)`);
  console.log(`  · ${pesukim.length} pesukim (notas)`);
  console.log(`  · ${conceptos.length} conceptos (notas)`);

  // Auto-completar referencias faltantes
  const allSabios = temas.flatMap(t => t.sabios || []);
  const allPesukim = temas.flatMap(t => t.pesukim || []);
  const allConceptos = temas.flatMap(t => t.conceptos || []);
  sabios = [...sabios, ...inferEntries(allSabios, sabios, 'sabios')];
  pesukim = [...pesukim, ...inferEntries(allPesukim, pesukim, 'pesukim')];
  conceptos = [...conceptos, ...inferEntries(allConceptos, conceptos, 'conceptos')];

  const inferred = [
    sabios.filter(x => x._inferred).length,
    pesukim.filter(x => x._inferred).length,
    conceptos.filter(x => x._inferred).length,
  ];
  if (inferred.some(n => n > 0)) {
    console.log(`  + auto-inferidos: ${inferred[0]} sabios, ${inferred[1]} pesukim, ${inferred[2]} conceptos`);
  }

  // Validar
  const errors = validate(temas, sabios, pesukim, conceptos);
  if (errors.length > 0) {
    console.error('\nERRORES:');
    errors.forEach(e => console.error(`  ✗ ${e}`));
    process.exit(1);
  }

  // Sortear cronológicamente
  temas.sort((a, b) => a.orden - b.orden);

  // Construir conexiones
  const conexiones = buildConexiones(temas);
  console.log(`  · ${conexiones.length} conexiones inferidas`);
  console.log(`      ${conexiones.filter(e => e.categoria === 'editorial').length} editoriales (puentes)`);
  console.log(`      ${conexiones.filter(e => e.tipo === 'co-sabio').length} por sabio compartido`);
  console.log(`      ${conexiones.filter(e => e.tipo === 'co-pasuk').length} por pasuk compartido`);
  console.log(`      ${conexiones.filter(e => e.tipo === 'co-concepto').length} por concepto compartido`);

  // Limpiar campos internos antes de serializar
  const clean = arr => arr.map(o => {
    const { _file, _inferred, ...rest } = o;
    return rest;
  });

  // Componer manifest
  const manifest = {
    perek: PEREK,
    descripcion: DESCRIPCION,
    diagramas: clean(temas),
    sabios: clean(sabios),
    pesukim: clean(pesukim),
    conceptos: clean(conceptos),
    conexiones,
  };

  // Escribir
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(manifest, null, 2) + '\n');

  console.log(`\n✓ manifest escrito: ${path.relative(ROOT, OUT)}`);
  console.log(`  ${manifest.diagramas.length} temas · ${manifest.sabios.length} sabios · ${manifest.pesukim.length} pesukim · ${manifest.conceptos.length} conceptos · ${manifest.conexiones.length} conexiones`);
}

main();
