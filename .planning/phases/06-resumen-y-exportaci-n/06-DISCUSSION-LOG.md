# Phase 6: Resumen y Exportación - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 06-resumen-y-exportaci-n
**Areas discussed:** Navegación al resumen, Desglose del presupuesto + config, Mensaje de WhatsApp, PDF (vector + branding)

---

## Navegación al resumen

### Llegada al resumen
| Option | Description | Selected |
|--------|-------------|----------|
| 3ra vista 'resumen' en App.jsx | Paso 6 'Siguiente' → 'Ver resumen y presupuesto', cambia a vista='resumen', full-width | ✓ |
| Pantalla final dentro del wizard | 'Paso 7' interno, barra de progreso 6/6, plano/barra siguen montados | |
| Vos decidís | Claude elige la más simple | |

### Volver a editar
| Option | Description | Selected |
|--------|-------------|----------|
| Editar global + por sección | Botón global + link 'Editar' por sección con IR_A_PASO | ✓ |
| Solo 'Volver a editar' global | Un único botón al wizard, sin deep-links | |
| Vos decidís | Claude elige | |

**Notes:** El estado sigue vivo al ver el resumen (no se resetea). `IR_A_PASO` ya existe en el reducer.

---

## Desglose del presupuesto + config

### Nivel de detalle del presupuesto
| Option | Description | Selected |
|--------|-------------|----------|
| Línea por ítem completa | Base + cada accesorio con $ + subtotal neto + IVA + total | ✓ |
| Agrupado base + accesorios | Base + 'Accesorios (n)' subtotal único + IVA + total | |
| Vos decidís | Claude elige | |

### Agrupamiento de accesorios
| Option | Description | Selected |
|--------|-------------|----------|
| Por categoría | Baño / Dormitorio / Cocina-estar / Confort / Energía (metadato subgrupo Fase 5 D-08) | ✓ |
| Lista única | Todos en una lista corrida del catálogo | |
| Vos decidís | Claude elige | |

### Presentación de la config
| Option | Description | Selected |
|--------|-------------|----------|
| Secciones por paso | Bloques Uso/Modelo/Baño/Dormitorio/Cocina/Extras con ids → nombres reales | ✓ |
| Lista plana 'campo: valor' | Lista corrida sin agrupar por paso | |
| Vos decidís | Claude elige | |

**Notes:** El desglose por ítem requiere extender `motorPrecios` con un helper (`detallePresupuesto`).

---

## Mensaje de WhatsApp

### Número de destino
| Option | Description | Selected |
|--------|-------------|----------|
| Constante configurable (placeholder) | Número en data/contacto.js, fácil de swappear | ✓ (con números reales del usuario) |
| Sin número fijo | wa.me sin destinatario, el usuario elige | |
| Tengo el número real | El usuario pasa el número de Impacar | |

**User's choice:** Constante configurable con DOS números reales: pruebas `5492954555113` (número personal de Ignacio, para que los tests no le lleguen a Impacar) ahora, y `5492302468754` (Impacar real) documentado para producción.

### Contenido del mensaje
| Option | Description | Selected |
|--------|-------------|----------|
| Resumen completo en texto | Modelo + ocupantes + baño + camas + cocina + extras + total + nota | ✓ |
| Resumen corto | Modelo + total + 'Quiero avanzar' | |
| Vos decidís | Claude elige | |

### Mención del PDF en el mensaje
| Option | Description | Selected |
|--------|-------------|----------|
| Sí, recordatorio | Línea 'Le envío aparte el PDF...' (wa.me no adjunta archivos) | ✓ |
| No mencionarlo | Caminos independientes | |
| Vos decidís | Claude elige | |

---

## PDF (vector + branding)

### Plano SVG → PDF
| Option | Description | Selected |
|--------|-------------|----------|
| svg2pdf.js (companion de jsPDF) | Convierte el SVG existente a vector, dependencia liviana | ✓ |
| Dibujo manual con jsPDF | Primitivas sin dependencia extra, más trabajo y riesgo de divergencia | |
| Vos decidís | Claude elige respetando 'plano vectorial' | |

### Datos de contacto/branding
| Option | Description | Selected |
|--------|-------------|----------|
| Completo | Logo + WhatsApp + web + IG + ciudad | ✓ |
| Mínimo | Logo + WhatsApp + ciudad | |
| Vos decidís | Claude elige | |

### Layout del PDF
| Option | Description | Selected |
|--------|-------------|----------|
| Una página A4 | Logo + plano + presupuesto + config + contacto en una hoja | ✓ |
| Multipágina | Pág 1 plano+presupuesto, pág 2 config+financiación+contacto | |
| Vos decidís | Claude elige | |

---

## Claude's Discretion

- Copy exacto del mensaje de WhatsApp y de la nota orientativa.
- Nombre del archivo PDF descargado.
- Estados vacíos / edge del resumen (uso/ocupantes null, estado adulterado) — degradación elegante.
- Orden de waves del enchufe (lógica pura del desglose antes que componentes).
- Si "Ver resumen y presupuesto" reemplaza a "Siguiente" en el Paso 6 o es un botón aparte.

## Deferred Ideas

- Pulido mobile final y accesibilidad del resumen/exportación — Fase 7.
- Swap del número a producción (`5492302468754`) antes del go-live — config previa, no implementación.
- Integración real con CRM/GHL (v2 INT-01).
- Variantes de layout pre-armadas por modelo (v2 PROD-02).
