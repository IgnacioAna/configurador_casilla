---
phase: 2
slug: motor-de-plano-svg
status: draft
shadcn_initialized: false
preset: none
created: 2026-06-27
---

# Phase 2 — UI Design Contract

> Contrato visual y de interacción del componente `FloorPlan` (plano en planta SVG cenital).
> Generado por gsd-ui-researcher, verificado por gsd-ui-checker.
> Cubre PLANO-01 (render SVG: paredes/puerta/ventanas/acotaciones, escala al viewport),
> PLANO-02 (transición suave ~300ms al cambiar props) y PLANO-04 (estructura fija de zonas +
> geometría real). PLANO-03 (colapsable/zoom mobile, sticky desktop) es Fase 3 — el plano se
> diseña acá para embeberse en ambos layouts, pero el comportamiento de contenedor no es de esta fase.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none (Vite + React 18 + Tailwind v3 — constraint del proyecto: SVG nativo, sin librerías de dibujo) |
| Preset | not applicable |
| Component library | none — `FloorPlan` es un componente SVG bespoke (un `<svg>` con `<g>`/`<rect>`/`<line>`/`<path>`/`<text>`) |
| Icon library | ninguna externa — íconos de equipamiento (ducha, inodoro, mesada, cocina, heladera) se dibujan como primitivas SVG minimalistas inline (no Lucide/Heroicons; performance y peso en mobile) |
| Font | Inter (token `font-sans` ya definido en tailwind.config.js); en `<text>` del SVG usar `font-family: Inter, system-ui, sans-serif` o la clase `font-sans` heredada |

**Nota shadcn gate:** proyecto React/Vite sin `components.json`. No se inicializa shadcn en esta
fase: el entregable es un único componente de dibujo SVG (no hay bloque shadcn que renderice un
plano), el constraint del proyecto exige render SVG nativo sin librerías pesadas, y la identidad
es "sobria/industrial, no startup tech". `Tool: none`. Registry safety gate: no aplica.

---

## Spacing Scale

Escala de 8 puntos para el **chrome alrededor del plano** (padding del contenedor, gap leyenda,
margen de etiquetas de cota respecto del dibujo). Múltiplos de 4.

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gap ícono↔texto en la leyenda; padding interno de chips de leyenda |
| sm | 8px | Separación entre swatch de color y label de zona en la leyenda; gap entre filas de leyenda |
| md | 16px | Padding interno del contenedor del plano (`padding` del wrapper alrededor del `<svg>`) |
| lg | 24px | Separación vertical entre el bloque del plano y la leyenda |
| xl | 32px | (reservado para layout de fases siguientes) |
| 2xl | 48px | (reservado) |
| 3xl | 64px | (reservado) |

**Espaciado interno del SVG (sistema de coordenadas propio, NO la escala de 8pt):**
El interior del `<svg>` usa unidades de "viewBox" derivadas de metros, no px de la escala de
spacing. Ver "Sistema de coordenadas SVG" más abajo. La escala de 8pt aplica solo al HTML que
envuelve el SVG (wrapper, leyenda, controles futuros).

Exceptions:
- **Padding del viewBox (margen para las cotas):** `12` unidades de viewBox a cada lado del
  dibujo de la casilla, reservado para las líneas de cota y sus números. No es un múltiplo de la
  escala de 8pt porque vive en el espacio de coordenadas del SVG, no en px del layout.
- **Touch target mínimo (preparación PLANO-03):** cualquier control HTML futuro sobre el plano
  (botón colapsar/zoom) debe ser ≥44px. En Fase 2 no hay controles interactivos, solo se reserva.

---

## Typography

Tipografía del **texto dentro del SVG** (números de cota, etiquetas de zona, etiquetas de cama
C/S/M, leyenda). Inter en dos pesos. Los tamaños se expresan en **unidades de viewBox** (escalan
con el plano vía `vector-effect`/escala uniforme) salvo la leyenda HTML, que va en px.

| Role | Size | Weight | Line Height |
|------|------|--------|-------------|
| Display — n/a en esta fase | — | — | — (el plano no tiene títulos display propios) |
| Heading — etiqueta de zona dentro del plano ("BAÑO", "DORMITORIO", "COCINA", "ESTAR", "BAULERA") | 11 unidades viewBox (uppercase, letter-spacing 0.5) | semibold (600) | 1.2 |
| Body — número de cota en metros ("2.60 m", "6.60 m", "0.80") | 10 unidades viewBox | regular (400) | 1.2 |
| Label — etiqueta de cama dentro del rectángulo ("C" / "S" / "M") y leyenda HTML | 12px (leyenda HTML) · 14 unidades viewBox (etiqueta de cama, centrada) | semibold (600) | 1.2 |

**Reglas:**
- Exactamente **3 tamaños efectivos** dentro del SVG (10, 11, 14 unidades viewBox) + 12px en la
  leyenda HTML. Exactamente **2 pesos**: regular 400 (cotas) y semibold 600 (etiquetas).
- Line-height de cuerpo/etiqueta: 1.2 (texto técnico de croquis, no prosa; no aplica 1.5).
- Las etiquetas de cota deben permanecer **legibles a ~340px de ancho de contenedor** (target
  Samsung ~6"). Regla: si el ancho renderizado del `<svg>` < 360px, el número de cota nunca debe
  caer por debajo de ~9px efectivos en pantalla — preferir abreviar (mostrar "2.60" y un único
  rótulo "m" en la leyenda) antes que encoger el texto por debajo de ese piso.
- `text-anchor="middle"` para etiquetas de zona y de cama; cotas centradas sobre su línea de cota.

---

## Color

El plano hereda la paleta Impacar ya definida en `tailwind.config.js`. **No se introducen colores
nuevos.** Reparto 60/30/10 dentro del componente del plano:

| Role | Value | Usage |
|------|-------|-------|
| Dominant (60%) | `#F5F5F0` (`impacar.fondo`) | Fondo del `<svg>` / del contenedor del plano; relleno de zonas neutras (baulera, estar/comedor) en un tono apenas diferenciado |
| Secondary (30%) | Rellenos de zona: baño `#BFE3EE` (`zona.bano`), dormitorio `#C9A66B` (`zona.dormitorio`), cocina `#A7C796` (`zona.cocina`) | Relleno de los bloques de zona que identifican el ambiente; ocupan el grueso del área dibujada |
| Accent (10%) | `#8B6914` (`impacar.cobre`) | Ver lista reservada abajo |
| Destructive | n/a en esta fase | El plano no tiene acciones destructivas (es presentacional, render desde props mock) |

**Trazo / líneas (no son "color de marca", son tinta de croquis):**

| Elemento | Stroke | Ancho (unidades viewBox) | Nota |
|----------|--------|--------------------------|------|
| Pared exterior | `#1A1A1A` (`impacar.texto`) | **3** (gruesa) | Recomendación — define el perímetro de la casilla; es el trazo más grueso |
| Divisor de zona (líneas internas entre ambientes) | `#1A1A1A` al 55% (o `#6B6B66`) | **1** (fina) | Recomendación — separa zonas sin competir con la pared exterior |
| Contorno de módulos (camas, mesada, mesa) | `#1A1A1A` al 70% | **1** | Recomendación |
| Arco de puerta + hoja | `#1A1A1A` al 70% | **1.25** | Arco fino que indica el barrido de apertura |
| Cruz de ventana (líneas finas cruzadas) | `#1A1A1A` al 60% | **0.75** | Recomendación |
| Línea de cota + ticks | `#8B6914` (cobre, accent) | **0.75** | Las cotas usan el accent para leerse como "capa de medición" sobre el dibujo |
| Mesa rebatible (borde punteado) | `#1A1A1A` al 70% | **1**, `stroke-dasharray="3 2"` | Punteado = rebatible; sólido = fija |

**Rellenos de zona (referencia para el executor):**

| Zona | Fill | Token |
|------|------|-------|
| Baulera (0.60m, extremo) | `#ECECE4` (neutro, fondo apenas oscurecido) — recomendación | derivado de `impacar.fondo` |
| Baño | `#BFE3EE` | `zona.bano` |
| Dormitorio | `#C9A66B` | `zona.dormitorio` |
| Estar/comedor | `#ECECE4` (neutro) — recomendación | derivado de `impacar.fondo` |
| Cocina (0.60m, extremo) | `#A7C796` | `zona.cocina` |
| Cama / cucheta (dentro del dormitorio) | `#B5915A` (marrón un punto más saturado que la zona, para destacar sobre `zona.dormitorio`) — recomendación | derivado de `zona.dormitorio` |

**Accent (`#8B6914` cobre) reservado exclusivamente para:**
- Las **líneas de cota y sus números/ticks** (la "capa de medición" del croquis).
- El **swatch/borde de la zona activa o resaltada** si en fases futuras se resalta una zona (no se
  usa en Fase 2; reservado).
- **Nunca** para rellenos de zona, paredes, ni texto de etiquetas de ambiente. El accent es la
  tinta de acotación, no decoración general.

**Contraste:** las etiquetas de zona (`#1A1A1A` sobre `#BFE3EE` / `#C9A66B` / `#A7C796`) deben
mantener contraste legible. `#1A1A1A` sobre los tres rellenos supera 4.5:1 — usar siempre texto
oscuro sobre los rellenos de zona, nunca texto claro.

---

## Copywriting Contract

El `FloorPlan` es presentacional y en Fase 2 se alimenta con una **config mock** (el wizard llega
en fases posteriores), por lo que tiene poco copy de UI. El copy declarado acá es el que aparece
**dentro o junto al plano**. Todo en español argentino, trato de usted, sobrio/técnico.

| Element | Copy |
|---------|------|
| Primary CTA | n/a en esta fase — el plano no tiene CTA propio (los controles llegan en Fase 3). Si la demo de la fase necesita un disparador para cambiar la config mock, usar el verbo+sustantivo: **"Cambiar modelo"** |
| Etiquetas de zona (dentro del plano) | "BAULERA" · "BAÑO" · "DORMITORIO" · "ESTAR" · "COCINA" (mayúsculas, sobrias) |
| Etiquetas de cama | "C" (cucheta marinera) · "S" (cama simple) · "M" (matrimonial) — con leyenda que las expande |
| Cotas | Formato en metros con coma decimal y "m": "2,60 m", "6,60 m", "0,80 m". Largo total, ancho total y largo por zona |
| Leyenda (mapeo color→zona) | "Baño" · "Dormitorio" · "Cocina" · "Estar/comedor" · "Baulera" + "C cucheta · S simple · M matrimonial" |
| Empty state heading | "Sin configuración" |
| Empty state body | "Elegí un modelo para ver el plano de tu casilla." (se mostrará realmente al integrar el wizard; en Fase 2 el componente igual debe renderizar este estado si recibe `config` nula/incompleta) |
| Error state | "No se pudo dibujar el plano. Revisá el modelo seleccionado e intentá de nuevo." (problema + acción; cubre el caso de geometría inválida en la config) |
| Destructive confirmation | n/a — el plano no tiene acciones destructivas en esta fase |

---

## Sistema de coordenadas SVG (contrato técnico de render)

> Sección específica de esta fase (no está en el template estándar pero es load-bearing para el
> executor; PLANO-01 y PLANO-04 dependen de ella).

- **viewBox proporcional:** el `<svg>` usa `viewBox="0 0 W H"` con `preserveAspectRatio="xMidYMid meet"`
  y `width="100%"` para escalar al contenedor (PLANO-01: "escala al viewport"). El alto del
  contenedor se ajusta por aspect-ratio del modelo, no fijo.
- **Escala metros→unidades:** factor único **100 unidades de viewBox = 1 metro** (recomendación).
  Así N4 (6.60m × 2.60m) → dibujo de 660 × 260 unidades, más el padding de cotas de 12 a cada lado
  → `viewBox` ≈ `0 0 684 284`. El factor es uniforme en X e Y (sin distorsión).
- **Orientación:** el **largo va en X (horizontal)**, el **ancho 2.60m ext / 2.52m interior en Y
  (vertical)**. Origen arriba-izquierda (convención SVG).
- **Estructura fija de zonas a lo largo de X (orden inmutable):**
  `baulera 0.60m | baño | dormitorio | estar/comedor | cocina 0.60m`. Baulera y cocina tienen largo
  fijo 0.60m; baño, dormitorio y estar reparten el largo restante (el reparto exacto por modelo se
  define en la config; el baño SIEMPRE va entre baulera y dormitorio — posición fija, no elegible).
- **Geometría real del dormitorio:** ancho interior **2.52m** = cama 0.80m (pared superior) +
  pasillo 0.92m + cama 0.80m (pared inferior). Las camas corren **2.00m sobre X** contra cada pared
  larga, con corredor central de 0.92m. El executor debe ubicar las camas usando estas constantes
  desde `src/data/geometry.js` (`anchoCama 0.8`, `pasilloCentral 0.92`, `largoCama 2.0`), nunca
  hardcodeadas.
- **Pared exterior:** rectángulo de 2.60m de alto (Y) × largo total del modelo (X). El interior
  útil 2.52m define dónde arrancan los módulos (espesor de pared = (2.60−2.52)/2 = 0.04m a cada
  lado).
- **Puerta de entrada:** sobre **una pared larga** (lateral), dibujada como interrupción de la
  pared + `<path>` de arco (cuarto de círculo) que indica el barrido de apertura. Recomendación:
  ubicarla en la zona de estar/comedor.
- **Ventanas:** interrupciones en la pared con **dos líneas finas cruzadas** (X pequeña) o doble
  línea paralela fina dentro del hueco. Recomendación: una por dormitorio y una por cocina/estar.
- **Acotaciones:** líneas de cota con ticks en los extremos y número centrado, en cobre (accent):
  (1) largo total abajo, (2) ancho total 2.60m a un lado, (3) largo de cada zona como cotas
  segmentadas a lo largo de X. Las cotas viven en el padding de 12 unidades reservado.
- **Leyenda:** bloque HTML debajo del SVG (no dentro) que mapea swatch de color → nombre de zona y
  expande C/S/M. Opcional pero recomendada; usa la escala de spacing de 8pt.

---

## Animación / Transición (PLANO-02)

> Contrato de interacción de esta fase.

- **Regla:** al cambiar las props (`largo`, reparto de zonas, presencia/posición de módulos), los
  elementos del plano transicionan suavemente, **~300ms con easing `ease-in-out`** (recomendación:
  `cubic-bezier(0.4, 0, 0.2, 1)`). Sin saltos bruscos.
- **Qué se anima:**
  - **Posición/tamaño de los módulos y zonas:** `x`, `y`, `width`, `height` de `<rect>` de zonas,
    camas, mesada, mesa → vía `transition: x 300ms, y 300ms, width 300ms, height 300ms` (CSS sobre
    los atributos de presentación SVG) o `transform` translate/scale.
  - **Opacidad** de módulos que aparecen/desaparecen al cambiar de modelo: `opacity 0→1` / `1→0`
    en 300ms (fade-in/out), para que agregar o quitar una cama no "parpadee".
  - **Líneas de cota y números:** acompañan el cambio de largo con la misma transición (reposición
    suave), no reaparecen de golpe.
- **Qué NO se anima:** el `viewBox` en sí no se anima por frame (puede reflowear de golpe al cambiar
  drásticamente de modelo); lo que se anima es el contenido. El trazo de las paredes no cambia de
  ancho con la animación.
- **Respeto a accesibilidad:** envolver las transiciones en una verificación de
  `prefers-reduced-motion: reduce` → si el usuario lo pide, desactivar las transiciones (cambio
  instantáneo). Recomendación, alineada con UX-02 de fases posteriores.
- **Performance:** preferir animar `transform`/`opacity` sobre re-layout cuando sea posible; SVG
  nativo, sin librerías de animación. Mantener el número de nodos SVG acotado (un croquis claro,
  no un render arquitectónico) para que la transición sea fluida en un Samsung de gama media.

---

## Estados del componente

| Estado | Qué muestra |
|--------|-------------|
| Normal (config válida) | Plano completo: paredes, zonas con color, camas C/S/M, módulos de baño/cocina, puerta, ventanas, cotas, leyenda |
| Empty (config nula/incompleta) | Mensaje "Sin configuración" + "Elegí un modelo para ver el plano de tu casilla." (centrado en el área del plano) |
| Error (geometría inválida) | Mensaje de error: "No se pudo dibujar el plano. Revisá el modelo seleccionado e intentá de nuevo." |
| Transición | Estado intermedio animado de 300ms entre dos configs válidas (ver Animación) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | none — shadcn no inicializado en esta fase | not applicable |
| third-party | none declarado | not applicable |

No hay registries de terceros ni bloques externos. El componente `FloorPlan` es 100% código propio
(SVG nativo + Tailwind). Sin vetting gate requerido.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
