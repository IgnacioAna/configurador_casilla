# Configurador Visual de Casillas Rurales Impacar

## What This Is

Configurador web (MVP/demo, sin backend) para Industrias Impacar — fabricante de casillas
rurales a medida de General Pico, La Pampa. Guía al cliente a través de un wizard de 6 pasos,
muestra un plano en planta (SVG, vista cenital) que se actualiza en tiempo real, y al final
genera un resumen con croquis + presupuesto estimado que se puede enviar por WhatsApp o
descargar en PDF. El público objetivo son contratistas rurales, productores agropecuarios y
estancieros que hoy configuran su casilla por WhatsApp con audios y croquis a mano.

## Core Value

El cliente ve su casilla tomar forma visualmente (plano en planta en vivo) mientras la
configura paso a paso, y termina con un resumen + presupuesto listo para enviar — reemplazando
el ida y vuelta de audios y croquis por WhatsApp.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Landing de bienvenida con identidad Impacar y CTA "Comenzar" — v1.0
- ✓ Wizard de 6 pasos: uso/ocupantes, dimensiones, baño, dormitorio, cocina/estar, extras — v1.0
- ✓ Plano en planta SVG con **estructura fija de zonas** que se actualiza en tiempo real — v1.0
- ✓ Sugerencia automática de largo según cantidad de ocupantes (editable) — v1.0
- ✓ Reglas de disponibilidad por modelo (baño ampliado, opciones de cocina, personalización N5+) — v1.0
- ✓ Motor de validación de capacidad de camas por modelo (geometría real 2.52m / camas 0.80m) — v1.0
- ✓ Motor de precios (base + accesorios) neto + IVA 21% + total, formato `$` argentino — v1.0
- ✓ Pantalla de resumen: plano final + configuración + presupuesto desglosado + financiación — v1.0
- ✓ Exportar por WhatsApp (link `wa.me` con mensaje pre-armado) — v1.0
- ✓ Descargar resumen en PDF (jsPDF + svg2pdf, plano vectorial, logo + contacto) — v1.0
- ✓ Persistencia del estado del wizard en `localStorage` — v1.0
- ✓ Responsive mobile-first (~375px), plano colapsable en mobile / sticky en desktop — v1.0
- ✓ Accesibilidad (labels, contraste ≥4.5:1, teclado end-to-end, reduced-motion) y animaciones suaves del SVG — v1.0

### Active

<!-- Current scope. Building toward these. Próximo milestone se define con /gsd-new-milestone. -->

(Milestone v1.0 completo. Las requirements del próximo ciclo se definen con `/gsd-new-milestone`.
Candidatos en evaluación — ver Out of Scope: integración CRM/GHL, render 3D, variantes de layout
pre-armadas, precios editables por la fábrica.)

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Backend / base de datos — es un MVP/demo 100% client-side
- Login / cuentas de usuario — no hace falta para la prueba de concepto
- Integración real con CRM/GHL — fuera del alcance de la demo
- Cálculo de flete / envío — el precio final lo define el asesor comercial
- Reserva / pago online — la conversión es por WhatsApp, no transaccional
- Chat en vivo — el canal de contacto es WhatsApp
- Render 3D — el plano es 2D en planta (vista cenital), por claridad y peso
- Ubicación de baño libre (adelante/atrás/centro) — el catálogo real fija la estructura de zonas

## Context

- **Cliente:** Industrias Impacar, General Pico, La Pampa, Argentina. Sitio:
  https://www.industriaimpacar.com/ — IG: https://www.instagram.com/industriasimpacar/
- **Diferencial del negocio:** cada casilla se diseña a pedido (largo, distribución de camas,
  equipamiento, accesorios). El catálogo muestra múltiples variantes por modelo (N4/N5/N6/N7
  tienen 3 layouts cada uno) — la personalización es el corazón del negocio.
- **Proceso actual:** configuración por WhatsApp con audios, fotos de croquis a mano, mucho
  ida y vuelta. El configurador busca reemplazar eso con una herramienta visual autoguiada.
- **Público:** ~80% navega desde el celular (productores rurales con Samsung de gama media) →
  mobile-first no negociable.
- **Estructura fija de la casilla (del catálogo):** todas tienen baulera (0.60m) en un extremo
  y cocina (0.60m) en el otro. El baño va siempre entre la baulera y el dormitorio; el
  estar/comedor entre el dormitorio y la cocina. Lo que varía es el largo de cada zona y la
  distribución de camas. Del N5 en adelante las camas son "opcionales" (más personalizables).
- **El plano es el corazón del producto** — debe ser claro y esquemático, no
  arquitectónicamente perfecto (nota explícita del cliente).
- **Objetivo inmediato:** presentar la demo a los dueños de la fábrica como prueba de concepto.

### Estado actual (post v1.0)

- **v1.0 MVP SHIPPED (2026-06-28)** — las 7 fases del roadmap completas y verificadas PASSED.
- Codebase: ~3.835 LOC (JS/JSX/CSS), Vite + React 18 + Tailwind v3; deps de runtime: React + `jspdf` + `svg2pdf.js`.
- 100 tests (`node:test`, sin deps de test); build verde; UAT E2E a 375px aprobado.
- **Pendiente pre-go-live:** crear `.env.production` con `VITE_WA_NUMBER=5492302468754` (swap del WhatsApp de pruebas al real de Impacar) antes de la demo a los dueños.
- Candidatos v2 (ver Out of Scope): integración CRM/GHL, render 3D, variantes de layout pre-armadas, precios editables por la fábrica.

## Datos reales (Lista 108 — Febrero 2026)

> Fuente autoritativa para `data/models.js` y `data/extras.js`. **Precios netos (+ IVA 21%).**
> Reemplazan por completo los placeholders del prompt original (los reales son 2-3x más altos).

### Modelos (ancho exterior fijo 2.60m — transporte vial)

| Modelo | Largo | Camas (base) | Precio neto |
|--------|-------|--------------|-------------|
| N1 | 4.50m | 2 | $29.108.976 |
| N2 | 5.20m | 2 | $34.150.926 |
| N3 | 6.10m | 3 | $37.181.710 |
| N4 | 6.60m | 4 | $38.971.845 |
| N5 | 7.60m | Opcional (personalizable) | $40.937.114 |
| N6 | 8.60m | Opcional (personalizable) | $42.048.149 |
| N7 | 9.60m | Opcional (personalizable) | $46.180.786 |

### Geometría (clave para el plano y la validación de camas)

- **Ancho interior útil: 2.52m** (el 2.60m es exterior).
- **Camas: 0.80m de ancho estándar**, 2.00m de largo.
- Contra las paredes laterales (largas) entran **exactamente 2 camas de 0.80m con un pasillo
  central de 0.92m** (0.80 + 0.92 + 0.80 = 2.52). Las camas corren a lo largo (2.00m sobre el
  eje del largo) contra cada pared larga.
- **Cucheta marinera** = litera (2 plazas apiladas, mismo footprint en planta).

### Accesorios (precios netos + IVA)

| Accesorio | Precio neto | Paso sugerido |
|-----------|-------------|---------------|
| Inodoro con depósito y cámara séptica | $495.000 | Baño |
| Vanitory completo con espejo | $283.294 | Baño |
| Cajonera bajo cama (x4) | $322.000 | Dormitorio |
| Cocina con horno industrial | $585.800 | Cocina/estar |
| Heladera con freezer 220V cat A++ | $1.699.000 | Cocina/estar |
| Heladera con freezer 12V + pantalla + regulador | $1.690.000 | Cocina/estar |
| Mesa de caño + melamina + aluminio | $218.000 | Cocina/estar |
| Banco despensero | $172.098 | Cocina/estar |
| Calefactor 4000 CAL | $342.000 | Extras/confort |
| Caldera 12V a gasoil | $718.000 | Extras/confort |
| Split frío/calor 3200 frigorías inverter | $1.550.000 | Extras/confort |
| Panel solar 160W + regulador 30A (12V) | $410.000 | Extras/energía |
| Sistema solar 220 off grid (inv 3kVA, 4 paneles 485W, 2 baterías litio 100Ah) | $6.755.000 | Extras/energía |
| TV 32" con DirecTV | $458.000 | Extras/confort |
| Mueble estéreo Pioneer + parlantes + antena | $328.220 | Extras/confort |
| Cortinas roller black out (habitación y cocina) | $483.600 | Extras/confort |
| Toldo | $496.011 | Extras/confort |

## Constraints

- **Tech stack**: Vite + React 18 (hooks) + Tailwind CSS v3 — stack liviano, sin backend.
- **Render del plano**: SVG nativo (sin librerías de dibujo pesadas) — performance en mobile.
- **PDF**: jsPDF con el plano como vector — única dependencia "pesada", justificada por el
  requisito de descarga de archivo real.
- **Sin backend**: todo client-side; el estado vive en `localStorage` (key `impacar_config_v1`).
- **Idioma**: español argentino, trato de usted (contexto comercial rural).
- **Estructura de zonas fija**: baulera 0.60m | baño | dormitorio | estar/comedor | cocina 0.60m.
- **Geometría real**: ancho exterior 2.60m, interior útil 2.52m, camas 0.80m, pasillo 0.92m.
- **Precios**: netos de Lista 108 (Feb-2026); el presupuesto muestra neto + IVA 21% + total.
- **Identidad visual**: sobria/industrial (catálogo de maquinaria agrícola, no startup tech).
  Paleta fondo #F5F5F0, verde campo #2D5016, cobre #8B6914, texto #1A1A1A. Zonas del plano:
  baño celeste, dormitorio marrón, cocina verde. Logo: texto "IMPACAR" bold (placeholder).
- **Mobile-first**: el target es un Samsung ~6"; el plano debe ser colapsable/zoomable en mobile.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite + React 18 + Tailwind v3 | Stack liviano, rápido de scaffoldear, sin backend | ✓ Good (v1.0) |
| SVG nativo para el plano (no librería) | Performance en mobile, control total del dibujo | ✓ Good (v1.0) |
| jsPDF + svg2pdf con plano vectorial (no html2canvas) | PDF nítido y descargable, mejor para presentar | ✓ Good (v1.0 — vector verificado al zoom) |
| Estado en localStorage, sin backend | Es un MVP/demo client-side | ✓ Good (v1.0) |
| Plano esquemático, no arquitectónico | Cliente prioriza claridad sobre precisión milimétrica | ✓ Good (v1.0) |
| Datos reales Lista 108 (Feb-26) aislados en /data | Fuente real; precios 2-3x los placeholders | ✓ Good (v1.0 — anti-hardcodeo por gates grep) |
| Estructura de zonas fija (baño entre baulera y dormitorio) | El catálogo real la fija; el Paso 3 pasa a equipamiento/tamaño | ✓ Good (v1.0) |
| Geometría real 2.52m / camas 0.80m / pasillo 0.92m | Define el dibujo del dormitorio y la validación de capacidad | ✓ Good (v1.0) |
| Presupuesto neto + IVA 21% + total c/IVA | Estándar B2B argentino, claridad para el cliente | ✓ Good (v1.0) |
| Lógica pura testeada con `node:test` (sin deps de test) | Red de regresión barata y mantenible | ✓ Good (v1.0 — 100 tests) |
| Nº de WhatsApp vía `VITE_WA_NUMBER` con default de pruebas | Swap a producción sin tocar código | ✓ Good (v1.0) |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-06-28 after v1.0 milestone (MVP shipped — 7 fases, 22 planes, 34/34 requirements)*
