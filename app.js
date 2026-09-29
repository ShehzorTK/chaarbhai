/* Homepage reel: a YouTube video id, and the stretch of it that loops
   (seconds). 6 skips the title card; 60 seconds of footage from there. */
const REEL='NjDgSJSYF78', REEL_FROM=6, REEL_TO=66;

const T=['#191C26','#1D2030','#232735','#1B1E29','#202431','#262A38'];   /* image-failed fallbacks, from the ink ramp */
/* One photo from PORTFOLIO or PICKS: web-sized WebP copies in site/photos.
   `sizes` says how wide it shows, so the browser fetches the smallest copy that
   stays sharp. Everything below the first screen loads lazily. */
function pic(f,sizes,{alt=f.alt,eager=false,cls=''}={}){const a=T[0],b=T[2];
 const set=f.ws.map(w=>`${f.src}-${w}.webp ${w}w`).join(', ');
 return `<img${cls?` class="${cls}"`:''} src="${f.src}-${f.ws[0]}.webp" srcset="${set}" sizes="${sizes}"
 width="${f.ws[0]}" height="${Math.round(f.ws[0]/f.ar)}" ${eager?'fetchpriority="high"':'loading="lazy"'} decoding="async"
 draggable="false" alt="${esc(alt)}"${f.pos?` style="object-position:${f.pos}"`:''}
 onerror="this.style.display='none';(this.closest('.fr-img,.arch,.thumb,.pk-m,.cta-bg,.hero-arch')||this.parentNode).style.background='linear-gradient(150deg,${a},${b})'">`}

const CHAPTERS=[
 {id:'before',no:'07',short:'Portraits',name:'Portraits',
  alt:'Engagement · Nikkah and reception portraits',
  desc:'An hour away from everyone, sometimes months before, sometimes between the ceremony and the reception. Two people, whatever light there is, and nobody watching.'},

 {id:'night',no:'01',short:'Night before',name:'The night before',
  alt:'Dholki · Sangeet · Jaggo · Mayoun',
  desc:'Days before anything official happens. The house fills up, someone digs the dhol out of a cupboard, and nobody goes home.'},

 {id:'henna',no:'02',short:'Henna',name:'Henna and haldi',
  alt:'Mehndi · Haldi · Gaye holud · Vatna',
  desc:'Henna, turmeric, or both, depending on the family. Whatever yours calls it, it is the loudest and most crowded room of the week.'},

 {id:'arrival',no:'04',short:'Arrival',name:'The arrival',
  alt:'Baraat · Milni · Entrances',
  desc:'Both families walking in. You hear it a long time before you see it, and there is always somebody’s grandmother waving at the back.'},

 {id:'ceremony',no:'03',short:'Ceremony',name:'The ceremony',
  alt:'Nikkah · Anand Karaj · Pheras · Bibaho',
  desc:'Usually the quietest hour of the whole week, and the only part of it that is actually binding.'},

 {id:'reception',no:'05',short:'Reception',name:'The reception',
  alt:'Walima · Reception · Bou bhat',
  desc:'The formal one. The photographed one. The one the aunts have opinions about.'},

 {id:'farewell',no:'06',short:'Farewell',name:'The farewell',
  alt:'Rukhsati · Vidaai · Doli',
  desc:'Twenty minutes, and the hardest part of the whole week to shoot properly.'}
]
/* Each chapter shows the real weddings in PORTFOLIO, one strip per event.
   A chapter with no photos yet stays hidden until one is added. */
 .map(c=>({...c,seqs:PORTFOLIO[c.id]||[],cover:PICKS.covers[c.id]}))
 .filter(c=>c.seqs.length)
 .map((c,i)=>({...c,no:String(i+1).padStart(2,'0'),frames:c.seqs.reduce((n,q)=>n+q.frames.length,0)}));

/* Packages, from the Chaar Bhai Price Book (still marked as a draft: see PRODUCT.md).
   One source for the package cards, the compare table and the builder.
   Package prices are hours × the hourly rate, unless a package sets its own. */
const PR_RATE={both:550,photo:350,video:450};
const PR_COMMON=[['Professional retouching','photo'],['Online gallery of your fully edited photos','photo'],
  ['Film delivered via a private download link','video'],['Audio equipment and on-camera interviews','video']];
const PR_BIG=[['Rehearsal dinner coverage'],['Get-ready session'],['Pre-wedding e-shoot'],
  ['Your choice of one complimentary album, standard, premium, or parent','photo'],['Set of framed prints','photo']];
const PR=[
 {id:'first-light',name:'First Light',hours:6,tier:1,photographers:1,videographers:1,freeKeepsakes:0,
  tag:'Six hours, one event. Enough to cover a ceremony or reception properly, start to finish.',rows:PR_COMMON},
 {id:'golden-hour',name:'Golden Hour',hours:10,tier:2,photographers:1,videographers:1,freeKeepsakes:0,
  tag:'Ten hours, one full day. Getting ready through the last dance.',rows:[...PR_COMMON,['Get-ready session']]},
 {id:'till-dusk',name:'Till Dusk',hours:16,tier:3,photographers:1,videographers:1,freeKeepsakes:1,
  tag:'Sixteen hours across two events, with a get-ready session, a pre-wedding shoot and your pick of a complimentary album.',rows:[...PR_COMMON,...PR_BIG]},
 {id:'till-sunrise',name:'Till Sunrise',hours:24,tier:4,priceBoth:12600,photographers:1,videographers:1,freeKeepsakes:1,
  tag:'Twenty-four hours, the whole weekend covered, with one complimentary album of your choice.',rows:[...PR_COMMON,...PR_BIG,['Next-day edit','video']]}]
 .map(p=>({priceBoth:p.hours*PR_RATE.both,pricePhoto:p.hours*PR_RATE.photo,priceVideo:p.hours*PR_RATE.video,...p}));
const PR_CMP=[
 ['Coverage',null,['6 hours','10 hours','16 hours','24 hours']],
 ['Extra hour',null,['$550','$550','$750','$750']],
 ['Best for',null,['One event','One full day','Two events','Full weekend']],
 ['Professional retouching','photo',[1,1,1,1]],
 ['Photo gallery','photo',[1,1,1,1]],
 ['Video via download link','video',[1,1,1,1]],
 ['Audio and interviews','video',[1,1,1,1]],
 ['Rehearsal dinner coverage',null,[0,0,1,1]],
 ['Get-ready session',null,[0,1,1,1]],
 ['Pre-wedding e-shoot',null,[0,0,1,1]],
 ['Complimentary album picks','photo',[0,0,'Choice of 1','Choice of 1']],
 ['Framed prints','photo',[0,0,1,1]],
 ['Next-day edit','video',[0,0,0,1]]];
const PR_CHECK='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.6 6.4 12 13 4.6" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const svcAttr=v=>v?` data-service="${v}"`:'';
/* estimate chosen on the Prices page, carried into the contact letter */
let EST=null;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* Ratings shown on the site, with links to the full lists. The figures are
   typed in by hand: update them when they change.
   google.url opens the Chaar Bhai Canada listing (Mississauga) by its
   permanent Maps id. Not the older Pakistan listing. */
const PROOF={
  google:{rating:4.8,count:37,url:'https://www.google.com/maps?cid=901197728530734372'},
  meta:{recommend:94,count:344,url:'https://www.facebook.com/chaarbhai/reviews'}};
/* Platform marks, drawn from the brands' own artwork: Google's four-colour G,
   and Meta's symbol (path from Simple Icons) in Meta's blue gradient. */
const G_LOGO=`<svg class="pb-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`;
const M_LOGO=`<svg class="pb-logo pb-meta" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="metag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#0064E1"/><stop offset=".6" stop-color="#0073EE"/><stop offset="1" stop-color="#0082FB"/></linearGradient></defs><path fill="url(#metag)" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>`;
const STAR_P='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>';
const STARS=r=>`<span class="stars" role="img" aria-label="${r} out of 5 stars"><span class="stars-fill" style="width:${r/5*100}%">${STAR_P.repeat(5)}</span>${STAR_P.repeat(5)}</span>`;
const revRating=r=>r.s?STARS(r.s):'<span class="rev-rec">Recommends</span>';
const proof=(cls='')=>`<div class="proof ${cls}">
  <a class="pb pb-g" href="${PROOF.google.url}" target="_blank" rel="noopener" aria-label="Rated ${PROOF.google.rating} out of 5 from ${PROOF.google.count} reviews on Google. Read them on Google.">
    ${G_LOGO}
    <span class="pb-body">
      <span class="pb-name">Google Reviews</span>
      <span class="pb-score"><b>${PROOF.google.rating.toFixed(1)}</b>${STARS(PROOF.google.rating)}</span>
      <span class="pb-sub">Based on ${PROOF.google.count} reviews</span>
    </span>
  </a>
  <a class="pb pb-m" href="${PROOF.meta.url}" target="_blank" rel="noopener" aria-label="${PROOF.meta.recommend}% recommend, from ${PROOF.meta.count} reviews on Meta. Read them on Facebook.">
    ${M_LOGO}
    <span class="pb-body">
      <span class="pb-name">Meta Reviews</span>
      <span class="pb-score"><b>${PROOF.meta.recommend}%</b><span class="pb-rec">recommend</span></span>
      <span class="pb-sub">Based on ${PROOF.meta.count} reviews</span>
    </span>
  </a>
</div>`;

const ARROW=d=>`<svg viewBox="0 0 16 16" aria-hidden="true"><path d="${d==='l'?'M13 8H3M7 4 3 8l4 4':'M3 8h10M9 4l4 4-4 4'}" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ================= PAGES ================= */
const P={};

P['/']=()=>`
<section class="vhero">
  <div class="vhero-media">
    <!-- The reel (YouTube id in REEL): muted so browsers allow autoplay,
         looped, no controls. The poster photo stays until YouTube reports the
         video is actually playing, so a blocked autoplay never shows a play
         button. Reduced-motion visitors keep the photo. See reel(). -->
    ${pic(PICKS.hero,'100vw',{alt:'',eager:true,cls:'vhero-poster'})}
    <div id="reel"></div>
  </div>
  <div class="vhero-in">
    <h1>
      <span class="rv-l"><span>The photographs</span></span>
      <span class="rv-l" data-d="1"><span>your family keeps</span></span>
    </h1>
    <p class="rv" data-d="2">We photograph and film weddings, and have done since 2013. Over eighteen hundred of them so far. We’re based in the Greater Toronto Area and we travel.</p>
    <div class="acts rv" data-d="3">
      <a href="#/contact" data-nav class="btn"><span>See if your date is free</span><i></i></a>
      <span class="quiet mono">Tell us the date and we’ll come back to you</span>
    </div>
  </div>
  <div class="vhero-foot mono">
    <span>Photo and film</span><span>Based in the GTA</span><span>Since 2013</span>
  </div>
</section>

<section>
  <div class="band-in" style="align-items:start">
    <div>
      <h2 class="d2 rv" data-d="1">We plan the<br>boring parts</h2>
    </div>
    <div>
      <p class="lead rv" data-d="2">We sit down with you before the day and go through it properly. Which events matter most, who has to be in the family photos, what you want us nowhere near.</p>
      <p class="lead rv" data-d="3" style="margin-top:20px">It’s not the interesting part of the job. It’s the reason things don’t get missed.</p>
      <div class="rv" data-d="3" style="margin-top:34px"><a href="#/about" data-nav class="btn"><span>More about us</span><i></i></a></div>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <h2 class="d2 rv" style="margin-bottom:clamp(26px,3vw,40px)">Recent work</h2>
  <div class="ilist">
    ${CHAPTERS.map((c,i)=>`
      <button class="irow short rv" data-nav-to="#/portfolio" data-then="ch-${c.id}" data-d="${i%4}">
        <span class="thumb">${pic(c.cover,'62px',{alt:''})}</span>
        <span class="t">${c.name}</span>
        <span class="y">View</span>
      </button>`).join('')}
  </div>
  <div class="rv" style="margin-top:44px"><a href="#/portfolio" data-nav class="btn"><span>The full archive</span><i></i></a></div>
</section>

<section class="band">
  <div class="band-in">
    <div>
      <h2 class="d2 rv" data-d="1">We stay out<br>of the way</h2>
      <p class="lead rv" data-d="2" style="margin-top:26px">The aim is to be as unobtrusive as we can, so most of the day gets documented as it actually happens. When a shot needs setting up we’ll step in and direct it, then get out of the way again.</p>
    </div>
    <figure class="arch rv-img" data-d="2" style="aspect-ratio:4/5">${pic(PICKS.stay,'(max-width: 800px) 92vw, 44vw')}</figure>
  </div>
</section>

<section class="tally">
  <div class="tally-cap">
    <p class="tally-big"><span>336,600+</span></p>
    <p class="tally-copy">photographs we’ve delivered since 2013, for more than 1,800 couples. That’s before the 1,800 films.</p>
  </div>
</section>

<section class="band voices">
  <figure class="v-lead">
    <blockquote><p><span class="hang">“</span>They turned my dream Bollywood wedding into a reality.”</p></blockquote>
    <figcaption>Zainab Jafari</figcaption>
    ${proof('proof-s')}
  </figure>
  <div class="v-more">
    <figure><blockquote><p>“You guys have literally covered each and every moment.”</p></blockquote><figcaption>Jannat Hashmi</figcaption></figure>
    <figure><blockquote><p>“They made us feel completely at ease and captured every special moment so naturally.”</p></blockquote><figcaption>Zair Syed</figcaption></figure>
    <figure><blockquote><p>“Truly mesmerizing, especially the candid shots.”</p></blockquote><figcaption>Zohra Masudi</figcaption></figure>
    <a href="#/testimonials" data-nav class="btn"><span>Read all ${REVIEWS.length}</span><i></i></a>
  </div>
</section>

<section class="cta">
  <h2 class="rv">Tell us about<br>your wedding</h2>
  <p class="lead rv" data-d="1" style="margin-top:24px">Send us the date and the venue and we’ll come back to you.</p>
  <div class="rv" data-d="2" style="margin-top:38px"><a href="#/contact" data-nav class="btn"><span>Check your date</span><i></i></a></div>
</section>`;

P['/portfolio']=()=>`
<section style="padding-top:clamp(140px,20vh,220px);padding-bottom:clamp(28px,4vw,48px)">
  <h1 class="d1 rv" data-d="1">The archive</h1>
  <p class="lead rv" data-d="2" style="margin-top:26px">Real weddings, shown the way they happened. Look through the photos, one couple to a row (tap any photo to see it bigger), or watch the films, grouped by event.</p>
  <div class="wk-tog-row rv" data-d="3">${VF.toggleHTML('photos')}</div>
</section>

<div id="wk-videos" hidden></div>

<div id="wk-photos">
<section style="padding-top:0;padding-bottom:clamp(20px,3vw,44px)">
  <div class="ilist">
    ${CHAPTERS.map((c,i)=>`
      <button class="irow rv" data-jump="ch-${c.id}" data-d="${i%4}">
        <span class="n">${c.no}</span>
        <span class="thumb">${pic(c.cover,'62px',{alt:''})}</span>
        <span class="t">${c.name}</span>
        <span class="c">${c.alt}</span>
        <span class="y">${c.frames} frames</span>
      </button>`).join('')}
  </div>
</section>

<div class="rail">
  ${CHAPTERS.map(c=>`<button data-jump="ch-${c.id}"><span class="lb">${c.short}</span><span class="dt"></span></button>`).join('')}
</div>

${CHAPTERS.map(c=>`
<section class="chapter" id="ch-${c.id}" style="padding-bottom:clamp(36px,4.6vw,74px)">
  <div class="ch-head">
    <div class="ch-no">${c.no}</div>
    <div>
      <h2 class="ch-title rv">${c.name}</h2>
      <div class="ch-alt mono rv" data-d="1">${c.alt}</div>
      <p class="ch-desc rv" data-d="2">${c.desc}</p>
    </div>
  </div>
  <div class="ch-body">
  ${c.seqs.map(q=>`
  <div class="seq" data-label="${esc([q.couple,...q.tags].join(' · '))}">
    <div class="seq-head">
      <div>
        <h3 class="seq-title rv">${q.couple}</h3>
        <ul class="seq-tags rv" data-d="1"><li class="tag-ch">${c.name}</li>${q.tags.map(t=>`<li>${esc(t)}</li>`).join('')}</ul>
      </div>
      <div class="seq-ctrl rv" data-d="1">
        <span class="seq-count">01 / ${String(q.frames.length).padStart(2,'0')}</span>
        <button class="sq-prev" aria-label="Previous frame">${ARROW('l')}</button>
        <button class="sq-next" aria-label="Next frame">${ARROW('r')}</button>
      </div>
    </div>
    <div class="seq-strip rv">
      ${q.frames.map((f,j)=>`
        <figure class="frame${f.ar>1?' wide':''}" style="--ar:${f.ar}">
          <div class="fr-img" tabindex="0" role="button" aria-label="Open larger: ${esc(f.cap)}">${pic(f,f.ar>1?'(max-width: 600px) 88vw, 620px':'(max-width: 600px) 60vw, 310px')}</div>
          <figcaption class="fr-cap"><span class="fr-no">${String(j+1).padStart(2,'0')}</span><span>${f.cap}</span></figcaption>
        </figure>`).join('')}
    </div>
    <div class="seq-bar"><i></i></div>
  </div>`).join('')}
  </div>
</section>`).join('')}

<div class="rail-space"></div>

<section class="cta">
  <h2 class="rv">See if your<br>date is open</h2>
  <div class="rv" data-d="1" style="margin-top:38px"><a href="#/contact" data-nav class="btn"><span>Get in touch</span><i></i></a></div>
</section>
</div>`;

P['/about']=()=>`
<section class="hero" style="min-height:70svh;justify-content:flex-end">
  <h1 class="d1 rv" data-d="1">Chaar Bhai means<br>four brothers</h1>
  <div class="hero-foot mono"><span>Since 2013</span><span>Photo and film</span><span>We travel</span></div>
</section>

<section style="padding:0 var(--pad)">
  <figure class="arch rv-img" style="aspect-ratio:21/9">${pic(PICKS.about,'100vw')}</figure>
</section>

<section>
  <div class="band-in" style="align-items:start">
    <div>
      <p class="quote statement rv" data-d="1">When your brothers are at the wedding, you don’t worry. They’ve got it covered.</p>
    </div>
    <div>
      <p class="lead rv" data-d="2">That’s the name, in Urdu. We started in 2013 as four friends, and life has since taken the four of us to different parts of the world. The name stayed, because of what it came to mean.</p>
      <p class="lead rv" data-d="3" style="margin-top:20px">What we’ve learnt, and what our couples tell us they expect, is that feeling: the comfort of knowing Chaar Bhai have it covered, so the family can get on with the day.</p>
      <p class="lead rv" data-d="3" style="margin-top:20px">It’s why our clients so often span three generations of one family. Somewhere along the way we stop being the people with the cameras and become family.</p>
    </div>
  </div>
</section>

<section style="padding-top:0">
  <div class="ilist">
    ${[
      ["01","How we shoot","Candid first. We chase as many unposed frames as we can get, and we are just as comfortable directing when a shot needs setting up."],
      ["02","How we edit","Tailored to your taste rather than to a house preset. Tell us how you want it to look and we work to that, technically correct either way."],
      ["03","What you get","Every image and video from the day, professionally retouched, in an online gallery."]
    ].map(([n,t,d],i)=>`
      <div class="irow plain rv" data-d="${i%3}">
        <span class="t">${t}</span>
        <span class="d">${d}</span>
      </div>`).join('')}
  </div>
</section>

<section class="band">
  <div class="band-in">
    <figure class="arch rv-img" style="aspect-ratio:4/5">${pic(PICKS.back,'(max-width: 800px) 92vw, 44vw')}</figure>
    <div>
      <h2 class="d2 rv" data-d="1">We show you the<br>back of the camera</h2>
      <p class="lead rv" data-d="2" style="margin-top:26px">During the day we’ll come over and show you what we just shot, so you can tell us if something’s off while there’s still time to fix it. Costs us two minutes. Saves a lot of disappointment later.</p>
    </div>
  </div>
</section>

<section>
  <h2 class="d2 rv" data-d="1" style="max-width:18ch">Based in the Greater<br>Toronto Area, and we travel</h2>
  <p class="lead rv" data-d="2" style="margin-top:24px">The Greater Toronto Area is home, but a wedding somewhere else is not a problem. We have shot in Pakistan, the UAE, Thailand and the United States. Tell us where yours is and we’ll tell you whether we can be there.</p>
</section>

<section class="band hire" aria-labelledby="hire-h">
  <div class="hire-in">
    <div>
      <h2 class="d2" id="hire-h">Want to work<br>with us?</h2>
      <p class="lead" style="margin-top:22px">Send us your CV and a link to your work. We read everything that comes in.</p>
    </div>
    <div class="hire-mail">
      <a class="hire-addr" href="mailto:info@chaarbhai.com?subject=CV%20for%20Chaar%20Bhai">info<wbr>@chaarbhai.com</a>
      <a class="btn" href="mailto:info@chaarbhai.com?subject=CV%20for%20Chaar%20Bhai"><span>Email your CV</span><i></i></a>
    </div>
  </div>
</section>

<section class="cta">
  <h2 class="rv">Want to talk?</h2>
  <div class="rv" data-d="1" style="margin-top:38px"><a href="#/contact" data-nav class="btn"><span>Get in touch</span><i></i></a></div>
</section>`;

P['/services']=()=>`
<div class="pr">
<section class="hero" style="min-height:62svh;justify-content:flex-end">
  <h1 class="d1 rv" data-d="1">What it costs</h1>
  <p class="lead rv" data-d="2" id="hero-lede" style="margin-top:24px">Four packages built around how long your wedding day actually runs. Every one includes a photographer and a videographer, professional retouching, and a private online gallery.</p>
  <div class="pr-bar mono rv" data-d="3">
    <span id="price-bar-note">All prices in CAD</span>
    <div class="currency-toggle" role="group" aria-label="Wedding location">
      <button type="button" data-currency-btn data-currency-value="CAD" class="is-active">In Canada</button>
      <button type="button" data-currency-btn data-currency-value="USD">Outside Canada</button>
    </div>
  </div>
  <div class="note-box is-hidden" id="international-note">
    <p><strong>Travelling outside Canada.</strong> Travel and accommodation for the crew are billed separately for events outside Canada.</p>
  </div>
  <div class="filter-bar rv" data-d="3">
    <span class="filter-bar-label mono">Showing</span>
    <div class="filter-toggle" role="group" aria-label="Filter packages by service">
      <button type="button" data-filter-btn data-filter-value="both" class="is-active">Photo + Video</button>
      <button type="button" data-filter-btn data-filter-value="photo">Photo only</button>
      <button type="button" data-filter-btn data-filter-value="video">Video only</button>
    </div>
  </div>
</section>

<section class="pr-pkgs" style="padding-top:0" aria-label="Packages, one at a time">
  ${PR.map(p=>`
  <article class="pkg-section" id="section-${p.id}">
    <div class="pkg-intro">
      <div class="pr-tier mono rv">${p.hours} hours</div>
      <h2 class="rv" data-d="1">${p.name}</h2>
      <p class="pkg-price rv" data-d="2"><span class="price-value">$${p.priceBoth.toLocaleString('en-CA')}</span><sup>CAD</sup></p>
      <p class="lead rv" data-d="2">${p.tag}</p>
      <div class="pkg-cta rv" data-d="3"><button type="button" class="btn" data-goto-pkg="${p.id}"><span>Customize this one</span><i></i></button></div>
    </div>
    <ul class="feature-rows rv" data-d="2">
      <li class="coverage-line">${p.hours} hours of photo and video coverage</li>
      ${p.rows.map(([t,v])=>`<li${svcAttr(v)}>${t}</li>`).join('')}
    </ul>
  </article>`).join('')}
</section>

<section aria-labelledby="compare-heading">
  <h2 class="d2 rv" data-d="1" id="compare-heading">All four, side by side</h2>
  <p class="lead rv" data-d="2" style="margin-top:20px">The same details, without the scrolling.</p>
  <div class="compare-wrap rv" data-d="2">
    <div class="compare-grid">
      <div></div>
      ${PR.map(p=>`<div class="col-head" data-pkg="${p.id}"><h3>${p.name}</h3><span class="col-price">$${p.priceBoth.toLocaleString('en-CA')}</span></div>`).join('')}
      ${PR_CMP.map(([label,v,vals])=>`<div class="row-label"${svcAttr(v)}>${label}</div>`+vals.map(x=>
        x===1?`<div class="yes"${svcAttr(v)}>${PR_CHECK}<span class="sr">Included</span></div>`:
        x===0?`<div class="no"${svcAttr(v)}>—<span class="sr">Not included</span></div>`:
        `<div${svcAttr(v)}>${x}</div>`).join('')).join('')}
    </div>
  </div>
</section>

<section aria-labelledby="builder-heading" style="padding-top:0">
  <h2 class="d2 rv" data-d="1" id="builder-heading">Pick your starting point, then customize</h2>
  <p class="lead rv" data-d="2" style="margin-top:20px">Choose a package, add whatever your day needs, and watch your total update as you go. When it looks right, send it to us.</p>
  <div class="filter-bar rv" data-d="2">
    <span class="filter-bar-label mono">Showing</span>
    <div class="filter-toggle" role="group" aria-label="Filter customization by service">
      <button type="button" data-filter-btn data-filter-value="both" class="is-active">Photo + Video</button>
      <button type="button" data-filter-btn data-filter-value="photo">Photo only</button>
      <button type="button" data-filter-btn data-filter-value="video">Video only</button>
    </div>
  </div>

    <div class="builder-grid rv" data-d="2">
      <div class="builder-options">

        <div class="option-block">
          <p class="option-label">1. Choose your package</p>
          <div class="package-pills" id="package-pills">
            <label class="pill" data-pkg="first-light">
              <input type="radio" name="package" id="pkg-first-light" value="first-light" checked>
              <span class="pill-inner">
                <span class="pill-name">First Light</span>
                <span class="pill-price">$3,300</span>
              </span>
            </label>
            <label class="pill" data-pkg="golden-hour">
              <input type="radio" name="package" id="pkg-golden-hour" value="golden-hour">
              <span class="pill-inner">
                <span class="pill-name">Golden Hour</span>
                <span class="pill-price">$5,500</span>
              </span>
            </label>
            <label class="pill" data-pkg="till-dusk">
              <input type="radio" name="package" id="pkg-till-dusk" value="till-dusk">
              <span class="pill-inner">
                <span class="pill-name">Till Dusk</span>
                <span class="pill-price">$8,800</span>
              </span>
            </label>
            <label class="pill" data-pkg="till-sunrise">
              <input type="radio" name="package" id="pkg-till-sunrise" value="till-sunrise">
              <span class="pill-inner">
                <span class="pill-name">Till Sunrise</span>
                <span class="pill-price">$12,600</span>
              </span>
            </label>
          </div>
        </div>

        <div class="option-block">
          <p class="option-label">2. Coverage &amp; team</p>
          <ul class="addon-list">
            <li class="addon-row stepper-row">
              <div class="addon-label-group">
                <span class="addon-name">Extra hours of coverage</span>
                <span class="addon-sub" id="hour-rate-sub">$550 per hour on First Light</span>
              </div>
              <div class="stepper">
                <button type="button" id="hour-decrement" aria-label="Remove an extra hour">&#8722;</button>
                <span id="hour-qty" aria-live="polite">0</span>
                <button type="button" id="hour-increment" aria-label="Add an extra hour">+</button>
              </div>
            </li>
            <li class="addon-row" data-row data-service="photo">
              <label class="addon-check">
                <input type="checkbox" id="addon-second-photographer" data-rate="120">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Second photographer</span>
                  <span class="addon-sub">Add-on on every package, $120 per booked hour</span>
                </span>
              </label>
              <span class="addon-price">$720</span>
            </li>
            <li class="addon-row" data-row data-service="video">
              <label class="addon-check">
                <input type="checkbox" id="addon-second-videographer" data-rate="120">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Second videographer</span>
                  <span class="addon-sub">Add-on on every package, $120 per booked hour, drone coverage comes with it</span>
                </span>
              </label>
              <span class="addon-price">$720</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-venue-lighting" data-price="350">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Venue lighting Package</span>
                  <span class="addon-sub">For venues with tricky ambience, we will come in with extra lights to illuminate it the way you have envisioned.</span>
                </span>
              </label>
              <span class="addon-price">$350</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-rehearsal-dinner" data-price="600" data-includes="till-dusk,till-sunrise">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Rehearsal dinner coverage</span>
                  <span class="addon-sub">Photo and video coverage of your rehearsal dinner.</span>
                </span>
              </label>
              <span class="addon-price">$600</span>
            </li>
          </ul>

          <div class="note-box" data-service="video" id="video-note-box">
            <p><strong>Audio &amp; interviews.</strong> Professional audio equipment and on-camera interview capability are standard on every video package.</p>
            <p id="drone-status-line"><strong>Drone coverage.</strong> Comes with a second videographer.</p>
          </div>
          <div class="note-box">
            <p>A second ceremony or reception venue is already covered. Travel, setup, and tear-down between locations aren't extra.</p>
          </div>
        </div>

        <div class="option-block">
          <p class="option-label">3. Sessions</p>
          <ul class="addon-list">
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-get-ready" data-price="500" data-includes="golden-hour,till-dusk,till-sunrise">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Get-ready session</span>
                  <span class="addon-sub">Coverage of the getting ready, before the first event starts.</span>
                </span>
              </label>
              <span class="addon-price">$500</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-eshoot" data-price="950" data-includes="till-dusk,till-sunrise">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Pre-wedding e-shoot</span>
                  <span class="addon-sub">A portrait session together before the wedding.</span>
                </span>
              </label>
              <span class="addon-price">$950</span>
            </li>
          </ul>
        </div>

        <div class="option-block" data-service="photo">
          <p class="option-label">4. Keepsakes &amp; prints</p>
          <p class="option-sub" id="keepsake-hint"></p>
          <ul class="addon-list">
            <li class="addon-row" data-row data-pool="keepsake">
              <label class="addon-check">
                <input type="checkbox" id="addon-album-standard" data-price="1200">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Printed album, standard</span>
                  <span class="addon-sub">A printed album of your wedding photos.</span>
                </span>
              </label>
              <span class="addon-price">$1,200</span>
            </li>
            <li class="addon-row" data-row data-pool="keepsake">
              <label class="addon-check">
                <input type="checkbox" id="addon-album-premium" data-price="1800">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Premium album, large format</span>
                  <span class="addon-sub">A larger-format printed album of your wedding photos.</span>
                </span>
              </label>
              <span class="addon-price">$1,800</span>
            </li>
            <li class="addon-row" data-row data-pool="keepsake">
              <label class="addon-check">
                <input type="checkbox" id="addon-parent-album" data-price="300">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Parent album</span>
                  <span class="addon-sub">Requires a standard or premium album pick</span>
                </span>
              </label>
              <span class="addon-price">$300</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-framed-prints" data-price="250" data-includes="till-dusk,till-sunrise">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Set of framed prints</span>
                  <span class="addon-sub">A set of your photos, printed and framed.</span>
                </span>
              </label>
              <span class="addon-price">$250</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-extra-prints" data-price="190">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Additional prints, pack of 10</span>
                  <span class="addon-sub">Ten more prints of photos you choose.</span>
                </span>
              </label>
              <span class="addon-price">$190</span>
            </li>
          </ul>
        </div>

        <div class="option-block">
          <p class="option-label">5. Delivery &amp; extras</p>
          <ul class="addon-list">
            <li class="addon-row" data-row data-service="video">
              <label class="addon-check">
                <input type="checkbox" id="addon-sneak-peek" data-price="1000" data-includes="till-sunrise">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Next-day edit</span>
                  <span class="addon-sub">$1,000 value &#8211; your film's highlights, ready the day after</span>
                </span>
              </label>
              <span class="addon-price">$1,000</span>
            </li>
            <li class="addon-row" data-row>
              <label class="addon-check">
                <input type="checkbox" id="addon-rush-delivery" data-price="500">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Rush full-gallery delivery</span>
                  <span class="addon-sub">Your full edited gallery, delivered ahead of the usual timeline.</span>
                </span>
              </label>
              <span class="addon-price">$500</span>
            </li>
            <li class="addon-row" data-row data-service="photo">
              <label class="addon-check">
                <input type="checkbox" id="addon-slideshow" data-price="200">
                <span class="checkbox-box" aria-hidden="true"></span>
                <span class="addon-label-group">
                  <span class="addon-name">Digital slideshow</span>
                  <span class="addon-sub">A slideshow of your photos to share online.</span>
                </span>
              </label>
              <span class="addon-price">$200</span>
            </li>
          </ul>
        </div>

      </div>

      <aside class="builder-summary">
        <h3>Your estimate</h3>
        <ul class="summary-lines" id="summary-lines"></ul>
        <div class="summary-total">
          <span>Estimated total</span>
          <span id="summary-total-value">$3,300</span>
        </div>
        <p class="summary-note">We'll confirm your exact quote by email once we've reviewed your date and details.</p>

        <a href="#/contact" class="btn" id="submit-cta"><span>Write to us about this</span><i></i></a>

        <button type="button" class="reset-btn" id="reset-btn">Start over</button>
      </aside>

    </div>
</section>
</div>

<section class="cta">
  <h2 class="rv">Rather talk it through<br>with one of us?</h2>
  <p class="lead rv" data-d="1" style="margin-top:24px">Send us your date and what you’re planning, and we’ll go through the options with you.</p>
  <div class="rv" data-d="2" style="margin-top:38px"><a href="#/contact" data-nav class="btn"><span>Start the conversation</span><i></i></a></div>
</section>`;

P['/testimonials']=()=>`
<section class="hero" style="min-height:56svh;justify-content:flex-end">
  <h1 class="d1 rv" data-d="1">What couples<br>have said</h1>
  <p class="lead rv" data-d="2" style="margin-top:24px">${REVIEWS.length} of them below, from Google and Facebook, copied across as written, typos and all. Tap one to read it in full where it was posted.</p>
  ${proof()}
</section>

<section style="padding-top:0">
  <div class="rgrid">
    ${REVIEWS.map((r,i)=>`
      <article class="rev rv" data-d="${i%3}">
        <div class="rev-top">${revRating(r)}${r.src==='g'?G_LOGO:M_LOGO}</div>
        <p class="rev-x"><q>${esc(r.x)}</q></p>
        <div class="who"><a class="rev-open" href="${esc(r.l)}" target="_blank" rel="noopener" aria-label="${esc(r.n)}’s full review on ${r.src==='g'?'Google':'Facebook'}">${esc(r.n)}</a></div>
      </article>`).join('')}
  </div>
</section>

<section class="cta">
  <h2 class="rv">Add yours</h2>
  <div class="rv" data-d="1" style="margin-top:38px"><a href="#/contact" data-nav class="btn"><span>Work with us</span><i></i></a></div>
</section>`;

/* ---------- enquiry form ----------
   Studio Ninja's contact form, embedded. Enquiries go straight into Studio
   Ninja as leads. The form's fields and look are edited in Studio Ninja's
   form builder, not here. */
const SN_FORM='https://app.studioninja.co/contactform/parser/0a800fc8-7cc8-186f-817c-e0d40ca12ec6/0a800fc8-86e5-1a1e-8186-ee1ec0214c29';
const SN_RESIZER='https://app.studioninja.co/client-assets/form-render/assets/scripts/iframeResizer.js';

P['/contact']=()=>`
<section class="cg">
  <div class="cg-side">
    <h1 class="letter-h">Write to us</h1>
    <p class="lead">Tell us a little about your wedding and we’ll come back to you, usually within a day or two.</p>
    <ul class="quickline">
      <li><b>Instagram</b> <a href="https://instagram.com/chaarbhai" target="_blank" rel="noopener">@chaarbhai</a></li>
      <li><b>Based in</b> the Greater Toronto Area</li>
      <li><b>Booking</b> 2026 and 2027</li>
    </ul>
  </div>

  <div class="sn-wrap">
    ${EST?`<div class="sn-est">
      <span class="k">Your estimate from Prices</span>
      <p id="sn-est-text">${esc(EST)}</p>
      <button type="button" class="sn-copy" id="sn-copy">Copy it for your message</button>
    </div>`:''}
    <div class="sn-slot"><p class="sn-wait">Loading the form…</p></div>
    <p class="sn-fallback">Form not loading? <a href="${SN_FORM}" target="_blank" rel="noopener">Open it in a new tab</a>, or message us on Instagram at <a href="https://instagram.com/chaarbhai" target="_blank" rel="noopener">@chaarbhai</a>.</p>
  </div>
</section>`;

/* ================= ENGINE ================= */
/* one copy of the logo lives in the preloader, everything else points at it */
const LOGO=document.getElementById('logosrc').getAttribute('src');
const isLight=()=>document.documentElement.dataset.theme==='light';
document.getElementById('lfill').src=LOGO;
function paintLogos(){document.querySelectorAll('img[data-logo]').forEach(el=>{
  if(el.getAttribute('src')!==LOGO)el.setAttribute('src',LOGO);});}
paintLogos();
/* the switch: flips the theme, remembers it, and says what it will do next */
const themeSw=document.getElementById('themesw');
function syncThemeUI(){
  const light=isLight();
  themeSw.setAttribute('aria-label',light?'Switch to dark mode':'Switch to light mode');
}
syncThemeUI();
themeSw.addEventListener('click',()=>{
  const root=document.documentElement,light=!isLight();
  if(light)root.dataset.theme='light';else delete root.dataset.theme;
  try{localStorage.setItem('cb-theme',light?'light':'dark')}catch(e){}
  syncThemeUI();
  track('theme_switch',{theme:light?'light':'dark'});
});
/* clicks worth counting: review badges, the hiring email, social links */
document.addEventListener('click',e=>{
  const a=e.target.closest('a');if(!a)return;
  if(a.classList.contains('pb'))track('review_badge_click',{platform:a.classList.contains('pb-g')?'google':'meta'});
  else if(a.href.startsWith('mailto:')&&a.closest('.hire'))track('hiring_email_click');
  else if(/instagram\.com|youtube\.com|tiktok\.com|linkedin\.com/.test(a.href))track('social_click',{network:(a.href.match(/(instagram|youtube|tiktok|linkedin)/)||[])[1]});
});
const main=document.getElementById('main');
let io;
/* analytics: a no-op unless the tag loaded (see <head>) */
const track=(name,params={})=>{if(window.CB_GA)gtag('event',name,params)};
const GA_PATH={'/':'/','/portfolio':'/work','/about':'/about','/services':'/prices','/testimonials':'/reviews','/contact':'/contact'};
const reduceMotion=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
/* resolves once the preloader has fully faded, so the hero reveal is seen */
let preGoneResolve; const preGone=new Promise(r=>preGoneResolve=r);

/* reveal an element, then mark it .done once its longest possible reveal
   (0.9s + 0.3s stagger) is over, which removes the reveal transition */
function reveal(el){
  if(el.classList.contains('show'))return;
  el.classList.add('show');
  setTimeout(()=>el.classList.add('done'),1300);
}
/* the hover fill carries an ink copy of each button's label */
function labelFills(){
  document.querySelectorAll('.btn,.book').forEach(b=>{
    const s=b.querySelector(':scope>span'),i=b.querySelector(':scope>i');
    if(s&&i){i.dataset.l=s.textContent;i.setAttribute('aria-hidden','true')}
  });
}
labelFills();

function observe(){
  if(io)io.disconnect();
  io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;io.unobserve(t);preGone.then(()=>reveal(t))}}),
    {threshold:.11,rootMargin:'0px 0px -5% 0px'});
  document.querySelectorAll('.rv,.rv-img,.rv-l,.hero-arch').forEach(el=>io.observe(el));
}
/* Mouse drag for the photo strips (touch already scrolls natively).
   The strip follows the pointer 1:1. On release, velocity over the last 100ms
   is projected forward with Apple's normal scroll deceleration (0.998/ms),
   limited to two frames either way, and the strip glides to the nearest frame. */
function dragScroll(){
  const DECEL=0.998, project=v=>v*DECEL/(1-DECEL);
  document.querySelectorAll('.seq-strip').forEach(t=>{
    const frames=[...t.querySelectorAll('.frame')]; if(!frames.length)return;
    let down=false,sx=0,sl=0,samples=[],settle=null;
    const release=()=>{clearTimeout(settle);settle=null;t.classList.remove('drag')};
    t.addEventListener('pointerdown',e=>{
      if(e.pointerType!=='mouse'||e.button!==0)return;
      e.preventDefault();
      clearTimeout(settle);settle=null;          // grabbing mid-glide stops it where it is
      t.scrollTo({left:t.scrollLeft,behavior:'auto'});
      down=true;sx=e.clientX;sl=t.scrollLeft;samples=[{x:e.clientX,t:e.timeStamp}];
      t.classList.add('drag');
      t.setPointerCapture(e.pointerId);
    });
    t.addEventListener('pointermove',e=>{
      if(!down)return;
      t.scrollLeft=sl-(e.clientX-sx);
      samples.push({x:e.clientX,t:e.timeStamp});
      while(samples.length>2&&e.timeStamp-samples[0].t>100)samples.shift();
    });
    const up=e=>{
      if(!down)return;
      down=false;
      if(Math.abs(e.clientX-sx)<6){                // a click, not a drag: open that photo larger
        release();t.scrollTo({left:sl,behavior:'auto'});
        const f=document.elementFromPoint(e.clientX,e.clientY);
        if(e.type==='pointerup'&&f&&f.closest('.frame'))lightbox(f.closest('.frame'));
        return;
      }
      const a=samples[0],b=samples[samples.length-1],dt=b.t-a.t;
      const v=dt>0&&e.timeStamp-b.t<60?(b.x-a.x)/dt:0;   // px/ms; a pause before letting go means no fling
      const x0=frames[0].offsetLeft,pos=frames.map(f=>f.offsetLeft-x0);
      const max=t.scrollWidth-t.clientWidth,cur=t.scrollLeft;
      const nearest=x=>pos.reduce((bi,p,i)=>Math.abs(p-x)<Math.abs(pos[bi]-x)?i:bi,0);
      const from=nearest(cur);
      let i=nearest(cur-project(v));
      i=Math.max(0,Math.min(frames.length-1,Math.max(from-2,Math.min(from+2,i))));
      const left=Math.min(pos[i],max);
      if(Math.abs(left-cur)<1){release();return}
      t.scrollTo({left,behavior:reduceMotion()?'auto':'smooth'});
      settle=setTimeout(release,700);             // fallback where scrollend isn't supported
    };
    t.addEventListener('pointerup',up);
    t.addEventListener('pointercancel',up);
    t.addEventListener('scrollend',()=>{if(!down&&settle)release()});
  });
}
/* Larger view. A click on a frame (Enter or Space from the keyboard) opens it
   full screen; the arrows, arrow keys or a swipe step through that strip.
   Mouse clicks come from dragScroll(), which owns the pointer on the strip. */
let LB=null;
function lightbox(frame){
  if(!LB){
    const el=document.createElement('div');
    el.id='lb';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Photo');
    el.innerHTML=`<button class="lb-x" aria-label="Close"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9" fill="none" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/></svg></button>
      <button class="lb-prev" aria-label="Previous photo">${ARROW('l')}</button>
      <figure class="lb-fig"><img alt="" draggable="false"><figcaption><span class="lb-no"></span><span class="lb-cap"></span><span class="lb-t mono"></span></figcaption></figure>
      <button class="lb-next" aria-label="Next photo">${ARROW('r')}</button>`;
    document.body.appendChild(el);
    const img=el.querySelector('img'),q=c=>el.querySelector(c);
    LB={el,img,list:[],i:0,title:'',opener:null};
    LB.show=i=>{
      const L=LB.list; LB.i=i=Math.max(0,Math.min(L.length-1,i));
      const src=L[i].querySelector('.fr-img img');
      img.classList.add('swap');
      const ss=src.dataset.ss||src.srcset,su=src.dataset.u||src.src;   // phones park the full-size set in data-*, see lightenPhotos
      const nxt=new Image(); nxt.sizes='94vw'; nxt.srcset=ss;
      const put=()=>{img.sizes='94vw';img.srcset=ss;img.src=su;img.alt=src.alt;img.classList.remove('swap')};
      nxt.onload=put; nxt.onerror=put; nxt.src=su;
      q('.lb-no').textContent=String(i+1).padStart(2,'0')+' / '+String(L.length).padStart(2,'0');
      q('.lb-cap').textContent=L[i].querySelector('.fr-cap span:last-child').textContent;
      q('.lb-t').textContent=LB.title;
      q('.lb-prev').disabled=i===0; q('.lb-next').disabled=i===L.length-1;
    };
    LB.close=()=>{
      el.classList.remove('on');document.documentElement.classList.remove('lb-open');
      setTimeout(()=>{if(!el.classList.contains('on'))el.hidden=true},reduceMotion()?0:280);
      const f=LB.list[LB.i];                      // leave the strip on the photo last viewed
      if(f)f.closest('.seq-strip').scrollTo({left:f.offsetLeft-f.parentNode.firstElementChild.offsetLeft,behavior:'auto'});
      if(LB.opener)LB.opener.focus({preventScroll:true});
    };
    q('.lb-x').addEventListener('click',LB.close);
    q('.lb-prev').addEventListener('click',()=>LB.show(LB.i-1));
    q('.lb-next').addEventListener('click',()=>LB.show(LB.i+1));
    el.addEventListener('click',e=>{if(e.target===el||e.target.classList.contains('lb-fig'))LB.close()});
    el.addEventListener('keydown',e=>{
      if(e.key==='Escape')LB.close();
      else if(e.key==='ArrowLeft')LB.show(LB.i-1);
      else if(e.key==='ArrowRight')LB.show(LB.i+1);
      else if(e.key==='Tab'){                     // keep focus inside the viewer
        const b=[...el.querySelectorAll('button:not(:disabled)')],k=b.indexOf(document.activeElement);
        e.preventDefault();b[(k+(e.shiftKey?-1:1)+b.length)%b.length].focus();
      }
    });
    let sx=null,sy=0;                             // swipe on touch screens
    q('.lb-fig').addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'){sx=e.clientX;sy=e.clientY}});
    q('.lb-fig').addEventListener('pointerup',e=>{
      if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
      if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy))LB.show(LB.i+(dx<0?1:-1));
    });
  }
  const seq=frame.closest('.seq');
  LB.list=[...seq.querySelectorAll('.frame')];
  LB.title=seq.dataset.label;
  LB.opener=frame.querySelector('.fr-img');
  LB.show(LB.list.indexOf(frame));
  LB.el.hidden=false;document.documentElement.classList.add('lb-open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>LB.el.classList.add('on')));
  LB.el.querySelector('.lb-x').focus({preventScroll:true});
}
document.addEventListener('click',e=>{            // touch taps and keyboard; mouse goes through dragScroll()
  const f=e.target.closest&&e.target.closest('.frame .fr-img');
  if(f&&!(e.pointerType==='mouse'))lightbox(f.closest('.frame'));
});
document.addEventListener('keydown',e=>{
  if((e.key==='Enter'||e.key===' ')&&e.target.matches&&e.target.matches('.frame .fr-img')){e.preventDefault();lightbox(e.target.closest('.frame'))}
});
/* No right-click "Save image" and no dragging photos out. Screenshots can't be stopped. */
document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('img,#lb'))e.preventDefault()});
document.addEventListener('dragstart',e=>{if(e.target.tagName==='IMG')e.preventDefault()});
let seqUpdaters=[];
addEventListener('resize',()=>seqUpdaters.forEach(f=>f()),{passive:true});
function sequences(){
  seqUpdaters=[];
  document.querySelectorAll('.seq').forEach(seq=>{
    const strip=seq.querySelector('.seq-strip'),cnt=seq.querySelector('.seq-count'),
          bar=seq.querySelector('.seq-bar i'),prev=seq.querySelector('.sq-prev'),
          next=seq.querySelector('.sq-next'),frames=[...strip.querySelectorAll('.frame')],
          total=frames.length;
    if(!total)return;
    const step=()=>frames[1]?frames[1].offsetLeft-frames[0].offsetLeft:frames[0].offsetWidth+16;
    const upd=()=>{
      const max=strip.scrollWidth-strip.clientWidth;
      const i=Math.max(1,Math.min(total,Math.round(strip.scrollLeft/step())+1));
      cnt.textContent=String(i).padStart(2,'0')+' / '+String(total).padStart(2,'0');
      bar.style.transform='scaleX('+(max>2?strip.scrollLeft/max:1)+')';
      prev.disabled=strip.scrollLeft<4; next.disabled=strip.scrollLeft>=max-4;
    };
    strip.addEventListener('scroll',upd,{passive:true});
    prev.addEventListener('click',()=>strip.scrollBy({left:-step(),behavior:reduceMotion()?'auto':'smooth'}));
    next.addEventListener('click',()=>strip.scrollBy({left:step(),behavior:reduceMotion()?'auto':'smooth'}));
    seqUpdaters.push(upd); upd();
  });
}
/* Phones (an iPhone 11 Pro has 4 GB) can't hold hundreds of 1280px photos: Safari runs out of memory and kills
   the tab. So on a phone only the photo strips near the screen have a picture at all, and it's the 640px copy.
   Frames that scroll well away go back to a 1px placeholder (the browser cache makes coming back quick).
   The full-size set stays in data-ss / data-u for the lightbox. Desktop and tablets are untouched. */
let lightIO=null;
function lightenPhotos(){
  if(lightIO){lightIO.disconnect();lightIO=null}
  if(!matchMedia('(max-width:700px)').matches)return;
  const imgs=[...document.querySelectorAll('.seq-strip .frame .fr-img img')];
  if(!imgs.length)return;
  const TINY='data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
  imgs.forEach(im=>{
    im.dataset.ss=im.getAttribute('srcset')||'';im.dataset.u=im.getAttribute('src');
    im.removeAttribute('srcset');im.removeAttribute('sizes');im.removeAttribute('loading');im.src=TINY;im.dataset.on='0';
  });
  lightIO=new IntersectionObserver(es=>es.forEach(e=>{
    const im=e.target,on=im.dataset.on==='1';
    if(e.isIntersecting&&!on){im.src=im.dataset.u;im.dataset.on='1'}
    else if(!e.isIntersecting&&on){im.src=TINY;im.dataset.on='0'}
  }),{rootMargin:'500px 350px'});
  imgs.forEach(im=>lightIO.observe(im));
}
let railScroll=null;
function chapterRail(){
  if(railScroll){removeEventListener('scroll',railScroll);railScroll=null}
  const rail=document.querySelector('.rail'); if(!rail)return;
  const secs=[...document.querySelectorAll('.chapter')];
  const btns=[...rail.querySelectorAll('button')];
  let last=null;
  railScroll=()=>{
    let cur=secs[0]&&secs[0].id;
    for(const s of secs) if(s.getBoundingClientRect().top<=innerHeight*.42) cur=s.id;
    if(cur===last)return;                        // only act when the chapter actually changes
    last=cur;
    btns.forEach(b=>b.classList.toggle('on',b.dataset.jump===cur));
    // on phones the rail is a sideways-scrolling bar: bring the active chapter to its centre
    const b=btns.find(b=>b.dataset.jump===cur);
    if(b&&matchMedia('(max-width:900px)').matches)
      rail.scrollTo({left:b.offsetLeft-(rail.clientWidth-b.offsetWidth)/2,behavior:reduceMotion()?'auto':'smooth'});
  };
  addEventListener('scroll',railScroll,{passive:true}); railScroll();
}
/* Prices page: package filter, location switch and the build-your-own
   estimate. Ported from Packages Page v2; runs each time the page renders. */
function pricing(){
    var root = main.querySelector('.pr'); if (!root) { return; }
    // Outside Canada the prices are the same numbers in US dollars (no
    // conversion): only the symbol changes, $3,300 becomes US$3,300.
    var cadFmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', maximumFractionDigits: 0 });
    var usdFmt = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

    var PACKAGES = {};
    PR.forEach(function (p) { PACKAGES[p.id] = p; });
    var PACKAGE_ORDER = PR.map(function (p) { return p.id; });

    var state = { filter: 'both', currency: 'CAD' };

    function money(cad) {
      if (state.currency === 'USD') {
        return usdFmt.format(cad);
      }
      return cadFmt.format(cad);
    }

    function basePrice(pkg) {
      if (state.filter === 'photo') { return pkg.pricePhoto; }
      if (state.filter === 'video') { return pkg.priceVideo; }
      return pkg.priceBoth;
    }

    function coverageWord() {
      if (state.filter === 'photo') { return 'photo'; }
      if (state.filter === 'video') { return 'video'; }
      return 'photo and video';
    }

    var packageRadios = Array.prototype.slice.call(root.querySelectorAll('input[name="package"]'));
    var addonRows = Array.prototype.slice.call(root.querySelectorAll('.addon-row[data-row]'));
    var filterButtons = Array.prototype.slice.call(root.querySelectorAll('[data-filter-btn]'));
    var currencyButtons = Array.prototype.slice.call(root.querySelectorAll('[data-currency-btn]'));
    var hourQtyEl = root.querySelector('#hour-qty');
    var hourIncrement = root.querySelector('#hour-increment');
    var hourDecrement = root.querySelector('#hour-decrement');
    var summaryLines = root.querySelector('#summary-lines');
    var summaryTotalValue = root.querySelector('#summary-total-value');
    var resetBtn = root.querySelector('#reset-btn');
    var builderHeading = root.querySelector('#builder-heading');
    var keepsakeHint = root.querySelector('#keepsake-hint');
    var submitCta = root.querySelector('#submit-cta');
    var heroLede = root.querySelector('#hero-lede');
    var priceBarNote = root.querySelector('#price-bar-note');
    var droneLine = root.querySelector('#drone-status-line');
        var STORAGE_KEY = 'chaarbhaiRequest';

    var HOUR_MAX = 6;
    var hourQty = 0;
    var currentEstimate = { pkg: 'first-light', packageLabel: 'First Light', filter: 'both', currency: 'CAD', hours: 0, lines: [], totalCad: 0 };

    var userChecked = {};
    addonRows.forEach(function (row) {
      var input = row.querySelector('input[type="checkbox"]');
      if (input) { userChecked[input.id] = false; }
    });

    function currentPackage() {
      var checked = packageRadios.filter(function (r) { return r.checked; })[0];
      return checked ? checked.value : packageRadios[0].value;
    }

    function photographerCount(pkg) {
      var count = pkg.photographers;
      var input = root.querySelector('#addon-second-photographer');
      if (input) {
        var includes = (input.dataset.includes || '').split(',').filter(Boolean);
        var included = includes.indexOf(pkg.id) !== -1;
        if (!included && input.checked) { count += 1; }
      }
      return count;
    }

    function videographerCount(pkg) {
      var count = pkg.videographers;
      var input = root.querySelector('#addon-second-videographer');
      if (input) {
        var includes = (input.dataset.includes || '').split(',').filter(Boolean);
        var included = includes.indexOf(pkg.id) !== -1;
        if (!included && input.checked) { count += 1; }
      }
      return count;
    }

    function totalShooters(pkg) {
      var p = photographerCount(pkg);
      var v = videographerCount(pkg);
      if (state.filter === 'photo') { return p; }
      if (state.filter === 'video') { return v; }
      // "Both" prices off the size of a single role's team, not the combined
      // headcount — a solo photographer plus a solo videographer is still a
      // single-shooter-per-role crew, so the bottom two packages price at
      // the single-shooter rate even though two people are on site.
      return Math.max(p, v);
    }

    function crewDescription(pkg) {
      var p = photographerCount(pkg);
      var v = videographerCount(pkg);
      var parts = [];
      if (state.filter !== 'video') { parts.push(p + ' photographer' + (p === 1 ? '' : 's')); }
      if (state.filter !== 'photo') { parts.push(v + ' videographer' + (v === 1 ? '' : 's')); }
      return parts.join(' · ');
    }

    // Base team size for a package, ignoring any builder add-ons — used on
    // the one-by-one package cards, which describe what each package comes
    // with by default, not the currently-configured builder state.
    function baseCrewDescription(pkg) {
      var parts = [];
      if (state.filter !== 'video') { parts.push(pkg.photographers + ' photographer' + (pkg.photographers === 1 ? '' : 's')); }
      if (state.filter !== 'photo') { parts.push(pkg.videographers + ' videographer' + (pkg.videographers === 1 ? '' : 's')); }
      return parts.join(' · ');
    }

    // Set by package, not by crew size: the two shorter packages bill extra
    // hours at $550, the two longer ones at $750.
    var HOUR_RATE = { 'first-light': 550, 'golden-hour': 550, 'till-dusk': 750, 'till-sunrise': 750 };
    function extraHourRate(pkg) {
      return HOUR_RATE[pkg.id];
    }

    function applyServiceVisibility() {
      Array.prototype.slice.call(root.querySelectorAll('[data-service]')).forEach(function (el) {
        var svc = el.getAttribute('data-service');
        var visible = state.filter === 'both' || state.filter === svc;
        el.classList.toggle('is-hidden', !visible);
      });
    }

    function syncToggleButtons() {
      filterButtons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-filter-value') === state.filter);
      });
      currencyButtons.forEach(function (btn) {
        btn.classList.toggle('is-active', btn.getAttribute('data-currency-value') === state.currency);
      });
    }

    function renderStatic() {
      if (heroLede) {
        if (state.filter === 'photo') {
          heroLede.textContent = 'Four packages built around how long your wedding day actually runs. Every one includes a photographer, professional retouching, and a private online gallery.';
        } else if (state.filter === 'video') {
          heroLede.textContent = 'Four packages built around how long your wedding day actually runs. Every one includes a videographer, standard audio and interview setup, and your film delivered through a private download link.';
        } else {
          heroLede.textContent = 'Four packages built around how long your wedding day actually runs. Every one includes a photographer and a videographer, professional retouching, and a private online gallery.';
        }
      }

      if (priceBarNote) {
        priceBarNote.textContent = state.currency === 'USD' ? 'Prices shown in USD for weddings outside Canada' : 'All prices in CAD';
      }

      var internationalNote = root.querySelector('#international-note');
      if (internationalNote) {
        internationalNote.classList.toggle('is-hidden', state.currency !== 'USD');
      }

      PACKAGE_ORDER.forEach(function (id) {
        var pkg = PACKAGES[id];
        var priceValueEl = root.querySelector('#section-' + id + ' .pkg-price .price-value');
        var supEl = root.querySelector('#section-' + id + ' .pkg-price sup');
        if (priceValueEl) { priceValueEl.textContent = money(basePrice(pkg)); }
        if (supEl) { supEl.textContent = state.currency; }

        var coverageLine = root.querySelector('#section-' + id + ' .coverage-line');
        if (coverageLine) { coverageLine.textContent = pkg.hours + ' hours of ' + coverageWord() + ' coverage'; }


        var colPrice = root.querySelector('.compare-grid .col-head[data-pkg="' + id + '"] .col-price');
        if (colPrice) { colPrice.textContent = money(basePrice(pkg)); }
      });

      applyServiceVisibility();
    }

    // Single pass: sets checked/disabled/price-label state on every row,
    // using userChecked as the source of truth, then renders the summary
    // from that same state so the two never disagree.
    function sync() {
      var pkgId = currentPackage();
      var pkg = PACKAGES[pkgId];
      var freeQuota = pkg.freeKeepsakes;
      var freeUsed = 0;

      PACKAGE_ORDER.forEach(function (id) {
        var pillPrice = root.querySelector('.pill[data-pkg="' + id + '"] .pill-price');
        if (pillPrice) { pillPrice.textContent = money(basePrice(PACKAGES[id])); }
      });

      // First pass: correct every row's checked/disabled/included state for
      // the package now selected. totalShooters()/extraHourRate() below read
      // input.checked on the second-photographer/second-videographer rows,
      // so that state has to be settled before we compute the hourly rate —
      // otherwise it reads whatever state the PREVIOUS package left behind.
      addonRows.forEach(function (row) {
        var input = row.querySelector('input[type="checkbox"]');
        var priceEl = row.querySelector('.addon-price');
        if (!input) { return; }

        if (row.dataset.pool === 'keepsake') {
          if (input.id === 'addon-parent-album') {
            var hasBaseAlbum = !!(userChecked['addon-album-standard'] || userChecked['addon-album-premium']);
            if (!hasBaseAlbum) {
              input.disabled = true;
              input.checked = false;
              userChecked[input.id] = false;
              row.classList.remove('is-included');
              priceEl.textContent = 'Pick an album first';
              priceEl.classList.remove('is-included-badge');
              return;
            }
          }
          input.disabled = false;
          input.checked = userChecked[input.id];
          row.classList.remove('is-included');
          if (input.checked) {
            freeUsed += 1;
            if (freeUsed <= freeQuota) {
              row.classList.add('is-included');
              priceEl.textContent = 'Free pick';
              priceEl.classList.add('is-included-badge');
            } else {
              priceEl.textContent = money(Number(input.dataset.price));
              priceEl.classList.remove('is-included-badge');
            }
          } else {
            priceEl.textContent = money(Number(input.dataset.price));
            priceEl.classList.remove('is-included-badge');
          }
          return;
        }

        var includes = (input.dataset.includes || '').split(',').filter(Boolean);
        var isIncluded = includes.indexOf(pkgId) !== -1;

        if (isIncluded) {
          row.classList.add('is-included');
          input.disabled = true;
          input.checked = true;
          priceEl.textContent = 'Included';
          priceEl.classList.add('is-included-badge');
        } else {
          row.classList.remove('is-included');
          input.disabled = false;
          input.checked = userChecked[input.id];
          priceEl.classList.remove('is-included-badge');
          if (input.dataset.rate) {
            priceEl.textContent = money(Number(input.dataset.rate) * (pkg.hours + hourQty));
          } else {
            priceEl.textContent = money(Number(input.dataset.price));
          }
        }
      });

      if (freeQuota === 0) {
        keepsakeHint.textContent = 'No complimentary picks on this package, each album option here is a paid add-on.';
      } else {
        keepsakeHint.textContent = Math.min(freeUsed, freeQuota) + ' of ' + freeQuota + ' complimentary pick' + (freeQuota > 1 ? 's' : '') + ' used.';
      }

      // Second pass: checked/disabled state is now correct for this package,
      // so the shooter count (and the hourly rate it drives) is safe to read.
      var rate = extraHourRate(pkg);
      var hourSub = root.querySelector('#hour-rate-sub');
      if (hourSub) {
        hourSub.textContent = money(rate) + ' per hour on ' + pkg.name;
      }

      if (droneLine) {
        if (videographerCount(pkg) >= 2) {
          droneLine.innerHTML = '<strong>Drone coverage.</strong> Included, since you\'ve added a second videographer.';
        } else {
          droneLine.innerHTML = '<strong>Drone coverage.</strong> Not possible with a single videographer, since they can\'t fly and shoot at the same time. Add a second videographer above and drone coverage comes with it.';
        }
      }

      renderSummary(pkg, rate);
    }

    var prevLabels = null;   // labels shown last time, so only new lines animate
    function renderSummary(pkg, rate) {
      var total = basePrice(pkg);
      var lines = [];

      lines.push({ label: pkg.name + ' package (' + coverageWord() + ')', price: basePrice(pkg), base: true });

      if (hourQty > 0) {
        var hoursCost = hourQty * rate;
        total += hoursCost;
        lines.push({ label: 'Extra hours × ' + hourQty + ' (' + money(rate) + '/hr)', price: hoursCost });
      }

      addonRows.forEach(function (row) {
        var input = row.querySelector('input[type="checkbox"]');
        var nameEl = row.querySelector('.addon-name');
        if (!input || !input.checked) { return; }
        if (row.classList.contains('is-hidden')) { return; }

        if (row.dataset.pool === 'keepsake') {
          var isFree = row.classList.contains('is-included');
          var price = isFree ? 0 : Number(input.dataset.price);
          total += price;
          lines.push({ label: nameEl.textContent + (isFree ? ' (free pick)' : ''), price: price });
          return;
        }

        var includes = (input.dataset.includes || '').split(',').filter(Boolean);
        var isIncluded = includes.indexOf(pkg.id) !== -1;
        if (!isIncluded) {
          var addonPrice = input.dataset.rate ? Number(input.dataset.rate) * (pkg.hours + hourQty) : Number(input.dataset.price);
          total += addonPrice;
          lines.push({ label: nameEl.textContent, price: addonPrice });
        }
      });

      summaryLines.innerHTML = '';
      var seen = prevLabels;
      prevLabels = lines.map(function (line) { return line.label; });
      lines.forEach(function (line) {
        var li = document.createElement('li');
        li.className = 'summary-line' + (line.base ? ' summary-line--base' : '') + (seen && seen.indexOf(line.label) === -1 ? ' new' : '');
        var a = document.createElement('span');
        a.textContent = line.label;
        var b = document.createElement('span');
        b.textContent = money(line.price);
        li.appendChild(a);
        li.appendChild(b);
        summaryLines.appendChild(li);
      });

      summaryTotalValue.textContent = money(total);

      currentEstimate = {
        pkg: pkg.id,
        packageLabel: pkg.name,
        filter: state.filter,
        currency: state.currency,
        hours: hourQty,
        lines: lines.slice(),
        totalCad: total
      };

      persistSelection();
      updateSubmitLink();
    }

    function persistSelection() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentEstimate));
      } catch (e) {
        // Private browsing or storage disabled — the link's query string
        // below still carries the selection through to the contact page.
      }
    }

    // The estimate travels to the contact letter as a sentence, and to Netlify
    // as a hidden "estimate" field, when the visitor follows the button.
    function updateSubmitLink() {
      // "Printed album, standard (free pick)" reads as "printed album (standard, free pick)"
      // so the list of add-ons doesn't dissolve into commas inside the letter.
      var addonLabels = currentEstimate.lines
        .filter(function (line) { return !line.base; })
        .map(function (line) {
          if (/^Extra hours/.test(line.label)) {
            return currentEstimate.hours + ' extra hour' + (currentEstimate.hours === 1 ? '' : 's');
          }
          var label = line.label.replace(/, ([^()]+?)( \(|$)/, ' ($1)$2').replace(') (', ', ');
          return label.charAt(0).toLowerCase() + label.slice(1);
        });
      var text = currentEstimate.packageLabel + ' (' + coverageWord() + ')';
      if (addonLabels.length === 1) { text += ' plus ' + addonLabels[0]; }
      if (addonLabels.length > 1) { text += ' plus ' + addonLabels.slice(0, -1).join(', ') + ' and ' + addonLabels[addonLabels.length - 1]; }
      text += ', about ' + money(currentEstimate.totalCad) + ' ' + currentEstimate.currency;
      submitCta.dataset.est = text;
    }

    function onFilterOrCurrencyChange() {
      syncToggleButtons();
      applyServiceVisibility();
      addonRows.forEach(function (row) {
        if (row.hasAttribute('data-service')) {
          var svc = row.getAttribute('data-service');
          var visible = state.filter === 'both' || state.filter === svc;
          if (!visible) {
            var input = row.querySelector('input[type="checkbox"]');
            if (input) { userChecked[input.id] = false; }
          }
        }
      });
      renderStatic();
      sync();
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.filter = btn.getAttribute('data-filter-value');
        onFilterOrCurrencyChange();
      });
    });

    currencyButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var was = state.currency;
        state.currency = btn.getAttribute('data-currency-value');
        onFilterOrCurrencyChange();
        if (was !== state.currency) {
          root.querySelectorAll('.pkg-price, .compare-grid .col-price, #summary-total-value').forEach(function (el) {
            el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap');
          });
        }
      });
    });

    packageRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        sync();
        track('select_package',{package:radio.value});
      });
    });

    addonRows.forEach(function (row) {
      var input = row.querySelector('input[type="checkbox"]');
      if (!input) { return; }
      input.addEventListener('change', function () {
        if (!input.disabled) {
          userChecked[input.id] = input.checked;
          sync();
        }
      });
    });

    hourIncrement.addEventListener('click', function () {
      if (hourQty < HOUR_MAX) { hourQty += 1; hourQtyEl.textContent = hourQty; sync(); }
    });
    hourDecrement.addEventListener('click', function () {
      if (hourQty > 0) { hourQty -= 1; hourQtyEl.textContent = hourQty; sync(); }
    });

    resetBtn.addEventListener('click', function () {
      packageRadios[0].checked = true;
      addonRows.forEach(function (row) {
        var input = row.querySelector('input[type="checkbox"]');
        if (input) { input.checked = false; userChecked[input.id] = false; }
      });
      hourQty = 0;
      hourQtyEl.textContent = hourQty;
      state.filter = 'both';
      state.currency = 'CAD';
      syncToggleButtons();
      applyServiceVisibility();
      renderStatic();
      sync();
    });

    Array.prototype.slice.call(root.querySelectorAll('[data-goto-pkg]')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var pkg = btn.getAttribute('data-goto-pkg');
        var radio = root.querySelector('#pkg-' + pkg);
        if (radio) {
          radio.checked = true;
          sync();
        }
        builderHeading.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });
      });
    });

    submitCta.addEventListener('click', function () {
      EST = submitCta.dataset.est;
      track('send_estimate',{package:currentEstimate.pkg,service:currentEstimate.filter,value:currentEstimate.totalCad,currency:'CAD'});
    });

    syncToggleButtons();
    renderStatic();
    sync();
}
/* auto sizing inline letter fields */
/* Home reel. Loads YouTube's player API once, builds the player into #reel,
   and fades it in only after it is really playing (a moment later still, so
   YouTube's opening title overlay has gone). Loops by restarting at the end. */
let ytReady=null;
function loadYT(){
  if(ytReady)return ytReady;
  ytReady=new Promise(res=>{
    if(window.YT&&YT.Player)return res();
    const prev=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{if(prev)prev();res()};
    const s=document.createElement('script');s.src='https://www.youtube.com/iframe_api';s.async=true;
    s.onerror=()=>{ytReady=null};document.head.appendChild(s);
  });
  return ytReady;
}
function reel(){
  const el=document.getElementById('reel');
  if(!el||reduceMotion())return;
  // YouTube won't play embeds on a page opened straight from disk (file://):
  // it needs a real web address to check where it's embedded. The poster
  // photo stands in; the reel plays once the site is served (Netlify, or a
  // local server) rather than double-clicked.
  if(location.protocol==='file:'){console.info('Chaar Bhai: the home reel only plays when the site is served over http(s), not opened as a file.');return}
  loadYT().then(()=>{
    if(!document.body.contains(el))return;          // left the home page meanwhile
    let shown=false;
    const p=new YT.Player(el,{
      videoId:REEL,host:'https://www.youtube-nocookie.com',
      playerVars:{autoplay:1,mute:1,controls:0,playsinline:1,rel:0,iv_load_policy:3,disablekb:1,fs:0,modestbranding:1,start:REEL_FROM,end:REEL_TO},
      events:{
        onReady:e=>{const f=e.target.getIframe();f.classList.add('vhero-yt');f.tabIndex=-1;f.setAttribute('aria-hidden','true');
          f.title='Chaar Bhai wedding film reel';e.target.mute();e.target.playVideo();
          // browsers can hold back the first play (a tab still in the background,
          // a slow start), so nudge it a few times, and again when the tab comes
          // into view or the visitor first scrolls or taps
          const nudge=()=>{if(!shown&&document.body.contains(f)&&document.visibilityState==='visible'){e.target.mute();e.target.playVideo()}};
          let tries=0;const t=setInterval(()=>{if(shown||++tries>6||!document.body.contains(f))return clearInterval(t);nudge()},1500);
          const once=()=>{nudge();if(shown){removeEventListener('scroll',once);removeEventListener('pointerdown',once);document.removeEventListener('visibilitychange',once)}};
          addEventListener('scroll',once,{passive:true});addEventListener('pointerdown',once);document.addEventListener('visibilitychange',once);
          // browsers pause video in a background tab; pick it back up on return
          const resume=()=>{if(!document.body.contains(f))return document.removeEventListener('visibilitychange',resume);
            if(document.visibilityState==='visible'&&e.target.getPlayerState()!==YT.PlayerState.PLAYING){e.target.mute();e.target.playVideo()}};
          document.addEventListener('visibilitychange',resume);
          // keep playback inside REEL_FROM..REEL_TO: jump back just before the end
          const loop=setInterval(()=>{if(!document.body.contains(f))return clearInterval(loop);
            const t=e.target.getCurrentTime&&e.target.getCurrentTime();
            if(t>=REEL_TO-.25||(t>0&&t<REEL_FROM-.5))e.target.seekTo(REEL_FROM,true)},250)},
        onStateChange:e=>{
          if(e.data===YT.PlayerState.PLAYING&&!shown){shown=true;setTimeout(()=>{const f=p.getIframe();if(f)f.classList.add('on')},1800)}
          if(e.data===YT.PlayerState.ENDED){e.target.seekTo(REEL_FROM,true);e.target.playVideo()}
        },
        onError:()=>{const f=p.getIframe&&p.getIframe();if(f)f.remove()}   // any player error: keep the poster, never YouTube's error screen
      }
    });
  });
}

/* Studio Ninja's form, loaded once per visit. snLoad() runs as soon as the
   site has settled (or straight away when the visit starts on Contact), so
   by the time someone opens Contact it's usually already there. */
const page=document.getElementById('page'),snHost=document.getElementById('snhost');
let snFrame=null,snH=1363;
function snLoad(){
  if(snFrame)return;
  snFrame=document.createElement('iframe');
  snFrame.id='sn-form-kvczy';snFrame.title='Enquiry form';snFrame.src=SN_FORM;snFrame.allowFullscreen=true;
  snHost.appendChild(snFrame);
  const ready=()=>{snHost.classList.add('ready');document.body.classList.add('sn-ready')};
  setTimeout(ready,10000);                      // never leave it invisible if the resizer can't report
  const s=document.createElement('script');s.src=SN_RESIZER;s.async=true;
  // minHeight: its first report comes before the form has drawn, and says 0.
  // A frame that small gets frozen by the browser and never draws the form.
  s.onload=()=>{if(window.iFrameResize)iFrameResize({log:false,minHeight:320,onResized:e=>{
    const h=+e.height,prev=snH,parked=snHost.classList.contains('parked');
    if(parked&&h<400)return;                    // hidden, it measures as empty: keep the last real height
    snH=h;
    if(h>400)ready();                           // the form has drawn, not just its empty page
    snPlace();
    // the thank-you is much shorter than the form: bring it into view
    if(!parked&&prev-h>300){
      const w=document.querySelector('.sn-wrap');if(w)w.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});
    }
  }},snFrame)};
  document.head.appendChild(s);
}
/* lay the holder over the Contact page's slot, or park it out of sight */
function snPlace(){
  const slot=page.querySelector('.sn-slot');
  if(!slot){
    snHost.classList.add('parked');snHost.setAttribute('aria-hidden','true');snHost.inert=true;
    snHost.style.top=snHost.style.left=snHost.style.width='';return}
  slot.style.height=snH+'px';
  const m=main.getBoundingClientRect(),r=slot.getBoundingClientRect();
  snHost.style.top=(r.top-m.top)+'px';snHost.style.left=(r.left-m.left)+'px';snHost.style.width=r.width+'px';
  if(snHost.classList.contains('parked')&&snFrame){
    // hidden, the resizer shrank it to nothing: restore the last real height
    // at once, then have it measure again
    snFrame.style.height=snH+'px';
    if(snFrame.iFrameResizer)snFrame.iFrameResizer.resize();
  }
  snHost.classList.remove('parked');snHost.removeAttribute('aria-hidden');snHost.inert=false;
}
new ResizeObserver(()=>snPlace()).observe(page);
{
  const start=()=>preGone.then(()=>window.requestIdleCallback?requestIdleCallback(snLoad,{timeout:2000}):setTimeout(snLoad,500));
  if(document.readyState==='complete')start();else addEventListener('load',start);
}
function letterForm(){
  if(page.querySelector('.sn-slot'))snLoad();
  snPlace();
  const cp=document.getElementById('sn-copy');
  if(cp)cp.addEventListener('click',async()=>{
    const t=`We’ve been looking at ${EST}.`;
    try{await navigator.clipboard.writeText(t);cp.textContent='Copied. Paste it into your message'}
    catch(e){const r=document.createRange();r.selectNodeContents(document.getElementById('sn-est-text'));
      const sel=getSelection();sel.removeAllRanges();sel.addRange(r);cp.textContent='Selected. Copy and paste it'}
    track('copy_estimate');
  });
}

const TITLES={'/':'Chaar Bhai · Wedding Photography and Film','/portfolio':'Work · Chaar Bhai',
  '/about':'About · Chaar Bhai','/services':'Prices · Chaar Bhai','/testimonials':'Reviews · Chaar Bhai','/contact':'Contact · Chaar Bhai'};
/* a chapter picked on Home: Work opens scrolled to it (set by data-then) */
let jumpAfter=null;
function render(path){
  VF.close();
  document.querySelectorAll('body>.rail').forEach(r=>r.remove());
  page.innerHTML=(P[path]||P['/'])();
  const rail=main.querySelector('.rail');
  if(rail){rail.classList.add('out');document.body.appendChild(rail)}
  document.querySelectorAll('nav.links a[data-nav]').forEach(a=>{
    const cur=a.getAttribute('href')==='#'+path;
    a.classList.toggle('on',cur&&!a.classList.contains('book'));
    if(cur)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
  });
  document.title=TITLES[path]||TITLES['/'];
  const gp=GA_PATH[path]||'/';
  track('page_view',{page_title:document.title,page_location:location.origin+gp,page_path:gp});
  scrollTo({top:0,behavior:'instant'});
  const then=jumpAfter&&document.getElementById(jumpAfter);jumpAfter=null;
  if(then)then.scrollIntoView({behavior:'instant',block:'start'});
  observe();dragScroll();sequences();lightenPhotos();chapterRail();letterForm();pricing();reel();
  paintLogos();labelFills();
  if(path==='/portfolio')workSync();
  preGone.then(()=>requestAnimationFrame(()=>document.querySelectorAll('.hero .rv,.hero .rv-l,.hero .rv-img,.hero-arch,section:first-of-type .rv,section:first-of-type .rv-l')
    .forEach(reveal)));
}

/* Directional page transition. ORDER is the nav bar's left-to-right order.
   The old page just fades out; the new one slides in from the right when the
   destination sits further right in the nav, and from the left otherwise, so
   the motion always agrees with where the page lives.
   afterTransition resolves once #main's opacity transition genuinely finishes
   (falling back to a timeout only if transitionend never fires, e.g. a
   backgrounded tab) instead of a guessed setTimeout. */
const ORDER=['/','/portfolio','/about','/services','/testimonials','/contact'];
let routing=false,pendingPath=null,currentPath=null,hidden=false,wake=null;
function afterTransition(el,fallbackMs){
  return new Promise(resolve=>{
    let done=false;
    const finish=()=>{if(done)return;done=true;el.removeEventListener('transitionend',onEnd);resolve()};
    const onEnd=e=>{if(e.target===el&&e.propertyName==='opacity')finish()};
    el.addEventListener('transitionend',onEnd);
    setTimeout(finish,fallbackMs);
  });
}
/* A click during a page's enter cuts it short (the leave transition picks up
   from wherever opacity is), and a click during a leave skips rendering the
   page that was abandoned: #main just stays hidden and moves on. */
async function go(){
  pendingPath=routeOf(location.hash);
  if(routing){if(wake)wake();return}
  routing=true;
  while(pendingPath!==currentPath){
    const target=pendingPath;
    const goingRight=ORDER.indexOf(target)>=ORDER.indexOf(currentPath);
    if(currentPath!==null&&!hidden){
      main.classList.add(goingRight?'leave-l':'leave-r');
      document.querySelectorAll('body>.rail').forEach(r=>r.classList.add('out'));
      await afterTransition(main,300);
      hidden=true;
    }
    if(pendingPath!==target)continue;
    main.classList.remove('leave-l','leave-r');
    hidden=false;
    const navigated=currentPath!==null;
    render(target);
    currentPath=target;
    if(navigated){                              // after an in-site link, put focus on the new page's heading
      const h=main.querySelector('h1'); if(h){h.tabIndex=-1;h.focus({preventScroll:true})}
    }
    main.classList.add(goingRight?'enter-r':'enter-l');
    main.offsetHeight;                          // forces style, so the off-screen start is committed before it's removed
    main.classList.remove('enter-l','enter-r');
    document.querySelectorAll('body>.rail').forEach(r=>r.classList.remove('out'));
    await Promise.race([afterTransition(main,500),new Promise(r=>wake=r)]);
    wake=null;
  }
  if(hidden){                                   // navigated back to the page that was leaving
    main.classList.remove('leave-l','leave-r');
    document.querySelectorAll('body>.rail').forEach(r=>r.classList.remove('out'));
    hidden=false;
  }
  routing=false;
}
/* Work has two views on one page: #/portfolio (Photos) and #/portfolio/videos[/ID] (Videos).
   routeOf gives the page a hash belongs to, so switching view doesn't redraw or animate the page. */
function routeOf(h){const p=(h||'#/').slice(1);return p==='/portfolio'||p.indexOf('/portfolio/')===0?'/portfolio':p}
function workSync(){
  const m=/^\/portfolio\/videos(?:\/([\w-]+))?\/?$/.exec(location.hash.slice(1));
  if(!m){VF.close({focus:true});return}
  preGone.then(()=>{                              // not behind the loading screen
    const m2=/^\/portfolio\/videos(?:\/([\w-]+))?\/?$/.exec(location.hash.slice(1));
    if(m2)VF.open(m2[1]);
  });
}
/* a link like ?view=videos&v=ID opens the same place */
(function(){
  const q=new URLSearchParams(location.search);
  if(q.get('view')!=='videos'||routeOf(location.hash)==='/portfolio')return;
  const v=q.get('v');q.delete('view');q.delete('v');const rest=q.toString();
  try{history.replaceState(null,'',location.pathname+(rest?'?'+rest:'')+'#/portfolio/videos'+(v&&/^[\w-]{6,20}$/.test(v)?'/'+v:''))}catch(e){}
})();
addEventListener('hashchange',go);
addEventListener('hashchange',()=>{
  if(routeOf(location.hash)!=='/portfolio')VF.pauseAll();          // leaving Work: silence it now, the page swap follows
  else if(currentPath==='/portfolio')workSync();
});
document.addEventListener('click',e=>{
  const j=e.target.closest('[data-jump]');
  if(j){const t=document.getElementById(j.dataset.jump);
    if(t)t.scrollIntoView({behavior:reduceMotion()?'auto':'smooth',block:'start'});return}
  const nt=e.target.closest('[data-nav-to]');
  if(nt){jumpAfter=nt.dataset.then||null;location.hash=nt.dataset.navTo;return}
  if(!e.target.closest('a[data-nav]'))return;
  setMenu(false);
});

const burger=document.getElementById('burger'),navlinks=document.getElementById('navlinks');
const setMenu=o=>{navlinks.classList.toggle('open',o);burger.classList.toggle('x',o);
  burger.setAttribute('aria-expanded',o);document.body.classList.toggle('locked',o)};
burger.addEventListener('click',()=>setMenu(!navlinks.classList.contains('open')));
addEventListener('keydown',e=>{if(e.key==='Escape'&&navlinks.classList.contains('open')){setMenu(false);burger.focus()}});
document.getElementById('skip').addEventListener('click',()=>{
  const h=main.querySelector('h1'); if(h){h.tabIndex=-1;h.focus()}});

let ly=0;
addEventListener('scroll',()=>{const y=scrollY,h=document.getElementById('hdr');
  h.classList.toggle('solid',y>36);
  if(Math.abs(y-ly)<8)return;                  // trackpad and momentum jitter shouldn't flick the header in and out
  h.classList.toggle('hide',y>ly&&y>330&&!navlinks.classList.contains('open')&&!document.body.classList.contains('vf-in'));ly=y;},{passive:true});

/* ================= PRELOADER =================
   Genuinely waits for every image the site uses, plus fonts.
   The logo draws in proportion to real progress. Never hangs:
   errors count as done and a hard timeout releases the page.       */
(function(){
  const pre=document.getElementById('pre'),
        track=document.getElementById('ptrack'),
        fill=document.getElementById('lfill');

  if(document.documentElement.classList.contains('seen')){   // already played in this tab
    document.body.classList.remove('locked');
    go();
    preGoneResolve();
    return;
  }

  const TOTAL=2;                     // the home photo, plus the webfonts; the rest load as they come into view
  let done=0, real=0, shown=0, finished=false;
  const t0=performance.now();
  let last=t0;
  const MIN_MS=600, MAX_MS=12000;    // let the mark draw, but never trap anyone

  const tick=()=>{ done++; real=Math.min(done/TOTAL,1); };

  {
    const im=new Image(), f=PICKS.hero;
    im.onload=tick; im.onerror=tick;   // a missing file must not stall the site
    im.sizes='100vw'; im.srcset=f.ws.map(w=>`${f.src}-${w}.webp ${w}w`).join(', ');   // the same copy the page will use
    im.src=`${f.src}-${f.ws[0]}.webp`;
  }
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(tick,tick);

  function paint(p){
    // the logo fills in from the bottom as the site loads
    fill.style.clipPath=`inset(${(1-p)*100}% 0 0 0)`;
    track.style.transform=`scaleX(${p})`;
  }

  (function frame(){
    const now=performance.now(), elapsed=now-t0, dt=now-last; last=now;
    if(elapsed>MAX_MS) real=1;                 // safety release
    shown+=(real-shown)*(1-Math.pow(.91,dt/16.7)); // ease toward the true figure, same speed at any refresh rate
    if(real>=1&&shown>0.995) shown=1;
    paint(shown);
    if(!finished&&shown>=1&&elapsed>MIN_MS){
      finished=true;
      try{sessionStorage.setItem('cb-loaded','1')}catch(e){}
      pre.classList.add('gone');
      document.body.classList.remove('locked');
      go();
      afterTransition(pre,600).then(preGoneResolve);
      return;
    }
    requestAnimationFrame(frame);
  })();
})();
