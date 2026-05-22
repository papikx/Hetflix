import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from 'firebase/auth'; // Fonctions Firebase auth
import { addDoc, collection } from 'firebase/firestore'; // Écrire dans Firestore
import { toast } from 'react-toastify'; // Messages
import { auth, db } from '../config/firebase'; // Connexions
import { verifyAdminLogin } from '../utils/adminAuth'; // Vérif admin papik

export const signup = async (name, email, password) => { // Inscription
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password); // Crée compte
    const user = res.user; // Objet utilisateur
    await addDoc(collection(db, 'user'), { // Enregistre dans collection user
      uid: user.uid, // Id unique Firebase
      name, // Nom affiché
      authProvider: 'local', // Connexion par email
      email, // Email
    });
    await sendEmailVerification(user); // Envoie mail de confirmation
    await signOut(auth); // Déconnecte jusqu'à validation email
    toast.success('Compte créé ! Vérifiez votre email pour activer votre compte.'); // Message vert
    return { needsVerification: true }; // Indique qu'il faut valider email
  } catch (error) {
    console.log(error); // Log erreur console
    toast.error(error.code.split('/')[1].split('-').join(' ')); // Message erreur lisible
  }
};

export const login = async (email, password) => { // Connexion utilisateur
  try {
    const res = await signInWithEmailAndPassword(auth, email, password); // Essaie connexion
    if (!res.user.emailVerified) { // Email pas encore validé
      await signOut(auth); // Déconnecte
      toast.error('Email non vérifié. Consultez votre boîte mail.'); // Avertissement
      return { success: false, needsVerification: true }; // Échec partiel
    }
    return { success: true }; // Connexion OK
  } catch (error) {
    console.log(error);
    toast.error(error.code.split('/')[1].split('-').join(' '));
    return { success: false }; // Échec
  }
};

export const loginAdmin = async (username, password) => { // Connexion panneau admin
  const valid = await verifyAdminLogin(username, password); // Vérifie papik + hash
  if (valid) return { success: true }; // OK
  toast.error('Identifiants incorrects'); // Mauvais identifiants
  return { success: false };
};

export const logout = () => { // Déconnexion
  signOut(auth); // Déconnecte Firebase
};
