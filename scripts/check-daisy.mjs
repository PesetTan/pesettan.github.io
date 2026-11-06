import assert from 'node:assert/strict';
import { sampleDaisy, sampleSquirrel, DAISY_LOOP_SECONDS, DAISY_PAUSE_SECONDS } from '../family/daisy.mjs';

for (const sample of [sampleDaisy, sampleSquirrel]) {
  assert.deepEqual(sample(0), sample(DAISY_LOOP_SECONDS));
  for (let t = 0; t < DAISY_LOOP_SECONDS; t += .01) {
    const pose = sample(t);
    assert.ok(pose.x >= 0 && pose.x <= 1);
    assert.ok(Math.abs(pose.x - sample(t + .001).x) <= .00012);
    assert.ok(pose.direction === -1 || pose.direction === 1);
    assert.ok(Number.isInteger(pose.frame) && pose.frame >= (sample === sampleDaisy ? 3 : 0) && pose.frame < 12);
    if ('hop' in pose) assert.ok(pose.hop >= 0 && pose.hop <= 3);
  }
}
// At each returning pass, Daisy plants her paws, turns to watch the squirrel,
// then pushes off in pursuit. Her position stays continuous throughout.
for (const crossing of [3.6, 12.6]) {
  const stop = sampleDaisy(crossing + .01);
  const watch = sampleDaisy(crossing + .2);
  const restart = sampleDaisy(crossing + DAISY_PAUSE_SECONDS + .05);
  assert.equal(stop.reacting, true);
  assert.equal(stop.frame, 3);
  const wagLeft = sampleDaisy(crossing + .15);
  const wagRight = sampleDaisy(crossing + .25);
  assert.ok(wagLeft.wag * wagRight.wag < 0, 'Tail wags in both directions during the stop');
  assert.equal(wagLeft.x, wagRight.x, 'Paws stay planted while tail wags');
  assert.equal(watch.reacting, true);
  assert.equal(watch.direction, sampleSquirrel(crossing + .2).direction);
  assert.equal(watch.x, stop.x);
  const lingering = sampleDaisy(crossing + 1.5);
  assert.equal(lingering.reacting, true, 'Pause lasts long enough to see the wag');
  assert.equal(lingering.x, stop.x);
  assert.equal(restart.reacting, false);
  assert.equal(restart.wag, 0);
  assert.equal(restart.direction, watch.direction);
  assert.ok(Math.abs(sampleDaisy(crossing).x - sampleSquirrel(crossing).x) < 1e-12);
}
for (const t of [0, 2, 7, 10, 16]) {
  const dog = sampleDaisy(t), prey = sampleSquirrel(t);
  assert.equal(dog.direction, prey.direction);
  assert.ok((prey.x - dog.x) * dog.direction > 0);
}
console.log('Daisy chase: continuous loop, bounded poses, pursuit and reactions at both return passes passed.');
