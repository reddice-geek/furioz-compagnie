// ============================================================
// FURIOZ COMPAGNIE - api/guestbook.js
// Livre d'or persistant Redis
// ============================================================

import {
  getIP,
  rateLimit,
  logIntrusion,
  getRedisClient
} from "./_utils.js";

let fallbackGuestbook = [
  {
    id: "1",
    name: "Zafkiel",
    message:
      "Meilleure team depuis 2024, entraide de fou ! 🔥",
    rating: 5,
    date: "2024-11-25",
    verified: true,
    ip: "hidden"
  },
  {
    id: "2",
    name: "FoxySword",
    message:
      "Rejoins depuis Canada, ambiance incroyable",
    rating: 5,
    date: "2026-08-18",
    verified: true,
    ip: "hidden"
  }
];

function publicEntry(entry) {
  const {
    ip,
    ua,
    ...publicData
  } = entry;

  return publicData;
}

async function seedGuestbook(redis) {
  if (!redis) {
    return;
  }

  const count =
    await redis.zCard(
      "furioz:guestbook:order"
    );

  if (count > 0) {
    return;
  }

  const multi = redis.multi();

  for (
    const entry of fallbackGuestbook
  ) {
    multi.hSet(
      "furioz:guestbook:data",
      entry.id,
      JSON.stringify(entry)
    );

    multi.zAdd(
      "furioz:guestbook:order",
      [
        {
          score:
            new Date(
              `${entry.date}T00:00:00Z`
            ).getTime(),
          value:
            entry.id
        }
      ]
    );
  }

  await multi.exec();
}

async function getGuestbook(redis) {
  if (!redis) {
    return fallbackGuestbook
      .map(publicEntry)
      .reverse();
  }

  await seedGuestbook(redis);

  const ids =
    await redis.zRange(
      "furioz:guestbook:order",
      0,
      -1,
      {
        REV: true
      }
    );

  if (!ids.length) {
    return [];
  }

  const values =
    await redis.hmGet(
      "furioz:guestbook:data",
      ids
    );

  return values
    .map(value => {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .map(publicEntry);
}

export default async function handler(
  req,
  res
) {
  const ip =
    getIP(req);

  const redis =
    await getRedisClient();

  // ----------------------------------------------------------
  // GET
  // ----------------------------------------------------------

  if (req.method === "GET") {
    try {
      const list =
        await getGuestbook(
          redis
        );

      return res
        .status(200)
        .json(list);

    } catch (error) {
      console.error(
        "[guestbook GET]",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Impossible de charger le livre d'or"
        });
    }
  }

  // ----------------------------------------------------------
  // POST
  // ----------------------------------------------------------

  if (req.method === "POST") {
    const rl =
      rateLimit(
        ip,
        "guestbook"
      );

    if (!rl.allowed) {
      await logIntrusion(
        ip,
        "guestbook_spam",
        `Blocked ${rl.retryAfter}s`
      );

      return res
        .status(429)
        .json({
          error:
            `Trop de messages, réessaye dans ${rl.retryAfter}s`,
          retryAfter:
            rl.retryAfter
        });
    }

    try {
      const body =
        typeof req.body ===
        "string"
          ? JSON.parse(
              req.body
            )
          : req.body || {};

      const {
        name,
        message,
        rating
      } = body;

      if (
        !name ||
        !message ||
        name.length < 2 ||
        name.length > 30 ||
        message.length < 10 ||
        message.length > 500
      ) {
        return res
          .status(400)
          .json({
            error:
              "Nom 2-30, message 10-500 chars"
          });
      }

      if (
        /<script|javascript:|onerror=|onload=|eval\(/i
          .test(
            name +
            message
          )
      ) {
        await logIntrusion(
          ip,
          "xss_guestbook",
          message.substring(
            0,
            100
          )
        );

        return res
          .status(400)
          .json({
            error:
              "Contenu interdit"
          });
      }

      const id =
        `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;

      const entry = {
        id,
        name:
          name
            .trim()
            .substring(
              0,
              30
            ),
        message:
          message
            .trim()
            .substring(
              0,
              500
            ),
        rating:
          Math.min(
            5,
            Math.max(
              1,
              parseInt(
                rating
              ) || 5
            )
          ),
        date:
          new Date()
            .toISOString()
            .split("T")[0],
        verified:
          false,
        ip,
        ua:
          String(
            req.headers[
              "user-agent"
            ] || ""
          ).substring(
            0,
            200
          )
      };

      if (redis) {
        const multi =
          redis.multi();

        multi.hSet(
          "furioz:guestbook:data",
          id,
          JSON.stringify(
            entry
          )
        );

        multi.zAdd(
          "furioz:guestbook:order",
          [
            {
              score:
                Date.now(),
              value:
                id
            }
          ]
        );

        await multi.exec();

      } else {
        fallbackGuestbook.push(
          entry
        );

        if (
          fallbackGuestbook.length >
          200
        ) {
          fallbackGuestbook.shift();
        }
      }

      return res
        .status(201)
        .json({
          ok: true,
          entry:
            publicEntry(
              entry
            )
        });

    } catch (error) {
      console.error(
        "[guestbook POST]",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Erreur serveur"
        });
    }
  }

  // ----------------------------------------------------------
  // DELETE
  // ----------------------------------------------------------

  if (req.method === "DELETE") {
    const ADMIN_TOKEN =
      process.env.ADMIN_TOKEN;

    if (!ADMIN_TOKEN) {
      return res
        .status(503)
        .json({
          error:
            "Configuration Admin manquante"
        });
    }

    if (
      req.headers.authorization !==
      `Bearer ${ADMIN_TOKEN}`
    ) {
      await logIntrusion(
        ip,
        "unauth_delete",
        "Tentative suppression avis"
      );

      return res
        .status(401)
        .json({
          error:
            "Non autorisé"
        });
    }

    const id =
      String(
        req.query?.id ||
        ""
      ).trim();

    if (!id) {
      return res
        .status(400)
        .json({
          error:
            "ID manquant"
        });
    }

    try {
      let deleted = 0;

      if (redis) {
        const exists =
          await redis.hExists(
            "furioz:guestbook:data",
            id
          );

        if (exists) {
          const multi =
            redis.multi();

          multi.hDel(
            "furioz:guestbook:data",
            id
          );

          multi.zRem(
            "furioz:guestbook:order",
            id
          );

          await multi.exec();

          deleted = 1;
        }

      } else {
        const before =
          fallbackGuestbook.length;

        fallbackGuestbook =
          fallbackGuestbook.filter(
            entry =>
              String(entry.id) !==
              id
          );

        deleted =
          before -
          fallbackGuestbook.length;
      }

      if (!deleted) {
        return res
          .status(404)
          .json({
            error:
              "Avis introuvable",
            deleted: 0
          });
      }

      return res
        .status(200)
        .json({
          ok: true,
          deleted: 1,
          id
        });

    } catch (error) {
      console.error(
        "[guestbook DELETE]",
        error
      );

      return res
        .status(500)
        .json({
          error:
            "Erreur pendant la suppression"
        });
    }
  }

  return res
    .status(405)
    .json({
      error:
        "Method not allowed"
    });
}
