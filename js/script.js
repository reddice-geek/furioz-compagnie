// Furioz Compagnie - script.js
// Gère le player Twitch + les modales membres

const members = {
  reddice: {
    name: "RedDice_Geek",
    role: "FONDATEUR",
    badge: "Fondateur • Depuis Septembre 2022 • Stream depuis Août 2021",
    joined: "Septembre 2022",
    streamSince: "Août 2021",
    twitch: "https://twitch.tv/reddice_geek",
    youtube: "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    desc: "Fondateur du collectif. Créateur gaming / cosplay / IRL. Objectif : entraide et progression sans perdre l'indépendance.",
    tags: ["Gaming", "Cosplay", "IRL", "Fondateur"]
  },
  zafkiel: {
    name: "Zafkiel / LePetoChard",
    role: "MEMBRE",
    badge: "Depuis 23 Novembre 2024",
    joined: "23 Novembre 2024",
    streamSince: "2023",
    twitch: "https://www.twitch.tv/le_petochard",
    desc: "LePetoChard, aussi connu sous Zafkiel. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",
    tags: ["Gaming", "Chill"]
  },
  foxysword: {
    name: "Foxy Sword",
    role: "MEMBRE",
    badge: "Depuis 18 Août 2026 • Stream depuis 2025",
    joined: "18 Août 2026",
    streamSince: "2025",
    twitch: "https://www.twitch.tv/foxysword350",
    desc: "Foxy Sword nous a rejoint le 18 Août 2026. Streame depuis 2025. Nouveau membre de la Stream Team [FZ].",
    tags: ["Gaming", "Nouveau"]
  }
};

// --- Twitch Live ---
function initTwitch() {
  const player = document.getElementById('twitch-player');
  const chat = document.getElementById('twitch-chat');
  const badge = document.getElementById('live-badge');
  if (!player) return;

  const channel = "furiozcompagnie";
  const parent = window.location.hostname || "localhost";

  player.src = `https://player.twitch.tv/?channel=${channel}&parent=${parent}&muted=true`;
  if (chat) {
    chat.src = `https://www.twitch.tv/embed/${channel}/chat?parent=${parent}&darkpopout`;
  }
  if (badge) {
    badge.textContent = "HORS LIGNE";
    badge.style.background = "#555";
    // Optionnel : check API plus tard
  }
}

// --- Modale membre ---
function initModals() {
  const modal = document.getElementById('member-modal');
  const content = document.getElementById('modal-content');
  if (!modal || !content) return;

  function openMember(id) {
    const m = members[id];
    if (!m) {
      content.innerHTML = `<h3>Membre introuvable</h3><p>Pas de données pour ${id}</p><button onclick="document.getElementById('member-modal').classList.remove('open')" class="btn btn-dark">Fermer</button>`;
      modal.classList.add('open');
      return;
    }

    content.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:start; gap:1rem">
        <div>
          <h2 style="margin:0 0 .2rem">${m.name} ${m.role === 'FONDATEUR' ? '<span style="color:var(--blue); font-weight:400; font-size:.9rem">• FONDATEUR</span>' : ''}</h2>
          <span class="badge">${m.badge}</span>
        </div>
        <button id="close-modal" style="background:none; border:0; font-size:1.6rem; cursor:pointer">✕</button>
      </div>
      <div style="margin-top:1rem; display:grid; gap:.8rem">
        <p><strong>Stream depuis :</strong> ${m.streamSince} <br><strong>A rejoint la Furioz :</strong> ${m.joined}</p>
        <p style="color:#444">${m.desc}</p>
        <div style="display:flex; gap:.5rem; flex-wrap:wrap">
          ${m.tags.map(t=>`<span class="badge" style="background:#eee; color:#333">${t}</span>`).join('')}
        </div>
        <div style="display:flex; gap:.6rem; flex-wrap:wrap; margin-top:.5rem">
          <a href="${m.twitch}" target="_blank" class="btn btn-dark" style="background:#9146FF; color:#fff; padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700">▶ Twitch</a>
          ${m.youtube ? `<a href="${m.youtube}" target="_blank" class="btn btn-white" style="padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700; border:1px solid #ddd">YouTube</a>` : ''}
          <a href="https://discord.gg/nKj9NFDyxj" target="_blank" class="btn btn-discord" style="padding:.6rem 1rem; border-radius:8px; text-decoration:none; font-weight:700">Discord Furioz</a>
        </div>
      </div>
    `;
    modal.classList.add('open');
    document.getElementById('close-modal').onclick = () => modal.classList.remove('open');
  }

  document.querySelectorAll('.team-card[data-id]').forEach(card => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-id');
      openMember(id);
    });
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('open');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initTwitch();
  initModals();
});
