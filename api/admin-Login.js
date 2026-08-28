export default function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Méthode non autorisée'
    });
  }

  const ADMIN_USER = process.env.ADMIN_USER;
  const ADMIN_PASS = process.env.ADMIN_PASS;
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

  if (!ADMIN_USER || !ADMIN_PASS || !ADMIN_TOKEN) {
    return res.status(503).json({
      error: 'Configuration Admin manquante'
    });
  }

  const { user, pass } = req.body || {};

  if (!user || !pass) {
    return res.status(400).json({
      error: 'Entrez votre utilisateur et votre mot de passe.'
    });
  }

  if (user !== ADMIN_USER || pass !== ADMIN_PASS) {
    return res.status(401).json({
      error: 'Utilisateur ou mot de passe incorrect.'
    });
  }

  return res.status(200).json({
    success: true,
    user: user,
    token: ADMIN_TOKEN
  });
}
