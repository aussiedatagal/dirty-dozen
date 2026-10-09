import { watchSteps } from './scroller.js';
import * as list from './graphics/list.js';
import * as bars from './graphics/bars.js';
import * as dots from './graphics/dots.js';
import * as punnets from './graphics/punnets.js';
import { initLookup } from './lookup.js';

const load = name => fetch(`data/${name}.json`).then(r => r.json());

const sections = [
  { id: 'list', chart: list, data: ['us-lists'] },
  { id: 'bars', chart: bars, data: ['foods', 'us-lists'] },
  { id: 'dots', chart: dots, data: ['chemicals'] },
  { id: 'berries', chart: punnets, data: ['berries'] },
];

async function start() {
  const files = {};
  for (const name of ['us-lists', 'foods', 'chemicals', 'berries']) files[name] = load(name);

  for (const { id, chart, data } of sections) {
    const section = document.getElementById(id);
    const graphic = section.querySelector('.graphic');
    const desc = section.querySelector('.sticky .sr-only');
    const args = await Promise.all(data.map(d => files[d]));
    const view = chart.init(graphic, ...args);
    let state = section.querySelector('.step').dataset.state;
    const show = s => { state = s; desc.textContent = view.update(s) || ''; };
    show(state);
    watchSteps(section, show);
    let width = graphic.clientWidth;
    new ResizeObserver(() => {
      if (graphic.clientWidth === width) return;
      width = graphic.clientWidth;
      view.resize();
      show(state);
    }).observe(graphic);
  }

  initLookup(await files.foods);
}

start();
