const cards = [...document.querySelectorAll('.photo')];
const viewer = document.querySelector('#viewer');
let full = document.querySelector('#full-photo');
const video = document.querySelector('#full-video');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = 0;
let photoRequest = 0;
let trigger;
const visibleCards = () => cards.filter(card => !card.hidden);
async function preparePhoto(card, thumbnail) {
  const photo = new Image();
  photo.id = full.id;
  photo.alt = thumbnail.alt;
  photo.style.setProperty('--phone-photo-position', card.dataset.phonePhotoPosition ?? 'center');
  photo.src = card.href;
  try {
    await photo.decode();
  } catch {
    // Keep the requested photo's alt text available if the image fails to load.
  }
  return photo;
}
async function show(card, swipeDirection = 0) {
  active = cards.indexOf(card);
  const request = ++photoRequest;
  const img = card.querySelector('img');
  const isVideo = card.dataset.video === 'true';
  const photo = isVideo ? null : await preparePhoto(card, img);
  if (request !== photoRequest || (photo && !viewer.open)) return;
  video.pause();
  video.removeAttribute('src');
  video.load();
  full.hidden = isVideo;
  video.hidden = !isVideo;
  if (isVideo) {
    full.removeAttribute('src');
    video.poster = card.dataset.poster;
    video.src = card.href;
  }
  if (photo) {
    full.replaceWith(photo);
    full = photo;
    if (swipeDirection && !reducedMotion.matches) {
      photo.animate([
        { transform: `translateX(${swipeDirection * 9}%)`, opacity: 0.65 },
        { transform: 'translateX(0)', opacity: 1 },
      ], { duration: 220, easing: 'ease-out' });
    }
  }
  document.querySelector('#viewer-date').textContent = card.querySelector('time').textContent;
  document.querySelector('#caption').textContent = img.alt;
  const visible = visibleCards();
  document.querySelector('#position').textContent = `${visible.indexOf(card) + 1} / ${visible.length}`;
}
function move(step, animateSwipe = false) {
  const visible = visibleCards();
  const index = visible.indexOf(cards[active]);
  show(visible[(index + step + visible.length) % visible.length], animateSwipe ? step : 0);
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
// Let a single horizontal swipe navigate without intercepting scrolling or zoom.
const swipeArea = full.closest('figure');
let swipeStart;
swipeArea.addEventListener('touchstart', event => {
  swipeStart = undefined;
  if (event.touches.length !== 1 || event.target.closest('video')) return;
  swipeStart = event.touches[0];
}, { passive: true });
swipeArea.addEventListener('touchcancel', () => {
  swipeStart = undefined;
}, { passive: true });
swipeArea.addEventListener('touchend', event => {
  const start = swipeStart;
  swipeStart = undefined;
  if (!start || event.touches.length) return;
  const end = Array.from(event.changedTouches).find(touch => touch.identifier === start.identifier);
  if (!end) return;
  const dx = end.clientX - start.clientX;
  const dy = end.clientY - start.clientY;
  if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    move(dx < 0 ? 1 : -1, true);
  }
}, { passive: true });
viewer.addEventListener('keydown', event => {
  if (event.target === video) return;
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
  if (viewer.open) return;
  photoRequest++;
  full.removeAttribute('src');
  video.pause();
  video.removeAttribute('src');
  video.load();
  trigger?.focus();
});


