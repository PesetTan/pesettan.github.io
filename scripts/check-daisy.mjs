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

// Check the coordinated gait, including continuous poses between atlas frames.
const { sampleSquirrelRig, SQUIRREL_FRAMES, buildSquirrelAtlas, GROUND_Y } = await import('./build-squirrel.mjs');
const { squirrelStrideGeometry, SQUIRREL_SOURCE_STRIDE } = await import('../family/daisy.mjs');
assert.deepEqual(sampleSquirrelRig(0),sampleSquirrelRig(SQUIRREL_FRAMES));
let minPitch=Infinity,maxPitch=-Infinity,minSpine=Infinity,maxSpine=-Infinity;
for(let frame=0;frame<SQUIRREL_FRAMES;frame+=.025) {
 const rig=sampleSquirrelRig(frame),next=sampleSquirrelRig(frame+.025);
 minPitch=Math.min(minPitch,rig.pitch);maxPitch=Math.max(maxPitch,rig.pitch);
 const spine=Math.hypot(rig.shoulder[0]-rig.hip[0],rig.shoulder[1]-rig.hip[1]);
 minSpine=Math.min(minSpine,spine);maxSpine=Math.max(maxSpine,spine);
 for(let i=0;i<4;i++) {
  const leg=rig.limbs[i];
  const distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
  assert.ok(Math.abs(distance(leg.root,leg.joint)-leg.lengths[0])<1e-9);
  assert.ok(Math.abs(distance(leg.joint,leg.foot)-leg.lengths[1])<1e-9);
  assert.ok(distance(leg.foot,leg.target)<1e-8,'Every paw target is physically reachable without stretching');
  assert.ok(leg.foot[1]<=GROUND_Y+1e-8,'Paws do not pass below ground');
  if(leg.stance)assert.ok(Math.abs(leg.foot[1]-GROUND_Y)<1e-8);
  for(const[start,end]of[['root','joint'],['joint','foot']]) {
   const angle=l=>Math.atan2(l[end][1]-l[start][1],l[end][0]-l[start][0]);
   const d=angle(next.limbs[i])-angle(leg);
   assert.ok(Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))<.04,'No joint snap, including at the loop seam');
  }
 }
}
assert.ok(minPitch<-.05&&maxPitch>.2,'Torso pitches through launch and landing');
assert.ok(maxSpine-minSpine>4,'Spine extends in flight and compresses on landing');
for(const phase of [.2,.28,.36])assert.ok(sampleSquirrelRig(phase*SQUIRREL_FRAMES).limbs.every(l=>!l.stance&&l.foot[1]<GROUND_Y-.5),'Flight has a genuine suspended phase');
// A support paw remains fixed in world space while the body travels forward.
for(const [index,start,end]of[[3,.48,.61],[2,.76,1.04]]) {
 let previous;
 for(let phase=start;phase<=end;phase+=.002) {
  const leg=sampleSquirrelRig(phase*SQUIRREL_FRAMES).limbs[index];
  assert.equal(leg.stance,true);
  const worldX=phase*SQUIRREL_SOURCE_STRIDE+leg.foot[0];
  if(previous!==undefined)assert.ok(Math.abs(worldX-previous)<1e-8,'Stance feet do not slide');
  previous=worldX;
 }
}
for(const width of [180,260,420,800,1200]) {
 const g=squirrelStrideGeometry(width);
 assert.ok(Number.isInteger(g.halfStrides));
 assert.ok(Math.abs(g.cellWidth*SQUIRREL_SOURCE_STRIDE/64-width/g.halfStrides)<1e-10,'Rendered stride matches traveled distance at each width');
 for(const t of [0,2.3,8.7])assert.deepEqual(sampleSquirrel(t,g.halfStrides),sampleSquirrel(t+DAISY_LOOP_SECONDS,g.halfStrides));
}
const {readFile}=await import('node:fs/promises');
assert.equal(await readFile(new URL('../family/assets/daisy-footer/squirrel.svg',import.meta.url),'utf8'),buildSquirrelAtlas());
console.log('Squirrel: weight transfer, suspension, fixed limb lengths, reachable contacts, no foot sliding and seamless distance-matched loops passed.');

const { CHASE_PROFILES, chaseProfileForWidth } = await import('../family/daisy.mjs');
assert.equal(chaseProfileForWidth(390),CHASE_PROFILES.mobile);
assert.equal(chaseProfileForWidth(650),CHASE_PROFILES.mobile);
assert.equal(chaseProfileForWidth(651),CHASE_PROFILES.desktop);
assert.equal(chaseProfileForWidth(1280),CHASE_PROFILES.desktop);
assert.equal(DAISY_LOOP_SECONDS/CHASE_PROFILES.mobile.rate,18);
assert.equal(DAISY_LOOP_SECONDS/CHASE_PROFILES.desktop.rate,30);
for(const profile of Object.values(CHASE_PROFILES)) {
 const loop=DAISY_LOOP_SECONDS/profile.rate;
 assert.deepEqual(sampleDaisy(0),sampleDaisy(loop*profile.rate));
 assert.deepEqual(sampleSquirrel(0),sampleSquirrel(loop*profile.rate));
 for(const crossing of [3.6,12.6]) {
  const wallTime=(crossing+.2)/profile.rate;
  assert.equal(sampleDaisy(wallTime*profile.rate).reacting,true);
  assert.equal(sampleDaisy(wallTime*profile.rate).direction,sampleSquirrel(wallTime*profile.rate).direction);
 }
}
console.log('Responsive chase: desktop 30s, mobile 18s, paired movement/reactions and loop continuity passed.');
