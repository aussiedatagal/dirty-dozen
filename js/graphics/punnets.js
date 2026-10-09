import { el, text, frame } from '../svg.js';

const DESCRIPTIONS = {
  punnets: '100 squares, one per berry punnet: 80 blueberry and 20 raspberry.',
  residues: '95 of 100 punnets had at least one pesticide. None were over the legal limit and none had a banned pesticide.',
  dimethoate: '95 of 100 punnets had at least one pesticide, all legal. Dimethoate use on berries was suspended in November 2025.',
};

export function init(container, berries) {
  const kinds = [
    { name: 'Blueberries', ...berries.blueberry },
    { name: 'Raspberries', ...berries.raspberry },
  ];
  let squares = [], notes = {};

  function draw() {
    const { svg, width, height } = frame(container);
    const cols = 10;
    const size = Math.min((width - 20) / cols, (height - 120) / 11, 30);
    const left = (width - cols * size) / 2;
    let y = 22;
    squares = [];

    for (const kind of kinds) {
      text(svg, `${kind.name} (${kind.samples} punnets)`, { x: left, y, 'font-size': 13, 'font-weight': 700 });
      y += 8;
      for (let i = 0; i < kind.samples; i++) {
        const sq = el('rect', {
          class: 'mark',
          x: left + (i % cols) * size + 1,
          y: y + Math.floor(i / cols) * size + 1,
          width: size - 2, height: size - 2, rx: 2,
        }, svg);
        squares.push({ sq, found: i < kind.with_residue });
      }
      y += Math.ceil(kind.samples / cols) * size + 24;
    }

    const key = el('g', { class: 'mark' }, svg);
    el('rect', { x: left, y: y - 12, width: 12, height: 12, fill: 'var(--muted)' }, key);
    text(key, 'At least one pesticide found', { x: left + 18, y, 'font-size': 12 });
    text(key, 'All within the legal limit. No banned pesticides.', { x: left, y: y + 20, 'font-size': 12, class: 'muted' });
    notes.key = key;

    const tag = el('g', { class: 'mark' }, svg);
    text(tag, 'Nov 2025: dimethoate suspended on berries', { x: left, y: y + 48, 'font-size': 15, 'font-weight': 700, fill: 'var(--plum)' });
    notes.tag = tag;
  }

  function update(state) {
    for (const { sq, found } of squares) {
      sq.style.fill = state !== 'punnets' && found ? 'var(--muted)' : 'var(--faint)';
    }
    notes.key.style.opacity = state === 'punnets' ? 0 : 1;
    notes.tag.style.opacity = state === 'dimethoate' ? 1 : 0;
    return DESCRIPTIONS[state];
  }

  draw();
  return { update, resize: draw };
}
