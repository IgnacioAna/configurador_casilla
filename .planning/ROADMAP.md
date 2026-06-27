# Roadmap: Configurador Visual de Casillas Rurales Impacar

## Overview

El viaje arranca con un proyecto Vite + React 18 + Tailwind v3 vacío y los datos reales de la
Lista 108 (modelos, precios, geometría) aislados en `/data`. Sobre esa base se construye primero
el corazón del producto — el motor de plano en planta (SVG cenital) que dibuja la estructura fija
de zonas con la geometría real. Luego se levanta la cáscara del wizard (navegación, barra de
progreso, persistencia en localStorage, layout colapsable/sticky del plano). Con la cáscara lista,
se llenan los 6 pasos en dos tandas: primero uso/dimensiones/baño, después dormitorio/cocina/extras
junto con el motor de validación de camas y el motor de precios (neto + IVA 21% + total). El viaje
cierra con la pantalla de resumen (plano final + presupuesto desglosado + financiación) y la
exportación por WhatsApp y PDF vectorial, y termina con el pulido mobile-first y de accesibilidad
para el target Samsung de ~6". Al final, un contratista rural puede configurar su casilla de punta
a punta y enviar el presupuesto sin un solo audio de WhatsApp.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Cimientos y Datos** - Scaffolding Vite + React + Tailwind y datos reales Lista 108 aislados en `/data`
- [ ] **Phase 2: Motor de Plano SVG** - El plano en planta cenital con estructura fija de zonas, geometría real y transiciones suaves
- [ ] **Phase 3: Cáscara del Wizard y Persistencia** - Landing, navegación de 6 pasos, barra de progreso, localStorage y layout del plano
- [ ] **Phase 4: Pasos 1-3 (Uso, Dimensiones, Baño)** - Selección de uso/ocupantes, modelo sugerido y equipamiento de baño con reflejo en el plano
- [ ] **Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios)** - Camas validadas por geometría, cocina/estar, extras y presupuesto en vivo
- [ ] **Phase 6: Resumen y Exportación** - Pantalla final con presupuesto desglosado, financiación, envío por WhatsApp y PDF vectorial
- [ ] **Phase 7: Pulido Mobile y Accesibilidad** - Usabilidad en ~375px, labels, contraste y navegación por teclado

## Phase Details

### Phase 1: Cimientos y Datos
**Goal**: Existe un proyecto Vite + React 18 + Tailwind v3 que arranca limpio, con los datos reales de la Lista 108 (7 modelos N1-N7, precios netos, accesorios y geometría) cargados desde `/data` y la identidad visual Impacar (paleta, tipografía) configurada.
**Depends on**: Nothing (first phase)
**Requirements**: (infraestructura — habilita todos los requirements; sin REQ-ID propio)
**Success Criteria** (what must be TRUE):
  1. El dev server arranca con `npm run dev` y muestra una página base con la paleta Impacar (fondo #F5F5F0, verde campo, cobre).
  2. `data/models.js` expone los 7 modelos reales (N1-N7) con largo, camas base y precio neto de la Lista 108.
  3. `data/extras.js` expone los accesorios reales con sus precios netos y el paso sugerido.
  4. Las constantes de geometría real (exterior 2.60m, interior 2.52m, camas 0.80m, pasillo 0.92m) están centralizadas y disponibles para el resto de la app.
**Plans**: 2 plans
  - [x] 01-01-PLAN.md — Scaffolding Vite + React 18 + Tailwind v3 con la paleta Impacar y estructura de carpetas (Wave 1)
  - [x] 01-02-PLAN.md — Datos reales Lista 108 (models/extras/geometry/financiación) + utilidades formatPrecio/IVA, wireadas en App.jsx (Wave 2)
**UI hint**: yes

### Phase 2: Motor de Plano SVG
**Goal**: Existe un componente de plano en planta (SVG cenital) que dibuja una casilla con la estructura fija de zonas y la geometría real, escala al viewport, y se actualiza con transición suave cuando cambian sus props. Es el corazón del producto y se construye antes que el wizard que lo alimenta.
**Depends on**: Phase 1
**Requirements**: PLANO-01, PLANO-02, PLANO-04
**Success Criteria** (what must be TRUE):
  1. Dado un modelo, el plano dibuja paredes, puerta (arco), ventanas y acotaciones en metros, escalando al contenedor.
  2. El plano muestra la estructura fija de zonas (baulera 0.60m | baño | dormitorio | estar/comedor | cocina 0.60m) con sus colores (baño celeste, dormitorio marrón, cocina verde).
  3. El plano respeta la geometría real (interior 2.52m, camas 0.80m, pasillo central 0.92m) al ubicar elementos.
  4. Al cambiar las props (largo, zonas, módulos), el plano transiciona suavemente (~300ms) sin saltos bruscos.
**Plans**: 3 plans
  - [x] 02-01-PLAN.md — Contrato del prop config + helper puro de layout (zonas y camas desde geometry.js) (Wave 1)
  - [ ] 02-02-PLAN.md — FloorPlan.jsx + subcomponentes SVG: paredes, zonas con color, camas, puerta, ventanas, cotas, estados (Wave 2)
  - [ ] 02-03-PLAN.md — Transiciones 300ms + prefers-reduced-motion y demo en App.jsx con "Cambiar modelo" (Wave 3)
**UI hint**: yes

### Phase 3: Cáscara del Wizard y Persistencia
**Goal**: El usuario entra por una landing Impacar, recorre los 6 pasos con Anterior/Siguiente y una barra de progreso, ve el plano colapsable en mobile o sticky en desktop, y su configuración persiste en localStorage (retoma donde quedó al recargar) con opción de volver a empezar. Toda la interfaz está en español argentino con trato de usted.
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04, PLANO-03, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. El usuario ve una landing con título, subtítulo, datos de Impacar y un botón "Comenzar" que inicia el wizard.
  2. El usuario navega entre los 6 pasos con "Anterior"/"Siguiente" y ve una barra de progreso que indica el paso actual.
  3. Al recargar la página, el usuario retoma su configuración exactamente donde la dejó (estado en `localStorage`, key `impacar_config_v1`), y puede "Volver a empezar" para resetearla.
  4. En mobile el plano es colapsable ("Ver plano actual"); en desktop va sticky a la derecha.
  5. Toda la interfaz está en español argentino con trato de usted, y cada paso completado se registra con `console.log` + timestamp.
**Plans**: TBD
**UI hint**: yes

### Phase 4: Pasos 1-3 (Uso, Dimensiones, Baño)
**Goal**: El usuario completa los primeros tres pasos del wizard: elige uso y ocupantes (con sugerencia automática de modelo), confirma o cambia el modelo entre los 7 reales, y configura el equipamiento y tamaño del baño — y cada elección se refleja de inmediato en el plano.
**Depends on**: Phase 3
**Requirements**: USO-01, USO-02, USO-03, DIM-01, DIM-02, BANO-01, BANO-02, BANO-03
**Success Criteria** (what must be TRUE):
  1. El usuario elige uno de 5 usos en cards con ícono (selección única) y la cantidad de ocupantes (2/3/4/5/6/8).
  2. Según los ocupantes, el sistema pre-selecciona un modelo sugerido, y el usuario lo puede cambiar entre los 7 modelos reales (N1-N7) en cards con largo, camas base e "ideal para N personas".
  3. Al elegir un modelo, el plano dibuja la casilla acotada (largo × 2.60m ext / 2.52m interior) con las zonas fijas marcadas.
  4. El usuario elige equipamiento de baño (inodoro c/ depósito y cámara séptica, vanitory c/ espejo) y tamaño (estándar / ampliado, ampliado solo en N3+), y el módulo de baño (celeste, con íconos) aparece en su posición fija ajustando su tamaño.
**Plans**: TBD
**UI hint**: yes

### Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios)
**Goal**: El usuario completa los pasos finales de configuración: arma el dormitorio con camas validadas contra la capacidad real del modelo, configura la cocina/estar, selecciona extras de confort y energía — y ve el presupuesto (base + accesorios, neto + IVA 21% + total) actualizándose en vivo mientras el plano refleja cada cambio.
**Depends on**: Phase 4
**Requirements**: DORM-01, DORM-02, DORM-03, COCINA-01, COCINA-02, COCINA-03, COCINA-04, EXTRAS-01, PRECIO-01
**Success Criteria** (what must be TRUE):
  1. El usuario combina tipos y cantidades de camas (cucheta marinera, simple, matrimonial máx 1); el sistema valida contra la geometría real (camas 0.80m, 2 por fila + pasillo 0.92m, largo de zona) y muestra una advertencia clara si no entra (N5+ personalizables).
  2. El plano dibuja las camas como rectángulos marrón con etiqueta C/S/M contra las paredes laterales y el pasillo central.
  3. El usuario configura la cocina (horno industrial opcional), elige heladera (sin / 220V A++ / 12V con pantalla) y agrega elementos del estar (mesa de caño, banco despensero), y la zona verde de cocina/estar se dibuja con los módulos elegidos.
  4. El usuario selecciona múltiples accesorios del catálogo real (calefactor, caldera, split, paneles/sistema solar, TV, estéreo, cortinas, toldo, cajonera).
  5. El presupuesto (base del modelo + accesorios) se muestra desglosado en neto + IVA 21% + total con IVA, en formato argentino (`$29.108.976`), actualizándose en vivo.
**Plans**: TBD
**UI hint**: yes

### Phase 6: Resumen y Exportación
**Goal**: El usuario llega a una pantalla de resumen que muestra el plano final, su configuración completa, el presupuesto desglosado con nota orientativa y las opciones de financiación, y puede enviar todo por WhatsApp (link `wa.me` pre-armado) o descargar un PDF con el plano vectorial, el precio, el logo y los datos de contacto.
**Depends on**: Phase 5
**Requirements**: RESUMEN-01, RESUMEN-02, RESUMEN-03, EXPORT-01, EXPORT-02
**Success Criteria** (what must be TRUE):
  1. El resumen muestra el plano final completo más toda la configuración elegida (uso, modelo, ocupantes, baño, dormitorio, cocina, extras).
  2. El resumen muestra el presupuesto desglosado (base + accesorios, neto + IVA + total) con la nota "orientativo, sujeto a confirmación" y lista las opciones de financiación.
  3. El usuario abre WhatsApp con un mensaje pre-armado (resumen + total) vía link `wa.me`.
  4. El usuario descarga un PDF con el plano vectorial, la configuración, el precio, el logo IMPACAR y los datos de contacto.
**Plans**: TBD
**UI hint**: yes

### Phase 7: Pulido Mobile y Accesibilidad
**Goal**: La interfaz completa es cómoda y usable en el target real (Samsung ~6", viewport ~375px), con todos los inputs etiquetados, contraste suficiente y navegación por teclado funcional de punta a punta.
**Depends on**: Phase 6
**Requirements**: UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. Todo el wizard, el plano y el resumen son usables sin desbordes ni elementos cortados en un viewport de ~375px.
  2. Todos los inputs tienen labels asociados y el contraste de texto/fondo cumple un mínimo legible.
  3. El usuario puede completar el wizard de punta a punta usando solo el teclado (foco visible, orden lógico, controles operables).
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Cimientos y Datos | 2/2 | Complete | 2026-06-27 |
| 2. Motor de Plano SVG | 2/3 | In progress | - |
| 3. Cáscara del Wizard y Persistencia | 0/TBD | Not started | - |
| 4. Pasos 1-3 (Uso, Dimensiones, Baño) | 0/TBD | Not started | - |
| 5. Pasos 4-6 y Motores | 0/TBD | Not started | - |
| 6. Resumen y Exportación | 0/TBD | Not started | - |
| 7. Pulido Mobile y Accesibilidad | 0/TBD | Not started | - |
