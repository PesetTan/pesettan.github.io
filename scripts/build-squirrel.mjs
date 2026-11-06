import { writeFile } from 'node:fs/promises';
import { SQUIRREL_FRAME_COUNT } from '../family/daisy.mjs';

// Observational pose study, not traced artwork. References:
// https://www.sony.jp/ichigan/a-universe/news/926/ (Hiroki Inoue sequence)
// https://crowspath.org/natural-history/wildlife/gaits/ (bounding mechanics)
// Hind push, suspension/reach, fore contact, hind gather, hind support.
const poses = [
  {lift:0, arch:1, hind:[31,39], fore:[45,30]},
  {lift:1, arch:0, hind:[23,39], fore:[47,30]},
  {lift:3, arch:0, hind:[19,33], fore:[50,31]},
  {lift:3, arch:0, hind:[19,31], fore:[53,33]},
  {lift:2, arch:1, hind:[27,32], fore:[53,36]},
  {lift:0, arch:2, hind:[34,32], fore:[51,39]},
  {lift:0, arch:3, hind:[35,34], fore:[46,39]},
  {lift:-1, arch:3, hind:[35,38], fore:[42,39]},
  {lift:0, arch:3, hind:[38,39], fore:[40,34]},
  {lift:0, arch:2, hind:[35,39], fore:[42,30]},
  {lift:0, arch:1, hind:[31,39], fore:[44,30]},
  {lift:0, arch:1, hind:[28,39], fore:[45,30]},
];
export const SQUIRREL_FRAMES = SQUIRREL_FRAME_COUNT;

// Periodic, slope-limited Hermite interpolation keeps contacts flat and avoids
// joint snaps between hand-set poses, including the wrap back to push-off.
function interpolate(values, phase) {
  const i=Math.floor(phase), t=phase-i, at=k=>values[(k+values.length)%values.length];
  const a=at(i-1), b=at(i), c=at(i+1), d=at(i+2);
  const slope=(x,y)=>x*y<=0 ? 0 : Math.sign(x)*Math.min(Math.abs(x),Math.abs(y));
  const m0=slope(b-a,c-b),m1=slope(c-b,d-c);
  return (2*t**3-3*t*t+1)*b+(t**3-2*t*t+t)*m0+(-2*t**3+3*t*t)*c+(t**3-t*t)*m1;
}
function poseAt(frame) {
  const phase=(((frame%SQUIRREL_FRAMES)+SQUIRREL_FRAMES)%SQUIRREL_FRAMES)*poses.length/SQUIRREL_FRAMES;
  const channel=read=>interpolate(poses.map(read),phase);
  return {lift:channel(p=>p.lift),arch:channel(p=>p.arch),
    hind:[channel(p=>p.hind[0]),channel(p=>p.hind[1])],
    fore:[channel(p=>p.fore[0]),channel(p=>p.fore[1])]};
}

// Two rigid bones meet at an elbow/knee. Only joint angles change.
function limb(root, target, lengths, bend) {
  const dx=target[0]-root[0], dy=target[1]-root[1];
  const distance=Math.hypot(dx,dy);
  const reach=Math.max(Math.abs(lengths[0]-lengths[1])+.001,
    Math.min(distance,lengths[0]+lengths[1]-.001));
  const angle=Math.atan2(dy,dx);
  const offset=Math.acos((lengths[0]**2+reach**2-lengths[1]**2)/(2*lengths[0]*reach));
  const joint=[root[0]+lengths[0]*Math.cos(angle+bend*offset),root[1]+lengths[0]*Math.sin(angle+bend*offset)];
  const foot=[root[0]+reach*Math.cos(angle),root[1]+reach*Math.sin(angle)];
  return {root,joint,foot,lengths};
}
export function sampleSquirrelRig(frame) {
  const p=poseAt(frame);
  const hip=[28+p.arch*.5,26-p.lift], shoulder=[39-p.arch*.4,26-p.lift];
  return {...p,hip,shoulder,limbs:[
    limb([hip[0]-1,hip[1]-.4],[p.hind[0]-1,p.hind[1]-.8],[7,9],1),
    limb([shoulder[0]-1,shoulder[1]-.4],[p.fore[0]-6,p.fore[1]-.8],[6.5,9],1),
    limb(hip,p.hind,[7,9],1),limb(shoulder,[p.fore[0]-5,p.fore[1]],[6.5,9],1)
  ]};
}
const n=x=>x.toFixed(2);
function legShape(leg,color,hind) {
  const {root:r,joint:j,foot:f}=leg;
  return `<path d="M${r.map(n)} L${j.map(n)} L${f.map(n)}" fill="none" stroke="${color}" stroke-width="${hind?3.1:2.3}" stroke-linejoin="round" stroke-linecap="round"/><path d="M${n(f[0]-1)} ${n(f[1])} l3.2 .1" fill="none" stroke="${color}" stroke-width="1.6" stroke-linecap="round"/>`;
}
function drawFrame(frame) {
  const p=sampleSquirrelRig(frame), [hx,hy]=p.hip,[sx,sy]=p.shoulder;
  // The tail trails low during suspension and rises after landing. Its root
  // stays attached; the broad tip follows with a small delayed wave.
  const previous=poseAt(frame-4);
  const tipY=15-previous.arch*1.3+previous.lift*.7;
  const tail=`<path fill="#99764e" d="M${n(hx-3)} ${n(hy)} C17 ${n(hy-1)} 7 ${n(tipY+7)} 3 ${n(tipY)} C0 ${n(tipY-6)} 7 ${n(tipY-10)} 15 ${n(tipY-4)} C21 ${n(tipY)} 18 ${n(hy-6)} ${n(hx-3)} ${n(hy)}Z"/><path fill="#b68f5e" d="M5 ${n(tipY-3)} Q11 ${n(tipY+7)} 21 ${n(hy-3)} Q10 ${n(tipY+10)} 5 ${n(tipY-3)}Z"/>`;
  // A continuous shoulder-to-throat contour buries the upper forelegs in
  // the coat. Broad rounded tufts keep the tiny silhouette soft, not spiky.
  const body=`<path fill="#a77c4f" d="M${n(hx-6)} ${n(hy+2)} C${n(hx-10)} ${n(hy-7)} ${n(hx-4)} ${n(hy-12-p.arch)} ${n(hx+3)} ${n(hy-10-p.arch)} C${n(sx-1)} ${n(sy-12)} ${n(sx+1)} ${n(sy-13)} ${n(sx+5)} ${n(sy-11)} Q${n(sx+7)} ${n(sy-7)} ${n(sx+7)} ${n(sy-3)} Q${n(sx+10)} ${n(sy)} ${n(sx+8)} ${n(sy+3)} Q${n(sx+8)} ${n(sy+5)} ${n(sx+5)} ${n(sy+5)} Q${n(sx+3)} ${n(sy+7)} ${n(sx)} ${n(sy+5)} Q${n(sx-3)} ${n(sy+5)} ${n(hx-6)} ${n(hy+2)}Z"/>`;
  const chest=`<path fill="#cfac76" d="M${n(sx+4)} ${n(sy-8)} Q${n(sx+7)} ${n(sy-6)} ${n(sx+6)} ${n(sy-3)} Q${n(sx+10)} ${n(sy+1)} ${n(sx+7)} ${n(sy+3)} Q${n(sx+6)} ${n(sy+6)} ${n(sx+3)} ${n(sy+4)} Q${n(sx)} ${n(sy+6)} ${n(sx-1)} ${n(sy+2)} Q${n(sx+4)} ${n(sy)} ${n(sx+3)} ${n(sy-4)}Z"/>`;
  const thigh=`<ellipse cx="${n(hx-1)}" cy="${n(hy-1)}" rx="5.2" ry="6.3" fill="#b68c58"/>`;
  const head=`<g transform="translate(${n(2-p.arch*.4)} ${n(-3-p.lift)})"><path fill="#c29b65" d="M40 25 Q39 18 45 17 L46 12 Q49 11 50 17 L57 21 Q61 24 56 26 L47 28Z"/><path fill="#dfc99b" d="m49 25 6-1 2 1-6 2Z"/><circle cx="54" cy="21" r="1" fill="#3e3b30"/><path fill="#3e3b30" d="m58 22 3 1-3 1Z"/></g>`;
  return `<g transform="translate(${frame*64} 0)">${tail}${legShape(p.limbs[0],'#806343',true)}${legShape(p.limbs[1],'#806343',false)}${legShape(p.limbs[3],'#c29b65',false)}${body}${chest}${thigh}${legShape(p.limbs[2],'#b68c58',true)}${head}</g>`;
}
export function buildSquirrelAtlas() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${SQUIRREL_FRAMES*64}" height="44" viewBox="0 0 ${SQUIRREL_FRAMES*64} 44">\n<!-- Reference-informed bound: rigid limb segments; hind push, suspension, fore contact, gather. -->\n${Array.from({length:SQUIRREL_FRAMES},(_,i)=>drawFrame(i)).join('\n')}\n</svg>\n`;
}
if (process.argv.includes('--write')) {
  const atlas=buildSquirrelAtlas();
  for (const folder of ['family','docs']) await writeFile(new URL(`../${folder}/assets/daisy-footer/squirrel.svg`,import.meta.url),atlas);
}
