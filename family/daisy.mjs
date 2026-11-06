// Daisy follows the squirrel around the same continuous out-and-back path.
export const DAISY_LOOP_SECONDS = 18;
const CHASE_DELAY = 1.8;
export const SQUIRREL_FRAME_COUNT = 24;
export const SQUIRREL_STRIDE_SECONDS = .45;
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

export function sampleSquirrel(seconds) {
  const phase = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  const stride = phase / SQUIRREL_STRIDE_SECONDS;
  return { ...route(seconds + 4.5 + CHASE_DELAY),
    frame: Math.floor(stride * SQUIRREL_FRAME_COUNT) % SQUIRREL_FRAME_COUNT,
    hop: 0 }; // Suspension and ground contact are drawn into the rig poses.
}

if (typeof document !== 'undefined') {
  const track = document.querySelector('.footer-beagle-track');
  const runner = track?.querySelector('.footer-beagle-runner');
  const sprite = track?.querySelector('.footer-beagle');
  const squirrel = track?.querySelector('.footer-squirrel');
  if (runner && sprite && squirrel) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0;
    let lastTime = null;
    let request = null;
    let visible = false;

    function paint() {
      const pose = reducedMotion.matches ? { x: .5, direction: 1, frame: 0 } : sampleDaisy(elapsed);
      const prey = reducedMotion.matches ? { x: .72, direction: 1, hop: 0, frame: 3 } : sampleSquirrel(elapsed);
      squirrel.style.left = `calc(11px + (100% - 42px) * ${prey.x})`;
      squirrel.style.backgroundPosition = `${-prey.frame * 20}px 0`;
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
      if (lastTime !== null) elapsed += (now - lastTime) / 1000;
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
    paint();
  }
}
