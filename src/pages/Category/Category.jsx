import React, { useState } from 'react' // React + variable d'état pour la langue
import './Category.css' // Styles de la page catégorie
import Navbar from '../../components/Navbar/Navbar' // Barre de menu en haut
import TitleCards from '../../components/TitleCards/TitleCards' // Rangées horizontales de films
import Footer from '../../components/Footer/Footer' // Pied de page

const Category = ({ type, title, isLanguage }) => { // type = movie/tv/trending/kids, title = titre affiché, isLanguage = page langues
  const [language, setLanguage] = useState('en'); // Langue choisie dans le menu (en, fr, es...)

  return ( // Affichage de la page
    <div className='category-page'> {/* Conteneur principal */}
      <Navbar /> {/* Menu identique aux autres pages */}

      <div className="category-header"> {/* Bandeau avec titre */}
        <h1>{title}</h1> {/* Titre passé depuis App.jsx (ex. « Films », « Séries TV ») */}

        {isLanguage && (
          <div className="language-selector"> {/* Zone du sélecteur de langue */}
            <select value={language} onChange={(e) => setLanguage(e.target.value)}> {/* Change language au choix */}
              <option value="en">Anglais</option> {/* Option anglais */}
              <option value="fr">Français</option> {/* Option français */}
              <option value="es">Espagnol</option> {/* Option espagnol */}
              <option value="ja">Japonais</option> {/* Option japonais */}
              <option value="ko">Coréen</option> {/* Option coréen */}
            </select>
          </div>
        )}
      </div>

      <div className="category-content"> {/* Zone des rangées de cartes */}
        {isLanguage ? ( // Mode « parcourir par langue »
          <>
            <TitleCards key={`movie-${language}`} title="Films" type="discover_language" category={language} /> {/* Films dans la langue choisie */}
            <TitleCards key={`tv-${language}`} title="Séries TV" type="discover_language_tv" category={language} /> {/* Séries dans la langue choisie */}
          </>
        ) : (
          <>
            {type === 'tv' && (
              <>
                <TitleCards title="Séries Populaires" type="tv" category="popular" /> {/* Rangée populaire séries */}
                <TitleCards title="Séries les mieux notées" type="tv" category="top_rated" /> {/* Mieux notées */}
                <TitleCards title="En diffusion" type="tv" category="on_the_air" /> {/* Actuellement diffusées */}
              </>
            )}
            {type === 'movie' && (
              <>
                <TitleCards title="Films à succès" type="movie" category="top_rated" /> {/* Top rated films */}
                <TitleCards title="Populaires" type="movie" category="popular" /> {/* Populaires */}
                <TitleCards title="À venir" type="movie" category="upcoming" /> {/* Prochainement */}
                <TitleCards title="En salle" type="movie" category="now_playing" /> {/* En salles */}
              </>
            )}
            {type === 'trending' && (
              <>
                <TitleCards title="Films du jour" type="trending" category="movie/day" /> {/* Tendances films jour */}
                <TitleCards title="Séries du jour" type="trending" category="tv/day" /> {/* Tendances séries jour */}
                <TitleCards title="Tendances de la semaine" type="trending" category="all/week" /> {/* Tendances semaine */}
              </>
            )}
            {type === 'kids' && (
              <>
                <TitleCards title="Films pour toute la famille" type="discover" category="10751" /> {/* Genre famille TMDB */}
                <TitleCards title="Séries d'animation" type="discover_tv" category="16" /> {/* Genre animation */}
              </>
            )}
          </>
        )}
      </div>

      <Footer /> {/* Pied de page */}
    </div>
  )
}

export default Category // Export pour App.jsx
