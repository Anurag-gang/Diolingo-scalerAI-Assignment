/**
 * Spatial Audio Cue Synthesizer & Web Speech TTS Engine for "Dio's Carnival" / Diolingo
 * Implements §V.3 Spatial Audio Cue Map without requiring external audio file downloads.
 */

export type SpatialCueType =
  | "correct"
  | "wrong"
  | "complete"
  | "click"
  | "birdsong"
  | "feather_swoosh"
  | "samba_tick"
  | "carnival_horn"
  | "jungle_rustle";

export function playSoundEffect(
  type: SpatialCueType,
  enabled: boolean = true,
  pan: number = 0
) {
  if (!enabled || typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const connectWithPan = (node: AudioNode) => {
      if (typeof ctx.createStereoPanner === "function") {
        const panner = ctx.createStereoPanner();
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), now);
        node.connect(panner);
        panner.connect(ctx.destination);
      } else {
        node.connect(ctx.destination);
      }
    };

    if (type === "correct") {
      const notes = [659.25, 987.77];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.18, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.28);
        osc.connect(gain);
        connectWithPan(gain);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.3);
      });
    } else if (type === "wrong") {
      const notes = [196.0, 155.56];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.13, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.25);
        osc.connect(gain);
        connectWithPan(gain);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.27);
      });
    } else if (type === "complete" || type === "carnival_horn") {
      // Celebratory carnival brass/chime chord stinger
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type === "carnival_horn" ? "sawtooth" : "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.14, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.42);
        osc.connect(gain);
        connectWithPan(gain);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } else if (type === "samba_tick" || type === "click") {
      // Short samba agogo/woodblock percussion tick
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(type === "samba_tick" ? 880 : 520, now);
      osc.frequency.exponentialRampToValueAtTime(420, now + 0.045);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      connectWithPan(gain);
      osc.start(now);
      osc.stop(now + 0.055);
    } else if (type === "birdsong") {
      // Ambient tropical birdsong double-chirp (-24dB)
      [0, 0.16].forEach((offset, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1650 + idx * 240, now + offset);
        osc.frequency.exponentialRampToValueAtTime(2450, now + offset + 0.09);
        gain.gain.setValueAtTime(0.05, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);
        osc.connect(gain);
        connectWithPan(gain);
        osc.start(now + offset);
        osc.stop(now + offset + 0.13);
      });
    } else if (type === "feather_swoosh" || type === "jungle_rustle") {
      // Soft filtered white-noise feather swoosh panned to scroll direction
      const bufferSize = ctx.sampleRate * 0.18;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(type === "feather_swoosh" ? 950 : 480, now);
      filter.Q.setValueAtTime(2.2, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);

      noise.connect(filter);
      filter.connect(gain);
      connectWithPan(gain);
      noise.start(now);
      noise.stop(now + 0.18);
    }
  } catch {
    // Ignore browser autoplay restrictions prior to first gesture
  }
}

export function speakPhrase(
  text: string,
  lang: string = "es-ES",
  slow: boolean = false,
  enabled: boolean = true
) {
  if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = slow ? 0.58 : 0.96;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech synthesis errors
  }
}
