# 03-03 SUMMARY — Plano responsive en el wizard (PLANO-03)

**Estado:** Completo (verificado en vivo por el orquestador vía preview). **Cierra la Fase 3.**
**Requirements:** PLANO-03.

## Qué se construyó

- `src/components/wizard/PlanoPanel.jsx` — contenedor responsive del plano. Embebe
  `<FloorPlan config={config} />` (Fase 2) + la leyenda de zonas. Presentación elegida:
  **card colapsable inline en mobile** (no modal — más simple, sin foco atrapado, recomendado
  por el plan). Dos bloques en un mismo componente:
  - **Desktop** (`hidden lg:block lg:sticky lg:top-4`): aside con "Plano actual" siempre visible,
    sticky al desplazar.
  - **Mobile** (`lg:hidden`): botón disparador "Ver plano actual" / "Ocultar plano"
    (`min-h-[44px]`, `aria-expanded`) que muestra/oculta el plano inline.
- `src/components/ConfiguratorWizard.jsx` — integra `<PlanoPanel config={configPlano} />` donde
  estaba el placeholder. `const configPlano = configDesdeEstado(estado)` (PLANO-03: el plano se
  dibuja desde el estado, no desde un mock fijo). Layout de **dos columnas en desktop**
  (`lg:grid lg:grid-cols-[1fr_minmax(320px,400px)] lg:items-start lg:gap-8`): pasos a la izquierda
  (`lg:order-1`), plano a la derecha (`lg:order-2`). En mobile (una columna) el disparador del
  plano queda arriba de los pasos por el source order.

## Decisiones

- **Mobile = card colapsable inline** (no modal): evita atrapar el foco y bloquear scroll (T-03-08).
- **Sticky desktop** vía `lg:sticky lg:top-4 lg:self-start` en el aside, dentro de un grid con
  `lg:items-start` para que el sticky funcione.
- El plano ya **reacciona al estado** (`configDesdeEstado`): cuando las Fases 4-5 llenen los pasos,
  el plano se actualizará solo. En Fase 3 muestra el modelo inicial N4.

## Verificación en vivo (preview)

- Desktop (1280px): dos columnas, plano a la derecha, `position: sticky`, disparador mobile oculto,
  FloorPlan dentro del aside dibujando N4 (croquis con zonas + cotas). ✓
- Mobile (~507px): plano colapsado; "Ver plano actual" → expande el plano (svg N4), botón pasa a
  "Ocultar plano" (`aria-expanded=true`). ✓
- Sin errores de consola. `npm run build` pasa.

## Fase 3 — 5 success criteria cumplidos

1. Landing con título/subtítulo/datos Impacar + "Comenzar" (03-02). ✓
2. Navegación de 6 pasos con Anterior/Siguiente + barra de progreso (03-02). ✓
3. Persistencia en `localStorage` (`impacar_config_v1`): retoma al recargar + "Volver a empezar"
   resetea (03-01 + fix de ruteo en 03-02). ✓
4. Plano colapsable en mobile / sticky en desktop (03-03). ✓
5. Todo en español argentino (trato de usted) + `console.log` con timestamp por paso (03-01/03-02). ✓
