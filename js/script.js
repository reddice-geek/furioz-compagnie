/* =========================================================
   FURIOZ COMPAGNIE
   script.js
   Gestion dynamique de la Team
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  loadTeam();
});


/* =========================================================
   SÉCURITÉ HTML
   ========================================================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


/* =========================================================
   CHARGEMENT DE L'ÉQUIPE
   ========================================================= */

async function loadTeam() {

  const container = document.querySelector("#team-grid");

  if (!container) {
    return;
  }

  container.innerHTML = `
    <div class="team-card empty">
      <h3>Chargement...</h3>
    </div>
  `;

  try {

    const response = await fetch("/api/team", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(
        "Erreur API : " + response.status
      );
    }

    const contentType =
      response.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      throw new Error(
        "L'API /api/team ne renvoie pas du JSON."
      );
    }

    const data = await response.json();

    let members = [];

    if (Array.isArray(data)) {
      members = data;
    }

    else if (Array.isArray(data.members)) {
      members = data.members;
    }

    else if (Array.isArray(data.team)) {
      members = data.team;
    }

    if (members.length === 0) {

      container.innerHTML = `
        <div class="team-card empty">
          <h3>Aucun membre</h3>
          <p>L'équipe est actuellement vide.</p>
        </div>
      `;

      return;
    }

    renderTeam(members);

  }

  catch (error) {

    console.error(
      "Erreur chargement équipe :",
      error
    );

    container.innerHTML = `
      <div class="team-card empty">
        <h3>Équipe indisponible</h3>
        <p>Réessaie plus tard</p>
      </div>
    `;
  }
}


/* =========================================================
   AFFICHAGE DE L'ÉQUIPE
   ========================================================= */

function renderTeam(members) {

  const container =
    document.querySelector("#team-grid");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  members.forEach(member => {

    const wrapper =
      document.createElement("div");

    wrapper.innerHTML =
      buildCard(member).trim();

    const card =
      wrapper.firstElementChild;

    if (!card) {
      return;
    }

    card.addEventListener("click", () => {
      openMemberModal(member);
    });

    container.appendChild(card);
  });


  /* ==========================================
     PLACES LIBRES
     Maximum : 10 membres
     ========================================== */

  const maximum = 10;

  const remaining =
    Math.max(0, maximum - members.length);

  for (let i = 0; i < remaining; i++) {

    const freeCard =
      document.createElement("div");

    freeCard.className =
      "team-card free-place";

    if (i === 0) {

      freeCard.innerHTML = `
        <h3>Place libre</h3>

        <p>
          ${remaining} place${remaining > 1 ? "s" : ""}
          restante${remaining > 1 ? "s" : ""}
        </p>

        <a href="#postuler">
          Postuler
        </a>
      `;
    }

    else {

      freeCard.innerHTML = `
        <h3>Place libre</h3>
        <p>Rejoins-nous</p>
      `;
    }

    container.appendChild(freeCard);
  }
}


/* =========================================================
   CRÉATION D'UNE CARTE
   ========================================================= */

function buildCard(m) {

  const name =
    m.name ||
    m.pseudo ||
    "Membre";

  const initial =
    m.initial ||
    name.charAt(0).toUpperCase();

  const status =
    String(
      m.status ||
      m.role ||
      ""
    ).toUpperCase();


  /* -----------------------------------------
     Informations du badge
     ----------------------------------------- */

  const badgeParts = [];

  if (m.joined) {
    badgeParts.push(
      `Depuis ${m.joined}`
    );
  }

  if (m.category) {
    badgeParts.push(m.category);
  }

  if (
    m.role &&
    String(m.role).toUpperCase() !== "FONDATEUR"
  ) {
    badgeParts.push(m.role);
  }

  if (m.country) {

    const countryText =
      `${m.countryFlag || ""} ${m.country}`
        .trim();

    badgeParts.push(countryText);
  }

  const badge =
    m.badge ||
    badgeParts.join(" • ");


  /* =====================================================
     CARTE DU FONDATEUR
     ===================================================== */

  if (
    status === "FONDATEUR" ||
    status === "FOUNDER"
  ) {

    return `
      <article
        class="team-card founder"
        data-id="${escapeHTML(m.id || "")}"
      >

        <div
          class="avatar"
          style="
            background:${escapeHTML(
              m.color || "#151519"
            )}
          "
        >
          ${escapeHTML(initial)}
        </div>


        <div class="member-info">

          <h3 class="member-name">

            ${escapeHTML(name)}

            <span class="member-status">
              • FONDATEUR
            </span>

          </h3>


          ${
            badge
              ? `
                <div class="badge">
                  ${escapeHTML(badge)}
                </div>
              `
              : ""
          }


          ${
            m.streamSince
              ? `
                <p class="member-small">
                  <strong>Stream depuis :</strong>
                  ${escapeHTML(m.streamSince)}
                </p>
              `
              : ""
          }


          ${
            m.description || m.desc
              ? `
                <p class="member-description">
                  ${escapeHTML(
                    m.description ||
                    m.desc
                  )}
                </p>
              `
              : ""
          }

        </div>

      </article>
    `;
  }


  /* =====================================================
     CARTES NORMALES
     ===================================================== */

  return `
    <article
      class="team-card"
      data-id="${escapeHTML(m.id || "")}"
    >

      <div
        class="avatar"
        style="
          background:${escapeHTML(
            m.color || "#151519"
          )}
        "
      >
        ${escapeHTML(initial)}
      </div>


      <h3 class="member-name">
        ${escapeHTML(name)}
      </h3>


      ${
        badge
          ? `
            <div class="badge">
              ${escapeHTML(badge)}
            </div>
          `
          : ""
      }

    </article>
  `;
}


/* =========================================================
   FENÊTRE D'INFORMATION DU MEMBRE
   ========================================================= */

function openMemberModal(member) {

  closeMemberModal();

  const name =
    member.name ||
    member.pseudo ||
    "Membre";

  const status =
    member.status ||
    member.role ||
    "MEMBRE";

  const modal =
    document.createElement("div");

  modal.id = "member-modal";

  modal.className =
    "member-modal-overlay";


  modal.innerHTML = `
    <div class="member-modal">

      <button
        type="button"
        class="member-modal-close"
        aria-label="Fermer"
      >
        ×
      </button>


      <h2>
        ${escapeHTML(name)}

        <small>
          • ${escapeHTML(status)}
        </small>
      </h2>


      ${
        member.joined
          ? `
            <p>
              <strong>
                A rejoint la Furioz :
              </strong>

              ${escapeHTML(member.joined)}
            </p>
          `
          : ""
      }


      ${
        member.streamSince
          ? `
            <p>
              <strong>
                Stream depuis :
              </strong>

              ${escapeHTML(member.streamSince)}
            </p>
          `
          : ""
      }


      ${
        member.country
          ? `
            <p>
              <strong>Pays :</strong>

              ${escapeHTML(
                `${member.countryFlag || ""} ${member.country}`.trim()
              )}
            </p>
          `
          : ""
      }


      ${
        member.description ||
        member.desc
          ? `
            <p class="member-modal-description">
              ${escapeHTML(
                member.description ||
                member.desc
              )}
            </p>
          `
          : ""
      }


      ${
        Array.isArray(member.tags) &&
        member.tags.length > 0
          ? `
            <div class="member-tags">

              ${member.tags.map(tag => `
                <span>
                  ${escapeHTML(tag)}
                </span>
              `).join("")}

            </div>
          `
          : ""
      }


      <div class="member-links">

        ${
          member.twitch
            ? `
              <a
                href="${escapeHTML(member.twitch)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Twitch
              </a>
            `
            : ""
        }


        ${
          member.discord
            ? `
              <a
                href="${escapeHTML(member.discord)}"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord Furioz
              </a>
            `
            : ""
        }

      </div>

    </div>
  `;


  document.body.appendChild(modal);


  const closeButton =
    modal.querySelector(
      ".member-modal-close"
    );

  closeButton.addEventListener(
    "click",
    closeMemberModal
  );


  modal.addEventListener(
    "click",
    event => {

      if (event.target === modal) {
        closeMemberModal();
      }

    }
  );
}


/* =========================================================
   FERMETURE MODALE
   ========================================================= */

function closeMemberModal() {

  const modal =
    document.querySelector(
      "#member-modal"
    );

  if (modal) {
    modal.remove();
  }
}


/* =========================================================
   TOUCHE ÉCHAP
   ========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (event.key === "Escape") {
      closeMemberModal();
    }

  }
);
