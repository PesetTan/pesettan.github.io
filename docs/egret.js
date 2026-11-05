// Great egret: a tucked-neck approach, feet-first landing, patient probing,
// then a climbing departure. Times are seconds of visible, unpaused animation.
// https://www.allaboutbirds.org/guide/Great_Egret/lifehistory
const EGRET_TIMING = Object.freeze({arrival:12,forage:120,departure:10,gap:3});
const EGRET_CYCLE = Object.values(EGRET_TIMING).reduce((sum,n)=>sum+n,0);
const egretEase = n => {const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)};
function egretPhase(elapsed) {
  let t=((elapsed%EGRET_CYCLE)+EGRET_CYCLE)%EGRET_CYCLE;
  for(const [phase,duration] of Object.entries(EGRET_TIMING)){
    if(t<duration)return {phase,t,duration};
    t-=duration;
  }
}
// Scale with the painting so the distant marsh bird keeps the same size
// relative to the shoreline, including on narrow and panoramic screens.
function egretAnchor(frame) {
  return {x:frame.left+frame.imageWidth*.64,y:frame.top+frame.imageHeight*.748,scale:frame.imageWidth*.00024};
}
function egretProbe(t) {
  const intervals=[8.2,11.4,9.6,13.1,7.8];
  const total=intervals.reduce((a,b)=>a+b,0);
  let local=t%total;
  for(const duration of intervals){
    if(local<duration){
      // Watch, slowly lower the neck, make one short probing jab, then recover.
      const start=duration-3.2;
      if(local<start)return {bend:0,dip:0};
      const q=local-start;
      if(q<1.7)return {bend:.68*egretEase(q/1.7),dip:0};
      if(q<1.94)return {bend:.68+.32*egretEase((q-1.7)/.24),dip:0};
      if(q<2.2)return {bend:1,dip:(q-1.94)/.26};
      return {bend:1-egretEase((q-2.2)/1),dip:0};
    }
    local-=duration;
  }
  return {bend:0,dip:0};
}
function egretCurve(points,t){
  const q=1-t;
  return [0,1].map(i=>q*q*q*points[0][i]+3*q*q*t*points[1][i]+3*q*t*t*points[2][i]+t*t*t*points[3][i]);
}
function egretTangent(points,t){
  const q=1-t;
  return [0,1].map(i=>3*q*q*(points[1][i]-points[0][i])+6*q*t*(points[2][i]-points[1][i])+3*t*t*(points[3][i]-points[2][i]));
}
function egretPose(elapsed,frame) {
  const state=egretPhase(elapsed),a=egretAnchor(frame),s=a.scale;
  const groundBody=a.y-38*s;
  const pose={...state,x:a.x,y:groundBody,scale:s,stand:1,wingOpen:0,lift:.1,bend:0,dip:0,tilt:-.12,pitch:0,bank:0,foreshorten:1,footShuffle:0};
  if(state.phase==='arrival'){
    const p=state.t/state.duration,travel=1-(1-p)**1.6;
    const path=[[frame.width+150,frame.height*.32],[frame.width*.98,frame.height*.4],[a.x+frame.width*.11,groundBody-frame.height*.04],[a.x,groundBody]];
    [pose.x,pose.y]=egretCurve(path,travel);
    const tangent=egretTangent(path,travel);
    pose.bank=Math.sin(Math.PI*p)*.65;
    pose.foreshorten=mix(.74,1,egretEase(p));
    pose.pitch=Math.max(-.32,Math.min(.15,-Math.atan2(tangent[1],-tangent[0])))*(1-egretEase((p-.76)/.24));
    pose.scale=s*mix(.8,1,travel);
    pose.stand=egretEase((p-.7)/.3);
    pose.wingOpen=1-egretEase((p-.92)/.08);
    const flapCycle=state.t%5.2;
    const pulse=flapCycle<2.3?Math.sin(Math.PI*flapCycle/2.3)**2:0;
    pose.lift=p<.68?.12+Math.sin(state.t*TAU*.85)*pulse*.75:Math.sin((state.t-8.16)*TAU*1.1)*.85;
    pose.pitch+=Math.sin(Math.PI*pose.stand)*.2;
    pose.y+=Math.sin(state.t*TAU*.85)*.8*s*(1-pose.stand);
    pose.tilt=mix(0,-.12,pose.stand);
  }else if(state.phase==='forage'){
    const probe=egretProbe(state.t);
    pose.bend=probe.bend*(1-egretEase((state.t-118)/2));pose.dip=probe.dip;
    pose.y+=.35*Math.sin(state.t*TAU/5)*s*(1-probe.bend);
    pose.footShuffle=Math.sin(state.t*.65)*.7*(1-probe.bend);
  }else if(state.phase==='departure'){
    const p=state.t/state.duration,travel=p*p*(2-p);
    pose.x=mix(a.x,-160,travel);
    pose.y=groundBody-frame.height*.52*egretEase(p);
    pose.pitch=egretEase(state.t/1.8)*.27;
    pose.bank=Math.sin(p*Math.PI)*-.35;
    pose.foreshorten=1-.16*egretEase(p);
    pose.stand=1-egretEase(state.t/1.6);
    pose.wingOpen=egretEase(state.t/.7);
    pose.lift=state.t<3?Math.sin(state.t*TAU*1.4)*.9:.16+Math.sin(state.t*TAU*.8)*.35;
    pose.tilt=mix(-.12,-.06,egretEase(p));
  }
  return pose;
}
function drawEgret(elapsed) {
  const p=egretPose(elapsed,scene);
  if(p.phase==='gap')return;
  const anchor=egretAnchor(scene);
  ctx.save();
  // Subtle contact shadow and water rings keep the landed bird in the marsh.
  if(p.stand>.95 && (p.phase==='forage'||p.phase==='departure')){
    ctx.fillStyle='rgba(19,60,65,.18)';ctx.beginPath();ctx.ellipse(anchor.x,anchor.y+1,16*p.scale,2.5*p.scale,0,0,TAU);ctx.fill();
    ctx.strokeStyle='rgba(193,222,218,.22)';ctx.lineWidth=.7;
    ctx.beginPath();ctx.ellipse(anchor.x+2,anchor.y+1,20*p.scale,3.5*p.scale,0,0,TAU);ctx.stroke();
  }
  ctx.translate(p.x,p.y);ctx.rotate(p.pitch);ctx.scale(-p.scale*p.foreshorten,p.scale);
  const lerpPoint=(a,b,t)=>a.map((n,i)=>mix(n,b[i],t));
  function wing(far){
    if(p.wingOpen<.008)return;
    ctx.save();ctx.translate(far?-4:0,far?-3:0);if(far)ctx.scale(.86,.86);
    const lift=(p.lift+(far?-.55:.55)*p.bank)*p.wingOpen;
    const wrist=[mix(-7,3,(lift+1)/2),-8-28*lift];
    const tip=[-32,-8-62*lift];
    ctx.fillStyle=far?'#bed4d8':'#eff2e5';ctx.beginPath();ctx.moveTo(5,-6);
    ctx.quadraticCurveTo(12,-12-20*lift,...wrist);
    ctx.quadraticCurveTo(wrist[0]-8,tip[1]-3,...tip);
    for(let i=0;i<6;i++){
      const x=tip[0]-i*3.5,y=tip[1]+i*2;
      ctx.quadraticCurveTo(x-5,y-5*lift,x-5,y+4);
    }
    ctx.quadraticCurveTo(-46,-3-24*lift,-18,3);ctx.quadraticCurveTo(-5,7,5,-6);ctx.fill();ctx.restore();
  }
  wing(true);
  // Legs overlap in profile, with a small depth offset between them.
  // They unfold during braking; feet remain planted while feeding.
  ctx.strokeStyle='#3d5252';ctx.lineWidth=1.6;ctx.lineCap='round';ctx.lineJoin='round';
  for(const [i,hip] of [[1,[0,7]],[0,[-3,7]]]){
    const ankle=lerpPoint([-32-i*2,13+i],[-3+i*3,24+p.footShuffle*(i?1:-1)],p.stand);
    const foot=lerpPoint([-59-i*2,16+i],[-4+i*3,38],p.stand);
    ctx.beginPath();ctx.moveTo(...hip);ctx.lineTo(...ankle);ctx.lineTo(...foot);ctx.lineTo(foot[0]+7*p.stand-3*(1-p.stand),foot[1]+1);ctx.stroke();
  }
  // Body and folded wing have softly overlapping contours, without hard outlines.
  ctx.save();ctx.rotate(p.tilt);
  ctx.fillStyle='#e8ede1';ctx.beginPath();ctx.moveTo(-26,2);ctx.bezierCurveTo(-18,-10,3,-14,16,-5);ctx.bezierCurveTo(24,3,12,13,-4,12);ctx.bezierCurveTo(-14,11,-21,6,-26,2);ctx.fill();
  ctx.fillStyle='#d3e1de';ctx.beginPath();ctx.moveTo(-25,3);ctx.quadraticCurveTo(-1,-8,12,2);ctx.quadraticCurveTo(0,11,-25,3);ctx.fill();ctx.restore();
  const standingHead=lerpPoint([25,-43],[43,22],p.bend);
  const head=lerpPoint([27,-7],standingHead,p.stand);
  const c1=lerpPoint([35,11],lerpPoint([31,-17],[22,4],p.bend),p.stand);
  const c2=lerpPoint([11,-15],lerpPoint([5,-35],[31,20],p.bend),p.stand);
  ctx.strokeStyle='#edf1e5';ctx.lineWidth=5.5;ctx.beginPath();ctx.moveTo(12,-3);ctx.bezierCurveTo(...c1,...c2,...head);ctx.stroke();
  ctx.save();ctx.translate(...head);ctx.rotate(p.bend*.83*p.stand);
  ctx.fillStyle='#f1f3e8';ctx.beginPath();ctx.ellipse(0,0,6.5,3.7,0,0,TAU);ctx.fill();
  ctx.fillStyle='#ceb66c';ctx.beginPath();ctx.moveTo(4,-1.3);ctx.lineTo(25,1.5);ctx.lineTo(5,2);ctx.closePath();ctx.fill();
  ctx.fillStyle='#364940';ctx.beginPath();ctx.arc(2,-.6,.8,0,TAU);ctx.fill();ctx.restore();
  wing(false);
  if(p.dip>0){ctx.strokeStyle=`rgba(207,227,222,${.45*(1-p.dip)})`;ctx.lineWidth=.8;ctx.beginPath();ctx.ellipse(60,40,4+12*p.dip,1+2*p.dip,0,0,TAU);ctx.stroke();}
  ctx.restore();
}
