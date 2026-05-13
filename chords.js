// chords.js — Chord data + pool builder

const ROOTS = [
  { display: 'C',  label: 'C',       semitone: 0  },
  { display: 'C♯', label: 'C-sharp', semitone: 1  },
  { display: 'D',  label: 'D',       semitone: 2  },
  { display: 'E♭', label: 'E-flat',  semitone: 3  },
  { display: 'E',  label: 'E',       semitone: 4  },
  { display: 'F',  label: 'F',       semitone: 5  },
  { display: 'F♯', label: 'F-sharp', semitone: 6  },
  { display: 'G',  label: 'G',       semitone: 7  },
  { display: 'A♭', label: 'A-flat',  semitone: 8  },
  { display: 'A',  label: 'A',       semitone: 9  },
  { display: 'B♭', label: 'B-flat',  semitone: 10 },
  { display: 'B',  label: 'B',       semitone: 11 },
];

// Each quality lists `intervals` as semitones above the root (mod 12).
// The keyboard renderer collapses these into a single octave.
const QUALITIES = {
  triads: [
    { suffix: '',     name: 'major',      intervals: [0, 4, 7] },
    { suffix: 'm',    name: 'minor',      intervals: [0, 3, 7] },
    { suffix: '°',    name: 'diminished', intervals: [0, 3, 6] },
    { suffix: '+',    name: 'augmented',  intervals: [0, 4, 8] },
    { suffix: 'sus2', name: 'sus2',       intervals: [0, 2, 7] },
    { suffix: 'sus4', name: 'sus4',       intervals: [0, 5, 7] },
  ],
  sevenths: [
    { suffix: 'maj7',  name: 'major 7',           intervals: [0, 4, 7, 11] },
    { suffix: 'm7',    name: 'minor 7',           intervals: [0, 3, 7, 10] },
    { suffix: '7',     name: 'dominant 7',        intervals: [0, 4, 7, 10] },
    { suffix: '°7',    name: 'diminished 7',      intervals: [0, 3, 6, 9]  },
    { suffix: 'ø7',    name: 'half-diminished 7', intervals: [0, 3, 6, 10] },
    { suffix: 'mMaj7', name: 'minor-major 7',     intervals: [0, 3, 7, 11] },
  ],
  extensions: [
    { suffix: '9',    name: 'dominant 9',  intervals: [0, 2, 4, 7, 10]        },
    { suffix: 'maj9', name: 'major 9',     intervals: [0, 2, 4, 7, 11]        },
    { suffix: 'm9',   name: 'minor 9',     intervals: [0, 2, 3, 7, 10]        },
    { suffix: '11',   name: 'dominant 11', intervals: [0, 2, 5, 7, 10]        },
    { suffix: '13',   name: 'dominant 13', intervals: [0, 2, 4, 5, 7, 9, 10]  },
    { suffix: 'add9', name: 'add 9',       intervals: [0, 2, 4, 7]            },
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
          display:   root.display + q.suffix,
          label:     `${root.label} ${q.name}`,
          root:      root.semitone,
          intervals: q.intervals,
        });
      }
    }
  }
  return pool;
}

function getRandomChord(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}
