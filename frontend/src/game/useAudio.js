// Procedural Web Audio ambient engine for Inga.
// Generates layered drones, wind noise, and stage-dependent unease
// entirely in the browser — no external audio assets.

const STAGE_PROFILE = {
  peaceful: { droneFreq: 110, detune: 4, noise: 0.06, tremolo: 0.08, dissonance: 0 },
  strange: { droneFreq: 98, detune: 8, noise: 0.09, tremolo: 0.12, dissonance: 0.15 },
  unsettling: { droneFreq: 87, detune: 14, noise: 0.12, tremolo: 0.18, dissonance: 0.3 },
  distorted: { droneFreq: 73, detune: 22, noise: 0.18, tremolo: 0.25, dissonance: 0.55 },
  horrifying: { droneFreq: 55, detune: 32, noise: 0.24, tremolo: 0.35, dissonance: 0.85 },
};

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.droneA = null;
    this.droneB = null;
    this.droneAGain = null;
    this.droneBGain = null;
    this.noise = null;
    this.noiseGain = null;
    this.lfo = null;
    this.lfoGain = null;
    this.initialized = false;
    this.muted = false;
    this.currentStage = "peaceful";
  }

  init() {
    if (this.initialized) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.0;
    this.master.connect(this.ctx.destination);

    // Two detuned drone oscillators for slow beating
    this.droneA = this.ctx.createOscillator();
    this.droneA.type = "sine";
    this.droneAGain = this.ctx.createGain();
    this.droneAGain.gain.value = 0.18;
    this.droneA.connect(this.droneAGain).connect(this.master);

    this.droneB = this.ctx.createOscillator();
    this.droneB.type = "triangle";
    this.droneBGain = this.ctx.createGain();
    this.droneBGain.gain.value = 0.09;
    this.droneB.connect(this.droneBGain).connect(this.master);

    // Wind noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // pink-ish filter
      data[i] = (last + 0.02 * white) / 1.02;
      last = data[i];
    }
    this.noise = this.ctx.createBufferSource();
    this.noise.buffer = buffer;
    this.noise.loop = true;
    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = "lowpass";
    noiseFilter.frequency.value = 700;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = 0.05;
    this.noise.connect(noiseFilter).connect(this.noiseGain).connect(this.master);

    // Tremolo LFO on master
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 0.15;
    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0.05;
    this.lfo.connect(this.lfoGain).connect(this.master.gain);

    this.droneA.start();
    this.droneB.start();
    this.noise.start();
    this.lfo.start();

    this.setStage(this.currentStage, 2.0);
    this.initialized = true;
  }

  setStage(stage, ramp = 4) {
    this.currentStage = stage;
    if (!this.initialized) return;
    const p = STAGE_PROFILE[stage] || STAGE_PROFILE.peaceful;
    const now = this.ctx.currentTime;
    this.droneA.frequency.linearRampToValueAtTime(p.droneFreq, now + ramp);
    this.droneB.frequency.linearRampToValueAtTime(
      p.droneFreq * (1 + p.dissonance * 0.05) + p.detune / 3,
      now + ramp
    );
    this.droneB.detune.linearRampToValueAtTime(p.detune, now + ramp);
    this.noiseGain.gain.linearRampToValueAtTime(p.noise, now + ramp);
    this.lfo.frequency.linearRampToValueAtTime(0.1 + p.tremolo, now + ramp);
    this.lfoGain.gain.linearRampToValueAtTime(p.tremolo * 0.3, now + ramp);
  }

  fadeIn(target = 0.7, seconds = 3) {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(target, now + seconds);
  }

  fadeOut(seconds = 1.5) {
    if (!this.initialized) return;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.linearRampToValueAtTime(0, now + seconds);
  }

  chime() {
    if (!this.initialized || this.muted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    g.gain.value = 0;
    osc.connect(g).connect(this.master);
    g.gain.linearRampToValueAtTime(0.15, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
    osc.start(now);
    osc.stop(now + 3);
  }

  setMuted(muted) {
    this.muted = muted;
    if (!this.initialized) return;
    if (muted) this.fadeOut(0.6);
    else this.fadeIn(0.7, 2);
  }
}

export const audioEngine = new AudioEngine();
