# Phase 7: Pulido Mobile y Accesibilidad - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-28
**Phase:** 7-Pulido Mobile y Accesibilidad
**Areas discussed:** Rigor de accesibilidad, Herramienta de verificación, Alcance teclado/foco, prefers-reduced-motion

---

## Rigor de accesibilidad

| Option | Description | Selected |
|--------|-------------|----------|
| Pragmático AA-en-lo-clave | AA donde importa para la demo: contraste ≥4.5:1 en cuerpo/totales, labels en todos los inputs, foco operable, sin desbordes; sin ARIA exhaustivo ni AAA | ✓ |
| WCAG 2.1 AA formal completo | Auditar contra AA de punta a punta: ratios exactos, ARIA/roles completos, orden de lectura | |
| Mínimo viable | Solo lo que rompe en la demo (sin desbordes + completar); contraste/labels solo donde falle a ojo | |

**User's choice:** Pragmático AA-en-lo-clave (→ D-01)
**Notes:** Acorde al MVP/demo; la paleta ya pasa AA en cuerpo. No reescribir identidad sobria locked.

---

## Herramienta de verificación

| Option | Description | Selected |
|--------|-------------|----------|
| Manual con DevTools | DevTools a 375px + tab por teclado + contrast checker del inspector; cero deps nuevas | ✓ |
| Híbrido + Lighthouse | Manual + pase ad-hoc de Lighthouse (viene en Chrome) para score de referencia | |
| Sumar dep DEV de a11y | eslint-plugin-jsx-a11y o axe en devDependencies (chequeo automatizado) | |

**User's choice:** Manual con DevTools (→ D-02)
**Notes:** Consistente con el patrón del proyecto (node:test, sin libs extra). Lighthouse/axe quedan ad-hoc del navegador, no como dependencia del repo.

---

## Alcance teclado/foco

| Option | Description | Selected |
|--------|-------------|----------|
| Todo el flujo end-to-end | Landing + wizard + resumen: foco visible, orden lógico, operar plano colapsable y botones WhatsApp/PDF solo con teclado | ✓ |
| Wizard + resumen | El flujo de configuración + la pantalla de cierre; la landing queda como está | |
| Solo el wizard | Estricto al criterio literal: completar los 6 pasos por teclado | |

**User's choice:** Todo el flujo end-to-end (→ D-03)
**Notes:** Más amplio que el criterio literal "wizard". La demo se navega entera sin mouse.

---

## prefers-reduced-motion

| Option | Description | Selected |
|--------|-------------|----------|
| Sí, global | Media query global que reduce/desactiva transiciones del plano (~300ms) y de pasos (WCAG 2.3.3) | ✓ |
| Solo el plano | Reduced-motion únicamente en la animación del plano (la más notoria) | |
| Fuera de alcance | Dejar las animaciones como están | |

**User's choice:** Sí, global (→ D-04)
**Notes:** Media query en `src/styles/index.css` (donde vive fp-anim); aplica a todas las animaciones.

---

## Claude's Discretion

- Qué pares de color exactos no llegan a 4.5:1 y cómo ajustarlos (afinar tonos muted, no la paleta).
- Orden exacto de tabulación y `tabindex`/roles ARIA puntuales.
- Labels visibles vs `sr-only`/`aria-label` por control.
- Implementación concreta de la media query reduced-motion y a qué transiciones aplica.
- Detección y fix puntual de desbordes a 375px.
- Si se agrega un checkpoint visual humano al cierre.

## Deferred Ideas

- Auditoría WCAG 2.1 AA formal completa (nivel producción) — fuera del MVP.
- Herramientas de a11y como dependencia del repo (axe/eslint-jsx-a11y/Lighthouse CI) — descartado por D-02.
- Soporte certificado de lectores de pantalla / i18n — fuera de alcance del demo.
