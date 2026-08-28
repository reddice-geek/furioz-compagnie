import { getIP, rateLimit, logIntrusion } from './_utils.js';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_TOKEN) {
    return res.status(503).json({ error: 'Configuration Admin manquante' });
  }

  const ip = getIP(req);
  const rl = rateLimit(ip, 'login');

  if (!rl.allowed) {
    logIntrusion(ip, 'bruteforce_login', `Blocked ${rl.retryAfter}s`);
    return res.status(429).json({
      error: `Trop de tentatives, réessaie dans ${rl.retryAfter}s`
    });
  }

  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : (req.body || {});

    const user = body.user ?? body.username ?? '';
    const pass = body.pass ?? body.password ?? '';

    if (!user || !pass) {
      return res.status(400).json({
        error: 'Entrez votre utilisateur et votre mot de passe.'
      });
    }

    if (user === ADMIN_USER && pass === ADMIN_PASS) {
      return res.status(200).json({
        ok: true,
        token: ADMIN_TOKEN,
        user
      });
    }

    logIntrusion(ip, 'failed_login', `user=${String(user).slice(0, 60)}`);
    return res.status(401).json({
      error: 'Utilisateur ou mot de passe incorrect.'
    });
  } catch (error) {
    console.error('admin-login:', error);
    return res.status(500).json({ error: 'Erreur serveur' });
  }
}
