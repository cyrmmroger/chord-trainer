// chords.js — Chord data + pool builder

const ROOTS = [
  { display: 'C',  label: 'C' },
  { display: 'C♯', label: 'C-sharp' },
  { display: 'D',  label: 'D' },
  { display: 'E♭', label: 'E-flat' },
  { display: 'E',  label: 'E' },
  { display: 'F',  label: 'F' },
  { display: 'F♯', label: 'F-sharp' },
  { display: 'G',  label: 'G' },
  { display: 'A♭', label: 'A-flat' },
  { display: 'A',  label: 'A' },
  { display: 'B♭', label: 'B-flat' },
  { display: 'B',  label: 'B' },
];

const QUALITIES = {
  triads: [
    { suffix: '',     name: 'major' },
    { suffix: 'm',    name: 'minor' },
    { suffix: '°',    name: 'diminished' },
    { suffix: '+',    name: 'augmented' },
    { suffix: 'sus2', name: 'sus2' },
    { suffix: 'sus4', name: 'sus4' },
  ],
  sevenths: [
    { suffix: 'maj7', name: 'major 7' },
    { suffix: 'm7',   name: 'minor 7' },
    { suffix: '7',    name: 'dominant 7' },
    { suffix: '°7',   name: 'diminished 7' },
    { suffix: 'ø7',   name: 'half-diminished 7' },
    { suffix: 'mMaj7', name: 'minor-major 7' },
  ],
  extensions: [
    { suffix: '9',    name: 'dominant 9' },
    { suffix: 'maj9', name: 'major 9' },
    { suffix: 'm9',   name: 'minor 9' },
    { suffix: '11',   name: 'dominant 11' },
    { suffix: '13',   name: 'dominant 13' },
    { suffix: 'add9', name: 'add 9' },
  ],
};

function buildChordPool(enabledCategories) {
  const pool = [];
  for (const category of enabledCategories) {
    const qualities = QUALITIES[category];
    if (!qualities) continue;
    for (const root of ROOTS) {
      for (const q of qualities) {
        pool.push({
          display: root.display + q.suffix,
          label:   `${root.label} ${q.name}`,
        });
      }
    }
  }
  return pool;
}

function getRandomChord(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
