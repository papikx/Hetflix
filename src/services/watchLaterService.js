import { addDoc, collection, deleteDoc, getDocs, query, where } from 'firebase/firestore'; // Outils Firestore
import { toast } from 'react-toastify'; // Notifications
import { db } from '../config/firebase'; // Base

export const addToWatchLater = async (uid, movie) => { // Ajoute à la liste
  try {
    const mediaType = movie.mediaType // Type film ou série
      || (movie.first_air_date && !movie.release_date ? 'tv' : 'movie'); // Devine si série
    await addDoc(collection(db, 'watchLater'), { // Nouveau document
      uid, // Id utilisateur
      movieId: movie.tmdbId || movie.id, // Id du film
      mediaType, // movie ou tv
      backdrop_path: movie.backdrop_path || '', // Image fond
      original_title: movie.title || movie.name || movie.original_title || movie.original_name || '', // Titre
      timestamp: new Date(), // Date d'ajout
    });
    toast.success('Ajouté à la liste à voir'); // Succès
  } catch (error) {
    console.error(error);
    toast.error("Erreur lors de l'ajout");
  }
};

export const removeFromWatchLater = async (uid, movieId) => { // Retire de la liste
  try {
    const q = query( // Requête
      collection(db, 'watchLater'), // Collection liste
      where('uid', '==', uid), // Pour cet utilisateur
      where('movieId', '==', movieId), // Ce film
    );
    const querySnapshot = await getDocs(q); // Récupère documents
    querySnapshot.forEach(async (docRef) => { // Pour chaque trouvé
      await deleteDoc(docRef.ref); // Supprime
    });
    toast.success('Retiré de la liste à voir');
  } catch (error) {
    console.error(error);
    toast.error('Erreur lors de la suppression');
  }
};

export const getWatchLater = async (uid) => { // Lit toute la liste
  try {
    const q = query(collection(db, 'watchLater'), where('uid', '==', uid)); // Filtre par user
    const querySnapshot = await getDocs(q); // Exécute
    const list = []; // Tableau vide
    querySnapshot.forEach((docSnap) => { // Chaque document
      list.push(docSnap.data()); // Ajoute données
    });
    return list; // Retourne liste
  } catch (error) {
    console.error('Erreur de chargement watchLater:', error);
    return []; // Liste vide si erreur
  }
};
