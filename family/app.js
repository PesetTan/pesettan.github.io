const people={sam:{name:'Sam',role:'DAD & MAKER',copy:'A space for curiosity, creative experiments, and things built by hand and in code. From Magic projects to little tools that make everyday life better, there is always another idea taking shape.',tags:['Making things','Magic','Creative experiments']},ellene:{name:'Ellene',role:'MOM',copy:'Sam’s partner and Alyna’s mom. Part of the everyday moments, shared adventures, and life we are making together, here between the bay and the hills.',tags:['Family','Life together','East Bay']},alyna:{name:'Alyna',role:'LITTLE EXPLORER',copy:'A world of play, imagination, and little discoveries. Pumpkin-patch outings, favorite stuffies, Bluey, and all the wonder of an ordinary day turned into an adventure.',tags:['Play & imagination','Little adventures','Big wonder']},daisy:{name:'Daisy',role:'FOUR PAWS, ALL FAMILY',copy:'Our beagle, with floppy ears, a mostly tan muzzle, and a place all her own in the family. A familiar face in our creative projects, and the four-pawed companion for the next little adventure.',tags:['Beagle','Floppy ears','Part of the family']}};
const dialog=document.querySelector('dialog');
document.querySelectorAll('[data-person]').forEach(card=>card.addEventListener('click',()=>{const person=people[card.dataset.person];document.querySelector('#dialog-title').textContent=person.name;document.querySelector('#dialog-role').textContent=person.role;document.querySelector('#dialog-copy').textContent=person.copy;document.querySelector('#dialog-tags').replaceChildren(...person.tags.map(tag=>{const el=document.createElement('span');el.textContent=tag;return el}));dialog.showModal()}));
document.querySelectorAll('.close,.dialog-back').forEach(button=>button.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});

// Great egret flight: tucked neck, yellow bill, black trailing legs, broad wings.
// Shape reference: https://www.allaboutbirds.org/guide/Great_Egret/id
const flock = document.querySelector('.marsh-birds');
const egretArt = `<svg viewBox="0 0 200 160" focusable="false">
  <g class="egret-far-wing" fill="#c2d8df" stroke="#91b3c4" stroke-width=".45" stroke-linejoin="round"><path/></g>
  <path d="M77 83 47 87 17 86 M74 86 43 91 12 91 M17 86 8 84 M17 86 8 88 M12 91 4 90 M12 91 5 94" fill="none" stroke="#304b54" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M61 79 49 85 63 88 74 87Z" fill="#deebea"/>
  <path d="M60 81C70 72 86 70 101 74C109 77 116 82 121 81C126 80 128 76 125 73C121 70 115 70 116 66C117 62 124 61 131 62C135 63 138 66 137 69C136 72 131 73 127 72C133 78 134 85 129 89C122 97 109 92 101 89C86 93 70 89 60 85Z" fill="#f5f5e9" stroke="#d2e3e4" stroke-width=".6"/>
  <path d="M101 85C111 90 120 94 126 88C130 84 128 79 124 76" fill="none" stroke="#b8d1d6" stroke-width="2" stroke-linecap="round"/>
  <path d="M134 65 163 69 135 70Z" fill="#d9ac45"/><path d="m137 69 26 0-27 2Z" fill="#ad8036"/>
  <circle cx="131.5" cy="66.3" r="1.15" fill="#263b3e"/>
  <g class="egret-near-wing" fill="#fffef2" stroke="#bfd3d7" stroke-width=".5" stroke-linejoin="round"><path/></g>
</svg>`;

// Wings articulate at the shoulder and wrist. Individual primary feathers
// spread at the tip; the wing keeps its chord through the horizontal stroke.
function wingShape(phase, far = false) {
  const lift = Math.cos(phase);
  const reach = Math.sin(phase);
  const rootX = far ? 91 : 87;
  const rootY = far ? 76 : 79;
  const wristX = rootX + 4 + reach * 8;
  const wristY = rootY - lift * (far ? 31 : 35);
  const tipX = rootX - 24 + reach * 12;
  const tipY = rootY - lift * (far ? 57 : 64);
  const chord = 16 + Math.abs(lift) * 7;
  const n = value => value.toFixed(2);
  let path = `M${rootX} ${rootY} Q${n(rootX+18)} ${n(rootY-lift*17)} ${n(wristX)} ${n(wristY)} Q${n(wristX-6)} ${n(tipY)} ${n(tipX+6)} ${n(tipY)}`;
  // Rounded, separated primaries form a fan rather than a pointed triangle.
  for (let i=0; i<7; i++) {
    const x = tipX + 4 - i * 4.3;
    const y = tipY + i * 1.7;
    const feather = (i < 4 ? 9 : 6) * lift;
    path += ` Q${n(x+1)} ${n(y-feather)} ${n(x-2)} ${n(y-feather)} Q${n(x-5)} ${n(y-feather+2)} ${n(x-4)} ${n(y+4)}`;
  }
  path += ` Q${n(tipX-chord-11)} ${n(tipY+10)} ${n(wristX-chord)} ${n(wristY+10)} Q${n(rootX-20)} ${n(rootY+12)} ${rootX-8} ${rootY+5}Z`;
  return path;
}

const birds = [
  {y:0, size:1, duration:45, offset:.66, beat:2.5, phase:0},
  {y:47, size:.74, duration:49, offset:.54, beat:2.25, phase:1.9},
  {y:-24, size:.56, duration:53, offset:.43, beat:2.7, phase:3.8}
].map(bird => {
  const el = document.createElement('span');
  el.className = 'marsh-bird';
  el.innerHTML = egretArt;
  flock.append(el);
  return {...bird, el, near:el.querySelector('.egret-near-wing path'), far:el.querySelector('.egret-far-wing path')};
});
const motionToggle = document.querySelector('.motion-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let flightPaused = motionPreference.matches;
let flightTime = 0;
let lastFrame = null;
let frameRequest = null;
let flightWidth = flock.clientWidth;
new ResizeObserver(() => { flightWidth = flock.clientWidth; renderBirds(); }).observe(flock);
function renderBirds() {
  for (const bird of birds) {
    const progress = (flightTime / bird.duration + bird.offset) % 1;
    const x = -180 + progress * (flightWidth + 360);
    const y = bird.y - 18 * Math.sin(progress * Math.PI);
    // Three slow strokes followed by a short glide, with varied individual timing.
    const cycle = (flightTime / bird.beat + bird.phase) % 4;
    const phase = cycle * Math.PI * 2 + Math.PI / 2;
    const glide = cycle >= 3;
    const wingPhase = glide ? Math.PI / 2 : phase;
    const bob = glide ? 0 : Math.sin(phase) * 1.8;
    bird.el.style.transform = `translate3d(${x}px, ${y+bob}px, 0) scale(${bird.size})`;
    bird.near.setAttribute('d', wingShape(wingPhase));
    bird.far.setAttribute('d', wingShape(wingPhase + .14, true));
  }
}
function animateFlight(now) {
  frameRequest = null;
  if (flightPaused || document.hidden) { lastFrame = null; return; }
  if (lastFrame !== null) flightTime += Math.min((now-lastFrame)/1000, .05);
  lastFrame = now;
  renderBirds();
  frameRequest = requestAnimationFrame(animateFlight);
}
function syncFlight() {
  if (frameRequest !== null) cancelAnimationFrame(frameRequest);
  frameRequest = null;
  lastFrame = null;
  if (!flightPaused && !document.hidden) frameRequest = requestAnimationFrame(animateFlight);
}
function setFlightPaused(paused) {
  flightPaused = paused;
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.innerHTML = paused ? 'Resume flight <span aria-hidden="true">▷</span>' : 'Pause flight <span aria-hidden="true">Ⅱ</span>';
  syncFlight();
}
renderBirds();
setFlightPaused(flightPaused);
motionToggle.addEventListener('click', () => setFlightPaused(!flightPaused));
motionPreference.addEventListener('change', event => setFlightPaused(event.matches));
document.addEventListener('visibilitychange', syncFlight);
