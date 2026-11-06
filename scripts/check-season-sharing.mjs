import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync(new URL('../family/seasons.js',import.meta.url),'utf8');
const stored=new Map();
let now='2026-11-05T20:00:00-08:00';
function page(blocked=false){
  const events={};const root={dataset:{},style:{setProperty(){}}};
  class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}}
  const context=vm.createContext({Intl,Date:ClockDate,window:{localStorage:{getItem(key){if(blocked)throw Error();return stored.get(key)??null;},setItem(key,value){if(blocked)throw Error();stored.set(key,value);}},addEventListener:(key,fn)=>events[key]=fn},document:{currentScript:{hasAttribute:()=>true},documentElement:root,querySelector:()=>null}});
  vm.runInContext(source,context);
  return {api:context.window.SeasonScene,root,events};
}
const home=page();assert.equal(home.root.dataset.season,'autumn');
home.api.selectSeason('spring');
const daisy=page();assert.equal(daisy.root.dataset.season,'spring','Navigation restores selected season');
assert.equal(page().root.dataset.season,'spring','Reload restores selected season');
home.api.selectSeason('winter');daisy.events.storage({key:'tan-family-season'});
assert.equal(daisy.root.dataset.season,'winter','Other open tabs update');
home.api.selectSeason('summer');now='2026-12-01T00:00:00-08:00';daisy.api.syncTheme();
assert.equal(daisy.root.dataset.season,'winter','Real boundary resets manual override');
const winter=page();winter.api.selectSeason('autumn');now='2027-01-01T00:00:00-08:00';
assert.equal(page().root.dataset.season,'autumn','Winter selection survives New Year');
now='2027-03-01T00:00:00-08:00';assert.equal(page().root.dataset.season,'spring');
const offline=page(true);offline.api.selectSeason('winter');offline.api.syncTheme();assert.equal(offline.root.dataset.season,'winter','Storage denial preserves in-memory choice');
stored.set('tan-family-season',JSON.stringify({name:'__proto__',period:'2027-spring'}));assert.equal(page().root.dataset.season,'spring');
stored.set('tan-family-season','not JSON');assert.equal(page().root.dataset.season,'spring');
console.log('Season sharing: navigation, reload, cross-tab updates, boundaries, New Year, and unavailable/invalid storage passed.');
