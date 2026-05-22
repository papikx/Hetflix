import { TMDB_OPTIONS, TMDB_BASE_URL } from '../config/tmdb'; // Config TMDB

export { TMDB_OPTIONS }; // Réexport pour autres fichiers

const VIDEO_TYPES = ['Trailer', 'Teaser']; // Types vidéo acceptés
const EXCLUDE_NAME = /recap|récap|review|critique|reaction|réaction|analysis|analyse|explained|explique|curiosit|blooper|gag reel|deleted scene|scène coupée|best scenes|meilleures scènes|vs\.|comparison|comparaison|episode \d|épisode \d|season \d|saison \d/i; // Titres à ignorer

export const inferMediaType = (card, listType, category) => { // Film ou série ?
  if (card.isAdminMovie) return card.type === 'tv' ? 'tv' : 'movie'; // Film ajouté par admin
  if (card.media_type === 'tv' || card.media_type === 'movie') return card.media_type; // TMDB le dit
  if (listType === 'tv' || listType === 'discover_tv' || listType === 'discover_language_tv') return 'tv'; // Page séries
  if (listType === 'trending' && typeof category === 'string' && category.startsWith('tv')) return 'tv'; // Tendance séries
  if (listType === 'trending' && typeof category === 'string' && category.startsWith('movie')) return 'movie'; // Tendance films
  if (card.first_air_date && !card.release_date) return 'tv'; // Date série
  if (card.name && !card.title) return 'tv'; // Nom sans titre = souvent série
  return 'movie'; // Par défaut film
};

export const getTmdbId = (card) => { // Numéro TMDB de la carte
  if (card.isAdminMovie) return card.tmdbId || null; // Admin : champ tmdbId
  return card.id; // TMDB normal : id
};

export const getPlayerPath = (card, listType, category) => { // Lien vers lecteur
  const id = getTmdbId(card); // Récupère id
  if (!id || (card.isAdminMovie && !/^\d+$/.test(String(id)))) return null; // Pas d'id valide
  const mediaType = inferMediaType(card, listType, category); // movie ou tv
  return `/player/${mediaType}/${id}`; // URL finale
};

const trailerScore = (name = '', title = '') => { // Note qualité du nom de vidéo
  const n = name.toLowerCase(); // Minuscules
  let score = 0; // Score initial
  if (n.includes('official trailer') || n.includes('bande-annonce officielle') || n.includes('bande annonce officielle')) score += 12; // Officielle
  else if (n.includes('trailer') || n.includes('bande-annonce') || n.includes('bande annonce')) score += 8; // Trailer
  else if (n.includes('teaser')) score += 5; // Teaser

  if (title) { // Si on a le titre du film
    const words = title.toLowerCase().split(/[\s:–-]+/).filter(w => w.length > 3); // Mots longs
    if (words.some(w => n.includes(w))) score += 6; // Bonus si titre dans nom vidéo
  }
  return score; // Retourne note
};

export const rankVideos = (videos, title = '') => { // Trie les vidéos
  if (!videos?.length) return []; // Vide

  return videos
    .filter(v => v.site === 'YouTube' && v.key && !EXCLUDE_NAME.test(v.name || '')) // YouTube valide
    .filter(v => VIDEO_TYPES.includes(v.type)) // Trailer ou teaser
    .sort((a, b) => { // Tri
      if (a.official !== b.official) return (b.official ? 1 : 0) - (a.official ? 1 : 0); // Officiel d'abord
      const typeOrder = VIDEO_TYPES.indexOf(a.type) - VIDEO_TYPES.indexOf(b.type); // Type
      if (typeOrder !== 0) return typeOrder;
      return trailerScore(b.name, title) - trailerScore(a.name, title); // Meilleur score
    });
};

export const fetchVideos = async (mediaType, id, language) => { // Liste vidéos TMDB
  const res = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${id}/videos?language=${language}`,
    TMDB_OPTIONS
  );
  if (!res.ok) return []; // Erreur HTTP
  const data = await res.json(); // JSON
  return data.results || []; // Tableau vidéos
};

export const fetchMediaTitle = async (mediaType, id) => { // Titre du film
  const res = await fetch(
    `${TMDB_BASE_URL}/${mediaType}/${id}?language=fr-FR`,
    TMDB_OPTIONS
  );
  if (!res.ok) return '';
  const data = await res.json();
  return data.title || data.name || '';
};

export const resolveMediaType = async (id, hint) => { // Trouve movie ou tv pour un id
  if (hint === 'movie' || hint === 'tv') return hint; // Déjà dans l'URL

  const [movieRes, tvRes] = await Promise.all([
    fetch(`${TMDB_BASE_URL}/movie/${id}?language=fr-FR`, TMDB_OPTIONS),
    fetch(`${TMDB_BASE_URL}/tv/${id}?language=fr-FR`, TMDB_OPTIONS),
  ]);

  const movieOk = movieRes.ok;
  const tvOk = tvRes.ok;

  if (movieOk && !tvOk) return 'movie';
  if (tvOk && !movieOk) return 'tv';
  if (!movieOk && !tvOk) return null;

  const [movieVideos, tvVideos] = await Promise.all([
    fetchVideos('movie', id, 'en-US'),
    fetchVideos('tv', id, 'en-US'),
  ]);

  const movieTrailers = rankVideos(movieVideos).length;
  const tvTrailers = rankVideos(tvVideos).length;

  if (tvTrailers > movieTrailers) return 'tv';
  if (movieTrailers > tvTrailers) return 'movie';
  return 'movie';
};

export const isYoutubeEmbeddable = async (key) => { // La vidéo marche sur le site ?
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${key}&format=json`
    );
    return res.ok;
  } catch {
    return false;
  }
};

export const loadTrailerCandidates = async (id, mediaTypeHint) => { // Prépare bandes-annonces
  const mediaType = await resolveMediaType(id, mediaTypeHint);
  if (!mediaType) return { mediaType: null, candidates: [], title: '' };

  const title = await fetchMediaTitle(mediaType, id);
  const languages = ['fr-FR', 'en-US'];
  const seen = new Set();
  const candidates = [];

  for (const lang of languages) {
    const videos = await fetchVideos(mediaType, id, lang);
    for (const video of rankVideos(videos, title)) {
      if (!seen.has(video.key)) {
        seen.add(video.key);
        candidates.push(video);
      }
    }
  }

  return { mediaType, candidates, title };
};
