---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
plan: 02
subsystem: state
tags: [react, reducer, floorplan, single-source-of-truth, localstorage]

# Dependency graph
requires:
  - phase: 03-shell-estado-y-plano-base
    provides: wizardReducer + configDesdeEstado (proyección estado→plano) y usePersistedConfig (esEstadoValido)
  - phase: 04-pasos-1-3-uso-dimensiones-bano
    provides: frontera de confianza endurecida (esEstadoValido exige extras array)
provides:
  - configDesdeEstado deriva cocina/estar (horno, heladera, mesa) SOLO de extras[] (D-14)
  - estadoInicial sin placeholders cocina/estar (una sola fuente de verdad para el plano)
  - tolerancia a extras no-array/ausente sin crashear (T-05-05)
affects: [floorplan, kitchen-module, paso-cocina-estar, motor-precios, paso-extras]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Proyección data-driven estado→plano: el shape de salida se DERIVA de extras[], no se lee de campos placeholder"
    - "Hardening de frontera (localStorage→proyección) con Array.isArray + defaults neutros"

key-files:
  created: []
  modified:
    - src/state/wizardReducer.js
    - src/state/wizardReducer.test.js

key-decisions:
  - "D-14: el plano deriva horno/heladera/mesa de extras[] (una sola fuente), no de estado.cocina/estado.estar"
  - "estadoInicial elimina cocina/estar; el shape de salida de configDesdeEstado se mantiene idéntico (6 keys)"
  - "Estado legacy con cocina/estar se IGNORA (no se lee); sin migración (campos viejos descartados, nuevos arrancan vacíos)"

patterns-established:
  - "Single source of truth: una sola colección (extras[]) alimenta a la vez el plano y el motor de precios; cero campos duplicados"
  - "Proyección tolerante a tampering: Array.isArray(estado.extras) ? estado.extras : [] antes de derivar"

requirements-completed: [COCINA-01, COCINA-02, COCINA-03, COCINA-04]

# Metrics
duration: 3min
completed: 2026-06-27
---

# Phase 5 Plan 02: configDesdeEstado data-driven desde extras[] (D-14) Summary

**configDesdeEstado ahora deriva horno/heladera/mesa exclusivamente de extras[] (una sola fuente de verdad), eliminando los placeholders cocina/estar de estadoInicial sin cambiar el shape de 6 keys que consume FloorPlan.**

## Performance

- **Duration:** ~3 min
- **Started:** 2026-06-27T20:29:19Z
- **Completed:** 2026-06-27T20:31:39Z
- **Tasks:** 1 (TDD: RED → GREEN, sin REFACTOR necesario)
- **Files modified:** 2

## Accomplishments

- `configDesdeEstado(estado)` deriva `cocina = { horno, heladera }` y `estar = { mesa }` desde `extras[]` (ids reales `cocina-horno` / `heladera-220` / `heladera-12v` / `mesa-cano`), eliminando la doble fuente de verdad (Pitfall 3).
- `estadoInicial` ya no carga los placeholders `cocina`/`estar`; `copiaEstadoInicial()` deja de clonarlos. El shape de salida de la proyección se mantiene EXACTO (las 6 keys `bano,cocina,dormitorio,estar,largo,modeloId` que lee el plano).
- Frontera localStorage→proyección endurecida (T-05-05): `extras` no-array o ausente cae a `[]` vía `Array.isArray`, derivando cocina/estar a defaults neutros (`{horno:false,heladera:null}`, `{mesa:false}`) sin crashear. Estado legacy con `cocina`/`estar` se ignora.
- Tests del reducer ajustados (Pitfall 4: reducer + su test como unidad) y ampliados con 7 casos D-14 + tampering. `node --test` (17 tests) y `npm test` (69 tests) verdes; `npm run build` OK.

## Task Commits

Each task was committed atomically (TDD cycle):

1. **Task 1 (RED): tests D-14 fallando** - `5d16244` (test)
2. **Task 1 (GREEN): derivación desde extras[]** - `e8a0282` (feat)

_REFACTOR: no necesario — implementación limpia y comentada en el commit GREEN (ternario claro para heladera, sin duplicación)._

## Files Created/Modified

- `src/state/wizardReducer.js` - `estadoInicial` sin cocina/estar; `copiaEstadoInicial` sin clonarlos; `configDesdeEstado` reescrito para DERIVAR cocina/estar de `extras[]` con guarda `Array.isArray` y defaults neutros.
- `src/state/wizardReducer.test.js` - aserciones de `estadoInicial.cocina/estar` ajustadas a `undefined`; aserción RESET sobre `cocina` removida; 7 tests nuevos de derivación D-14 (horno, heladera 220/12v, mesa, combinación) + tampering T-05-05 (extras no-array/ausente).

## Decisions Made

- **D-14 aplicado tal cual el plan:** una sola fuente (`extras[]`) para el horno/heladera/mesa del plano y del motor de precios. No se leen `estado.cocina`/`estado.estar`.
- **Sin migración de estado legacy:** los campos viejos `cocina`/`estar` persistidos se ignoran silenciosamente; los nuevos arrancan derivados de `extras` vacío. `esEstadoValido` no se relaja (sigue exigiendo `extras` array) — confirmado por lectura, sin cambios.
- **REFACTOR omitido:** la implementación GREEN ya es la forma más clara (ternario para `heladera`, comentarios D-14/T-05-05). No se introdujo un commit refactor vacío.

## Deviations from Plan

None - plan executed exactly as written.

El plan ya anticipaba Pitfall 4 (ajustar el test en el mismo plan) y la guarda `Array.isArray` (T-05-05); ambos se aplicaron como estaban especificados, sin desviaciones ni auto-fixes adicionales.

## Issues Encountered

None. La verificación lateral confirmó coherencia con el resto del código: el test de precios existente "una sola fuente: estado.cocina.horno NO suma (solo extras[] suma)" ya pasaba y refuerza el mismo invariante D-14 desde el motor de precios.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `configDesdeEstado` es ahora el punto único de proyección estado→plano alimentado por `extras[]`. El plano (FloorPlan/Kitchen/Table) sigue consumiendo `config.cocina`/`config.estar` sin cambios — Wave 2 puede dibujar horno/heladera/mesa data-driven sin riesgo de desincronización.
- El Paso Cocina/Estar y el Paso Extras escriben/leen únicamente `extras[]`; no hay campos placeholder que mantener sincronizados.

## TDD Gate Compliance

- RED gate: `5d16244` (test) — 7 tests fallando antes de implementar.
- GREEN gate: `e8a0282` (feat) — 17/17 reducer + 69/69 suite verdes.
- REFACTOR: no requerido (implementación final ya limpia).

---
*Phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios*
*Completed: 2026-06-27*
