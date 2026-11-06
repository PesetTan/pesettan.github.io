import assert from 'node:assert/strict';
import { sampleDaisy, sampleSquirrel, DAISY_LOOP_SECONDS } from '../family/daisy.mjs';

for (const sample of [sampleDaisy, sampleSquirrel]) {
  assert.deepEqual(sample(0), sample(DAISY_LOOP_SECONDS));
  for (let t = 0; t < DAISY_LOOP_SECONDS; t += .01) {
    const pose = sample(t);
    assert.ok(pose.x >= 0 && pose.x <= 1);
    assert.ok(Math.abs(pose.x - sample(t + .001).x) <= .000112);
    assert.ok(pose.direction === -1 || pose.direction === 1);
    if ('frame' in pose) assert.ok(Number.isInteger(pose.frame) && pose.frame >= 4 && pose.frame < 12);
    if ('hop' in pose) assert.ok(pose.hop >= 0 && pose.hop <= 3);
  }
}
// The squirrel is ahead in both directions, and Daisy follows its exact route.
for (const t of [0, 2, 7, 10, 16]) {
  const dog = sampleDaisy(t);
  const prey = sampleSquirrel(t);
  assert.equal(dog.direction, prey.direction);
  assert.ok((prey.x - dog.x) * dog.direction > 0);
  assert.ok(Math.abs(sampleDaisy(t + .8).x - prey.x) < 1e-12);
}
// The squirrel turns first, then Daisy follows without either teleporting.
assert.equal(sampleSquirrel(4).direction, -1);
assert.equal(sampleDaisy(4).direction, 1);
assert.equal(sampleDaisy(4.6).direction, -1);
console.log('Daisy chase: pursuit, delayed turns, bounded poses, continuous routes and seamless loop passed.');
