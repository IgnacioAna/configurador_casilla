// Barra de progreso del wizard (SHELL-02): indica el paso actual de los 6.
export default function BarraProgreso({ pasoActual, total }) {
  const actual = pasoActual + 1
  const porcentaje = Math.round((actual / total) * 100)
  return (
    <div className="mb-6">
      <div className="mb-1 flex items-center justify-between text-sm text-impacar-texto/70">
        <span>Paso {actual} de {total}</span>
        <span>{porcentaje}%</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso del configurador"
        aria-valuenow={actual}
        aria-valuemin={1}
        aria-valuemax={total}
        className="h-2 w-full overflow-hidden rounded-full bg-impacar-texto/10"
      >
        <div
          className="h-full rounded-full bg-impacar-campo transition-all duration-300"
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  )
}
