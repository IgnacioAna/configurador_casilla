---
phase: 6
slug: resumen-y-exportaci-n
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-06-27
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from `06-RESEARCH.md` § Validation Architecture. Project rule: pure logic is tested with
> Node's built-in `node:test` (no new test deps, Phases 4-5 pattern); browser-side PDF generation is
> verified manually in the dev server.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `node:test` (built-in) + `node:assert/strict` — no test dependencies |
| **Config file** | none — test files are listed explicitly in the `test` script in `package.json` |
| **Quick run command** | `node --test src/utils/<archivo>.test.js` (single file touched) |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~2 seconds (pure logic, no browser) |

---

## Sampling Rate

- **After every task commit:** Run `node --test <archivo .test.js tocado>` (< 1s)
- **After every plan wave:** Run `npm test` (full pure-logic suite)
- **Before `/gsd-verify-work`:** `npm test` green + manual PDF/deep-link checklist in dev server
- **Max feedback latency:** 2 seconds (automated) / manual visual for PDF + interactions

---

## Per-Task Verification Map

> Task IDs / Plan / Wave are assigned by the planner; rows below are the requirement-level
> verification contract every plan must satisfy. `Threat Ref` maps to `06-RESEARCH.md` § Security Domain.

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | 1 | RESUMEN-02 | T-tampering | `detallePresupuesto` base+extras con label/precioNeto correctos | unit | `node --test src/utils/motorPrecios.test.js` | ⚠️ extend | ⬜ pending |
| TBD | TBD | 1 | RESUMEN-02 | — | neto/iva/total de `detallePresupuesto` == `calcularPresupuesto` (paridad, una sola suma) | unit | `node --test src/utils/motorPrecios.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | RESUMEN-02 | — | ítems agrupables por `categoria`/`subgrupo` (bano/dorm/cocina/confort/energia) | unit | `node --test src/utils/motorPrecios.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | RESUMEN-02 | T-tampering | estado adulterado → sin `$NaN`, label "Modelo no disponible" | unit | `node --test src/utils/motorPrecios.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | RESUMEN-01 | T-tampering | `resumenCampos` traduce ids→nombres reales (uso, modelo+largo, baño, camas C/S/M, cocina/heladera, extras) | unit | `node --test src/utils/resumenCampos.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | RESUMEN-01 | T-tampering | `resumenCampos` con campos null/vacíos → 'Sin selección' (nunca undefined) | unit | `node --test src/utils/resumenCampos.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | EXPORT-01 | T-inject | `mensajeWhatsApp` incluye modelo, total formateado, nota orientativa, recordatorio PDF; trato de usted | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | EXPORT-01 | — | `mensajeWhatsApp` sin voseo (gate anti-voseo, patrón Fase 3) | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | EXPORT-01 | T-inject | `linkWhatsApp` = `https://wa.me/<dígitos>?text=...`; número desde CONTACTO; `\n`→`%0A` vía encodeURIComponent | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | EXPORT-01 | — | `linkWhatsApp` con todos los extras < ~2000 chars (límite práctico de URL) | unit | `node --test src/utils/exportWhatsApp.test.js` | ❌ W0 | ⬜ pending |
| TBD | TBD | 1 | EXPORT-02 | — | `nombreArchivoPDF` → `presupuesto-impacar-N4.pdf`; sin modelo → `...-sin-modelo.pdf` | unit | `node --test src/utils/exportPDF.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/utils/motorPrecios.test.js` — **extend** with `detallePresupuesto` tests (total parity, items, grouping, corrupt state). Covers RESUMEN-02.
- [ ] `src/utils/resumenCampos.test.js` — **new**; ids→nombres translation + 'Sin selección'. Covers RESUMEN-01.
- [ ] `src/utils/exportWhatsApp.test.js` — **new**; message, anti-voseo, link, encoding, length. Covers EXPORT-01.
- [ ] `src/utils/exportPDF.test.js` — **new**; ONLY `nombreArchivoPDF` (the pure part). Covers EXPORT-02 (filename).
- [ ] Add the 3 new test files to the `test` script in `package.json` (the runner lists them explicitly).
- [ ] Framework install: **none** (`node:test` is built-in; `jspdf`/`svg2pdf.js` are NOT unit-tested in node).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PDF generado: plano **vectorial** + logo IMPACAR + presupuesto + config + contacto en **1 página A4** | EXPORT-02 | jsPDF/svg2pdf corren en el navegador (browser-side); automatizarlo exigiría un headless browser = dep nueva contraria al patrón | `npm run dev` → ir al resumen → click "Descargar PDF" → abrir el PDF, hacer zoom para confirmar que el plano es vector (no pixela), confirmar 1 sola página y todos los bloques presentes |
| Deep-link "Editar" por sección navega al paso correcto (IR_A_PASO + vista='wizard') | RESUMEN-01 | Interacción de UI con estado | `npm run dev` → resumen → click "Editar" en cada sección → verificar que abre el paso correspondiente con el estado intacto |
| WhatsApp abre con el mensaje pre-armado correcto | EXPORT-01 | Abre app/web externa; el link se testea unitariamente pero la apertura real es manual | `npm run dev` → resumen → click "Enviar por WhatsApp" → verificar que abre con el texto esperado (al número de pruebas 5492954555113) |
| Bloque de financiación lista las 3 opciones de `FINANCIACION` | RESUMEN-03 | Render data-driven; verificación visual (o data-test opcional sobre FINANCIACION) | `npm run dev` → resumen → confirmar contado / financiado / permuta con su detalle |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 2s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
