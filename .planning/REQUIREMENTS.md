# Requirements: Configurador Visual de Casillas Rurales Impacar

**Defined:** 2026-06-27
**Core Value:** El cliente ve su casilla tomar forma visualmente (plano en planta en vivo)
mientras la configura paso a paso, y termina con un resumen + presupuesto listo para enviar.

> **Datos reales:** modelos, precios, accesorios y geometría provienen de la Lista 108
> (Feb-2026), documentados en PROJECT.md → "Datos reales". Precios netos (+ IVA 21%).

## v1 Requirements

Requirements para el MVP/demo. Cada uno mapea a fases del roadmap.

### Landing & Shell

- [ ] **SHELL-01**: El usuario ve una landing de bienvenida con título, subtítulo, datos de
      Impacar y botón "Comenzar" que inicia el wizard.
- [ ] **SHELL-02**: El usuario navega el wizard con "Anterior"/"Siguiente" y ve una barra de
      progreso de los 6 pasos.
- [ ] **SHELL-03**: El estado del wizard se persiste en `localStorage`; al recargar, el usuario
      retoma su configuración donde la dejó.
- [ ] **SHELL-04**: El usuario puede "Volver a empezar" desde el resumen, reseteando la
      configuración.

### Paso 1 — Uso y ocupantes

- [ ] **USO-01**: El usuario elige el uso entre 5 opciones (contratista, ganadero, agrícola,
      vivienda, otro) en cards con ícono (selección única).
- [ ] **USO-02**: El usuario elige la cantidad de ocupantes (2/3/4/5/6/8).
- [ ] **USO-03**: Según los ocupantes, el sistema sugiere automáticamente un modelo/largo
      (editable en el paso 2).

### Paso 2 — Dimensiones

- [ ] **DIM-01**: El usuario elige el modelo entre los **7 modelos reales (N1–N7, incl. N4)** en
      cards con largo, camas base e "ideal para N personas", con el sugerido pre-seleccionado.
- [ ] **DIM-02**: Al elegir el modelo, el plano dibuja la casilla (largo × 2.60m ext / 2.52m
      interior) acotada, con la estructura de zonas fija marcada.

### Paso 3 — Baño (posición fija entre baulera y dormitorio)

- [ ] **BANO-01**: El usuario elige el equipamiento del baño (inodoro con depósito y cámara
      séptica, vanitory completo con espejo) — la **ubicación es fija** (entre baulera y
      dormitorio).
- [ ] **BANO-02**: El usuario elige el tamaño del baño (estándar / ampliado); "ampliado" solo en
      modelos 6.10m+ (N3 en adelante).
- [ ] **BANO-03**: El plano ubica el módulo de baño (celeste, con íconos de ducha/inodoro/
      lavatorio) en su posición fija, ajustando su tamaño según la elección.

### Paso 4 — Dormitorio

- [ ] **DORM-01**: El usuario combina tipos y cantidades de camas (cucheta marinera, cama
      simple, matrimonial máx 1).
- [ ] **DORM-02**: El sistema valida la combinación contra la capacidad del modelo usando la
      geometría real (camas 0.80m, 2 por fila + pasillo 0.92m, largo de zona de dormitorio) y
      muestra una advertencia clara si no entra. N5+ son personalizables (mayor capacidad).
- [ ] **DORM-03**: El plano dibuja las camas como rectángulos (marrón) con etiqueta C/S/M contra
      las paredes laterales, con el pasillo central.

### Paso 5 — Cocina y estar

- [ ] **COCINA-01**: El usuario configura la cocina (mesada/bacha/cocina a gas estándar incluida;
      opción "cocina con horno industrial").
- [ ] **COCINA-02**: El usuario elige la heladera (sin / 220V freezer A++ / 12V freezer con
      pantalla y regulador).
- [ ] **COCINA-03**: El usuario agrega elementos del estar/comedor (mesa de caño, banco
      despensero).
- [ ] **COCINA-04**: El plano dibuja la zona de cocina/estar (verde) entre el dormitorio y la
      cocina fija, con los módulos elegidos.

### Paso 6 — Extras (confort y energía)

- [ ] **EXTRAS-01**: El usuario selecciona accesorios múltiples del catálogo real (calefactor
      4000 CAL, caldera 12V a gasoil, split inverter, panel solar 160W, sistema solar 220 off
      grid, TV 32" con DirecTV, mueble estéreo Pioneer, cortinas roller blackout, toldo,
      cajonera bajo cama).

### Plano en planta (SVG)

- [ ] **PLANO-01**: El plano se renderiza en SVG (vista en planta) con paredes, puerta (arco),
      ventanas y acotaciones en metros, y escala al viewport.
- [ ] **PLANO-02**: El plano se actualiza con transición suave (~300ms) cada vez que el usuario
      cambia una opción.
- [ ] **PLANO-03**: En mobile el plano es colapsable ("Ver plano actual") y ampliable a pantalla
      completa / zoom; en desktop va sticky a la derecha.
- [ ] **PLANO-04**: El plano refleja la **estructura fija de zonas** (baulera 0.60m | baño |
      dormitorio | estar/comedor | cocina 0.60m) y la geometría real (interior 2.52m, camas
      0.80m, pasillo central 0.92m).

### Precio

- [ ] **PRECIO-01**: El sistema calcula el presupuesto (base del modelo + accesorios) y lo
      muestra desglosado en **neto + IVA (21%) + total con IVA**, en formato argentino
      (`$29.108.976`), actualizándose en vivo.

### Resumen

- [ ] **RESUMEN-01**: El resumen muestra el plano final completo + la configuración elegida
      (uso, modelo, ocupantes, baño, dormitorio, cocina, extras).
- [ ] **RESUMEN-02**: El resumen muestra el presupuesto desglosado (base + accesorios, neto +
      IVA + total) con la nota de "orientativo, sujeto a confirmación".
- [ ] **RESUMEN-03**: El resumen lista las opciones de financiación disponibles.

### Exportación

- [ ] **EXPORT-01**: El usuario envía su configuración por WhatsApp vía link `wa.me` con el
      mensaje pre-armado (resumen + total).
- [ ] **EXPORT-02**: El usuario descarga un PDF con el plano (vectorial), la configuración, el
      precio, el logo IMPACAR y los datos de contacto.

### UX / Calidad

- [ ] **UX-01**: La interfaz es mobile-first y usable en un viewport de ~375px (Samsung 6").
- [ ] **UX-02**: Todos los inputs tienen labels, contraste suficiente y el wizard es navegable
      por teclado.
- [ ] **UX-03**: Toda la interfaz está en español argentino con trato de usted.
- [ ] **UX-04**: Cada paso completado se registra con `console.log` + timestamp (placeholder de
      analytics).

## v2 Requirements

Diferidos a futuro. Reconocidos pero fuera del roadmap actual.

### Integraciones

- **INT-01**: Conexión real con CRM/GHL para capturar leads.
- **INT-02**: Cálculo de flete/envío según localidad.
- **INT-03**: Reserva o seña online.

### Producto

- **PROD-01**: Render 3D / vista en perspectiva de la casilla.
- **PROD-02**: Variantes de layout pre-armadas por modelo (el catálogo muestra 3 por modelo en
      N4–N7) seleccionables como plantillas.
- **PROD-03**: Precios reales conectados a una fuente editable por la fábrica (CMS / planilla).

## Out of Scope

Excluido explícitamente para evitar scope creep.

| Feature | Reason |
|---------|--------|
| Backend / base de datos | MVP/demo 100% client-side |
| Login / cuentas de usuario | Innecesario para la prueba de concepto |
| Pago online | La conversión es por WhatsApp, no transaccional |
| Chat en vivo | El canal de contacto es WhatsApp |
| Render 3D | El plano es 2D en planta, por claridad y peso (ver v2 PROD-01) |
| Ubicación de baño libre (adelante/atrás/centro) | El catálogo fija la estructura de zonas |
| Precios reales editables por la fábrica | Lista 108 hardcodeada en /data (ver v2 PROD-03) |

## Traceability

Mapeo de requirements a fases. Completado en la creación del roadmap (2026-06-27).

| Requirement | Phase | Status |
|-------------|-------|--------|
| SHELL-01 | Phase 3 | Pending |
| SHELL-02 | Phase 3 | Pending |
| SHELL-03 | Phase 3 | Pending |
| SHELL-04 | Phase 3 | Pending |
| USO-01 | Phase 4 | Pending |
| USO-02 | Phase 4 | Pending |
| USO-03 | Phase 4 | Pending |
| DIM-01 | Phase 4 | Pending |
| DIM-02 | Phase 4 | Pending |
| BANO-01 | Phase 4 | Pending |
| BANO-02 | Phase 4 | Pending |
| BANO-03 | Phase 4 | Pending |
| DORM-01 | Phase 5 | Pending |
| DORM-02 | Phase 5 | Pending |
| DORM-03 | Phase 5 | Pending |
| COCINA-01 | Phase 5 | Pending |
| COCINA-02 | Phase 5 | Pending |
| COCINA-03 | Phase 5 | Pending |
| COCINA-04 | Phase 5 | Pending |
| EXTRAS-01 | Phase 5 | Pending |
| PLANO-01 | Phase 2 | Pending |
| PLANO-02 | Phase 2 | Pending |
| PLANO-03 | Phase 3 | Pending |
| PLANO-04 | Phase 2 | Pending |
| PRECIO-01 | Phase 5 | Pending |
| RESUMEN-01 | Phase 6 | Pending |
| RESUMEN-02 | Phase 6 | Pending |
| RESUMEN-03 | Phase 6 | Pending |
| EXPORT-01 | Phase 6 | Pending |
| EXPORT-02 | Phase 6 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 34 total
- Mapped to phases: 34 ✓
- Unmapped: 0 ✓

> Nota: Phase 1 (Cimientos y Datos) es infraestructura (scaffolding + datos Lista 108) que
> habilita todos los requirements; no tiene un REQ-ID propio asignado.

---
*Requirements defined: 2026-06-27*
*Last updated: 2026-06-27 after roadmap creation (traceability completa, 34/34 mapeados a 7 fases)*
