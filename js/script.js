// =========================================================
// FURIOZ COMPAGNIE
// js/script.js
// Team locale + API Admin + fenêtres membres
// =========================================================


// =========================================================
// MEMBRES DE SECOURS
// =========================================================

const fallbackMembers = [

  {
    id: "reddice",
    name: "RedDice_Geek",
    status: "FONDATEUR",

    country: "France",
    countryFlag: "🇫🇷",

    joined: "Septembre 2022",
    streamSince: "Aout 2021",

    role: "Fondateur",
    category: "Gaming • Cosplay • IRL",

    description:
      "Fondateur de la Furioz Compagnie en septembre 2022. Projet pense pour durer : entraide, independance et progression durable.",

    tags: [
      "Fondateur",
      "Gaming",
      "Cosplay",
      "IRL",
      "🇫🇷 France"
    ],

    twitch:
      "https://twitch.tv/reddice_geek",

    youtube:
      "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",

    discord: "",

    initial: "R",
    color: "#6A00FF",
    color2: "#D000FF",

    visible: true
  },


  {
    id: "zafkiel",
    name: "Zafkiel / LePetoChard",
    status: "MEMBRE",

    country: "France",
    countryFlag: "🇫🇷",

    joined: "23 Novembre 2024",
    streamSince: "2023",

    role: "Streamer",
    category: "Gaming • Events",

    description:
      "LePetoChard, aussi connu sous Zafkiel. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",

    tags: [
      "Gaming",
      "Events",
      "🇫🇷 France"
    ],

    twitch:
      "https://www.twitch.tv/le_petochard",

    youtube: "",
    discord: "",

    initial: "Z",
    color: "#00B8D9",
    color2: "#00A86B",

    visible: true
  },


  {
    id: "foxysword",
    name: "Foxy Sword",
    status: "MEMBRE",

    country: "Canada",
    countryFlag: "🇨🇦",

    joined: "18 Aout 2026",
    streamSince: "2025",

    role: "Streamer / DJ",
    category: "Gaming • DJ",

    description:
      "DJ debutant et gamer passionne. A rejoint la Furioz le 18/08/2026.",

    tags: [
      "Gaming",
      "DJ",
      "Musique",
      "🇨🇦 Canada"
    ],

    twitch:
      "https://www.twitch.tv/foxysword350",

    youtube: "",
    discord: "",

    initial: "F",
    color: "#001AFF",
    color2: "#7A00FF",

    visible: true
  },


  {
    id: "quentin",
    name: "Quentin Pierrot",
    status: "MODO / WEBMASTER",

    country: "France",
    countryFlag: "🇫🇷",

    joined: "20 Aout 2026",
    streamSince: "2023",

    role: "Modo / Webmaster",
    category: "Avali VRChat",

    description:
      "Modo, webmaster du site et gestion du Discord.",

    tags: [
      "Modo",
      "Webmaster",
      "VRChat",
      "Avali",
      "🇫🇷 France"
    ],

    twitch:
      "https://twitch.tv/furiozcompagnie",

    youtube: "",
    discord: "",

    initial: "Q",
    color: "#FF0000",
    color2: "#FF8A00",

    visible: true
  }

];


// =========================================================
// TEAM ACTUELLE
// =========================================================

let currentMembers = [...fallbackMembers];
let revealObserver = null;


// =========================================================
// SÉCURITÉ HTML
// =========================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// =========================================================
// DRAPEAU
// Transforme FR / CA en emoji si nécessaire
// =========================================================

function normalizeFlag(flag, country) {

  const value =
    String(flag || "")
      .trim()
      .toUpperCase();


  if (value === "FR") {
    return "🇫🇷";
  }

  if (value === "CA") {
    return "🇨🇦";
  }

  if (value === "BE") {
    return "🇧🇪";
  }

  if (value === "CH") {
    return "🇨🇭";
  }

  if (value === "US") {
    return "🇺🇸";
  }

  if (value === "GB") {
    return "🇬🇧";
  }


  if (flag) {
    return flag;
  }


  const c =
    String(country || "")
      .toLowerCase();


  if (c === "france") {
    return "🇫🇷";
  }

  if (c === "canada") {
    return "🇨🇦";
  }


  return "";
}


// =========================================================
// FUSION MEMBRE
// IMPORTANT : une valeur vide venant de l'API
// n'efface plus une valeur locale existante
// =========================================================

function mergeMember(oldMember, apiMember) {

  const merged = {
    ...oldMember
  };


  Object.entries(
    apiMember || {}
  )
    .forEach(
      ([key, value]) => {

        // null / undefined
        if (
          value === null ||
          value === undefined
        ) {
          return;
        }


        // chaîne vide
        if (
          typeof value === "string" &&
          value.trim() === ""
        ) {
          return;
        }


        // tableau vide
        if (
          Array.isArray(value) &&
          value.length === 0
        ) {
          return;
        }


        merged[key] =
          value;

      }
    );


  merged.countryFlag =
    normalizeFlag(
      merged.countryFlag,
      merged.country
    );


  if (
    !merged.initial &&
    merged.name
  ) {

    merged.initial =
      merged.name
        .charAt(0)
        .toUpperCase();

  }


  return merged;
}


// =========================================================
// CHARGEMENT DE LA TEAM
// =========================================================

async function loadTeam() {

  const container =
    document.getElementById(
      "team-grid"
    );


  if (!container) {
    return;
  }


  // Affichage immédiat
  currentMembers =
    fallbackMembers.map(
      member => ({
        ...member
      })
    );


  renderTeam(
    currentMembers
  );


  try {

    const response =
      await fetch(
        "/api/team",
        {
          method: "GET",

          headers: {
            "Accept":
              "application/json"
          },

          cache:
            "no-store"
        }
      );


    // API indisponible :
    // on garde les membres locaux
    if (!response.ok) {

      console.warn(
        "API Team indisponible :",
        response.status
      );

      return;
    }


    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      !contentType.includes(
        "application/json"
      )
    ) {

      console.warn(
        "L'API Team ne renvoie pas du JSON."
      );

      return;
    }


    const data =
      await response.json();


    let apiMembers = [];


    if (
      Array.isArray(data)
    ) {

      apiMembers =
        data;

    }

    else if (
      Array.isArray(
        data.members
      )
    ) {

      apiMembers =
        data.members;

    }

    else if (
      Array.isArray(
        data.team
      )
    ) {

      apiMembers =
        data.team;

    }


    if (
      !apiMembers.length
    ) {

      return;
    }


    // =====================================================
    // FUSION
    // =====================================================

    const memberMap =
      new Map();


    fallbackMembers.forEach(
      member => {

        memberMap.set(
          member.id,
          {
            ...member
          }
        );

      }
    );


    apiMembers.forEach(
      apiMember => {

        if (
          !apiMember ||
          !apiMember.id
        ) {
          return;
        }


        const oldMember =
          memberMap.get(
            apiMember.id
          ) || {};


        const merged =
          mergeMember(
            oldMember,
            apiMember
          );


        memberMap.set(
          apiMember.id,
          merged
        );

      }
    );


    currentMembers =
      Array.from(
        memberMap.values()
      );


    renderTeam(
      currentMembers
    );

  }

  catch (error) {

    console.warn(
      "Impossible de charger /api/team :",
      error
    );

    // Les membres locaux restent affichés
  }
}


// =========================================================
// AFFICHAGE TEAM
// =========================================================

function renderTeam(members) {

  const container =
    document.getElementById("team-grid");

  if (!container) return;

  const visibleMembers =
    members.filter(member => member.visible !== false);

  container.innerHTML = "";
  updateTeamMetrics(visibleMembers.length);

  // Les profils sont générés depuis les données API ou les profils de secours.
  visibleMembers.forEach((member, index) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = buildCard(member).trim();

    const card = wrapper.firstElementChild;
    if (!card) return;

    card.addEventListener("click", event => {
      if (event.target.closest("a")) return;
      openMemberModal(member);
    });

    card.addEventListener("keydown", event => {
      if (event.target !== card) return;
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openMemberModal(member);
      }
    });

    card.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      card.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });

    container.appendChild(card);
    observeRevealElement(card, index);
  });

  // La capacité reste fixée à 10 places : les emplacements libres sont visuels
  // et renvoient vers le même formulaire de candidature.
  const maximum = 10;
  const remaining = Math.max(0, maximum - visibleMembers.length);

  for (let i = 0; i < remaining; i++) {
    const freeCard = document.createElement("article");
    freeCard.className = "team-card free-place";
    freeCard.innerHTML = `
      <div class="free-plus" aria-hidden="true">+</div>
      <span class="free-label">RECRUTEMENT OUVERT</span>
      <h3>${i === 0 ? `${remaining} places disponibles` : "Une place pour vous ?"}</h3>
      <p>${i === 0 ? "Fais partie de la prochaine aventure Furioz." : "Apporte ton univers et ton énergie au collectif."}</p>
      ${i === 0 ? `
        <a href="https://forms.gle/7hA9ac26qJn7AHjc6" target="_blank" rel="noopener noreferrer">
          Proposer ma candidature <span aria-hidden="true">↗</span>
        </a>
      ` : ""}
    `;
    freeCard.addEventListener("pointermove", event => {
      if (event.pointerType !== "mouse") return;
      const rect = freeCard.getBoundingClientRect();
      freeCard.style.setProperty("--pointer-x", `${event.clientX - rect.left}px`);
      freeCard.style.setProperty("--pointer-y", `${event.clientY - rect.top}px`);
    });
    container.appendChild(freeCard);
    observeRevealElement(freeCard, visibleMembers.length + i);
  }
}


function updateTeamMetrics(memberCount) {
  const maximum = 10;
  const remaining = Math.max(0, maximum - memberCount);
  const count = document.getElementById("team-count");
  const places = document.getElementById("team-places");

  if (count) count.textContent = String(memberCount).padStart(2, "0");
  if (places) places.textContent = String(remaining).padStart(2, "0");

  const heroCount = document.getElementById("hero-member-count");
  if (heroCount) heroCount.textContent = `${memberCount} membre${memberCount > 1 ? "s" : ""}`;

  document.querySelectorAll(".cta-current-members").forEach(element => {
    element.textContent = `${memberCount} membre${memberCount > 1 ? "s" : ""}`;
  });
  document.querySelectorAll(".cta-open-spots").forEach(element => {
    element.textContent = `${remaining} place${remaining > 1 ? "s" : ""} disponible${remaining > 1 ? "s" : ""}`;
  });
}


function observeRevealElement(element, order = 0) {
  if (!element || !revealObserver) return;
  element.classList.add("will-reveal");
  element.style.transitionDelay = `${Math.min(order, 5) * 65}ms`;
  revealObserver.observe(element);
}


function initScrollAnimations() {
  if (!("IntersectionObserver" in window)) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -35px 0px"
  });

  document.querySelectorAll(".hero, .section, .site-footer").forEach((element, index) => {
    observeRevealElement(element, index);
  });
}

// =========================================================
// CONSTRUCTION CARTE
// =========================================================

function buildCard(member) {
  const name = member.name || member.pseudo || "Membre";
  const initial = member.initial || name.charAt(0).toUpperCase();
  const status = String(member.status || member.role || "MEMBRE").toUpperCase();
  const isFounder = status === "FONDATEUR" || status === "FOUNDER";
  const countryFlag = normalizeFlag(member.countryFlag, member.country);
  const color = member.color || "#151519";
  const color2 = member.color2 || color;

  const badgeParts = [];
  if (member.joined) badgeParts.push(`Depuis ${member.joined}`);
  if (member.category) badgeParts.push(member.category);
  if (member.role && String(member.role).toUpperCase() !== "FONDATEUR") badgeParts.push(member.role);
  if (member.country) badgeParts.push(`${countryFlag} ${member.country}`.trim());
  const badge = member.badge || badgeParts.filter(Boolean).join(" • ");

  const profileStatus = isFounder ? "FONDATEUR" : (member.status || "MEMBRE");
  const cardClass = isFounder ? "team-card founder member-card" : "team-card member-card";
  const nameHTML = escapeHTML(name);
  const avatarStyle = `background:linear-gradient(135deg,${escapeHTML(color)} 0%,${escapeHTML(color)} 32%,${escapeHTML(color2)} 68%,${escapeHTML(color2)} 100%)`;

  return `
    <article class="${cardClass}" data-id="${escapeHTML(member.id)}" role="button" tabindex="0" aria-label="Découvrir le profil de ${nameHTML}">
      <div class="card-topline">
        <span class="member-type"><i class="member-type-dot"></i>${escapeHTML(profileStatus)}</span>
        <span class="member-index">FZ // MEMBER</span>
      </div>
      <div class="avatar" style="${avatarStyle}">${escapeHTML(initial)}</div>
      <div class="member-info">
        <h3 class="member-name">
          ${nameHTML}
          ${isFounder ? '<span class="member-status">FONDATEUR</span>' : ''}
        </h3>
        ${badge ? `<div class="badge member-badge">${escapeHTML(badge)}</div>` : ''}
        ${isFounder && member.description ? `<p class="member-description">${escapeHTML(member.description)}</p>` : ''}
      </div>
      <div class="card-hint">Voir le profil <span aria-hidden="true">↗</span></div>
    </article>
  `;
}

// =========================================================
// PETITE FENÊTRE MEMBRE
// =========================================================

function openMemberModal(member) {

  closeMemberModal();


  const name =
    member.name ||
    "Membre";


  const status =
    member.status ||
    member.role ||
    "MEMBRE";


  const description =
    member.description ||
    member.desc ||
    "";


  const countryFlag =
    normalizeFlag(
      member.countryFlag,
      member.country
    );


  // =====================================================
  // SI TON HTML CONTIENT DÉJÀ
  // #member-modal ET #modal-content
  // =====================================================

  const existingModal =
    document.getElementById(
      "member-modal"
    );


  const existingContent =
    document.getElementById(
      "modal-content"
    );


  if (
    existingModal &&
    existingContent
  ) {

    const initial = member.initial || name.charAt(0).toUpperCase();
    const avatarColor = member.color || "#ff7624";
    const avatarColor2 = member.color2 || avatarColor;
    const countryLabel = member.country ? `${countryFlag} ${member.country}`.trim() : "";
    const details = [
      member.streamSince ? `<div class="modal-detail"><span>Stream depuis</span><strong>${escapeHTML(member.streamSince)}</strong></div>` : "",
      member.joined ? `<div class="modal-detail"><span>A rejoint la Furioz</span><strong>${escapeHTML(member.joined)}</strong></div>` : "",
      member.role ? `<div class="modal-detail"><span>Rôle dans le collectif</span><strong>${escapeHTML(member.role)}</strong></div>` : "",
      member.category ? `<div class="modal-detail"><span>Univers</span><strong>${escapeHTML(member.category)}</strong></div>` : ""
    ].filter(Boolean).join("");

    existingContent.innerHTML = `
      <div class="member-modal-header">
        <div class="modal-profile">
          <div class="modal-avatar" style="background:linear-gradient(135deg,${escapeHTML(avatarColor)},${escapeHTML(avatarColor2)})">${escapeHTML(initial)}</div>
          <div>
            <span class="modal-kicker">DOSSIER MEMBRE // FURIOZ</span>
            <h2 class="modal-title" id="member-modal-title">${escapeHTML(name)}</h2>
            <span class="modal-status">${escapeHTML(status)}</span>
            ${countryLabel ? `<span class="modal-country">${escapeHTML(countryLabel)}</span>` : ""}
          </div>
        </div>
        <button class="member-modal-close" id="close-member-modal" type="button" aria-label="Fermer le profil">✕</button>
      </div>

      ${details ? `<div class="modal-detail-grid">${details}</div>` : ""}
      ${description ? `<p class="modal-description">${escapeHTML(description)}</p>` : ""}

      ${Array.isArray(member.tags) && member.tags.length ? `
        <div class="modal-tags">
          ${member.tags.map(tag => `<span class="badge">${escapeHTML(tag)}</span>`).join("")}
        </div>
      ` : ""}

      <div class="member-modal-actions">
        ${member.twitch ? `<a class="twitch" href="${escapeHTML(member.twitch)}" target="_blank" rel="noopener noreferrer">Twitch <span aria-hidden="true">↗</span></a>` : ""}
        ${member.youtube ? `<a class="youtube" href="${escapeHTML(member.youtube)}" target="_blank" rel="noopener noreferrer">YouTube <span aria-hidden="true">↗</span></a>` : ""}
        <a class="discord" href="${escapeHTML(member.discord || "https://discord.gg/nKj9NFDyxj")}" target="_blank" rel="noopener noreferrer">Discord Furioz <span aria-hidden="true">↗</span></a>
      </div>
    `;



    existingModal.setAttribute("aria-labelledby", "member-modal-title");
    existingModal
      .classList
      .add(
        "active"
      );


    document.body.style.overflow =
      "hidden";


    const closeButton =
      document.getElementById(
        "close-member-modal"
      );


    if (closeButton) {

      closeButton.onclick =
        closeMemberModal;

    }


    return;
  }


  // =====================================================
  // FENÊTRE AUTOMATIQUE DE SECOURS
  // =====================================================

  const overlay =
    document.createElement(
      "div"
    );


  overlay.id =
    "generated-member-modal";


  overlay.style.position =
    "fixed";

  overlay.style.inset =
    "0";

  overlay.style.zIndex =
    "99999";

  overlay.style.background =
    "rgba(0,0,0,.55)";

  overlay.style.display =
    "flex";

  overlay.style.alignItems =
    "center";

  overlay.style.justifyContent =
    "center";

  overlay.style.padding =
    "20px";


  const box =
    document.createElement(
      "div"
    );


  box.style.width =
    "min(700px,95vw)";

  box.style.maxHeight =
    "90vh";

  box.style.overflowY =
    "auto";

  box.style.background =
    "#fff";

  box.style.borderRadius =
    "20px";

  box.style.padding =
    "30px";

  box.style.boxShadow =
    "0 20px 60px rgba(0,0,0,.3)";


  box.innerHTML = `

    <div
      style="
        display:flex;
        justify-content:space-between;
        gap:1rem;
      "
    >

      <div>

        <h2
          style="
            margin:0;
          "
        >

          ${escapeHTML(name)}

          <span
            style="
              color:#2563EB;
              font-size:.85rem;
              font-weight:500;
            "
          >

            • ${escapeHTML(status)}

            ${
              member.country

                ? ` • ${escapeHTML(
                    `${countryFlag} ${member.country}`.trim()
                  )}`

                : ""
            }

          </span>

        </h2>

      </div>


      <button
        id="generated-close-modal"
        type="button"

        style="
          width:42px;
          height:42px;
          border:0;
          border-radius:50%;
          background:#F3F0E9;
          font-size:22px;
          cursor:pointer;
        "
      >
        ✕
      </button>

    </div>


    <div
      style="
        margin-top:24px;
      "
    >

      ${
        member.streamSince

          ? `

            <p>

              <strong>
                Stream depuis :
              </strong>

              ${escapeHTML(
                member.streamSince
              )}

            </p>

          `

          : ""
      }


      ${
        member.joined

          ? `

            <p>

              <strong>
                A rejoint la Furioz :
              </strong>

              ${escapeHTML(
                member.joined
              )}

            </p>

          `

          : ""
      }


      ${
        member.role

          ? `

            <p>

              <strong>
                Rôle :
              </strong>

              ${escapeHTML(
                member.role
              )}

            </p>

          `

          : ""
      }


      ${
        description

          ? `

            <p
              style="
                line-height:1.6;
                color:#444;
              "
            >

              ${escapeHTML(
                description
              )}

            </p>

          `

          : ""
      }


      ${
        Array.isArray(
          member.tags
        ) &&
        member.tags.length

          ? `

            <div
              style="
                display:flex;
                flex-wrap:wrap;
                gap:8px;
                margin-top:16px;
              "
            >

              ${member.tags
                .map(
                  tag => `

                    <span
                      style="
                        padding:6px 10px;
                        border-radius:999px;
                        background:#EEE9E1;
                        border:1px solid #DDD5C8;
                        font-size:12px;
                        font-weight:600;
                      "
                    >

                      ${escapeHTML(
                        tag
                      )}

                    </span>

                  `
                )
                .join("")}

            </div>

          `

          : ""
      }


      <div
        style="
          display:flex;
          gap:10px;
          flex-wrap:wrap;
          margin-top:20px;
        "
      >

        ${
          member.twitch

            ? `

              <a
                href="${escapeHTML(
                  member.twitch
                )}"

                target="_blank"
                rel="noopener noreferrer"

                style="
                  padding:10px 16px;
                  border-radius:8px;
                  background:#9146FF;
                  color:#fff;
                  text-decoration:none;
                  font-weight:700;
                "
              >
                Twitch
              </a>

            `

            : ""
        }


        ${
          member.youtube

            ? `

              <a
                href="${escapeHTML(
                  member.youtube
                )}"

                target="_blank"
                rel="noopener noreferrer"

                style="
                  padding:10px 16px;
                  border-radius:8px;
                  background:#111;
                  color:#fff;
                  text-decoration:none;
                  font-weight:700;
                "
              >
                YouTube
              </a>

            `

            : ""
        }


        <a
          href="${escapeHTML(
            member.discord ||
            "https://discord.gg/nKj9NFDyxj"
          )}"

          target="_blank"
          rel="noopener noreferrer"

          style="
            padding:10px 16px;
            border-radius:8px;
            background:#5865F2;
            color:#fff;
            text-decoration:none;
            font-weight:700;
          "
        >
          Discord Furioz
        </a>

      </div>

    </div>
  `;


  overlay.appendChild(
    box
  );


  document.body.appendChild(
    overlay
  );


  document.body.style.overflow =
    "hidden";


  document
    .getElementById(
      "generated-close-modal"
    )
    .onclick =
      closeMemberModal;


  overlay.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        overlay
      ) {

        closeMemberModal();

      }

    }
  );
}


// =========================================================
// FERMER MODALE
// =========================================================

function closeMemberModal() {

  const modal =
    document.getElementById(
      "member-modal"
    );


  if (modal) {

    modal.classList.remove(
      "active"
    );

  }


  const generated =
    document.getElementById(
      "generated-member-modal"
    );


  if (generated) {

    generated.remove();

  }


  document.body.style.overflow =
    "";
}


// =========================================================
// CLIC SUR LE FOND
// =========================================================

document.addEventListener(
  "click",
  event => {

    const modal =
      document.getElementById(
        "member-modal"
      );


    if (
      modal &&
      modal.classList.contains(
        "active"
      ) &&
      event.target ===
        modal
    ) {

      closeMemberModal();

    }

  }
);


// =========================================================
// ÉCHAP
// =========================================================

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key ===
      "Escape"
    ) {

      closeMemberModal();

    }

  }
);


// =========================================================
// TWITCH
// =========================================================

function initTwitch() {

  const player =
    document.getElementById(
      "twitch-player"
    );


  const chat =
    document.getElementById(
      "twitch-chat"
    );


  const badge =
    document.getElementById(
      "live-badge"
    );


  if (!player) {
    return;
  }


  const channel =
    "furiozcompagnie";


  const domain =
    window.location.hostname ||
    "localhost";


  const parents =
    `&parent=localhost` +
    `&parent=${domain}` +
    `&parent=vercel.app` +
    `&parent=www.furiozcompagnie.fr` +
    `&parent=furioz.fr`;


  player.src =
    `https://player.twitch.tv/` +
    `?channel=${channel}` +
    `${parents}` +
    `&muted=true`;


  if (chat) {

    chat.src =
      `https://www.twitch.tv/embed/` +
      `${channel}/chat` +
      `?darkpopout` +
      `${parents}`;

  }


  if (badge) {

    badge.innerHTML =
      '<span class="live-dot"></span> HORS LIGNE — LECTEUR PRÊT';

    badge.className =
      "live-badge offline";

  }
}


// =========================================================
// NAVIGATION
// =========================================================

function initNav() {

  const nav =
    document.getElementById(
      "main-nav"
    );


  if (!nav) {
    return;
  }


  const links =
    document.querySelectorAll(
      "nav .links a[href^='#']"
    );


  window.addEventListener(
    "scroll",
    () => {

      if (
        window.scrollY >
        20
      ) {

        nav.classList.add(
          "scrolled"
        );

      }

      else {

        nav.classList.remove(
          "scrolled"
        );

      }


      let current =
        "";


      document
        .querySelectorAll(
          "section[id]"
        )
        .forEach(
          section => {

            if (
              window.scrollY >=
              section.offsetTop -
              120
            ) {

              current =
                section.id;

            }

          }
        );


      links.forEach(
        link => {

          link.classList.remove(
            "active"
          );


          if (
            link.getAttribute(
              "href"
            ) ===
            "#" + current
          ) {

            link.classList.add(
              "active"
            );

          }

        }
      );

    },
    {
      passive:
        true
    }
  );
}


// =========================================================
// MENU MOBILE
// =========================================================

function initMobileNav() {
  const toggle = document.getElementById("mobile-menu-toggle");
  const links = document.getElementById("main-nav-links");
  if (!toggle || !links) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Ouvrir le menu");
    links.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Ouvrir le menu" : "Fermer le menu");
    links.classList.toggle("open", !isOpen);
  });

  links.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeMenu();
  });
}


// =========================================================
// COPYRIGHT
// =========================================================

function initCopyright() {

  const year =
    document.getElementById(
      "current-year"
    );


  if (year) {

    year.textContent =
      new Date()
        .getFullYear();

  }
}


// =========================================================
// DÉMARRAGE
// =========================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initTwitch();

    initNav();

    initMobileNav();

    initScrollAnimations();

    initCopyright();

    await loadTeam();

  }
);
