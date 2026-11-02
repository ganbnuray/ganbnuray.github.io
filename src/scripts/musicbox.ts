// a music box playing the swan theme from tchaikovsky's swan lake (1877, public domain).
// every note is synthesized with web audio, so no sound file is loaded.

const BPM = 92;
const BEAT = 60 / BPM;
const VOLUME = 0.22;

// the swan theme, bar by bar, as written for piano. "F#5:1.5" is a note and its length in beats,
// "r" is a rest. the music box plays it an octave higher, where its teeth ring.
const BARS = [
  'r:4',
  'r:4',
  'F#5:2 B4:.5 C#5:.5 D5:.5 E5:.5',
  'F#5:1.5 D5:.5 F#5:1.5 D5:.5',
  'F#5:1.5 B4:.5 D5:.5 B4:.5 F#4:.5 D5:.5',
  'B4:2 r:.5 E5:.5 D5:.5 C#5:.5',
  'F#5:2 B4:.5 C#5:.5 D5:.5 E5:.5',
  'F#5:1.5 D5:.5 F#5:1.5 D5:.5',
  'F#5:1.5 B4:.5 D5:.5 B4:.5 F#4:.5 D5:.5',
  'B4:1 r:2 B4:1',
  'C#5:1 D5:1 E5:1 F#5:.5 G5:.5',
  'A5:1.5 G5:.5 F#5:1 G5:.5 A5:.5',
  'B5:1.5 A5:.5 G5:1 A5:.5 B5:.5',
  'C#6:1.5 B5:.5 F#5:.5 D5:.5 C#5:.5 B4:.5',
  'C#5:1 D5:1 E5:1 F#5:.5 G5:.5',
  'A5:1.5 G5:.5 F#5:1 G5:.5 A5:.5',
  'B5:1.5 A5:.5 G5:1 A5:.5 B5:.5',
  'C6:1.5 G5:.5 E5:1 E5:.5 C6:.5',
  'C#6:1.5 G#5:.5 C#6:1.5 F#5:.5',
  'F#5:2 B4:.5 C#5:.5 D5:.5 E5:.5',
  'F#5:1.5 D5:.5 F#5:1.5 D5:.5',
  'F#5:1.5 B4:.5 D5:.5 B4:.5 F#4:.5 D5:.5',
  'B4:2 r:.5 E5:.5 D5:.5 C#5:.5',
  'F#5:2 B4:.5 C#5:.5 D5:.5 E5:.5',
  'F#5:1.5 D5:.5 F#5:1.5 D5:.5',
  'F#5:1.5 B4:.5 D5:.5 B4:.5 F#4:.5 D5:.5',
  'B4:2 r:2',
];

// the left hand: a broken chord for each half bar, from the same score.
const BM = 'B2 D3 F#3 D3';
const EM6 = 'B2 E3 G3 E3';
const TO_V = 'G2 B2 F#2 A#2';
const A = 'A2 C#3 E3 C#3';
const FSM = 'F#2 A2 C#3 A2';
const EM = 'E2 G2 B2 G2';
const CS = 'C#3 E#3 G#3 E#3';
const FS = 'F#3 A#3 C#4 A#3';
const C = 'C3 E3 G3 E3';
const HALVES: (string | null)[][] = [
  [BM, BM], [BM, BM], [BM, EM6], [BM, BM], [BM, TO_V], [BM, EM6], [BM, EM6], [BM, BM], [BM, TO_V],
  ['B2', null], [A, A], [FSM, FSM], [EM, EM], [CS, FS], [A, A], [FSM, FSM], [EM, EM], [C, C], [CS, FS],
  [BM, EM6], [BM, BM], [BM, TO_V], [BM, EM6], [BM, EM6], [BM, BM], [BM, TO_V], [BM, 'B2'],
];

// loudness of the melody in each bar, following the dynamics in the score (mp, swells to f and ff).
const LEVELS = [
  0, 0, 0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 0.62, 0.6,
  0.62, 0.72, 0.85, 0.95, 0.5, 0.62, 0.78, 0.88, 0.85,
  0.72, 0.65, 0.62, 0.6, 0.6, 0.58, 0.56, 0.55,
];

const PC: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
function midi(name: string) {
  const m = /^([A-G])([#b]?)(-?\d)$/.exec(name);
  if (!m) throw new Error(`bad note ${name}`);
  return 12 * (Number(m[3]) + 1) + PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
}

type Note = { beat: number; midi: number; level: number };

function arrangement() {
  const notes: Note[] = [];
  BARS.forEach((bar, i) => {
    let beat = i * 4;
    for (const token of bar.split(' ')) {
      const [name, len] = token.split(':');
      if (name !== 'r') notes.push({ beat, midi: midi(name) + 12, level: LEVELS[i] });
      beat += Number(len);
    }
    HALVES[i].forEach((half, h) => {
      if (!half) return;
      const tones = half.split(' ');
      // a single tone is held for the half bar, four tones are played as eighths
      tones.forEach((t, k) => notes.push({ beat: i * 4 + h * 2 + k * 0.5, midi: midi(t) + 24, level: 0.13 + LEVELS[i] * 0.06 }));
    });
  });
  return { notes, beats: BARS.length * 4 + 4 };
}

const SONG = arrangement();

const freq = (midi: number) => 440 * Math.pow(2, (midi - 69) / 12);

// a short burst of noise that fades over a couple of seconds, used as a small room echo.
function roomEcho(ctx: BaseAudioContext) {
  const seconds = 2.2;
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

let clickNoise: AudioBuffer | null = null;

function pluck(ctx: BaseAudioContext, out: AudioNode, midi: number, at: number, level: number) {
  const f = freq(midi);
  const ring = 1.1 + Math.max(0, 96 - midi) * 0.03; // lower teeth ring a little longer
  // a pure tone, a twin a hair sharp for shimmer, and a faint high partial that dies fast.
  const parts: [number, number, number][] = [
    [1, 1, ring],
    [1.0025, 0.35, ring * 0.8],
    [5.4, 0.05, 0.09],
  ];
  for (const [mult, gain, decay] of parts) {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = f * mult;
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(level * gain, at + 0.003);
    env.gain.exponentialRampToValueAtTime(0.0001, at + decay);
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + decay + 0.05);
  }
  // the tiny metallic tick of the pin catching the tooth.
  if (!clickNoise) {
    clickNoise = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.012), ctx.sampleRate);
    const d = clickNoise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  }
  const tick = ctx.createBufferSource();
  tick.buffer = clickNoise;
  const band = ctx.createBiquadFilter();
  band.type = 'bandpass';
  band.frequency.value = Math.min(9000, f * 3);
  band.Q.value = 4;
  const tg = ctx.createGain();
  tg.gain.value = level * 0.12;
  tick.connect(band).connect(tg).connect(out);
  tick.start(at);
}

// schedules one full play through starting at `start`, and returns when it ends.
function scheduleLoop(ctx: BaseAudioContext, out: AudioNode, start: number) {
  for (const n of SONG.notes) {
    // a few milliseconds of looseness, like a real comb
    pluck(ctx, out, n.midi, start + n.beat * BEAT + Math.random() * 0.01, n.level);
  }
  return start + SONG.beats * BEAT;
}

// builds the sound chain: gentle low cut, then dry plus a soft echo.
function chain(ctx: BaseAudioContext) {
  const master = ctx.createGain();
  master.gain.value = VOLUME;
  const lowCut = ctx.createBiquadFilter();
  lowCut.type = 'highpass';
  lowCut.frequency.value = 280;
  const dry = ctx.createGain();
  dry.gain.value = 0.8;
  const wet = ctx.createGain();
  wet.gain.value = 0.32;
  const echo = roomEcho(ctx);
  lowCut.connect(dry).connect(master);
  lowCut.connect(echo).connect(wet).connect(master);
  master.connect(ctx.destination);
  return { input: lowCut, master };
}

// starts the music and returns controls to mute it or stop it for good.
export function playMusicBox() {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return { stop() {}, toggleMute: () => false };
  const ctx = new Ctx();
  const { input, master } = chain(ctx);

  let next = ctx.currentTime + 0.15;
  let muted = false;

  // schedule a little ahead of time so the music never stutters.
  const schedule = () => {
    while (next < ctx.currentTime + 1.5) next = scheduleLoop(ctx, input, next);
  };
  schedule();
  const timer = setInterval(schedule, 400);

  const onVisibility = () => {
    if (document.hidden) void ctx.suspend();
    else void ctx.resume();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return {
    stop() {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      setTimeout(() => void ctx.close(), 700);
    },
    toggleMute() {
      muted = !muted;
      master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.05);
      return muted;
    },
  };
}
