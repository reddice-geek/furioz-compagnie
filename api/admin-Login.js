<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Admin - Furioz Compagnie</title>
<meta name="robots" content="noindex, nofollow">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box} body{margin:0; font-family:Inter,system-ui,sans-serif; background:#F8FAFC; color:#0F172A}
.login-wrap{min-height:100vh; display:grid; place-items:center; padding:1rem}
.card{background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:1.5rem; box-shadow:0 1px 3px rgba(0,0,0,.05); width:min(380px,92vw)}
.card h1{margin:0 0 .2rem; font-size:1.2rem} .muted{color:#64748B; font-size:.85rem}
input{width:100%; padding:.6rem .8rem; border:1px solid #CBD5E1; border-radius:10px; font-size:.9rem; margin-top:.4rem}
.btn{border:0; border-radius:10px; padding:.6rem 1rem; font-weight:600; cursor:pointer; font-size:.9rem; background:#0F172A; color:#fff; width:100%; margin-top:.8rem}
.btn:hover{background:#1E293B}
.header{height:56px; background:#fff; border-bottom:1px solid #E2E8F0; display:flex; align-items:center; justify-content:space-between; padding:0 1.2rem; position:sticky; top:0; z-index:10}
.stats{display:grid; grid-template-columns:repeat(3,1fr); gap:.8rem; margin:1rem 0}
.stat{background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:1rem}
.stat b{font-size:1.4rem; display:block}
.tabs{display:flex; gap:.4rem; margin:1rem 0; flex-wrap:wrap}
.tab{padding:.4rem .8rem; border-radius:999px; border:1px solid #E2E8F0; background:#fff; cursor:pointer; font-weight:600; font-size:.8rem}
.tab.active{background:#0F172A; color:#fff; border-color:#0F172A}
.table-wrap{background:#fff; border:1px solid #E2E8F0; border-radius:12px; overflow:hidden}
table{width:100%; border-collapse:collapse; font-size:.8rem} th{text-align:left; padding:.6rem; background:#F8FAFC; border-bottom:1px solid #E2E8F0; font-size:.7rem; text-transform:uppercase; letter-spacing:.05em} td{padding:.6rem; border-bottom:1px solid #F1F5F9; vertical-align:top}
.badge{display:inline-flex; padding:.15rem .4rem; border-radius:999px; font-size:.65rem; font-weight:700}
.badge-red{background:#FEE2E2; color:#991B1B} .badge-blue{background:#DBEAFE; color:#1E40AF} .badge-green{background:#DCFCE7; color:#166534}
@media(max-width:900px){.stats{grid-template-columns:1fr 1fr}}
</style>
<link rel="stylesheet" href="css/style.css">







<style id="main-nav-final-fix">
/* Correctif définitif du vrai menu #main-nav */
#main-nav{
  display:flex !important;
  align-items:center !important;
  justify-content:space-between !important;
  flex-wrap:nowrap !important;
  gap:18px !important;
}

#main-nav .brand{
  flex:0 0 auto !important;
  white-space:nowrap !important;
}

#main-nav .links{
  display:flex !important;
  align-items:center !important;
  justify-content:flex-end !important;
  flex-wrap:nowrap !important;
  gap:.3rem !important;
  min-width:0 !important;
}

#main-nav .links a{
  flex:0 0 auto !important;
  white-space:nowrap !important;
  word-break:keep-all !important;
  overflow-wrap:normal !important;
  writing-mode:horizontal-tb !important;
  width:auto !important;
  min-width:auto !important;
  max-width:none !important;
  margin-top:0 !important;
  line-height:1.2 !important;
}

/* Le CSS du formulaire Admin mettait .btn à width:100%.
   On l'annule uniquement dans le menu. */
#main-nav .links .btn,
#main-nav .links .btn-discord{
  width:auto !important;
  min-width:auto !important;
  display:inline-flex !important;
  padding:.6rem 1.1rem !important;
  margin:0 !important;
}

@media(max-width:1100px) and (min-width:901px){
  #main-nav{padding-left:2vw !important;padding-right:2vw !important;gap:10px !important}
  #main-nav .links{gap:.12rem !important}
  #main-nav .links a{padding:.4rem .55rem !important;font-size:.8rem !important}
  #main-nav .brand strong{font-size:.9rem !important}
}

@media(max-width:900px){
  /* Conserver le comportement mobile existant du site */
  #main-nav .links a:not(.btn){display:none !important}
}
</style>

</head>
<body>
<nav id="main-nav">
  <a href="index.html#accueil" class="brand" id="logo-link">
    <img src="img/furioz-logo.png" alt="Furioz">
    <strong>FURIOZ COMPAGNIE</strong>
  </a>
  <div class="links">
    <a href="index.html#accueil" class="">Accueil</a>
    <a href="index.html#qui">Le projet</a>
    <a href="index.html#team">Équipe</a>
    <a href="index.html#rejoindre">Rejoindre</a>
    <a href="livre-dor.html">Livre d’or</a>
          <a href="admin.html" class="nav-link admin-link active">Admin</a>
      <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord">Discord</a>
  </div>
</nav>



<div id="login" class="login-wrap">
  <div class="card">
    <h1>Panel Admin</h1><p class="muted">Furioz-Compagnie • Accès sécurisé</p>
    <div style="margin-top:1rem"><label style="font-size:.8rem;font-weight:600">Utilisateur</label><input id="user"></div>
    <div style="margin-top:.6rem"><label style="font-size:.8rem;font-weight:600">Mot de passe</label><input id="pass" type="password"></div>
    <button class="btn" id="loginBtn">Se connecter</button>
    <div id="loginMsg" style="margin-top:.6rem; font-size:.8rem"></div>
    
  </div>
</div>
<div id="dash" style="display:none">
  <div class="header">
    <div style="display:flex; align-items:center; gap:.6rem"><strong>Panel Admin</strong><span style="font-size:.75rem; background:#F1F5F9; padding:.2rem .5rem; border-radius:999px" id="userInfo"></span><span style="font-size:.7rem; color:#64748B" id="serverTime"></span></div>
    <div style="display:flex; gap:.5rem"><a href="index.html" style="text-decoration:none; font-size:.8rem; padding:.4rem .7rem; border:1px solid #E2E8F0; border-radius:999px; background:#fff; color:#0F172A">Retour site</a><button id="logout" style="font-size:.8rem; padding:.4rem .7rem; border:1px solid #E2E8F0; border-radius:999px; background:#fff; cursor:pointer">Déconnexion</button></div>
  </div>
  <div style="width:min(1100px,94vw); margin:0 auto; padding:1rem 0 3rem">
    <div class="stats" id="stats"></div>
    <div style="display:flex; gap:.5rem; margin-bottom:.5rem"><button class="btn" style="width:auto" id="refresh">Rafraîchir</button></div>
    <div class="tabs"><div class="tab active" data-t="visits">Visites</div><div class="tab" data-t="intrusions">Intrusions (hackers)</div><div class="tab" data-t="guestbook">Livre d'or</div><div class="tab" data-t="countries">Pays</div></div>
    <div id="content"></div>
  </div>
</div>
<script>
const API_LOGIN='/api/admin-login', API_STATS='/api/admin-stats', API_GB='/api/guestbook';
let token=localStorage.getItem('furioz_token');
function showLogin(){ document.getElementById('login').style.display='grid'; document.getElementById('dash').style.display='none'; }
function showDash(){ document.getElementById('login').style.display='none'; document.getElementById('dash').style.display='block'; loadStats(); }
if(token) showDash(); else showLogin();

document.getElementById('loginBtn').onclick=async()=>{
  const user=document.getElementById('user').value, pass=document.getElementById('pass').value;
  const msg=document.getElementById('loginMsg');
  msg.textContent='Connexion...';
  try{
    const r=await fetch(API_LOGIN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:user,password:pass})});
    const j=await r.json();
    if(!r.ok){ msg.textContent=j.error||'Erreur'; msg.style.color='red'; return; }
    token=j.token; localStorage.setItem('furioz_token',token); localStorage.setItem('furioz_user',j.user);
    showDash();
  }catch{ msg.textContent='Erreur réseau'; }
};
document.getElementById('logout').onclick=()=>{ localStorage.removeItem('furioz_token'); token=null; showLogin(); };

let currentTab='visits', cache=null;
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{ document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active')); t.classList.add('active'); currentTab=t.dataset.t; render(); });
document.getElementById('refresh').onclick=loadStats;

async function loadStats(){
  try{
    const r=await fetch(API_STATS,{headers:{Authorization:`Bearer ${token}`}});
    if(r.status===401){ localStorage.removeItem('furioz_token'); showLogin(); return; }
    const data=await r.json();
    cache=data;
    document.getElementById('userInfo').textContent=localStorage.getItem('furioz_user')||'admin';
    document.getElementById('serverTime').textContent=new Date(data.serverTime).toLocaleString('fr-FR');
    document.getElementById('stats').innerHTML=`
      <div class="stat"><span class="muted" style="font-size:.7rem">TOTAL VISITES</span><b>${data.stats.totalVisits}</b><span class="muted" style="font-size:.7rem">Logs en mémoire (max 1000)</span></div>
      <div class="stat"><span class="muted" style="font-size:.7rem">VISITES 24H</span><b>${data.stats.visits24h}</b></div>
      <div class="stat"><span class="muted" style="font-size:.7rem">VISITEURS UNIQUES</span><b>${data.stats.uniqueVisitors}</b></div>
      <div class="stat"><span class="muted" style="font-size:.7rem">INTRUSIONS TOTAL</span><b style="color:#DC2626">${data.stats.totalIntrusions}</b></div>
      <div class="stat"><span class="muted" style="font-size:.7rem">BLOQUÉS (IP)</span><b>${data.stats.blockedIPs}</b></div>
      <div class="stat"><span class="muted" style="font-size:.7rem">INTRUSIONS 24H</span><b style="color:#DC2626">${data.stats.intrusionLast24h}</b></div>
    `;
    render();
  }catch(e){ console.error(e); }
}
function render(){
  if(!cache) return;
  const c=document.getElementById('content');
  if(currentTab==='visits'){
    c.innerHTML=`<div class="table-wrap"><table><tr><th>Heure</th><th>IP</th><th>Pays</th><th>Page</th><th>UA</th></tr>${cache.recentVisits.map(v=>`<tr><td>${new Date(v.time).toLocaleString('fr-FR')}</td><td>${v.ip.substring(0,12)}...</td><td>${v.country} ${v.city||''}</td><td style="max-width:180px; overflow:hidden; text-overflow:ellipsis">${(v.page||'').substring(0,60)}</td><td style="max-width:150px; overflow:hidden; text-overflow:ellipsis">${v.ua.substring(0,50)}</td></tr>`).join('')}</table></div>`;
  }else if(currentTab==='intrusions'){
    c.innerHTML=`<div class="table-wrap"><table><tr><th>Heure</th><th>IP</th><th>Type</th><th>Détails</th></tr>${cache.recentIntrusions.map(i=>`<tr><td>${new Date(i.time).toLocaleString('fr-FR')}</td><td>${i.ip}</td><td><span class="badge badge-red">${i.type}</span></td><td style="max-width:280px; word-break:break-all">${i.details}</td></tr>`).join('')}</table></div>`;
  }else if(currentTab==='guestbook'){
    c.innerHTML=`<div style="display:grid; gap:.6rem" id="gbList">Chargement...</div>`;
    fetch(API_GB).then(r=>r.json()).then(list=>{
      document.getElementById('gbList').innerHTML=list.map(g=>`
        <div style="background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:.9rem; display:flex; justify-content:space-between; gap:.8rem">
          <div><strong>${g.name}</strong> <span class="badge ${g.verified?'badge-green':'badge-blue'}">${g.verified?'vérifié':'en attente'}</span> ${'⭐'.repeat(g.rating)} • ${g.date}<br><span style="font-size:.85rem; color:#334155">${g.message.replace(/</g,'&lt;')}</span></div>
          <button onclick="del('${g.id}')" style="height:fit-content; padding:.3rem .6rem; border-radius:8px; border:1px solid #FECACA; background:#FEF2F2; color:#991B1B; cursor:pointer; font-weight:600">Supprimer</button>
        </div>
      `).join('');
    });
  }else if(currentTab==='countries'){
    c.innerHTML=`<div class="table-wrap"><table><tr><th>Pays</th><th>Visites</th></tr>${cache.topCountries.map(([k,v])=>`<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></div>`;
  }
}
async function del(id){
  if(!confirm('Supprimer cet avis ?')) return;
  const r=await fetch(`${API_GB}?id=${id}`,{method:'DELETE', headers:{Authorization:`Bearer ${token}`}});
  if(r.ok){ loadStats(); render(); } else alert('Erreur suppression');
}
</script>
</body>
</html>
