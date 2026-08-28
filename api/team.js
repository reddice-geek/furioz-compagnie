// ============================================================
// FURIOZ COMPAGNIE
// api/team.js
// API complète de gestion de l'équipe
// ============================================================

let members = [
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
    description:
      "Fondateur de la Furioz Compagnie en septembre 2022. Projet pense pour durer : entraide, independance et progression durable.",
    tags: [
      "Fondateur",
      "Gaming",
      "Cosplay",
      "IRL",
      "🇫🇷 France"
    ],
    twitch: "https://twitch.tv/reddice_geek",
    youtube:
      "https://www.youtube.com/channel/UCxjKpjK-3DBR3HgmeRY7UMg",
    discord: "",
    initial: "R",
    color: "#151519",
    color2: "#7A00B8",
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
    description:
      "LePetoChard, aussi connu sous Zafkiel. A rejoint la Furioz Compagnie le 23/11/2024 en tant que streameur. Ambiance chill et entraide.",
    tags: [
      "Gaming",
      "Events",
      "🇫🇷 France"
    ],
    twitch: "https://www.twitch.tv/le_petochard",
    youtube: "",
    discord: "",
    initial: "Z",
    color: "#151519",
    color2: "#0A86B8",
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
    description:
      "DJ debutant et gamer passionne. A rejoint la Furioz le 18/08/2026.",
    tags: [
      "Gaming",
      "DJ",
      "Musique",
      "🇨🇦 Canada"
    ],
    twitch: "https://www.twitch.tv/foxysword350",
    youtube: "",
    discord: "",
    initial: "F",
    color: "#151519",
    color2: "#3F22D8",
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
    description:
      "Modo, webmaster du site et gestion du Discord.",
    tags: [
      "Modo",
      "Webmaster",
      "VRChat",
      "Avali",
      "🇫🇷 France"
    ],
    twitch: "https://twitch.tv/furiozcompagnie",
    youtube: "",
    discord: "",
    initial: "Q",
    color: "#16C7B7",
    color2: "#FF4B00",
    visible: true
  }
];


// ============================================================
// OUTILS
// ============================================================

function cleanText(value, max = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}


function makeId(value) {
  return cleanText(value, 80)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function getBody(req) {
  if (!req.body) {
    return {};
  }

  if (typeof req.body === "object") {
    return req.body;
  }

  try {
    return JSON.parse(req.body);
  } catch {
    return {};
  }
}


function isAdmin(req) {
  const token = process.env.ADMIN_TOKEN;

  if (!token) {
    return false;
  }

  const authorization =
    req.headers.authorization || "";

  return authorization === `Bearer ${token}`;
}


function buildMember(body, oldMember = {}) {
  const name =
    cleanText(
      body.name ?? oldMember.name,
      80
    );

  const initial =
    cleanText(
      body.initial ?? oldMember.initial,
      3
    );

  const color =
    cleanText(
      body.color ?? oldMember.color,
      7
    );

  const color2 =
    cleanText(
      body.color2 ?? oldMember.color2 ?? oldMember.color,
      7
    );

  let tags = [];

  if (Array.isArray(body.tags)) {
    tags = body.tags
      .map(tag => cleanText(tag, 40))
      .filter(Boolean)
      .slice(0, 20);
  } else if (Array.isArray(oldMember.tags)) {
    tags = oldMember.tags;
  }

  return {
    id:
      oldMember.id ||
      makeId(body.id || name),

    name,

    status:
      cleanText(
        body.status ??
        oldMember.status ??
        "MEMBRE",
        50
      ),

    country:
      cleanText(
        body.country ??
        oldMember.country,
        50
      ),

    countryFlag:
      cleanText(
        body.countryFlag ??
        oldMember.countryFlag,
        10
      ),

    joined:
      cleanText(
        body.joined ??
        oldMember.joined,
        60
      ),

    streamSince:
      cleanText(
        body.streamSince ??
        oldMember.streamSince,
        60
      ),

    role:
      cleanText(
        body.role ??
        oldMember.role,
        100
      ),

    category:
      cleanText(
        body.category ??
        oldMember.category,
        150
      ),

    description:
      cleanText(
        body.description ??
        oldMember.description,
        1500
      ),

    tags,

    twitch:
      cleanText(
        body.twitch ??
        oldMember.twitch,
        300
      ),

    youtube:
      cleanText(
        body.youtube ??
        oldMember.youtube,
        300
      ),

    discord:
      cleanText(
        body.discord ??
        oldMember.discord,
        300
      ),

    initial:
      (
        initial ||
        name.charAt(0) ||
        "?"
      ).toUpperCase(),

    color:
      /^#[0-9a-f]{6}$/i.test(color)
        ? color
        : "#151519",

    color2:
      /^#[0-9a-f]{6}$/i.test(color2)
        ? color2
        : (
            /^#[0-9a-f]{6}$/i.test(color)
              ? color
              : "#151519"
          ),

    visible:
      body.visible !== undefined
        ? body.visible !== false
        : oldMember.visible !== false
  };
}


// ============================================================
// API VERCEL
// ============================================================

export default function handler(req, res) {

  res.setHeader(
    "Cache-Control",
    "no-store"
  );

  // =========================================================
  // GET
  // =========================================================

  if (req.method === "GET") {
    return res.status(200).json(members);
  }


  // =========================================================
  // ADMIN TOKEN
  // =========================================================

  if (!process.env.ADMIN_TOKEN) {
    return res.status(503).json({
      error:
        "ADMIN_TOKEN n'est pas configuré sur Vercel."
    });
  }


  if (!isAdmin(req)) {
    return res.status(401).json({
      error: "Non autorisé"
    });
  }


  // =========================================================
  // POST = AJOUTER
  // =========================================================

  if (req.method === "POST") {

    const body = getBody(req);

    const name =
      cleanText(body.name, 80);

    if (!name) {
      return res.status(400).json({
        error: "Nom obligatoire"
      });
    }

    const id =
      makeId(
        body.id || name
      );

    if (!id) {
      return res.status(400).json({
        error:
          "Identifiant invalide"
      });
    }

    const exists =
      members.some(
        member =>
          member.id === id
      );

    if (exists) {
      return res.status(409).json({
        error:
          "Ce membre existe déjà"
      });
    }

    const member =
      buildMember({
        ...body,
        id
      });

    members.push(member);

    return res.status(201).json({
      ok: true,
      message:
        "Membre ajouté",
      member
    });
  }


  // =========================================================
  // PUT = MODIFIER
  // =========================================================

  if (req.method === "PUT") {

    const body =
      getBody(req);

    const id =
      cleanText(
        body.id,
        80
      );

    if (!id) {
      return res.status(400).json({
        error:
          "Identifiant manquant"
      });
    }

    const index =
      members.findIndex(
        member =>
          member.id === id
      );

    if (index === -1) {
      return res.status(404).json({
        error:
          "Membre introuvable"
      });
    }

    const oldMember =
      members[index];

    const updatedMember =
      buildMember(
        body,
        oldMember
      );

    updatedMember.id =
      oldMember.id;

    members[index] =
      updatedMember;

    return res.status(200).json({
      ok: true,
      message:
        "Membre modifié",
      member:
        updatedMember
    });
  }


  // =========================================================
  // DELETE = SUPPRIMER
  // =========================================================

  if (req.method === "DELETE") {

    const id =
      cleanText(
        req.query?.id,
        80
      );

    if (!id) {
      return res.status(400).json({
        error:
          "Identifiant manquant"
      });
    }

    const exists =
      members.some(
        member =>
          member.id === id
      );

    if (!exists) {
      return res.status(404).json({
        error:
          "Membre introuvable"
      });
    }

    members =
      members.filter(
        member =>
          member.id !== id
      );

    return res.status(200).json({
      ok: true,
      message:
        "Membre supprimé",
      deleted: id
    });
  }


  // =========================================================
  // AUTRE MÉTHODE
  // =========================================================

  res.setHeader(
    "Allow",
    "GET, POST, PUT, DELETE"
  );

  return res.status(405).json({
    error:
      "Méthode non autorisée"
  });
}
