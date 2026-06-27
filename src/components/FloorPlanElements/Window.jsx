// Ventana: interrupción en la pared con doble línea paralela fina dentro del hueco
// (UI-SPEC "Ventanas" + "Color"). Recibe medidas YA en unidades de viewBox.
//   x, y    -> inicio del hueco sobre la pared larga
//   length  -> ancho del hueco
//   side    -> 'top' | 'bottom' (sobre qué pared larga va; solo afecta el grosor visual del marco)
// Trazo: #1A1A1A opacidad 0.6, ancho 0.75.
export default function Window({ x, y, length, side = 'top' }) {
  const sep = 1.4 // separación entre las dos líneas paralelas del cristal
  const off = side === 'top' ? sep : -sep
  return (
    <g stroke="#1A1A1A" strokeOpacity="0.6" strokeWidth="0.75" fill="none">
      <title>Ventana</title>
      {/* Hueco: "borra" el tramo de pared con el color de fondo */}
      <line x1={x} y1={y} x2={x + length} y2={y} stroke="#F5F5F0" strokeWidth="3.5" />
      {/* Doble línea paralela fina (el cristal) */}
      <line x1={x} y1={y - off / 2} x2={x + length} y2={y - off / 2} />
      <line x1={x} y1={y + off / 2} x2={x + length} y2={y + off / 2} />
      {/* Jambas en los extremos del hueco */}
      <line x1={x} y1={y - off} x2={x} y2={y + off} />
      <line x1={x + length} y1={y - off} x2={x + length} y2={y + off} />
    </g>
  )
}
