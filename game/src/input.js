// Pointer and keyboard input: buttons first, then the pictures.
// A click on a picture is mapped to panel coordinates, the same spot on
// either picture, and handed to the state machine.

import { PANEL, PANEL_LEFT_X, PANEL_RIGHT_X, VIEW } from './config.js';
import { fitTransform, getButtons } from './render.js';
import { SCREEN_PLAYING } from './state.js';

function toLogical(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const { scale, ox, oy } = fitTransform(rect.width, rect.height);
  return {
    x: (clientX - rect.left - ox) / scale,
    y: (clientY - rect.top - oy) / scale,
  };
}

function hitButton(buttons, x, y) {
  return buttons.find((b) => x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) ?? null;
}

export function attachInput(canvas, state, sounds) {
  function primaryAction(buttonId) {
    if (buttonId === 'start') {
      state.startGame();
      sounds.complete();
    } else if (buttonId === 'next') {
      state.nextLevel();
      sounds.click();
    } else if (buttonId === 'again') {
      state.startGame();
      sounds.complete();
    } else if (buttonId === 'retry') {
      state.retryLevel();
      sounds.click();
    } else if (buttonId === 'hint') {
      const diff = state.useHint();
      if (diff) sounds.hint();
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    sounds.ensure();
    const { x, y } = toLogical(canvas, event.clientX, event.clientY);
    const button = hitButton(getButtons(state), x, y);
    if (button) {
      primaryAction(button.id);
      return;
    }
    if (state.screen !== SCREEN_PLAYING) return;
    let panelX = null;
    if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + PANEL.width && y >= PANEL.top && y <= PANEL.top + PANEL.height) {
      panelX = x - PANEL_LEFT_X;
    } else if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + PANEL.width && y >= PANEL.top && y <= PANEL.top + PANEL.height) {
      panelX = x - PANEL_RIGHT_X;
    }
    if (panelX === null) return;
    const panelY = y - PANEL.top;
    const result = state.clickAt(panelX, panelY);
    if (result === 'found') sounds.found();
    else if (result === 'wrong') sounds.wrong();
    if (state.screen === 'level-complete') sounds.complete();
    if (state.screen === 'victory') sounds.victory();
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'h' || event.key === 'H') {
      const diff = state.useHint();
      if (diff) sounds.hint();
    } else if (event.key === 'r' || event.key === 'R') {
      if (state.screen === SCREEN_PLAYING) state.retryLevel();
    } else if (event.key === 'm' || event.key === 'M') {
      sounds.muted = !sounds.muted;
      state.muted = sounds.muted;
    } else if (event.key === 'Escape') {
      state.toTitle();
    } else if (event.key === 'Enter' || event.key === ' ') {
      const buttons = getButtons(state);
      if (buttons.length > 0) primaryAction(buttons[0].id);
    }
  });
}

export { VIEW };
