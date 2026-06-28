---
phase: 07-pulido-mobile-y-accesibilidad
plan: 01
subsystem: ui-a11y
tags: [accesibilidad, a11y, reduced-motion, foco, contraste, aria, wcag]
requires:
  - "UI existente (landing/wizard/resumen) de Fases 3-6"
  - "src/styles/index.css con .fp-anim (Fase 2)"
provides:
  - "prefers-reduced-motion GLOBAL (neutraliza .fp-anim + transiciones de Tailwind)"
  - "Gestión de foco al cambiar de vista (App) y de paso (wizard) — patrón useRef+useEffect+tabIndex={-1}"
  - "Contraste >=4.5:1 en los 2 links muted (text-impacar-texto/70)"
  - "Semántica ARIA consistente en el selector de heladera (role=group)"
affects:
  - "src/styles/index.css"
  - "src/App.jsx"
  - "src/components/ConfiguratorWizard.jsx"
  - "src/components/resumen/AccionesExport.jsx"
  - "src/components/wizard/pasos/PasoCocina.jsx"
tech-stack:
  added: []
  patterns:
    - "Foco programático en cambio de vista/paso: useRef + useEffect + tabIndex={-1} + focus:outline-none (Pattern 1 del RESEARCH)"
    - "prefers-reduced-motion GLOBAL con wildcard *, *::before, *::after y transition-duration: 0.01ms (Pattern 2)"
key-files:
  created: []
  modified:
    - "src/styles/index.css"
    - "src/App.jsx"
    - "src/components/ConfiguratorWizard.jsx"
    - "src/components/resumen/AccionesExport.jsx"
    - "src/components/wizard/pasos/PasoCocina.jsx"
decisions:
  - "reduced-motion como regla CSS global (D-04) con wildcard, no utilidad por elemento — cubre lo no marcado"
  - "Foco al contenedor montado (wrapper en App, <section> en wizard) porque los <h1>/<h2> viven dentro de los hijos"
  - "0.01ms en vez de transition: none para preservar eventos transitionend a futuro (Pitfall 7)"
  - "role=group (no radiogroup) para el selector de heladera: coherente con aria-pressed; ARIA mínimo correcto (D-01)"
metrics:
  duration: "~12 min"
  completed: "2026-06-28"
  tasks: 3
  files-modified: 5
requirements: [UX-02]
---

# Phase 7 Plan 01: Accesibilidad Cross-Cutting (foco, movimiento, contraste, ARIA) Summary

Arreglos de accesibilidad globales de baja superficie y alto apalancamiento sobre la UI ya
construida: `prefers-reduced-motion` GLOBAL en el CSS base, gestión de foco programático al cambiar
de vista y de paso, corrección del único par de contraste que fallaba (`/60`→`/70`) en los dos
links muted, y normalización del role ARIA del selector de heladera (`radiogroup`→`group`). Sin
features nuevas, sin dependencias nuevas, sin tocar la paleta locked.

## What Was Built

### Task 1 — prefers-reduced-motion GLOBAL (D-04)
`src/styles/index.css`: la media query que solo cubría `.fp-anim` se reemplazó por una regla global
con wildcard (`*, *::before, *::after`) que neutraliza TODA animación/transición cuando el SO pide
menos movimiento — incluyendo las transiciones de Tailwind (`transition-colors` en botones/cards,
`transition-all duration-300` en BarraProgreso), no solo el plano. Usa `transition-duration: 0.01ms`
(no `none`) para preservar eventos `transitionend` a futuro (Pitfall 7). El bloque `.fp-anim` se
mantuvo intacto.

### Task 2 — Foco al cambiar de vista/paso + contraste link wizard (D-03, D-01)
- `src/App.jsx`: `useRef`/`useEffect` mueven el foco a un contenedor focuseable (`tabIndex={-1}`,
  `focus:outline-none`) que envuelve la vista montada, disparado al cambiar `vista`. Como los `<h1>`
  viven dentro de cada componente hijo, el wrapper es el target de foco. No cambia la lógica de
  `setVista` ni las props de los hijos.
- `src/components/ConfiguratorWizard.jsx`: `useEffect` dependiente de `[estado.pasoActual]` mueve el
  foco a la `<section>` que envuelve el paso (`tabIndex={-1}`, `focus:outline-none`). Al avanzar/
  retroceder, el foco arranca al principio del nuevo paso, justo antes de su `<h2>`.
- Link "Volver a empezar": `text-impacar-texto/60` → `/70` (4.41:1 → 6.13:1).

### Task 3 — Contraste link "Volver a editar" + role del selector de heladera (D-01)
- `src/components/resumen/AccionesExport.jsx`: link "Volver a editar" `text-impacar-texto/60` → `/70`.
  El `<a>` de WhatsApp con `target="_blank" rel="noopener noreferrer"` quedó intacto (T-07-01).
- `src/components/wizard/pasos/PasoCocina.jsx`: `role="radiogroup"` → `role="group"` en el grupo de
  heladera. Los botones siguen usando `aria-pressed` (semántica toggle), `aria-labelledby="label-heladera"`
  conservado. No se introdujeron radios reales (sin `role="radio"`, sin `aria-checked`, sin flechas/
  roving tabindex) — eso sería ARIA exhaustivo, fuera del listón D-01.

## Key Decisions

- **reduced-motion GLOBAL vs utilidad por elemento:** D-04 fija el enfoque global. El wildcard `*`
  con `!important` captura también lo que no lleva una utilidad de Tailwind; el `0.01ms` es a prueba
  de futuro vs `none`.
- **Foco al contenedor, no al heading:** los `<h1>`/`<h2>` viven dentro de los componentes hijos, así
  que App envuelve cada vista en un wrapper focuseable y el wizard usa la `<section>` del paso como
  target. Mismo efecto canónico (arrancar arriba de la nueva pantalla) sin reestructurar los hijos.
- **role=group para la heladera:** los botones son toggles (`aria-pressed`), no radios; `role="group"`
  + `aria-labelledby` es la opción de menor riesgo y consistente con D-01 (ARIA mínimo correcto).

## Deviations from Plan

None - plan executed exactly as written. (Una micro-edición de redacción dentro de un comentario en
PasoCocina.jsx para evitar el literal `role="radio"` en texto y mantener limpio el grep gate del
acceptance criteria — no es una desviación funcional; el cambio de código es exactamente el del plan.)

## Verification

- `npm test` → 100 tests, 0 fail (regresión verde tras cada tarea).
- `npm run build` (vite build) → sin errores tras cada tarea (validación de JSX).
- Grep gates de acceptance criteria: todos PASS.
  - `prefers-reduced-motion` x1, wildcard `*, *::before, *::after` x1, `transition-duration: 0.01ms` x1, `.fp-anim` presente.
  - App.jsx: `useRef`/`useEffect` importados, `tabIndex={-1}` presente, dependencia `[vista]`.
  - ConfiguratorWizard.jsx: `tabIndex={-1}` presente, dependencia `estado.pasoActual`, `text-impacar-texto/60` = 0, `/70` >= 1.
  - AccionesExport.jsx: `/60` = 0, `/70` >= 1, `rel="noopener noreferrer"` presente (3).
  - PasoCocina.jsx: `role="radiogroup"` = 0, `role="group"` = 1, `aria-labelledby="label-heladera"` = 1, `role="radio"` = 0.
  - `package.json`/`package-lock.json` sin cambios (cero dependencias nuevas, D-02). Sin tabindex positivos.
- **Verificación manual pendiente (D-02, fuera de este executor automatizado):** emular reduced-motion
  en DevTools; barrido por teclado landing→wizard→resumen confirmando que el foco salta arriba; contrast
  checker en los 2 links; árbol de a11y del Paso 5 mostrando el grupo de heladera como "group".

## Known Stubs

None — esta es una fase de pulido sobre UI funcional existente; no se introdujeron placeholders ni
fuentes de datos sin cablear.

## TDD Gate Compliance

N/A — plan `type: execute` (no `type: tdd`). La verificación de la fase es manual con DevTools por
D-02; `npm test` corre como guarda de regresión, no como gate RED/GREEN.

## Self-Check: PASSED

- Archivos verificados (6/6 FOUND): 07-01-SUMMARY.md, index.css, App.jsx, ConfiguratorWizard.jsx, AccionesExport.jsx, PasoCocina.jsx.
- Commits verificados (3/3 FOUND): f8dac00, 8d688c7, dc44529.
