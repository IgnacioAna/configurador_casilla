---
phase: quick-260714-pg2
plan: 01
subsystem: export
tags: [web-share-api, whatsapp, jspdf, pdf-adjunto]
requirements: [EXPORT-01, EXPORT-02]
dependency_graph:
  requires:
    - src/utils/exportPDF.js (construirDocPDF)
    - src/utils/exportWhatsApp.js (mensajeWhatsApp, linkWhatsApp)
  provides:
    - src/utils/compartir.js (compartirPorWhatsApp)
  affects:
    - src/components/resumen/AccionesExport.jsx
tech-stack:
  added: []
  patterns:
    - "Gate de detección canShare({files}) (no navigator.share solo) para Web Share API con archivos"
    - "AbortError como cancelación silenciosa (no error de usuario)"
key-files:
  created:
    - src/utils/compartir.js
  modified:
    - src/utils/exportPDF.js
    - src/utils/exportWhatsApp.js
    - src/utils/exportWhatsApp.test.js
    - src/components/resumen/AccionesExport.jsx
decisions:
  - "construirDocPDF extraída como builder reutilizable; generarPDF queda como envoltorio delgado (doc.save)"
  - "mensajeWhatsApp(estado, { pdfAdjunto }) con default false → linkWhatsApp y tests existentes intactos (retro-compatible)"
  - "Detección de soporte con File dummy barato ANTES de construir el PDF; en el fallback wa.me se abre sincrónicamente dentro del gesto del click (anti popup-block, fix 827f55c) y cada camino construye el doc una sola vez"
  - "Botón WhatsApp conserva la paleta Impacar (bg-impacar-campo, NO verde WhatsApp #25D366) — UI-SPEC locked"
metrics:
  duration: "5 min"
  completed: "2026-07-14T22:47:59Z"
  tasks: 3
  files: 5
---

# Quick Task 260714-pg2: Adjuntar PDF al envío por WhatsApp vía Web Share API — Summary

**One-liner:** PDF adjunto al share sheet vía Web Share API (gate canShare({files})) con fallback fiel descarga+wa.me, mensaje parametrizado por camino y botón WhatsApp async con cross-disable.

## What Was Done

### Task 1 — construirDocPDF reutilizable (commit 48350c6)
- `construirDocPDF(svgNode, estado)` exportada: arma el doc jsPDF completo (logo, plano vectorial, presupuesto, configuración, pie) y lo devuelve SIN guardar. Comentarios de decisión (Pitfalls 1-4, WR-03, T-06-09, D-11/12/13) movidos junto al código.
- `generarPDF` pasa a envoltorio delgado: `construirDocPDF` + `doc.save(nombreArchivoPDF(estado))`.
- Import dinámico de jspdf/svg2pdf preservado dentro de `construirDocPDF` (dep pesada fuera del bundle inicial — verificado en el build: chunks separados).

### Task 2 — mensajeWhatsApp parametrizado + compartir.js (TDD: RED ad213cb, GREEN 2da4453)
- RED: 4 tests nuevos en `exportWhatsApp.test.js` (omisión de la línea del PDF, contenido intacto, degradación null, anti-voseo) — visto fallar antes de implementar.
- GREEN: `mensajeWhatsApp(estado, { pdfAdjunto = false } = {})` — con `pdfAdjunto:true` omite `'Le envío aparte el PDF...'` sin línea vacía colgante; default preserva el comportamiento actual (D-10). `linkWhatsApp` sin cambios.
- `src/utils/compartir.js` nuevo: `compartirPorWhatsApp({ svgNode, estado })` → `'shared' | 'cancelled' | 'fallback'`. Gate `navigator.canShare?.({ files: [file] })`, AbortError silencioso, fallback descarga + `window.open(linkWhatsApp, '_blank', 'noopener,noreferrer')` (T-Q2-01).

### Task 3 — Botón WhatsApp async (commit e11bbe4)
- `<a href={linkWhatsApp}>` reemplazado por `<button>` async con `onCompartir`; clases Tailwind del primario conservadas + `disabled:cursor-not-allowed disabled:opacity-40`. Label `'Preparando…'` durante la generación.
- Cross-disable: WhatsApp `disabled={compartiendo || generando}`, PDF `disabled={generando || compartiendo}` (T-Q2-03: dos docs jsPDF sobre el mismo svgNode vivo nunca a la vez).
- `<p role="alert">` sobrio para `errorShare` junto al `errorPDF` existente. Sin referencias muertas a `linkWhatsApp` en el componente (grep = 0).

## Verification

- `node --test src/utils/exportPDF.test.js` — 3/3 verdes (tests existentes sin modificar).
- `node --test src/utils/exportWhatsApp.test.js` — 12/12 verdes (8 existentes intactos + 4 nuevos).
- `npm run build` — OK; jspdf/svg2pdf en chunks separados (import dinámico preservado).
- `git diff package.json` — sin dependencias nuevas.
- Pendiente UAT manual (browser-side, documentado en el plan): móvil HTTPS → share sheet con PDF adjunto y texto sin la línea del recordatorio; desktop → descarga + pestaña wa.me con la línea; cancelar la hoja no muestra alerta.

## Deviations from Plan

**Fix post-ejecución (commit 827f55c):** la verificación en browser del orquestador detectó que el
`window.open(wa.me)` del fallback quedaba popup-bloqueado por ejecutarse DESPUÉS del `await` de
`construirDocPDF` (la transient user activation del click se consume durante el trabajo async).
`compartirPorWhatsApp` se reordenó: detección de soporte con un File dummy barato (mismo
type/nombre, sin construir el PDF), `window.open(wa.me)` sincrónico dentro del gesto del click, y
la descarga del PDF después. Tests 15/15 verdes y build OK tras el fix.

## TDD Gate Compliance

- RED: `test(quick-260714-pg2)` commit ad213cb (test visto fallar).
- GREEN: `feat(quick-260714-pg2)` commit 2da4453 (12/12 verdes).
- REFACTOR: no requerido (implementación quedó limpia en GREEN).

## Known Stubs

None — no se introdujeron placeholders ni datos vacíos hacia la UI.

## Threat Flags

None — la superficie nueva (navigator.share, window.open) está cubierta en el `<threat_model>` del plan (T-Q2-01 mitigado con noopener; T-Q2-02 accept; T-Q2-03 mitigado con cross-disable).

## Commits

| Task | Commit | Type | Description |
|------|--------|------|-------------|
| 1 | 48350c6 | refactor | Extraer construirDocPDF reutilizable |
| 2 (RED) | ad213cb | test | Tests fallidos para pdfAdjunto |
| 2 (GREEN) | 2da4453 | feat | mensajeWhatsApp parametrizado + compartir.js |
| 3 | e11bbe4 | feat | Botón WhatsApp async con cross-disable |

## Self-Check: PASSED

- src/utils/compartir.js — FOUND
- construirDocPDF exportada en src/utils/exportPDF.js — FOUND
- pdfAdjunto en src/utils/exportWhatsApp.js — FOUND
- compartirPorWhatsApp en src/components/resumen/AccionesExport.jsx — FOUND
- Commits 48350c6, ad213cb, 2da4453, e11bbe4 — FOUND in git log
