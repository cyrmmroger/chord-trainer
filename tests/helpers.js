// Shared test setup. Loads index.html into jsdom with the soundfont CDN
// script stripped, stubs Soundfont + AudioContext, then evaluates the local
// JS files in the documented load order (chords, keyboard, audio, app).

const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const ROOT = path.join(__dirname, '..');

function readFile(name) {
  return fs.readFileSync(path.join(ROOT, name), 'utf8');
}

function createSpy() {
  const fn = (...args) => {
    fn.calls.push(args);
    return fn._returnValue;
  };
  fn.calls = [];
  fn._returnValue = undefined;
  return fn;
}

function createInstrumentMock() {
  return { play: createSpy(), stop: createSpy() };
}

function createSoundfontMock({ shouldFail = false } = {}) {
  const instrument = createInstrumentMock();
  const mock = {
    _instrument: instrument,
    _shouldFail: shouldFail,
    instrument: createSpy(),
  };
  if (shouldFail) {
    const rejection = Promise.reject(new Error('soundfont fetch failed'));
    // Suppress the unhandled-rejection warning at construction time; the
    // production code under test attaches its own catch when it awaits.
    rejection.catch(() => {});
    mock.instrument._returnValue = rejection;
  } else {
    mock.instrument._returnValue = Promise.resolve(instrument);
  }
  return mock;
}

function createAudioContextStub() {
  return class AudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
      this.destination = {};
    }
    resume() {
      this.state = 'running';
      return Promise.resolve();
    }
  };
}

// Strips <script src=...> and inline <script> tags so jsdom doesn't try to
// fetch or execute them. We evaluate the local scripts ourselves below.
function stripScripts(html) {
  return html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
}

const LOAD_ORDER = ['chords.js', 'keyboard.js', 'audio.js', 'app.js'];

function loadPage({ soundfontFails = false } = {}) {
  const html = stripScripts(readFile('index.html'));
  const dom = new JSDOM(html, {
    url: 'http://localhost/',
    pretendToBeVisual: true,
    runScripts: 'dangerously',
  });
  const { window } = dom;

  const soundfontMock = createSoundfontMock({ shouldFail: soundfontFails });
  window.Soundfont = soundfontMock;
  const AudioContextStub = createAudioContextStub();
  window.AudioContext = AudioContextStub;
  window.webkitAudioContext = AudioContextStub;

  for (const file of LOAD_ORDER) {
    const fullPath = path.join(ROOT, file);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, 'utf8');
    const scriptEl = window.document.createElement('script');
    scriptEl.textContent = src;
    window.document.head.appendChild(scriptEl);
  }

  return {
    window,
    document: window.document,
    soundfontMock,
    instrumentMock: soundfontMock._instrument,
    flush,
  };
}

// Wait a few microtask ticks so any chained promises (initAudio → playChord)
// settle before assertions run. Two ticks is enough for our mocks.
async function flush() {
  await new Promise(r => setImmediate(r));
  await new Promise(r => setImmediate(r));
}

// Start a session without leaving a real setInterval running.
function startTestSession(window) {
  window.startSession();
  window.clearInterval(window.state.intervalId);
  window.state.intervalId = null;
}

function clickReveal(document) {
  document.getElementById('btn-reveal-keys').click();
}

module.exports = {
  loadPage,
  startTestSession,
  clickReveal,
  flush,
  createSpy,
};
