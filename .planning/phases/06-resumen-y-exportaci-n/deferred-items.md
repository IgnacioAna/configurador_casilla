# Deferred Items — Fase 06 (Resumen y Exportación)

Hallazgos fuera del scope de las tareas ejecutadas, registrados para una decisión futura.
NO se arreglan dentro del plan que los descubrió (scope boundary).

## DEF-06-01 — Aviso de seguridad en devDependencies (esbuild / vite)

- **Descubierto en:** Plan 06-01, Task 1 (`npm install jspdf@4.2.1 svg2pdf.js@2.7.0`).
- **Síntoma:** `npm install` reporta 2 vulnerabilidades (1 moderate + 1 high) en
  `node_modules/esbuild` → `node_modules/vite`.
- **Por qué es fuera de scope:** son **devDependencies preexistentes** (toolchain de build),
  NO introducidas por este plan. El gate de seguridad del plan
  (`npm audit --omit=dev` para las deps de runtime jspdf/svg2pdf.js) está **limpio
  (0 vulnerabilidades)**. `security_block_on: high` aplica a las deps que el plan agrega.
- **Remediación (futura):** `npm audit fix --force` propone un bump mayor de `vite`
  (breaking change del build). Evaluar fuera de esta fase, idealmente con verificación
  de que `npm run build` / `npm run dev` siguen funcionando.
- **Estado:** diferido. No bloquea la Fase 06 (lógica pura, sin build de producción tocado).
