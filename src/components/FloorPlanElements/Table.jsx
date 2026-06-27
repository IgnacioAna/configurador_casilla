// Mesa del estar/comedor (UI-SPEC "Color").
// Recibe el rect de la mesa YA en unidades de viewBox: x, y, w, h, rebatible.
//   - rebatible === true -> borde punteado (stroke-dasharray "3 2")
//   - rebatible === false -> borde sólido
// Trazo: #1A1A1A opacidad 0.7, ancho 1.
export default function Table({ x, y, w, h, rebatible = false }) {
  return (
    <g stroke="#1A1A1A" strokeOpacity="0.7" strokeWidth="1" fill="none">
      <title>{rebatible ? 'Mesa rebatible' : 'Mesa'}</title>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx="2"
        strokeDasharray={rebatible ? '3 2' : undefined}
      />
    </g>
  )
}
