---
status: passed
phase: 03-cascara-del-wizard-y-persistencia
verified_by: orquestador (verificación en vivo vía preview)
date: 2026-06-27
score: 7/7 requirements
---

# Verificación Fase 3 — Cáscara del Wizard y Persistencia

**Status: passed.** Los 7 requirements (SHELL-01..04, PLANO-03, UX-03, UX-04) y los 5 success
criteria del ROADMAP están verificados contra el código y contra el comportamiento real en el
navegador (preview MCP). `npm run build` pasa.

## Resultado por requirement / success criterion

| Req / SC | Evidencia | Estado |
|----------|-----------|--------|
| SHELL-01 | Landing renderiza título "Diseñe su casilla rural a medida", subtítulo, datos de General Pico y CTA "Comenzar" (verde campo); "Comenzar" → wizard. | ✓ |
| SHELL-02 | Navegación de 6 pasos: Siguiente avanza (Paso 1→3 verificado), Anterior retrocede; Anterior disabled en paso 1, Siguiente disabled en paso 6; barra de progreso "Paso N de 6" (aria-valuenow). | ✓ |
| SHELL-03 | `localStorage.impacar_config_v1` guarda en cada cambio (pasoActual=2 tras 2× Siguiente); al recargar retoma en "Paso 3 de 6" (tras el fix de ruteo `vistaInicial`). | ✓ |
| SHELL-04 | "Volver a empezar" → "Paso 1 de 6", key reseteada a pasoActual=0, Anterior disabled. | ✓ |
| PLANO-03 | Desktop (1280px): plano sticky a la derecha (`position: sticky`, aside visible, trigger mobile oculto, FloorPlan N4 dibujando). Mobile (~507px): colapsado, "Ver plano actual" → expande el plano (aria-expanded), "Ocultar plano" lo cierra. | ✓ |
| UX-03 | Copy en trato de usted ("Diseñe", "Configure", "reciba"); gate anti-voseo grep = 0 en Landing. | ✓ |
| UX-04 | Consola muestra `[analytics] paso completado` con objeto + timestamp ISO al avanzar. | ✓ |

## Checks complementarios

- `npm run build` pasa limpio (FloorPlan integrado, bundle ~160KB).
- Sin errores de consola en el preview.
- El plano se dibuja desde el estado (`configDesdeEstado`), no desde un mock fijo — listo para que
  las Fases 4-5 llenen los pasos y el plano reaccione.
- Gate anti-hardcodeo de geometría sigue verde (heredado de Fases 1-2).

## Desviación corregida durante la ejecución

- **Bug de ruteo al recargar (SHELL-03):** el estado `vista` de App.jsx se reseteaba a 'landing'
  al recargar, dejando al usuario fuera del wizard aunque la config persistía. Corregido con
  `vistaInicial()`, que arranca en 'wizard' si existe la key `impacar_config_v1`. Verificado.

## Pendiente (fases siguientes)

- El contenido real de los 6 pasos (uso/dimensiones/baño/dormitorio/cocina/extras) — Fases 4-5.
- Validación de capacidad de camas, motor de precios, resumen y exportación — Fases 4-6.
