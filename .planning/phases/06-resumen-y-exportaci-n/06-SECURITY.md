---
phase: 6
slug: resumen-y-exportaci-n
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-28
---

# Phase 6 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> **Auditoría:** 2026-06-28 · STRIDE / ASVS L1 · `block_on: high` · **Resultado: SECURED — 10/10 amenazas cerradas.**
> Nivel de riesgo de la fase: BAJO (sin auth, sin datos sensibles, sin inputs de red).

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| localStorage (`impacar_config_v1`) → utilidades/componentes | Estado restaurado = entrada NO confiable (el usuario puede editar localStorage). Se trata como no confiable en motores y resumen. | Config del wizard (modeloId, extras, camas) |
| npm registry → bundle | `jspdf`/`svg2pdf.js` son código de terceros incorporado al runtime. | Código de dependencias |
| App → wa.me (`<a target="_blank">`) | Apertura de un dominio externo en pestaña nueva. | Texto del mensaje (URL-encoded) |
| Estado interno → SVG → PDF | El SVG lo genera la app desde datos internos (no HTML user-supplied). | Geometría/datos de catálogo |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-06-01 | Tampering | `detallePresupuesto` / `resumenCampos` (localStorage adulterado) | mitigate | `motorPrecios.js:13,30` `Array.isArray(estado?.extras)`; `resumenCampos.js:43-44` optional chaining; `motorPrecios.js:37` totales delegados a `calcularPresupuesto` (0, nunca `$NaN`); `:33` `'Modelo no disponible'` | closed |
| T-06-02 | Tampering / supply chain (V14) | `package.json` deps `jspdf`/`svg2pdf.js` | mitigate | `package.json:14,17` `"jspdf": "4.2.1"` / `"svg2pdf.js": "2.7.0"` exactas (sin caret); `npm audit --omit=dev` → 0 vulnerabilidades | closed |
| T-06-03 | Information Disclosure | `nombreArchivoPDF` (modeloId en filename) | accept | Ver Accepted Risks — id de catálogo público (N1-N7), sin PII | closed |
| T-06-04 | Tampering / Injection | `linkWhatsApp` (estado adulterado en URL) | mitigate | `exportWhatsApp.js:36` `encodeURIComponent` sobre TODO el `text=`; número desde `CONTACTO`, nunca del estado | closed |
| T-06-05 | Tampering | `mensajeWhatsApp` con estado vacío/adulterado | mitigate | `exportWhatsApp.js:15-16` compone sobre `detallePresupuesto`/`resumenCampos`; tolerante a `null` y extras no-array | closed |
| T-06-06 | Information Disclosure | Número de WhatsApp en el código fuente | accept | Ver Accepted Risks — nº público/personal (D-08); prod vía `VITE_WA_NUMBER` en `.env.production`, no en el fuente | closed |
| T-06-07 | Tampering / tab hijack | `AccionesExport` `<a target="_blank">` a wa.me (reverse tabnabbing) | mitigate | `AccionesExport.jsx:79` `rel="noopener noreferrer"` | closed |
| T-06-08 | Tampering | `Resumen`/`ConfigSecciones`/`PresupuestoDesglosado` leen estado adulterado | mitigate | `Resumen.jsx:44` empty state si `uso/ocupantes` null; consumen helpers tolerantes; sin `$NaN`, sin crash | closed |
| T-06-09 | Tampering / DoS | `generarPDF` con `svgNode` null o estado corrupto | mitigate | `exportPDF.js:62` `if (svgNode)` + `:63` `viewBox?.baseVal`; `AccionesExport.jsx:87` `disabled={generando}`; `:63` `catch (err)` | closed |
| T-06-10 | (n/a) XSS — SVG en PDF | `generarPDF` / svg2pdf.js | accept | Ver Accepted Risks — SVG generado desde datos internos; svg2pdf no ejecuta scripts | closed |

*Status: open · closed* — *Disposition: mitigate · accept · transfer*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-06-01 | T-06-03 | `modeloId` en el filename del PDF es un id de catálogo público (N1-N7), sin PII ni dato comercial confidencial; visible solo en el FS local del cliente. | Ignacio | 2026-06-28 |
| AR-06-02 | T-06-06 | El nº por defecto es el personal de Ignacio, usado solo para pruebas de la demo (D-08, para no molestar a la fábrica). No es secreto/credencial. El nº de producción NO está en el fuente: se inyecta vía `VITE_WA_NUMBER` en `.env.production`. | Ignacio | 2026-06-28 |
| AR-06-03 | T-06-10 | El SVG embebido se genera 100% desde datos internos deterministas (geometría fija + MODELOS/EXTRAS); no hay ruta de HTML/scripts user-supplied; svg2pdf.js no tiene motor de scripting. | Ignacio | 2026-06-28 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-28 | 10 | 10 | 0 | gsd-security-auditor (sonnet) |

---

## Notas de auditoría

- **Aviso pre-existente en devDependencies (fuera de scope):** `npm audit` completo (incl. devDeps) reporta vulnerabilidades en `vite`/`esbuild` previas a la Fase 6, no introducidas por estos planes. El gate `npm audit --omit=dev` (runtime) está limpio. Registrado en `deferred-items.md`.
- **Swap a producción del nº de WhatsApp:** antes del go-live, crear `.env.production` con `VITE_WA_NUMBER=5492302468754` (y opcional `VITE_WA_DISPLAY=+54 9 2302 46-8754`). No es tarea de implementación de la Fase 6.
- Sin `## Threat Flags` nuevos en los SUMMARYs; las etiquetas `WR-01..WR-05` son work requirements de robustez del code review, no superficies de ataque nuevas.
- Auditoría sobre el código post code-review-fix (commits `d580a62`..`cce4c89`). Implementación READ-ONLY — ningún archivo de `src/` fue modificado durante la auditoría.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-28
