import { MODELOS } from './data/models.js'
import { formatPrecio, calcularTotal } from './utils/formato.js'

export default function App() {
  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      <header className="bg-impacar-campo text-white px-6 py-4">
        <h1 className="text-2xl font-bold tracking-wide">IMPACAR</h1>
        <p className="text-sm opacity-90">Configurador de casillas rurales</p>
      </header>
      <main className="p-6">
        <p className="text-impacar-cobre font-semibold mb-4">
          Datos Lista 108 cargados — {MODELOS.length} modelos disponibles.
        </p>
        <ul className="space-y-1">
          {MODELOS.map((m) => (
            <li key={m.id}>
              {m.nombre} · {m.largo}m · neto {formatPrecio(m.precioNeto)} · total c/IVA{' '}
              {formatPrecio(calcularTotal(m.precioNeto))}
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
