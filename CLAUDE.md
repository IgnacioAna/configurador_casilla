<!-- GSD:project-start source:PROJECT.md -->
## Project

**Configurador Visual de Casillas Rurales Impacar**

Configurador web (MVP/demo, sin backend) para Industrias Impacar — fabricante de casillas
rurales a medida de General Pico, La Pampa. Guía al cliente a través de un wizard de 6 pasos,
muestra un plano en planta (SVG, vista cenital) que se actualiza en tiempo real, y al final
genera un resumen con croquis + presupuesto estimado que se puede enviar por WhatsApp o
descargar en PDF. El público objetivo son contratistas rurales, productores agropecuarios y
estancieros que hoy configuran su casilla por WhatsApp con audios y croquis a mano.

**Core Value:** El cliente ve su casilla tomar forma visualmente (plano en planta en vivo) mientras la
configura paso a paso, y termina con un resumen + presupuesto listo para enviar — reemplazando
el ida y vuelta de audios y croquis por WhatsApp.

### Constraints

- **Tech stack**: Vite + React 18 (hooks) + Tailwind CSS v3 — stack liviano, sin backend.
- **Render del plano**: SVG nativo (sin librerías de dibujo pesadas) — performance en mobile.
- **PDF**: jsPDF con el plano como vector — única dependencia "pesada", justificada por el
  requisito de descarga de archivo real.
- **Sin backend**: todo client-side; el estado vive en `localStorage` (key `impacar_config_v1`).
- **Idioma**: español argentino, trato de usted (contexto comercial rural).
- **Estructura de zonas fija**: baulera 0.60m | baño | dormitorio | estar/comedor | cocina 0.60m.
- **Geometría real**: ancho exterior 2.60m, interior útil 2.52m, camas 0.80m, pasillo 0.92m.
- **Precios**: netos de Lista 108 (Feb-2026); el presupuesto muestra neto + IVA 21% + total.
- **Identidad visual**: sobria/industrial (catálogo de maquinaria agrícola, no startup tech).
  Paleta fondo #F5F5F0, verde campo #2D5016, cobre #8B6914, texto #1A1A1A. Zonas del plano:
  baño celeste, dormitorio marrón, cocina verde. Logo: texto "IMPACAR" bold (placeholder).
- **Mobile-first**: el target es un Samsung ~6"; el plano debe ser colapsable/zoomable en mobile.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
