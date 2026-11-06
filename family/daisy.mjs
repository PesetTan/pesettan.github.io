// One continuous lap: sit, rise, left, right, center, sit.
export const DAISY_LOOP_SECONDS = 32;

export function sampleDaisy(seconds) {
  const t = ((seconds % DAISY_LOOP_SECONDS) + DAISY_LOOP_SECONDS) % DAISY_LOOP_SECONDS;
  const run = (x, direction, start) => ({ x, direction, frame: 4 + Math.floor((t - start) / .08) % 8 });
  if (t < 5) return { x: .5, direction: -1, frame: 0 };
  if (t < 5.6) return { x: .5, direction: -1, frame: t < 5.3 ? 2 : 3 };
  if (t < 10.6) return run(.5 * (1 - (t - 5.6) / 5), -1, 5.6);
  if (t < 10.9) return { x: 0, direction: t < 10.75 ? -1 : 1, frame: 3 };
  if (t < 20.9) return run((t - 10.9) / 10, 1, 10.9);
  if (t < 21.2) return { x: 1, direction: t < 21.05 ? 1 : -1, frame: 3 };
  if (t < 26.2) return run(1 - .5 * (t - 21.2) / 5, -1, 21.2);
  if (t < 26.8) return { x: .5, direction: -1, frame: t < 26.5 ? 3 : 2 };
  return { x: .5, direction: -1, frame: 0 };
}

if (typeof document !== 'undefined') {
  const track = document.querySelector('.footer-beagle-track');
  const runner = track?.querySelector('.footer-beagle-runner');
  const sprite = track?.querySelector('.footer-beagle');
  if (runner && sprite) {
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    let elapsed = 0;
    let lastTime = null;
    let request = null;
    let visible = false;

    function paint() {
      const pose = sampleDaisy(reducedMotion.matches ? 0 : elapsed);
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
