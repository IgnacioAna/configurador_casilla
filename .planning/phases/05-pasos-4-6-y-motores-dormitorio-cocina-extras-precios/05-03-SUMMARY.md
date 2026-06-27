---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
plan: 03
subsystem: ui
tags: [react, tailwind, wizard, stepper, radiogroup, data-driven, extras]

# Dependency graph
requires:
  - phase: 05-01
    provides: validacionCamas.camasEntran + metadato subgrupo en data/extras.js (confort/energia)
  - phase: 05-02
    provides: configDesdeEstado deriva cocina/heladera/mesa de extras[] (D-14) — el plano reacciona solo
  - phase: 04
    provides: patrón presentacional PasoBano/PasoUso ({ estado, dispatch }), tokens impacar-*, toggle inmutable
provides:
  - PasoDormitorio.jsx — steppers C/S/M con tope M=1 + advertencia de capacidad cobre no bloqueante
  - PasoCocina.jsx — toggle horno + selector exclusivo de heladera (Sin/220V/12V) + toggles estar
  - PasoExtras.jsx — 9 extras agrupados Confort/Energía por subgrupo (data-driven)
affects: [05-04-barra-precio, 05-05-pasosRegistro, fase-6-resumen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Stepper +/- por tipo sobre Array<{tipo}> inmutable (Pattern 4)"
    - "Selector radio exclusivo sobre extras[] derivando ids por prefijo (Pattern 2, anti-hardcodeo)"
    - "Split de catálogo por metadato subgrupo data-driven (Pattern 3)"

key-files:
  created:
    - src/components/wizard/pasos/PasoDormitorio.jsx
    - src/components/wizard/pasos/PasoCocina.jsx
    - src/components/wizard/pasos/PasoExtras.jsx
  modified: []

key-decisions:
  - "Ids de heladera derivados por prefijo 'heladera-' de EXTRAS (no array literal) — anti-hardcodeo + tolera ids desconocidos"
  - "Extras agrupados por metadato subgrupo (no por lista de ids) — split confort/energía vive con el dato"
  - "Advertencia de capacidad nunca deshabilita navegación (D-03); el botón Siguiente vive en la cáscara"
  - "Componentes creados pero NO enchufados — pasosRegistro.jsx es file ownership exclusivo del Plan 05-05"

patterns-established:
  - "Stepper de camas: helpers contar/agregar/quitar con array nuevo (spread/filter), tope por tipo en agregar()"
  - "Selector exclusivo de heladera: filtrar AMBOS ids + agregar elegido garantiza exclusividad mutua"
  - "Tolerancia a estado adulterado: Array.isArray(...) ? ... : [] y optional chaining en todo handler (T-05-08)"

requirements-completed: [DORM-01, DORM-02, DORM-03, COCINA-01, COCINA-02, COCINA-03, EXTRAS-01]

# Metrics
duration: 3min
completed: 2026-06-27
---

# Phase 5 Plan 03: Pasos 4-6 (Dormitorio / Cocina / Extras) Summary

**Tres componentes presentacionales desacoplados — steppers de camas C/S/M con advertencia de capacidad cobre, selector exclusivo de heladera sobre extras[], y extras agrupados Confort/Energía data-driven por metadato subgrupo.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-27T20:33:52Z
- **Completed:** 2026-06-27T20:36:52Z
- **Tasks:** 3
- **Files modified:** 3 (created)

## Accomplishments
- **PasoDormitorio (DORM-01/02/03):** 3 steppers +/− por tipo (Cucheta/Simple/Matrimonial); matrimonial topea en 1 (botón + deshabilitado + nota "Máximo 1 matrimonial por casilla."); advertencia cobre no bloqueante vía `camasEntran` cuando la combinación no entra; nota "se arma a medida" para modelos personalizables N5-N7.
- **PasoCocina (COCINA-01/02/03):** toggle horno + toggles mesa/banco (checkboxes en extras[]); selector exclusivo de heladera (Sin / 220V A++ / 12V c/pantalla) con `role="radiogroup"`; ids de heladera derivados por prefijo de EXTRAS; elegir una quita la otra (exclusividad mutua garantizada por el handler).
- **PasoExtras (EXTRAS-01):** los 9 extras `categoria:'extras'` agrupados en Confort (7) y Energía (2) por metadato `subgrupo` (data-driven, sin ids hardcodeados); cada extra con checkbox + precio caption `formatPrecio(e.precioNeto)`.
- Los 3 escriben en `extras[]` / `dormitorio.camas` con arrays inmutables; ninguno importa ni renderiza el plano — el plano reacciona solo vía `configDesdeEstado`.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Task 1: PasoDormitorio — steppers C/S/M + advertencia de capacidad** - `fb2cbba` (feat)
2. **Task 2: PasoCocina — horno + selector exclusivo de heladera + estar** - `0beb8c5` (feat)
3. **Task 3: PasoExtras — extras agrupados Confort/Energía por subgrupo** - `b477aee` (feat)

**Plan metadata:** (este SUMMARY + commit docs)

## Files Created/Modified
- `src/components/wizard/pasos/PasoDormitorio.jsx` (131 líneas) - Steppers C/S/M con tope M=1, advertencia de capacidad cobre no bloqueante, nota "a medida" para N5-N7. Consume `camasEntran` y `MODELOS`.
- `src/components/wizard/pasos/PasoCocina.jsx` (113 líneas) - Toggle horno + selector radio exclusivo de heladera (ids por prefijo de EXTRAS) + toggles mesa/banco. Importa `EXTRAS`.
- `src/components/wizard/pasos/PasoExtras.jsx` (74 líneas) - 9 extras agrupados Confort/Energía por metadato `subgrupo`; checkbox + precio caption. Importa `EXTRAS` y `formatPrecio`.

## Decisions Made
- **Ids de heladera derivados por prefijo** (`e.id.startsWith('heladera-')`) en lugar de array literal — cumple el gate anti-hardcodeo y tolera ids desconocidos en extras[] (los preserva, solo quita los de heladera). T-05-09.
- **Split confort/energía por metadato `subgrupo`** (no por lista de ids en el componente) — el split vive con el dato (`data/extras.js`), agrupado data-driven (Pattern 3).
- **La advertencia de capacidad nunca bloquea** (D-03): es un aviso cobre, no un error; el botón "Siguiente" vive en la cáscara del wizard, fuera del alcance del paso.
- **Componentes creados pero NO enchufados:** `pasosRegistro.jsx` es file ownership exclusivo del Plan 05-05 (mismo patrón que Fase 4). Por eso `npm run build` los compila pero aún no entran al bundle de la app.

## Deviations from Plan

None - plan executed exactly as written.

Nota menor (no es una deviation de comportamiento): en `PasoDormitorio.jsx` un comentario interno mencionaba "PlanoPanel" como destino de la reacción del plano; se reescribió a "panel del plano" para satisfacer el gate literal del acceptance criterion (`NO contiene PlanoPanel`), que verifica el desacople del paso respecto del plano. Sin cambio de lógica ni de UI.

## Issues Encountered
None.

## Verification Results
- **esbuild (los 3 componentes):** compilan sin errores (`--bundle --format=esm --external:react --external:../*`).
- **`npm test`:** 69 tests pass, 0 fail (motores de Wave 1 intactos).
- **`npm run build`:** OK (vite, 54 módulos transformados, built in ~1s).
- **Gate anti-hardcodeo:** heladera por prefijo, extras por subgrupo, sin listas de ids literales en los componentes (verificado por grep).
- **Gate anti-voseo (UX-03):** 0 matches de voseo; copy en trato de usted ("Arme", "Sume", "Le sugerimos").
- **Desacople:** ningún paso contiene `FloorPlan` ni `PlanoPanel` ni `.push(`/`.splice(`.

## Next Phase Readiness
- Plan 05-04 (BarraPrecio) puede sumar `extras[]` — los 3 pasos escriben en la única fuente de verdad.
- Plan 05-05 (pasosRegistro) puede enchufar los 3 componentes al wizard (file ownership exclusivo).
- Sin blockers.

## Self-Check: PASSED

- FOUND: src/components/wizard/pasos/PasoDormitorio.jsx
- FOUND: src/components/wizard/pasos/PasoCocina.jsx
- FOUND: src/components/wizard/pasos/PasoExtras.jsx
- FOUND: .planning/phases/05-.../05-03-SUMMARY.md
- FOUND commit fb2cbba (Task 1), 0beb8c5 (Task 2), b477aee (Task 3)
- STATE.md / ROADMAP.md NOT modified by executor (orchestrator-owned)

---
*Phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios*
*Completed: 2026-06-27*
