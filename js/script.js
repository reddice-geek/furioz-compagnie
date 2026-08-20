document.addEventListener("DOMContentLoaded",()=>{
  initLive();
  initTeamModal();
  initNav();
});

function initNav(){
  const nav = document.getElementById('main-nav');
  const links = document.querySelectorAll("nav .links a[href^='#']");
  const logo = document.getElementById('logo-link');
  if(!nav) return;
  
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
    
    // scrollspy
    let current = '';
    document.querySelectorAll('section[id]').forEach(sec=>{
      if(window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    links.forEach(l=>{
      l.classList.remove('active');
      if(l.getAttribute('href') === '#'+current) l.classList.add('active');
    });
  }, {passive:true});

  links.forEach(l=>{
    l.addEventListener('click', e=>{
      const href = l.getAttribute('href');
      if(!href.startsWith('#')) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if(target) window.scrollTo({top: target.offsetTop - 72, behavior:'smooth'});
    });
  });

  if(logo){
    logo.addEventListener('click', e=>{
      e.preventDefault();
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
}

function initLive(){
  const player=document.getElementById("twitch-player");
  const chat=document.getElementById("twitch-chat");
  const badge=document.getElementById("live-badge");
  const domain=window.location.hostname||"localhost";
  const parents=`&parent=localhost&parent=${domain}&parent=vercel.app&parent=www.furiozcompagnie.fr`;
  if(player) player.src=`https://player.twitch.tv/?channel=furiozcompagnie${parents}&muted=true`;
  if(chat) chat.src=`https://www.twitch.tv/embed/furiozcompagnie/chat?darkpopout${parents}`;
  if(badge){
    setTimeout(()=>{
      badge.textContent="OFFLINE - Player charge";
      badge.className="live-badge offline";
    },1500);
  }
}

// DATA TEAM - SOURCE UNIQUE, NE PAS DUPLIQUER AILLEURS
const TEAM=[
  {
    id:"reddice",
    name:"RedDice_Geek",
    alias:"RedDice",
    role:"Fondateur",
    depuisCollectif:"Septembre 2022",
    streamSince:"Aout 2021",
    twitch:"https://twitch.tv/reddice_stream",
    youtube:"https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    tags:["Fondateur","Gaming","Cosplay"],
    bio:"Fondateur de la Furioz Compagnie en septembre 2022. Projet pense pour durer : entraide, independance, progression.",
    avatar:"R"
  },
  {
    id:"zafkiel",
    name:"Zafkiel",
    alias:"LePetoChard",
    role:"Streamer",
    depuisCollectif:"23 Novembre 2024",
    streamSince:"2023",
    twitch:"https://www.twitch.tv/le_petochard",
    tags:["Gaming","Events"],
    bio:"Membre depuis le 23/11/2024. Streameur investi dans les events et l'entraide.",
    avatar:"Z"
  },
  {
    id:"foxysword",
    name:"Foxy Sword",
    alias:"DJ",
    role:"Streamer / DJ",
    depuisCollectif:"18 Aout 2026",
    streamSince:"2025",
    twitch:"https://www.twitch.tv/foxysword350",
    tags:["Gaming","DJ","Musique"],
    bio:"A rejoint la Furioz le 18/08/2026. Streame depuis 2025, entre gaming au sein de la Team et lives DJ / mix. Debutant motive.",
    avatar:"F"
  }
];

function initTeamModal(){
  if(window.__furiozInit) return;
  window.__furiozInit = true;
  const grid=document.getElementById("team-grid");
  const modal=document.getElementById("member-modal");
  const content=document.getElementById("modal-content");
  if(!grid||!modal||!content) return;

  grid.addEventListener("click",(e)=>{
    const card=e.target.closest(".team-card[data-id]");
    if(!card) return;
    const id=card.dataset.id;
    const m=TEAM.find(x=>x.id===id);
    if(!m) return;
    content.innerHTML=`
      <button class="close" onclick="document.getElementById('member-modal').classList.remove('active')">✕</button>
      <div style="display:flex; gap:1rem; align-items:center; margin-bottom:1rem">
        <div class="avatar" style="width:80px; height:80px; font-size:1.8rem">${m.avatar}</div>
        <div>
          <h3 style="margin:0">${m.name} ${m.alias?`<small style='color:#666'>/ ${m.alias}</small>`:''}</h3>
          <span class="badge">${m.role} • Depuis ${m.depuisCollectif}</span>
        </div>
      </div>
      <p><strong>Stream depuis:</strong> ${m.streamSince}</p>
      <p><strong>Rejoint le collectif:</strong> ${m.depuisCollectif}</p>
      <p style="color:#666; line-height:1.6">${m.bio}</p>
      <div style="display:flex; gap:.4rem; flex-wrap:wrap; margin:.8rem 0">
        ${m.tags.map(t=>`<span class="badge">${t}</span>`).join("")}
      </div>
      <div style="display:flex; gap:.5rem; margin-top:1.2rem; flex-wrap:wrap">
        <a href="${m.twitch}" target="_blank" class="btn btn-dark" style="background:#9146FF">Twitch</a>
        ${m.youtube?`<a href="${m.youtube}" target="_blank" class="btn btn-white">YouTube</a>`:''}
        <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord">Discord</a>
      </div>
    `;
    modal.classList.add("active");
    document.body.style.overflow="hidden";
  });

  function closeModal(){
    modal.classList.remove("active");
    document.body.style.overflow="";
  }
  modal.addEventListener("click",(e)=>{ if(e.target===modal) closeModal(); });
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });
}
