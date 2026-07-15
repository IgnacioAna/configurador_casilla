import { useState, useRef, useEffect } from 'react'
import Landing from './components/Landing.jsx'
import ConfiguratorWizard from './components/ConfiguratorWizard.jsx'
import Resumen from './components/Resumen.jsx'
import { usePersistedConfig, STORAGE_KEY, limpiarTokenURL } from './hooks/usePersistedConfig.js'
import { decodificarConfig } from './utils/configLink.js'

// Ruteo de estado de una sola página (SPA): landing → wizard → resumen, sin cambiar la URL.
//
// D-01 (Fase 6): el estado de configuración (usePersistedConfig) se IZA acá (lifting state up).
// Antes vivía dentro de ConfiguratorWizard; ahora App tiene la ÚNICA instancia del hook y pasa
// { estado, dispatch, reiniciar } por props al wizard y al resumen. Una sola fuente de verdad:
// así "Editar" desde el resumen (IR_A_PASO) muta el MISMO estado que lee el wizard, y navegar al
// resumen no resetea nada (D-02: el estado sigue vivo).

// Vista de arranque:
//  - Link compartido (?c= válido en la URL) → 'resumen' directo: el asesor abre el link del cliente
//    y cae en el resumen con el plano vivo + presupuesto. Es el corazón de "compartir el enlace".
//  - Config guardada en localStorage → 'wizard' (SHELL-03: retoma donde quedó).
//  - Nada → 'landing'.
// Nota: salvo por el link compartido, vistaInicial NO abre 'resumen' — un F5 sin ?c= cae al wizard
// con el estado intacto (el usuario retoma el configurador y vuelve a entrar al resumen desde el
// Paso 6). El ?c= se limpia tras el montaje, así que ese F5 posterior ya no reabre el resumen.
function vistaInicial() {
  try {
    const token = new URLSearchParams(window.location.search).get('c')
    if (token && decodificarConfig(token)) return 'resumen'
    return localStorage.getItem(STORAGE_KEY) ? 'wizard' : 'landing'
  } catch {
    return 'landing'
  }
}

export default function App() {
  const [vista, setVista] = useState(vistaInicial)
  const { estado, dispatch, reiniciar } = usePersistedConfig()

  // A11y (D-03, UX-02): al cambiar de vista (landing → wizard → resumen) el foco quedaba al fondo
  // del DOM (en el botón pulsado) o se iba al <body>. Como el <h1> de cada vista vive DENTRO de su
  // componente hijo, movemos el foco a un contenedor focuseable que envuelve la vista montada
  // (useRef + useEffect + tabIndex={-1}, Pattern 1 del RESEARCH). Así el teclado/lector arranca
  // arriba de la nueva pantalla en lugar de obligar a re-tabular desde abajo.
  const vistaRef = useRef(null)
  useEffect(() => {
    vistaRef.current?.focus()
  }, [vista])

  // Tras sembrar el estado desde ?c= (link compartido), borrar el token de la URL: un F5 posterior
  // debe usar el localStorage ya actualizado, no re-sembrar desde el token viejo pisando ediciones.
  useEffect(() => {
    limpiarTokenURL()
  }, [])

  return (
    <div className="min-h-screen bg-impacar-fondo text-impacar-texto font-sans">
      <div ref={vistaRef} tabIndex={-1} className="focus:outline-none">
        {vista === 'landing' && <Landing onComenzar={() => setVista('wizard')} />}
        {vista === 'wizard' && (
          <ConfiguratorWizard
            estado={estado}
            dispatch={dispatch}
            reiniciar={reiniciar}
            onVolverInicio={() => setVista('landing')}
            onVerResumen={() => setVista('resumen')}
          />
        )}
        {vista === 'resumen' && (
          <Resumen
            estado={estado}
            dispatch={dispatch}
            onVolverEditar={() => setVista('wizard')}
          />
        )}
      </div>
    </div>
  )
}
