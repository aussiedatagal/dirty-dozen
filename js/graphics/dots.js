import { el, text, frame } from '../svg.js';

const MIN = 0.15;
const MAX = 600;
const TICKS = [1, 10, 100];

const pct = v => (v === '<1' ? 0.5 : Number(v));

const DESCRIPTIONS = {
  all: 'Dot plot of 52 chemicals by estimated intake as a share of the acceptable daily intake, on a log scale.',
  worst: '49 of 52 chemicals are under 10% of the acceptable daily intake.',
  close: 'Dithiocarbamates reach 80% and propargite 50% of the acceptable daily intake.',
  over: 'Prothiofos, from grapes, reaches 400% of the acceptable daily intake for heavy-eating 2 to 5 year olds.',
};

export function init(container, chemicals) {
  let dots = [];
  let labels = {};

  function draw() {
    const { svg, width, height } = frame(container);
    const pad = { left: 16, right: 24, bottom: 46 };
    const x = v => pad.left + (Math.log(v / MIN) / Math.log(MAX / MIN)) * (width - pad.left - pad.right);
    const base = Math.min(height - pad.bottom, height / 2 + 140);
    const ceiling = Math.max(30, base - 300);
    const r = Math.max(4, Math.min(7, width / 90));

    text(svg, 'Under 1%', { x: x(MIN), y: base + 18, class: 'muted', 'font-size': 12 });
    for (const t of TICKS) {
      el('line', { class: 'grid', x1: x(t), x2: x(t), y1: ceiling, y2: base }, svg);
      text(svg, `${t}%`, { x: x(t), y: base + 18, 'text-anchor': 'middle', class: 'muted', 'font-size': 12 });
    }
    el('line', { class: 'limit', x1: x(100), x2: x(100), y1: ceiling, y2: base }, svg);
    text(svg, 'Safe daily amount', { x: x(100) - 6, y: ceiling - 6, 'text-anchor': 'end', 'font-size': 12, fill: 'var(--plum)' });
    text(svg, 'Share of the acceptable daily intake (log scale)', { x: pad.left, y: base + 38, class: 'muted', 'font-size': 12 });

    // chemicals under 1% have no exact value, so they sit in a block below 1%.
    // the rest stack upwards where they would overlap
    const step = r * 2 + 1;
    const blockCols = Math.max(1, Math.floor((x(0.7) - x(MIN)) / step));
    let small = 0;
    const placed = [];
    dots = [...chemicals].sort((a, b) => pct(a.p90) - pct(b.p90)).map(chem => {
      let cx, level;
      if (chem.p90 === '<1') {
        cx = x(MIN) + r + (small % blockCols) * step;
        level = Math.floor(small++ / blockCols);
      } else {
        cx = x(pct(chem.p90));
        level = 0;
        while (placed.some(p => Math.abs(p.cx - cx) < r * 2 && p.level === level)) level++;
        placed.push({ cx, level });
      }
      const cy = base - r - 2 - level * step;
      const dot = el('circle', { class: 'mark', cx, cy, r }, svg);
      dot.appendChild(document.createElementNS(dot.namespaceURI, 'title')).textContent = `${chem.name}: ${chem.p90}% (${chem.age})`;
      return { chem, dot, cx, cy };
    });

    labels = {};
    for (const { chem, cx, cy } of dots) {
      if (!['Prothiofos', 'Dithiocarbamates', 'Propargite'].includes(chem.name)) continue;
      const g = el('g', { class: 'mark' }, svg);
      const lift = chem.name === 'Propargite' ? 64 : chem.name === 'Dithiocarbamates' ? 40 : 40;
      el('line', { x1: cx, x2: cx, y1: cy - r, y2: cy - lift + 4, stroke: 'currentColor', class: 'grid' }, g);
      const anchor = cx > width * 0.7 ? 'end' : 'middle';
      text(g, `${chem.name} ${chem.p90}%`, { x: cx, y: cy - lift, 'text-anchor': anchor, 'font-size': 13, 'font-weight': 700 });
      labels[chem.name] = g;
    }
    const under = chemicals.filter(c => pct(c.p90) < 10).length;
    labels.under = text(svg, `${under} of ${chemicals.length} under 10%`, { x: x(1.6), y: ceiling + 22, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, class: 'mark' });
  }

  function update(state) {
    for (const { chem, dot } of dots) {
      const v = pct(chem.p90);
      let fill = 'var(--ink)';
      if (state === 'worst') fill = v < 10 ? 'var(--leaf)' : 'var(--faint)';
      if (state === 'close') fill = v >= 10 && v <= 100 ? 'var(--amber)' : 'var(--faint)';
      if (state === 'over') fill = v > 100 ? 'var(--plum)' : 'var(--faint)';
      dot.style.fill = fill;
    }
    const show = { under: state === 'worst', Dithiocarbamates: state === 'close', Propargite: state === 'close', Prothiofos: state === 'over' };
    for (const [name, g] of Object.entries(labels)) g.style.opacity = show[name] ? 1 : 0;
    return DESCRIPTIONS[state];
  }

  draw();
  return { update, resize: draw };
}
