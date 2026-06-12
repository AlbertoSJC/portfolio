/**
 * Procedural WebAudio feedback sounds, synthesized at runtime — no audio
 * files (PRD §9: procedural audio).
 *
 * Timbre direction: Kingdom Hearts–style celesta/music-box chimes ringing
 * in a real space. Three ingredients sell it:
 *   1. convolution reverb with a procedurally generated impulse response
 *      (decaying noise burst) — the sense of room is most of the polish;
 *   2. struck-note envelopes: instant attack, fast first drop, long ring;
 *   3. celesta partials (strong fundamental, octave, high 4× shimmer,
 *      slightly inharmonic glass partial) with a little stereo spread.
 *
 * The AudioContext is created lazily on the first call, because browsers
 * only allow audio after a user gesture.
 */

interface ChimeNote {
  frequencyHertz: number;
  /** Seconds after the sound starts that this note begins. */
  startOffsetSeconds: number;
  /** How long the note rings before fully fading. */
  ringSeconds: number;
  /** Relative loudness of this note within the phrase (0..1). */
  noteVolume?: number;
}

interface ThudNote {
  startFrequencyHertz: number;
  endFrequencyHertz: number;
  startOffsetSeconds: number;
  durationSeconds: number;
}

interface AudioGraph {
  context: AudioContext;
  /** Direct signal path. */
  dryInput: GainNode;
  /** Signal sent here passes through the reverb before the speakers. */
  reverbInput: GainNode;
}

const MASTER_VOLUME = 0.24;
/** How loud the reverb tail is relative to the dry signal. */
const REVERB_WET_LEVEL = 0.3;
const REVERB_TAIL_SECONDS = 0.35;
/** Larger = faster-dying tail; tuned to a small room rather than a hall. */
const REVERB_DECAY_EXPONENT = 6;
/**
 * One-pole smoothing applied to the impulse noise (0..1). Lower = darker,
 * warmer tail; raw white noise (1) rings bright and hissy.
 */
const REVERB_TONE_SMOOTHING = 0.22;
/** Gentle master lowpass that rounds off the digital edge. */
const MASTER_LOWPASS_FREQUENCY_HERTZ = 7500;

/** Partials of the celesta voice. */
const CELESTA_PARTIALS: readonly {
  frequencyRatio: number;
  gainRatio: number;
  panPosition: number;
}[] = [
  { frequencyRatio: 1, gainRatio: 1, panPosition: 0 },
  { frequencyRatio: 1.004, gainRatio: 0.3, panPosition: -0.25 }, // detune shimmer, left
  { frequencyRatio: 2, gainRatio: 0.25, panPosition: 0.2 },
  { frequencyRatio: 2.99, gainRatio: 0.07, panPosition: -0.15 }, // struck-glass inharmonicity
  { frequencyRatio: 4, gainRatio: 0.12, panPosition: 0.3 }, // the music-box sparkle on top
];

const CHIME_ATTACK_SECONDS = 0.004;
/** Struck notes drop to this fraction of peak quickly, then ring out. */
const STRIKE_DECAY_FRACTION = 0.35;
const STRIKE_DECAY_SECONDS = 0.07;
const THUD_ATTACK_SECONDS = 0.005;
const THUD_LOWPASS_FREQUENCY_HERTZ = 900;
/** Thuds are drier than chimes — they sit close, not in the hall. */
const THUD_REVERB_SEND_LEVEL = 0.4;

export class UserInterfaceSounds {
  private audioGraph: AudioGraph | undefined;

  constructor() {
    this.registerAudioUnlockListeners();
  }

  /**
   * Browsers refuse to start audio before the first click or keypress
   * (autoplay policy) — a hover alone can never unlock it. Resuming the
   * context on the very first gesture anywhere means every sound works
   * from that moment on, including hover ticks.
   */
  private registerAudioUnlockListeners(): void {
    const unlockAudio = (): void => {
      this.ensureAudioGraph();
    };
    window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });
    window.addEventListener('keydown', unlockAudio, { once: true, capture: true });
  }

  /**
   * Stereo impulse response: a lowpass-filtered noise burst dying away
   * like a small room. The filtering keeps the tail warm instead of hissy.
   */
  private static generateReverbImpulseResponse(context: AudioContext): AudioBuffer {
    const sampleCount = Math.floor(context.sampleRate * REVERB_TAIL_SECONDS);
    const impulseBuffer = context.createBuffer(2, sampleCount, context.sampleRate);
    for (let channelIndex = 0; channelIndex < impulseBuffer.numberOfChannels; channelIndex += 1) {
      const channelData = impulseBuffer.getChannelData(channelIndex);
      let smoothedNoise = 0;
      for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
        const tailProgress = sampleIndex / sampleCount;
        const decayEnvelope = Math.pow(1 - tailProgress, REVERB_DECAY_EXPONENT);
        const whiteNoise = Math.random() * 2 - 1;
        smoothedNoise += REVERB_TONE_SMOOTHING * (whiteNoise - smoothedNoise);
        channelData[sampleIndex] = smoothedNoise * decayEnvelope;
      }
    }
    return impulseBuffer;
  }

  private ensureAudioGraph(): AudioGraph | undefined {
    if (this.audioGraph === undefined) {
      let context: AudioContext;
      try {
        context = new AudioContext();
      } catch {
        return undefined; // no audio support — the game stays silent, never broken
      }
      const masterLowpass = context.createBiquadFilter();
      masterLowpass.type = 'lowpass';
      masterLowpass.frequency.value = MASTER_LOWPASS_FREQUENCY_HERTZ;
      masterLowpass.connect(context.destination);

      const dryInput = context.createGain();
      dryInput.gain.value = 1;
      dryInput.connect(masterLowpass);

      const reverb = context.createConvolver();
      reverb.buffer = UserInterfaceSounds.generateReverbImpulseResponse(context);
      const reverbInput = context.createGain();
      reverbInput.gain.value = REVERB_WET_LEVEL;
      reverbInput.connect(reverb);
      reverb.connect(masterLowpass);

      this.audioGraph = { context, dryInput, reverbInput };
    }
    if (this.audioGraph.context.state === 'suspended') {
      void this.audioGraph.context.resume();
    }
    return this.audioGraph;
  }

  /** A phrase of celesta notes — the core Kingdom Hearts–style voice. */
  private playChime(phraseVolume: number, notes: readonly ChimeNote[]): void {
    const audioGraph = this.ensureAudioGraph();
    if (audioGraph === undefined) {
      return;
    }
    const { context, dryInput, reverbInput } = audioGraph;
    const phraseStart = context.currentTime;
    for (const note of notes) {
      const noteStart = phraseStart + note.startOffsetSeconds;
      const noteEnd = noteStart + note.ringSeconds;
      const noteVolume = (note.noteVolume ?? 1) * phraseVolume * MASTER_VOLUME;
      for (const partial of CELESTA_PARTIALS) {
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        const stereoPanner = context.createStereoPanner();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(note.frequencyHertz * partial.frequencyRatio, noteStart);
        const partialPeak = noteVolume * partial.gainRatio;
        // Struck-note envelope: instant attack, quick first drop, long ring.
        envelope.gain.setValueAtTime(0, noteStart);
        envelope.gain.linearRampToValueAtTime(partialPeak, noteStart + CHIME_ATTACK_SECONDS);
        envelope.gain.exponentialRampToValueAtTime(
          Math.max(partialPeak * STRIKE_DECAY_FRACTION, 0.0001),
          noteStart + STRIKE_DECAY_SECONDS,
        );
        envelope.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
        stereoPanner.pan.setValueAtTime(partial.panPosition, noteStart);
        oscillator.connect(envelope);
        envelope.connect(stereoPanner);
        stereoPanner.connect(dryInput);
        stereoPanner.connect(reverbInput);
        oscillator.start(noteStart);
        oscillator.stop(noteEnd + REVERB_TAIL_SECONDS);
      }
    }
  }

  /** Soft low percussive drops for movement and impacts (lowpassed, mostly dry). */
  private playThud(thudVolume: number, notes: readonly ThudNote[]): void {
    const audioGraph = this.ensureAudioGraph();
    if (audioGraph === undefined) {
      return;
    }
    const { context, dryInput, reverbInput } = audioGraph;
    const reverbSend = context.createGain();
    reverbSend.gain.value = THUD_REVERB_SEND_LEVEL;
    reverbSend.connect(reverbInput);
    const phraseStart = context.currentTime;
    for (const note of notes) {
      const noteStart = phraseStart + note.startOffsetSeconds;
      const noteEnd = noteStart + note.durationSeconds;
      const oscillator = context.createOscillator();
      const lowpassFilter = context.createBiquadFilter();
      const envelope = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(note.startFrequencyHertz, noteStart);
      oscillator.frequency.exponentialRampToValueAtTime(note.endFrequencyHertz, noteEnd);
      lowpassFilter.type = 'lowpass';
      lowpassFilter.frequency.setValueAtTime(THUD_LOWPASS_FREQUENCY_HERTZ, noteStart);
      envelope.gain.setValueAtTime(0, noteStart);
      envelope.gain.linearRampToValueAtTime(thudVolume * MASTER_VOLUME, noteStart + THUD_ATTACK_SECONDS);
      envelope.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      oscillator.connect(lowpassFilter);
      lowpassFilter.connect(envelope);
      envelope.connect(dryInput);
      envelope.connect(reverbSend);
      oscillator.start(noteStart);
      oscillator.stop(noteEnd + REVERB_TAIL_SECONDS);
    }
  }

  /** Faint glass tick when the cursor passes over a menu entry. */
  playMenuHover(): void {
    this.playChime(0.22, [
      { frequencyHertz: 1319, startOffsetSeconds: 0, ringSeconds: 0.14 },
    ]);
  }

  /** Warm rolled rising fourth — the gentle menu confirm. */
  playMenuConfirm(): void {
    this.playChime(0.55, [
      { frequencyHertz: 587, startOffsetSeconds: 0, ringSeconds: 0.3, noteVolume: 0.85 },
      { frequencyHertz: 784, startOffsetSeconds: 0.045, ringSeconds: 0.45 },
    ]);
  }

  /** Soft falling third when a menu is cancelled or closed. */
  playMenuCancel(): void {
    this.playChime(0.45, [
      { frequencyHertz: 523, startOffsetSeconds: 0, ringSeconds: 0.25, noteVolume: 0.9 },
      { frequencyHertz: 415, startOffsetSeconds: 0.05, ringSeconds: 0.4 },
    ]);
  }

  /** Muffled footfalls while a unit walks. */
  playMovement(): void {
    this.playThud(0.7, [
      { startFrequencyHertz: 190, endFrequencyHertz: 110, startOffsetSeconds: 0, durationSeconds: 0.07 },
      { startFrequencyHertz: 170, endFrequencyHertz: 100, startOffsetSeconds: 0.11, durationSeconds: 0.07 },
    ]);
  }

  /** Rounded hit thump; critical hits add a bright glass accent on top. */
  playDamageImpact(wasCriticalHit: boolean): void {
    this.playThud(wasCriticalHit ? 1 : 0.85, [
      {
        startFrequencyHertz: wasCriticalHit ? 320 : 240,
        endFrequencyHertz: 60,
        startOffsetSeconds: 0,
        durationSeconds: 0.16,
      },
    ]);
    if (wasCriticalHit) {
      this.playChime(0.5, [
        { frequencyHertz: 1568, startOffsetSeconds: 0.02, ringSeconds: 0.3 },
      ]);
    }
  }

  /** Airy swish for an attack that misses. */
  playAttackMissed(): void {
    this.playThud(0.35, [
      { startFrequencyHertz: 700, endFrequencyHertz: 320, startOffsetSeconds: 0, durationSeconds: 0.14 },
    ]);
  }

  /** Glassy rolled ascending triad for healing — cure-spell sparkle. */
  playHealingChime(): void {
    this.playChime(0.6, [
      { frequencyHertz: 784, startOffsetSeconds: 0, ringSeconds: 0.3, noteVolume: 0.75 },
      { frequencyHertz: 988, startOffsetSeconds: 0.07, ringSeconds: 0.35, noteVolume: 0.85 },
      { frequencyHertz: 1175, startOffsetSeconds: 0.14, ringSeconds: 0.5 },
    ]);
  }

  /** Two warm low bells swelling for a buff taking hold. */
  playBuffApplied(): void {
    this.playChime(0.55, [
      { frequencyHertz: 392, startOffsetSeconds: 0, ringSeconds: 0.35 },
      { frequencyHertz: 523, startOffsetSeconds: 0.1, ringSeconds: 0.5 },
    ]);
  }

  /** Low somber bell pair when a unit is knocked out. */
  playKnockoutSting(): void {
    this.playThud(0.8, [
      { startFrequencyHertz: 220, endFrequencyHertz: 55, startOffsetSeconds: 0, durationSeconds: 0.35 },
    ]);
    this.playChime(0.4, [
      { frequencyHertz: 311, startOffsetSeconds: 0.05, ringSeconds: 0.45 },
      { frequencyHertz: 233, startOffsetSeconds: 0.3, ringSeconds: 0.6 },
    ]);
  }

  /** Single clear bell marking the start of a new unit's turn. */
  playTurnStart(): void {
    this.playChime(0.28, [
      { frequencyHertz: 880, startOffsetSeconds: 0, ringSeconds: 0.2 },
    ]);
  }

  /** Ascending rolled bell fanfare on victory. */
  playVictoryFanfare(): void {
    this.playChime(0.65, [
      { frequencyHertz: 523, startOffsetSeconds: 0, ringSeconds: 0.35, noteVolume: 0.75 },
      { frequencyHertz: 659, startOffsetSeconds: 0.12, ringSeconds: 0.4, noteVolume: 0.8 },
      { frequencyHertz: 784, startOffsetSeconds: 0.24, ringSeconds: 0.45, noteVolume: 0.85 },
      { frequencyHertz: 1046, startOffsetSeconds: 0.36, ringSeconds: 0.7 },
    ]);
  }

  /** Slow low minor bells on defeat. */
  playDefeatSting(): void {
    this.playChime(0.6, [
      { frequencyHertz: 440, startOffsetSeconds: 0, ringSeconds: 0.5 },
      { frequencyHertz: 415, startOffsetSeconds: 0.35, ringSeconds: 0.5 },
      { frequencyHertz: 330, startOffsetSeconds: 0.7, ringSeconds: 0.8 },
    ]);
  }
}
