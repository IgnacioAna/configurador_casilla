---
phase: 01-cimientos-y-datos
plan: 01
subsystem: infra
tags: [vite, react18, tailwindcss-v3, postcss, scaffolding]

# Dependency graph
requires: []
provides:
  - Proyecto Vite + React 18 (JavaScript, no TypeScript) que arranca con npm run dev y compila con npm run build
  - Tailwind CSS v3 configurado con PostCSS + autoprefixer y la paleta Impacar (impacar-* y zona-*) en theme.extend.colors
  - Fuente sans (Inter + fallbacks) configurada en el theme
  - Estructura de carpetas src/{components,data,styles,utils}
  - Shell base App.jsx que aplica la paleta Impacar vía clases custom de Tailwind
affects:
  - "Phase 01 Plan 02 (datos Lista 108 en /data y wireado en App.jsx)"
  - "Phase 02 (Motor de Plano SVG — usa los colores zona-* del theme)"
  - "Phase 03 (Cáscara del Wizard — construye sobre App.jsx y src/components)"
  - "Todas las fases siguientes (este plan es el cimiento del proyecto)"

# Tech tracking
tech-stack:
  added:
    - "vite@^5.4 (5.4.21)"
    - "react@^18.3.1 + react-dom@^18.3.1"
    - "@vitejs/plugin-react@^4.3"
    - "tailwindcss@^3.4 (3.4.19 — pin v3 explícito, NO v4)"
    - "postcss@^8.4 + autoprefixer@^10.4"
  patterns:
    - "Tailwind v3 con PostCSS y las 3 directivas @tailwind (base/components/utilities) — NO la sintaxis @import de v4"
    - "Paleta de marca centralizada en theme.extend.colors como clases custom (impacar-*, zona-*)"
    - "Carpetas vacías versionadas con .gitkeep"
    - "Texto user-facing en español argentino, trato de usted"

key-files:
  created:
    - "package.json"
    - "vite.config.js"
    - "index.html"
    - "postcss.config.js"
    - "tailwind.config.js"
    - "src/main.jsx"
    - "src/App.jsx"
    - "src/styles/index.css"
    - ".gitignore"
  modified: []

key-decisions:
  - "Tailwind v3 (3.4.19) con PostCSS y las 3 directivas @tailwind — se evita explícitamente v4 (que usa @tailwindcss/vite + @import)."
  - "Paleta Impacar como clases custom en theme.extend.colors (impacar-fondo/campo/cobre/texto, zona-bano/dormitorio/cocina) para que el resto del proyecto la consuma con utilidades."
  - "JavaScript (no TypeScript) y package-lock.json commiteado para reproducibilidad (mitiga T-01-01)."

patterns-established:
  - "Tailwind v3 setup vía PostCSS: postcss.config.js → tailwindcss + autoprefixer; CSS con @tailwind base/components/utilities."
  - "Colores de marca y de zonas del plano viven en el theme de Tailwind, consumidos como clases (bg-impacar-campo, text-impacar-cobre, etc.)."
  - "Estructura src/{components,data,styles,utils} como esqueleto del proyecto."

requirements-completed: []

# Metrics
duration: 4min
completed: 2026-06-27
---

# Phase 01 Plan 01: Scaffolding Vite + React 18 + Tailwind v3 con paleta Impacar Summary

**Proyecto Vite + React 18 (JS) con Tailwind CSS v3 vía PostCSS, paleta Impacar (impacar-*/zona-*) en el theme, y shell base App.jsx que compila limpio con npm run build y levanta con npm run dev.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-06-27T03:49:53Z
- **Completed:** 2026-06-27T03:54:18Z
- **Tasks:** 3
- **Files modified:** 12 (9 creados + package.json/lock actualizados + .gitkeep x3)

## Accomplishments
- Proyecto Vite + React 18 inicializado desde cero (greenfield): package.json con scripts dev/build/preview, vite.config.js con @vitejs/plugin-react, index.html (lang=es-AR, div#root), src/main.jsx montando React 18 con createRoot.
- Tailwind CSS v3 (3.4.19, NO v4) configurado con PostCSS + autoprefixer; paleta Impacar exacta en theme.extend.colors (impacar-fondo #F5F5F0, campo #2D5016, cobre #8B6914, texto #1A1A1A; zona-bano #BFE3EE, zona-dormitorio #C9A66B, zona-cocina #A7C796) y fuente sans (Inter + fallbacks).
- Shell base App.jsx renderiza header verde campo + main con acento cobre usando las clases custom (bg-impacar-campo, text-impacar-cobre, etc.), texto en español argentino con trato de usted.
- Estructura de carpetas src/{components,data,styles,utils} creada (carpetas vacías con .gitkeep).
- Pipeline verificado de punta a punta: npm install OK, npm run build limpio (genera dist/), npm run dev levanta en localhost:5173 sin errores; los colores custom se compilan correctamente en el bundle CSS.

## Task Commits

Each task was committed atomically:

1. **Task 1: Inicializar proyecto Vite + React 18** - `cd945cd` (feat)
2. **Task 2: Configurar Tailwind v3 con la paleta Impacar** - `35c5f87` (feat)
3. **Task 3: Shell base App.jsx con paleta aplicada y estructura de carpetas** - `0cc4439` (feat)

**Plan metadata:** (final commit — docs: complete plan, incluye SUMMARY/STATE/ROADMAP)

## Files Created/Modified
- `package.json` - Proyecto Vite + React 18 con scripts dev/build/preview y dependencias del stack (React 18.3.1, Vite 5.4, Tailwind 3.4, PostCSS, autoprefixer).
- `package-lock.json` - Lockfile commiteado para reproducibilidad (mitiga T-01-01).
- `vite.config.js` - Config Vite con plugin React.
- `index.html` - Entrada HTML (lang=es-AR, title "Configurador Impacar", div#root, script main.jsx).
- `postcss.config.js` - PostCSS con plugins tailwindcss + autoprefixer (requerido por Tailwind v3).
- `tailwind.config.js` - Content glob + paleta Impacar (impacar-*/zona-*) en theme.extend.colors y fontFamily.sans.
- `src/main.jsx` - Monta React 18 con createRoot e importa ./styles/index.css.
- `src/App.jsx` - Shell base con paleta Impacar aplicada vía clases custom (header campo, main con cobre).
- `src/styles/index.css` - Directivas @tailwind base/components/utilities + estilos de body.
- `.gitignore` - Excluye node_modules, dist, *.local.
- `src/components/.gitkeep`, `src/data/.gitkeep`, `src/utils/.gitkeep` - Versionan las carpetas vacías del proyecto.

## Decisions Made
- **Tailwind v3 vía PostCSS, no v4:** se instaló `tailwindcss@^3.4` con pin explícito (3.4.19 confirmado en runtime) y se usaron las 3 directivas `@tailwind` en lugar de la sintaxis `@import "tailwindcss"` de v4, según el stack obligatorio de PROJECT.md. Mitiga T-01-02.
- **Paleta como clases custom en el theme:** los colores de marca y de zonas del plano viven en `theme.extend.colors` para que el resto del proyecto los consuma como utilidades (`bg-impacar-campo`, `text-impacar-cobre`, `fill-zona-bano`, etc.).
- **package-lock.json commiteado:** para reproducibilidad de dependencias (mitiga T-01-01).

## Deviations from Plan

None - plan executed exactly as written.

Nota menor (no es una deviación de comportamiento): el ejemplo de App.jsx del plan usaba "vas a poder" (trato de vos). Se redactó como "va a poder configurar su casilla" (trato de usted) para respetar el constraint de PROJECT.md y el response_language del objetivo (español argentino, trato de usted). El plan ya pedía trato de usted en sus notas, así que esto cumple la intención del plan.

## Issues Encountered
- `npm audit` reporta 2 vulnerabilidades (1 moderada, 1 alta) en dependencias transitivas de dev de Vite 5 (cadena esbuild/dev-server). Quedan fuera de alcance: aplicar `npm audit fix --force` empujaría a un major breaking de Vite, el threat model acepta esta superficie en una fase de scaffolding sin backend (T-01-03/T-01-04), y no afectan el build de producción. No se modificó nada por esto.
- La verificación inicial de colores en el CSS compilado falló porque Tailwind emite el color `campo` en formato `rgb(45 80 22 / ...)` (función de color con opacidad) en lugar de hex literal `#2D5016`. Se confirmó por inspección que las clases custom (`bg-impacar-campo`, `bg-impacar-fondo`, `text-impacar-cobre`) y los valores resuelven correctamente en el bundle — no fue un problema real, solo el patrón de salida de Tailwind v3.

## Threat Model Compliance
- **T-01-01 (Tampering — deps npm):** mitigado. Versiones fijadas con caret a majors estables (react ^18.3.1, vite ^5.4, tailwindcss ^3.4); `package-lock.json` generado y commiteado. Sin dependencias fuera de las listadas.
- **T-01-02 (Tampering — Tailwind v4 por error):** mitigado. Pin explícito a `tailwindcss@^3.4.0`; versión instalada verificada en runtime = 3.4.19; el CSS usa las 3 directivas v3, no `@import "tailwindcss"`.
- **T-01-03 / T-01-04:** accept (sin secrets ni backend; app 100% client-side). Sin cambios.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Cimiento listo: el proyecto arranca y compila limpio con la paleta Impacar activa. Cubre el Success Criteria #1 de la fase.
- Habilita Plan 01-02 (datos reales Lista 108 en `src/data/` + utilidades formatPrecio/IVA wireadas en App.jsx) — la carpeta `src/data/` ya existe.
- No hay blockers ni stubs que impidan el avance. App.jsx es un shell intencionalmente mínimo (no es la landing real, que es Phase 3).

## Self-Check: PASSED

Todos los archivos declarados existen y los 3 commits de tarea están en el historial.

---
*Phase: 01-cimientos-y-datos*
*Completed: 2026-06-27*
