# Fase 6: Resumen y Exportación - Mapa de Patrones

**Mapeado:** 2026-06-27
**Archivos analizados:** 16 (8 nuevos + 4 tests nuevos + 4 modificados)
**Análogos encontrados:** 16 / 16 (cobertura total — la fase es 70% reuso, ver RESEARCH "Don't Hand-Roll")

> **Nota para el planner:** este es un mapa *copy-ready*. Cada bloque cita el archivo análogo con
> números de línea reales y excerpts verbatim del código en disco. La regla del proyecto es
> **anti-hardcodeo** (leer de `/data`, formatear con `formato.js`, una sola fuente de la suma) y
> **trato de usted** en el 100% del copy. No reinventar estilos: todo token/clase ya existe en Fases 3-5.

---

## File Classification

| Archivo nuevo/modificado | Rol | Flujo de datos | Análogo más cercano | Calidad del match |
|--------------------------|-----|----------------|---------------------|-------------------|
| `src/data/contacto.js` | config / data | transform (constantes) | `src/data/financiacion.js` | exacto (mismo shape de objeto exportado) |
| `src/utils/resumenCampos.js` | utility (puro) | transform (estado→labels) | `src/state/wizardReducer.js` `configDesdeEstado` + `PasoUso`/`PasoDormitorio`/`PasoBano` (mapeos UI) | role-match fuerte |
| `src/utils/exportWhatsApp.js` | utility (puro) | transform (estado→string/URL) | `src/utils/formato.js` (estilo pure-util) | role-match |
| `src/utils/exportPDF.js` | utility (puro `nombreArchivoPDF` + browser `generarPDF`) | file-I/O (descarga) + transform | `formato.js` (parte pura) · sin análogo browser-side | parcial (la parte pura sí; el handler PDF es nuevo) |
| `src/utils/motorPrecios.js` (MOD) | service (puro) | transform (compone sobre suma existente) | `calcularPresupuesto` en el MISMO archivo | exacto |
| `src/components/Resumen.jsx` | component (shell) | request-response (lee estado, no muta) | `ConfiguratorWizard.jsx` (chrome) + `Landing.jsx` (container full-width) | role-match |
| `src/components/resumen/ConfigSecciones.jsx` | component | transform (data-driven render + IR_A_PASO) | `PasoExtras.jsx` (data-driven map) + nav del wizard (IR_A_PASO) | role-match |
| `src/components/resumen/PresupuestoDesglosado.jsx` | component | transform (items→render agrupado) | `BarraPrecio.jsx` (markup neto/IVA/Total verbatim) + `PasoExtras` (agrupación subgrupo) | exacto (markup de totales) |
| `src/components/resumen/BloqueFinanciacion.jsx` | component | transform (FINANCIACION.map) | `PasoExtras.jsx` (.map de /data en cards) | role-match |
| `src/components/resumen/AccionesExport.jsx` | component | event-driven (click → wa.me / PDF) | botones nav de `ConfiguratorWizard.jsx` (primario/outline) + link "Volver a empezar" | exacto (estilos de botón) |
| `src/utils/motorPrecios.test.js` (MOD) | test (puro) | — | el mismo archivo (tests existentes) | exacto |
| `src/utils/resumenCampos.test.js` | test (puro) | — | `formato.test.js` / `motorPrecios.test.js` (node:test) | exacto |
| `src/utils/exportWhatsApp.test.js` | test (puro) | — | `motorPrecios.test.js` | exacto |
| `src/utils/exportPDF.test.js` | test (puro, solo `nombreArchivoPDF`) | — | `formato.test.js` | exacto |
| `src/App.jsx` (MOD) | component (ruteo) | request-response | el mismo archivo (ruteo landing/wizard) | exacto |
| `src/components/ConfiguratorWizard.jsx` (MOD) | component | event-driven (botón salida) | el mismo archivo (callback `onVolverInicio`, botón "Siguiente") | exacto |
| `package.json` (MOD) | config | — | el mismo archivo (script `test`, `dependencies`) | exacto |

---

## Pattern Assignments

### `src/data/contacto.js` (data, transform) — NUEVO

**Análogo:** `src/data/financiacion.js` (objeto/array de constantes con comentario explicativo arriba)

`financiacion.js` completo (estructura a imitar — objeto exportado con comentario de contexto):
```javascript
// Opciones de financiación orientativas (se muestran en el resumen — Phase 6).
// Sin montos definidos por la fábrica todavía; el asesor comercial confirma condiciones.
export const FINANCIACION = [
  { id: 'contado', nombre: 'Pago contado', detalle: 'Precio de lista, sujeto a confirmación del asesor.' },
  ...
]
```

**Contenido a crear** (valores ya fijados en CONTEXT D-08/D-13 y RESEARCH "Code Examples"):
```javascript
// src/data/contacto.js — fuente única de contacto (wa.me + PDF). CONTEXT D-08/D-13.
export const CONTACTO = {
  // wa.me: SOLO dígitos, código país (54) + 9, sin '+' ni espacios.
  whatsapp: '5492954555113', // ACTIVO (pruebas, Ignacio). PRODUCCIÓN antes del go-live: 5492302468754 (Impacar)
  whatsappDisplay: '+54 9 2954 55-5113', // para mostrar legible en el PDF
  web: 'industriaimpacar.com',
  instagram: '@industriasimpacar',
  ciudad: 'General Pico, La Pampa',
}
```
**Crítico:** documentar AMBOS números (activo en la constante + producción en el comentario), D-08.

---

### `src/utils/motorPrecios.js` → añadir `detallePresupuesto(estado)` (service puro, transform) — MODIFICAR

**Análogo:** `calcularPresupuesto` en el MISMO archivo (`src/utils/motorPrecios.js:10-19`).

`calcularPresupuesto` existente (la función sobre la que se COMPONE — NO reescribir):
```javascript
import { MODELOS } from '../data/models.js'
import { EXTRAS } from '../data/extras.js'
import { calcularIVA, calcularTotal } from './formato.js'

export function calcularPresupuesto(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const base = modelo?.precioNeto ?? 0 // modeloId inválido/ausente → base 0 (no crashea)
  const ids = Array.isArray(estado?.extras) ? estado.extras : [] // no-array → suma 0
  const sumaExtras = EXTRAS
    .filter((e) => ids.includes(e.id)) // ids inexistentes se ignoran
    .reduce((acc, e) => acc + e.precioNeto, 0)
  const neto = base + sumaExtras
  return { neto, iva: calcularIVA(neto), total: calcularTotal(neto) }
}
```

**Patrón clave a replicar en `detallePresupuesto`:**
- `MODELOS.find((m) => m.id === estado?.modeloId)` — misma búsqueda tolerante con `?.`
- `Array.isArray(estado?.extras) ? estado.extras : []` — mismo guard anti-tampering
- `EXTRAS.filter((e) => ids.includes(e.id))` — mismo filtrado, conservando el ORDEN de `EXTRAS`
- **Los totales NO se re-suman:** `const { neto, iva, total } = calcularPresupuesto(estado)` (una sola
  fuente — Pitfall "re-sumar diverge del total de BarraPrecio"; ver RESEARCH Pattern 1).
- Cada ítem lleva `{ id, label, precioNeto, categoria, subgrupo }` para que S4 agrupe por
  `categoria`/`subgrupo` (los metadatos vienen de `EXTRAS`, ver `extras.js:7-25`).
- Modelo ausente → ítem base `{ label: 'Modelo no disponible', precioNeto: 0, categoria: 'modelo' }`
  (degradación elegante, UI-SPEC error fallback). RESEARCH Pattern 1 trae el cuerpo completo de la fn.

**Datos reales para los labels** (de `models.js:5-13`): `MODELOS[i].nombre` (ej. `'N4'`) y `largo`
(Number, ej. `6.6` → mostrar `'6,6 m'`, coma decimal como hace `FloorPlan.metros` en `FloorPlan.jsx:20-22`).

---

### `src/utils/resumenCampos.js` (utility puro, transform) — NUEVO

**Análogo principal:** `configDesdeEstado` en `src/state/wizardReducer.js:89-105` (proyección pura del
estado, tolerante a tampering). **Análogos de mapeo id→label:** los conjuntos de UI de los pasos.

`configDesdeEstado` (patrón de proyección pura + guards):
```javascript
export function configDesdeEstado(estado) {
  const largo = MODELOS.find((m) => m.id === estado.modeloId)?.largo
  const extras = Array.isArray(estado.extras) ? estado.extras : []
  const heladera = extras.includes('heladera-220')
    ? 'heladera-220'
    : extras.includes('heladera-12v')
      ? 'heladera-12v'
      : null
  return { modeloId: estado.modeloId, largo, bano: estado.bano, dormitorio: estado.dormitorio,
           cocina: { horno: extras.includes('cocina-horno'), heladera },
           estar: { mesa: extras.includes('mesa-cano') } }
}
```

**Mapeos id→nombre real a reusar (NO recrear los strings — leer de los mismos sitios que los pasos):**

- **Uso** (`PasoUso.jsx:9-15`) — el array `USOS` con `{ id, label }` (contratista/ganadero/agrícola/
  vivienda/otro). `resumenCampos` traduce `estado.uso` → `label`. Estos labels son "conjunto de UI",
  no `/data`; el planner decide si los mueve a un módulo compartido o los duplica con una nota.
- **Modelo + largo** (`models.js:5-13`): `MODELOS.find(...).nombre` + `largo` con coma decimal.
- **Baño tamaño** (`PasoBano.jsx:78-101`): `estado.bano.tamano` es `'estandar'|'ampliado'` → labels
  `Estándar` / `Ampliado` (copy verbatim de los botones).
- **Camas C/S/M** (`PasoDormitorio.jsx:17-21`): el array `TIPOS` con `{ tipo, label, singular }`
  (`Cucheta marinera (C)`, `Cama simple (S)`, `Matrimonial (M)`). Contar por tipo con
  `camas.filter((c) => c.tipo === t).length` (mismo `contar` de `PasoDormitorio.jsx:27`).
- **Cocina/heladera/mesa**: derivar de `extras` como `configDesdeEstado` (`wizardReducer.js:92-104`)
  o leer nombres de `EXTRAS` (`extras.js`): `cocina-horno`, `heladera-220`/`heladera-12v`, `mesa-cano`.
- **Extras (confort/energía)**: `EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.nombre)`.

**Patrón de degradación (UI-SPEC "Empty section value" + Pitfall 7):** campo faltante/null →
`'Sin selección'`, **nunca** `undefined`/blanco. Usar `Array.isArray` + optional chaining como
`configDesdeEstado`. `estado.uso`/`estado.ocupantes` arrancan `null` en `estadoInicial`
(`wizardReducer.js:25-26`).

---

### `src/utils/exportWhatsApp.js` (utility puro, transform) — NUEVO

**Análogo de estilo:** `src/utils/formato.js` (módulo de funciones puras, sin React/DOM, imports al tope).

`formato.js` (patrón pure-util: imports de `/data`, funciones exportadas, guards numéricos):
```javascript
import { IVA } from '../data/geometry.js'
export function formatPrecio(n) { ... }
export function calcularIVA(neto) { return (Number(neto) || 0) * IVA }
```

**Estructura concreta** (RESEARCH Pattern 2 trae el cuerpo verbatim — copiar de ahí):
```javascript
import { CONTACTO } from '../data/contacto.js'
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { resumenCampos } from './resumenCampos.js'

export function mensajeWhatsApp(estado) {
  const { total } = detallePresupuesto(estado)
  const c = resumenCampos(estado)
  return [ /* líneas multilínea, trato de usted, termina con recordatorio del PDF (D-10) */ ].join('\n')
}
export function linkWhatsApp(estado) {
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(estado))}`
}
```

**Crítico:**
- Número SIEMPRE de `CONTACTO.whatsapp` (D-08, nunca literal en JSX).
- `formatPrecio(total)` para la cifra (nunca `.toLocaleString` ad-hoc).
- `encodeURIComponent` sobre TODO el `text` (V5 output encoding; `\n`→`%0A`).
- Última línea = recordatorio PDF (`Le envío aparte el PDF con el plano y el detalle.`, D-10).
- **Trato de usted** (gate anti-voseo en test, patrón Fase 3 — ver test map abajo).

---

### `src/utils/exportPDF.js` (utility: `nombreArchivoPDF` puro + `generarPDF` browser, file-I/O) — NUEVO

**Análogo de la parte pura:** `formato.js` (función pura testeable).
**La parte browser (`generarPDF`) no tiene análogo en el repo** — es código nuevo de riesgo; RESEARCH
Pattern 3 trae el cuerpo completo verbatim (import dinámico de `jspdf` + `svg2pdf.js`, A4 `'p','mm','a4'`,
`await doc.svg(svgNode, {x,y,width,height})`, `doc.save(nombreArchivoPDF(estado))`).

**Parte pura (testeable, copy-ready de RESEARCH):**
```javascript
export function nombreArchivoPDF(estado) {
  return `presupuesto-impacar-${estado?.modeloId ?? 'sin-modelo'}.pdf`
}
```

**Crítico del handler browser (RESEARCH Pitfalls 1-4):**
- `await doc.svg(...)` ANTES de `doc.save` (es async; guardar antes → PDF sin plano).
- Pasar el **nodo SVG vivo** del plano del resumen (vía `ref`/`querySelector('svg')`), no un string.
- Derivar `height` del `viewBox` real para no deformar (`svgNode.viewBox.baseVal`).
- Logo IMPACAR = `doc.text('IMPACAR', M, 20)` en Helvetica bold (placeholder, D-12); Inter NO se registra.
- Contacto al pie leído de `CONTACTO` (`whatsappDisplay`, `web`, `instagram`, `ciudad`), D-13.
- Cifras con `formatPrecio`.

El SVG vivo lo provee `FloorPlan.jsx` (su `<svg viewBox={layout.viewBox} width="100%">`, líneas 130-137),
montado en el resumen igual que en `PlanoPanel.jsx:15-19` (wrapper card + `<FloorPlan config={...} />`).

---

### `src/components/Resumen.jsx` (component shell, request-response) — NUEVO

**Análogo de chrome:** `ConfiguratorWizard.jsx:37-44` (header band + page chrome).
**Análogo de container full-width:** `Landing.jsx:5-6` (`min-h-screen ... px-6 py-12` + container centrado).

Chrome del wizard a reusar (header IMPACAR + fondo de página):
```jsx
<div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
  <header className="bg-impacar-campo px-6 py-4 text-white">
    <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
    <p className="text-sm opacity-90">Configurador de casillas rurales</p>
  </header>
  <main className="mx-auto max-w-5xl p-6"> ... </main>
</div>
```

**Container del resumen (UI-SPEC S1):** `mx-auto max-w-3xl px-6 py-12` (más angosto que el wizard
`max-w-5xl` — una sola columna legible). Ritmo vertical: título → subtítulo → plano → secciones →
presupuesto → financiación → acciones → "Volver a editar"; bloques separados por `mt-8`.

**Ref para el PDF** (RESEARCH "Code Examples" / Pattern 3):
```jsx
const planoRef = useRef(null)
// <div ref={planoRef} className="rounded border border-impacar-texto/10 bg-white/40 p-4"><FloorPlan config={configDesdeEstado(estado)} /></div>
// handler: await generarPDF(planoRef.current.querySelector('svg'), estado)
```

**Props/contrato:** recibe `{ estado, dispatch, onVolverEditar }` (análogo a `onVolverInicio` del wizard).
**Empty state** (UI-SPEC): si `modeloId`/`uso`/`ocupantes` son null → heading `Todavía no hay una
configuración completa` (patrón de `FloorPlan.EstadoEmpty`, `FloorPlan.jsx:25-34`).

---

### `src/components/resumen/PresupuestoDesglosado.jsx` (component, transform) — NUEVO

**Análogo del markup de totales (VERBATIM — UI-SPEC S4 lo exige idéntico):** `BarraPrecio.jsx:8-29`.

`BarraPrecio` completo (las 3 líneas Neto/IVA/Total c/IVA a copiar tal cual):
```jsx
import { calcularPresupuesto } from '../../utils/motorPrecios.js'
import { formatPrecio } from '../../utils/formato.js'

export default function BarraPrecio({ estado }) {
  const { neto, iva, total } = calcularPresupuesto(estado)
  return (
    <div className="rounded border border-impacar-texto/10 bg-impacar-fondo p-4">
      <p className="text-xs text-impacar-texto/70">Presupuesto estimado</p>
      <dl className="mt-2 space-y-1">
        <div className="flex items-center justify-between">
          <dt className="text-sm">Neto</dt>
          <dd className="text-sm">{formatPrecio(neto)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm text-impacar-texto/70">IVA 21%</dt>
          <dd className="text-sm text-impacar-texto/70">{formatPrecio(iva)}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-sm font-semibold text-impacar-campo">Total c/IVA</dt>
          <dd className="text-sm font-semibold text-impacar-campo">{formatPrecio(total)}</dd>
        </div>
      </dl>
    </div>
  )
}
```

**Diferencias para el resumen (UI-SPEC S4):**
- Consume `detallePresupuesto(estado)` (no `calcularPresupuesto`) → `{ items, neto, iva, total }`.
- Header promovido a `text-xl font-semibold` (BarraPrecio usa `text-xs`; el resumen es la presentación full).
- Línea base del modelo + líneas de accesorios **agrupadas por categoría** (`flex justify-between`,
  nombre `text-sm` izq + `formatPrecio` der, items indentados `pl-3`).
- Subheaders de grupo `text-xs font-semibold text-impacar-campo` (mismo estilo que `PasoExtras.jsx:41`).
- Omitir grupos vacíos. Las 3 líneas finales = markup VERBATIM de arriba.
- Nota orientativa bajo el total: `text-xs text-impacar-texto/70` — `Presupuesto orientativo, sujeto a
  confirmación del asesor comercial.`

**Análogo de la agrupación data-driven:** `PasoExtras.jsx:37-71` (`.map` sobre grupos filtrando por
`subgrupo`). RESEARCH "Code Examples" trae el array `GRUPOS` con los matchers por `categoria`/`subgrupo`.

---

### `src/components/resumen/ConfigSecciones.jsx` (component, transform + IR_A_PASO) — NUEVO

**Análogo de card + render data-driven:** `PasoExtras.jsx` (cards `rounded border ... bg-white/40 p-4`).
**Análogo del deep-link:** la acción `IR_A_PASO` (`wizardReducer.js:40,69-70`) + índices de
`pasosRegistro.jsx:12-19`.

Card estándar (de la `<section>` del wizard, `ConfiguratorWizard.jsx:64`):
```jsx
<section className="rounded border border-impacar-texto/10 bg-white/40 p-4">
```

**Deep-link "Editar" por sección (D-02):** dispatch `IR_A_PASO` al índice del paso + cambiar
`vista='wizard'`. Índices reales (de `pasosRegistro.jsx`):
| Sección resumen | índice paso | id |
|-----------------|-------------|-----|
| Uso y ocupantes | 0 | `uso` |
| Modelo | 1 | `dimensiones` |
| Baño | 2 | `bano` |
| Dormitorio | 3 | `dormitorio` |
| Cocina y estar | 4 | `cocina` |
| Extras | 5 | `extras` |

```jsx
import { ACCIONES } from '../../state/wizardReducer.js'
// onEditar(indice): dispatch({ type: ACCIONES.IR_A_PASO, paso: indice }); onVolverEditar()
```

**Estilo del link "Editar" (UI-SPEC S3):** `text-sm font-medium text-impacar-campo`, `ml-auto`,
`min-h-[44px]`, `underline-offset-2 hover:underline focus:ring-2 focus:ring-impacar-campo/40` —
mismo tratamiento que el link "Volver a empezar" de `ConfiguratorWizard.jsx:88-94`.

**Valores:** vienen de `resumenCampos(estado)`; valor faltante → `Sin selección` (nunca blanco).
Render data-driven como `PasoExtras.jsx:37-71` (header `text-xl font-semibold` + filas `space-y-2`).

---

### `src/components/resumen/BloqueFinanciacion.jsx` (component, transform) — NUEVO

**Análogo:** `PasoExtras.jsx:37-69` (`.map` de un array de `/data` en cards) leyendo `FINANCIACION`.

`FINANCIACION` (de `financiacion.js:3-7`) — `.map` directo, sin hardcodear:
```javascript
export const FINANCIACION = [
  { id: 'contado', nombre: 'Pago contado', detalle: 'Precio de lista, sujeto a confirmación del asesor.' },
  { id: 'financiado', nombre: 'Financiación en cuotas', detalle: 'Planes de pago a convenir con el asesor comercial.' },
  { id: 'permuta', nombre: 'Permuta / entrega', detalle: 'Se aceptan permutas a evaluar por la fábrica.' },
]
```

**UI-SPEC S5:** card header `Opciones de financiación` (`text-xl font-semibold`); `FINANCIACION.map` →
cada opción `nombre` en `text-sm font-semibold` + `detalle` en `text-sm text-impacar-texto/70` debajo;
`space-y-3` entre opciones. Solo texto, sin montos.

---

### `src/components/resumen/AccionesExport.jsx` (component, event-driven) — NUEVO

**Análogo de botones primario/outline:** la barra de navegación de `ConfiguratorWizard.jsx:69-84`.

Botón PRIMARIO (relleno verde — para WhatsApp; de "Siguiente", `ConfiguratorWizard.jsx:77-84`):
```jsx
className="min-h-[44px] rounded bg-impacar-campo px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-impacar-campo/90 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
```

Botón OUTLINE (borde verde — para PDF; de "Anterior", `ConfiguratorWizard.jsx:69-76`):
```jsx
className="min-h-[44px] rounded border border-impacar-campo px-5 py-2 text-sm font-semibold text-impacar-campo transition-colors hover:bg-impacar-campo/5 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40 disabled:cursor-not-allowed disabled:opacity-40"
```

**UI-SPEC S6:**
- WhatsApp = `<a href={linkWhatsApp(estado)} target="_blank" rel="noopener noreferrer">` con glyph SVG
  inline + `Enviar por WhatsApp` (relleno verde, NO el verde de marca WhatsApp).
- PDF = `<button type="button" disabled={generando}>` con glyph download inline + `Descargar PDF`
  (outline). Handler async con estado `generando` (RESEARCH Pattern 3):
  ```jsx
  const [generando, setGenerando] = useState(false)
  const onDescargar = async () => { setGenerando(true); try { await generarPDF(svgNode, estado) } finally { setGenerando(false) } }
  ```
- Layout: `flex flex-col gap-3 sm:flex-row`.
- Glyphs SVG inline (no librería de iconos), patrón `IconoUso` de `PasoUso.jsx:22-83`
  (`viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}`).
- Link global "Volver a editar" debajo: estilo de "Volver a empezar" (`ConfiguratorWizard.jsx:88-94`):
  `text-sm font-medium text-impacar-texto/60 ... hover:text-impacar-cobre hover:underline`, `min-h-[44px]`.

---

### `src/App.jsx` — añadir `vista === 'resumen'` (component ruteo) — MODIFICAR

**Análogo:** el ruteo `landing`/`wizard` en el MISMO archivo (`App.jsx:19-31`).

Estado actual (a extender con una tercera rama):
```jsx
export default function App() {
  const [vista, setVista] = useState(vistaInicial)
  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      {vista === 'landing' ? (
        <Landing onComenzar={() => setVista('wizard')} />
      ) : (
        <ConfiguratorWizard onVolverInicio={() => setVista('landing')} />
      )}
    </div>
  )
}
```

**Cambio:** sumar `vista === 'resumen'` → `<Resumen ... onVolverEditar={() => setVista('wizard')} />`.
Pasar `onVerResumen={() => setVista('resumen')}` a `ConfiguratorWizard`. **Atención al estado:** hoy el
estado del wizard vive en `usePersistedConfig` DENTRO de `ConfiguratorWizard` (`ConfiguratorWizard.jsx:12`).
Como el resumen necesita el MISMO `estado`/`dispatch`, el planner debe decidir si el hook sube a `App.jsx`
(lifting state) o si Resumen llama a `usePersistedConfig()` también (lee la misma key de localStorage).
La 2da opción mantiene `App.jsx` mínimo (cada vista lee la misma fuente persistida).

---

### `src/components/ConfiguratorWizard.jsx` — botón "Ver resumen y presupuesto" + `onVerResumen` (event-driven) — MODIFICAR

**Análogo:** el callback `onVolverInicio` (prop, `ConfiguratorWizard.jsx:11`) y el botón "Siguiente"
deshabilitado en el último paso (`ConfiguratorWizard.jsx:18,77-84`).

Estado relevante actual:
```jsx
export default function ConfiguratorWizard({ onVolverInicio }) {
  ...
  const esUltimo = estado.pasoActual === TOTAL_PASOS - 1
  ...
  <button type="button" onClick={siguiente} disabled={esUltimo} className="...bg-impacar-campo...">
    Siguiente
  </button>
```

**Cambio (D-01):** añadir prop `onVerResumen`. En el Paso 6 (`esUltimo === true`), donde hoy "Siguiente"
queda `disabled`, mostrar/reemplazar por un botón `Ver resumen y presupuesto` que llama `onVerResumen()`.
Reusar exactamente el className del botón primario "Siguiente". Copy exacto del UI-SPEC: `Ver resumen y
presupuesto`. RESEARCH/CONTEXT dejan a discreción si reemplaza o acompaña a "Siguiente".

---

### Tests nuevos (test puro, node:test) — `resumenCampos.test.js`, `exportWhatsApp.test.js`, `exportPDF.test.js` + extender `motorPrecios.test.js`

**Análogo:** `motorPrecios.test.js` y `formato.test.js` (node:test built-in, `node:assert/strict`,
SIN deps de test nuevas).

Header + estructura a copiar (de `formato.test.js:1-11`):
```javascript
// Tests del helper ... (node:test, ESM-native, sin dependencias extra).
// Ejecutar: node --test src/utils/<archivo>.test.js
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { /* fn */ } from './<archivo>.js'

test('descripción del comportamiento', () => {
  assert.equal(actual, esperado)
})
```

Patrón de estado-adulterado a replicar (de `motorPrecios.test.js:36-53`):
```javascript
test('estado adulterado: modeloId inexistente → ... (no crashea)', () => { ... })
test('estado null → ... (no crashea)', () => { ... })
test('estado adulterado: extras no-array → se ignora', () => { ... })
```

Patrón "sin hardcodear" (de `motorPrecios.test.js:19`): `const todosLosIds = EXTRAS.map((e) => e.id)`.
Constantes reales para asserts: `N4_NETO = 38971845` (`motorPrecios.test.js:9`), N4 + 17 extras → neto
`55977868` / total `67733220` (`motorPrecios.test.js:18-23`).

**Cobertura por requirement (RESEARCH "Phase Requirements → Test Map"):**
- `motorPrecios.test.js` (extender): paridad neto/iva/total `detallePresupuesto` == `calcularPresupuesto`;
  ítems base+extras con label/precioNeto; agrupación por categoria/subgrupo; estado adulterado (RESUMEN-02).
- `resumenCampos.test.js`: traducción ids→nombres; null/vacío → `'Sin selección'` (RESUMEN-01).
- `exportWhatsApp.test.js`: mensaje incluye modelo/total/nota/recordatorio PDF; **gate anti-voseo**
  (Fase 3); `linkWhatsApp` = `https://wa.me/<dígitos>?text=...` con número de `CONTACTO` y `\n`→`%0A`;
  longitud bajo ~2000 chars con todos los extras (EXPORT-01).
- `exportPDF.test.js`: SOLO `nombreArchivoPDF` → `presupuesto-impacar-N4.pdf`; sin modelo →
  `...-sin-modelo.pdf` (EXPORT-02 filename). `generarPDF` se valida MANUAL en dev server.

---

### `package.json` — deps de runtime + tests al script `test` (config) — MODIFICAR

**Análogo:** el MISMO archivo (`package.json:5-22`).

Estado actual:
```json
"scripts": {
  "test": "node --test src/utils/banoReglas.test.js src/utils/floorplanLayout.test.js src/utils/formato.test.js src/data/models.test.js src/state/wizardReducer.test.js src/hooks/usePersistedConfig.test.js src/utils/validacionCamas.test.js src/utils/motorPrecios.test.js src/data/extras.test.js"
},
"dependencies": {
  "react": "^18.3.1",
  "react-dom": "^18.3.1"
}
```

**Cambios:**
1. `dependencies`: añadir `"jspdf": "4.2.1"` y `"svg2pdf.js": "2.7.0"` (versiones exactas, verificadas
   en RESEARCH; primeras deps de runtime más allá de React). Comando: `npm install jspdf@4.2.1 svg2pdf.js@2.7.0`.
2. Script `test`: añadir al final los 3 archivos nuevos
   `src/utils/resumenCampos.test.js src/utils/exportWhatsApp.test.js src/utils/exportPDF.test.js`
   (el runner los lista explícitamente; `motorPrecios.test.js` ya está listado).

---

## Shared Patterns

### Anti-hardcodeo / data-driven
**Fuentes:** `EXTRAS` (`extras.js`), `MODELOS` (`models.js`), `FINANCIACION` (`financiacion.js`).
**Aplica a:** `resumenCampos.js`, `detallePresupuesto`, `PresupuestoDesglosado.jsx`,
`ConfigSecciones.jsx`, `BloqueFinanciacion.jsx`, `exportWhatsApp.js`.
**Regla:** nunca ids ni precios literales en JSX/utils; siempre `.find`/`.filter` sobre `/data`.
Ejemplo verbatim (`PasoExtras.jsx:38`): `EXTRAS.filter((e) => e.categoria === 'extras' && e.subgrupo === g.id)`.

### Formato de cifras
**Fuente:** `formato.js` (`formatPrecio`, `calcularIVA`, `calcularTotal`).
**Aplica a:** TODA cifra del resumen, mensaje WhatsApp y PDF.
```javascript
import { formatPrecio } from '../utils/formato.js'
// formatPrecio(38971845) → '$38.971.845'
```
**Nunca** formatear a mano. El total c/IVA usa `font-semibold text-impacar-campo` (BarraPrecio).

### Una sola fuente de la suma
**Fuente:** `calcularPresupuesto` (`motorPrecios.js:10-19`).
**Aplica a:** `detallePresupuesto` (compone, NO re-suma), mensaje WhatsApp, PDF.
**Regla:** `const { neto, iva, total } = calcularPresupuesto(estado)` — nunca re-`reduce`.

### Tolerancia a estado adulterado (Tampering, Fases 4-5)
**Fuente:** `calcularPresupuesto` (`motorPrecios.js:11-13`), `configDesdeEstado` (`wizardReducer.js:90-91`),
`PasoDormitorio` (`PasoDormitorio.jsx:25`), `PasoExtras` (`PasoExtras.jsx:20`).
**Aplica a:** todas las utils nuevas + componentes que leen `estado`.
**Patrón:**
```javascript
const modelo = MODELOS.find((m) => m.id === estado?.modeloId) // optional chaining
const ids = Array.isArray(estado?.extras) ? estado.extras : [] // Array.isArray guard
```
Resultado: nunca `$NaN`, nunca crash; valor faltante → `'Sin selección'` / `'Modelo no disponible'`.

### Trato de usted + copy en español argentino
**Fuente:** copy de Fases 3-5 (Landing, pasos) + UI-SPEC "Copywriting Contract".
**Aplica a:** TODO el copy nuevo, el mensaje WhatsApp y el texto del PDF.
**Gate:** test anti-voseo en `exportWhatsApp.test.js` (patrón Fase 3). Copy exacto fijado en UI-SPEC
(títulos, CTAs, nota orientativa, headers de sección).

### Estilos de botón / focus / touch target
**Fuente:** `ConfiguratorWizard.jsx:69-94` (primario relleno / outline / link), `min-h-[44px]` ubicuo.
**Aplica a:** `AccionesExport.jsx`, links "Editar" y "Volver a editar".
**Reglas:** `min-h-[44px]`, `focus:outline-none focus:ring-2 focus:ring-impacar-campo/40`,
`disabled:cursor-not-allowed disabled:opacity-40`, `rounded` (no `rounded-xl`).

### Card estándar (superficie secundaria)
**Fuente:** `ConfiguratorWizard.jsx:64`, `PlanoPanel.jsx:18`, `BarraPrecio.jsx:11`.
**Aplica a:** todas las cards del resumen (plano, secciones, presupuesto, financiación).
```jsx
className="rounded border border-impacar-texto/10 bg-white/40 p-4"
```

### Reuso de FloorPlan + configDesdeEstado
**Fuente:** `FloorPlan.jsx:95-137` (`<svg viewBox width="100%">`), `PlanoPanel.jsx:15-19` (montaje),
`configDesdeEstado` (`wizardReducer.js:89-105`).
**Aplica a:** S2 (plano en pantalla) y `generarPDF` (mismo nodo SVG vivo vía `ref`).
**Regla:** el plano del resumen y el del PDF son el MISMO componente; sin dibujo nuevo. Los colores son
hex inline (`fill="#BFE3EE"`, etc.) → svg2pdf los respeta (RESEARCH Pitfall 5 verificado).

---

## No Analog Found

| Archivo | Rol | Flujo | Razón |
|---------|-----|-------|-------|
| `src/utils/exportPDF.js` → `generarPDF(svgNode, estado)` | utility browser | file-I/O (descarga) | No existe generación de PDF ni código browser-side con DOM/async en el repo. Es la única pieza verdaderamente nueva. **Mitigación:** RESEARCH Pattern 3 trae el cuerpo verbatim del README oficial de svg2pdf.js adaptado a A4/mm; validación manual en dev server (no automatizable sin headless browser, que sería una dep nueva contraria al patrón). |

> El resto de los archivos (incluidos los componentes nuevos del resumen) tienen análogos directos de
> Fases 3-5. La parte PURA de `exportPDF.js` (`nombreArchivoPDF`) sí tiene análogo (`formato.js`) y es testeable.

---

## Metadata

**Alcance de búsqueda de análogos:** `src/` (`components/`, `components/wizard/`, `components/wizard/pasos/`,
`state/`, `utils/`, `data/`), `package.json`, `.planning/phases/06-*/`.
**Archivos leídos (análogos):** `App.jsx`, `ConfiguratorWizard.jsx`, `Landing.jsx`, `PlanoPanel.jsx`,
`FloorPlan.jsx`, `wizardReducer.js`, `pasosRegistro.jsx`, `motorPrecios.js`, `motorPrecios.test.js`,
`formato.js`, `formato.test.js`, `BarraPrecio.jsx`, `PasoUso.jsx`, `PasoBano.jsx`, `PasoDormitorio.jsx`,
`PasoExtras.jsx`, `models.js`, `extras.js`, `extras.test.js`, `financiacion.js`, `package.json`.
**Fecha de extracción:** 2026-06-27
