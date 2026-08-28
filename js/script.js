// =========================================================
// FURIOZ COMPAGNIE
// script.js
// Team locale + Team API Admin
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
    description: "Fondateur de la Furioz Compagnie en septembre 2022. Projet pense pour durer : entraide, independance et progression durable.",
    tags: ["Fondateur", "Gaming", "Cosplay", "IRL", "🇫🇷 France"],
    twitch: "https://twitch.tv/reddice_geek",
    youtube: "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    discord: "",
    initial: "R",
    color: "#151519",
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
    description: "LePetoChard, aussi connu sous Zafkiel. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",
    tags: ["Gaming", "Events", "🇫🇷 France"],
    twitch: "https://www.twitch.tv/le_petochard",
    youtube: "",
    discord: "",
    initial: "Z",
    color: "#151519",
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
    description: "DJ debutant et gamer passionne. A rejoint la Furioz le 18/08/2026.",
    tags: ["Gaming", "DJ", "Musique", "🇨🇦 Canada"],
    twitch: "https://www.twitch.tv/foxysword350",
    youtube: "",
    discord: "",
    initial: "F",
    color: "#151519",
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
    description: "Modo, webmaster du site et gestion du Discord.",
    tags: ["Modo", "Webmaster", "VRChat", "Avali", "🇫🇷 France"],
    twitch: "https://twitch.tv/furiozcompagnie",
    youtube: "",
    discord: "",
    initial: "Q",
    color: "#16C7B7",
    visible: true
  }
];


document.addEventListener("DOMContentLoaded", () => {
  loadTeam();
});


function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


async function loadTeam() {

  const container =
    document.querySelector("#team-grid");

  if (!container) {
    return;
  }

  // Affichage immédiat des membres existants
  renderTeam(fallbackMembers);

  try {

    const response =
      await fetch("/api/team", {
        method: "GET",
        headers: {
          "Accept": "application/json"
        },
        cache: "no-store"
      });

    if (!response.ok) {
      console.warn(
        "API Team indisponible :",
        response.status
      );

      // On garde fallbackMembers
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

    if (Array.isArray(data)) {
      apiMembers = data;
    }

    else if (
      Array.isArray(data.members)
    ) {
      apiMembers = data.members;
    }

    else if (
      Array.isArray(data.team)
    ) {
      apiMembers = data.team;
    }

    if (!apiMembers.length) {
      return;
    }


    // Fusion :
    // même ID = modification
    // nouvel ID = ajout
    const map =
      new Map(
        fallbackMembers.map(
          member => [
            member.id,
            member
          ]
        )
      );

    apiMembers.forEach(
      member => {

        if (!member?.id) {
          return;
        }

        const old =
          map.get(member.id) || {};

        map.set(
          member.id,
          {
            ...old,
            ...member
          }
        );
      }
    );


    const finalMembers =
      Array.from(
        map.values()
      );

    renderTeam(finalMembers);

  }

  catch (error) {

    console.warn(
      "Impossible de charger /api/team :",
      error
    );

    // Important :
    // on garde les membres existants
  }
}


function renderTeam(members) {

  const container =
    document.querySelector("#team-grid");

  if (!container) {
    return;
  }


  const visibleMembers =
    members.filter(
      member =>
        member.visible !== false
    );


  container.innerHTML = "";


  visibleMembers.forEach(
    member => {

      const wrapper =
        document.createElement(
          "div"
        );


      wrapper.innerHTML =
        buildCard(member).trim();


      const card =
        wrapper.firstElementChild;


      if (!card) {
        return;
      }


      card.addEventListener(
        "click",
        () => {
          openMemberModal(
            member
          );
        }
      );


      container.appendChild(
        card
      );
    }
  );


  // Maximum 10 membres
  const maximum = 10;

  const remaining =
    Math.max(
      0,
      maximum -
      visibleMembers.length
    );


  for (
    let i = 0;
    i < remaining;
    i++
  ) {

    const freeCard =
      document.createElement(
        "div"
      );


    freeCard.className =
      "team-card free-place";


    if (i === 0) {

      freeCard.innerHTML = `

        <h3>
          Place libre
        </h3>

        <p>
          ${remaining}
          place${remaining > 1 ? "s" : ""}
          restante${remaining > 1 ? "s" : ""}
        </p>

        <a
          href="https://forms.gle/7hA9ac26qJn7AHjc6"
          target="_blank"
        >
          Postuler
        </a>
      `;
    }

    else {

      freeCard.innerHTML = `

        <h3>
          Place libre
        </h3>

        <p>
          Rejoins-nous
        </p>
      `;
    }


    container.appendChild(
      freeCard
    );
  }
}


function buildCard(m) {

  const name =
    m.name ||
    m.pseudo ||
    "Membre";


  const initial =
    m.initial ||
    name
      .charAt(0)
      .toUpperCase();


  const status =
    String(
      m.status ||
      m.role ||
      ""
    ).toUpperCase();


  const badgeParts = [];


  if (m.joined) {

    badgeParts.push(
      `Depuis ${m.joined}`
    );
  }


  if (m.category) {

    badgeParts.push(
      m.category
    );
  }


  if (
    m.role &&
    String(m.role)
      .toUpperCase() !==
      "FONDATEUR"
  ) {

    badgeParts.push(
      m.role
    );
  }


  if (m.country) {

    badgeParts.push(
      `${
        m.countryFlag || ""
      } ${
        m.country
      }`.trim()
    );
  }


  const badge =
    m.badge ||
    badgeParts
      .filter(Boolean)
      .join(" • ");


  // =========================
  // FONDATEUR
  // =========================

  if (
    status === "FONDATEUR" ||
    status === "FOUNDER"
  ) {

    return `

      <article
        class="team-card founder"
        data-id="${escapeHTML(
          m.id || ""
        )}"
      >

        <div
          class="avatar"

          style="
            background:${escapeHTML(
              m.color ||
              "#151519"
            )}
          "
        >
          ${escapeHTML(
            initial
          )}
        </div>


        <div
          class="member-info"
        >

          <h3
            class="member-name"
          >

            ${escapeHTML(
              name
            )}

            <span
              class="member-status"
            >
              • FONDATEUR
            </span>

          </h3>


          <div
            class="badge"
          >
            ${escapeHTML(
              badge
            )}
          </div>


          ${
            m.description

              ? `

                <p
                  class="
                    member-description
                  "
                >
                  ${escapeHTML(
                    m.description
                  )}
                </p>
              `

              : ""
          }

        </div>

      </article>
    `;
  }


  // =========================
  // MEMBRES NORMAUX
  // =========================

  return `

    <article
      class="team-card"

      data-id="${escapeHTML(
        m.id || ""
      )}"
    >

      <div
        class="avatar"

        style="
          background:${escapeHTML(
            m.color ||
            "#151519"
          )}
        "
      >

        ${escapeHTML(
          initial
        )}

      </div>


      <h3
        class="member-name"
      >

        ${escapeHTML(
          name
        )}

      </h3>


      <div
        class="badge"
      >

        ${escapeHTML(
          badge
        )}

      </div>

    </article>
  `;
}


function openMemberModal(member) {

  closeMemberModal();


  const name =
    member.name ||
    "Membre";


  const status =
    member.status ||
    member.role ||
    "MEMBRE";


  const modal =
    document.createElement(
      "div"
    );


  modal.id =
    "member-modal";


  modal.className =
    "member-modal-overlay";


  modal.innerHTML = `

    <div
      class="member-modal"
    >

      <button
        type="button"
        class="member-modal-close"
      >
        ×
      </button>


      <h2>

        ${escapeHTML(
          name
        )}

        <small>

          • ${escapeHTML(
            status
          )}

        </small>

      </h2>


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
        member.country

          ? `

            <p>

              <strong>
                Pays :
              </strong>

              ${escapeHTML(
                `${
                  member.countryFlag ||
                  ""
                } ${
                  member.country
                }`.trim()
              )}

            </p>
          `

          : ""
      }


      ${
        member.description

          ? `

            <p
              class="
                member-modal-description
              "
            >

              ${escapeHTML(
                member.description
              )}

            </p>
          `

          : ""
      }


      ${
        Array.isArray(
          member.tags
        )

          ? `

            <div
              class="
                member-tags
              "
            >

              ${member.tags
                .map(
                  tag => `

                    <span>
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
        class="
          member-links
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
        >
          Discord Furioz
        </a>

      </div>

    </div>
  `;


  document.body
    .appendChild(
      modal
    );


  const close =
    modal.querySelector(
      ".member-modal-close"
    );


  if (close) {

    close.addEventListener(
      "click",
      closeMemberModal
    );
  }


  modal.addEventListener(
    "click",
    event => {

      if (
        event.target ===
        modal
      ) {

        closeMemberModal();
      }
    }
  );
}


function closeMemberModal() {

  const modal =
    document.querySelector(
      "#member-modal"
    );


  if (modal) {

    modal.remove();
  }
}


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
