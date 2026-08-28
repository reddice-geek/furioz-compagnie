// ============================================================
// FURIOZ COMPAGNIE - api/admin-stats.js
// ============================================================

import {
  getIP,
  logIntrusion,
  getAdminStatsData
} from "./_utils.js";

export default async function handler(req, res) {
  const ADMIN_TOKEN =
    process.env.ADMIN_TOKEN;

  if (!ADMIN_TOKEN) {
    return res.status(503).json({
      error: "Configuration Admin manquante"
    });
  }

  if (
    req.headers.authorization !==
    `Bearer ${ADMIN_TOKEN}`
  ) {
    await logIntrusion(
      getIP(req),
      "unauth_stats",
      "Accès stats sans auth"
    );

    return res.status(401).json({
      error: "Non autorisé"
    });
  }

  const data =
    await getAdminStatsData();

  return res.status(200).json({
    ...data,
    serverTime:
      new Date().toISOString()
  });
}
