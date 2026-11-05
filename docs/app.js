const people={sam:{name:'Sam',role:'DAD & MAKER',copy:'A space for curiosity, creative experiments, and things built by hand and in code. From Magic projects to little tools that make everyday life better, there is always another idea taking shape.',tags:['Making things','Magic','Creative experiments']},ellene:{name:'Ellene',role:'MOM',copy:'Sam’s partner and Alyna’s mom. Part of the everyday moments, shared adventures, and life we are making together, here between the bay and the hills.',tags:['Family','Life together','East Bay']},alyna:{name:'Alyna',role:'LITTLE EXPLORER',copy:'A world of play, imagination, and little discoveries. Pumpkin-patch outings, favorite stuffies, Bluey, and all the wonder of an ordinary day turned into an adventure.',tags:['Play & imagination','Little adventures','Big wonder']},daisy:{name:'Daisy',role:'FOUR PAWS, ALL FAMILY',copy:'Our beagle, with floppy ears, a mostly tan muzzle, and a place all her own in the family. A familiar face in our creative projects, and the four-pawed companion for the next little adventure.',tags:['Beagle','Floppy ears','Part of the family']}};
const dialog=document.querySelector('dialog');
document.querySelectorAll('[data-person]').forEach(card=>card.addEventListener('click',()=>{const person=people[card.dataset.person];document.querySelector('#dialog-title').textContent=person.name;document.querySelector('#dialog-role').textContent=person.role;document.querySelector('#dialog-copy').textContent=person.copy;document.querySelector('#dialog-tags').replaceChildren(...person.tags.map(tag=>{const el=document.createElement('span');el.textContent=tag;return el}));dialog.showModal()}));
document.querySelectorAll('.close,.dialog-back').forEach(button=>button.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',event=>{if(event.target===dialog){const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close()}});

// Tree swallows: pointed wings, short notched tails, dark blue-green backs and
// white underparts. Flight is an illustrative foraging pattern, not measured tracking.
// References: https://www.allaboutbirds.org/guide/Tree_Swallow/id/
// https://www.allaboutbirds.org/guide/Tree_Swallow/lifehistory
const canvas = document.querySelector('.marsh-birds');
const ctx = canvas.getContext('2d');
const landscapeImage = document.querySelector('.landscape img');
const motionToggle = document.querySelector('.motion-toggle');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const add = (a,b) => a.map((v,i)=>v+b[i]);
const sub = (a,b) => a.map((v,i)=>v-b[i]);
const mul = (a,s) => a.map(v=>v*s);
const dot = (a,b) => a.reduce((sum,v,i)=>sum+v*b[i],0);
const cross = (a,b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
const length = a => Math.hypot(...a);
const unit = a => mul(a,1/(length(a)||1));
const mix = (a,b,t) => a+(b-a)*t;
let scene = {width:1,height:1,imageWidth:1,imageHeight:1,left:0,top:0};

// Closed, C2-continuous paths in world space (x, height, depth). Sampling by
// arc length keeps birds moving through turns; no resets or screen-edge wrapping.
const routes = [
  [[-.9,.14,.35],[-.3,.09,.2],[.48,.12,.3],[.84,.24,.7],[.38,.21,1.3],[-.1,.13,.95],[-.55,.1,.7],[-.95,.23,.85]],
  [[.9,.16,.6],[.35,.1,.3],[-.22,.13,.45],[-.38,.25,1.05],[.25,.22,1.65],[.8,.17,1.1],[.6,.1,.65],[.1,.15,.8]],
  [[-.7,.2,1.8],[.05,.12,1.1],[.75,.14,.9],[1.05,.23,1.5],[.5,.28,2.3],[-.35,.24,2.1],[-.65,.12,1.2],[-1.05,.18,1.25]],
  [[.9,.26,2.4],[.35,.14,1.8],[-.55,.12,1.5],[-1.0,.2,2.0],[-.3,.29,2.8],[.5,.2,2.0],[1.05,.13,1.65],[1.2,.2,2.1]]
];
function spline(points,t) {
  const u=((t%1)+1)%1*points.length, i=Math.floor(u), f=u-i;
  const p0=points[(i+points.length-1)%points.length],p1=points[i],p2=points[(i+1)%points.length],p3=points[(i+2)%points.length];
  return p1.map((v,k)=>((1-f)**3*p0[k]+(3*f**3-6*f*f+4)*v+(-3*f**3+3*f*f+3*f+1)*p2[k]+f**3*p3[k])/6);
}
function makeRoute(points) {
  const samples=[{d:0,t:0}],count=720;
  let previous=spline(points,0),total=0;
  for(let i=1;i<=count;i++) {const p=spline(points,i/count);total+=length(sub(p,previous));samples.push({d:total,t:i/count});previous=p;}
  return {points,samples,total};
}
function position(route,distance) {
  const d=((distance%route.total)+route.total)%route.total;
  let lo=0,hi=route.samples.length-1;
  while(hi-lo>1){const mid=(lo+hi)>>1;if(route.samples[mid].d<d)lo=mid;else hi=mid;}
  const a=route.samples[lo],b=route.samples[hi];
  return spline(route.points,mix(a.t,b.t,(d-a.d)/(b.d-a.d)));
}
const swallows=routes.map((points,i)=>({route:makeRoute(points),speed:.38+i*.035,offset:[1.3,3.1,.8,4.5][i],size:[.031,.028,.026,.027][i],beat:5.8+i*.37,phase:i*1.73,bank:0}));
function project(p) {
  const depth=1/(1+p[2]*.9);
  return [scene.left+scene.imageWidth*(.54+p[0]*.56*depth),scene.top+scene.imageHeight*(.68+(.18-p[1])*.65*depth)];
}
function blendColor(a,b,t){return `rgb(${a.map((v,i)=>Math.round(mix(v,b[i],t))).join(' ')})`;}
function drawSwallow(bird,time) {
  // A gentle speed change through each pass; distance stays monotonic.
  const d=bird.offset+time*bird.speed+.035*Math.sin(time*1.7+bird.phase);
  const p=position(bird.route,d),before=position(bird.route,d-.018),after=position(bird.route,d+.018);
  const forward=unit(sub(after,before));
  const right=unit(cross(forward,[0,1,0])),up=unit(cross(right,forward));
  const acceleration=mul(sub(add(before,after),mul(p,2)),1/(.018*.018));
  const bank=clamp(Math.atan(dot(acceleration,right)*bird.speed*bird.speed/.55),-1.05,1.05);
  const r=add(mul(right,Math.cos(bank)),mul(up,-Math.sin(bank)));
  const u=add(mul(up,Math.cos(bank)),mul(right,Math.sin(bank)));
  const world=(x,y,z)=>add(p,mul(add(add(mul(forward,x),mul(r,y)),mul(u,z)),bird.size));
  const point=(x,y,z)=>project(world(x,y,z));
  // Brief bursts of fast wingbeats, with eased transitions into longer glides.
  // Each bird has a different burst period and phase, avoiding synchronized motion.
  const cycle=(time+bird.phase)%(1.45+bird.phase*.07);
  const burst=.62;
  const ease=v=>{const t=clamp(v,0,1);return t*t*(3-2*t)};
  const envelope=ease(cycle/.12)*ease((burst-cycle)/.12);
  const stroke=Math.sin(time*TAU*bird.beat+bird.phase);
  const flap=envelope*stroke*.88;
  const fold=1-.17*envelope*Math.max(stroke,0);
  const topFacing=dot(u,[0,.38,-1]);
  const belly=clamp((-topFacing+.1)*1.3,0,1);
  const haze=clamp(p[2]*.1,0,.29);
  const back=blendColor([18,53,66],[73,116,137],haze);
  const wingColor=blendColor([24,43,54],[102,143,158],haze);
  const bodyColor=blendColor([26,65,77],[213,224,218],belly);
  function shape(coords,color) {
    ctx.fillStyle=color;ctx.beginPath();
    coords.forEach((v,i)=>{const q=point(...v);if(i===0)ctx.moveTo(...q);else ctx.lineTo(...q)});
    ctx.closePath();ctx.fill();
  }
  function wing(side) {
    // Broad root, swept wrist, narrow pointed tip; tips fold slightly on upstroke.
    const c=Math.cos(flap),s=Math.sin(flap);
    const w=(x,span,z=0)=>[x,side*span*c,z+span*s];
    ctx.fillStyle=wingColor;ctx.beginPath();ctx.moveTo(...point(...w(.22,.12)));
    const curve=(a,b)=>ctx.quadraticCurveTo(...point(...a),...point(...b));
    curve(w(.35,.7),w(-.05,1.2*fold));
    curve(w(-.25,1.6*fold),w(-.92,1.95*fold));
    curve(w(-.68,1.1),w(-.58,.78));
    curve(w(-.52,.3),w(-.4,.1));ctx.closePath();ctx.fill();
    shape([w(.2,.12),w(.1,.65),w(-.2,.85),w(-.42,.25)],back);
  }
  const farSide=r[2]>0?1:-1;
  wing(farSide);
  // A shallow notch, unlike a barn swallow's long tail streamers.
  const fan=1+Math.abs(bank)*.25;
  shape([[-.43,-.12,0],[-.98,-.31*fan,-.025],[-.84,0,-.02],[-.98,.31*fan,-.025],[-.43,.12,0]],wingColor);
  shape(Array.from({length:14},(_,i)=>{const a=i/14*TAU;return [.63*Math.cos(a),0,.17*Math.sin(a)]}),bodyColor);
  shape([[.77,0,0],[.57,-.13,.04],[.31,-.23,.08],[-.12,-.22,.07],[-.63,-.1,0],[-.72,0,-.03],[-.63,.1,0],[-.12,.22,.07],[.31,.23,.08],[.57,.13,.04]],bodyColor);
  if(belly<.4)shape([[.58,0,.08],[.25,-.13,.13],[-.3,-.11,.1],[-.56,0,.03],[-.3,.11,.1],[.25,.13,.13]],back);
  wing(-farSide);
}
let flightPaused=motionPreference.matches,time=0,lastFrame=null,frameRequest=null,sceneVisible=true;
function renderBirds(){ctx.clearRect(0,0,scene.width,scene.height);[...swallows].sort((a,b)=>position(b.route,b.offset+time*b.speed)[2]-position(a.route,a.offset+time*a.speed)[2]).forEach(bird=>drawSwallow(bird,time));}
function resizeScene(){
  const box=canvas.getBoundingClientRect();
  const ratio=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(box.width*ratio);canvas.height=Math.round(box.height*ratio);
  ctx.setTransform(ratio,0,0,ratio,0,0);
  const iw=landscapeImage.naturalWidth||1024,ih=landscapeImage.naturalHeight||1536;
  const fit=Math.max(box.width/iw,box.height/ih);
  const pos=getComputedStyle(landscapeImage).objectPosition.split(' ').map(v=>parseFloat(v)/100);
  scene={width:box.width,height:box.height,imageWidth:iw*fit,imageHeight:ih*fit,left:(box.width-iw*fit)*pos[0],top:(box.height-ih*fit)*pos[1]};
  renderBirds();
}
function animateFlight(now){
  frameRequest=null;
  if(flightPaused||document.hidden||!sceneVisible){lastFrame=null;return;}
  if(lastFrame!==null)time+=Math.min((now-lastFrame)/1000,.05);
  lastFrame=now;renderBirds();frameRequest=requestAnimationFrame(animateFlight);
}
function syncFlight(){if(frameRequest!==null)cancelAnimationFrame(frameRequest);frameRequest=null;lastFrame=null;if(!flightPaused&&!document.hidden&&sceneVisible)frameRequest=requestAnimationFrame(animateFlight);}
function setFlightPaused(paused){flightPaused=paused;motionToggle.setAttribute('aria-pressed',String(paused));motionToggle.innerHTML=paused?'Resume flight <span aria-hidden="true">▷</span>':'Pause flight <span aria-hidden="true">Ⅱ</span>';syncFlight();}
new ResizeObserver(resizeScene).observe(canvas);
new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;syncFlight();}).observe(canvas);
landscapeImage.addEventListener('load',resizeScene);
motionToggle.addEventListener('click',()=>setFlightPaused(!flightPaused));
motionPreference.addEventListener('change',event=>setFlightPaused(event.matches));
document.addEventListener('visibilitychange',syncFlight);
resizeScene();setFlightPaused(flightPaused);
