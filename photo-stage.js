/* Work page, Photographs view: a stage that snaps one couple at a time.
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
  <div class="ps-bar">${VF.catLineHTML(cats,'Jump to a category of photographs')}</div>
  <i class="ps-glow" aria-hidden="true"></i>
  <div class="ps-feed" tabindex="0" role="region" aria-label="Photographs, one couple at a time">${data.map((d,i)=>d.open
    ?`<article class="ps-slide ps-open" data-i="${i}" aria-label="${esc(d.c.name)}">${openerHTML(d)}</article>`
    :`<article class="seq ps-slide" data-i="${i}" data-label="${esc([d.q.couple,...d.q.tags].join(' · '))}" aria-label="${esc(d.q.couple+', '+d.c.name)}">${headHTML(d)}<div class="ps-body"></div></article>`).join('')}
    <div class="ps-end" aria-hidden="true"></div></div>
  <p class="vf-sr" role="status" aria-live="polite"></p>
</div>`;
}

/* The ground's tint. Each slide carries a final ground colour and a glow colour (chapter colour, nudged toward the couple's
   own when it has one); build_portfolio.py / tints.py make them. The stage sets two CSS variables when a slide settles and the
   CSS eases the background (800ms, ease-out quint). Preview colours on hover (mouse only) use --hov and are removed on leave. */
const tintOf=d=>(d.q&&d.q.t)||d.c.tint||null;
const hoverTintOf=d=>(d.q&&d.q.th)||d.c.tint||null;
function setTint(t){
  if(!S)return;
  const st=S.host.style;
  if(t){st.setProperty('--tint',t.g);st.setProperty('--glow',t.l)}else{st.removeProperty('--tint');st.removeProperty('--glow')}
}
function hoverTint(t){
  if(!S)return;
  const st=S.host.style;
  if(t){st.setProperty('--hov',t.g);st.setProperty('--hov-glow',t.l)}else{st.removeProperty('--hov');st.removeProperty('--hov-glow')}
}

/* The glow: one soft pool of light on the ground, behind the photographs. One composited layer moved by transform only.
   Mouse: it chases the pointer (about 1s) in a rAF loop that sleeps when it has arrived and when the tab is hidden.
   Phone: no pointer, so it sits low in the middle and slides sideways with the story (set on slide change), plus a
   very slow drift in CSS. No gyroscope. Reduced motion: it stays at rest. */
function glowRest(){
  const g=S.glow;if(!g)return;
  S.gw=g.offsetWidth||0;
  const w=S.root.clientWidth,h=S.root.clientHeight;
  S.gx=S.tx=w*.5;S.gy=S.ty=S.fine?h*.45:h*.82;
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
  const r=S.root.getBoundingClientRect();
  S.tx=e.clientX-r.left;S.ty=e.clientY-r.top;
  if(!S.chase&&!document.hidden){S.chase=1;S.gt=0;S.raf=requestAnimationFrame(glowTick)}
}
function glowStory(i){
  if(S.fine||S.reduce)return;
  const w=S.root.clientWidth,p=S.data.length>1?i/(S.data.length-1):0;
  S.gx=w*(.2+.6*p);glowPlace();
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

/* open on a category (by chapter id, e.g. "henna"), or on the first couple. Always lands at once, no scroll animation. */
function go(id,keepActive){
  if(!S)return;
  let i=0;
  if(id){const k=S.data.findIndex(d=>d.c.id===id);if(k>=0)i=k}
  S.feed.scrollTo({top:S.slides[i].offsetTop,behavior:'instant'});
  activate(i);
}

function mount(then){
  unmount();
  const root=document.getElementById('ps');if(!root)return;
  const data=flat();
  S={root,data,feed:$('.ps-feed',root),slides:[...root.querySelectorAll('.ps-slide')],live:$('.vf-sr[role=status]',root),
     reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,active:-1,cand:-1,deb:0,
     host:document.getElementById('wk-photos'),glow:$('.ps-glow',root),fine:matchMedia('(hover:hover) and (pointer:fine)').matches};
  S.slides.forEach(el=>{el.inert=true});
  glowRest();
  if(S.fine&&!S.reduce){
    S.onMove=glowMove;S.onVis=()=>{if(document.hidden){cancelAnimationFrame(S.raf);S.chase=0;S.gt=0}else if(S.gx!==S.tx||S.gy!==S.ty){S.chase=1;S.raf=requestAnimationFrame(glowTick)}};
    root.addEventListener('pointermove',S.onMove,{passive:true});
    document.addEventListener('visibilitychange',S.onVis);
  }
  addEventListener('resize',glowRest,{passive:true});
  /* mouse only: a category word or contents row previews that chapter's tint, a photograph nudges toward its couple's */
  if(S.fine){
    const over=e=>{
      const t=e.target.closest&&e.target.closest('.cl-b,.pro-row,.fr-img');if(!t||t.contains(e.relatedTarget))return;
      if(t.classList.contains('cl-b'))hoverTint(S.data[+t.dataset.first].c.tint||null);
      else if(t.classList.contains('pro-row')){const c=CHAPTERS.find(c=>c.id===t.dataset.ch);hoverTint(c&&c.tint||null)}
      else{const sl=t.closest('.ps-slide');if(sl)hoverTint(hoverTintOf(S.data[+sl.dataset.i]))}
    };
    const out=e=>{const t=e.target.closest&&e.target.closest('.cl-b,.pro-row,.fr-img');if(t&&!t.contains(e.relatedTarget))hoverTint(null)};
    S.hov=[document.getElementById('pro'),root].filter(Boolean);
    S.hov.forEach(n=>{n.addEventListener('mouseover',over);n.addEventListener('mouseout',out)});
    S.hovFns=[over,out];
  }
  S.io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=0.6)S.cand=+e.target.dataset.i});
    clearTimeout(S.deb);
    S.deb=setTimeout(()=>{if(S&&S.cand>=0)activate(S.cand)},90);     // not while a fling is still going past
  },{root:S.feed,threshold:[0.6]});
  S.slides.forEach(el=>S.io.observe(el));
  /* while the stage is on screen the header (and its switch) stays, like the Films feed. Once it sits flush under the
     header the prologue has tucked behind it: its text fades out (opacity only, a class, no scroll-driven CSS). */
  const pro=document.getElementById('pro');
  S.vio=new IntersectionObserver(es=>{
    const r=es[es.length-1].intersectionRatio,on=r>=0.5;
    document.body.classList.toggle('vf-in',on);
    if(on){const h=document.getElementById('hdr');if(h)h.classList.remove('hide')}
    if(root.offsetParent!==null)S.tucked=r>=0.9;
    root.classList.toggle('glow-off',r===0);                 // out of sight: the drift stops
    if(pro&&root.offsetParent!==null)pro.classList.toggle('tucked',r>=0.9);
  },{threshold:[0,0.5,0.9]});
  S.vio.observe(root);
  root.addEventListener('click',e=>{
    const b=e.target.closest('.cl-b');if(!b)return;
    go(S.data[+b.dataset.first].c.id);
  });
  /* the contents list is the way in: open the stage on that chapter */
  if(pro)S.proClick=e=>{
    const b=e.target.closest('.pro-row');if(!b)return;
    go(b.dataset.ch);
    scrollTo({top:stageTop(),behavior:S.reduce?'instant':'smooth'});
  };
  if(pro)pro.addEventListener('click',S.proClick);
  go(then);
  /* arriving on a chosen category (from Home): bring the stage up under the header as well, no prologue */
  if(then)align();
}
function unmount(){
  if(!S)return;
  clearTimeout(S.deb);S.io.disconnect();S.vio.disconnect();
  const pro=document.getElementById('pro');if(pro&&S.proClick)pro.removeEventListener('click',S.proClick);
  cancelAnimationFrame(S.raf);removeEventListener('resize',glowRest);
  if(S.onVis)document.removeEventListener('visibilitychange',S.onVis);
  if(S.hov)S.hov.forEach(n=>{n.removeEventListener('mouseover',S.hovFns[0]);n.removeEventListener('mouseout',S.hovFns[1])});
  S=null;
  if(!(window.VF&&VF.isOpen()))document.body.classList.remove('vf-in');
}
/* the stage's top edge just under the header, so it fills the screen */
function stageTop(){
  const hdr=document.getElementById('hdr');
  return Math.max(0,S.root.getBoundingClientRect().top+scrollY-(hdr?hdr.offsetHeight:0));
}
function align(){
  if(!S)return;
  scrollTo({top:stageTop(),behavior:'instant'});
}
/* coming back from Films: the hidden stage lost its scroll position. Only bring the stage up again if it was up before. */
function restore(){
  if(!S||S.root.offsetParent===null)return;
  const i=Math.max(0,S.active);
  S.feed.scrollTo({top:S.slides[i].offsetTop,behavior:'instant'});
  if(S.tucked)align();
  VF.syncUL();
}

window.PS={html,mount,unmount,restore,align};
})();
