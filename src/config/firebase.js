import { initializeApp } from 'firebase/app'; // Démarre Firebase
import { getAuth } from 'firebase/auth'; // Module connexion utilisateurs
import { getFirestore } from 'firebase/firestore'; // Module base de données

const firebaseConfig = { // Identifiants du projet Firebase
  apiKey: 'AIzaSyBqYo0dihL87UG8GE1RAsP9rPMRyJnNYVY', // Clé API
  authDomain: 'hetflix-58e59.firebaseapp.com', // Domaine auth
  projectId: 'hetflix-58e59', // Id projet
  storageBucket: 'hetflix-58e59.firebasestorage.app', // Stockage
  messagingSenderId: '585376623670', // Id messages
  appId: '1:585376623670:web:4a24e21a4db233431bfc97', // Id application
};

const app = initializeApp(firebaseConfig); // Crée l'app Firebase
export const auth = getAuth(app); // Objet pour login/logout
export const db = getFirestore(app); // Objet pour la base
