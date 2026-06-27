---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
reviewed: 2026-06-27T00:00:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - src/utils/validacionCamas.js
  - src/utils/validacionCamas.test.js
  - src/utils/motorPrecios.js
  - src/utils/motorPrecios.test.js
  - src/data/extras.js
  - src/data/extras.test.js
  - src/state/wizardReducer.js
  - src/state/wizardReducer.test.js
  - src/components/wizard/pasos/PasoDormitorio.jsx
  - src/components/wizard/pasos/PasoCocina.jsx
  - src/components/wizard/pasos/PasoExtras.jsx
  - src/components/wizard/BarraPrecio.jsx
  - src/components/wizard/pasosRegistro.jsx
  - src/components/ConfiguratorWizard.jsx
  - package.json
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: resolved_actionable
resolved: [CR-01, WR-01, WR-02, WR-03]
open: [IN-01, IN-02]
resolution_note: "Todos los findings accionables (1 critical + 3 warnings) corregidos y verificados (npm test 71/71, build OK). Commits: 1cdf6b1 (CR-01, +test de rango), 64ba3ff (WR-01), 9259c8b (WR-02), d649c70 (WR-03, +test de frontera). Quedan solo los 2 Info (IN-01 mensaje de test, IN-02 console.log guard) — opcionales, fuera de scope sin --all. Ver 05-REVIEW-FIX.md."
---

# Phase 05: Code Review Report

**Reviewed:** 2026-06-27
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Reviewed all 15 files from Phase 5: the two pure-function motors (`validacionCamas.js`, `motorPrecios.js`), the extras catalog, the central reducer with `configDesdeEstado`, the three presentational step components, and the orchestrating shell. The motors and data catalog are correct and well-tested. The reducer logic (immutability, clamping, RESET deep-copy) is sound. The heladera mutual-exclusion handler in `PasoCocina` is correctly implemented.

One critical crash is found: tampered localStorage with an out-of-range `pasoActual` bypasses the validator in `usePersistedConfig.js` and causes an uncaught `TypeError` on startup. Three warnings cover a missing `+ IVA` label in `PasoExtras` (price display inconsistency with the other steps), computed `IDS_HELADERA` inside the render cycle, and incomplete range check in the state validator. Two info items flag a fragile hardcoded expected sum in a test and the `console.log` analytics placeholder.

---

## Critical Issues

### CR-01: Tampered `pasoActual` in localStorage crashes the app on load

> ✓ **RESUELTO** (commit `1cdf6b1`): `esEstadoValido` ahora exige `Number.isInteger(pasoActual) && 0 <= pasoActual < TOTAL_PASOS`; `ConfiguratorWizard` usa `PASOS[estado.pasoActual] ?? PASOS[0]` como red de seguridad. Test nuevo en `usePersistedConfig.test.js` cubre fuera de rango / negativo / no entero. npm test 70/70.

**File:** `src/hooks/usePersistedConfig.js:29` / `src/components/ConfiguratorWizard.jsx:13`

**Issue:** `esEstadoValido` validates that `pasoActual` is a `number` but does NOT check that it falls within `[0, TOTAL_PASOS - 1]`. A value of `99` (or any integer outside the array bounds) passes validation, gets loaded as the initial state, and then `ConfiguratorWizard.jsx` line 13 evaluates `PASOS[99]` → `undefined`. The immediately following render calls `Paso.Componente` on line 62, throwing `TypeError: Cannot read properties of undefined (reading 'Componente')`. The app crashes to a blank screen — exactly the class of bug `esEstadoValido` was extended to prevent (see CR-01 comment in the hook itself).

This is a real attack surface: the key `impacar_config_v1` is client-writable; any browser extension, shared device, or curious user can set `pasoActual` to an arbitrary integer.

**Fix:**

```js
// usePersistedConfig.js — extend esEstadoValido
import { TOTAL_PASOS } from '../state/wizardReducer.js'

export function esEstadoValido(valor) {
  return (
    valor !== null &&
    typeof valor === 'object' &&
    typeof valor.pasoActual === 'number' &&
    Number.isInteger(valor.pasoActual) &&
    valor.pasoActual >= 0 &&
    valor.pasoActual < TOTAL_PASOS &&   // <-- range guard missing today
    typeof valor.modeloId === 'string' &&
    valor.bano !== null &&
    typeof valor.bano === 'object' &&
    Array.isArray(valor.extras)
  )
}
```

Alternatively, add a fallback guard in `ConfiguratorWizard.jsx`:

```jsx
const Paso = PASOS[estado.pasoActual] ?? PASOS[0]
```

Both fixes should be applied: defense-in-depth at the validation boundary is the right approach; the component fallback is a last-resort safety net.

---

## Warnings

### WR-01: `PasoExtras` omits `+ IVA` label on item prices — inconsistent with `PasoDormitorio`

> ✓ **RESUELTO** (commit `64ba3ff`): `PasoExtras` ahora muestra `{formatPrecio(e.precioNeto)} + IVA`, consistente con `PasoDormitorio`.

**File:** `src/components/wizard/pasos/PasoExtras.jsx:63`

**Issue:** `PasoDormitorio.jsx` line 156 displays prices as `{formatPrecio(e.precioNeto)} + IVA`. `PasoExtras.jsx` line 63 renders only `{formatPrecio(e.precioNeto)}` with no `+ IVA` qualifier. The `BarraPrecio` always shows prices netos plus IVA, so a user reading the Extras step will see prices that appear ~17% cheaper than what the total bar shows, without explanation. For a commercial configurator where the target audience makes decisions based on displayed prices, this is a meaningful UX defect that also risks a trust issue (the total appears larger than the sum of items).

**Fix:**

```jsx
// PasoExtras.jsx line 63 — add the IVA qualifier
<span className="ml-auto text-xs text-impacar-texto/70">
  {formatPrecio(e.precioNeto)} + IVA
</span>
```

---

### WR-02: `IDS_HELADERA` recomputed on every render inside `PasoCocina`

> ✓ **RESUELTO** (commit `9259c8b`): `IDS_HELADERA` movido a constante de módulo (misma lógica de filtro derivada de `EXTRAS`, sin ids literales).

**File:** `src/components/wizard/pasos/PasoCocina.jsx:41-43`

**Issue:** `IDS_HELADERA` is derived by filtering `EXTRAS` on every render call. `EXTRAS` is a module-level constant that never changes at runtime. Computing it inside the function body means a `filter` + `map` runs on every keystroke, state change, or parent re-render. More importantly, `elegirHeladera` closes over `IDS_HELADERA` from the same render, creating a new function identity every render — which breaks memoization if this component is ever wrapped in `React.memo` or if `elegirHeladera` is ever passed as a dependency.

**Fix:** Hoist to module scope, matching the pattern used for `SEGMENTOS_HELADERA` and `TOGGLES`:

```js
// Module-level constant (outside the component function)
const IDS_HELADERA = EXTRAS.filter(
  (e) => e.categoria === 'cocina' && e.id.startsWith('heladera-')
).map((e) => e.id)

export default function PasoCocina({ estado, dispatch }) {
  // ... IDS_HELADERA is now a stable reference
}
```

---

### WR-03: `esEstadoValido` does not validate `dormitorio` — inconsistent protection boundary

> ✓ **RESUELTO** (commit `d649c70`): `esEstadoValido` ahora valida `dormitorio` (objeto con `camas` array); fixtures de test ajustados + caso nuevo de rechazo. npm test 71/71.

**File:** `src/hooks/usePersistedConfig.js:25-35`

**Issue:** The validator's comment states it protects "TODOS los componentes" at the trust boundary. It validates `bano` (object) and `extras` (array) but skips `dormitorio`. `PasoDormitorio.jsx` does defend itself with optional chaining (`estado.dormitorio?.camas`), so there is no crash today. However, the validator's stated guarantee is incorrect — it claims to be the single protection point, but `dormitorio` validation is pushed down to the component. If a future component reads `estado.dormitorio.camas` directly (without optional chaining), it will crash on tampered state that passed `esEstadoValido`. The protection boundary should be honoured where it is declared.

**Fix:**

```js
export function esEstadoValido(valor) {
  return (
    // ... existing checks ...
    valor.bano !== null &&
    typeof valor.bano === 'object' &&
    Array.isArray(valor.extras) &&
    valor.dormitorio !== null &&              // <-- add
    typeof valor.dormitorio === 'object' &&  // <-- add
    Array.isArray(valor.dormitorio.camas)    // <-- add
  )
}
```

---

## Info

### IN-01: `motorPrecios.test.js` hardcodes expected sums that will silently mislead if the catalog changes

**File:** `src/utils/motorPrecios.test.js:18-22`

**Issue:** The test "N4 + los 17 extras reales → neto 55.977.868" hardcodes both the count ("17 extras" in the label) and the expected neto (`55977868`) and total (`67733220`). The test correctly derives the id list from `EXTRAS.map(...)` (no id hardcoding — good), but if any `precioNeto` in the catalog changes or a new extra is added, the test fails with a cryptic number mismatch rather than a descriptive message pointing to the changed item. The "17 extras" in the name is already out of date if the count ever diverges (currently 17 is correct).

This is acceptable for a price-catalog snapshot test (the intent is to catch unintended price changes), but the failure message should be clear.

**Suggestion:** Add a clarifying comment or assertion message explaining that these sums are snapshot values from Lista 108 Feb-2026, so a future maintainer understands a failing test means a price changed:

```js
test('N4 + todos los extras (Lista 108 Feb-2026, snapshot) → neto 55.977.868', () => {
  const todosLosIds = EXTRAS.map((e) => e.id)
  const r = calcularPresupuesto({ modeloId: 'N4', extras: todosLosIds })
  // Si este test falla, un precioNeto en extras.js cambió o se agregó/quitó un extra.
  assert.equal(r.neto, 55977868, `Suma de todos los extras cambió (esperado 55977868, obtenido ${r.neto})`)
  assert.equal(Math.round(r.total), 67733220)
})
```

---

### IN-02: `analytics.js` `console.log` is a production artifact — no suppression in build

**File:** `src/utils/analytics.js:9` / `src/components/ConfiguratorWizard.jsx:23`

**Issue:** `logPasoCompletado` always writes to `console.log`. There is no `import.meta.env.DEV` guard or production suppression. In the built/deployed app every wizard step advance emits a console message visible to any user who opens DevTools. The comment acknowledges this is a placeholder, but it fires unconditionally in production today.

Per project constraints this is an MVP/demo, so it may be acceptable. Flagged for awareness.

**Suggestion:** Suppress in production builds:

```js
export function logPasoCompletado(numeroPaso, nombrePaso) {
  if (import.meta.env.DEV) {
    console.log('[analytics] paso completado', { paso: numeroPaso, nombre: nombrePaso, timestamp: new Date().toISOString() })
  }
  // TODO: gtag/dataLayer event for production (UX-04)
}
```

---

_Reviewed: 2026-06-27_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
