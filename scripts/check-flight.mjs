import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// Exercise the actual animation with a small DOM/canvas adapter, without a browser.
const pending = new Map(), handlers = {}, canvasCalls = [];
let id = 0;
const drawing = new Proxy({}, {get:(_,name)=> (...args)=>{if(['moveTo','lineTo','quadraticCurveTo'].includes(name)){assert(args.every(Number.isFinite),`${name} must stay finite`);canvasCalls.push(args)}}});
const canvas = {getContext:()=>drawing,getBoundingClientRect:()=>({width:1280,height:780})};
const img = {naturalWidth:1024,naturalHeight:1536,addEventListener(){}};
const toggle = {setAttribute(k,v){this[k]=v},addEventListener(_,cb){handlers.toggle=cb}};
const preference = {matches:true,addEventListener(_,cb){handlers.preference=cb}};
const context = vm.createContext({
  document:{hidden:false,querySelector:s=>s==='.marsh-birds'?canvas:s==='.landscape img'?img:toggle,addEventListener:(name,cb)=>handlers[name]=cb},
  matchMedia:()=>preference,devicePixelRatio:1,getComputedStyle:()=>({objectPosition:'50% 65%'}),
  ResizeObserver:class{observe(){}},IntersectionObserver:class{constructor(cb){handlers.intersection=cb}observe(){}},
  requestAnimationFrame:cb=>{pending.set(++id,cb);return id},cancelAnimationFrame:n=>pending.delete(n),assert
});
const code=fs.readFileSync(new URL('../family/app.js',import.meta.url),'utf8').split('// Tree swallows:')[1];
assert(code,'Tree swallow animation exists');
vm.runInContext('// Tree swallows:'+code,context);
assert.equal(pending.size,0,'Reduced motion starts still');
assert.equal(toggle['aria-pressed'],'true');
handlers.toggle();assert.equal(pending.size,1);
for(const t of [0,16,32,48]){const [key,cb]=pending.entries().next().value;pending.delete(key);cb(t)}
assert(canvasCalls.length>0);
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
