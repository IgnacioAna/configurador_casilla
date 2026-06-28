# Milestones — Configurador Visual de Casillas Rurales Impacar

Registro histórico de versiones entregadas. Detalle completo de cada milestone en `.planning/milestones/`.

---

## v1.0 MVP — ✅ SHIPPED 2026-06-28

**Entregado:** Configurador visual de casillas rurales funcional de punta a punta — wizard de 6 pasos con
plano en planta SVG en vivo, presupuesto desglosado y exportación por WhatsApp + PDF vectorial.

**Stats:**
- Fases: 7 (1-7) · Planes: 22 · Requirements v1: 34/34 completos
- Commits: ~163 (44 `feat`) · LOC `src/`: ~3.835 (JS/JSX/CSS)
- Tests: 100 (`node:test`, sin deps de test) · build verde
- Timeline: 2026-06-27 → 2026-06-28
- Tag: `v1.0`

**Accomplishments:**
1. **Motor de plano SVG cenital** con estructura de zonas fija y geometría real (interior 2.52m, camas 0.80m, pasillo 0.92m), render declarativo desde un helper puro, transiciones suaves + reduced-motion.
2. **Wizard de 6 pasos** con landing, barra de progreso, persistencia en localStorage y plano colapsable/sticky, todo en español argentino (trato de usted).
3. **Motores de lógica pura** (validación de capacidad de camas por modelo + motor de precios neto/IVA 21%/total) testeados con `node:test`, sin dependencias nuevas.
4. **Pantalla de resumen + exportación**: presupuesto desglosado por ítem + financiación, envío por WhatsApp (link wa.me pre-armado) y descarga de **PDF con el plano vectorial** (jsPDF + svg2pdf.js).
5. **Pulido mobile (~375px) y accesibilidad**: sin desbordes, inputs etiquetados, contraste ≥4.5:1, navegación por teclado end-to-end y `prefers-reduced-motion` global.

**Calidad:** cada fase verificada PASSED (VERIFICATION.md); code-review + fix en Fase 6 (6/6, incl. bug real
`banco-despensero`); seguridad verificada en Fases 5/6 (threats_open 0); UAT E2E en vivo a 375px aprobado.

**Known deferred items at close:**
- Swap del WhatsApp a producción (`VITE_WA_NUMBER=5492302468754` en `.env.production`) antes del go-live.
- Aviso de seguridad preexistente en devDependencies (`vite`/`esbuild`) — runtime limpio, fuera de scope.
- `v1.0-MILESTONE-AUDIT.md` quedó al estado 4/7 (stale); las 7 fases se verificaron individualmente + UAT E2E.

**Archivos:** `milestones/v1.0-ROADMAP.md` · `milestones/v1.0-REQUIREMENTS.md` · `milestones/v1.0-MILESTONE-AUDIT.md`
