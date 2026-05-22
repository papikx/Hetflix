import React from 'react' // React
import Home from './pages/Home/Home' // Page d'accueil
import { Routes, Route } from 'react-router-dom' // Définition des routes URL
import Login from './pages/Login/Login' // Page connexion
import Player from './pages/Player/Player' // Page bande-annonce
import MyList from './pages/MyList/MyList' // Page ma liste
import Category from './pages/Category/Category' // Pages catégories
import Admin from './pages/Admin/Admin' // Page admin
import { useAuthGuard } from './hooks/useAuthGuard' // Protection connexion
import { ToastContainer } from 'react-toastify'; // Zone des notifications
import 'react-toastify/dist/ReactToastify.css'; // Style des notifications

const App = () => { // Composant racine

  useAuthGuard(); // Vérifie utilisateur connecté

  return ( // Affichage
    <div> {/* Conteneur */}
      <ToastContainer theme='dark' /> {/* Notifications sombres */}
      <Routes> {/* Liste des pages */}
        <Route path='/' element={<Home />} /> {/* Accueil */}
        <Route path='/login' element={<Login />} /> {/* Connexion */}
        <Route path='/player/movie/:id' element={<Player />} /> {/* Lecteur film */}
        <Route path='/player/tv/:id' element={<Player />} /> {/* Lecteur série */}
        <Route path='/player/:id' element={<Player />} /> {/* Lecteur ancien format */}
        <Route path='/mylist' element={<MyList />} /> {/* Liste perso */}
        <Route path='/tv' element={<Category type="tv" title="Séries TV" />} /> {/* Séries */}
        <Route path='/movies' element={<Category type="movie" title="Films" />} /> {/* Films */}
        <Route path='/latest' element={<Category type="trending" title="Nouveautés et populaires" />} /> {/* Tendances */}
        <Route path='/kids' element={<Category type="kids" title="Enfants" />} /> {/* Enfants */}
        <Route path='/language' element={<Category type="movie" title="Parcourir par langue" isLanguage={true} />} /> {/* Langues */}
        <Route path='/admin' element={<Admin />} /> {/* Admin */}
      </Routes>
    </div>
  )
}

export default App // Export
