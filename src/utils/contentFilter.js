import { CONTENT_BLACKLIST } from '../constants/contentBlacklist'; // Liste mots interdits

export const isSafeContent = (title = '', overview = '') => { // Vérifie si on peut montrer le film
  const t = title.toLowerCase(); // Titre en minuscules
  const o = overview.toLowerCase(); // Description en minuscules
  return !CONTENT_BLACKLIST.some((word) => t.includes(word) || o.includes(word)); // true si aucun mot interdit
};
