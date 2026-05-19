/**
 * Procedural ocean ambient sound using Web Audio API.
 * No external audio files needed — synthesised in the browser.
 */

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let running = false;
const nodes: AudioNode[] = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function makeNoise(audioCtx: AudioContext): AudioBufferSourceNode {
  const bufferSize = audioCtx.sampleRate * 4;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

function addNode(n: AudioNode) { nodes.push(n); }

export function startOcean() {
  if (running || typeof window === "undefined") return;
  running = true;

  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") audioCtx.resume();

  masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(0, audioCtx.currentTime);
  masterGain.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 2.5);
  masterGain.connect(audioCtx.destination);
  addNode(masterGain);

  // ── Low rumble (deep ocean) ──────────────────────────────────────────
  const rumble = makeNoise(audioCtx);
  const lpRumble = audioCtx.createBiquadFilter();
  lpRumble.type = "lowpass";
  lpRumble.frequency.value = 80;
  lpRumble.Q.value = 0.8;
  const gRumble = audioCtx.createGain();
  gRumble.gain.value = 0.6;
  rumble.connect(lpRumble);
  lpRumble.connect(gRumble);
  gRumble.connect(masterGain);
  rumble.start();
  addNode(rumble); addNode(lpRumble); addNode(gRumble);

  // ── Mid surf (breaking waves) ────────────────────────────────────────
  const surf = makeNoise(audioCtx);
  const bpSurf = audioCtx.createBiquadFilter();
  bpSurf.type = "bandpass";
  bpSurf.frequency.value = 600;
  bpSurf.Q.value = 0.6;
  const gSurf = audioCtx.createGain();
  gSurf.gain.value = 0.38;
  surf.connect(bpSurf);
  bpSurf.connect(gSurf);
  gSurf.connect(masterGain);
  surf.start();
  addNode(surf); addNode(bpSurf); addNode(gSurf);

  // ── LFO wave swell (0.05 Hz ≈ 20-second wave cycle) ─────────────────
  const lfo = audioCtx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.value = 0.05;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 0.22;
  lfo.connect(lfoGain);
  lfoGain.connect(gSurf.gain);
  lfo.start();
  addNode(lfo); addNode(lfoGain);

  // ── Second swell LFO (0.08 Hz, out of phase) ─────────────────────────
  const lfo2 = audioCtx.createOscillator();
  lfo2.type = "sine";
  lfo2.frequency.value = 0.08;
  const lfo2Gain = audioCtx.createGain();
  lfo2Gain.gain.value = 0.14;
  lfo2.connect(lfo2Gain);
  lfo2Gain.connect(gRumble.gain);
  lfo2.start();
  addNode(lfo2); addNode(lfo2Gain);

  // ── High wind hiss ────────────────────────────────────────────────────
  const wind = makeNoise(audioCtx);
  const hpWind = audioCtx.createBiquadFilter();
  hpWind.type = "highpass";
  hpWind.frequency.value = 3200;
  const gWind = audioCtx.createGain();
  gWind.gain.value = 0.12;
  wind.connect(hpWind);
  hpWind.connect(gWind);
  gWind.connect(masterGain);
  wind.start();
  addNode(wind); addNode(hpWind); addNode(gWind);
}

export function stopOcean() {
  if (!running || !masterGain) return;
  running = false;
  const audioCtx = getCtx();
  masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
  setTimeout(() => {
    nodes.forEach(n => { try { (n as AudioScheduledSourceNode).stop?.(); } catch { /* noop */ } });
    nodes.length = 0;
    masterGain = null;
  }, 1600);
}

export function isPlaying() { return running; }

export function setVolume(v: number) {
  if (!masterGain) return;
  const audioCtx = getCtx();
  masterGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, v)), audioCtx.currentTime + 0.3);
}
