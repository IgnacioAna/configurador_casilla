// Landing de bienvenida del configurador Impacar (SHELL-01).
// Copy en español argentino, trato de usted (PROJECT.md fija usted). Identidad sobria/industrial.
export default function Landing({ onComenzar }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-xl text-center">
        <p className="mb-8 text-2xl font-bold tracking-[0.2em] text-impacar-campo">IMPACAR</p>

        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Diseñe su casilla rural a medida
        </h1>
        <p className="mt-4 text-base text-impacar-texto/80 sm:text-lg">
          Configure su casilla paso a paso y reciba un presupuesto estimado en minutos.
        </p>

        <button
          type="button"
          onClick={onComenzar}
          className="mt-8 min-h-[44px] rounded bg-impacar-campo px-8 py-3 text-base font-semibold text-white transition-colors hover:bg-impacar-campo/90 focus:outline-none focus:ring-2 focus:ring-impacar-campo/40"
        >
          Comenzar
        </button>

        <div className="mt-10 space-y-1 break-words text-xs text-impacar-texto/70 sm:text-sm">
          <p>Industrias Impacar — Fabricación de casillas rurales desde General Pico, La Pampa</p>
          <p>Estructura de acero reforzado · Doble techo aislado · Energía solar · Entrega en todo el país</p>
        </div>
      </div>
    </div>
  )
}
