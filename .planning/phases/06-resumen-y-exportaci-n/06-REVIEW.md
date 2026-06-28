---
phase: 06-resumen-y-exportacion
reviewed: 2026-06-28T00:00:00Z
depth: standard
files_reviewed: 16
files_reviewed_list:
  - src/App.jsx
  - src/components/ConfiguratorWizard.jsx
  - src/components/Resumen.jsx
  - src/components/resumen/AccionesExport.jsx
  - src/components/resumen/BloqueFinanciacion.jsx
  - src/components/resumen/ConfigSecciones.jsx
  - src/components/resumen/PresupuestoDesglosado.jsx
  - src/data/contacto.js
  - src/utils/exportPDF.js
  - src/utils/exportPDF.test.js
  - src/utils/exportWhatsApp.js
  - src/utils/exportWhatsApp.test.js
  - src/utils/motorPrecios.js
  - src/utils/motorPrecios.test.js
  - src/utils/resumenCampos.js
  - src/utils/resumenCampos.test.js
findings:
  critical: 1
  warning: 5
  info: 4
  total: 10
status: issues_found
---

# Fase 06: Informe de Revisión de Código

**Revisado:** 2026-06-28
**Profundidad:** standard
**Archivos revisados:** 16
**Estado:** issues_found

## Resumen

Se revisaron todos los archivos de la fase 06 (resumen + exportación): utilidades puras (`motorPrecios`, `resumenCampos`, `exportWhatsApp`, `exportPDF`), componentes del resumen (`Resumen`, `AccionesExport`, `ConfigSecciones`, `PresupuestoDesglosado`, `BloqueFinanciacion`), datos (`contacto.js`) y la integración en `App.jsx` / `ConfiguratorWizard.jsx`.

El diseño general es sólido: hay una única fuente de verdad para el total, la degradación frente a estado adulterado de localStorage está bien cubierta en las utilidades puras, y el encoding del enlace wa.me es correcto. Sin embargo se detectaron seis defectos de calidad con impacto real en producción, un defecto de seguridad menor en el número de teléfono hardcodeado para producción, y cuatro puntos de calidad menores.

---

## Critical Issues

### CR-01: El número de WhatsApp de producción está hardcodeado en un comentario sin mecanismo de swap — riesgo de go-live con el número equivocado

**Archivo:** `src/data/contacto.js:5`

**Issue:** El campo `whatsapp` apunta al número personal de pruebas (`5492954555113`). El número real de Impacar (`5492302468754`) solo está mencionado en un comentario en la misma línea. No existe ningún mecanismo (variable de entorno Vite, flag de build, test de CI) que garantice que el swap ocurra antes del go-live. Un cliente que descargue el sitio publicado enviará el mensaje al número personal del desarrollador, no a la empresa.

**Fix:** Usar una variable de entorno Vite que tenga valores distintos según el entorno, y añadir un test de humo que falle si el número de producción no coincide con el esperado:

```js
// src/data/contacto.js
export const CONTACTO = {
  // En .env: VITE_WA_NUMBER=5492302468754
  // En .env.development: VITE_WA_NUMBER=5492954555113
  whatsapp: import.meta.env.VITE_WA_NUMBER,
  whatsappDisplay: import.meta.env.VITE_WA_DISPLAY ?? '+54 9 2302 46-8754',
  // ...
}
```

Si Vite no es una opción (build estático puro), al menos mover el número de producción a una constante separada con nombre explícito (`WA_NUMBER_PRODUCCION`) y eliminar el comentario en línea para evitar confusiones.

---

## Warnings

### WR-01: `resumenCampos` omite `banco-despensero` de la sección "Cocina" — el ítem elegido por el usuario no aparece en el resumen ni en el PDF

**Archivo:** `src/utils/resumenCampos.js:74-80`

**Issue:** El accesorio `banco-despensero` (categoría `'cocina'` en `extras.js`) puede ser seleccionado desde `PasoCocina.jsx` como un toggle dentro de `TOGGLES`. Sin embargo `resumenCampos` solo compone `partesCocina` con `cocina-horno`, `heladera-*` y `mesa-cano`; `banco-despensero` nunca se incluye. Resultado: el usuario selecciona "Banco despensero", ve el ítem en el Paso 5, pero en el resumen y en el PDF la sección "Cocina y estar" no lo menciona.

El presupuesto sí lo contabiliza correctamente (vía `calcularPresupuesto`), así que el desglose económico en `PresupuestoDesglosado` es correcto; solo falla la descripción textual.

**Fix:**

```js
// src/utils/resumenCampos.js  (después de línea 79)
if (extras.includes('banco-despensero')) partesCocina.push(nombreExtra('banco-despensero'))
```

Y añadir el caso al test correspondiente:

```js
test('resumenCampos: banco-despensero se refleja en cocina cuando está seleccionado', () => {
  const c = resumenCampos({ modeloId: 'N4', extras: ['banco-despensero'] })
  assert.match(c.cocina, /banco/i)
})
```

---

### WR-02: `nombreExtra(id)` puede devolver `undefined` si el `id` no existe en `EXTRAS`, y se inserta en el array sin protección

**Archivo:** `src/utils/resumenCampos.js:74`

**Issue:** La función auxiliar `nombreExtra` usa optional chaining (`?.nombre`) y devuelve `undefined` cuando el id no se encuentra en `EXTRAS`. Las cuatro llamadas en `partesCocina.push(...)` son condicionales sobre `extras.includes(id)`, lo que protege contra ids inexistentes en general, pero si en un futuro el id de un extra cambia en `extras.js` sin actualizar este archivo (o si localStorage trae un id de una versión anterior), `nombreExtra` devolverá `undefined` y `partesCocina` contendrá el literal `"undefined"` al hacer `.join(', ')`.

El texto resultante sería, por ejemplo, `"Cocina y estar: undefined, Heladera con freezer 220V cat A++"` — visible directamente en el mensaje de WhatsApp y en el PDF.

**Fix:** Añadir un fallback en `nombreExtra` o filtrar el resultado antes de hacer push:

```js
const nombreExtra = (id) => EXTRAS.find((e) => e.id === id)?.nombre ?? id
// O bien, al hacer push:
const n = nombreExtra('cocina-horno')
if (n) partesCocina.push(n)
```

---

### WR-03: El generador de PDF no tiene protección contra desbordamiento de página — con muchos extras, el texto puede escribirse fuera de los 285 mm del pie

**Archivo:** `src/utils/exportPDF.js:83-97`

**Issue:** El cursor `cursorY` parte desde 32 mm y crece dinámicamente con el plano SVG, el presupuesto y la configuración. El pie de página está anclado en `pieY = 285 mm` y el contenido de texto escala sin cota superior. Con el plano en relación 1:0.3 (fallback) y los 6 campos de configuración con textos de una línea, el cursor puede superar los 279 mm (`pieY - 6`) antes de llegar al pie — y `jsPDF` escribe fuera de la hoja sin error, produciendo un PDF con texto encimado o cortado.

El caso más probable: un modelo largo (N7, 9.6 m) con el plano a escala real produce `planoAlto ≈ 180 mm * (9.6/2.6) ≈ 66 mm`, dejando el cursor en ~106 mm antes de los textos, lo que entra bien en este caso. Pero si el SVG tiene una relación `height/width` mayor (el diseño actual del plano es alargado en el eje horizontal, no vertical, así que el riesgo es bajo hoy). El verdadero problema: si los extras son muchos (17 extras con nombres largos que `splitTextToSize` divide en varias líneas), el cursor puede alcanzar o superar 279 mm y solaparse con la línea del pie.

**Fix:** Antes de escribir cada línea de texto, verificar si `cursorY` supera un umbral y agregar página si es necesario:

```js
function avanzarSiNecesario(doc, cursorY, margen = 280) {
  if (cursorY >= margen) {
    doc.addPage()
    return 15 // reinicia en el margen superior
  }
  return cursorY
}
// Llamar antes de cada doc.text() en el bloque de configuración.
```

Si se prefiere no paginar, al menos truncar la lista de extras con `'… y N más'` cuando el cursor se acerca al límite.

---

### WR-04: El error de `generarPDF` se silencia completamente — el usuario no recibe feedback si la descarga falla

**Archivo:** `src/components/resumen/AccionesExport.jsx:57-64`

**Issue:** El bloque `try/finally` en `onDescargar` captura cualquier error que lance `generarPDF` (fallo de import dinámico, rechazo de `doc.svg`, quota exceeded, etc.) pero no muestra ningún mensaje al usuario: el botón simplemente vuelve a estar habilitado en silencio. El usuario no sabe si el PDF se descargó, si falló, o si debe reintentar.

```js
const onDescargar = async () => {
  setGenerando(true)
  try {
    await generarPDF(getSvgNode?.(), estado)
  } finally {          // ← el catch está implícito: el error se traga
    setGenerando(false)
  }
}
```

**Fix:** Capturar el error explícitamente y mostrar retroalimentación mínima:

```jsx
const [errorPDF, setErrorPDF] = useState(null)

const onDescargar = async () => {
  setGenerando(true)
  setErrorPDF(null)
  try {
    await generarPDF(getSvgNode?.(), estado)
  } catch (err) {
    console.error('Error al generar PDF:', err)
    setErrorPDF('No se pudo generar el PDF. Intente nuevamente.')
  } finally {
    setGenerando(false)
  }
}
// En el JSX, debajo del botón:
{errorPDF && <p role="alert" className="mt-2 text-sm text-red-700">{errorPDF}</p>}
```

---

### WR-05: `PresupuestoDesglosado` no muestra los ítems con categoría `'cocina'` que no estén cubiertos por los GRUPOS definidos — `banco-despensero` queda huérfano

**Archivo:** `src/components/resumen/PresupuestoDesglosado.jsx:11-17`

**Issue:** Los `GRUPOS` en `PresupuestoDesglosado` cubren: `bano`, `dormitorio`, `cocina`, `extras+confort`, `extras+energia`. La categoría `'cocina'` de `EXTRAS` incluye `cocina-horno`, `heladera-220`, `heladera-12v`, `mesa-cano` **y** `banco-despensero`. El grupo `cocina` del desglose usa `i.categoria === 'cocina'` sin restricción de `subgrupo`, así que `banco-despensero` sí aparece en el desglose económico (ya que tiene `categoria: 'cocina'` y no tiene `subgrupo`).

Sin embargo, la condición de filtro en la línea 38 excluye el ítem base (`i.categoria !== 'modelo'`), lo que es correcto. El problema real: si en una futura iteración se añade un extra con una `categoria` nueva no contemplada en `GRUPOS` (por ejemplo `'transporte'`), ese ítem entraría en `calcularPresupuesto` pero nunca aparecería en el desglose visual — el total y el subtotal quedarían desincronizados visualmente. No hay ninguna salvaguarda (un `console.warn` de desarrollo o un ítem "Otros") para ítems sin grupo.

Este es un defecto latente de mantenibilidad que puede convertirse en un bug de presentación real ante cualquier ampliación del catálogo.

**Fix:** Añadir un grupo catch-all al final de `GRUPOS`:

```js
const GRUPOS = [
  // ...grupos existentes...
  { match: (i) => i.categoria !== 'modelo', titulo: 'Otros', _catchAll: true },
]
// Al renderizar, omitir el catch-all si ya fue cubierto por algún grupo anterior.
```

O bien, verificar en desarrollo que todos los ítems del desglose pertenezcan a algún grupo:

```js
// En dev, tras el render:
const itemsSinGrupo = items.filter(
  (i) => i.categoria !== 'modelo' && !GRUPOS.some((g) => g.match(i))
)
if (itemsSinGrupo.length > 0) console.warn('PresupuestoDesglosado: ítems sin grupo:', itemsSinGrupo)
```

---

## Info

### IN-01: El `Header` de `Resumen.jsx` se define como variable JSX en el cuerpo de la función en vez de un componente — dificulta la reutilización y puede confundir herramientas de lint

**Archivo:** `src/components/Resumen.jsx:47-52`

**Issue:** `const Header = (<header>...</header>)` es una variable JSX, no un componente React (no sigue PascalCase-de-función). Funciona en runtime, pero los lint rules de React (como `react/display-name`) y herramientas de DevTools no la reconocerán como componente, y si en el futuro necesita estado o efectos, requerirá una refactorización completa.

**Fix:** Extraerla como función de componente arriba del componente `Resumen`, igual que `EmptyState`:

```jsx
function HeaderImpacar() {
  return (
    <header className="bg-impacar-campo px-6 py-4 text-white">
      <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
      <p className="text-sm opacity-90">Configurador de casillas rurales</p>
    </header>
  )
}
```

---

### IN-02: El test de longitud del link WhatsApp usa `< 2000` pero el límite real de WhatsApp Web es ~4096 — el umbral es innecesariamente restrictivo y podría fallar con futuros extras

**Archivo:** `src/utils/exportWhatsApp.test.js:87-90`

**Issue:** El test `linkWhatsApp con TODOS los extras reales queda por debajo de ~2000 chars` tiene un umbral de 2000 caracteres. WhatsApp Web acepta URLs de hasta ~4096 caracteres. Con los 17 extras actuales el link mide bien menos de 2000, pero si el catálogo crece con nombres de producto más largos, el test puede fallar por el umbral equivocado antes de que el link deje de funcionar en producción.

**Fix:** Ajustar el umbral al límite real documentado, con comentario que explique el origen:

```js
// WhatsApp Web acepta URLs de ~4096 chars; dejamos margen a 3000.
assert.ok(linkWhatsApp(estado).length < 3000, `link.length = ${linkWhatsApp(estado).length}`)
```

---

### IN-03: `contacto.js` mezcla datos de entorno (número de pruebas activo) con datos de producción en un comentario — facilita errores de deploy

**Archivo:** `src/data/contacto.js:5`

**Issue:** El número de producción de Impacar (`5492302468754`) está enterrado en un comentario en línea junto al número de pruebas. Para un futuro colaborador o para un proceso de CI/CD automatizado, no hay señal clara de "esto debe cambiar antes del deploy". Un commit rápido de go-live podría olvidar este cambio.

**Fix:** Añadir un comentario de bloque visible con instrucción explícita, o — mejor — seguir la recomendación de CR-01 (variable de entorno Vite). Si no se usa variable de entorno, al menos separar los dos números con un comentario de sección prominente:

```js
// --- IMPORTANTE: cambiar whatsapp al número de Impacar antes del deploy a producción ---
// Desarrollo/pruebas:  5492954555113  (Ignacio)
// PRODUCCIÓN:          5492302468754  (Impacar — General Pico)
whatsapp: '5492954555113',
```

---

### IN-04: Los conjuntos `USOS` y `TIPOS` están duplicados en `resumenCampos.js` sin ninguna prueba de sincronización respecto a los pasos origen

**Archivo:** `src/utils/resumenCampos.js:25-38`

**Issue:** Los comentarios reconocen la duplicación ("mantener sincronizado"), pero no hay ningún mecanismo que detecte divergencia. Si `PasoUso.jsx` añade un nuevo id de uso (p.ej. `'pesca'`) y `resumenCampos.js` no se actualiza, la sección "Uso y ocupantes" del resumen mostrará `'Sin selección'` aunque el usuario haya elegido correctamente — un bug silencioso difícil de rastrear.

**Fix a corto plazo:** Exportar `USOS` y `TIPOS` desde los pasos y consumirlos en `resumenCampos`:

```js
// src/components/wizard/pasos/PasoUso.jsx
export const USOS = [...]

// src/utils/resumenCampos.js
import { USOS } from '../components/wizard/pasos/PasoUso.jsx'
```

Si la dependencia circular es un problema (no lo debería ser en Vite/ESM porque PasoUso no importa resumenCampos), la alternativa es mover `USOS` y `TIPOS` a un archivo de datos propio (`src/data/usos.js`, `src/data/dormitorio.js`) y que tanto el paso como `resumenCampos` lo consuman desde ahí.

---

_Revisado: 2026-06-28_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: standard_
