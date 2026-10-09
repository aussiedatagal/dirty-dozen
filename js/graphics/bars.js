import { el, text, frame } from '../svg.js';
import { shortName } from '../format.js';

const GROUPS = {
  top: ['Bok Choi', 'Capsicum', 'Cucumber'],
  overlap: ['Apples', 'Strawberries', 'Grapes', 'Nectarine', 'Potato'],
  clean: ['Cauliflower', 'Mushrooms'],
};

const DESCRIPTIONS = {
  all: 'Bar chart of 25 fresh foods by number of different chemicals found. Bok choi 16, apples and capsicum 11, cucumber and strawberries 10.',
  top: 'Bok choi, capsicum and cucumber highlighted. None are on the US list.',
  overlap: 'Apples, strawberries, grapes, nectarines and potatoes highlighted, the foods on both lists.',
  clean: 'Cauliflower and mushrooms highlighted, both on the US Clean Fifteen.',
  zero: 'Avocados, garlic, kiwifruit, onions and pumpkin had no chemicals found.',
};

export function init(container, foods) {
  const rows = foods.filter(f => f.fresh)
    .map(f => ({ name: f.name, count: f.chemicals.length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const max = rows[0].count;
  let marks = [];

  function draw() {
    const { svg, width, height } = frame(container);
    const left = Math.min(110, width * 0.3);
    const right = 28;
    const top = 22;
    const rowH = (height - top) / rows.length;
    const scale = v => (v / max) * (width - left - right);

    text(svg, 'Different chemicals found', { x: left, y: 12, class: 'muted', 'font-size': 12 });

    marks = rows.map((row, i) => {
      const y = top + i * rowH;
      const g = el('g', { class: 'row' }, svg);
      text(g, shortName(row.name), { x: left - 6, y: y + rowH * 0.72, 'text-anchor': 'end', 'font-size': Math.min(13, rowH * 0.8) });
      const bar = el('rect', { class: 'mark', x: left, y: y + rowH * 0.15, width: Math.max(scale(row.count), 1.5), height: rowH * 0.7, rx: 2 }, g);
      text(g, row.count, { x: left + scale(row.count) + 5, y: y + rowH * 0.72, 'font-size': Math.min(13, rowH * 0.8) });
      return { row, g, bar };
    });
  }

  function update(state) {
    const on = state === 'zero' ? rows.filter(r => r.count === 0).map(r => r.name) : GROUPS[state] ?? [];
    for (const { row, g, bar } of marks) {
      const lit = on.includes(row.name);
      bar.style.fill = state === 'all' ? 'var(--leaf)' : lit ? 'var(--leaf)' : 'var(--faint)';
      g.style.opacity = state === 'all' || lit ? 1 : 0.55;
      g.style.fontWeight = lit ? 700 : 400;
    }
    return DESCRIPTIONS[state];
  }

  draw();
  return { update, resize: draw };
}
