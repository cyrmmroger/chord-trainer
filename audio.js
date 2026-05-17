// audio.js — Lazy-loaded piano sampler for the reveal step.
//
// Exposes three globals consumed by app.js:
//   initAudio()                        → Promise<instrument | null>
//   playChord(root, intervals, opts)   → triggers a chord; opts.mode = 'block' | 'arpeggio'
//   stopAllNotes()                     → cuts any in-flight notes
//
// Depends on `Soundfont` (loaded from soundfont-player via the CDN script in
// index.html) and on `AudioContext`. Both must exist on the window before the
// first reveal click — they're not required at boot.

const AUDIO_INSTRUMENT_NAME = 'acoustic_grand_piano';
const ARPEGGIO_STAGGER_S = 0.08;
const NOTE_DURATION_S = 1.5;

let _instrumentPromise = null;
let _audioContext = null;

function initAudio() {
  if (_instrumentPromise) return _instrumentPromise;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx || typeof Soundfont === 'undefined') {
    _instrumentPromise = Promise.resolve(null);
    return _instrumentPromise;
  }
  _audioContext = new Ctx();
  _instrumentPromise = Soundfont.instrument(_audioContext, AUDIO_INSTRUMENT_NAME)
    .catch(err => {
      console.warn('chord-trainer: soundfont load failed, audio disabled', err);
      return null;
    });
  return _instrumentPromise;
}

function playChord(root, intervals, opts) {
  const mode = opts && opts.mode === 'arpeggio' ? 'arpeggio' : 'block';
  initAudio().then(instrument => {
    if (!instrument) return;
    const now = _audioContext ? _audioContext.currentTime : 0;
    intervals.forEach((iv, i) => {
      const midi = 60 + root + iv;
      const time = mode === 'arpeggio' ? now + i * ARPEGGIO_STAGGER_S : now;
      instrument.play(midi, time, { duration: NOTE_DURATION_S });
    });
  });
}

function stopAllNotes() {
  if (!_instrumentPromise) return;
  _instrumentPromise.then(instrument => {
    if (instrument) instrument.stop();
  });
}
