import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';
const assetsRoot = process.env.FAMILY_ASSETS_DIR || path.resolve('../family-assets');

// Read generated PNG pixels without adding an image-processing dependency.
function png(name) {
  const data=fs.readFileSync(path.join(assetsRoot, 'assets/seasons', `${name}.png`));
  let width,height,channels,compressed=[];
  for(let p=8;p<data.length;){
    const size=data.readUInt32BE(p),type=data.toString('ascii',p+4,p+8),chunk=data.subarray(p+8,p+8+size);
    if(type==='IHDR'){
      width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);
      assert.equal(chunk[8],8);assert.equal(chunk[12],0);
      channels=({2:3,6:4})[chunk[9]];assert(channels,'RGB or RGBA PNG');
    }
    if(type==='IDAT')compressed.push(chunk);
    p+=size+12;
  }
  const packed=zlib.inflateSync(Buffer.concat(compressed)),stride=width*channels,pixels=Buffer.alloc(stride*height);
  const paeth=(a,b,c)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
  for(let y=0;y<height;y++){
    const filter=packed[y*(stride+1)];
    for(let x=0;x<stride;x++){
      const a=x>=channels?pixels[y*stride+x-channels]:0,b=y?pixels[(y-1)*stride+x]:0,c=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;
      pixels[y*stride+x]=(packed[y*(stride+1)+x+1]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
    }
  }
  return {width,height,channels,pixel:(x,y)=>[...pixels.subarray((y*width+x)*channels,(y*width+x)*channels+channels)]};
}
const backgrounds=['spring','summer','autumn','winter'].map(png);
for(const image of backgrounds)assert.deepEqual([image.width,image.height],[1024,1536]);
const samples=[0,64,128,256,384,512,640,768,850,960,1023];
const horizons=backgrounds.map(image=>samples.map(x=>{
  // Locate the sharp sky/land edge, independent of the season's sky hue.
  let edge=0;
  for(let y=995;y<1100;y++){
    const above=image.pixel(x,y-1),below=image.pixel(x,y+1);
    const difference=Math.hypot(...above.slice(0,3).map((v,i)=>v-below[i]));
    if(difference>20){edge=y;break;}
  }
  return edge;
}));
console.log('Registered hill boundaries:',horizons);
for(const outline of horizons.slice(1))outline.forEach((y,i)=>assert(Math.abs(y-horizons[0][i])<=2,`Hill at x=${samples[i]} moved: ${horizons[0][i]} → ${y}`));
for(const name of ['cumulus','winter-clouds']){
  const image=png(name);assert.equal(image.channels,4,'Clouds have actual alpha');
  assert.equal(image.pixel(0,0)[3],0,'Empty sky is transparent');
  assert.equal(image.pixel(512,1450)[3],0,'No ground baked into clouds');
  assert(image.pixel(640,650)[3]>200,'Sculptural hero cloud remains substantial');
}
console.log('Artwork dimensions, fixed hill registration, and transparent hero clouds passed');
