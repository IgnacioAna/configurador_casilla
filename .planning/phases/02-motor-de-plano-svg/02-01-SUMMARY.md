---
phase: 02-motor-de-plano-svg
plan: 01
subsystem: ui
tags: [svg, layout, geometry, floorplan, esm, node-test, tdd]

# Dependency graph
requires:
  - phase: 01-cimientos-y-datos
    provides: "GEOMETRIA (geometry.js), MODELOS (models.js), patrón de test node:test (formato.test.js)"
provides:
  - "calcularLayout(config): helper puro que traduce config → zonas + camas + viewBox en unidades de viewBox"
  - "M_A_U: factor de escala 100u/m (única fuente del factor metros→viewBox)"
  - "mockConfig.js: forma documentada del prop config + CONFIG_MOCK_N1/N4 + CONFIGS_MOCK"
  - "Contrato testeado del layout (zonas en orden fijo, camas con pasillo central, validación de geometría imposible)"
affects: [02-02 (FloorPlan.jsx consume calcularLayout), 02-03 (demo cicla CONFIGS_MOCK + transición), wizard (produce el prop config)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Capa de layout pura y testeable separada del render (el SVG queda declarativo)"
    - "Geometría con una sola fuente de verdad (GEOMETRIA); gate grep anti-hardcodeo"
    - "TDD con node:test built-in (RED→GREEN), sin Vitest"

key-files:
  created:
    - src/utils/floorplanLayout.js
    - src/utils/floorplanLayout.test.js
    - src/data/mockConfig.js
  modified: []

key-decisions:
  - "Coordenadas del layout con origen (0,0) en el interior del dibujo; el padding de cotas (PAD=12) se aplica en el render (viewBox) y no en las coordenadas, para que zonas y camas compartan origen."
  - "Reparto del largo restante entre baño/dormitorio/estar como ratios nombrados (22/45/33); el estar absorbe el redondeo para que la suma cierre exacta contra config.largo."
  - "El largo del config se deriva de MODELOS (nunca inventado); mockConfig genera las configs a partir del modelo real."

patterns-established:
  - "Pattern: helper de layout puro (sin React, sin DOM) que el componente consume — facilita test y animación sobre coordenadas ya calculadas"
  - "Pattern: gate anti-hardcodeo por grep en verify — toda medida física se lee de GEOMETRIA"

requirements-completed: [PLANO-04]

# Metrics
duration: 3min
completed: 2026-06-27
---

# Phase 2 Plan 01: Contrato del prop config + helper puro de layout Summary

**`calcularLayout` traduce un config a 5 zonas (orden fijo baulera|baño|dormitorio|estar|cocina), camas con pasillo central 0.92m y viewBox, leyendo toda la geometría de geometry.js — con validación de geometría imposible y 10 tests node:test en verde.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-06-27T04:43:14Z
- **Completed:** 2026-06-27T04:46:21Z
- **Tasks:** 3
- **Files modified:** 3 (creados)

## Accomplishments
- Helper puro `calcularLayout(config)` que devuelve `{ valido, zonas, camas, viewBox, totalU, anchoU, pad }`, derivado de `GEOMETRIA` y del `config`.
- 5 zonas en orden inmutable a lo largo de X; baulera/cocina fijas en 0.60m; baño/dormitorio/estar reparten el restante. Suma de largos === `config.largo` exacta.
- Camas del dormitorio en 2 filas contra cada pared larga con pasillo central de 0.92m (cierre 0.80×2 + 0.92 = 2.52 interior), todas las medidas leídas de `GEOMETRIA`.
- Validación de rango (T-02-01): un `largo` imposible devuelve `{ valido: false }` sin zonas de ancho negativo.
- Forma del prop `config` documentada en `mockConfig.js` con configs mock N1 y N4 (derivadas de `MODELOS`) listas para que el FloorPlan (02-02) y la demo (02-03) las consuman.

## Task Commits

Each task was committed atomically:

1. **Task 1: Test RED del contrato de layout** - `2bb84a4` (test) — RED, módulo inexistente
2. **Task 2: mockConfig.js + floorplanLayout.js (GREEN)** - `5c76d55` (feat) — GREEN, 8 tests pasan
3. **Task 3: Gate anti-hardcodeo + suma de control de geometría** - `cc0b6c4` (test) — checksum + transición N1/N4

**Plan metadata:** (final docs commit — ver abajo)

_TDD gate sequence verificada en git log: test(RED) → feat(GREEN) → test(guards)._

## Files Created/Modified
- `src/utils/floorplanLayout.js` - Helper puro: zonas a lo largo de X + posiciones de camas + viewBox, todo derivado de `GEOMETRIA`. Exporta `calcularLayout`, `M_A_U` (y `PAD`).
- `src/data/mockConfig.js` - Documenta la forma del prop `config`; exporta `CONFIG_MOCK_N4`, `CONFIG_MOCK_N1`, `CONFIGS_MOCK`. Deriva `largo` y camas base de `MODELOS`.
- `src/utils/floorplanLayout.test.js` - 10 tests node:test que codifican el contrato (zonas, camas, validación, checksum geométrico, transición N1↔N4).

## Decisions Made
- **Padding de cotas fuera de las coordenadas:** las zonas/camas se calculan con origen (0,0) del interior y el `PAD=12` se reserva para el render (viewBox `0 0 totalU+24 anchoU+24`). Así zonas y camas comparten origen y el test de bordes interiores (espesor de pared 0.04m → 4u) cierra sin offsets cruzados.
- **Reparto por ratios nombrados (22/45/33):** baño/dormitorio/estar reparten el largo restante; el estar absorbe el redondeo de coma flotante para que la suma de zonas === `config.largo` con tolerancia 1e-9.
- **`largo` derivado de MODELOS:** `mockConfig` nunca inventa medidas; el largo sale del modelo real por id.

## Deviations from Plan

None - plan executed exactly as written.

El único ajuste de implementación (no una desviación de alcance) fue ubicar el padding de cotas en el render en lugar de en las coordenadas, para que el contrato de camas del test (bordes interiores sin offset de padding) cerrara de forma consistente con el de zonas. Es la lectura natural del `<behavior>` del Task 1 (que mide Y desde el borde interior, sin padding) y quedó documentado como decisión arriba.

## Issues Encountered
- Inicialmente las coordenadas Y de las camas incluían el offset `PAD`, lo que entraba en conflicto con el assert del test que mide el borde interior superior desde 0 (espesor de pared 4u). Se resolvió moviendo el padding al render (viewBox) y dejando zonas y camas con origen compartido (0,0). Tests verde tras el ajuste.

## Threat Surface
- Sin superficie de seguridad nueva fuera del `<threat_model>` del plan. T-02-01 (largo imposible → `{ valido: false }`) y T-02-02 (checksum `anchoCama*2 + pasilloCentral === anchoInterior` + gate grep) quedan cubiertos por tests. T-02-03 (información en cliente) se acepta: el plano es presentacional, sin PII.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 02-02 (FloorPlan.jsx) puede consumir `calcularLayout(config)` directamente: tiene zonas con `{ id, etiqueta, x, anchoU, largoM, fill }`, camas `{ x, y, w, h, tipo }`, `viewBox`, `totalU`, `anchoU` y `pad`.
- 02-03 (demo + transición) tiene `CONFIGS_MOCK` para ciclar modelos; la transición anima sobre coordenadas ya calculadas (deterministas por modelo).
- Sin blockers.

## Self-Check: PASSED

- Archivos creados verificados en disco: `floorplanLayout.js`, `floorplanLayout.test.js`, `mockConfig.js`, `02-01-SUMMARY.md`.
- Commits verificados en git log: `2bb84a4` (test RED), `5c76d55` (feat GREEN), `cc0b6c4` (test guards).

## TDD Gate Compliance: PASSED

- RED gate: `test(02-01)` `2bb84a4` (test falla porque el módulo no existe).
- GREEN gate: `feat(02-01)` `5c76d55` (8 tests pasan).
- REFACTOR/guards gate: `test(02-01)` `cc0b6c4` (checksum + transición; 10 tests pasan).

---
*Phase: 02-motor-de-plano-svg*
*Completed: 2026-06-27*
