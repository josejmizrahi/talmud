# Codex Talmudicus

> *הפוך בה והפוך בה דכולא בה*
> Dale vueltas y vueltas, porque todo está en ella.

Un mapa visual e interactivo del Talmud Bavli que se construye sobre la API de Sefaria. **Cero trabajo manual por daf.** El texto, los comentarios clásicos (Rashi, Tosafot, etc.), los topics y los paralelos se cargan automáticamente. Tu progreso del Daf Yomí se vuelve un mapa personal del Shas.

## La idea fundamental

El Talmud ya es un grafo hipertextual escrito 1500 años antes del hipertexto. Sefaria ya digitalizó ese grafo. Este códice es una interfaz visual sobre ese grafo con **dos capas**:

**Capa automática (escalable a 2,711 dapim, cero trabajo):**
- Texto hebreo + traducción al inglés desde Sefaria
- Análisis estructural: pesukim citados, paralelos en el Bavli, comentarios (Rashi, Tosafot...), distribución de voces talmúdicas (תנא, אמר, ורמינהו, שמע מינה...)
- Topics, mishnayot relacionadas, halajá, midrash
- Calendario Daf Yomí

**Capa curada (a demanda, profunda):**
- Diagramas interactivos del flujo argumentativo de sugiot específicas
- Cuando me pidas un diagrama profundo de un daf, te lo genero
- Se guarda como `diagramas/{slug}.html` y aparece automáticamente la próxima vez

## Las cinco vistas del códice

1. **Portada** (`index.html`) — daf de hoy, stats, sedarim
2. **Cosmos** (`vistas/cosmos.html`) — todo el Shas como mapa visual con 2,711 dapim navegables
3. **Grafo** (`vistas/grafo.html`) — red de topics emergente, construida automáticamente desde los dapim que has estudiado
4. **Daf Yomí** (`vistas/calendario.html`) — calendario de los próximos y pasados días
5. **Mi estudio** (`vistas/progreso.html`) — tu progreso por seder, dapim recientes
6. **Buscar** (`vistas/buscar.html`) — búsqueda en todo el corpus de Sefaria
7. **Daf individual** (`daf.html?ref=Berakhot.2a`) — texto + Rashi/Tosafot + topics + paralelos + notas

## Estructura del repo

```
codex/
├── index.html                 # portada
├── daf.html                   # plantilla universal de daf (funciona para CUALQUIER ref)
├── vistas/
│   ├── cosmos.html            # todo el Shas
│   ├── grafo.html             # grafo dinámico
│   ├── calendario.html        # daf yomí
│   ├── buscar.html            # búsqueda
│   ├── progreso.html          # mi estudio
│   ├── masejet.html           # una masejet individual
│   └── seder.html             # un seder individual
├── assets/
│   ├── css/main.css           # diseño completo
│   └── js/
│       ├── shas.js            # estructura de las 37 masejtot
│       ├── sefaria-client.js  # cliente de la API con caché
│       └── daf.js             # lógica de la página de daf
└── diagramas/                 # SVGs opcionales por daf
    └── berakhot-2a.svg        # ejemplo - se carga automáticamente en daf.html?ref=Berakhot.2a
```

**No hay archivos JSON manuales. No hay fichas de conceptos a mantener. No hay índices a generar.**

## Workflow diario (cero fricción)

### Estudiar el daf de hoy
1. Abre `index.html`. Verás "El daf de hoy" cargado automáticamente desde el calendario de Sefaria.
2. Click en "Estudiar →". Se abre el daf con todo cargado.
3. Lee, expande Rashi, Tosafot. Toma notas en el panel lateral.
4. Click en "Marcar estudiado" cuando termines. Tu progreso se actualiza solo.

### (Opcional) Pedir un diagrama visual
Si un daf tiene una estructura argumentativa compleja que merece visualizarse:

> Abre un chat con Claude y di: *"Genera un diagrama interactivo HTML para [ref del daf]. Sigue el estilo de berakhot-2a.html."*

Yo te devuelvo el HTML. Lo guardas como `diagramas/{ref-en-minusculas-con-guiones}.html`. La próxima vez que abras ese daf, el diagrama aparece automáticamente con sus interactividades.

**Dos tipos de diagrama soportados:**
- `diagramas/{slug}.html` — diagrama interactivo (click en elementos, paneles que se despliegan, animaciones). Es el formato preferido.
- `diagramas/{slug}.svg` — diagrama estático (solo imagen). Más simple, útil cuando no necesitas interacción.

La lógica intenta primero `.html`; si no existe, busca `.svg`; si tampoco hay, simplemente no muestra nada.

Ejemplos de slugs de archivo:
- `Berakhot.2a` → `diagramas/berakhot-2a.html`
- `Shabbat.31a` → `diagramas/shabbat-31a.html`
- `Bava Metzia.59b` → `diagramas/bava-metzia-59b.html`

## Setup técnico

### Probar en local (sin servidor)
Abre `index.html` directamente en tu navegador. **Atención:** debido a CORS, algunos navegadores bloquean fetch desde archivos `file://`. Si pasa, abre con un servidor local rápido:

```bash
# Si tienes Python
cd codex
python3 -m http.server 8000
# Abre http://localhost:8000

# O con npx
npx http-server
```

### Publicar en GitHub Pages

1. Crea un repo en GitHub (puede ser público o privado).
2. Sube el código:

```bash
cd codex
git init
git add .
git commit -m "Codex inicial"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/codex-talmudicus.git
git push -u origin main
```

3. En el repo, ve a **Settings → Pages**.
4. En "Source", elige `main` branch, carpeta `/ (root)`.
5. En ~1 minuto tu sitio está en `https://TU_USUARIO.github.io/codex-talmudicus`.

### Si prefieres herramienta gráfica
Usa **GitHub Desktop** ([desktop.github.com](https://desktop.github.com)):
1. "File → Add Local Repository" → elige la carpeta `codex/`
2. "Publish repository" → activa "Push" cuando quieras subir cambios

## Cómo se siente el sistema

**Día 1:** Abres `index.html`. Ves el daf de hoy. Lo estudias. Tu mapa tiene un punto.

**Día 30:** El grafo de topics ya tiene ~40 nodos conectados. Algunos topics aparecen en 5+ dapim — son tus concentradores.

**Día 365:** Has cubierto Berajot completa, Shabbat completa, parte de Eruvin. El grafo tiene cientos de nodos. Ya puedes ver clusters temáticos emergentes.

**Año 7.5:** Terminas el ciclo. Tu mapa es un retrato visual único de tu propio recorrido por el Shas. Los diagramas SVG que pediste a lo largo del camino forman un pequeño tesoro complementario.

## Decisiones de diseño honestas

- **Idioma:** Inglés (Steinsaltz translation) por defecto. Sefaria no tiene traducción al español del Bavli, así que el inglés es lo más cercano.
- **Notas:** localStorage. Si quieres migrar a otro equipo, exporta el localStorage. Si quieres versionar tus notas en Git, eso sería un trabajo futuro.
- **Cache:** las respuestas de Sefaria se cachean 30 días en tu navegador. Esto hace el sitio rápido y reduce carga sobre la API.
- **Sin cuentas, sin servidor:** todo es estático. Tus datos viven en tu navegador. Privacidad total.

## Créditos

- Texto, traducciones, comentarios, topics, paralelos: **[Sefaria](https://www.sefaria.org)**, bajo licencias abiertas.
- Tipografías: Cormorant Garamond, Frank Ruhl Libre, JetBrains Mono.
- Visualización del grafo: D3.js.

---

*Construido con cero archivos que mantener y máxima escala.*
