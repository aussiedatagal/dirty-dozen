import { el, text, frame } from '../svg.js';

const EVENTS = [
  { date: 2013.7, label: 'May 2013 and Feb 2014', note: 'Groceries bought and tested', step: 'bought' },
  { date: 2019.45, label: 'June 2019', note: 'Pesticide results published', step: 'bought' },
  { date: 2021.75, label: 'July and Dec 2021', note: 'Next two studies: dioxins, then PFAS', step: 'since' },
  { date: 2026.78, label: 'October 2026', note: 'No pesticide study since', step: 'since', now: true },
];

const DESCRIPTIONS = {
  bought: 'Timeline: groceries bought May 2013 and February 2014, results published June 2019.',
  since: 'Timeline: two later studies in 2021 tested dioxins and PFAS. No pesticide study since.',
  apples: 'Grid of 170 squares, one per apple sample tested in 2024-25.',
  'apples-over': '6 of 170 apple samples were over the legal limit for iprodione and 4 more above half of it.',
};

export function init(container, apples) {
  const year = apples['2024-25'];
  let tl, grid, events = [], squares = [];

  function draw() {
    const { svg, width, height } = frame(container);

    // vertical timeline, years running down the page
    const top = 24, bottom = height - 24;
    const y = d => top + ((d - 2013) / (2027 - 2013)) * (bottom - top);
    const lineX = Math.min(70, width * 0.18);
    tl = el('g', { class: 'mark' }, svg);
    el('line', { x1: lineX, x2: lineX, y1: y(2013), y2: y(2027), stroke: 'var(--muted)', 'stroke-width': 2 }, tl);
    for (const yr of [2013, 2016, 2019, 2022, 2025]) {
      text(tl, yr, { x: lineX - 12, y: y(yr) + 4, 'text-anchor': 'end', class: 'muted', 'font-size': 12 });
    }
    const gap = el('g', { class: 'mark' }, tl);
    el('rect', { x: lineX - 4, y: y(2019.5), width: 8, height: y(2026.78) - y(2019.5), fill: 'var(--plum)', opacity: 0.3 }, gap);
    const gapLabel = text(gap, `${Math.floor(2026.78 - 2014.1)} years since the shopping`, { x: lineX + 16, y: (y(2022.3) + y(2026)) / 2 + 4, 'font-size': 13, fill: 'var(--plum)', 'font-weight': 700 });
    gapLabel.style.display = height < 380 ? 'none' : '';

    events = EVENTS.map(e => {
      const g = el('g', { class: 'mark' }, tl);
      el('circle', { cx: lineX, cy: y(e.date), r: 6, fill: e.now ? 'var(--plum)' : 'var(--leaf)' }, g);
      text(g, e.label, { x: lineX + 16, y: y(e.date) - 3, class: 'muted', 'font-size': 12 });
      text(g, e.note, { x: lineX + 16, y: y(e.date) + 13, 'font-size': 14, 'font-weight': 700 });
      return { e, g };
    });
    events.push({ e: { step: 'since' }, g: gap });

    const cols = width < 500 ? 10 : 17;
    const rows = Math.ceil(year.samples / cols);
    const size = Math.min((width - 20) / cols, (height - 70) / rows);
    const left = (width - cols * size) / 2;
    grid = el('g', { class: 'mark' }, svg);
    text(grid, `Apple samples, 2024-25 (${year.samples})`, { x: left, y: 16, 'font-size': 13, 'font-weight': 700 });
    squares = Array.from({ length: year.samples }, (_, i) => el('rect', {
      class: 'mark',
      x: left + (i % cols) * size + 1,
      y: 28 + Math.floor(i / cols) * size + 1,
      width: size - 2, height: size - 2, rx: 1.5,
    }, grid));
    const ly = 28 + rows * size + 20;
    const key = el('g', { class: 'mark' }, grid);
    el('rect', { x: left, y: ly - 11, width: 12, height: 12, fill: 'var(--plum)' }, key);
    text(key, `Over the limit (${year.over})`, { x: left + 18, y: ly, 'font-size': 12 });
    el('rect', { x: left + 150, y: ly - 11, width: 12, height: 12, fill: 'var(--amber)' }, key);
    text(key, `Over half (${year.over_half})`, { x: left + 168, y: ly, 'font-size': 12 });
    grid.key = key;
  }

  function update(state) {
    const isApples = state.startsWith('apples');
    tl.style.opacity = isApples ? 0 : 1;
    grid.style.opacity = isApples ? 1 : 0;
    for (const { e, g } of events) g.style.opacity = e.step === 'bought' || state === 'since' ? 1 : 0;
    squares.forEach((sq, i) => {
      let fill = 'var(--faint)';
      if (state === 'apples-over') fill = i < year.over ? 'var(--plum)' : i < year.over + year.over_half ? 'var(--amber)' : 'var(--faint)';
      sq.style.fill = fill;
    });
    grid.key.style.opacity = state === 'apples-over' ? 1 : 0;
    return DESCRIPTIONS[state];
  }

  draw();
  return { update, resize: draw };
}
