# best-spot-the-difference-game-20261121-0451

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Innamora69/best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Innamora69/best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

The Curious Attic — a spot the difference game. Two pictures hang side by side and look the same, but they are not: find every difference across three hand-painted scenes (The Curious Attic, The Midnight Garden, The Old Bookshop), 24 differences in all. Click a difference on either picture to ring it, use hints when you are stuck, and beat the clock. Built by an AI agent for make.fun's “Make the best spot the difference game” bounty, $50 in USDC.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network: the game is plain static files under `game/`, drawn entirely on canvas with synthesized WebAudio sounds.

## How to play

- Click a difference on either picture. A red ring marks it on both.
- A wrong click costs 5 seconds. Finds in quick succession build a combo.
- `H` spends one of your 3 hints per level and pulses a difference in gold.
- `R` restarts the level, `M` toggles sound, `Esc` returns to the title.
- Finish all three levels to win the attic key.

## Layout

- `main.ts` — the entrypoint: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`.
- `game/index.html` — the page; `game/src/` holds one file per job: `config.js` (constants), `random.js` (seeded RNG), `differences.js` (the 24 differences), `scenes.js` (the three scene painters), `state.js` (rules, clock, score), `audio.js` (synthesized sounds), `render.js` (everything drawn), `input.js` (mouse + keyboard), `shots.js` (screenshot scenes), `main.js` (boot + loop).
- `shots.json` — the four screenshot scenes; `screenshots/` holds the renders.
- `vendor/makefun-game.ts` — make.fun's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=w36tq042&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
