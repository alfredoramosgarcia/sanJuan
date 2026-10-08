// Plataforma del artista verificada: Apple Music Hewlar. Spotify: búsquedas específicas,
// pendientes de sustituir por enlaces definitivos open.spotify.com/album|track.
export const PLATFORM_CONFIG = {
	spotify: 'https://open.spotify.com/search/HEWLAR%20SAN%20JUAN',
	appleMusic: 'https://music.apple.com/us/artist/hewlar/1552792765',
	youtube: 'https://www.youtube.com/results?search_query=HEWLAR+SAN+JUAN',
};
export const PLATFORM_LABELS = { spotify: 'Spotify', appleMusic: 'Apple Music', youtube: 'YouTube' };
export const EXACT_TRACK_NAMES = [
	'11', 'La vida bonita', 'FOCUS', 'MODOAVIÓN ft Insert Soul', 'santamaria.zip',
	'IGOTINMAPOCKET$$$$', 'volando bajito', 'MONEY BACK ft Guilty Asko',
	'NONSTOP', 'Mi gente ft SENI', 'San Juan'
];
// Solamente se muestran lanzamientos acreditados a Hewlar fuera del álbum.
// youtubeUrl es una búsqueda real y marcada como tal hasta disponer de IDs oficiales.
export const LATEST_RELEASES = [
	{ title: 'Mi jenny from the block', artist: 'Tousi · ft. Hewlar', cover: '/assets/releases/mijennyfromtheblocks.jpeg', year: '2026', type: 'Colaboración', youtubeUrl: 'https://youtu.be/y7xhrOd7G6c?si=XIX8gggP3849S7Ra', spotifyUrl: 'https://open.spotify.com/intl-es/track/0eM06ZJLbTtqqNXiKNxr6H?si=eb373c7e3af548e9', tone: 'blue' },
	{ title: 'TAN FRÍO', artist: 'Hewlar · JNull', cover: '/assets/releases/TANFRIO.jpg', year: '21 NOV 2025', type: 'Single', youtubeUrl: 'https://youtu.be/Wfub0vis93c?si=fJykP6Lw1Upd5HTq', spotifyUrl: 'https://open.spotify.com/intl-es/track/3XblcgjGIdAi2uDeD6bgyW?si=5908bdaa345249da', tone: 'orange' },
	{ title: 'no estoy hecho pa las malas', artist: 'Hewlar · JNull', cover: '/assets/releases/noestoyhechopalasmalas.jpeg', year: '12 SEP 2025', type: 'Single', youtubeUrl: 'https://youtu.be/jk9rr56MNo0?si=5bHQRebXVaUddCE9', spotifyUrl: 'https://open.spotify.com/intl-es/track/7HcyhOgqZt9G9KXWymzpit?si=9ba3707c1ec14493', tone: 'sand' },
];
