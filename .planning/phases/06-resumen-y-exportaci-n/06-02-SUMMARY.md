---
phase: 06-resumen-y-exportaci-n
plan: 02
subsystem: export
tags: [whatsapp, wa.me, contacto, pure-utils, node-test, output-encoding, anti-voseo]

# Dependency graph
requires:
  - phase: 06-01 (lógica pura del cierre)
    provides: detallePresupuesto(estado) { items, neto, iva, total } + resumenCampos(estado) (ids→labels con degradación)
  - phase: 05 (modelo y precio)
    provides: formato.js (formatPrecio) + EXTRAS + MODELOS
  - phase: 06 (CONTEXT)
    provides: números de WhatsApp pruebas/producción (D-08), copy del mensaje y recordatorio PDF (D-09/D-10)
provides:
  - "CONTACTO: fuente única de contacto (whatsapp activo + producción documentado, whatsappDisplay, web, instagram, ciudad) — la consumen el link wa.me y el contacto del PDF (06-03)"
  - "mensajeWhatsApp(estado): resumen en texto multilínea (trato de usted) con modelo, total c/IVA formateado, nota orientativa y recordatorio del PDF (D-10)"
  - "linkWhatsApp(estado): deep-link https://wa.me/<CONTACTO.whatsapp>?text=<encoded> con todo el text por encodeURIComponent (\\n→%0A)"
affects: [06-03 (AccionesExport.jsx usa linkWhatsApp en el <a>; el contacto del PDF lee CONTACTO), 07 (pulido)]

# Tech tracking
tech-stack:
  added: []
  patterns: ["fuente única de contacto en /data (número nunca literal en código)", "armado de mensaje/link como lógica pura testeable (interface-first) — el botón de 06-03 es un simple <a href>", "output encoding con encodeURIComponent sobre TODO el text del deep-link"]

key-files:
  created: [src/data/contacto.js, src/utils/exportWhatsApp.js, src/utils/exportWhatsApp.test.js]
  modified: []

key-decisions:
  - "El número de wa.me se lee SIEMPRE de CONTACTO.whatsapp (D-08), nunca literal en exportWhatsApp.js; el de producción queda documentado en comentario para el swap previo al go-live"
  - "encodeURIComponent sobre TODO el text (no solo partes) — codifica \\n→%0A, &, acentos y ñ (V5 output encoding, T-06-04)"
  - "Mensaje conciso (sin desglose ítem-por-ítem con precios) — el detalle completo va en el PDF (D-10 / Pitfall 6 límite ~2000 chars de URL)"
  - "El template del mensaje se alineó al shape real de resumenCampos { uso, ocupantes, modelo, largo, bano, camas, cocina, extras } verificado en disco antes de escribir"

patterns-established:
  - "Constante de contacto única en /data consumida por múltiples superficies (wa.me + PDF), número nunca duplicado en código"
  - "Utilidad de exportación pura (mensaje/link) separada de la UI — interface-first, testeable sin DOM"
  - "Gate anti-voseo en test (array de tokens de voseo + assert de ausencia) — patrón Fase 3 portado a las utils de exportación"

requirements-completed: [EXPORT-01, RESUMEN-03]

# Metrics
duration: ~10min
completed: 2026-06-28
---

# Phase 6 Plan 02: Fuente única de contacto + exportación por WhatsApp Summary

**`data/contacto.js` (fuente única de contacto, número de pruebas activo + producción documentado) y las utilidades puras `mensajeWhatsApp` / `linkWhatsApp` (trato de usted, total formateado, recordatorio del PDF, encoding `%0A`, link < 2000 chars) con node:test en verde — el botón "Enviar por WhatsApp" de 06-03 será un simple `<a href={linkWhatsApp(estado)}>`.**

## Performance

- **Duration:** ~10 min
- **Started:** 2026-06-28 (aprox.)
- **Completed:** 2026-06-28
- **Tasks:** 2 (1 con ciclo TDD RED/GREEN)
- **Files modified:** 3 (3 creados, 0 modificados)

## Accomplishments
- `src/data/contacto.js` — fuente ÚNICA de contacto (D-08/D-13): `CONTACTO.whatsapp` activo de pruebas `5492954555113` en la constante + producción `5492302468754` documentado en comentario (swap previo al go-live, para que las pruebas de la demo no le lleguen a Impacar), más `whatsappDisplay`, `web`, `instagram` y `ciudad` para el contacto del PDF.
- `FINANCIACION` verificada (sin tocar) con las 3 opciones contado/financiado/permuta (`nombre` + `detalle`) para RESUMEN-03.
- `src/utils/exportWhatsApp.js` — `mensajeWhatsApp(estado)` arma el resumen en texto multilínea (trato de usted) con modelo + largo, uso/ocupantes, baño, camas, cocina, extras, **total c/IVA formateado con `formatPrecio`**, nota orientativa y línea final recordando el PDF (D-10, porque wa.me no adjunta archivos). `linkWhatsApp(estado)` produce `https://wa.me/<CONTACTO.whatsapp>?text=<encoded>` con `encodeURIComponent` sobre todo el text.
- Compone sobre `detallePresupuesto` (única fuente del total) y `resumenCampos` (degradación a `'Sin selección'` / `'Modelo no disponible'`) — `mensajeWhatsApp(null)` y extras no-array no crashean, total cae a `$0` sin `$NaN`.
- 8 tests nuevos en verde (mensaje, gate anti-voseo, total formateado, degradación, número desde CONTACTO, encoding `%0A`, longitud < 2000 con los 17 extras). Suite completa: **98 tests, 0 fail**.

## Task Commits

Cada tarea se commiteó atómicamente (con hooks, sin --no-verify):

1. **Task 1: data/contacto.js + verificación FINANCIACION** - `747a39f` (feat)
2. **Task 2: exportWhatsApp.js (mensajeWhatsApp + linkWhatsApp) + tests (TDD)** - `4657409` (test RED) → `1710442` (feat GREEN)

**Plan metadata:** (este SUMMARY — commit docs aparte)

_Nota: la Task 2 (TDD) tiene dos commits (test rojo → feat verde); no hizo falta refactor._

## Files Created/Modified
- `src/data/contacto.js` - NUEVO. Fuente única de contacto: `CONTACTO` con whatsapp activo + producción documentado + whatsappDisplay/web/instagram/ciudad.
- `src/utils/exportWhatsApp.js` - NUEVO. `mensajeWhatsApp` + `linkWhatsApp` puros (sin React/DOM), número desde `CONTACTO`, `formatPrecio` para la cifra, `encodeURIComponent` sobre todo el text.
- `src/utils/exportWhatsApp.test.js` - NUEVO. 8 tests (contenido del mensaje, anti-voseo, total formateado, degradación null/extras no-array, link wa.me con número de CONTACTO, encoding %0A, longitud < 2000).
- `src/data/financiacion.js` - VERIFICADO (no modificado): 3 opciones para RESUMEN-03.

## Decisions Made
- **Número siempre desde `CONTACTO.whatsapp`** (D-08): nunca literal en `exportWhatsApp.js`; el de producción `5492302468754` queda documentado en el comentario de la constante para el swap previo al go-live.
- **`encodeURIComponent` sobre TODO el text** (V5 output encoding, T-06-04): codifica `\n`→`%0A`, `&`, acentos y ñ. El test verifica que no quedan saltos ni espacios crudos en la URL.
- **Mensaje conciso** (D-10 / Pitfall 6): sin desglose ítem-por-ítem con precios — el detalle completo va en el PDF; el mensaje termina con el recordatorio del PDF porque wa.me no adjunta archivos. Con los 17 extras el link queda muy por debajo de 2000 chars.
- **Template alineado al shape real de `resumenCampos`** (verificado en disco antes de escribir): `{ uso, ocupantes, modelo, largo, bano, camas, cocina, extras }` — el cuerpo del mensaje se copió verbatim del plan/RESEARCH y coincide con la salida real.

## Deviations from Plan

None - plan executed exactly as written.

`contacto.js` se copió verbatim del bloque `<interfaces>` del plan; `exportWhatsApp.js` se copió verbatim del cuerpo de RESEARCH Pattern 2 (la guía de `<action>`). El shape de `resumenCampos` se verificó antes de escribir y coincidió con el template, así que no hizo falta alinear ninguna clave.

## Issues Encountered
None. `npm test` ya tenía `exportWhatsApp.test.js` registrado en el script `test` (lo hizo 06-01, dueño único de `package.json` en Wave 1); en cuanto se creó el archivo, `npm test` lo tomó y pasó (90 → 98 tests).

## Security / Threat notes
- **T-06-04 (Tampering/Injection, mitigate):** cubierto — `encodeURIComponent` sobre todo el `text` codifica `\n`/`&`/acentos/ñ; el número viene de `CONTACTO`, nunca del estado del usuario. Test verifica ausencia de saltos crudos y espacios sin codificar en la URL.
- **T-06-05 (Tampering, mitigate):** cubierto — `mensajeWhatsApp` compone sobre `detallePresupuesto` (devuelve 0, nunca `$NaN`) y `resumenCampos` (`'Sin selección'`/`'Modelo no disponible'`); tests de `mensajeWhatsApp(null)` y extras no-array confirman que no crashea ni produce `$NaN`.
- **T-06-06 (Information Disclosure, accept):** el número de WhatsApp en el código fuente es un número comercial público (y en pruebas, el personal de Ignacio por decisión explícita D-08); sin secreto. El swap a producción queda documentado en la constante.
- **Reverse-tabnabbing** del `<a target="_blank">` se mitiga en 06-03 con `rel="noopener noreferrer"` (UI-SPEC S6) — fuera del scope de estas utilidades puras.

## Next Phase Readiness
- **06-03** puede montar el botón "Enviar por WhatsApp" como `<a href={linkWhatsApp(estado)} target="_blank" rel="noopener noreferrer">` (AccionesExport.jsx, UI-SPEC S6) y leer el contacto del PDF desde `CONTACTO` (whatsappDisplay/web/instagram/ciudad). `BloqueFinanciacion.jsx` renderiza `FINANCIACION` ya verificada.
- **Swap a producción** (`5492302468754`) antes de la demo final: editar `CONTACTO.whatsapp` — documentado en la constante (no es tarea de implementación).
- Sin blockers. La lógica de exportación por WhatsApp está aislada y testeada.

## Self-Check: PASSED

- Archivos verificados en disco: src/data/contacto.js, src/utils/exportWhatsApp.js, src/utils/exportWhatsApp.test.js, 06-02-SUMMARY.md — todos FOUND.
- Commits verificados en git: 747a39f (feat contacto), 4657409 (test RED), 1710442 (feat GREEN) — todos FOUND.
- TDD gate: test(06-02) RED `4657409` → feat(06-02) GREEN `1710442` en orden correcto.
- Suite: `npm test` → 98 tests, 98 pass, 0 fail (exit 0). Gate anti-voseo sobre el archivo fuente: 0 coincidencias.

---
*Phase: 06-resumen-y-exportaci-n*
*Completed: 2026-06-28*
