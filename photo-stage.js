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

/* one entry per couple that has a slide, in category order (app.js already dropped couples with 3 frames or fewer) */
function flat(){
  const out=[];
  CHAPTERS.forEach((c,ci)=>c.seqs.forEach((q,qi)=>out.push({c,ci,q,first:qi===0})));
  return out;
}
const catIndex=c=>(window.WORK_CATS||[]).indexOf(c.short);

function headHTML(d){
  const {c,q,first}=d;
  return `<div class="ps-head">
    <p class="ps-kick"><span class="ps-no">${c.no}</span>${esc(c.name)}${first?`<span class="ps-alt"> · ${esc(c.alt)}</span>`:''}</p>
    ${first?`<p class="ps-desc">${esc(c.desc)}</p>`:''}
    <div class="ps-id"><h3 class="ps-name">${q.couple}</h3>
    <p class="ps-tags">${q.tags.map(esc).join(' · ')}</p></div>
  </div>`;
}
/* what a live slide holds: the sideways strip and its counter */
function bodyHTML(d){
  const q=d.q;
  return `<div class="seq-strip">${q.frames.map((f,j)=>`
    <figure class="frame" style="--ar:${f.ar}">
      <div class="fr-img" tabindex="0" role="button" aria-label="Open larger: ${esc(f.cap)}">${pic(f,'(max-width: 600px) 90vw, 620px',{parked:true})}</div>
      <figcaption class="fr-cap"><span class="fr-no">${String(j+1).padStart(2,'0')}</span><span>${f.cap}</span></figcaption>
    </figure>`).join('')}</div>
  <div class="ps-foot">
    <span class="seq-count">01 / ${String(q.frames.length).padStart(2,'0')}</span>
    <span class="ps-arrows"><button class="sq-prev" type="button" aria-label="Previous frame" disabled>${ARROW('l')}</button>
    <button class="sq-next" type="button" aria-label="Next frame">${ARROW('r')}</button></span>
  </div>
  <div class="seq-bar"><i></i></div>`;
}

function html(){
  const data=flat();if(!data.length)return '';
  const cats=[];data.forEach((d,i)=>{const k=catIndex(d.c);if(!cats.some(x=>x[0]===k))cats.push([k,i])});
  return `<div class="ps wk-in" id="ps" data-n="${data.length}">
  <div class="ps-bar">${VF.catLineHTML(cats,'Jump to a category of photographs')}</div>
  <div class="ps-feed" tabindex="0" role="region" aria-label="Photographs, one couple at a time">${data.map((d,i)=>
    `<article class="seq ps-slide" data-i="${i}" data-label="${esc([d.q.couple,...d.q.tags].join(' · '))}" aria-label="${esc(d.q.couple+', '+d.c.name)}">${headHTML(d)}<div class="ps-body"></div></article>`).join('')}
    <div class="ps-end" aria-hidden="true"></div></div>
  <p class="vf-sr" role="status" aria-live="polite"></p>
</div>`;
}

function warm(i){
  const el=S.slides[i];if(!el||el._live)return;
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
  VF.markCat(S.root,catIndex(d.c),S.reduce);
  S.live.textContent=d.q.couple+', '+d.c.name;
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
     reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,active:-1,cand:-1,deb:0};
  S.slides.forEach(el=>{el.inert=true});
  S.io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=0.6)S.cand=+e.target.dataset.i});
    clearTimeout(S.deb);
    S.deb=setTimeout(()=>{if(S&&S.cand>=0)activate(S.cand)},90);     // not while a fling is still going past
  },{root:S.feed,threshold:[0.6]});
  S.slides.forEach(el=>S.io.observe(el));
  /* while the stage is on screen the header (and its switch) stays, like the Films feed */
  S.vio=new IntersectionObserver(es=>{
    const on=es[es.length-1].intersectionRatio>=0.5;
    document.body.classList.toggle('vf-in',on);
    if(on){const h=document.getElementById('hdr');if(h)h.classList.remove('hide')}
  },{threshold:[0,0.5]});
  S.vio.observe(root);
  root.addEventListener('click',e=>{
    const b=e.target.closest('.cl-b');if(!b)return;
    go(S.data[+b.dataset.first].c.id);
  });
  go(then);
  /* arriving on a chosen category (from Home): bring the stage up under the header as well */
  if(then)align();
}
function unmount(){
  if(!S)return;
  clearTimeout(S.deb);S.io.disconnect();S.vio.disconnect();S=null;
  if(!(window.VF&&VF.isOpen()))document.body.classList.remove('vf-in');
}
/* the stage's top edge just under the header, so it fills the screen */
function align(){
  if(!S)return;
  const hdr=document.getElementById('hdr');
  scrollTo({top:Math.max(0,S.root.getBoundingClientRect().top+scrollY-(hdr?hdr.offsetHeight:0)),behavior:'instant'});
}
/* coming back from Films: the hidden stage lost its scroll position */
function restore(){
  if(!S||S.root.offsetParent===null)return;
  const i=Math.max(0,S.active);
  S.feed.scrollTo({top:S.slides[i].offsetTop,behavior:'instant'});
  align();
  VF.syncUL();
}

window.PS={html,mount,unmount,restore,align};
})();
