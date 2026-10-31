export class AudioGuide {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.context = null;
    this.lastBell = -Infinity;
  }

  unlock() {
    if (!this.enabled) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (Context && !this.context) this.context = new Context();
      this.context?.resume()?.catch(() => {});
    } catch { /* Visual feedback always remains available. */ }
  }

  stop() {
    try { window.speechSynthesis?.cancel(); } catch { /* Optional browser feature. */ }
  }

  speak(text) {
    if (!this.enabled || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      this.stop();
      const words = new SpeechSynthesisUtterance(text);
      words.lang = 'en-SG';
      words.rate = 0.85;
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.lang === 'en-SG') || voices.find(v => v.lang.startsWith('en-'));
      if (voice) words.voice = voice;
      window.speechSynthesis.speak(words);
    } catch { /* Speech is an enhancement, never a requirement to play. */ }
  }

  celebrate(final = false) {
    this.notes(final ? [523.25, 659.25, 783.99, 1046.5] : [523.25, 659.25, 783.99]);
  }

  bell() {
    if (!this.enabled || !this.context || this.context.currentTime - this.lastBell < 0.45) return;
    this.lastBell = this.context.currentTime;
    this.notes([659.25, 523.25], 0.23, 0.055);
  }

  count() { this.notes([784], 0.1, 0.035); }

  notes(frequencies, spacing = 0.12, loudness = 0.07) {
    if (!this.enabled || !this.context) return;
    try {
      const ctx = this.context;
      frequencies.forEach((frequency, i) => {
        const oscillator = ctx.createOscillator();
        const volume = ctx.createGain();
        const start = ctx.currentTime + i * spacing;
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        volume.gain.setValueAtTime(0, start);
        volume.gain.linearRampToValueAtTime(loudness, start + 0.02);
        volume.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        oscillator.connect(volume);
        volume.connect(ctx.destination);
        oscillator.start(start);
        oscillator.stop(start + 0.32);
      });
    } catch { /* Silent browsers can still play. */ }
  }
}
