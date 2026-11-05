import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the actual animation with a small DOM/canvas adapter, without a browser.
const pending = new Map(), timers=new Map(), handlers = {}, canvasCalls = {count:0}, cloudCalls={count:0,draws:[]};
let fakeNow=Date.parse('2026-03-01T08:00:00Z');
class ClockDate extends Date {constructor(...args){super(...(args.length?args:[fakeNow]));}static now(){return fakeNow;}}
let id = 0;
let viewport = {width:1280,height:780};
const drawing = new Proxy({}, {get:(_,name)=> (...args)=>{if(['moveTo','lineTo','quadraticCurveTo','bezierCurveTo','ellipse','arc','translate','scale','rotate'].includes(name)){assert(args.every(Number.isFinite),`${name} must stay finite`);canvasCalls.count++}}});
const canvas = {getContext:()=>drawing,getBoundingClientRect:()=>viewport};
const cloudDrawing=new Proxy({}, {get:(_,name)=>(...args)=>{if(name==='drawImage'){cloudCalls.count++;cloudCalls.draws.push(args.slice(1));assert(args.slice(1).every(Number.isFinite));}}});
const clouds={getContext:()=>cloudDrawing};
const root={dataset:{},style:{setProperty(){}}};
const img = {style:{},naturalWidth:1024,naturalHeight:1536,addEventListener(){}};
const seasonButton={setAttribute(k,v){this[k]=v},addEventListener(_,cb){handlers.season=cb}};
const preference = {matches:true,addEventListener(_,cb){handlers.preference=cb}};
const saved=new Map();
const storage={getItem:key=>saved.get(key)??null,setItem:(key,value)=>saved.set(key,value)};
const context = vm.createContext({Date:ClockDate,Intl,Image:class{complete=true;naturalWidth=1024;addEventListener(){}},setTimeout:cb=>{timers.set(++id,cb);return id},clearTimeout:n=>timers.delete(n),
  window:{sessionStorage:storage,localStorage:storage,addEventListener:(name,cb)=>handlers[name]=cb},
  document:{head:{append(){}},hidden:false,documentElement:root,createElement:()=>({width:1024,getContext:()=>drawing}),querySelector:s=>s==='.marsh-birds'?canvas:s==='.sky-clouds'?clouds:s==='[data-season-image]'?img:s==='.season-cycle'?seasonButton:null,addEventListener:(name,cb)=>handlers[name]=cb},
  matchMedia:()=>preference,devicePixelRatio:1,getComputedStyle:()=>({objectPosition:'50% 65%'}),
  ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(cb){handlers.intersection=cb}observe(){}},
  cloudCalls,requestAnimationFrame:cb=>{pending.set(++id,cb);return id},cancelAnimationFrame:n=>pending.delete(n),assert
});
const code=fs.readFileSync(new URL('../family/app.js',import.meta.url),'utf8').split('// Tree swallows:')[1];
assert(code,'Tree swallow animation exists');
vm.runInContext(['seasons.js','egret.js','atmosphere.js'].map(file=>fs.readFileSync(new URL('../family/'+file,import.meta.url),'utf8')).join('\n')+'\n// Tree swallows:'+code,context);
assert.equal(pending.size,0,'Reduced motion starts still');
handlers.preference({matches:false});assert.equal(pending.size,1);
for(const t of [0,16,32,48]){const [key,cb]=pending.entries().next().value;pending.delete(key);cb(t)}
assert(canvasCalls.count>0);assert(cloudCalls.count>0,'Clouds render alongside birds');
handlers.preference({matches:true});assert.equal(pending.size,0,'Reduced motion cancels animation');
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

for(const [instant,expected] of [
 ['2026-03-01T07:59:59Z','winter'],['2026-03-01T08:00:00Z','spring'],
 ['2026-06-01T06:59:59Z','spring'],['2026-06-01T07:00:00Z','summer'],
 ['2026-09-01T06:59:59Z','summer'],['2026-09-01T07:00:00Z','autumn'],
 ['2026-12-01T07:59:59Z','autumn'],['2026-12-01T08:00:00Z','winter'],
 ['2026-12-31T23:59:59-08:00','winter'],['2027-01-01T00:00:00-08:00','winter'],
 ['2028-02-29T23:59:59-08:00','winter'],['2028-03-01T00:00:00-08:00','spring']
]) assert.equal(vm.runInContext(`seasonAt(new Date('${instant}'))`,context),expected,instant);
vm.runInContext(`{
 for(const name of Object.keys(seasons)){
   for(let i=0;i<6;i++)assert(seasons[name].birds.includes(chooseBirdScene(name)));
 }
 assert(!seasons.winter.birds.includes('swallows'));
 assert(!seasons.autumn.birds.includes('swallows'));
 const first=scene.top;
 for(const name of Object.keys(seasons)){
   activeSeason=name;activeBirdScene=seasons[name].birds[1];resizeScene();
   assert.equal(scene.top,first,'Terrain crop stays identical for all seasons and bird alternatives');
   for(let t=0;t<220;t+=.1){
     if(activeBirdScene.startsWith('pintail')){
       for(let i=0;i<5;i++){
         const p=pintailPose(t,i,activeBirdScene==='pintail-water',scene);
         assert(Object.values(p).every(Number.isFinite),'Pintail coordinates stay finite');
       }
       drawPintails(t,activeBirdScene==='pintail-water');
     }
   }
 }
 assert.equal(cloudOffset(0,1000),cloudOffset(720,1000));
 assert(cloudOffset(60,1000)>cloudOffset(0,1000),'Clouds drift');
 // Inspect actual rendered banks across a complete circuit and the wrap.
 for(const viewport of [{width:390,height:930},{width:1440,height:900},{width:2560,height:1015}]) {
   scene={...scene,...viewport,imageWidth:Math.max(viewport.width,viewport.height*2/3),imageHeight:Math.max(viewport.width*1.5,viewport.height),left:0,top:0};
   const banks=elapsed=>{time=elapsed;cloudCalls.draws=[];renderClouds();return cloudCalls.draws.map(([x,y,w,h])=>({x,end:x+w})).sort((a,b)=>a.x-b.x);};
   assert.deepEqual(banks(0),banks(720),'The loop renders identical banks at both ends');
   for(const elapsed of [0,120,240,360,480,600,719.999,720.001]) {
     const copies=banks(elapsed);
     assert(copies[0].x<=0 && copies.at(-1).end>=scene.width,'Banks cover both viewport edges');
     for(let i=1;i<copies.length;i++)assert(copies[i].x<copies[i-1].end,'Cloud banks overlap throughout the loop');
   }
   const before=banks(719.999),after=banks(720.001);
   for(const bank of before.filter(b=>b.x>0 && b.end<scene.width+scene.imageWidth*.1)) {
     assert(after.some(b=>Math.abs(b.x-bank.x)<.1),'No visible bank jumps at the loop boundary');
   }
 }

 activeSeason='spring';activeBirdScene='egret';setFlightPaused(true);
}`,context);
fakeNow=Date.parse('2026-12-01T08:00:00Z');
handlers.visibilitychange();
assert.equal(root.dataset.season,'winter');
assert.equal(img.src,'assets/seasons/winter.webp');
assert.equal(pending.size,0,'Changing season respects paused motion');
assert.equal(timers.size,1,'One wall-clock check is scheduled');
fakeNow=Date.parse('2027-03-01T08:00:00Z');
const [timerID,timerCallback]=timers.entries().next().value;timers.delete(timerID);timerCallback();
assert.equal(root.dataset.season,'spring');
assert.equal(timers.size,1);
console.log('Season dates, seasonal birds, fixed framing, clouds, and open-tab changes passed');

for(const expected of ['summer','autumn','winter','spring']){
 handlers.season();
 assert.equal(root.dataset.season,expected);
 assert.equal(seasonButton.innerHTML,vm.runInContext(`seasons['${expected}'].icon`,context));
 assert(vm.runInContext('seasons[activeSeason].birds.includes(activeBirdScene)',context));
 handlers.visibilitychange();
 assert.equal(root.dataset.season,expected,'Ordinary clock/visibility checks preserve manual selection');
 assert.equal(pending.size,0,'Cycling seasons preserves paused motion');
}
handlers.season();assert.equal(root.dataset.season,'summer');
fakeNow=Date.parse('2027-09-01T07:00:00Z');handlers.visibilitychange();
assert.equal(root.dataset.season,'autumn','Actual calendar boundary restores automatic selection');
console.log('Hidden icon cycles all seasons and icons, preserves pause, and respects calendar rollover');
