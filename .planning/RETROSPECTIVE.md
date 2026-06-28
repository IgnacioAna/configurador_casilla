# Project Retrospective

*Documento vivo, actualizado al cierre de cada milestone. Las lecciones alimentan la planificación futura.*

## Milestone: v1.0 — MVP

**Shipped:** 2026-06-28
**Phases:** 7 | **Plans:** 22 | **Sessions:** ~2 (2026-06-27 → 28)

### What Was Built
- Motor de plano SVG cenital (estructura de zonas fija + geometría real, render declarativo puro, transiciones + reduced-motion).
- Wizard de 6 pasos con landing, barra de progreso, persistencia localStorage y plano colapsable/sticky.
- Motores de validación de camas y de precios (neto/IVA/total) puros, testeados con `node:test`.
- Resumen + exportación: presupuesto desglosado, financiación, WhatsApp (wa.me) y PDF vectorial (jsPDF + svg2pdf).
- Pulido mobile 375px + accesibilidad (labels, contraste, teclado end-to-end, reduced-motion global).

### What Worked
- **Interface-first**: construir la lógica pura testeable (motores, helpers) antes que los componentes evitó retrabajo y dio una red de regresión barata (100 tests sin deps).
- **`node:test` built-in + anti-hardcodeo por gates grep**: cero dependencias de test, datos siempre desde `/data`.
- **Plano como helper puro `calcularLayout` + render declarativo**: el render no recalcula geometría; fácil de testear y de animar.
- **Checkpoints visuales humanos** al cierre de fases con UI (4, 5, 6, 7): atraparon el ajuste real a 375px que los tests no ven.
- **Una sola fuente de la suma** (detallePresupuesto compone sobre calcularPresupuesto): el total del resumen nunca divergió de la barra del wizard.

### What Was Inefficient
- **Desincronización del tablero**: el paso "complete phase" de execute-phase no actualizó ROADMAP/REQUIREMENTS/STATE porque los namespaces de CLI (`roadmap.*`, `phase.complete`) no existen en este entorno → hubo que sincronizar a mano en cada fase (Fase 5 incluso quedó marcada como no-ejecutada pese a estar completa).
- **Worktrees en Windows + OneDrive**: el code-review-fix corrió en worktree aislado y dejó el árbol del foreground desincronizado (HEAD adelantado, disco viejo) → requirió `git reset --hard HEAD` para reconciliar.
- El milestone audit quedó stale (4/7) — no se re-corrió antes del cierre.

### Patterns Established
- Tracking del tablero **manual** tras cada execute-phase en este repo (ver memoria `execute-phase-board-desync`).
- CLI GSD vía `node ~/.claude/get-shit-done/bin/gsd-tools.cjs <command>` (sin `query`), con namespaces faltantes manejados a mano (memoria `gsd-cli-invocation`).
- Ejecución **secuencial sin worktrees** en Windows (parallelization=false) como camino seguro.
- Número/secretos de contacto vía `import.meta.env` con default seguro (swap por `.env.production`, sin tocar código).

### Key Lessons
1. En este entorno, **auditar el tablero a mano después de cada fase** — el "complete phase" automatizado no cierra ROADMAP/REQUIREMENTS/STATE.
2. **Verificar antes de marcar**: confirmar ground truth (`npm test` + artefactos) antes de flipear checkboxes evitó propagar el estado erróneo de la Fase 5.
3. **Worktrees + OneDrive no se llevan bien**: preferir ejecución secuencial; si un agente usa worktree, reconciliar el foreground con `git reset --hard HEAD` (los commits están a salvo en HEAD).
4. El code review pragmático encontró **un bug funcional real** (banco-despensero) que ni los tests ni el verifier habían detectado — vale la pena correrlo.

### Cost Observations
- Model mix: orquestador + agentes mayormente **opus** (research/plan/execute), **sonnet** para checker/verifier/security/code-review.
- Notable: la fase de pulido (7) es CSS/markup/foco — verificación 100% manual con preview tools (sin deps de a11y), eficiente sin sacrificar cobertura real (UAT E2E a 375px).

---

## Cross-Milestone Trends

### Process Evolution

| Milestone | Sessions | Phases | Key Change |
|-----------|----------|--------|------------|
| v1.0 | ~2 | 7 | Baseline: flujo GSD discuss→plan→execute por fase; tracking del tablero sincronizado a mano por CLI incompleto |

### Cumulative Quality

| Milestone | Tests | Coverage | Zero-Dep Additions |
|-----------|-------|----------|--------------------|
| v1.0 | 100 (`node:test`) | lógica pura (motores/helpers/export); UI/a11y verificada manual | Solo runtime: `jspdf` + `svg2pdf.js` (PDF vectorial); 0 deps de test |

### Top Lessons (Verified Across Milestones)

1. Auditar el tablero a mano tras cada execute-phase (CLI de tracking incompleto en este entorno).
2. Interface-first + `node:test` sin deps = red de regresión barata y mantenible.
