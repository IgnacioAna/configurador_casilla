# Phase 4: Pasos 1-3 (Uso, Dimensiones, Baño) - Research

**Researched:** 2026-06-27
**Domain:** UI de selección en un wizard React 18 + reflejo en vivo de un plano SVG (extensión de código existente, NO greenfield)
**Confidence:** HIGH (todo el contrato relevante está en el repo y verificado por lectura directa + ejecución de tests)

## Summary

Esta fase **extiende** la cáscara del wizard ya construida en las Fases 1-3. No se introduce stack
nuevo ni dependencias: se reemplaza el contenido stub de los 3 primeros pasos por UI real y se
hace UN cambio quirúrgico en el motor de layout del plano para cumplir BANO-03. Toda la
infraestructura de soporte ya existe y está probada: el reducer central (`wizardReducer.js`) con
la acción `SET_CAMPO`, la persistencia en `localStorage` (`usePersistedConfig.js`, key
`impacar_config_v1`), el cableado `configDesdeEstado(estado) → PlanoPanel → FloorPlan`, las
transiciones de 300ms (`.fp-anim`), y los datos reales (`MODELOS`, `SUGERENCIA_OCUPANTES`,
`EXTRAS`, `GEOMETRIA`). [VERIFIED: lectura directa de los 11 archivos + `node --test` con 20/20 verde]

El estado ya tiene la **forma exacta** que los Pasos 1-3 necesitan escribir: `uso`, `ocupantes`,
`modeloId`, `bano.tamano` y `extras[]` están todos declarados en `estadoInicial`. La única acción
que se usa para escribir config es `SET_CAMPO ({ campo, valor })`; con ella alcanza para todo lo
de esta fase. **No hace falta agregar acciones nuevas al reducer** salvo, opcionalmente, helpers
de conveniencia para arrays (toggle de extras) — pero `SET_CAMPO` con el array completo ya sirve
y mantiene el reducer minimalista (decisión coherente con el patrón existente).

El único trabajo de "motor" es BANO-03: hoy `floorplanLayout.js` reparte el largo central con
`RATIO_BANO = 0.22` **fijo** e ignora `config.bano.tamano`. El cambio mínimo es parametrizar ese
ratio por tamaño de baño, manteniendo el patrón ya establecido de "el estar absorbe el residuo"
para que la suma siga cerrando exacta contra `config.largo` (lo que preserva los tests existentes).

**Primary recommendation:** Implementar los 3 pasos como componentes presentacionales que leen
`estado` y disparan `SET_CAMPO`; derivar TODO de `/data` (sugerencia, umbral de baño ampliado,
metadatos de cards) sin hardcodear ids ni medidas; y para BANO-03 parametrizar solo `RATIO_BANO`
en `calcularLayout` dejando intacto el resto del contrato del plano.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Selección de uso/ocupantes/modelo/baño (UI) | Componente React de paso (cliente) | — | Captura de input puro; lee `estado`, dispara `SET_CAMPO` |
| Estado de configuración | `wizardReducer` (cliente, in-memory) | — | Única fuente de verdad; ya existe, NO se reescribe |
| Persistencia entre recargas | `usePersistedConfig` → `localStorage` | — | Ya implementado en Fase 3; los pasos no tocan storage directo |
| Derivación de la sugerencia de modelo | `data/models.js` (`SUGERENCIA_OCUPANTES`) | Componente Paso 1 | Data-driven; el componente solo lee el mapa |
| Reglas de habilitación de baño (N3+) | Derivado de `MODELOS.largo` | Componente Paso 3 | Umbral data-driven, sin lista de ids hardcodeada |
| Reparto de zonas + tamaño de baño en el plano | `utils/floorplanLayout.js` (helper puro) | `FloorPlan.jsx` (render) | El layout es lógica geométrica pura; el render solo dibuja coords ya calculadas |
| Animación del cambio de tamaño de baño | CSS `.fp-anim` (cliente) | — | LOCKED; transición sobre x/y/width ya cubierta |

## Standard Stack

Esta fase **no agrega dependencias**. Todo se construye con lo ya instalado. [VERIFIED: package.json]

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react | ^18.3.1 | Componentes de paso, hooks (`useReducer` vía hook existente) | LOCKED (CLAUDE.md) — stack del proyecto |
| react-dom | ^18.3.1 | Render | LOCKED |
| tailwindcss | ^3.4.19 | Estilos utilitarios (clases ya definidas en UI-SPEC) | LOCKED (CLAUDE.md: Tailwind v3, NO v4) |
| vite | ^5.4.0 | Dev server / build | LOCKED |

### Supporting (dev, sin instalar — built-in de Node)
| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| node:test | built-in (Node 18+) | Tests de lógica pura (layout, reducer, helpers de sugerencia) | Gate de validación; patrón ya establecido (3 suites existentes) |
| node:assert/strict | built-in | Asserts en los tests | Junto con node:test |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| SVG inline a mano (íconos de uso) | lucide-react / heroicons | RECHAZADO por UI-SPEC: rompe "stack liviano sin librerías de dibujo"; agrega dependencia para 5 íconos |
| `SET_CAMPO` con array completo (extras) | Acción nueva `TOGGLE_EXTRA` | Opcional; `SET_CAMPO` ya sirve. Una acción dedicada es más legible pero no es necesaria |
| node:test | Vitest / Jest | RECHAZADO: el proyecto ya decidió node:test built-in (STATE.md 01-02) para evitar dependencias |

**Installation:** Ninguna. `npm install` no agrega paquetes en esta fase.

**Version verification:** No aplica — no se incorporan paquetes nuevos. Las versiones existentes
están fijadas en `package-lock.json` (commiteado, decisión 01-01). [VERIFIED: package.json]

## Architecture Patterns

### System Architecture Diagram

```
Usuario interactúa con un Paso (1, 2 o 3)
        │
        ▼
[Componente de paso]  ── lee ──>  estado (props: estado, dispatch)
   (PasoUso /              │
    PasoDimensiones /      │ al seleccionar:
    PasoBano)              ▼
                  dispatch({ type: SET_CAMPO, campo, valor })
                          │
                          ▼
                  wizardReducer  ──>  nuevo estado (inmutable)
                          │
            ┌─────────────┴──────────────┐
            ▼                            ▼
   usePersistedConfig            ConfiguratorWizard
   (useEffect guarda en           const configPlano =
    localStorage)                  configDesdeEstado(estado)
                                          │
                                          ▼
                                   PlanoPanel → FloorPlan
                                          │
                                          ▼
                                   calcularLayout(config)
                                   (lee config.largo + config.bano.tamano*)
                                          │
                                          ▼
                                   <svg> con zonas/cotas/módulos
                                   (transición .fp-anim 300ms)

  * config.bano.tamano: HOY ignorado por calcularLayout — el cambio de BANO-03 es leerlo aquí.
```

Reglas de derivación que alimentan a los componentes (no son tiers, son lecturas de `/data`):
```
ocupantes ──(SUGERENCIA_OCUPANTES)──> modeloId sugerido
modeloId  ──(MODELOS.largo >= 6.1)──> ¿"ampliado" habilitado?
modeloId  ──(MODELOS[id])──────────> largo, camasBase, ocupantesIdeal (cards)
```

### Component Responsibilities

| Archivo | Responsabilidad en Phase 4 | Estado actual |
|---------|----------------------------|---------------|
| `src/components/wizard/pasosRegistro.jsx` | Reemplazar `Componente` de los pasos 'uso'/'dimensiones'/'bano' por los reales | Hoy 3 stubs `StubPaso` (los 3 primeros) |
| `src/components/wizard/pasos/PasoUso.jsx` (NUEVO) | USO-01/02/03: cards de uso + chips de ocupantes + feedback de sugerencia | No existe |
| `src/components/wizard/pasos/PasoDimensiones.jsx` (NUEVO) | DIM-01/02: 7 cards de modelo con badge "Sugerido" | No existe |
| `src/components/wizard/pasos/PasoBano.jsx` (NUEVO) | BANO-01/02: checkboxes de equipamiento + selector de tamaño con disabled | No existe |
| `src/utils/floorplanLayout.js` | BANO-03: leer `config.bano.tamano` y ajustar `RATIO_BANO` | Hoy `RATIO_BANO=0.22` fijo, ignora bano.tamano |
| `src/state/wizardReducer.js` | Posible helper opcional para toggle de extras | `SET_CAMPO` ya cubre todo |
| `src/components/FloorPlanElements/Bathroom.jsx` | NINGUNO — se reescala solo (deriva piezas del rect recibido) | LOCKED, no se toca |

### Recommended Project Structure
```
src/components/wizard/
├── pasosRegistro.jsx       # (existe) — enchufar aquí los 3 componentes reales
└── pasos/                  # (carpeta nueva sugerida) — un archivo por paso
    ├── PasoUso.jsx         # USO-01/02/03
    ├── PasoDimensiones.jsx # DIM-01/02
    └── PasoBano.jsx        # BANO-01/02
src/components/wizard/cards/  # (opcional) — primitivas reutilizables
    ├── CardSeleccionable.jsx # Patrón A (uso + modelo)
    └── ChipSegmento.jsx      # Patrón B (ocupantes + tamaño baño)
```
> Nota: La carpeta `pasos/` es sugerencia. El proyecto hoy no tiene esa subcarpeta; el patrón
> existente es archivos sueltos en `wizard/`. El planner puede elegir archivos sueltos o subcarpeta
> mientras mantenga `pasosRegistro.jsx` como contrato de enchufe.

### Pattern 1: Componente de paso (contrato de props heredado)
**What:** Cada paso recibe `{ estado, dispatch }` desde `ConfiguratorWizard`.
**When to use:** Los 3 pasos de esta fase.
**Example:**
```jsx
// Source: contrato real en ConfiguratorWizard.jsx:54 → <Paso.Componente estado={estado} dispatch={dispatch} />
// y pasosRegistro.jsx:19 (los stubs ya aceptan {...props})
import { ACCIONES } from '../../../state/wizardReducer.js'

export default function PasoUso({ estado, dispatch }) {
  const setUso = (uso) => dispatch({ type: ACCIONES.SET_CAMPO, campo: 'uso', valor: uso })
  // ...
  return (/* grid de cards (Patrón A del UI-SPEC) */)
}
```

### Pattern 2: Card seleccionable con `<button>` + `aria-pressed` (Patrón A del UI-SPEC)
**What:** Selección única; un `<button type="button">` por opción, estado activo con `aria-pressed`.
**When to use:** Cards de uso (Paso 1) y de modelo (Paso 2).
**Example:**
```jsx
// Source: clases EXACTAS del UI-SPEC "Patrón A" + estados heredados de los botones de ConfiguratorWizard.jsx
<button
  type="button"
  aria-pressed={seleccionado}
  onClick={() => onSeleccionar(opcion.id)}
  className={[
    'min-h-[44px] rounded p-4 text-left transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
    seleccionado
      ? 'border border-impacar-campo bg-impacar-campo/10'
      : 'border border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40 hover:bg-impacar-campo/5',
  ].join(' ')}
>
  {/* contenido */}
</button>
```
> Decisión Q1 del UI-SPEC: **botones con `aria-pressed`** (no `radiogroup`). La navegación por
> flechas se difiere a Phase 7 (Accesibilidad). [CITED: 04-UI-SPEC.md Open Questions Q1]

### Pattern 3: Derivación de la sugerencia (USO-03), data-driven
**What:** Al elegir ocupantes, pre-seleccionar el modelo con `SUGERENCIA_OCUPANTES`.
**When to use:** Paso 1, en el handler de selección de ocupantes.
**Example:**
```jsx
// Source: SUGERENCIA_OCUPANTES en src/data/models.js (verificado): { 2:'N1',3:'N2',4:'N3',5:'N5',6:'N5',8:'N7' }
import { SUGERENCIA_OCUPANTES } from '../../../data/models.js'

const elegirOcupantes = (n) => {
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'ocupantes', valor: n })
  const sugerido = SUGERENCIA_OCUPANTES[n]            // NO hardcodear el mapeo en el componente
  if (sugerido) dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: sugerido })
}
```
> El feedback (Patrón D) muestra: `Le sugerimos el modelo {N} para {ocupantes} personas. Lo puede
> cambiar en el paso siguiente.` El badge "Sugerido" en el Paso 2 marca la card cuyo
> `id === SUGERENCIA_OCUPANTES[estado.ocupantes]` (es informativo, persiste aunque el usuario cambie).

### Pattern 4: Umbral "baño ampliado" derivado de datos (BANO-02)
**What:** "Ampliado" solo en modelos de 6.10 m+; derivar del largo, no de una lista de ids.
**When to use:** Paso 3, para `disabled` del chip "Ampliado".
**Example:**
```jsx
// Source: MODELOS en src/data/models.js (verificado): N1=4.5, N2=5.2, N3=6.1, N4=6.6, N5=7.6, N6=8.6, N7=9.6
import { MODELOS } from '../../../data/models.js'

const LARGO_MIN_BANO_AMPLIADO = 6.1   // umbral del REQUIREMENT (N3 = 6,10 m). Constante nombrada, no lista de ids.
const modelo = MODELOS.find((m) => m.id === estado.modeloId)
const permiteAmpliado = (modelo?.largo ?? 0) >= LARGO_MIN_BANO_AMPLIADO  // N1/N2 → false
```
> El UI-SPEC pide explícitamente derivar de `MODELOS.largo >= 6.1` en vez de hardcodear ids, por
> el "gate anti-hardcodeo" de las fases previas. [CITED: 04-UI-SPEC.md "Reglas de habilitación"]

### Pattern 5: Corrección silenciosa de tamaño de baño (Q4)
**What:** Si el usuario tenía `'ampliado'` y baja a N1/N2, forzar `'estandar'`.
**When to use:** En el handler de cambio de modelo (Paso 2) o al entrar al Paso 3.
**Example:**
```jsx
// Source: 04-UI-SPEC.md Open Question Q4 (default: forzar a 'estandar', sin diálogo)
const elegirModelo = (id) => {
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: id })
  const m = MODELOS.find((x) => x.id === id)
  if ((m?.largo ?? 0) < LARGO_MIN_BANO_AMPLIADO && estado.bano.tamano === 'ampliado') {
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'bano', valor: { ...estado.bano, tamano: 'estandar' } })
  }
}
```
> Nota inmutabilidad: `bano` es un objeto; al actualizarlo siempre clonar (`{ ...estado.bano, tamano }`)
> para no mutar — coherente con `SET_CAMPO` que reemplaza la clave entera. [VERIFIED: wizardReducer.js:65]

### Anti-Patterns to Avoid
- **Hardcodear el largo o la lista de modelos en un componente:** leer siempre de `MODELOS`.
  El gate anti-hardcodeo de fases previas (grep en verify) lo va a marcar. [VERIFIED: STATE.md 02-01]
- **Tutear en la UI de los pasos:** todo el wizard usa trato de usted (UX-03). El único tuteo
  permitido es el preexistente en `FloorPlan.jsx` (copys de Empty/Error), que NO se toca (Q3).
- **Tocar `FloorPlan.jsx` o `Bathroom.jsx` para BANO-03:** el cambio va en `floorplanLayout.js`.
  `Bathroom.jsx` se reescala solo porque deriva sus piezas del rect recibido. [VERIFIED: Bathroom.jsx:5-11]
- **Reescribir el reducer o la persistencia:** `SET_CAMPO` + `usePersistedConfig` ya cubren todo.
- **Forzar la apertura del plano colapsado en mobile tras seleccionar:** mantenerlo colapsado
  (Q5, evita saltos de layout en ~375px).
- **Invadir Phase 5:** sin precios, sin camas detalladas (DORM), sin cocina/extras de cocina.
  El equipamiento de baño SÍ entra (BANO-01) y se guarda en `extras[]` con ids `bano`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Persistir la config | Otro hook / efecto de localStorage | `usePersistedConfig` (ya guarda en cada cambio) | Ya maneja parse, validación T-03-01, cuota T-03-03 |
| Derivar el largo del modelo | Mapa id→largo en el componente | `configDesdeEstado` (lo deriva de MODELOS) | Fuente única de verdad, ya testeada |
| Reflejar el plano | Pasar props sueltas a FloorPlan | `configDesdeEstado(estado)` ya cableado en ConfiguratorWizard | El cableado completo existe; solo escribir el estado |
| Animar el cambio de tamaño de baño | JS de animación / requestAnimationFrame | clases `.fp-anim` ya en los rects | Transición CSS 300ms + prefers-reduced-motion ya cubiertos |
| Mapear ocupantes→modelo | `if/switch` en el componente | `SUGERENCIA_OCUPANTES` de data | Data-driven, testeable, sin lógica duplicada |
| Formato de medidas ("6,60 m") | toFixed manual disperso | helper `metros()` (en FloorPlan) / patrón coma decimal | Patrón ya establecido; reusar evita inconsistencia |

**Key insight:** Phase 4 es 90% "conectar UI a un estado y un motor que ya existen y están
probados". El riesgo no está en construir cosas nuevas, sino en NO reusar lo existente (duplicar
lógica de derivación, tocar el motor del plano de más, romper la suma exacta del layout).

## Runtime State Inventory

> Esta fase incluye un cambio de reparto en el plano y nuevos campos de estado que ya estaban
> declarados. No es un rename, pero sí toca estado persistido — relevante revisar.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | `localStorage` key `impacar_config_v1` guarda el estado COMPLETO del wizard (incluye `uso`, `ocupantes`, `modeloId`, `bano`, `extras`). Los campos ya existen en `estadoInicial`, así que un estado guardado en Fase 3 es **compatible** (no rompe el schema). | Ninguna migración. `esEstadoValido` solo exige `pasoActual` + `modeloId` (ambos ya presentes). [VERIFIED: usePersistedConfig.js:20-27] |
| Live service config | Ninguna — app 100% client-side, sin backend ni servicios externos. | None — verificado por CLAUDE.md (sin backend) + ausencia de llamadas de red en src |
| OS-registered state | Ninguna — no hay tareas programadas, procesos ni registros de SO. | None — app web estática |
| Secrets/env vars | Ninguna — sin secretos ni variables de entorno en el flujo de configuración. | None — verificado por ausencia de .env y de lecturas de import.meta.env en los archivos leídos |
| Build artifacts | Ninguna que cambie de nombre. Vite recompila desde src; no hay artefactos con nombres acoplados. | None |

**Riesgo de compatibilidad del estado guardado:** Si Phase 4 cambia la **forma** de `extras` o
`bano` (p. ej. de array de strings a array de objetos), un estado viejo en `localStorage` podría
quedar inconsistente. **Recomendación:** mantener `extras: string[]` (ids) y `bano: { tamano }`
tal como están — así no se necesita bumpear la key (`_v1` → `_v2`) ni migrar. [VERIFIED: estadoInicial]

## Common Pitfalls

### Pitfall 1: Romper la suma exacta del layout al cambiar el ratio del baño
**What goes wrong:** Al subir `RATIO_BANO` para "ampliado", si también se recalcula
`largoEstar` con su propio ratio, la suma `baulera + bano + dorm + estar + cocina` puede no cerrar
contra `config.largo` por redondeo → el test `zonas: la suma de largoM === config.largo` falla.
**Why it happens:** Hoy el estar absorbe el residuo (`largoEstar = restante - largoBano - largoDormitorio`).
Si se rompe ese patrón, la suma deja de ser exacta.
**How to avoid:** Cambiar **solo** `RATIO_BANO` (a un valor mayor cuando ampliado) y mantener
`largoEstar = restante - largoBano - largoDormitorio`. El estar sigue absorbiendo el residuo.
[VERIFIED: floorplanLayout.js:66-70 + test floorplanLayout.test.js:46-50]
**Warning signs:** El test de suma se pone rojo; o el divisor de zona aparece corrido.

### Pitfall 2: Zonas centrales negativas en modelos chicos con baño ampliado
**What goes wrong:** Si `RATIO_BANO_AMPLIADO` es muy alto, en un modelo chico el dormitorio o el
estar podrían quedar con ancho cercano a 0 o negativo.
**Why it happens:** El reparto es proporcional sobre `restante`.
**How to avoid:** BANO-02 ya restringe "ampliado" a N3+ (6.1 m+), donde `restante = 6.1 - 1.2 = 4.9 m`
es suficiente. Igual, elegir `RATIO_BANO_AMPLIADO` moderado (UI-SPEC sugiere ≈0.30) y verificar que
con N3 ampliado las 3 zonas centrales queden > `MINIMO_CENTRAL`. La guarda `valido:false` de
`calcularLayout` solo chequea el total, no zonas individuales — agregar un test explícito para N3 ampliado.
[VERIFIED: floorplanLayout.js:60-63]
**Warning signs:** Etiqueta de zona solapada, módulo de baño desbordando, ancho de dormitorio < ~0.4 m.

### Pitfall 3: Mutar `estado.bano` o `estado.extras` en lugar de clonar
**What goes wrong:** Actualizar `bano.tamano` o pushear a `extras` mutando el objeto/array
existente; React no re-renderiza o el estado se contamina.
**Why it happens:** `SET_CAMPO` reemplaza la clave entera con `accion.valor`; si `valor` es el
mismo objeto mutado, la igualdad referencial puede engañar.
**How to avoid:** Siempre construir un valor nuevo: `{ ...estado.bano, tamano }` y
`[...estado.extras, id]` / `estado.extras.filter(x => x !== id)`. [VERIFIED: wizardReducer.js:64-66]
**Warning signs:** El plano no transiciona al cambiar baño; el checkbox no refleja el cambio.

### Pitfall 4: Mezclar "Sugerido" (badge) con "Seleccionado" (borde verde)
**What goes wrong:** Marcar la card sugerida como seleccionada visualmente cuando el usuario eligió
otra; o que el badge "Sugerido" desaparezca al cambiar de modelo.
**Why it happens:** Confundir dos estados visuales distintos.
**How to avoid:** "Sugerido" = pill verde tenue en la card `id===SUGERENCIA_OCUPANTES[ocupantes]`
(persistente, informativo). "Seleccionado" = borde+fondo verde en la card `id===estado.modeloId`.
Son independientes. [CITED: 04-UI-SPEC.md Patrón E]
**Warning signs:** El badge salta de card al seleccionar; o dos cards con borde verde.

### Pitfall 5: Equipamiento de baño guardado en el lugar equivocado
**What goes wrong:** Crear un campo nuevo `bano.equipamiento[]` que Phase 5 (precios) no sabe sumar.
**Why it happens:** Parece más "ordenado" agrupar bajo `bano`.
**How to avoid:** Guardar en `extras[]` usando los ids `inodoro-septica` y `vanitory-espejo` (ya
existen en `EXTRAS` con `categoria:'bano'`), para que Phase 5 los sume sin migración. El reducer ya
tiene `extras: []`. [CITED: 04-UI-SPEC.md Q2 + VERIFIED: extras.js:6-7]
**Warning signs:** Phase 5 necesita migrar el estado; el precio del baño no aparece en el resumen.

### Pitfall 6: Invadir el alcance de Phase 5
**What goes wrong:** Mostrar precios, agregar selección de camas detallada, o cocina/heladera.
**Why it happens:** Los campos `cocina`/`estar`/`dormitorio.camas` ya existen en el estado y tientan.
**How to avoid:** Phase 4 solo escribe `uso`, `ocupantes`, `modeloId`, `bano.tamano` y los 2 extras
de baño. NO mostrar `$`. NO tocar `dormitorio.camas`, `cocina`, `estar`. [CITED: ROADMAP Phase 5]
**Warning signs:** Aparece un total/precio; aparecen controles de cama o de cocina en estos pasos.

## Code Examples

### Cambio mínimo para BANO-03 en `floorplanLayout.js`
```js
// Source: floorplanLayout.js (estado actual lines 21-23, 66-70) + ruta de cambio
// ANTES (line 21): const RATIO_BANO = 0.22  // fijo, ignora bano.tamano
// DESPUÉS — parametrizar el ratio del baño por tamaño:
const RATIO_BANO_ESTANDAR = 0.22
const RATIO_BANO_AMPLIADO = 0.30   // ≈ sugerido por UI-SPEC; verificar zonas > MINIMO_CENTRAL en N3
const RATIO_DORMITORIO = 0.45      // se mantiene
// RATIO_ESTAR ya no es necesario como constante: el estar absorbe el residuo (patrón existente)

// Dentro de calcularLayout, tras validar config.largo:
const ratioBano =
  config?.bano?.tamano === 'ampliado' ? RATIO_BANO_AMPLIADO : RATIO_BANO_ESTANDAR
const restante = config.largo - GEOMETRIA.zonaBaulera - GEOMETRIA.zonaCocina
const largoBano = restante * ratioBano
const largoDormitorio = restante * RATIO_DORMITORIO
const largoEstar = restante - largoBano - largoDormitorio  // el estar absorbe el residuo → suma exacta
```
> Esto mantiene: orden de zonas inmutable, suma exacta contra `config.largo` (test verde), y la
> transición `.fp-anim` cubre el cambio de ancho sin trabajo extra. `Bathroom.jsx` se reescala solo.

### Selector segmentado (ocupantes / tamaño baño) — Patrón B
```jsx
// Source: 04-UI-SPEC.md Patrón B (clases exactas)
const OCUPANTES = [2, 3, 4, 5, 6, 8]  // USO-02 — opciones fijas del REQUIREMENT
{OCUPANTES.map((n) => {
  const activo = estado.ocupantes === n
  return (
    <button
      key={n}
      type="button"
      aria-pressed={activo}
      onClick={() => elegirOcupantes(n)}
      className={[
        'min-h-[44px] min-w-[44px] rounded px-4 py-2 text-sm transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
        activo
          ? 'border border-impacar-campo bg-impacar-campo/10 font-semibold text-impacar-campo'
          : 'border border-impacar-texto/10 hover:border-impacar-campo/40',
      ].join(' ')}
    >
      {n}
    </button>
  )
})}
```

### Equipamiento de baño (checkbox → toggle en extras[]) — Patrón C
```jsx
// Source: 04-UI-SPEC.md Patrón C + EXTRAS categoria 'bano' (extras.js:6-7)
import { EXTRAS } from '../../../data/extras.js'
const extrasBano = EXTRAS.filter((e) => e.categoria === 'bano')  // data-driven, no hardcodear ids

const toggleExtra = (id) => {
  const yaEsta = estado.extras.includes(id)
  const nuevos = yaEsta ? estado.extras.filter((x) => x !== id) : [...estado.extras, id]
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })  // valor nuevo, no mutado
}

{extrasBano.map((e) => (
  <label key={e.id} className="flex min-h-[44px] items-center gap-3 rounded border ... cursor-pointer">
    <input type="checkbox" checked={estado.extras.includes(e.id)} onChange={() => toggleExtra(e.id)} />
    <span>{e.nombre}</span>
  </label>
))}
```

### Metadatos de card de modelo (DIM-01)
```jsx
// Source: MODELOS (models.js) + copys del UI-SPEC. camasBase===null → "camas a medida"
function metadatosCard(m) {
  const largo = `${m.largo.toFixed(2).replace('.', ',')} m`        // "6,60 m" formato argentino
  const camas = m.camasBase === null ? 'camas a medida' : `${m.camasBase} camas`
  return `${largo} · ${camas} · ideal para ${m.ocupantesIdeal} personas`
}
```

## State of the Art

No aplica un cambio de "estado del arte" en esta fase: el stack y los patrones están congelados
por CLAUDE.md y por las Fases 1-3. No hay tecnología nueva que evaluar.

**Deprecated/outdated:** Nada relevante para esta fase. (Recordatorio del proyecto: Tailwind v4
está prohibido por CLAUDE.md / decisión 01-01 — usar v3 con las 3 directivas `@tailwind`.)

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `RATIO_BANO_AMPLIADO ≈ 0.30` produce zonas centrales válidas en N3 (el modelo más chico que permite ampliado) | Code Examples / BANO-03 | Si 0.30 deja el dormitorio/estar muy chico en N3, hay que bajar el valor. Mitigable con un test que verifique zonas > MINIMO_CENTRAL en N3 ampliado. Valor exacto es discreción de implementación |
| A2 | El equipamiento de baño se guarda en `extras[]` (no en `bano.equipamiento[]`) | Pitfall 5 / Patrón C | Es el default Q2 del UI-SPEC; si el usuario/planner prefiere agruparlo bajo `bano`, Phase 5 deberá sumar desde ahí. Bajo riesgo (UI-SPEC ya lo recomienda) |
| A3 | No hace falta acción nueva en el reducer; `SET_CAMPO` con array completo cubre el toggle de extras | Standard Stack / Patterns | Si se prefiere legibilidad, agregar `TOGGLE_EXTRA` es trivial y no rompe nada. Riesgo nulo |
| A4 | Mantener `extras: string[]` y `bano: { tamano }` evita bumpear la key de localStorage | Runtime State Inventory | Si Phase 4 cambia la forma de esos campos, un estado guardado viejo podría quedar inconsistente (aunque `esEstadoValido` no lo rechazaría). Mantener la forma actual elimina el riesgo |

## Open Questions (RESOLVED)

1. **Valor exacto de `RATIO_BANO_AMPLIADO`**
   - What we know: el UI-SPEC sugiere ≈0.30; el estándar es 0.22; el estar absorbe el residuo.
   - What's unclear: el valor que se vea "claramente más grande" sin comprimir de más el dormitorio.
   - Recommendation: empezar con 0.30, agregar un test que verifique zonas centrales > `MINIMO_CENTRAL`
     en N3 ampliado, y ajustar visualmente. Es discreción de implementación, no bloquea.
   - **RESOLVED:** `RATIO_BANO_AMPLIADO = 0.30` fijado en el plan 04-01 (T3), con test BANO-03 que
     verifica que en N3 ampliado ninguna zona central queda < `MINIMO_CENTRAL`.

2. **¿Acción dedicada `TOGGLE_EXTRA` vs `SET_CAMPO` con array?**
   - What we know: ambas funcionan; el patrón actual del reducer es minimalista (`SET_CAMPO`).
   - What's unclear: preferencia de legibilidad del planner.
   - Recommendation: usar `SET_CAMPO` para no crecer la superficie del reducer; si se agrega
     `TOGGLE_EXTRA`, testearlo en `wizardReducer.test.js`.
   - **RESOLVED:** se usa `SET_CAMPO` (sin acción nueva) en el plan 04-03 (T1), manteniendo el reducer minimalista.

3. **Consistencia de voz plano (tuteo) vs wizard (usted)** — diferida a Phase 7 por el UI-SPEC (Q3).
   No se resuelve acá; no tocar `FloorPlan.jsx`.
   - **RESOLVED (deferred):** decisión documentada — diferida a Phase 7; los planes de Phase 4 no tocan `FloorPlan.jsx`.

## Environment Availability

> Fase de UI/lógica pura sobre un proyecto ya scaffolded. Sin dependencias externas nuevas.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js (+ node:test) | Gate de validación | ✓ | corre `node --test` con 20/20 verde | — |
| npm deps (react, tailwind, vite) | Build/dev | ✓ | fijadas en package-lock | — |
| Vite dev server | Verificación visual | ✓ | ^5.4.0 | — |

**Missing dependencies with no fallback:** Ninguna.
**Missing dependencies with fallback:** Ninguna.

## Validation Architecture

> `workflow.nyquist_validation: true` en config.json → sección incluida. [VERIFIED: config.json]

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` + `node:assert/strict` (built-in Node 18+, sin dependencias) |
| Config file | none — se ejecuta por archivo con `node --test <ruta>` |
| Quick run command | `node --test src/utils/floorplanLayout.test.js` (test del cambio de BANO-03) |
| Full suite command | `node --test src/utils/*.test.js src/state/*.test.js` |

> Nota: no hay script `test` en package.json. El patrón establecido (3 suites existentes) es invocar
> `node --test <archivo>` directamente. **Wave 0 sugiere** agregar `"test": "node --test src/**/*.test.js"`
> a package.json para un comando único (ojo: el glob `**` requiere shell que lo expanda; alternativa
> portable: listar las carpetas `src/utils/*.test.js src/state/*.test.js`).

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BANO-02 | umbral "ampliado" derivado de `MODELOS.largo >= 6.1` (N1/N2 no; N3+ sí) | unit (helper puro) | `node --test src/utils/banoReglas.test.js` | ❌ Wave 0 |
| BANO-03 | `calcularLayout` con `bano.tamano:'ampliado'` agranda la zona baño vs 'estandar' | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (extender) |
| BANO-03 | la suma de largoM sigue === config.largo con baño ampliado | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (extender) |
| BANO-03 | con N3 ampliado ninguna zona central < MINIMO_CENTRAL | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (extender) |
| USO-03 | `SUGERENCIA_OCUPANTES[n]` mapea cada ocupante a un modelo existente | unit | `node --test src/data/models.test.js` | ❌ Wave 0 |
| USO-01/02, DIM-01/02, BANO-01 | render de cards/chips/checkbox y selección visual | manual (visual en dev) | `npm run dev` + inspección a ~375px | n/a (sin React Testing Library en el stack) |

> **Por qué algunos son manual-only:** El proyecto no tiene React Testing Library / jsdom y la
> decisión 01-02 es no agregar dependencias de test. El render de componentes React se valida
> visualmente en dev; la **lógica pura extraída** (reglas de baño, sugerencia, layout) se cubre con
> node:test. Recomendación fuerte: extraer las reglas (umbral de baño, derivación de sugerencia) a
> funciones puras en `/utils` o `/data` para que SÍ sean testeables sin DOM — coherente con el patrón
> existente (toda la geometría vive en helpers puros).

### Sampling Rate
- **Per task commit:** `node --test src/utils/floorplanLayout.test.js` (la suite que toca el cambio de BANO-03).
- **Per wave merge:** `node --test src/utils/*.test.js src/state/*.test.js` (suite completa).
- **Phase gate:** suite completa verde + verificación visual en dev a ~375px antes de `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `src/utils/banoReglas.test.js` (+ extraer `permiteBanoAmpliado(modeloId)` a un helper puro) — cubre BANO-02.
- [ ] `src/data/models.test.js` — verifica que `SUGERENCIA_OCUPANTES` mapea a ids válidos de `MODELOS` (USO-03).
- [ ] Extender `src/utils/floorplanLayout.test.js` con 3 casos de BANO-03 (ampliado>estandar, suma exacta, N3 sin zonas negativas).
- [ ] (Opcional) Script `test` en package.json para un comando único.
- [ ] (Opcional) Si se agrega `TOGGLE_EXTRA`, test en `src/state/wizardReducer.test.js`.

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1`, `security_block_on: high`. [VERIFIED: config.json]
> App estática client-side, sin backend, sin auth, sin red, sin secretos. Superficie de ataque mínima.

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No hay autenticación (sin cuentas — Out of Scope) |
| V3 Session Management | no | No hay sesiones de servidor |
| V4 Access Control | no | No hay recursos protegidos |
| V5 Input Validation | parcial | Inputs son selecciones de un conjunto cerrado (ids de modelo, ocupantes, ids de extra). Validar contra `MODELOS`/`EXTRAS` al leerlos; el estado restaurado de localStorage YA se valida (T-03-01, `esEstadoValido`) |
| V6 Cryptography | no | No se maneja material criptográfico ni datos sensibles |

### Known Threat Patterns for {React SPA estática + localStorage}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| localStorage adulterado (modeloId/extra inexistente inyectado) | Tampering | Al derivar largo/metadatos, usar `MODELOS.find(...)?.` con fallback; `configDesdeEstado` ya deja `largo` undefined → plano cae a Error elegante. NO confiar en que `modeloId` o ids de `extras` sean válidos sin chequear contra los datos. [VERIFIED: wizardReducer.js:84, usePersistedConfig.js:20] |
| XSS vía contenido renderizado | Tampering/Info Disclosure | No hay `dangerouslySetInnerHTML` ni user-generated content libre; todos los textos son literales o vienen de `/data` controlado. Mantener así (no renderizar strings arbitrarios del estado sin escape de React) |
| Config inválida → crash del plano (DoS visual) | DoS | `calcularLayout` ya devuelve `{valido:false}` ante largo imposible y FloorPlan muestra estado Error. Al cambiar el reparto por baño ampliado, mantener esa guarda. [VERIFIED: floorplanLayout.js:57-63] |

> Conclusión de seguridad: ninguna acción nueva bloqueante (`block_on: high`). El único control
> relevante es **validar ids contra los datos** al leer estado potencialmente adulterado de
> localStorage — patrón ya presente, solo hay que no romperlo al agregar las nuevas lecturas.

## Project Constraints (from CLAUDE.md)

Directivas LOCKED que la planificación DEBE respetar (misma autoridad que decisiones lockeadas):

- **Stack:** Vite + React 18 (hooks) + Tailwind CSS v3. Sin backend. NO Tailwind v4.
- **Render del plano:** SVG nativo, sin librerías de dibujo pesadas (→ íconos de uso = SVG inline a mano).
- **Sin backend:** todo client-side; estado en `localStorage` (key `impacar_config_v1`).
- **Idioma:** español argentino, **trato de usted** (UX-03). El tuteo del plano es preexistente y NO se toca en esta fase.
- **Estructura de zonas fija:** baulera 0.60m | baño | dormitorio | estar/comedor | cocina 0.60m. El baño NO cambia de posición (Paso 3 = equipamiento/tamaño, no ubicación).
- **Geometría real:** ancho ext 2.60m, interior 2.52m, camas 0.80m, pasillo 0.92m — toda en `data/geometry.js`, sin hardcodeo en componentes.
- **Precios:** NO en esta fase (PRECIO/Phase 5). Phase 4 no muestra `$`.
- **Identidad visual:** sobria/industrial; paleta y tokens LOCKED (`impacar-fondo/campo/cobre/texto`, `zona-bano/dormitorio/cocina`). No agregar tokens nuevos.
- **Mobile-first ~375px (Samsung 6"):** touch targets ≥44px; el plano colapsable en mobile (ya implementado, no forzar apertura automática).
- **GSD Workflow:** no editar fuera de un comando GSD; los archivos de planificación se commitean (`commit_docs: true`).

## Sources

### Primary (HIGH confidence)
- Lectura directa del repo (verificado por `node --test` 20/20 verde):
  - `src/state/wizardReducer.js`, `src/state/wizardReducer.test.js`
  - `src/hooks/usePersistedConfig.js`
  - `src/components/ConfiguratorWizard.jsx`, `src/components/wizard/pasosRegistro.jsx`, `src/components/wizard/PlanoPanel.jsx`
  - `src/components/FloorPlan.jsx`, `src/components/FloorPlanElements/Bathroom.jsx`
  - `src/utils/floorplanLayout.js`, `src/utils/floorplanLayout.test.js`
  - `src/data/models.js`, `src/data/geometry.js`, `src/data/extras.js`, `src/data/mockConfig.js`
  - `src/styles/index.css`, `package.json`, `.planning/config.json`
- `.planning/phases/04-pasos-1-3-uso-dimensiones-ba-o/04-UI-SPEC.md` — contrato de diseño aprobado (patrones A-E, copys, reglas Q1-Q6)
- `.planning/REQUIREMENTS.md` (USO-01..03, DIM-01..02, BANO-01..03), `.planning/ROADMAP.md` (Phase 4 vs Phase 5), `.planning/STATE.md` (decisiones 01-03)

### Secondary (MEDIUM confidence)
- Ninguna — no se requirió investigación web; el dominio está 100% en el repo.

### Tertiary (LOW confidence)
- Ninguna.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no se agregan dependencias; versiones fijadas en package.json/lock verificadas.
- Architecture: HIGH — el cableado completo (estado→config→plano) leído línea por línea; tests verdes confirman el contrato.
- Pitfalls: HIGH — derivados de la lógica real del layout y de los tests existentes que se romperían.
- BANO-03 (cambio de motor): HIGH en la ruta; MEDIUM solo en el valor exacto del ratio ampliado (A1).

**Research date:** 2026-06-27
**Valid until:** 2026-07-27 (estable — código interno, sin dependencias de versiones externas en movimiento)
