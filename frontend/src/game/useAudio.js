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

  // Scene-specific ambience layer.
  // Each ambience is a scheduled loop of short synthesised events: cicadas,
  // water drips, wooden footsteps, wind, sudden silence, held breath.
  setAmbience(kind) {
    if (!this.initialized) return;
    if (this._ambTimer) clearInterval(this._ambTimer);
    this._ambience = kind;
    if (kind === "silence") return; // deliberate absence
    const spawn = () => this._spawnAmbienceEvent(kind);
    const period = { cicadas: 260, water: 900, forest: 1600, footsteps: 700, wind: 2400, hearth: 1400, bell: 3200 }[kind] || 1400;
    this._ambTimer = setInterval(spawn, period);
  }

  _spawnAmbienceEvent(kind) {
    if (!this.ctx || this.muted) return;
    const now = this.ctx.currentTime;
    if (kind === "cicadas") {
      // High chittering: filtered noise burst
      const src = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.6, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
      src.buffer = buf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = 4800 + Math.random() * 2000; bp.Q.value = 8;
      const g = this.ctx.createGain(); g.gain.value = 0.08;
      src.connect(bp).connect(g).connect(this.master);
      src.start(now); src.stop(now + 0.55);
    } else if (kind === "water") {
      const osc = this.ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = 2200 + Math.random() * 400;
      const g = this.ctx.createGain(); g.gain.value = 0;
      osc.connect(g).connect(this.master);
      g.gain.linearRampToValueAtTime(0.12, now + 0.005);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.18);
      osc.start(now); osc.stop(now + 0.25);
    } else if (kind === "footsteps") {
      const src = this.ctx.createBufferSource();
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (d.length * 0.15));
      src.buffer = buf;
      const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 300;
      const g = this.ctx.createGain(); g.gain.value = 0.18;
      src.connect(lp).connect(g).connect(this.master);
      src.start(now);
    } else if (kind === "wind" || kind === "forest") {
      const src = this.ctx.createBufferSource();
      const dur = 2.4;
      const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * dur, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.sin((i / d.length) * Math.PI);
      src.buffer = buf;
      const bp = this.ctx.createBiquadFilter();
      bp.type = "bandpass"; bp.frequency.value = kind === "wind" ? 350 : 550; bp.Q.value = 1.2;
      const g = this.ctx.createGain(); g.gain.value = 0.05;
      src.connect(bp).connect(g).connect(this.master);
      src.start(now); src.stop(now + dur);
    } else if (kind === "hearth") {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth"; osc.frequency.value = 55 + Math.random() * 20;
      const g = this.ctx.createGain(); g.gain.value = 0;
      const lp = this.ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 220;
      osc.connect(lp).connect(g).connect(this.master);
      g.gain.linearRampToValueAtTime(0.04, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc.start(now); osc.stop(now + 1);
    } else if (kind === "bell") {
      const osc = this.ctx.createOscillator();
      osc.type = "sine"; osc.frequency.value = 880 + Math.random() * 220;
      const g = this.ctx.createGain(); g.gain.value = 0;
      osc.connect(g).connect(this.master);
      g.gain.linearRampToValueAtTime(0.08, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
      osc.start(now); osc.stop(now + 2);
    }
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

// Map scenes → ambience kind
export const SCENE_AMBIENCE = {
  start: "cicadas",
  shrine_torii: "cicadas",
  abandoned_shrine: "silence",
  twilight_home: "footsteps",
  mountain_bridge: "water",
  kappa_pact: "water",
  silent_grove: "silence",
  silk_hut: "bell",
  paddies_wall: "wind",
  farmhouse: "hearth",
  zashiki_warashi: "bell",
  village_return: "footsteps",
  kuchisake_encounter: "silence",
};

export const audioEngine = new AudioEngine();
