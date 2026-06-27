# Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios) - Research

**Researched:** 2026-06-27
**Domain:** Lógica pura de dominio (validación de capacidad de camas + motor de precios) sobre React 18 + estado en `extras[]`; reflejo SVG liviano de cocina/estar.
**Confidence:** HIGH (codebase verificado por lectura directa de los archivos fuente; geometría recomputada a mano)

## Summary

Esta fase es 90% **extensión de patrones ya establecidos**, no descubrimiento técnico. El stack
está congelado (Vite + React 18 + Tailwind v3, JS sin TS, `node:test` built-in, sin dependencias
nuevas), y los tres pasos nuevos (4 Dormitorio, 5 Cocina/Estar, 6 Extras) son clones directos del
patrón presentacional de `PasoBano.jsx`: reciben `{ estado, dispatch }`, leen de `/data`, despachan
`SET_CAMPO` con un array `extras[]` inmutable, y el plano reacciona solo vía `configDesdeEstado`
sin props nuevas. `formato.js` ya resuelve todo el formato argentino; el motor de precios es una
suma + reuso de helpers existentes. [VERIFIED: lectura de src/components/wizard/pasos/PasoBano.jsx,
src/state/wizardReducer.js, src/utils/formato.js]

El único hallazgo de riesgo real es **geométrico** y debe resolverse en research, no en plan: con
el reparto actual `largoDormitorio = restante × 0.45`, la zona dormitorio mide entre 1,49m (N1) y
3,78m (N7). Como la cama real corre 2,00m sobre el eje del largo, la fórmula "literal"
`2 × floor(largoDormitorio / 2,00)` da **0 footprints para N1/N2 y solo 2 para N3-N7** — lo que
contradice `camasBase` (N4 tiene 4 camas base). Tomar la geometría del *dibujo* (zona × 0.45) como
medida de validación rompe la coherencia con el catálogo. **La validación de capacidad debe usar
`camasBase` del modelo como fuente de verdad de "cuántos footprints entran", NO la longitud
fraccionada de la zona del plano.** [VERIFIED: recálculo node, ver tabla en Pitfall 1]

**Primary recommendation:** Construir 2 helpers puros testeables ANTES de los componentes
(interface-first, como Fase 4): `validacionCamas.js` (capacidad data-driven desde `MODELOS.camasBase`,
matrimonial = 2 footprints, N5+ personalizables = sin tope/“a medida”) y `motorPrecios.js` (modelo +
suma de `extras[]`). Modelar el split confort/energía con un **metadato `subgrupo` en `data/extras.js`**
(data-driven, sin ids en el componente). Derivar lo que el plano necesita (horno/heladera/mesa) de
`extras[]` dentro de `configDesdeEstado` (D-14), eliminando las dobles fuentes `cocina.horno`/
`estar.mesa`. Montar la barra de precio en `ConfiguratorWizard.jsx` condicionada a `pasoActual >= 3`.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Paso 4 — Dormitorio / armado de camas (DORM-01/02/03)**
- **D-01:** Input por **contadores +/− por tipo**: una fila por tipo (Cucheta marinera `C` / Simple
  `S` / Matrimonial `M`) con stepper. Mapea directo a `estado.dormitorio.camas` como
  `Array<{ tipo: 'C'|'S'|'M' }>`. Mobile-friendly.
- **D-02:** **Matrimonial máx 1** (regla del catálogo). El contador de matrimonial se topea en 1.
- **D-03:** Validación de capacidad con **aviso pero sin bloqueo**: si la combinación no entra en el
  largo del dormitorio, mostrar una advertencia clara (estilo "No entran en el modelo Nx; considere
  un modelo más largo") pero **permitir avanzar** igual. No deshabilitar el botón Siguiente por capacidad.
- **D-04:** El plano **ya dibuja** `config.dormitorio.camas` (2 filas alternadas contra cada pared
  larga, `Bed.jsx` con etiqueta C/S/M). El Paso 4 solo debe **escribir** las camas en el estado vía
  `SET_CAMPO`; el plano reacciona solo (DORM-03 casi cableado).

**Paso 5 — Cocina, heladera y estar (COCINA-01/02/03/04)**
- **D-05:** **Heladera = selector segmentado exclusivo** ("Sin / 220V A++ / 12V c/pantalla"), tipo
  radio: elegir una quita la otra; "Sin" es el default (ninguna). Imposible elegir dos heladeras a la
  vez. Ids reales: `heladera-220`, `heladera-12v` (categoria `cocina`).
- **D-06:** **Cocina con horno industrial** = toggle opcional (`cocina-horno`). Elementos del estar =
  toggles: mesa de caño (`mesa-cano`), banco despensero (`banco-despensero`).
- **D-07:** El plano refleja cocina/estar de forma **liviana, reusando subcomponentes existentes**
  (Fase 2): `Kitchen.jsx` (cocina/horno) en la zona cocina verde, y `Table.jsx` (mesa) en el estar;
  un ícono de heladera cuando se elige. Esquemático, sin recargar. (COCINA-04)

**Paso 6 — Extras de confort/energía (EXTRAS-01)**
- **D-08:** Los 9 extras (`categoria: 'extras'`) se presentan **agrupados en dos subgrupos con
  encabezado: "Confort" y "Energía"**. El split debe ser **data-driven** (sin lista de ids hardcodeada
  en el componente). (Confort: calefactor, split, TV, estéreo, cortinas, toldo, caldera. Energía:
  panel solar, sistema solar 220.)
- **D-09:** Los extras de confort/energía **no se dibujan en el plano** (no tienen footprint en la
  vista cenital): solo afectan el presupuesto y aparecerán listados en el Resumen (Fase 6).

**Motor de precios — presupuesto en vivo (PRECIO-01)**
- **D-10:** **Barra/chip sticky compacto** que aparece **recién desde el Paso 4** (sticky abajo en
  mobile, junto al plano en desktop) y se actualiza al tocar opciones. **No** aparece en los Pasos 1-3.
- **D-11:** Durante los pasos muestra **total corriendo**: neto + IVA 21% + total c/IVA (3 líneas), en
  formato argentino (`$29.108.976`). El **desglose ítem por ítem** se **reserva para la pantalla de
  Resumen (Fase 6)**.
- **D-12:** El total = `MODELOS.find(modeloId).precioNeto` **+ suma de `precioNeto` de todos los
  accesorios seleccionados** en `extras[]` (incluido el equipamiento de baño del Paso 3). Reusar
  `formato.js` (`formatPrecio`, `calcularIVA`, `calcularTotal`).

**Modelo de datos — selecciones → `extras[]` (decisión transversal)**
- **D-13:** **Todas las selecciones de accesorios de esta fase se guardan como ids en
  `estado.extras[]`** (misma técnica inmutable del baño en Fase 4): horno, heladera (una sola), mesa,
  banco, y los extras de confort/energía. **Una sola fuente de verdad** para el motor de precios.
- **D-14:** `configDesdeEstado(estado)` debe **derivar del `extras[]`** lo que el plano necesita para
  dibujar (¿hay horno?, ¿qué heladera?, ¿hay mesa?), en vez de leer `estado.cocina`/`estado.estar`.
  Los sub-campos placeholder `cocina:{horno,heladera}` y `estar:{mesa}` de `estadoInicial` se
  **reemplazan/derivan** (research/planner deciden si se eliminan o se mantienen como proyección
  derivada). El motor de precios y el resumen no deben sumar de dos lugares.

### Claude's Discretion (research/planner deciden)
- **Modelado geométrico del matrimonial**: cuántos "footprints" consume cada tipo y la fórmula de
  capacidad por largo de zona. Respetar "esquemático, no arquitectónico".
- **Comportamiento de N5/N6/N7 "personalizables"** en la validación de capacidad.
- **Detalle del enchufe**: orden de waves (lógica pura antes que componentes) y si el split
  confort/energía se modela con metadato en `EXTRAS` o regla derivada.

### Deferred Ideas (OUT OF SCOPE)
- **Pantalla de Resumen** con desglose ítem por ítem, financiación, WhatsApp y PDF — **Fase 6**.
- **Pulido mobile final y accesibilidad** (teclado, contraste, ~375px de punta a punta) — **Fase 7**.
- Micro-decisiones diferidas: copy exacto de la advertencia, comportamiento del total al borrar una
  cama, orden visual de los módulos en el plano (research da recomendación; planner cierra).
- Ubicación libre del baño / precios editables por fábrica — out of scope del proyecto.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DORM-01 | Combinar tipos y cantidades de camas (C/S/M, matrimonial máx 1) | Stepper por tipo (D-01) escribe `dormitorio.camas: Array<{tipo}>` vía `SET_CAMPO`; tope M=1 en el handler. Patrón chip/stepper análogo a `PasoUso` ocupantes. |
| DORM-02 | Validar combinación vs capacidad del modelo (geometría real) + advertencia; N5+ personalizables | Helper puro `validacionCamas.js` data-driven desde `MODELOS.camasBase` (NO desde la zona fraccionada — ver Pitfall 1); matrimonial=2 footprints; N5+ sin tope ("a medida"). Aviso sin bloqueo (D-03). |
| DORM-03 | Plano dibuja camas (marrón, etiqueta C/S/M) contra paredes + pasillo central | **Ya cableado**: `floorplanLayout.calcularLayout` mapea `config.dormitorio.camas` a 2 filas (`Bed.jsx`). El paso solo escribe el array. |
| COCINA-01 | Cocina con horno industrial opcional (base incluida) | Toggle `cocina-horno` en `extras[]` (D-06). Mesada/bacha/hornallas ya las dibuja `Kitchen.jsx` siempre (base). |
| COCINA-02 | Heladera (sin / 220V A++ / 12V) | Selector segmentado exclusivo (D-05): un solo id `heladera-220`/`heladera-12v` en `extras[]` a la vez; "Sin" = ninguno. Requiere handler que limpia la otra heladera. |
| COCINA-03 | Elementos del estar (mesa de caño, banco despensero) | Toggles `mesa-cano`, `banco-despensero` en `extras[]` (D-06). |
| COCINA-04 | Plano dibuja cocina/estar (verde) con módulos elegidos | Reuso `Kitchen.jsx` (horno) y `Table.jsx` (mesa) — D-07; `configDesdeEstado` deriva flags de `extras[]` (D-14). Ícono heladera = micro-decisión de plan. |
| EXTRAS-01 | Seleccionar múltiples accesorios del catálogo real | Checkboxes data-driven `EXTRAS.filter(categoria==='extras')`, agrupados por metadato `subgrupo` (D-08); toggle inmutable en `extras[]`. |
| PRECIO-01 | Presupuesto base+accesorios, neto+IVA21%+total, formato argentino, en vivo | Helper `motorPrecios.js` + `formato.js`; barra sticky desde Paso 4 (D-10/11/12). Suma única de `extras[]`. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Validación de capacidad de camas | Lógica pura (`utils/`) | — | Función pura de dominio (modelo → footprints → ¿entra?); testeable con `node:test` sin DOM. |
| Motor de precios | Lógica pura (`utils/`) | — | Suma determinística (modelo + extras); reusa `formato.js`. Sin estado, sin efectos. |
| Split confort/energía | Datos (`data/extras.js`) | Lógica pura | Metadato `subgrupo` en el catálogo; el componente solo agrupa por ese campo (anti-hardcodeo). |
| Stepper de camas / toggles de extras | Componente presentacional (`pasos/`) | Estado (`SET_CAMPO`) | UI sin lógica de negocio: lee `/data`, despacha `extras[]`/`dormitorio.camas` inmutable. |
| Proyección estado → plano | Estado (`wizardReducer.configDesdeEstado`) | Datos | Punto único donde `extras[]` se traduce a flags de dibujo (D-14); el plano no conoce `extras[]`. |
| Reflejo SVG cocina/estar | Render declarativo (`FloorPlan` + elements) | — | Consume `config` ya proyectado; no recalcula. Reusa `Kitchen.jsx`/`Table.jsx`. |
| Barra de precio (montaje + visibilidad) | Cáscara del wizard (`ConfiguratorWizard.jsx`) | Componente (`BarraPrecio`) | El contenedor decide visibilidad (`pasoActual >= 3`) y posición sticky/columna; la barra solo presenta. |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | UI (hooks: useReducer ya en uso) | Stack congelado del proyecto (CLAUDE.md) [VERIFIED: package.json] |
| react-dom | ^18.3.1 | Render DOM | idem |
| tailwindcss | ^3.4.19 | Estilos (v3, NO v4) | Decisión 01-01 (3 directivas @tailwind vía PostCSS) [VERIFIED: package.json] |
| vite | ^5.4.0 | Build/dev | Stack congelado [VERIFIED: package.json] |
| node:test | built-in (Node v24.14.1) | Gate TDD de la lógica pura | Decisión 01-02 / 04-01: **sin dependencias de test nuevas** [VERIFIED: node --version + node:test import] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| node:assert/strict | built-in | Aserciones en tests | Junto a `node:test` (mismo patrón que `*.test.js` existentes) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `node:test` built-in | Vitest / Jest | PROHIBIDO por convención del proyecto ("sin dependencias nuevas", node:test built-in). NO usar. |
| Metadato `subgrupo` en EXTRAS | Regla derivada por lista de ids en helper | El metadato es más simple, vive con el dato, y es la opción "más data-driven". Recomendado (ver Pattern 3). |

**Installation:** Ninguna. **No se agregan dependencias en esta fase.** [VERIFIED: CLAUDE.md +
decisiones 01-02/04-01]

**Version verification:** No aplica registry — el stack está congelado y verificado contra
`package.json`. React 18.3.1, Tailwind 3.4.19, Vite 5.4, Node 24.14.1 confirmados localmente.
`node:test` confirmado importable. [VERIFIED: package.json + `node --version`]

## Architecture Patterns

### System Architecture Diagram

```
                         ┌─────────────────────────────────────────────┐
   Usuario toca opción   │           PASO (presentacional)             │
   (stepper / toggle /   │  PasoDormitorio / PasoCocina / PasoExtras   │
    selector radio)      │  lee /data, NO conoce el plano ni precios   │
        │                └───────────────────┬─────────────────────────┘
        ▼                                    │ dispatch(SET_CAMPO)
   ┌─────────┐                               ▼
   │ EXTRAS  │  (data/extras.js)   ┌──────────────────────────────┐
   │ MODELOS │  (data/models.js)   │   wizardReducer (estado)     │
   │GEOMETRIA│  (data/geometry.js) │  dormitorio.camas[] · extras[]│
   └────┬────┘                     └──────┬───────────────┬───────┘
        │                                 │               │
        │            ┌────────────────────┘               │
        ▼            ▼                                     ▼
 ┌──────────────────────────┐              ┌─────────────────────────────┐
 │  MOTORES (utils, puros)  │              │  configDesdeEstado (D-14)   │
 │  validacionCamas.js      │              │  deriva flags del plano DE  │
 │   modelo→footprints→¿entra?            │  extras[]: ¿horno? ¿heladera?│
 │  motorPrecios.js          │              │  ¿mesa?  → config            │
 │   modelo+Σextras→{neto,    │             └──────────────┬──────────────┘
 │   iva,total} (via formato)│                            ▼
 └───────┬─────────────┬─────┘              ┌─────────────────────────────┐
         │             │                    │  FloorPlan (render SVG)     │
         ▼             ▼                    │  calcularLayout→ zonas+camas │
  ┌─────────────┐  ┌─────────────┐          │  Bed/Kitchen/Table reusados  │
  │ Advertencia │  │ BarraPrecio │          │  (DORM-03/COCINA-04)         │
  │ de capacidad│  │ neto+IVA+tot│          └─────────────────────────────┘
  │ (en el paso)│  │ sticky≥Paso4│
  └─────────────┘  └─────────────┘
```

Traza del caso principal: el usuario agrega una cama → el paso despacha `dormitorio.camas` →
`validacionCamas` recalcula si entra (advertencia, sin bloqueo) y `configDesdeEstado` proyecta al
plano → `FloorPlan` redibuja con `.fp-anim`. El usuario tilda un extra → `extras[]` cambia →
`motorPrecios` recalcula el total de la `BarraPrecio` y (si es horno/heladera/mesa) el plano refleja.

### Recommended Project Structure
```
src/
├── utils/
│   ├── validacionCamas.js        # NUEVO — capacidad de camas (puro, DORM-02)
│   ├── validacionCamas.test.js   # NUEVO — node:test
│   ├── motorPrecios.js           # NUEVO — neto/IVA/total desde estado (puro, PRECIO-01)
│   ├── motorPrecios.test.js      # NUEVO — node:test
│   ├── formato.js                # REUSAR (formatPrecio/calcularIVA/calcularTotal)
│   └── extrasReglas.js           # OPCIONAL — helper de agrupado/heladera exclusiva (si conviene puro)
├── data/
│   └── extras.js                 # EDITAR — agregar metadato `subgrupo` a los 9 extras 'extras'
├── state/
│   └── wizardReducer.js          # EDITAR — configDesdeEstado deriva de extras[] (D-14)
├── components/
│   ├── wizard/
│   │   ├── pasos/
│   │   │   ├── PasoDormitorio.jsx # NUEVO (DORM-01/02/03)
│   │   │   ├── PasoCocina.jsx     # NUEVO (COCINA-01/02/03)
│   │   │   └── PasoExtras.jsx     # NUEVO (EXTRAS-01)
│   │   ├── BarraPrecio.jsx        # NUEVO (PRECIO-01, presentacional)
│   │   └── pasosRegistro.jsx      # EDITAR — enchufar Pasos 4-6 (file ownership exclusivo)
│   ├── ConfiguratorWizard.jsx     # EDITAR — montar BarraPrecio condicional pasoActual>=3
│   └── FloorPlanElements/
│       ├── Kitchen.jsx            # REUSAR (opciones.horno ya soportado parcialmente)
│       └── Table.jsx              # REUSAR
```

### Pattern 1: Paso presentacional `{ estado, dispatch }` + toggle inmutable en `extras[]`
**What:** El paso recibe solo `{ estado, dispatch }`, filtra `EXTRAS` por categoría, y despacha un
array nuevo (nunca muta). El plano reacciona solo (sin props nuevas al paso).
**When to use:** Los 3 pasos nuevos. Es el contrato exacto de `ConfiguratorWizard.jsx:54`.
**Example:**
```jsx
// Source: src/components/wizard/pasos/PasoBano.jsx (patrón verificado, Fase 4)
const toggleExtra = (id) => {
  const nuevos = estado.extras.includes(id)
    ? estado.extras.filter((x) => x !== id)
    : [...estado.extras, id]
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
}
```

### Pattern 2: Selector exclusivo de heladera (radio sobre `extras[]`)
**What:** Tres opciones "Sin / 220V / 12V" donde elegir una **quita la otra** del array. No es un
toggle: hay que filtrar AMBOS ids de heladera y luego agregar el elegido (o ninguno para "Sin").
**When to use:** COCINA-02 (D-05). Misma técnica para garantizar exclusividad mutua.
**Example:**
```jsx
// Source: derivado del patrón extras[] de PasoBano + D-05 (exclusividad)
const IDS_HELADERA = EXTRAS.filter(e => e.categoria === 'cocina' && e.id.startsWith('heladera-')).map(e => e.id)
const elegirHeladera = (id /* string | null */) => {
  const sinHeladera = estado.extras.filter((x) => !IDS_HELADERA.includes(x))
  const nuevos = id ? [...sinHeladera, id] : sinHeladera
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
}
// "marcado" de cada segmento: estado.extras.includes(id); "Sin": ninguno de IDS_HELADERA presente.
```
> Nota anti-hardcodeo: derivar `IDS_HELADERA` de `EXTRAS` (no `['heladera-220','heladera-12v']`
> literal). El prefijo `heladera-` es estable en los ids reales [VERIFIED: data/extras.js].

### Pattern 3: Split confort/energía data-driven vía metadato `subgrupo`
**What:** Agregar un campo `subgrupo: 'confort' | 'energia'` a los 9 extras `categoria:'extras'` en
`data/extras.js`. El componente agrupa por ese campo, sin lista de ids.
**When to use:** EXTRAS-01 (D-08). Recomendado SOBRE la regla derivada por lista de ids.
**Example:**
```js
// Source: data/extras.js (edición propuesta) — split canónico de PROJECT.md "Paso sugerido"
// Energía (2): panel-solar-160, sistema-solar-220.  Confort (7): el resto de 'extras'.
{ id:'calefactor-4000', ..., categoria:'extras', subgrupo:'confort' }
{ id:'panel-solar-160', ..., categoria:'extras', subgrupo:'energia' }
// En el componente:
const SUBGRUPOS = [{ id:'confort', titulo:'Confort' }, { id:'energia', titulo:'Energía' }]
SUBGRUPOS.map(g => EXTRAS.filter(e => e.categoria==='extras' && e.subgrupo===g.id))
```
> El split canónico está en PROJECT.md → tabla Accesorios, columna "Paso sugerido"
> (Extras/confort vs Extras/energía) [VERIFIED: .planning/PROJECT.md líneas 115-123]:
> **Energía** = `panel-solar-160`, `sistema-solar-220`. **Confort** = `calefactor-4000`,
> `caldera-12v`, `split-3200`, `tv-32-directv`, `estereo-pioneer`, `cortinas-blackout`, `toldo`.

### Pattern 4: Stepper de camas con tope por tipo (DORM-01/02)
**What:** Una fila por tipo C/S/M con −/+. `dormitorio.camas` es `Array<{tipo}>`; el stepper agrega/
quita objetos `{tipo}`. Matrimonial topeado en 1 (D-02).
**When to use:** DORM-01. El plano ya consume ese array (D-04).
**Example:**
```jsx
// Source: contrato de floorplanLayout (config.dormitorio.camas) + D-01/D-02
const contar = (tipo) => estado.dormitorio.camas.filter((c) => c.tipo === tipo).length
const setCamas = (camas) =>
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'dormitorio', valor: { ...estado.dormitorio, camas } })
const agregar = (tipo) => {
  if (tipo === 'M' && contar('M') >= 1) return            // D-02: matrimonial máx 1
  setCamas([...estado.dormitorio.camas, { tipo }])
}
const quitar = (tipo) => {
  const idx = estado.dormitorio.camas.findIndex((c) => c.tipo === tipo)
  if (idx === -1) return
  setCamas(estado.dormitorio.camas.filter((_, i) => i !== idx))
}
```
> El orden del array determina la fila (par=superior, impar=inferior) en `floorplanLayout`. Mantener
> un orden estable evita "saltos" de cama entre filas al agregar/quitar (micro-decisión de plan).

### Pattern 5: `configDesdeEstado` deriva flags del plano de `extras[]` (D-14)
**What:** En vez de leer `estado.cocina.horno`/`estado.estar.mesa`, derivar de `extras[]`.
**When to use:** D-14, una sola fuente de verdad.
**Example:**
```js
// Source: wizardReducer.configDesdeEstado (edición propuesta para D-14)
export function configDesdeEstado(estado) {
  const largo = MODELOS.find((m) => m.id === estado.modeloId)?.largo
  const extras = Array.isArray(estado.extras) ? estado.extras : []
  const heladera =
    extras.includes('heladera-220') ? 'heladera-220'
    : extras.includes('heladera-12v') ? 'heladera-12v' : null
  return {
    modeloId: estado.modeloId,
    largo,
    bano: estado.bano,
    dormitorio: estado.dormitorio,
    cocina: { horno: extras.includes('cocina-horno'), heladera },
    estar: { mesa: extras.includes('mesa-cano') },
  }
}
```
> **Recomendación sobre eliminar vs mantener placeholders:** mantener `estadoInicial.cocina`/`.estar`
> con sus defaults neutros NO rompe nada (no se leen más para sumar), pero invita a duplicar fuente
> de verdad. **Recomiendo ELIMINAR `cocina`/`estar` de `estadoInicial`** y derivar siempre de
> `extras[]` (proyección pura en `configDesdeEstado`). Esto exige actualizar el test
> `wizardReducer.test.js` (`estadoInicial` ya no tendrá esos campos) y `esEstadoValido` (no agregar
> exigencia de `cocina`/`estar`; sí sigue exigiendo `extras` array). Ver Pitfall 4.

### Anti-Patterns to Avoid
- **Calcular capacidad de camas desde `largoDormitorio = restante × 0.45`:** la zona del *dibujo*
  es esquemática y NO representa la capacidad real (ver Pitfall 1). Usar `MODELOS.camasBase`.
- **Hardcodear `['heladera-220','heladera-12v']` o la lista confort/energía en el componente:** viola
  el gate anti-hardcodeo. Derivar de `EXTRAS` (categoría + prefijo o metadato `subgrupo`).
- **Sumar precios de dos lugares** (`cocina.horno` + `extras[]`): D-13/D-14 exigen una sola fuente
  (`extras[]`). El motor de precios NUNCA mira `estado.cocina`/`estado.estar`.
- **Mutar `estado.dormitorio.camas` o `estado.extras`** con push/splice: siempre array nuevo (spread/
  filter), como en `PasoBano`.
- **Pasar el precio/plano como props al paso:** el paso solo recibe `{ estado, dispatch }`; la
  `BarraPrecio` y el plano leen el estado por su cuenta (desacople establecido en Fase 4).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Formato `$29.108.976` | Tu propio agrupador de miles | `formato.formatPrecio` | Ya maneja es-AR + fallback sin ICU [VERIFIED: utils/formato.js] |
| IVA y total c/IVA | Multiplicar 1.21 a mano | `formato.calcularIVA` / `calcularTotal` | Única fuente del 0.21 en `data/geometry.js`; evita drift |
| Dibujo de camas en 2 filas + pasillo | Posicionar `<rect>` a mano | `calcularLayout` (ya mapea `dormitorio.camas`) | Toda la geometría de filas/pasillo ya está [VERIFIED: floorplanLayout.js:112-129] |
| Dibujo de cocina/horno/mesa | SVG nuevo | `Kitchen.jsx` / `Table.jsx` | Subcomponentes presentacionales listos (Fase 2) [VERIFIED] |
| Persistencia del estado nuevo | Tocar localStorage | `usePersistedConfig` (ya guarda `estado` entero) | `extras[]`/`dormitorio.camas` ya se persisten al estar en `estado` |
| Test runner | Instalar Vitest/Jest | `node:test` + `node:assert/strict` | Convención del proyecto; sin dependencias nuevas |

**Key insight:** Casi todo lo "pesado" (formato, geometría de camas, dibujo de módulos, persistencia)
ya existe. La fase agrega **2 funciones puras nuevas** (capacidad + precio) y **3 componentes que
clonan un patrón existente**. El riesgo no está en construir, sino en NO reusar (drift de IVA,
recálculo de geometría, doble fuente de precios).

## Runtime State Inventory

> Esta fase NO es rename/refactor de strings ni migración de datos almacenados — es feature work
> sobre un estado en `localStorage` cuya forma ya tolera campos nuevos. Aun así, un campo de estado
> cambia de forma (D-14), así que se documenta el impacto en estado persistido.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data (localStorage) | `impacar_config_v1` guarda el `estado` completo. Si D-14 ELIMINA `cocina`/`estar` de `estadoInicial`, un estado viejo persistido aún tendrá esos campos (ignorados) y los nuevos (`extras[]` con horno/heladera/mesa) faltarán hasta que el usuario los elija. | **Code edit:** `configDesdeEstado` debe derivar de `extras[]` con defaults seguros (optional chaining) para que un estado viejo no crashee. NO se requiere migración: los campos viejos se ignoran; los nuevos arrancan vacíos. Confirmar `esEstadoValido` sigue aceptando estados sin `cocina`/`estar`. |
| Live service config | None — app 100% client-side, sin servicios externos. | Ninguna. |
| OS-registered state | None — no hay tasks/daemons/registros de SO. | Ninguna. |
| Secrets/env vars | None — sin secretos ni env vars. | Ninguna. |
| Build artifacts | `npm test` enumera explícitamente los archivos `.test.js` en `package.json`. Los 2 tests nuevos (`validacionCamas.test.js`, `motorPrecios.test.js`) **no se ejecutarán** si no se agregan a ese script. | **Config edit (CRÍTICO):** agregar los 2 nuevos archivos de test al script `test` de `package.json`. Ver Pitfall 5. |

## Common Pitfalls

### Pitfall 1: Capacidad de camas calculada desde la zona fraccionada del plano (incoherente con el catálogo)
**What goes wrong:** Usar `largoDormitorio = restante × 0.45` (la longitud de la zona en el *dibujo*)
para la fórmula `2 × floor(largoDormitorio / largoCama)` da capacidades absurdas: 0 camas para N1/N2
y solo 2 para N3-N7, cuando N4 tiene `camasBase: 4`. La zona del plano es **esquemática**, no la
capacidad real.
**Why it happens:** El brief insinúa `2 × floor(largoDormitorio / largoCama)`, pero `largoDormitorio`
en el plano es un ratio decorativo (0.45 del restante), no el largo físico donde caben las camas. Las
camas de 2,00m incluso "desbordan" la zona en el dibujo (se posicionan en `x = zonaDormitorio.x` con
`w = 2,00m`), lo cual es aceptable porque el plano es esquemático.

**Recálculo verificado** [VERIFIED: node, geometría real]:

| Modelo | largo | restante | largoDorm (×0.45) | floor(LD/2.0) filas | 2×filas (footprints) | camasBase real |
|--------|-------|----------|-------------------|--------------------:|---------------------:|---------------:|
| N1 | 4.5 | 3.30 | 1.485 | 0 | **0** ❌ | 2 |
| N2 | 5.2 | 4.00 | 1.800 | 0 | **0** ❌ | 2 |
| N3 | 6.1 | 4.90 | 2.205 | 1 | **2** ❌ | 3 |
| N4 | 6.6 | 5.40 | 2.430 | 1 | **2** ❌ | 4 |
| N5 | 7.6 | 6.40 | 2.880 | 1 | **2** | personalizable |
| N6 | 8.6 | 7.40 | 3.330 | 1 | **2** | personalizable |
| N7 | 9.6 | 9.60−1.2=8.40→3.780 | 3.780 | 1 | **2** | personalizable |

**How to avoid:** **La capacidad de validación = `MODELOS.camasBase` del modelo** (data-driven, fuente
de verdad del catálogo). Footprints por tipo: cucheta `C` = 1, simple `S` = 1, matrimonial `M` = 2
(ocupa los dos lugares de una fila, el ancho 2,52m = 0,80 + 0,92 + 0,80; el matrimonial ocupa ambos
flancos). La combinación "entra" si `Σ footprints ≤ camasBase`. Para **N5/N6/N7** (`camasBase: null`,
`personalizable: true`): **no hay tope** — siempre "entra", con nota "a medida" (mayor largo, más
capacidad). Esto es lo más simple, consistente con el catálogo, y no depende del ratio decorativo del
plano. [VERIFIED: data/models.js camasBase; recálculo node]
**Warning signs:** El test de capacidad falla para N4 con 4 camas; la advertencia salta en un modelo
que el catálogo dice que SÍ soporta esas camas.

> **Recomendación de fórmula (research → planner):**
> `capacidadModelo(modeloId) = MODELOS.find(id).personalizable ? Infinity : MODELOS.find(id).camasBase`
> `footprints(camas) = camas.reduce((n,c) => n + (c.tipo === 'M' ? 2 : 1), 0)`
> `entran(modeloId, camas) = footprints(camas) <= capacidadModelo(modeloId)`
> La geometría real (0,80×2 + 0,92 = 2,52) ya está codificada y testeada como checksum en
> `floorplanLayout.test.js:112`; el *requirement* DORM-02 pide "usando la geometría real" — se
> satisface citando que `camasBase` deriva de esa geometría (2 footprints por fila), no recomputando
> una zona fraccionada. El planner debe documentar esta interpretación en el behavior del wave de lógica.

### Pitfall 2: Heladera tratada como toggle (permite elegir dos)
**What goes wrong:** Si la heladera usa el mismo `toggleExtra` que el resto, el usuario puede tener
`heladera-220` y `heladera-12v` a la vez, sumando ambas al precio.
**Why it happens:** Copiar el patrón de checkbox sin la exclusividad de D-05.
**How to avoid:** Patrón 2: al elegir una, filtrar AMBOS ids de heladera primero, luego agregar el
elegido. "Sin" = filtrar ambos y no agregar nada. Test: elegir 12V tras 220V deja solo 12V.
**Warning signs:** El total sube ~$1,69M de más; ambos segmentos aparecen "marcados".

### Pitfall 3: Doble fuente de verdad del precio (cocina.horno + extras[])
**What goes wrong:** El motor suma desde `extras[]` Y desde `estado.cocina.horno`, duplicando o
desincronizando el horno.
**Why it happens:** Los placeholders `cocina:{horno}`/`estar:{mesa}` siguen en el estado y alguien
los lee.
**How to avoid:** D-13/D-14: el horno/heladera/mesa viven SOLO en `extras[]`. El motor de precios
suma un único array. `configDesdeEstado` deriva (no almacena). Eliminar (recomendado) o ignorar los
placeholders. Test: agregar el horno una vez sube el precio exactamente `precioNeto` del horno.
**Warning signs:** El total no coincide con `modelo + Σ extras`; el horno cuenta doble.

### Pitfall 4: Romper `esEstadoValido` / tests existentes al cambiar `estadoInicial` (D-14)
**What goes wrong:** Si se eliminan `cocina`/`estar` de `estadoInicial`, el test
`wizardReducer.test.js` (que hace `assert.deepEqual(estadoInicial.cocina, {...})`) y el de
`configDesdeEstado` (que verifica las keys exactas) fallan; un estado viejo en localStorage podría
no tener `extras` array si se tocó la validación.
**Why it happens:** `estadoInicial` y `configDesdeEstado` tienen tests que afirman su forma exacta
(keys ordenadas). Cambiar la forma sin actualizar el test = rojo.
**How to avoid:** Tratar `wizardReducer.js` + `wizardReducer.test.js` como una unidad: el wave que
toca D-14 actualiza AMBOS. `configDesdeEstado` sigue devolviendo las mismas 6 keys (`bano`, `cocina`,
`dormitorio`, `estar`, `largo`, `modeloId`) — solo cambia DE DÓNDE se derivan `cocina`/`estar`. Así el
test de keys de `configDesdeEstado` sigue pasando; solo se ajustan las aserciones de `estadoInicial`.
`esEstadoValido` debe seguir exigiendo `extras` array (ya lo hace) y NO agregar exigencia de
`cocina`/`estar`. Optional chaining en `configDesdeEstado` para estado viejo.
**Warning signs:** `npm test` rojo en `wizardReducer.test.js` tras editar `estadoInicial`.

### Pitfall 5: Tests nuevos no corren porque `npm test` lista archivos a mano
**What goes wrong:** Se escriben `validacionCamas.test.js` y `motorPrecios.test.js` pero `npm test`
no los toca — el script enumera cada archivo explícitamente y no usa glob.
**Why it happens:** [VERIFIED: package.json:10] el script es
`node --test src/utils/banoReglas.test.js src/utils/floorplanLayout.test.js ...` (lista fija).
**How to avoid:** El wave que crea cada test DEBE agregar el archivo al script `test` de
`package.json`. Alternativa más robusta (recomendada si el planner quiere): cambiar el script a un
patrón glob de Node (`node --test "src/**/*.test.js"`) — Node 24 soporta `--test` con globbing, lo
que elimina este pitfall a futuro. Verificar que el glob no levante `node_modules` (hay `.test.js`
ahí); preferir `node --test src/` que descubre solo bajo `src/`.
**Warning signs:** `npm test` muestra el mismo conteo de tests que antes; el test nuevo "pasa" porque
nunca corrió.

### Pitfall 6: La barra de precio aparece en Pasos 1-3 (rompe la regla "sin precios")
**What goes wrong:** Montar `BarraPrecio` sin condicionar a `pasoActual` la muestra en uso/
dimensiones/baño, violando D-10 y la regla preservada de Fase 4.
**Why it happens:** Montaje incondicional en `ConfiguratorWizard`.
**How to avoid:** Render condicional `estado.pasoActual >= 3` (Paso 4 es índice 3, 0-based). `D-10`:
sticky abajo en mobile / junto al plano en desktop. Verificación visual: en Paso 3 NO hay precio; en
Paso 4 aparece.
**Warning signs:** Verificación visual ve `$` en el Paso 3.

## Code Examples

### Motor de precios (puro, PRECIO-01)
```js
// Source: composición de utils/formato.js + data (patrón nuevo, sin libs)
import { MODELOS } from '../data/models.js'
import { EXTRAS } from '../data/extras.js'
import { calcularIVA, calcularTotal } from './formato.js'

// Neto = precio del modelo + suma de precioNeto de los extras seleccionados (una sola fuente).
export function calcularPresupuesto(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const base = modelo?.precioNeto ?? 0
  const ids = Array.isArray(estado?.extras) ? estado.extras : []
  const sumaExtras = EXTRAS
    .filter((e) => ids.includes(e.id))
    .reduce((acc, e) => acc + e.precioNeto, 0)
  const neto = base + sumaExtras
  return { neto, iva: calcularIVA(neto), total: calcularTotal(neto) }
}
// La BarraPrecio formatea con formatPrecio(neto/iva/total). 3 líneas (D-11).
```

### Validación de capacidad de camas (puro, DORM-02)
```js
// Source: data/models.js (camasBase/personalizable) + interpretación de Pitfall 1
import { MODELOS } from '../data/models.js'

export function capacidadFootprints(modeloId) {
  const m = MODELOS.find((x) => x.id === modeloId)
  if (!m) return 0                       // id adulterado → no entra nada (seguro)
  if (m.personalizable) return Infinity  // N5+ a medida: sin tope
  return m.camasBase ?? 0
}

export function footprintsDeCamas(camas) {
  const lista = Array.isArray(camas) ? camas : []
  return lista.reduce((n, c) => n + (c?.tipo === 'M' ? 2 : 1), 0) // M = 2; C/S = 1
}

export function camasEntran(modeloId, camas) {
  return footprintsDeCamas(camas) <= capacidadFootprints(modeloId)
}
// La advertencia (D-03, sin bloqueo) usa camasEntran===false + el nombre del modelo.
```

### Barra de precio condicional al paso (montaje, D-10)
```jsx
// Source: ConfiguratorWizard.jsx (edición propuesta) — visible desde Paso 4 (índice 3)
{estado.pasoActual >= 3 && <BarraPrecio estado={estado} />}
// Posición: sticky bottom en mobile / dentro de la columna del plano (lg:order-2) en desktop.
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `cocina:{horno,heladera}` + `estar:{mesa}` como estado propio | Derivar de `extras[]` en `configDesdeEstado` (D-14) | Esta fase | Una sola fuente de verdad para precio y plano |
| Capacidad insinuada por `2×floor(largoDorm/2)` | Capacidad = `MODELOS.camasBase` (personalizable=∞) | Esta fase | Coherencia con el catálogo (ver Pitfall 1) |
| `npm test` con lista fija de archivos | (opcional) `node --test src/` con descubrimiento | Esta fase (recomendado) | Evita olvidar agregar tests nuevos |

**Deprecated/outdated:** nada externo. La única "deuda" interna es la doble representación de
cocina/estar, que D-14 resuelve.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Matrimonial = 2 footprints (ocupa los dos flancos de una fila); C/S = 1 | Pitfall 1 / Code Examples | Si la fábrica considera el matrimonial = 1 footprint especial, la capacidad de N4 (4) admitiría más combinaciones. El asesor confirma en la demo (D-03 sin bloqueo mitiga el riesgo). Bajo: es aviso, no bloqueo. |
| A2 | Capacidad de validación = `camasBase` (no la zona del plano) | Pitfall 1 | Si el cliente espera que la capacidad surja de la geometría de la zona, la interpretación difiere; pero `camasBase` ES la geometría del catálogo (2 footprints/fila × filas reales del modelo). Recomendado confirmar el copy de la advertencia. |
| A3 | El prefijo `heladera-` en los ids es estable y único para las 2 heladeras | Pattern 2 | Bajo: verificado en data/extras.js; si se agrega otro id con ese prefijo, revisar el filtro. |
| A4 | Eliminar `cocina`/`estar` de `estadoInicial` es preferible a mantenerlos | Pattern 5 / Pitfall 4 | Medio: es una decisión de diseño; mantenerlos como defaults neutros también funciona si nadie los lee para sumar. El planner cierra. Ambos caminos compatibles con D-14. |
| A5 | El split confort/energía de PROJECT.md ("Paso sugerido") es el canónico | Pattern 3 | Bajo: verificado contra PROJECT.md y la lista explícita de D-08 (coinciden exactamente). |
| A6 | El ícono de heladera en el plano (D-07) es opcional/micro-decisión, no bloqueante para COCINA-04 | Phase Requirements | Bajo: `Kitchen.jsx` ya dibuja un bloque de heladera siempre; reflejar el tipo elegido es un realce, no un requisito duro. Planner decide alcance. |

## Open Questions

1. **Copy exacto de la advertencia de capacidad (DORM-02/D-03)**
   - Qué sabemos: aviso sin bloqueo, estilo "No entran en el modelo Nx; considere un modelo más largo".
   - Qué falta: el texto final con trato de usted (p.ej. "Esta combinación de camas no entra en el
     modelo N{n}. Le sugerimos un modelo más largo.").
   - Recomendación: el planner fija el copy; debe pasar el gate anti-voseo (trato de usted).

2. **Comportamiento del total al borrar la última cama / vaciar extras**
   - Qué sabemos: el total = modelo + Σ extras; con `extras` vacío el total = solo el modelo.
   - Qué falta: ¿la barra muestra siempre el total del modelo aunque no haya extras? (Sí, recomendado).
   - Recomendación: la barra siempre muestra `neto/iva/total` ≥ precio del modelo; nunca $0.

3. **¿Glob de tests o lista fija en `package.json`?**
   - Qué sabemos: hoy es lista fija (Pitfall 5).
   - Qué falta: decisión de migrar a `node --test src/`.
   - Recomendación: migrar a descubrimiento bajo `src/` para robustez; si no, agregar los 2 archivos
     a mano (gate: el wave que crea cada test toca `package.json`).

4. **Ícono/representación de la heladera elegida en el plano (D-07)**
   - Qué sabemos: `Kitchen.jsx` ya dibuja una heladera genérica; recibe `opciones={config.cocina}`.
   - Qué falta: ¿diferenciar 220V vs 12V visualmente? Probablemente no hace falta (esquemático).
   - Recomendación: reflejar "hay heladera / no hay" como mucho; no diferenciar tipo en el dibujo.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | build, tests | ✓ | v24.14.1 | — |
| npm | scripts | ✓ | 11.11.0 | — |
| node:test / node:assert | gate TDD de motores | ✓ | built-in | — |
| Vite dev/build | render del wizard | ✓ | ^5.4.0 (package.json) | — |

**Missing dependencies with no fallback:** Ninguna.
**Missing dependencies with fallback:** Ninguna. **No se instala nada nuevo.**

## Validation Architecture

> Nyquist validation ENABLED. Los dos motores de esta fase son lógica pura → 100% testeables con
> `node:test`, sin DOM. Los componentes y el reflejo del plano se verifican visualmente (checkpoint
> human-verify, como en Fase 4).

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (built-in, Node v24.14.1) + `node:assert/strict` |
| Config file | none — los tests se enumeran en el script `test` de `package.json` (ver Wave 0) |
| Quick run command | `node --test src/utils/validacionCamas.test.js src/utils/motorPrecios.test.js` |
| Full suite command | `npm test` (debe incluir los 2 archivos nuevos) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DORM-02 | `camasEntran` usa `camasBase` (N4→4, M=2 footprints); N5+ → Infinity (siempre entra) | unit | `node --test src/utils/validacionCamas.test.js` | ❌ Wave 0 |
| DORM-02 | id adulterado → capacidad 0 (no crashea); `camas` no-array → 0 footprints | unit | idem | ❌ Wave 0 |
| DORM-01/02 | matrimonial = 2 footprints; combinación límite (4 simples en N4 entra, 5 no) | unit | idem | ❌ Wave 0 |
| PRECIO-01 | `calcularPresupuesto(N4 + 0 extras)` = `{neto:38971845, ...}`; total = neto×1.21 | unit | `node --test src/utils/motorPrecios.test.js` | ❌ Wave 0 |
| PRECIO-01 | suma de extras seleccionados es exacta (N4 + todos = neto 55.977.868) | unit | idem | ❌ Wave 0 |
| PRECIO-01 | una sola fuente: `cocina.horno` NO afecta; solo `extras[]` suma | unit | idem | ❌ Wave 0 |
| PRECIO-01 | estado adulterado (modeloId inválido, extras no-array) → no crashea, neto≥0 | unit | idem | ❌ Wave 0 |
| D-14 | `configDesdeEstado` deriva `cocina.horno`/`estar.mesa`/`cocina.heladera` de `extras[]` | unit | `node --test src/state/wizardReducer.test.js` (extender) | ✅ existe (extender) |
| D-08 | los 9 extras `categoria:'extras'` tienen `subgrupo` válido (confort|energia); 7+2 | unit | `node --test src/data/extras.test.js` (nuevo) o en validacionCamas | ❌ Wave 0 |
| DORM-03 / COCINA-04 | plano refleja camas/horno/mesa | manual (visual) | checkpoint human-verify ~375px | n/a (visual) |
| PRECIO-01 (UI) | barra sticky aparece en Paso 4, no en 1-3; formato `$29.108.976` | manual (visual) | checkpoint human-verify | n/a (visual) |

> Valores numéricos de aserción verificados por recálculo [VERIFIED: node]: N4 neto 38.971.845;
> N4 + los 17 extras = neto 55.977.868, total c/IVA 67.733.220.

### Sampling Rate
- **Per task commit:** `node --test <archivo de test del wave>` (el motor que toca el task).
- **Per wave merge:** `npm test` completo (con los 2 nuevos archivos agregados al script).
- **Phase gate:** `npm test` verde + `npm run build` OK + checkpoint human-verify (visual ~375px:
  steppers, exclusividad de heladera, advertencia de capacidad, barra de precio desde Paso 4,
  reflejo del plano) antes de `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `src/utils/validacionCamas.test.js` — cubre DORM-02 (capacidad data-driven, M=2, N5+ ∞, id adulterado)
- [ ] `src/utils/motorPrecios.test.js` — cubre PRECIO-01 (suma única, IVA/total, estado adulterado)
- [ ] `src/data/extras.test.js` (o aserción dentro de un test de motor) — cubre D-08 (metadato `subgrupo` íntegro: 7 confort + 2 energía)
- [ ] Extender `src/state/wizardReducer.test.js` — cubre D-14 (derivación desde `extras[]`) + ajustar aserciones de `estadoInicial` si se eliminan `cocina`/`estar`
- [ ] **`package.json`** — agregar los archivos de test nuevos al script `test` (o migrar a `node --test src/`) — sin esto, los tests nuevos NO corren (Pitfall 5)
- [ ] Framework install: ninguno — `node:test` ya disponible

## Sources

### Primary (HIGH confidence)
- Lectura directa del codebase (source of truth):
  - `src/data/models.js`, `src/data/extras.js`, `src/data/geometry.js` — datos reales Lista 108
  - `src/utils/formato.js`, `src/utils/floorplanLayout.js`, `src/utils/banoReglas.js` — helpers puros + patrón de test
  - `src/state/wizardReducer.js` + `wizardReducer.test.js` — estado, `configDesdeEstado`, contrato de tests
  - `src/components/wizard/pasos/PasoBano.jsx`, `pasosRegistro.jsx`, `ConfiguratorWizard.jsx`, `PlanoPanel.jsx`
  - `src/components/FloorPlan.jsx`, `FloorPlanElements/{Bed,Kitchen,Table}.jsx`
  - `src/hooks/usePersistedConfig.js`, `src/data/mockConfig.js`, `package.json`
- `.planning/PROJECT.md` § Datos reales — split confort/energía canónico + geometría
- `.planning/REQUIREMENTS.md`, `.planning/ROADMAP.md` § Phase 5, `.planning/STATE.md`, `05-CONTEXT.md`
- Recálculo geométrico y de precios con `node` (tablas de Pitfall 1 y aserciones de Validation)

### Secondary (MEDIUM confidence)
- (ninguna — todo se verificó contra el codebase o se recalculó localmente)

### Tertiary (LOW confidence)
- (ninguna)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — congelado y verificado contra `package.json` + `node --version`.
- Architecture/patterns: HIGH — clones directos de patrones ya en producción (PasoBano, configDesdeEstado).
- Pitfalls: HIGH — el riesgo geométrico (Pitfall 1) se recalculó a mano; los demás derivan de leer el código y los tests existentes.
- Geometría de capacidad: HIGH en el diagnóstico (la fórmula "literal" rompe), MEDIUM en la decisión final de footprints del matrimonial (A1/A2 — aviso sin bloqueo mitiga).

**Research date:** 2026-06-27
**Valid until:** estable (proyecto interno, stack congelado) — revalidar solo si cambian `/data` o el contrato de `configDesdeEstado`.
