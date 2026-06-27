---
phase: 04-pasos-1-3-uso-dimensiones-ba-o
plan: 01
subsystem: testing
tags: [node-test, tdd, pure-helpers, floorplan, geometry, bano-ampliado]

# Dependency graph
requires:
  - phase: 01-cimientos-y-datos
    provides: "MODELOS + SUGERENCIA_OCUPANTES (data/models.js), GEOMETRIA (data/geometry.js)"
  - phase: 02-motor-de-plano-svg
    provides: "calcularLayout (floorplanLayout.js) — helper puro de layout que ahora se extiende"
provides:
  - "permiteBanoAmpliado(modeloId) + LARGO_MIN_BANO_AMPLIADO — contrato de habilitación de baño (BANO-02)"
  - "calcularLayout sensible a config.bano.tamano: la zona baño crece con 'ampliado' (BANO-03)"
  - "Garantía de datos USO-03: SUGERENCIA_OCUPANTES mapea a ids reales y cubre 2/3/4/5/6/8"
  - "Script npm test que corre la suite node:test completa"
affects: [PasoDimensiones, PasoBano, wizard, Wave-2, Wave-3]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Interface-first: la lógica pura testeable se construye antes que los componentes que la consumen"
    - "Umbral data-driven derivado de MODELOS.largo, nunca lista de ids hardcodeada (gate anti-hardcodeo)"
    - "Optional chaining + fallback (?.largo ?? 0 / config?.bano?.tamano) para tolerar estado adulterado de localStorage"
    - "El estar absorbe el residuo del reparto → la suma de zonas cierra exacta contra config.largo"

key-files:
  created:
    - src/utils/banoReglas.js
    - src/utils/banoReglas.test.js
    - src/data/models.test.js
  modified:
    - src/utils/floorplanLayout.js
    - src/utils/floorplanLayout.test.js
    - package.json

key-decisions:
  - "El umbral de baño ampliado vive como constante nombrada LARGO_MIN_BANO_AMPLIADO=6.1 derivada del largo de N3, no como lista de ids — mantiene el gate anti-hardcodeo de fases previas."
  - "RATIO_BANO se parametriza por tamaño (estandar=0.22, ampliado=0.30) y RATIO_ESTAR se elimina como constante fija: el estar absorbe el residuo para que la suma cierre exacta."
  - "Optional chaining obligatorio en permiteBanoAmpliado y en la selección de ratio: un modeloId o bano.tamano adulterado cae a default seguro (estándar) sin crashear (T-04-01/T-04-02)."
  - "Sin dependencias de test nuevas: la suite sigue con node:test built-in (decisión 01-02); el script test lista archivos explícitamente para no depender de glob ** del shell."

patterns-established:
  - "TDD RED→GREEN por tarea con node:test: el test falla primero, luego la implementación mínima lo pone verde."
  - "Tests de datos (models.test.js) como characterization de invariantes de datos existentes (USO-03), sin tocar la fuente."

requirements-completed: [USO-03, BANO-02, BANO-03]

# Metrics
duration: 4min
completed: 2026-06-27
---

# Phase 4 Plan 01: Capa de lógica pura de Pasos 1-3 (Uso/Dimensiones/Baño) Summary

**Helper puro `banoReglas` con umbral de baño ampliado data-driven (N3=6,1m), `calcularLayout` que agranda la zona baño con `tamano:'ampliado'` manteniendo la suma exacta, y la sugerencia de modelo verificada contra ids reales — todo en node:test, sin dependencias nuevas.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-27T14:35:18Z
- **Completed:** 2026-06-27T14:39:31Z
- **Tasks:** 4
- **Files modified:** 6 (3 creados, 3 modificados)

## Accomplishments

- **BANO-02:** `permiteBanoAmpliado(modeloId)` deriva el umbral del largo del modelo (`MODELOS.find(...)?.largo ?? 0 >= LARGO_MIN_BANO_AMPLIADO`), sin lista de ids hardcodeada; N1/N2 → false, N3-N7 → true, id inexistente → false sin crashear.
- **USO-03:** `src/data/models.test.js` garantiza que cada valor de `SUGERENCIA_OCUPANTES` apunta a un id real de `MODELOS` y que las 6 opciones de ocupantes (2/3/4/5/6/8) están cubiertas.
- **BANO-03:** `calcularLayout` selecciona `RATIO_BANO_AMPLIADO=0.30` cuando `config.bano.tamano === 'ampliado'` (estándar `0.22` en otro caso); la zona baño crece, la suma de las 5 zonas sigue === `config.largo`, y N3 ampliado no degenera ninguna zona central.
- **Suite única:** `npm test` corre 33 tests (banoReglas 4 + models 2 + floorplanLayout 13 + formato + wizardReducer) verdes con node:test built-in, sin dependencias agregadas.

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Tarea 1: Helper puro banoReglas.js (BANO-02) + suite** — `de28034` (feat, TDD RED→GREEN combinado)
2. **Tarea 2: Test de datos models.test.js (USO-03)** — `eca884b` (test)
3. **Tarea 3: BANO-03 — RATIO_BANO por tamaño + 3 tests** — `861b92f` (feat, TDD RED→GREEN)
4. **Tarea 4: Script npm test en package.json** — `3d0e6b9` (chore)

_Nota: las tareas TDD (1 y 3) tuvieron ciclo RED→GREEN dentro de un único commit feat, porque el test importa el módulo/comportamiento que la misma tarea introduce._

## Files Created/Modified

- `src/utils/banoReglas.js` — Helper puro: `permiteBanoAmpliado(modeloId)` + `LARGO_MIN_BANO_AMPLIADO=6.1`, umbral derivado de `MODELOS.largo`.
- `src/utils/banoReglas.test.js` — 4 tests BANO-02 (N1/N2 false, N3-N7 true, id inexistente false, umbral 6.1).
- `src/data/models.test.js` — 2 tests USO-03 (sugerencia → ids reales, cobertura 2/3/4/5/6/8); no modifica `models.js`.
- `src/utils/floorplanLayout.js` — `RATIO_BANO_ESTANDAR`/`RATIO_BANO_AMPLIADO`, selección por `config?.bano?.tamano`; `RATIO_ESTAR` eliminado (el estar absorbe el residuo); guarda `{ valido: false }` intacta.
- `src/utils/floorplanLayout.test.js` — +3 tests BANO-03 (ampliado>estandar, suma exacta, N3 sin zonas degeneradas).
- `package.json` — script `test` con `node --test` listando los archivos explícitamente.

## Decisions Made

- **Umbral como constante data-driven, no lista de ids:** `LARGO_MIN_BANO_AMPLIADO=6.1` (largo de N3) + `MODELOS.find`, para sostener el gate anti-hardcodeo de fases previas.
- **`RATIO_ESTAR` eliminado:** el estar absorbe el residuo del reparto; así `largoBano + largoDormitorio + largoEstar === restante` exacto aun cuando el ratio del baño cambia.
- **Defaults seguros con optional chaining:** `modeloId` o `bano.tamano` adulterado de localStorage cae a baño estándar sin crashear (mitigaciones T-04-01 / T-04-02 del threat model).
- **Sin Vitest/Jest:** se mantiene node:test built-in (decisión 01-02); el script lista los archivos en vez de usar glob `**` (no portable entre shells).

## Deviations from Plan

None - plan executed exactly as written.

El único ajuste fue de redacción de comentarios (no de lógica) para satisfacer los grep literales del HARD GATE de acceptance criteria: el comentario de la Tarea 3 originalmente contenía el token `RATIO_ESTAR` (criterio AC4 exige `grep -c "RATIO_ESTAR" === 0`) y el encabezado de sección de tests contenía un cuarto `BANO-03` (criterio AC6 exige `=== 3`). Ambos comentarios se reescribieron preservando su intención documental. No afecta comportamiento ni cobertura; los 3 tests BANO-03 y la eliminación efectiva del ratio fijo del estar se mantienen.

---

**Total deviations:** 0 funcionales (2 ajustes de redacción de comentarios para alinear con los grep literales del gate).
**Impact on plan:** Ninguno — sin cambios de comportamiento, sin scope creep, sin dependencias nuevas.

## Issues Encountered

- **Conteo de tests del plan (estimación):** el plan estimaba "11 tests previos + 3 = 14" en `floorplanLayout.test.js`. La suite previa real tenía 10 tests, así que el total es 13 (10 + 3), no 14. Los 3 tests BANO-03 están presentes y verdes; ningún test previo se rompió. Discrepancia de estimación, no de implementación.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- El contrato que `PasoDimensiones.jsx` (Wave 2) y `PasoBano.jsx` (Wave 3) importan está listo y testeado: `permiteBanoAmpliado` decide si ofrecer baño ampliado, `SUGERENCIA_OCUPANTES` sugiere el modelo, y `calcularLayout` ya refleja `bano.tamano` en el plano.
- Sin blockers. Las mitigaciones de tampering/DoS quedan cubiertas por tests, listas para que los componentes consuman estado adulterado de localStorage sin defensas adicionales.

---
*Phase: 04-pasos-1-3-uso-dimensiones-ba-o*
*Completed: 2026-06-27*

## Self-Check: PASSED

- Archivos creados/modificados verificados en disco: banoReglas.js, banoReglas.test.js, models.test.js, floorplanLayout.js, floorplanLayout.test.js, package.json, 04-01-SUMMARY.md.
- Commits verificados en git: de28034 (T1), eca884b (T2), 861b92f (T3), 3d0e6b9 (T4).
- `npm test`: 33 tests, 0 fallos. Gates anti-hardcodeo: `RATIO_ESTAR`=0, `RATIO_BANO_AMPLIADO`=2, guarda `valido: false` intacta.
