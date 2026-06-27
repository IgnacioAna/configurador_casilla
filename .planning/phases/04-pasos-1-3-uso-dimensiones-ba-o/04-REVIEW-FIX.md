---
phase: 04-pasos-1-3-uso-dimensiones-bano
fixed_at: 2026-06-27T00:00:00Z
review_path: .planning/phases/04-pasos-1-3-uso-dimensiones-ba-o/04-REVIEW.md
iteration: 1
fix_scope: critical_warning
findings_in_scope: 2
fixed: 1
skipped: 1
status: all_fixed
---

# Fase 04: Informe de Revisión de Corrección de Código

**Corregido:** 2026-06-27
**Revisión fuente:** `.planning/phases/04-pasos-1-3-uso-dimensiones-ba-o/04-REVIEW.md`
**Iteración:** 1

**Resumen:**
- Hallazgos en alcance (critical + warning): 2
- Corregidos: 1
- Omitidos: 1 (ya resuelto antes de esta corrida)

> Nota de alcance: IN-01 (info) queda fuera de alcance con `fix_scope: critical_warning`
> y no se intervino. Los dos hallazgos en alcance son CR-01 (crítico, ya resuelto) y
> WR-01 (advertencia, corregido en esta corrida).

## Issues corregidos

### WR-01: `MINIMO_CENTRAL` no valida que el estar sea positivo con baño ampliado activado

**Archivos modificados:** `src/utils/floorplanLayout.js`, `src/utils/floorplanLayout.test.js`
**Commit:** `de6f6ca`
**Estado:** fixed (verificado por suite de tests)

**Corrección aplicada:**

Se codificó el invariante de producción en `calcularLayout`. Inmediatamente después de
calcular el residuo del estar:

```js
const largoEstar = restante - largoBano - largoDormitorio
if (largoEstar <= 0) {
  return { valido: false }
}
```

El guard previo (`config.largo < minimoTotal`) sólo validaba el largo bruto y no detectaba
un reparto degenerado producido por un futuro cambio de ratios cuya suma superara 1. Ahora,
si los ratios rompen el reparto, la función devuelve `{ valido: false }` — el mismo estilo de
guard que ya existía en el archivo (líneas 60 y 64) — en lugar de emitir zonas con `largoM`
negativo en silencio.

Tests de regresión agregados a `src/utils/floorplanLayout.test.js` (node:test, sin nuevas
dependencias):
- `WR-01: toda config válida deja el estar con largoM estrictamente positivo` — recorre N1,
  N4, baño estándar/ampliado y el caso N3 ampliado, exigiendo `estar.largoM > 0` y `valido: true`.
- `WR-01: el guard de estar<=0 no se dispara en el largo mínimo viable (estar > 0)` — verifica
  el contorno: con el largo mínimo viable (justo por encima de `minimoTotal`) y baño ampliado,
  el estar sigue siendo positivo y la config sigue siendo válida.

Las pruebas no debilitan los casos BANO-03 existentes (se conservan intactos). El invariante de
suma exacta (las 5 zonas suman `config.largo`) se preserva: el guard sólo intercepta configs que
producirían un estar no positivo, que de todos modos serían inválidas.

**Verificación:**
- Tier 1: relectura confirmó el guard presente y el código circundante intacto.
- Tier 2: `node -c` pasó en ambos archivos; suite completa `npm test` 41/41 verde
  (39 base + 2 nuevos tests WR-01).

## Issues omitidos

### CR-01: Crash por `estado.bano` y `estado.extras` sin fallback ante estado parcial del localStorage

**Archivos:** `src/hooks/usePersistedConfig.js`, `src/components/wizard/pasos/PasoDimensiones.jsx`, `src/components/wizard/pasos/PasoBano.jsx`
**Razón de omisión:** ya resuelto antes de esta corrida — no se re-aplica.

El propio REVIEW.md marca este hallazgo como RESUELTO en el commit `ab59f3f`, que endureció
`esEstadoValido` en `usePersistedConfig.js` para exigir `bano` (objeto no-null) y `extras`
(array), descartando estados parciales y cayendo a `estadoInicial`. Existe test de regresión
en `src/hooks/usePersistedConfig.test.js` (6 casos, verificados pasando 6/6 en esta corrida).
Re-aplicar la corrección sería redundante y arriesgaría introducir un cambio espurio, por lo
que se omite intencionalmente.

---

_Corregido: 2026-06-27_
_Corrector: Claude (gsd-code-fixer)_
_Iteración: 1_
