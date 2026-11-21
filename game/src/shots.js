// The screenshot scenes behind ?shot=start|play|level2|end.
// Each one stages a real game state — title, mid-hunt, second level, victory —
// through the same state machine the live game uses, so the frame is what a
// real game looks like at that moment, and the same seed always gives the
// same frame. main.js renders exactly one frame for a shot and stops.

export function stageShot(name, state) {
  if (name === 'play') {
    // Mid-hunt on level 1: three differences found and ringed, four to go,
    // the counter reading 3 / 7 and the clock still generous.
    state.stagePlay(0, ['moon', 'lamp-colour', 'clock-hands'], 107, 325);
    return { screen: state.screen };
  }
  if (name === 'level2') {
    // Mid-hunt on level 2: two found, six still hiding in the garden.
    state.stagePlay(1, ['owl', 'lantern-flame'], 121, 700);
    return { screen: state.screen };
  }
  if (name === 'level3') {
    // Mid-hunt on level 3: three found in the bookshop, six still hiding.
    state.stagePlay(2, ['globe', 'teacup-steam', 'book-spine'], 143, 1420);
    return { screen: state.screen };
  }
  if (name === 'end') {
    // The victory screen after all three levels.
    state.stageVictory(2450, 24, 24, 31);
    return { screen: state.screen };
  }
  state.toTitle();
  return { screen: state.screen };
}
