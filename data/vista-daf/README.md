# Vista Daf · Schema

Cada archivo `data/vista-daf/{slug}.json` describe un daf completo para la vista jevruta. El motor (`assets/js/vista-daf.js`) es genérico — no necesita saber del contenido del daf. Para añadir un daf nuevo, basta con crear su JSON.

## Convención de slug

`Berakhot 2a` → `berakhot-2a`
`Shabbat 31a` → `shabbat-31a`
`Bava Metzia 59b` → `bava-metzia-59b`

Regla: minúsculas, espacios y puntos a guiones, sin guiones al inicio/final.

## Schema

```jsonc
{
  "ref": "Berakhot 2a",                     // referencia canónica
  "titulo": "Berajot 2a — …",               // título mostrado
  "anterior": "Berakhot 1b" | null,         // ref para navegación
  "siguiente": "Berakhot 2b" | null,
  "introduccion": "Párrafo opcional que da contexto a la sugyá.",

  "lineas": [
    {
      "n": 1,                                // número de línea (1-indexed)
      "tag": "mishná · 1.1",                 // etiqueta corta (opcional)
      "he": "מאימתי קורין את שמע…",          // texto hebreo/arameo
      "es": "¿Desde cuándo…?",               // glosa española (opcional)
      "anota": ["m-pregunta", "m-r-eliezer"] // ids de unidades que tocan esta línea
    }
    // …
  ],

  "unidades": [
    {
      "id": "m-pregunta",                     // único en el daf
      "tipo": "kushya",                       // ver tabla de TIPOS
      "etiqueta": "Mishná · pregunta inicial",// etiqueta corta para overlay y TOC
      "lineas": [1],                          // líneas que abarca
      "match": "מֵאֵימָתַי קוֹרִין…",          // texto exacto a resaltar (opcional;
                                              // si falta, resalta toda la línea)

      "titulo": "Título largo del panel jevruta",
      "resumen": "Párrafo que explica la función dialéctica de la movida.",

      "dialogo": [
        { "voz": "stam", "texto": "…" },
        { "voz": "tana", "etiqueta": "tana", "texto": "…" },
        { "voz": "chavruta", "etiqueta": "estudiante", "texto": "…" }
        // …
      ]
    }
    // …
  ]
}
```

## Tipos de movida (`unidad.tipo`)

Determina color y forma del overlay sobre el texto.

| tipo          | uso                                                      |
|---------------|----------------------------------------------------------|
| `mishna`      | enunciado de mishná                                      |
| `memra`       | memrá (dicho amoraico o tanaítico nominado)              |
| `kushya`      | objeción / pregunta editorial del stam                   |
| `havayya`     | hipótesis alternativa (más débil que kushyá frontal)     |
| `teruts`      | resolución / respuesta                                   |
| `baraita`     | baraita o "tanya" / "tanu rabanan"                       |
| `nafka-mina`  | implicación práctica / conclusión halájica               |
| `maase`       | relato narrativo / aggadá / historia                     |

Para agregar un tipo nuevo, añade su color en `assets/css/vista-daf.css` y registra su etiqueta en `assets/js/vista-daf.js` (`TIPOS`).

## Voces de diálogo (`turno.voz`)

Determina color del chip y "lado" (izquierda/derecha/centro) en el panel jevruta. Voces actualmente registradas en `assets/js/vista-daf.js` (`VOCES`):

- `stam` — voz editorial anónima del Bavlí (izquierda)
- `tana` — tana anónimo (mishná o baraita) (derecha)
- `r-eliezer`, `r-gamliel`, `r-yehoshua`, `r-meir`, `r-yehuda`, `r-yose`, `r-chanina`, `r-akiva` — tanaim nombrados
- `chachamim` — los Sabios
- `rav`, `shmuel`, `rabbah-sheila` — amoraim nombrados
- `mar` — "amar mar" (cita interna)
- `chavruta` — voz explicativa moderna (centro, en cursiva)
- `eliyahu` — Eliyahu HaNavi

Para añadir un sabio nuevo, añade su entrada al objeto `VOCES` en el motor.

El campo `etiqueta` del turno opcionalmente sobreescribe el label del chip — útil para añadir distinciones ("R. Yehuda HaNasi" vs el genérico "R. Yehuda", o "estudiante"/"lector" como sub-roles de `chavruta`).

## Conexión con el sitio

La vista se carga vía `vista-daf.html?ref=Berakhot.2a` (o cualquier ref soportada).

El selector "daf" arriba del cuerpo permite saltar entre dapim sin recargar el sitio. Para añadir un daf nuevo a la lista, edita el array `opciones` dentro de `renderTop()` en `assets/js/vista-daf.js`.

## Buenas prácticas para crear un spec

1. **Fetchea el texto exacto** de Sefaria antes de escribir: `https://www.sefaria.org/api/v3/texts/{ref}?return_format=text_only`. No inventes citas.
2. **Identifica las movidas dialécticas** una a una — qué es mishná, qué es la primera kushyá, dónde está el teruts. Una sugyá típica tiene 8–15 movidas por daf.
3. **Para cada movida, escribe el resumen primero, el diálogo después.** El resumen explica QUÉ hace la movida; el diálogo la VOZEA.
4. **El diálogo no es traducción literal.** Es chavruta. Usa 3–6 turnos. Mezcla: la voz literal del texto (stam, sabios) + una voz `chavruta` que comenta/pregunta. Eso recrea cómo dos compañeros de estudio entienden la sugyá.
5. **El campo `match` debe ser un substring exacto** del campo `he` de la línea correspondiente — el motor lo busca con `indexOf`. Si dos unidades tocan la misma línea, sus matches no deben solaparse (overlays disjuntos).
6. **Si no hay `match`, la línea entera queda resaltada.** Útil cuando toda la línea es una sola movida.
