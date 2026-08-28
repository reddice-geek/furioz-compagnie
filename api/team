import { getIP, logIntrusion } from './_utils.js';

let members = [
  {
    id: 'reddice',
    name: 'RedDice_Geek',
    status: 'FONDATEUR',
    country: 'France',
    countryFlag: '🇫🇷',
    joined: '2022-09-01',
    streamSince: '2021-08-01',
    role: 'Fondateur',
    category: 'Gaming • Cosplay • IRL',
    description: 'Fondateur de la Furioz Compagnie en septembre 2022.',
    tags: ['Fondateur', 'Gaming', 'Cosplay', 'IRL', 'France'],
    twitch: 'https://twitch.tv/reddice_geek',
    youtube: '',
    discord: '',
    initial: 'R',
    color: '#151519',
    visible: true
  },

  {
    id: 'zafkiel',
    name: 'Zafkiel / LePetoChard',
    status: 'MEMBRE',
    country: 'France',
    countryFlag: '🇫🇷',
    joined: '2024-11-23',
    streamSince: '2023-01-01',
    role: 'Streamer',
    category: 'Gaming • Events',
    description: 'LePetoChard, aussi connu sous Zafkiel.',
    tags: ['Gaming', 'Events', 'France'],
    twitch: 'https://www.twitch.tv/le_petochard',
    youtube: '',
    discord: '',
    initial: 'Z',
    color: '#151519',
    visible: true
  },

  {
    id: 'foxysword',
    name: 'Foxy Sword',
    status: 'MEMBRE',
    country: 'Canada',
    countryFlag: '🇨🇦',
    joined: '2026-08-18',
    streamSince: '2025-01-01',
    role: 'Streamer / DJ',
    category: 'Gaming • DJ',
    description: 'DJ débutant et gamer passionné.',
    tags: ['Gaming', 'DJ', 'Musique', 'Canada'],
    twitch: 'https://www.twitch.tv/foxysword350',
    youtube: '',
    discord: '',
    initial: 'F',
    color: '#151519',
    visible: true
  },

  {
    id: 'quentin',
    name: 'Quentin Pierrot',
    status: 'MODO / WEBMASTER',
    country: 'France',
    countryFlag: '🇫🇷',
    joined: '2026-08-20',
    streamSince: '2023-01-01',
    role: 'Modo / Webmaster',
    category: 'Avali VRChat',
    description: 'Modo, webmaster du site et gestion du Discord.',
    tags: ['Modo', 'Webmaster', 'VRChat', 'Avali', 'France'],
    twitch: 'https://twitch.tv/furiozcompagnie',
    youtube: '',
    discord: '',
    initial: 'Q',
    color: '#16C7B7',
    visible: true
  }
];

function isAdmin(req) {
  const token = process.env.ADMIN_TOKEN;

  return (
    token &&
    req.headers.authorization === `Bearer ${token}`
  );
}

export default function handler(req, res) {

  if (req.method === 'GET') {
    return res.status(200).json(members);
  }

  if (!isAdmin(req)) {
    logIntrusion(
      getIP(req),
      'unauth_team',
      'Accès équipe non autorisé'
    );

    return res.status(401).json({
      error: 'Non autorisé'
    });
  }

  if (req.method === 'POST') {

    const body = req.body || {};

    if (!body.name) {
      return res.status(400).json({
        error: 'Nom obligatoire'
      });
    }

    const id =
      String(body.id || body.name)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (members.some(m => m.id === id)) {
      return res.status(409).json({
        error: 'Ce membre existe déjà'
      });
    }

    const member = {
      id,
      name: body.name || '',
      status: body.status || 'MEMBRE',
      country: body.country || '',
      countryFlag: body.countryFlag || '',
      joined: body.joined || '',
      streamSince: body.streamSince || '',
      role: body.role || '',
      category: body.category || '',
      description: body.description || '',
      tags: Array.isArray(body.tags)
        ? body.tags
        : [],
      twitch: body.twitch || '',
      youtube: body.youtube || '',
      discord: body.discord || '',
      initial:
        body.initial ||
        String(body.name || '?').charAt(0).toUpperCase(),
      color: body.color || '#151519',
      visible: body.visible !== false
    };

    members.push(member);

    return res.status(201).json({
      ok: true,
      member
    });
  }

  if (req.method === 'PUT') {

    const body = req.body || {};

    const index =
      members.findIndex(
        member => member.id === body.id
      );

    if (index === -1) {
      return res.status(404).json({
        error: 'Membre introuvable'
      });
    }

    members[index] = {
      ...members[index],
      ...body,
      id: members[index].id
    };

    return res.status(200).json({
      ok: true,
      member: members[index]
    });
  }

  if (req.method === 'DELETE') {

    const id = req.query?.id;

    const before = members.length;

    members =
      members.filter(
        member => member.id !== id
      );

    return res.status(200).json({
      ok: true,
      deleted:
        before - members.length
    });
  }

  return res.status(405).json({
    error: 'Méthode non autorisée'
  });
}
