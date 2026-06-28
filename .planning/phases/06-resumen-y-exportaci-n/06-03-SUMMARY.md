---
phase: 06-resumen-y-exportaci-n
plan: 03
subsystem: ui
tags: [react, jspdf, svg2pdf, whatsapp, pdf, vite, tailwind, localstorage]

# Dependency graph
requires:
  - phase: 06-resumen-y-exportaci-n (06-01)
    provides: detallePresupuesto, resumenCampos, nombreArchivoPDF, GRUPOS de categorías, FINANCIACION, CONTACTO
  - phase: 06-resumen-y-exportaci-n (06-02)
    provides: linkWhatsApp, mensajeWhatsApp (mensaje en trato de usted con Total c/IVA + recordatorio PDF)
provides:
  - "Tercera vista 'resumen' en App.jsx con estado compartido (usePersistedConfig izado)"
  - "Pantalla de cierre completa: plano final + secciones traducidas con 'Editar' + presupuesto desglosado + financiación + acciones de exportación"
  - "generarPDF(svgNode, estado): PDF A4 de 1 página con plano vectorial (jsPDF + svg2pdf.js, imports dinámicos)"
  - "Deep-links 'Editar' por sección (IR_A_PASO) que retoman el wizard con el estado intacto"
  - "Flujo de configurador cerrado de punta a punta (configurar → resumen → WhatsApp/PDF)"
affects: [futuras mejoras de exportación, ajustes de copy comercial, optimización mobile del resumen]

# Tech tracking
tech-stack:
  added: [jspdf (lazy), svg2pdf.js (lazy side-effect)]
  patterns:
    - "Lifting state up: usePersistedConfig izado a App.jsx como fuente única de verdad para wizard + resumen"
    - "Imports dinámicos de dependencias pesadas (jspdf/svg2pdf) → code-split en chunks lazy, no inflan el bundle inicial"
    - "PDF vectorial vía doc.svg(nodoVivo) en vez de html2canvas (sin rasterizar → no pixela al zoom)"
    - "Alto del plano en PDF derivado del viewBox real del SVG (no deforma)"
    - "Desglose de presupuesto data-driven con array GRUPOS (grupos vacíos omitidos)"

key-files:
  created:
    - src/components/Resumen.jsx
    - src/components/resumen/ConfigSecciones.jsx
    - src/components/resumen/PresupuestoDesglosado.jsx
    - src/components/resumen/BloqueFinanciacion.jsx
    - src/components/resumen/AccionesExport.jsx
  modified:
    - src/App.jsx
    - src/components/ConfiguratorWizard.jsx
    - src/utils/exportPDF.js

key-decisions:
  - "Lifting state up: usePersistedConfig se izó de ConfiguratorWizard a App.jsx para que el resumen lea/escriba el MISMO estado que el wizard (IR_A_PASO desde el resumen muta el estado del wizard sin divergencia de useReducers)"
  - "PDF con doc.svg (svg2pdf.js) en vez de html2canvas: vector real que no pixela al zoom (constraint de calidad del plano)"
  - "Imports dinámicos de jspdf/svg2pdf: la dep pesada queda en chunks lazy y no infla el bundle inicial (performance mobile)"
  - "Empty state disparado por uso/ocupantes null (no por modeloId): modeloId arranca en 'N4' por defecto, así que basarlo en modeloId ocultaría un resumen válido con modelo default"
  - "Total c/IVA del resumen = markup verbatim de BarraPrecio: misma suma, paridad garantizada con el wizard"

patterns-established:
  - "Estado único izado a App.jsx compartido por todas las vistas (landing/wizard/resumen)"
  - "Exportación client-side con deps pesadas lazy-loaded y plano como vector"

requirements-completed: [RESUMEN-01, RESUMEN-02, RESUMEN-03, EXPORT-01, EXPORT-02]

# Metrics
duration: ~2h (incl. checkpoint visual)
completed: 2026-06-28
---

# Phase 6 Plan 03: Pantalla de resumen + exportación PDF/WhatsApp Summary

**Pantalla de cierre del configurador (plano final + secciones con "Editar" + presupuesto desglosado + financiación) con exportación por WhatsApp y descarga de PDF A4 vectorial (jsPDF + svg2pdf.js lazy), sobre estado compartido izado a App.jsx.**

## Performance

- **Duration:** ~2h (implementación de Tasks 1-2 + checkpoint visual humano)
- **Started:** 2026-06-27T21:16:52-03:00 (commit Task 1)
- **Completed:** 2026-06-28
- **Tasks:** 3 (2 de código autónomas + 1 checkpoint:human-verify aprobado)
- **Files modified:** 8 (5 creados, 3 modificados)

## Accomplishments
- Tercera vista 'resumen' con estado compartido: `usePersistedConfig` izado a `App.jsx` como fuente única de verdad para wizard y resumen (`IR_A_PASO` desde el resumen muta el estado que lee el wizard).
- Pantalla de resumen completa: plano final (`FloorPlan` con `configDesdeEstado`), 6 secciones de configuración con nombres traducidos y "Editar" por sección, presupuesto desglosado agrupado por categoría, 3 opciones de financiación y acciones de exportación.
- Exportación por WhatsApp: `<a href={linkWhatsApp(estado)} target="_blank" rel="noopener noreferrer">` con mensaje pre-armado en trato de usted (Total c/IVA + recordatorio del PDF).
- Descarga de PDF A4 de 1 página con el plano como **vector** (jsPDF + svg2pdf.js vía `doc.svg`), logo IMPACAR, presupuesto, config condensada y contacto al pie; deps pesadas en chunks lazy.

## Task Commits

Cada task de código se commiteó atómicamente:

1. **Task 1: Izar usePersistedConfig a App.jsx + vista 'resumen' + entrada "Ver resumen y presupuesto" en el Paso 6 (D-01)** - `8dc9482` (feat)
   - Archivos: `src/App.jsx`, `src/components/ConfiguratorWizard.jsx`
2. **Task 2: Resumen.jsx (S1-S2) + ConfigSecciones/PresupuestoDesglosado/BloqueFinanciacion/AccionesExport (S3-S6) + generarPDF en exportPDF.js** - `bc4f6b8` (feat)
   - Archivos: `src/components/Resumen.jsx`, `src/components/resumen/{ConfigSecciones,PresupuestoDesglosado,BloqueFinanciacion,AccionesExport}.jsx`, `src/utils/exportPDF.js`
3. **Task 3: Checkpoint visual (PDF vectorial, deep-links "Editar", WhatsApp y financiación en el dev server)** - checkpoint:human-verify, **APROBADO** por el usuario ("aprobado"). Sin commit de código (verificación visual).

**Plan metadata:** este SUMMARY (docs: complete plan)

## Files Created/Modified
- `src/App.jsx` - Izó `usePersistedConfig`; rutea 3 vistas (landing/wizard/resumen); pasa `estado`/`dispatch`/`reiniciar` + `onVerResumen`/`onVolverEditar` por props.
- `src/components/ConfiguratorWizard.jsx` - Recibe `estado`/`dispatch`/`reiniciar` por props (ya no llama `usePersistedConfig` internamente); botón "Ver resumen y presupuesto" en el Paso 6.
- `src/components/Resumen.jsx` - Shell del resumen (header band + título "Su casilla, lista para enviar" + plano con `ref` para el PDF); empty state cuando uso/ocupantes null; cablea `onEditar` (IR_A_PASO).
- `src/components/resumen/ConfigSecciones.jsx` - 6 secciones data-driven (`resumenCampos`) con "Editar" por sección (`ACCIONES.IR_A_PASO`); "Sin selección" en faltantes.
- `src/components/resumen/PresupuestoDesglosado.jsx` - Desglose agrupado por `GRUPOS` (grupos vacíos omitidos) + líneas Neto/IVA 21%/Total c/IVA (markup verbatim de BarraPrecio) + nota orientativa.
- `src/components/resumen/BloqueFinanciacion.jsx` - `FINANCIACION.map` con las 3 opciones (solo texto, sin montos).
- `src/components/resumen/AccionesExport.jsx` - Botón WhatsApp (`<a>` con `rel="noopener noreferrer"`) + botón "Descargar PDF" (`disabled` mientras genera) + link global "Volver a editar".
- `src/utils/exportPDF.js` - Añadió `generarPDF(svgNode, estado)` async: imports dinámicos de jspdf/svg2pdf, `await doc.svg` antes de `doc.save`, alto del plano derivado del viewBox.

## Decisions Made
- **Lifting state up a App.jsx:** una sola instancia de `usePersistedConfig` evita dos `useReducer` divergentes y permite que `IR_A_PASO` desde el resumen mute el estado del wizard.
- **PDF vectorial (`doc.svg`) en vez de html2canvas:** el plano se mantiene como vector y no pixela al hacer zoom (verificado en el checkpoint).
- **Imports dinámicos de jspdf/svg2pdf:** las deps pesadas quedan en chunks lazy (`jspdf.es.min`, `svg2pdf.es.min`) y no inflan el bundle inicial.
- **Empty state por uso/ocupantes (no por modeloId):** `modeloId` arranca en 'N4' por defecto, así que el disparador real del empty es uso/ocupantes null.
- **Total c/IVA verbatim de BarraPrecio:** garantiza paridad de la suma con el wizard.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None.

## Checkpoint — Verificación visual (Task 3, APROBADA)

El usuario verificó en el dev server (~375px, target Samsung) y respondió "aprobado". Evidencia registrada:

- **RESUMEN-01** ✓ Plano N4 completo + 6 secciones con nombres traducidos + "Editar" por sección.
- **RESUMEN-02** ✓ Desglose agrupado por categoría (Dormitorio sin ítems → grupo omitido) + Neto/IVA/Total + nota orientativa. **Total c/IVA del resumen ($54.465.656) idéntico al de la BarraPrecio del wizard** (paridad de la suma).
- **RESUMEN-03** ✓ 3 opciones de financiación, solo texto.
- **EXPORT-01** ✓ Link `wa.me/5492954555113` (nº de pruebas), `rel="noopener noreferrer"`, mensaje en trato de usted con Total c/IVA + recordatorio del PDF (D-10), 830 chars (< 2000).
- **EXPORT-02** ✓ Botón "Descargar PDF"; generación sin errores de consola; pipeline `doc.svg` vectorial (no html2canvas); jspdf/svg2pdf en chunks lazy.
- **Deep-link "Editar" (D-02)** ✓ Modelo → Paso 2 con estado intacto (state izado a App.jsx funciona).
- **Suite/Build** ✓ `npm test` 98/98 verde · `npm run build` OK · identidad visual sobria correcta a 375px.

## User Setup Required
None - no requiere configuración de servicios externos (todo client-side; localStorage `impacar_config_v1`).

## Next Phase Readiness
- El flujo del configurador queda cerrado de punta a punta: configurar → resumen → enviar por WhatsApp o descargar PDF.
- Sin blockers. El número de WhatsApp es el de pruebas (5492954555113); reemplazar por el productivo en `src/data/contacto.js` antes de salir a producción.

## Self-Check: PASSED

Archivos creados verificados en disco:
- `src/components/Resumen.jsx` ✓
- `src/components/resumen/ConfigSecciones.jsx` ✓
- `src/components/resumen/PresupuestoDesglosado.jsx` ✓
- `src/components/resumen/BloqueFinanciacion.jsx` ✓
- `src/components/resumen/AccionesExport.jsx` ✓

Archivos modificados verificados:
- `src/App.jsx` ✓
- `src/components/ConfiguratorWizard.jsx` ✓
- `src/utils/exportPDF.js` ✓

Commits verificados en `git log`:
- `8dc9482` (Task 1) ✓
- `bc4f6b8` (Task 2) ✓

Verificación funcional: `npm test` 98/98 verde · `npm run build` OK.

---
*Phase: 06-resumen-y-exportaci-n*
*Completed: 2026-06-28*
