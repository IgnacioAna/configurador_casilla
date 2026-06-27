// Módulo de baño: primitivas minimalistas de ducha + inodoro + lavatorio dentro del bloque
// de la zona baño (UI-SPEC "Color" -> contorno de módulos #1A1A1A opacidad 0.7, ancho 1).
// Recibe el rect del baño YA en unidades de viewBox: x, y, w, h (origen arriba-izquierda).
export default function Bathroom({ x, y, w, h }) {
  // Repartimos el ancho del baño en tres piezas (ducha | inodoro | lavatorio), con un margen.
  const m = Math.min(6, w * 0.12, h * 0.12) // margen interior acotado
  const ix = x + m
  const iy = y + m
  const iw = w - m * 2
  const ih = h - m * 2
  const pieza = iw / 3

  // Ducha: cuadrado con diagonales (rejilla). Inodoro: cuerpo + tapa. Lavatorio: óvalo en rect.
  const duchaX = ix
  const inodoroX = ix + pieza
  const lavX = ix + pieza * 2

  return (
    <g className="fp-anim" stroke="#1A1A1A" strokeOpacity="0.7" strokeWidth="1" fill="none">
      <title>Baño: ducha, inodoro, lavatorio</title>
      {/* Ducha */}
      <rect x={duchaX} y={iy} width={pieza * 0.9} height={ih} />
      <line x1={duchaX} y1={iy} x2={duchaX + pieza * 0.9} y2={iy + ih} />
      <line x1={duchaX + pieza * 0.9} y1={iy} x2={duchaX} y2={iy + ih} />
      {/* Inodoro (cuerpo + tapa elíptica) */}
      <rect x={inodoroX + pieza * 0.25} y={iy + ih * 0.45} width={pieza * 0.5} height={ih * 0.5} />
      <ellipse cx={inodoroX + pieza * 0.5} cy={iy + ih * 0.28} rx={pieza * 0.28} ry={ih * 0.22} />
      {/* Lavatorio (rect + cuenco ovalado) */}
      <rect x={lavX + pieza * 0.1} y={iy + ih * 0.3} width={pieza * 0.8} height={ih * 0.5} />
      <ellipse cx={lavX + pieza * 0.5} cy={iy + ih * 0.55} rx={pieza * 0.3} ry={ih * 0.18} />
    </g>
  )
}
