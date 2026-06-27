# Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios) - Context

**Gathered:** 2026-06-27
**Status:** Ready for planning

<domain>
## Phase Boundary

El usuario completa los pasos finales de configuración del wizard (Paso 4 dormitorio, Paso 5
cocina/estar, Paso 6 extras) y entran en línea **dos motores nuevos**:

1. **Motor de validación de capacidad de camas** — valida la combinación de camas contra la
   geometría real (interior 2,52m, camas 0,80m, 2 por fila + pasillo 0,92m, largo de la zona
   dormitorio = `restante × 0.45`).
2. **Motor de precios (presupuesto en vivo)** — base del modelo + accesorios, mostrado neto +
   IVA 21% + total c/IVA en formato argentino, actualizándose en vivo.

El plano refleja las camas (ya cableado) y, de forma liviana, los módulos de cocina/estar.

**Requirements de la fase:** DORM-01, DORM-02, DORM-03, COCINA-01, COCINA-02, COCINA-03,
COCINA-04, EXTRAS-01, PRECIO-01.

**NO es de esta fase** (scope creep → otras fases): pantalla de Resumen, financiación, WhatsApp,
PDF (Fase 6); pulido mobile/accesibilidad final (Fase 7). Tampoco ubicación libre del baño ni
precios editables por fábrica (out of scope del proyecto).

</domain>

<decisions>
## Implementation Decisions

### Paso 4 — Dormitorio / armado de camas (DORM-01/02/03)
- **D-01:** Input por **contadores +/− por tipo**: una fila por tipo (Cucheta marinera `C` /
  Simple `S` / Matrimonial `M`) con stepper. Mapea directo a `estado.dormitorio.camas` como
  `Array<{ tipo: 'C'|'S'|'M' }>`. Mobile-friendly.
- **D-02:** **Matrimonial máx 1** (regla del catálogo). El contador de matrimonial se topea en 1.
- **D-03:** Validación de capacidad con **aviso pero sin bloqueo**: si la combinación no entra en
  el largo del dormitorio, mostrar una advertencia clara (estilo "No entran en el modelo Nx;
  considere un modelo más largo") pero **permitir avanzar** igual. Es una demo y el asesor
  confirma. No deshabilitar el botón Siguiente por capacidad.
- **D-04:** El plano **ya dibuja** `config.dormitorio.camas` (2 filas alternadas contra cada
  pared larga, `Bed.jsx` con etiqueta C/S/M). El Paso 4 solo debe **escribir** las camas en el
  estado vía `SET_CAMPO`; el plano reacciona solo (DORM-03 casi cableado).

### Paso 5 — Cocina, heladera y estar (COCINA-01/02/03/04)
- **D-05:** **Heladera = selector segmentado exclusivo** ("Sin / 220V A++ / 12V c/pantalla"),
  tipo radio: elegir una quita la otra; "Sin" es el default (ninguna). Imposible elegir dos
  heladeras a la vez. Ids reales: `heladera-220`, `heladera-12v` (categoria `cocina`).
- **D-06:** **Cocina con horno industrial** = toggle opcional (`cocina-horno`). Elementos del
  estar = toggles: mesa de caño (`mesa-cano`), banco despensero (`banco-despensero`).
- **D-07:** El plano refleja cocina/estar de forma **liviana, reusando subcomponentes existentes**
  (Fase 2): `Kitchen.jsx` (cocina/horno) en la zona cocina verde, y `Table.jsx` (mesa) en el
  estar; un ícono de heladera cuando se elige. Esquemático, sin recargar. (COCINA-04)

### Paso 6 — Extras de confort/energía (EXTRAS-01)
- **D-08:** Los 9 extras (`categoria: 'extras'`) se presentan **agrupados en dos subgrupos con
  encabezado: "Confort" y "Energía"**. El split debe ser **data-driven** (sin lista de ids
  hardcodeada en el componente) — p.ej. agregando un sub-campo/metadato a `EXTRAS` en
  `data/extras.js`, o una regla derivada. (Confort: calefactor, split, TV, estéreo, cortinas,
  toldo, caldera. Energía: panel solar, sistema solar 220.)
- **D-09:** Los extras de confort/energía **no se dibujan en el plano** (no tienen footprint en
  la vista cenital): solo afectan el presupuesto y aparecerán listados en el Resumen (Fase 6).

### Motor de precios — presupuesto en vivo (PRECIO-01)
- **D-10:** **Barra/chip sticky compacto** que aparece **recién desde el Paso 4** (sticky abajo en
  mobile, junto al plano en desktop) y se actualiza al tocar opciones. **No** aparece en los
  Pasos 1-3 (la regla "sin precios" de la Fase 4 se preserva para los pasos 1-3).
- **D-11:** Durante los pasos muestra **total corriendo**: neto + IVA 21% + total c/IVA (3
  líneas), en formato argentino (`$29.108.976`). El **desglose ítem por ítem** (base + cada
  accesorio) se **reserva para la pantalla de Resumen (Fase 6)** — los pasos quedan livianos.
- **D-12:** El total = `MODELOS.find(modeloId).precioNeto` **+ suma de `precioNeto` de todos los
  accesorios seleccionados** en `extras[]` (incluido el equipamiento de baño del Paso 3 que ya
  vive en `extras[]`). Reusar `formato.js` (`formatPrecio`, `calcularIVA`, `calcularTotal`).

### Modelo de datos — selecciones → `extras[]` (decisión transversal)
- **D-13:** **Todas las selecciones de accesorios de esta fase se guardan como ids en
  `estado.extras[]`** (misma técnica inmutable del baño en Fase 4): horno, heladera (una sola),
  mesa, banco, y los extras de confort/energía. **Una sola fuente de verdad** para el motor de
  precios (suma un único array).
- **D-14:** `configDesdeEstado(estado)` debe **derivar del `extras[]`** lo que el plano necesita
  para dibujar (¿hay horno?, ¿qué heladera?, ¿hay mesa?), en vez de leer `estado.cocina`/
  `estado.estar`. Los sub-campos placeholder `cocina:{horno,heladera}` y `estar:{mesa}` de
  `estadoInicial` se **reemplazan/derivan** (research/planner deciden si se eliminan o se mantienen
  como proyección derivada). El motor de precios y el resumen no deben sumar de dos lugares.

### Claude's Discretion (research/planner deciden)
- **Modelado geométrico del matrimonial**: cómo ocupa el ancho/footprint en el plano y en la
  validación (interior 2,52m = 0,80 + pasillo 0,92 + 0,80). Respetar "esquemático, no
  arquitectónico". Definir cuántos "footprints" consume cada tipo (cucheta marinera / simple /
  matrimonial) y la fórmula de capacidad por largo de zona (≈ `2 × floor(largoDormitorio /
  largoCama)` en footprints, ajustado según el modelado del matrimonial).
- **Comportamiento de N5/N6/N7 "personalizables"**: aplicar la misma lógica geométrica (mayor
  largo → mayor capacidad) y/o una nota "a medida"; elegir lo más simple y consistente.
- **Detalle del enchufe**: orden de waves (lógica pura/motores antes que componentes, como en la
  Fase 4), y si el split confort/energía se modela con metadato en `EXTRAS` o regla derivada.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Roadmap y requirements
- `.planning/ROADMAP.md` § "Phase 5" — goal y los 5 success criteria de la fase.
- `.planning/REQUIREMENTS.md` § Pasos 4/5/6 + Precio — DORM-01/02/03, COCINA-01/02/03/04,
  EXTRAS-01, PRECIO-01 (texto autoritativo de cada requirement).
- `.planning/PROJECT.md` § "Datos reales (Lista 108)" — modelos, geometría y catálogo de
  accesorios con precios netos exactos (fuente de los `/data`).

### Datos reales (fuente de verdad, NO hardcodear)
- `src/data/models.js` — `MODELOS` (N1-N7 con `largo`, `camasBase`, `precioNeto`, `personalizable`),
  `SUGERENCIA_OCUPANTES`.
- `src/data/extras.js` — `EXTRAS` con `id`/`nombre`/`precioNeto`/`categoria`
  (`bano`|`dormitorio`|`cocina`|`extras`). Las selecciones de la fase se guardan por estos ids.
- `src/data/geometry.js` — `GEOMETRIA` (anchoInterior 2.52, anchoCama 0.80, largoCama 2.00,
  pasilloCentral 0.92, zonaBaulera/zonaCocina 0.60) + `IVA` (0.21). Base de la validación de camas.
- `src/utils/formato.js` — `formatPrecio` (formato argentino), `calcularIVA`, `calcularTotal`.

### Motor del plano y estado (a extender)
- `src/utils/floorplanLayout.js` — `calcularLayout`: ya computa la zona dormitorio
  (`largoDormitorio = restante × 0.45`) y mapea `config.dormitorio.camas` a 2 filas. Acá se valida
  la capacidad y, si aplica, se reflejan módulos de cocina/estar.
- `src/state/wizardReducer.js` — `estado` (`dormitorio.camas`, `cocina`, `estar`, `extras`),
  `ACCIONES.SET_CAMPO`, y `configDesdeEstado` (proyección al `config` del plano — a ajustar por D-14).
- `src/components/FloorPlan.jsx` + `src/components/FloorPlanElements/` — `Bed.jsx` (camas C/S/M),
  `Kitchen.jsx` (cocina), `Table.jsx` (mesa) ya existen para el reflejo del plano (D-07).

### Patrones de UI a replicar (Fase 4)
- `src/components/wizard/pasos/PasoBano.jsx` — patrón de paso presentacional `{ estado, dispatch }`,
  checkboxes data-driven (`EXTRAS.filter`), toggle inmutable en `extras[]`, chip segmentado con
  estado. Modelo directo para Pasos 4-6.
- `src/components/wizard/pasosRegistro.jsx` — registro de pasos; las entradas 4-6 siguen `StubPaso`
  y deben enchufarse a los componentes reales (contrato SHELL-02, file ownership exclusivo del plan
  que enchufa).
- `src/components/wizard/PlanoPanel.jsx` — panel del plano (sticky desktop / colapsable mobile),
  candidato para hospedar la barra de precio en desktop (D-10).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **`formato.js`**: el motor de precios es básicamente componer `precioNeto` del modelo + suma de
  extras y pasar por `calcularIVA`/`calcularTotal`/`formatPrecio`. No requiere lógica nueva de
  formato.
- **`Bed.jsx` / `Kitchen.jsx` / `Table.jsx`** (Fase 2): subcomponentes SVG ya construidos para
  dibujar camas y módulos de cocina/estar — el reflejo del plano se hace reusándolos, no creando
  dibujo nuevo.
- **Toggle inmutable en `extras[]`** (Fase 4, PasoBano): patrón listo para horno/heladera/mesa/
  banco y los extras de confort/energía.

### Established Patterns
- Pasos presentacionales que reciben `{ estado, dispatch }`, leen de `/data`, despachan `SET_CAMPO`;
  el plano reacciona vía `configDesdeEstado` **sin props nuevas** (no acoplar el paso al plano).
- Lógica pura testeable (validación de camas, motor de precios) **antes** que los componentes
  (interface-first, como en Fase 4). `node:test` built-in, **sin dependencias nuevas**.
- Data-driven / anti-hardcodeo: nada de ids ni medidas literales en componentes; todo de `/data` y
  `GEOMETRIA`. Trato de usted en todo el copy.
- Tolerancia a estado adulterado de localStorage con optional chaining + defaults seguros
  (`esEstadoValido` endurecido en Fase 4 ya exige `bano` objeto y `extras` array).

### Integration Points
- **`configDesdeEstado`** (wizardReducer): punto donde el estado se proyecta al plano — hay que
  derivar de `extras[]` los módulos de cocina/estar (D-14).
- **`pasosRegistro.jsx`**: enchufe de los 3 componentes nuevos reemplazando los `StubPaso` 4-6.
- **Barra de precio**: nuevo componente que lee `estado` (modeloId + extras) y se muestra desde el
  Paso 4; ubicación sticky mobile / junto al plano desktop.

</code_context>

<specifics>
## Specific Ideas

- Etiquetas de cama C/S/M ya existen en `Bed.jsx` (cucheta/simple/matrimonial).
- Formato de precio objetivo: `$29.108.976` (argentino, punto de miles, sin decimales) — ya
  garantizado por `formatPrecio`.
- Heladeras reales y mutuamente excluyentes: `heladera-220` ($1.699.000) vs `heladera-12v`
  ($1.690.000); "Sin" = ninguna.
- Sub-etiquetas de extras: Confort vs Energía (de PROJECT.md § Accesorios).

</specifics>

<deferred>
## Deferred Ideas

- **Pantalla de Resumen** con desglose ítem por ítem (base + cada accesorio), financiación,
  WhatsApp y PDF — **Fase 6** (el presupuesto en vivo de esta fase solo muestra el total corriendo).
- **Pulido mobile final y accesibilidad** (teclado, contraste, ~375px de punta a punta) — **Fase 7**.
- Posibles micro-decisiones diferidas a research/planner: copy exacto de la advertencia de
  capacidad, comportamiento del total al borrar una cama, orden visual de los módulos en el plano.

</deferred>

---

*Phase: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios*
*Context gathered: 2026-06-27*
