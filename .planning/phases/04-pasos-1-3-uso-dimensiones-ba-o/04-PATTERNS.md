# Phase 4: Pasos 1-3 (Uso, Dimensiones, Baño) - Mapa de Patrones

**Mapeado:** 2026-06-27
**Archivos analizados:** 9 (4 componentes nuevos, 1 helper nuevo, 1 helper modificado, 3 suites de test nuevas/extendidas)
**Análogos encontrados:** 9 / 9

> Esta fase es 90% "conectar UI a estado + motor que ya existen y están probados" (RESEARCH.md
> Code Examples / Key insight). Casi todo tiene un análogo exacto en el repo. La regla general es
> **copiar las clases Tailwind y el contrato de props tal cual**, no inventar estilos ni acciones.

## File Classification

| Archivo nuevo/modificado | Rol | Flujo de datos | Análogo más cercano | Calidad del match |
|--------------------------|-----|----------------|---------------------|-------------------|
| `src/components/wizard/pasos/PasoUso.jsx` (NUEVO) | component (paso) | request-response (lee `estado`, dispara `SET_CAMPO`) | `src/components/wizard/pasosRegistro.jsx` (StubPaso) + `Landing.jsx` (botones) | role-match (no hay paso "real" todavía; el contrato de props sí es exacto) |
| `src/components/wizard/pasos/PasoDimensiones.jsx` (NUEVO) | component (paso) | request-response | mismo que arriba + `BarraProgreso.jsx` (presentacional data-driven) | role-match |
| `src/components/wizard/pasos/PasoBano.jsx` (NUEVO) | component (paso) | request-response + toggle de array | mismo que arriba | role-match |
| `src/components/wizard/cards/CardSeleccionable.jsx` (OPCIONAL) | component (primitiva) | request-response | botones de `ConfiguratorWizard.jsx` + Patrón A del UI-SPEC | role-match |
| `src/components/wizard/cards/ChipSegmento.jsx` (OPCIONAL) | component (primitiva) | request-response | botones de `ConfiguratorWizard.jsx` + Patrón B del UI-SPEC | role-match |
| `src/utils/banoReglas.js` (NUEVO) | utility (helper puro) | transform (derivación pura) | `src/utils/floorplanLayout.js` (helper puro, deriva de `/data`) | exact (mismo rol, mismo estilo de módulo) |
| `src/utils/floorplanLayout.js` (MODIFICADO — BANO-03) | utility (helper puro) | transform (geometría) | sí mismo (cambio quirúrgico de `RATIO_BANO`) | exact (self) |
| `src/utils/banoReglas.test.js` (NUEVO) | test (unit) | — | `src/utils/formato.test.js` (suite de helper puro corta) | exact |
| `src/data/models.test.js` (NUEVO) | test (unit) | — | `src/utils/formato.test.js` + asserts de `wizardReducer.test.js` sobre MODELOS | exact |
| `src/utils/floorplanLayout.test.js` (EXTENDIDO — 3 casos BANO-03) | test (unit) | — | sí mismo (mismo archivo, agregar casos) | exact (self) |

> Nota de estructura (RESEARCH.md "Recommended Project Structure"): la subcarpeta `pasos/` y las
> primitivas `cards/` son **sugerencias**. El patrón existente es archivos sueltos en `wizard/`
> (`pasosRegistro.jsx`, `BarraProgreso.jsx`, `PlanoPanel.jsx`). El planner puede elegir sueltos o
> subcarpeta mientras `pasosRegistro.jsx` siga siendo el contrato de enchufe. Si elige subcarpeta,
> ajustar la profundidad de los imports relativos (`../../../` desde `wizard/pasos/`).

## Pattern Assignments

### `src/components/wizard/pasos/PasoUso.jsx` (component, request-response)

**Análogo:** `src/components/wizard/pasosRegistro.jsx` (contrato de props del stub) + `Landing.jsx` (botón) + Patrón A/B del UI-SPEC.

**Contrato de props heredado** — el paso recibe `{ estado, dispatch }` (cableado en `ConfiguratorWizard.jsx:54`):
```jsx
// El registro inyecta {...props} → {estado, dispatch}. Ver pasosRegistro.jsx:19 y ConfiguratorWizard.jsx:54
import { ACCIONES } from '../../../state/wizardReducer.js'
import { SUGERENCIA_OCUPANTES } from '../../../data/models.js'

export default function PasoUso({ estado, dispatch }) {
  const elegirUso = (uso) =>
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'uso', valor: uso })

  // USO-03: al elegir ocupantes, pre-seleccionar modelo data-driven (NO hardcodear el mapeo).
  const elegirOcupantes = (n) => {
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'ocupantes', valor: n })
    const sugerido = SUGERENCIA_OCUPANTES[n]
    if (sugerido) dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: sugerido })
  }
  // ... grid de cards (Patrón A) + chips (Patrón B) + feedback (Patrón D)
}
```

**Título de paso** — copiar el rol tipográfico del stub existente (`pasosRegistro.jsx:10`):
```jsx
<h2 className="text-xl font-semibold text-impacar-texto">Uso y ocupantes</h2>
```

**Card seleccionable (Patrón A)** — botón con `aria-pressed`, clases EXACTAS del UI-SPEC (NO usar `<div>`):
```jsx
<button
  type="button"
  aria-pressed={seleccionado}
  onClick={() => elegirUso(opcion.id)}
  className={[
    'min-h-[44px] rounded p-4 text-left transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-impacar-campo/40',
    seleccionado
      ? 'border border-impacar-campo bg-impacar-campo/10'
      : 'border border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40 hover:bg-impacar-campo/5',
  ].join(' ')}
>
  {/* SVG inline 24×24, stroke="currentColor" fill="none" strokeWidth="1.5" (UI-SPEC Icon library) */}
</button>
```

**Chip segmentado de ocupantes (Patrón B)** — opciones fijas `[2,3,4,5,6,8]` (USO-02):
```jsx
<button
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
```

**Feedback de sugerencia (Patrón D)** — panel inline, NO toast ni modal:
```jsx
// Copy exacto: "Le sugerimos el modelo {N} para {ocupantes} personas. Lo puede cambiar en el paso siguiente."
<div className="rounded border border-impacar-campo/30 bg-impacar-campo/5 p-3 text-sm text-impacar-texto">
  Le sugerimos el modelo {SUGERENCIA_OCUPANTES[estado.ocupantes]} para {estado.ocupantes} personas. Lo puede cambiar en el paso siguiente.
</div>
```

---

### `src/components/wizard/pasos/PasoDimensiones.jsx` (component, request-response)

**Análogo:** `pasosRegistro.jsx` (props) + `BarraProgreso.jsx` (presentacional data-driven) + Patrón A/E del UI-SPEC.

**Derivar TODO de `MODELOS` (anti-hardcodeo)** — el largo y los metadatos NUNCA se hardcodean:
```jsx
import { MODELOS, SUGERENCIA_OCUPANTES } from '../../../data/models.js'
import { ACCIONES } from '../../../state/wizardReducer.js'
import { permiteBanoAmpliado } from '../../../utils/banoReglas.js'  // helper nuevo (ver abajo)

// Corrección silenciosa Q4: si baja a un modelo que no permite ampliado, forzar 'estandar'.
const elegirModelo = (id) => {
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'modeloId', valor: id })
  if (!permiteBanoAmpliado(id) && estado.bano.tamano === 'ampliado') {
    dispatch({ type: ACCIONES.SET_CAMPO, campo: 'bano', valor: { ...estado.bano, tamano: 'estandar' } })
  }
}
```

**Metadatos de card (DIM-01)** — formato argentino con coma decimal; `camasBase===null → "camas a medida"`:
```jsx
// Patrón de coma decimal heredado de FloorPlan.jsx (metros()). N5/N6/N7 → camasBase null.
function metadatosCard(m) {
  const largo = `${m.largo.toFixed(2).replace('.', ',')} m`          // "6,60 m"
  const camas = m.camasBase === null ? 'camas a medida' : `${m.camasBase} camas`
  return `${largo} · ${camas} · ideal para ${m.ocupantesIdeal} personas`
}
```

**Card de modelo (Patrón A)** — misma estructura de botón que PasoUso; SIN ícono (íconos son solo de uso).

**Badge "Sugerido" (Patrón E)** — pill informativo, INDEPENDIENTE del estado seleccionado (Pitfall 4):
```jsx
// "Sugerido" = pill verde tenue en id===SUGERENCIA_OCUPANTES[ocupantes] (persistente, informativo).
// "Seleccionado" = borde+fondo verde en id===estado.modeloId. SON DOS COSAS DISTINTAS.
const esSugerido = m.id === SUGERENCIA_OCUPANTES[estado.ocupantes]
{esSugerido && (
  <span className="text-xs font-semibold text-impacar-campo bg-impacar-campo/10 rounded-full px-2 py-0.5">
    Sugerido
  </span>
)}
```

**Reflejo en vivo (DIM-02)** — NO pasar props sueltas a FloorPlan. El cableado `configDesdeEstado → PlanoPanel → FloorPlan` ya existe (`ConfiguratorWizard.jsx:18,47`). Solo escribir `modeloId` y el plano reacciona con `.fp-anim`.

---

### `src/components/wizard/pasos/PasoBano.jsx` (component, request-response + toggle de array)

**Análogo:** `pasosRegistro.jsx` (props) + Patrón B/C del UI-SPEC + `EXTRAS` de `data/extras.js`.

**Equipamiento data-driven (Patrón C, BANO-01)** — filtrar `EXTRAS` por `categoria==='bano'`, NO hardcodear ids:
```jsx
import { EXTRAS } from '../../../data/extras.js'
import { ACCIONES } from '../../../state/wizardReducer.js'

const extrasBano = EXTRAS.filter((e) => e.categoria === 'bano')  // → inodoro-septica, vanitory-espejo

// Toggle inmutable en extras[] (Pitfall 3: construir array nuevo, nunca mutar). Pitfall 5: va en
// extras[], NO en bano.equipamiento[], para que Phase 5 lo sume sin migración.
const toggleExtra = (id) => {
  const yaEsta = estado.extras.includes(id)
  const nuevos = yaEsta ? estado.extras.filter((x) => x !== id) : [...estado.extras, id]
  dispatch({ type: ACCIONES.SET_CAMPO, campo: 'extras', valor: nuevos })
}
```

**Checkbox de equipamiento (Patrón C)** — `<label>` con `<input type="checkbox">` asociado (UX-02), área ≥44px:
```jsx
{extrasBano.map((e) => {
  const marcado = estado.extras.includes(e.id)
  return (
    <label
      key={e.id}
      className={[
        'flex min-h-[44px] items-center gap-3 rounded border p-3 cursor-pointer transition-colors',
        marcado ? 'border-impacar-campo bg-impacar-campo/10' : 'border-impacar-texto/10 bg-white/40',
      ].join(' ')}
    >
      <input type="checkbox" checked={marcado} onChange={() => toggleExtra(e.id)} className="accent-[#2D5016]" />
      <span className="text-sm">{e.nombre}</span>
    </label>
  )
})}
```

**Selector de tamaño con disabled (Patrón B, BANO-02)** — `Ampliado` deshabilitado en N1/N2, derivado del helper puro:
```jsx
import { permiteBanoAmpliado } from '../../../utils/banoReglas.js'
const ampliadoHabilitado = permiteBanoAmpliado(estado.modeloId)

// Chip "Ampliado" disabled hereda el patrón disabled de los botones Anterior/Siguiente
// (ConfiguratorWizard.jsx:62,70): disabled:cursor-not-allowed disabled:opacity-40.
<button
  type="button"
  aria-pressed={estado.bano.tamano === 'ampliado'}
  disabled={!ampliadoHabilitado}
  aria-disabled={!ampliadoHabilitado}
  onClick={() => dispatch({ type: ACCIONES.SET_CAMPO, campo: 'bano', valor: { ...estado.bano, tamano: 'ampliado' } })}
  className="min-h-[44px] min-w-[44px] rounded border px-4 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
>
  Ampliado
</button>
// Nota visible cuando deshabilitado: "Disponible desde el modelo N3 (6,10 m) en adelante." (text-xs)
```

---

### `src/utils/banoReglas.js` (utility, helper puro — NUEVO)

**Análogo:** `src/utils/floorplanLayout.js` (helper puro que deriva de `/data`, sin hardcodeo).

**Estructura del módulo a replicar** (comentario de cabecera + constante nombrada + función pura que lee `MODELOS`):
```js
// Reglas de habilitación del baño (BANO-02). Helper PURO y testeable sin DOM.
// El umbral se deriva del REQUIREMENT (N3 = 6,10 m); NO se hardcodea una lista de ids de modelo
// (gate anti-hardcodeo de fases previas). Fuente de verdad del largo: src/data/models.js.
import { MODELOS } from '../data/models.js'

// Largo mínimo (m) que habilita "baño ampliado": N3=6,1. Constante nombrada, no lista de ids.
export const LARGO_MIN_BANO_AMPLIADO = 6.1

export function permiteBanoAmpliado(modeloId) {
  const modelo = MODELOS.find((m) => m.id === modeloId)
  return (modelo?.largo ?? 0) >= LARGO_MIN_BANO_AMPLIADO   // N1/N2 → false; N3+ → true
}
```
> Patrón clave heredado de `floorplanLayout.js`: usar `MODELOS.find(...)?.largo ?? 0` para tolerar
> un `modeloId` adulterado de localStorage (Security Domain → Tampering) sin crashear.

---

### `src/utils/floorplanLayout.js` (utility, helper puro — MODIFICADO, BANO-03)

**Análogo:** sí mismo. Cambio QUIRÚRGICO: parametrizar solo `RATIO_BANO` por `config.bano.tamano`.

**Estado actual a cambiar** (líneas 21-23 y 66-70 — ya leídas):
```js
// ACTUAL (línea 21): const RATIO_BANO = 0.22  // fijo, ignora bano.tamano
```

**Cambio a aplicar** (mantener el patrón "el estar absorbe el residuo" → suma exacta, Pitfall 1):
```js
// Reemplazar la constante fija RATIO_BANO por dos ratios + selección por tamaño.
const RATIO_BANO_ESTANDAR = 0.22
const RATIO_BANO_AMPLIADO = 0.30   // ≈ sugerido UI-SPEC; verificar zonas > MINIMO_CENTRAL en N3 (Pitfall 2)
const RATIO_DORMITORIO = 0.45      // se mantiene
// RATIO_ESTAR ya NO se usa como constante: el estar absorbe el residuo (patrón existente líneas 69-70).

// Dentro de calcularLayout, tras validar config.largo (después de la línea 63):
const ratioBano =
  config?.bano?.tamano === 'ampliado' ? RATIO_BANO_AMPLIADO : RATIO_BANO_ESTANDAR
const restante = config.largo - GEOMETRIA.zonaBaulera - GEOMETRIA.zonaCocina
const largoBano = restante * ratioBano
const largoDormitorio = restante * RATIO_DORMITORIO
const largoEstar = restante - largoBano - largoDormitorio  // estar absorbe el residuo → suma exacta
```
> NO tocar `FloorPlan.jsx` ni `Bathroom.jsx`: `Bathroom.jsx` deriva sus piezas del rect recibido
> (`Bathroom.jsx:4-11`) y se reescala solo; la transición de ancho la cubre `.fp-anim` (ya en el rect).
> NO romper la guarda `{valido:false}` de las líneas 57-63.

---

### `src/utils/banoReglas.test.js` (test, unit — NUEVO)

**Análogo:** `src/utils/formato.test.js` (suite corta de helper puro, node:test ESM-native).

**Cabecera + imports a replicar** (exactamente el patrón de `formato.test.js:1-6`):
```js
// Tests del helper de reglas de baño (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/utils/banoReglas.test.js
// Codifica el <behavior> de BANO-02 (umbral ampliado derivado de MODELOS.largo >= 6.1).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { permiteBanoAmpliado, LARGO_MIN_BANO_AMPLIADO } from './banoReglas.js'

test('permiteBanoAmpliado: N1/N2 (< 6,1 m) → false', () => {
  assert.equal(permiteBanoAmpliado('N1'), false)
  assert.equal(permiteBanoAmpliado('N2'), false)
})
test('permiteBanoAmpliado: N3..N7 (>= 6,1 m) → true', () => {
  for (const id of ['N3', 'N4', 'N5', 'N6', 'N7']) assert.equal(permiteBanoAmpliado(id), true)
})
test('permiteBanoAmpliado: modeloId inexistente → false (tolera estado adulterado)', () => {
  assert.equal(permiteBanoAmpliado('ZZ'), false)
})
```

---

### `src/data/models.test.js` (test, unit — NUEVO)

**Análogo:** `formato.test.js` (estructura de suite) + los asserts sobre `MODELOS` en `wizardReducer.test.js:104-119`.

**Patrón a replicar** (verificar que `SUGERENCIA_OCUPANTES` mapea a ids reales de `MODELOS`, USO-03):
```js
// Tests de los datos de modelos (node:test). Ejecutar: node --test src/data/models.test.js
// Codifica USO-03: SUGERENCIA_OCUPANTES mapea cada ocupante a un id existente de MODELOS.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MODELOS, SUGERENCIA_OCUPANTES } from './models.js'

test('SUGERENCIA_OCUPANTES: cada valor es un id existente en MODELOS', () => {
  const ids = new Set(MODELOS.map((m) => m.id))
  for (const [ocupantes, id] of Object.entries(SUGERENCIA_OCUPANTES)) {
    assert.ok(ids.has(id), `ocupantes ${ocupantes} → ${id} debe existir en MODELOS`)
  }
})
```

---

### `src/utils/floorplanLayout.test.js` (test, unit — EXTENDIDO, 3 casos BANO-03)

**Análogo:** sí mismo. Agregar 3 casos al final del archivo, reutilizando `CONFIG_MOCK_*` y el patrón de `TOL`/`reduce` ya presente (líneas 10, 46-50).

**Casos a agregar** (derivados de Phase Requirements → Test Map del RESEARCH.md):
```js
import { CONFIG_MOCK_N3 } from '../data/mockConfig.js'  // verificar que exista; si no, construir {largo:6.1, bano:{...}}

// BANO-03: ampliado agranda la zona baño vs estandar.
test('BANO-03: bano ampliado da largoBano mayor que estandar (mismo modelo)', () => {
  const base = { ...CONFIG_MOCK_N4 }
  const est = calcularLayout({ ...base, bano: { tamano: 'estandar' } })
  const amp = calcularLayout({ ...base, bano: { tamano: 'ampliado' } })
  const bEst = est.zonas.find((z) => z.id === 'bano').largoM
  const bAmp = amp.zonas.find((z) => z.id === 'bano').largoM
  assert.ok(bAmp > bEst, `ampliado (${bAmp}) > estandar (${bEst})`)
})

// BANO-03: la suma sigue cerrando exacta con baño ampliado (Pitfall 1).
test('BANO-03: con baño ampliado la suma de largoM === config.largo', () => {
  const { zonas } = calcularLayout({ ...CONFIG_MOCK_N4, bano: { tamano: 'ampliado' } })
  const suma = zonas.reduce((acc, z) => acc + z.largoM, 0)
  assert.ok(Math.abs(suma - CONFIG_MOCK_N4.largo) < TOL, `suma=${suma}`)
})

// BANO-03: N3 (el más chico que permite ampliado) sin zonas centrales degeneradas (Pitfall 2).
test('BANO-03: N3 ampliado deja las 3 zonas centrales con largoM positivo', () => {
  const { zonas } = calcularLayout({ largo: 6.1, bano: { tamano: 'ampliado' }, dormitorio: { camas: [] } })
  for (const id of ['bano', 'dormitorio', 'estar']) {
    assert.ok(zonas.find((z) => z.id === id).largoM > 0, `${id} > 0`)
  }
})
```
> Si `MINIMO_CENTRAL` se vuelve exportable, comparar contra él en vez de `> 0` (más estricto).

---

## Shared Patterns

### Contrato de props del paso (request-response)
**Fuente:** `ConfiguratorWizard.jsx:54` (`<Paso.Componente estado={estado} dispatch={dispatch} />`) + `pasosRegistro.jsx:19`.
**Aplica a:** los 3 componentes de paso.
```jsx
// Todo paso recibe { estado, dispatch }. La ÚNICA acción para escribir config es SET_CAMPO.
// NO crear acciones nuevas (RESEARCH.md: SET_CAMPO con valor completo ya cubre todo, incluido el toggle de extras).
dispatch({ type: ACCIONES.SET_CAMPO, campo: '<clave>', valor: <valorNuevo> })
```

### Enchufe en el registro de pasos
**Fuente:** `pasosRegistro.jsx:18-25` (array `PASOS`, contrato de enchufe SHELL-02).
**Aplica a:** los 3 pasos — reemplazar el `Componente` de las entradas `'uso'`, `'dimensiones'`, `'bano'` SIN tocar la cáscara del wizard:
```jsx
import PasoUso from './pasos/PasoUso.jsx'
import PasoDimensiones from './pasos/PasoDimensiones.jsx'
import PasoBano from './pasos/PasoBano.jsx'
// { id: 'uso', titulo: 'Uso y ocupantes', Componente: PasoUso },  ← reemplaza el StubPaso
```

### Inmutabilidad al escribir objetos/arrays (Pitfall 3)
**Fuente:** `wizardReducer.js:64-65` (`SET_CAMPO` reemplaza la clave entera con `accion.valor`).
**Aplica a:** cualquier escritura de `bano` (objeto) o `extras` (array).
```jsx
// SIEMPRE construir un valor nuevo, nunca mutar el existente:
{ ...estado.bano, tamano }                          // objeto
[...estado.extras, id]  /  estado.extras.filter(...) // array
```

### Botón seleccionable / disabled (clases Tailwind heredadas)
**Fuente:** botones de `ConfiguratorWizard.jsx:62,70` (disabled) + `Landing.jsx:19` (primario) + Patrón A/B del UI-SPEC.
**Aplica a:** todas las cards, chips y el toggle de tamaño.
```
seleccionado: border-impacar-campo bg-impacar-campo/10  (+ font-semibold text-impacar-campo en chips)
neutro:       border-impacar-texto/10 bg-white/40 hover:border-impacar-campo/40 hover:bg-impacar-campo/5
foco:         focus:outline-none focus:ring-2 focus:ring-impacar-campo/40
disabled:     disabled:cursor-not-allowed disabled:opacity-40
touch target: min-h-[44px] (min-w-[44px] en chips)
```
> NO agregar tokens de color nuevos. El verde `impacar-campo` es accent EXCLUSIVO de selección/foco
> (UI-SPEC "Color"). Una card no seleccionada es neutra.

### Derivación data-driven (anti-hardcodeo)
**Fuente:** `wizardReducer.js:84` (`MODELOS.find(...)?.largo`) + `floorplanLayout.js` (lee `GEOMETRIA`).
**Aplica a:** sugerencia (`SUGERENCIA_OCUPANTES`), umbral de baño (`MODELOS.largo`), equipamiento (`EXTRAS.filter`).
```jsx
// NUNCA hardcodear largos, lista de modelos, ni ids de extras en un componente.
// Leer siempre de /data. El gate anti-hardcodeo (grep en verify) lo marca.
MODELOS.find((m) => m.id === id)?.largo ?? 0      // tolera estado adulterado de localStorage
EXTRAS.filter((e) => e.categoria === 'bano')      // ids de equipamiento de baño
SUGERENCIA_OCUPANTES[n]                            // mapeo ocupantes→modelo
```

### Estructura de suite node:test (helper puro)
**Fuente:** `formato.test.js:1-6` + `floorplanLayout.test.js:1-10`.
**Aplica a:** `banoReglas.test.js`, `models.test.js`, casos nuevos de `floorplanLayout.test.js`.
```js
import { test } from 'node:test'
import assert from 'node:assert/strict'
// cabecera con: propósito + "Ejecutar: node --test <ruta>" + req que codifica
// usar TOL = 1e-9 para comparaciones de float (patrón floorplanLayout.test.js:10)
```

### Reflejo en vivo del plano (cableado existente)
**Fuente:** `ConfiguratorWizard.jsx:18,47` (`configDesdeEstado(estado) → PlanoPanel`) + `.fp-anim` en `styles/index.css`.
**Aplica a:** Paso 2 (modelo) y Paso 3 (tamaño de baño).
```
NO pasar props sueltas a FloorPlan. Solo escribir el estado correcto (modeloId / bano.tamano)
y el plano reacciona solo con la transición de 300ms. NO forzar apertura del plano en mobile (Q5).
```

## No Analog Found

Ninguno. Todos los archivos de la fase tienen análogo en el repo (es una extensión, no greenfield):
- Componentes de paso → contrato de props heredado (`pasosRegistro.jsx` + `ConfiguratorWizard.jsx`) + clases del UI-SPEC.
- Helper puro `banoReglas.js` → mismo patrón que `floorplanLayout.js`.
- Suites de test → mismo patrón que las 3 suites node:test existentes.
- BANO-03 → cambio sobre el propio `floorplanLayout.js`.

## Metadata

**Análogos buscados en:** `src/components/`, `src/components/wizard/`, `src/utils/`, `src/state/`, `src/data/`.
**Archivos leídos (análogos):** `pasosRegistro.jsx`, `BarraProgreso.jsx`, `ConfiguratorWizard.jsx`, `Landing.jsx`, `FloorPlanElements/Bathroom.jsx`, `floorplanLayout.js` (+ `.test.js`), `wizardReducer.js` (+ `.test.js`), `models.js`, `extras.js`, `geometry.js`, `formato.test.js`.
**Fecha de extracción:** 2026-06-27
