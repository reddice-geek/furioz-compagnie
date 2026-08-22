// Furioz Shield Anti-DDoS + XSS + Bot
(function(){
  const API='/api/security-alert';
  const RATE={};
  const limit=(t,ms=60000)=>{ const n=Date.now(); if(!RATE[t]||n-RATE[t]>ms){ RATE[t]=n; return true } return false };
  async function send(type,details){ if(!limit(type)) return; try{ await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({type,details,page:location.href}),keepalive:true}); }catch{} }
  try{
    const p=location.search+location.hash;
    const pat=[/<script/i,/javascript:/i,/onerror=/i,/onload=/i,/eval\(/i,/union.*select/i];
    pat.forEach(r=>{ if(r.test(p)) send('xss_attempt',`${r} in ${p.substring(0,200)}`) });
  }catch{}
  let open=false;
  setInterval(()=>{ const w=window.outerWidth-window.innerWidth>160, h=window.outerHeight-window.innerHeight>160; if((w||h)&&!open){ open=true; send('devtools_open',`outer ${window.outerWidth}x${window.outerHeight}`); setTimeout(()=>{ if(window.outerWidth-window.innerWidth>160) send('devtools_persistent','>10s') },10000); } },2000);
  let clicks=0; document.addEventListener('click',e=>{ if(e.target.closest('.team-card[data-id]')){ clicks++; if(clicks>25){ send('rate_limit','25+ clicks'); clicks=0 } setTimeout(()=>clicks=Math.max(0,clicks-1),3000) } });
  let reloads=parseInt(sessionStorage.getItem('frz_reloads')||'0')+1; sessionStorage.setItem('frz_reloads',reloads); if(reloads>10) send('ddos_suspect',`10+ reloads`);
  console.log('%c🛡️ Furioz Shield Anti-DDoS actif','color:#0066FF;font-weight:bold');
})();
