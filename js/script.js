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
  const parents=`&parent=localhost&parent=${domain}&parent=vercel.app&parent=www.furiozcompagnie.fr&parent=furioz.fr`;
  if(player){
    player.src=`https://player.twitch.tv/?channel=furiozcompagnie${parents}&muted=true`;
  }
  if(chat){
    chat.src=`https://www.twitch.tv/embed/furiozcompagnie/chat?darkpopout${parents}`;
  }
  setTimeout(()=>{
    if(badge){
      badge.textContent="OFFLINE - Player chargé";
      badge.className="live-badge offline";
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
    youtube:"https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
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
    bio:"Membre pilier de la Stream Team [FZ]. A rejoint la Furioz en tant que streameur le 23/11/2024. Ambiance chill et entraide.",
    avatar:"Z"
  },
  {
    id:"foxysword",
    name:"Foxy Sword",
    alias:"DJ",
    role:"Streamer / DJ",
    depuisCollectif:"18 Août 2026",
    streamSince:"2025",
    twitch:"https://www.twitch.tv/foxysword350",
    tags:["DJ","Musique","Mix","Débutant","Nouveau"],
    bio:"DJ débutant, Foxy Sword nous a rejoint le 18 Août 2026. Il streame depuis 2025 et va proposer des lives musique avec ses mix. Ambiance chill, il débute et veut partager sa passion.",
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
      <p style="color:#666; line-height:1.6">${m.bio}</p>
      <div style="display:flex; gap:.4rem; flex-wrap:wrap; margin:.8rem 0">
        ${m.tags.map(t=>`<span class="badge">${t}</span>`).join("")}
      </div>
      <div style="display:flex; gap:.5rem; margin-top:1.2rem; flex-wrap:wrap">
        <a href="${m.twitch}" target="_blank" class="btn btn-dark" style="background:#9146FF">▶ Twitch</a>
        ${m.youtube?`<a href="${m.youtube}" target="_blank" class="btn btn-white">YouTube</a>`:''}
        <a href="https://twitch.tv/furiozcompagnie" target="_blank" class="btn btn-white">Furioz</a>
        <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord">Discord</a>
      </div>
    `;
    modal.classList.add("active");
  });
  modal.addEventListener("click",(e)=>{ if(e.target===modal) modal.classList.remove("active"); });
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') modal.classList.remove('active'); });
}
