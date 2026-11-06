import assert from 'node:assert/strict';
import { sampleDaisy, sampleSquirrel, DAISY_LOOP_SECONDS, DAISY_PAUSE_SECONDS, SQUIRREL_FRAME_COUNT } from '../family/daisy.mjs';

for (const sample of [sampleDaisy, sampleSquirrel]) {
  assert.deepEqual(sample(0), sample(DAISY_LOOP_SECONDS));
  for (let t = 0; t < DAISY_LOOP_SECONDS; t += .01) {
    const pose = sample(t);
    assert.ok(pose.x >= 0 && pose.x <= 1);
    assert.ok(Math.abs(pose.x - sample(t + .001).x) <= .00012);
    assert.ok(pose.direction === -1 || pose.direction === 1);
    assert.ok(Number.isInteger(pose.frame) && pose.frame >= (sample === sampleDaisy ? 3 : 0) && pose.frame < (sample === sampleDaisy ? 12 : SQUIRREL_FRAME_COUNT));
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

// Limb lengths stay fixed across the bound; bending occurs only at joints.
const { sampleSquirrelRig, SQUIRREL_FRAMES, buildSquirrelAtlas } = await import('./build-squirrel.mjs');
for (let frame=0;frame<SQUIRREL_FRAMES;frame++) {
  for (const leg of sampleSquirrelRig(frame).limbs) {
    const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
    assert.ok(Math.abs(distance(leg.root,leg.joint)-leg.lengths[0])<1e-9);
    assert.ok(Math.abs(distance(leg.joint,leg.foot)-leg.lengths[1])<1e-9);
    assert.ok(leg.foot[1] <= 39.01);
  }
}
const {readFile}=await import('node:fs/promises');
assert.equal(await readFile(new URL('../family/assets/daisy-footer/squirrel.svg',import.meta.url),'utf8'),buildSquirrelAtlas());
console.log('Squirrel bound: fixed bone lengths, planted contact poses and generated atlas passed.');

for (const frame of [10,12,14]) assert.ok(Math.abs(sampleSquirrelRig(frame).limbs[3].foot[1]-39)<1e-9, 'Fore-paw support reaches the ground');
for (const frame of [16,18,20,22,0,2]) assert.ok(Math.abs(sampleSquirrelRig(frame).limbs[2].foot[1]-39)<1e-9, 'Hind-paw support reaches the ground');

for (let frame=0;frame<SQUIRREL_FRAMES;frame++) {
 const rig=sampleSquirrelRig(frame);
 assert.ok(rig.shoulder[0] < 40, 'Forelegs attach below the torso, behind the head');
 assert.ok(rig.shoulder[0] > rig.hip[0], 'Shoulders remain in front of the hips');
}

// Catch elbow flips and discontinuities, including at the cycle seam.
for (let frame=0;frame<SQUIRREL_FRAMES;frame+=.05) {
 const a=sampleSquirrelRig(frame).limbs[3], b=sampleSquirrelRig(frame+.05).limbs[3];
 assert.ok(a.joint[0] < 43, 'Elbow stays behind the head');
 for (const [start,end] of [['root','joint'],['joint','foot']]) {
  const angle=l=>Math.atan2(l[end][1]-l[start][1],l[end][0]-l[start][0]);
  const delta=angle(b)-angle(a);
  assert.ok(Math.abs(Math.atan2(Math.sin(delta),Math.cos(delta)))<.06, 'Foreleg folds smoothly without flipping');
 }
}
