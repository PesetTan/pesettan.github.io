import { writeFile } from 'node:fs/promises';
import { SQUIRREL_FRAME_COUNT, SQUIRREL_SOURCE_STRIDE, SQUIRREL_ATLAS } from '../family/daisy.mjs';

// Observational interpretation of Hiroki Inoue's running sequence, not traced:
// https://www.sony.jp/ichigan/a-universe/news/926/
// Cycle: hind support/push → suspended extension → fore support/compression
// → hind feet gathered ahead → hind support. All parts share this phase.
export const SQUIRREL_FRAMES = SQUIRREL_FRAME_COUNT;
export const GROUND_Y = 39;
const keys = [
  {t:0,    hip:[27,26],   shoulder:[41,25],   flex:1,   tail:-13},
  {t:.12,  hip:[27,23],   shoulder:[42,21.8], flex:0,   tail:-6},
  {t:.28,  hip:[25,22],   shoulder:[42,23],   flex:0,   tail:0},
  {t:.44,  hip:[25.5,22.5],shoulder:[41,25.5],flex:.7,  tail:-3},
  {t:.52,  hip:[27,23.5], shoulder:[40.5,28], flex:1.8, tail:-8},
  {t:.64,  hip:[29,25],   shoulder:[40,29],   flex:2.6, tail:-15},
  {t:.76,  hip:[28,28],   shoulder:[40,27.5], flex:2.4, tail:-14},
  {t:.9,   hip:[27,27.8], shoulder:[41,25.8], flex:1.3, tail:-13},
];
const wrap=t=>((t%1)+1)%1;
const limitedSlope=(left,right)=>left*right<=0?0:Math.sign(left)*Math.min(Math.abs(left),Math.abs(right));
function hermite(a,b,ma,mb,t,span) {
  return (2*t**3-3*t*t+1)*a+(t**3-2*t*t+t)*span*ma+(-2*t**3+3*t*t)*b+(t**3-t*t)*span*mb;
}
function periodicChannel(t, read) {
  t=wrap(t);
  let i=keys.findLastIndex(k=>k.t<=t);
  const j=(i+1)%keys.length, before=(i+keys.length-1)%keys.length, after=(j+1)%keys.length;
  const a=keys[i],b=keys[j], span=(b.t-a.t+1)%1;
  const previousSpan=(a.t-keys[before].t+1)%1,nextSpan=(keys[after].t-b.t+1)%1;
  const va=read(a),vb=read(b);
  return hermite(va,vb,
    limitedSlope((va-read(keys[before]))/previousSpan,(vb-va)/span),
    limitedSlope((vb-va)/span,(read(keys[after])-vb)/nextSpan),
    (t-a.t)/span,span);
}
function bodyAt(t) {
  return {hip:[0,1].map(i=>periodicChannel(t,k=>k.hip[i])),
    shoulder:[0,1].map(i=>periodicChannel(t,k=>k.shoulder[i])),
    flex:periodicChannel(t,k=>k.flex), tail:periodicChannel(t-.035,k=>k.tail)};
}

// During stance the paw moves backward by precisely one stride per cycle.
// The renderer advances the animal by that same amount, fixing the paw in
// world space. Swing curves preserve stance velocity at lift-off/touchdown.
const footPaths = {
  fore: {start:.48,end:.61,contact:44,swing:[
    [.61,36.2,39], [.69,35.2,33], [.92,42,32.5],
    [1.12,43,27], [1.32,46,30], [1.42,46,35], [1.48,44,39]
  ]},
  hind: {start:.76,end:1.04,contact:35,swing:[
    [1.04,18.2,39], [1.16,14.5,33], [1.34,14.8,30.5],
    [1.48,24,32], [1.6,33.5,31.5], [1.7,36,35], [1.76,35,39]
  ]}
};
function footAt(phase,kind) {
  const path=footPaths[kind];
  let t=wrap(phase);if(t<path.start)t++;
  if(t<=path.end) return {point:[path.contact-SQUIRREL_SOURCE_STRIDE*(t-path.start),GROUND_Y],stance:true};
  const k=path.swing;
  const i=Math.min(k.length-2,k.findLastIndex(p=>p[0]<=t)),a=k[i],b=k[i+1],span=b[0]-a[0];
  const point=[1,2].map(axis=>{
    const tangent=index=>{
      if(index===0||index===k.length-1)return axis===1?-SQUIRREL_SOURCE_STRIDE:0;
      const left=(k[index][axis]-k[index-1][axis])/(k[index][0]-k[index-1][0]);
      const right=(k[index+1][axis]-k[index][axis])/(k[index+1][0]-k[index][0]);
      return limitedSlope(left,right);
    };
    return hermite(a[axis],b[axis],tangent(i),tangent(i+1),(t-a[0])/span,span);
  });
  return {point,stance:false};
}
function limb(root,target,lengths,bend,stance) {
  const dx=target[0]-root[0],dy=target[1]-root[1],distance=Math.hypot(dx,dy);
  const reach=Math.max(Math.abs(lengths[0]-lengths[1])+.001,Math.min(distance,lengths[0]+lengths[1]-.001));
  const angle=Math.atan2(dy,dx),offset=Math.acos((lengths[0]**2+reach**2-lengths[1]**2)/(2*lengths[0]*reach));
  return {root,joint:[root[0]+lengths[0]*Math.cos(angle+bend*offset),root[1]+lengths[0]*Math.sin(angle+bend*offset)],
    foot:[root[0]+reach*Math.cos(angle),root[1]+reach*Math.sin(angle)],target,lengths,stance};
}
export function sampleSquirrelRig(frame) {
  const phase=wrap(frame/SQUIRREL_FRAMES),p=bodyAt(phase);
  const make=(kind,far=false)=>{
    const step=footAt(phase+(far?.018:0),kind);
    const root=kind==='hind'?[p.hip[0],p.hip[1]]:[p.shoulder[0]-1,p.shoulder[1]+2];
    const offset=far?-.7:0;
    return limb([root[0]+offset,root[1]],[step.point[0]+offset,step.point[1]],
      kind==='hind'?[7.5,10.2]:[4.5,7.5],kind==='hind'?-1:1,step.stance);
  };
  const pitch=Math.atan2(p.shoulder[1]-p.hip[1],p.shoulder[0]-p.hip[0]);
  return {...p,phase,pitch,headPitch:pitch*.5,limbs:[make('hind',true),make('fore',true),make('hind'),make('fore')]};
}
const n=x=>String(Number(x.toFixed(1))),point=p=>p.map(n).join(' ');
function legShape(leg,color,hind) {
  const {root:r,joint:j,foot:f}=leg;
  return `<path d="M${point(r)} L${point(j)} L${point(f)}" fill="none" stroke="${color}" stroke-width="${hind?2.45:1.8}" stroke-linejoin="round" stroke-linecap="round"/><path d="M${n(f[0]-.7)} ${n(f[1]-.2)} q.7 .4 1.8 .1" fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"/>`;
}
function smoothPath(points,close=false) {
  let d=`M${point(points[0])}`;
  for(let i=0;i<points.length-1;i++){
    const a=points[Math.max(0,i-1)],b=points[i],c=points[i+1],e=points[Math.min(points.length-1,i+2)];
    d+=` C${point([b[0]+(c[0]-a[0])/6,b[1]+(c[1]-a[1])/6])} ${point([c[0]-(e[0]-b[0])/6,c[1]-(e[1]-b[1])/6])} ${point(c)}`;
  }
  return d+(close?' Z':'');
}
function tailShape(p) {
  const root=[p.hip[0]-4,p.hip[1]-3],tip=[3.5,Math.max(4.5,root[1]+p.tail)];
  const controls=[root,[root[0]-6,root[1]+1],[tip[0]+7,tip[1]+3],tip];
  const edgeA=[],edgeB=[],inner=[],centers=[],widths=[],normals=[],tangents=[];
  for(let i=0;i<=12;i++){
    const t=i/12,u=1-t,[a,b,c,d]=controls;
    const center=[0,1].map(k=>u**3*a[k]+3*u*u*t*b[k]+3*u*t*t*c[k]+t**3*d[k]);
    const tangent=[0,1].map(k=>3*u*u*(b[k]-a[k])+6*u*t*(c[k]-b[k])+3*t*t*(d[k]-c[k]));
    const length=Math.hypot(...tangent),direction=tangent.map(v=>v/length),normal=[-direction[1],direction[0]];
    const width=1.3*u+4.8*Math.sin(Math.PI*t*.85)**.7;
    // Broad fur clumps, a rounded brush tip and an offset upper light plane.
    // No central stripe or pointed ellipse that reads like a rigid leaf.
    edgeA.push(center.map((v,k)=>v+normal[k]*width*(1+.09*Math.sin(t*8*Math.PI))));
    edgeB.push(center.map((v,k)=>v-normal[k]*width*(1+.07*Math.sin(t*7*Math.PI+1))));
    inner.push(center.map((v,k)=>v+normal[k]*width*.25));
    centers.push(center);widths.push(width);normals.push(normal);tangents.push(direction);
  }
  const cap=[];
  for(let i=1;i<4;i++){
    const angle=i*Math.PI/4,c=centers.at(-1),normal=normals.at(-1),tangent=tangents.at(-1),w=widths.at(-1);
    cap.push(c.map((v,k)=>v+w*(normal[k]*Math.cos(angle)+tangent[k]*Math.sin(angle)*.8)));
  }
  const outline=[...edgeA,...cap,...edgeB.reverse()];
  const light=[...edgeA.slice(2,11),...inner.slice(2,11).reverse()];
  return `<path fill="#98734a" d="${smoothPath(outline,true)}"/><path fill="#ad8654" d="${smoothPath(light,true)}"/>`;

}
function drawFrame(frame, x, y) {
  const p=sampleSquirrelRig(frame),[hx,hy]=p.hip,[sx,sy]=p.shoulder,mx=(hx+sx)/2,my=(hy+sy)/2;
  const bodyPath=`M${n(hx-4)} ${n(hy+3)} C${n(hx-8)} ${n(hy-2)} ${n(hx-7)} ${n(hy-8)} ${n(hx+1)} ${n(hy-8)} C${n(mx)} ${n(my-9-p.flex)} ${n(sx-2)} ${n(sy-7)} ${n(sx+2)} ${n(sy-6)} C${n(sx+6)} ${n(sy-5)} ${n(sx+7)} ${n(sy+.5)} ${n(sx+4)} ${n(sy+4)} Q${n(sx+2)} ${n(sy+6)} ${n(sx-1)} ${n(sy+4)} C${n(mx)} ${n(my+5)} ${n(hx+1)} ${n(hy+5)} ${n(hx-4)} ${n(hy+3)} Z`;
  const body=`<path fill="#a98050" d="${bodyPath}"/>`;
  const chest=`<path fill="#cfb07b" d="M${n(sx+2)} ${n(sy-6)} Q${n(sx+8)} ${n(sy-1)} ${n(sx+4)} ${n(sy+4)} Q${n(sx+2)} ${n(sy+6)} ${n(sx-1)} ${n(sy+3)} Q${n(sx+3)} ${n(sy)} ${n(sx+1)} ${n(sy-3)}Z"/>`;
  // Hind thigh and fore shoulder overlap their own bones; far limbs remain
  // behind the torso. No detached forearm is painted across the belly.
  const thigh=`<ellipse cx="${n(hx)}" cy="${n(hy-.5)}" rx="4.8" ry="5.8" fill="#b58b56"/>`;
  const nearHind=legShape(p.limbs[2],'#b58b56',true);
  const nearFore=legShape(p.limbs[3],'#c09a61',false);
  const head=`<g transform="translate(${n(sx)} ${n(sy-1)}) rotate(${n(p.headPitch*180/Math.PI)})"><path fill="#c09a61" d="M-1-2.5C-2-7 2-10 5-9.5Q6-14 8-12L8-8Q12-6 14-4C17-1 14 1 9 1.5Q4 3-1-2.5Z"/><path fill="#dfc99b" d="m9-2 5 1-1 2-5 .2Z"/><circle cx="10.5" cy="-4.4" r=".9" fill="#3e3b30"/><path fill="#3e3b30" d="m15-2 2 .8-2 1Z"/></g>`;
  return `<g transform="translate(${x} ${y})">${tailShape(p)}${legShape(p.limbs[0],'#806343',true)}${legShape(p.limbs[1],'#806343',false)}${nearHind}${nearFore}${body}${chest}${thigh}${head}</g>`;
}
export function buildSquirrelAtlas() {
  const { columns, poseWidth, poseHeight, padX, padY } = SQUIRREL_ATLAS;
  const cellWidth = poseWidth + 2 * padX, cellHeight = poseHeight + 2 * padY;
  const width = columns * cellWidth, height = Math.ceil(SQUIRREL_FRAMES / columns) * cellHeight;
  const poses = Array.from({length:SQUIRREL_FRAMES}, (_, i) =>
    drawFrame(i, (i % columns) * cellWidth + padX, Math.floor(i / columns) * cellHeight + padY));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n<!-- Transparent gutters isolate the distance-matched poses. -->\n${poses.join('\n')}\n</svg>\n`;
}
if(process.argv.includes('--write'))for(const folder of ['family','docs'])await writeFile(new URL(`../${folder}/assets/daisy-footer/squirrel.svg`,import.meta.url),buildSquirrelAtlas());
