// app.js — Piano Chord Trainer logic

// ── State ────────────────────────────────────────────────────────────────────
const state = {
  isRunning: false,
  isPaused: false,
  intervalId: null,
  currentChord: null,
  chordPool: [],
  chordsRemaining: 0,
  totalChords: 20,
  intervalSeconds: 5,
  enabledCategories: ['triads', 'sevenths', 'extensions'],
  arpeggio: false,
};
window.state = state;

// ── DOM refs ─────────────────────────────────────────────────────────────────
const chordDisplay    = document.getElementById('chord-display');
const chordLabel      = document.getElementById('chord-label');
const startBtn        = document.getElementById('btn-start');
const pauseBtn        = document.getElementById('btn-pause');
const stopBtn         = document.getElementById('btn-stop');
const intervalSlider  = document.getElementById('interval-slider');
const intervalValue   = document.getElementById('interval-value');
const chordCountInput = document.getElementById('chord-count');
const progressBar     = document.getElementById('progress-bar');
const progressText    = document.getElementById('progress-text');
const categoryToggles = document.querySelectorAll('.category-toggle');
const summaryPanel    = document.getElementById('summary-panel');
const summaryText     = document.getElementById('summary-text');
const timerRing       = document.getElementById('timer-ring');
const themeToggleBtn  = document.getElementById('btn-theme-toggle');
const revealBtn       = document.getElementById('btn-reveal-keys');
const replayBtn       = document.getElementById('btn-replay-chord');
const kbdWrap         = document.getElementById('kbd-wrap');
const playbackRadios  = document.querySelectorAll('input[name="playback-mode"]');

// ── Init ─────────────────────────────────────────────────────────────────────
function init() {
  intervalSlider.value = state.intervalSeconds;
  intervalValue.textContent = state.intervalSeconds + 's';
  chordCountInput.value = state.totalChords;
  applyStoredTheme();
  updateUI();
  rebuildPool();
}

// ── Theme ────────────────────────────────────────────────────────────────────
function applyStoredTheme() {
  const theme = localStorage.getItem('chord-trainer-theme') || 'dark';
  document.body.classList.toggle('light', theme === 'light');
  themeToggleBtn.textContent = theme === 'light' ? '☀' : '🌙';
}

function toggleTheme() {
  const isLight = document.body.classList.toggle('light');
  localStorage.setItem('chord-trainer-theme', isLight ? 'light' : 'dark');
  themeToggleBtn.textContent = isLight ? '☀' : '🌙';
}

// ── Pool ─────────────────────────────────────────────────────────────────────
function rebuildPool() {
  state.chordPool = buildChordPool(state.enabledCategories);
}

// ── Session control ───────────────────────────────────────────────────────────
function startSession() {
  rebuildPool();
  if (state.chordPool.length === 0) {
    summaryText.textContent = 'Enable at least one chord category to start.';
    summaryPanel.classList.remove('hidden');
    return;
  }
  state.totalChords   = parseInt(chordCountInput.value, 10) || 20;
  state.chordsRemaining = state.totalChords;
  state.isRunning     = true;
  state.isPaused      = false;

  summaryPanel.classList.add('hidden');
  updateUI();
  showNextChord();
  scheduleNext();
}

function pauseSession() {
  if (!state.isRunning) return;
  state.isPaused = !state.isPaused;
  updateUI();
  if (state.isPaused) {
    clearInterval(state.intervalId);
    stopTimerAnimation();
  } else {
    scheduleNext();
  }
}

function endSession() {
  clearInterval(state.intervalId);
  state.isRunning = false;
  state.isPaused  = false;
  stopTimerAnimation();
  showSummary();
  updateUI();
}

function stopSession() {
  endSession();
  resetDisplay();
}

function scheduleNext() {
  clearInterval(state.intervalId);
  startTimerAnimation();
  state.intervalId = setInterval(() => {
    if (state.chordsRemaining <= 1) {
      showNextChord();
      endSession();
      return;
    }
    showNextChord();
    startTimerAnimation();
  }, state.intervalSeconds * 1000);
}

// ── Chord display ─────────────────────────────────────────────────────────────
function showNextChord() {
  stopAllNotes();
  state.chordsRemaining--;
  const chord = getRandomChord(state.chordPool);
  state.currentChord = chord;

  chordDisplay.textContent = chord.display;
  chordLabel.textContent   = chord.label;

  // Prep keyboard for this chord, hidden until the user clicks the chevron
  kbdWrap.innerHTML = renderKeyboard(chord.intervals, chord.root);
  kbdWrap.classList.add('hidden');
  revealBtn.classList.remove('open', 'hidden');
  replayBtn.classList.add('hidden');

  // Animate in
  chordDisplay.classList.remove('pop');
  void chordDisplay.offsetWidth; // reflow
  chordDisplay.classList.add('pop');

  updateProgress();
}

function resetDisplay() {
  stopAllNotes();
  chordDisplay.textContent = '—';
  chordLabel.textContent   = 'Press Start to begin';
  kbdWrap.innerHTML = '';
  kbdWrap.classList.add('hidden');
  revealBtn.classList.add('hidden');
  revealBtn.classList.remove('open');
  replayBtn.classList.add('hidden');
  updateProgress();
}

// ── Progress ──────────────────────────────────────────────────────────────────
function updateProgress() {
  const played = state.totalChords - state.chordsRemaining;
  const pct    = state.isRunning ? (played / state.totalChords) * 100 : 0;
  progressBar.style.width = pct + '%';
  progressText.textContent = state.isRunning
    ? `${played} / ${state.totalChords} chords`
    : '';
}

// ── Timer ring animation ──────────────────────────────────────────────────────
function startTimerAnimation() {
  timerRing.style.transition = 'none';
  timerRing.style.strokeDashoffset = '283'; // full circle hidden
  void timerRing.offsetWidth;
  timerRing.style.transition = `stroke-dashoffset ${state.intervalSeconds}s linear`;
  timerRing.style.strokeDashoffset = '0';
}

function stopTimerAnimation() {
  timerRing.style.transition = 'none';
  timerRing.style.strokeDashoffset = '283';
}

// ── Summary ───────────────────────────────────────────────────────────────────
function showSummary() {
  const played = state.totalChords - state.chordsRemaining;
  summaryText.textContent = played > 0
    ? `You practised ${played} chord${played !== 1 ? 's' : ''}. Nice work! 🎹`
    : 'Session stopped early.';
  summaryPanel.classList.remove('hidden');
}

// ── UI state ──────────────────────────────────────────────────────────────────
function updateUI() {
  startBtn.disabled = state.isRunning;
  pauseBtn.disabled = !state.isRunning;
  stopBtn.disabled  = !state.isRunning;
  pauseBtn.textContent = state.isPaused ? 'Resume' : 'Pause';
}

// ── Event listeners ───────────────────────────────────────────────────────────
startBtn.addEventListener('click', startSession);
pauseBtn.addEventListener('click', pauseSession);
stopBtn.addEventListener('click',  stopSession);
themeToggleBtn.addEventListener('click', toggleTheme);

revealBtn.addEventListener('click', () => {
  const nowHidden = kbdWrap.classList.toggle('hidden');
  revealBtn.classList.toggle('open', !nowHidden);
  replayBtn.classList.toggle('hidden', nowHidden);
  if (!nowHidden && state.currentChord) {
    playChord(state.currentChord.root, state.currentChord.intervals, {
      mode: state.arpeggio ? 'arpeggio' : 'block',
    });
  }
});

replayBtn.addEventListener('click', () => {
  if (!state.currentChord) return;
  stopAllNotes();
  playChord(state.currentChord.root, state.currentChord.intervals, {
    mode: state.arpeggio ? 'arpeggio' : 'block',
  });
});

playbackRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) state.arpeggio = (radio.value === 'arpeggio');
  });
});

intervalSlider.addEventListener('input', () => {
  intervalValue.textContent = intervalSlider.value + 's';
});

intervalSlider.addEventListener('change', () => {
  state.intervalSeconds = parseInt(intervalSlider.value, 10);
  if (state.isRunning && !state.isPaused) scheduleNext();
});

categoryToggles.forEach(toggle => {
  toggle.addEventListener('change', () => {
    const cat = toggle.dataset.category;
    if (toggle.checked) {
      if (!state.enabledCategories.includes(cat)) state.enabledCategories.push(cat);
    } else {
      state.enabledCategories = state.enabledCategories.filter(c => c !== cat);
    }
    rebuildPool();
  });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
init();