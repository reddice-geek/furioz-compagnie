// Furioz Compagnie - SYSTEME CARTES INCASSABLE
const members = {
  reddice: {
    name: "RedDice_Geek",
    role: "FONDATEUR",
    badge: "Fondateur • Depuis Septembre 2022 • Stream depuis Aout 2021",
    joined: "Septembre 2022",
    streamSince: "Aout 2021",
    twitch: "https://twitch.tv/reddice_geek",
    youtube: "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    desc: "Fondateur de la Furioz Compagnie en septembre 2022. Projet pense pour durer : entraide, independance et progression durable.",
    tags: ["Fondateur", "Gaming", "Cosplay", "IRL"]
  },
  zafkiel: {
    name: "Zafkiel / LePetoChard",
    role: "MEMBRE",
    badge: "Depuis 23 Novembre 2024",
    joined: "23 Novembre 2024",
    streamSince: "2023",
    twitch: "https://www.twitch.tv/le_petochard",
    desc: "LePetoChard, aussi connu sous Zafkiel. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",
    tags: ["Gaming", "Events"]
  },
  foxysword: {
    name: "Foxy Sword",
    role: "MEMBRE • Canada",
    badge: "Depuis 18 Aout 2026 • Gaming • DJ • Canada",
    joined: "18 Aout 2026",
    streamSince: "2025",
    twitch: "https://www.twitch.tv/foxysword350",
    desc: "Vient du Canada. DJ debutant et gamer passionne, Foxy Sword nous a rejoint le 18 Aout 2026. Il streame depuis 2025 entre gaming au sein de la Team [FZ] et lives DJ / mix. Debutant motive.",
    tags: ["Gaming", "DJ", "Musique", "Canada"]
  },
  quentin: {
    name: "Quentin Pierrot",
    role: "MODO / WEBMASTER",
    badge: "Modo / Webmaster • Avali VRChat • France • Depuis 2026",
    joined: "2026",
    streamSince: "Occasionnel",
    twitch: "https://twitch.tv/furiozcompagnie",
    desc: "Avali de VRChat, Quentin Pierrot nous rejoint principalement en tant que modo, webmaster du site et gestion du Discord. Il s'occupe aussi des clips et stream parfois sur la chaine Twitch Furioz Compagnie. Vient de France.",
    tags: ["Modo", "Webmaster", "VRChat", "Avali", "France", "Clips", "Discord"]
  }
};

function initTwitch() {
  const player = document.getElementById('twitch-player');
  const chat = document.getElementById('twitch-chat');
  const badge = document.getElementById('live-badge');
  if (!player) return;
  const channel = "furiozcompagnie";
  const domain = window.location.hostname || "localhost";
  const parents = `&parent=localhost&parent=${domain}&parent=vercel.app&parent=www.furiozcompagnie.fr&parent=furioz.fr`;
  player.src = `https://player.twitch.tv/?channel=${channel}${parents}&muted=true`;
  if (chat) {
    chat.src = `https://www.twitch.tv/embed/${channel}/chat?darkpopout${parents}`;
  }
  if (badge) {
    badge.textContent = "OFFLINE - Player charge";
    badge.className = "live-badge offline";
  }
}

function initNav(){
  const nav = document.getElementById('main-nav');
  const links = document.querySelectorAll("nav .links a[href^='#']");
  const logo = document.getElementById('logo-link');
  if(!nav) return;
  window.addEventListener('scroll', ()=>{
    if(window.scrollY > 20) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
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

function initModals() {
  if(window.__furiozInit) return;
  window.__furiozInit = true;
  const modal = document.getElementById('member-modal');
  const content = document.getElementById('modal-content');
  const grid = document.getElementById('team-grid');
  if (!modal || !content || !grid) return;

  function openMember(id) {
    const m = members[id];
    if (!m) {
      content.innerHTML = `<h3>Membre introuvable</h3><p>Pas de donnees pour ${id}</p><button onclick="document.getElementById('member-modal').classList.remove('active')" class="btn btn-dark">Fermer</button>`;
      modal.classList.add('active');
      document.body.style.overflow="hidden";
      return;
    }
    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; gap:1rem">
        <div>
          <h2 style="margin:0 0 .2rem">${m.name} ${m.role === 'FONDATEUR' ? '<span style="color:var(--blue); font-weight:400; font-size:.9rem">• FONDATEUR</span>' : `<span style="color:var(--blue); font-weight:400; font-size:.85rem">• ${m.role}</span>`}</h2>
          <span class="badge">${m.badge}</span>
        </div>
        <button id="close-modal" style="background:var(--gray); border:0; width:36px; height:36px; border-radius:50%; cursor:pointer; font-size:1.2rem">✕</button>
      </div>
      <div style="margin-top:1rem; display:grid; gap:.8rem">
        <p><strong>Stream depuis :</strong> ${m.streamSince} <br><strong>A rejoint la Furioz :</strong> ${m.joined}</p>
        <p style="color:#444; line-height:1.6">${m.desc}</p>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap">
          ${m.tags.map(t=>`<span class="badge" style="background:#EEF2FF; color:#1E293B; border-color:#C7D2FE">${t}</span>`).join('')}
        </div>
        <div style="display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.5rem">
          <a href="${m.twitch}" target="_blank" class="btn btn-dark" style="background:#9146FF; color:#fff; padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700">Twitch</a>
          ${m.youtube ? `<a href="${m.youtube}" target="_blank" class="btn btn-white" style="padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700; border:1px solid #ddd">YouTube</a>` : ''}
          <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord" style="padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700">Discord Furioz</a>
        </div>
      </div>
    `;
    modal.classList.add('active');
    document.body.style.overflow="hidden";
    const closeBtn = document.getElementById('close-modal');
    if(closeBtn) closeBtn.onclick = () => closeModal();
  }

  function closeModal(){
    modal.classList.remove('active');
    document.body.style.overflow="";
  }

  grid.addEventListener('click', (e)=>{
    const card = e.target.closest('.team-card[data-id]');
    if(!card) return;
    openMember(card.getAttribute('data-id'));
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeModal();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTwitch();
  initNav();
  initModals();
});
