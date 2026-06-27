---
phase: 03-cascara-del-wizard-y-persistencia
plan: 01
subsystem: estado-y-persistencia
tags: [useReducer, localStorage, persistencia, analytics, contrato-config]
requires:
  - "src/data/models.js (MODELOS — fuente del largo por modeloId)"
  - "src/components/FloorPlan.jsx (consumidor del shape config)"
provides:
  - "src/state/wizardReducer.js — estadoInicial, wizardReducer, ACCIONES, configDesdeEstado, TOTAL_PASOS"
  - "src/hooks/usePersistedConfig.js — usePersistedConfig() -> { estado, dispatch, reiniciar }, STORAGE_KEY"
  - "src/utils/analytics.js — logPasoCompletado(numeroPaso, nombrePaso)"
affects:
  - "Plan 03-02 (landing + wizard navegable) consume usePersistedConfig + ACCIONES"
  - "Plan 03-03 (layout del plano) consume configDesdeEstado para alimentar FloorPlan"
tech-stack:
  added: []
  patterns:
    - "useReducer con lazy initializer para restaurar estado desde localStorage al montar"
    - "Reducer puro + proyección config (configDesdeEstado) que desacopla estado interno del shape de FloorPlan"
    - "node:test ESM-native como gate de contrato (sin Vitest), alineado con el precedente del proyecto"
key-files:
  created:
    - "src/state/wizardReducer.js"
    - "src/state/wizardReducer.test.js"
    - "src/hooks/usePersistedConfig.js"
    - "src/utils/analytics.js"
  modified: []
decisions:
  - "modeloId inicial 'N4' para que el plano renderice un croquis válido desde el arranque (largo 6.6 derivado de MODELOS)."
  - "largo derivado de MODELOS.find por modeloId — nunca hardcodeado — en configDesdeEstado."
  - "RESET clona los objetos anidados de estadoInicial para no compartir referencias mutables."
  - "Validación mínima del estado restaurado (pasoActual:number + modeloId:string) antes de confiar en localStorage (T-03-01)."
  - "Todas las operaciones de localStorage envueltas en try/catch — degradación elegante en modo privado/cuota (T-03-03)."
metrics:
  duration: "3 min"
  completed: "2026-06-27"
---

# Phase 3 Plan 01: Estado central + persistencia + analytics Summary

Reducer central del wizard (useReducer) con proyección al shape exacto de FloorPlan, hook de
persistencia en localStorage bajo la key `impacar_config_v1` (restaura al montar, guarda en cada
cambio, reinicia borrando la key) y helper de analytics placeholder (console.log + timestamp ISO).
Plan interface-first: no renderiza UI; entrega los contratos estables que los planes 03-02 y 03-03
enchufan sin explorar.

## Qué se construyó

### `src/state/wizardReducer.js`
- **`estadoInicial`**: `{ pasoActual: 0, uso: null, ocupantes: null, modeloId: 'N4',
  bano: { tamano: 'estandar' }, dormitorio: { camas: [] }, cocina: { horno: false, heladera: null },
  estar: { mesa: false }, extras: [] }`. Los pasos 1-6 llenan estos campos en Fases 4-5; acá solo
  se inicializan. `modeloId: 'N4'` garantiza croquis válido desde el arranque.
- **`TOTAL_PASOS = 6`**; `pasoActual` siempre acotado a `[0, 5]` con `Math.min/max`.
- **`ACCIONES`**: `SET_CAMPO ({ campo, valor })`, `SIGUIENTE`, `ANTERIOR`, `IR_A_PASO ({ paso })`, `RESET`.
- **`wizardReducer(estado, accion)`**: reducer puro (no muta el estado anterior). `RESET` devuelve
  una copia fresca con objetos anidados clonados.
- **`configDesdeEstado(estado)`**: proyecta a `{ modeloId, largo, bano, dormitorio, cocina, estar }`.
  El `largo` se deriva de `MODELOS.find(m => m.id === estado.modeloId)?.largo` (nunca hardcodeado).
  NO incluye `pasoActual` ni `extras` (el plano no los lee).

### `src/hooks/usePersistedConfig.js`
- **`STORAGE_KEY = 'impacar_config_v1'`** (key exacta).
- **`usePersistedConfig()`** devuelve **`{ estado, dispatch, reiniciar }`**:
  - Lazy init (`useReducer(wizardReducer, undefined, cargarEstado)`) restaura desde localStorage al
    montar; valida la forma mínima (`pasoActual:number`, `modeloId:string`) y cae a `estadoInicial`
    si está corrupto/ausente/inaccesible.
  - `useEffect([estado])` persiste `JSON.stringify(estado)` en cada cambio (idempotente bajo StrictMode).
  - `reiniciar()`: `localStorage.removeItem(STORAGE_KEY)` + `dispatch({ type: ACCIONES.RESET })`.

### `src/utils/analytics.js`
- **`logPasoCompletado(numeroPaso, nombrePaso)`**: `console.log('[analytics] paso completado',
  { paso, nombre, timestamp: new Date().toISOString() })`. Placeholder de Google Analytics (UX-04).

## Contratos para los planes siguientes (enchufar sin explorar)

| Símbolo | Importar de | Firma / forma |
|---------|-------------|----------------|
| `usePersistedConfig` | `src/hooks/usePersistedConfig.js` | `() => { estado, dispatch, reiniciar }` |
| `STORAGE_KEY` | `src/hooks/usePersistedConfig.js` | `'impacar_config_v1'` |
| `ACCIONES` | `src/state/wizardReducer.js` | `{ SET_CAMPO, SIGUIENTE, ANTERIOR, IR_A_PASO, RESET }` |
| `configDesdeEstado` | `src/state/wizardReducer.js` | `(estado) => config` (shape de FloorPlan) |
| `TOTAL_PASOS` | `src/state/wizardReducer.js` | `6` |
| `logPasoCompletado` | `src/utils/analytics.js` | `(numeroPaso, nombrePaso) => void` |

**Patrón de uso (03-02):** `dispatch({ type: ACCIONES.SIGUIENTE })` / `ACCIONES.ANTERIOR` para
navegar; `reiniciar()` para "Volver a empezar"; barra de progreso desde `estado.pasoActual` / `TOTAL_PASOS`.
**Patrón de uso (03-03):** `<FloorPlan config={configDesdeEstado(estado)} />`.

## Requisitos cubiertos

- **SHELL-03**: restaura desde localStorage al montar (lazy init) y guarda en cada cambio (key `impacar_config_v1`).
- **SHELL-04**: `reiniciar()` borra la key y resetea al estado inicial.
- **UX-04**: `logPasoCompletado` registra `console.log` con timestamp ISO.

## Verificación

- `npm run build` pasa (compila reducer, hook y helper sin errores).
- `node --test src/state/wizardReducer.test.js`: **10/10 tests** pasan (navegación acotada, RESET sin
  compartir referencias, `configDesdeEstado` deriva el largo N4→6.6 y N1→4.5).
- Grep de acceptance criteria: `impacar_config_v1`, las 3 ops de localStorage, `useReducer(wizardReducer`,
  `MODELOS.find`, `Math.min/max`, `toISOString` + `console.log` — todos presentes.

## TDD Gate Compliance

Task 1 siguió RED → GREEN:
- RED: `test(03-01)` (85e3247) — test falla por módulo ausente.
- GREEN: `feat(03-01)` (4a8ea55) — implementación, 10/10 tests pasan.
- REFACTOR: no necesario (código limpio en GREEN).

## Threat model

Mitigaciones aplicadas según el registro STRIDE del plan:
- **T-03-01 (Tampering)**: `JSON.parse` en try/catch + validación mínima del estado restaurado; si
  está adulterado/corrupto se descarta y se usa `estadoInicial`.
- **T-03-03 (DoS)**: `setItem`/`getItem`/`removeItem` en try/catch; la app sigue en memoria si la
  cuota se excede o el storage no está disponible (modo privado/SSR).
- **T-03-02 (Info Disclosure)**: aceptado por diseño — la config no contiene PII.

Sin superficie de seguridad nueva fuera del threat model.

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

`logPasoCompletado` es un placeholder de Google Analytics (console.log) por diseño explícito del
plan (UX-04) — la integración real con GA queda fuera del alcance de la demo (ver PROJECT.md
Out of Scope). Es un stub intencional documentado, no bloquea el objetivo de la fase.

## Self-Check: PASSED

- Archivos creados verificados en disco: wizardReducer.js, wizardReducer.test.js,
  usePersistedConfig.js, analytics.js, 03-01-SUMMARY.md — todos presentes.
- Commits verificados en git log: 85e3247 (test RED), 4a8ea55 (feat reducer), 3b65c04 (feat hook+analytics).
