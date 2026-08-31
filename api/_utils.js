// ============================================================
// FURIOZ COMPAGNIE - api/_utils.js
// Sécurité + statistiques persistantes avec REDIS_URL
// Compatible Redis Cloud / Vercel Integration
// ============================================================

import { createClient } from "redis";

const RATE_LIMITS = {
  guestbook: { window: 60 * 1000, max: 3 },
  login: { window: 15 * 60 * 1000, max: 5 },
  api: { window: 60 * 1000, max: 60 }
};

const ipStore = new Map();

const fallbackVisits = [];
const fallbackIntrusions = [];

const REDIS_URL =
  process.env.REDIS_URL ||
  process.env.UPSTASH_REDIS_REST_REDIS_URL ||
  "";

let redisClientPromise = null;

export function redisConfigured() {
  return Boolean(REDIS_URL);
}

export async function getRedisClient() {
  if (!redisConfigured()) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      const client = createClient({
        url: REDIS_URL,
        socket: {
          reconnectStrategy: retries =>
            Math.min(retries * 100, 3000)
        }
      });

      client.on("error", error => {
        console.error("[REDIS]", error);
      });

      if (!client.isOpen) {
        await client.connect();
      }

      return client;
    })().catch(error => {
      redisClientPromise = null;
      console.error("[REDIS CONNECT]", error);
      return null;
    });
  }

  return redisClientPromise;
}


export async function getRedisStatus() {
  const urlPresent = Boolean(REDIS_URL);

  if (!urlPresent) {
    return {
      configured: false,
      connected: false,
      source: "memory",
      variable: null,
      message: "Aucune variable REDIS_URL compatible trouvée."
    };
  }

  try {
    const client = await getRedisClient();

    if (!client) {
      return {
        configured: true,
        connected: false,
        source: "redis",
        variable:
          process.env.REDIS_URL
            ? "REDIS_URL"
            : "UPSTASH_REDIS_REST_REDIS_URL",
        message: "Client Redis non disponible."
      };
    }

    const pong = await client.ping();

    return {
      configured: true,
      connected: pong === "PONG",
      source: "redis",
      variable:
        process.env.REDIS_URL
          ? "REDIS_URL"
          : "UPSTASH_REDIS_REST_REDIS_URL",
      message:
        pong === "PONG"
          ? "Redis connecté."
          : `Réponse Redis inattendue: ${String(pong)}`
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      source: "redis",
      variable:
        process.env.REDIS_URL
          ? "REDIS_URL"
          : "UPSTASH_REDIS_REST_REDIS_URL",
      message: String(error?.message || error || "Erreur Redis")
    };
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
    country: cleanGeoHeader(
      req.headers["x-vercel-ip-country"],
      "??"
    ),
    city: cleanGeoHeader(
      req.headers["x-vercel-ip-city"],
      ""
    ),
    region: cleanGeoHeader(
      req.headers["x-vercel-ip-country-region"],
      ""
    ),
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
      retryAfter: Math.ceil(
        (data.blockedUntil - now) / 1000
      ),
      reason: "blocked"
    };
  }

  data.count++;

  if (data.count > cfg.max) {
    data.blockedUntil =
      now + 15 * 60 * 1000;

    ipStore.set(key, data);

    void persistBlockedIP(
      ip,
      data.blockedUntil
    );

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
  const redis = await getRedisClient();

  if (!redis) {
    return;
  }

  try {
    await redis.zAdd(
      "furioz:blocked",
      [
        {
          score: blockedUntil,
          value: ip
        }
      ]
    );
  } catch (error) {
    console.error(
      "[REDIS blocked]",
      error
    );
  }
}

// ------------------------------------------------------------
// VISITES
// ------------------------------------------------------------

export async function logVisit(
  req,
  pageOverride = ""
) {
  const visit =
    getVisitData(
      req,
      pageOverride
    );

  const redis =
    await getRedisClient();

  if (!redis) {
    fallbackVisits.push(visit);

    if (fallbackVisits.length > 1000) {
      fallbackVisits.shift();
    }

    return visit;
  }

  const now = Date.now();

  const id =
    `${now}:${Math.random()
      .toString(36)
      .slice(2)}:${visit.ip}`;

  try {
    const multi = redis.multi();

    multi.lPush(
      "furioz:visits",
      JSON.stringify(visit)
    );

    multi.lTrim(
      "furioz:visits",
      0,
      999
    );

    multi.incr(
      "furioz:stats:totalVisits"
    );

    multi.sAdd(
      "furioz:stats:uniqueIPs",
      visit.ip
    );

    multi.hIncrBy(
      "furioz:stats:countries",
      visit.country || "??",
      1
    );

    multi.zAdd(
      "furioz:visits24h",
      [
        {
          score: now,
          value: id
        }
      ]
    );

    await multi.exec();

    await redis.zRemRangeByScore(
      "furioz:visits24h",
      0,
      now - 86400000
    );

  } catch (error) {
    console.error(
      "[REDIS visit]",
      error
    );
  }

  return visit;
}

// ------------------------------------------------------------
// INTRUSIONS
// ------------------------------------------------------------

export async function logIntrusion(
  ip,
  type,
  details
) {
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

  const redis =
    await getRedisClient();

  if (!redis) {
    fallbackIntrusions.push(
      intrusion
    );

    if (
      fallbackIntrusions.length >
      1000
    ) {
      fallbackIntrusions.shift();
    }

    return intrusion;
  }

  const now = Date.now();

  const id =
    `${now}:${Math.random()
      .toString(36)
      .slice(2)}:${intrusion.ip}`;

  try {
    const multi = redis.multi();

    multi.lPush(
      "furioz:intrusions",
      JSON.stringify(intrusion)
    );

    multi.lTrim(
      "furioz:intrusions",
      0,
      999
    );

    multi.incr(
      "furioz:stats:totalIntrusions"
    );

    multi.zAdd(
      "furioz:intrusions24h",
      [
        {
          score: now,
          value: id
        }
      ]
    );

    await multi.exec();

    await redis.zRemRangeByScore(
      "furioz:intrusions24h",
      0,
      now - 86400000
    );

  } catch (error) {
    console.error(
      "[REDIS intrusion]",
      error
    );
  }

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

export async function getAdminStatsData() {
  const now = Date.now();

  const redis =
    await getRedisClient();

  if (!redis) {
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

    fallbackVisits.forEach(
      v => {
        const country =
          v.country || "??";

        countries[country] =
          (countries[country] || 0) +
          1;
      }
    );

    return {
      storage: "memory",
      configured: false,
      redisStatus: await getRedisStatus(),
      stats: {
        totalVisits:
          fallbackVisits.length,
        visits24h:
          last24Visits.length,
        uniqueVisitors:
          new Set(
            fallbackVisits.map(
              v => v.ip
            )
          ).size,
        totalIntrusions:
          fallbackIntrusions.length,
        blockedIPs:
          Array.from(
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
        fallbackVisits
          .slice(-50)
          .reverse(),
      recentIntrusions:
        fallbackIntrusions
          .slice(-50)
          .reverse(),
      topCountries:
        Object.entries(countries)
          .sort(
            (a, b) =>
              b[1] - a[1]
          )
          .slice(0, 10)
    };
  }

  try {
    await Promise.all([
      redis.zRemRangeByScore(
        "furioz:visits24h",
        0,
        now - 86400000
      ),
      redis.zRemRangeByScore(
        "furioz:intrusions24h",
        0,
        now - 86400000
      ),
      redis.zRemRangeByScore(
        "furioz:blocked",
        0,
        now
      )
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
      countriesObject
    ] = await Promise.all([
      redis.get(
        "furioz:stats:totalVisits"
      ),
      redis.zCard(
        "furioz:visits24h"
      ),
      redis.sCard(
        "furioz:stats:uniqueIPs"
      ),
      redis.get(
        "furioz:stats:totalIntrusions"
      ),
      redis.zCard(
        "furioz:intrusions24h"
      ),
      redis.zCard(
        "furioz:blocked"
      ),
      redis.lRange(
        "furioz:visits",
        0,
        49
      ),
      redis.lRange(
        "furioz:intrusions",
        0,
        49
      ),
      redis.hGetAll(
        "furioz:stats:countries"
      )
    ]);

    const topCountries =
      Object.entries(
        countriesObject || {}
      )
        .map(
          ([country, count]) => [
            country,
            Number(count || 0)
          ]
        )
        .sort(
          (a, b) =>
            b[1] - a[1]
        )
        .slice(0, 10);

    return {
      storage: "redis",
      configured: true,
      redisStatus: await getRedisStatus(),
      stats: {
        totalVisits:
          Number(totalVisits || 0),
        visits24h:
          Number(visits24h || 0),
        uniqueVisitors:
          Number(
            uniqueVisitors || 0
          ),
        totalIntrusions:
          Number(
            totalIntrusions || 0
          ),
        blockedIPs:
          Number(blockedIPs || 0),
        intrusionLast24h:
          Number(
            intrusionLast24h || 0
          )
      },
      recentVisits:
        safeJSONList(
          recentVisitsRaw
        ),
      recentIntrusions:
        safeJSONList(
          recentIntrusionsRaw
        ),
      topCountries
    };

  } catch (error) {
    console.error(
      "[REDIS stats]",
      error
    );

    return {
      storage: "redis-error",
      configured: true,
      redisStatus: await getRedisStatus(),
      stats: {
        totalVisits: 0,
        visits24h: 0,
        uniqueVisitors: 0,
        totalIntrusions: 0,
        blockedIPs: 0,
        intrusionLast24h: 0
      },
      recentVisits: [],
      recentIntrusions: [],
      topCountries: []
    };
  }
}
