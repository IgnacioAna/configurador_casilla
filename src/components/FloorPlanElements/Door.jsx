// Puerta de entrada sobre una pared larga (UI-SPEC "Puerta de entrada" + "Color").
// Recibe coordenadas/medidas YA calculadas en unidades de viewBox.
//   x, y    -> punto de bisagra de la hoja (sobre la pared)
//   length  -> ancho del vano (= radio del barrido), en unidades de viewBox
//   side    -> 'top' | 'bottom': de qué pared larga cuelga la puerta (define hacia dónde abre)
// Dibuja: interrupción del vano (línea clara que "borra" la pared) + hoja + arco de barrido.
// Trazo: #1A1A1A opacidad 0.7, ancho 1.25 (arco fino que indica el barrido de apertura).
export default function Door({ x, y, length, side = 'bottom' }) {
  const r = length
  // El barrido se dibuja hacia el interior de la casilla.
  const dir = side === 'top' ? 1 : -1 // top abre hacia abajo (+y), bottom hacia arriba (-y)
  const hojaY = y + dir * r // extremo libre de la hoja, perpendicular a la pared

  // Arco de cuarto de círculo desde el final del vano hasta el extremo de la hoja.
  const arco = `M ${x + r} ${y} A ${r} ${r} 0 0 ${side === 'top' ? 1 : 0} ${x} ${hojaY}`

  return (
    <g stroke="#1A1A1A" strokeOpacity="0.7" strokeWidth="1.25" fill="none">
      <title>Puerta de entrada</title>
      {/* Vano: "borra" el tramo de pared con el color de fondo */}
      <line x1={x} y1={y} x2={x + r} y2={y} stroke="#F5F5F0" strokeWidth="3.5" />
      {/* Hoja de la puerta (línea perpendicular a la pared) */}
      <line x1={x} y1={y} x2={x} y2={hojaY} />
      {/* Arco de barrido de apertura */}
      <path d={arco} />
    </g>
  )
}
