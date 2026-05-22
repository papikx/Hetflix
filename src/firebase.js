export { auth, db } from './config/firebase'; // Réexporte auth et base
export { login, loginAdmin, signup, logout } from './services/authService'; // Réexporte connexion
export { addToWatchLater, removeFromWatchLater, getWatchLater } from './services/watchLaterService'; // Réexporte liste
