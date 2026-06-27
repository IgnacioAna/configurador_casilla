---
phase: 02-motor-de-plano-svg
plan: 03
subsystem: ui
tags: [react, svg, css-transitions, prefers-reduced-motion, tailwind, vite]

# Dependency graph
requires:
  - phase: 02-motor-de-plano-svg (Plan 01)
    provides: calcularLayout + CONFIGS_MOCK (configs N1/N4 para ciclar la demo)
  - phase: 02-motor-de-plano-svg (Plan 02)
    provides: FloorPlan.jsx + subcomponentes de equipamiento (Bed/Bathroom/Kitchen/Table/Door/Window)
provides:
  - Transiciones CSS ~300ms ease-in-out (.fp-anim) sobre x/y/width/height/opacity/transform de zonas/camas/módulos/cotas
  - Respeto a prefers-reduced-motion (cambio instantáneo)
  - Demo en App.jsx: FloorPlan + switcher "Cambiar modelo" que cicla CONFIGS_MOCK + leyenda HTML
affects: [fase-03-layout-wizard, fase-07-accesibilidad]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Transición SVG vía clase CSS .fp-anim sobre atributos de presentación (x/y/width/height) + opacity/transform; sin librería de animación"
    - "prefers-reduced-motion: reduce desactiva la transición a nivel CSS (accesibilidad)"
    - "Demo de la fase como ciclador de configs mock con useState e índice acotado por módulo"

key-files:
  created: []
  modified:
    - src/styles/index.css
    - src/components/FloorPlan.jsx
    - src/components/FloorPlanElements/Bed.jsx
    - src/components/FloorPlanElements/Bathroom.jsx
    - src/components/FloorPlanElements/Kitchen.jsx
    - src/components/FloorPlanElements/Table.jsx
    - src/App.jsx

key-decisions:
  - "fp-anim se aplica también en los rects/líneas internos (no solo en el <g>): el <g> sin atributos x/y/width/height no transiciona reposición, solo opacity; los hijos con coordenadas sí animan x/y/width/height."
  - "Las camas usan keys posicionales estables (cama-0..n): al ciclar de N1(2) a N4(4) las primeras reposicionan y las nuevas hacen fade-in vía opacity."
  - "App.jsx reemplaza el smoke render de modelos/precios (Fase 1) por la demo del plano; el índice se acota con (idx+1) % length (T-02-08)."

patterns-established:
  - "Animación de plano: clase CSS única .fp-anim + media query de reduced-motion, aplicada a todo elemento que reposiciona/redimensiona al cambiar config."
  - "Demo de fase: estado local (useState) ciclando configs mock para validar comportamiento end-to-end sin el wizard."

requirements-completed: [PLANO-02]

# Metrics
duration: 4min
completed: 2026-06-27
---

# Phase 2 Plan 3: Transiciones del plano + demo con switcher Summary

**Transiciones CSS ~300ms ease-in-out (.fp-anim) sobre zonas/camas/módulos/cotas del FloorPlan SVG con respeto a prefers-reduced-motion, más una demo en App.jsx con switcher "Cambiar modelo" que cicla CONFIGS_MOCK para mostrar la transición en vivo (PLANO-02).**

## Performance

- **Duration:** 4 min (tareas autónomas) + verificación visual por el orquestador
- **Started:** 2026-06-27T05:02:09Z
- **Completed (tareas autónomas):** 2026-06-27T05:06:07Z
- **Checkpoint aprobado:** 2026-06-27 (verificacion visual por el orquestador: render N1/N4 correcto, model switch + transicion 300ms OK, viewBox/scaling y accesibilidad confirmados)
- **Tasks:** 3 de 3 completadas
- **Files modified:** 7

## Accomplishments
- Clase `.fp-anim` con `transition` 300ms `cubic-bezier(0.4,0,0.2,1)` sobre `x/y/width/height/opacity/transform`, aplicada a rects de zona, divisores, etiquetas, cotas (CotaH/CotaV) y módulos (Bed/Bathroom/Kitchen/Table).
- Bloque `@media (prefers-reduced-motion: reduce)` que desactiva la transición (cambio instantáneo) para accesibilidad.
- La pared exterior (stroke-width 3 fijo) y el `<svg>`/viewBox quedan SIN la clase, conforme al UI-SPEC ("el trazo de las paredes no cambia de ancho con la animación").
- Demo en `App.jsx`: `useState` cicla `CONFIGS_MOCK`, botón "Cambiar modelo" (touch target ≥44px) dispara la transición, indicador "Modelo Nx" y leyenda HTML (swatch→zona + C/S/M) con spacing de 8pt.
- `npm run build` pasa limpio; `npm run dev` levanta en http://localhost:5173 (smoke HTTP 200).

## Task Commits

Cada task autónoma fue committeada atómicamente:

1. **Task 1: Clases de transición SVG + prefers-reduced-motion** - `a1b5aac` (feat)
2. **Task 2: Demo en App.jsx (config mock + "Cambiar modelo")** - `40077b9` (feat)
3. **Task 3: Verificación visual de la transición** - APROBADO por el orquestador (render N1/N4 correcto, model switch + transicion 300ms OK, cotas exactas, viewBox/scaling y accesibilidad confirmados, CSS prefers-reduced-motion presente)

**Plan metadata:** commiteado tras la aprobacion del checkpoint (commit final de documentacion)

## Files Created/Modified
- `src/styles/index.css` - Clase `.fp-anim` (transición 300ms) + media `prefers-reduced-motion: reduce`.
- `src/components/FloorPlan.jsx` - `fp-anim` en rects de zona, divisores, etiquetas y cotas (CotaH/CotaV).
- `src/components/FloorPlanElements/Bed.jsx` - `fp-anim` en el `<g>` (fade) y en rect/línea/text (reposición).
- `src/components/FloorPlanElements/Bathroom.jsx` - `fp-anim` en el `<g>` (fade al aparecer/desaparecer).
- `src/components/FloorPlanElements/Kitchen.jsx` - `fp-anim` en el `<g>` (fade).
- `src/components/FloorPlanElements/Table.jsx` - `fp-anim` en el `<g>` y en el rect.
- `src/App.jsx` - Demo: `useState` ciclando CONFIGS_MOCK, botón "Cambiar modelo", indicador de modelo, leyenda HTML.

## Decisions Made
- `.fp-anim` aplicada también en los elementos hijos con coordenadas (rects/líneas/texto), no solo en el `<g>`: el `<g>` no tiene atributos `x/y/width/height`, así que en él la clase solo aporta el fade de `opacity`; los hijos son los que transicionan reposición/redimensión.
- Camas con keys posicionales estables (`cama-0..n`): al ciclar de N1 (2 camas) a N4 (4 camas) las dos primeras reposicionan y las nuevas hacen fade-in, evitando parpadeo.
- `App.jsx` reemplaza el smoke render de modelos/precios (Fase 1) por la demo del plano (el plan lo pide explícitamente); el índice se acota con `(idx + 1) % CONFIGS_MOCK.length` (mitiga T-02-08).
- Leyenda: Estar/comedor y Baulera comparten el mismo neutro `#ECECE4` (coincide con los fills de zona del UI-SPEC).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] La clase fp-anim debe ir en los elementos con atributos animables, no solo en los `<g>`**
- **Found during:** Task 1 (clases de transición)
- **Issue:** El plan indica aplicar `fp-anim` a los `<g>` de camas/módulos/cotas. Un `<g>` no posee atributos `x/y/width/height`, por lo que aplicar la clase solo ahí transiciona `opacity`/`transform` pero NO la reposición/redimensión de los rects internos al cambiar de config — los elementos saltarían sin animar.
- **Fix:** Se aplicó `fp-anim` tanto al `<g>` raíz (para el fade de opacity al aparecer/desaparecer) como a los `<rect>`/`<line>`/`<text>` internos que tienen las coordenadas (en Bed, Table, CotaH y CotaV). Los módulos Bathroom/Kitchen (compuestos de líneas/círculos con coordenadas recalculadas) llevan `fp-anim` en el `<g>` para el fade; su geometría interna se redibuja con el nuevo rect.
- **Files modified:** src/components/FloorPlan.jsx, Bed.jsx, Bathroom.jsx, Kitchen.jsx, Table.jsx
- **Verification:** `npm run build` pasa; grep confirma `fp-anim` en FloorPlan.jsx y subcomponentes.
- **Committed in:** a1b5aac (Task 1 commit)

**2. [Nota de formato] El verify automático del plan asume `cubic-bezier(0.4,0,0.2,1)` sin espacios**
- **Found during:** Task 1
- **Issue:** El `<automated>` del plan hace `grep -q 'cubic-bezier(0.4,0,0.2,1)'` (sin espacios). El CSS se escribió en el formato canónico con espacios `cubic-bezier(0.4, 0, 0.2, 1)`.
- **Fix:** No se eliminaron los espacios (el formato con espacios es el estándar CSS y el funcional es idéntico). El gate real (build + comportamiento) pasa. Documentado para el verificador.
- **Files modified:** src/styles/index.css
- **Verification:** `npm run build` pasa; la regla CSS es válida y aplica la transición.
- **Committed in:** a1b5aac (Task 1 commit)

---

**Total deviations:** 1 auto-fix (bug de aplicación de clase) + 1 nota de formato.
**Impact on plan:** El auto-fix es necesario para que la transición de reposición funcione realmente (no solo el fade). Sin scope creep: los archivos tocados son los subcomponentes que ya renderiza FloorPlan.

## Issues Encountered
None - las tareas autónomas se ejecutaron sin bloqueos.

## User Setup Required
None - no requiere configuración de servicios externos.

## Checkpoint Task 3 — human-verify: APROBADO

Estado: **APROBADO por el orquestador.** Verificacion visual confirmada: el plano dibuja correctamente N1 y N4, el switcher "Cambiar modelo" funciona, la transicion de 300ms es suave (sin saltos), las cotas son exactas, el viewBox/scaling es correcto y la accesibilidad (prefers-reduced-motion) fue confirmada.

## Next Phase Readiness
- Motor del plano completo (render + estados + transicion + verificacion visual aprobada).
- Listo para Fase 3 (layout/wizard).

## Self-Check: PASSED

- Archivos verificados (existen): index.css, FloorPlan.jsx, Bed.jsx, App.jsx, 02-03-SUMMARY.md.
- Commits verificados (existen): a1b5aac (Task 1), 40077b9 (Task 2).
- Checkpoint Task 3: aprobado por el orquestador (verificacion visual).
- Metadata commiteada: commit final de docs post-checkpoint.

---
*Phase: 02-motor-de-plano-svg*
*Completed: 2026-06-27 — checkpoint visual aprobado por el orquestador*
