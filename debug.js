/* Phone diagnostics. Only loaded when the address has ?debug (see index.html); visitors never get it.
   Shows errors and a memory estimate on screen, and if the last visit died without a clean exit
   (Safari's "a problem repeatedly occurred"), shows what that visit was doing at the end. */
(function(){
  var K='cbdbg',A='cbdbg_alive',log=[],t0=Date.now(),wasDead=false,prev=[];
  try{prev=JSON.parse(localStorage.getItem(K)||'[]');wasDead=localStorage.getItem(A)==='1'}catch(e){}
  function save(){try{localStorage.setItem(K,JSON.stringify(log.slice(-120)))}catch(e){}}
  function alive(v){try{localStorage.setItem(A,v?'1':'0')}catch(e){}}
  alive(true);
  addEventListener('pagehide',function(){alive(false)});
  document.addEventListener('visibilitychange',function(){alive(!document.hidden);add('visibility '+(document.hidden?'hidden':'visible'))});

  var box,pre;
  function ui(){
    if(box||!document.body)return;
    box=document.createElement('div');
    box.style.cssText='position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:rgba(0,0,0,.88);color:#9f9;font:10px/1.35 monospace;padding:6px;max-height:42vh;overflow:auto;-webkit-overflow-scrolling:touch';
    var bar=document.createElement('div');bar.style.cssText='display:flex;gap:8px;margin-bottom:4px';
    ['copy','clear','hide'].forEach(function(n){
      var b=document.createElement('button');b.textContent=n;b.style.cssText='font:11px monospace;padding:3px 10px;color:#000;background:#9f9;border:0;border-radius:3px';
      b.onclick=function(){
        if(n==='hide'){box.style.display='none'}
        else if(n==='clear'){log=[];save();render()}
        else{try{navigator.clipboard.writeText(txt())}catch(e){var r=document.createRange();r.selectNodeContents(pre);var s=getSelection();s.removeAllRanges();s.addRange(r)}}
      };bar.appendChild(b);
    });
    pre=document.createElement('pre');pre.style.cssText='margin:0;white-space:pre-wrap;word-break:break-all';
    box.appendChild(bar);box.appendChild(pre);document.body.appendChild(box);render();
  }
  function txt(){
    var o='UA '+navigator.userAgent+'\nscreen '+screen.width+'x'+screen.height+' dpr '+devicePixelRatio+'\n';
    if(wasDead)o+='\n!! THE PREVIOUS VISIT DID NOT EXIT CLEANLY. Its last lines:\n'+prev.slice(-40).join('\n')+'\n!! end of previous visit\n\n';
    return o+log.slice(-60).join('\n');
  }
  function render(){if(pre){pre.textContent=txt();box.scrollTop=box.scrollHeight}}
  function add(m){log.push(((Date.now()-t0)/1000).toFixed(1)+'s '+m);if(log.length>200)log.shift();save();render()}
  window.cbLog=add;
  addEventListener('error',function(e){add('ERROR '+e.message+' @'+String(e.filename||'').split('/').pop()+':'+e.lineno)});
  addEventListener('unhandledrejection',function(e){add('REJECTION '+(e.reason&&e.reason.message||e.reason))});
  ['error','warn'].forEach(function(n){var o=console[n];console[n]=function(){try{add('console.'+n+' '+[].slice.call(arguments).join(' ').slice(0,160))}catch(e){}return o.apply(console,arguments)}});
  add('debug on, hash '+location.hash);

  // every 2s: how many pictures are really loaded, and roughly how much memory they take once decoded
  setInterval(function(){
    var n=0,px=0;
    [].forEach.call(document.images,function(i){
      if(i.complete&&i.naturalWidth>1&&i.currentSrc&&i.currentSrc.indexOf('data:')!==0){n++;px+=i.naturalWidth*i.naturalHeight}
    });
    add('imgs '+n+' ~'+Math.round(px*4/1048576)+'MB decoded, iframes '+document.querySelectorAll('iframe').length+', scrollY '+Math.round(scrollY)+', hash '+location.hash.slice(0,34));
  },2000);
  if(document.body)ui();else document.addEventListener('DOMContentLoaded',ui);
})();
