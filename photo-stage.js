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
const tintOf=d=>(d.q&&d.q.t)||d.c.tint||null;
function setTint(t){
  if(!S)return;
  const st=S.host.style;
  if(t){st.setProperty('--tint',t.g);st.setProperty('--glow',t.l)}else{st.removeProperty('--tint');st.removeProperty('--glow')}
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
  setTint(tintOf(d));glowStory(i);
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
  S.tucked=r.top<=vh*.5;
  document.body.classList.toggle('vf-in',S.inStage);
  if(S.inStage){const h=document.getElementById('hdr');if(h)h.classList.remove('hide')}
  /* hard snapping, one slide per swipe, only while the stage fills the screen: elsewhere (prologue, footer) the page scrolls freely */
  document.documentElement.classList.toggle('snap-y',S.inStage&&r.bottom>=vh-4);
  S.root.classList.toggle('glow-off',r.bottom<0||r.top>vh);
  const pro=document.getElementById('pro');if(pro)pro.classList.toggle('tucked',S.tucked);
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
  removeEventListener('resize',onResize);removeEventListener('scroll',onScroll);removeEventListener('pointermove',glowMove);
  if(S.onVis)document.removeEventListener('visibilitychange',S.onVis);
  document.documentElement.classList.remove('snap-y');
  S=null;
  if(!(window.VF&&VF.isOpen()))document.body.classList.remove('vf-in');
}
/* coming back from Films: the hidden stage lost its place. Only bring the stage up again if it was up before. */
function restore(){
  if(!S||S.root.offsetParent===null)return;
  if(S.tucked)scrollTo({top:slideTop(Math.max(0,S.active)),behavior:'instant'});
  glowRest();observe();measure();
  VF.syncUL();
}

window.PS={html,mount,unmount,restore};
})();
