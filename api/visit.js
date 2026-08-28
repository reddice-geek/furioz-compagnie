// ============================================================
// FURIOZ COMPAGNIE - api/visit.js
// Enregistre une visite réelle
// ============================================================

import {
  logVisit
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

  const visit =
    await logVisit(req, page);

  return res.status(200).json({
    ok: true,
    country: visit.country,
    city: visit.city
  });
}
