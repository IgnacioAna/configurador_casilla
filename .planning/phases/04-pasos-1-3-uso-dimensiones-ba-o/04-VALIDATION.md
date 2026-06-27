---
phase: 4
slug: pasos-1-3-uso-dimensiones-ba-o
status: validated
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-27
validated: 2026-06-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derivada de `04-RESEARCH.md` § Validation Architecture.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` + `node:assert/strict` (built-in Node 18+, sin dependencias — decisión 01-02) |
| **Config file** | none — se ejecuta por archivo con `node --test <ruta>` |
| **Quick run command** | `node --test src/utils/floorplanLayout.test.js` |
| **Full suite command** | `node --test src/utils/*.test.js src/state/*.test.js src/data/*.test.js` |
| **Estimated runtime** | ~2 segundos |

> No hay script `test` en package.json; el patrón establecido (3 suites existentes, 20/20 verde)
> es invocar `node --test <archivo>` directamente. Wave 0 puede agregar un script único (opcional).

---

## Sampling Rate

- **After every task commit:** Run `node --test src/utils/floorplanLayout.test.js` (suite que toca el cambio de BANO-03)
- **After every plan wave:** Run `node --test src/utils/*.test.js src/state/*.test.js src/data/*.test.js`
- **Before `/gsd-verify-work`:** Full suite verde + verificación visual en dev a ~375px
- **Max feedback latency:** ~5 segundos

---

## Per-Task Verification Map

> Los IDs de tarea se asignan durante la planificación; este mapa fija el contrato requirement → test
> que cada plan debe honrar (de `04-RESEARCH.md` § Phase Requirements → Test Map).

| Requirement | Wave | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|-------------|------|------------|-----------------|-----------|-------------------|-------------|--------|
| BANO-02 | 0/1 | — | umbral "ampliado" derivado de `MODELOS.largo >= 6.1` (N1/N2 no; N3+ sí), sin lista hardcodeada | unit (helper puro) | `node --test src/utils/banoReglas.test.js` | ✅ (4 tests) | ✅ green |
| USO-03 | 0/1 | — | `SUGERENCIA_OCUPANTES[n]` mapea cada ocupante (2/3/4/5/6/8) a un id válido de `MODELOS` | unit | `node --test src/data/models.test.js` | ✅ (2 tests) | ✅ green |
| BANO-03 | 1 | T-04-DoS | `calcularLayout` con `bano.tamano:'ampliado'` agranda baño vs 'estandar' | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (line 136) | ✅ green |
| BANO-03 | 1 | T-04-DoS | la suma de `largoM` sigue === `config.largo` con baño ampliado | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (line 144) | ✅ green |
| BANO-03 | 1 | T-04-DoS | con N3 ampliado ninguna zona central < `MINIMO_CENTRAL` (sin zonas negativas) | unit | `node --test src/utils/floorplanLayout.test.js` | ✅ (line 150, `largoM > 0`) | ✅ green |
| USO-01, USO-02, DIM-01, DIM-02, BANO-01 | 1 | T-04-Tamper | render de cards/chips/checkbox + selección única; ids leídos validados contra `MODELOS`/`EXTRAS` | manual (visual en dev) | `npm run dev` + inspección a ~375px | n/a | ✅ verificado (checkpoint 04-03 @375px) |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/utils/banoReglas.test.js` — `permiteBanoAmpliado(modeloId)` extraído a helper puro y testeado, 4 tests verdes (BANO-02)
- [x] `src/data/models.test.js` — `SUGERENCIA_OCUPANTES` mapea cada ocupante a un id válido de `MODELOS`, 2 tests verdes (USO-03)
- [x] Extender `src/utils/floorplanLayout.test.js` — 3 casos de BANO-03 verdes (ampliado > estándar, suma exacta, N3 sin zonas degeneradas)
- [x] Script `test` en package.json (`node --test` listando archivos explícitos) — agregado (commit `3d0e6b9`)
- [ ] (N/A) No se agregó `TOGGLE_EXTRA`: el equipamiento de baño se persiste en `extras[]` vía `SET_CAMPO` (toggle inmutable), sin acción nueva

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Render de cards de uso (5) con ícono y selección única | USO-01 | Sin React Testing Library / jsdom en el stack (decisión 01-02) | `npm run dev` → Paso 1: ver 5 cards con ícono, click selecciona una sola (radiogroup), foco visible |
| Selector de ocupantes (2/3/4/5/6/8) | USO-02 | idem | Paso 1: elegir ocupantes; ver feedback del modelo sugerido |
| Cards de modelo N1-N7 + pre-selección sugerida cambiable | DIM-01, DIM-02 | idem | Paso 2: 7 cards con largo/camas/"ideal para N"; sugerido pre-marcado; cambiar elige otro; plano se redibuja |
| Equipamiento de baño + chip "ampliado" deshabilitado en N1/N2 | BANO-01 | idem | Paso 3: marcar inodoro/vanitory; chip "ampliado" disabled con nota en N1/N2, habilitado en N3+ |
| Usabilidad a ~375px (touch ≥44px) | UX (mobile-first) | requiere viewport real | dev a ~375px: sin desbordes, targets ≥44px |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (los visuales puros quedan manual-only documentados — sin jsdom/RTL por decisión 01-02)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (banoReglas.test.js, models.test.js, floorplanLayout.test.js extendido) — todos verdes
- [x] No watch-mode flags (`node --test` corre y sale)
- [x] Feedback latency < 5s (suite completa ~0.2s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** validated 2026-06-27 (auditoría /gsd-validate-phase 4)

---

## Validation Audit 2026-06-27

State A: VALIDATION.md draft auditado contra la implementación ejecutada. Los 3 ítems Wave 0
que el draft marcaba MISSING ahora existen y corren verdes; los visuales puros se confirman
manual-only (sin jsdom/RTL por decisión 01-02), verificados a ~375px en el checkpoint 04-03.

| Metric | Count |
|--------|-------|
| Gaps found | 0 |
| Resolved | 0 |
| Escalated | 0 |
| Requirements COVERED (automatizados) | 5 aserciones / 3 suites (BANO-02 ·4, USO-03 ·2, BANO-03 ·3) |
| Requirements manual-only (verificados) | 5 (USO-01, USO-02, DIM-01, DIM-02, BANO-01) |

**Evidencia:** `node --test src/utils/banoReglas.test.js src/data/models.test.js src/utils/floorplanLayout.test.js`
→ 19/19 verde · `npm test` (suite completa) → 39/39 verde, 0 fallos, sin flaky.

**Auditor:** no se invocó `gsd-nyquist-auditor` — no había gaps que rellenar (Step 3: "No gaps → skip").
