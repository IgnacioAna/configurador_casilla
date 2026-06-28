---
phase: 07-pulido-mobile-y-accesibilidad
plan: 02
subsystem: ui-a11y
tags: [responsive, mobile, 375px, overflow, a11y, aria, role-group, wcag]
requires:
  - "UI existente (landing/wizard/resumen) de Fases 3-6"
  - "Plan 07-01 (foco/reduced-motion/contraste/role=group en PasoCocina) — COMPLETO"
provides:
  - "Filas de precio/valor sin overflow a 375px (min-w-0/break-words izq + whitespace-nowrap/shrink-0 der)"
  - "Landing con bloque de contacto break-words a 375px"
  - "Cada grupo de controles de los pasos con nombre accesible (role=group + aria-labelledby)"
affects:
  - "src/components/resumen/PresupuestoDesglosado.jsx"
  - "src/components/wizard/BarraPrecio.jsx"
  - "src/components/resumen/ConfigSecciones.jsx"
  - "src/components/resumen/BloqueFinanciacion.jsx"
  - "src/components/Landing.jsx"
  - "src/components/wizard/pasos/PasoUso.jsx"
  - "src/components/wizard/pasos/PasoDimensiones.jsx"
  - "src/components/wizard/pasos/PasoBano.jsx"
  - "src/components/wizard/pasos/PasoDormitorio.jsx"
  - "src/components/wizard/pasos/PasoExtras.jsx"
tech-stack:
  added: []
  patterns:
    - "Anti-overflow en filas flex justify-between: min-w-0/break-words (texto izq) + whitespace-nowrap/shrink-0/pl-2 (precio der) (Pitfall 5)"
    - "Label de GRUPO: <p id> + <div role=group aria-labelledby=id> reusando el contenedor existente del grid/flex (Pattern 3 d)"
key-files:
  created: []
  modified:
    - "src/components/resumen/PresupuestoDesglosado.jsx"
    - "src/components/wizard/BarraPrecio.jsx"
    - "src/components/resumen/ConfigSecciones.jsx"
    - "src/components/resumen/BloqueFinanciacion.jsx"
    - "src/components/Landing.jsx"
    - "src/components/wizard/pasos/PasoUso.jsx"
    - "src/components/wizard/pasos/PasoDimensiones.jsx"
    - "src/components/wizard/pasos/PasoBano.jsx"
    - "src/components/wizard/pasos/PasoDormitorio.jsx"
    - "src/components/wizard/pasos/PasoExtras.jsx"
decisions:
  - "Fixes de overflow solo con utilidades Tailwind ya presentes (min-w-0/break-words/whitespace-nowrap/shrink-0/pl-2) — sin rediseno, sin paleta, sin deps (D-02)"
  - "Resumen/PlanoPanel/FloorPlan/BarraProgreso auditados a 375px sin desbordes reales -> SIN cambios (no fix preventivo cosmetico)"
  - "role=group (no radiogroup) en todos los grupos, coherente con aria-pressed/checkbox; sin radios reales (D-01 ARIA minimo)"
  - "No se agrego control de zoom/fullscreen nuevo: 'zoom' = el colapsable existente (A3)"
metrics:
  duration: "~10 min"
  completed: "2026-06-28"
  tasks: 3
  files-modified: 10
requirements: [UX-01, UX-02]
---

# Phase 7 Plan 02: Overflow 375px + Labels de Grupo Summary

Auditoria y correccion POR SUPERFICIE de los desbordes a ~375px (UX-01) y completado de los labels de
GRUPO que faltaban (UX-02) sobre las pantallas ya construidas. Todo con utilidades de Tailwind ya
presentes + `role="group"` / `aria-labelledby`. Sin rediseno, sin tocar la paleta locked, sin
dependencias nuevas (D-02), sin features (sin control de zoom nuevo — A3).

## What Was Built

### Task 1 — Anti-overflow a 375px en filas de precio/valor (UX-01, Pitfall 5)
Patron aplicado a CADA fila `flex justify-between` con texto izquierdo variable y precio/valor a la
derecha: `min-w-0 break-words` en el texto izquierdo (se encoge y parte palabras largas en vez de
empujar el ancho) + `whitespace-nowrap shrink-0 pl-2` en el precio derecho (nunca se parte ni se
encoge; deja aire). Logica/montos/`formatPrecio` intactos.
- **PresupuestoDesglosado.jsx:** linea base del modelo, items por grupo, "Otros" (catch-all), y las
  3 lineas Neto / IVA 21% / Total c/IVA. Mantiene `pl-3` de indentacion de los items de grupo.
- **BarraPrecio.jsx:** las 3 filas dt/dd (Neto/IVA/Total) — la barra sticky de mobile queda dentro del ancho.
- **ConfigSecciones.jsx:** header con `<h2 min-w-0 break-words>` + boton "Editar" `shrink-0 pl-2`
  (ya tenia `ml-auto`); el valor `<p>` (extras concatenados, puede ser largo) con `break-words`.
- **BloqueFinanciacion.jsx:** nombre y detalle de cada opcion con `break-words`.

### Task 2 — Audit 375px de Landing / Resumen / plano / BarraProgreso (UX-01)
Auditadas las 5 superficies; fix puntual solo donde hubo riesgo real de desborde por texto.
- **Landing.jsx:** **CAMBIO** — el bloque de contacto (la linea larga "Estructura de acero
  reforzado · Doble techo aislado · ...") recibio `break-words` para partir tokens largos sin forzar
  scroll horizontal. El h1 ya hace wrap natural; el boton "Comenzar" conserva `min-h-[44px]`.
- **Resumen.jsx:** **SIN CAMBIO** — una columna `px-6`; el plano vive en una card `p-4` y su SVG es
  `width="100%"` (escala). No hay filas flex con texto variable. Cabe a 375px.
- **PlanoPanel.jsx:** **SIN CAMBIO** — la leyenda ya usa `flex flex-wrap gap-x-4 gap-y-2` y wrapea;
  los items son cortos. El toggle colapsable (`aria-expanded`) intacto. Sin zoom nuevo.
- **FloorPlan.jsx:** **SIN CAMBIO** — el `<svg>` usa `viewBox` + `preserveAspectRatio` + `width="100%"`,
  escala al contenedor y recorta a su viewBox; las cotas escalan con el SVG y no generan scroll
  horizontal del documento. `role="img"` + `<title>` conservados.
- **BarraProgreso.jsx:** **SIN CAMBIO** — header `flex justify-between` con "Paso X de N" + "NN%",
  ambos textos cortos; caben holgados a 375px. `role="progressbar"` intacto.

### Task 3 — Labels de GRUPO en los pasos del wizard (UX-02, Pattern 3 d)
Cada grupo de controles relacionados que solo tenia un `<p>` titulo NO asociado ahora lleva nombre
accesible: se dio `id` al `<p>` y se anadieron `role="group" aria-labelledby="{id}"` al contenedor
del grid/flex YA existente (sin div extra). Se reuso el patron de PasoCocina (Plan 01). `role="group"`
(NO `radiogroup`); sin radios reales; copy reusado (sin texto nuevo).
- **PasoUso.jsx:** grupo USO (`label-uso`) + grupo OCUPANTES (`label-ocupantes`).
- **PasoDimensiones.jsx:** grid de cards de modelo (`label-modelo`).
- **PasoBano.jsx:** equipamiento (`label-bano-equip`) + tamano (`label-bano-tamano`).
- **PasoDormitorio.jsx:** steppers de camas (`label-camas`) + accesorios (`label-dorm-accesorios`).
- **PasoExtras.jsx:** subgrupos Confort/Energia, etiquetado data-driven via `label-extras-${g.id}`.

## Key Decisions

- **Fix de overflow vs rediseno:** solo utilidades de Tailwind ya presentes; el layout estructural,
  la paleta y la logica no se tocaron. El patron min-w-0/shrink-0 es el idiom estandar para filas
  `flex justify-between` con texto variable.
- **No fix preventivo:** Resumen/PlanoPanel/FloorPlan/BarraProgreso se auditaron y se dejaron
  intactas porque no presentan desborde real a 375px (el SVG escala/recorta; la leyenda ya wrapea;
  los textos del header son cortos). Cambiar "por las dudas" hubiera sido ruido.
- **role=group (no radiogroup) en todo:** coherente con los controles existentes (`aria-pressed`
  en cards/chips, `<label>` envolvente en checkboxes, `aria-label` en steppers); ARIA minimo correcto
  (D-01). Radios "de verdad" (flechas/roving tabindex) serian ARIA exhaustivo, fuera del liston.
- **Sin zoom nuevo (A3):** el "zoom" de CONTEXT/PLANO-03 = el colapsable existente; no se agrego ningun
  control de zoom/fullscreen (grep gate anti-zoom = 0).

## Deviations from Plan

None - plan ejecutado exactamente como esta escrito. Las pantallas sin desborde real (Resumen,
PlanoPanel, FloorPlan, BarraProgreso) se dejaron intactas y registradas como auditadas (el plan
preve explicitamente "si una pantalla NO necesita cambios, dejarla intacta y registrarlo").

## Verification

- `npm test` -> 100 tests, 0 fail (regresion verde tras cada una de las 3 tareas).
- `npm run build` (vite build) -> sin errores tras cada tarea (validacion de JSX).
- Grep gates de acceptance criteria — todos PASS:
  - Task 1: PresupuestoDesglosado `min-w-0`=6, `whitespace-nowrap`=6, `formatPrecio`=8 (intacto);
    BarraPrecio `min-w-0`=3; ConfigSecciones `break-words`=2, `shrink-0`=1.
  - Task 2: PlanoPanel `aria-expanded`=1, `zoom`=0, `fullscreen`=0; FloorPlan `role="img"`=1;
    Landing `min-h-[44px]`=1.
  - Task 3: PasoUso `role="group"`=2 y `aria-labelledby` (2 attrs reales); PasoDimensiones/PasoBano/
    PasoDormitorio/PasoExtras `aria-labelledby` >=1 cada uno; `role="radiogroup"`=0 y `role="radio"`=0
    en todo `src/components/wizard/pasos/`.
  - `package.json`/`package-lock.json` sin cambios (cero dependencias nuevas, D-02). Paleta locked intacta.
- **Verificacion manual pendiente (D-02, fuera de este executor automatizado):** `npm run dev` +
  DevTools responsive 375px -> recorrer Landing + Pasos 1-6 + Resumen confirmando 0 scroll horizontal,
  ningun precio/control cortado, barra de precio sticky dentro del ancho, plano + cotas + leyenda
  caben/wrap; arbol de a11y mostrando cada grupo de controles como "group" con su nombre.

## Known Stubs

None — fase de pulido sobre UI funcional existente; no se introdujeron placeholders ni fuentes de
datos sin cablear. Las pantallas auditadas sin cambio (Resumen/PlanoPanel/FloorPlan/BarraProgreso)
no son stubs: son superficies ya funcionales sin desborde real a 375px.

## TDD Gate Compliance

N/A — plan `type: execute` (no `type: tdd`). La verificacion de la fase es manual con DevTools por
D-02; `npm test` corre como guarda de regresion, no como gate RED/GREEN.

## Self-Check: PASSED

- Archivos verificados (11/11 FOUND): 07-02-SUMMARY.md + los 10 componentes modificados.
- Commits verificados (3/3 FOUND): 174fd9b (Task 1), 5e165c1 (Task 2), 074e571 (Task 3).
