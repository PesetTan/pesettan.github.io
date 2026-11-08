// Daisy follows the squirrel around the same continuous out-and-back path.
export const DAISY_LOOP_SECONDS = 18;
// Separate playback profiles share the reviewed poses and pursuit choreography.
// A single scaled clock keeps travel, foot contacts and reactions together.
export const CHASE_PROFILES = Object.freeze({
  desktop: Object.freeze({ name: 'desktop', rate: .6 }),
  mobile: Object.freeze({ name: 'mobile', rate: 1 })
});
export function chaseProfileForWidth(width) {
  return width <= 650 ? CHASE_PROFILES.mobile : CHASE_PROFILES.desktop;
}
const CHASE_DELAY = 1.8;
export const SQUIRREL_FRAME_COUNT = 48;
export const SQUIRREL_ATLAS = Object.freeze({
  columns: 8, poseWidth: 64, poseHeight: 44, padX: 8, padY: 4
});
export const SQUIRREL_STRIDE_SECONDS = .45;
export const SQUIRREL_SOURCE_STRIDE = 60;

export function squirrelStrideGeometry(travelPixels) {
  const halfStrides = Math.max(1, Math.round(travelPixels / (SQUIRREL_SOURCE_STRIDE * 20 / 64)));
  return { halfStrides, cellWidth: travelPixels / halfStrides / SQUIRREL_SOURCE_STRIDE * 64 };
}
export const DAISY_PAUSE_SECONDS = 2;
const RUN_SECONDS = 9 - DAISY_PAUSE_SECONDS;

function route(seconds) {
  const t = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  return t < 9 ? { x: t / 9, direction: 1 } : { x: 2 - t / 9, direction: -1 };
}

export function sampleDaisy(seconds) {
  const phase = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  // Meet each returning squirrel at the inner turn, plant the paws, look
  // after it, then push off. This pause replaces running through the pass.
  const t = (phase + RUN_SECONDS - 3.6) % DAISY_LOOP_SECONDS;
  const returning = t >= 9;
  const leg = returning ? t - 9 : t;
  const incoming = returning ? -1 : 1;
  if (leg >= RUN_SECONDS) {
    const reaction = leg - RUN_SECONDS;
    return { x: returning ? .1 : .9,
      direction: reaction < .14 ? incoming : -incoming,
      frame: 3, reacting: true,
      wag: 20 * Math.sin(reaction / DAISY_PAUSE_SECONDS * Math.PI) * Math.sin(reaction / .2 * Math.PI * 2),
      tilt: reaction < .14 ? -5 * Math.sin(reaction / .14 * Math.PI) :
        reaction < .6 ? 5 * Math.sin((reaction - .14) / .46 * Math.PI) : 0 };
  }
  return { x: returning ? .9 - .8 * leg / RUN_SECONDS : .1 + .8 * leg / RUN_SECONDS,
    direction: incoming, frame: 4 + Math.floor(phase / .075) % 8,
    reacting: false, tilt: 0, wag: 0 };
}

export function sampleSquirrel(seconds, halfStrides = 9 / SQUIRREL_STRIDE_SECONDS) {
  const phase = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  const stride = (phase + 4.5 + CHASE_DELAY) / 9 * halfStrides;
  return { ...route(seconds + 4.5 + CHASE_DELAY),
    frame: Math.floor(((stride % 1) + 1) % 1 * SQUIRREL_FRAME_COUNT), hop: 0 };
}

if (typeof document !== 'undefined') {
  const track = document.querySelector('.footer-beagle-track');
  const runner = track?.querySelector('.footer-beagle-runner');
  const sprite = track?.querySelector('.footer-beagle');
  const squirrel = track?.querySelector('.footer-squirrel');
  if (runner && sprite && squirrel) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const mobileLayout = matchMedia('(max-width: 650px)');
    let profile = mobileLayout.matches ? CHASE_PROFILES.mobile : CHASE_PROFILES.desktop;
    track.dataset.chaseProfile = profile.name;
    let elapsed = 0;
    let lastTime = null;
    let request = null;
    let visible = false;
    let travelPixels = Math.max(1, track.clientWidth - 42);
    let gait = squirrelStrideGeometry(travelPixels);
    new ResizeObserver(() => {
      travelPixels = Math.max(1, track.clientWidth - 42);
      gait = squirrelStrideGeometry(travelPixels);
      paint();
    }).observe(track);

    function paint() {
      const pose = reducedMotion.matches ? { x: .5, direction: 1, frame: 0 } : sampleDaisy(elapsed);
      const prey = reducedMotion.matches ? { x: .72, direction: 1, hop: 0, frame: 0 } : sampleSquirrel(elapsed, gait.halfStrides);
      // Include a transparent gutter around each pose so fractional mobile
      // scaling cannot sample a piece of the neighboring pose.
      const { columns, poseWidth, poseHeight, padX, padY } = SQUIRREL_ATLAS;
      const frameWidth = gait.cellWidth * (poseWidth + 2 * padX) / poseWidth;
      const frameHeight = 14 * (poseHeight + 2 * padY) / poseHeight;
      squirrel.style.width = `${frameWidth}px`;
      squirrel.style.height = `${frameHeight}px`;
      squirrel.style.top = `${14.4 - 14 * padY / poseHeight}px`;
      squirrel.style.left = `calc(${21 - frameWidth / 2}px + (100% - 42px) * ${prey.x})`;
      squirrel.style.backgroundSize = `${frameWidth * columns}px ${frameHeight * Math.ceil(SQUIRREL_FRAME_COUNT / columns)}px`;
      squirrel.style.backgroundPosition = `${-(prey.frame % columns) * frameWidth}px ${-Math.floor(prey.frame / columns) * frameHeight}px`;
      squirrel.style.transform = `translateY(${-prey.hop}px) scaleX(${prey.direction})`;
      runner.style.left = `calc(4px + (100% - 42px) * ${pose.x})`;
      sprite.toggleAttribute('data-wagging', Boolean(pose.reacting));
      sprite.style.setProperty('--tail-wag', `${pose.wag || 0}deg`);
      sprite.style.transform = `scaleX(${pose.direction}) rotate(${pose.tilt || 0}deg)`;
      // Frames 5/6 include the next cell's tail at source x=293..301.
      // Daisy ends by x=265; trim only that empty front margin.
      sprite.style.clipPath = pose.frame === 5 || pose.frame === 6 ? 'inset(0 3.2px 0 0)' : 'none';
      // The generated atlas has uneven row padding. Register each row's paw
      // baseline in source pixels instead of stretching its cells into squares.
      const baseline = [424, 765, 1090][Math.floor(pose.frame / 4)];
      sprite.style.backgroundPosition = `${-(pose.frame % 4) * 34}px ${30 - baseline * 34 / 302}px`;
    }

    function tick(now) {
      request = null;
      if (lastTime !== null) elapsed += (now - lastTime) / 1000 * profile.rate;
      lastTime = now;
      paint();
      request = requestAnimationFrame(tick);
    }

    function sync() {
      if (request !== null) cancelAnimationFrame(request);
      request = null;
      lastTime = null;
      paint();
      if (visible && !document.hidden && !reducedMotion.matches) request = requestAnimationFrame(tick);
    }

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) track.classList.add('footer-art-ready');
      sync();
    }).observe(track);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    mobileLayout.addEventListener('change', () => {
      profile = mobileLayout.matches ? CHASE_PROFILES.mobile : CHASE_PROFILES.desktop;
      track.dataset.chaseProfile = profile.name;
      // Retain the current route/gait phase when rotating or resizing.
      sync();
    });
    paint();
  }
}
