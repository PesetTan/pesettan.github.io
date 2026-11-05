import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the actual animation with a small DOM/canvas adapter, without a browser.
const pending = new Map(), handlers = {}, canvasCalls = {count:0};
let id = 0;
let viewport = {width:1280,height:780};
const drawing = new Proxy({}, {get:(_,name)=> (...args)=>{if(['moveTo','lineTo','quadraticCurveTo','bezierCurveTo','ellipse','arc','translate','scale','rotate'].includes(name)){assert(args.every(Number.isFinite),`${name} must stay finite`);canvasCalls.count++}}});
const canvas = {getContext:()=>drawing,getBoundingClientRect:()=>viewport};
const img = {style:{},naturalWidth:1024,naturalHeight:1536,addEventListener(){}};
const toggle = {setAttribute(k,v){this[k]=v},addEventListener(_,cb){handlers.toggle=cb}};
const preference = {matches:true,addEventListener(_,cb){handlers.preference=cb}};
const saved=new Map();
const storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
const context = vm.createContext({window:{sessionStorage:storage,localStorage:storage},
  document:{hidden:false,querySelector:s=>s==='.marsh-birds'?canvas:s==='.landscape img'?img:toggle,addEventListener:(name,cb)=>handlers[name]=cb},
  matchMedia:()=>preference,devicePixelRatio:1,getComputedStyle:()=>({objectPosition:'50% 65%'}),
  ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(cb){handlers.intersection=cb}observe(){}},
  requestAnimationFrame:cb=>{pending.set(++id,cb);return id},cancelAnimationFrame:n=>pending.delete(n),assert
});
const code=fs.readFileSync(new URL('../family/app.js',import.meta.url),'utf8').split('// Tree swallows:')[1];
assert(code,'Tree swallow animation exists');
vm.runInContext(fs.readFileSync(new URL('../family/egret.js',import.meta.url),'utf8')+'\n// Tree swallows:'+code,context);
assert.equal(pending.size,0,'Reduced motion starts still');
assert.equal(toggle['aria-pressed'],'true');
handlers.toggle();assert.equal(pending.size,1);
for(const t of [0,16,32,48]){const [key,cb]=pending.entries().next().value;pending.delete(key);cb(t)}
assert(canvasCalls.count>0);
handlers.toggle();assert.equal(pending.size,0,'Pause cancels motion');
handlers.preference({matches:false});assert.equal(pending.size,1);
handlers.intersection([{isIntersecting:false}]);assert.equal(pending.size,0,'Offscreen stops drawing');
handlers.intersection([{isIntersecting:true}]);assert.equal(pending.size,1);
context.document.hidden=true;handlers.visibilitychange();assert.equal(pending.size,0);
context.document.hidden=false;handlers.visibilitychange();assert.equal(pending.size,1);
handlers.preference({matches:true});assert.equal(pending.size,0);
const summary=vm.runInContext(`(()=>{
  let maxStep=0,maxSeamError=0,maxSpeed=0,minHeight=Infinity;
  for(const bird of swallows){
    const route=bird.route;
    // The path has no position or tangent jump when its circuit repeats.
    const epsilon=.0001;
    const left=position(route,-epsilon),seam=position(route,0),right=position(route,epsilon);
    assert(length(sub(left,right))<epsilon*2.1);
    const incoming=unit(sub(seam,left)),outgoing=unit(sub(right,seam));
    const error=length(sub(incoming,outgoing));maxSeamError=Math.max(error,maxSeamError);assert(error<.02);
    let last=null,lastScreen=null;
    for(let t=0;t<65;t+=1/60){
      const p=position(route,bird.offset+t*bird.speed+.035*Math.sin(t*1.7+bird.phase));
      assert(p.every(Number.isFinite));minHeight=Math.min(minHeight,p[1]);assert(p[1]>.04,'No ground collisions');
      if(last){const step=length(sub(p,last));maxStep=Math.max(step,maxStep);assert(step<.014,'No teleport or sudden reversal');}
      const screen=project(p);if(lastScreen)maxSpeed=Math.max(maxSpeed,length(sub(screen,lastScreen))*60);
      drawSwallow(bird,t);last=p;lastScreen=screen;
    }
  }
  return {birds:swallows.length,seconds:65,maxWorldStep:maxStep,maxSeamTangentError:maxSeamError,maxScreenSpeed:Math.round(maxSpeed),minHeight};
})()`,context);
console.log('Flight checks passed:',summary);

// The same scene point gains sky clearance in a panoramic hero, with no
// discontinuous breakpoint and no displacement in the portrait composition.
const framing=[];
for(const [width,height] of [[390,930],[1024,940],[1280,780],[1920,940],[2560,1015]]){
  viewport={width,height};
  const metrics=vm.runInContext(`(()=>{resizeScene();const p=[0,.16,.5];return {lift:scene.flightLift,y:project(p)[1]}})()`,context);
  if(width<=1024)assert.equal(metrics.lift,0);
  if(width>=1920)assert(metrics.lift>=height*.2,'Wide flight clears the hills');
  assert(metrics.y>height*.2 && metrics.y<height*.8,'Flight remains in the hero');
  framing.push({width,height,lift:Math.round(metrics.lift)});
}
console.log('Responsive framing passed:',framing);

const egretChecks=vm.runInContext(`(()=>{
  assert.equal(activeBirdScene,'egret');
  assert.equal(chooseBirdScene(),'swallows');
  assert.equal(chooseBirdScene(),'egret');
  assert.equal(chooseBirdScene(),'swallows');
  assert.equal(EGRET_TIMING.forage,120);
  assert.equal(egretPhase(11.999).phase,'arrival');
  assert.equal(egretPhase(12).phase,'forage');
  assert.equal(egretPhase(131.999).phase,'forage');
  assert.equal(egretPhase(132).phase,'departure');
  assert.equal(egretPhase(142).phase,'gap');
  assert.equal(egretPhase(145).phase,'arrival');
  const entry=egretPose(0,scene),exit=egretPose(141.999,scene);
  assert(entry.x>scene.width+100,'Arrival begins outside right edge');
  assert(exit.x<-100,'Departure reaches outside left edge');
  for(const boundary of [12,132]){
    const a=egretPose(boundary-.0001,scene),b=egretPose(boundary,scene);
    assert(Math.hypot(a.x-b.x,a.y-b.y)<.05,'No landing or takeoff position jump');
    assert(Math.abs(a.stand-b.stand)<.01 && Math.abs(a.bend-b.bend)<.01,'Pose is continuous');
  }
  for(let t=0;t<EGRET_CYCLE*2;t+=1/30){
    const pose=egretPose(t,scene);
    assert([pose.x,pose.y,pose.scale,pose.bend,pose.wingOpen].every(Number.isFinite));
    assert(pose.bend>=0 && pose.bend<=1);
    drawEgret(t);
  }
  // A slow frame must not stretch the requested two-minute feeding interval.
  flightPaused=false;sceneVisible=true;time=0;lastFrame=1000;animateFlight(1500);
  assert.equal(time,.5);setFlightPaused(true);
  return {cycleSeconds:EGRET_CYCLE,feedingSeconds:EGRET_TIMING.forage,refreshSequence:'egret → swallows → egret',cyclesRendered:2};
})()`,context);
for(const [width,height] of [[390,930],[1280,780],[1920,940],[2560,1015],[3440,1100]]){
  viewport={width,height};
  vm.runInContext(`resizeScene();{const a=egretAnchor(scene);assert(a.x>0 && a.x<scene.width);assert(a.y<scene.height*.9 && a.y>scene.height*.6,'The egret lands on visible marsh');}`,context);
}
console.log('Egret sequence checks passed:',egretChecks);
