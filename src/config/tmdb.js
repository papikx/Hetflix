export const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY // Clé depuis .env
  || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2MDU1ODI5MmFjYjRiZDMxNTdiNGM1YzI1Y2QzZTQxMCIsIm5iZiI6MTc3NDk1OTQ4OC4xNzYsInN1YiI6IjY5Y2JiYjgwNDc5YjJkNzUwYWI4MzI3NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.ORw0PPqAyIhbBUlX6zTSA8GQ-2imbcoG67TqPMF_XSI'; // Sinon clé par défaut

export const TMDB_OPTIONS = { // Options pour chaque requête fetch
  method: 'GET', // Méthode lecture seule
  headers: { // En-têtes HTTP
    accept: 'application/json', // On veut du JSON
    Authorization: `Bearer ${TMDB_API_KEY}`, // Token d'accès
  },
};

export const TMDB_BASE_URL = 'https://api.themoviedb.org/3'; // Adresse de base TMDB
