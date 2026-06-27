---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
plan: 01
subsystem: testing
tags: [node-test, pricing-engine, validation, data-driven, esm, vite]

# Dependency graph
requires:
  - phase: 03-datos-y-estado
    provides: "MODELOS (camasBase/personalizable/precioNeto), EXTRAS (id/precioNeto/categoria)"
  - phase: 04-plano-y-reglas
    provides: "formato.js (calcularIVA/calcularTotal/formatPrecio), patrón de helper puro testeable (banoReglas.js)"
provides:
  - "validacionCamas.js: capacidadFootprints / footprintsDeCamas / camasEntran (DORM-02)"
  - "motorPrecios.js: calcularPresupuesto(estado) → {neto, iva, total} desde una sola fuente extras[] (PRECIO-01)"
  - "extras.js: metadato subgrupo data-driven (7 confort + 2 energía) en los 9 'extras' (D-08)"
  - "package.json: script test ampliado con los 3 archivos nuevos (Pitfall 5 resuelto)"
affects: [PasoDormitorio, PasoCocina, PasoExtras, BarraPrecio, Resumen]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Motor de dominio puro (sin React/DOM) + test node:test colocado, como en Fase 4"
    - "Capacidad data-driven desde camasBase del catálogo (NO recomputar la zona del plano)"
    - "Suma de precio desde una sola fuente (estado.extras[]); IVA reusado de formato.js"
    - "Metadato de catálogo (subgrupo) para split de UI data-driven"
    - "Tolerancia a estado adulterado de localStorage (Array.isArray + optional chaining)"

key-files:
  created:
    - src/utils/validacionCamas.js
    - src/utils/validacionCamas.test.js
    - src/utils/motorPrecios.js
    - src/utils/motorPrecios.test.js
    - src/data/extras.test.js
  modified:
    - src/data/extras.js
    - package.json

key-decisions:
  - "Capacidad de camas desde camasBase (Pitfall 1), NO desde la geometría del plano; matrimonial = 2 footprints, S/C = 1; N5+ personalizable → Infinity."
  - "Precio sumado SOLO desde estado.extras[] (Pitfall 3); el motor nunca lee estado.cocina/estado.estar."
  - "IVA no se recrea en motorPrecios: se reusa calcularIVA/calcularTotal de formato.js (la alícuota vive solo en geometry.js)."
  - "Split confort/energía como metadato subgrupo en los datos (D-08), no en la UI."
  - "Script test con lista explícita (no glob, Pitfall 5): se agregaron los 3 archivos a mano."

patterns-established:
  - "Helper de dominio puro + test node:test colocado, importando datos de /data y formato de /utils."
  - "Defensa frente a estado tampered de localStorage: Array.isArray + optional chaining → neto >= 0 / capacidad 0, nunca crashea."

requirements-completed: [DORM-02, PRECIO-01, EXTRAS-01]

# Metrics
duration: 11min
completed: 2026-06-27
---

# Phase 5 Plan 01: Motores de dormitorio, precios y metadato de extras Summary

**Dos motores de dominio puro (validación de capacidad de camas data-driven desde `camasBase` y motor de precios `calcularPresupuesto` con suma única desde `extras[]` reusando `formato.js`) más el metadato `subgrupo` confort/energía en el catálogo, todo testeado con `node:test` y enchufado al script `test`.**

## Performance

- **Duration:** ~11 min
- **Started:** 2026-06-27T20:15:00Z (aprox.)
- **Completed:** 2026-06-27T20:26:42Z
- **Tasks:** 3 (TDD: 6 commits test→feat)
- **Files modified:** 7 (5 creados + 2 modificados)

## Accomplishments
- `validacionCamas.js` (DORM-02): `capacidadFootprints` data-driven desde `camasBase` (N4→4, N1→2, N3→3, N5/N6/N7→Infinity, id adulterado→0); `footprintsDeCamas` (M=2, S/C=1, no-array→0); `camasEntran` con límite exacto.
- `motorPrecios.js` (PRECIO-01): `calcularPresupuesto(estado)` → `{neto, iva, total}` sumando SOLO desde `extras[]`, reusando `formato.js`. Valores exactos verificados: N4 solo = neto 38.971.845; N4 + los 17 extras = neto 55.977.868 / total 67.733.220.
- `extras.js` (D-08): metadato `subgrupo` ('confort'|'energia') en los 9 extras de `categoria:'extras'` — 7 confort + 2 energía (panel-solar-160, sistema-solar-220).
- `package.json` (Pitfall 5): los 3 archivos de test nuevos agregados al script `test`; suite completa pasa de 41 a **62 tests** (todos verdes).
- Defensa anti-tamper (T-05-01/T-05-02): estado adulterado de localStorage (modeloId inválido / extras no-array / estado null) → neto ≥ 0 y capacidad 0, sin crashear.

## Task Commits

Cada tarea se desarrolló por TDD (RED → GREEN), commit atómico:

1. **Task 1: Motor de validación de capacidad de camas (DORM-02)**
   - `7b112de` (test — RED) → `8d0d773` (feat — GREEN)
2. **Task 2: Motor de precios — presupuesto en vivo (PRECIO-01)**
   - `3368334` (test — RED) → `1cf2f07` (feat — GREEN)
3. **Task 3: Metadato subgrupo en extras + test + script test (D-08, Pitfall 5)**
   - `d95c005` (test — RED) → `db6ad4e` (feat — GREEN: extras.js + package.json)

_Sin commits de refactor: las implementaciones quedaron mínimas y limpias en la fase GREEN._

## Files Created/Modified
- `src/utils/validacionCamas.js` - 3 helpers puros de capacidad de camas (DORM-02), data-driven desde `camasBase`.
- `src/utils/validacionCamas.test.js` - 9 tests node:test (capacidad por modelo, M=2, no-array, límite N4, N7 Infinity, id adulterado).
- `src/utils/motorPrecios.js` - `calcularPresupuesto` puro, suma única desde `extras[]`, reusa `formato.js`.
- `src/utils/motorPrecios.test.js` - 8 tests (N4 solo, N4+17 extras, una sola fuente, cocina.horno no suma, estado adulterado).
- `src/data/extras.js` - agregado `subgrupo` ('confort'|'energia') a los 9 extras de `categoria:'extras'`; comentario de cabecera documentando el split.
- `src/data/extras.test.js` - 4 tests (subgrupo válido, 7+2, energía = los 2 paneles, otras categorías sin subgrupo).
- `package.json` - script `test` ampliado con validacionCamas/motorPrecios/extras.

## Decisions Made
None nuevas más allá de las del plan — se siguieron los contratos y valores de aserción especificados (DORM-02 desde `camasBase`, PRECIO-01 una-sola-fuente reusando `formato.js`, D-08 subgrupo data-driven, Pitfall 5 script test explícito).

## Deviations from Plan

None - plan executed exactly as written.

Nota de implementación (no es una desviación funcional): durante la Task 2, un gate `grep` de aceptación marcó `0.21`/`estado.cocina`/`estado.estar` por aparecer en **comentarios explicativos** (que documentan precisamente por qué se evitan), no en código. Para dejar el gate literal limpio se reformuló la redacción de esos comentarios sin tocar la lógica. El código nunca contuvo el IVA literal ni leyó `estado.cocina`/`estado.estar` — la intención del gate (no recrear el IVA, una sola fuente) se cumplió desde el primer commit GREEN.

## Issues Encountered
None. RED falló como esperado (módulo inexistente / metadato ausente), GREEN pasó al primer intento en las 3 tareas. `npm run build` OK (los módulos ESM importan limpio).

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Los 3 motores/data están listos para la Wave 2: `camasEntran`/`capacidadFootprints` → PasoDormitorio (advertencia sin bloqueo D-03); `calcularPresupuesto` → BarraPrecio/Resumen; `EXTRAS[].subgrupo` → PasoExtras (split confort/energía data-driven).
- Contrato estable y testeado: la UI puede consumir sin re-implementar lógica de dominio.
- Sin blockers.

## TDD Gate Compliance
- Cada tarea tiene su commit `test(...)` (RED) seguido de `feat(...)` (GREEN), verificable en `git log`. RED falló genuinamente antes de implementar (módulo/metadato ausente) — no hubo passing test prematuro.

## Self-Check: PASSED

- 8/8 archivos declarados existen en disco (5 creados + 2 modificados + SUMMARY).
- 6/6 commits de tarea alcanzables en git (7b112de, 8d0d773, 3368334, 1cf2f07, d95c005, db6ad4e).
- `npm test` verde: 62 tests, 0 fail (los 3 archivos nuevos corren; el conteo subió respecto a antes de la fase).
- `npm run build` OK.

---
*Phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios*
*Completed: 2026-06-27*
