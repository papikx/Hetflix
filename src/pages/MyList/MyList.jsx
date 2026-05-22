import React, { useEffect, useState } from 'react' // React
import './MyList.css' // Styles page ma liste
import Navbar from '../../components/Navbar/Navbar' // Menu haut
import Footer from '../../components/Footer/Footer' // Pied de page
import { auth, getWatchLater, removeFromWatchLater } from '../../firebase' // Lecture / suppression liste Firebase
import { onAuthStateChanged } from 'firebase/auth' // Écoute si utilisateur connecté
import { Link, useNavigate } from 'react-router-dom' // Liens vers lecteur et redirection login
import { isSafeContent } from '../../utils/contentFilter' // Masque contenus interdits

const MyList = () => { // Page « Ma liste à voir »

    const [watchLaterList, setWatchLaterList] = useState([]); // Tableau des films sauvegardés
    const [userUid, setUserUid] = useState(null); // Id Firebase de l'utilisateur
    const navigate = useNavigate(); // Pour envoyer vers /login si déconnecté

    useEffect(() => { // Au chargement de la page
        const fetchWatchLater = async (uid) => { // Fonction : lit la collection watchLater
            const list = await getWatchLater(uid); // Appel Firebase
            setWatchLaterList(list); // Met à jour l'état React
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => { // Écoute connexion / déconnexion
            if (user) { // Utilisateur connecté
                setUserUid(user.uid); // Enregistre son id
                fetchWatchLater(user.uid); // Charge sa liste
            } else { // Personne connectée
                setUserUid(null); // Efface l'id
                navigate('/login'); // Redirige vers la page de connexion
            }
        });

        return () => unsubscribe(); // Nettoyage : arrête l'écoute à la fermeture
    }, [navigate]); // Relance si navigate change

    const handleRemove = async (e, movieId) => { // Clic sur le bouton ✓ pour retirer
        e.preventDefault(); // N'ouvre pas le lecteur
        e.stopPropagation(); // N'envoie pas le clic au lien parent
        if (!userUid) return; // Sécurité : pas d'id

        await removeFromWatchLater(userUid, movieId); // Supprime dans Firebase
        setWatchLaterList(prev => prev.filter(movie => movie.movieId !== movieId)); // Met à jour l'affichage
    }

    return ( // Affichage page
        <div className='my-list'> {/* Conteneur page */}
            <Navbar /> {/* Barre menu */}
            <div className="my-list-container"> {/* Zone centrale */}
                <h2>Ma Liste à voir</h2> {/* Titre */}
                {watchLaterList.length === 0 ? (
                    <p className="empty-message">Votre liste est vide.</p>
                ) : (
                    <div className="list-grid"> {/* Grille de cartes */}
                        {watchLaterList
                            .filter((movie) => isSafeContent(movie.original_title || '')) // Filtre mots interdits
                            .map((movie, index) => { // Une carte par film
                            return (
                            <Link to={`/player/${movie.mediaType || 'movie'}/${movie.movieId}`} className="list-card" key={index}> {/* Carte cliquable vers bande-annonce */}
                                <img src={`https://image.tmdb.org/t/p/w500/` + movie.backdrop_path} alt="" /> {/* Image du film */}
                                <p>{movie.original_title}</p> {/* Titre sous l'image */}
                                <button
                                    className="remove-btn" // Classe CSS bouton retirer
                                    onClick={(e) => handleRemove(e, movie.movieId)} // Clic retire de la liste
                                >
                                    ✓ {/* Symbole : déjà dans la liste, clic = retirer */}
                                </button>
                            </Link>
                        )})} {/* Fin map */}
                    </div>
                )}
            </div>
            <Footer /> {/* Pied de page */}
        </div>
    )
}

export default MyList // Export pour App.jsx
