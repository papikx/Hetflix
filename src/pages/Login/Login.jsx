import React, { useState } from 'react' // React + variables qui changent
import './Login.css' // Styles page login
import logo from '../../assets/logo.png' // Logo Hetflix
import { login, loginAdmin, signup, auth } from '../../firebase' // Connexion / inscription / admin
import { toast } from 'react-toastify' // Messages popup
import { sendEmailVerification } from 'firebase/auth' // Renvoyer email de vérification
import hetflix_spinner from '../../assets/hetflix_spinner.gif' // Image de chargement
import { useNavigate } from 'react-router-dom' // Changer de page

const Login = () => { // Page login complète

  const [signState, setSignState] = useState("Se connecter"); // Mode connexion ou inscription
  const [name, setName] = useState(""); // Champ nom (inscription)
  const [email, setEmail] = useState(""); // Champ email
  const [password, setPassword] = useState(""); // Champ mot de passe
  const [loading, setLoading] = useState(false); // Chargement en cours ?
  const [verificationSent, setVerificationSent] = useState(false); // Bannière email envoyé ?
  const [rememberMe, setRememberMe] = useState(true); // Se souvenir de moi


  const [showAdminModal, setShowAdminModal] = useState(false); // Fenêtre admin visible ?
  const [adminUser, setAdminUser] = useState(""); // Login admin tapé
  const [adminPass, setAdminPass] = useState(""); // Mot de passe admin tapé

  const navigate = useNavigate(); // Aller à une autre page

  const user_auth = async (event) => { // Clic bouton Se connecter / S'inscrire
    event.preventDefault(); // Pas de rechargement page
    setLoading(true); // Affiche spinner
    if (signState === "Se connecter") { // Mode connexion
      const result = await login(email, password, rememberMe); // Appel Firebase login
      if (result?.needsVerification) setVerificationSent(true); // Email non validé
      else if (result?.success) navigate('/'); // Succès -> accueil
    } else { // Mode inscription
      const result = await signup(name, email, password); // Crée compte
      if (result?.needsVerification) setVerificationSent(true); // Doit valider email
    }
    setLoading(false); // Fin chargement
  }

  const resendVerification = async () => { // Renvoyer email (optionnel)
    if (auth.currentUser) { // Si utilisateur connecté
      await sendEmailVerification(auth.currentUser); // Renvoie mail
    }
    toast.info("Connectez-vous d'abord pour renvoyer l'email."); // Sinon message
  }

  const handleAdminSubmit = async (e) => { // Formulaire admin
    e.preventDefault(); // Pas reload
    setLoading(true); // Spinner
    const result = await loginAdmin(adminUser, adminPass); // Vérifie papik + hash .env
    if (result.success) { // Si OK
      sessionStorage.setItem('isAdmin', 'true'); // Marque admin dans le navigateur
      setShowAdminModal(false); // Ferme fenêtre
      navigate('/admin'); // Va page admin
    }
    setLoading(false); // Fin spinner
  }

  return ( // Affichage
    loading? <div className="login-spinner"> {/* Si chargement : spinner */}
      <img key={Date.now()} src={hetflix_spinner} alt="" /> {/* Image animée (key force rechargement) */}
    </div>:
    <div className='login'> {/* Sinon page login */}
      <div className="admin-access" onClick={() => setShowAdminModal(true)}>Admin</div> {/* Bouton ouvrir admin */}

      {verificationSent && (
        <div className="verification-banner"> {/* Bannière jaune : email de vérification envoyé */}
          Un email de vérification a été envoyé. Vérifiez votre boîte mail avant de vous connecter.
        </div>
      )}

      {showAdminModal && (
        <div className="admin-modal-overlay"> {/* Fond sombre : fenêtre admin ouverte */}
          <div className="admin-modal"> {/* Boîte blanche centrée */}
            <h2>Connexion Admin</h2> {/* Titre */}
            <form onSubmit={handleAdminSubmit}> {/* Formulaire envoi handleAdminSubmit */}
              <input
                type="text" // Champ texte identifiant
                placeholder="Identifiant" // Texte gris dans le champ
                value={adminUser} // Valeur liée à React
                onChange={(e) => setAdminUser(e.target.value)} // Met à jour adminUser à chaque frappe
                autoComplete="username" // Aide navigateur à remplir
                required // Obligatoire pour envoyer
              /> {/* Champ identifiant admin */}
              <input
                type="password" // Masque les caractères
                placeholder="Mot de passe" // Texte gris
                value={adminPass} // Valeur liée
                onChange={(e) => setAdminPass(e.target.value)} // Met à jour adminPass
                required // Obligatoire
              /> {/* Champ mot de passe admin */}
              <div className="admin-modal-btns"> {/* Ligne des boutons */}
                <button type="button" className="cancel-btn" onClick={() => setShowAdminModal(false)}>Annuler</button> {/* Ferme sans connexion */}
                <button type="submit" className="login-btn">Entrer</button> {/* Valide et appelle handleAdminSubmit */}
              </div>
            </form>
          </div>
        </div>
      )}

      <img src={logo} className='login-logo' alt="" /> {/* Logo grand en haut */}
      <div className="login-form"> {/* Formulaire principal utilisateur */}
        <h1>{signState}</h1> {/* Titre dynamique connexion ou inscription */}
        <form onSubmit={user_auth}> {/* Formulaire avec envoi automatique pour sauvegarder le mot de passe */}
          {signState === "S'inscrire" ?
            <input value={name} onChange={(e) => { setName(e.target.value) }} type="text" name="name" placeholder='Votre nom' autoComplete='name' /> : <></>} {/* name="name" et autoComplete pour l'auto-remplissage */}
          <input value={email} onChange={(e) => { setEmail(e.target.value) }} type="email" name="email" placeholder='Email' autoComplete='email' /> {/* name="email" aide le navigateur à reconnaître le champ */}
          <input value={password} onChange={(e) => { setPassword(e.target.value) }} type="password" name="password" placeholder='Mot de passe' autoComplete={signState === "S'inscrire" ? 'new-password' : 'current-password'} /> {/* name="password" pour que Chrome propose de sauvegarder */}
          <button type='submit'>{signState}</button> {/* Bouton type submit obligatoire pour l'auto-complétion */}
          <div className="form-help"> {/* Zone aide sous le formulaire */}
            <div className="remember"> {/* Case à cocher */}
              <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> {/* Checkbox HTML */}
              <label htmlFor="rememberMe">Se souvenir de moi</label> {/* Texte à côté */}
            </div>
            <p><a href="https://github.com/papikx" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none', color: 'inherit'}}>Besoin d'aide?</a></p> {/* Lien GitHub */}
          </div>
        </form>
        <div className="form-switch"> {/* Basculer connexion <-> inscription */}
          {signState === "Se connecter" ? (
            <p>Vous découvrez Hetflix ? <span onClick={() => { setSignState("S'inscrire") }}>Inscrivez-vous dès maintenant</span></p>
          ) : (
            <p>Vous avez déjà un compte ? <span onClick={() => { setSignState("Se connecter") }}>Connectez-vous maintenant</span></p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login // Export pour App.jsx
