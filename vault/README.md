# Vault Obsidian · Codex Talmudicus

Este es el **vault** que alimenta el sitio público. Abrilo desde Obsidian apuntando a la carpeta `vault/` del repo.

## Estructura

```
vault/
├── temas/        — un .md por tema (el contenido del diagrama)
├── sabios/       — un .md por rabí (biografía, sugyot donde aparece)
├── pesukim/      — un .md por verso (texto, ocurrencias)
├── conceptos/    — un .md por concepto recurrente
└── dapim/        — un .md por daf (notas de estudio libres)
```

## Cómo se conecta con el sitio

```
vault/temas/*.md  ──► (script)  ──►  diagramas/manifest.json  ──►  sitio web
       │                                                              │
       │                                                              │
       └─── notas para estudio personal en Obsidian                   │
                                                                      ▼
                                                              índice + grafo D3
```

El **frontmatter YAML** al principio de cada nota es la fuente de verdad. El **cuerpo markdown** son tus notas personales (Obsidian las usa para graph view y backlinks).

## Cómo regenerar el manifest después de editar

```bash
npm install         # solo la primera vez
node scripts/generate-manifest.js
git add -A && git commit -m "..." && git push
```

GitHub Pages se actualiza solo.

## Cómo escribir una nota de tema

Cada `vault/temas/{slug}.md` necesita este frontmatter:

```yaml
---
slug: vigilias-noche          # debe matchear el nombre del archivo
orden: 2                       # posición cronológica en el perek
dapim: [3a, 3b]                # dapim donde aparece
grupo: La noche cósmica        # agrupación temática
estado: listo                  # listo | pendiente
sabios: [r-eliezer, r-natan]   # slugs de sabios referenciados
pesukim: [yirmiyahu-25-30]     # slugs de pesukim citados
conceptos: [vigilias]          # slugs de conceptos
diagrama: diagramas/vigilias-noche.html
puente_desde:
  tipo: continuacion-halajica
  texto: |
    Explicación de cómo el editor del Bavli conectó este
    tema con el anterior.
---

# Las vigilias de la noche

Tus notas personales aquí, con [[wikilinks]] a `r-eliezer`,
`yirmiyahu-25-30`, etc. Obsidian las usa para el graph view.
```

## Notas auxiliares (opcionales)

Las notas en `sabios/`, `pesukim/`, `conceptos/` son **opcionales**.
El script las recoge si existen, pero si solo se las referencia desde un tema sin crear su nota, igual funcionan (se infiere la entrada del slug).

Las notas auxiliares son útiles para:
- Escribir biografías de sabios
- Conservar el texto completo de un verso
- Definir un concepto recurrente

## Tipos de conexión (en `puente_desde.tipo`)

Las 5 técnicas editoriales del Bavli:

| Tipo | Cuándo se usa |
|---|---|
| `cadena-formula` | dos pasajes comparten una fórmula textual |
| `palabra-puente` | una palabra del pasaje anterior dispara el siguiente |
| `mismo-orador` | el editor agrupa todas las enseñanzas de un mismo sabio |
| `continuacion-halajica` | un punto halájico exige el siguiente desarrollo |
| `agav-orcheih` | "de paso", info colateral relacionada |

## Tipos de conexión inferidas (automáticas)

El script también infiere conexiones débiles:

| Tipo inferido | Significado |
|---|---|
| `co-sabio` | dos temas comparten un sabio |
| `co-pasuk` | dos temas citan el mismo verso |
| `co-concepto` | dos temas tratan el mismo concepto |
