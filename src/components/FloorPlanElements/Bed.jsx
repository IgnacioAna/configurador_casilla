// Cama / cucheta dentro del dormitorio (UI-SPEC "Color" + "Typography").
// Recibe el rect de la cama YA en unidades de viewBox: x, y, w, h, tipo ('C'|'S'|'M').
//   - rect fill #B5915A (marrón saturado), contorno #1A1A1A opacidad 0.7 ancho 1
//   - <text> centrado con la letra del tipo, 14u semibold
//   - <title> que expande el tipo para lectores de pantalla
const TITULO = {
  C: 'Cucheta marinera',
  S: 'Cama simple',
  M: 'Cama matrimonial',
}

export default function Bed({ x, y, w, h, tipo }) {
  const cx = x + w / 2
  const cy = y + h / 2
  const letra = tipo ?? ''
  return (
    // fp-anim en el <g> para el fade (opacity) al aparecer/desaparecer una cama; el <rect>
    // y el <text> internos llevan la clase para transicionar su x/y/width/height al reacomodarse.
    <g className="fp-anim">
      <title>{TITULO[tipo] ?? 'Cama'}</title>
      <rect
        className="fp-anim"
        x={x}
        y={y}
        width={w}
        height={h}
        rx="3"
        fill="#B5915A"
        stroke="#1A1A1A"
        strokeOpacity="0.7"
        strokeWidth="1"
      />
      {/* Almohada: línea fina sobre el lado corto (cabecera) para legibilidad de croquis */}
      <line
        className="fp-anim"
        x1={x + w * 0.12}
        y1={y + h * 0.15}
        x2={x + w * 0.12}
        y2={y + h * 0.85}
        stroke="#1A1A1A"
        strokeOpacity="0.5"
        strokeWidth="0.75"
      />
      <text
        className="fp-anim"
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fontWeight="600"
        fill="#1A1A1A"
        fontFamily="Inter, system-ui, sans-serif"
      >
        {letra}
      </text>
    </g>
  )
}
