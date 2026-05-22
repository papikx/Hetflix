import { useEffect } from 'react'; // Hook exécuté au chargement
import { useNavigate, useLocation } from 'react-router-dom'; // URL et navigation
import { onAuthStateChanged } from 'firebase/auth'; // Écoute connexion Firebase
import { auth } from '../config/firebase'; // Objet auth

export const useAuthGuard = () => { // Protège les pages selon connexion
  const navigate = useNavigate(); // Changer de page
  const location = useLocation(); // Page actuelle

  useEffect(() => { // Au montage et changement d'URL
    const unsubscribe = onAuthStateChanged(auth, (user) => { // Quand état auth change
      const path = location.pathname; // Chemin actuel ex: /login
      const isAdminRoute = path.startsWith('/admin'); // Sur page admin ?
      const isAdminSession = sessionStorage.getItem('isAdmin') === 'true'; // Admin papik connecté ?

      if (isAdminRoute && isAdminSession) return; // Admin OK : ne rien faire

      if (user) { // Utilisateur Firebase connecté
        if (path === '/login') navigate('/'); // Quitte page login vers accueil
      } else { // Personne connectée
        if (isAdminRoute) { // Admin sans session
          sessionStorage.removeItem('isAdmin'); // Efface faux admin
          navigate('/login'); // Vers login
          return; // Stop
        }
        if (path !== '/login') navigate('/login'); // Autres pages -> login
      }
    });

    return () => unsubscribe(); // Nettoyage à la fin
  }, [navigate, location.pathname]); // Dépendances
};
