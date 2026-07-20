---
phase: quick-260720-ifp
plan: 01
subsystem: resumen
tags: [copy, ux, resumen, dormitorio, cocina]
requires: []
provides:
  - "Fallbacks específicos de camas/cocina en el resumen"
  - "Aviso cobre no bloqueante en la sección Dormitorio"
affects:
  - src/utils/resumenCampos.js
  - src/components/resumen/ConfigSecciones.jsx
tech-stack:
  added: []
  patterns:
    - "Fallback específico por zona fija (camas/cocina) en lugar del genérico 'Sin selección'"
    - "Aviso data-driven opcional (campo `aviso`) renderizado condicionalmente en el map de secciones"
key-files:
  created: []
  modified:
    - src/utils/resumenCampos.js
    - src/utils/resumenCampos.test.js
    - src/components/resumen/ConfigSecciones.jsx
decisions:
  - "Dormitorio y cocina son zonas fijas del plano: el fallback informa qué falta (camas/accesorios), no el ambiente"
  - "El aviso de Dormitorio es puramente informativo — no deshabilita exportar (WhatsApp/PDF siguen activos siempre)"
metrics:
  duration: "~8 min"
  completed: 2026-07-20
requirements: [RESUMEN-01]
---

# Quick 260720-ifp: Copy específico sin selección + aviso sin camas Summary

Dos arreglos de copy/UX en el resumen del configurador: fallbacks específicos para camas
('Sin camas seleccionadas') y cocina ('Sin accesorios de cocina') en lugar del genérico
'Sin selección', más un aviso cobre no bloqueante en la sección Dormitorio cuando no hay camas.

## What Was Built

**Task 1 — Fallbacks específicos (`resumenCampos.js`)**
- Nuevas constantes `SIN_CAMAS = 'Sin camas seleccionadas'` y `SIN_ACCESORIOS_COCINA = 'Sin accesorios de cocina'`.
- `camasTexto` y `cocina` ahora usan esos fallbacks; `uso`, `ocupantes`, `largo`, `bano` y `extras`
  siguen en `'Sin selección'` / `[]`.
- Comentario del shape de salida actualizado.
- Tests de `resumenCampos.test.js` actualizados en las aserciones de camas/cocina (el loop
  anti-undefined sigue válido). Commit: `a6118e2`.

**Task 2 — Aviso cobre no bloqueante (`ConfigSecciones.jsx`)**
- `const sinCamas = !(Array.isArray(estado?.dormitorio?.camas) && estado.dormitorio.camas.length > 0)`
  (tolera estado adulterado de localStorage).
- Campo opcional `aviso` en la sección Dormitorio del array `secciones`.
- Render condicional del aviso con el patrón cobre (`border-impacar-cobre`, `text-impacar-cobre`)
  y `mt-2`. No toca el botón Editar ni el flujo de exportar. Commit: `5ff4a20`.

## Verification

- `npm test`: 109 tests, 109 pass, 0 fail.
- `npx vite build`: build OK (built in 3.96s).
- RED confirmado antes de implementar Task 1 (los tests fallaban con el copy viejo).

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: src/utils/resumenCampos.js (contiene 'Sin camas seleccionadas' y 'Sin accesorios de cocina')
- FOUND: src/components/resumen/ConfigSecciones.jsx (contiene aviso cobre + 'Editar')
- FOUND commit a6118e2 (Task 1)
- FOUND commit 5ff4a20 (Task 2)
