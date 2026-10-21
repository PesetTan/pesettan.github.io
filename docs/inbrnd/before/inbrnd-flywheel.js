/* INBRND educational flywheel. Framework copy: inbrnd.co/framework.
   One deterministic scroll clock; no timers, autoplay, or scroll interception. */
(() => {
  'use strict';
  if (customElements.get('inbrnd-flywheel')) return;
  const STAGES = [
    ['Positioning', 'What do you want to be known for?', 'Your strategic lane, not your job title.'],
    ['Narrative', 'How does your experience connect?', 'A clear story makes you easier to understand.'],
    ['Platforms', 'Where does your story live?', 'The places where people encounter your work, thinking, and perspective.'],
    ['Opportunities', 'What becomes possible when the system works?', 'New conversations, relationships, roles, clients, and collaborations.'],
    ['Signals', 'What gives your positioning credibility?', 'Projects, writing, talks, awards, partnerships, recommendations, and visible contributions.']
  ];
  const VARIANTS = ['wheel', 'sculpted', 'editorial', 'thread'];
  const CSS = ":host{display:block;--ivory:#f8f5f0;--paper:#fffcf8;--ink:#302e2d;--rose:#945267;--rose-light:#d5a5b1;--line:#ddd5cf;--muted:#756b67;--header-offset:0px;color:var(--ink);background:var(--ivory);font-family:\"INBRND Editors\",Georgia,serif;contain:style}\n*{box-sizing:border-box}a{color:inherit}button{font:inherit}a,button{-webkit-tap-highlight-color:transparent}a:focus-visible,button:focus-visible{outline:2px solid var(--rose);outline-offset:5px}\n.eyebrow,.overline,.stage-index,.stage-nav,.closing-note,.diagram-caption{font-family:Arial,Helvetica,sans-serif}\n.eyebrow,.overline{font-size:10px;letter-spacing:.18em;line-height:1.5;text-transform:uppercase}\n.intro{max-width:1440px;margin:auto;padding:74px 6vw 65px;position:relative}\n.overline{display:flex;justify-content:space-between;gap:24px;color:var(--muted);padding-bottom:22px;border-bottom:1px solid var(--line)}\n.intro-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:9vw;align-items:end;padding-top:46px}\nh1,h2,h3,h4,h5,h6,p{margin:0;font-weight:400}.intro-title{font-size:clamp(54px,6.4vw,94px);letter-spacing:-.052em;line-height:1.02;max-width:800px}.intro-title em,.closing h2 em{font-style:normal;color:var(--rose)}\n.intro-description{font-size:23px;line-height:1.48;max-width:380px;letter-spacing:-.015em}\n.enter{display:inline-flex;align-items:center;gap:20px;text-decoration:none;margin-top:30px;font:10px Arial,sans-serif;letter-spacing:.15em;text-transform:uppercase}.enter span{display:grid;place-items:center;width:35px;height:35px;border:1px solid #b8aaa3;border-radius:50%;font-size:18px}\n.journey{position:relative;height:calc(100svh - var(--header-offset) + 475svh);border-top:1px solid var(--line)}\n.frame{position:sticky;top:var(--header-offset);height:calc(100svh - var(--header-offset));min-height:580px;max-width:1600px;margin:auto;padding:32px 5vw 24px;display:grid;grid-template-columns:minmax(290px,.78fr) minmax(0,1.22fr);grid-template-rows:1fr auto;gap:0 4vw;align-items:center;overflow:hidden}\n.copy{position:relative;height:310px;align-self:center;z-index:2}.lesson{position:absolute;inset:0;opacity:0;pointer-events:none}\n.stage-index{font-size:11px;letter-spacing:.2em;color:var(--rose);margin-bottom:22px;display:flex;align-items:center;gap:18px}.stage-index:after{content:\"\";height:1px;width:45px;background:var(--rose-light)}\n.lesson h2{font-size:clamp(47px,4.9vw,78px);letter-spacing:-.055em;line-height:1.05;margin-bottom:28px}\n.question{font-size:clamp(23px,2.25vw,34px);line-height:1.2;letter-spacing:-.015em;max-width:430px}\n.description{font-size:19px;line-height:1.48;color:#655c57;margin-top:17px;max-width:390px}\n.visual-wrap{position:relative;min-width:0;align-self:center;display:flex;flex-direction:column;align-items:center}\n.diagram{width:min(100%,calc(100svh - var(--header-offset) - 150px));max-width:900px;aspect-ratio:1}.diagram svg{display:block;width:100%;height:100%;overflow:visible}\n.foundation{fill:none;stroke:var(--line);stroke-width:1;stroke-dasharray:1 7}.registration{fill:none;stroke:#bfb4ad;stroke-width:1}\n.rose-segment,.rose-depth{fill:none;stroke:var(--rose-light);stroke-width:12;stroke-linecap:butt;stroke-dasharray:100;stroke-dashoffset:100;opacity:0}.rose-depth{display:none}\n.node{opacity:0}.node-base{fill:var(--ivory);stroke:#d8ccc5;stroke-width:1}.node.active .node-base{stroke:var(--rose)}\n.node-number{font:10px Arial,sans-serif;letter-spacing:2px;fill:var(--rose)}\n.node-label{font:26px \"INBRND Editors\",Georgia,serif;fill:var(--ink);letter-spacing:-.4px}svg text{text-anchor:middle}\n.connection{fill:none;stroke:var(--ink);stroke-width:1.35;stroke-dasharray:100;stroke-dashoffset:100;opacity:0}\n.arrowhead{fill:none;stroke:var(--ink);stroke-width:1.35;opacity:0}\n.core{opacity:0;transform-origin:340px 340px}.core-disc{fill:var(--paper);stroke:var(--line);stroke-width:1}\n.core-label{font:41px \"INBRND Editors\",Georgia,serif;fill:var(--ink);letter-spacing:-1px}.core-small{font:6.7px Arial,sans-serif;letter-spacing:1.25px;fill:var(--muted)}.core-tick{stroke:var(--rose);stroke-width:1}\n.authority{opacity:0;font:10px Arial,sans-serif;letter-spacing:3px;fill:var(--rose)}\n.diagram-caption{font-size:9px;letter-spacing:.16em;color:var(--muted);margin-top:6px;display:flex;gap:14px;align-items:center}.diagram-caption:before{content:\"\";width:4px;height:4px;background:var(--rose);border-radius:50%}\n.stage-nav{grid-column:1/-1;border-top:1px solid var(--line);padding-top:18px;display:flex;align-items:center;gap:28px}.nav-caption{font-size:9px;letter-spacing:.17em;color:var(--muted);margin-right:auto}\n.stage-nav button{background:none;border:0;color:var(--muted);padding:10px 0;cursor:pointer;font:10px Arial,sans-serif;display:flex;gap:10px;position:relative;min-height:44px}.stage-nav button span{color:var(--rose)}.stage-nav button[aria-current=step]{color:var(--ink)}\n.stage-nav button:after{content:\"\";position:absolute;bottom:2px;left:0;width:100%;height:1px;background:var(--rose);transform:scaleX(0);transform-origin:left}.stage-nav button[aria-current=step]:after{transform:scaleX(1)}\n.tools{display:flex;gap:20px;align-items:center;justify-content:space-between;max-width:1440px;margin:auto;padding:18px 6vw;border-top:1px solid var(--line)}.tools button{border:0;background:none;padding:12px 0;cursor:pointer;color:var(--muted);font:10px Arial,sans-serif;letter-spacing:.03em}.tools .static-toggle[aria-pressed=true]{color:var(--ink);text-decoration:underline;text-underline-offset:4px}\n.closing{padding:100px 6vw 110px;background:#efe7e2}.closing-inner{max-width:1268px;margin:auto;display:grid;grid-template-columns:1.2fr .8fr;gap:9vw;align-items:end}.closing .eyebrow{color:var(--rose);margin-bottom:24px}\n.closing h2{font-size:clamp(42px,5vw,74px);letter-spacing:-.05em;line-height:1.08}.closing p{font-size:22px;line-height:1.45;max-width:410px}.closing-note{font-size:10px!important;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-top:28px}\n.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}.linear{display:none}\n:host([variant=sculpted]){--ivory:#f4eee7;--paper:#fffcf7;--rose-light:#c997a5}\n:host([variant=sculpted]) .rose-depth{display:block;stroke:#b99998;stroke-width:30}\n:host([variant=sculpted]) .rose-segment{stroke:#dfb9c1;stroke-width:26}\n:host([variant=sculpted]) .node-base{fill:#fffbf5;stroke:#dfd2c7;filter:drop-shadow(0 4px 4px #3a282814)}\n:host([variant=sculpted]) .core-disc{fill:#fffbf5;filter:drop-shadow(0 5px 8px #3a282813)}\n:host([variant=sculpted]) .foundation{stroke:#c4b5aa;stroke-dasharray:none}\n:host([variant=editorial]) .frame{grid-template-columns:1.03fr 1fr;gap:0 2vw}\n:host([variant=editorial]) .lesson h2{font-size:clamp(55px,6.3vw,94px)}\n:host([variant=editorial]) .stage-index{font:56px \"INBRND Editors\",Georgia,serif;letter-spacing:-.05em;color:var(--rose);margin-bottom:12px}:host([variant=editorial]) .stage-index:after{width:64px}\n:host([variant=editorial]) .copy{height:360px}:host([variant=editorial]) .node-base{stroke:none}:host([variant=editorial]) .rose-segment{stroke-width:5}:host([variant=editorial]) .core-disc{fill:none;stroke:none}:host([variant=editorial]) .foundation{stroke-dasharray:none;opacity:.45}\n:host([variant=thread]) .frame{grid-template-columns:minmax(0,1.2fr) minmax(290px,.8fr)}\n:host([variant=thread]) .copy{grid-column:2;grid-row:1}:host([variant=thread]) .visual-wrap{grid-column:1;grid-row:1}\n:host([variant=thread]) .node-base{stroke:none}:host([variant=thread]) .node-number{font-size:11px}\n:host([variant=thread]) .connection,:host([variant=thread]) .arrowhead{stroke-width:2.3;stroke:var(--rose)}\n:host([variant=thread]) .rose-segment{stroke-width:3}:host([variant=thread]) .core-disc{fill:none;stroke:none}\n:host([variant=thread]) .foundation{stroke-dasharray:1 10;opacity:.6}\n@media(min-width:1600px){.intro,.frame,.closing-inner{padding-left:80px;padding-right:80px}.intro-grid{gap:100px}}\n@media(max-width:1050px) and (min-width:901px){.frame{gap:0 2vw;padding-inline:4vw;grid-template-columns:.85fr 1.15fr}.lesson h2{font-size:51px}.question{font-size:27px}.description{font-size:18px}.stage-nav{gap:15px}.nav-caption{display:none}:host([variant=editorial]) .lesson h2{font-size:59px}:host([variant=thread]) .frame{grid-template-columns:1.1fr .9fr}}\n@media(max-width:900px){\n.intro{padding:32px 6vw 40px}.overline{font-size:8px;letter-spacing:.1em;padding-bottom:18px}.overline span:last-child{display:none}.intro-grid{display:block;padding-top:32px}.intro-title{font-size:clamp(46px,10.7vw,75px);max-width:620px}.intro-description{font-size:19px;margin-top:25px;max-width:530px}.enter{margin-top:24px;font-size:9px}\n.journey{height:calc(100svh - var(--header-offset) + 450svh)}\n.frame,:host([variant=editorial]) .frame,:host([variant=thread]) .frame{min-height:0;padding:10px 6vw 8px;grid-template-columns:1fr;grid-template-rows:minmax(0,40svh) minmax(0,1fr) auto;gap:0;align-items:start}\n.visual-wrap,:host([variant=thread]) .visual-wrap{grid-column:1;grid-row:1;width:100%;align-self:center}.diagram{width:min(100%,36svh,410px)}.diagram-caption{font-size:8px;margin-top:0}\n.copy,:host([variant=editorial]) .copy,:host([variant=thread]) .copy{grid-column:1;grid-row:2;height:100%;align-self:start;margin-top:15px}\n.stage-index,:host([variant=editorial]) .stage-index{font:9px Arial,sans-serif;letter-spacing:.15em;margin-bottom:12px;color:var(--rose)}\n.lesson h2,:host([variant=editorial]) .lesson h2{font-size:clamp(38px,10vw,57px);margin-bottom:14px;letter-spacing:-.04em}\n.question{font-size:clamp(21px,5.4vw,28px);line-height:1.2;max-width:600px}.description{font-size:17px;line-height:1.4;margin-top:11px;max-width:600px}\n.stage-nav{grid-row:3;grid-column:1;gap:0;justify-content:space-between;padding-top:4px;align-self:end}.stage-nav button{font-size:10px;min-width:44px;min-height:44px;justify-content:center}.stage-nav button .nav-name{display:none}.nav-caption{font-size:8px;letter-spacing:.1em}\n.node-label{font-size:29px;letter-spacing:-.7px}.node-number{font-size:12px}.authority{font-size:14px;letter-spacing:1.7px}.core-label{font-size:43px}.core-small{font-size:8px;letter-spacing:.7px}\n.closing{padding:60px 6vw}.closing-inner{display:block}.closing h2{font-size:46px}.closing p{font-size:19px;margin-top:30px}.closing-note{font-size:9px!important}.tools{padding-block:8px}.tools button{font-size:10px}\n}\n@media(min-width:901px) and (max-height:740px){.frame{min-height:460px;padding-top:16px}.copy,:host([variant=editorial]) .copy{height:300px}.lesson h2{font-size:56px;margin-bottom:18px}:host([variant=editorial]) .lesson h2{font-size:65px}:host([variant=editorial]) .stage-index{font-size:32px}.question{font-size:26px}.description{font-size:18px}.stage-index{margin-bottom:16px}}\n:host([data-static]) .journey,:host([data-compact]) .journey{display:none}\n:host([data-static]) .linear,:host([data-compact]) .linear{display:block;max-width:1300px;margin:auto;padding:20px 6vw 50px;border-top:1px solid var(--line)}\n.linear-lesson{display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:center;padding:60px 0;border-bottom:1px solid var(--line)}.linear-lesson:last-child{border-bottom:0}.linear-lesson h2{font-size:50px;letter-spacing:-.045em;margin-bottom:20px}.linear-lesson .diagram{width:100%;max-width:480px;margin:auto}.linear-lesson .stage-index{font:10px Arial,sans-serif;letter-spacing:.15em}\n.static-diagram{display:none;width:min(100%,650px);margin:0 auto 40px}\n:host([data-static]) .linear-lesson{grid-template-columns:1fr;padding:35px 0;max-width:900px;margin:auto}\n:host([data-static]) .linear-lesson .diagram{display:none}:host([data-static]) .static-diagram{display:block}\n:host([data-static]) .sr-only,:host([data-compact]) .sr-only{display:none}\n@media(max-width:900px){.linear-lesson{grid-template-columns:1fr;padding:35px 0;gap:25px}.linear-lesson .diagram{width:min(100%,390px)}.linear-lesson h2{font-size:42px}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{scroll-behavior:auto!important}}\n/* Keep mobile labels readable without expanding the pinned graphic. */\n@media(max-width:900px){.node-label{font-size:32px;letter-spacing:-.9px}.node-number{font-size:12px}.node-base{stroke-width:1.5}}\n@media(max-width:900px){\n.authority{font-size:23px;letter-spacing:1.2px}\n.node-number,.core-small{display:none}\n.node-label{transform:translateY(-5px)}\n}\n\n.tools button:disabled{cursor:default}\n\n/* Local refinement: continuous outer ring, ring-mounted velocity, unnumbered stages. */\n.velocity{opacity:0;font:30px \"INBRND Editors\",Georgia,serif;letter-spacing:-.3px;fill:var(--ink)}\n.node-label{transform:none}\n@media(max-width:900px){\n .journey{height:calc(100svh - var(--header-offset) + 600svh)}\n .stage-nav{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:3px}\n .nav-caption{display:none}\n .stage-nav button{min-width:0;padding:10px 0;font-size:9px}\n .stage-nav button .nav-name{display:block}\n .velocity{font-size:31px;letter-spacing:-.2px}\n .node-label{transform:none}\n .frame,:host([variant=editorial]) .frame,:host([variant=thread]) .frame{grid-template-rows:minmax(0,39svh) minmax(0,1fr) auto}\n .copy,:host([variant=editorial]) .copy,:host([variant=thread]) .copy{margin-top:8px}\n .lesson h2,:host([variant=editorial]) .lesson h2{margin-bottom:12px}\n}\n@media(max-width:900px) and (max-height:650px){\n .frame,:host([variant=editorial]) .frame,:host([variant=thread]) .frame{padding-top:5px;grid-template-rows:minmax(0,36svh) minmax(0,1fr) auto}\n .diagram{width:min(100%,33svh)}\n .diagram-caption{display:none}\n .lesson h2,:host([variant=editorial]) .lesson h2{font-size:34px;margin-bottom:8px}\n .question{font-size:19px}\n .description{font-size:16px;margin-top:8px}\n .node-label{font-size:35px}\n .authority{font-size:25px}\n .velocity{font-size:35px}\n}\n\n/* Three local versions: matched ring typography, diagram-only, and INBRND rose. */\n.authority,.velocity{font:100 20px \"INBRND Editors\",Georgia,serif;letter-spacing:1.8px;fill:var(--rose);font-synthesis:none}\n:host([content-mode=diagram]) .intro,:host([content-mode=diagram]) .copy,:host([content-mode=diagram]) .closing{display:none}\n:host([content-mode=diagram]) .frame{grid-template-columns:1fr;grid-template-rows:1fr auto;gap:0}\n:host([content-mode=diagram]) .visual-wrap{grid-column:1;grid-row:1}\n:host([content-mode=diagram]) .diagram{width:min(100%,calc(100svh - var(--header-offset) - 125px));max-width:900px}\n:host([content-mode=diagram]) .linear-lesson>div:last-child{display:none}\n:host([content-mode=diagram]) .linear-lesson{grid-template-columns:1fr}\n/* Alternate palette is deliberately scoped to the SVG composition. */\n:host([theme=rose]) .diagram{--ink:#302e2d;--rose:#302e2d;--rose-light:#302e2d;--line:#d5a5b1}\n@media(max-width:900px){\n .authority,.velocity{font-size:34px;letter-spacing:1.2px}\n :host([content-mode=diagram]) .frame{grid-template-rows:1fr auto}\n :host([content-mode=diagram]) .diagram{width:min(94vw,calc(100svh - var(--header-offset) - 110px))}\n}\n@media(max-width:900px) and (max-height:650px){.authority,.velocity{font-size:38px}}\n\n/* Plain labels, bolder inset arrows, and three scroll-scrubbed phase treatments. */\n.foundation{display:none}\n.connection,:host([variant=thread]) .connection{stroke-width:4.5;stroke-linecap:round}\n.arrowhead,:host([variant=thread]) .arrowhead{fill:var(--ink);stroke:none}\n:host([theme=rose]) .connection{stroke:var(--rose)}\n:host([theme=rose]) .arrowhead{fill:var(--rose)}\n.focus-arc{fill:none;stroke-width:12;stroke-dasharray:100;opacity:var(--focus,0)}\n.focus-sector{display:none;opacity:var(--focus,0)}\n.focus-stop{stop-color:#fffaf4}\n.wash-stop{stop-color:#d5a5b1}\n.focus-center{display:none;opacity:var(--focus,0)}\n.focus-title{font:42px \"INBRND Editors\",Georgia,serif;letter-spacing:-1px;fill:var(--ink)}\n.focus-kicker{font:9px Arial,sans-serif;letter-spacing:2px;fill:var(--rose)}\n.focus-pointer{fill:none;stroke:var(--rose);stroke-width:3;stroke-linecap:round}\n.focus-dot{fill:var(--rose)}\n:host([emphasis=sector]) .focus-sector{display:block}\n:host([emphasis=sector]) .focus-arc{display:none}\n:host([emphasis=center]) .focus-center{display:block}\n:host([emphasis=center]) .focus-arc{display:block}\n@media(max-width:900px){.connection,:host([variant=thread]) .connection{stroke-width:5.5}.focus-kicker{font-size:15px;letter-spacing:1px}}\n\n@media(max-width:900px) and (min-height:481px) and (max-height:650px){\n .frame,:host([variant=editorial]) .frame,:host([variant=thread]) .frame{grid-template-rows:minmax(0,40svh) minmax(0,1fr) auto}\n .diagram{width:min(100%,38svh)}\n .node-label{font-size:38px}\n :host([content-mode=diagram]) .frame{grid-template-rows:1fr auto}\n}\n\n/* Phase emphasis comes from color diffusion; labels have no underline. */\n.stage-nav button:after{display:none}\n.stage-nav button[aria-current=step]{font-weight:700}\n\n/* Keep text legible while the active gradient remains very subtle. */\n.diagram{--rose:#302e2d}\n\n:host([content-mode=diagram]) .diagram-caption{display:none}\n\n:host([content-mode=diagram][data-static]) .linear-lesson{display:none}\n";
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
  const phase = (p, start, length) => ease((p - start) / length);
  const point = (r, a) => { const t = a * Math.PI / 180; return [340 + r * Math.cos(t), 340 + r * Math.sin(t)]; };
  const arc = (r, a, b) => { const s = point(r, a), e = point(r, b); return 'M ' + s.join(' ') + ' A ' + r + ' ' + r + ' 0 ' + (Math.abs(b-a) > 180 ? 1 : 0) + ' ' + (b>a?1:0) + ' ' + e.join(' '); };
  let serial = 0;
  const fontBases = new Set();

  function diagram(id) {
    return '<svg viewBox="0 0 680 680" aria-hidden="true" focusable="false">' +
      '<defs><path class="authority-path" id="' + id + '-title" d="' + arc(320, -155, -25) + '"/><path class="velocity-path" id="' + id + '-velocity" d="' + arc(320,155,25) + '"/>' +
      STAGES.map((_,i)=>{const a=-90+i*72,xy=point(289,a),label=point(210,a);return '<radialGradient id="'+id+'-focus-'+i+'" gradientUnits="userSpaceOnUse" cx="'+xy[0]+'" cy="'+xy[1]+'" r="175"><stop offset="0" class="focus-stop" stop-opacity=".25"/><stop offset=".45" class="focus-stop" stop-opacity=".10"/><stop offset="1" class="focus-stop" stop-opacity="0"/></radialGradient><radialGradient id="'+id+'-wash-'+i+'" gradientUnits="userSpaceOnUse" cx="'+label[0]+'" cy="'+label[1]+'" r="145"><stop offset="0" class="wash-stop" stop-opacity=".30"/><stop offset=".5" class="wash-stop" stop-opacity=".12"/><stop offset="1" class="wash-stop" stop-opacity="0"/></radialGradient><linearGradient class="edge-gradient" id="'+id+'-edge-'+i+'" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="white"/><stop offset="1" stop-color="white" stop-opacity="0"/></linearGradient><mask id="'+id+'-edge-mask-'+i+'" maskUnits="userSpaceOnUse" x="0" y="0" width="680" height="680"><rect width="680" height="680" fill="url(#'+id+'-edge-'+i+')"/></mask>';}).join('') +
      '<filter id="' + id + '-depth" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#413638" flood-opacity=".12"/></filter></defs>' +
      '<circle class="foundation" cx="340" cy="340" r="224"/>' +
      '<g class="registration"><path d="M638 340h8 M34 340h8"/></g>' +
      STAGES.map((s, i) => {
        const a = -90 + i*72, xy = point(210,a), tip = point(139,a), tail = point(112,a);
        return '<g class="stage-part" data-part="' + i + '">' +
          '<circle class="focus-sector" cx="'+xy[0]+'" cy="'+xy[1]+'" r="145" fill="url(#'+id+'-wash-'+i+')"/>' +
          '<g class="ring-paint" data-edge-mask="url(#'+id+'-edge-mask-'+i+')">' +
          '<path class="rose-depth" d="' + arc(289,a-36.15,a+36.15) + '" pathLength="100" style="filter:url(#' + id + '-depth)"/>' +
          '<path class="rose-segment" d="' + arc(289,a-36.15,a+36.15) + '" pathLength="100"/>' +
          '<path class="focus-arc" stroke="url(#'+id+'-focus-'+i+')" d="' + arc(289,a-36.15,a+36.15) + '" pathLength="100"/>' +
          '</g><path class="connection" d="' + arc(210,a+23,a+49) + '" pathLength="100"/>' +
          '<path class="arrowhead" d="M-13 -8 L2 0 L-13 8 Z"/>' +
          '<g class="node" style="transform-origin:' + xy[0] + 'px ' + xy[1] + 'px">' +
          '<text class="node-label" x="' + xy[0] + '" y="' + (xy[1]+9) + '">' + s[0] + '</text></g>' +
          '<g class="focus-center"><path class="focus-pointer" d="M ' + tail.join(' ') + ' L ' + tip.join(' ') + '"/>' +
          '<circle class="focus-dot" cx="' + tip[0] + '" cy="' + tip[1] + '" r="5"/>' +
          '<text class="focus-kicker" x="340" y="313">CURRENT FOCUS</text><text class="focus-title" x="340" y="355">' + s[0] + '</text></g></g>';
      }).join('') +
      '<text class="authority"><textPath href="#' + id + '-title" startOffset="50%">AUTHORITY / RECOGNITION</textPath></text>' +
      '<text class="velocity"><textPath href="#' + id + '-velocity" startOffset="50%">CAREER VELOCITY</textPath></text></svg>';
  }
  function bindDiagram(el) {
    return {el,titlePath:el.querySelector('.authority-path'),velocityPath:el.querySelector('.velocity-path'),ringPaint:[...el.querySelectorAll('.ring-paint')],edgeGradients:[...el.querySelectorAll('.edge-gradient')],parts:[...el.querySelectorAll('.stage-part')],focusArcs:[...el.querySelectorAll('.focus-arc')],nodes:[...el.querySelectorAll('.node')],segments:[...el.querySelectorAll('.rose-segment')],depths:[...el.querySelectorAll('.rose-depth')],paths:[...el.querySelectorAll('.connection')],heads:[...el.querySelectorAll('.arrowhead')],velocity:el.querySelector('.velocity'),authority:el.querySelector('.authority')};
  }
  // Trim arcs to the actual label bounds, so arrows follow the text track
  // without touching a word at any responsive font size.
  function alignConnections(d) {
    const key=innerWidth+':'+innerHeight+':'+document.fonts.check('26px "INBRND Editors"');
    if(d.geometryKey===key)return;
    // The upper letters rise away from the ring; lower letters rise toward it.
    // Offset the lower baseline by the supplied Hairline font's cap height
    // (728/1000 em), giving both labels the same 12-unit optical clearance.
    const size=parseFloat(getComputedStyle(d.authority).fontSize);
    const ringWidth=Math.max(parseFloat(getComputedStyle(d.segments[0]).strokeWidth),
      getComputedStyle(d.depths[0]).display==='none'?0:parseFloat(getComputedStyle(d.depths[0]).strokeWidth));
    const labelRadius=289+ringWidth/2+12;
    d.titlePath.setAttribute('d',arc(labelRadius,-155,-25));
    d.velocityPath.setAttribute('d',arc(labelRadius+size*.728,155,25));
    const pad=matchMedia('(max-width:900px)').matches?20:16;
    const bounds=d.nodes.map(n=>{const b=n.querySelector('text').getBBox();return {x:b.x-pad,y:b.y-pad,w:b.width+2*pad,h:b.height+2*pad};});
    const inside=(a,b)=>{const p=point(210,a);return p[0]>=b.x&&p[0]<=b.x+b.w&&p[1]>=b.y&&p[1]<=b.y+b.h;};
    d.connections=STAGES.map((_,i)=>{const a=-90+i*72;let start=a,end=a+72;
      while(start<a+35&&inside(start,bounds[i]))start+=.25;
      while(end>a+37&&inside(end,bounds[(i+1)%5]))end-=.25;
      d.paths[i].setAttribute('d',arc(210,start,end));return {start,end};
    });
    d.geometryKey=key;
  }
  function paintDiagram(d,p,variant,full) {
    alignConnections(d);
    STAGES.forEach((_,i)=>{
      const mobile=matchMedia('(max-width:900px)').matches;
      const reveal=full?1:phase(p,i+.03,mobile?.60:.38), segment=full?1:phase(p,i+.08,mobile?.72:.50);
      const focus=full?0:phase(p,i+.03,.24)*(1-phase(p,i===4?5.12:i+.90,.20));
      d.parts[i].style.setProperty('--focus',focus);
      d.focusArcs[i].style.strokeDashoffset=100*(1-segment);
      // Feather the advancing edge along its tangent, then settle to a solid
      // continuous ring. The feather length is driven by the same scroll clock.
      const feather=10*(1-phase(segment,.78,.22));
      if(!full&&segment>0&&feather>.001){
        const end=-90+i*72-36.15+72.3*segment;
        const from=point(289,end-feather),to=point(289,end),gradient=d.edgeGradients[i];
        gradient.setAttribute('x1',from[0]);gradient.setAttribute('y1',from[1]);
        gradient.setAttribute('x2',to[0]);gradient.setAttribute('y2',to[1]);
        d.ringPaint[i].setAttribute('mask',d.ringPaint[i].dataset.edgeMask);
      }else d.ringPaint[i].removeAttribute('mask');
      const settle=full?0:Math.sin(Math.PI*clamp((p-i-.03)/.76));
      const a=(-90+i*72)*Math.PI/180, distance=(mobile?34:variant==='sculpted'?22:variant==='thread'?12:18)*(1-reveal);
      d.nodes[i].style.opacity=reveal;
      d.nodes[i].style.transform='translate('+Math.cos(a)*distance+'px,'+Math.sin(a)*distance+'px) scale('+(.88+.12*reveal+.024*settle+.035*focus)+')';
      d.nodes[i].classList.toggle('active',!full&&p>=i&&p<i+1);
      for(const seg of [d.segments[i],d.depths[i]]){seg.style.strokeDashoffset=100*(1-segment);seg.style.opacity=segment>0?1:0;}
      // The incoming connection is drawn during the new beat; close only at the end.
      const drawn=full?1:i===4?phase(p,4.80,.40):phase(p,i+1.20,mobile?.58:.40);
      d.paths[i].style.strokeDashoffset=100*(1-drawn);d.paths[i].style.opacity=drawn>0?1:0;
      const {start,end}=d.connections[i],angle=start+(end-start)*drawn,xy=point(210,angle);
      d.heads[i].setAttribute('transform','translate('+xy.join(' ')+') rotate('+(angle+90)+')');
      d.heads[i].style.opacity=phase(drawn,0,.14);
    });
    const resolve=full?1:phase(p,5.23,.32);
    d.velocity.style.opacity=resolve;
    d.authority.style.opacity=resolve;
    d.el.dataset.progress=p.toFixed(4);
  }
  class InbrndFlywheel extends HTMLElement {
    static get observedAttributes(){return ['variant','asset-base','header-offset','heading-level','content-mode','theme','emphasis'];}
    constructor(){
      super();this.attachShadow({mode:'open'});
      this.queue=this.queue.bind(this);this.renderFrame=this.renderFrame.bind(this);this.onClick=this.onClick.bind(this);
      this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.compact=matchMedia('(max-height: 480px)');
      this.userStatic=false;this.frameId=0;
    }
    connectedCallback(){
      this.render();this.shadowRoot.addEventListener('click',this.onClick);
      addEventListener('scroll',this.queue,{passive:true});addEventListener('resize',this.queue,{passive:true});
      this.motion.addEventListener('change',this.queue);this.compact.addEventListener('change',this.queue);
      this.observer=new ResizeObserver(this.queue);this.observer.observe(this);this.queue();
    }
    disconnectedCallback(){
      removeEventListener('scroll',this.queue);removeEventListener('resize',this.queue);
      this.motion.removeEventListener('change',this.queue);this.compact.removeEventListener('change',this.queue);
      this.shadowRoot.removeEventListener('click',this.onClick);this.observer?.disconnect();cancelAnimationFrame(this.frameId);this.frameId=0;
    }
    attributeChangedCallback(name,oldValue,value){if(oldValue!==value&&this.isConnected)this.render();}
    render(){
      this.variant=VARIANTS.includes(this.getAttribute('variant'))?this.getAttribute('variant'):'wheel';
      const assetBase=new URL(this.getAttribute('asset-base')||'./assets/',document.baseURI).href.replace(/\/?$/,'/');
      if(!fontBases.has(assetBase)){
        fontBases.add(assetBase);
        for(const [file,weight] of [['editors-note-regular.woff2','400'],['editors-note-hairline.otf','100']]){
          const face=new FontFace('INBRND Editors','url("'+assetBase+file+'")',{weight,display:'swap'});
          document.fonts.add(face);face.load().then(this.queue).catch(()=>{fontBases.delete(assetBase);});
        }
      }
      this.offset=Math.max(0,parseFloat(this.getAttribute('header-offset'))||0);
      this.style.setProperty('--header-offset',this.offset+'px');
      const id='inbrnd-'+(++serial);
      const heading='h'+Math.min(6,Math.max(1,parseInt(this.getAttribute('heading-level'),10)||2));
      const panels=STAGES.map((s,i)=>'<article class="lesson" data-lesson="'+i+'"><h2>'+s[0]+'</h2><p class="question">'+s[1]+'</p><p class="description">'+s[2]+'</p></article>').join('');
      this.shadowRoot.innerHTML='<style>'+CSS+'</style>'+
        '<section class="intro" aria-labelledby="intro-heading"><div class="overline"><span>Career as a Brand System™</span><span>The INBRND framework</span></div><div class="intro-grid"><'+heading+' class="intro-title" id="intro-heading">A career is not<br><em>a straight line.</em></'+heading+'><div><p class="intro-description">A structured approach to turning your experience into clear positioning, credible signals, and compounding opportunities.</p><a class="enter" href="#system" data-jump="0">Explore the five parts <span aria-hidden="true">↓</span></a></div></div></section>'+
        '<div class="sr-only"><h2>The system in motion</h2><p>Five connected parts. Clockwise from the top:</p><ul>'+STAGES.map(s=>'<li><h3>'+s[0]+'</h3><p>'+s[1]+' '+s[2]+'</p></li>').join('')+'</ul><p>Signals connects back to Positioning. The complete flywheel includes Authority / Recognition and Career Velocity.</p></div>'+
        '<section class="journey" id="system" aria-label="The system in motion"><div class="frame"><div class="copy" aria-hidden="true">'+panels+'</div><div class="visual-wrap" aria-hidden="true"><div class="diagram main-diagram">'+diagram(id)+'</div><p class="diagram-caption">FIVE PARTS. ONE CONNECTED SYSTEM.</p></div><nav class="stage-nav" aria-label="Explore each part"><span class="nav-caption">THE FIVE PARTS</span>'+STAGES.map((s,i)=>'<button type="button" data-jump="'+i+'" aria-label="'+s[0]+'"><span class="nav-name">'+s[0]+'</span></button>').join('')+'</nav></div></section>'+
        '<section class="linear" aria-label="The five parts of the framework"><div class="diagram static-diagram" role="img" aria-label="Complete flywheel: Positioning, Narrative, Platforms, Opportunities, Signals, and back to Positioning. Authority / Recognition and Career Velocity appear on the outer ring.">'+diagram(id+'-static')+'</div>'+
        STAGES.map((s,i)=>'<article class="linear-lesson" data-linear="'+i+'"><div class="diagram" aria-hidden="true">'+diagram(id+'-linear-'+i)+'</div><div><h2 tabindex="-1">'+s[0]+'</h2><p class="question">'+s[1]+'</p><p class="description">'+s[2]+'</p></div></article>').join('')+'</section>'+
        '<div class="tools"><button class="static-toggle" type="button" aria-pressed="false">Read without motion</button><button type="button" data-jump="0">Back to Positioning ↑</button></div>'+
        '<section class="closing" aria-labelledby="closing-heading"><div class="closing-inner"><div><p class="eyebrow">Over time, the system compounds.</p><h2 id="closing-heading">Clarity creates credibility.<br><em>Credibility creates opportunity.</em></h2></div><div><p>These five parts reinforce one another, connecting your positioning to your story, visibility, and opportunities.</p><p class="closing-note">Build your career intentionally.</p></div></div></section>';
      this.journey=this.shadowRoot.querySelector('.journey');this.frame=this.shadowRoot.querySelector('.frame');
      this.panels=[...this.shadowRoot.querySelectorAll('.lesson')];this.buttons=[...this.shadowRoot.querySelectorAll('.stage-nav button')];
      this.mainDiagram=bindDiagram(this.shadowRoot.querySelector('.main-diagram'));this.staticDiagram=bindDiagram(this.shadowRoot.querySelector('.static-diagram'));
      this.linearLessons=[...this.shadowRoot.querySelectorAll('.linear-lesson')];this.linearDiagrams=this.linearLessons.map(el=>bindDiagram(el.querySelector('.diagram')));
      this.queue();
    }
    queue(){if(this.isConnected&&!this.frameId)this.frameId=requestAnimationFrame(this.renderFrame);}
    renderFrame(){
      this.frameId=0;if(!this.isConnected||!this.journey)return;
      const stable=this.motion.matches||this.userStatic,compact=this.compact.matches||innerHeight-this.offset<=480;
      this.toggleAttribute('data-static',stable);this.toggleAttribute('data-compact',compact);
      this.shadowRoot.querySelector('.linear').setAttribute('aria-hidden',String(!stable&&!compact));
      this.journey.setAttribute('aria-hidden',String(stable||compact));
      const toggle=this.shadowRoot.querySelector('.static-toggle');
      toggle.disabled=this.motion.matches;toggle.setAttribute('aria-pressed',String(stable));toggle.textContent=this.motion.matches?'Reduced motion is on':stable?'Return to scroll experience':'Read without motion';
      if(stable){paintDiagram(this.staticDiagram,6,this.variant,true);return;}
      if(compact){
        this.linearLessons.forEach((el,i)=>{const rect=el.getBoundingClientRect(),amount=clamp((innerHeight*.9-rect.top)/Math.min(rect.height*.7,innerHeight*.8));paintDiagram(this.linearDiagrams[i],i+(i===4?1.65:1)*amount,this.variant,false);});return;
      }
      const rect=this.journey.getBoundingClientRect(),travel=this.journey.offsetHeight-this.frame.offsetHeight;
      const p=Math.max(0,Math.min(6.15,(-rect.top+this.offset)/travel*6.15)),active=Math.min(4,Math.floor(p));
      paintDiagram(this.mainDiagram,p,this.variant,false);
      this.panels.forEach((panel,i)=>{
        const enter=i===0?1:phase(p,i,.14),leave=i===4?1:1-phase(p,i+.87,.13);
        panel.style.opacity=enter*leave;
        panel.style.transform='translateY('+((i===0?0:14*(1-enter))-8*(1-leave))+'px)';
      });
      this.buttons.forEach((b,i)=>{if(i===active)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current');});
      this.setAttribute('data-stage',STAGES[active][0].toLowerCase());
    }
    onClick(event){
      const button=event.target.closest('[data-jump],.static-toggle');if(!button)return;event.preventDefault();
      if(button.classList.contains('static-toggle')){
        if(this.motion.matches)return;
        this.userStatic=!this.userStatic;this.renderFrame();this.shadowRoot.querySelector(this.userStatic?'.linear':'.journey').scrollIntoView({block:'start',behavior:'instant'});return;
      }
      const i=Number(button.dataset.jump);
      if((this.motion.matches||this.userStatic)&&this.getAttribute('content-mode')==='diagram'){
        this.staticDiagram.el.scrollIntoView({block:'center',behavior:'instant'});return;
      }
      if(this.motion.matches||this.userStatic||this.compact.matches||innerHeight-this.offset<=480){
        const heading=this.linearLessons[i].querySelector('h2');this.linearLessons[i].scrollIntoView({block:'start',behavior:'instant'});heading.focus({preventScroll:true});
      }else{
        const top=this.journey.getBoundingClientRect().top+scrollY,travel=this.journey.offsetHeight-this.frame.offsetHeight;
        scrollTo({top:top-this.offset+(i+.82)/6.15*travel,behavior:'instant'});
      }
    }
  }
  customElements.define('inbrnd-flywheel',InbrndFlywheel);
})();
