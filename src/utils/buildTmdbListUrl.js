import { TMDB_BASE_URL } from '../config/tmdb'; // Adresse TMDB

export const buildTmdbListUrl = (type, category) => { // Construit l'URL pour une rangée de films
  const currentCategory = category || 'now_playing'; // Catégorie par défaut

  if (type === 'trending') { // Page tendances
    return `${TMDB_BASE_URL}/trending/${currentCategory}?include_adult=false`; // URL tendances
  }
  if (type === 'discover') { // Découverte films par genre
    return `${TMDB_BASE_URL}/discover/movie?with_genres=${currentCategory}&include_adult=false`;
  }
  if (type === 'discover_tv') { // Découverte séries par genre
    return `${TMDB_BASE_URL}/discover/tv?with_genres=${currentCategory}&include_adult=false`;
  }
  if (type === 'discover_language') { // Films par langue
    return `${TMDB_BASE_URL}/discover/movie?with_original_language=${currentCategory}&include_adult=false`;
  }
  if (type === 'discover_language_tv') { // Séries par langue
    return `${TMDB_BASE_URL}/discover/tv?with_original_language=${currentCategory}&include_adult=false`;
  }

  const mediaType = type || 'movie'; // Sinon film ou série simple
  return `${TMDB_BASE_URL}/${mediaType}/${currentCategory}?include_adult=false`; // URL standard
};
