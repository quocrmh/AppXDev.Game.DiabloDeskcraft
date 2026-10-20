// ============================================================================
// RETRO 16-BIT WEBAUDIO SOUND SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
// Synthesizes crisp ARPG combat hits, blade slashes, bow releases, thunderbolts,
// Diablo legendary/set item drop chimes, and war drums.
// ============================================================================

export class RetroSoundEngine {
  constructor() {
    this.enabled = false; // Default muted so desktop overlay is unobtrusive until toggled on
    this.ctx = null;
    this.lastPlayTime = {};
  }

  ensureContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.ensureContext();
      this.playLootChime(true);
    }
    return this.enabled;
  }

  toggleMute() {
    return !this.toggleSound();
  }

  playSlash(isCrit = false) {
    this.playHitSlash(isCrit);
  }

  playBossHorn() {
    this.playBossWarDrum();
  }

  canPlay(tag, minIntervalMs = 70) {
    const now = performance.now();
    if (now - (this.lastPlayTime[tag] || 0) < minIntervalMs) return false;
    this.lastPlayTime[tag] = now;
    return true;
  }

  playHitSlash(isCrit = false) {
    if (!this.enabled || !this.canPlay('hit', 85)) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCrit ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(isCrit ? 290 : 190, now);
    osc.frequency.exponentialRampToValueAtTime(48, now + 0.08);

    gain.gain.setValueAtTime(isCrit ? 0.07 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  playSkillCast(effectType = 'dragon_cleave') {
    if (!this.enabled || !this.canPlay('skill', 180)) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (effectType === 'bagua_lightning') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.22);
    } else if (effectType === 'arrow_rain') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(640, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.14);
    } else {
      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.24);
    }

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  playLootChime(isHighTier = false) {
    if (!this.enabled || !this.canPlay('loot', 150)) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    const notes = isHighTier ? [523.25, 659.25, 783.99, 1046.5] : [440, 554.37];
    notes.forEach((freq, idx) => {
      const now = ctx.currentTime + idx * 0.055;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.055, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    });
  }

  playBossWarDrum() {
    if (!this.enabled || !this.canPlay('drum', 600)) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    [0, 0.16, 0.32].forEach((offset, idx) => {
      const now = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 2 ? 110 : 85, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.14);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    });
  }
}

export const soundEngine = new RetroSoundEngine();
