import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const properties=new Map(), preloads=[];
const root={dataset:{},style:{setProperty:(key,value)=>properties.set(key,value)}};
const context=vm.createContext({window:{},document:{head:{append:link=>preloads.push(link)},createElement:()=>({}),documentElement:root,querySelector:()=>null},Intl,Date});
vm.runInContext(fs.readFileSync(new URL('../family/seasons.js',import.meta.url),'utf8'),context);
const {seasons,applyTheme,seasonAt}=context.window.SeasonScene;
assert.equal(preloads.length,1,'Only the initial season is preloaded');
assert.equal(preloads[0].rel,'preload');
assert.equal(preloads[0].as,'image');
assert.equal(preloads[0].fetchPriority,'high');
assert.equal(preloads[0].href,seasons[seasonAt()].image);
const linear=value=>value<=.04045?value/12.92:((value+.055)/1.055)**2.4;
function luminance(color){
  const p3=color.startsWith('color(');
  const values=p3?color.match(/[\d.]+/g).slice(1).map(Number):color.slice(1).match(/../g).map(value=>parseInt(value,16)/255);
  assert.equal(values.length,3);assert(values.every(value=>Number.isFinite(value)&&value>=0&&value<=1));
  const weights=p3?[.2289745641,.6917385218,.0792869141]:[.2126,.7152,.0722];
  return values.reduce((sum,value,i)=>sum+linear(value)*weights[i],0);
}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
for(const [name,season] of Object.entries(seasons)){
  applyTheme(name);
  assert.deepEqual(Object.keys(season.p3Colors).sort(),Object.keys(season.colors).sort());
  for(const [key,value] of Object.entries(season.colors)){
    assert.equal(properties.get(`--${key}-sdr`),value,'Fallback palette remains available');
    assert.equal(properties.get(`--${key}-p3`),season.p3Colors[key]);
  }
  for(const palette of [season.colors,season.p3Colors]){
    for(const surface of ['canvas','card','card-alt','card-warm','card-last','card-hover']){
      for(const text of ['ink','muted','detail']){
        assert(contrast(palette[text],palette[surface])>=4.5,`${name}: ${text} on ${surface} must retain normal-text contrast`);
      }
    }
    assert(contrast(palette.accent,palette.canvas)>=4.5,`${name}: primary button remains readable`);
    assert(contrast(palette.accent,palette.sky)>=3,`${name}: large hero accent remains readable`);
  }
}
assert.equal(preloads.length,1,'Changing the palette does not preload unused artwork');
console.log('All four sRGB/P3 palettes retain coordinated tokens and accessible text contrast');
