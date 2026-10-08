export class AudioPlayerController {
  constructor({ onStateChange, onProgress, onMetadata, onError } = {}) {
    this.audio = new Audio();
    this.audio.preload = 'metadata';
    this.track = null;
    this.onStateChange = onStateChange || (() => {});
    this.onProgress = onProgress || (() => {});
    this.onMetadata = onMetadata || (() => {});
    this.onError = onError || (() => {});
    this.bindEvents();
  }

  bindEvents() {
    this.audio.addEventListener('play', () => this.onStateChange(this.isPlaying));
    this.audio.addEventListener('pause', () => this.onStateChange(this.isPlaying));
    this.audio.addEventListener('ended', () => {
      this.onStateChange(false);
      this.onProgress(0, this.audio.duration || 0);
    });
    this.audio.addEventListener('loadedmetadata', () => this.onMetadata(this.audio.duration));
    this.audio.addEventListener('durationchange', () => this.onMetadata(this.audio.duration));
    this.audio.addEventListener('timeupdate', () => this.onProgress(this.audio.currentTime, this.audio.duration));
    this.audio.addEventListener('error', () => this.onError(this.audio.error || new Error('Audio error')));
  }

  get isPlaying() {
    return !this.audio.paused && !this.audio.ended && Boolean(this.track?.audio);
  }

  setTrack(track) {
    if (!track) return;
    const sourceChanged = this.track?.audio !== track.audio;
    if (sourceChanged && !this.audio.paused) this.audio.pause();
    this.track = track;

    if (track.audio) {
      const source = new URL(track.audio, window.location.href).href;
      if (this.audio.src !== source) {
        this.audio.src = track.audio;
        this.audio.load();
      }
    } else {
      this.audio.pause();
      this.audio.removeAttribute('src');
      this.audio.load();
      this.onProgress(0, 0);
      this.onMetadata(0);
    }

    this.onStateChange(this.isPlaying);
  }

  async toggle() {
    if (!this.track?.audio) return false;
    if (this.isPlaying) {
      this.audio.pause();
      return false;
    }
    await this.audio.play();
    return true;
  }

  seekToPercentage(percentage) {
    if (!this.audio.duration) return;
    const normalized = Math.max(0, Math.min(100, Number(percentage)));
    this.audio.currentTime = (normalized / 100) * this.audio.duration;
  }

  destroy() {
    this.audio.pause();
    this.audio.removeAttribute('src');
    this.audio.load();
  }
}
