---
phase: 5
slug: pasos-4-6-y-motores-dormitorio-cocina-extras-precios
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-27
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Los dos motores de esta fase (validación de capacidad de camas + motor de precios) son lógica
> pura → 100% testeables con `node:test`, sin DOM. Los componentes y el reflejo del plano se
> verifican visualmente (checkpoint human-verify ~375px, como en Fase 4).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in, Node v24.x) + `node:assert/strict` |
| **Config file** | none — los tests se enumeran en el script `test` de `package.json` (ver Wave 0) |
| **Quick run command** | `node --test src/utils/validacionCamas.test.js src/utils/motorPrecios.test.js` |
| **Full suite command** | `npm test` (debe incluir los 2 archivos nuevos) |
| **Estimated runtime** | ~3 segundos |

---

## Sampling Rate

- **After every task commit:** Run `node --test <archivo de test del motor que toca el task>`
- **After every plan wave:** Run `npm test` (suite completa, con los archivos nuevos agregados al script)
- **Before `/gsd-verify-work`:** `npm test` verde + `npm run build` OK + checkpoint human-verify visual (~375px)
- **Max feedback latency:** ~3 segundos (suite completa)

---

## Per-Task Verification Map

> Task IDs se completan al planificar (planner produce los plans). Mapa por requirement/decisión.

| Req / Dec | Wave | Behavior | Test Type | Automated Command | File Exists | Status |
|-----------|------|----------|-----------|-------------------|-------------|--------|
| DORM-02 | 1 | `camasEntran` usa `MODELOS.camasBase` (N4→4, M=2 footprints, C/S=1); N5+ `personalizable` → Infinity (siempre entra) | unit | `node --test src/utils/validacionCamas.test.js` | ❌ W0 | ⬜ pending |
| DORM-02 | 1 | id/modeloId adulterado → capacidad 0 (no crashea); `camas` no-array → 0 footprints | unit | idem | ❌ W0 | ⬜ pending |
| DORM-01/02 | 1 | combinación límite (4 simples en N4 entra, 5 no); matrimonial = 2 footprints, máx 1 | unit | idem | ❌ W0 | ⬜ pending |
| PRECIO-01 | 1 | `calcularPresupuesto(N4, [])` → neto 38.971.845; total = neto×1.21 | unit | `node --test src/utils/motorPrecios.test.js` | ❌ W0 | ⬜ pending |
| PRECIO-01 | 1 | suma de extras seleccionados exacta (N4 + todos los 17 = neto 55.977.868, total 67.733.220) | unit | idem | ❌ W0 | ⬜ pending |
| PRECIO-01 | 1 | una sola fuente: `cocina.horno` NO suma; solo `extras[]` suma | unit | idem | ❌ W0 | ⬜ pending |
| PRECIO-01 | 1 | estado adulterado (modeloId inválido, extras no-array) → no crashea, neto≥0 (nunca $0 si hay modelo) | unit | idem | ❌ W0 | ⬜ pending |
| D-08 | 1 | los 9 extras `categoria:'extras'` tienen `subgrupo` válido (`confort`\|`energia`); 7 confort + 2 energía | unit | `node --test src/data/extras.test.js` (nuevo) | ❌ W0 | ⬜ pending |
| D-14 | ≥2 | `configDesdeEstado` deriva `cocina.horno`/`cocina.heladera`/`estar.mesa` de `extras[]` (no de `estado.cocina`/`estado.estar`) | unit | `node --test src/state/wizardReducer.test.js` (extender) | ✅ existe (extender) | ⬜ pending |
| DORM-03 / COCINA-04 | ≥2 | plano refleja camas C/S/M + horno + mesa + heladera (esquemático) | manual (visual) | checkpoint human-verify ~375px | n/a | ⬜ pending |
| PRECIO-01 (UI) | ≥2 | barra/chip sticky aparece en Paso 4, NO en Pasos 1-3; formato `$29.108.976` | manual (visual) | checkpoint human-verify | n/a | ⬜ pending |
| COCINA-01/02/03 / EXTRAS-01 | ≥2 | steppers camas, exclusividad heladera, toggles cocina/estar, split confort/energía | manual (visual) | checkpoint human-verify | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

> Valores numéricos verificados por recálculo [VERIFIED: node]: N4 neto 38.971.845; N4 + 17 extras = neto 55.977.868, total c/IVA 67.733.220.

---

## Wave 0 Requirements

- [ ] `src/utils/validacionCamas.test.js` — stubs/tests para DORM-02 (capacidad data-driven desde `camasBase`, M=2, N5+ ∞, id adulterado)
- [ ] `src/utils/motorPrecios.test.js` — stubs/tests para PRECIO-01 (suma única desde `extras[]`, IVA/total, estado adulterado)
- [ ] `src/data/extras.test.js` — stubs/tests para D-08 (metadato `subgrupo` íntegro: 7 confort + 2 energía)
- [ ] Extender `src/state/wizardReducer.test.js` — D-14 (derivación desde `extras[]`) + ajustar aserciones de `estadoInicial` si se eliminan `cocina`/`estar`
- [ ] **`package.json`** — agregar los archivos de test nuevos al script `test` (o migrar a `node --test src/`). **Sin esto los tests nuevos NO corren (Pitfall 5).**
- [ ] Framework install: ninguno — `node:test` ya disponible (built-in)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Reflejo del plano (camas C/S/M, horno, mesa, heladera) | DORM-03, COCINA-04 | Render SVG visual, sin DOM testing en este proyecto | Configurar modelo + camas + cocina/estar; verificar que la zona dormitorio dibuja las camas y la zona cocina verde refleja los módulos (~375px) |
| Barra de precio sticky | PRECIO-01 | Layout sticky mobile/desktop, percepción visual | Verificar que NO aparece en Pasos 1-3 y SÍ desde Paso 4; total en formato `$29.108.976`, 3 líneas (neto/IVA/total) |
| Steppers, exclusividad heladera, split confort/energía, advertencia de capacidad | DORM-01, COCINA-01/02/03, EXTRAS-01 | Interacción UI + copy (trato de usted) | Recorrer Pasos 4-6 a ~375px; matrimonial topea en 1; elegir heladera quita la otra; extras agrupados Confort/Energía; advertencia clara sin bloquear Siguiente |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify (motores) or Wave 0 dependencies, o están en Manual-Only (UI/plano)
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (4 archivos de test + package.json script)
- [ ] No watch-mode flags
- [ ] Feedback latency < 5s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
