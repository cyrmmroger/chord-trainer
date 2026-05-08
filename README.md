# chord-trainer
# 🎹 Piano Chord Trainer

A lightweight, browser-based piano chord trainer. It cycles through random chords on a configurable timer so you can build muscle memory through focused repetition. Built with plain HTML, CSS, and vanilla JavaScript — no frameworks, no dependencies, runs entirely in the browser.

---

## Features

- **Randomized chord drills** — cycles through a set of chords in random order so you can't just memorize the sequence
- **Configurable timer** — set the interval between chords to match your current skill level
- **Chord type filters** — focus on what you're working on (major, minor, 7th chords, etc.)
- **Session controls** — start, pause, and stop your practice session at any time
- **Session summary** — see how many chords you practiced at the end of each session
- **No install needed** — open it in a browser and start playing
- **Mobile friendly** — made to display well on a mobile device which you can place in front of you on your piano stand while you play

---

## Getting Started

### Use it online

The app is hosted on GitHub Pages:
👉 **https://cyrmmroger.github.io/chord-trainer/**

### Run it locally

```bash
git clone https://github.com/cyrmmroger/piano-chord-trainer.git
cd piano-chord-trainer
```

Then just open `index.html` in your browser. No build step, no dependencies.

---

## Project Structure

```
piano-chord-trainer/
├── index.html    # App shell and layout
├── style.css     # Styles
├── app.js        # Timer logic and UI interactions
└── chords.js     # Chord data and display logic
```

---

## Roadmap

- [x] Core chord display + timer
- [x] UI controls (interval slider, chord count, start/pause/stop)
- [ ] Chord type filter toggles
- [ ] Progress bar + session summary
- [ ] Self-scoring (did you get it right?)
- [ ] Visual piano diagrams
- [ ] Audio playback

---

## Built With

- HTML, CSS, vanilla JavaScript
- Hosted on [GitHub Pages](https://pages.github.com/) (free)

---

## License

MIT
