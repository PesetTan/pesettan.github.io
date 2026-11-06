// Daisy follows the squirrel around the same continuous out-and-back path.
export const DAISY_LOOP_SECONDS = 18;
const CHASE_DELAY = .8;

function route(seconds) {
  const t = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  return t < 9 ? { x: t / 9, direction: 1 } : { x: 2 - t / 9, direction: -1 };
}

export function sampleDaisy(seconds) {
  const phase = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  return { ...route(seconds + 4.5), frame: 4 + Math.floor(phase / .075) % 8 };
}

export function sampleSquirrel(seconds) {
  const phase = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  return { ...route(seconds + 4.5 + CHASE_DELAY), hop: Math.sin(phase * Math.PI * 2 / .3) ** 2 * 3 };
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
      const prey = reducedMotion.matches ? { x: .62, direction: 1, hop: 0 } : sampleSquirrel(elapsed);
      squirrel.style.left = `calc(9px + (100% - 42px) * ${prey.x})`;
      squirrel.style.transform = `translateY(${-prey.hop}px) scaleX(${prey.direction})`;
      runner.style.left = `calc(4px + (100% - 42px) * ${pose.x})`;
      sprite.style.transform = `scaleX(${pose.direction})`;
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
      sync();
    }).observe(track);
    document.addEventListener('visibilitychange', sync);
    reducedMotion.addEventListener('change', sync);
    paint();
  }
}
