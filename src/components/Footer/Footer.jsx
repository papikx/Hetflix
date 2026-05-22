import React from 'react' // React
import './Footer.css' // Styles du pied de page
import youtube_icon from '../../assets/youtube_icon.png' // Icône réseau social YouTube
import twitter_icon from '../../assets/twitter_icon.png' // Icône Twitter
import instagram_icon from '../../assets/instagram_icon.png' // Icône Instagram
import facebook_icon from '../../assets/facebook_icon.png' // Icône Facebook

const Footer = () => { // Composant pied de page (bas du site)
  return ( // Affichage
    <div className='footer'> {/* Conteneur principal footer */}
      <div className="footer-icons"> {/* Ligne des icônes sociales */}
        <a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer"> {/* Lien Facebook (ouvre nouvel onglet) */}
          <img src={facebook_icon} alt="Facebook" /> {/* Image icône Facebook */}
        </a>
        <a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer"> {/* Lien Instagram */}
          <img src={instagram_icon} alt="Instagram" /> {/* Image icône Instagram */}
        </a>
        <a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer"> {/* Lien Twitter */}
          <img src={twitter_icon} alt="Twitter" /> {/* Image icône Twitter */}
        </a>
        <a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer"> {/* Lien YouTube */}
          <img src={youtube_icon} alt="YouTube" /> {/* Image icône YouTube */}
        </a>
      </div>
      <ul> {/* Liste de liens texte (décoratifs) */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Description audio</a></li> {/* Lien 1 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Centre d'aide</a></li> {/* Lien 2 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Cartes-cadeaux</a></li> {/* Lien 3 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Espace médias</a></li> {/* Lien 4 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Relations avec les investisseurs</a></li> {/* Lien 5 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Conditions d'utilisation</a></li> {/* Lien 6 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Confidentialité</a></li> {/* Lien 7 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Mentions légales</a></li> {/* Lien 8 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Gestion des cookies</a></li> {/* Lien 9 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Informations sur l'entreprise</a></li> {/* Lien 10 */}
        <li><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer">Contactez-nous</a></li> {/* Lien 11 */}
      </ul>
      <p className='copyright-text'>© 1997-2026 Hetflix, Inc.</p> {/* Texte copyright */}
    </div>
  )
}

export default Footer // Export pour Home, Category, MyList
