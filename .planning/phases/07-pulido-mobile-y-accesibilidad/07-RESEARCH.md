# Phase 7: Pulido Mobile y Accesibilidad - Research

**Researched:** 2026-06-28
**Domain:** Pulido de UI existente — responsive mobile (~375px), accesibilidad pragmática (labels / contraste / teclado) y `prefers-reduced-motion` en una app Vite + React 18 + Tailwind v3, client-side, sin backend.
**Confidence:** HIGH

## Summary

Esta es la **última fase del milestone v1.0**: un pase de pulido sobre UI ya construida y verificada
(landing, wizard de 6 pasos, plano SVG, resumen/exportación). NO se agregan pantallas ni componentes
nuevos — se afina markup, CSS y foco in situ. El trabajo se divide en dos requirements: **UX-01** (usable
a ~375px sin desbordes) y **UX-02** (labels en todo input, contraste ≥4.5:1 en cuerpo/totales, teclado de
punta a punta). Todo bajo cuatro decisiones LOCKED: listón pragmático "AA en lo clave" (D-01), verificación
100% manual con DevTools y CERO dependencias nuevas (D-02), barrido por teclado end-to-end landing→wizard→
resumen incluyendo plano colapsable y export (D-03), y `prefers-reduced-motion` global en `src/styles/index.css`
(D-04).

La revisión del código real arroja una base muy sólida: el proyecto ya aplica `min-h-[44px]`, `focus:ring-2
focus:ring-impacar-campo/40`, `aria-pressed` en cards/chips, `<label>` envolvente en los checkboxes,
`role="img"`+`<title>` en el SVG, `role="progressbar"` con valores, y `rel="noopener noreferrer"` en el link
de WhatsApp. Los huecos reales son acotados y concretos: (1) **no existe gestión de foco al cambiar de vista**
(App.jsx landing↔wizard↔resumen) ni entre pasos del wizard — el foco se pierde al fondo del DOM tras navegar;
(2) la media query reduced-motion actual **solo cubre `.fp-anim`**, no las transiciones de Tailwind (`transition-colors`,
`transition-all` de la barra de progreso); (3) **`text-impacar-texto/60` NO llega a 4.5:1** sobre `#F5F5F0`
(4.41:1, FAIL) — usado en los links "Volver a empezar"/"Volver a editar"; (4) el selector de heladera declara
`role="radiogroup"` pero sus botones usan `aria-pressed` en vez de `role="radio"`+`aria-checked` (semántica
inconsistente); (5) riesgos de desborde a 375px en nombres largos de extras (resumen/desglose), la barra de
precio sticky y los textos de cotas del plano.

**Primary recommendation:** Tratar la fase como un checklist de auditoría manual por superficie (6 pantallas
× 3 ejes: 375px / teclado+foco / contraste), arreglando solo lo que falle con utilidades Tailwind existentes
(min-w-0, flex-wrap, truncate, subir `/60`→`/70`, `motion-reduce:`/CSS global) + un único patrón nuevo de foco
(useRef + useEffect + tabIndex={-1}) reutilizado en App.jsx y entre pasos. Sin tocar la paleta, sin deps nuevas,
sin tests automatizados nuevos (la verificación es manual por D-02; `npm test` queda como guarda de regresión).

## Architectural Responsibility Map

Esta fase es 100% capa **Browser / Client** (SPA sin backend). El mapa distingue *sub-superficies* del
cliente para que el planner asigne tareas a archivos correctos.

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Gestión de foco al cambiar de vista (D-03) | App.jsx (ruteo de estado) | cada vista (heading/contenedor) | App es el único punto que conoce el cambio landing↔wizard↔resumen |
| Foco al avanzar/retroceder paso (D-03) | ConfiguratorWizard.jsx | cada `Paso*.jsx` (heading h2) | el wizard controla `pasoActual`; el heading del paso es el target del foco |
| `prefers-reduced-motion` global (D-04) | `src/styles/index.css` | tailwind.config (opcional) | D-04 fija CSS global; neutraliza `.fp-anim` + transiciones de Tailwind |
| Operabilidad por teclado del plano colapsable/zoom (PLANO-03) | PlanoPanel.jsx | FloorPlan.jsx (SVG) | el toggle ya es `<button>`; el SVG es `role="img"` no interactivo |
| Labels de inputs (UX-02) | cada `Paso*.jsx` / `resumen/*.jsx` | — | los controles viven en cada paso; el fix es local |
| Contraste de texto (UX-02) | tailwind.config (tokens) + clases por componente | — | la paleta es token global; los tonos muted son clases locales |
| Detección/fix de desbordes a 375px (UX-01) | clases utilitarias por componente | layout de ConfiguratorWizard | desbordes son locales (texto/flex); algunos del grid del wizard |

## Standard Stack

> Esta fase NO instala nada (D-02: CERO dependencias nuevas). El "stack" es lo YA presente; el trabajo
> usa exclusivamente utilidades de Tailwind v3 y APIs nativas de React 18 ya disponibles.

### Core (ya instalado — versiones verificadas)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react / react-dom | 18.3.1 | Foco programático (`useRef`+`useEffect`), render | Stack locked [VERIFIED: node_modules/react/package.json] |
| tailwindcss | 3.4.19 | Variantes responsive (`sm:`/`lg:`), foco (`focus:ring-2`), `motion-reduce:`, overflow utils | Stack locked; v3 soporta `motion-reduce`/`motion-safe` [VERIFIED: node_modules; CITED: v3.tailwindcss.com] |
| vite | ^5.4.0 | Dev server (`npm run dev`) para la verificación manual con DevTools | Stack locked [VERIFIED: package.json] |

**NO actualizar a Tailwind v4** (latest = 4.3.1 [VERIFIED: npm view tailwindcss version]). v4 cambia el modelo
de configuración (CSS-first, sin `tailwind.config.js`) y rompería la paleta `impacar-*`/`zona-*` actual. El stack
está pinneado a v3 por decisión locked; un bump es un cambio de dependencia prohibido por D-02.

### Supporting (NO usar — descartados por D-02)
| Library | Purpose | Why NOT |
|---------|---------|---------|
| axe-core / @axe-core/react | auditoría a11y runtime | D-02: CERO deps nuevas — usar inspector ad-hoc del navegador, no versionar |
| eslint-plugin-jsx-a11y | lint estático de a11y | D-02: prohibido; la verificación es manual |
| Lighthouse CI | score de a11y en CI | D-02: queda como herramienta ad-hoc del navegador, no dependencia |
| focus-trap-react / react-focus-lock | trampas de foco | Innecesario: esta app no tiene modales; el foco se *mueve*, no se *atrapa* |

### Alternatives Considered (técnicas, no librerías)
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `motion-reduce:` por utilidad en cada componente | Media query GLOBAL en index.css | D-04 fija el enfoque GLOBAL — una regla cubre todo, incluido lo no marcado con utilidad. Recomendado por D-04. |
| Foco al heading del paso | Foco al contenedor `<section>` | Heading (`h2 tabIndex={-1}`) es el patrón canónico: anuncia el cambio a lectores y reubica el foco visible |
| Skip-link "saltar al contenido" | Ninguno | Ver Open Question Q1: para esta app de 1 header corto + contenido inmediato, el ROI es bajo; D-01 no lo exige |

**Installation:** Ninguna. `npm install` no se ejecuta en esta fase.

## Architecture Patterns

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  PREFERENCIA DEL SO: prefers-reduced-motion (D-04)                    │
│         │                                                             │
│         ▼  @media en src/styles/index.css (GLOBAL)                    │
│   neutraliza: .fp-anim (plano) + transition-* de Tailwind            │
└─────────────────────────────────────────────────────────────────────┘
        │ (afecta a todas las vistas)
        ▼
ENTRADA TECLADO (Tab / Shift+Tab / Enter / Espacio / flechas)
        │
        ▼
┌──────────────┐  setVista   ┌──────────────────┐  onVerResumen  ┌──────────────┐
│   Landing    │────────────▶│ ConfiguratorWizard│───────────────▶│   Resumen    │
│  (h1, CTA)   │             │  (h1 header,      │                │ (h1, plano,  │
│              │◀────────────│   BarraProgreso,  │◀───────────────│  secciones,  │
└──────────────┘ onVolverInicio  Paso[0..5], nav)│  onVolverEditar │  export)     │
        ▲                    │   + PlanoPanel    │                └──────────────┘
        │                    │   + BarraPrecio   │                       │
   FOCO AL MONTAR            └──────────────────┘                  FOCO AL MONTAR
   (useRef+useEffect,              │      ▲                        (h1 tabIndex=-1)
    h1 tabIndex=-1)        SIGUIENTE│      │ANTERIOR                       │
        ▲                          ▼      │                               ▼
   ┌────┴──────────────────────────────────────┐              ┌──────────────────┐
   │  FOCO AL CAMBIO DE PASO (heading h2 del    │              │ AccionesExport:  │
   │  Paso, tabIndex=-1) — hueco a implementar  │              │  <a> WhatsApp +  │
   └────────────────────────────────────────────┘             │  <button> PDF    │
                                                               │  (teclado OK)    │
   PlanoPanel (mobile): <button aria-expanded> ─ colapsa/expande └──────────────────┘
   FloorPlan: <svg role="img"><title> (no interactivo, OK)
```

Trazabilidad del caso primario (D-03, sin mouse): `Tab` desde la landing → `Enter` en "Comenzar"
(foco salta al h1 del wizard) → recorrer cada paso con `Tab` + operar controles con `Enter`/`Espacio`/
flechas → `Siguiente` (foco al h2 del nuevo paso) ×6 → "Ver resumen" (foco al h1 del resumen) → `Tab`
hasta WhatsApp/PDF y activar con `Enter`.

### Recommended Project Structure (sin archivos nuevos — solo ediciones in situ)
```
src/
├── styles/index.css          # D-04: extender @media (prefers-reduced-motion)
├── App.jsx                   # D-03: foco al cambiar de vista (useRef + useEffect)
├── components/
│   ├── Landing.jsx           # heading focuseable + sweep de teclado
│   ├── ConfiguratorWizard.jsx# foco entre pasos; audit 375px del grid + sticky
│   ├── wizard/
│   │   ├── BarraProgreso.jsx # aria (ya OK); verificar % visible/contraste
│   │   ├── BarraPrecio.jsx   # audit desborde 375px de las 3 líneas
│   │   ├── PlanoPanel.jsx    # toggle ya <button>; verificar foco/operabilidad
│   │   └── pasos/*.jsx       # labels + heading h2 tabIndex=-1 + heladera role fix
│   ├── FloorPlan.jsx         # SVG role="img" (OK); audit textos de cota a 375px
│   └── resumen/*.jsx         # labels "Editar"/export; subir /60; desborde extras
```

### Pattern 1: Foco al cambiar de vista / paso (heading + tabIndex=-1)
**What:** Tras un cambio de vista (SPA sin router) o de paso, el foco queda al final del DOM o se pierde;
hay que moverlo al heading de la nueva pantalla para que el teclado/lectores arranquen arriba.
**When to use:** En App.jsx al cambiar `vista`, y en ConfiguratorWizard/cada Paso al cambiar `pasoActual`.
**Example:**
```jsx
// Source: patrón canónico [CITED: jshakespeare.com/accessible-route-change-react-router-autofocus-heading;
//         CITED: upyoura11y.com/handling-focus; CITED: developer.mozilla.org React accessibility]
import { useRef, useEffect } from 'react'

function VistaConFoco({ children }) {
  const headingRef = useRef(null)
  useEffect(() => {
    headingRef.current?.focus()   // mueve el foco al montar/cambiar
  }, [])                          // (o [pasoActual] si es el heading del paso)
  return (
    <h1 ref={headingRef} tabIndex={-1} className="... focus:outline-none">
      {children}
    </h1>
  )
}
```
Notas: `tabIndex={-1}` hace el heading focuseable por JS pero NO lo mete en el orden de Tab natural
(el usuario no puede re-tabular a él). Añadir `focus:outline-none` (o un ring sobrio) para que el heading
enfocado no muestre un contorno inesperado en un título. En el wizard, el efecto depende de `[estado.pasoActual]`.

### Pattern 2: prefers-reduced-motion GLOBAL (D-04)
**What:** Una media query global que neutralice TODA animación/transición cuando el SO pide menos movimiento,
no solo `.fp-anim` (lo actual). Cubre `transition-colors` (botones/cards), `transition-all duration-300`
(BarraProgreso) y `.fp-anim` (plano).
**When to use:** Una sola vez en `src/styles/index.css`.
**Example:**
```css
/* Source: patrón WCAG 2.3.3 estándar + MDN prefers-reduced-motion [CITED: developer.mozilla.org] */
@media (prefers-reduced-motion: reduce) {
  /* Neutraliza animaciones/transiciones de TODOS los elementos (incl. utilidades de Tailwind). */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
  /* La regla específica de .fp-anim queda cubierta por lo anterior; puede mantenerse por claridad. */
}
```
**Tradeoff con la utilidad de Tailwind:** Tailwind v3 expone `motion-reduce:transition-none` por elemento
[CITED: v3.tailwindcss.com/docs/hover-focus-and-other-states], PERO D-04 fija el enfoque GLOBAL — una regla
captura también lo que no lleva la utilidad. El wildcard `*` con `!important` es el idiom probado del campo;
el `0.01ms` (en vez de `none`) preserva eventos `transitionend` si algún día se dependiera de ellos. No rompe
layout porque solo toca duración, no propiedades de caja.

### Pattern 3: Label de control sin romper el diseño sobrio
**What:** Cada control debe tener nombre accesible. El proyecto ya usa tres mecanismos correctos según el control.
**When to use:** Auditar que CADA control caiga en uno de estos; los que falten, completarlos con el patrón
que ya usa ese paso (no introducir uno nuevo).
**Example:**
```jsx
// (a) Checkbox: <label> ENVOLVENTE — asociación implícita (ya usado en PasoBano/Cocina/Extras/Dormitorio).
<label className="flex ... cursor-pointer">
  <input type="checkbox" checked={marcado} onChange={...} className="accent-[#2D5016]" />
  <span className="text-sm">{e.nombre}</span>
</label>

// (b) Botón-card / chip: el TEXTO visible es el nombre accesible + aria-pressed para el estado
//     toggle (ya usado en PasoUso/Dimensiones/Bano tamaño). Correcto para botones tipo "toggle".
<button type="button" aria-pressed={seleccionado}>{u.label}</button>

// (c) Stepper con solo glifo (+/−): aria-label explícito (ya usado en PasoDormitorio).
<button type="button" aria-label={`Agregar ${t.singular}`}>+</button>

// (d) Grupo de controles relacionados: role="group"/"radiogroup" + aria-labelledby al <p> título
//     (ya usado en PasoCocina para heladera) — ver Pitfall 4 sobre la semántica radio.
<p id="label-heladera">Heladera</p>
<div role="radiogroup" aria-labelledby="label-heladera"> ... </div>
```

### Anti-Patterns to Avoid
- **Tocar la paleta locked para "arreglar" contraste:** PROHIBIDO (D-01/CLAUDE.md). Solo subir el *nivel de
  opacidad* del tono muted (p.ej. `/60`→`/70`) o usar el color base sólido; nunca cambiar `impacar-*`/`zona-*`.
- **Convertir el SVG del plano en algo "tabuleable":** el `<svg role="img">` es contenido no interactivo;
  el que debe ser operable es el `<button>` de colapso (ya lo es). No añadir `tabindex` al SVG.
- **Introducir focus traps:** no hay modales; mover el foco basta. Una trampa rompería el barrido end-to-end.
- **Añadir ARIA "por las dudas":** D-01 descarta ARIA exhaustivo; ARIA mal puesto (p.ej. `role="radio"` sin
  manejo de flechas) empeora la a11y. Preferir HTML nativo + lo mínimo correcto.
- **Crear tests automatizados de a11y/CSS:** violan D-02. La verificación es manual (ver Validation Architecture).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Variante de reduced-motion | Detección JS de `matchMedia` + estado React | `@media (prefers-reduced-motion)` en CSS (D-04) o `motion-reduce:` | El CSS lo resuelve sin JS; reacciona en vivo al cambio de preferencia |
| Foco visible | CSS de outline a mano por control | `focus:ring-2 focus:ring-impacar-campo/40` (patrón ya presente) | Reusar el token de foco existente mantiene consistencia y sobriedad |
| Touch target 44px | cálculos de padding ad-hoc | `min-h-[44px]` (estándar del proyecto) | Ya aplicado en toda la UI; solo verificar cobertura |
| Asociación label↔input | `htmlFor`/`id` generados a mano en checkboxes | `<label>` envolvente (ya usado) | La asociación implícita evita IDs duplicados y es a prueba de errores |
| Detección de desbordes | librería de "overflow detector" | DevTools (regla de viewport 375px + `overflow` audit) | D-02: verificación manual; cero deps |
| Medición de contraste | calculadora propia en runtime | Contrast checker del inspector de DevTools (D-02) | Herramienta nativa, exacta, sin versionar nada |

**Key insight:** Casi todo lo que esta fase necesita YA existe como utilidad de Tailwind o API nativa del
navegador. El valor está en *auditar y corregir*, no en construir mecanismos. Cualquier "solución" que requiera
una dependencia nueva contradice D-02 y es señal de que se está sobre-resolviendo.

## Common Pitfalls

### Pitfall 1: La media query reduced-motion actual solo cubre `.fp-anim`
**What goes wrong:** D-04 pide neutralizar "todas las animaciones", pero `index.css` hoy solo apaga `.fp-anim`.
Las transiciones de Tailwind (`transition-colors` en botones/cards, `transition-all duration-300` en
BarraProgreso) siguen animando con reduced-motion activo.
**Why it happens:** La regla se escribió en Phase 2 cuando solo existía el plano.
**How to avoid:** Reemplazar/ampliar la regla con el wildcard `*` (Pattern 2) que captura toda transición/animación.
**Warning signs:** En DevTools, emular "prefers-reduced-motion: reduce" y ver que la barra de progreso o el
hover de las cards aún animan.

### Pitfall 2: El foco se pierde al cambiar de vista/paso (no existe gestión hoy)
**What goes wrong:** Al pasar de landing→wizard, de paso a paso, o wizard→resumen, el foco queda donde estaba
el botón pulsado (al fondo del DOM) o se va al `<body>`. El usuario de teclado tiene que re-tabular desde abajo.
**Why it happens:** No hay router (SPA por estado en App.jsx) ni `useEffect` de foco — `grep` confirma 0
usos de `.focus()`/`tabIndex`/`autoFocus` en `src/`.
**How to avoid:** Aplicar Pattern 1 en App.jsx (al cambiar `vista`) y en el wizard (al cambiar `pasoActual`).
**Warning signs:** Tras "Comenzar"/"Siguiente", `Tab` no arranca arriba de la nueva pantalla.

### Pitfall 3: `text-impacar-texto/60` no alcanza 4.5:1 sobre el fondo
**What goes wrong:** El tono `/60` (negro #1A1A1A al 60% sobre `#F5F5F0`) da **4.41:1 — FALLA** el umbral de
texto normal. Se usa en los links "Volver a empezar" (ConfiguratorWizard.jsx:104) y "Volver a editar"
(AccionesExport.jsx:106). [VERIFIED: cálculo WCAG, ver Code Examples]
**Why it happens:** Tono elegido por sobriedad sin medir el ratio compuesto por opacidad.
**How to avoid:** Subir esos dos links a `text-impacar-texto/70` (6.13:1 — PASA) o al color base. Cambio mínimo,
no toca la paleta. Ojo: `/70` PASA en todas las superficies; `/80` y superiores también.
**Warning signs:** El contrast checker del inspector marca esos links en ámbar/rojo a tamaño normal.

### Pitfall 4: El selector de heladera mezcla `role="radiogroup"` con `aria-pressed`
**What goes wrong:** PasoCocina.jsx declara `role="radiogroup"` pero sus opciones son `<button aria-pressed>`
(semántica de toggle), no `role="radio"`+`aria-checked` (semántica de radio). Un lector de pantalla anuncia
un grupo de radios pero encuentra botones de alternancia, y no hay navegación por flechas que un radiogroup
implica.
**Why it happens:** Se reusó el patrón de chips `aria-pressed` dentro de un contenedor marcado como radiogroup.
**How to avoid (discrecional, D-01):** La opción de menor riesgo y consistente con D-01 (ARIA mínimo correcto)
es **quitar `role="radiogroup"`/`aria-labelledby` y dejar los botones `aria-pressed`** dentro de un `role="group"`
con `aria-labelledby` (grupo etiquetado, sin prometer semántica radio). Implementar radios "de verdad" (flechas,
roving tabindex) sería ARIA exhaustivo, fuera del listón D-01. Decisión final del planner/usuario.
**Warning signs:** Inconsistencia visible en el árbol de accesibilidad de DevTools (radiogroup con hijos no-radio).

### Pitfall 5: Desbordes a 375px por texto largo no truncable
**What goes wrong:** Nombres de extras largos (p.ej. "Sistema solar 220 off grid (inv 3kVA, 4 paneles 485W,
2 baterías litio 100Ah)") en filas `flex justify-between` del desglose (PresupuestoDesglosado) y del paso Extras
pueden empujar el precio fuera del viewport o forzar scroll horizontal. Lo mismo la barra de precio sticky a
375px y los textos de cota del plano si el contenedor es muy angosto.
**Why it happens:** `flex` sin `min-w-0` no deja que el hijo de texto se encoja; el contenido fuerza el ancho.
**How to avoid:** En filas `flex` con texto variable, aplicar `min-w-0` al contenedor de texto y `flex-wrap`/
`break-words`; el precio (corto) con `whitespace-nowrap shrink-0`. Para etiquetas que deban truncar, `truncate`.
Auditar cada fila a 375px en DevTools (D-02).
**Warning signs:** Aparece barra de scroll horizontal en el viewport de 375px; un precio "se sale" de la card.

### Pitfall 6: `disabled` quita el control del orden de Tab (esperado, no romper)
**What goes wrong:** El botón "Anterior" en el Paso 1 y "Ampliado" en N1/N2 están `disabled` — no reciben foco.
Es correcto, pero hay que confirmar que el barrido por teclado NO depende de ellos y que el siguiente foco lógico
existe. No "arreglar" esto añadiéndoles `tabindex`.
**Why it happens:** Confusión entre "operable" y "siempre tabuleable".
**How to avoid:** Verificar que el orden de Tab salta limpiamente sobre los disabled; mantener `disabled` (no
`aria-disabled` solo) para que queden fuera del tab order de forma nativa.
**Warning signs:** El Tab "se traba" o un control deshabilitado recibe foco.

### Pitfall 7: Animar duración a `none` puede romper lógica que escucha `transitionend`
**What goes wrong:** Usar `transition: none` (lo actual en `.fp-anim`) está bien aquí porque nada escucha
`transitionend`. Pero si el wildcard global usara `none`, futuros listeners de fin de transición nunca dispararían.
**Why it happens:** Pattern defensivo del campo.
**How to avoid:** Usar `0.01ms` en lugar de `none` en la regla global (Pattern 2). El plano ya no depende de
`transitionend`, así que es seguro; el `0.01ms` es a prueba de futuro.
**Warning signs:** N/A en esta fase (no hay listeners), pero documentado por robustez.

## Code Examples

Mediciones reales de contraste de los pares del proyecto (compositando la opacidad de Tailwind sobre el
fondo sólido — así es como el navegador renderiza `text-impacar-texto/NN`):

### Contraste verificado de los pares del proyecto
```
// Source: cálculo WCAG 2.x (alpha-compositing + luminancia relativa), reproducible.
// Umbral texto normal = 4.5:1 ; texto grande/UI = 3:1.

--- TEXTO DE CUERPO / OPACIDAD PLENA (todo PASA) ---
texto #1A1A1A  on #F5F5F0 fondo   15.91   PASS
texto #1A1A1A  on white/40 card   16.50   PASS
campo #2D5016  on #F5F5F0 fondo    8.46   PASS
campo #2D5016  on #FFFFFF          9.25   PASS
cobre #8B6914  on #F5F5F0 fondo    4.65   PASS (apenas)
cobre #8B6914  on white/40 card    4.82   PASS
white #FFFFFF  on campo (header)   9.25   PASS

--- TEXTO MUTED (los sospechosos) ---
texto/80  on #F5F5F0 fondo   8.64   PASS
texto/70  on #F5F5F0 fondo   6.13   PASS   ← seguro para helper text
texto/70  on white/40 card   6.25   PASS
texto/60  on #F5F5F0 fondo   4.41   FAIL   ← links "Volver a empezar/editar"
texto/60  on white/40 card   4.50   FAIL (borde)
texto/60  on #FFFFFF         4.54   PASS (apenas; depende del fondo real)

--- ESTADO SELECCIONADO (campo sobre fondo teñido) ---
campo text on campo/10 (fondo)   7.23   PASS
campo text on campo/10 (white)   7.88   PASS
```
**Conclusión accionable:** el único par que FALLA a tamaño normal es `text-impacar-texto/60`; subirlo a `/70`
lo lleva a ≥6:1 en toda superficie. El cobre como texto de cuerpo (advertencia de dormitorio, 4.65–4.82)
PASA pero por poco — está OK para el listón D-01; si se quisiera margen, oscurecerlo levemente, pero NO es
obligatorio. Todo lo demás está holgado.

### Verificación manual en DevTools (método, D-02)
```
// 1) Responsive 375px:
//    DevTools → Toggle device toolbar (Ctrl+Shift+M) → "Responsive" → ancho 375 → recorrer
//    landing / cada paso 1-6 / resumen buscando scroll horizontal o cortes.
// 2) Contraste de un par dudoso:
//    Inspeccionar el texto → en el panel Styles, click en el swatch de color → el picker muestra
//    "Contrast ratio" con check ✓ (AA) / ✗. Verificar los links muted y la advertencia cobre.
// 3) prefers-reduced-motion:
//    DevTools → Rendering → "Emulate CSS media feature prefers-reduced-motion: reduce" →
//    cambiar de paso/modelo y confirmar que el plano y las transiciones NO animan.
// 4) Teclado end-to-end (sin mouse):
//    Tab/Shift+Tab/Enter/Espacio/flechas desde landing hasta WhatsApp/PDF; foco visible en cada
//    parada; orden lógico; plano colapsable operable; export operable.
```

## Runtime State Inventory

> No aplica plenamente (esta no es una fase de rename/migración), pero por rigor: ¿qué estado runtime
> persiste tras los cambios de CSS/markup/foco?

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `localStorage` key `impacar_config_v1` — guarda config del wizard; los cambios de a11y/CSS NO tocan su forma | Ninguna — el shape del estado no cambia |
| Live service config | None — app 100% client-side, sin servicios externos | Ninguna |
| OS-registered state | None — no hay tareas/daemons/registros de SO | Ninguna |
| Secrets/env vars | None — sin secrets ni env vars (demo sin backend) | Ninguna |
| Build artifacts | None que el pulido invalide — Vite recompila CSS/JSX en `npm run dev`/`build` sin artefactos persistentes | Ninguna |

**Nota:** El número de WhatsApp y los datos de contacto del export (`utils/exportWhatsApp`, `exportPDF`) son
strings en código, no estado runtime, y NO se tocan en esta fase.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `transition: none` solo en `.fp-anim` | `@media (prefers-reduced-motion)` global con wildcard `*` | Patrón estándar WCAG 2.3.3 actual | Cubre TODA animación (D-04), no solo el plano |
| Foco manual con `tabindex` positivos | Foco programático con `tabIndex={-1}` + `useEffect` | Patrón a11y React consolidado | Mueve foco sin alterar el orden natural de Tab |
| Auditar a11y "a ojo" | Inspector de contraste + emulación reduced-motion en DevTools | DevTools modernos | Medición exacta sin instalar nada (D-02) |

**Deprecated/outdated:**
- `tabindex` positivos (>0) para ordenar foco: anti-patrón — rompe el orden natural. Usar orden del DOM + `-1`
  solo para foco programático.
- Tailwind v4 como destino: NO migrar (rompe `tailwind.config.js` y la paleta; prohibido por D-02).

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `white/40` card sobre `#F5F5F0` compone a ~#FAFAF8 (usado para los ratios de "card") | Code Examples | Bajo — el ratio en card es ≥ el de fondo puro; si el fondo efectivo difiere, los PASS holgados no cambian; solo `/60` está al borde y igual se sube a `/70` |
| A2 | Ningún listener depende de `transitionend` hoy (justifica `0.01ms` vs `none`) | Pitfall 7 | Muy bajo — grep no halló listeners; si surgiera, `0.01ms` es más seguro que `none` |
| A3 | El "zoom" del plano (mencionado en D-03/PLANO-03) se refiere al colapsable mobile ya existente; NO hay un control de zoom separado en el código actual | Architecture / Open Q2 | Medio — si se espera un control de zoom nuevo, sería scope adicional; el código solo tiene el toggle colapsable. Confirmar con usuario. |
| A4 | El listón D-01 acepta dejar el cobre-como-texto en 4.65:1 (PASA pero ajustado) sin oscurecerlo | Code Examples | Bajo — cumple 4.5:1; si se exigiera margen, es un ajuste menor del token cobre solo donde es texto |

**Nota:** Las mediciones de contraste son cálculos verificados (no asumidos); lo único asumido es el fondo
efectivo de las cards (A1) y la inexistencia de un control de zoom separado (A3), que el planner debe confirmar.

## Open Questions (RESOLVED)

> RESOLVED: Q1 → OMITIR skip-link (ningún plan lo incluye, coherente con D-01). Q2 → "zoom" = el colapsable
> existente; NO se agrega control nuevo (07-02 Task 2 con grep gate anti-zoom). Q3 → SÍ checkpoint visual
> humano al cierre (implementado en 07-03 Task 2, autonomous: false).

1. **¿Vale la pena un skip-link "saltar al contenido"?**
   - What we know: D-03 exige barrido end-to-end por teclado; el header del wizard/resumen es corto (logo +
     subtítulo), y el contenido viene inmediatamente después. No hay nav extensa que saltar.
   - What's unclear: Si el usuario quiere el skip-link como cortesía estándar.
   - Recommendation: OMITIR por defecto — bajo ROI para esta estructura simple y D-01 no lo exige. Si se quiere,
     es un `<a class="sr-only focus:not-sr-only" href="#main">` trivial; dejarlo a discreción del planner/usuario.

2. **¿"Zoom" del plano = el colapsable existente, o un control de zoom nuevo?**
   - What we know: El código tiene SOLO el toggle "Ver plano actual"/"Ocultar plano" (PlanoPanel) y el SVG escala
     con `width="100%"`. No existe un control de zoom/fullscreen separado. D-03 menciona "plano colapsable/zoom".
   - What's unclear: Si "zoom" se refiere a ese colapsable (interpretación A3) o se espera agregar zoom.
   - Recommendation: Tratar el colapsable existente como el alcance; operarlo por teclado es lo que UX-02 exige.
     Agregar un control de zoom nuevo sería feature, no pulido (fuera del boundary de la fase). Confirmar.

3. **¿Checkpoint visual humano al cierre?**
   - What we know: Fases previas (05, 06) cerraron con checkpoint visual; CONTEXT.md lo marca como discrecional.
   - What's unclear: Si el usuario quiere firmar manualmente "se ve y se opera bien a 375px + teclado".
   - Recommendation: SÍ — dado que la verificación es 100% manual (D-02) y subjetiva (sobriedad + operabilidad),
     un checkpoint visual humano final es el cierre natural de esta fase. Incluirlo como gate de la última wave.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | dev server / `npm test` (regresión) | ✓ | (instalado) | — |
| Vite dev server | verificación manual a 375px (D-02) | ✓ | ^5.4.0 | — |
| Navegador con DevTools (contrast checker + reduced-motion emulation + responsive 375px) | TODA la verificación (D-02) | ✓ (asumido: navegador de escritorio moderno) | — | — |

**Missing dependencies with no fallback:** Ninguna.
**Missing dependencies with fallback:** Ninguna. La fase NO instala nada (D-02). La única "herramienta" es
DevTools del navegador, ya disponible. `npm test` (node:test) sigue corriendo como guarda de regresión.

## Validation Architecture

> `workflow.nyquist_validation: true` [VERIFIED: .planning/config.json]. PERO esta fase es CSS/markup/foco,
> NO lógica pura — por D-02 la verificación es **100% MANUAL con DevTools** y NO se crean tests automatizados
> nuevos. Esta sección es deliberadamente **Manual-First**: un UAT checklist atado a UX-01/UX-02. Crear tests
> automatizados de a11y aquí requeriría deps nuevas (axe-core, jsdom-axe) → VIOLA D-02. No hacerlo.

### Test Framework
| Property | Value |
|----------|-------|
| Framework (automatizado) | `node:test` nativo (Node test runner) — solo lógica pura, SIN deps |
| Config file | none — `npm test` lista los archivos `*.test.js` explícitamente [VERIFIED: package.json] |
| Quick run command | `npm test` (100 tests de lógica pura; guarda de regresión, NO cubre a11y/CSS) |
| Full suite command | `npm test` |
| Verificación de la fase | **MANUAL** — `npm run dev` + DevTools (375px / teclado / contrast / reduced-motion) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Comando / Método | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| UX-01 | Sin desbordes ni cortes a ~375px en landing+wizard(6)+resumen | manual-only | DevTools responsive 375px, recorrer 8 pantallas | n/a (manual, D-02) |
| UX-01 | Barra de precio sticky y plano no fuerzan scroll horizontal a 375px | manual-only | DevTools 375px, observar overflow-x | n/a |
| UX-02 | Todo input/control con label/nombre accesible | manual-only | DevTools Accessibility tree, revisar cada control | n/a |
| UX-02 | Contraste ≥4.5:1 en cuerpo/totales | manual-only | Contrast checker del inspector en pares dudosos | n/a |
| UX-02 | Teclado end-to-end (D-03): foco visible, orden lógico, controles operables | manual-only | Recorrido Tab/Enter/Espacio/flechas sin mouse | n/a |
| UX-02 (D-04) | `prefers-reduced-motion` desactiva fp-anim + transiciones | manual-only | DevTools → emular reduced-motion → cambiar paso/modelo | n/a |
| Regresión | La lógica pura (precios/camas/export/etc.) sigue verde | unit (automatizado) | `npm test` | ✅ existe (100 tests) |

### Sampling Rate
- **Per task commit:** `npm test` (asegura que un edit de markup/CSS no rompió lógica importada).
- **Per superficie pulida:** mini-UAT manual de esa pantalla (375px + teclado + contraste de sus tonos).
- **Phase gate:** UAT manual completo (checklist abajo) verde + `npm test` verde + (recomendado) checkpoint
  visual humano antes de `/gsd-verify-work`.

### Manual UAT Checklist (la verificación REAL de la fase, D-02)
> Ejecutar en `npm run dev` con DevTools. Marca cada ítem por pantalla.

**A) Sin desbordes a 375px (UX-01)** — para cada una de: Landing, Paso 1, Paso 2, Paso 3, Paso 4, Paso 5,
Paso 6, Resumen:
- [ ] Sin scroll horizontal en el viewport de 375px.
- [ ] Ningún texto/precio/control cortado o saliéndose de su card.
- [ ] Barra de precio sticky (Pasos 4-6) legible y dentro del ancho.
- [ ] Plano colapsable: al abrirlo a 375px, el SVG y las cotas caben; la leyenda hace wrap correctamente.

**B) Labels y contraste (UX-02)**:
- [ ] Cada checkbox/chip/card/stepper/link tiene nombre accesible (árbol de a11y).
- [ ] Contraste ≥4.5:1 en cuerpo y en las 3 líneas de presupuesto (Neto/IVA/Total).
- [ ] Links "Volver a empezar"/"Volver a editar" PASAN (tras subir `/60`→`/70`).
- [ ] Advertencia cobre de dormitorio PASA (≥4.5:1).

**C) Teclado end-to-end sin mouse (UX-02, D-03)**:
- [ ] Landing → "Comenzar" con Enter mueve el foco al inicio del wizard.
- [ ] Cada control del wizard es alcanzable por Tab con foco VISIBLE y orden lógico.
- [ ] Cards/chips operables con Enter/Espacio; steppers ±; checkboxes con Espacio.
- [ ] "Siguiente"/"Anterior" mueven el foco al heading del nuevo paso.
- [ ] Plano colapsable: el toggle se opera por teclado (Enter/Espacio), `aria-expanded` refleja el estado.
- [ ] Resumen: "Editar" por sección, "Enviar por WhatsApp" (`<a>`) y "Descargar PDF" (`<button>`) operables
      por teclado; el foco al entrar al resumen arranca arriba.

**D) Movimiento reducido (UX-02, D-04)**:
- [ ] Con reduced-motion emulado, cambiar de modelo/paso NO anima el plano (`.fp-anim` neutralizado).
- [ ] Hover de cards/botones y la barra de progreso tampoco animan con reduced-motion activo.

### Wave 0 Gaps
- None — no se crea infraestructura de test (D-02 prohíbe deps de a11y; la verificación es manual).
  La única "infra" es DevTools del navegador, ya disponible. `npm test` existente cubre la regresión de lógica.

*(Si el planner decidiera, podría añadir un smoke manual de "la app monta sin errores de consola tras los
edits", pero no es un test automatizado.)*

## Security Domain

> `security_enforcement: true`, ASVS L1 [VERIFIED: .planning/config.json]. Esta fase NO toca auth, datos
> sensibles, red ni entrada de servidor (es pulido de CSS/markup/foco en una demo client-side sin backend).
> La superficie de seguridad es mínima; se documenta por cumplimiento del gate.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | Sin auth (demo sin backend) |
| V3 Session Management | no | Sin sesiones de servidor; estado en localStorage |
| V4 Access Control | no | Sin recursos protegidos |
| V5 Input Validation | parcial | Inputs son toggles/selecciones de UI; el reducer ya tolera estado adulterado de localStorage (optional chaining, `Array.isArray`) — esta fase no añade entrada nueva |
| V6 Cryptography | no | Sin datos sensibles ni cripto |
| V14 Configuration | leve | Mantener `rel="noopener noreferrer"` en el `<a>` de WhatsApp (ya presente) al pulir markup |

### Known Threat Patterns for esta fase
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Reverse tabnabbing en link externo (WhatsApp `target="_blank"`) | Tampering | `rel="noopener noreferrer"` — YA presente (AccionesExport.jsx); NO removerlo al pulir |
| Estado adulterado en localStorage que crashee la UI | DoS (cliente) | Degradación elegante ya implementada; esta fase no debe introducir accesos sin guardas |

**Conclusión de seguridad:** Sin riesgos nuevos. La única acción concreta es *no regresar* el
`rel="noopener noreferrer"` existente al editar el markup del export.

## Project Constraints (from CLAUDE.md)

Directivas accionables que el planner DEBE respetar (autoridad equivalente a decisiones LOCKED):
- **Tech stack:** Vite + React 18 (hooks) + Tailwind v3 — NO actualizar versiones, NO añadir deps.
- **Sin backend:** todo client-side; estado en `localStorage` (`impacar_config_v1`) — no introducir red.
- **Idioma:** español argentino, **trato de usted**; gate anti-voseo (UX-03) aplica a TODO copy nuevo,
  incluido cualquier texto `sr-only`/`aria-label` que se agregue en esta fase.
- **Identidad visual sobria/industrial:** paleta LOCKED (fondo #F5F5F0, campo #2D5016, cobre #8B6914,
  texto #1A1A1A; zonas baño celeste/dorm marrón/cocina verde). Los ajustes de contraste solo afinan el
  NIVEL del tono muted (opacidad), NUNCA cambian los tokens de paleta.
- **Mobile-first:** target Samsung ~6" (~375px) — el plano colapsable/zoomable en mobile.
- **GSD workflow enforcement:** los edits van a través del flujo GSD (esta fase ya está en `/gsd-plan-phase`).
- **Render del plano:** SVG nativo, sin librerías de dibujo — no introducir ninguna al pulir.

## User Constraints

> Copiado de 07-CONTEXT.md. El planner DEBE honrar estas decisiones verbatim. Investigar el CÓMO, no relitigar.

### Locked Decisions
- **D-01 — Nivel de accesibilidad (UX-02):** Listón pragmático "AA en lo que importa", NO WCAG 2.1 AA formal
  completo ni AAA. Concreto: contraste **≥4.5:1** en texto de cuerpo y en valores/totales; **todo input/control
  con label asociado** (visible o `aria-label`/`aria-labelledby`, lo que ya use cada paso); **foco visible y
  operable**; **sin desbordes a 375px**. NO ARIA exhaustivo ni auditar AA de punta a punta. La paleta ya pasa
  AA en cuerpo → el trabajo es **corregir lo que falle**, nunca reescribir la identidad sobria/industrial (locked).
- **D-02 — Verificación (UX-01 + UX-02):** **Verificación 100% manual con DevTools** — viewport 375px (sin
  scroll horizontal ni cortes), recorrido por teclado (Tab/Shift+Tab/Enter/Espacio/flechas) y el **contrast
  checker del inspector** para pares dudosos. **CERO dependencias nuevas** (ni `axe-core`, ni
  `eslint-plugin-jsx-a11y`, ni Lighthouse como dep del repo). Lighthouse/axe solo como herramienta ad-hoc del
  navegador si hiciera falta un score, **no** como dependencia versionada.
- **D-03 — Alcance del teclado / foco (UX-02, criterio 3):** **Barrido end-to-end: landing + wizard (6 pasos)
  + resumen.** Se debe poder completar TODO el flujo solo con teclado: foco visible en cada control, orden de
  tabulación lógico, y **operables por teclado** el plano colapsable ("Ver plano actual"/zoom, PLANO-03), los
  links "Editar" por sección del resumen (`IR_A_PASO`) y los botones de exportación (WhatsApp `<a>` / PDF
  `<button>`). La demo se navega entera sin mouse. (Más amplio que el criterio literal "wizard".)
- **D-04 — Movimiento (WCAG 2.3.3):** **Respetar `prefers-reduced-motion` de forma global** — una media query
  en el CSS base (`src/styles/index.css`, donde vive `fp-anim`) que reduce/desactiva las transiciones del plano
  (~300ms, PLANO-02) y las de los pasos cuando el SO pide menos movimiento. Aplica a **todas** las animaciones,
  no solo al plano.

### Claude's Discretion (research/planner deciden)
- **Qué pares de color exactos** no llegan a 4.5:1 y cómo ajustarlos (detectar con el inspector); afinar solo
  tonos muted (`text-impacar-texto/70` y similares) donde falle — sin tocar la paleta locked.
  → *Resuelto por research:* solo `text-impacar-texto/60` FALLA (4.41:1); subir a `/70`. Cobre PASA ajustado.
- **Orden exacto de tabulación** y dónde hacen falta `tabindex`/roles ARIA puntuales.
  → *Research:* `tabIndex={-1}` solo en headings para foco programático (Pattern 1); revisar el role del
    selector de heladera (Pitfall 4). No usar tabindex positivos.
- **Labels visibles vs `sr-only`/`aria-label`** por control (preferir lo que ya usa cada paso; no romper layout).
  → *Research:* mantener los 3 mecanismos existentes (Pattern 3); completar solo donde falte.
- **Implementación de la media query** reduced-motion (CSS global vs utilidad) y a qué transiciones aplica.
  → *Research:* CSS global con wildcard `*` (Pattern 2), cubre `.fp-anim` + transiciones de Tailwind.
- **Detección y fix puntual de desbordes a 375px** (textos largos del resumen, nombres de extras, líneas del
  desglose, plano, barra de precio sticky).
  → *Research:* `min-w-0` + `flex-wrap`/`break-words`/`truncate` (Pitfall 5); auditar en DevTools.
- **Si conviene un checkpoint visual humano al cierre** (como en fases previas).
  → *Research:* recomendado SÍ (Open Question 3).

### Deferred Ideas (OUT OF SCOPE — ignorar completamente)
- **Auditoría WCAG 2.1 AA formal completa** (ratios exactos en todo, ARIA/roles exhaustivos, orden de lectura
  certificado) — fuera del MVP; esfuerzo de nivel producción.
- **Herramientas de a11y como dependencia del repo** (`axe-core`, `eslint-plugin-jsx-a11y`, Lighthouse CI) —
  descartado por D-02; reconsiderable post-MVP.
- **Soporte certificado de lectores de pantalla / i18n** — fuera del alcance de la demo.

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| UX-01 | La interfaz es mobile-first y usable en un viewport de ~375px (Samsung 6") | Pitfall 5 (desbordes + fixes `min-w-0`/wrap/truncate); UAT checklist sección A; método DevTools 375px (Code Examples) |
| UX-02 | Todos los inputs tienen labels, contraste suficiente y el wizard es navegable por teclado | Pattern 1 (foco), Pattern 2 (reduced-motion D-04), Pattern 3 (labels), Pitfall 3 (contraste `/60`→`/70`), Pitfall 4 (role heladera); contraste verificado (Code Examples); UAT checklist B/C/D |

## Sources

### Primary (HIGH confidence)
- Código fuente del proyecto (lectura directa) — `src/App.jsx`, `src/styles/index.css`, `tailwind.config.js`,
  `src/components/**` (Landing, ConfiguratorWizard, BarraProgreso, BarraPrecio, PlanoPanel, FloorPlan,
  wizard/pasos/*, Resumen, resumen/*), `package.json`, `.planning/config.json`.
- Cálculo WCAG de contraste reproducible (alpha-compositing + luminancia relativa) — ver Code Examples.
- `grep` de `tabIndex|autoFocus|.focus()|useEffect|skip|motion-reduce|sr-only` en `src/` (confirma huecos).
- `.planning/phases/07-pulido-mobile-y-accesibilidad/07-CONTEXT.md` (D-01..D-04, discreción, deferidos).
- `.planning/REQUIREMENTS.md` (UX-01/UX-02 autoritativos), `.planning/ROADMAP.md` (goal + 3 success criteria),
  `.planning/PROJECT.md` y `CLAUDE.md` (constraints locked).
- `.planning/phases/06-resumen-y-exportaci-n/06-UI-SPEC.md` § "Accessibility (baseline only — full audit is
  Phase 7)" (difiere el audit a esta fase; documenta min-h-[44px], focus:ring-2, role="img"+title).

### Secondary (MEDIUM confidence)
- Tailwind CSS v3 docs — variantes `motion-reduce`/`motion-safe` [CITED: v3.tailwindcss.com/docs/hover-focus-and-other-states].
- Patrón canónico de foco en cambio de ruta React [CITED: jshakespeare.com; upyoura11y.com/handling-focus;
  developer.mozilla.org React accessibility; web.dev/articles/control-focus-with-tabindex].

### Tertiary (LOW confidence)
- Ninguna que sostenga una afirmación crítica; todo lo crítico está verificado contra código o cálculo.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versiones verificadas contra node_modules/registry; D-02 fija "sin deps nuevas".
- Architecture (foco, reduced-motion, labels): HIGH — código real leído + patrones canónicos citados.
- Contraste: HIGH — cálculo WCAG reproducible sobre los tokens reales del proyecto.
- Pitfalls: HIGH — todos derivados de lectura directa del código (no hipotéticos).
- Validation Architecture: HIGH — alineada con D-02 (manual-first) y config (nyquist_validation true).

**Research date:** 2026-06-28
**Valid until:** ~2026-07-28 (estable — depende de stack pinneado y código existente, no de ecosistema móvil).
