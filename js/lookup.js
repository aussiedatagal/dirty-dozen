import { shortName, mgkg } from './format.js';

const FLAGS = {
  over: 'Over the legal limit in at least one sample',
  'none-set': 'No legal limit set for this food, so any amount is not allowed',
};

export function initLookup(foods) {
  const input = document.getElementById('food-search');
  const list = document.getElementById('food-list');
  const detail = document.getElementById('food-detail');
  const sorted = [...foods].sort((a, b) => a.name.localeCompare(b.name));
  let selected = null;

  function renderList() {
    const q = input.value.trim().toLowerCase();
    list.innerHTML = '';
    for (const food of sorted.filter(f => f.name.toLowerCase().includes(q))) {
      const li = document.createElement('li');
      const n = food.chemicals.length;
      li.innerHTML = `<button type="button" aria-pressed="${food === selected}"><span>${shortName(food.name)}</span><span class="count">${n ? `${n} found` : 'none found'}</span></button>`;
      li.querySelector('button').addEventListener('click', () => select(food));
      list.appendChild(li);
    }
  }

  function select(food) {
    selected = food;
    renderList();
    if (!food.chemicals.length) {
      detail.innerHTML = `<h3>${shortName(food.name)}</h3><p class="none">No farm chemicals found in any of its ${food.samples} samples.</p>`;
      return;
    }
    const rows = food.chemicals.map(c => `
      <tr>
        <td>${c.name}${c.flag ? `<span class="flag">${FLAGS[c.flag]}</span>` : ''}</td>
        <td class="num">${c.detects} of ${food.samples}</td>
        <td class="num">${mgkg(c.max)}</td>
      </tr>`).join('');
    detail.innerHTML = `
      <h3>${shortName(food.name)}</h3>
      <p>${food.chemicals.length} different chemicals found across ${food.samples} samples.</p>
      <table>
        <thead><tr><th>Chemical</th><th class="num">Samples</th><th class="num">Highest mg/kg</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  }

  input.addEventListener('input', renderList);
  renderList();
  select(foods.find(f => f.name === 'Apples'));
}
