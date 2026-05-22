const ADMIN_USERNAME = 'papik'; // Seul login admin autorisé

const hashPassword = async (password) => { // Transforme le mot de passe en hash secret
  const data = new TextEncoder().encode(password); // Encode le texte
  const hashBuffer = await crypto.subtle.digest('SHA-256', data); // Calcul SHA-256
  return Array.from(new Uint8Array(hashBuffer)) // Convertit en tableau
    .map((b) => b.toString(16).padStart(2, '0')) // Chaque byte en hexadécimal
    .join(''); // Joint en une chaîne
};

export const verifyAdminLogin = async (username, password) => { // Vérifie login admin
  const expectedHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH; // Hash attendu depuis .env
  if (!expectedHash) return false; // Pas de hash configuré = refus

  const user = username.trim().toLowerCase(); // Login nettoyé
  if (user !== ADMIN_USERNAME) return false; // Mauvais nom

  const inputHash = await hashPassword(password); // Hash du mot de passe tapé
  return inputHash === expectedHash; // true si identique
};
