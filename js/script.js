// Furioz Compagnie
let members = {};

function escapeHTML(v){
  return String(v ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'","&#039;");
}
function formatDateFR(iso, yearOnly=false){
  if(!iso) return '';
  const d=new Date(`${iso}T12:00:00`);
  if(Number.isNaN(d.getTime())) return iso;
  if(yearOnly) return String(d.getFullYear());
  return d.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'});
}
function formatDateLongFR(iso){
  if(!iso) return '';
  const d=new Date(`${iso}T12:00:00`);
  if(Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'});
}
async function loadTeam(){
  const grid=document.getElementById('team-grid');
  if(!grid) return;
  try{
    const r=await fetch('/api/team',{cache:'no-store'});
    const list=await r.json();
    if(!r.ok || !Array.isArray(list)) throw new Error('Equipe indisponible');
    members=Object.fromEntries(list.map(m=>[m.id,m]));
    const visible=list.filter(m=>m.visible!==false);
    const max=10;
    const free=Math.max(0,max-visible.length);
    const kicker=document.getElementById('team-kicker');
    if(kicker) kicker.textContent=`Stream Team [FZ] • ${max} places max • ${visible.length} membre${visible.length>1?'s':''}`;
    grid.innerHTML=visible.map(m=>`
      <div class="team-card ${m.status==='FONDATEUR'?'founder':''}" data-id="${escapeHTML(m.id)}">
        <div class="avatar" style="background:${escapeHTML(m.color||'#151519')}">${escapeHTML(m.initial||m.name?.charAt(0)||'?')}</div>
        <h4 style="margin:.4rem 0 0">${escapeHTML(m.name)}</h4>
        <small class="badge">Depuis ${escapeHTML(formatDateLongFR(m.joined))}${m.role?' • '+escapeHTML(m.role):''}${m.category?' • '+escapeHTML(m.category):''}${m.country?' • '+escapeHTML(m.countryFlag||'')+' '+escapeHTML(m.country):''}</small>
      </div>`).join('') +
      Array.from({length:free},(_,i)=>`<div class="team-card empty"><h4>Place libre</h4><small>${i===0?free+' place'+(free>1?'s':'')+' restante'+(free>1?'s':''):'Rejoins-nous'}</small>${i===0?'<br><a href="https://forms.gle/7hA9ac26qJn7AHjc6" target="_blank" style="color:var(--blue);font-weight:600">Postuler</a>':''}</div>`).join('');
  }catch(e){
    console.error(e);
    grid.innerHTML='<div class="team-card empty"><h4>Équipe indisponible</h4><small>Réessaie plus tard</small></div>';
  }
}

function initTwitch(){
  const player=document.getElementById('twitch-player');
  const chat=document.getElementById('twitch-chat');
  const badge=document.getElementById('live-badge');
  if(!player) return;
  const channel='furiozcompagnie';
  const domain=window.location.hostname||'localhost';
  const parents=`&parent=localhost&parent=${domain}&parent=vercel.app&parent=www.furiozcompagnie.fr&parent=furioz.fr`;
  player.src=`https://player.twitch.tv/?channel=${channel}${parents}&muted=true`;
  if(chat) chat.src=`https://www.twitch.tv/embed/${channel}/chat?darkpopout${parents}`;
  if(badge){badge.textContent='OFFLINE - Player charge';badge.className='live-badge offline';}
}
function initNav(){
  const nav=document.getElementById('main-nav');
  const links=document.querySelectorAll("nav .links a[href^='#']");
  const logo=document.getElementById('logo-link');
  if(!nav) return;
  window.addEventListener('scroll',()=>{
    if(window.scrollY>20) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    let current='';
    document.querySelectorAll('section[id]').forEach(sec=>{if(window.scrollY>=sec.offsetTop-120) current=sec.id;});
    links.forEach(l=>{l.classList.remove('active');if(l.getAttribute('href')==='#'+current) l.classList.add('active');});
  },{passive:true});
  links.forEach(l=>l.addEventListener('click',e=>{
    const href=l.getAttribute('href'); if(!href.startsWith('#')) return;
    e.preventDefault(); const target=document.querySelector(href);
    if(target) window.scrollTo({top:target.offsetTop-72,behavior:'smooth'});
  }));
  if(logo) logo.addEventListener('click',e=>{e.preventDefault();window.scrollTo({top:0,behavior:'smooth'});});
}
function initModals(){
  const modal=document.getElementById('member-modal');
  const content=document.getElementById('modal-content');
  const grid=document.getElementById('team-grid');
  if(!modal||!content||!grid) return;
  const close=()=>{modal.classList.remove('active');document.body.style.overflow='';};
  grid.addEventListener('click',e=>{
    const card=e.target.closest('.team-card[data-id]'); if(!card) return;
    const m=members[card.dataset.id]; if(!m) return;
    const links=[
      m.twitch?`<a href="${escapeHTML(m.twitch)}" target="_blank" class="btn btn-dark" style="background:#9146FF;color:#fff">Twitch</a>`:'',
      m.youtube?`<a href="${escapeHTML(m.youtube)}" target="_blank" class="btn btn-white">YouTube</a>`:'',
      m.discord?`<a href="${escapeHTML(m.discord)}" target="_blank" class="btn btn-discord">Discord</a>`:`<a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord">Discord Furioz</a>`
    ].join('');
    content.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:start;gap:1rem">
        <div>
          <h2 style="margin:0 0 .2rem">${escapeHTML(m.name)} <span style="color:var(--blue);font-weight:400;font-size:.85rem">• ${escapeHTML(m.status||'MEMBRE')} ${m.country?'• '+escapeHTML(m.countryFlag||'')+' '+escapeHTML(m.country):''}</span></h2>
          <span class="badge">Depuis ${escapeHTML(formatDateLongFR(m.joined))}${m.country?' • '+escapeHTML(m.countryFlag||'')+' '+escapeHTML(m.country):''}</span>
        </div>
        <button id="close-modal" style="background:var(--gray);border:0;width:36px;height:36px;border-radius:50%;cursor:pointer;font-size:1.2rem">✕</button>
      </div>
      <div style="margin-top:1rem;display:grid;gap:.8rem">
        <p><strong>Stream depuis :</strong> ${escapeHTML(formatDateFR(m.streamSince,true))}<br><strong>A rejoint la Furioz :</strong> ${escapeHTML(formatDateLongFR(m.joined))}${m.role?'<br><strong>Rôle :</strong> '+escapeHTML(m.role):''}</p>
        <p style="color:#444;line-height:1.6">${escapeHTML(m.description)}</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">${(m.tags||[]).map(t=>`<span class="badge" style="background:#E8E2D9;color:#1E293B;border-color:#D1C9B8">${escapeHTML(t)}</span>`).join('')}</div>
        <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.5rem">${links}</div>
      </div>`;
    modal.classList.add('active');document.body.style.overflow='hidden';
    document.getElementById('close-modal').onclick=close;
  });
  modal.addEventListener('click',e=>{if(e.target===modal) close();});
  document.addEventListener('keydown',e=>{if(e.key==='Escape') close();});
}
function initCopyright(){const y=document.getElementById('current-year');if(y)y.textContent=new Date().getFullYear();}
document.addEventListener('DOMContentLoaded',async()=>{initTwitch();initNav();initModals();initCopyright();await loadTeam();});
