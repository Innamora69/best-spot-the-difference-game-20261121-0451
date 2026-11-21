// Every difference in the game, one table per level.
// A difference is a spot on the picture (x, y, radius, in panel coordinates),
// a short label the game celebrates when it is found, and the kind of change
// it is: the scene painters read the same ids to draw the changed panel.
// The left panel is always the original; the right panel applies these.

export const DIFFERENCES = {
  attic: [
    { id: 'moon', label: 'the vanished moon', x: 118, y: 108, r: 34, kind: 'missing' },
    { id: 'lamp-colour', label: 'the lamp that changed colour', x: 300, y: 96, r: 30, kind: 'colour' },
    { id: 'clock-hands', label: 'the clock showing another time', x: 448, y: 92, r: 30, kind: 'moved' },
    { id: 'cat-tail', label: "the cat's tail", x: 338, y: 482, r: 26, kind: 'moved' },
    { id: 'books-count', label: 'a book gone from the shelf', x: 548, y: 248, r: 26, kind: 'count' },
    { id: 'frame-picture', label: 'the painting in the frame', x: 178, y: 226, r: 34, kind: 'changed' },
    { id: 'plant-flower', label: 'a flower that bloomed', x: 528, y: 402, r: 24, kind: 'extra' },
  ],
  garden: [
    { id: 'owl', label: 'the owl on the branch', x: 96, y: 150, r: 30, kind: 'missing' },
    { id: 'lantern-flame', label: 'the lantern gone dark', x: 486, y: 176, r: 28, kind: 'colour' },
    { id: 'fountain-jets', label: 'a missing jet of water', x: 343, y: 242, r: 28, kind: 'count' },
    { id: 'tulip-colour', label: 'the tulip that changed colour', x: 168, y: 496, r: 24, kind: 'colour' },
    { id: 'stepping-stone', label: 'a stepping stone gone', x: 330, y: 512, r: 26, kind: 'count' },
    { id: 'moon-craters', label: 'the craters on the moon', x: 512, y: 88, r: 30, kind: 'changed' },
    { id: 'bench-cushion', label: 'the cushion on the bench', x: 128, y: 428, r: 30, kind: 'missing' },
    { id: 'firefly', label: 'a firefly that flew away', x: 402, y: 176, r: 22, kind: 'count' },
  ],
  bookshop: [
    { id: 'globe', label: 'the globe turned round', x: 148, y: 384, r: 32, kind: 'moved' },
    { id: 'teacup-steam', label: 'the steam over the teacup', x: 462, y: 382, r: 28, kind: 'missing' },
    { id: 'ladder-rung', label: 'a missing rung of the ladder', x: 529, y: 320, r: 26, kind: 'count' },
    { id: 'book-spine', label: 'the book spine that changed colour', x: 236, y: 196, r: 24, kind: 'colour' },
    { id: 'window-rain', label: 'the rain on the window', x: 452, y: 128, r: 34, kind: 'changed' },
    { id: 'cat-ear', label: "the cat's flopped ear", x: 348, y: 436, r: 24, kind: 'moved' },
    { id: 'lamp-stripes', label: 'the stripes on the lampshade', x: 300, y: 96, r: 30, kind: 'changed' },
    { id: 'shop-sign', label: 'the little shop sign', x: 88, y: 88, r: 26, kind: 'extra' },
    { id: 'stack-books', label: 'a book gone from the stack', x: 238, y: 428, r: 26, kind: 'count' },
  ],
};

export function differencesFor(levelId) {
  return DIFFERENCES[levelId] ?? [];
}
