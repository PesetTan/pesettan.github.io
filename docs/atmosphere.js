// Clouds and birds use the existing scene clock and painting crop.
// Clouds move independently; the terrain never translates or scales over time.
// The 18% overlap matches the feather width, leaving no empty interval.
const CLOUD_SPACING = .82;
const CLOUD_LAYERS = Object.freeze([
  // Distant clouds are smaller, fainter, and about a third as fast on screen.
  {scale:.82,period:1080,phase:.43,opacity:.22,soft:true},
  {scale:1,period:480,phase:0,opacity:.86,soft:false}
]);
function cloudOffset(elapsed,width,period=480,phase=0) {
  return (((elapsed % period) / period + phase) % 1) * width * CLOUD_SPACING;
}
function prepareClouds() {
  cloudSprite.width=cloudImage.naturalWidth;cloudSprite.height=cloudImage.naturalHeight;
  const paint=cloudSprite.getContext('2d'),w=cloudSprite.width,h=cloudSprite.height;
  paint.drawImage(cloudImage,0,0);
  // Feather sprite boundaries at render time so drifting never exposes a
  // rectangular image edge. This also keeps low haze safely above the ridge.
  paint.globalCompositeOperation='destination-in';
  const sides=paint.createLinearGradient(0,0,w,0);
  // Sample a smoothstep ramp: zero slope at both ends avoids a visible
  // moving boundary where neighboring banks dissolve into one another.
  for(let i=0;i<=20;i++) {
    const x=i/20,t=Math.min(1,x/.18,(1-x)/.18);
    sides.addColorStop(x,`rgba(0,0,0,${t*t*(3-2*t)})`);
  }
  paint.fillStyle=sides;paint.fillRect(0,0,w,h);
  const bottom=paint.createLinearGradient(0,0,0,h);
  bottom.addColorStop(0,'black');
  for(let i=0;i<=20;i++) {
    const t=i/20;
    bottom.addColorStop(.50+.155*t,`rgba(0,0,0,${1-t*t*(3-2*t)})`);
  }
  bottom.addColorStop(1,'transparent');
  paint.fillStyle=bottom;paint.fillRect(0,0,w,h);
  paint.globalCompositeOperation='source-over';
  renderClouds();
}
function renderClouds() {
  cloudCtx.clearRect(0,0,scene.width,scene.height);
  if(!cloudImage.complete || !cloudImage.naturalWidth || !cloudSprite.width)return;
  cloudCtx.save();
  // The alpha artwork ends above the hills. A soft sky-only clip prevents
  // moving cloud edges from ever painting over the registered terrain.
  const skyBottom=scene.top+scene.imageHeight*.655;
  cloudCtx.beginPath();cloudCtx.rect(0,0,scene.width,Math.max(0,skyBottom));cloudCtx.clip();
  // Draw distant haze first, then the more defined foreground bank.
  for(const layer of CLOUD_LAYERS) {
    const width=scene.imageWidth*layer.scale,height=scene.imageHeight*layer.scale;
    const top=scene.top+scene.imageHeight*(1-layer.scale)*.36;
    const drift=cloudOffset(time,width,layer.period,layer.phase),spacing=width*CLOUD_SPACING;
    cloudCtx.globalAlpha=seasons[activeSeason].cloudOpacity*layer.opacity;
    // Desaturate cyan fringes; only the distant layer gets a little softness.
    const blur=layer.soft?Math.max(1,Math.min(3,scene.imageWidth*.0012)):0;
    cloudCtx.filter=`saturate(${activeSeason==='autumn'?.65:.85}) blur(${blur}px)`;
    const first=Math.floor((-scene.left-drift-width)/spacing)+1;
    const last=Math.ceil((scene.width-scene.left-drift)/spacing)-1;
    for(let copy=first;copy<=last;copy++) {
      const x=scene.left+drift+copy*spacing;
      cloudCtx.drawImage(cloudSprite,x,top,width,height);
    }
  }
  cloudCtx.restore();
}

// Northern pintails: slim neck, long pointed tail, brown head and white neck
// stripe in males; mottled warm brown females. Illustrative, not recorded tracks.
// https://www.allaboutbirds.org/guide/Northern_Pintail/lifehistory
function pintailPose(elapsed,index,onWater,frame) {
  // The same depth controls apparent size and seasonal atmospheric color.
  const depth=1.3+index*.15,perspective=1/(1+depth*.9);
  if(onWater) {
    // Slow circuits in the distant open water, closer to the far shoreline.
    const phase=elapsed/38+index*1.65;
    return {x:frame.left+frame.imageWidth*(.62+.035*perspective*Math.sin(phase)),
      y:frame.top+frame.imageHeight*(.737+index*.0003)+Math.sin(elapsed*.8+index)*.15*perspective,
      scale:Math.max(.25,Math.min(.65,frame.imageWidth*.00036))*perspective,depth,
      facing:Math.tanh(Math.cos(phase)*8),wing:0,dip:Math.max(0,Math.sin(elapsed*.29+index*2))**12};
  }
  const cycle=165,progress=((elapsed+index*.65)%cycle)/cycle;
  return {x:mix(frame.width+150,-150,progress),y:frame.height*(.28+index*.027)+Math.sin(progress*Math.PI)*frame.height*.08,
    scale:.36*perspective*Math.min(1.4,frame.width/1100),depth,facing:-1,
    wing:Math.sin(elapsed*TAU*2.7+index*.7),dip:0};
}
function drawPintails(elapsed,onWater) {
  for(let i=0;i<(onWater?3:5);i++) {
    const p=pintailPose(elapsed,i,onWater,scene),male=i%2===0;
    const color=(hex,alpha=1)=>atmosphericColor(hex.match(/[a-f0-9]{2}/gi).map(v=>parseInt(v,16)),p.depth,alpha);
    ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.scale*p.facing,p.scale);
    if(onWater) {
      ctx.strokeStyle=color('#d4e5de',.3);ctx.lineWidth=.9;
      ctx.beginPath();ctx.ellipse(-4,8,35,4,0,0,TAU);ctx.stroke();
    }
    function wing(far) {
      if(onWater)return;
      const lift=p.wing*(far?.75:1);
      ctx.fillStyle=far?color('#7e8a89'):color('#a2aaa3');ctx.beginPath();ctx.moveTo(-17,-3);
      ctx.quadraticCurveTo(-5,-13-28*lift,-30,-14-58*lift);
      ctx.lineTo(-43,-10-54*lift);ctx.quadraticCurveTo(-30,-3-13*lift,3,2);ctx.fill();
    }
    wing(true);
    ctx.fillStyle=male?color('#b9bab0'):color('#8c8069');ctx.beginPath();ctx.ellipse(-3,0,25,9,-.06,0,TAU);ctx.fill();
    ctx.fillStyle=color('#535e5a');ctx.beginPath();ctx.moveTo(-22,-3);ctx.lineTo(-51,2);ctx.lineTo(-22,5);ctx.fill();
    // All markings, including the pale breast, recede into the same seasonal haze.
    ctx.fillStyle=male?color('#ecebdb'):color('#b8ab8c');ctx.beginPath();ctx.ellipse(11,2,10,8,0,0,TAU);ctx.fill();
    ctx.save();ctx.translate(15,-4);ctx.rotate(p.dip*.95);
    ctx.strokeStyle=male?color('#ecebdb'):color('#a39578');ctx.lineWidth=7;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,4);ctx.quadraticCurveTo(4,-4,8,-13);ctx.stroke();
    ctx.fillStyle=male?color('#65503e'):color('#918064');ctx.beginPath();ctx.ellipse(10,-14,8,6,0,0,TAU);ctx.fill();
    ctx.fillStyle=color('#6f8990');ctx.beginPath();ctx.moveTo(15,-16);ctx.lineTo(29,-14);ctx.lineTo(28,-11);ctx.lineTo(15,-11);ctx.fill();
    ctx.fillStyle=color('#172b30');ctx.beginPath();ctx.arc(12,-15,1.1,0,TAU);ctx.fill();ctx.restore();
    if(onWater) {
      ctx.strokeStyle=male?color('#73817b'):color('#655c4c');ctx.lineWidth=1;
      for(let n=0;n<3;n++){ctx.beginPath();ctx.moveTo(-18+n*5,-3);ctx.lineTo(-8+n*5,3);ctx.stroke();}
    }
    wing(false);ctx.restore();
  }
}
