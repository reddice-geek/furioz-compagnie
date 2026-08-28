// ============================================================
// FURIOZ COMPAGNIE - js/security.js
// Furioz Shield + compteur de visites
// ============================================================

(function () {
  const ALERT_API =
    "/api/security-alert";

  const VISIT_API =
    "/api/visit";

  const RATE = {};

  const limit = (
    type,
    ms = 60000
  ) => {
    const now =
      Date.now();

    if (
      !RATE[type] ||
      now - RATE[type] > ms
    ) {
      RATE[type] = now;
      return true;
    }

    return false;
  };

  async function postJSON(
    url,
    body
  ) {
    try {
      await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body:
          JSON.stringify(body),
        keepalive: true
      });
    } catch {}
  }

  async function send(
    type,
    details
  ) {
    if (!limit(type)) {
      return;
    }

    await postJSON(
      ALERT_API,
      {
        type,
        details,
        page:
          location.href
      }
    );
  }

  // ----------------------------------------------------------
  // VISITE NORMALE
  // Une fois par chargement de page.
  // ----------------------------------------------------------

  postJSON(
    VISIT_API,
    {
      page:
        location.href
    }
  );

  // ----------------------------------------------------------
  // XSS / URL suspecte
  // ----------------------------------------------------------

  try {
    const params =
      location.search +
      location.hash;

    const patterns = [
      /<script/i,
      /javascript:/i,
      /onerror=/i,
      /onload=/i,
      /eval\(/i,
      /union.*select/i
    ];

    patterns.forEach(
      pattern => {
        if (
          pattern.test(params)
        ) {
          send(
            "xss_attempt",
            `${pattern} in ${params.slice(0, 200)}`
          );
        }
      }
    );
  } catch {}

  // ----------------------------------------------------------
  // DEVTOOLS
  // ----------------------------------------------------------

  let open = false;

  setInterval(
    () => {
      const widthGap =
        window.outerWidth -
        window.innerWidth >
        160;

      const heightGap =
        window.outerHeight -
        window.innerHeight >
        160;

      if (
        (widthGap || heightGap) &&
        !open
      ) {
        open = true;

        send(
          "devtools_open",
          `outer ${window.outerWidth}x${window.outerHeight}`
        );

        setTimeout(
          () => {
            if (
              window.outerWidth -
              window.innerWidth >
              160
            ) {
              send(
                "devtools_persistent",
                ">10s"
              );
            }
          },
          10000
        );
      }
    },
    2000
  );

  // ----------------------------------------------------------
  // CLICS ANORMAUX
  // ----------------------------------------------------------

  let clicks = 0;

  document.addEventListener(
    "click",
    event => {
      if (
        event.target.closest(
          ".team-card[data-id]"
        )
      ) {
        clicks++;

        if (clicks > 25) {
          send(
            "rate_limit",
            "25+ clicks"
          );

          clicks = 0;
        }

        setTimeout(
          () => {
            clicks =
              Math.max(
                0,
                clicks - 1
              );
          },
          3000
        );
      }
    }
  );

  // ----------------------------------------------------------
  // RECHARGEMENTS
  // ----------------------------------------------------------

  let reloads =
    parseInt(
      sessionStorage.getItem(
        "frz_reloads"
      ) || "0",
      10
    ) + 1;

  sessionStorage.setItem(
    "frz_reloads",
    String(reloads)
  );

  if (reloads > 10) {
    send(
      "ddos_suspect",
      "10+ reloads"
    );
  }

  console.log(
    "%c🛡️ Furioz Shield actif",
    "color:#0066FF;font-weight:bold"
  );
})();
