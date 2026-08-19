document.addEventListener("DOMContentLoaded",()=>{
  initLive();
  initTeamModal();
  setActiveNav();
});

function setActiveNav(){
  const links=document.querySelectorAll("nav .links a[href^='#']");
  links.forEach(l=>l.addEventListener("click",()=>{
    links.forEach(x=>x.classList.remove("active"));
    l.classList.add("active");
  }));
}

function initLive(){
  const player=document.getElementById("twitch-player");
  const chat=document.getElementById("twitch-chat");
  const badge=document.getElementById("live-badge");
  const domain=window.location.hostname||"localhost";
  // For localhost preview, Twitch requires localhost as parent. For Vercel, it needs your vercel domain.
  // We set both localhost and vercel.app as parents
  const parents=`&parent=localhost&parent=${domain}&parent=vercel.app&parent=www.furiozcompagnie.fr`;
  if(player){
    player.src=`https://player.twitch.tv/?channel=furiozcompagnie${parents}&muted=true`;
  }
  if(chat){
    chat.src=`https://www.twitch.tv/embed/furiozcompagnie/chat?darkpopout${parents}`;
  }
  // Simulate live check (real check needs Twitch API token)
  setTimeout(()=>{
    if(badge){
      badge.textContent="OFFLINE - Player chargé";
      badge.className="live-badge offline";
      // If you want to force LIVE for test: badge.textContent="● LIVE"; badge.className="live-badge live";
    }
  },2000);
}

const TEAM=[
  {
    id:"reddice",
    name:"RedDice_Geek",
    alias:"RedDice",
    role:"Fondateur",
    depuisCollectif:"Septembre 2022",
    streamSince:"Août 2021",
    twitch:"https://twitch.tv/reddice_stream",
    tags:["Just Chatting","Gaming","Cosplay"],
    bio:"Fondateur du collectif. Objectif: progresser ensemble sans perdre son indépendance.",
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
    tags:["Gaming","Events","Collabs"],
    bio:"Membre pilier de la Stream Team [FZ]. A rejoint la Furioz en tant que streameur le 23/11/2024. Chaîne: le_petochard",
    avatar:"Z"
  },
  {
    id:"foxysword",
    name:"Foxy Sword",
    alias:"",
    role:"Streamer",
    depuisCollectif:"18 Août 2026",
    streamSince:"2025",
    twitch:"https://www.twitch.tv/foxysword350",
    tags:["Gaming","Variety","Nouveau"],
    bio:"Nouveau membre de la Stream Team [FZ]. Streame depuis 2025 et a rejoint la Furioz Compagnie le 18 Août 2026.",
    avatar:"F"
  }
];

function initTeamModal(){
  const grid=document.getElementById("team-grid");
  const modal=document.getElementById("member-modal");
  const modalContent=document.getElementById("modal-content");
  if(!grid||!modal) return;

  grid.addEventListener("click",(e)=>{
    const card=e.target.closest(".team-card[data-id]");
    if(!card) return;
    const id=card.dataset.id;
    const m=TEAM.find(x=>x.id===id);
    if(!m) return;
    modalContent.innerHTML=`
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
      <p style="color:#666">${m.bio}</p>
      <div style="display:flex; gap:.4rem; flex-wrap:wrap; margin:.8rem 0">
        ${m.tags.map(t=>`<span class="badge">${t}</span>`).join("")}
      </div>
      <div style="display:flex; gap:.5rem; margin-top:1rem; flex-wrap:wrap">
        <a href="${m.twitch}" target="_blank" class="btn btn-dark">Chaîne Twitch</a>
        <a href="https://twitch.tv/furiozcompagnie" target="_blank" class="btn btn-white">Furioz Compagnie</a>
        <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord">Discord</a>
      </div>
    `;
    modal.classList.add("active");
  });
  modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.classList.remove("active"); });
}
