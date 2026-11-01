import { chooseNarrator, readVoice, PACES } from './voice-preferences.js';

export class AudioGuide {
  constructor(enabled = true) {
    this.enabled = enabled;
    this.context = null;
    this.lastBell = -Infinity;
    this.pendingVoice = null;
    this.utterance = null;
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
    this.pendingVoice?.();
    this.pendingVoice = null;
    this.utterance = null;
    try { window.speechSynthesis?.cancel(); } catch { /* Optional browser feature. */ }
  }

  speak(text, {preview = false, onStatus = () => {}} = {}) {
    if ((!this.enabled && !preview) || !window.speechSynthesis || !window.SpeechSynthesisUtterance) {onStatus('unavailable');return false;}
    try {
      this.stop();
      const synth=window.speechSynthesis;
      const speakWithVoices=()=>{
        const preference=this.voicePreference||readVoice(),voice=chooseNarrator(synth.getVoices(),preference);
        const words=new window.SpeechSynthesisUtterance(text);
        words.lang=voice?.lang||'en-GB';
        words.rate=PACES[preference.pace].rate;
        words.pitch=1;
        if(voice)words.voice=voice;
        words.onstart=()=>onStatus('speaking');
        words.onend=()=>{if(this.utterance===words)this.utterance=null;onStatus('finished');};
        words.onerror=event=>{if(this.utterance===words)this.utterance=null;onStatus(['canceled','interrupted'].includes(event.error)?'stopped':'error');};
        this.utterance=words;
        synth.speak(words);
      };
      if(synth.getVoices().length){speakWithVoices();}
      else{
        let timer;
        const cleanup=()=>{clearTimeout(timer);synth.removeEventListener?.('voiceschanged',ready);};
        const ready=()=>{
          if(!synth.getVoices().length)return;
          cleanup();this.pendingVoice=null;try{speakWithVoices();}catch{onStatus('error');}
        };
        this.pendingVoice=cleanup;
        synth.addEventListener?.('voiceschanged',ready);
        timer=setTimeout(()=>{cleanup();this.pendingVoice=null;try{speakWithVoices();}catch{onStatus('error');}},1200);
      }
      return true;
    } catch { onStatus('error');return false; /* Speech is an enhancement, never a requirement to play. */ }
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
