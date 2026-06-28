# Phase 7: Pulido Mobile y Accesibilidad - Context

**Gathered:** 2026-06-28
**Status:** Ready for planning

<domain>
## Phase Boundary

La **última fase del milestone v1.0**: un pase de pulido sobre la interfaz YA construida (landing, wizard
de 6 pasos, plano, resumen/exportación) para que sea cómoda y usable en el target real y accesible. NO se
agregan features nuevas — se afina lo existente.

Entrega dos cosas (UX-01 + UX-02):
1. **Mobile ~375px (Samsung 6"):** wizard, plano y resumen usables **sin desbordes ni elementos cortados**
   ni scroll horizontal.
2. **Accesibilidad:** todos los inputs/controles con label asociado, contraste de texto legible, y el flujo
   **navegable por teclado de punta a punta** (foco visible, orden lógico, controles operables).

**NO es de esta fase** (scope creep → fuera del MVP): rediseño visual o cambio de identidad/paleta;
auditoría WCAG AA formal de producción; tests automatizados de a11y como parte del repo; i18n; soporte de
lectores de pantalla certificado. El motor, los datos y las pantallas ya existen — acá solo se pulen.

</domain>

<decisions>
## Implementation Decisions

### Nivel de accesibilidad (UX-02)
- **D-01:** **Listón pragmático "AA en lo que importa"**, NO WCAG 2.1 AA formal completo ni AAA. Concreto:
  contraste **≥4.5:1** en texto de cuerpo y en valores/totales; **todo input/control con label asociado**
  (visible o `aria-label`/`aria-labelledby`, lo que ya use cada paso); **foco visible y operable**; **sin
  desbordes a 375px**. NO se persigue ARIA exhaustivo ni auditar AA de punta a punta. Acorde al MVP/demo.
  La paleta ya pasa AA en cuerpo (verificado en fases previas) → el trabajo es **corregir lo que falle**,
  nunca reescribir la identidad sobria/industrial (locked en PROJECT.md/CLAUDE.md).

### Verificación (UX-01 + UX-02)
- **D-02:** **Verificación 100% manual con DevTools** — viewport 375px (sin scroll horizontal ni cortes),
  recorrido por teclado (Tab/Shift+Tab/Enter/Espacio/flechas) y el **contrast checker del inspector** para
  los pares de color dudosos. **CERO dependencias nuevas** (ni `axe-core`, ni `eslint-plugin-jsx-a11y`, ni
  Lighthouse como dep del repo) — consistente con el patrón del proyecto (lógica pura con `node:test`, sin
  libs extra; runtime solo React + jspdf/svg2pdf). Lighthouse/axe quedan como herramienta ad-hoc del
  navegador si hiciera falta un score de referencia, **no** como dependencia versionada.

### Alcance del teclado / foco (UX-02, criterio 3)
- **D-03:** **Barrido end-to-end: landing + wizard (6 pasos) + resumen.** Se debe poder completar TODO el
  flujo solo con teclado: foco visible en cada control, orden de tabulación lógico, y **operables por
  teclado** el plano colapsable ("Ver plano actual" / zoom, PLANO-03), los links "Editar" por sección del
  resumen (`IR_A_PASO`) y los botones de exportación (WhatsApp `<a>` / PDF `<button>`). La demo se navega
  entera sin mouse. (Más amplio que el criterio literal "wizard", por decisión del usuario.)

### Movimiento (accesibilidad, WCAG 2.3.3)
- **D-04:** **Respetar `prefers-reduced-motion` de forma global** — una media query en el CSS base
  (`src/styles/index.css`, donde vive `fp-anim`) que reduce/desactiva las transiciones del plano (~300ms,
  PLANO-02) y las de los pasos cuando el SO pide menos movimiento. Aplica a **todas** las animaciones, no
  solo al plano.

### Claude's Discretion (research/planner deciden)
- **Qué pares de color exactos** no llegan a 4.5:1 y cómo ajustarlos (detectar con el inspector); afinar
  solo tonos muted (`text-impacar-texto/70` y similares) donde falle — sin tocar la paleta locked.
- **Orden exacto de tabulación** y dónde hacen falta `tabindex` / roles ARIA puntuales.
- **Labels visibles vs `sr-only`/`aria-label`** por control (preferir lo que ya usa cada paso; no romper el layout sobrio).
- **Implementación de la media query** reduced-motion (CSS global vs utilidad) y a qué transiciones concretas aplica.
- **Detección y fix puntual de desbordes a 375px** (textos largos del resumen, nombres de extras, líneas del desglose, el plano, la barra de precio sticky).
- Si conviene un checkpoint visual humano al cierre (como en fases previas) para firmar el "se ve y se opera bien a 375px + teclado".

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap y requirements
- `.planning/ROADMAP.md` § "Phase 7: Pulido Mobile y Accesibilidad" — goal + los 3 success criteria.
- `.planning/REQUIREMENTS.md` § UX — **UX-01** (mobile ~375px) y **UX-02** (labels/contraste/teclado),
  texto autoritativo; UX-03/04 ya completos sirven de patrón (trato de usted, focus visible).
- `.planning/PROJECT.md` § "Constraints" — mobile-first Samsung ~375px, identidad sobria/industrial,
  paleta locked (fondo #F5F5F0, campo #2D5016, cobre #8B6914, texto #1A1A1A).

### Patrones de a11y ya establecidos (a respetar/extender)
- `.planning/phases/06-resumen-y-exportaci-n/06-UI-SPEC.md` § "Accessibility (baseline only — full audit
  is Phase 7)" — difiere explícitamente el audit a esta fase; define `min-h-[44px]`, `focus:ring-2`,
  color nunca como único señalizador, `role="img"`+`<title>` del plano.
- `tailwind.config.js` — paleta `impacar-*` / `zona-*`, fuente Inter, tokens (fuente de verdad de color).
- `src/styles/index.css` — CSS base global; **acá va la media query `prefers-reduced-motion`** (D-04);
  contiene `fp-anim` (la animación del plano).

### Superficies a pulir (código existente)
- `src/App.jsx` — ruteo landing/wizard/resumen (orden de foco al cambiar de vista).
- `src/components/Landing.jsx` — primera pantalla del barrido por teclado (D-03).
- `src/components/ConfiguratorWizard.jsx` + `src/components/wizard/BarraProgreso.jsx` — nav Anterior/Siguiente, progressbar (aria), foco entre pasos.
- `src/components/wizard/PlanoPanel.jsx` + `src/components/FloorPlan.jsx` — plano colapsable/zoom (operable por teclado, PLANO-03) y `fp-anim`.
- `src/components/wizard/pasos/*.jsx` (PasoUso, PasoDimensiones, PasoBano, PasoDormitorio, PasoCocina, PasoExtras) — inputs/checkboxes/chips: labels + foco + contraste.
- `src/components/wizard/BarraPrecio.jsx` — barra sticky en mobile (desborde a 375px).
- `src/components/Resumen.jsx` + `src/components/resumen/*.jsx` — secciones "Editar", desglose, AccionesExport (WhatsApp/PDF) por teclado.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`min-h-[44px]`**: estándar de touch target ya aplicado en toda la UI (Landing, nav del wizard,
  PasoExtras, AccionesExport) — base de la operabilidad táctil/teclado, solo verificar cobertura.
- **`focus:ring-2 focus:ring-impacar-campo/40`**: patrón de foco visible ya presente en controles —
  extender a cualquier control que lo tenga faltante.
- **`FloorPlan` `<svg role="img">` + `<title>`** y **`PlanoPanel`** colapsable (PLANO-03): la base de
  accesibilidad del plano ya existe; falta asegurar operabilidad por teclado del colapsado/zoom.
- **`BarraProgreso`**: ya expone un `progressbar` con value — verificar aria.

### Established Patterns
- Identidad sobria locked: ajustes de contraste solo afinan tonos, no cambian la paleta.
- Trato de usted + gate anti-voseo (UX-03) — cualquier copy nuevo de a11y (p.ej. textos sr-only) lo respeta.
- Lógica/utilidades testeadas con `node:test` sin deps nuevas — pero esta fase es CSS/markup/foco, no
  lógica pura: la verificación es manual (D-02), no por tests automatizados.
- Tolerancia a estado adulterado y formato `$` argentino — ya resueltos, no se tocan.

### Integration Points
- **`src/styles/index.css`**: nueva media query global `@media (prefers-reduced-motion: reduce)` que
  neutraliza/acorta transiciones (D-04).
- **Componentes de pasos y resumen**: ajustes de label/foco/contraste in situ (sin lógica nueva).
- **`App.jsx`**: gestión de foco al cambiar de vista (landing→wizard→resumen) para un recorrido por
  teclado coherente (D-03).

</code_context>

<specifics>
## Specific Ideas

- **Target concreto:** Samsung ~6", viewport **~375px** — el ancho de referencia para "sin desbordes".
- **Contraste objetivo:** **4.5:1** en cuerpo/totales (umbral AA de texto normal), pragmático (D-01).
- **Navegación sin mouse de punta a punta** como prueba de aceptación del usuario (D-03): de la landing al
  PDF/WhatsApp solo con teclado.
- La verificación es **manual con DevTools** (D-02): 375px + Tab + contrast checker; sin instalar nada.

</specifics>

<deferred>
## Deferred Ideas

- **Auditoría WCAG 2.1 AA formal completa** (ratios exactos en todo, ARIA/roles exhaustivos, orden de
  lectura certificado) — fuera del MVP; sería un esfuerzo de nivel producción.
- **Herramientas de a11y como dependencia del repo** (`axe-core`, `eslint-plugin-jsx-a11y`, Lighthouse CI)
  — descartado por D-02 (cero deps nuevas); reconsiderable post-MVP.
- **Soporte certificado de lectores de pantalla / i18n** — fuera de alcance del demo.

</deferred>

---

*Phase: 07-pulido-mobile-y-accesibilidad*
*Context gathered: 2026-06-28*
