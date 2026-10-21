/* INBRND: a single reversible scroll clock, with a complete static fallback. */
(() => {
  'use strict';
  if (!window.customElements || !window.ResizeObserver || customElements.get('inbrnd-flywheel')) return;
  // Shared by the interactive component and the generated no-JavaScript fallback.
// October 2026 guidelines, p.12: use the printed HEX values (two RGB rows differ).
// The approved prototype ring colors remain intentional exceptions to that palette.
const COLORS = {
  ivory:'#fbfaf7', paper:'#fbfaf7', ink:'#2f2d2e', muted:'#555555',
  line:'#ddd9d4', soft:'#fcf1f1', rose:'#945267', 'rose-light':'#d5a5b1'
};
const STAGES = [
  ['Positioning', 'What do you want to be known for?', 'Your strategic lane, not your job title.'],
  ['Narrative', 'How does your experience connect?', 'A clear story makes you easier to understand.'],
  ['Platforms', 'Where does your story live?', 'The places where people encounter your work, thinking, and perspective.'],
  ['Opportunities', 'What becomes possible when the system works?', 'New conversations, relationships, roles, clients, and collaborations.'],
  ['Signals', 'What gives your positioning credibility?', 'Projects, writing, talks, awards, partnerships, recommendations, and visible contributions.']
];
const PAYOFF = 'As authority and recognition compound, career momentum grows.';
const SUMMARY = 'Five connected parts, clockwise from the top: Positioning, Narrative, Platforms, Opportunities, Signals, and back to Positioning. The outer ring represents cumulative authority, recognition, and career momentum, an outcome of the system.';
const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const phase = (p, start, length) => ease((p - start) / length);
const point = (r, a) => { const t = a * Math.PI / 180; return [340 + r * Math.cos(t), 340 + r * Math.sin(t)]; };
const arc = (r, a, b) => { const s = point(r, a), e = point(r, b); return `M ${s.join(' ')} A ${r} ${r} 0 ${Math.abs(b-a)>180?1:0} ${b>a?1:0} ${e.join(' ')}`; };
function mixColor(from, to, amount) {
  const a = from.match(/\w\w/g).map(x => parseInt(x,16));
  const b = to.match(/\w\w/g).map(x => parseInt(x,16));
  return `rgb(${a.map((v,i) => Math.round(v+(b[i]-v)*clamp(amount))).join(', ')})`;
}
function timeline(progress) {
  const q = clamp(progress);
  return {
    progress:q,
    color:mixColor(COLORS['rose-light'],COLORS.rose,q/.8),
    weight:12+phase(q,.75,.05),
    outerText:phase(q,.75,.05),
    payoff:phase(q,.8,.05),
    stages:STAGES.map((_,i) => ({
      reveal:phase(q,i*.16,.07),
      ring:phase(q,i*.16+.01,.14),
      connection:i===4?phase(q,.745,.055):phase(q,(i+1)*.16+.025,.08),
      focus:phase(q,i*.16,.04)*(1-phase(q,(i+1)*.16-.025,.025))
    }))
  };
}
function diagram(id) {
  return `<svg viewBox="0 0 680 680" aria-hidden="true" focusable="false">
    <defs><path class="authority-path" id="${id}-title" d="${arc(307.5,-155,-25)}"/>
    <path class="momentum-path" id="${id}-momentum" d="${arc(322.06,155,25)}"/></defs>
    ${STAGES.map((s,i) => {
      const a=-90+i*72, xy=point(210,a), end=a+49, tip=point(210,end);
      return `<g class="stage-part" data-part="${i}">
        <path class="rose-segment" d="${arc(289,a-36.15,a+36.15)}" pathLength="100"/>
        <path class="connection" d="${arc(210,a+23,end)}" pathLength="100"/>
        <path class="arrowhead" d="M-13 -8 L2 0 L-13 8 Z" transform="translate(${tip.join(' ')}) rotate(${end+90})"/>
        <g class="node"><text class="node-label" x="${xy[0]}" y="${xy[1]+9}">${s[0]}</text></g>
      </g>`;
    }).join('')}
    <text class="authority"><textPath href="#${id}-title" startOffset="50%">AUTHORITY / RECOGNITION</textPath></text>
    <text class="momentum"><textPath href="#${id}-momentum" startOffset="50%">CAREER MOMENTUM</textPath></text>
  </svg>`;
}

  const CSS = ":host{display:block;--ivory:#fbfaf7;--paper:#fbfaf7;--ink:#2f2d2e;--muted:#555555;--line:#ddd9d4;--soft:#fcf1f1;--rose:#945267;--rose-light:#d5a5b1;--header-offset:0px;color:var(--ink);background:var(--ivory);font-family:\"INBRND Editors\",Georgia,serif;contain:style}\n*{box-sizing:border-box}[hidden]{display:none!important}a{color:inherit}button{font:inherit}a,button{-webkit-tap-highlight-color:transparent}a:focus-visible,button:focus-visible{outline:2px solid var(--rose);outline-offset:5px}\nh1,h2,h3,h4,h5,h6,p{margin:0;font-weight:400}.eyebrow,.overline,.stage-nav,.closing-note,.diagram-caption{font-family:Arial,Helvetica,sans-serif}\n.eyebrow,.overline{font-size:11px;letter-spacing:.15em;line-height:1.5;text-transform:uppercase}\n.intro{max-width:1440px;margin:auto;padding:74px 6vw 65px}.overline{display:flex;justify-content:space-between;gap:24px;color:var(--muted);padding-bottom:22px;border-bottom:1px solid var(--line)}\n.intro-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:9vw;align-items:end;padding-top:46px}.intro-title{font-size:clamp(54px,6.4vw,94px);letter-spacing:-.052em;line-height:1.02;max-width:800px}.intro-title em,.closing h2 em{font-style:normal;color:var(--rose)}\n.intro-description{font-size:24px;line-height:1.5;max-width:380px;letter-spacing:.02em}.enter{display:inline-flex;align-items:center;gap:20px;text-decoration:none;margin-top:30px;font:11px Arial,sans-serif;letter-spacing:.12em;text-transform:uppercase;min-height:44px}.enter span{display:grid;place-items:center;width:35px;height:35px;border:1px solid var(--line);border-radius:50%;font-size:18px}\n.journey{position:relative;height:calc(100svh - var(--header-offset) + 475svh);border-top:1px solid var(--line)}\n.frame{position:sticky;top:var(--header-offset);height:calc(100svh - var(--header-offset));max-width:1600px;margin:auto;padding:26px 5vw 18px;display:grid;grid-template-columns:minmax(290px,.78fr) minmax(0,1.22fr);grid-template-rows:minmax(0,1fr) auto;gap:0 4vw;align-items:center}\n.copy{position:relative;height:310px;align-self:center;z-index:2}.lesson{position:absolute;inset:0;opacity:0;pointer-events:none}.lesson h2{font-size:clamp(47px,4.9vw,78px);letter-spacing:-.055em;line-height:1.05;margin-bottom:28px}.question{font-size:clamp(23px,2.25vw,34px);line-height:1.2;letter-spacing:-.015em;max-width:430px}.description{font-size:20px;line-height:1.5;letter-spacing:.02em;color:var(--muted);margin-top:17px;max-width:390px}\n.visual-wrap{position:relative;min-width:0;align-self:center;display:flex;flex-direction:column;align-items:center}.diagram{width:min(100%,calc(100svh - var(--header-offset) - 205px));max-width:900px;aspect-ratio:1;--ring-color:var(--rose);--ring-width:13}.diagram svg{display:block;width:100%;height:100%;overflow:visible}\n.rose-segment{fill:none;stroke:var(--ring-color);stroke-width:var(--ring-width);stroke-linecap:butt;stroke-dasharray:100}.node-label{font:26px \"INBRND Editors\",Georgia,serif;fill:var(--ink);letter-spacing:-.4px}svg text{text-anchor:middle}\n.connection{fill:none;stroke:var(--ink);stroke-width:4.5;stroke-linecap:round;stroke-dasharray:100}.arrowhead{fill:var(--ink);stroke:none}\n.authority,.momentum{font:100 21px \"INBRND Editors\",Georgia,serif;letter-spacing:1.5px;fill:var(--ink);font-synthesis:none}\n.caption-space{position:relative;width:100%;height:76px;flex:none;padding-top:18px}.diagram-caption,.payoff{position:absolute;inset:18px 0 auto;text-align:center}.diagram-caption{font-size:10px;letter-spacing:.13em;line-height:1.5;color:var(--muted);padding-top:8px}.payoff{font-size:22px;line-height:1.35;letter-spacing:-.012em;max-width:490px;margin:auto;opacity:0;color:var(--ink)}\n.stage-nav{grid-column:1/-1;border-top:1px solid var(--line);padding-top:10px;display:flex;align-items:center;gap:28px}.nav-caption{font-size:10px;letter-spacing:.14em;color:var(--muted);margin-right:auto}.stage-nav button{background:none;border:0;color:var(--muted);padding:10px 0;cursor:pointer;font:11px Arial,sans-serif;min-height:44px}.stage-nav button[aria-current=step]{color:var(--rose);font-weight:700}\n.tools{display:flex;gap:20px;align-items:center;justify-content:space-between;max-width:1440px;margin:auto;padding:12px 6vw;border-top:1px solid var(--line)}.tools button{border:0;background:none;min-height:44px;padding:12px 0;cursor:pointer;color:var(--muted);font:12px Arial,sans-serif;letter-spacing:.02em}.tools .static-toggle[aria-pressed=true]{color:var(--ink);text-decoration:underline;text-underline-offset:4px}.tools button:disabled{cursor:default}\n.closing{padding:100px 6vw 110px;background:var(--soft)}.closing-inner{max-width:1268px;margin:auto;display:grid;grid-template-columns:1.2fr .8fr;gap:9vw;align-items:end}.closing .eyebrow{color:var(--rose);margin-bottom:24px}.closing h2{font-size:clamp(42px,5vw,74px);letter-spacing:-.05em;line-height:1.08}.closing p{font-size:22px;line-height:1.5;letter-spacing:.02em;max-width:410px}.closing-note{font-size:11px!important;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:28px}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}\n.linear{max-width:1300px;margin:auto;padding:30px 6vw 50px;border-top:1px solid var(--line)}.static-diagram{display:block;width:min(100%,650px);margin:auto}.static-payoff{font-size:22px;line-height:1.4;text-align:center;max-width:520px;margin:28px auto 40px}.linear-lessons{padding:0;list-style:none;max-width:900px;margin:0 auto}.linear-lesson{padding:35px 0;border-bottom:1px solid var(--line);scroll-margin-top:calc(var(--header-offset) + 20px)}.linear-lesson:last-child{border-bottom:0}.linear-lesson h2{font-size:50px;letter-spacing:-.045em;margin-bottom:20px}.linear-lesson .question,.linear-lesson .description{max-width:650px}\n/* Preserve existing host configuration and presentation modes. */\n:host([variant=editorial]) .frame{grid-template-columns:1.03fr 1fr;gap:0 2vw}\n:host([variant=thread]) .frame{grid-template-columns:minmax(0,1.2fr) minmax(290px,.8fr)}:host([variant=thread]) .copy{grid-column:2;grid-row:1}:host([variant=thread]) .visual-wrap{grid-column:1;grid-row:1}\n:host([content-mode=diagram]) .intro,:host([content-mode=diagram]) .copy,:host([content-mode=diagram]) .closing,:host([content-mode=diagram]) .caption-space,:host([content-mode=diagram]) .static-payoff,:host([content-mode=diagram]) .linear-lessons{display:none}\n:host([content-mode=diagram]) .frame{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) auto;gap:0}:host([content-mode=diagram]) .visual-wrap{grid-column:1;grid-row:1}:host([content-mode=diagram]) .diagram{width:min(100%,calc(100svh - var(--header-offset) - 125px));max-width:900px}:host([content-mode=diagram]) .static-diagram{width:min(100%,650px)}\n@media(min-width:1600px){.intro,.frame,.closing-inner{padding-left:80px;padding-right:80px}.intro-grid{gap:100px}}\n@media(max-width:1050px) and (min-width:901px){.frame{gap:0 2vw;padding-inline:4vw;grid-template-columns:.85fr 1.15fr}.lesson h2{font-size:51px}.question{font-size:27px}.description{font-size:18px}.stage-nav{gap:20px}.nav-caption{display:none}.payoff{font-size:21px}}\n@media(max-width:900px){\n .intro{padding:32px 6vw 40px}.overline{font-size:10px;letter-spacing:.1em;padding-bottom:18px}.overline span:last-child{display:none}.intro-grid{display:block;padding-top:32px}.intro-title{font-size:clamp(46px,10.7vw,75px);max-width:620px}.intro-description{font-size:20px;margin-top:25px;max-width:530px}.enter{margin-top:24px}\n .journey{height:calc(100svh - var(--header-offset) + 600svh)}\n .frame,:host([variant=editorial]) .frame,:host([variant=thread]) .frame{padding:16px 5vw 8px;grid-template-columns:1fr;grid-template-rows:auto minmax(0,1fr) auto;gap:0;align-items:start}\n .visual-wrap,:host([variant=thread]) .visual-wrap{grid-column:1;grid-row:1;width:100%;align-self:start}.diagram{width:min(100%,40svh,410px)}\n .copy,:host([variant=thread]) .copy{grid-column:1;grid-row:2;height:100%;align-self:start;margin-top:12px}.lesson h2{font-size:clamp(38px,10vw,57px);margin-bottom:12px;letter-spacing:-.04em}.question{font-size:clamp(21px,5.4vw,28px);line-height:1.2;max-width:600px}.description{font-size:18px;line-height:1.5;margin-top:11px;max-width:600px}\n .caption-space{height:66px;padding-top:12px}.diagram-caption,.payoff{inset:12px 0 auto}.payoff{font-size:18px;line-height:1.35;max-width:350px}.diagram-caption{font-size:9px;letter-spacing:.1em}\n .stage-nav{grid-row:3;grid-column:1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px;padding-top:4px;align-self:end}.stage-nav button{font-size:10px;min-width:0;min-height:44px;padding:10px 0;letter-spacing:-.2px}.nav-caption{display:none}\n .node-label{font-size:32px;letter-spacing:-.7px}.authority,.momentum{font-size:32px;letter-spacing:1.1px}.connection{stroke-width:5.5}\n .closing{padding:60px 6vw}.closing-inner{display:block}.closing h2{font-size:46px}.closing p{font-size:20px;margin-top:30px}.closing-note{font-size:10px!important}.tools{padding-block:8px;gap:12px}.tools button{font-size:11px}\n .linear{padding-inline:5vw}.linear-lesson h2{font-size:42px}.static-payoff{font-size:20px;margin:24px auto 30px}.static-diagram .node-label{font-size:34px}.static-diagram .authority,.static-diagram .momentum{font-size:34px}\n :host([content-mode=diagram]) .frame{grid-template-rows:minmax(0,1fr) auto}:host([content-mode=diagram]) .visual-wrap{align-self:center}:host([content-mode=diagram]) .diagram{width:min(100%,calc(100svh - var(--header-offset) - 110px))}\n}\n@media(min-width:901px) and (max-height:740px){.frame{padding-top:16px}.copy{height:280px}.lesson h2{font-size:56px;margin-bottom:18px}.question{font-size:26px}.description{font-size:18px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important}}\n:host([data-static]) .linear .static-diagram{width:min(100%,650px)}\n";
  const fonts = new Map();
  let serial = 0;
  const variants = ['wheel','sculpted','editorial','thread'];
  function bindDiagram(el) {
    return {el, title:el.querySelector('.authority-path'), momentumPath:el.querySelector('.momentum-path'),
      parts:[...el.querySelectorAll('.stage-part')],nodes:[...el.querySelectorAll('.node')],
      segments:[...el.querySelectorAll('.rose-segment')],paths:[...el.querySelectorAll('.connection')],
      heads:[...el.querySelectorAll('.arrowhead')],authority:el.querySelector('.authority'),momentum:el.querySelector('.momentum')};
  }
  function alignConnections(d) {
    const width=d.el.getBoundingClientRect().width;
    if(!width)return;
    const labelSize=parseFloat(getComputedStyle(d.nodes[0].firstElementChild).fontSize);
    const ringSize=parseFloat(getComputedStyle(d.authority).fontSize);
    const key=[width,labelSize,ringSize,document.fonts?.status,document.fonts?.check('26px "INBRND Editors"')].join(':');
    if(d.geometryKey===key)return;
    // Reserve the final ring width; changing color/weight never moves text.
    const radius=289+13/2+12;
    d.title.setAttribute('d',arc(radius,-155,-25));
    d.momentumPath.setAttribute('d',arc(radius+ringSize*.728,155,25));
    const bounds=d.nodes.map(n=>{const b=n.firstElementChild.getBBox();return {x:b.x-14,y:b.y-14,w:b.width+28,h:b.height+28};});
    const inside=(a,b)=>{const p=point(210,a);return p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h;};
    d.connections=STAGES.map((_,i)=>{
      const a=-90+i*72;let start=a,end=a+72;
      while(start<a+35&&inside(start,bounds[i]))start+=.25;
      while(end>a+37&&inside(end,bounds[(i+1)%5]))end-=.25;
      d.paths[i].setAttribute('d',arc(210,start,end));return {start,end};
    });
    d.geometryKey=key;
  }
  function paintDiagram(d,q,full=false) {
    alignConnections(d);
    if(!d.connections)return;
    const t=timeline(full?1:q);
    d.el.style.setProperty('--ring-color',t.color);
    d.el.style.setProperty('--ring-width',t.weight);
    t.stages.forEach((s,i)=>{
      d.nodes[i].style.opacity=full?1:s.reveal;
      d.nodes[i].firstElementChild.style.fill=mixColor(COLORS.ink,COLORS.rose,full?0:s.focus);
      d.segments[i].style.strokeDashoffset=100*(1-s.ring);
      d.segments[i].style.opacity=s.ring>0?1:0;
      d.paths[i].style.strokeDashoffset=100*(1-s.connection);
      d.paths[i].style.opacity=s.connection>0?1:0;
      const {start,end}=d.connections[i],angle=start+(end-start)*s.connection,xy=point(210,angle);
      d.heads[i].setAttribute('transform',`translate(${xy.join(' ')}) rotate(${angle+90})`);
      d.heads[i].style.opacity=phase(s.connection,0,.14);
    });
    d.authority.style.opacity=t.outerText;d.momentum.style.opacity=t.outerText;
    d.el.dataset.progress=(full?1:q).toFixed(5);
  }
  class InbrndFlywheel extends HTMLElement {
    static get observedAttributes(){return ['variant','asset-base','header-offset','heading-level','content-mode','theme','emphasis'];}
    constructor(){
      super();this.attachShadow({mode:'open'});
      this.queue=this.queue.bind(this);this.renderFrame=this.renderFrame.bind(this);this.onClick=this.onClick.bind(this);
      this.invalidate=this.invalidate.bind(this);
      this.motion=matchMedia('(prefers-reduced-motion: reduce)');
      this.userStatic=false;this.frameId=0;
    }
    connectedCallback(){
      this.connected=true;
      try {
        this.render();
        this.shadowRoot.addEventListener('click',this.onClick);
        addEventListener('scroll',this.queue,{passive:true});addEventListener('resize',this.invalidate,{passive:true});
        this.motion.addEventListener('change',this.invalidate);
        document.fonts?.addEventListener('loadingdone',this.invalidate);
        this.observer=new ResizeObserver(this.invalidate);this.observer.observe(this);
        this.renderFrame();
        this.setAttribute('data-ready','');
      } catch(error) {
        this.removeAttribute('data-ready');this.shadowRoot.innerHTML='<slot></slot>';
        console.error('INBRND could not initialize; the static framework remains available.',error);
      }
    }
    disconnectedCallback(){
      this.connected=false;
      removeEventListener('scroll',this.queue);removeEventListener('resize',this.invalidate);
      this.motion.removeEventListener('change',this.invalidate);
      document.fonts?.removeEventListener('loadingdone',this.invalidate);
      this.shadowRoot.removeEventListener('click',this.onClick);this.observer?.disconnect();
      cancelAnimationFrame(this.frameId);this.frameId=0;
    }
    attributeChangedCallback(name,oldValue,value){if(oldValue!==value&&this.connected){this.render();this.invalidate();}}
    invalidate(){
      if(this.mainDiagram)this.mainDiagram.geometryKey=null;
      if(this.staticDiagram)this.staticDiagram.geometryKey=null;
      this.queue();
    }
    render(){
      this.variant=variants.includes(this.getAttribute('variant'))?this.getAttribute('variant'):'wheel';
      const assetBase=new URL(this.getAttribute('asset-base')||'./assets/',document.baseURI).href.replace(/\/?$/,'/');
      if(window.FontFace&&document.fonts){
        if(!fonts.has(assetBase))fonts.set(assetBase,Promise.allSettled(
          [['editors-note-regular.woff2','400'],['editors-note-hairline.otf','100']].map(([file,weight])=>{
            const face=new FontFace('INBRND Editors',`url("${assetBase+file}")`,{weight,display:'swap'});
            document.fonts.add(face);return face.load();
          })
        ));
        fonts.get(assetBase).then(this.invalidate);
      }
      this.offset=Math.max(0,parseFloat(this.getAttribute('header-offset'))||0);
      this.style.setProperty('--header-offset',this.offset+'px');
      const id='inbrnd-'+(++serial),heading='h'+Math.min(6,Math.max(1,parseInt(this.getAttribute('heading-level'),10)||2));
      this.shadowRoot.innerHTML=`<style>${CSS}</style>
        <section class="intro" aria-labelledby="${id}-intro"><div class="overline"><span>Career as a Brand System™</span><span>The INBRND framework</span></div><div class="intro-grid"><${heading} class="intro-title" id="${id}-intro">A career is not<br><em>a straight line.</em></${heading}><div><p class="intro-description">A structured approach to turning your experience into clear positioning, credible signals, and compounding opportunities.</p><a class="enter" href="#system" data-jump="0">Explore the five parts <span aria-hidden="true">↓</span></a></div></div></section>
        <div class="sr-only accessible-summary"><h2>The system in motion</h2><p>${SUMMARY}</p><ol>${STAGES.map(s=>`<li><h3>${s[0]}</h3><p>${s[1]} ${s[2]}</p></li>`).join('')}</ol><p>${PAYOFF}</p></div>
        <section class="journey" id="system" aria-label="The system in motion"><div class="frame">
          <div class="copy" aria-hidden="true">${STAGES.map((s,i)=>`<article class="lesson" data-lesson="${i}"><h2>${s[0]}</h2><p class="question">${s[1]}</p><p class="description">${s[2]}</p></article>`).join('')}</div>
          <div class="visual-wrap" aria-hidden="true"><div class="diagram main-diagram">${diagram(id)}</div><div class="caption-space"><p class="diagram-caption">FIVE PARTS. ONE CONNECTED SYSTEM.</p><p class="payoff">${PAYOFF}</p></div></div>
          <nav class="stage-nav" aria-label="Explore each part"><span class="nav-caption">THE FIVE PARTS</span>${STAGES.map((s,i)=>`<button type="button" data-jump="${i}" aria-label="${s[0]}"><span class="nav-name">${s[0]}</span></button>`).join('')}</nav>
        </div></section>
        <section class="linear" aria-label="The five parts of the framework" hidden>
          <div class="diagram static-diagram" role="img" aria-label="${SUMMARY}">${diagram(id+'-static')}</div>
          <p class="static-payoff">${PAYOFF}</p>
          <ol class="linear-lessons">${STAGES.map((s,i)=>`<li class="linear-lesson" data-linear="${i}"><h2 tabindex="-1">${s[0]}</h2><p class="question">${s[1]}</p><p class="description">${s[2]}</p></li>`).join('')}</ol>
        </section>
        <div class="tools"><button class="static-toggle" type="button" aria-pressed="false">Read without motion</button><button type="button" data-jump="0">Back to Positioning ↑</button></div>
        <section class="closing" aria-labelledby="${id}-closing"><div class="closing-inner"><div><p class="eyebrow">Over time, the system compounds.</p><h2 id="${id}-closing">Clarity creates credibility.<br><em>Credibility creates opportunity.</em></h2></div><div><p>These five parts reinforce one another, connecting your positioning to your story, visibility, and opportunities.</p><p class="closing-note">Build your career intentionally.</p></div></div></section>`;
      const r=this.shadowRoot;
      this.journey=r.querySelector('.journey');this.frame=r.querySelector('.frame');this.linear=r.querySelector('.linear');
      this.panels=[...r.querySelectorAll('.lesson')];this.buttons=[...r.querySelectorAll('.stage-nav button')];
      this.mainDiagram=bindDiagram(r.querySelector('.main-diagram'));this.staticDiagram=bindDiagram(r.querySelector('.static-diagram'));
      this.linearLessons=[...r.querySelectorAll('.linear-lesson')];this.queue();
    }
    queue(){if(this.isConnected&&!this.frameId)this.frameId=requestAnimationFrame(this.renderFrame);}
    renderFrame(){
      this.frameId=0;if(!this.isConnected||!this.journey)return;
      const available=innerHeight-this.offset;
      // At short/zoomed sizes an unpinned complete framework is more readable.
      const compact=available<=480||(innerWidth<=900&&available<680);
      const stable=this.motion.matches||this.userStatic||compact;
      this.toggleAttribute('data-static',stable);this.toggleAttribute('data-compact',compact);
      this.linear.hidden=!stable;this.journey.hidden=stable;
      this.shadowRoot.querySelector('.accessible-summary').hidden=stable&&this.getAttribute('content-mode')!=='diagram';
      const toggle=this.shadowRoot.querySelector('.static-toggle');
      toggle.disabled=this.motion.matches||compact;toggle.setAttribute('aria-pressed',String(stable));
      toggle.textContent=this.motion.matches?'Reduced motion is on':compact?'Reading view for this screen':stable?'Return to scroll experience':'Read without motion';
      if(stable){paintDiagram(this.staticDiagram,1,true);return;}
      const rect=this.journey.getBoundingClientRect(),travel=this.journey.offsetHeight-this.frame.offsetHeight;
      const q=clamp((-rect.top+this.offset)/Math.max(1,travel)),active=Math.min(4,Math.floor(q/.16));
      paintDiagram(this.mainDiagram,q);
      this.panels.forEach((panel,i)=>{
        const enter=i===0?1:phase(q,i*.16,.016),leave=i===4?1:1-phase(q,(i+1)*.16-.016,.016);
        panel.style.opacity=enter*leave;
      });
      const payoff=timeline(q).payoff;
      this.shadowRoot.querySelector('.payoff').style.opacity=payoff;
      this.shadowRoot.querySelector('.diagram-caption').style.opacity=1-payoff;
      this.buttons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
      this.setAttribute('data-stage',STAGES[active][0].toLowerCase());
      this.setAttribute('data-progress',q.toFixed(5));
    }
    onClick(event){
      const button=event.target.closest('[data-jump],.static-toggle');if(!button)return;event.preventDefault();
      if(button.classList.contains('static-toggle')){
        if(button.disabled)return;
        this.userStatic=!this.userStatic;this.renderFrame();
        (this.userStatic?this.linear:this.journey).scrollIntoView({block:'start',behavior:'instant'});return;
      }
      const i=Number(button.dataset.jump);
      if(this.hasAttribute('data-static')){
        if(this.getAttribute('content-mode')==='diagram'){this.staticDiagram.el.scrollIntoView({block:'center',behavior:'instant'});return;}
        const heading=this.linearLessons[i].querySelector('h2');
        this.linearLessons[i].scrollIntoView({block:'start',behavior:'instant'});heading.focus({preventScroll:true});
      }else{
        const top=this.journey.getBoundingClientRect().top+scrollY,travel=this.journey.offsetHeight-this.frame.offsetHeight;
        scrollTo({top:top-this.offset+(i*.16+.12)*travel,behavior:'instant'});
      }
    }
  }
  customElements.define('inbrnd-flywheel',InbrndFlywheel);
})();
