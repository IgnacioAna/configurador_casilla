---
phase: quick-260720-oz0
plan: 01
subsystem: resumen/export
tags: [pricing, pdf, whatsapp, og-image, demo]
requires: []
provides:
  - "Constante única LISTA_PRECIOS (nombre + vigencia) en geometry.js"
  - "Sello de lista/fecha en resumen, PDF (con fecha es-AR) y WhatsApp"
  - "public/og.png con contenido real (~26KB)"
  - "scripts/gen-og.ps1 versionado"
affects:
  - src/components/resumen/PresupuestoDesglosado.jsx
  - src/utils/exportPDF.js
  - src/utils/exportWhatsApp.js
tech-stack:
  added: []
  patterns:
    - "Fuente única del sello: consumidores importan LISTA_PRECIOS, no duplican el literal"
key-files:
  created:
    - scripts/gen-og.ps1
  modified:
    - src/data/geometry.js
    - src/components/resumen/PresupuestoDesglosado.jsx
    - src/utils/exportPDF.js
    - src/utils/exportWhatsApp.js
    - src/utils/exportWhatsApp.test.js
    - public/og.png
decisions:
  - "El string del sello vive sólo en la constante LISTA_PRECIOS; las apariciones de 'Lista 108' en models.js/extras.js/geometry.js son comentarios de cabecera preexistentes (referencia de fuente de datos), no consumidores del sello"
metrics:
  duration: "~2m"
  completed: 2026-07-20
---

# Phase quick-260720-oz0: Sello Lista 108 · Feb-2026 + og.png real Summary

Sello de lista de precios (Lista 108 · Febrero 2026) anclado desde una constante única en
`geometry.js` y consumido por resumen, PDF (con fecha de generación es-AR) y WhatsApp; y
reemplazo del `public/og.png` transparente por una imagen con contenido real, con su script
generador versionado.

## What Was Built

### Task 1 — Sello de Lista de Precios (commit 3305830)
- `src/data/geometry.js`: nueva constante `LISTA_PRECIOS = { nombre: 'Lista 108', vigencia: 'Febrero 2026' }`, fuente única del sello.
- `PresupuestoDesglosado.jsx`: línea discreta bajo la nota orientativa leída de la constante ("Precios Lista 108 · Febrero 2026, sujetos a actualización.").
- `exportPDF.js`: en `construirDocPDF`, tras la nota orientativa, estampa el sello + la fecha de generación (`toLocaleDateString('es-AR')`) en tipografía tenue, usando el helper `avanzarSiNecesario` (WR-03) y restaurando el color de texto por defecto. Validado por build (parte no pura, no testeable con node:test).
- `exportWhatsApp.js`: una línea corta "Precios Lista 108 · Febrero 2026." tras la nota orientativa.
- `exportWhatsApp.test.js`: nueva aserción que verifica la presencia de `LISTA_PRECIOS.nombre`; el test de longitud (<2000 chars con todos los extras) sigue pasando.

### Task 2 — og.png real + script (commit 03f4825)
- `public/og.png` reemplazado por la imagen aprobada (~26KB, ya no transparente).
- `scripts/gen-og.ps1` versionado para regenerar la imagen.

## Deviations from Plan

None - plan executed exactly as written.

## Verification

- `node --test src/utils/exportWhatsApp.test.js src/utils/exportPDF.test.js` → 11 pass, 0 fail.
- `npm run build` → compila sin errores (valida el bloque nuevo del PDF).
- `grep "Lista 108" src/` → el literal del sello sólo se genera desde `LISTA_PRECIOS` (geometry.js); las demás apariciones son comentarios de cabecera preexistentes en models.js/extras.js.
- `public/og.png` = 26758 bytes (>20KB); `scripts/gen-og.ps1` presente.

## Self-Check: PASSED
- FOUND: src/data/geometry.js (LISTA_PRECIOS)
- FOUND: public/og.png (26758 bytes)
- FOUND: scripts/gen-og.ps1
- FOUND commit: 3305830 (Task 1)
- FOUND commit: 03f4825 (Task 2)
