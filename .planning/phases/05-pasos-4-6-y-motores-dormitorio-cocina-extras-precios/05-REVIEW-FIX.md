---
phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
fixed_at: 2026-06-27T00:00:00Z
review_path: .planning/phases/05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios/05-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 05: Code Review Fix Report

**Fixed at:** 2026-06-27
**Source review:** .planning/phases/05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios/05-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 2
- Fixed: 2
- Skipped: 0

**Scope note:** Fix scope `critical_warning`. CR-01 y WR-01 ya estaban resueltos
(commits `1cdf6b1` / `64ba3ff`, anotados como ✓ RESUELTO en REVIEW.md) — no se
re-aplicaron. Los Info (IN-01, IN-02) quedan fuera de scope. Findings pendientes
abordados: WR-02 y WR-03.

## Fixed Issues

### WR-02: `IDS_HELADERA` recomputado en cada render dentro de `PasoCocina`

**Files modified:** `src/components/wizard/pasos/PasoCocina.jsx`
**Commit:** `9259c8b`
**Applied fix:** Se movió `IDS_HELADERA` del cuerpo del componente a una constante
de módulo (junto a `SEGMENTOS_HELADERA` y `TOGGLES`). Antes se filtraba `EXTRAS`
en cada render, dando identidad nueva a `elegirHeladera` (rompía memoización ante
`React.memo`). `EXTRAS` es inmutable en runtime, así que ahora se computa una sola
vez. El criterio de filtro no cambió (sigue derivando ids por prefijo
`heladera-` + categoría `cocina`: anti-hardcodeo intacto, sin ids literales).
`elegirHeladera` y `hayHeladera` siguen referenciando la misma constante.
Verificado con esbuild (compila sin errores).

### WR-03: `esEstadoValido` no validaba `dormitorio` — frontera de confianza incompleta

**Files modified:** `src/hooks/usePersistedConfig.js`, `src/hooks/usePersistedConfig.test.js`
**Commit:** `d649c70`
**Applied fix:** Se agregaron tres comprobaciones a `esEstadoValido`:
`valor.dormitorio !== null`, `typeof valor.dormitorio === 'object'` y
`Array.isArray(valor.dormitorio.camas)`. El comentario de la función ahora menciona
que la frontera de confianza cubre dormitorio (antes solo bano + extras), honrando
su garantía declarada de proteger a TODOS los componentes en un solo lugar.

Acoplamiento de tests resuelto: el fixture `base` del test de rango CR-01
(`{ modeloId, bano, extras }`) esperaba `true` para `pasoActual` 0 y
`TOTAL_PASOS - 1`, pero sin `dormitorio` ahora daría `false`; se le agregó
`dormitorio: { camas: [] }`. Los demás fixtures que esperan `true` ya heredan
`dormitorio` válido vía spread de `estadoInicial`, por lo que no requirieron cambio.
Se agregó un caso nuevo (`WR-03 ...`) que verifica el rechazo de `dormitorio` null,
`camas` no-array, sin `camas` y sin `dormitorio`. `npm test` 71/71 verde.

## Verification

- esbuild: `PasoCocina.jsx` compila sin errores.
- `npm test`: 71/71 verde (antes 70; el caso WR-03 suma uno). Incluye el test de
  rango CR-01 ajustado y el nuevo caso de rechazo WR-03.
- `npm run build`: OK (vite build, 61 módulos, sin errores).
- Anti-hardcodeo: WR-02 no introduce ids literales (sigue derivando de `EXTRAS`).

---

_Fixed: 2026-06-27_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
