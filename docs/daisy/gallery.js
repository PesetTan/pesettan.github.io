const cards = [...document.querySelectorAll('.photo')];
const viewer = document.querySelector('#viewer');
let full = document.querySelector('#full-photo');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let active = 0;
let photoRequest = 0;
let dismissAnimation;
let trigger;
const batchSize = 18;
let matchingCards = cards;
let shownCount = 0;
const batchObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) showNextBatch();
    })
  : null;

function showNextBatch() {
  batchObserver?.disconnect();
  batchObserver?.takeRecords();
  const nextCount = batchObserver
    ? Math.min(shownCount + batchSize, matchingCards.length)
    : matchingCards.length;
  matchingCards.slice(shownCount, nextCount).forEach(card => { card.hidden = false; });
  shownCount = nextCount;

  // The last visible card sits in the final row at either grid breakpoint.
  if (shownCount < matchingCards.length) batchObserver.observe(matchingCards[shownCount - 1]);
}

showNextBatch();
async function preparePhoto(card, thumbnail) {
  const photo = new Image();
  photo.id = full.id;
  photo.alt = thumbnail.alt;
  photo.style.setProperty('--phone-photo-position', card.dataset.phonePhotoPosition ?? 'center');
  photo.src = reducedMotion.matches && card.dataset.still ? card.dataset.still : card.href;
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
  const photo = await preparePhoto(card, img);
  if (request !== photoRequest || (photo && !viewer.open)) return;
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
  document.querySelector('#position').textContent = `${matchingCards.indexOf(card) + 1} / ${matchingCards.length}`;
}
function move(step, animateSwipe = false) {
  if (dismissAnimation) return;
  const index = matchingCards.indexOf(cards[active]);
  const next = (index + step + matchingCards.length) % matchingCards.length;
  show(matchingCards[next], animateSwipe ? step : 0);
}
cards.forEach(card => card.addEventListener('click', event => {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  dismissAnimation?.cancel();
  dismissAnimation = undefined;
  trigger = card;
  show(card);
  viewer.showModal();
}));
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const filter = button.dataset.filter;
  matchingCards = filter === 'All' ? cards : cards.filter(card => card.dataset.group === filter);
  cards.forEach(card => { card.hidden = true; });
  shownCount = 0;
  showNextBatch();
  document.querySelector('#photo-count').textContent = `${matchingCards.length} moments · oldest first`;
}));
document.querySelector('#close').addEventListener('click', () => viewer.close());
document.querySelector('#previous').addEventListener('click', () => move(-1));
document.querySelector('#next').addEventListener('click', () => move(1));
function dismissWithSwipe() {
  if (dismissAnimation) return;
  if (reducedMotion.matches) {
    viewer.close();
    return;
  }
  dismissAnimation = viewer.animate([
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(24%)', opacity: 0 },
  ], { duration: 200, easing: 'ease-in', fill: 'forwards' });
  dismissAnimation.onfinish = () => viewer.close();
}

// Use horizontal swipes to browse and a downward swipe on the photo to close.
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
  if (start.target.id === 'full-photo' && dy >= 72 && dy > Math.abs(dx) * 1.5) {
    dismissWithSwipe();
  } else if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.5) {
    move(dx < 0 ? 1 : -1, true);
  }
}, { passive: true });
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
  if (viewer.open) return;
  dismissAnimation?.cancel();
  dismissAnimation = undefined;
  photoRequest++;
  full.removeAttribute('src');
  trigger?.focus();
});
reducedMotion.addEventListener('change', () => { if (viewer.open) show(cards[active]); });

