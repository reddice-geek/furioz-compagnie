// ============================================================
// FURIOZ COMPAGNIE - api/_utils.js
// Sécurité + statistiques persistantes Vercel / Upstash Redis
// ============================================================

const RATE_LIMITS = {
  guestbook: { window: 60 * 1000, max: 3 },
  login: { window: 15 * 60 * 1000, max: 5 },
  api: { window: 60 * 1000, max: 60 }
};

// Rate-limit local rapide (protection immédiate par instance)
const ipStore = new Map();

// Fallback mémoire si Redis n'est pas configuré
const fallbackVisits = [];
const fallbackIntrusions = [];

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  "";

const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  "";

export function redisConfigured() {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redis(command) {
  if (!redisConfigured()) {
    return null;
  }

  try {
    const response = await fetch(REDIS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      console.error("[REDIS]", response.status, text.slice(0, 300));
      return null;
    }

    const data = await response.json();
    return data?.result ?? null;
  } catch (error) {
    console.error("[REDIS]", error);
    return null;
  }
}

export function getIP(req) {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.headers["x-real-ip"] ||
    "unknown"
  );
}

function cleanGeoHeader(value, fallback = "") {
  try {
    return decodeURIComponent(String(value || fallback));
  } catch {
    return String(value || fallback);
  }
}

export function getVisitData(req, pageOverride = "") {
  return {
    time: new Date().toISOString(),
    ip: getIP(req),
    ua: String(req.headers["user-agent"] || "").slice(0, 200),
    country: cleanGeoHeader(req.headers["x-vercel-ip-country"], "??"),
    city: cleanGeoHeader(req.headers["x-vercel-ip-city"], ""),
    region: cleanGeoHeader(req.headers["x-vercel-ip-country-region"], ""),
    page: String(
      pageOverride ||
      req.headers.referer ||
      req.url ||
      "/"
    ).slice(0, 500)
  };
}

export function rateLimit(ip, type = "api") {
  const cfg = RATE_LIMITS[type] || RATE_LIMITS.api;
  const key = `${ip}:${type}`;
  const now = Date.now();

  let data = ipStore.get(key);

  if (!data || now - data.start > cfg.window) {
    data = {
      count: 1,
      start: now,
      blockedUntil: 0
    };

    ipStore.set(key, data);

    return {
      allowed: true,
      remaining: cfg.max - 1
    };
  }

  if (data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((data.blockedUntil - now) / 1000),
      reason: "blocked"
    };
  }

  data.count++;

  if (data.count > cfg.max) {
    data.blockedUntil = now + 15 * 60 * 1000;
    ipStore.set(key, data);

    // Persistance du blocage + intrusion sans bloquer la requête
    void persistBlockedIP(ip, data.blockedUntil);
    void logIntrusion(
      ip,
      type,
      `Rate limit ${type}: ${data.count} req`
    );

    return {
      allowed: false,
      retryAfter: 900,
      reason: "rate_limit"
    };
  }

  ipStore.set(key, data);

  return {
    allowed: true,
    remaining: cfg.max - data.count
  };
}

async function persistBlockedIP(ip, blockedUntil) {
  if (!redisConfigured()) {
    return;
  }

  await redis([
    "ZADD",
    "furioz:blocked",
    String(blockedUntil),
    ip
  ]);
}

// ------------------------------------------------------------
// VISITES
// ------------------------------------------------------------

export async function logVisit(req, pageOverride = "") {
  const visit = getVisitData(req, pageOverride);

  if (!redisConfigured()) {
    fallbackVisits.push(visit);

    if (fallbackVisits.length > 1000) {
      fallbackVisits.shift();
    }

    return visit;
  }

  const now = Date.now();
  const id =
    `${now}:${Math.random().toString(36).slice(2)}:${visit.ip}`;

  await Promise.all([
    redis([
      "LPUSH",
      "furioz:visits",
      JSON.stringify(visit)
    ]),
    redis([
      "LTRIM",
      "furioz:visits",
      "0",
      "999"
    ]),
    redis([
      "INCR",
      "furioz:stats:totalVisits"
    ]),
    redis([
      "SADD",
      "furioz:stats:uniqueIPs",
      visit.ip
    ]),
    redis([
      "HINCRBY",
      "furioz:stats:countries",
      visit.country || "??",
      "1"
    ]),
    redis([
      "ZADD",
      "furioz:visits24h",
      String(now),
      id
    ])
  ]);

  await redis([
    "ZREMRANGEBYSCORE",
    "furioz:visits24h",
    "0",
    String(now - 86400000)
  ]);

  return visit;
}

// ------------------------------------------------------------
// INTRUSIONS
// ------------------------------------------------------------

export async function logIntrusion(ip, type, details) {
  const intrusion = {
    time: new Date().toISOString(),
    ip: String(ip || "unknown"),
    type: String(type || "unknown").slice(0, 100),
    details: String(details || "").slice(0, 500)
  };

  console.warn(
    "[INTRUSION]",
    intrusion.ip,
    intrusion.type,
    intrusion.details
  );

  if (!redisConfigured()) {
    fallbackIntrusions.push(intrusion);

    if (fallbackIntrusions.length > 1000) {
      fallbackIntrusions.shift();
    }

    return intrusion;
  }

  const now = Date.now();
  const id =
    `${now}:${Math.random().toString(36).slice(2)}:${intrusion.ip}`;

  await Promise.all([
    redis([
      "LPUSH",
      "furioz:intrusions",
      JSON.stringify(intrusion)
    ]),
    redis([
      "LTRIM",
      "furioz:intrusions",
      "0",
      "999"
    ]),
    redis([
      "INCR",
      "furioz:stats:totalIntrusions"
    ]),
    redis([
      "ZADD",
      "furioz:intrusions24h",
      String(now),
      id
    ])
  ]);

  await redis([
    "ZREMRANGEBYSCORE",
    "furioz:intrusions24h",
    "0",
    String(now - 86400000)
  ]);

  return intrusion;
}

// ------------------------------------------------------------
// LECTURE STATS
// ------------------------------------------------------------

function safeJSONList(list) {
  if (!Array.isArray(list)) {
    return [];
  }

  return list
    .map(item => {
      try {
        return typeof item === "string"
          ? JSON.parse(item)
          : item;
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}

function pairsToEntries(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }

  // Upstash peut renvoyer ["FR","10","CA","3"]
  if (raw.length && !Array.isArray(raw[0])) {
    const entries = [];

    for (let i = 0; i < raw.length; i += 2) {
      entries.push([
        String(raw[i] ?? "??"),
        Number(raw[i + 1] || 0)
      ]);
    }

    return entries;
  }

  return raw.map(([key, value]) => [
    String(key ?? "??"),
    Number(value || 0)
  ]);
}

export async function getAdminStatsData() {
  const now = Date.now();

  if (!redisConfigured()) {
    const last24Visits =
      fallbackVisits.filter(
        v =>
          now -
          new Date(v.time).getTime() <
          86400000
      );

    const last24Intrusions =
      fallbackIntrusions.filter(
        v =>
          now -
          new Date(v.time).getTime() <
          86400000
      );

    const countries = {};

    fallbackVisits.forEach(v => {
      const country = v.country || "??";
      countries[country] =
        (countries[country] || 0) + 1;
    });

    return {
      storage: "memory",
      configured: false,
      stats: {
        totalVisits: fallbackVisits.length,
        visits24h: last24Visits.length,
        uniqueVisitors: new Set(
          fallbackVisits.map(v => v.ip)
        ).size,
        totalIntrusions:
          fallbackIntrusions.length,
        blockedIPs: Array.from(
          ipStore.values()
        ).filter(
          v =>
            v.blockedUntil &&
            v.blockedUntil > now
        ).length,
        intrusionLast24h:
          last24Intrusions.length
      },
      recentVisits:
        fallbackVisits.slice(-50).reverse(),
      recentIntrusions:
        fallbackIntrusions.slice(-50).reverse(),
      topCountries:
        Object.entries(countries)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
    };
  }

  await Promise.all([
    redis([
      "ZREMRANGEBYSCORE",
      "furioz:visits24h",
      "0",
      String(now - 86400000)
    ]),
    redis([
      "ZREMRANGEBYSCORE",
      "furioz:intrusions24h",
      "0",
      String(now - 86400000)
    ]),
    redis([
      "ZREMRANGEBYSCORE",
      "furioz:blocked",
      "0",
      String(now)
    ])
  ]);

  const [
    totalVisits,
    visits24h,
    uniqueVisitors,
    totalIntrusions,
    intrusionLast24h,
    blockedIPs,
    recentVisitsRaw,
    recentIntrusionsRaw,
    countriesRaw
  ] = await Promise.all([
    redis(["GET", "furioz:stats:totalVisits"]),
    redis(["ZCARD", "furioz:visits24h"]),
    redis(["SCARD", "furioz:stats:uniqueIPs"]),
    redis(["GET", "furioz:stats:totalIntrusions"]),
    redis(["ZCARD", "furioz:intrusions24h"]),
    redis(["ZCARD", "furioz:blocked"]),
    redis(["LRANGE", "furioz:visits", "0", "49"]),
    redis(["LRANGE", "furioz:intrusions", "0", "49"]),
    redis(["HGETALL", "furioz:stats:countries"])
  ]);

  const topCountries =
    pairsToEntries(countriesRaw)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

  return {
    storage: "redis",
    configured: true,
    stats: {
      totalVisits: Number(totalVisits || 0),
      visits24h: Number(visits24h || 0),
      uniqueVisitors:
        Number(uniqueVisitors || 0),
      totalIntrusions:
        Number(totalIntrusions || 0),
      blockedIPs: Number(blockedIPs || 0),
      intrusionLast24h:
        Number(intrusionLast24h || 0)
    },
    recentVisits:
      safeJSONList(recentVisitsRaw),
    recentIntrusions:
      safeJSONList(recentIntrusionsRaw),
    topCountries
  };
}
