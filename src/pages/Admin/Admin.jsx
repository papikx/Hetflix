import React, { useState, useEffect } from 'react' // React : bibliothèque pour construire la page
import './Admin.css' // Styles visuels de la page admin
import { db } from '../../config/firebase' // Connexion à la base de données
import { TMDB_OPTIONS, TMDB_BASE_URL } from '../../config/tmdb' // Paramètres pour l'API des films TMDB
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore' // Outils Firestore : lire, ajouter, supprimer
import { useNavigate } from 'react-router-dom' // Changer de page (ex. aller au login)
import { toast } from 'react-toastify' // Petits messages à l'écran (succès / erreur)
import logo from '../../assets/logo.png' // Image du logo

const Admin = () => { // Fonction qui dessine toute la page admin
  const [movies, setMovies] = useState([]); // Liste des films déjà enregistrés
  const [title, setTitle] = useState(""); // Texte du champ titre
  const [description, setDescription] = useState(""); // Texte du champ description
  const [imageUrl, setImageUrl] = useState(""); // Lien de l'image
  const [type, setType] = useState("movie"); // Film ou série TV
  const [category, setCategory] = useState("popular"); // Où le film apparaît sur le site
  const [tmdbId, setTmdbId] = useState(""); // Numéro TMDB du film
  const [searchResults, setSearchResults] = useState([]); // Résultats de recherche TMDB
  const navigate = useNavigate(); // Fonction de navigation

  useEffect(() => { // Code exécuté à l'ouverture de la page
    const isAdmin = sessionStorage.getItem('isAdmin'); // Lit si l'admin est connecté (mémoire du navigateur)
    if (isAdmin !== 'true') { navigate('/login'); return; } // Sinon redirection vers login et arrêt

    const q = query(collection(db, "admin_movies"), orderBy("createdAt", "desc")); // Requête : films admin, plus récents d'abord
    const unsubscribe = onSnapshot(q, (snapshot) => { // Écoute en temps réel les changements Firebase
      setMovies(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); // Met à jour la liste affichée
    });
    return () => unsubscribe(); // À la fermeture de la page : arrête l'écoute
  }, [navigate]); // Relance si navigate change

  const searchTMDB = async () => { // Cherche un film sur TMDB par le titre
    if (!title) return; // Rien à chercher si titre vide
    try { // Essaie la requête réseau
      const res = await fetch(`${TMDB_BASE_URL}/search/${type}?query=${title}&language=fr-FR&include_adult=false`, TMDB_OPTIONS); // Appel API TMDB
      const data = await res.json(); // Convertit la réponse en données utilisables
      setSearchResults(data.results.slice(0, 5)); // Garde 5 résultats maximum
    } catch (error) { // Si erreur réseau ou API
      toast.error("Erreur de recherche TMDB"); // Message d'erreur
    }
  }

  const selectMovie = (movie) => { // Clic sur un résultat de recherche
    setTitle(movie.title || movie.name); // Remplit le titre
    setDescription(movie.overview); // Remplit la description
    setImageUrl(`https://image.tmdb.org/t/p/original${movie.backdrop_path}`); // Remplit l'URL de l'image
    setTmdbId(movie.id.toString()); // Remplit l'id TMDB
    setSearchResults([]); // Cache la liste de résultats
    toast.info("Infos récupérées !"); // Message de confirmation
  }

  const handleAddMovie = async (e) => { // Envoi du formulaire d'ajout
    e.preventDefault(); // Empêche le rechargement de la page
    if (!title || !description || !imageUrl) return; // Champs obligatoires manquants

    try { // Tentative d'enregistrement
      await addDoc(collection(db, "admin_movies"), { // Nouveau document dans Firebase
        title, // Titre enregistré
        description, // Description enregistrée
        imageUrl, // Image enregistrée
        type, // Type film ou série
        category, // Catégorie sur le site
        tmdbId: tmdbId || Date.now().toString(), // Id TMDB ou id temporaire
        createdAt: new Date() // Date de création
      });
      setTitle(""); setDescription(""); setImageUrl(""); setTmdbId(""); // Vide le formulaire
      toast.success("Film ajouté !"); // Succès
    } catch (error) { // Erreur Firebase
      toast.error("Erreur"); // Message d'erreur
    }
  }

  return ( // Début de ce qui s'affiche à l'écran
    <div className='admin-panel'> {/* Boîte principale de la page */}
      <div className="admin-nav"> {/* Barre du haut */}
        <img src={logo} alt="Logo" onClick={() => navigate('/')} style={{cursor: 'pointer'}} /> {/* Logo : clic = accueil */}
        <h1>Panel Admin - Hetflix</h1> {/* Titre de la page */}
        <button className='logout-btn' onClick={() => {sessionStorage.removeItem('isAdmin'); navigate('/login')}}>Quitter</button> {/* Déconnexion admin */}
      </div>

      <div className="admin-container"> {/* Zone centrale en deux colonnes */}
        <div className="add-movie-section"> {/* Colonne gauche : ajouter */}
          <h2>Ajouter un nouveau contenu</h2> {/* Titre de section */}
          <div className="search-box"> {/* Zone recherche TMDB */}
             <input type="text" placeholder="Titre (commencez à taper ici)" value={title} onChange={(e) => setTitle(e.target.value)} /> {/* Champ titre */}
             <button type="button" className="search-tmdb-btn" onClick={searchTMDB}>Chercher sur TMDB</button> {/* Lance searchTMDB */}
          </div>

          {searchResults.length > 0 && (
            <div className="tmdb-results"> {/* Liste des résultats */}
              {searchResults.map(m => ( // Pour chaque film trouvé
                <div key={m.id} className="tmdb-item" onClick={() => selectMovie(m)}> {/* Ligne cliquable */}
                  <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" /> {/* Mini affiche */}
                  <div> {/* Texte à côté */}
                    <p><strong>{m.title || m.name}</strong></p> {/* Nom du film */}
                    <p>{m.release_date || m.first_air_date}</p> {/* Date */}
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleAddMovie}> {/* Formulaire d'ajout */}
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)}></textarea> {/* Zone description */}
            <input type="text" placeholder="URL Image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} /> {/* Champ URL image */}

            <div className="select-group"> {/* Menus déroulants */}
                <label>Type:</label> {/* Étiquette type */}
                <select value={type} onChange={(e) => setType(e.target.value)}> {/* Choix film ou série */}
                    <option value="movie">Film</option> {/* Option film */}
                    <option value="tv">Série TV</option> {/* Option série */}
                </select>
                <label>Catégorie:</label> {/* Étiquette catégorie */}
                <select value={category} onChange={(e) => setCategory(e.target.value)}> {/* Choix de la rangée sur le site */}
                    <option value="popular">Populaire</option> {/* Rangée populaire */}
                    <option value="top_rated">Films à succès</option> {/* Top rated */}
                    <option value="upcoming">À venir</option> {/* Prochainement */}
                    <option value="now_playing">En salle</option> {/* En salle */}
                    <option value="hetflix">Uniquement sur Hetflix</option> {/* Catégorie custom */}
                </select>
            </div>
            <button type="submit" className="main-add-btn">Ajouter au catalogue</button> {/* Envoie le formulaire */}
          </form>
        </div>

        <div className="manage-movies-section"> {/* Colonne droite : gérer */}
          <h2>Gestion</h2> {/* Titre */}
          <div className="movies-grid"> {/* Grille de cartes */}
            {movies.map((movie) => ( // Pour chaque film en base
              <div key={movie.id} className="admin-movie-card"> {/* Une carte */}
                <img src={movie.imageUrl} alt="" /> {/* Image du film */}
                <div className="admin-movie-info"> {/* Infos sous l'image */}
                  <h3>{movie.title}</h3> {/* Titre */}
                  <p>TMDB: {movie.tmdbId || 'Aucun'}</p> {/* Id TMDB */}
                  <button onClick={async () => { await deleteDoc(doc(db, "admin_movies", movie.id)); toast.success("Supprimé"); }}>Supprimer</button> {/* Supprime de Firebase */}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin; // Export pour App.jsx
