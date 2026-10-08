import { PLATFORM_CONFIG, PLATFORM_LABELS, EXACT_TRACK_NAMES, LATEST_RELEASES } from './config.js';
import { AlbumArtwork } from './components/album-artwork.js';
import { AudioPlayerController } from './audio-player.js';

const state = {
	tracks: [],
	activeTrack: null,
};

const els = {};
let player;

function qs(selector, scope = document) {
	return scope.querySelector(selector);
}

function qsa(selector, scope = document) {
	return [...scope.querySelectorAll(selector)];
}

function createEl(tag, className, text) {
	const el = document.createElement(tag);
	if (className) el.className = className;
	if (text !== undefined) el.textContent = text;
	return el;
}

function formatTime(seconds) {
	if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
	return `${mins}:${secs}`;
}

function getYouTubeId(url) {
	if (!url) return null;
	try {
		const parsed = new URL(url);
		if (parsed.hostname.includes('youtu.be')) return parsed.pathname.replace('/', '') || null;
		return parsed.searchParams.get('v');
	} catch {
		return null;
	}
}

function normalizeTrack(track) {
	return {
		...track,
		number: Number(track.number),
		name: EXACT_TRACK_NAMES[Number(track.number) - 1] || track.name,
		audio: track.audio || null,
		url: track.url || null,
		spotifySearch: track.spotifySearch || null,
	};
}

function renderArtwork() {
	['hero-artwork', 'music-artwork'].forEach((id, index) => {
		const mount = document.getElementById(id);
		if (mount) mount.replaceChildren(AlbumArtwork({ size: index === 0 ? 'hero' : 'large' }));
	});
}

function renderPlatformActions() {
	els.heroPlatformActions.replaceChildren();
	Object.entries(PLATFORM_CONFIG).forEach(([key, url]) => {
		if (url) {
			const link = createEl('a', 'platform-button', PLATFORM_LABELS[key]);
			link.href = url;
			link.target = '_blank';
			link.rel = 'noreferrer';
			els.heroPlatformActions.appendChild(link);
			return;
		}

		const button = createEl('button', 'platform-button is-disabled', PLATFORM_LABELS[key]);
		button.type = 'button';
		button.disabled = true;
		button.title = 'Enlace pendiente de configurar';
		els.heroPlatformActions.appendChild(button);
	});
}

function renderHeroTracklist() {
	els.heroTracklist.replaceChildren();
	state.tracks.forEach((track) => {
		const row = createEl('button', 'hero-track');
		row.type = 'button';
		row.dataset.track = String(track.number);
		row.setAttribute('aria-label', `Seleccionar ${track.name}`);
		row.innerHTML = `
      <span class="hero-track-number">${String(track.number).padStart(2, '0')}</span>
      <span class="hero-track-title"></span>
      <span class="hero-track-icon" aria-hidden="true">↗</span>
    `;
		qs('.hero-track-title', row).textContent = track.name;
		row.addEventListener('click', () => selectTrack(track));
		els.heroTracklist.appendChild(row);
	});
}

function createTrackAction(track) {
	if (track.audio) {
		const button = createEl('button', 'track-action');
		button.type = 'button';
		button.setAttribute('aria-label', `Reproducir ${track.name}`);
		button.innerHTML = '<span class="track-action-icon">▶</span>';
		button.addEventListener('click', async (event) => {
			event.stopPropagation();
			if (state.activeTrack?.number !== track.number) selectTrack(track);
			await togglePlayer();
		});
		return button;
	}

	if (track.url) {
		const link = createEl('a', 'track-action');
		link.href = track.url;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.setAttribute('aria-label', `Abrir ${track.name} en YouTube`);
		link.innerHTML = '<span class="track-action-icon">↗</span>';
		link.addEventListener('click', () => selectTrack(track));
		return link;
	}

	const button = createEl('button', 'track-action is-disabled', '—');
	button.type = 'button';
	button.disabled = true;
	button.setAttribute('aria-label', `${track.name} sin audio ni enlace configurado`);
	return button;
}

function createSpotifyAction(track) {
	const link = createEl('a', 'spotify-track-action', 'Spotify ↗');
	link.href = track.spotifySearch || 'https://open.spotify.com/search/HEWLAR';
	link.target = '_blank'; link.rel = 'noopener noreferrer';
	link.setAttribute('aria-label', `Buscar ${track.name} de Hewlar en Spotify`);
	link.title = 'Buscar esta canción en Spotify';
	link.addEventListener('click', () => selectTrack(track));
	return link;
}

function renderLatestReleases() {
	const mount = qs('#latest-releases');
	if (!mount) return;
	mount.replaceChildren();
	LATEST_RELEASES.forEach((release, index) => {
		const card = createEl('article', `latest-card latest-card--${release.tone} reveal`);
		const visual = createEl('div', 'latest-card-visual');
		const cover = createEl('img', 'latest-card-cover');

		cover.src = release.cover;
		cover.alt = `Portada de ${release.title}`;
		cover.loading = 'lazy';

		visual.append(cover);
		const meta = createEl('div', 'latest-card-head');
		meta.append(createEl('span', 'latest-pill', release.type), createEl('span', 'latest-year', release.year));
		const info = createEl('div', 'latest-card-info');
		info.append(createEl('p', 'latest-card-artist', release.artist), createEl('h3', 'latest-card-title', release.title));
		const links = createEl('div', 'latest-card-links');
		const youtube = createEl('a', 'latest-link', 'Buscar en YouTube ↗');
		youtube.href = release.youtubeUrl; youtube.target = '_blank'; youtube.rel = 'noopener noreferrer';
		youtube.setAttribute('aria-label', `Buscar ${release.title} en YouTube`);
		const spotify = createEl('a', 'latest-link', 'Spotify ↗');
		spotify.href = release.spotifyUrl; spotify.target = '_blank'; spotify.rel = 'noopener noreferrer';
		spotify.setAttribute('aria-label', `Buscar ${release.title} en Spotify`);
		links.append(youtube, spotify); info.append(links); visual.append(meta, info); card.append(visual);
		mount.append(card);
	});
	observeReveals();
}

function renderFullTracklist() {
	els.fullTracklist.replaceChildren();
	state.tracks.forEach((track) => {
		const row = createEl('div', 'track-row');
		row.dataset.track = String(track.number);
		row.tabIndex = 0;
		row.setAttribute('role', 'group');
		row.setAttribute('aria-label', `Seleccionar ${track.name}`);

		row.append(
			createEl('span', 'track-row-number', String(track.number).padStart(2, '0')),
			createEl('strong', 'track-row-title', track.name),
			createEl('span', 'track-row-source', track.audio ? 'Audio' : track.url ? 'YouTube' : 'Pendiente'),
			createTrackAction(track),
			createSpotifyAction(track),
		);

		row.addEventListener('click', (event) => {
			if (!event.target.closest('a, button')) selectTrack(track);
		});
		row.addEventListener('keydown', (event) => {
			if (event.target !== row) return;
			if (event.key === 'Enter' || event.key === ' ') {
				event.preventDefault();
				selectTrack(track);
			}
		});
		els.fullTracklist.appendChild(row);
	});
}

function renderVideos() {
	els.videoGrid.replaceChildren();
	state.tracks.filter((track) => track.url).slice(0, 11).forEach((track, index) => {
		const youtubeId = getYouTubeId(track.url);
		const link = createEl('a', 'video-card reveal');
		link.href = track.url;
		link.target = '_blank';
		link.rel = 'noreferrer';
		link.setAttribute('aria-label', `Ver ${track.name} en YouTube`);
		link.innerHTML = `
      <div class="video-thumb">
        ${youtubeId ? `<img src="https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg" alt="" loading="lazy" />` : ''}
        <span class="video-index">0${index + 1}</span>
        <span class="video-play" aria-hidden="true">▶</span>
      </div>
      <div class="video-card-copy">
        <span>SAN JUAN · YOUTUBE</span>
        <strong></strong>
      </div>
    `;
		qs('strong', link).textContent = track.name;
		els.videoGrid.appendChild(link);
	});
	observeReveals();
}

async function loadTracklist() {
	const response = await fetch('/api/tracklist', { headers: { Accept: 'application/json' } });
	if (!response.ok) throw new Error(`Tracklist HTTP ${response.status}`);
	const data = await response.json();
	if (!Array.isArray(data)) throw new Error('El tracklist recibido no es válido');

	state.tracks = data.map(normalizeTrack).sort((a, b) => a.number - b.number);
	renderHeroTracklist();
	renderFullTracklist();
	renderVideos();
}

function selectTrack(track) {
	if (!track) return;
	state.activeTrack = track;
	player.setTrack(track);
	updateActiveTrackUI();
	updatePlayerAvailability();
}

async function togglePlayer() {
	try {
		await player.toggle();
	} catch (error) {
		handleAudioError(error);
	}
}

function updateActiveTrackUI() {
	const activeNumber = String(state.activeTrack?.number ?? '');
	qsa('[data-track]').forEach((node) => {
		const isActive = node.dataset.track === activeNumber;
		node.classList.toggle('is-active', isActive);
		if (node.matches('.track-row')) node.setAttribute('aria-pressed', String(isActive));
	});
	els.playerTrackTitle.textContent = state.activeTrack?.name || 'Elige una canción';
}

function updatePlayerAvailability() {
	const track = state.activeTrack;
	const hasAudio = Boolean(track?.audio);
	els.playerToggle.disabled = !hasAudio;
	els.progressRange.disabled = !hasAudio;
	els.playerExternalLink.hidden = true;
	els.playerExternalLink.removeAttribute('href');
	els.playerSpotifyLink.hidden = !track?.spotifySearch;
	if (track?.spotifySearch) els.playerSpotifyLink.href = track.spotifySearch;

	if (!track) {
		els.playerMessage.textContent = 'Selecciona un tema para ver sus opciones.';
	} else if (hasAudio) {
		els.playerMessage.textContent = 'Audio local cargado.';
		if (track.url) {
			els.playerExternalLink.hidden = false;
			els.playerExternalLink.href = track.url;
		}
	} else if (track.url) {
		els.playerMessage.textContent = 'No hay un archivo de audio local configurado para este tema.';
		els.playerExternalLink.hidden = false;
		els.playerExternalLink.href = track.url;
	} else {
		els.playerMessage.textContent = 'Audio y enlace externo pendientes de configurar.';
	}
}

function updatePlayState(isPlaying) {
	document.body.classList.toggle('is-playing', isPlaying);
	els.playerShell.classList.toggle('is-playing', isPlaying);
	els.playerToggle.classList.toggle('is-playing', isPlaying);
	els.playerToggle.setAttribute('aria-label', isPlaying ? 'Pausar canción' : 'Reproducir canción');
}

function updateProgress(currentTime, duration) {
	const percentage = duration ? (currentTime / duration) * 100 : 0;
	els.progressRange.value = String(percentage);
	els.progressRange.style.setProperty('--progress', `${percentage}%`);
	els.elapsedTime.textContent = formatTime(currentTime);
	els.durationTime.textContent = formatTime(duration);
}

function handleAudioError(error) {
	console.error('No se pudo reproducir el audio:', error);
	updatePlayState(false);
	els.playerShell.classList.add('has-error');
	els.playerMessage.textContent = 'No se ha podido reproducir este archivo de audio.';
}

function bindPlayer() {
	els.playerToggle.addEventListener('click', togglePlayer);
	els.progressRange.addEventListener('input', () => player.seekToPercentage(els.progressRange.value));
}

function bindMenu() {
	els.menuToggle.addEventListener('click', () => {
		const open = els.menuToggle.getAttribute('aria-expanded') === 'true';
		els.menuToggle.setAttribute('aria-expanded', String(!open));
		document.body.classList.toggle('menu-open', !open);
	});

	qsa('a', els.primaryNav).forEach((link) => {
		link.addEventListener('click', () => {
			els.menuToggle.setAttribute('aria-expanded', 'false');
			document.body.classList.remove('menu-open');
		});
	});
}

function bindHeaderScroll() {
	let previousY = window.scrollY;
	const onScroll = () => {
		const currentY = window.scrollY;
		document.body.classList.toggle('has-scrolled', currentY > 40);
		document.body.classList.toggle('header-hidden', currentY > previousY && currentY > 260);
		previousY = currentY;
	};
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
}

function bindNavSpy() {
	const links = qsa('.primary-nav .nav-link');
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			links.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`));
		});
	}, { rootMargin: '-42% 0px -48% 0px', threshold: 0 });
	qsa('main section[id]').forEach((section) => observer.observe(section));
}

function observeReveals() {
	const nodes = qsa('.reveal:not(.is-visible)');
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
		nodes.forEach((node) => node.classList.add('is-visible'));
		return;
	}

	const observer = new IntersectionObserver((entries, instance) => {
		entries.forEach((entry) => {
			if (!entry.isIntersecting) return;
			entry.target.classList.add('is-visible');
			instance.unobserve(entry.target);
		});
	}, { threshold: 0.12 });
	nodes.forEach((node) => observer.observe(node));
}

function cacheElements() {
	Object.assign(els, {
		menuToggle: qs('#menu-toggle'),
		primaryNav: qs('#primary-nav'),
		heroTracklist: qs('#hero-tracklist'),
		fullTracklist: qs('#full-tracklist'),
		videoGrid: qs('#video-grid'),
		heroPlatformActions: qs('#hero-platform-actions'),
		playerShell: qs('#player-shell'),
		playerToggle: qs('#player-toggle'),
		playerTrackTitle: qs('#player-track-title'),
		progressRange: qs('#progress-range'),
		elapsedTime: qs('#elapsed-time'),
		durationTime: qs('#duration-time'),
		playerMessage: qs('#player-message'),
		playerExternalLink: qs('#player-external-link'),
		playerSpotifyLink: qs('#player-spotify-link'),
	});
}

async function init() {
	cacheElements();
	player = new AudioPlayerController({
		onStateChange: updatePlayState,
		onProgress: updateProgress,
		onMetadata: (duration) => { els.durationTime.textContent = formatTime(duration); },
		onError: handleAudioError,
	});

	renderArtwork();
	renderPlatformActions();
	renderLatestReleases();
	bindPlayer();
	bindMenu();
	bindHeaderScroll();
	bindNavSpy();
	observeReveals();
	qs('#copyright-year').textContent = String(new Date().getFullYear());

	try {
		await loadTracklist();
		if (state.tracks.length) selectTrack(state.tracks[0]);
	} catch (error) {
		console.error('Error cargando SAN JUAN:', error);
		els.heroTracklist.innerHTML = '<p class="load-error">No se ha podido cargar el tracklist.</p>';
		els.fullTracklist.innerHTML = '<p class="load-error dark">No se ha podido cargar el tracklist.</p>';
	}
}

window.addEventListener('beforeunload', () => player?.destroy());
document.addEventListener('DOMContentLoaded', init);
