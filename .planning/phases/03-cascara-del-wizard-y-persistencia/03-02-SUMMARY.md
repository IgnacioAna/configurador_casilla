# 03-02 SUMMARY — Landing + cáscara navegable del wizard

**Estado:** Completo (verificado en vivo por el orquestador vía preview).
**Requirements:** SHELL-01, SHELL-02, UX-03, UX-04.

## Qué se construyó

- `src/components/Landing.jsx` — Landing Impacar con copy en **trato de usted** ("Diseñe su
  casilla rural a medida", "Configure... reciba...") + datos de General Pico + CTA "Comenzar"
  (`onComenzar`). Sin voseo (gate `grep` = 0).
- `src/components/wizard/pasosRegistro.jsx` — `export const PASOS`: 6 entradas `{ id, titulo,
  Componente }` con un `StubPaso` reutilizable ("próximamente"). **Contrato para Fases 4-5**:
  reemplazan `PASOS[i].Componente` con la UI real del paso, sin tocar la cáscara.
- `src/components/wizard/BarraProgreso.jsx` — barra accesible (`role="progressbar"`,
  `aria-valuenow`), texto "Paso N de 6" + porcentaje.
- `src/components/ConfiguratorWizard.jsx` — consume `usePersistedConfig()`; renderiza header +
  BarraProgreso + `PASOS[estado.pasoActual].Componente` + botones Anterior/Siguiente (Anterior
  disabled en paso 0, Siguiente disabled en paso 5) + "Volver a empezar" (`reiniciar()`). Llama
  `logPasoCompletado()` ANTES de `ACCIONES.SIGUIENTE` (UX-04). Hueco del plano marcado con
  `{/* PLANO: integrado en Plan 03 (PLANO-03) */}`.
- `src/App.jsx` — ruteo de estado `vista` ('landing' | 'wizard'), SPA de una página (sin cambiar
  URL). **Fix sobre el plan**: `vistaInicial()` arranca en 'wizard' si existe la key
  `impacar_config_v1`, para que al recargar el usuario retome en el wizard (SHELL-03), no en la
  landing. Importa `STORAGE_KEY` del hook.

## API / contratos para las próximas fases

- **Ruteo:** `App.jsx` con `useState('landing'|'wizard')`. Landing → `onComenzar` pasa a 'wizard'.
- **Registro de pasos:** `PASOS[]` en `wizard/pasosRegistro.jsx`. Cada `Componente` recibe
  `{ estado, dispatch }` (los stubs los ignoran). Fases 4-5 enchufan su UI acá.
- **Wizard:** `ConfiguratorWizard({ onVolverInicio })`. El hueco del plano (PLANO-03) lo integra
  el Plan 03 donde está el comentario `{/* PLANO ... */}`.

## Verificación en vivo (preview)

- Landing renderiza con copy en usted + CTA verde. ✓
- "Comenzar" → wizard "Paso 1 de 6" (Anterior disabled). ✓
- Siguiente ×2 → "Paso 3 de 6" (Baño), Anterior habilitado; `localStorage.impacar_config_v1`
  con `pasoActual: 2`. ✓
- Consola: `[analytics] paso completado` con objeto + timestamp al avanzar (UX-04). ✓
- Recargar → retoma en "Paso 3 de 6" (tras el fix). ✓
- "Volver a empezar" → "Paso 1 de 6", key reseteada a `pasoActual: 0`. ✓
- `npm run build` pasa.

## Pendiente

- El plano dentro del wizard (PLANO-03) lo construye el Plan 03-03.
