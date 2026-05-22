export const CONTENT_BLACKLIST = [ // Tableau de mots : si présents, on cache le film
  'sex', 'sexe', 'sexual', 'sexuel', 'sexuelle', 'porn', 'porno', 'pornographic', 'pornographique', // Mots liés au contenu adulte
  'erotic', 'erotica', 'érotique', 'erotique', 'erotisme', 'érotisme', 'sensual', 'sensuel', 'sensuelle', 'sensualité', // Érotique
  'affair', 'liaison', 'infidelity', 'infidélité', 'wife\'s friend', 'my wife\'s', 'forbidden love', 'forbidden desire', // Adultère etc.
  'nude', 'nudity', 'nudité', 'naked', 'nu ', ' nus ', // Nudité
  'lust', 'orgasm', 'orgasme', 'desire', 'désir', 'kama sutra', 'kamasutra', // Désir explicite
  'fifty shades', '50 shades', 'nuances de gris', 'cinquante nuances', '365 days', '365 jours', '365 dni', 'scarlet innocence', 'an affair', // Films connus 18+
  'nymphomaniac', 'nympho', 'nymphomane', 'prostitute', 'prostituée', 'escort', 'striptease', 'strip-tease', 'swinger', 'échangisme', 'bordel', 'brothel', 'adultery', 'adultère', // Autres thèmes adultes
  'overflow', 'female teacher punisher', 'goddess of hell', 'hentai', 'ecchi', 'bondage', 'sadomasochism', 'sadomasochisme', 'sado-maso', // Anime / contenu explicite
  'prison', 'zero woman', 'magistrate woman', // Liste initiale du projet
];
