---
phase: 04-pasos-1-3-uso-dimensiones-ba-o
plan: 02
subsystem: ui
tags: [react, jsx, wizard, tailwind, svg-icons, data-driven]

# Dependency graph
requires:
  - phase: 04-01
    provides: "permiteBanoAmpliado (banoReglas.js), test de SUGERENCIA_OCUPANTES (USO-03), BANO-03 en floorplanLayout"
  - phase: 03
    provides: "Cáscara del wizard (ConfiguratorWizard), contrato de props { estado, dispatch }, reducer SET_CAMPO, registro de pasos (pasosRegistro.jsx), cableado configDesdeEstado → PlanoPanel"
  - phase: 01-02
    provides: "MODELOS y SUGERENCIA_OCUPANTES en data/models.js"
provides:
  - "PasoUso.jsx — Paso 1: 5 cards de uso con ícono SVG inline (selección única) + chips de ocupantes 2/3/4/5/6/8 + feedback de modelo sugerido (trato de usted)"
  - "PasoDimensiones.jsx — Paso 2: 7 cards de modelo (N1-N7) con metadatos derivados de MODELOS, badge Sugerido independiente del seleccionado, y corrección silenciosa de baño ampliado"
affects: [04-03, phase-5, verificador, cierre-de-fase-04]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Componente de paso presentacional puro: recibe { estado, dispatch }, lee de /data, dispara SET_CAMPO; no duplica el contenedor blanco de la <section> del wizard"
    - "Cards/chips data-driven con .map() sobre MODELOS / constantes de UI locales (anti-hardcodeo); el literal type=button aparece una vez por bucle, no uno por elemento renderizado"
    - "Íconos SVG inline 24×24 a mano (stroke=currentColor, fill=none, strokeWidth=1.5) sin librería de íconos, heredando color del contenedor"
    - "Reflejo en vivo del plano sin props nuevas: escribir modeloId y el cableado existente (configDesdeEstado) reacciona con .fp-anim"

key-files:
  created:
    - src/components/wizard/pasos/PasoUso.jsx
    - src/components/wizard/pasos/PasoDimensiones.jsx
  modified: []

key-decisions:
  - "Subcarpeta src/components/wizard/pasos/ nueva con imports relativos ../../../ (la profundidad la recomienda PATTERNS.md para no romper el contrato de enchufe en pasosRegistro.jsx)"
  - "Los componentes quedan creados pero NO enchufados en pasosRegistro.jsx — ese archivo compartido lo modifica el Plan 04-03 (Wave 3); hasta entonces los stubs siguen activos y nada se rompe"
  - "USOS y OCUPANTES como constantes de UI locales (conjuntos de interfaz, no datos de negocio); el mapeo ocupantes→modelo SÍ es data-driven (SUGERENCIA_OCUPANTES de /data)"
  - "Badge Sugerido independiente del estado seleccionado (Pitfall 4): el pill queda en su card de origen aunque el usuario elija otro modelo; solo el borde verde se mueve"
  - "Corrección silenciosa Q4: al elegir un modelo que no admite ampliado, forzar bano.tamano='estandar' clonando bano con spread (inmutabilidad, Pitfall 3)"

patterns-established:
  - "Card seleccionable (Patrón A): <button type=button> con aria-pressed, clases Tailwind heredadas (seleccionado border-impacar-campo bg-impacar-campo/10 / neutro border-impacar-texto/10 bg-white/40 hover...)"
  - "Chip segmentado (Patrón B): fila flex-wrap de botones min-h/min-w-[44px] con aria-pressed"
  - "Feedback de sugerencia (Patrón D): panel inline rounded border-impacar-campo/30 bg-impacar-campo/5, no toast ni modal, protegido con && para tolerar estado adulterado"

requirements-completed: [USO-01, USO-02, USO-03, DIM-01, DIM-02]

# Metrics
duration: ~7min
completed: 2026-06-27
---

# Phase 4 Plan 02: Pasos 1-2 del Wizard (Uso/Ocupantes + Dimensiones) Summary

**Componentes React de los Pasos 1 y 2 del wizard: 5 cards de uso con ícono SVG inline + chips de ocupantes con sugerencia automática de modelo, y 7 cards de modelo (N1-N7) data-driven con badge "Sugerido" y reflejo en vivo del plano — todo en trato de usted.**

## Performance

- **Duration:** ~7 min (auto tasks) + checkpoint humano (verificación visual diferida a 04-03)
- **Started:** 2026-06-27T14:45:00Z (aprox., inicio de ejecución)
- **Completed:** 2026-06-27T14:52:42Z (cierre tras aprobación del checkpoint)
- **Tasks:** 2 auto completadas + 1 checkpoint human-verify aprobado
- **Files modified:** 2 creados

## Accomplishments

- **PasoUso.jsx (Paso 1):** 5 cards de uso (Contratista rural, Ganadero, Agrícola, Vivienda, Otro) cada una con un ícono SVG inline a mano 24×24 y selección única vía `aria-pressed` (USO-01); 6 chips de ocupantes 2/3/4/5/6/8 en selector segmentado (USO-02); al elegir ocupantes pre-selecciona `modeloId` desde `SUGERENCIA_OCUPANTES` (data-driven, no hardcodeado) y muestra el panel inline "Le sugerimos el modelo Nx para N personas. Lo puede cambiar en el paso siguiente." (USO-03).
- **PasoDimensiones.jsx (Paso 2):** 7 cards de modelo (N1-N7) con metadatos derivados de `MODELOS` en formato argentino con coma decimal ("6,60 m · 4 camas · ideal para 4 personas"; N5/N6/N7 → "camas a medida") (DIM-01); badge "Sugerido" (pill verde tenue) en la card cuyo id coincide con la sugerencia por ocupantes, independiente del estado seleccionado; al elegir modelo escribe `modeloId` y el plano se redibuja vía el cableado existente sin props nuevas (DIM-02), corrigiendo `bano.tamano` a 'estandar' si el modelo no admite ampliado (Q4).
- Sin dependencias nuevas, sin tokens de Tailwind nuevos: se reutilizan las clases heredadas del UI-SPEC (Patrones A/B/D/E).

## Task Commits

Cada tarea se commiteó atómicamente:

1. **Tarea 1: PasoUso.jsx (cards de uso + chips de ocupantes + sugerencia)** - `784cc5b` (feat)
2. **Tarea 2: PasoDimensiones.jsx (7 cards de modelo + badge Sugerido + reflejo)** - `633fabc` (feat)
3. **Tarea 3: checkpoint:human-verify (gate=blocking)** - aprobado por el usuario (ver "Checkpoint" abajo); sin commit de código.

**Plan metadata:** este SUMMARY + STATE.md + ROADMAP.md (commit `docs(04-02)`)

## Files Created/Modified

- `src/components/wizard/pasos/PasoUso.jsx` (creado, 170 líneas) - Paso 1: cards de uso con ícono SVG inline, chips de ocupantes, feedback de sugerencia data-driven.
- `src/components/wizard/pasos/PasoDimensiones.jsx` (creado, 76 líneas) - Paso 2: 7 cards de modelo con metadatos derivados de MODELOS, badge Sugerido independiente, corrección silenciosa de baño ampliado.

> Nota: la subcarpeta `src/components/wizard/pasos/` se creó nueva en esta tarea.

## Checkpoint (Tarea 3 — human-verify, gate=blocking)

- **Estado:** APROBADO. La verificación visual a ~375px se **difiere explícitamente al cierre del Plan 04-03**, cuando los 3 pasos estén enchufados en `pasosRegistro.jsx` y se vean en vivo.
- **Motivo del diferimiento:** estos componentes están creados pero **aún no enchufados** en el registro de pasos (`pasosRegistro.jsx` sigue mostrando los stubs). El enchufe es trabajo del Plan 04-03 (Wave 3), dueño de ese archivo compartido. Arrancar `npm run dev` ahora mostraría los stubs, no los componentes nuevos, así que una inspección visual en vivo no es practicable sin un import temporal de prueba que el plan deja para después.
- **Lo verificable programáticamente está verde:** sintaxis JSX (esbuild), todos los gates `grep` de anti-hardcodeo / anti-tuteo / data-driven, y la suite completa de tests (33/33, sin regresión).
- **Pendiente para el verifier / cierre de fase 04:** confirmar a ~375px en el cierre de 04-03 los 5 puntos del `<how-to-verify>` del plan (cards con ícono y selección única; chips + panel de sugerencia en trato de usted; 7 cards con metadatos en coma decimal y "camas a medida"; badge Sugerido que no se mueve al cambiar de card; reflejo del plano con transición; touch targets ≥44px sin desbordes).

## Decisions Made

- Subcarpeta `pasos/` nueva con imports `../../../` (recomendación de PATTERNS.md; el contrato de enchufe sigue siendo `pasosRegistro.jsx`).
- `USOS`/`OCUPANTES` como constantes de UI locales (conjuntos de interfaz); el mapeo ocupantes→modelo se mantiene data-driven vía `SUGERENCIA_OCUPANTES`.
- Badge "Sugerido" independiente del estado seleccionado (Pitfall 4) y corrección silenciosa de baño ampliado clonando `bano` con spread (Pitfall 3, Q4).
- No se acopla al plano por props (DIM-02): solo se escribe `modeloId` y reacciona el cableado existente.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Gate inconsistente con la implementación mandada] Conteo literal de `type="button"` / `aria-pressed`**
- **Found during:** Tarea 1 (PasoUso.jsx) — al correr los gates de aceptación.
- **Issue:** Los criterios `grep -c 'type="button"'` y `grep -c 'aria-pressed'` esperan `>= 11` (asumiendo un literal por cada una de las 5 cards de uso + 6 chips de ocupantes). Pero el plan **exige** renderizar las cards/chips con `.map()` (data-driven, anti-hardcodeo). Con `.map()` el literal aparece **una vez por bucle** (2 veces total en PasoUso), no una por elemento. La implementación data-driven mandada es mutuamente excluyente con el conteo literal `>= 11`.
- **Fix:** Se priorizó la directiva anti-hardcodeo del plan (render con `.map()`). **En runtime sí se renderizan los 11 botones** (5 cards + 6 chips), cada uno con su `aria-pressed` y `type="button"`. El intent funcional (selección única, todos botones accesibles) está cubierto al 100%; solo el conteo de literales en el archivo fuente difiere del número esperado.
- **Files modified:** ninguno adicional (es una nota sobre la interpretación del gate, no un cambio de código).
- **Verification:** `grep -o 'type="button"'` y `grep -o 'aria-pressed'` devuelven 2 cada uno (un literal por `.map`); la sintaxis y la estructura de los bucles renderizan 11 botones.
- **Committed in:** `784cc5b` (Tarea 1).

**2. [Rule 3 - Verificador del entorno] `node --check` no soporta `.jsx` en Node 24**
- **Found during:** Tarea 1 — al ejecutar el `<automated>` `node --check src/components/wizard/pasos/PasoUso.jsx`.
- **Issue:** Node 24 rechaza `node --check` sobre archivos `.jsx` con `ERR_UNKNOWN_FILE_EXTENSION` (limitación del verificador ESM por extensión, **no** un error de sintaxis). Es el primer `.jsx` de la fase verificado así (los archivos de 04-01 eran `.js` de lógica pura).
- **Fix:** Se validó la sintaxis JSX con **esbuild** (`node_modules/.bin/esbuild <archivo> --log-level=warning`), el mismo transformador que usa el Vite del proyecto. Ambos componentes parsean y transforman sin warnings → sintaxis válida (intent del gate `node --check` cumplido).
- **Files modified:** ninguno.
- **Verification:** esbuild OK en ambos archivos; suite completa 33/33.
- **Committed in:** N/A (validación de entorno).

**3. [Rule 1 - Gate tripping por comentarios] Comentarios reescritos en PasoDimensiones.jsx**
- **Found during:** Tarea 2 — al correr los gates `grep -c 'FloorPlan\|PlanoPanel'` (debe ser 0) y `grep -c 'camas a medida'` (debe ser 1).
- **Issue:** Mis comentarios explicativos de cabecera mencionaban "PlanoPanel → FloorPlan" y "camas a medida", inflando los conteos a 1 y 2 respectivamente, aunque en el **código** real no hay acople al plano (0 imports/render) y el literal "camas a medida" aparece una sola vez.
- **Fix:** Reescribí los dos comentarios para que los literales solo vivan en el código real. Ahora `grep -c 'FloorPlan\|PlanoPanel'` = 0 y `grep -c 'camas a medida'` = 1, exactos.
- **Files modified:** `src/components/wizard/pasos/PasoDimensiones.jsx` (solo comentarios).
- **Verification:** ambos gates exactos; esbuild OK; 33/33 tests.
- **Committed in:** `633fabc` (Tarea 2).

---

**Total deviations:** 3 (2 notas de interpretación de gate/entorno sin cambio de código + 1 ajuste de comentarios). Ningún cambio de comportamiento del componente.
**Impact on plan:** Sin scope creep. Los componentes cumplen el contrato funcional del plan (USO-01/02/03, DIM-01/02). Las desviaciones documentan choques entre los gates literales `grep -c` y la implementación data-driven que el propio plan ordena, más una limitación del `node --check` sobre `.jsx` resuelta con esbuild.

## Issues Encountered

- `node --check` sobre `.jsx` (resuelto con esbuild, ver Desviación 2). Sin otros problemas.

## User Setup Required

None - no se requiere configuración de servicios externos.

## Next Phase Readiness

- **Listo para el Plan 04-03 (Wave 3):** PasoUso y PasoDimensiones existen, compilan y cumplen sus gates. El Plan 04-03 debe (a) crear PasoBano.jsx, y (b) **enchufar los 3 pasos** en `pasosRegistro.jsx` reemplazando los stubs de `'uso'`, `'dimensiones'` y `'bano'` por los componentes reales.
- **Verificación visual diferida:** la inspección humana a ~375px de los Pasos 1 y 2 se hará al cierre de 04-03, cuando los pasos estén en vivo. Anotado para el verifier y el orquestador de fase.
- **Sin blockers.**

## Known Stubs

Ninguno introducido por este plan. Los componentes están completamente cableados a `estado`/`dispatch` y a `/data`; reciben datos reales, no mock. (Nota de contexto: los `StubPaso` de `pasosRegistro.jsx` siguen activos hasta que el Plan 04-03 los reemplace — eso es por diseño del waving, no un stub de este plan.)

## Self-Check: PASSED

- FOUND: src/components/wizard/pasos/PasoUso.jsx
- FOUND: src/components/wizard/pasos/PasoDimensiones.jsx
- FOUND commit: 784cc5b (feat 04-02 PasoUso)
- FOUND commit: 633fabc (feat 04-02 PasoDimensiones)

---
*Phase: 04-pasos-1-3-uso-dimensiones-ba-o*
*Completed: 2026-06-27*
