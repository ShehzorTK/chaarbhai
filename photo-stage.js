/* Work page, Photographs view: a stage that snaps one couple at a time. It is part of the page, not a scroller of its own,
   so the wheel, a swipe or the keys scroll it the same wherever the pointer is, and scrolling back up always reaches the prologue.
   A slide is about 84% of the stage, so the next couple peeks in underneath. Only the active slide and its two
   neighbours hold a strip and real pictures (the page killed iPhone Safari before, see app.js photoWindow);
   every other slide is its heading and an empty box of the same height.
   Uses CHAPTERS, pic(), sequences(), dragScroll(), warmRow() and coolRow() from app.js, at call time.
   Exposes window.PS. */
(function(){
'use strict';

let S=null;
const $=(s,r)=>r.querySelector(s);

/* one entry per slide, in category order (app.js already dropped couples with 3 frames or fewer): each category opens
   with a chapter-opener slide, then one slide per couple */
function flat(){
  const out=[];
  CHAPTERS.forEach((c,ci)=>{
    out.push({open:true,c,ci});
    c.seqs.forEach(q=>out.push({c,ci,q}));
  });
  return out;
}
const catIndex=c=>(window.WORK_CATS||[]).indexOf(c.short);

/* the prologue: a person talking, the contents (which is also the way in), and a cut-short bottom so the stage peeks in */
function prologueHTML(){
  return `<section class="pro" id="pro" aria-labelledby="pro-h">
  <div class="pro-in">
    <h1 class="pro-h" id="pro-h">Come in. Here is the week.</h1>
    <p class="pro-p">These are real weddings, shown from the first night to the farewell. We start with portraits, then follow the week in the order it happened. Swipe a couple’s photographs sideways, scroll for the next story.</p>
    <ol class="pro-list">${CHAPTERS.map(c=>`
      <li><button class="pro-row" type="button" data-ch="${c.id}">
        <span class="pro-n">${esc(c.name)}</span>
        <span class="pro-a">${esc(c.alt.split(' · ').slice(0,3).join(' · '))}</span>
        <span class="pro-c">${c.seqs.length} ${c.seqs.length===1?'couple':'couples'}</span>
      </button></li>`).join('')}
    </ol>
  </div>
</section>`;
}

function openerHTML(d){
  const c=d.c;
  return `<div class="ps-open-in">
    <h2 class="ps-oname">${esc(c.name)}</h2>
    <p class="ps-oalt">${esc(c.alt)}</p>
    <p class="ps-odesc">${esc(c.desc)}</p>
  </div>`;
}
function headHTML(d){
  const q=d.q;
  return `<div class="ps-head"><div class="ps-id"><h3 class="ps-name">${q.couple}</h3>
    <p class="ps-tags">${q.tags.map(esc).join(' · ')}</p></div></div>`;
}
/* what a live slide holds: the sideways strip, one caption line with the count, and the progress bar */
function bodyHTML(d){
  const q=d.q;
  return `<div class="seq-strip">${q.frames.map(f=>`
    <figure class="frame" style="--ar:${f.ar}">
      <div class="fr-img" tabindex="0" role="button" aria-label="Open larger: ${esc(f.cap)}">${pic(f,'(max-width: 600px) 90vw, 620px',{parked:true})}</div>
      <figcaption class="fr-cap vf-sr"><span>${f.cap}</span></figcaption>
    </figure>`).join('')}</div>
  <div class="ps-foot">
    <p class="ps-cap-t"></p>
    <span class="seq-count">1 of ${q.frames.length}</span>
    <span class="ps-arrows"><button class="sq-prev" type="button" aria-label="Previous frame" disabled>${ARROW('l')}</button>
    <button class="sq-next" type="button" aria-label="Next frame">${ARROW('r')}</button></span>
  </div>
  <div class="seq-bar"><i></i></div>`;
}

function html(){
  const data=flat();if(data.length<2)return '';
  const cats=[];data.forEach((d,i)=>{const k=catIndex(d.c);if(!cats.some(x=>x[0]===k))cats.push([k,i])});
  return prologueHTML()+`<div class="ps wk-in" id="ps" data-n="${data.length}">
  <div class="ps-groundwrap" aria-hidden="true"><i class="ps-ground"></i></div>
  <div class="ps-bar">${VF.catLineHTML(cats,'Jump to a category of photographs')}</div>
  <div class="ps-feed" role="region" aria-label="Photographs, one couple at a time">${data.map((d,i)=>d.open
    ?`<article class="ps-slide ps-open" data-i="${i}" aria-label="${esc(d.c.name)}">${openerHTML(d)}</article>`
    :`<article class="seq ps-slide" data-i="${i}" data-label="${esc([d.q.couple,...d.q.tags].join(' · '))}" aria-label="${esc(d.q.couple+', '+d.c.name)}">${headHTML(d)}<div class="ps-body"></div></article>`).join('')}
    <div class="ps-end" aria-hidden="true"></div></div>
  <p class="vf-sr" role="status" aria-live="polite"></p>
</div>`;
}

/* The ground's tint. Each slide carries a final ground colour (tints.py makes them). The stage sets one CSS
   variables on the page when a slide settles and the CSS eases the background (800ms, ease-out quint). Only the couple on
   screen sets it: hovering a category, a contents row or a photograph changes nothing. */
/* only a couple's slide has a colour (its own, else its chapter's): the prologue and the chapter openers stay the site's navy */
const tintOf=d=>d.open?null:((d.q&&d.q.t)||d.c.tint||null);
/* Light mode takes the same hue as the dark ground, as a pale shade (OKLCH L .955, chroma under .02: as quiet as the dark one) */
const lin=v=>(v/=255)<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4),gam=v=>255*(v<=.0031308?12.92*v:1.055*Math.pow(v,1/2.4)-.055);
function lightOf(hex){
  const n=parseInt(hex.slice(1),16),r=lin(n>>16&255),g=lin(n>>8&255),b=lin(n&255);
  const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),q=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
  const A=1.9779984951*l-2.428592205*m+.4505937099*q,B=.0259040371*l+.7827717662*m-.808675766*q,h=Math.atan2(B,A);
  let C=Math.min(.018,Math.max(.008,Math.hypot(A,B)+.002));
  for(let k=0;k<12;k++,C*=.85){
    const a=C*Math.cos(h),bb=C*Math.sin(h),L=.955,l3=Math.pow(L+.3963377774*a+.2158037573*bb,3),m3=Math.pow(L-.1055613458*a-.0638541728*bb,3),s3=Math.pow(L-.0894841775*a-1.291485548*bb,3);
    const c=[4.0767416621*l3-3.3077115913*m3+.2309699292*s3,-1.2684380046*l3+2.6097574011*m3-.3413193965*s3,-.0041960863*l3-.7034186147*m3+1.707614701*s3];
    if(c.every(v=>v>=0&&v<=1))return '#'+c.map(v=>Math.round(gam(v)).toString(16).padStart(2,'0')).join('');
  }
  return null;
}
function setTint(t){
  if(!S||S.notint)return;
  const st=S.host.style;
  if(t){st.setProperty('--tint',t.g);const lt=t.lt||(t.lt=lightOf(t.g));if(lt)st.setProperty('--tint-l',lt);else st.removeProperty('--tint-l')}
  else{st.removeProperty('--tint');st.removeProperty('--tint-l')}
}

/* the ground only takes the colour while the stage is up under the header; the menu above it stays navy */
function applyTint(){
  if(!S)return;
  const t=S.inStage?S.tintNow:null,k=t?t.g:'';
  if(S.tintApplied===k)return;
  S.tintApplied=k;setTint(t);
}

function warm(i){
  const el=S.slides[i];if(!el||el._live||S.data[i].open)return;
  el._live=true;
  $('.ps-body',el).innerHTML=bodyHTML(S.data[i]);
  sequences([el]);dragScroll([$('.seq-strip',el)]);
  warmRow(el);
}
function cool(i){
  const el=S.slides[i];if(!el||!el._live)return;
  el._live=false;
  coolRow(el);
  $('.ps-body',el).textContent='';
}
function activate(i){
  if(!S||i<0||i>=S.data.length||i===S.active)return;
  const pv=S.active;S.active=i;
  if(pv>=0){S.slides[pv].inert=true;S.slides[pv].classList.remove('is-active')}
  S.slides[i].inert=false;S.slides[i].classList.add('is-active');
  /* only the old and new neighbourhoods can hold live strips: warm the new three, cool the rest of the old three */
  const lo=Math.min(i,pv<0?i:pv)-1,hi=Math.max(i,pv<0?i:pv)+1;
  for(let k=Math.max(0,lo);k<=Math.min(S.slides.length-1,hi);k++){if(Math.abs(k-i)<=1)warm(k);else cool(k)}
  const d=S.data[i];
  S.tintNow=tintOf(d);applyTint();
  VF.markCat(S.root,catIndex(d.c),S.reduce);
  S.live.textContent=d.open?d.c.name:d.q.couple+', '+d.c.name;
  if(window.cbLog)cbLog('ps active '+i+', live '+S.slides.filter(e=>e._live).length);
}

/* where the page must be scrolled for slide i to sit just under the header and the category line */
const headH=()=>{const h=document.getElementById('hdr');return h?h.offsetHeight:0};
const slideTop=i=>S.slides[i].getBoundingClientRect().top+scrollY-headH()-S.bar.offsetHeight;

/* A category jump owns the selection until the page has actually landed. Safari can
   keep an old snap target through layout changes and queued observer callbacks. */
function finishJump(state,resume=true){
  if(!state.jump)return;
  cancelAnimationFrame(state.jump.frame);state.jump=null;
  if(resume&&S===state){observe();onScroll()}
}
function cancelJump(){if(S&&S.jump)finishJump(S)}

/* open on a category, instantly; ordinary Work entry stays on the prologue */
function go(id,smooth){
  if(!S)return;
  let i=0;
  if(id){const k=S.data.findIndex(d=>d.c.id===id);if(k>=0)i=k}
  const state=S;
  finishJump(state,false);
  clearTimeout(state.deb);
  if(!id&&!smooth){activate(i);onScroll();return}
  // Suspend snapping BEFORE warming/cooling strips, since those DOM changes can
  // make Safari restore the old snap target before scrollTo even runs.
  const jump=state.jump={frame:0,start:performance.now(),stable:0};
  state.host.classList.remove('snap-y');
  if(state.io){state.io.disconnect();state.io.takeRecords()}
  void state.root.offsetHeight;
  state.cand=i;activate(i);
  const land=now=>{
    if(S!==state||state.jump!==jump)return;
    if(!shown()){finishJump(state);return}
    const max=Math.max(0,state.host.scrollHeight-innerHeight);
    const top=Math.max(0,Math.min(max,slideTop(i)));
    const landed=Math.abs(scrollY-top)<=2;
    jump.stable=landed?jump.stable+1:0;
    if(!landed)scrollTo({top,behavior:'instant'});
    // Several settled frames plus a short quiet window let Safari finish its
    // scroll/layout work. Never leave navigation locked if it cannot settle.
    if((jump.stable>=3&&now-jump.start>=180)||now-jump.start>=1000){
      finishJump(state);return;
    }
    onScroll();jump.frame=requestAnimationFrame(land);
  };
  jump.frame=requestAnimationFrame(land);
}

/* what the page's position means for the stage: is it under the header, should it snap, has the prologue tucked away.
   One cheap read per frame while the page scrolls. */
function measure(){
  if(!S)return;
  S.tick=0;
  if(S.root.offsetParent===null)return;
  const r=S.root.getBoundingClientRect(),hh=headH(),vh=innerHeight;
  S.inStage=r.top<=hh+1&&r.bottom>hh+S.bar.offsetHeight;                   // the stage is up under the header
  applyTint();
  S.tucked=r.top<=vh*.5;
  document.body.classList.toggle('vf-in',S.inStage);
  if(S.inStage){const h=document.getElementById('hdr');if(h)h.classList.remove('hide')}
  /* hard snapping, one slide per swipe, only while the stage fills the screen: elsewhere (prologue, footer) the page scrolls freely */
  document.documentElement.classList.toggle('snap-y',!S.jump&&S.inStage&&r.bottom>=vh-4);
  const pro=document.getElementById('pro');if(pro)pro.classList.toggle('tucked',S.tucked);
}
/* Scrolling is the browser's own. The page snaps one slide at a time only while the stage fills the screen (html.snap-y, set in
   measure()); the menu above it scrolls freely. Left and Right step the photographs of the couple on screen. */
const shown=()=>S&&S.root.offsetParent!==null;
function onKey(e){
  const k=e.key;
  if((k!=='ArrowRight'&&k!=='ArrowLeft')||!shown()||e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey||!S.inStage||S.active<0)return;
  const t=e.target;
  if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||(t.closest&&t.closest('.seq-strip'))))return;   // a focused strip scrolls itself
  if(document.documentElement.classList.contains('lb-open')||document.body.classList.contains('locked')||document.body.classList.contains('vf-on'))return;
  const b=S.slides[S.active].querySelector(k==='ArrowRight'?'.sq-next':'.sq-prev');
  if(b&&!b.disabled){e.preventDefault();b.click()}
}
function onScroll(){if(S&&!S.tick){S.tick=1;requestAnimationFrame(measure)}}

function observe(){
  if(S.io)S.io.disconnect();
  const top=headH()+S.bar.offsetHeight;
  const state=S;
  const observer=new IntersectionObserver(es=>{
    if(S!==state||state.io!==observer||state.jump)return;
    es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=0.6)S.cand=+e.target.dataset.i});
    clearTimeout(S.deb);
    S.deb=setTimeout(()=>{if(S===state&&!state.jump&&state.cand>=0)activate(state.cand)},90);     // not while a fling is still going past
  },{rootMargin:'-'+top+'px 0px 0px 0px',threshold:[0.6]});
  S.io=observer;
  S.slides.forEach(el=>S.io.observe(el));
}
function onResize(){if(!S)return;if(!S.jump)observe();onScroll()}

/* ?notint switches the ground tint off, to find out whether it is what a browser chokes on (read once, at mount) */
const Q={has:k=>new URLSearchParams(location.search).has(k)};
function mount(then){
  unmount();
  const root=document.getElementById('ps');if(!root)return;
  const data=flat();
  S={root,data,bar:$('.ps-bar',root),slides:[...root.querySelectorAll('.ps-slide')],live:$('.vf-sr[role=status]',root),
     reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,active:-1,cand:-1,deb:0,
     host:document.documentElement,notint:Q.has('notint')};
  S.slides.forEach(el=>{el.inert=true});
  addEventListener('resize',onResize,{passive:true});
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('wheel',cancelJump,{passive:true});
  addEventListener('touchmove',cancelJump,{passive:true});
  document.addEventListener('keydown',onKey);
  observe();
  const jump=b=>{if(S&&S.root===root&&b)go(S.data[+b.dataset.first].c.id,true)};
  root.addEventListener('click',e=>jump(e.target.closest('.cl-b')));
  // iPhone Safari can suppress click after a scroll. Handle a stationary touch explicitly,
  // while leaving sideways category swipes and vertical page scrolling to the browser.
  let tap=null;
  S.bar.addEventListener('touchstart',e=>{
    const b=e.target.closest('.cl-b'),t=e.touches[0];
    tap=b&&e.touches.length===1?{b,x:t.clientX,y:t.clientY}:null;
  },{passive:true});
  S.bar.addEventListener('touchmove',e=>{
    const t=e.touches[0];
    if(tap&&(!t||e.touches.length!==1||Math.hypot(t.clientX-tap.x,t.clientY-tap.y)>8))tap=null;
  },{passive:true});
  S.bar.addEventListener('touchend',e=>{
    const start=tap;tap=null;const t=e.changedTouches[0];
    if(!start||!t||e.touches.length||Math.hypot(t.clientX-start.x,t.clientY-start.y)>8||e.target.closest('.cl-b')!==start.b)return;
    if(e.cancelable)e.preventDefault();
    jump(start.b);
  },{passive:false});
  S.bar.addEventListener('touchcancel',()=>{tap=null},{passive:true});
  /* the contents list is the way in: open the stage on that chapter */
  const pro=document.getElementById('pro');
  if(pro){S.proClick=e=>{const b=e.target.closest('.pro-row');if(b)go(b.dataset.ch,true)};pro.addEventListener('click',S.proClick)}
  go(then);
  measure();
}
function unmount(){
  if(!S)return;
  finishJump(S,false);
  clearTimeout(S.deb);if(S.io)S.io.disconnect();
  const pro=document.getElementById('pro');if(pro&&S.proClick)pro.removeEventListener('click',S.proClick);
  S.host.style.removeProperty('--tint');S.host.style.removeProperty('--tint-l');
  document.documentElement.classList.remove('snap-y');
  removeEventListener('wheel',cancelJump);removeEventListener('touchmove',cancelJump);
  removeEventListener('resize',onResize);removeEventListener('scroll',onScroll);document.removeEventListener('keydown',onKey);
  S=null;
  if(!(window.VF&&VF.isOpen()))document.body.classList.remove('vf-in');
}
/* coming back from Films: land on the menu, like arriving on the page */
function restore(){
  if(!S||S.root.offsetParent===null)return;
  scrollTo({top:0,behavior:'instant'});                  // switching tabs lands on the menu
  observe();measure();
  VF.syncUL();
}

window.PS={html,mount,unmount,restore,go};
})();
