import assert from 'node:assert/strict';
import { sampleDaisy, DAISY_LOOP_SECONDS } from '../family/daisy.mjs';

assert.deepEqual(sampleDaisy(0), { x: .5, direction: -1, frame: 0 });
assert.deepEqual(sampleDaisy(DAISY_LOOP_SECONDS), sampleDaisy(0));
assert.equal(sampleDaisy(8).direction, -1);
assert.ok(sampleDaisy(8).x < .5);
assert.equal(sampleDaisy(15).direction, 1);
assert.equal(sampleDaisy(24).direction, -1);
assert.ok(sampleDaisy(24).x > .5);
assert.deepEqual(sampleDaisy(30), sampleDaisy(0));

// No teleport at a turn, transition or loop boundary; all frames stay in sheet.
for (let t = 0; t <= DAISY_LOOP_SECONDS; t += .01) {
  const pose = sampleDaisy(t);
  assert.ok(pose.x >= 0 && pose.x <= 1);
  assert.ok(Number.isInteger(pose.frame) && pose.frame >= 0 && pose.frame < 12);
  assert.ok(Math.abs(pose.x - sampleDaisy(t + .001).x) <= .00011);
}
console.log('Daisy: centered sitting, left/right/center lap, bounded frames and continuous loop passed.');
