# Phase 5: Pasos 4-6 y Motores (Dormitorio, Cocina, Extras + Precios) - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-27
**Phase:** 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
**Areas discussed:** Armado y validación de camas, Presupuesto en vivo, Cocina/heladera/estar, Extras y reflejo en el plano

---

## Armado y validación de camas (DORM-01/02/03)

### Input de camas
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Contadores +/− por tipo | Stepper por tipo C/S/M, mapea directo a Array<{tipo}> | ✓ |
| Botón "Agregar cama" + lista | Lista editable, más flexible, más clicks | |
| Presets por modelo + ajuste | Arranca con combo base del modelo | |

### Modelado del matrimonial
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Ocupa una fila completa | Rectángulo ancho, 2 footprints | |
| Mismo footprint que simple | Se dibuja como 0,80m | |
| Vos decidí el modelado | research/planner definen geometría esquemática | ✓ |

### Aviso cuando no entra
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Avisa pero permite | Advertencia clara, no bloquea avanzar | ✓ |
| Bloquea hasta que entre | Deshabilita + / Siguiente | |
| Sugiere modelo y ofrece cambiar | Avisa + botón cambiar modelo | |

### N5+ personalizables
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Misma validación, mayor capacidad | Sin caso especial; capacidad del largo | |
| Sin límite rígido + nota "a medida" | Permite cualquier combo en N5+ | |
| Vos decidí | research/planner deciden | ✓ |

**User's choice:** contadores por tipo + aviso no bloqueante; modelado del matrimonial y trato de N5+ a discreción.
**Notes:** matrimonial máx 1. El plano ya dibuja `dormitorio.camas`.

---

## Presupuesto en vivo (PRECIO-01)

### Ubicación / timing
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Barra sticky desde Paso 4 | Sticky abajo mobile / junto al plano desktop | ✓ |
| Panel junto al plano | Precio en el panel del croquis | |
| Línea al pie de cada paso | Sin barra fija | |

### Nivel de desglose
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Total corriendo; desglose en Resumen | neto + IVA + total; ítem por ítem en Fase 6 | ✓ |
| Total + mini-desglose por categoría | Línea por categoría | |
| Desglose ítem por ítem colapsable | Acordeón desde Paso 4 | |

### Composición
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Base del modelo + todo lo elegido | Incluye baño (extras[]) | ✓ |
| Solo accesorios (base aparte) | Base como línea separada | |

**User's choice:** barra sticky desde Paso 4, total corriendo, total = base + todos los accesorios.
**Notes:** preserva la regla "sin precios en Pasos 1-3". Reusa formato.js.

---

## Cocina, heladera y estar (COCINA-01/02/03/04)

### Modelo de datos
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Todo a extras[] | Una sola fuente; configDesdeEstado deriva | ✓ |
| Sub-campos dedicados + extras[] | cocina/estar propios + extras[] | |
| Vos decidí | research/planner eligen | |

### Heladera
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Selector segmentado exclusivo | Sin/220/12V tipo radio | ✓ |
| Dos checkboxes con aviso | Permite estado inconsistente momentáneo | |

### Reflejo del plano
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Reflejo liviano reusando subcomponentes | Kitchen.jsx + Table.jsx + heladera | ✓ |
| Zona verde estática (solo precio) | El plano no cambia | |
| Vos decidí | research/planner deciden | |

**User's choice:** todo a extras[], heladera segmentada exclusiva, plano refleja liviano.
**Notes:** configDesdeEstado debe derivar de extras[] (D-14). Reusa Kitchen.jsx/Table.jsx.

---

## Extras y reflejo en el plano (EXTRAS-01)

### Agrupación
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Agrupados confort / energía | Dos subgrupos, split data-driven | ✓ |
| Lista plana multi-selección | Checkboxes en una lista | |

### Reflejo del plano
| Opción | Descripción | Elegida |
|--------|-------------|---------|
| No se dibujan; solo precio + resumen | Sin footprint cenital | ✓ |
| Lista de equipamiento junto al plano | Chips "equipamiento incluido" | |
| Vos decidí | research/planner deciden | |

**User's choice:** agrupados confort/energía; sin reflejo en el plano.
**Notes:** split data-driven (metadato en EXTRAS o regla), no hardcodeo.

---

## Claude's Discretion

- Modelado geométrico exacto de la cama matrimonial (footprint/ancho, esquemático).
- Comportamiento de N5/N6/N7 "personalizables" en la validación de camas.
- Si el split confort/energía se modela con metadato en `EXTRAS` o regla derivada.
- Copy exacto de la advertencia de capacidad; comportamiento del total al borrar una cama; orden visual de módulos en el plano.

## Deferred Ideas

- Pantalla de Resumen (desglose ítem por ítem, financiación, WhatsApp, PDF) — Fase 6.
- Pulido mobile final y accesibilidad de punta a punta — Fase 7.
