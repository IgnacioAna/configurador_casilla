---
phase: 05
slug: 05-pasos-4-6-y-motores-dormitorio-cocina-extras-precios
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-27
---

# Phase 05 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Scope: 9 mitigate threats (code evidence required) + 6 accept threats (documented no-aplica).
> App is 100% client-side (Vite + React, no backend, no network, no auth, no secrets).
> Only trust boundary: restored localStorage state (key `impacar_config_v1`).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| localStorage → motores puros | `estado` restored from `impacar_config_v1` enters `calcularPresupuesto` / `camasEntran`. Only trust boundary: 100% client-side, no network, no backend, no auth, no secrets. | Arbitrary JSON object; user-writable. |
| localStorage → configDesdeEstado | Restored `estado` (possibly old, with legacy `cocina`/`estar` or without `extras`) enters the estado→plano projection. | Arbitrary JSON object; user-writable. |
| localStorage → pasos (handlers) | Restored `estado.extras` / `estado.dormitorio.camas` are read in the handlers of PasoDormitorio, PasoCocina, PasoExtras. | Array fields; user-writable. |
| localStorage → wizard render | Restored `estado` (with `pasoActual` / `extras` possibly tampered) decides which step renders and whether BarraPrecio mounts. | `pasoActual` integer + array fields; user-writable. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-05-01 | Tampering | `calcularPresupuesto(estado)` | mitigate | `Array.isArray(estado?.extras)` falls back to `[]`; `MODELOS.find` on invalid `modeloId` → `undefined` → `base = modelo?.precioNeto ?? 0` → 0; `estado` null → optional chaining `estado?.modeloId`. Neto ≥ 0, no crash. | closed |
| T-05-02 | Tampering | `capacidadFootprints` / `footprintsDeCamas` | mitigate | `MODELOS.find` on unknown `modeloId` returns `undefined` → `return 0`; `Array.isArray(camas) ? camas : []` before reduce; `c?.tipo` optional chaining on array elements without `tipo`. No crash. | closed |
| T-05-03 | DoS | motores puros | accept | No unbounded loops over remote network input; `extras`/`camas` come from local UI. No remote attacker; user can only affect themselves. See Accepted Risks Log. | closed |
| T-05-04 | Info Disclosure / Repudiation / Elevation | — | accept | No server, no session, no third-party data, no privileges. Lista 108 prices are public catalog. See Accepted Risks Log. | closed |
| T-05-05 | Tampering | `configDesdeEstado(estado)` | mitigate | `Array.isArray(estado.extras) ? estado.extras : []` before all `extras.includes()` calls; cocina/estar derived to neutral defaults `{horno:false,heladera:null}`, `{mesa:false}`. Legacy state with `cocina`/`estar` fields is silently ignored (never read). No crash. | closed |
| T-05-06 | Tampering | Estado persistido legacy | mitigate | `estadoInicial` has no `cocina`/`estar` placeholders (D-14 applied). `esEstadoValido` continues to require `Array.isArray(valor.extras)` — not relaxed. Old fields ignored; new fields start empty. | closed |
| T-05-07 | DoS / Info / Repudiation / Elevation | — | accept | Pure projection without network/server/session. See Accepted Risks Log. | closed |
| T-05-08 | Tampering | Handlers de los 3 pasos | mitigate | `PasoDormitorio`: `Array.isArray(estado.dormitorio?.camas)` (line 25) and `Array.isArray(estado.extras)` (line 48) before all `.includes`/`.filter`/`.findIndex` calls. `PasoCocina`: `Array.isArray(estado.extras)` (line 38). `PasoExtras`: `Array.isArray(estado.extras)` (line 20). All 3 entry points covered. | closed |
| T-05-09 | Tampering | Selector exclusivo de heladera | mitigate | `IDS_HELADERA` derived at module scope from `EXTRAS.filter(e => e.categoria === 'cocina' && e.id.startsWith('heladera-')).map(e => e.id)` (not from user input). `elegirHeladera` filters BOTH heladera ids out then conditionally adds the chosen one — impossible to end up with 2 heladeras (Pitfall 2). Unknown ids in extras[] are preserved. | closed |
| T-05-10 | DoS / Info / Repudiation / Elevation | — | accept | Presentational components without network/server/session; Lista 108 prices are public catalog. See Accepted Risks Log. | closed |
| T-05-11 | Tampering | `BarraPrecio({ estado })` | mitigate | Robustness lives in `calcularPresupuesto` (T-05-01): invalid `modeloId` → neto 0; non-array `extras` → ignored. `BarraPrecio` only formats the result. `formatPrecio` in `formato.js` applies `Math.round(Number(n) \|\| 0)` — tolerates NaN/null. Never crashes; never renders `$NaN`. | closed |
| T-05-12 | DoS / Info / Repudiation / Elevation | — | accept | Presentational component without network/server/session; prices are public catalog. See Accepted Risks Log. | closed |
| T-05-13 | Tampering | Montaje condicional `estado.pasoActual >= 3` | mitigate | HARDENED (CR-01, commit `1cdf6b1`): `esEstadoValido` now requires `Number.isInteger(valor.pasoActual) && valor.pasoActual >= 0 && valor.pasoActual < TOTAL_PASOS` (lines 36-38 of `usePersistedConfig.js`). Out-of-range or non-integer `pasoActual` is rejected and `estadoInicial` is used. Defense-in-depth: `ConfiguratorWizard.jsx` line 16 uses `PASOS[estado.pasoActual] ?? PASOS[0]` as last-resort fallback. | closed |
| T-05-14 | Tampering | Pasos 4-6 render | mitigate | `pasosRegistro.jsx` registers real components (`PasoDormitorio`, `PasoCocina`, `PasoExtras`); no stubs remain. Components already defend against tampered extras/camas per T-05-08 evidence. No new trust boundary introduced by registration. | closed |
| T-05-15 | DoS / Info / Repudiation / Elevation | — | accept | Client-side render without network/server/session; prices are public catalog. See Accepted Risks Log. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-05-01 | T-05-03 | DoS not applicable: no unbounded loops over remote/network input; all array inputs (`extras`, `camas`) come from local UI interactions. The only attacker is the user themselves, who can only affect their own session. No server, no remote attacker surface. | gsd-security-auditor | 2026-06-27 |
| AR-05-02 | T-05-04 | Info Disclosure / Repudiation / Elevation not applicable: no server, no session, no third-party data, no privilege levels. Lista 108 prices are a public commercial catalog — not a secret. No audit trail requirement exists for a client-side configurator with no account system. | gsd-security-auditor | 2026-06-27 |
| AR-05-03 | T-05-07 | DoS / Info / Repudiation / Elevation not applicable: `configDesdeEstado` is a pure projection function with no network calls, no server, and no session. The domain is a rural cabin configurator; there are no privileges to elevate and no sensitive data to disclose. | gsd-security-auditor | 2026-06-27 |
| AR-05-04 | T-05-10 | DoS / Info / Repudiation / Elevation not applicable: PasoDormitorio, PasoCocina, PasoExtras are presentational components with no network calls, server, or session. Prices displayed are from public Lista 108 catalog. | gsd-security-auditor | 2026-06-27 |
| AR-05-05 | T-05-12 | DoS / Info / Repudiation / Elevation not applicable: BarraPrecio is a presentational component with no network calls, server, or session. Prices displayed are from public Lista 108 catalog. | gsd-security-auditor | 2026-06-27 |
| AR-05-06 | T-05-15 | DoS / Info / Repudiation / Elevation not applicable: the wizard render orchestration (pasosRegistro + ConfiguratorWizard) is entirely client-side with no network calls, server, session, or privilege model. | gsd-security-auditor | 2026-06-27 |

---

## Evidence Index (MITIGATE threats)

| Threat ID | File | Line(s) | Pattern Found |
|-----------|------|---------|---------------|
| T-05-01 | `src/utils/motorPrecios.js` | 11-13 | `estado?.modeloId`, `modelo?.precioNeto ?? 0`, `Array.isArray(estado?.extras) ? estado.extras : []` |
| T-05-02 | `src/utils/validacionCamas.js` | 9-10, 17-18 | `if (!m) return 0`, `Array.isArray(camas) ? camas : []`, `c?.tipo` |
| T-05-05 | `src/state/wizardReducer.js` | 91 | `const extras = Array.isArray(estado.extras) ? estado.extras : []` |
| T-05-06 | `src/state/wizardReducer.js` | 20-33 | `estadoInicial` has no `cocina`/`estar` keys (D-14 applied) |
| T-05-06 | `src/hooks/usePersistedConfig.js` | 44 | `Array.isArray(valor.extras)` — not relaxed |
| T-05-08 | `src/components/wizard/pasos/PasoDormitorio.jsx` | 25, 48 | `Array.isArray(estado.dormitorio?.camas)`, `Array.isArray(estado.extras)` |
| T-05-08 | `src/components/wizard/pasos/PasoCocina.jsx` | 38 | `Array.isArray(estado.extras)` |
| T-05-08 | `src/components/wizard/pasos/PasoExtras.jsx` | 20 | `Array.isArray(estado.extras)` |
| T-05-09 | `src/components/wizard/pasos/PasoCocina.jsx` | 32-34, 50 | `IDS_HELADERA` at module scope from `EXTRAS.filter(...startsWith('heladera-'))`, `extras.filter(x => !IDS_HELADERA.includes(x))` |
| T-05-11 | `src/components/wizard/BarraPrecio.jsx` | 9 | Delegates to `calcularPresupuesto` (T-05-01 mitigated) |
| T-05-11 | `src/utils/formato.js` | 7 | `Math.round(Number(n) \|\| 0)` — NaN/null safe |
| T-05-13 | `src/hooks/usePersistedConfig.js` | 36-38 | `Number.isInteger(valor.pasoActual) && valor.pasoActual >= 0 && valor.pasoActual < TOTAL_PASOS` |
| T-05-13 | `src/components/ConfiguratorWizard.jsx` | 16 | `PASOS[estado.pasoActual] ?? PASOS[0]` |
| T-05-14 | `src/components/wizard/pasosRegistro.jsx` | 8-10, 16-18 | `import PasoDormitorio/PasoCocina/PasoExtras`; `Componente: PasoDormitorio/PasoCocina/PasoExtras` |

---

## Unregistered Flags

None. All threat flags surfaced in SUMMARY.md files (05-01 through 05-05) map to existing threat IDs in the register (T-05-01, T-05-02, T-05-05, T-05-08, T-05-09). No new attack surface appeared during implementation without a threat mapping.

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-27 | 15 | 15 | 0 | gsd-security-auditor (claude-sonnet-4-6) |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-27
