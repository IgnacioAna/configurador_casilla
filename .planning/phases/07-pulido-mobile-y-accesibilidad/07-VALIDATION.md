---
phase: 7
slug: pulido-mobile-y-accesibilidad
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-28
---

# Phase 7 — Validation Strategy

> **Manual-first by design (D-02).** This phase is CSS/markup/focus polish on shipped UI — NOT pure logic.
> Per CONTEXT D-02 the verification is **100% MANUAL with DevTools** (375px / keyboard / contrast /
> reduced-motion), with **NO new test dependencies** and **NO new automated a11y tests** (axe/jsdom-axe
> would violate D-02). The existing `npm test` (node:test, 100 tests) is a **regression guard only** — it
> does not cover this phase's work.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework (automated)** | `node:test` (built-in) — pure logic only, regression guard, no new deps |
| **Config file** | none — `package.json` `test` script lists files explicitly |
| **Quick run command** | `npm test` (100 tests; confirms a markup/CSS edit didn't break imported logic) |
| **Full suite command** | `npm test` |
| **Phase verification** | **MANUAL** — `npm run dev` + DevTools (375px / keyboard / contrast checker / emulate reduced-motion) |
| **Estimated runtime** | `npm test` ~2s; manual UAT ~15-25 min across 8 screens |

---

## Sampling Rate

- **After every task commit:** `npm test` (catch logic regressions from markup/CSS edits).
- **After each polished surface:** mini manual UAT of that screen (375px + keyboard + contrast of its tones).
- **Before `/gsd-verify-work`:** full manual UAT checklist (below) green + `npm test` green + (recommended) a human visual checkpoint.
- **Max feedback latency:** `npm test` < 2s; manual checks are immediate in the dev server.

---

## Per-Task Verification Map

> This phase has almost no automated coverage by design (D-02). Each task's real proof is a manual DevTools
> check (see Manual-Only Verifications). `npm test` is the cross-cutting regression guard on every commit.

| Task ID | Plan | Wave | Requirement | Test Type | Method / Command | Status |
|---------|------|------|-------------|-----------|------------------|--------|
| TBD | TBD | — | UX-01 | manual-only | DevTools 375px, no overflow-x, nothing clipped (8 screens) | ⬜ pending |
| TBD | TBD | — | UX-02 (labels) | manual-only | DevTools Accessibility tree — every control has an accessible name | ⬜ pending |
| TBD | TBD | — | UX-02 (contrast) | manual-only | Inspector contrast checker ≥4.5:1 on body/totals; `/60`→`/70` links pass | ⬜ pending |
| TBD | TBD | — | UX-02 (keyboard, D-03) | manual-only | Tab/Enter/Espacio/flechas end-to-end landing→wizard→resumen, no mouse | ⬜ pending |
| TBD | TBD | — | UX-02 (D-04) | manual-only | DevTools emulate prefers-reduced-motion → fp-anim + Tailwind transitions disabled | ⬜ pending |
| (cross-cut) | all | every commit | Regression | unit (automated) | `npm test` (100 pass) | ✅ exists |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- **None.** No test infrastructure is created — D-02 forbids new a11y/test deps; verification is manual via
  the browser's DevTools (already available). `npm test` (existing) covers logic regression.

*Existing infrastructure (node:test) covers regression. This phase's acceptance is manual UAT.*

---

## Manual-Only Verifications

> The REAL verification of this phase. Run in `npm run dev` with DevTools. Tied to UX-01/UX-02.

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sin desbordes ni cortes a ~375px | UX-01 | Layout visual; no automatizable sin headless browser (dep nueva = viola D-02) | DevTools responsive 375px; recorrer Landing + Pasos 1-6 + Resumen; confirmar 0 scroll horizontal, nada cortado, barra de precio sticky dentro del ancho, plano + cotas + leyenda caben/wrap |
| Todo control con nombre accesible | UX-02 | Requiere inspección del árbol de accesibilidad | DevTools Accessibility tree; revisar cada checkbox/chip/card/stepper/link/botón tiene accessible name |
| Contraste ≥4.5:1 en cuerpo/totales | UX-02 | Medición visual con inspector | Contrast checker en pares dudosos; confirmar links "Volver a empezar"/"Volver a editar" pasan tras `/60`→`/70`; advertencia cobre ≥4.5:1; 3 líneas de presupuesto |
| Teclado end-to-end sin mouse | UX-02 (D-03) | Interacción de teclado real | Tab/Shift+Tab/Enter/Espacio/flechas: Landing→"Comenzar" mueve foco al wizard; cada control alcanzable con foco visible y orden lógico; cards/chips con Enter/Espacio; steppers ±; "Siguiente"/"Anterior" mueven foco al heading del nuevo paso; plano colapsable operable (Enter/Espacio, `aria-expanded`); Resumen: "Editar"/WhatsApp/PDF operables, foco arranca arriba |
| prefers-reduced-motion desactiva animaciones | UX-02 (D-04) | Emulación de media feature | DevTools → emular `prefers-reduced-motion: reduce` → cambiar modelo/paso: el plano NO anima (`.fp-anim` neutralizado); hover de cards/botones y barra de progreso tampoco animan |
| App monta sin errores de consola tras los edits | UX-01/02 | Smoke visual | `npm run dev`, abrir consola, recorrer el flujo: sin errores/warnings nuevos |

---

## Validation Sign-Off

- [ ] Manual UAT checklist (375px / labels / contrast / keyboard / reduced-motion) green across 8 screens
- [ ] `npm test` green (regression — 100 tests)
- [ ] No new test/a11y dependencies added (D-02 respected)
- [ ] (Recommended) human visual checkpoint signed off
- [ ] `nyquist_compliant: true` set in frontmatter (manual-first acceptance recorded)

**Approval:** pending
