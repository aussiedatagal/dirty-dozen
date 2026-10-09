const LABELS = {
  'Kale, collard and mustard greens': 'Kale and other greens',
};

const NOTE = { fresh: 'Tested fresh', canned: 'Only canned', null: 'Not tested' };

export function init(container, lists) {
  container.innerHTML = '';
  const grid = document.createElement('ol');
  grid.className = 'tiles';
  container.appendChild(grid);

  const tiles = lists.dozen.map(item => {
    const li = document.createElement('li');
    li.className = 'tile';
    li.dataset.how = item.how ?? 'none';
    li.innerHTML = `<span class="rank">${item.rank}</span><span class="name">${LABELS[item.name] ?? item.name}</span><span class="note">${NOTE[item.how]}</span>`;
    grid.appendChild(li);
    return li;
  });

  function update(state) {
    grid.dataset.state = state;
    if (state === 'all') return 'The 12 foods on the 2026 US Dirty Dozen, spinach first.';
    if (state === 'tested') return '5 of the 12 were tested fresh in the Australian Total Diet Study.';
    return '6 were not tested in Australia at all, and peaches only canned.';
  }

  return { update, resize() {}, tiles };
}
