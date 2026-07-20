---
phase: quick-260720-ifp
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/utils/resumenCampos.js
  - src/utils/resumenCampos.test.js
  - src/components/resumen/ConfigSecciones.jsx
autonomous: true
requirements: [RESUMEN-01]

must_haves:
  truths:
    - "Con dormitorio sin camas, el resumen muestra 'Sin camas seleccionadas' (no 'Sin selección')"
    - "Con cocina sin accesorios, el resumen muestra 'Sin accesorios de cocina' (no 'Sin selección')"
    - "Los demás campos (uso, ocupantes, largo, baño, extras) siguen mostrando 'Sin selección' cuando faltan"
    - "La sección Dormitorio del resumen muestra un aviso cobre no bloqueante cuando no hay camas"
    - "El aviso NO aparece cuando hay ≥1 cama; exportar (WhatsApp/PDF) sigue habilitado siempre"
  artifacts:
    - path: "src/utils/resumenCampos.js"
      provides: "Fallbacks específicos para camas y cocina"
      contains: "Sin camas seleccionadas"
    - path: "src/components/resumen/ConfigSecciones.jsx"
      provides: "Aviso cobre no bloqueante en sección Dormitorio"
      contains: "Editar"
  key_links:
    - from: "src/components/resumen/ConfigSecciones.jsx"
      to: "estado.dormitorio.camas"
      via: "Array.isArray + length para decidir el aviso"
      pattern: "dormitorio"
---

<objective>
Dos arreglos chicos de copy/UX en el resumen del configurador antes de la demo:

1. Fallbacks específicos en `resumenCampos.js`: camas sin elegir → 'Sin camas seleccionadas',
   cocina sin accesorios → 'Sin accesorios de cocina'. El resto mantiene 'Sin selección'.
2. Aviso cobre no bloqueante en la sección Dormitorio del resumen cuando no hay camas.

Purpose: 'Sin selección' se lee como error del sistema en un presupuesto para zonas que la
casilla SIEMPRE tiene (dormitorio y cocina son zonas fijas del plano). Lo que falta son las
camas/accesorios, no el ambiente.
Output: 2 commits atómicos (uno por arreglo).
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@./CLAUDE.md
@.planning/STATE.md

@src/utils/resumenCampos.js
@src/utils/resumenCampos.test.js
@src/components/resumen/ConfigSecciones.jsx

<interfaces>
resumenCampos(estado) devuelve { uso, ocupantes, modelo, largo, bano, camas, cocina, extras }.
- Constante actual: `const SIN_SELECCION = 'Sin selección'` (línea 40).
- camas: `const camasTexto = partesCamas.length > 0 ? partesCamas.join(', ') : SIN_SELECCION` (línea 70).
- cocina: `const cocina = partesCocina.length > 0 ? partesCocina.join(', ') : SIN_SELECCION` (línea 81).

Consumidores de camas/cocina (NO comparan contra el literal 'Sin selección', solo interpolan):
- src/utils/exportWhatsApp.js:28-29 → `Dormitorio: ${c.camas}` / `Cocina: ${c.cocina}` (seguro).
- src/utils/exportPDF.js:108-109 → ídem (seguro).
- Ambos comparan `c.largo !== 'Sin selección'` SOLO para largo (campo que NO cambia).

ConfigSecciones({ estado, onEditar }): renderiza un array `secciones` (map). La sección
Dormitorio es `{ titulo: 'Dormitorio', paso: 3, valor: c.camas }` (línea 20).

Patrón de advertencia cobre (de PasoDormitorio.jsx:176):
`className="mt-6 rounded border border-impacar-cobre p-3 text-sm text-impacar-cobre"`
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Fallbacks específicos para camas y cocina en resumenCampos</name>
  <files>src/utils/resumenCampos.js, src/utils/resumenCampos.test.js</files>
  <behavior>
    - camas vacío/no-array → 'Sin camas seleccionadas' (antes 'Sin selección')
    - cocina sin accesorios / extras no-array → 'Sin accesorios de cocina' (antes 'Sin selección')
    - uso, ocupantes, largo, baño faltantes → siguen en 'Sin selección'
    - extras vacío → sigue [] (el consumidor decide el texto)
  </behavior>
  <action>
En src/utils/resumenCampos.js:
1. Agregar dos constantes junto a `SIN_SELECCION` (línea 40):
   `const SIN_CAMAS = 'Sin camas seleccionadas'` y `const SIN_ACCESORIOS_COCINA = 'Sin accesorios de cocina'`.
2. Línea 70 (camasTexto): cambiar el fallback de `SIN_SELECCION` a `SIN_CAMAS`.
3. Línea 81 (cocina): cambiar el fallback de `SIN_SELECCION` a `SIN_ACCESORIOS_COCINA`.
4. Actualizar el comentario del shape de salida (líneas 13-14) para reflejar los nuevos fallbacks.
NO tocar uso, ocupantes, largo, bano ni extras — mantienen SIN_SELECCION / [].

En src/utils/resumenCampos.test.js, actualizar SOLO las aserciones de camas/cocina:
- Línea 66-67 (test 'estado vacio'): `assert.equal(c.camas, 'Sin camas seleccionadas')` y
  `assert.equal(c.cocina, 'Sin accesorios de cocina')`. Dejar bano/uso/largo/ocupantes en 'Sin selección'.
- Línea 88 (test 'resumenCampos(null)'): `assert.equal(c.camas, 'Sin camas seleccionadas')`.
- Línea 95 (test 'extras no-array'): `assert.equal(c.cocina, 'Sin accesorios de cocina')`.
- Línea 100 (test 'camas no-array'): `assert.equal(c.camas, 'Sin camas seleccionadas')`.
El loop anti-undefined del test 'estado vacio' (líneas 70-76) sigue válido sin cambios
(los nuevos strings no son '', 'null' ni 'undefined').

exportWhatsApp.test.js / exportPDF.test.js NO requieren cambios (usan config con camas y no
asertan el texto de fallback en camas/cocina — verificado).
  </action>
  <verify>
    <automated>npm test</automated>
  </verify>
  <done>npm test pasa; resumenCampos con estado vacío devuelve 'Sin camas seleccionadas' y 'Sin accesorios de cocina'; los demás campos siguen en 'Sin selección'.</done>
</task>

<task type="auto">
  <name>Task 2: Aviso cobre no bloqueante en sección Dormitorio del resumen</name>
  <files>src/components/resumen/ConfigSecciones.jsx</files>
  <action>
En src/components/resumen/ConfigSecciones.jsx:
1. Calcular si hay camas, tolerando estado adulterado (mismo patrón que resumenCampos):
   `const sinCamas = !(Array.isArray(estado?.dormitorio?.camas) && estado.dormitorio.camas.length > 0)`.
2. Añadir un campo opcional `aviso` al objeto de la sección Dormitorio del array `secciones`:
   en `{ titulo: 'Dormitorio', paso: 3, valor: c.camas }` agregar
   `aviso: sinCamas ? 'Esta configuración no incluye camas. Puede agregarlas desde "Editar".' : null`.
   (trato de usted — constraint del proyecto).
3. En el render del map, después del `<p className="break-words text-sm">{s.valor}</p>` (línea 42),
   renderizar condicionalmente el aviso cuando `s.aviso` existe, con el patrón cobre de
   PasoDormitorio.jsx:176 pero SIN el `mt-6` de sección (usar `mt-2` para separarlo del valor):
   `{s.aviso && (<div className="mt-2 rounded border border-impacar-cobre p-3 text-sm text-impacar-cobre">{s.aviso}</div>)}`.
NO tocar el botón Editar, la navegación, ni la lógica de exportar (el aviso es puramente
informativo; no deshabilita nada). El aviso solo aparece cuando `s.aviso` es truthy.
  </action>
  <verify>
    <automated>npm test && npx vite build</automated>
  </verify>
  <done>El build pasa; ConfigSecciones muestra el aviso cobre en Dormitorio solo cuando no hay camas (Array.isArray + length===0 o no-array); con ≥1 cama el aviso no se renderiza; los botones Editar y el flujo de exportar quedan intactos.</done>
</task>

</tasks>

<verification>
- `npm test` pasa (tests de resumenCampos actualizados + export tests sin cambios).
- Grep de sanidad: `grep -rn "Sin camas seleccionadas\|Sin accesorios de cocina" src/utils/resumenCampos.js` → 2 usos.
- Los consumidores (exportWhatsApp.js, exportPDF.js) solo comparan el literal 'Sin selección' para `largo` — sin cambios de comportamiento.
- El aviso de Dormitorio no bloquea exportar (WhatsApp/PDF siguen habilitados).
</verification>

<success_criteria>
- Dormitorio sin camas → 'Sin camas seleccionadas' en pantalla, WhatsApp y PDF.
- Cocina sin accesorios → 'Sin accesorios de cocina' en pantalla, WhatsApp y PDF.
- uso/ocupantes/largo/baño faltantes → siguen 'Sin selección'.
- Aviso cobre no bloqueante visible en Dormitorio solo cuando no hay camas.
- 2 commits atómicos (uno por arreglo).
</success_criteria>

<output>
After completion, create `.planning/quick/260720-ifp-copy-especifico-sin-seleccion-aviso-sin-/260720-ifp-SUMMARY.md`
</output>
