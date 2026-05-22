import React from 'react' // React
import { useNavigate } from 'react-router-dom' // Navigation
import './Home.css' // Styles accueil
import Navbar from '../../components/Navbar/Navbar' // Menu haut
import hero_banner from '../../assets/hero_banner.jpg' // Image fond Stranger Things
import hero_title from '../../assets/hero_title.png' // Logo titre Stranger Things
import play_icon from '../../assets/play_icon.png' // Icône play
import TitleCards from '../../components/TitleCards/TitleCards' // Rangées films
import Footer from '../../components/Footer/Footer' // Pied de page

const Home = () => { // Page d'accueil

  const navigate = useNavigate(); // Pour bouton Voir

  return ( // Affichage
    <div className='home'> {/* Page entière */}
      <Navbar /> {/* Barre navigation */}
      <div className="hero"> {/* Grande bannière */}
        <img src={hero_banner} alt="" className='banner-img' /> {/* Image arrière-plan */}
        <div className="hero-caption"> {/* Texte par-dessus */}
          <img src={hero_title} alt="" className='caption-img' /> {/* Titre image */}
          <p>Quand un jeune garçon disparaît, une petite ville découvre une affaire mystérieuse, des expériences secrètes, des forces surnaturelles terrifiantes... et une fillette.</p> {/* Description */}
          <div className="hero-btns"> {/* Boutons */}
            <button className='btn' onClick={() => navigate('/player/tv/66732')}><img src={play_icon} alt="" />Voir</button> {/* Ouvre bande-annonce Stranger Things */}
          </div>
          <TitleCards /> {/* Rangée populaire sous le hero */}
        </div>
      </div>

      <div className="more-cards"> {/* Autres rangées plus bas */}
        <TitleCards title={"Films à succès"} category={"top_rated"} /> {/* Top rated */}
        <TitleCards title={"Uniquement sur Hetflix"} category={"popular"} /> {/* Populaire */}
        <TitleCards title={"À venir"} category={"upcoming"} /> {/* À venir */}
        <TitleCards title={"Sélection pour vous"} category={"now_playing"} /> {/* En cours */}
      </div>

      <Footer /> {/* Bas de page */}
    </div>
  )
}

export default Home // Export pour App.jsx
