// All sound is synthesized with WebAudio: no audio files, no network.
// Every method is a no-op when the browser has no AudioContext (headless
// screenshots) or when the player muted the game.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, startAt, duration, type = 'sine', volume = 0.12) {
    if (!this.ctx || this.muted) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      const t0 = this.ctx.currentTime + startAt;
      gain.gain.setValueAtTime(0.0001, t0);
      gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + duration + 0.05);
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }

  click() {
    this.tone(660, 0, 0.07, 'triangle', 0.05);
  }

  found() {
    this.tone(659, 0, 0.16, 'sine', 0.14);
    this.tone(880, 0.09, 0.22, 'sine', 0.14);
    this.tone(1318, 0.18, 0.26, 'sine', 0.08);
  }

  wrong() {
    this.tone(140, 0, 0.22, 'square', 0.07);
    this.tone(110, 0.05, 0.2, 'square', 0.05);
  }

  hint() {
    this.tone(988, 0, 0.12, 'sine', 0.09);
    this.tone(1175, 0.1, 0.16, 'sine', 0.09);
  }

  complete() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => this.tone(freq, i * 0.11, 0.24, 'triangle', 0.12));
  }

  victory() {
    const notes = [523, 659, 784, 1047, 784, 1047, 1319];
    notes.forEach((freq, i) => this.tone(freq, i * 0.13, 0.3, 'triangle', 0.12));
  }
}
