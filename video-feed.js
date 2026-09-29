/* Work page, Videos view: a full-screen vertical feed of YouTube films.
   Data: window.VIDEOS (videos.js, built from drafts/videos/videos.json).
   Nothing here touches the network until Videos is opened; the YouTube
   IFrame API is loaded once, on first open. Exposes window.VF. */
(function(){
'use strict';

const AUTO_ADVANCE=true;              // when a video ends, scroll to the next slide
const HASH='#/portfolio/videos';
const SND_KEY='cb-vf-sound';

const $=(s,r=document)=>r.querySelector(s);
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const saveData=()=>!!(navigator.connection&&navigator.connection.saveData);
/* Phones get YouTube's 480px still (its black bars are cropped off by object-fit:cover) instead of the 1280px one,
   and a slide only fetches its still when it is within 2 of the one on screen. */
const PHONE=matchMedia('(max-width:700px)').matches||matchMedia('(pointer:coarse)').matches;
const thumbUrl=id=>'https://i.ytimg.com/vi/'+id+(PHONE?'/hqdefault.jpg':'/maxresdefault.jpg');
const thumbLo=id=>'https://i.ytimg.com/vi/'+id+'/hqdefault.jpg';
const watchUrl=id=>'https://www.youtube.com/watch?v='+id;
const fmtDur=s=>{const m=Math.round(s/60),h=Math.floor(m/60),r=m%60;
  return h?(r?h+'h '+r+'m':h+'h'):(m?m+'m':s+'s')};

const I={
  play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>',
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor"/></svg>',
  off:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  on:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

const readSound=()=>{try{return sessionStorage.getItem(SND_KEY)==='1'}catch(e){return false}};
const writeSound=on=>{try{sessionStorage.setItem(SND_KEY,on?'1':'0')}catch(e){}};

/* keep --hh (the site header's height) current, for the toggle and the feed */
(function(){
  const h=document.getElementById('hdr');if(!h)return;
  const set=()=>document.documentElement.style.setProperty('--hh',h.offsetHeight+'px');
  set();addEventListener('resize',set);
  if(window.ResizeObserver)new ResizeObserver(set).observe(h);
})();

/* open the connections early (a few hundred ms saved on a phone) */
let warmed=false;
function warm(){
  if(warmed)return;warmed=true;
  ['https://www.youtube.com','https://www.youtube-nocookie.com','https://i.ytimg.com'].forEach(h=>{
    const l=document.createElement('link');l.rel='preconnect';l.href=h;document.head.appendChild(l);
  });
  loadYT().catch(()=>{});
}
document.addEventListener('pointerdown',e=>{
  if(e.target.closest&&e.target.closest('a[href="#/portfolio/videos"]'))warm();
},{passive:true});

/* ---------- YouTube IFrame API, loaded once ---------- */
let ytP=null;
function loadYT(){
  if(ytP)return ytP;
  ytP=new Promise((res,rej)=>{
    if(window.YT&&window.YT.Player)return res(window.YT);
    const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{if(prev)try{prev()}catch(e){}res(window.YT)};
    const s=document.createElement('script');
    s.src='https://www.youtube.com/iframe_api';
    s.onerror=()=>{ytP=null;rej(new Error('yt'))};
    document.head.appendChild(s);
  });
  return ytP;
}

/* ---------- the Photos | Videos toggle (used on the page and in the feed bar) ---------- */
function toggleHTML(active){
  const a=(v,href,label)=>`<a href="${href}"${active===v?' aria-current="true"':''}>${label}</a>`;
  return `<div class="wk-tog" role="group" aria-label="Work view">${a('photos','#/portfolio','Photos')}${a('videos',HASH,'Videos')}</div>`;
}

/* the toggle under the heading is page markup; keep its highlight in step with the view */
function markToggle(view){
  document.querySelectorAll('.wk-tog-row .wk-tog a').forEach(a=>{
    if(a.getAttribute('href')===(view==='videos'?HASH:'#/portfolio'))a.setAttribute('aria-current','true');
    else a.removeAttribute('aria-current');
  });
}

/* ---------- state while the feed is open ---------- */
let S=null;

const curId=d=>d.mode==='hl'?d.it.highlight.id:d.it.fullFilm.id;
const typeWord=d=>d.mode==='hl'?'Highlight':'Full film';
const metaText=d=>{const b=d.it.label||d.ev.event;return d.mode==='ff'&&/film/i.test(b)?b:b+' · '+typeWord(d)};
const ariaText=d=>d.it.couple+', '+metaText(d).replace(' · ',' ');

function flatten(){
  const out=[];
  ((window.VIDEOS&&window.VIDEOS.events)||[]).forEach((ev,ei)=>ev.items.forEach(it=>{
    if(it.highlight||it.fullFilm)out.push({ev,ei,it,mode:it.highlight?'hl':'ff'});
  }));
  return out;
}
function indexOfId(data,id){
  for(let i=0;i<data.length;i++){
    const it=data[i].it;
    if(it.highlight&&it.highlight.id===id)return {i,mode:'hl'};
    if(it.fullFilm&&it.fullFilm.id===id)return {i,mode:it.highlight?'ff':'ff'};
  }
  return null;
}

function slideHTML(d,i){
  const id=curId(d),url=watchUrl(id);
  const film=d.it.highlight&&d.it.fullFilm;
  return `<section class="vf-slide" data-i="${i}" aria-label="${esc(ariaText(d))}">
  <div class="vf-wrap">
    <div class="vf-frame">
      <img class="vf-thumb" alt="" decoding="async" data-id="${id}">
      <div class="vf-mount"></div>
      <span class="vf-play" aria-hidden="true">${I.play}</span>
      <button class="vf-hit" type="button" aria-label="Play or pause"></button>
      <p class="vf-err" hidden>This one won't play here. <a href="${url}" target="_blank" rel="noopener">Watch it on YouTube</a></p>
      <button class="vf-sound" type="button" hidden>${I.off}<span>Tap for sound</span></button>
      <div class="vf-ctl">
        <button class="vf-mute" type="button" aria-label="Unmute">${I.off}</button>
        <button class="vf-seek" type="button" aria-label="Seek. Use the left and right arrow keys."><i></i></button>
        <a class="vf-yt" href="${url}" target="_blank" rel="noopener" aria-label="Watch on YouTube (opens in a new tab)">YouTube</a>
      </div>
    </div>
    <div class="vf-cap">
      <div class="vf-id">
        <h2 class="vf-name">${esc(d.it.couple)}</h2>
        <p class="vf-meta mono">${esc(metaText(d))}</p>
      </div>
      <div class="vf-act">
        ${film?`<button class="vf-film" type="button" data-mode="ff">Watch full film (${fmtDur(d.it.fullFilm.duration)})</button>`:''}
        <a class="vf-ytc" href="${url}" target="_blank" rel="noopener">Watch on YouTube<span class="vf-sr"> (opens in a new tab)</span></a>
      </div>
    </div>
  </div>
</section>`;
}

/* ---------- open / close ---------- */
function open(id){
  const host=document.getElementById('wk-videos');
  if(!window.VIDEOS||!host)return;
  if(S){ if(id){const f=indexOfId(S.data,id);if(f)jump(f.i,f.mode)} else alignFeed(true); return; }
  const data=flatten(); if(!data.length)return;
  const found=id?indexOfId(data,id):null;
  if(found)data[found.i].mode=found.mode;
  const startAt=found?found.i:0;

  const root=document.createElement('div');
  root.id='vf';root.className='vf';
  root.innerHTML=`<div class="vf-bar">${toggleHTML('videos')}<div class="vf-chips" role="group" aria-label="Jump to an event">${
      window.VIDEOS.events.map((e,ei)=>{
        const first=data.findIndex(d=>d.ei===ei);
        return first<0?'':`<button class="vf-chip" type="button" data-ei="${ei}" data-first="${first}" aria-label="Jump to ${esc(e.event)} videos">${esc(e.event)}</button>`;
      }).join('')}</div></div>
    <div class="vf-feed">${data.map(slideHTML).join('')}</div>
    <p class="vf-sr" role="status" aria-live="polite"></p>`;
  host.textContent='';host.appendChild(root);host.hidden=false;markToggle('videos');warm();
  const ph=document.getElementById('wk-photos');if(ph)ph.hidden=true;
  document.body.classList.add('vf-on');

  S={data,root,feed:$('.vf-feed',root),slides:[...root.querySelectorAll('.vf-slide')],
     chips:[...root.querySelectorAll('.vf-chip')],chipBar:$('.vf-chips',root),live:$('.vf-sr[role=status]',root),
     players:new Map(),active:-1,target:null,soundOn:readSound(),reduce:reduceMotion(),
     noAuto:reduceMotion()||saveData(),away:true,inView:false,host,lastEv:-1,deb:0,cand:-1,flashT:0};

  const drop=()=>{if(S)S.target=null};
  S.feed.addEventListener('wheel',drop,{passive:true});
  S.feed.addEventListener('touchstart',drop,{passive:true});
  root.addEventListener('click',onClick);
  root.addEventListener('load',onImg,true);
  root.addEventListener('error',onImg,true);
  root.addEventListener('keydown',onSeekKey);
  document.addEventListener('keydown',onKey);
  document.addEventListener('visibilitychange',onVis);
  S.io=new IntersectionObserver(es=>{
    es.forEach(e=>{if(e.isIntersecting&&e.intersectionRatio>=0.6)S.cand=+e.target.dataset.i});
    clearTimeout(S.deb);
    S.deb=setTimeout(()=>{if(S&&S.cand>=0)activate(S.cand)},150);
  },{root:S.feed,threshold:[0.6]});
  S.slides.forEach(el=>S.io.observe(el));
  /* the feed is one block in the page: it only plays while at least half of it is on screen */
  S.vio=new IntersectionObserver(es=>{
    const e=es[es.length-1];
    S.inView=e.intersectionRatio>=0.5;
    document.body.classList.toggle('vf-in',S.inView);
    syncAway();
  },{threshold:[0,0.5]});
  S.vio.observe(root);
  S.poll=setInterval(tick,250);

  if(startAt>0)S.feed.scrollTo({top:S.slides[startAt].offsetTop,behavior:'instant'});
  activate(startAt);
  alignFeed(!found);      // a link to one video lands on it at once; the Videos button slides down to the feed
}

/* put the feed's top edge just under the site header, so it fills the screen */
function alignFeed(smooth){
  if(!S)return;
  const hdr=document.getElementById('hdr');
  const top=S.root.getBoundingClientRect().top+scrollY-(hdr?hdr.offsetHeight:0);
  scrollTo({top:Math.max(0,top),behavior:smooth&&!S.reduce?'smooth':'instant'});
}

function jump(i,mode){
  if(!S)return;
  const d=S.data[i];
  if(mode==='ff'&&d.it.highlight&&d.mode!=='ff'&&S.active!==i)d.mode='ff';
  S.feed.scrollTo({top:S.slides[i].offsetTop,behavior:'instant'});
  activate(i);
}

function close(opts){
  if(!S)return;
  const s=S; S=null;
  clearTimeout(s.deb);clearTimeout(s.flashT);clearTimeout(s.nbT);clearInterval(s.poll);
  s.io.disconnect();s.vio.disconnect();
  s.players.forEach(r=>kill(r));
  s.players.clear();
  document.removeEventListener('keydown',onKey);
  document.removeEventListener('visibilitychange',onVis);
  s.root.remove();s.host.hidden=true;markToggle('photos');
  const ph=document.getElementById('wk-photos');if(ph)ph.hidden=false;
  document.body.classList.remove('vf-on','vf-in');
  if(opts&&opts.focus){
    scrollTo({top:0,behavior:'instant'});
    const a=$('#main .wk-tog a[aria-current]');if(a)a.focus({preventScroll:true});
  }
}

function pauseAll(){ if(S)S.players.forEach(r=>pause(r)); }

/* ---------- players ---------- */
function mount(k){
  if(!S)return null;
  if(S.players.has(k))return S.players.get(k);
  const d=S.data[k],holder=$('.vf-mount',S.slides[k]),div=document.createElement('div');
  holder.textContent='';holder.appendChild(div);
  const r={k,vid:curId(d),ready:false,want:false,user:false,paused:false,resume:false,state:-2,yt:null,dead:false,guard:0};
  S.players.set(k,r);
  const st=S;
  loadYT().then(YT=>{
    if(r.dead||S!==st)return;
    const pv={autoplay:0,controls:0,rel:0,playsinline:1,iv_load_policy:3,disablekb:1,modestbranding:1};
    if(/^https?:/.test(location.origin))pv.origin=location.origin;
    r.yt=new YT.Player(div,{host:'https://www.youtube-nocookie.com',videoId:r.vid,width:'100%',height:'100%',playerVars:pv,
      events:{onReady:()=>onReady(r),onStateChange:e=>onState(r,e.data),onError:()=>onErr(r)}});
  }).catch(()=>{if(!r.dead&&S===st)onErr(r)});
  return r;
}
function frameOf(k){return $('.vf-frame',S.slides[k])}
function kill(r){
  r.dead=true;clearTimeout(r.guard);
  try{if(r.yt&&r.yt.destroy)r.yt.destroy()}catch(e){}
}
function destroy(k,keepMode){
  const r=S.players.get(k); if(!r)return;
  kill(r); S.players.delete(k);
  const el=S.slides[k],fr=$('.vf-frame',el);
  $('.vf-mount',el).textContent='';
  fr.classList.remove('is-ready','is-playing','is-error');
  $('.vf-err',el).hidden=true;
  const d=S.data[k];
  if(!keepMode&&d.mode==='ff'&&d.it.highlight){d.mode='hl';refreshSlide(k)}
}
function refreshSlide(k){
  const d=S.data[k],el=S.slides[k],id=curId(d);
  el.setAttribute('aria-label',ariaText(d));
  $('.vf-meta',el).textContent=metaText(d);
  const im=$('.vf-thumb',el);im.dataset.id=id;delete im.dataset.lo;if(im.getAttribute('src'))im.src=thumbUrl(id);
  $$('.vf-yt,.vf-ytc',el).forEach(a=>a.href=watchUrl(id));
  const b=$('.vf-film',el);
  if(b){
    if(d.mode==='hl'){b.dataset.mode='ff';b.textContent='Watch full film ('+fmtDur(d.it.fullFilm.duration)+')'}
    else{b.dataset.mode='hl';b.textContent='Back to highlight'}
  }
}
function $$(s,r){return [...r.querySelectorAll(s)]}

function onReady(r){
  if(r.dead||!S)return;
  r.ready=true;
  frameOf(r.k).classList.add('is-ready');
  if(S.active===r.k&&r.want){ if(S.away)r.resume=true; else startPlay(r); }
}
function onErr(r){
  if(r.dead||!S)return;
  const el=S.slides[r.k];
  el.querySelector('.vf-frame').classList.add('is-error');
  $('.vf-err',el).hidden=false;
  clearTimeout(r.guard);
}
function onState(r,s){
  if(r.dead||!S)return;
  r.state=s;
  const fr=frameOf(r.k);
  if(r.k!==S.active){ if(s===1)pause(r); fr.classList.remove('is-playing'); return; }
  if(s===1&&S.away){pause(r);r.resume=true;return}
  fr.classList.toggle('is-playing',s===1||s===3);
  if(s===1){fr.classList.remove('is-error');mountNeighbours()}
  if(s===0&&AUTO_ADVANCE)advance();
}
function startPlay(r){
  if(!S||!r.yt||!r.ready||r.dead)return;
  r.paused=false;r.want=true;
  try{
    if(S.soundOn){r.yt.unMute();r.yt.setVolume(100)}else r.yt.mute();
    r.yt.playVideo();
  }catch(e){}
  guard(r,0);
}
/* If a video with sound doesn't start within ~1s, fall back to muted play. Never leave it stuck. */
function guard(r,n){
  clearTimeout(r.guard);
  r.guard=setTimeout(()=>{
    if(!S||r.dead||S.active!==r.k||r.paused||document.hidden)return;
    let st;try{st=r.yt.getPlayerState()}catch(e){return}
    if(st===1)return;
    if(st===3&&n<3){guard(r,n+1);return}
    if(S.soundOn){S.soundOn=false;updateSound()}
    try{r.yt.mute();r.yt.playVideo()}catch(e){}
  },1000);
}
function pause(r){
  r.want=false;clearTimeout(r.guard);
  try{if(r.yt&&r.ready)r.yt.pauseVideo()}catch(e){}
}
function playActive(){
  if(!S)return;
  const r=S.players.get(S.active); if(!r)return;
  if(S.noAuto&&!r.user)return;      // reduced motion / data saver: wait for a tap
  r.want=true;
  if(S.away){r.resume=true;return}
  if(r.ready)startPlay(r);
}
/* Players live for the slide on screen and its neighbours (a phone keeps only the next one). The one on screen
   is created first; the neighbours wait until it is playing (or 2.5s), so they don't slow its start. */
function keepSet(a){
  const n=S.data.length,keep=[a];
  if(a+1<n)keep.push(a+1);
  if(!PHONE&&a>0)keep.push(a-1);
  return keep;
}
function syncWindow(){
  const a=S.active,n=S.data.length;
  clearTimeout(S.nbT);
  if(S.noAuto){
    for(let k=0;k<n;k++){ if(k!==a)destroy(k); }
    return;
  }
  const keep=keepSet(a);
  for(let k=0;k<n;k++){ if(!keep.includes(k))destroy(k); }
  mount(a);
  S.nbDone=false;
  S.nbT=setTimeout(mountNeighbours,2500);
}
function mountNeighbours(){
  if(!S||S.nbDone||S.noAuto)return;
  S.nbDone=true;clearTimeout(S.nbT);
  keepSet(S.active).forEach(k=>{if(k!==S.active)mount(k)});
}

/* ---------- activation ---------- */
function loadThumbs(){
  const a=S.active;
  S.slides.forEach((el,k)=>{
    if(Math.abs(k-a)>2)return;
    const im=$('.vf-thumb',el);
    if(!im.getAttribute('src'))im.src=thumbUrl(im.dataset.id);
  });
}
function activate(i){
  if(!S||i<0||i>=S.data.length)return;
  if(S.target===i)S.target=null;      // arrived; a manual scroll clears it too (below)
  if(i===S.active)return;
  const prevEv=S.lastEv,d=S.data[i];
  S.active=i;
  S.players.forEach((r,k)=>{if(k!==i)pause(r)});
  syncWindow();loadThumbs();
  S.slides.forEach((el,k)=>{el.inert=k!==i;el.classList.toggle('is-active',k===i)});
  S.lastEv=d.ei;
  S.chips.forEach(c=>{
    const on=+c.dataset.ei===d.ei;
    c.classList.toggle('on',on);
    if(on){c.setAttribute('aria-current','true');
      const bar=S.chipBar;bar.scrollTo({left:c.offsetLeft-bar.clientWidth/2+c.offsetWidth/2,behavior:S.reduce?'auto':'smooth'})}
    else c.removeAttribute('aria-current');
  });
  if(prevEv!==d.ei)flash(i);
  S.live.textContent=ariaText(d);
  setHash();
  updateSound();
  playActive();
}
function flash(i){
  const fr=frameOf(i);
  clearTimeout(S.flashT);
  $$('.vf-flash',S.root).forEach(n=>n.remove());
  const f=document.createElement('div');
  f.className='vf-flash';f.setAttribute('aria-hidden','true');f.textContent=S.data[i].ev.event;
  fr.appendChild(f);
  S.flashT=setTimeout(()=>f.remove(),1600);
}
function setHash(){
  const h=HASH+'/'+curId(S.data[S.active]);
  if(location.hash===h)return;
  try{history.replaceState(history.state,'',location.pathname+location.search+h)}catch(e){}
}

/* ---------- moving between slides ---------- */
function scrollToSlide(n){
  S.feed.scrollTo({top:S.slides[n].offsetTop,behavior:S.reduce?'auto':'smooth'});
}
function step(d){
  const base=S.target!=null?S.target:S.active;
  const n=Math.max(0,Math.min(S.data.length-1,base+d));
  if(n===base)return;
  S.target=n;scrollToSlide(n);
}
function advance(){
  const n=S.active+1;
  if(n<S.data.length){S.target=n;scrollToSlide(n)}
}

/* ---------- play, pause, sound ---------- */
function tickIcon(kind){
  const fr=frameOf(S.active);
  $$('.vf-tick',fr).forEach(n=>n.remove());
  const t=document.createElement('span');
  t.className='vf-tick';t.setAttribute('aria-hidden','true');t.innerHTML=kind==='pause'?I.pause:I.play;
  fr.appendChild(t);setTimeout(()=>t.remove(),650);
}
function toggle(){
  if(!S)return;
  let r=S.players.get(S.active);
  if(!r){r=mount(S.active);r.want=true;r.user=true;tickIcon('play');return}
  r.user=true;
  if(!r.ready){r.want=!r.want;return}
  if(r.state===1||r.state===3){r.paused=true;r.want=false;clearTimeout(r.guard);try{r.yt.pauseVideo()}catch(e){}tickIcon('pause')}
  else{startPlay(r);tickIcon('play')}
}
function setSound(on){
  S.soundOn=on;writeSound(on);
  const r=S.players.get(S.active);
  if(r&&r.ready&&r.yt){
    try{
      if(on){r.yt.unMute();r.yt.setVolume(100)}else r.yt.mute();
    }catch(e){}
    if(on&&r.state!==1&&r.state!==3&&!r.paused)startPlay(r);
  }
  updateSound();
}
function updateSound(){
  if(!S)return;
  const r=S.players.get(S.active);
  S.slides.forEach((el,k)=>{
    const pill=$('.vf-sound',el),mute=$('.vf-mute',el);
    const show=k===S.active&&!S.soundOn&&!(S.noAuto&&!(r&&r.user));
    pill.hidden=!show;
    mute.innerHTML=S.soundOn?I.on:I.off;
    mute.setAttribute('aria-label',S.soundOn?'Mute':'Unmute');
  });
}
function swapFilm(k,mode){
  const d=S.data[k]; if(!(d.it.highlight&&d.it.fullFilm))return;
  d.mode=mode;refreshSlide(k);
  const id=curId(d);
  if(mode==='ff'){S.soundOn=true;writeSound(true)}   // the click is a user gesture
  const r=S.players.get(k);
  if(r&&r.ready&&r.yt&&!r.dead){
    r.vid=id;r.paused=false;r.want=true;r.user=true;
    try{
      if(mode==='ff'){r.yt.unMute();r.yt.setVolume(100)}
      r.yt.loadVideoById(id);
    }catch(e){}
    frameOf(k).classList.remove('is-error');$('.vf-err',S.slides[k]).hidden=true;
    guard(r,0);
  }else{
    if(r)destroy(k,true);
    const n=mount(k);n.want=true;n.user=true;
  }
  setHash();updateSound();
}

/* ---------- progress ---------- */
function tick(){
  if(!S||document.hidden)return;
  const r=S.players.get(S.active);
  if(!r||!r.ready||r.state!==1)return;
  try{
    const c=r.yt.getCurrentTime(),t=r.yt.getDuration();
    if(t>0)$('.vf-seek',S.slides[S.active]).style.setProperty('--p',Math.min(1,c/t)*100+'%');
  }catch(e){}
}
function seekBy(secs){
  const r=S.players.get(S.active); if(!r||!r.ready)return;
  try{const t=r.yt.getDuration();r.yt.seekTo(Math.max(0,Math.min(t,r.yt.getCurrentTime()+secs)),true)}catch(e){}
}

/* ---------- events ---------- */
function onClick(e){
  if(!S)return;
  const t=e.target;
  const chip=t.closest('.vf-chip');
  if(chip){scrollTo_(+chip.dataset.first);return}
  if(t.closest('.vf-hit')){toggle();return}
  if(t.closest('.vf-sound')){setSound(true);return}
  if(t.closest('.vf-mute')){setSound(!S.soundOn);return}
  const sk=t.closest('.vf-seek');
  if(sk){
    if(e.detail===0)return;                       // a keyboard click; the arrow keys do the seeking
    const r=S.players.get(S.active); if(!r||!r.ready)return;
    const b=sk.getBoundingClientRect();
    try{const dur=r.yt.getDuration();if(dur>0){r.yt.seekTo(dur*Math.max(0,Math.min(1,(e.clientX-b.left)/b.width)),true);tick()}}catch(x){}
    return;
  }
  const fb=t.closest('.vf-film');
  if(fb){swapFilm(S.active,fb.dataset.mode);return}
}
function scrollTo_(n){ if(n>=0&&n<S.data.length){S.target=n;scrollToSlide(n)} }
function onSeekKey(e){
  if(!S||!e.target.closest||!e.target.closest('.vf-seek'))return;
  if(e.key==='ArrowRight'){e.preventDefault();seekBy(5)}
  else if(e.key==='ArrowLeft'){e.preventDefault();seekBy(-5)}
}
function onKey(e){
  if(!S||e.defaultPrevented||e.metaKey||e.ctrlKey||e.altKey)return;
  const t=e.target;
  if(t&&(t.isContentEditable||/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))return;
  if(document.body.classList.contains('locked')||S.away)return;   // the mobile menu is open, or the feed isn't on screen
  const k=e.key;
  if(k==='ArrowDown'||k==='j'||k==='PageDown'){e.preventDefault();step(1)}
  else if(k==='ArrowUp'||k==='k'||k==='PageUp'){e.preventDefault();step(-1)}
  else if(k===' '||k==='Spacebar'){
    if(t&&t.closest&&t.closest('button,a,[role="button"]'))return;   // a focused button keeps its own Space
    e.preventDefault();toggle();
  }
  else if(k==='m'||k==='M'){setSound(!S.soundOn)}
}
/* away = the tab is hidden, or less than half the feed is on screen */
function syncAway(){
  if(!S)return;
  const away=document.hidden||!S.inView;
  if(away===S.away)return;
  S.away=away;
  const r=S.players.get(S.active);
  if(away){
    if(r){r.resume=r.resume||((r.state===1||r.state===3)&&!r.paused);pause(r);r.want=false}
  }else if(r&&r.resume&&!r.paused){
    r.resume=false;
    if(!S.noAuto||r.user)startPlay(r);
  }
}
function onVis(){syncAway()}
/* thumbnails: YouTube answers a missing maxres image with a 120px placeholder */
function onImg(e){
  const im=e.target;
  if(!im||!im.classList||!im.classList.contains('vf-thumb')||im.dataset.lo)return;
  if(e.type==='error'||im.naturalWidth===120){im.dataset.lo='1';im.src=thumbLo(im.dataset.id)}
}

window.VF={toggleHTML,open,close,pauseAll,isOpen:()=>!!S};
})();
