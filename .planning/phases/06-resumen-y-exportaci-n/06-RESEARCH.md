# Phase 6: Resumen y Exportación - Research

**Researched:** 2026-06-27
**Domain:** Generación de PDF vectorial en el navegador (jsPDF + svg2pdf.js), deep-links wa.me, composición de desglose de precios sobre un motor existente — todo client-side en Vite + React 18.
**Confidence:** HIGH (stack y APIs verificados contra el registro npm y los README oficiales; el resto es reuso de patrones de Fases 4-5 ya en disco)

## Summary

La Fase 6 es la **pantalla de cierre**: una tercera vista (`'resumen'`) que reúne el plano final, la
configuración elegida, el presupuesto desglosado, la financiación y dos exportaciones (WhatsApp + PDF).
La mayor parte es **reuso** de código que ya existe en disco (Fases 4-5): `FloorPlan`, `BarraPrecio`,
`calcularPresupuesto`, `formato.js`, `configDesdeEstado`, la acción `IR_A_PASO`, `FINANCIACION` y los
datos `MODELOS`/`EXTRAS`. No hay dibujo nuevo ni lógica de navegación nueva.

Las **dos únicas piezas no triviales** son: (1) la generación de un **PDF con el plano como vector**
vía `jsPDF` + `svg2pdf.js` (las primeras dependencias de runtime más allá de React), y (2) el armado
correcto del **deep-link `wa.me`** con un mensaje multilínea URL-encoded. Ambas tienen detalles que hay
que clavar bien (la API de svg2pdf es asíncrona y parchea jsPDF; el wa.me tiene un límite práctico de
~2000 caracteres en la URL). Una tercera pieza menor pero de diseño limpio es **`detallePresupuesto(estado)`**,
un helper puro que se compone *encima* de `calcularPresupuesto` sin duplicar la suma.

**Buena noticia verificada en el código:** todos los `fill`/`stroke` de `FloorPlan` son **atributos de
presentación con hex concretos** (`fill="#BFE3EE"`, `stroke="#1A1A1A"`), no clases CSS ni `currentColor`
ni variables CSS. La única clase (`fp-anim`) solo anima geometría/opacidad — no toca color. Esto elimina
de raíz el gotcha #1 de svg2pdf (colores que no resuelven). El plano va a renderizar con sus colores
correctos en el PDF sin tocar nada del SVG.

**Primary recommendation:** Instalar `jspdf@4.2.1` + `svg2pdf.js@2.7.0` (par compatible, publicados el
mismo día). Construir cuatro funciones puras testeables con `node:test` (sin deps de test nuevas):
`detallePresupuesto(estado)`, `mensajeWhatsApp(estado)`, `linkWhatsApp(estado)` y `nombreArchivoPDF(estado)`.
Dejar la generación del PDF (`doc.svg(...).then(() => doc.save(...))`) en una utilidad browser-side
disparada por el botón con estado `disabled` durante el await (es asíncrono). Pasar el **nodo SVG vivo**
del plano del resumen (vía `ref`) a `doc.svg()`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Ruteo a la vista resumen | Browser / Client (App.jsx `useState`) | — | SPA sin URL; ya es el patrón `vistaInicial()` en App.jsx |
| Proyección estado→config plano | Browser / Client (`configDesdeEstado`) | — | Función pura ya existente; el resumen y el PDF la reusan |
| Desglose de precios por ítem | Lógica pura (`motorPrecios.js`) | — | Sin DOM, sin React; testeable con `node:test` (patrón Fases 4-5) |
| Armado del mensaje/link WhatsApp | Lógica pura (utilidad nueva) | Browser (el `<a href>`) | El string es pura función del estado; el navegador solo abre el link |
| Render del plano en pantalla | Browser / Client (`FloorPlan` SVG) | — | Mismo componente que el wizard, sin cambios |
| Generación del PDF vectorial | Browser / Client (jsPDF + svg2pdf) | — | Requiere DOM vivo (SVG node) + descarga de archivo; imposible server-side (no hay backend) |
| Persistencia del estado | Browser / Client (`localStorage`) | — | Ya resuelto (SHELL-03); el resumen solo lee, no escribe estado nuevo |

**Sin tier de servidor/API/DB:** el proyecto es 100% client-side por constraint de PROJECT.md. No hay
nada que asignar a backend; cualquier tentación de "generar el PDF en un servidor" está fuera de scope.

## Standard Stack

### Core (dependencias de runtime NUEVAS — D-11)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `jspdf` | `4.2.1` | Generar el documento PDF y disparar la descarga (`doc.save`) | El generador de PDF client-side de facto; el constraint de PROJECT.md lo nombra explícitamente. [VERIFIED: npm registry, `npm view jspdf version` → 4.2.1, publicado 2026-03-17] |
| `svg2pdf.js` | `2.7.0` | Embeber el SVG de `FloorPlan` como **vector** en el PDF (parchea `jsPDF` con `doc.svg()`) | Companion oficial de jsPDF para SVG→PDF vectorial; cumple el constraint "plano vectorial, no html2canvas". [VERIFIED: npm registry, `npm view svg2pdf.js version` → 2.7.0, publicado 2026-01-03] |

**Compatibilidad verificada:** `svg2pdf.js@2.7.0` declara `peerDependencies: { jspdf: "^4.0.0 || ^3.0.0 || ^2.0.0" }`
— soporta jsPDF v2, v3 **y v4**. [VERIFIED: `npm view svg2pdf.js peerDependencies`]. Además, `jspdf@4.0.0`
y `svg2pdf.js@2.7.0` se publicaron **el mismo día** (2026-01-03): fueron liberados como par coordinado
para la compatibilidad v4. Usar el par `4.2.1` + `2.7.0` es la elección segura y current.

### Supporting (ya en el repo — REUSAR, no recrear)
| Library / Módulo | Purpose | When to Use |
|------------------|---------|-------------|
| `src/utils/formato.js` (`formatPrecio`, `calcularIVA`, `calcularTotal`) | Formato `$` argentino + IVA 21% desde `data/geometry.js` | TODA cifra del resumen, del mensaje WhatsApp y del PDF. Nunca formatear un número a mano. [VERIFIED: codebase] |
| `src/utils/motorPrecios.js` (`calcularPresupuesto`) | Suma base+extras tolerante a estado adulterado (devuelve 0, nunca `$NaN`) | Base sobre la que se compone `detallePresupuesto`. [VERIFIED: codebase] |
| `src/state/wizardReducer.js` (`configDesdeEstado`, `IR_A_PASO`) | Proyección al plano + deep-link "Editar" por sección | El plano del resumen y del PDF; los links "Editar". [VERIFIED: codebase] |
| `src/components/FloorPlan.jsx` | El SVG del plano (cenital, acotado, colores inline) | Render en pantalla **y** nodo que consume `doc.svg()`. [VERIFIED: codebase] |
| `src/data/financiacion.js` (`FINANCIACION`) | 3 opciones (contado/financiado/permuta) | RESUMEN-03: `.map()` directo. [VERIFIED: codebase] |
| `src/data/extras.js` (`EXTRAS` con `categoria`/`subgrupo`) | Nombres reales + agrupación de accesorios | D-04: agrupar el desglose. [VERIFIED: codebase] |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `jsPDF` + `svg2pdf.js` (vector) | `html2canvas` + jsPDF (rasterizado) | **DESCARTADO por constraint de PROJECT.md** ("plano vectorial, no html2canvas"). html2canvas produce un PNG borroso al imprimir/zoom y pesa más. No relitigar (D-11 locked). |
| `svg2pdf.js` | Serializar el SVG y `doc.addSvgAsImage()` | `addSvgAsImage` rasteriza (no vector) y depende de canvg. Contradice el constraint. |
| `wa.me` link | WhatsApp Business API / `api.whatsapp.com` | No hay backend ni cuenta Business en el MVP. `wa.me` es el canal correcto para un link client-side (D-08/D-09 locked). |

**Installation:**
```bash
npm install jspdf@4.2.1 svg2pdf.js@2.7.0
```

**Version verification (ya ejecutada en esta sesión):**
- `jspdf` → `4.2.1` (latest, publicado 2026-03-17). [VERIFIED: npm registry]
- `svg2pdf.js` → `2.7.0` (latest, publicado 2026-01-03). [VERIFIED: npm registry]
- Entorno local: Node `v24.14.1`, npm `11.11.0`. [VERIFIED: `node --version` / `npm --version`]

> Nota de peso: `jspdf@4.x` trae deps transitivas (`fflate`, `fast-png`, `@babel/runtime`). [VERIFIED:
> `npm view jspdf dependencies`]. Es la "única dependencia pesada justificada" que anticipa PROJECT.md.
> Considerar **import dinámico** (`const { jsPDF } = await import('jspdf')`) en el handler del botón
> para no inflar el bundle inicial del wizard — ver Pattern 3.

## Architecture Patterns

### System Architecture Diagram

```
                          ┌─────────────────────────────────────┐
   localStorage  ───────► │  estado (wizardReducer)              │
   (impacar_config_v1)    │  modeloId, uso, ocupantes, bano,     │
                          │  dormitorio.camas[], extras[]        │
                          └───────────────┬─────────────────────┘
                                          │ (lectura; el resumen NO muta estado)
            ┌─────────────────────────────┼──────────────────────────────┐
            ▼                             ▼                                ▼
  ┌──────────────────┐        ┌────────────────────────┐      ┌─────────────────────┐
  │ configDesdeEstado│        │ detallePresupuesto(est)│      │ resumenTextoCampos  │
  │ → config plano   │        │ (NUEVO, puro)          │      │ (uso/modelo/camas…) │
  └────────┬─────────┘        │  items[] + {neto,iva,  │      └──────────┬──────────┘
           │                  │  total} ← compone sobre│                 │
           ▼                  │  calcularPresupuesto   │                 │
  ┌──────────────────┐        └───────────┬────────────┘                 │
  │ FloorPlan <svg>  │                    │                              ▼
  │ (ref al nodo)    │                    ▼                  ┌──────────────────────┐
  └────────┬─────────┘        ┌────────────────────────┐    │ mensajeWhatsApp(est) │
           │                  │ S4 Bloque presupuesto  │    │ (NUEVO, puro) → texto│
           │ (nodo vivo)      │ desglosado en pantalla │    │ multilínea + total + │
           │                  └────────────────────────┘    │ recordatorio PDF     │
           ▼                                                 └──────────┬───────────┘
  ┌────────────────────────────┐                                       │ encodeURIComponent
  │ generarPDF(svgNode, estado)│◄──── click "Descargar PDF"            ▼
  │  new jsPDF('p','mm','a4')  │      (botón disabled mientras awaita)  ┌──────────────────┐
  │  await doc.svg(node,{x,y,  │                                       │ linkWhatsApp(est)│
  │   width,height})  // vector│      click "Enviar por WhatsApp" ───► │ https://wa.me/   │
  │  doc.text(...) logo/precio/│                                       │  {num}?text=...  │
  │   config/contacto          │                                       └────────┬─────────┘
  │  doc.save(nombreArchivoPDF)│                                                │
  └────────────┬───────────────┘                              <a target="_blank" rel="noopener">
               ▼                                                                ▼
        descarga .pdf                                                  abre WhatsApp
```

Flujo del caso principal: el usuario llega del Paso 6 → `vista='resumen'`. La pantalla lee `estado`,
proyecta el plano, calcula el desglose y arma los strings de export. WhatsApp = un `<a href>` con el
link pre-computado. PDF = un handler async que toma el **nodo SVG vivo** del plano ya renderizado y lo
embebe como vector, luego agrega texto y dispara la descarga.

### Recommended Project Structure (qué se agrega / extiende)
```
src/
├── App.jsx                         # EXTENDER: sumar vista 'resumen' al ruteo de estado (D-01)
├── components/
│   ├── ConfiguratorWizard.jsx      # EXTENDER: callback onVerResumen desde el Paso 6 (D-01)
│   ├── Resumen.jsx                 # NUEVO: la pantalla de cierre (shell S1)
│   └── resumen/                    # NUEVO: sub-componentes presentacionales del resumen
│       ├── ConfigSecciones.jsx     #   S3: secciones por paso + "Editar" (IR_A_PASO)
│       ├── PresupuestoDesglosado.jsx #  S4: "BarraPrecio expandida" con items[]
│       ├── BloqueFinanciacion.jsx  #   S5: FINANCIACION.map
│       └── AccionesExport.jsx      #   S6: botones WhatsApp + PDF
├── utils/
│   ├── motorPrecios.js             # EXTENDER: + detallePresupuesto(estado) (D-05)
│   ├── motorPrecios.test.js        # EXTENDER: tests del desglose
│   ├── exportWhatsApp.js           # NUEVO (puro): mensajeWhatsApp / linkWhatsApp
│   ├── exportWhatsApp.test.js      # NUEVO
│   ├── resumenCampos.js            # NUEVO (puro): traduce ids→nombres para config + mensaje
│   ├── resumenCampos.test.js       # NUEVO
│   └── exportPDF.js                # NUEVO (browser): generarPDF(svgNode, estado) + nombreArchivoPDF
│       └── (nombreArchivoPDF es puro → testeable; generarPDF es browser-side, check manual)
└── data/
    └── contacto.js                 # NUEVO (D-08/D-13): número wa.me + web + IG + ciudad
```

### Pattern 1: `detallePresupuesto` compone sobre `calcularPresupuesto` (una sola fuente de suma — D-05)
**What:** Helper puro que devuelve `{ items, neto, iva, total }`. **NO recalcula la suma**: arma los
ítems para mostrar y delega los totales en `calcularPresupuesto` para que neto/IVA/total sean
idénticos byte a byte al de `BarraPrecio` (Pitfall: dos sumas que divergen por redondeo).
**When to use:** El bloque S4 del resumen y el cuerpo del mensaje/PDF.
**Example:**
```javascript
// src/utils/motorPrecios.js — extiende, NO reescribe calcularPresupuesto.
// Source: patrón derivado del calcularPresupuesto existente (codebase) [VERIFIED]
import { MODELOS } from '../data/models.js'
import { EXTRAS } from '../data/extras.js'
import { calcularPresupuesto } from './motorPrecios.js' // misma fuente para neto/iva/total

export function detallePresupuesto(estado) {
  const modelo = MODELOS.find((m) => m.id === estado?.modeloId)
  const ids = Array.isArray(estado?.extras) ? estado.extras : []
  // Ítem base (label "no disponible" si modeloId adulterado, sin crashear — UI-SPEC error fallback)
  const itemBase = modelo
    ? { id: modelo.id, label: `Casilla ${modelo.nombre} — ${String(modelo.largo).replace('.', ',')} m`, precioNeto: modelo.precioNeto, categoria: 'modelo' }
    : { id: 'sin-modelo', label: 'Modelo no disponible', precioNeto: 0, categoria: 'modelo' }
  // Accesorios en el ORDEN de EXTRAS, conservando categoria/subgrupo para agrupar (D-04)
  const itemsExtras = EXTRAS
    .filter((e) => ids.includes(e.id))
    .map((e) => ({ id: e.id, label: e.nombre, precioNeto: e.precioNeto, categoria: e.categoria, subgrupo: e.subgrupo }))
  // Totales: NUNCA re-sumar acá. Reusar la única fuente (tolera estado adulterado → 0, no $NaN).
  const { neto, iva, total } = calcularPresupuesto(estado)
  return { items: [itemBase, ...itemsExtras], neto, iva, total }
}
```

### Pattern 2: deep-link `wa.me` con mensaje multilínea (EXPORT-01, D-09/D-10)
**What:** Función pura que arma el texto (trato de usted, multilínea con `\n`) y otra que arma la URL.
`encodeURIComponent` convierte `\n`→`%0A` y los espacios/`$`/acentos correctamente.
**When to use:** El `href` del botón primario WhatsApp.
**Example:**
```javascript
// src/utils/exportWhatsApp.js — puro, testeable con node:test.
// Source: formato wa.me oficial (faq.whatsapp.com) [CITED] + encodeURIComponent (estándar) [VERIFIED]
import { CONTACTO } from '../data/contacto.js'
import { detallePresupuesto } from './motorPrecios.js'
import { formatPrecio } from './formato.js'
import { resumenCampos } from './resumenCampos.js' // traduce ids→nombres

export function mensajeWhatsApp(estado) {
  const { total } = detallePresupuesto(estado)
  const c = resumenCampos(estado) // { modelo, largo, uso, ocupantes, bano, camas, cocina, extras[] }
  // Trato de usted SIEMPRE. Termina con el recordatorio del PDF (D-10: wa.me no adjunta archivos).
  return [
    'Hola, le comparto la configuración de mi casilla Impacar:',
    '',
    `Modelo: ${c.modelo}${c.largo ? ` (${c.largo})` : ''}`,
    `Uso: ${c.uso} · Ocupantes: ${c.ocupantes}`,
    `Baño: ${c.bano}`,
    `Dormitorio: ${c.camas}`,
    `Cocina: ${c.cocina}`,
    c.extras.length ? `Extras: ${c.extras.join(', ')}` : 'Extras: sin selección',
    '',
    `Total c/IVA: ${formatPrecio(total)}`,
    'Presupuesto orientativo, sujeto a confirmación.',
    '',
    'Le envío aparte el PDF con el plano y el detalle.', // D-10
  ].join('\n')
}

export function linkWhatsApp(estado) {
  // wa.me/<solo-dígitos-con-código-país-sin-+>?text=<URL-encoded>
  return `https://wa.me/${CONTACTO.whatsapp}?text=${encodeURIComponent(mensajeWhatsApp(estado))}`
}
```
Render: `<a href={linkWhatsApp(estado)} target="_blank" rel="noopener noreferrer">`. (UI-SPEC S6).

### Pattern 3: PDF vectorial A4 — `doc.svg()` es asíncrono y parchea jsPDF (EXPORT-02, D-11/D-12)
**What:** `import 'svg2pdf.js'` (side-effect) agrega el método `doc.svg(element, options)` a jsPDF.
Devuelve una **Promise**. Se le pasa el **nodo DOM vivo** del plano (ya renderizado en S2) vía `ref`.
**When to use:** Handler `onClick` del botón "Descargar PDF". Botón `disabled` mientras se awaita.
**Example:**
```javascript
// src/utils/exportPDF.js — browser-side (usa DOM). Verificación manual en dev server.
// Source: README oficial svg2pdf.js (verbatim adaptado a A4/mm) [CITED: github.com/yWorks/svg2pdf.js]
export async function generarPDF(svgNode, estado) {
  // Import dinámico → la dep pesada NO entra al bundle inicial del wizard.
  const { jsPDF } = await import('jspdf')
  await import('svg2pdf.js') // side-effect: parchea doc.svg

  const doc = new jsPDF('p', 'mm', 'a4') // A4 vertical, unidades mm (210 × 297) [VERIFIED]
  const PAGINA = { ancho: 210, alto: 297 }
  const M = 15 // margen mm
  const anchoUtil = PAGINA.ancho - M * 2 // 180mm

  // 1) Logo IMPACAR (texto bold placeholder — locked D-12). Helvetica = default jsPDF.
  doc.setFont('helvetica', 'bold'); doc.setFontSize(22)
  doc.text('IMPACAR', M, 20)
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10)
  doc.text('Configurador de casillas rurales', M, 26)

  // 2) Plano VECTORIAL. width/height definen la caja de salida (escala el viewBox del SVG).
  //    El SVG tiene aspect ~ (largo+cotas):(ancho+cotas) ≈ 4:1; calcular alto para no deformar.
  const planoY = 32
  const planoAlto = anchoUtil * 0.30 // ajustar al aspect real medido del viewBox del plano
  await doc.svg(svgNode, { x: M, y: planoY, width: anchoUtil, height: planoAlto })

  // 3) Presupuesto (total + nota orientativa), 4) config condensada, 5) contacto al pie:
  //    bloques de doc.text() con coordenadas mm crecientes (cursor Y). formatPrecio para cifras.
  //    Usar doc.splitTextToSize(texto, anchoUtil) para wrappear líneas largas (nombres de extras).

  doc.save(nombreArchivoPDF(estado)) // dispara la descarga real en el navegador
}

// Puro → testeable con node:test (nombre del archivo, discreción del planner).
export function nombreArchivoPDF(estado) {
  return `presupuesto-impacar-${estado?.modeloId ?? 'sin-modelo'}.pdf`
}
```
**Cableado React (S6 + S2):** el componente `Resumen` crea un `ref` y lo pasa a un wrapper alrededor de
`<FloorPlan>` que reenvía el `ref` al `<svg>` (o se ubica el `<svg>` con `containerRef.querySelector('svg')`).
El botón:
```jsx
const [generando, setGenerando] = useState(false)
const onDescargar = async () => {
  setGenerando(true)
  try { await generarPDF(svgRef.current, estado) } finally { setGenerando(false) }
}
// <button disabled={generando} ...>  (patrón disabled existente: disabled:opacity-40)
```

### Anti-Patterns to Avoid
- **Re-sumar el presupuesto en `detallePresupuesto`:** duplicar la lógica de `calcularPresupuesto`
  hace divergir el total del resumen del de `BarraPrecio`. Componer, no recalcular (D-05).
- **`html2canvas` para el PDF:** rasteriza el plano (borroso, pesado). Prohibido por PROJECT.md.
- **Serializar el SVG a string y pasarlo a `doc.svg()`:** svg2pdf espera un **nodo DOM vivo** con
  geometría computada; usar el nodo del plano ya montado en pantalla.
- **`doc.save()` fuera del `.then()`/`await`:** `doc.svg()` es async; guardar antes de que resuelva
  produce un PDF sin el plano. Siempre `await` (o `.then`) antes de `doc.save`.
- **Olvidar `rel="noopener noreferrer"` en el `<a target="_blank">`:** seguridad (reverse tabnabbing).
- **Hardcodear el número de WhatsApp en el JSX:** debe leerse de `data/contacto.js` (una fuente, D-08).
- **Formatear cifras a mano (`$` + `.toLocaleString` ad-hoc):** usar `formatPrecio` siempre.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| SVG → PDF vectorial | Parser propio de SVG a comandos jsPDF | `svg2pdf.js` (`doc.svg`) | Maneja paths, transforms, text, viewBox, opacidad — cientos de casos borde |
| Generar el archivo PDF | Construir bytes PDF a mano / canvas | `jsPDF` (`new jsPDF` + `doc.save`) | Formato PDF + descarga cross-browser resueltos |
| URL-encoding del mensaje | Reemplazos manuales de espacios/acentos | `encodeURIComponent` (built-in) | Codifica `\n`→`%0A`, `$`, tildes, ñ correctamente |
| Formato `$` argentino + IVA | Re-formatear / re-calcular IVA | `formato.js` existente | Ya resuelto, testeado, una sola fuente de la alícuota |
| Suma base+extras | Sumar de nuevo en el desglose | `calcularPresupuesto` existente | Una sola fuente de la suma; tolera estado adulterado |
| Proyección al plano | Recomputar config para el PDF | `configDesdeEstado` existente | El plano del PDF y el de pantalla deben ser idénticos |
| Deep-link de "Editar" | Lógica de navegación nueva | acción `IR_A_PASO` existente | Ya acota el paso al rango y existe en el reducer |

**Key insight:** El 70% de la fase es ensamblar piezas que ya existen y están testeadas. El único código
verdaderamente nuevo de riesgo es el handler del PDF (browser-side, async, DOM) — y svg2pdf.js absorbe
toda la complejidad del render vectorial. Construir un parser SVG propio sería semanas de trabajo y bugs.

## Common Pitfalls

### Pitfall 1: `doc.svg()` resuelve una Promise — guardar antes rompe el PDF
**What goes wrong:** El PDF se descarga sin el plano (página con texto pero sin croquis).
**Why it happens:** `svg2pdf.js` es asíncrono (`doc.svg(...).then(...)`); si se llama `doc.save()` en la
misma tick síncrona, el SVG todavía no se dibujó.
**How to avoid:** `await doc.svg(node, opts)` (o `.then(() => doc.save(...))`). Mantener el botón
`disabled` durante el await (estado `generando`). [CITED: README svg2pdf.js]
**Warning signs:** PDF con todo el texto pero el área del plano vacía.

### Pitfall 2: el SVG debe ser un nodo DOM vivo, no un string
**What goes wrong:** `doc.svg()` falla o produce un plano vacío/mal dimensionado.
**Why it happens:** svg2pdf lee geometría computada del nodo; un string serializado o un nodo fuera del
DOM no tiene layout.
**How to avoid:** Renderizar `FloorPlan` en la pantalla del resumen (S2 ya lo hace) y pasar **ese mismo
nodo** vía `ref` / `querySelector('svg')`. [CITED: README usa `document.getElementById('svg')`]
**Warning signs:** plano ausente o con tamaño 0 en el PDF.

### Pitfall 3: deformación del plano en la caja A4
**What goes wrong:** El plano sale estirado/aplastado en el PDF.
**Why it happens:** `width`/`height` en las opciones de `doc.svg` fijan la caja de salida; si la
relación no coincide con el aspect del `viewBox`, deforma. El plano de Impacar es muy apaisado
(largo+cotas vs ancho+cotas, ~4:1).
**How to avoid:** Leer el `viewBox` real del layout (`layout.viewBox` / `totalU+pad*2` × `anchoU+pad*2`)
y derivar `height = width × (vbAlto / vbAncho)`. No hardcodear un alto fijo.
**Warning signs:** acotaciones que no cierran, zonas con proporción distinta a la de pantalla.

### Pitfall 4: el texto del SVG sale en Helvetica, no en Inter
**What goes wrong:** Las etiquetas de zona y las cotas del plano salen en una tipografía distinta.
**Why it happens:** svg2pdf solo embebe fuentes que se registren explícitamente en jsPDF; sin registrar
Inter, cae a las fuentes base (Helvetica). El `fontFamily="Inter…"` del `<svg>` se ignora.
**How to avoid:** **Aceptarlo** — Helvetica es sobria/industrial y consistente con la identidad. NO
registrar Inter (agregaría un .ttf base64 pesado, innecesario para el MVP). Documentarlo como decisión.
[VERIFIED: múltiples issues svg2pdf #64/#100/#103/#255 confirman que custom fonts requieren setup previo]
**Warning signs:** ninguno problemático; es esperado. Solo confirmar legibilidad de las cotas (fontSize 10).

### Pitfall 5: colores que no resuelven (NO aplica a este plano — verificado)
**What goes wrong (en general):** svg2pdf no resuelve `currentColor`, variables CSS (`var(--x)`) ni
fills puestos por clase CSS → elementos negros o invisibles.
**Why it happens:** svg2pdf lee atributos de presentación, no el CSS computado completo.
**Why it does NOT apply here:** **verificado en el código** — `FloorPlan` y todos los
`FloorPlanElements/*` usan hex concretos inline (`fill="#BFE3EE"`, `stroke="#1A1A1A"`,
`fill="#B5915A"`, etc.). La única clase es `fp-anim` (solo geometría/opacidad/transform, sin color).
[VERIFIED: codebase — `FloorPlan.jsx`, `floorplanLayout.js` FILL, `FloorPlanElements/*.jsx`]
**Action:** NINGUNA. No tocar el SVG. Si en el futuro se moviera un color a CSS, este pitfall volvería.

### Pitfall 6: URL de wa.me demasiado larga
**What goes wrong:** Con muchos extras seleccionados (nombres largos como el "Sistema solar 220 off
grid…"), el mensaje URL-encoded podría acercarse al límite práctico de URL (~2000 chars).
**Why it happens:** `%0A` (3 chars por salto) + nombres largos + encoding de acentos infla el string.
**How to avoid:** Mantener el mensaje **conciso** (resumen + total + recordatorio PDF, no el desglose
ítem-por-ítem con precios). En el peor caso (todos los extras), el cuerpo ronda ~600-900 chars sin
codificar → bajo el límite. El detalle completo va en el **PDF**, no en el texto de WhatsApp (D-10).
[VERIFIED: WebSearch — ~2000 chars es el umbral seguro cross-browser; mensaje WhatsApp máx 4096]
**Warning signs:** el chat de WhatsApp abre con el texto truncado.

### Pitfall 7: estado vacío / adulterado en el resumen (degradación elegante — discreción)
**What goes wrong:** `uso`/`ocupantes` arrancan `null` en `estadoInicial`; localStorage puede traer
estado adulterado.
**Why it happens:** El usuario puede llegar al resumen sin completar todo, o con `extras` no-array.
**How to avoid:** Patrón Fases 4-5: optional chaining + defaults. `calcularPresupuesto`/`detallePresupuesto`
ya devuelven 0 (no `$NaN`). En la config, valores faltantes → `'Sin selección'` (nunca blanco/undefined).
Estado totalmente vacío (`modeloId`/`uso`/`ocupantes` null) → empty state de UI-SPEC ("Todavía no hay
una configuración completa"). [VERIFIED: UI-SPEC Copywriting + codebase tolerance pattern]
**Warning signs:** `undefined` o `$NaN` visibles, o un crash al armar el mensaje/PDF.

## Code Examples

### `data/contacto.js` (NUEVO — D-08/D-13)
```javascript
// src/data/contacto.js — fuente única de contacto (wa.me + PDF). Source: CONTEXT D-08/D-13 [project]
export const CONTACTO = {
  // wa.me: SOLO dígitos, código país (54) + 9, sin '+' ni espacios.
  whatsapp: '5492954555113', // ACTIVO (pruebas, Ignacio). PRODUCCIÓN antes del go-live: 5492302468754 (Impacar)
  whatsappDisplay: '+54 9 2954 55-5113', // para mostrar en el PDF (legible)
  web: 'industriaimpacar.com',
  instagram: '@industriasimpacar',
  ciudad: 'General Pico, La Pampa',
}
```

### Agrupar el desglose por categoría (D-04) — consumiendo `detallePresupuesto`
```jsx
// PresupuestoDesglosado.jsx (S4). Source: patrón data-driven de PasoExtras.jsx [VERIFIED: codebase]
import { detallePresupuesto } from '../../utils/motorPrecios.js'
import { formatPrecio } from '../../utils/formato.js'

const GRUPOS = [ // orden y rótulos del UI-SPEC; data-driven sobre categoria/subgrupo
  { match: (i) => i.categoria === 'bano',       titulo: 'Baño' },
  { match: (i) => i.categoria === 'dormitorio', titulo: 'Dormitorio' },
  { match: (i) => i.categoria === 'cocina',     titulo: 'Cocina y estar' },
  { match: (i) => i.categoria === 'extras' && i.subgrupo === 'confort', titulo: 'Confort' },
  { match: (i) => i.categoria === 'extras' && i.subgrupo === 'energia', titulo: 'Energía' },
]
export default function PresupuestoDesglosado({ estado }) {
  const { items, neto, iva, total } = detallePresupuesto(estado)
  const base = items.find((i) => i.categoria === 'modelo')
  // ... render base, luego GRUPOS.map filtrando items; OMITIR grupos vacíos (UI-SPEC S4).
  // Total c/IVA con font-semibold text-impacar-campo (idéntico a BarraPrecio).
}
```

### Wrapper con `ref` para pasar el SVG vivo al PDF
```jsx
// Resumen.jsx (fragmento). El mismo nodo que se ve en pantalla alimenta el PDF.
const planoRef = useRef(null)
// S2: <div ref={planoRef} className="rounded border ... bg-white/40 p-4"><FloorPlan config={...} /></div>
// S6 handler: await generarPDF(planoRef.current.querySelector('svg'), estado)
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| jsPDF v2.x (`import { jsPDF } from 'jspdf'`) | jsPDF v4.2.1 — **misma API de browser**, sin breaking changes para uso en navegador | v4.0.0, 2026-01-03 | El único cambio de v4 es restringir acceso a filesystem en **Node.js** (irrelevante en browser). `new jsPDF`, `doc.svg`, `doc.save` sin cambios. [CITED: github.com/parallax/jsPDF/releases] |
| svg2pdf.js dependiente de un fork de jsPDF | svg2pdf.js 2.x usa jsPDF original; 2.7.0 soporta jsPDF v2/v3/v4 | 2.7.0, 2026-01-03 | Par coordinado con jsPDF v4. `import 'svg2pdf.js'` parchea `doc.svg`. [CITED: README + npm peerDeps] |

**Deprecated/outdated:**
- `addSvgAsImage` / `canvg` para SVG: rasteriza (no vector). No usar — contradice el constraint.
- Forks viejos de jsPDF empaquetados con svg2pdf (pre-2.x): innecesarios, hoy es peerDependency.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | El plano de Impacar tiene aspect ~4:1, hay que derivar `height` del `viewBox` para no deformarlo en el PDF | Pitfall 3 / Pattern 3 | Bajo — el alto exacto se ajusta visualmente en el dev server; es un número, no una arquitectura |
| A2 | El mensaje WhatsApp conciso (sin desglose ítem-por-ítem) queda bajo ~2000 chars aun con todos los extras | Pitfall 6 | Bajo — verificable contando; si se pasara, el PDF lleva el detalle igual (D-10) |
| A3 | Helvetica (default jsPDF) es aceptable para el texto del plano y del PDF (no registrar Inter) | Pitfall 4 | Bajo — decisión estética coherente con "sobrio/industrial"; confirmable visualmente |
| A4 | `whatsappDisplay` legible para el PDF es derivable del número crudo; el formato exacto es discreción | Code Examples | Bajo — solo presentación del contacto en el pie del PDF |

**Nota:** No hay assumptions de alto riesgo. Las APIs de jsPDF/svg2pdf y el formato wa.me están
verificados/citados; los colores inline del plano están verificados en el código.

## Open Questions (RESOLVED)

1. **RESOLVED: Aspect ratio exacto del `viewBox` del plano para la caja A4**
   - What we know: `FloorPlan` usa `viewBox={layout.viewBox}` y el contenido es `totalU+pad*2` ×
     `anchoU+pad*2` (muy apaisado). [VERIFIED: codebase]
   - What's unclear: el valor numérico exacto del alto para el modelo más largo (N7) vs el más corto (N1).
   - Resolution: en `generarPDF`, leer `svgNode.viewBox.baseVal` (width/height) y derivar
     `height = width × (vb.height / vb.width)`. Cero hardcodeo, válido para todos los modelos.
     Implementado en 06-03 Task 2 (generarPDF lee el viewBox en runtime).

2. **RESOLVED: Copy exacto del mensaje WhatsApp y de la nota orientativa**
   - What we know: estructura y línea final fijadas (D-09/D-10 + UI-SPEC); trato de usted obligatorio.
   - What's unclear: redacción palabra por palabra (es discreción del planner/executor).
   - Resolution: usar el ejemplo de Pattern 2 como base verbatim; gate anti-voseo en revisión
     (como Fase 3). Implementado en 06-02 Task 2 (mensajeWhatsApp + test anti-voseo).

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Build/test/install | ✓ | v24.14.1 | — |
| npm | Instalar jspdf + svg2pdf.js | ✓ | 11.11.0 | — |
| `jspdf` | EXPORT-02 (generar PDF) | ✗ (a instalar) | 4.2.1 (target) | Sin fallback — bloqueante para EXPORT-02; `npm install jspdf@4.2.1` |
| `svg2pdf.js` | EXPORT-02 (plano vectorial) | ✗ (a instalar) | 2.7.0 (target) | Sin fallback — bloqueante para el plano vectorial; `npm install svg2pdf.js@2.7.0` |
| Navegador (DOM, descarga) | EXPORT-02 (`doc.save`, nodo SVG vivo) | ✓ (runtime) | — | — |
| `encodeURIComponent` | EXPORT-01 (wa.me) | ✓ (built-in) | — | — |

**Missing dependencies with no fallback:** `jspdf` y `svg2pdf.js` — son deps nuevas, su instalación es
una **tarea explícita del plan** (Wave de setup). No hay alternativa vectorial liviana (es la "dep pesada
justificada" de PROJECT.md).

**Missing dependencies with fallback:** ninguna.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `node:test` (runner built-in de Node) + `node:assert/strict` — sin deps de test [VERIFIED: package.json, motorPrecios.test.js] |
| Config file | none — los tests se listan explícitamente en el script `test` de package.json |
| Quick run command | `node --test src/utils/motorPrecios.test.js` (un archivo) |
| Full suite command | `npm test` (lista todos los `*.test.js`) |

> **Regla del proyecto (validation_architecture_note + Fases 4-5):** la lógica pura se testea con
> `node:test`, **sin agregar dependencias de test**. La generación del PDF es browser-side y se valida
> **manualmente** en el dev server (no automatizable sin un headless browser, que sería una dep nueva
> contraria al patrón). Los `*.test.js` van **al lado** del archivo fuente.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| RESUMEN-02 | `detallePresupuesto` devuelve ítem base + extras con label/precioNeto correctos | unit | `node --test src/utils/motorPrecios.test.js` | ⚠️ extender existente |
| RESUMEN-02 | neto/iva/total de `detallePresupuesto` == `calcularPresupuesto` (paridad, una sola suma) | unit | `node --test src/utils/motorPrecios.test.js` | ❌ Wave 0 |
| RESUMEN-02 | items agrupables por `categoria`/`subgrupo` (bano/dorm/cocina/confort/energia) | unit | `node --test src/utils/motorPrecios.test.js` | ❌ Wave 0 |
| RESUMEN-02 | estado adulterado (modeloId inválido, extras no-array, null) → sin `$NaN`, label "Modelo no disponible" | unit | `node --test src/utils/motorPrecios.test.js` | ❌ Wave 0 |
| RESUMEN-01 | `resumenCampos` traduce ids→nombres reales (uso, modelo+largo, baño, camas C/S/M, cocina/heladera, extras) | unit | `node --test src/utils/resumenCampos.test.js` | ❌ Wave 0 |
| RESUMEN-01 | `resumenCampos` con campos null/vacíos → 'Sin selección' (nunca undefined) | unit | `node --test src/utils/resumenCampos.test.js` | ❌ Wave 0 |
| EXPORT-01 | `mensajeWhatsApp` incluye modelo, total formateado, nota orientativa, recordatorio PDF; trato de usted | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ Wave 0 |
| EXPORT-01 | `mensajeWhatsApp` no contiene voseo (gate anti-voseo, patrón Fase 3) | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ Wave 0 |
| EXPORT-01 | `linkWhatsApp` = `https://wa.me/<dígitos>?text=...`; número desde CONTACTO; `\n`→`%0A` vía encodeURIComponent | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ Wave 0 |
| EXPORT-01 | `linkWhatsApp` con todos los extras queda bajo el límite práctico de URL (~2000 chars) | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ Wave 0 |
| EXPORT-02 | `nombreArchivoPDF` → `presupuesto-impacar-N4.pdf`; estado sin modelo → `...-sin-modelo.pdf` | unit | `node --test src/utils/exportPDF.test.js` (solo la fn pura) | ❌ Wave 0 |
| EXPORT-02 | PDF generado tiene plano vectorial + logo + presupuesto + config + contacto en 1 página A4 | manual (dev server) | `npm run dev` → click "Descargar PDF" → abrir PDF, verificar vector (zoom) y 1 página | n/a (visual) |
| RESUMEN-03 | bloque de financiación lista las 3 opciones de FINANCIACION | manual (visual) o data-test sobre FINANCIACION | inspección visual / `node --test src/data/...` si se agrega | n/a |
| RESUMEN-01 | plano final + secciones + "Editar" (IR_A_PASO) navegan al paso correcto | manual (dev server) | `npm run dev` → click "Editar" en cada sección | n/a (interacción) |

### Sampling Rate
- **Per task commit:** `node --test <archivo .test.js tocado>` (rápido, < 1s).
- **Per wave merge:** `npm test` (suite completa de lógica pura).
- **Phase gate:** `npm test` en verde + checklist de verificación manual del PDF y de los deep-links
  "Editar"/WhatsApp en el dev server antes de `/gsd-verify-work`.

### Wave 0 Gaps
- [ ] `src/utils/motorPrecios.test.js` — extender con tests de `detallePresupuesto` (paridad de totales,
      ítems, agrupación, estado adulterado). Cubre RESUMEN-02.
- [ ] `src/utils/resumenCampos.test.js` — nuevo; traducción ids→nombres + 'Sin selección'. Cubre RESUMEN-01.
- [ ] `src/utils/exportWhatsApp.test.js` — nuevo; mensaje, anti-voseo, link, encoding, longitud. Cubre EXPORT-01.
- [ ] `src/utils/exportPDF.test.js` — nuevo; SOLO `nombreArchivoPDF` (la parte pura). Cubre EXPORT-02 (filename).
- [ ] Agregar los 3 archivos nuevos al script `test` de `package.json` (el runner los lista explícitamente).
- [ ] Framework install: ninguno (node:test ya está; jspdf/svg2pdf NO se testean en node).

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1`, `security_block_on: high` [VERIFIED: .planning/config.json]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | App sin login/cuentas (out of scope) |
| V3 Session Management | no | Sin sesiones/servidor |
| V4 Access Control | no | Sin recursos protegidos; todo client-side público |
| V5 Input Validation / Output Encoding | **yes** | `encodeURIComponent` para el `text` del wa.me; el estado proviene de localStorage (no de inputs externos), pero se trata como **no confiable** (Tampering): optional chaining + defaults, `Array.isArray`, sin `$NaN` |
| V6 Cryptography | no | Sin secretos ni datos sensibles; el número de WhatsApp es público comercial |
| V14 Configuration / Dependencies | **yes** | Vetar `jspdf`/`svg2pdf.js` al instalar (versiones current, sin CVEs abiertos conocidos); jsPDF v4.x es justamente una línea de releases de seguridad |

### Known Threat Patterns for {Vite + React 18 client-side, export}

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Estado adulterado en localStorage (`impacar_config_v1`) inyecta valores raros al mensaje/PDF/precio | Tampering | Tratar el estado como no confiable: `Array.isArray`, optional chaining, defaults; `calcularPresupuesto` ya devuelve 0. Patrón Fases 4-5 [VERIFIED: codebase] |
| Reverse tabnabbing al abrir wa.me con `target="_blank"` | Tampering / hijack de pestaña | `rel="noopener noreferrer"` en el `<a>` (UI-SPEC S6 ya lo exige) |
| Inyección en la URL wa.me vía contenido del estado (saltos de línea, `&`, etc.) | Tampering | `encodeURIComponent` sobre TODO el `text`; el número viene de una constante, no del usuario |
| XSS al embeber el SVG en el PDF | — (no aplica) | El SVG es generado por la propia app desde datos internos (no user-supplied HTML); svg2pdf no ejecuta scripts |
| Filesystem path traversal de jsPDF en Node | Tampering | No aplica (uso en browser, no Node); aun así v4.x ya lo mitiga por default [CITED: jsPDF v4 release] |
| Supply chain de las deps nuevas | Tampering | Fijar versiones exactas (`jspdf@4.2.1`, `svg2pdf.js@2.7.0`); revisar en install (V14) |

**Nivel de riesgo de la fase: BAJO.** No hay autenticación, datos sensibles, ni inputs de red. La
superficie real es: (a) tratar el estado de localStorage como no confiable (ya es el patrón del
proyecto) y (b) encodear el deep-link wa.me correctamente. Ningún ítem `high` que bloquee.

## Project Constraints (from CLAUDE.md)

| Constraint | Implicación para Fase 6 |
|------------|--------------------------|
| Vite + React 18 (hooks) + Tailwind v3, **sin backend** | Todo el resumen y la exportación son client-side; el PDF se genera en el navegador |
| Render del plano = **SVG nativo** (sin libs de dibujo pesadas) | Reusar `FloorPlan` tal cual; svg2pdf no es una lib de dibujo sino un conversor |
| **PDF = jsPDF con el plano vectorial** (NO html2canvas) | jsPDF + svg2pdf.js (`doc.svg`); prohibido rasterizar |
| Estado en `localStorage` (`impacar_config_v1`) | El resumen solo LEE; tratar como no confiable |
| **Español argentino, trato de usted** | Todo el copy + mensaje WhatsApp + texto del PDF; gate anti-voseo |
| Precios netos Lista 108 + IVA 21% + total | `formato.js` + `calcularPresupuesto` (no recrear) |
| Identidad **sobria/industrial** (no startup tech) | Logo texto bold IMPACAR; sin gradientes/sombras; Helvetica en PDF es coherente |
| **Mobile-first** (Samsung ~6", ~375px) | Resumen en una columna; botón PDF con estado disabled; pulido fino → Fase 7 |
| **GSD Workflow Enforcement** | No editar fuera de un comando GSD (esta fase se ejecuta vía `/gsd-execute-phase`) |

## Project Skills

No se encontraron `SKILL.md` en `.claude/skills/` ni en las rutas alternativas
(`.agents/`, `.cursor/`, `.github/`, `.codex/`). El único contenido en `.claude/` es `launch.json`.
[VERIFIED: `find .claude -iname SKILL.md` → vacío; `ls .claude` → solo launch.json]. No hay hallazgos
de spike/sketch previos sobre PDF/export que incorporar.

## Sources

### Primary (HIGH confidence)
- npm registry — `npm view jspdf version` → **4.2.1** (2026-03-17); `npm view jspdf dependencies` →
  `{ @babel/runtime, fflate, fast-png }`; `npm view svg2pdf.js version` → **2.7.0** (2026-01-03);
  `npm view svg2pdf.js peerDependencies` → `{ jspdf: "^4.0.0 || ^3.0.0 || ^2.0.0" }`.
- README oficial svg2pdf.js (github.com/yWorks/svg2pdf.js) — import `import 'svg2pdf.js'`, `doc.svg(el, {x,y,width,height})`
  devuelve Promise, acepta nodo DOM, fuentes custom requieren setup previo.
- github.com/parallax/jsPDF/releases — v4.0.0 sin breaking changes de API browser (solo restricción FS
  en Node); v4.1.0/4.2.0/4.2.1 son releases de seguridad.
- Codebase (lectura directa) — `FloorPlan.jsx`, `FloorPlanElements/*.jsx`, `floorplanLayout.js` (colores
  hex inline), `motorPrecios.js` + `.test.js`, `formato.js`, `wizardReducer.js`, `extras.js`, `models.js`,
  `financiacion.js`, `geometry.js`, `App.jsx`, `ConfiguratorWizard.jsx`, `BarraPrecio.jsx`, `PasoExtras.jsx`,
  `package.json`, `.planning/config.json`.
- Entorno — `node --version` v24.14.1, `npm --version` 11.11.0.

### Secondary (MEDIUM confidence)
- WhatsApp Help Center (faq.whatsapp.com/425247423114725) — formato wa.me con `?text=` URL-encoded
  (página parcialmente truncada; formato corroborado por múltiples fuentes secundarias y uso estándar).
- WebSearch — issues de svg2pdf.js (#64/#100/#103/#255) sobre fuentes custom y `font-size` no numérico;
  límite práctico de URL ~2000 chars; máximo de mensaje WhatsApp 4096 chars.

### Tertiary (LOW confidence)
- Ninguna afirmación crítica descansa solo en fuentes no verificadas.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versiones y compatibilidad verificadas contra el registro npm en esta sesión.
- Architecture: HIGH — 70% es reuso de código leído directamente; el cableado nuevo sigue patrones existentes.
- jsPDF/svg2pdf API: HIGH — confirmada por README oficial + release notes (v4 sin breaking browser).
- Pitfalls: HIGH para los verificados en código (colores inline); MEDIUM para los de svg2pdf (issues + docs).
- wa.me: MEDIUM — formato estándar y corroborado, pero la doc oficial llegó truncada.

**Research date:** 2026-06-27
**Valid until:** ~2026-07-27 (30 días — stack estable; jsPDF/svg2pdf en línea de releases de seguridad,
revisar versión antes de instalar por si hubiera un parche nuevo).
