---
phase: 02-motor-de-plano-svg
plan: 02
subsystem: ui
tags: [svg, react, floorplan, accessibility, tailwind, render]

# Dependency graph
requires:
  - phase: 02-motor-de-plano-svg (Plan 01)
    provides: "calcularLayout(config) → { valido, zonas, camas, viewBox, totalU, anchoU, pad }, M_A_U=100, CONFIG_MOCK_N4/N1"
  - phase: 01-cimientos-y-datos
    provides: "GEOMETRIA (geometry.js), MODELOS, paleta Tailwind impacar-*/zona-*"
provides:
  - "FloorPlan.jsx: componente principal SVG cenital (role=img + <title>, paredes, 5 zonas, equipamiento, puerta, ventanas, cotas en cobre, estados Empty/Error/Normal)"
  - "6 subcomponentes presentacionales en FloorPlanElements/ (Door, Window, Bathroom, Bed, Kitchen, Table), cada uno con <title> accesible"
  - "Render real de la config mock N4 embebido en App.jsx (vista previa hasta que llegue el wizard)"
affects: [02-03 (demo cicla CONFIGS_MOCK + transición ~300ms sobre estas coordenadas/capas), wizard (alimenta el prop config)]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Render declarativo: el componente solo consume coordenadas YA calculadas por calcularLayout (sin recalcular geometría en JSX)"
    - "Subcomponentes SVG presentacionales puros (reciben x/y/w/h en unidades de viewBox por props, devuelven primitivas inline + <title>)"
    - "Estados de componente como render condicional temprano (Empty antes de calcularLayout, Error tras valido===false) — mitiga DoS por config nula/inválida"
    - "Capa de cotas (CotaH/CotaV) en el padding reservado del viewBox, en cobre como capa de medición"

key-files:
  created:
    - src/components/FloorPlan.jsx
    - src/components/FloorPlanElements/Door.jsx
    - src/components/FloorPlanElements/Window.jsx
    - src/components/FloorPlanElements/Bathroom.jsx
    - src/components/FloorPlanElements/Bed.jsx
    - src/components/FloorPlanElements/Kitchen.jsx
    - src/components/FloorPlanElements/Table.jsx
  modified:
    - src/App.jsx

key-decisions:
  - "El rect interior de cada zona (donde van los módulos) se deriva del espesor de pared ((anchoExterior-anchoInterior)/2 × M_A_U), leído de GEOMETRIA — sin hardcodeo de la banda útil en Y."
  - "Camas montadas vía layout.camas.map (no destructuring) para que el render consuma directamente la salida del helper y el contrato key_links \\.camas\\.map quede explícito."
  - "Las cotas viven en un <g> dentro del translate(pad,pad): la del ancho usa x negativo y la del largo total usa y > anchoU, ambas dentro del padding de 12u reservado por el viewBox."
  - "FloorPlan se embebió en App.jsx con CONFIG_MOCK_N4 para cumplir el criterio 'renderiza la config mock sin errores' y evitar que el componente quede como código muerto (tree-shaking lo dropeaba del bundle)."

patterns-established:
  - "Pattern: subcomponente de equipamiento = export default function que recibe medidas en unidades de viewBox y devuelve un <g> con <title> + primitivas (sin librerías de íconos, SVG nativo)."
  - "Pattern: estados Empty/Error como bloques HTML centrados con copys EXACTOS del UI-SPEC, render condicional antes de mapear zonas/camas (defensa contra config inválida)."

requirements-completed: [PLANO-01, PLANO-04]

# Metrics
duration: 6min
completed: 2026-06-27
---

# Phase 2 Plan 02: FloorPlan SVG + subcomponentes de equipamiento Summary

**FloorPlan.jsx dibuja el plano cenital completo (paredes, 5 zonas con color, camas C/S/M, baño/cocina/mesa, puerta con arco, ventanas y cotas en cobre) consumiendo calcularLayout, con role=img + `<title>` accesible y los estados Empty/Error/Normal del UI-SPEC; 6 subcomponentes SVG nativos cada uno con `<title>`.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-06-27T04:51:45Z
- **Completed:** 2026-06-27T04:57:32Z
- **Tasks:** 3
- **Files modified:** 8 (7 creados + App.jsx)

## Accomplishments
- 6 subcomponentes presentacionales SVG nativos (Door, Window, Bathroom, Bed, Kitchen, Table), cada uno con `<title>` accesible y los anchos de trazo / colores EXACTOS del UI-SPEC.
- `FloorPlan.jsx`: `<svg>` escalable (`viewBox` + `preserveAspectRatio="xMidYMid meet"` + `width="100%"`), `role="img"` + `<title>` raíz, pared exterior (trazo 3), 5 zonas con su fill + divisores finos + etiquetas uppercase.
- Equipamiento montado en sus zonas (baño, cocina, mesa si `config.estar.mesa`), camas C/S/M vía `layout.camas.map`, puerta con arco de barrido en el estar, ventanas en dormitorio y cocina.
- Capa de acotaciones en cobre `#8B6914` (largo total, ancho total y largo por zona), en metros con coma decimal y sufijo " m", dentro del padding de 12u reservado.
- Estados Empty (`Sin configuración` / `Elegí un modelo…`) y Error (`No se pudo dibujar el plano…`) con los copys exactos del UI-SPEC; render real de CONFIG_MOCK_N4 embebido en App.jsx.

## Task Commits

Each task was committed atomically:

1. **Task 1: Subcomponentes SVG de equipamiento** - `96f6604` (feat)
2. **Task 2: FloorPlan.jsx — svg, paredes, zonas, estados** - `5986bdf` (feat)
3. **Task 3: Camas, puerta, ventanas y acotaciones** - `7762f45` (feat)

**Plan metadata:** (final docs commit — ver abajo)

## Files Created/Modified
- `src/components/FloorPlan.jsx` - Componente principal: `<svg>` role=img + `<title>`, paredes, zonas, módulos, camas, puerta, ventanas, capa de cotas en cobre, y estados Empty/Error/Normal. Consume `calcularLayout` y `GEOMETRIA`.
- `src/components/FloorPlanElements/Door.jsx` - Vano (interrupción de pared) + arco de cuarto de círculo (barrido de apertura). Trazo `#1A1A1A` op.0.7 ancho 1.25. `<title>Puerta de entrada</title>`.
- `src/components/FloorPlanElements/Window.jsx` - Hueco con doble línea paralela fina + jambas. Trazo `#1A1A1A` op.0.6 ancho 0.75. `<title>Ventana</title>`.
- `src/components/FloorPlanElements/Bathroom.jsx` - Ducha + inodoro + lavatorio como primitivas. Contorno `#1A1A1A` op.0.7 ancho 1. `<title>Baño: ducha, inodoro, lavatorio</title>`.
- `src/components/FloorPlanElements/Bed.jsx` - `<rect>` fill `#B5915A` + etiqueta C/S/M (14u semibold) + `<title>` que expande el tipo (Cucheta marinera / Cama simple / Cama matrimonial).
- `src/components/FloorPlanElements/Kitchen.jsx` - Mesada + hornallas + bacha + heladera. Contorno `#1A1A1A` op.0.7 ancho 1. `<title>Cocina</title>`.
- `src/components/FloorPlanElements/Table.jsx` - `<rect>` con borde sólido o punteado (`stroke-dasharray="3 2"` si rebatible). `<title>Mesa</title>` / `Mesa rebatible`.
- `src/App.jsx` - Embebe `<FloorPlan config={CONFIG_MOCK_N4} />` en una sección de vista previa (render real de la config mock).

## Decisions Made
- **Rect interior por zona derivado de GEOMETRIA:** los módulos se ubican en `z.x + espesorU` con la banda útil en Y `[espesorU, anchoU-espesorU]`, donde `espesorU = (anchoExterior-anchoInterior)/2 × M_A_U`. Nada de banda interior hardcodeada.
- **`layout.camas.map` explícito** (en vez de destructuring) para consumir directamente la salida del helper y cumplir el contrato `key_links \.camas\.map` del plan.
- **Cotas dentro del `translate(pad,pad)`:** la cota de ancho usa `x` negativo y la de largo total `y > anchoU`, ambas dentro del padding de 12u que reserva el viewBox del Plan 01 — sin pisar el dibujo.
- **FloorPlan embebido en App.jsx:** sin uso real el bundler tree-shakeaba el componente (34 módulos, mismo hash). Embeberlo con CONFIG_MOCK_N4 lo incluye (43 módulos) y cumple "renderiza la config mock sin errores".

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `p-md` no es una clase Tailwind válida**
- **Found during:** Task 3 (revisión de los estados Empty/Error y wrapper de App)
- **Issue:** El UI-SPEC define `md = 16px` como token de spacing, pero `tailwind.config.js` no extiende `theme.spacing`, así que `p-md` no genera ninguna regla CSS y el padding intencionado (16px) no se aplicaba.
- **Fix:** Reemplazado `p-md` por `p-4` (16px, el valor del token md del UI-SPEC) en los 2 estados de FloorPlan y en la sección de App.jsx.
- **Files modified:** src/components/FloorPlan.jsx, src/App.jsx
- **Verification:** `grep -c 'p-md'` → 0 en ambos archivos; `npm run build` pasa; padding ahora real.
- **Committed in:** `7762f45` (parte del commit de Task 3)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** El fix es necesario para que el espaciado del UI-SPEC se renderice. Sin scope creep — solo se corrigió la clase utilitaria.

## Issues Encountered
- El `<verify>` de la Task 3 exigía el literal `.camas.map`; la primera versión usaba destructuring (`const { camas } = layout`), por lo que el grep fallaba. Se ajustó a `layout.camas.map`, que además deja explícito el `key_link` del plan. Build y verify en verde tras el ajuste.
- Smoke test de consumo del layout (Node ESM) confirmó: N4 → 5 zonas + 4 camas (viewBox `0 0 684 284`), N1 → 5 zonas + 2 camas, `largo` imposible → `valido:false` (Error), `config` nula → Empty sin llamar a `calcularLayout`.

## Threat Surface
- T-02-04 (DoS por config nula/incompleta) mitigado: `!config` → Empty (corte temprano, no se mapean zonas/camas indefinidas); `layout.valido === false` → Error. Verificado por grep de los copys de estado y por smoke test.
- T-02-05 (tampering vía texto de config) y T-02-06 (info disclosure) se aceptan según el `<threat_model>`: en Fase 2 la config es mock local y React escapa el contenido de `<text>`; el plano es presentacional sin PII. Sin superficie de seguridad nueva fuera del threat model del plan.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- 02-03 (demo + transición) puede ciclar `CONFIGS_MOCK` y animar (~300ms ease-in-out) sobre las coordenadas/capas ya montadas: zonas, camas, módulos, puerta, ventanas y cotas son deterministas por modelo.
- El componente ya está embebido en App.jsx, listo para que el Plan 03 reemplace la config fija por un selector/ciclo de modelos.
- Sin blockers.

## Self-Check: PASSED

- Archivos creados verificados en disco: FloorPlan.jsx + Door/Window/Bathroom/Bed/Kitchen/Table.jsx (7) + 02-02-SUMMARY.md.
- Commits verificados en git log: `96f6604` (Task 1 feat), `5986bdf` (Task 2 feat), `7762f45` (Task 3 feat).
- `npm run build` pasa (43 módulos transformados, FloorPlan incluido en el bundle).

---
*Phase: 02-motor-de-plano-svg*
*Completed: 2026-06-27*
