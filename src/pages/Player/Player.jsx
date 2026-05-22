import React, { useEffect, useState } from 'react' // React
import './Player.css' // Styles plein écran du lecteur
import back_arrow_icon from '../../assets/back_arrow_icon.png' // Icône flèche retour
import { useNavigate, useParams, useLocation } from 'react-router-dom' // Id URL, chemin, navigation
import { isYoutubeEmbeddable, loadTrailerCandidates } from '../../utils/trailer' // Charge et teste les bandes-annonces

const Player = () => { // Page lecteur vidéo YouTube

  const { id } = useParams(); // Numéro du film/série dans l'URL (ex. 66732)
  const location = useLocation(); // Objet avec pathname complet
  const navigate = useNavigate(); // Fonction pour revenir en arrière

  const mediaTypeHint = location.pathname.startsWith('/player/tv/') // L'URL contient /player/tv/ ?
    ? 'tv' // Alors on sait que c'est une série
    : location.pathname.startsWith('/player/movie/') // Sinon l'URL contient /player/movie/ ?
      ? 'movie' // Alors c'est un film
      : null; // Ancien format /player/:id : type inconnu

  const [apiData, setApiData] = useState({ // Données de la vidéo YouTube choisie
    name: "", // Nom de la vidéo sur TMDB
    key: "", // Clé YouTube (id de la vidéo)
    published_at: "", // Date de publication
    type: "" // Type : Trailer, Teaser...
  })
  const [mediaTitle, setMediaTitle] = useState(""); // Titre du film ou de la série
  const [loading, setLoading] = useState(true); // true pendant le chargement

  useEffect(() => { // S'exécute quand id ou mediaTypeHint change
    let cancelled = false; // true si l'utilisateur quitte la page avant la fin

    const loadTrailer = async () => { // Fonction asynchrone de chargement
      setLoading(true); // Affiche l'état chargement
      setApiData({ name: "", key: "", published_at: "", type: "" }); // Réinitialise la vidéo
      setMediaTitle(""); // Réinitialise le titre

      try { // Bloc sans crash si erreur réseau
        const { candidates, title } = await loadTrailerCandidates(id, mediaTypeHint); // Liste trailers + titre film

        if (cancelled) return; // Page fermée : on arrête
        setMediaTitle(title); // Affiche le titre du média

        let selected = null; // Vidéo finalement choisie

        for (const video of candidates) { // Teste chaque candidat dans l'ordre
          const ok = await isYoutubeEmbeddable(video.key); // Vérifie si YouTube autorise l'intégration
          if (cancelled) return; // Encore parti : stop
          if (ok) { // Vidéo jouable sur le site
            selected = video; // On la retient
            break; // On ne teste pas les suivantes
          }
        }

        if (selected) { // Une vidéo embeddable trouvée
          setApiData(selected); // Affiche celle-ci
        } else if (candidates[0]) { // Sinon on prend la première quand même
          setApiData(candidates[0]); // Peut ne pas marcher mais on essaie
        }
      } catch (err) { // Erreur API ou réseau
        console.error(err); // Log dans la console développeur
      }

      if (!cancelled) setLoading(false); // Fin du chargement si toujours sur la page
    };

    loadTrailer(); // Lance le chargement
    return () => { cancelled = true; }; // Au démontage : annule les mises à jour
  }, [id, mediaTypeHint]) // Dépendances de l'effet

  return ( // Affichage plein écran
    <div className='player'> {/* Fond noir plein écran */}
      <img src={back_arrow_icon} alt="" onClick={() => { navigate(-1) }} /> {/* Clic = page précédente */}
      {loading ? null : apiData.key ? ( // Si chargement fini et clé YouTube existe
        <iframe
          width='90%' // Largeur 90% de l'écran
          height='90%' // Hauteur 90% de l'écran
          src={`https://www.youtube-nocookie.com/embed/${apiData.key}?rel=0&modestbranding=1`} // URL embed sans cookies tracking
          title={apiData.name || 'bande-annonce'} // Titre accessibilité
          frameBorder='0' // Pas de bordure autour
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture' // Permissions navigateur
          allowFullScreen // Bouton plein écran
        />
      ) : (
        <div className="no-video"> {/* Message centré */}
          <h1>La bande-annonce n'est pas encore disponible, elle sera bientôt là</h1> {/* Texte pour l'utilisateur */}
        </div>
      )}
      <div className="player-info"> {/* Bandeau infos en bas */}
        <p>{apiData.published_at ? apiData.published_at.slice(0, 10) : ""}</p> {/* Date (10 premiers caractères) */}
        <p>{mediaTitle || apiData.name || "Titre"}</p> {/* Nom du film */}
        <p>{apiData.type || "Bande-annonce"}</p> {/* Type de vidéo */}
      </div>
    </div>
  )
}

export default Player // Export pour les routes App.jsx
