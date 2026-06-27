---
phase: 04-pasos-1-3-uso-dimensiones-bano
reviewed: 2026-06-27T00:00:00Z
depth: deep
files_reviewed: 7
files_reviewed_list:
  - src/utils/banoReglas.js
  - src/utils/floorplanLayout.js
  - src/components/wizard/pasos/PasoUso.jsx
  - src/components/wizard/pasos/PasoDimensiones.jsx
  - src/components/wizard/pasos/PasoBano.jsx
  - src/components/wizard/pasosRegistro.jsx
  - package.json
findings:
  critical: 0
  warning: 0
  info: 1
  total: 3
status: resolved
blocker_resolved: "CR-01 corregido en commit ab59f3f (endurecimiento de esEstadoValido). WR-01 corregido en commit de6f6ca (invariante largoEstar>0 codificado). IN-01 (info, cosmético) queda como advisory no bloqueante."
---

# Fase 04: Informe de Revisión de Código

**Revisado:** 2026-06-27
**Profundidad:** deep (análisis cruzado de módulos)
**Archivos revisados:** 7 fuentes + 3 archivos de test (lectura de apoyo)
**Estado:** issues_found

---

## Resumen

Se revisaron los tres pasos nuevos del wizard (PasoUso, PasoDimensiones, PasoBano), el helper
puro `banoReglas.js`, la parametrización de `floorplanLayout.js` y el cableado en
`pasosRegistro.jsx`. La lógica de negocio central es correcta: el umbral de baño ampliado se
deriva de datos, la suma de zonas cierra exacta (el estar absorbe el residuo), la corrección
silenciosa en `elegirModelo` funciona, y los tests codifican el contrato real.

Se detectó **un defecto de bloqueador** en la cadena de acceso a `estado.bano` y `estado.extras`
dentro de `PasoDimensiones` y `PasoBano`: cuando el localStorage contiene un estado parcial
(escenario documentado en el modelo de amenaza T-04-01), los componentes colapsan con
`TypeError: Cannot read properties of undefined` antes de que el usuario pueda interactuar.
La raíz es que `esEstadoValido` en `usePersistedConfig.js` — archivo de la Fase 3, no cambiado
en esta fase — sólo valida `pasoActual` y `modeloId`, dejando pasar estados sin `bano` ni
`extras`. Los componentes nuevos de esta fase asumen esos campos sin fallback.

---

## Defectos críticos (BLOCKER)

### CR-01: Crash por `estado.bano` y `estado.extras` sin fallback ante estado parcial del localStorage

> **✅ RESUELTO (commit `ab59f3f`).** Se aplicó la "Alternativa robusta — arreglar en la fuente":
> `esEstadoValido` ahora exige además `bano` (objeto no-null) y `extras` (array), por lo que un
> estado parcial se descarta y cae a `estadoInicial`. Test de regresión en
> `src/hooks/usePersistedConfig.test.js` (6 casos). Verificado en navegador: el estado parcial
> `{ pasoActual: 2, modeloId: 'N4' }` que antes daba pantalla blanca ahora retoma el Paso 1 sin crash.

**Archivos:**
- `src/components/wizard/pasos/PasoDimensiones.jsx:22`
- `src/components/wizard/pasos/PasoBano.jsx:27, 44, 59, 73, 87, 95`

**Descripción del problema:**

El validador de estado restaurado (`esEstadoValido` en `usePersistedConfig.js`) sólo exige la
presencia de `pasoActual` (number) y `modeloId` (string). Un objeto como
`{ pasoActual: 0, modeloId: 'N4' }` — producible por manipulación directa del localStorage o
por una futura migración de esquema — pasa la validación y se entrega al reducer/componentes
con `bano` y `extras` como `undefined`.

Esto provoca `TypeError` no manejado en tres lugares independientes:

**PasoDimensiones.jsx, línea 22** — dentro de `elegirModelo`, se accede a `estado.bano.tamano`
sin optional chaining:
```js
// ACTUAL (crash si bano es undefined o null)
if (!permiteBanoAmpliado(id) && estado.bano.tamano === 'ampliado') {

// CORRECCIÓN
if (!permiteBanoAmpliado(id) && estado.bano?.tamano === 'ampliado') {
```

**PasoBano.jsx, línea 44** — en el render del equipamiento, `estado.extras.includes(e.id)`:
```js
// ACTUAL (crash si extras es undefined)
const marcado = estado.extras.includes(e.id)

// CORRECCIÓN
const marcado = Array.isArray(estado.extras) && estado.extras.includes(e.id)
```

**PasoBano.jsx, líneas 73 / 87 / 95** — comparaciones `estado.bano.tamano === 'estandar'` y
`estado.bano.tamano === 'ampliado'` en el JSX:
```jsx
// ACTUAL (crash si bano es undefined)
aria-pressed={estado.bano.tamano === 'estandar'}
...
aria-pressed={estado.bano.tamano === 'ampliado'}
estado.bano.tamano === 'ampliado'

// CORRECCIÓN
aria-pressed={estado.bano?.tamano === 'estandar'}
...
aria-pressed={estado.bano?.tamano === 'ampliado'}
estado.bano?.tamano === 'ampliado'
```

**PasoBano.jsx, línea 31** — `setTamano` clona `estado.bano` con spread; si `bano` es
`undefined` el spread falla silenciosamente (produce `{ tamano }` sin los campos anteriores)
pero no crashea. Este caso es menos urgente aunque semánticamente incorrecto.

**Alternativa robusta — arreglar en la fuente (`esEstadoValido`):**

Ampliar la validación en `usePersistedConfig.js` para exigir los campos compuestos:
```js
function esEstadoValido(valor) {
  return (
    valor !== null &&
    typeof valor === 'object' &&
    typeof valor.pasoActual === 'number' &&
    typeof valor.modeloId === 'string' &&
    // Campos compuestos requeridos por los componentes de las fases 4-5:
    valor.bano !== null && typeof valor.bano === 'object' &&
    Array.isArray(valor.extras)
  )
}
```

Con este cambio un estado parcial es rechazado por el validador y se cae a `estadoInicial`
(que sí incluye `bano` y `extras`), protegiendo todos los componentes de una sola vez sin
necesitar optional chaining defensivo en cada componente.

**Impacto en usuarios reales:**
- Un usuario con localStorage de la Fase 3 que navega hasta el Paso 2 y hace clic en cualquier
  modelo (llamando a `elegirModelo`) obtiene pantalla blanca (React ErrorBoundary no está
  instalado globalmente).
- Un usuario que navega directamente al Paso 3 (Baño) ve un crash inmediato en el render.
- Reproducible manualmente: `localStorage.setItem('impacar_config_v1', JSON.stringify({ pasoActual: 0, modeloId: 'N4' }))` y recargar.

---

## Advertencias (WARNING)

### WR-01: `MINIMO_CENTRAL` no valida que el estar sea positivo con baño ampliado activado

> **✅ RESUELTO (commit `de6f6ca`).** Se codificó el invariante en producción: tras calcular
> `const largoEstar = restante - largoBano - largoDormitorio`, se agregó el guard
> `if (largoEstar <= 0) return { valido: false }` (mismo estilo que los guards existentes).
> 2 tests de regresión en `floorplanLayout.test.js` prueban que toda config válida deja el estar
> > 0, sin debilitar BANO-03. Suite 41/41 verde. Detalle en `04-REVIEW-FIX.md`.

**Archivo:** `src/utils/floorplanLayout.js:28, 62-65`

**Descripción:**

La constante `MINIMO_CENTRAL = 0.4` se usa para rechazar configs inválidas antes de calcular
zonas (`config.largo < minimoTotal`). Con los ratios actuales (`RATIO_BANO_AMPLIADO = 0.3`,
`RATIO_DORMITORIO = 0.45`) la suma es 0.75, por lo que el estar siempre es positivo mientras
`restante > 0`. Sin embargo, si en el futuro se aumenta alguno de los ratios y la suma supera
1, `largoEstar` se volverá negativo **sin que el guard lo detecte** (el guard verifica el
largo bruto, no el resultado de los ratios).

El riesgo inmediato es bajo porque los valores actuales son seguros (verificado por el test
`BANO-03: N3 ampliado deja las 3 zonas centrales con largoM positivo`). Aun así, el invariante
no está codificado en producción:

```js
// CORRECCIÓN: agregar una aserción de invariante post-cálculo antes de devolver zonas
const largoEstar = restante - largoBano - largoDormitorio
if (largoEstar <= 0) {
  // Invariante roto por configuración de ratios; devolver inválido en lugar de zonas negativas.
  return { valido: false }
}
```

---

## Información (INFO)

### IN-01: Coerción de tipo en comparación `estado.ocupantes === n` puede deseleccionar chips visualmente

**Archivo:** `src/components/wizard/pasos/PasoUso.jsx:141`

**Descripción:**

Los chips de ocupantes comparan con `===` (correcto para evitar coerciones inesperadas), pero
`estado.ocupantes` se persiste como número mediante `JSON.stringify/parse`. Si alguien tampered
el localStorage con la clave como string (`"ocupantes": "4"` — aunque JSON estándar no produciría
esto, es técnicamente posible vía edición directa), el chip quedaría sin resaltar visualmente
aunque el modelo sugerido se calcule correctamente (JS coerciona la clave del objeto). No es
un crash ni un error de negocio: `SUGERENCIA_OCUPANTES["4"]` devuelve el mismo valor que
`SUGERENCIA_OCUPANTES[4]`. El impacto es puramente cosmético.

No requiere acción inmediata dado el MVP sin backend, pero documentar el invariante ayuda:
```js
// En elegirOcupantes: ya despacha un número (n proviene de OCUPANTES[] que son Number).
// En cargarEstado: si se quiere ser defensivo, normalizar:
// if (typeof parseado.ocupantes === 'string') parseado.ocupantes = Number(parseado.ocupantes)
```

---

## Lo que está bien

- **`banoReglas.js`**: correcto y testeable. Umbral derivado de datos, no de lista hardcodeada.
  Tolerancia a `modeloId` inválido con optional chaining + nullish coalescing. Sin efectos secundarios.

- **`floorplanLayout.js` (modificación)**: la eliminación de `RATIO_ESTAR` fijo y el uso del
  residuo (`largoEstar = restante - largoBano - largoDormitorio`) garantiza suma exacta sin
  errores de punto flotante acumulados. El optional chaining `config?.bano?.tamano` en línea 71
  es correcto.

- **`PasoUso.jsx`**: accesos a `estado.uso`, `estado.ocupantes`, `SUGERENCIA_OCUPANTES` son
  todos seguros ante `null`/`undefined`/tipos extraños. No hay crashes identificables.

- **`pasosRegistro.jsx`**: el cableado es mínimo y correcto. Los stubs restantes (pasos 4-6)
  continúan recibiendo props sin romper.

- **Tests**: `banoReglas.test.js`, `floorplanLayout.test.js` y `models.test.js` son sólidos.
  Cubren los contratos clave, incluyendo el caso de id adulterado (`'ZZ'`), suma de zonas exacta,
  y verificación geométrica `anchoCama×2 + pasilloCentral = anchoInterior`.

- **Seguridad XSS**: React escapa todo el contenido dinámico. No hay uso de
  `dangerouslySetInnerHTML`. Los datos de `MODELOS` y `EXTRAS` son estáticos (sin entrada de usuario).

- **Inmutabilidad**: los spreads en `elegirModelo` y `setTamano` son correctos. El `toggleExtra`
  construye un array nuevo en cada toggle sin mutar `estado.extras`.

---

_Revisado: 2026-06-27_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidad: deep_
