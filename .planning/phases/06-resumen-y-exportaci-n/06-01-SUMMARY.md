---
phase: 06-resumen-y-exportaci-n
plan: 01
subsystem: pricing
tags: [jspdf, svg2pdf, node-test, pure-utils, pricing, whatsapp, pdf]

# Dependency graph
requires:
  - phase: 05 (modelo y precio)
    provides: calcularPresupuesto(estado) + formato.js (formatPrecio/calcularIVA/calcularTotal) + EXTRAS con categoria/subgrupo
  - phase: 04 (wizard)
    provides: estadoInicial / configDesdeEstado / USOS (PasoUso) / TIPOS (PasoDormitorio) / labels de baño
provides:
  - "detallePresupuesto(estado): desglose ítem-por-ítem { items, neto, iva, total } compuesto sobre calcularPresupuesto (una sola fuente de la suma)"
  - "resumenCampos(estado): traduce ids→nombres reales para el resumen y el mensaje WhatsApp, con degradación a 'Sin selección'"
  - "nombreArchivoPDF(estado): nombre del archivo PDF descargado (presupuesto-impacar-<modelo|sin-modelo>.pdf)"
  - "jspdf@4.2.1 + svg2pdf.js@2.7.0 instaladas (runtime) con versión exacta — listas para el handler browser de 06-03"
affects: [06-02 (exportWhatsApp consume detallePresupuesto + resumenCampos), 06-03 (componentes del resumen + generarPDF browser consumen las 3 utilidades), 07 (pulido)]

# Tech tracking
tech-stack:
  added: [jspdf@4.2.1, svg2pdf.js@2.7.0]
  patterns: ["composición sobre la fuente única de la suma (detallePresupuesto NO re-suma)", "traducción id→label data-driven con degradación 'Sin selección'", "parte pura testeable separada del handler browser (nombreArchivoPDF vs generarPDF)"]

key-files:
  created: [src/utils/resumenCampos.js, src/utils/resumenCampos.test.js, src/utils/exportPDF.js, src/utils/exportPDF.test.js]
  modified: [src/utils/motorPrecios.js, src/utils/motorPrecios.test.js, package.json, package-lock.json]

key-decisions:
  - "detallePresupuesto compone sobre calcularPresupuesto (delega neto/iva/total) — nunca re-sumar, para no divergir del total de BarraPrecio (D-05)"
  - "USOS y TIPOS se DUPLICAN en resumenCampos.js (no están exportados desde los pasos) con nota de sincronización, en vez de mover los originales (no compartir archivos entre planes de la misma wave)"
  - "Versiones exactas pinneadas a mano (npm escribió con caret ^; se editó a 4.2.1 / 2.7.0 sin caret, D-11)"
  - "El texto de camas pluraliza (1 cucheta, 2 cuchetas) para legibilidad en el resumen y el mensaje WhatsApp"

patterns-established:
  - "Composición sobre fuente única de la suma: helper de desglose que delega totales en la función base ya testeada"
  - "Degradación elegante en utilidades de presentación: campo faltante → 'Sin selección' / 'Modelo no disponible', nunca undefined/''/'null'"
  - "Parte pura vs browser: nombreArchivoPDF (puro, node:test) separada de generarPDF (DOM/descarga, validación manual en dev server, 06-03)"

requirements-completed: [RESUMEN-01, RESUMEN-02, EXPORT-02]

# Metrics
duration: ~20min
completed: 2026-06-28
---

# Phase 6 Plan 01: Lógica pura del cierre + deps del PDF Summary

**Tres utilidades puras del resumen (detallePresupuesto, resumenCampos, nombreArchivoPDF) con node:test en verde, más jspdf@4.2.1 + svg2pdf.js@2.7.0 instaladas con versión exacta — interface-first, antes de cualquier componente.**

## Performance

- **Duration:** ~20 min
- **Started:** 2026-06-27T23:43:00Z (aprox.)
- **Completed:** 2026-06-28T00:03:09Z
- **Tasks:** 3 (2 con ciclo TDD RED/GREEN)
- **Files modified:** 8 (4 creados, 4 modificados)

## Accomplishments
- `detallePresupuesto(estado)` extiende `motorPrecios.js`: devuelve `{ items, neto, iva, total }` con el ítem base del modelo + cada accesorio (con `categoria`/`subgrupo` para agrupar en S4), **componiendo sobre** `calcularPresupuesto` — los totales son idénticos byte a byte, sin segunda fuente de la suma (RESUMEN-02).
- `resumenCampos(estado)` traduce ids→nombres reales (uso, modelo+largo con coma decimal, baño Estándar/Ampliado, camas C/S/M con cantidades, cocina/heladera/mesa, extras de confort/energía) y degrada a `'Sin selección'` / `'Modelo no disponible'` sin nunca producir `undefined`/`''`/`'null'` (RESUMEN-01).
- `nombreArchivoPDF(estado)` produce `presupuesto-impacar-<modeloId>.pdf` y `...-sin-modelo.pdf`; el handler browser `generarPDF` queda documentado para 06-03 (EXPORT-02).
- `jspdf@4.2.1` + `svg2pdf.js@2.7.0` en `dependencies` con versión exacta (D-11); los 3 test files de la fase registrados en el script `test`.
- Toda la lógica tolera estado adulterado de localStorage (modeloId inexistente, extras/camas no-array, estado null) sin `$NaN` ni crash. 90 tests en verde.

## Task Commits

Cada tarea se commiteó atómicamente (con hooks, sin --no-verify):

1. **Task 1: Instalar jspdf+svg2pdf.js y registrar tests** - `df20b8a` (chore)
2. **Task 2: detallePresupuesto + tests (TDD)** - `8b39b15` (test RED) → `171e525` (feat GREEN)
3. **Task 3: resumenCampos + nombreArchivoPDF + tests (TDD)** - `bd3583d` (test RED) → `2e036d6` (feat GREEN)

**Plan metadata:** (este SUMMARY — commit docs aparte)

_Nota: las tareas TDD tienen dos commits (test rojo → feat verde); no hizo falta refactor en ninguna._

## Files Created/Modified
- `src/utils/motorPrecios.js` - Añade `detallePresupuesto(estado)` junto a `calcularPresupuesto` (no la reescribe); delega neto/iva/total.
- `src/utils/motorPrecios.test.js` - +8 tests de desglose (ítems, orden de EXTRAS, agrupación, paridad de totales, estado adulterado).
- `src/utils/resumenCampos.js` - NUEVO. Traducción estado→labels legibles, data-driven (MODELOS/EXTRAS) + USOS/TIPOS duplicados.
- `src/utils/resumenCampos.test.js` - NUEVO. 9 tests (traducción completa, 'Sin selección', tolerancia a tampering).
- `src/utils/exportPDF.js` - NUEVO. `nombreArchivoPDF` (puro) + placeholder documentado para `generarPDF` (06-03).
- `src/utils/exportPDF.test.js` - NUEVO. 3 tests del filename (con modelo, sin modelo, null).
- `package.json` - jspdf 4.2.1 + svg2pdf.js 2.7.0 (exactas) + 3 test files en el script `test`.
- `package-lock.json` - Lockfile de las deps nuevas.

## Decisions Made
- **detallePresupuesto compone, no re-suma** (D-05): `const { neto, iva, total } = calcularPresupuesto(estado)`. Re-`reduce` aquí divergiría del total de `BarraPrecio` por redondeo.
- **USOS/TIPOS duplicados** dentro de `resumenCampos.js` con nota `// Conjunto de UI duplicado … mantener sincronizado`. Los originales (PasoUso/PasoDormitorio) no están exportados; moverlos implicaría compartir archivos entre planes de la misma wave (06-02 también corre en Wave 1).
- **Versiones exactas a mano**: npm instaló con caret (`^4.2.1`); se editó `package.json` a `4.2.1` / `2.7.0` sin caret para cumplir D-11.
- **Pluralización de camas** ("1 cucheta" / "2 cuchetas") para que el texto del resumen y del mensaje WhatsApp lea natural.

## Deviations from Plan

None - plan executed exactly as written.

Las tres utilidades, sus contratos (exports, shapes de salida), labels y el cuerpo de `detallePresupuesto` se implementaron verbatim según el plan/RESEARCH. El único ajuste menor de redacción (pluralización del texto de camas) está dentro de la discreción del executor sobre el "texto legible" que el plan dejó abierto en `<behavior>` ("ej. '2 cucheta marinera, 1 matrimonial' o C/S/M con cantidades").

## Issues Encountered
- **npm escribió las deps con caret** (`^4.2.1` / `^2.7.0`) pese a `npm install <pkg>@<ver>`. Resuelto editando `package.json` a versión exacta, como anticipaba la propia acción de la Task 1 ("si quedara con `^`, editá package.json").
- **`exportWhatsApp.test.js` aún no existe** (lo crea 06-02 en la misma wave). Se registró en el script `test` igual (este plan es el único dueño de `package.json` en Wave 1). Verificado: `npm test` sale 0 y corre 90 tests — el runner `node --test` tolera el path inexistente sin error y lo tomará cuando 06-02 lo cree.

## Security / Threat notes
- **T-06-01 (Tampering, mitigate):** cubierto — `Array.isArray` + optional chaining en `detallePresupuesto` y `resumenCampos`; tests de modeloId inexistente, extras/camas no-array y estado null confirman degradación sin `$NaN`.
- **T-06-02 (supply chain, mitigate):** versiones exactas pinneadas; `npm audit --omit=dev` reporta **0 vulnerabilidades** para las deps de runtime. (Ver Deferred Issues sobre el aviso de devDependencies.)
- **T-06-03 (info disclosure, accept):** el filename usa solo el modeloId (id de catálogo público N1-N7), sin PII.

## Deferred Issues
- **Aviso de seguridad en devDependencies (fuera de scope):** `npm install` reportó 2 vulnerabilidades en el toolchain de build (`esbuild`/`vite`, 1 moderate + 1 high), **preexistentes y NO introducidas por este plan**. El gate del plan (`npm audit --omit=dev` para las deps de runtime) está limpio (0 vulnerabilidades). El aviso de `vite`/`esbuild` requeriría un bump mayor de `vite` (breaking change del build) — anotado en `deferred-items.md` de la fase; no es competencia de esta tarea de lógica pura.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- **06-02** puede ensamblar `exportWhatsApp.js` (mensajeWhatsApp/linkWhatsApp) sobre `detallePresupuesto` + `resumenCampos` ya verificados; su `exportWhatsApp.test.js` ya está registrado en el script `test`.
- **06-03** puede construir `PresupuestoDesglosado.jsx` (consume `detallePresupuesto`), `ConfigSecciones.jsx` (consume `resumenCampos`) y el handler browser `generarPDF` en `exportPDF.js` (jspdf + svg2pdf.js ya instaladas), usando `nombreArchivoPDF` para la descarga.
- Sin blockers. La lógica pura del cierre está aislada y testeada.

## Self-Check: PASSED

- Archivos verificados en disco: motorPrecios.js, motorPrecios.test.js, resumenCampos.js, resumenCampos.test.js, exportPDF.js, exportPDF.test.js, package.json, 06-01-SUMMARY.md — todos FOUND.
- Commits verificados en git: df20b8a (chore), 8b39b15 (test RED), 171e525 (feat GREEN), bd3583d (test RED), 2e036d6 (feat GREEN) — todos FOUND.
- Suite: `npm test` → 90 tests, 90 pass, 0 fail (exit 0).
- Versiones exactas: jspdf 4.2.1 / svg2pdf.js 2.7.0 confirmadas por el verify de Task 1 (OK).

---
*Phase: 06-resumen-y-exportaci-n*
*Completed: 2026-06-28*
