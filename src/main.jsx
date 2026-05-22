import React from 'react' // Importe React
import ReactDOM from 'react-dom/client' // Outil pour afficher React dans la page HTML
import App from './App.jsx' // Composant principal du site
import './index.css' // Styles globaux
import { BrowserRouter } from 'react-router-dom' // Gestion des URLs (/login, /admin...)

ReactDOM.createRoot(document.getElementById('root')).render( // Affiche l'app dans la div #root
  <React.StrictMode> {/* Mode développement strict */}
    <BrowserRouter> {/* Active la navigation par liens */}
      <App /> {/* Lance toute l'application */}
    </BrowserRouter>
  </React.StrictMode>,
)
