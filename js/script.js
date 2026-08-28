// ============================================================
// FURIOZ COMPAGNIE
// script.js
// Membres historiques + membres ajoutés depuis le Panel Admin
// ============================================================

const defaultMembers = {

  reddice: {
    id: "reddice",
    name: "RedDice_Geek",
    role: "FONDATEUR • 🇫🇷 France",
    status: "FONDATEUR",
    badge: "Fondateur • Depuis Septembre 2022 • Stream depuis Aout 2021 • 🇫🇷 France",
    joined: "Septembre 2022",
    streamSince: "Aout 2021",

    twitch: "https://twitch.tv/reddice_geek",
    youtube: "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    discord: "",

    desc: "Fondateur de la Furioz Compagnie en septembre 2022. 🇫🇷 France. Projet pense pour durer : entraide, independance et progression durable.",

    description: "Fondateur de la Furioz Compagnie en septembre 2022. 🇫🇷 France. Projet pense pour durer : entraide, independance et progression durable.",

    tags: [
      "Fondateur",
      "Gaming",
      "Cosplay",
      "IRL",
      "🇫🇷 France"
    ],

    initial: "R",
    color: "#151519",
    country: "France",
    countryFlag: "🇫🇷",
    visible: true
  },


  zafkiel: {
    id: "zafkiel",
    name: "Zafkiel / LePetoChard",
    role: "MEMBRE • 🇫🇷 France",
    status: "MEMBRE",
    badge: "Depuis 23 Novembre 2024 • 🇫🇷 France",
    joined: "23 Novembre 2024",
    streamSince: "2023",

    twitch: "https://www.twitch.tv/le_petochard",
    youtube: "",
    discord: "",

    desc: "LePetoChard, aussi connu sous Zafkiel. 🇫🇷 France. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",

    description: "LePetoChard, aussi connu sous Zafkiel. 🇫🇷 France. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",

    tags: [
      "Gaming",
      "Events",
      "🇫🇷 France"
    ],

    initial: "Z",
    color: "#151519",
    country: "France",
    countryFlag: "🇫🇷",
    visible: true
  },


  foxysword: {
    id: "foxysword",
    name: "Foxy Sword",
    role: "MEMBRE • 🇨🇦 Canada",
    status: "MEMBRE",
    badge: "Depuis 18 Aout 2026 • Gaming • DJ • 🇨🇦 Canada",
    joined: "18 Aout 2026",
    streamSince: "2025",

    twitch: "https://www.twitch.tv/foxysword350",
    youtube: "",
    discord: "",

    desc: "🇨🇦 Vient du Canada. DJ debutant et gamer passionne, Foxy Sword nous a rejoint le 18 Aout 2026. Il streame depuis 2025 entre gaming au sein de la Team [FZ] et lives DJ / mix.",

    description: "🇨🇦 Vient du Canada. DJ debutant et gamer passionne, Foxy Sword nous a rejoint le 18 Aout 2026. Il streame depuis 2025 entre gaming au sein de la Team [FZ] et lives DJ / mix.",

    tags: [
      "Gaming",
      "DJ",
      "Musique",
      "🇨🇦 Canada"
    ],

    initial: "F",
    color: "#151519",
    country: "Canada",
    countryFlag: "🇨🇦",
    visible: true
  },


  quentin: {
    id: "quentin",
    name: "Quentin Pierrot",
    role: "MODO / WEBMASTER • 🇫🇷 France",
    status: "MODO / WEBMASTER",
    badge: "Depuis 20 Aout 2026 • Modo / Webmaster • Avali VRChat • 🇫🇷 France",
    joined: "20 Aout 2026",
    streamSince: "2023",

    twitch: "https://twitch.tv/furiozcompagnie",
    youtube: "",
    discord: "",

    desc: "Avali de VRChat, Quentin Pierrot nous a rejoint le 20 Aout 2026 principalement en tant que modo, webmaster du site et gestion du Discord. Il s'occupe aussi des clips et stream parfois sur la chaine Twitch Furioz Compagnie. 🇫🇷 Vient de France.",

    description: "Avali de VRChat, Quentin Pierrot nous a rejoint le 20 Aout 2026 principalement en tant que modo, webmaster du site et gestion du Discord. Il s'occupe aussi des clips et stream parfois sur la chaine Twitch Furioz Compagnie. 🇫🇷 Vient de France.",

    tags: [
      "Modo",
      "Webmaster",
      "VRChat",
      "Avali",
      "🇫🇷 France",
      "Clips",
      "Discord"
    ],

    initial: "Q",
    color: "#16C7B7",
    country: "France",
    countryFlag: "🇫🇷",
    visible: true
  }
};


// ============================================================
// MEMBRES
// ============================================================

let members = structuredClone(defaultMembers);


// ============================================================
// SÉCURITÉ HTML
// ============================================================

function escapeHTML(value) {

  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


// ============================================================
// NORMALISATION MEMBRE
// ============================================================

function normalizeMember(m) {

  const old = members[m.id] || {};

  return {

    ...old,
    ...m,

    desc:
      m.desc ??
      m.description ??
      old.desc ??
      old.description ??
      "",

    description:
      m.description ??
      m.desc ??
      old.description ??
      old.desc ??
      "",

    tags:
      Array.isArray(m.tags)
        ? m.tags
        : (old.tags || []),

    visible:
      m.visible !== false
  };
}


// ============================================================
// CONSTRUCTION D'UNE CARTE
// ============================================================

function buildCard(m) {

  const badge =
    m.badge ||
    [
      m.joined
        ? `Depuis ${m.joined}`
        : "",

      m.role || "",

      m.category || "",

      m.country
        ? `${m.countryFlag || ""} ${m.country}`.trim()
        : ""

    ]
      .filter(Boolean)
      .join(" • ");


  return `
    <div
      class="team-card ${m.status === "FONDATEUR" ? "founder" : ""}"
      data-id="${escapeHTML(m.id)}"
    >

      <div
        class="avatar"
        style="background:${escapeHTML(
          m.color || "#151519"
        )}"
      >
        ${escapeHTML(
          m.initial ||
          m.name?.charAt(0) ||
          "?"
        )}
      </div>

      <h4 style="margin:.4rem 0 0">
        ${escapeHTML(m.name)}
      </h4>

      <small class="badge">
        ${escapeHTML(badge)}
      </small>

    </div>
  `;
}


// ============================================================
// AFFICHAGE DE L'ÉQUIPE
// ============================================================

function renderTeam() {

  const grid =
    document.getElementById("team-grid");

  if (!grid) {
    return;
  }


  const visibleMembers =
    Object.values(members)
      .filter(
        member =>
          member.visible !== false
      );


  const maxPlaces = 10;

  const remaining =
    Math.max(
      0,
      maxPlaces - visibleMembers.length
    );


  // Membres
  const memberHTML =
    visibleMembers
      .map(buildCard)
      .join("");


  // Places libres
  const emptyHTML =
    Array
      .from(
        { length: remaining },
        (_, i) => {

          return `
            <div class="team-card empty">

              <h4>
                Place libre
              </h4>

              <small>

                ${
                  i === 0

                    ? `${remaining} place${
                        remaining > 1
                          ? "s"
                          : ""
                      } restante${
                        remaining > 1
                          ? "s"
                          : ""
                      }`

                    : "Rejoins-nous"
                }

              </small>

              ${
                i === 0

                  ? `
                    <br>

                    <a
                      href="https://forms.gle/7hA9ac26qJn7AHjc6"
                      target="_blank"
                      style="
                        color:var(--blue);
                        font-weight:600
                      "
                    >
                      Postuler
                    </a>
                  `

                  : ""
              }

            </div>
          `;
        }
      )
      .join("");


  grid.innerHTML =
    memberHTML + emptyHTML;


  // Mise à jour du texte du haut
  const kicker =
    document.getElementById(
      "team-kicker"
    );


  if (kicker) {

    kicker.textContent =
      `Stream Team [FZ] • ` +
      `${maxPlaces} places max • ` +
      `${visibleMembers.length} membre${
        visibleMembers.length > 1
          ? "s"
          : ""
      }`;
  }
}


// ============================================================
// API ÉQUIPE
// ============================================================

async function loadAdminMembers() {

  /*
   * IMPORTANT
   *
   * On affiche les membres existants
   * AVANT d'appeler l'API.
   *
   * Donc même si Vercel renvoie 404,
   * les membres restent affichés.
   */

  renderTeam();


  try {

    const response =
      await fetch(
        "/api/team",
        {
          cache: "no-store"
        }
      );


    // --------------------------------------------
    // API 404 / 500 / etc.
    // --------------------------------------------

    if (!response.ok) {

      console.warn(
        "API équipe indisponible :",
        response.status
      );

      // Ne rien remplacer.
      // Les membres existants restent affichés.

      return;
    }


    // --------------------------------------------
    // Vérification JSON
    // --------------------------------------------

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
        "L'API /api/team ne renvoie pas du JSON."
      );

      return;
    }


    // --------------------------------------------
    // Lecture API
    // --------------------------------------------

    const list =
      await response.json();


    if (!Array.isArray(list)) {

      console.warn(
        "Réponse /api/team incorrecte."
      );

      return;
    }


    // --------------------------------------------
    // Fusion avec les membres existants
    // --------------------------------------------

    for (const item of list) {

      if (
        !item ||
        !item.id
      ) {
        continue;
      }


      members[item.id] =
        normalizeMember(item);
    }


    // Réafficher après fusion
    renderTeam();

  }

  catch (error) {

    console.warn(
      "Impossible de charger /api/team :",
      error
    );

    /*
     * NE PAS afficher :
     *
     * Équipe indisponible
     * Réessaie plus tard
     *
     * Les membres existants restent
     * simplement affichés.
     */
  }
}


// ============================================================
// TWITCH
// ============================================================

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

    badge.textContent =
      "OFFLINE - Player charge";

    badge.className =
      "live-badge offline";
  }
}


// ============================================================
// NAVIGATION
// ============================================================

function initNav() {

  const nav =
    document.getElementById(
      "main-nav"
    );


  const links =
    document.querySelectorAll(
      "nav .links a[href^='#']"
    );


  const logo =
    document.getElementById(
      "logo-link"
    );


  if (!nav) {
    return;
  }


  window.addEventListener(
    "scroll",
    () => {

      if (window.scrollY > 20) {

        nav.classList.add(
          "scrolled"
        );

      } else {

        nav.classList.remove(
          "scrolled"
        );
      }


      let current = "";


      document
        .querySelectorAll(
          "section[id]"
        )
        .forEach(
          section => {

            if (
              window.scrollY >=
              section.offsetTop - 120
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
            ) === "#" + current
          ) {

            link.classList.add(
              "active"
            );
          }
        }
      );
    },

    {
      passive: true
    }
  );


  links.forEach(
    link => {

      link.addEventListener(
        "click",
        event => {

          const href =
            link.getAttribute(
              "href"
            );


          if (
            !href.startsWith("#")
          ) {
            return;
          }


          event.preventDefault();


          const target =
            document.querySelector(
              href
            );


          if (target) {

            window.scrollTo({

              top:
                target.offsetTop -
                72,

              behavior:
                "smooth"
            });
          }
        }
      );
    }
  );


  if (logo) {

    logo.addEventListener(
      "click",
      event => {

        event.preventDefault();


        window.scrollTo({

          top: 0,

          behavior:
            "smooth"
        });
      }
    );
  }
}


// ============================================================
// FENÊTRE MEMBRE
// ============================================================

function initModals() {

  if (window.__furiozInit) {
    return;
  }


  window.__furiozInit =
    true;


  const modal =
    document.getElementById(
      "member-modal"
    );


  const content =
    document.getElementById(
      "modal-content"
    );


  const grid =
    document.getElementById(
      "team-grid"
    );


  if (
    !modal ||
    !content ||
    !grid
  ) {
    return;
  }


  function closeModal() {

    modal.classList.remove(
      "active"
    );

    document.body.style.overflow =
      "";
  }


  function openMember(id) {

    const m =
      members[id];


    if (!m) {
      return;
    }


    const description =
      m.desc ||
      m.description ||
      "";


    content.innerHTML = `

      <div
        style="
          display:flex;
          justify-content:space-between;
          align-items:start;
          gap:1rem
        "
      >

        <div>

          <h2
            style="
              margin:0 0 .2rem
            "
          >

            ${escapeHTML(m.name)}

            <span
              style="
                color:var(--blue);
                font-weight:400;
                font-size:.85rem
              "
            >

              • ${escapeHTML(
                m.status ||
                m.role ||
                "MEMBRE"
              )}

            </span>

          </h2>


          <span class="badge">

            ${escapeHTML(
              m.badge || ""
            )}

          </span>

        </div>


        <button
          id="close-modal"

          style="
            background:var(--gray);
            border:0;
            width:36px;
            height:36px;
            border-radius:50%;
            cursor:pointer;
            font-size:1.2rem
          "
        >
          ✕
        </button>

      </div>


      <div
        style="
          margin-top:1rem;
          display:grid;
          gap:.8rem
        "
      >

        <p>

          <strong>
            Stream depuis :
          </strong>

          ${escapeHTML(
            m.streamSince || ""
          )}

          <br>


          <strong>
            A rejoint la Furioz :
          </strong>

          ${escapeHTML(
            m.joined || ""
          )}


          ${
            m.role

              ? `
                <br>

                <strong>
                  Rôle :
                </strong>

                ${escapeHTML(
                  m.role
                )}
              `

              : ""
          }

        </p>


        <p
          style="
            color:#444;
            line-height:1.6
          "
        >

          ${escapeHTML(
            description
          )}

        </p>


        <div
          style="
            display:flex;
            gap:.5rem;
            flex-wrap:wrap
          "
        >

          ${
            (m.tags || [])
              .map(
                tag => `

                  <span
                    class="badge"

                    style="
                      background:#E8E2D9;
                      color:#1E293B;
                      border-color:#D1C9B8
                    "
                  >

                    ${escapeHTML(tag)}

                  </span>

                `
              )
              .join("")
          }

        </div>


        <div
          style="
            display:flex;
            gap:.6rem;
            flex-wrap:wrap;
            margin-top:.5rem
          "
        >


          ${
            m.twitch

              ? `
                <a
                  href="${escapeHTML(
                    m.twitch
                  )}"

                  target="_blank"

                  class="btn btn-dark"

                  style="
                    background:#9146FF;
                    color:#fff;
                    padding:.6rem 1rem;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:700
                  "
                >
                  Twitch
                </a>
              `

              : ""
          }


          ${
            m.youtube

              ? `
                <a
                  href="${escapeHTML(
                    m.youtube
                  )}"

                  target="_blank"

                  class="btn btn-white"

                  style="
                    padding:.6rem 1rem;
                    border-radius:8px;
                    text-decoration:none;
                    font-weight:700;
                    border:1px solid #ddd
                  "
                >
                  YouTube
                </a>
              `

              : ""
          }


          <a

            href="${escapeHTML(
              m.discord ||
              "https://discord.gg/nKj9NFDyxj"
            )}"

            target="_blank"

            class="btn btn-discord"

            style="
              padding:.6rem 1rem;
              border-radius:8px;
              text-decoration:none;
              font-weight:700
            "
          >
            Discord Furioz
          </a>

        </div>

      </div>
    `;


    modal.classList.add(
      "active"
    );


    document.body.style.overflow =
      "hidden";


    const closeButton =
      document.getElementById(
        "close-modal"
      );


    if (closeButton) {

      closeButton.onclick =
        closeModal;
    }
  }


  // Clic sur membre

  grid.addEventListener(
    "click",
    event => {

      const card =
        event.target.closest(
          ".team-card[data-id]"
        );


      if (!card) {
        return;
      }


      openMember(
        card.dataset.id
      );
    }
  );


  // Clic extérieur

  modal.addEventListener(
    "click",
    event => {

      if (
        event.target === modal
      ) {

        closeModal();
      }
    }
  );


  // ESC

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape"
      ) {

        closeModal();
      }
    }
  );
}


// ============================================================
// COPYRIGHT
// ============================================================

function initCopyright() {

  const year =
    document.getElementById(
      "current-year"
    );


  if (year) {

    year.textContent =
      new Date().getFullYear();
  }
}


// ============================================================
// DÉMARRAGE
// ============================================================

document.addEventListener(
  "DOMContentLoaded",
  async () => {

    initTwitch();

    initNav();

    initModals();

    initCopyright();


    /*
     * Les membres historiques
     * sont affichés immédiatement.
     *
     * Ensuite l'API Admin est chargée.
     *
     * Si /api/team est en 404 :
     * les membres restent affichés.
     */

    await loadAdminMembers();
  }
);
