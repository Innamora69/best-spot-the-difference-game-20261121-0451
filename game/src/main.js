// The Curious Attic — Spot the Difference: boot and game loop.
// The canvas is a fixed logical frame of 1280 x 800, scaled to fit the
// window. With ?shot=<name> in the URL the game stages one screenshot
// scene, renders a single frame at a fixed time and stops: that is how the
// screenshots in screenshots/ are taken, and the frame is deterministic.

import { GameState } from './state.js';
import { SoundBank } from './audio.js';
import { draw, fitTransform } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';
import { VIEW } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const status = document.getElementById('status');

const state = new GameState();
const sounds = new SoundBank();
attachInput(canvas, state, sounds);

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function renderFrame(timeMs) {
  const { scale, ox, oy } = fitTransform(canvas.width, canvas.height);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#14101d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(scale, 0, 0, scale, ox, oy);
  draw(ctx, state, timeMs);
  if (status) {
    status.textContent = `The Curious Attic. Level ${state.levelIndex + 1}: ${state.level.name}. Found ${state.foundCount} of ${state.diffs.length}. Score ${state.score}.`;
  }
}

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  resize();
  stageShot(shot, state);
  // One deterministic frame: the animations sit at a fixed moment.
  renderFrame(1200);
} else {
  resize();
  window.addEventListener('resize', resize);
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    state.update(dt);
    renderFrame(now);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

export { VIEW };
