import React, { useRef, useEffect, useState } from 'react' // React : bibliothèque interface
import './Navbar.css' // Styles de la barre de menu
import logo from '../../assets/logo.png' // Image logo Hetflix
import search_icon from '../../assets/search_icon.svg' // Icône loupe recherche
import bell_icon from '../../assets/bell_icon.svg' // Icône cloche notifications
import profile_img from '../../assets/profile_img.png' // Photo profil utilisateur
import caret_icon from '../../assets/caret_icon.svg' // Petite flèche menu déroulant
import { auth, logout, addToWatchLater, removeFromWatchLater, getWatchLater } from '../../firebase' // Fonctions Firebase
import { TMDB_OPTIONS, TMDB_BASE_URL } from '../../config/tmdb' // Paramètres API films
import { isSafeContent } from '../../utils/contentFilter' // Cache les films interdits
import { onAuthStateChanged } from 'firebase/auth' // Écoute si user connecté
import { Link, useNavigate, useLocation } from 'react-router-dom' // Liens et navigation

const Navbar = () => { // Composant barre de menu en haut de chaque page

  const navRef = useRef(); // Référence HTML de la barre (pour changer le style au scroll)
  const [isSearchActive, setIsSearchActive] = useState(false); // true = champ recherche visible
  const [searchQuery, setSearchQuery] = useState(''); // Texte tapé dans la recherche
  const [searchResults, setSearchResults] = useState([]); // Films trouvés sur TMDB
  const [watchLaterList, setWatchLaterList] = useState([]); // Liste des ids déjà en « à voir »
  const [userUid, setUserUid] = useState(null); // Identifiant Firebase de l'utilisateur
  const [showNotifications, setShowNotifications] = useState(false); // true = menu notifs ouvert
  const navigate = useNavigate(); // Fonction pour aller sur une autre page
  const location = useLocation(); // Objet qui dit sur quelle URL on est

  useEffect(() => { // S'exécute une fois au chargement du menu
    window.addEventListener('scroll', () => { // Écoute quand l'utilisateur fait défiler la page
      if (window.scrollY >= 80) { // Si on a scrollé plus de 80 pixels vers le bas
        navRef.current.classList.add('nav-dark') // Ajoute classe CSS fond sombre
      } else { // Si on est tout en haut de la page
        navRef.current.classList.remove('nav-dark') // Enlève le fond sombre
      }
    })
  }, []) // Tableau vide = ne relance pas cet effet

  useEffect(() => { // Charge la liste « à voir » quand l'utilisateur se connecte
    const fetchWatchLater = async (uid) => { // Fonction interne : lit Firebase
      const list = await getWatchLater(uid); // Récupère tous les films sauvegardés
      setWatchLaterList(list.map(movie => movie.movieId)); // Garde seulement les numéros de films
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => { // Écoute connexion / déconnexion
      if (user) { // Utilisateur connecté avec email
        setUserUid(user.uid); // Enregistre son id
        fetchWatchLater(user.uid); // Charge sa liste
      } else { // Personne connectée
        setUserUid(null); // Efface l'id
        setWatchLaterList([]); // Vide la liste locale
      }
    });

    return () => unsubscribe(); // À la destruction du menu : arrête l'écoute Firebase
  }, []); // Une seule fois au montage

  useEffect(() => { // Recherche TMDB à chaque changement de texte
    if (searchQuery.trim().length > 0) { // Si l'utilisateur a tapé quelque chose
      fetch(`${TMDB_BASE_URL}/search/movie?query=${searchQuery}&language=fr-FR&page=1&include_adult=false`, TMDB_OPTIONS) // Appel API recherche films
        .then(res => res.json()) // Transforme la réponse en objet JavaScript
        .then(res => { // Traite les données reçues
          if (res.results) { // Si TMDB a renvoyé des résultats
            setSearchResults(res.results.slice(0, 5)); // Affiche maximum 5 films
          }
        })
        .catch(err => console.error(err)); // En cas d'erreur : affiche dans la console
    } else { // Champ de recherche vide
      setSearchResults([]); // Efface les résultats affichés
    }
  }, [searchQuery]); // Relance quand searchQuery change

  const handleSearchIconClick = () => { // Clic sur l'icône loupe
    setIsSearchActive(!isSearchActive); // Ouvre ou ferme la barre de recherche
    if (isSearchActive) { // Si on vient de fermer la recherche
      setSearchQuery(''); // Efface le texte tapé
      setSearchResults([]); // Efface la liste de résultats
    }
  };

  const handleResultClick = (movieId) => { // Clic sur un film dans les résultats
    navigate(`/player/movie/${movieId}`); // Ouvre la page bande-annonce du film
    setIsSearchActive(false); // Ferme la recherche
    setSearchQuery(''); // Vide le champ
    setSearchResults([]); // Cache les résultats
  };

  const handleBellClick = () => { // Clic sur la cloche
    setShowNotifications(!showNotifications); // Affiche ou cache le menu notifications
  };

  const handleWatchLaterClick = async (e, movie) => { // Clic sur le bouton + dans la recherche
    e.preventDefault(); // Empêche le lien parent de s'ouvrir
    e.stopPropagation(); // Empêche la propagation du clic
    if (!userUid) return; // Pas connecté : on ne fait rien

    if (watchLaterList.includes(movie.id)) { // Le film est déjà dans la liste
      await removeFromWatchLater(userUid, movie.id); // Supprime de Firebase
      setWatchLaterList(prev => prev.filter(id => id !== movie.id)); // Met à jour l'écran
    } else { // Le film n'est pas encore dans la liste
      await addToWatchLater(userUid, movie); // Ajoute dans Firebase
      setWatchLaterList(prev => [...prev, movie.id]); // Ajoute l'id à l'état local
    }
  };

  return ( // Début de ce qui s'affiche à l'écran
    <div ref={navRef} className='navbar'> {/* Barre de navigation principale */}
      <div className="navbar-left"> {/* Partie gauche : logo + liens */}
        <img src={logo} alt="Hetflix" onClick={() => navigate('/')} className="navbar-logo" /> {/* Logo : clic = page d'accueil */}
        <ul> {/* Liste des liens de navigation */}
          <li><Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>Accueil</Link></li> {/* Lien page d'accueil */}
          <li><Link to='/tv' style={{ textDecoration: 'none', color: 'inherit' }}>Séries TV</Link></li> {/* Lien page séries */}
          <li><Link to='/movies' style={{ textDecoration: 'none', color: 'inherit' }}>Films</Link></li> {/* Lien page films */}
          <li><Link to='/latest' style={{ textDecoration: 'none', color: 'inherit' }}>Nouveautés et populaires</Link></li> {/* Lien tendances */}
          <li><Link to='/mylist' style={{ textDecoration: 'none', color: 'inherit' }}>Liste à voir</Link></li> {/* Lien ma liste */}
          <li><Link to='/language' style={{ textDecoration: 'none', color: 'inherit' }}>Parcourir par langue</Link></li> {/* Lien par langue */}
        </ul>
      </div>
      <div className="navbar-right"> {/* Partie droite : recherche, enfants, notifs, profil */}
        <div className="search-container"> {/* Zone recherche de films */}
          <img src={search_icon} alt="" className='icons' onClick={handleSearchIconClick} /> {/* Clic loupe ouvre/ferme recherche */}
          <input
            type="text" // Type champ texte
            className={`search-input ${isSearchActive ? 'active' : ''}`} // Classe CSS : visible si recherche active
            placeholder="Rechercher un film..." // Texte gris dans le champ vide
            value={searchQuery} // Valeur contrôlée par React
            onChange={(e) => setSearchQuery(e.target.value)} // À chaque lettre : met à jour searchQuery
          /> {/* Fin champ recherche */}
          {searchResults.length > 0 && (
            <div className="search-results"> {/* Boîte déroulante : liste des films trouvés */}
              {searchResults
                .filter((movie) => isSafeContent( // Garde seulement les films autorisés
                  movie.title || movie.name || movie.original_title || '', // Titre pour le filtre
                  movie.overview || '', // Description pour le filtre
                ))
                .map((movie) => { // Pour chaque film filtré
                const isAdded = watchLaterList.includes(movie.id); // Déjà dans « à voir » ?
                return ( // Retourne une ligne de résultat
                <div key={movie.id} className="search-result-item" onClick={() => handleResultClick(movie.id)}> {/* Ligne cliquable */}
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt={movie.title} />
                  ) : (
                    <div style={{ width: '40px', height: '60px', marginRight: '10px', background: '#333' }}></div>
                  )}
                  <p>{movie.title}</p> {/* Nom du film */}
                  <button
                    className={`search-result-add-btn ${isAdded ? 'added' : ''}`} // Style différent si déjà ajouté
                    onClick={(e) => handleWatchLaterClick(e, movie)} // Clic + ou ✓
                  >
                    {isAdded ? '✓' : '+'} {/* Coches si déjà en liste, sinon plus */}
                  </button>
                </div>
              )})} {/* Fin map résultats */}
            </div>
          )}
        </div> {/* Fin search-container */}
        <p> {/* Lien Enfants ou Adultes selon la page */}
          {location.pathname === '/kids' ? (
            <Link to='/' style={{ textDecoration: 'none', color: 'inherit' }}>Adultes</Link>
          ) : (
            <Link to='/kids' style={{ textDecoration: 'none', color: 'inherit' }}>Enfants</Link>
          )}
        </p>
        <div className="notification-container" style={{ position: 'relative' }}> {/* Zone cloche + menu */}
          <img src={bell_icon} alt="" className='icons' onClick={handleBellClick} /> {/* Clic ouvre les fausses notifications */}
          {showNotifications && (
            <div className="notifications-dropdown"> {/* Liste déroulante des notifications */}
              <div className="notification-item"> {/* Première notification exemple */}
                <img src={logo} alt="Netflix" className="notification-img" /> {/* Petite image */}
                <div className="notification-text"> {/* Texte à droite */}
                  <p className="notification-title">Nouveauté Hetflix</p> {/* Titre notif */}
                  <p className="notification-desc">Stranger Things Saison 5 est maintenant disponible !</p> {/* Description */}
                </div>
              </div>
              <div className="notification-item"> {/* Deuxième notification exemple */}
                <img src={logo} alt="Netflix" className="notification-img" /> {/* Image */}
                <div className="notification-text"> {/* Bloc texte */}
                  <p className="notification-title">Recommandation pour vous</p> {/* Titre */}
                  <p className="notification-desc">Découvrez The Witcher</p> {/* Message */}
                </div>
              </div>
            </div>
          )}
        </div> {/* Fin notification-container */}
        <div className="navbar-profile"> {/* Zone profil en haut à droite */}
          <img src={profile_img} alt="" className='profile' /> {/* Avatar */}
          <img src={caret_icon} alt="" /> {/* Flèche */}
          <div className="dropdown"> {/* Menu au survol */}
            <p onClick={() => { logout() }}>Se déconnecter</p> {/* Clic déconnecte Firebase */}
          </div>
        </div> {/* Fin navbar-profile */}
      </div> {/* Fin navbar-right */}

    </div>
  )
}

export default Navbar // Export pour les autres pages
