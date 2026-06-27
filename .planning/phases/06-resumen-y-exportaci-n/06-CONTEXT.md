# Phase 6: Resumen y Exportación - Context

**Gathered:** 2026-06-27
**Status:** Ready for planning

<domain>
## Phase Boundary

La pantalla de cierre del configurador. El usuario llega a un **resumen** que muestra:
1. El **plano final** completo (el SVG que ya genera `FloorPlan` desde el estado).
2. Toda la **configuración elegida** (uso, modelo, ocupantes, baño, dormitorio, cocina/estar, extras).
3. El **presupuesto desglosado** (base + accesorios, neto + IVA 21% + total) con nota orientativa.
4. Las **opciones de financiación** (las 3 de `data/financiacion.js`).

Y dos formas de **exportar**:
- **WhatsApp** — link `wa.me` con un mensaje pre-armado (resumen en texto + total).
- **PDF** — descarga con el plano vectorial, la config, el precio, el logo IMPACAR y el contacto.

**Requirements de la fase:** RESUMEN-01, RESUMEN-02, RESUMEN-03, EXPORT-01, EXPORT-02.

**NO es de esta fase** (scope creep → otras fases / out of scope): pulido mobile final y
accesibilidad de punta a punta del resumen y la exportación (Fase 7); integración real con
CRM/GHL, render 3D, variantes de layout pre-armadas, precios editables por la fábrica (v2 /
out of scope). El motor de precios ya existe (Fase 5) — acá se **extiende** para el desglose, no
se reescribe.

</domain>

<decisions>
## Implementation Decisions

### Navegación al resumen (RESUMEN-01, flujo)
- **D-01:** **Tercera vista `'resumen'` en `App.jsx`.** Hoy el ruteo de estado es `landing → wizard`
  (sin URL); se suma `vista === 'resumen'`. En el **Paso 6** (último, índice 5) el botón "Siguiente"
  —hoy `disabled` cuando `esUltimo`— se reemplaza/acompaña por **"Ver resumen y presupuesto"**, que
  cambia a `vista='resumen'`. El resumen es **full-width** (sin barra de progreso ni plano sticky
  lateral compitiendo). `ConfiguratorWizard` expone un callback `onVerResumen` (análogo a
  `onVolverInicio`).
- **D-02:** **Volver a editar = global + por sección.** Un botón global "Volver a editar" (regresa a
  `vista='wizard'`) **más** un link "Editar" en cada sección del resumen que salta directo al paso
  correspondiente vía la acción **`IR_A_PASO`** que ya existe en `wizardReducer`. El estado sigue
  vivo (no se resetea al ver el resumen).

### Presupuesto desglosado (RESUMEN-02, extiende PRECIO-01)
- **D-03:** **Desglose línea por ítem completa.** Base del modelo (ej. "Casilla N4 — $38.971.845") +
  **cada accesorio seleccionado** con su nombre real y `precioNeto`; luego **subtotal neto + IVA 21%
  + total c/IVA**. Es exactamente lo que **D-11 (Fase 5)** reservó para esta pantalla (los pasos solo
  mostraban el total corriendo).
- **D-04:** **Accesorios agrupados por categoría** en el desglose: Baño / Dormitorio / Cocina-estar /
  Confort / Energía — **reusando el metadato de subgrupo** de `EXTRAS` creado en Fase 5 (D-08). No
  lista única.
- **D-05:** **Extender `motorPrecios.js`** con un helper de desglose (p.ej. `detallePresupuesto(estado)`)
  que devuelva los **ítems** (`{ label, precioNeto, categoria/subgrupo }`) además de `{ neto, iva,
  total }`. **Una sola fuente de la suma** (`estado.extras[]` + `modeloId`), sin duplicar la lógica de
  `calcularPresupuesto`. Reusar `formato.js` (`formatPrecio`, `calcularIVA`, `calcularTotal`). Lógica
  pura testeable, **sin dependencias de test nuevas** (`node:test`), como Fases 4-5.
- **D-06:** **Nota "orientativo, sujeto a confirmación"** visible junto al total (RESUMEN-02).
  **Financiación:** listar las **3 opciones** de `FINANCIACION` (contado / financiado / permuta) —
  solo texto/detalle, sin montos (la fábrica los confirma). (RESUMEN-03)

### Presentación de la configuración (RESUMEN-01)
- **D-07:** **Config en secciones por paso.** Bloques legibles: "Uso y ocupantes", "Modelo", "Baño",
  "Dormitorio", "Cocina y estar", "Extras" — cada uno con sus valores **traducidos de ids a nombres
  reales** (uso; modelo Nx con su largo; tamaño de baño estándar/ampliado; camas C/S/M con cantidades;
  horno/heladera/mesa; extras de confort/energía). Cada sección lleva su link "Editar" (D-02). No
  lista plana.

### WhatsApp (EXPORT-01)
- **D-08:** **Número de destino en una constante de contacto única** (nueva, p.ej. `src/data/contacto.js`).
  - **Valor ACTIVO ahora (pruebas):** `5492954555113` — número personal de Ignacio, para que los
    tests de la demo **no le lleguen a Impacar**.
  - **Valor de PRODUCCIÓN (a swappear antes del go-live):** `5492302468754` — WhatsApp real de
    Impacar. Documentar AMBOS en el archivo (constante activa + comentario claro con el real).
  - Formato `wa.me`: solo dígitos, código país, sin `+`/espacios.
- **D-09:** **Mensaje pre-armado = resumen completo en texto** (URL-encoded en el link `wa.me`):
  modelo + ocupantes + baño + camas + cocina/heladera + extras listados + **total c/IVA** + nota
  "presupuesto orientativo". **Trato de usted.**
- **D-10:** El mensaje **incluye un recordatorio del PDF** (línea tipo "Le envío aparte el PDF con el
  plano y el detalle") — porque `wa.me` **no adjunta archivos** automáticamente.

### PDF (EXPORT-02)
- **D-11:** **jsPDF + svg2pdf.js** para embeber el plano (el mismo SVG de `FloorPlan`) como **vector**
  en el PDF. `svg2pdf.js` es el companion liviano de jsPDF; respeta el constraint **"plano vectorial
  (no html2canvas)"** de PROJECT.md. **`jspdf` y `svg2pdf.js` son dependencias nuevas a agregar** (hoy
  no están en `package.json`).
- **D-12:** **Una página A4.** Layout: logo IMPACAR (texto bold, placeholder — locked) arriba → plano
  vectorial → presupuesto (total + nota orientativa) → config condensada → contacto al pie.
- **D-13:** **Contacto en el PDF = completo:** logo IMPACAR + WhatsApp + web (`industriaimpacar.com`) +
  Instagram (`@industriasimpacar`) + "General Pico, La Pampa". El número se lee de la misma constante
  de contacto (D-08).

### Claude's Discretion (research/planner deciden)
- **Copy exacto** del mensaje de WhatsApp y de la nota orientativa (respetando trato de usted).
- **Nombre del archivo PDF** descargado (p.ej. `presupuesto-impacar-N4.pdf`).
- **Estados vacíos / edge:** qué muestra el resumen si faltan `uso`/`ocupantes` (arrancan `null` en
  `estadoInicial`) o si el estado viene adulterado de localStorage — **degradación elegante, sin
  crashear** (optional chaining + defaults, patrón de Fases 4-5). Aplica también al armado del
  mensaje y del PDF.
- **Detalle del enchufe / orden de waves:** lógica pura del desglose (`detallePresupuesto`) y de las
  utilidades de exportación **antes** que los componentes (interface-first, como Fases 4-5).
- Si "Ver resumen y presupuesto" **reemplaza** a "Siguiente" en el Paso 6 o se monta como botón
  aparte.

</decisions>

<specifics>
## Specific Ideas

- **Números de WhatsApp** (decididos por el usuario): pruebas `5492954555113` (Ignacio) / producción
  `5492302468754` (Impacar). El usuario quiere probar el envío real sin molestar a la fábrica.
- **Formato de precio objetivo:** `$29.108.976` (argentino, ya garantizado por `formatPrecio`).
- **Logo IMPACAR:** texto bold (placeholder), consistente con `Landing.jsx` (`tracking` amplio,
  `text-impacar-campo`).
- **Datos de contacto disponibles** (PROJECT.md): web `https://www.industriaimpacar.com/`, IG
  `@industriasimpacar`, "General Pico, La Pampa". No había teléfono en el repo hasta esta decisión.
- **Financiación:** las 3 opciones ya existen en `data/financiacion.js` (contado / financiado /
  permuta), solo texto.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap y requirements
- `.planning/ROADMAP.md` § "Phase 6: Resumen y Exportación" — goal y los 4 success criteria.
- `.planning/REQUIREMENTS.md` § Resumen + Exportación — RESUMEN-01/02/03, EXPORT-01/02 (texto
  autoritativo de cada requirement).
- `.planning/PROJECT.md` § "Constraints" (jsPDF vectorial, identidad visual, logo placeholder) y
  § "Context" (web/IG/ciudad de Impacar) y § "Datos reales" (modelos/precios/accesorios exactos).

### Datos reales y motor de precios (fuente de verdad, NO hardcodear)
- `src/data/models.js` — `MODELOS` (N1-N7 con `largo`, `precioNeto`) para la base del presupuesto y
  la etiqueta del modelo.
- `src/data/extras.js` — `EXTRAS` (`id`/`nombre`/`precioNeto`/`categoria` + metadato de subgrupo de
  Fase 5 D-08) para listar accesorios con su $ y agruparlos por categoría (D-04).
- `src/data/geometry.js` — `IVA` (0.21).
- `src/data/financiacion.js` — `FINANCIACION` (3 opciones para RESUMEN-03).
- `src/utils/motorPrecios.js` — `calcularPresupuesto(estado)` → `{ neto, iva, total }`. **A extender**
  con el helper de desglose ítem-por-ítem (D-05).
- `src/utils/formato.js` — `formatPrecio`, `calcularIVA`, `calcularTotal` (reusar, no recrear).

### Estado, ruteo y plano (a integrar)
- `src/App.jsx` — ruteo de vistas (`landing`/`wizard`); sumar `'resumen'` (D-01).
- `src/components/ConfiguratorWizard.jsx` — Paso 6 / `esUltimo`, callbacks `onVolverInicio`; sumar
  salida al resumen y `IR_A_PASO` por sección.
- `src/state/wizardReducer.js` — `estado` (modeloId, uso, ocupantes, bano, dormitorio.camas, extras),
  `configDesdeEstado` (proyección al plano), acción `IR_A_PASO` (deep-link de "Editar", D-02).
- `src/components/FloorPlan.jsx` — el SVG del plano que el PDF embebe como vector vía svg2pdf (D-11);
  consume `configDesdeEstado(estado)`.

### Patrones de UI a replicar (Fases 4-5)
- `src/components/wizard/BarraPrecio.jsx` — patrón presentacional puro `{ estado }` que llama a
  `motorPrecios` y formatea con `formato.js`; modelo directo para el bloque de presupuesto del resumen.
- `src/components/wizard/pasos/PasoBano.jsx` / `PasoExtras.jsx` — render data-driven desde `/data`
  (sin ids hardcodeados), trato de usted.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`motorPrecios.calcularPresupuesto`**: ya suma base + extras desde la única fuente
  (`estado.extras[]` + `modeloId`) y tolera estado adulterado (devuelve 0, nunca `$NaN`). El desglose
  (D-05) se construye sobre esta misma base, sin reimplementar la suma.
- **`BarraPrecio.jsx`**: el bloque de presupuesto del resumen es una variante "expandida" de esta
  barra (mismas líneas neto/IVA/total + el desglose por ítem).
- **`FloorPlan.jsx` + `configDesdeEstado`**: el plano del resumen y el del PDF son el MISMO SVG que ya
  se dibuja en el wizard — no hay dibujo nuevo, solo reuso.
- **`FINANCIACION`** (`data/financiacion.js`): RESUMEN-03 es renderizar este array.
- **Acción `IR_A_PASO`** (`wizardReducer`): habilita el deep-link "Editar" por sección (D-02) sin
  lógica nueva de navegación.

### Established Patterns
- Componentes presentacionales que reciben `{ estado, dispatch }`, leen de `/data` y formatean con
  `formato.js`; nada de ids ni precios literales en JSX (anti-hardcodeo).
- Lógica pura testeable (motores, helpers) **antes** que los componentes (interface-first), con
  `node:test` built-in y **sin dependencias de test nuevas**.
- Tolerancia a estado adulterado de localStorage (optional chaining + defaults seguros).
- Trato de usted y formato `$` argentino en todo el copy.

### Integration Points
- **`App.jsx`**: sumar `vista='resumen'` al ruteo de estado y el callback que la dispara desde el
  Paso 6.
- **`motorPrecios.js`**: nuevo helper de desglose (`detallePresupuesto`) junto a `calcularPresupuesto`.
- **`package.json`**: agregar `jspdf` + `svg2pdf.js` (primeras dependencias de runtime más allá de
  React) — el PDF es la única "dependencia pesada" justificada por PROJECT.md.
- **Nueva constante de contacto** (`src/data/contacto.js`): número de WhatsApp + web + IG + ciudad,
  consumida por el link `wa.me` y por el contacto del PDF.

</code_context>

<deferred>
## Deferred Ideas

- **Pulido mobile final y accesibilidad** del resumen y la exportación (teclado, contraste, ~375px de
  punta a punta) — **Fase 7**.
- **Swap del número a producción** (`5492302468754`) antes de la demo final a los dueños — tarea de
  configuración previa al go-live, no de implementación (queda documentada en la constante).
- **Integración real con CRM/GHL** para capturar el lead del resumen — **v2 (INT-01)**, fuera del MVP.
- **Variantes de layout pre-armadas por modelo** en el resumen — **v2 (PROD-02)**.

</deferred>

---

*Phase: 06-resumen-y-exportaci-n*
*Context gathered: 2026-06-27*
