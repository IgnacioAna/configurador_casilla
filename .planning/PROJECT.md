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

(None yet — ship to validate)

### Active

<!-- Current scope. Building toward these. -->

- [ ] Landing de bienvenida con identidad Impacar y CTA "Comenzar"
- [ ] Wizard de 6 pasos: uso/ocupantes, dimensiones, baño, dormitorio, cocina/estar, extras
- [ ] Plano en planta SVG que se actualiza en tiempo real con cada elección
- [ ] Sugerencia automática de largo según cantidad de ocupantes (editable)
- [ ] Reglas de disponibilidad por modelo (baño centro/ampliado, mesa fija, heladera de pie)
- [ ] Motor de validación de capacidad de camas por modelo, con advertencia si no cabe
- [ ] Motor de precios (base del modelo + extras) con formato argentino `$14.000.000`
- [ ] Pantalla de resumen: plano final + configuración + presupuesto desglosado + financiación
- [ ] Exportar por WhatsApp (link `wa.me` con mensaje pre-armado)
- [ ] Descargar resumen en PDF (jsPDF, plano vectorial, logo + contacto)
- [ ] Persistencia del estado del wizard en `localStorage`
- [ ] Responsive mobile-first (target Samsung ~6"), plano colapsable en mobile / sticky en desktop
- [ ] Accesibilidad básica (labels, contraste, navegación por teclado) y animaciones suaves del SVG

### Out of Scope

<!-- Explicit boundaries. Includes reasoning to prevent re-adding. -->

- Backend / base de datos — es un MVP/demo 100% client-side
- Login / cuentas de usuario — no hace falta para la prueba de concepto
- Integración real con CRM/GHL — fuera del alcance de la demo
- Cálculo de flete / envío — el precio final lo define el asesor comercial
- Reserva / pago online — la conversión es por WhatsApp, no transaccional
- Chat en vivo — el canal de contacto es WhatsApp
- Render 3D — el plano es 2D en planta (vista cenital), por claridad y peso
- Precios reales — se usan placeholders; deben reemplazarse antes de producción

## Context

- **Cliente:** Industrias Impacar, General Pico, La Pampa, Argentina. Sitio:
  https://www.industriaimpacar.com/ — IG: https://www.instagram.com/industriasimpacar/
- **Diferencial del negocio:** cada casilla se diseña a pedido (largo, distribución de
  ambientes, cuchetas, ubicación de baño/cocina, extras). El configurador digitaliza ese
  proceso a medida.
- **Proceso actual:** configuración por WhatsApp con audios, fotos de croquis a mano, mucho
  ida y vuelta. El configurador busca reemplazar eso con una herramienta visual autoguiada.
- **Público:** ~80% navega desde el celular (productores rurales con Samsung de gama media) →
  mobile-first no negociable.
- **Modelos (6):** N1 4.50m, N2 5.50m, N3 6.20m, N5 7.50m, N6 8.40m, N7 9.60m. Ancho fijo
  2.60m (límite de transporte vial). Precios base y de extras = placeholders de la spec.
- **El plano es el corazón del producto** — debe ser claro y esquemático, no
  arquitectónicamente perfecto (nota explícita del cliente).
- **Objetivo inmediato:** presentar la demo a los dueños de la fábrica como prueba de concepto.

## Constraints

- **Tech stack**: Vite + React 18 (hooks) + Tailwind CSS v3 — stack liviano, sin backend.
- **Render del plano**: SVG nativo (sin librerías de dibujo pesadas) — performance en mobile.
- **PDF**: jsPDF con el plano como vector — única dependencia "pesada", justificada por el
  requisito de descarga de archivo real.
- **Sin backend**: todo client-side; el estado vive en `localStorage` (key `impacar_config_v1`).
- **Idioma**: español argentino, trato de usted (contexto comercial rural).
- **Identidad visual**: sobria/industrial (catálogo de maquinaria agrícola, no startup tech).
  Paleta fondo #F5F5F0, verde campo #2D5016, cobre #8B6914, texto #1A1A1A. Zonas del plano:
  baño celeste, dormitorio marrón, cocina verde. Logo: texto "IMPACAR" bold (placeholder).
- **Mobile-first**: el target es un Samsung ~6"; el plano debe ser colapsable/zoomable en mobile.

## Key Decisions

<!-- Decisions that constrain future work. Add throughout project lifecycle. -->

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Vite + React 18 + Tailwind v3 | Stack liviano, rápido de scaffoldear, sin backend | — Pending |
| SVG nativo para el plano (no librería) | Performance en mobile, control total del dibujo | — Pending |
| jsPDF con plano vectorial (no html2canvas) | PDF nítido y descargable, mejor para presentar | — Pending |
| Estado en localStorage, sin backend | Es un MVP/demo client-side | — Pending |
| Plano esquemático, no arquitectónico | Cliente prioriza claridad sobre precisión milimétrica | — Pending |
| Precios placeholder aislados en /data | Reemplazo fácil cuando lleguen los reales | — Pending |

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
*Last updated: 2026-06-27 after initialization*
