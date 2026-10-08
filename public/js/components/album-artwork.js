export function AlbumArtwork({ size = 'large' } = {}) {
  const root = document.createElement('div');
  root.className = `album-artwork album-artwork--${size}`;
  root.innerHTML = `
    <div class="vinyl" aria-hidden="true"><span class="vinyl-rings"></span><span class="vinyl-label">SJ<br>2025</span></div>
    <div class="album-cover">
      <img class="album-photo" src="/assets/san-juan-cover.webp" alt="Portada real de SAN JUAN, con el faro y la playa" loading="lazy" />
      <div class="album-cover-glow" aria-hidden="true"></div>
      <img class="album-cover-logo" src="/assets/san-juan-logo-white.png" alt="SAN JUAN" loading="lazy" />
      <div class="album-cover-meta"><span>HEWLAR</span><span>2025 · 11 TRACKS</span></div>
    </div>`;
  return root;
}
