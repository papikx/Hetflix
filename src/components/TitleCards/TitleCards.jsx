import React, { useEffect, useRef, useState } from 'react' // React
import './TitleCards.css' // Styles des rangées de cartes films
import { Link, useNavigate } from 'react-router-dom' // Lien et navigation sans recharger
import { getPlayerPath, getTmdbId, inferMediaType } from '../../utils/trailer' // URLs lecteur et type film/série
import { buildTmdbListUrl } from '../../utils/buildTmdbListUrl' // Construit l'URL TMDB selon catégorie
import { isSafeContent } from '../../utils/contentFilter' // Filtre contenu adulte
import { TMDB_OPTIONS } from '../../config/tmdb' // En-têtes requête TMDB
import { toast } from 'react-toastify' // Messages popup
import { auth, db, addToWatchLater, removeFromWatchLater, getWatchLater } from '../../firebase' // Base et liste à voir
import { onAuthStateChanged } from 'firebase/auth' // Écoute connexion utilisateur
import { collection, query, where, onSnapshot } from 'firebase/firestore' // Lecture temps réel Firestore

const TitleCards = ({ title, category, type }) => { // Composant : une rangée horizontale de films (props = titre, catégorie TMDB, type)

  const navigate = useNavigate(); // Pour aller au lecteur au clic
  const [apiData, setApiData] = useState([]); // Tableau des cartes affichées (TMDB + admin)
  const [watchLaterList, setWatchLaterList] = useState([]); // Ids des films déjà dans « à voir »
  const [userUid, setUserUid] = useState(null); // Id utilisateur connecté
  const cardsRef = useRef(); // Référence du div qui scroll horizontalement

  useEffect(() => { // Charge films TMDB + admin à chaque changement category/type
    const currentCategory = category || "now_playing"; // Catégorie par défaut si non fournie
    let tmdbMovies = []; // Films venant de TMDB (variable locale)
    let adminMovies = []; // Films ajoutés par l'admin (variable locale)

    const updateDisplay = () => { // Fusionne les deux sources et met à jour l'écran
      setApiData([...adminMovies, ...tmdbMovies]); // Films admin en premier, puis TMDB
    };

    const url = buildTmdbListUrl(type, currentCategory); // URL complète de l'API

    fetch(url, TMDB_OPTIONS) // Envoie la requête réseau vers TMDB
      .then(res => res.json()) // Parse la réponse JSON
      .then(res => { // Quand les données arrivent
        tmdbMovies = res.results || []; // Stocke le tableau de films (ou vide)
        updateDisplay(); // Rafraîchit l'affichage
      })
      .catch(err => console.error("TMDB Error:", err)); // Log erreur si échec

    const q = query(collection(db, "admin_movies"), where("category", "==", currentCategory)); // Requête : films admin de cette catégorie
    const unsubscribeAdmin = onSnapshot(q, (snapshot) => { // Écoute en direct les changements Firebase
      adminMovies = snapshot.docs.map(doc => ({ // Transforme chaque document Firestore en carte
        id: doc.id, // Id document Firebase
        ...doc.data(), // Copie title, imageUrl, tmdbId, etc.
        backdrop_path: doc.data().imageUrl, // Image pour affichage comme TMDB
        title: doc.data().title, // Titre affiché
        isAdminMovie: true, // Marque : film ajouté manuellement
        type: doc.data().type || 'movie', // movie ou tv
      }));
      updateDisplay(); // Rafraîchit après chaque changement admin
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => { // Quand l'utilisateur se connecte ou part
      if (user) { // Connecté
        setUserUid(user.uid); // Sauvegarde l'id
        getWatchLater(user.uid).then(list => setWatchLaterList(list.map(m => m.movieId))); // Charge les ids « à voir »
      } else { // Déconnecté
        setUserUid(null); // Efface l'id
        setWatchLaterList([]); // Vide la liste locale
      }
    });

    return () => { // Fonction de nettoyage quand le composant disparaît
      unsubscribeAdmin(); // Arrête l'écoute admin
      unsubscribeAuth(); // Arrête l'écoute auth
    };
  }, [category, type]); // Relance si category ou type change

  const handleWatchLaterClick = async (e, card) => { // Clic sur le bouton + sur une carte
    e.preventDefault(); // N'ouvre pas le lecteur
    e.stopPropagation(); // N'envoie pas le clic au parent
    if (!userUid) return; // Pas connecté : rien

    const movieId = getTmdbId(card) || card.id; // Numéro du film (TMDB ou admin)

    if (watchLaterList.includes(movieId)) { // Déjà dans la liste
      await removeFromWatchLater(userUid, movieId); // Supprime Firebase
      setWatchLaterList(prev => prev.filter(id => id !== movieId)); // Met à jour React
    } else { // Pas encore dans la liste
      await addToWatchLater(userUid, { // Enregistre dans Firebase
        ...card, // Toutes les infos de la carte
        id: movieId, // Id explicite
        mediaType: inferMediaType(card, type, category), // movie ou tv pour le lecteur
      });
      setWatchLaterList(prev => [...prev, movieId]); // Ajoute l'id localement
    }
  }

  const scroll = (direction) => { // Flèches gauche / droite de la rangée
    if (direction === 'left') cardsRef.current.scrollLeft -= 500; // Scroll 500px vers la gauche
    else cardsRef.current.scrollLeft += 500; // Scroll 500px vers la droite
  }

  const handleCardClick = (e, card) => { // Clic sur la carte (pas sur le bouton +)
    const path = getPlayerPath(card, type, category); // Calcule l'URL du lecteur
    if (!path) { // Pas d'id TMDB valide
      e.preventDefault(); // Annule la navigation
      toast.info("Bande-annonce non disponible pour ce contenu"); // Message à l'utilisateur
      return; // Stop
    }
    e.preventDefault(); // On navigue nous-mêmes avec navigate()
    navigate(path); // Va vers /player/movie/... ou /player/tv/...
  }

  return (
    <div className='title-cards'> {/* Bloc section avec titre */}
      <h2>{title ? title : "Populaire sur Hetflix"}</h2> {/* Titre de la rangée ou texte par défaut */}
      <div className="card-list-wrapper"> {/* Conteneur avec flèches de scroll */}
        <div className="scroll-btn left" onClick={() => scroll('left')}>‹</div> {/* Flèche gauche */}
        <div className="card-list" ref={cardsRef}> {/* Liste horizontale scrollable */}
          {apiData
            .filter((card) => isSafeContent( // Retire les films de la liste noire
              card.title || card.name || card.original_title || card.original_name || '', // Titre pour filtre
              card.overview || card.description || '', // Description pour filtre
            ))
            .map((card, index) => { // Une carte par film
            const isAdded = watchLaterList.includes(card.tmdbId || card.id); // Déjà en liste à voir ?
            const playerPath = getPlayerPath(card, type, category); // Lien vers bande-annonce
            return (
              <div className="card-container" key={index}> {/* Boîte autour d'une carte */}
                <Link to={playerPath || '#'} className="card" onClick={(e) => handleCardClick(e, card)}> {/* Lien cliquable */}
                  <img
                    src={card.isAdminMovie ? card.imageUrl : (card.backdrop_path || card.poster_path ? `https://image.tmdb.org/t/p/w500/${card.backdrop_path || card.poster_path}` : 'https://placehold.co/600x400/000000/FFFFFF?text=Pas+d\'image')} // URL image admin ou TMDB ou placeholder
                    alt={card.title} // Texte alternatif accessibilité
                    onError={(e) => { e.target.src = 'https://placehold.co/600x400/000000/FFFFFF?text=Image+non+disponible' }} // Si image cassée : placeholder
                  />
                  <p>{card.title || card.name}</p> {/* Nom du film sous l'image */}
                  <button
                    className={`add-to-list-btn ${isAdded ? 'added' : ''}`} // Style vert si déjà ajouté
                    onClick={(e) => handleWatchLaterClick(e, card)} // Ajoute ou retire de la liste
                  >
                    {isAdded ? '✓' : '+'} {/* Symbole selon état */}
                  </button>
                </Link>
              </div>
            )
          })}
        </div> {/* Fin card-list */}
        <div className="scroll-btn right" onClick={() => scroll('right')}>›</div> {/* Flèche droite */}
      </div> {/* Fin card-list-wrapper */}
    </div>
  )
}

export default TitleCards; // Export pour Home et Category
