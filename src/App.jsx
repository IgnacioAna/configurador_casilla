import { useState } from 'react'
import Landing from './components/Landing.jsx'
import ConfiguratorWizard from './components/ConfiguratorWizard.jsx'

// Ruteo de estado de una sola página (SPA): landing → wizard, sin cambiar la URL.
// El plano se integra dentro del wizard en el Plan 03 (PLANO-03).
export default function App() {
  const [vista, setVista] = useState('landing')

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      {vista === 'landing' ? (
        <Landing onComenzar={() => setVista('wizard')} />
      ) : (
        <ConfiguratorWizard onVolverInicio={() => setVista('landing')} />
      )}
    </div>
  )
}
