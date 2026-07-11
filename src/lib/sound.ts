/**
 * Tiny procedural sound engine built on the Web Audio API.
 * No audio assets required — every cue is synthesized on the fly.
 * Call `ensure()` from a user gesture to satisfy autoplay policies.
 */
type Cue = 'click' | 'hover' | 'success' | 'error' | 'complete' | 'toggle' | 'whoosh';

class SoundEngine {
  enabled = true;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;

  /** Lazily create the AudioContext (must follow a user gesture). */
  ensure() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') void this.ctx.resume();
      return;
    }
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctor();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.18;
      this.master.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType, peak: number) {
    if (!this.ctx || !this.master) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime + start);
    gain.gain.setValueAtTime(0, this.ctx.currentTime + start);
    gain.gain.linearRampToValueAtTime(peak, this.ctx.currentTime + start + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + start + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(this.ctx.currentTime + start);
    osc.stop(this.ctx.currentTime + start + dur + 0.02);
  }

  play(cue: Cue) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;

    switch (cue) {
      case 'click':
        this.tone(420, 0, 0.08, 'triangle', 0.5);
        break;
      case 'hover':
        this.tone(680, 0, 0.05, 'sine', 0.18);
        break;
      case 'toggle':
        this.tone(540, 0, 0.07, 'square', 0.3);
        break;
      case 'success':
        this.tone(523.25, 0, 0.12, 'sine', 0.4);
        this.tone(659.25, 0.08, 0.12, 'sine', 0.4);
        this.tone(783.99, 0.16, 0.18, 'sine', 0.4);
        break;
      case 'error':
        this.tone(220, 0, 0.18, 'sawtooth', 0.3);
        this.tone(180, 0.1, 0.2, 'sawtooth', 0.25);
        break;
      case 'whoosh':
        if (!this.ctx || !this.master) return;
        {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(900, this.ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.25, this.ctx.currentTime + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.25);
          osc.connect(gain);
          gain.connect(this.master);
          osc.start();
          osc.stop(this.ctx.currentTime + 0.27);
        }
        break;
      case 'complete':
        this.tone(523.25, 0, 0.14, 'sine', 0.4);
        this.tone(659.25, 0.1, 0.14, 'sine', 0.4);
        this.tone(783.99, 0.2, 0.14, 'sine', 0.4);
        this.tone(1046.5, 0.3, 0.3, 'sine', 0.45);
        break;
    }
  }
}

export const sound = new SoundEngine();
