---
phase: 01-cimientos-y-datos
plan: 02
subsystem: data
tags: [datos, lista-108, modelos, accesorios, geometria, formato, iva, esm]

# Dependency graph
requires:
  - phase: 01-cimientos-y-datos (Plan 01)
    provides: Scaffold Vite + React 18 + Tailwind v3, carpetas src/data y src/utils, shell App.jsx con paleta Impacar
provides:
  - "data/models.js: 7 modelos reales N1-N7 (largo, camasBase, precioNeto exacto, ocupantesIdeal, personalizable) + SUGERENCIA_OCUPANTES"
  - "data/extras.js: 17 accesorios reales con precioNeto exacto y categoria (paso del wizard)"
  - "data/geometry.js: GEOMETRIA real (2.60/2.52/0.80/2.00/0.92/0.60) + IVA 0.21 centralizados"
  - "data/financiacion.js: FINANCIACION (3 opciones orientativas)"
  - "utils/formato.js: formatPrecio (formato argentino) + calcularIVA + calcularTotal"
  - "App.jsx: smoke render de los 7 modelos con neto y total c/IVA formateados"
affects:
  - "Phase 02 (Motor de Plano SVG — consume GEOMETRIA)"
  - "Phase 03 (Wizard — consume MODELOS, EXTRAS, SUGERENCIA_OCUPANTES)"
  - "Phase 04+ (validación de camas: GEOMETRIA; motor de precios: precioNeto + IVA + formatPrecio)"
  - "Phase 06 (Resumen — consume FINANCIACION)"

# Tech tracking
tech-stack:
  added:
    - "node:test (runner ESM-native nativo de Node, sin nueva dependencia) para el gate TDD de formato.js"
  patterns:
    - "Datos reales aislados en src/data como constantes ESM (export const), una fuente autoritativa por dominio"
    - "Geometría e IVA centralizados en data/geometry.js; utils/formato.js consume IVA desde ahí (única fuente de verdad)"
    - "Smoke checks de integridad de datos vía sumas de control (modelos 268.579.506, extras 17.006.023, geometría 2.52)"
    - "Formato de precio argentino con toLocaleString('es-AR') + fallback de agrupamiento por regex si el entorno no tuviera ICU"

key-files:
  created:
    - "src/data/models.js"
    - "src/data/extras.js"
    - "src/data/geometry.js"
    - "src/data/financiacion.js"
    - "src/utils/formato.js"
    - "src/utils/formato.test.js"
  modified:
    - "src/App.jsx"

key-decisions:
  - "Gate TDD con node:test (built-in, ESM-native) en lugar de instalar Vitest: el plan usa node smoke checks como mecanismo de verificación; node:test deja un test real ejecutable sin agregar dependencias."
  - "IVA vive solo en data/geometry.js; formato.js lo importa de ahí para no duplicar la tasa."
  - "Precios netos copiados VERBATIM de PROJECT.md (Lista 108); las sumas de control (268.579.506 / 17.006.023) validan que no hay typos."

patterns-established:
  - "Constantes de datos por dominio en src/data/*.js (MODELOS, EXTRAS, GEOMETRIA, IVA, FINANCIACION, SUGERENCIA_OCUPANTES)"
  - "Helpers de presentación en src/utils/*.js (formatPrecio, calcularIVA, calcularTotal)"
  - "Tests co-localizados *.test.js corribles con node --test (sin runner externo)"

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-06-27
---

# Phase 01 Plan 02: Datos reales Lista 108 + formato y geometría Summary

**Datos autoritativos de la Lista 108 (7 modelos N1-N7, 17 accesorios, geometría real e IVA) aislados en src/data como constantes ESM, con formatPrecio (formato argentino) y helpers de IVA en utils/formato.js, wireados en App.jsx como smoke render que compila limpio. Las sumas de control validan integridad: modelos 268.579.506, accesorios 17.006.023, geometría 2.52.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-27T03:58:13Z
- **Completed:** 2026-06-27T04:02:21Z
- **Tasks:** 3 (Task 3 con ciclo TDD RED→GREEN)
- **Files modified:** 7 (6 creados + App.jsx modificado)

## Accomplishments
- Los 7 modelos reales N1-N7 cargados con precio neto EXACTO de la Lista 108 (suma de control 268.579.506 verificada); N5/N6/N7 marcados `personalizable: true` con `camasBase: null`. Incluye `SUGERENCIA_OCUPANTES` (2,3,4,5,6,8 → modelo) para el Paso 1 del wizard.
- Los 17 accesorios reales cargados con precio neto exacto (suma de control 17.006.023 verificada) y `categoria` por paso del wizard (bano/dormitorio/cocina/extras).
- Geometría real centralizada en `data/geometry.js` (anchoExterior 2.60, anchoInterior 2.52, anchoCama 0.80, largoCama 2.00, pasilloCentral 0.92, baulera/cocina 0.60) + `IVA 0.21`; la consistencia geométrica cierra (0.80×2 + 0.92 = 2.52).
- `formatPrecio()` produce formato argentino ($ adelante, punto de miles, sin decimales) con fallback de agrupamiento manual si el entorno no tuviera ICU completo; `calcularIVA`/`calcularTotal` consumen el IVA centralizado.
- `App.jsx` renderiza un smoke de los 7 modelos con neto y total c/IVA formateados; `npm run build` pasa limpio (34 módulos transformados) probando que todos los imports resuelven y el JSX compila.
- `data/financiacion.js` con 3 opciones orientativas (contado/financiado/permuta) listo para el resumen de Phase 6.

## Task Commits

Each task was committed atomically:

1. **Task 1: data/models.js, data/geometry.js, data/financiacion.js** - `4b4d488` (feat)
2. **Task 2: data/extras.js (17 accesorios reales)** - `40272d1` (feat)
3. **Task 3 (TDD RED): test de formatPrecio + helpers de IVA** - `22e0bbf` (test)
4. **Task 3 (TDD GREEN): formato.js + smoke render en App.jsx** - `b1c4980` (feat)

**Plan metadata:** final commit (docs: complete plan, incluye SUMMARY/STATE/ROADMAP)

_Nota: Task 3 es TDD — gate RED (test que falla) seguido de GREEN (implementación). No hubo refactor: la implementación ya era mínima y limpia._

## Files Created/Modified
- `src/data/models.js` - 7 modelos N1-N7 con largo, camasBase, precioNeto exacto, ocupantesIdeal, personalizable; + SUGERENCIA_OCUPANTES.
- `src/data/extras.js` - 17 accesorios reales con precioNeto exacto y categoria (paso del wizard).
- `src/data/geometry.js` - GEOMETRIA real centralizada + IVA 0.21.
- `src/data/financiacion.js` - FINANCIACION: 3 opciones orientativas.
- `src/utils/formato.js` - formatPrecio (formato argentino + fallback regex), calcularIVA, calcularTotal (importa IVA de geometry.js).
- `src/utils/formato.test.js` - Tests node:test del comportamiento de formato/IVA (gate TDD).
- `src/App.jsx` - Smoke render de los 7 modelos con neto y total c/IVA formateados (importa MODELOS y formatPrecio).

## Decisions Made
- **Gate TDD con node:test (built-in) en lugar de Vitest:** el plan define su verificación con `node --input-type=module -e` smoke checks; usar el runner nativo `node:test` (ESM-native, sin dependencias nuevas) deja un test real ejecutable (`node --test src/utils/formato.test.js`) que cumple el ciclo RED→GREEN sin ampliar la superficie de dependencias del scaffold.
- **IVA con una sola fuente de verdad:** la tasa vive únicamente en `data/geometry.js`; `formato.js` la importa de ahí para evitar duplicación y drift.
- **Fallback de agrupamiento en formatPrecio:** `toLocaleString('es-AR')` agrupa con puntos en este entorno (Node v24 con ICU), pero se agregó un fallback con regex `\B(?=(\d{3})+(?!\d))` por si un entorno sin ICU completo no agrupara — garantiza el formato argentino en cualquier entorno (mitiga T-01-08).

## Deviations from Plan

None - plan executed exactly as written.

Nota menor (no es una deviación de comportamiento): el plan describe Task 3 como `tdd="true"` pero su verificación es un smoke check inline de node, no un runner de tests. Se agregó `src/utils/formato.test.js` (node:test, sin dependencias) para materializar el gate RED→GREEN como un artefacto de test real, además de pasar el smoke check inline del plan. Esto cumple la intención TDD del plan sin agregar dependencias.

## TDD Gate Compliance

Secuencia de gates verificada en el historial de git:
1. **RED** — `22e0bbf` `test(01-02): add failing test for formatPrecio...` (el test falla porque formato.js aún no existe).
2. **GREEN** — `b1c4980` `feat(01-02): formatPrecio + helpers de IVA y smoke render...` (4/4 tests verdes, build limpio).
3. **REFACTOR** — no necesario (implementación mínima y limpia).

## Issues Encountered
- Aviso de Git LF→CRLF en cada `git add` (working copy en Windows). Es esperado y benigno; no afecta el contenido ni el build.

## Threat Model Compliance
- **T-01-05 (Tampering — integridad de precios Lista 108):** mitigado. Smoke checks automatizados validan suma de modelos (268.579.506) y de extras (17.006.023); ambos pasan exacto, descartando typos en precios.
- **T-01-06 (Tampering — consistencia geométrica):** mitigado. Assert `anchoCama*2 + pasilloCentral === anchoInterior` (0.80×2 + 0.92 = 2.52) pasa; la geometría que alimenta plano y validación de camas es coherente.
- **T-01-07 (Information Disclosure — datos comerciales en cliente):** accept. Los precios de lista son públicos (catálogo comercial), pensados para mostrarse al cliente. Sin cambios.
- **T-01-08 (Tampering — formato dependiente de ICU):** mitigado. El smoke check valida el output exacto de `formatPrecio` ($29.108.976) y se implementó el fallback con regex para entornos sin ICU.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Fuente de datos autoritativa lista: MODELOS, EXTRAS, GEOMETRIA, IVA, FINANCIACION y SUGERENCIA_OCUPANTES disponibles para todas las fases siguientes.
- formatPrecio + helpers de IVA listos para el motor de precios (Phase 4+) y el resumen (Phase 6).
- App.jsx tiene un smoke render temporal (se reemplaza por la landing real en Phase 3). No es un stub bloqueante: prueba el wiring de datos end-to-end.
- Cubre Success Criteria #2, #3 y #4 de la fase. Phase 01 completa (2/2 planes).

## Self-Check: PASSED

Todos los archivos declarados existen, los 4 commits de tarea están en el historial, las sumas de control verifican exacto y el build pasa limpio.

---
*Phase: 01-cimientos-y-datos*
*Completed: 2026-06-27*
