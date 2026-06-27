// Registro de los 6 pasos del wizard (SHELL-02). En la Fase 3 cada paso es un STUB
// ("próximamente"); el contenido real llega en las Fases 4-5, que reemplazan el campo
// `Componente` de cada entrada SIN tocar la cáscara del wizard (este registro es el contrato).

// Stub reutilizable: muestra el número y el título del paso. Acepta props futuras
// (estado, dispatch) que en esta fase ignora.
function StubPaso({ numero, titulo }) {
  return (
    <div className="py-8 text-center">
      <h2 className="text-xl font-semibold text-impacar-texto">{titulo}</h2>
      <p className="mt-2 text-sm text-impacar-texto/70">
        Paso {numero} — este paso estará disponible próximamente.
      </p>
    </div>
  )
}

export const PASOS = [
  { id: 'uso', titulo: 'Uso y ocupantes', Componente: (props) => <StubPaso numero={1} titulo="Uso y ocupantes" {...props} /> },
  { id: 'dimensiones', titulo: 'Dimensiones', Componente: (props) => <StubPaso numero={2} titulo="Dimensiones" {...props} /> },
  { id: 'bano', titulo: 'Baño', Componente: (props) => <StubPaso numero={3} titulo="Baño" {...props} /> },
  { id: 'dormitorio', titulo: 'Dormitorio', Componente: (props) => <StubPaso numero={4} titulo="Dormitorio" {...props} /> },
  { id: 'cocina', titulo: 'Cocina y estar', Componente: (props) => <StubPaso numero={5} titulo="Cocina y estar" {...props} /> },
  { id: 'extras', titulo: 'Extras', Componente: (props) => <StubPaso numero={6} titulo="Extras" {...props} /> },
]
