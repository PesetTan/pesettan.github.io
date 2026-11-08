const cards = [...document.querySelectorAll('.photo')];
const viewer = document.querySelector('#viewer');
const full = document.querySelector('#full-photo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = 0;
let trigger;
const visibleCards = () => cards.filter(card => !card.hidden);
function show(card) {
  active = cards.indexOf(card);
  const img = card.querySelector('img');
  full.style.setProperty('--phone-photo-x', card.dataset.phonePhotoX ?? '50%');
  full.src = reducedMotion.matches && card.dataset.still ? card.dataset.still : card.href;
  full.alt = img.alt;
  document.querySelector('#caption').textContent = `${img.alt} ${card.querySelector('time').textContent}`;
  const visible = visibleCards();
  document.querySelector('#position').textContent = `${visible.indexOf(card) + 1} / ${visible.length}`;
}
function move(step) {
  const visible = visibleCards();
  const index = visible.indexOf(cards[active]);
  show(visible[(index + step + visible.length) % visible.length]);
}
cards.forEach(card => card.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  trigger = card;
  show(card);
  viewer.showModal();
}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  cards.forEach(card => { card.hidden = button.dataset.filter !== 'All' && card.dataset.group !== button.dataset.filter; });
  document.querySelector('#photo-count').textContent = `${visibleCards().length} moments · oldest first`;
}));
document.querySelector('#close').addEventListener('click', () => viewer.close());
document.querySelector('#previous').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
viewer.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    move(event.key === 'ArrowLeft' ? -1 : 1);
  }
});
viewer.addEventListener('click', event => {
  if (event.target !== viewer) return;
  const rect = viewer.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) viewer.close();
});
viewer.addEventListener('close', () => {
  full.removeAttribute('src');
  trigger?.focus();
});
reducedMotion.addEventListener('change', () => { if (viewer.open) show(cards[active]); });

