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
  <div class="ps-glowwrap" aria-hidden="true"><i class="ps-glow"></i></div>
  <div class="ps-bar">${VF.catLineHTML(cats,'Jump to a category of photographs')}</div>
  <div class="ps-feed" role="region" aria-label="Photographs, one couple at a time">${data.map((d,i)=>d.open
    ?`<article class="ps-slide ps-open" data-i="${i}" aria-label="${esc(d.c.name)}">${openerHTML(d)}</article>`
    :`<article class="seq ps-slide" data-i="${i}" data-label="${esc([d.q.couple,...d.q.tags].join(' · '))}" aria-label="${esc(d.q.couple+', '+d.c.name)}">${headHTML(d)}<div class="ps-body"></div></article>`).join('')}
    <div class="ps-end" aria-hidden="true"></div></div>
  <p class="vf-sr" role="status" aria-live="polite"></p>
</div>`;
}

/* The ground's tint. Each slide carries a final ground colour and a glow colour (tints.py makes them). The stage sets two CSS
   variables on the page when a slide settles and the CSS eases the background (800ms, ease-out quint). Only the couple on
   screen sets it: hovering a category, a contents row or a photograph changes nothing. */
/* only a couple's slide has a colour (its own, else its chapter's): the prologue and the chapter openers stay the site's navy */
const tintOf=d=>d.open?null:((d.q&&d.q.t)||d.c.tint||null);
function setTint(t){
  if(!S)return;
  const st=S.host.style;
  if(t){st.setProperty('--tint',t.g);st.setProperty('--glow',t.l)}else{st.removeProperty('--tint');st.removeProperty('--glow')}
}

/* the ground only takes the colour while the stage is up under the header; the menu above it stays navy */
function applyTint(){
  if(!S)return;
  const t=S.inStage?S.tintNow:null,k=t?t.g:'';
  if(S.tintApplied===k)return;
  S.tintApplied=k;setTint(t);
}

/* The glow: one soft pool of light on the ground, behind the photographs. One composited layer moved by transform only;
   it lives in a sticky wrapper the size of the screen, so its coordinates are screen coordinates.
   Mouse: it chases the pointer (about 1s) in a rAF loop that sleeps when it has arrived and when the tab is hidden.
   Phone: no pointer, so it sits low in the middle and slides sideways with the story (set on slide change), plus a
   very slow drift in CSS. No gyroscope. Reduced motion: it stays at rest. */
function glowRest(){
  if(!S||!S.glow)return;
  S.gw=S.glow.offsetWidth||0;
  S.gx=S.tx=innerWidth*.5;S.gy=S.ty=S.fine?innerHeight*.45:innerHeight*.82;
  glowPlace();
}
function glowPlace(){S.glow.style.transform='translate3d('+(S.gx-S.gw/2).toFixed(1)+'px,'+(S.gy-S.gw/2).toFixed(1)+'px,0)'}
function glowTick(t){
  if(!S||!S.chase)return;
  const dt=Math.min(64,t-(S.gt||t));S.gt=t;
  const k=1-Math.exp(-dt/320);
  S.gx+=(S.tx-S.gx)*k;S.gy+=(S.ty-S.gy)*k;
  glowPlace();
  if(Math.abs(S.tx-S.gx)<.5&&Math.abs(S.ty-S.gy)<.5){S.gx=S.tx;S.gy=S.ty;glowPlace();S.chase=0;S.gt=0;return}
  S.raf=requestAnimationFrame(glowTick);
}
function glowMove(e){
  if(!S||!S.inStage)return;
  S.tx=e.clientX;S.ty=e.clientY;
  if(!S.chase&&!document.hidden){S.chase=1;S.gt=0;S.raf=requestAnimationFrame(glowTick)}
}
function glowStory(i){
  if(S.fine||S.reduce)return;
  const p=S.data.length>1?i/(S.data.length-1):0;
  S.gx=innerWidth*(.2+.6*p);glowPlace();
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
  S.active=i;
  S.slides.forEach((el,k)=>{
    el.inert=k!==i;
    el.classList.toggle('is-active',k===i);
    if(Math.abs(k-i)<=1)warm(k);else cool(k);
  });
  const d=S.data[i];
  S.tintNow=tintOf(d);applyTint();glowStory(i);
  VF.markCat(S.root,catIndex(d.c),S.reduce);
  S.live.textContent=d.open?d.c.name:d.q.couple+', '+d.c.name;
  if(window.cbLog)cbLog('ps active '+i+', live '+S.slides.filter(e=>e._live).length);
}

/* where the page must be scrolled for slide i to sit just under the header and the category line */
const headH=()=>{const h=document.getElementById('hdr');return h?h.offsetHeight:0};
const slideTop=i=>S.slides[i].getBoundingClientRect().top+scrollY-headH()-S.bar.offsetHeight;

/* open on a category (by chapter id, e.g. "henna"), or on the first couple. Lands at once, no scroll animation. */
function go(id,smooth){
  if(!S)return;
  let i=0;
  if(id){const k=S.data.findIndex(d=>d.c.id===id);if(k>=0)i=k}
  if(id||smooth)scrollTo({top:slideTop(i),behavior:smooth&&!S.reduce?'smooth':'instant'});   // no chapter asked for: stay on the prologue
  if(!smooth)activate(i);
}

/* what the page's position means for the stage: is it under the header, should it snap, has the prologue tucked away.
   One cheap read per frame while the page scrolls. */
function measure(){
  S.tick=0;
  if(!S||S.root.offsetParent===null)return;
  const r=S.root.getBoundingClientRect(),hh=headH(),vh=innerHeight;
  S.inStage=r.top<=hh+1&&r.bottom>hh+S.bar.offsetHeight;                   // the stage is up under the header
  applyTint();
  S.tucked=r.top<=vh*.5;
  document.body.classList.toggle('vf-in',S.inStage);
  if(S.inStage){const h=document.getElementById('hdr');if(h)h.classList.remove('hide')}
  /* hard snapping, one slide per swipe, only while the stage fills the screen: elsewhere (prologue, footer) the page scrolls freely */
  document.documentElement.classList.toggle('snap-y',S.inStage&&r.bottom>=vh-4);
  S.root.classList.toggle('glow-off',r.bottom<0||r.top>vh);
  const pro=document.getElementById('pro');if(pro)pro.classList.toggle('tucked',S.tucked);
}
/* From the menu, one scroll or one press of Down/Space/PageDown carries the page to the stage (the first chapter opener
   flush under the header, the first couple peeking in); after that the mandatory snap does one slide per scroll.
   Left and Right step the photographs of the couple on screen. */
const shown=()=>S&&S.root.offsetParent!==null;
function flyTo(t){
  S.lock=1;S.lastD=0;
  if(S.reduce){scrollTo({top:t,behavior:'instant'});S.lock=0;return true}
  /* our own eased glide with the snap switched off while it runs (the browser's smooth scroll fights the snap points: a fast jump, then a slow drift) */
  const y0=scrollY,dist=t-y0,dur=Math.min(900,420+Math.abs(dist)*.35),t0=performance.now(),ease=x=>1-Math.pow(1-x,4);
  const el=document.documentElement;el.classList.add('ps-fly');
  const stop=()=>{el.classList.remove('ps-fly');if(S){S.lock=2;S.landing=0;S.landed=performance.now();S.lastW=S.landed;settle()}};   // 2 = landed, still swallowing the tail of the gesture
  (function f(now){
    if(!S){el.classList.remove('ps-fly');return}
    const k=Math.min(1,(now-t0)/dur);scrollTo(0,y0+dist*ease(k));
    if(k<1)requestAnimationFrame(f);else{scrollTo(0,t);stop()}
  })(t0);
  return true;
}
/* down from the menu: to the stage. up from the first opener or the menu: all the way to the top, however small the scroll */
function toStage(){
  if(!shown())return false;
  const t=slideTop(0);
  return scrollY<t-4?flyTo(t):false;
}
function toTop(){
  if(!shown()||scrollY<4||S.slides.length<2)return false;
  return scrollY<=slideTop(1)-8?flyTo(0):false;
}
/* a wheel or trackpad gesture keeps sending (fading) events for a second after the finger lifts; those must not scroll the
   page natively once we have landed (the snap would jerk it on). A new push is told apart from the fading tail: it is stronger
   than the last event, so it goes straight through. The hold also ends after 350ms or 90ms of quiet. */
function settle(){clearTimeout(S.lockT);S.lockT=setTimeout(()=>{if(!S||S.lock===1)return;if(performance.now()-S.lastW<90&&performance.now()-S.landed<350)settle();else S.lock=0},60)}
function onWheel(e){
  if(!shown()||e.ctrlKey||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;
  const d=Math.abs(e.deltaY);
  if(S.lock===1){S.lastD=d;e.preventDefault();return}
  if(S.lock===2){
    if(d>(S.lastD||0)*1.4+6){S.lock=0}                      // a fresh push, not the tail
    else{S.lastW=performance.now();S.lastD=d;e.preventDefault();return}
  }
  S.lastD=d;
  if((e.deltaY>0?toStage():toTop()))e.preventDefault();
}
function onKey(e){
  if(!shown()||e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
  const t=e.target;
  if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(document.documentElement.classList.contains('lb-open')||document.body.classList.contains('locked')||document.body.classList.contains('vf-on'))return;
  const k=e.key;
  if(k==='ArrowDown'||k==='PageDown'||(k===' '&&!(t.closest&&t.closest('button,a,[role="button"]')))){
    if(S.lock===1||toStage())e.preventDefault();
  }else if((k==='ArrowRight'||k==='ArrowLeft')&&S.inStage&&S.active>=0){
    if(t&&t.closest&&t.closest('.seq-strip'))return;   // a focused strip scrolls itself
    const b=S.slides[S.active].querySelector(k==='ArrowRight'?'.sq-next':'.sq-prev');
    if(b&&!b.disabled){e.preventDefault();b.click()}
  }
}
function onScroll(){if(S&&!S.tick){S.tick=1;requestAnimationFrame(measure)}}

function observe(){
  if(S.io)S.io.disconnect();
  const top=headH()+S.bar.offsetHeight;
  S.io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=0.6)S.cand=+e.target.dataset.i});
    clearTimeout(S.deb);
    S.deb=setTimeout(()=>{if(S&&S.cand>=0)activate(S.cand)},90);     // not while a fling is still going past
  },{rootMargin:'-'+top+'px 0px 0px 0px',threshold:[0.6]});
  S.slides.forEach(el=>S.io.observe(el));
}
function onResize(){if(!S)return;glowRest();observe();onScroll()}

function mount(then){
  unmount();
  const root=document.getElementById('ps');if(!root)return;
  const data=flat();
  S={root,data,bar:$('.ps-bar',root),slides:[...root.querySelectorAll('.ps-slide')],live:$('.vf-sr[role=status]',root),
     reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,active:-1,cand:-1,deb:0,
     host:document.documentElement,glow:$('.ps-glow',root),fine:matchMedia('(hover:hover) and (pointer:fine)').matches};
  S.slides.forEach(el=>{el.inert=true});
  glowRest();
  if(S.fine&&!S.reduce){
    S.onVis=()=>{if(document.hidden){cancelAnimationFrame(S.raf);S.chase=0;S.gt=0}else if(S.gx!==S.tx||S.gy!==S.ty){S.chase=1;S.raf=requestAnimationFrame(glowTick)}};
    addEventListener('pointermove',glowMove,{passive:true});
    document.addEventListener('visibilitychange',S.onVis);
  }
  addEventListener('resize',onResize,{passive:true});
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('wheel',onWheel,{passive:false});
  document.addEventListener('keydown',onKey);
  observe();
  root.addEventListener('click',e=>{
    const b=e.target.closest('.cl-b');if(!b)return;
    go(S.data[+b.dataset.first].c.id,true);
  });
  /* the contents list is the way in: open the stage on that chapter */
  const pro=document.getElementById('pro');
  if(pro){S.proClick=e=>{const b=e.target.closest('.pro-row');if(b)go(b.dataset.ch,true)};pro.addEventListener('click',S.proClick)}
  go(then);
  measure();
}
function unmount(){
  if(!S)return;
  clearTimeout(S.deb);if(S.io)S.io.disconnect();
  const pro=document.getElementById('pro');if(pro&&S.proClick)pro.removeEventListener('click',S.proClick);
  ['--tint','--glow'].forEach(k=>S.host.style.removeProperty(k));
  cancelAnimationFrame(S.raf);
  removeEventListener('resize',onResize);removeEventListener('scroll',onScroll);removeEventListener('wheel',onWheel);document.removeEventListener('keydown',onKey);removeEventListener('pointermove',glowMove);
  if(S.onVis)document.removeEventListener('visibilitychange',S.onVis);
  document.documentElement.classList.remove('snap-y');
  S=null;
  if(!(window.VF&&VF.isOpen()))document.body.classList.remove('vf-in');
}
/* coming back from Films: land on the menu, like arriving on the page */
function restore(){
  if(!S||S.root.offsetParent===null)return;
  scrollTo({top:0,behavior:'instant'});                  // switching tabs lands on the menu
  glowRest();observe();measure();
  VF.syncUL();
}

window.PS={html,mount,unmount,restore};
})();
