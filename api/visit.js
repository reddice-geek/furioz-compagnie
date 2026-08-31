// ============================================================
// FURIOZ COMPAGNIE - api/visit.js
// Enregistre une visite et signale clairement l'état Redis
// ============================================================

import {
  logVisit,
  getRedisStatus
} from "./_utils.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  let body = {};

  try {
    body =
      typeof req.body === "string"
        ? JSON.parse(req.body)
        : req.body || {};
  } catch {}

  const page =
    String(body.page || "")
      .slice(0, 500);

  const redisStatus =
    await getRedisStatus();

  if (
    redisStatus.configured &&
    !redisStatus.connected
  ) {
    console.error(
      "[VISIT] Redis configuré mais connexion impossible:",
      redisStatus.message
    );

    return res.status(503).json({
      ok: false,
      error: "Redis indisponible",
      storage: "redis-error",
      redisStatus: {
        configured: redisStatus.configured,
        connected: redisStatus.connected,
        variable: redisStatus.variable,
        message: redisStatus.message
      }
    });
  }

  const visit =
    await logVisit(
      req,
      page
    );

  return res.status(200).json({
    ok: true,
    storage:
      redisStatus.connected
        ? "redis"
        : "memory",
    redisStatus: {
      configured: redisStatus.configured,
      connected: redisStatus.connected,
      variable: redisStatus.variable
    },
    country: visit.country,
    city: visit.city
  });
}
