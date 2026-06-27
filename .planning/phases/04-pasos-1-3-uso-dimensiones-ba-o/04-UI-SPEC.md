---
phase: 4
slug: pasos-1-3-uso-dimensiones-ba-o
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-27
---

# Phase 4 — Contrato de Diseño UI

> Contrato visual y de interacción para los Pasos 1-3 del wizard (Uso, Dimensiones, Baño).
> Generado por gsd-ui-researcher, verificado por gsd-ui-checker.
>
> **Esta NO es una fase greenfield.** Las Fases 1-3 ya fijaron la identidad visual, los tokens
> de Tailwind, los patrones de botón/card y el motor del plano. Todo lo marcado como
> **LOCKED (heredado)** NO se reinventa: se reutiliza tal cual. Este documento solo especifica
> contratos NUEVOS para lo que Phase 4 agrega (selección de uso/ocupantes, cards de modelos,
> equipamiento y tamaño de baño) y cómo cada elección se refleja en el plano en vivo.

---

## Resumen de alcance (qué contratos define esta fase)

| Paso | Requirements | Contratos UI nuevos |
|------|--------------|---------------------|
| Paso 1 — Uso y ocupantes | USO-01, USO-02, USO-03 | Grid de 5 cards de uso (selección única) + selector segmentado de ocupantes + feedback de modelo sugerido |
| Paso 2 — Dimensiones / Modelo | DIM-01, DIM-02 | Grid de 7 cards de modelo (N1-N7) con largo/camas/ideal + estado "sugerido" + reflejo en vivo del plano |
| Paso 3 — Baño | BANO-01, BANO-02, BANO-03 | Checkboxes de equipamiento + selector de tamaño estándar/ampliado (ampliado disabled en N1-N2) + ajuste del módulo de baño en el plano |

Fuera de alcance (Phase 5): Pasos 4-6 (dormitorio, cocina, extras) y el motor de precios.

---

## Design System

| Property | Value | Origen |
|----------|-------|--------|
| Tool | none | Proyecto Vite + React 18 + Tailwind v3 manual. No hay `components.json`; el sistema de componentes es a mano con clases utilitarias. Introducir shadcn a esta altura (Fase 3 completa, patrones de botón/card ya establecidos) rompería la consistencia, así que la `shadcn gate` se resuelve como **none**. |
| Preset | not applicable | — |
| Component library | none (utilidades Tailwind a mano) | LOCKED (heredado): `Landing.jsx`, `ConfiguratorWizard.jsx`, `BarraProgreso.jsx`, `PlanoPanel.jsx` |
| Icon library | **SVG inline a mano** (sin librería) — el plano ya usa primitivas SVG (`Bathroom.jsx`); los íconos de las cards de uso siguen el mismo enfoque: `<svg>` inline 24×24, `stroke="currentColor"`, `fill="none"`, `strokeWidth="1.5"`, sin dependencia nueva | Decisión de esta fase (coherente con la restricción "stack liviano, sin librerías de dibujo pesadas" de CLAUDE.md) |
| Font | Inter (con fallbacks system-ui) | LOCKED (heredado) — `tailwind.config.js` → `fontFamily.sans` y `font-sans` aplicado en `ConfiguratorWizard.jsx` |

**Registro de tokens de color (Tailwind `theme.extend`, LOCKED — no agregar nuevos):**
`impacar-fondo` `#F5F5F0` · `impacar-campo` `#2D5016` · `impacar-cobre` `#8B6914` ·
`impacar-texto` `#1A1A1A` · `zona-bano` `#BFE3EE` · `zona-dormitorio` `#C9A66B` ·
`zona-cocina` `#A7C796`.

---

## Spacing Scale

Escala LOCKED (heredada): el código existente ya usa una escala de 4px vía utilidades Tailwind
(`p-4`, `gap-3`, `mt-6`, `mt-8`, `mb-6`). Phase 4 NO introduce valores nuevos; reutiliza estos.

| Token | Value | Clase Tailwind | Uso en Phase 4 |
|-------|-------|----------------|----------------|
| xs | 4px | `gap-1` / `p-1` | Separación ícono-texto dentro de chips, gap de la línea "ideal para N personas" |
| sm | 8px | `gap-2` / `p-2` | Espaciado compacto entre metadatos de la card (largo · camas) |
| md | 16px | `p-4` / `gap-4` | Padding interior de cada card; gap del grid de cards |
| lg | 24px | `gap-6` / `mt-6` | Separación entre el bloque "uso" y el bloque "ocupantes" dentro del Paso 1 |
| xl | 32px | `gap-8` / `mt-8` | Separación entre el contenido del paso y la zona "Volver a empezar" (ya existe) |
| 2xl | 48px | `py-12` | Padding vertical de la landing (heredado; no aplica a los pasos) |
| 3xl | 64px | — | No usado en esta fase |

Excepciones: **touch target mínimo 44px** (`min-h-[44px]`) en TODO elemento clickeable
(cards de uso, cards de modelo, chips de ocupantes, checkboxes de equipamiento, toggle de tamaño
de baño). Es LOCKED (heredado) — todos los botones existentes ya lo cumplen (mobile-first
Samsung ~6", target real). NO es un valor de la escala de 4 pero es obligatorio por accesibilidad táctil.

---

## Typography

Roles LOCKED (heredados del código existente). Phase 4 reutiliza exactamente estos; no agrega tamaños.

| Role | Size | Weight | Line Height | Clase Tailwind | Uso en Phase 4 |
|------|------|--------|-------------|----------------|----------------|
| Heading (título de paso) | 20px | 600 (semibold) | 1.2 (`leading-tight` aprox.) | `text-xl font-semibold` | Título de cada paso (ej. "Uso y ocupantes"), igual al stub actual en `pasosRegistro.jsx` |
| Body | 16px | 400 (regular) | 1.5 | `text-base` | Texto descriptivo / nombre largo de equipamiento de baño |
| Label | 14px | 600 (semibold) para énfasis / 400 para texto auxiliar | 1.4 | `text-sm font-semibold` / `text-sm` | Nombre del modelo en la card (N1…N7), label de chips de ocupantes, label de equipamiento |
| Caption | 12px | 400 (regular) | 1.4 | `text-xs` | Metadatos de la card ("6,60 m · 4 camas · ideal para 4 personas"), nota de baño deshabilitado, leyenda |

**Pesos declarados (exactamente 2, LOCKED):** regular (400) + semibold (600). No usar `font-medium`
como tercer peso semántico salvo en el enlace heredado "Volver a empezar" (ya existe, no se toca).

**Reglas de línea:**
- Cuerpo / descripciones: line-height 1.5.
- Títulos / nombres de modelo: line-height 1.2.

**Números (precios, medidas):** formato argentino. Medidas con coma decimal y sufijo " m"
(ej. `6,60 m`) — patrón heredado de `FloorPlan.jsx` (`metros()`). En Phase 4 NO se muestran precios
(eso es Phase 5); solo medidas y cantidad de camas/personas.

---

## Color

Distribución 60/30/10 LOCKED (heredada de la identidad Impacar en CLAUDE.md).

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F5F5F0` (`impacar-fondo`) | Fondo de la app y del área del plano; fondo de cards NO seleccionadas |
| Secondary (30%) | `#FFFFFF` / `white/40` + bordes `impacar-texto/10` | Superficie de cards, paneles y secciones (patrón heredado: `bg-white/40`, `border-impacar-texto/10`) |
| Accent (10%) | `#2D5016` (`impacar-campo`, verde campo) | Ver lista reservada abajo |
| Accent secundario | `#8B6914` (`impacar-cobre`) | Capa de medición del plano (cotas) y hover del enlace "Volver a empezar". NO se usa para acciones primarias. |
| Semántico de zona | `#BFE3EE` (`zona-bano`) | EXCLUSIVO del módulo de baño en el plano y de su muestra en la leyenda. NO usar el celeste como color de acción de UI. |

**Accent (verde campo `impacar-campo`) reservado EXCLUSIVAMENTE para:**
1. Borde + fondo tenue de la **card/chip SELECCIONADA** (estado activo de uso, modelo, ocupantes, tamaño de baño).
2. El **ring de foco** de teclado (`focus:ring-2 focus:ring-impacar-campo/40`) — heredado.
3. El **fill de la barra de progreso** (heredado, `BarraProgreso.jsx`).
4. La **marca de check** del equipamiento de baño seleccionado y el indicador del modelo sugerido.

NO usar verde campo para: texto de cuerpo, bordes de cards no seleccionadas, fondos de paneles,
ni "todos los elementos interactivos". Una card no seleccionada es neutra (borde `impacar-texto/10`);
solo al seleccionarse adopta el accent.

**Destructive:** No hay color destructivo. "Volver a empezar" (la única acción potencialmente
destructiva visible) es un enlace de texto neutro heredado, sin color rojo. Ver Copywriting Contract.

---

## Copywriting Contract

Todo en **español argentino, trato de usted** (UX-03, LOCKED). Tono sobrio/industrial, no startup tech.

### Paso 1 — Uso y ocupantes

| Element | Copy |
|---------|------|
| Título del paso | `Uso y ocupantes` |
| Subtítulo / instrucción de uso | `¿Para qué va a usar la casilla?` |
| Cards de uso (5, USO-01) | `Contratista rural` · `Ganadero` · `Agrícola` · `Vivienda` · `Otro` |
| Subtítulo de ocupantes | `¿Cuántas personas la van a habitar?` |
| Opciones de ocupantes (USO-02) | `2` · `3` · `4` · `5` · `6` · `8` (chips numéricos) |
| Feedback de sugerencia (USO-03) | `Le sugerimos el modelo {N} para {ocupantes} personas. Lo puede cambiar en el paso siguiente.` |

### Paso 2 — Dimensiones / Modelo

| Element | Copy |
|---------|------|
| Título del paso | `Dimensiones` |
| Subtítulo / instrucción | `Elija el modelo de su casilla` |
| Línea de metadatos de la card (DIM-01) | `{largo} m · {camasBase} camas · ideal para {ocupantesIdeal} personas` (ej. `6,60 m · 4 camas · ideal para 4 personas`) |
| Metadatos para modelos personalizables (N5/N6/N7, `camasBase: null`) | `{largo} m · camas a medida · ideal para {ocupantesIdeal} personas` (sustituye "{n} camas" cuando no hay camasBase) |
| Badge de modelo sugerido | `Sugerido` |
| Microcopy bajo la card sugerida (cuando coincide con el seleccionado) | `Sugerido según los ocupantes que eligió.` |

### Paso 3 — Baño

| Element | Copy |
|---------|------|
| Título del paso | `Baño` |
| Subtítulo de ubicación (BANO-01, fijo) | `El baño va en su posición fija, entre la baulera y el dormitorio.` |
| Subtítulo de equipamiento | `Equipamiento del baño` |
| Opciones de equipamiento (BANO-01) | `Inodoro con depósito y cámara séptica` · `Vanitory completo con espejo` |
| Subtítulo de tamaño | `Tamaño del baño` |
| Opciones de tamaño (BANO-02) | `Estándar` · `Ampliado` |
| Nota de "Ampliado" deshabilitado (N1/N2) | `Disponible desde el modelo N3 (6,10 m) en adelante.` |

### Contrato general (CTA, vacíos, errores, destructiva) — heredado

| Element | Copy | Origen |
|---------|------|--------|
| Primary CTA (avanzar) | `Siguiente` | LOCKED — `ConfiguratorWizard.jsx`. Phase 4 NO cambia los labels de navegación. |
| CTA secundario (retroceder) | `Anterior` | LOCKED |
| Empty state heading (plano) | `Sin configuración` | LOCKED — `FloorPlan.jsx` (no se reescribe) |
| Empty state body (plano) | `Elegí un modelo para ver el plano de tu casilla.` | LOCKED — `FloorPlan.jsx` |
| Error state (plano) | `No se pudo dibujar el plano. Revisá el modelo seleccionado e intentá de nuevo.` | LOCKED — `FloorPlan.jsx` |
| Destructive confirmation | `Volver a empezar`: sin diálogo de confirmación en esta fase (enlace neutro heredado que resetea el estado). Si el checker exige confirmación, ver Open Questions Q4. | LOCKED (heredado) |

> Nota de consistencia de voz: los copys del PLANO heredado usan tuteo informal ("Elegí",
> "Revisá") mientras el resto del wizard usa trato de usted. Esto es preexistente (Fase 2/3) y
> **queda como está** en Phase 4 para no tocar `FloorPlan.jsx`. Se registra como Open Question Q3
> para una pasada de consistencia global en Phase 7 (Pulido).

---

## Patrones de componentes (contrato de interacción)

> Estos patrones son el contrato que el executor implementa. Reutilizan los tokens y clases
> heredados; no se inventan estilos nuevos fuera de los descriptos.

### Patrón A — Card seleccionable (uso y modelo)

Base estructural común para las cards de uso (Paso 1) y de modelo (Paso 2).

- **Contenedor:** `<button type="button">` (no `<div>`) para foco y teclado nativos.
- **Layout grid:** mobile 1 columna; `sm:` 2 columnas (uso) / 2-3 columnas (modelo). Gap `gap-3` (12px).
  Cada card `min-h-[44px]` (en la práctica más alta por el contenido). El grid de cards reemplaza
  el contenido del `StubPaso` dentro de la `<section>` existente de `ConfiguratorWizard.jsx`.
- **Estado base (no seleccionada):**
  `rounded border border-impacar-texto/10 bg-white/40 p-4 text-left transition-colors`
  `hover:border-impacar-campo/40 hover:bg-impacar-campo/5`
  `focus:outline-none focus:ring-2 focus:ring-impacar-campo/40`.
- **Estado seleccionado:** `border-impacar-campo bg-impacar-campo/10` + `aria-pressed="true"`
  (o `role="radio" aria-checked` si se modela como radiogroup — ver Q1). El nombre/título sube a
  `font-semibold text-impacar-campo`.
- **Selección única:** un solo elemento activo por grupo (USO-01 explícito; modelo también es único).
- **Ícono (solo cards de uso):** SVG inline 24×24 arriba del label, `text-impacar-campo` cuando
  seleccionada / `text-impacar-texto/70` cuando no. Glosario de íconos sugeridos (line icons):
  Contratista rural → casco/herramienta; Ganadero → vaca/cerca; Agrícola → espiga/tractor;
  Vivienda → casa; Otro → tres puntos / signo de interrogación.

### Patrón B — Selector segmentado (ocupantes y tamaño de baño)

Para opciones cortas y mutuamente excluyentes (chips de ocupantes 2/3/4/5/6/8; tamaño Estándar/Ampliado).

- **Contenedor:** fila de `<button>` con `flex flex-wrap gap-2`. Cada chip `min-h-[44px] min-w-[44px]`.
- **Chip base:** `rounded border border-impacar-texto/10 px-4 py-2 text-sm transition-colors`
  `hover:border-impacar-campo/40 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40`.
- **Chip seleccionado:** `border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo`.
- **Chip deshabilitado (solo "Ampliado" en N1/N2, BANO-02):**
  `disabled:cursor-not-allowed disabled:opacity-40` + `aria-disabled="true"`, NO clickeable, con la
  nota explicativa visible debajo (`Disponible desde el modelo N3 (6,10 m) en adelante.`).
  Patrón disabled heredado de los botones Anterior/Siguiente (misma `disabled:opacity-40`).

### Patrón C — Equipamiento de baño (checkboxes, BANO-01)

Selección múltiple (no excluyente): el cliente puede tener ambos, uno o ninguno.

- **Contenedor:** lista vertical `space-y-2`. Cada ítem es un `<label>` con `<input type="checkbox">`
  asociado (UX-02: labels asociados) y `min-h-[44px]` de área clickeable.
- **Ítem base:** `flex items-center gap-3 rounded border border-impacar-texto/10 bg-white/40 p-3 cursor-pointer`.
- **Ítem marcado:** `border-impacar-campo bg-impacar-campo/10`; el check nativo usa `accent-color`
  del accent vía `accent-[#2D5016]` (Tailwind arbitrary) o un check SVG en `impacar-campo`.
- **Estos dos ítems mapean a EXTRAS `inodoro-septica` y `vanitory-espejo`** (categoria `'bano'`
  en `src/data/extras.js`) — ver Open Question Q2 sobre dónde se guarda esta selección en el estado.

### Patrón D — Feedback de sugerencia (USO-03)

Bloque informativo no intrusivo que aparece al elegir ocupantes en el Paso 1.

- **Estilo:** `rounded border border-impacar-campo/30 bg-impacar-campo/5 p-3 text-sm text-impacar-texto`
  con un ícono check/info en `impacar-campo`.
- **No es un toast ni un modal** (sobrio/industrial): es un panel inline bajo los chips de ocupantes.
- **Comportamiento:** al cambiar ocupantes, el sistema setea `modeloId` con `SUGERENCIA_OCUPANTES`
  (de `src/data/models.js`) y muestra el copy de sugerencia. La sugerencia es **pre-selección, no
  imposición**: el Paso 2 permite cambiarla.

### Patrón E — Badge "Sugerido" en la card de modelo (DIM-01)

- **Estilo:** pill pequeño `text-xs font-semibold text-impacar-campo bg-impacar-campo/10 rounded-full px-2 py-0.5`,
  esquina superior de la card cuyo `id === SUGERENCIA_OCUPANTES[ocupantes]`.
- Se muestra incluso si el usuario aún no cambió de modelo (es informativo). Si el usuario elige
  otro modelo, el badge "Sugerido" permanece en su card de origen; el estado seleccionado (borde
  verde) se mueve a la card elegida. Distinción visual clara: "Sugerido" = pill verde tenue;
  "Seleccionado" = borde + fondo verde de la card completa.

---

## Reflejo en vivo del plano (DIM-02, BANO-03) — contrato de interacción

El núcleo de valor del producto: cada elección del paso se refleja de inmediato en el plano.
El cableado YA existe — `ConfiguratorWizard.jsx` deriva `configPlano = configDesdeEstado(estado)`
y lo pasa a `PlanoPanel`/`FloorPlan`; las transiciones de ~300ms (`.fp-anim`) ya están en
`src/styles/index.css`. Phase 4 solo debe **escribir el estado correcto** para que el plano reaccione.

| Acción del usuario | Cambio de estado | Reflejo en el plano | Mecanismo |
|--------------------|------------------|---------------------|-----------|
| Elige ocupantes (Paso 1) | `modeloId ← SUGERENCIA_OCUPANTES[ocupantes]` | El plano redibuja el largo del modelo sugerido con transición 300ms | `configDesdeEstado` deriva `largo` de `MODELOS`; ya funciona |
| Elige/cambia modelo (Paso 2) | `modeloId ← Nx` | El plano redibuja largo total + cotas (`{largo} m × 2,60 m ext / 2,52 m interior`) y reparte las zonas fijas; transición suave | LOCKED — `calcularLayout` + `.fp-anim` |
| Elige tamaño de baño (Paso 3) | `bano.tamano ← 'estandar' \| 'ampliado'` | El bloque de la zona BAÑO (celeste, `zona-bano`) cambia su ancho en el plano; el resto de las zonas centrales se recomprime | **REQUIERE CAMBIO** — ver nota crítica abajo |

> **Comunicación del reflejo:** No hace falta un mensaje "actualizando…". El reflejo es la
> animación de 300ms del propio plano (feedback implícito, ya establecido en Fase 2). En mobile,
> donde el plano está colapsado por defecto (`PlanoPanel`), el contrato es: al avanzar de paso el
> plano permanece colapsado pero el disparador "Ver plano actual" sigue disponible; NO se fuerza
> la apertura automática (decisión de esta fase — evita saltos de layout en pantallas chicas).
> Ver Open Question Q5 si el checker prefiere abrir el plano tras la primera selección de modelo.

### Nota crítica — el tamaño de baño aún NO afecta al plano

Hoy `src/utils/floorplanLayout.js` reparte el largo central por ratios FIJOS
(`RATIO_BANO = 0.22`, `RATIO_DORMITORIO = 0.45`, `RATIO_ESTAR = 0.33`) e ignora `config.bano.tamano`.
Y `src/components/FloorPlanElements/Bathroom.jsx` recibe el rect de la zona pero no varía con el tamaño.

Para cumplir **BANO-03** ("ajustando su tamaño según la elección"), Phase 4 debe:
1. Hacer que `calcularLayout` lea `config.bano.tamano` y use un ratio de baño mayor cuando
   `'ampliado'` (ej. `RATIO_BANO_AMPLIADO ≈ 0.30`), recomprimiendo dormitorio/estar
   proporcionalmente para que la suma siga cerrando contra `config.largo` (el estar absorbe el
   redondeo, patrón ya existente).
2. Mantener la geometría real y el orden de zonas inmutable (baulera | baño | dormitorio | estar | cocina).
3. La transición visual del cambio de ancho ya está cubierta por `.fp-anim` (sin trabajo extra).

El módulo de íconos de baño (ducha/inodoro/lavatorio, contorno `#1A1A1A` opacidad 0.7) se reescala
solo porque `Bathroom.jsx` deriva sus piezas del rect recibido. **Contrato de color del módulo:**
celeste `zona-bano` `#BFE3EE` de fondo (lo pinta el relleno de zona), íconos en contorno oscuro —
LOCKED, no cambia.

---

## Reglas de habilitación y sugerencia (lógica de datos que la UI refleja)

| Regla | Fuente de verdad | Comportamiento UI |
|-------|------------------|-------------------|
| Sugerencia de modelo por ocupantes (USO-03) | `SUGERENCIA_OCUPANTES` en `src/data/models.js` (`2→N1, 3→N2, 4→N3, 5→N5, 6→N5, 8→N7`) | Al elegir ocupantes se pre-selecciona ese `modeloId`; el badge "Sugerido" marca esa card en el Paso 2 |
| Metadatos de card de modelo (DIM-01) | `MODELOS` en `src/data/models.js` (`largo`, `camasBase`, `ocupantesIdeal`, `personalizable`) | Se renderiza `{largo} m · {camasBase} camas · ideal para {ocupantesIdeal} personas`; si `camasBase === null` (N5/N6/N7) → `camas a medida` |
| "Ampliado" solo en N3+ (BANO-02) | Derivado de `MODELOS.largo ≥ 6.10` (N3=6,1 · N4=6,6 · N5=7,6 · N6=8,6 · N7=9,6). N1=4,5 y N2=5,2 quedan fuera. | El chip "Ampliado" se renderiza `disabled` cuando el modelo actual es N1 o N2, con la nota explicativa. Si el usuario tenía "ampliado" y baja a N1/N2, el estado debe forzarse a `'estandar'` (ver Q4). |

> El umbral `6.10 m` NO está hoy codificado como constante. Recomendación: derivarlo de
> `MODELOS` (`largo >= 6.1`) en lugar de hardcodear una lista de ids, para que siga siendo
> data-driven (coherente con el "gate anti-hardcodeo" de las fases previas). Se registra como
> detalle de implementación para el planner, no como pregunta abierta.

---

## Estados de cada control (matriz para el checker)

| Control | Default | Hover | Focus (teclado) | Seleccionado | Disabled |
|---------|---------|-------|-----------------|--------------|----------|
| Card de uso | borde `texto/10`, fondo `white/40`, ícono `texto/70` | borde `campo/40`, fondo `campo/5` | `ring-2 ring-campo/40` | borde `campo`, fondo `campo/10`, label `campo` semibold | n/a |
| Chip de ocupantes | borde `texto/10` | borde `campo/40` | `ring-2 ring-campo/40` | borde `campo`, fondo `campo/10`, semibold | n/a |
| Card de modelo | borde `texto/10`, fondo `white/40` | borde `campo/40`, fondo `campo/5` | `ring-2 ring-campo/40` | borde `campo`, fondo `campo/10` | n/a |
| Checkbox equipamiento | borde `texto/10`, check vacío | borde `campo/40` | `ring-2 ring-campo/40` | borde `campo`, fondo `campo/10`, check `campo` | n/a |
| Chip tamaño baño | borde `texto/10` | borde `campo/40` | `ring-2 ring-campo/40` | borde `campo`, fondo `campo/10`, semibold | `opacity-40`, `cursor-not-allowed`, nota visible (solo "Ampliado" en N1/N2) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | (none — proyecto no usa shadcn) | not applicable |
| third-party | (none) | not applicable |

No se declararon registries de terceros. El proyecto no instala dependencias de UI nuevas en esta
fase (íconos SVG inline a mano). Gate de vetting: no aplica.

---

## Open Questions (con default recomendado — no bloquean)

> No existe CONTEXT.md para esta fase. Estas preguntas tienen un default sensato para que el
> planner/executor avancen; el checker o el usuario pueden anularlas.

| # | Pregunta | Default recomendado |
|---|----------|---------------------|
| Q1 | ¿Las cards/chips de selección única se modelan como `radiogroup` (`role="radio"` + flechas) o como botones con `aria-pressed`? | **Botones con `aria-pressed`** por simplicidad y consistencia con los botones existentes; la navegación por flechas se puede pulir en Phase 7 (Accesibilidad). |
| Q2 | El equipamiento de baño (inodoro/vanitory) ¿se guarda en `extras[]` (ids `inodoro-septica`, `vanitory-espejo`) o en un campo nuevo `bano.equipamiento[]`? | **En `extras[]`** usando los ids existentes de `src/data/extras.js`, para que Phase 5 (precios) los sume sin migración. El reducer actual ya tiene `extras: []`. |
| Q3 | Inconsistencia de voz: el plano heredado tutea ("Elegí", "Revisá") y el wizard usa usted. | **No tocar `FloorPlan.jsx` en Phase 4** (riesgo cero sobre el motor del plano); agendar una pasada de consistencia de voz en Phase 7. |
| Q4 | Si el usuario tenía "Ampliado" y cambia a N1/N2 (donde no se permite), ¿qué pasa con `bano.tamano`? | **Forzar a `'estandar'`** automáticamente al seleccionar un modelo incompatible, sin diálogo, con la nota visible explicando por qué. Es corrección silenciosa, no destructiva. |
| Q5 | En mobile, ¿el plano colapsado se abre solo tras la primera selección de modelo? | **No** — mantener el plano colapsado (evita saltos de layout en ~375px); el usuario lo abre con "Ver plano actual". Reevaluable en Phase 7. |
| Q6 | "Volver a empezar" ¿necesita confirmación? | **No en esta fase** (heredado sin confirmación). Si se agrega confirmación, hacerlo global en Phase 7, no parcheado en Phase 4. |

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
