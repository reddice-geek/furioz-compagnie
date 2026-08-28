// api/admin-login.js - VERSION FIX SANS DEPENDANCE
export default function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS') return res.status(200).end();
  if(req.method !== 'POST') return res.status(405).json({ error:'Method not allowed' });

  try{
    // Env vars avec fallback sécurisé
    const ADMIN_USER = process.env.ADMIN_USER || 'reddice_geek';
    const ADMIN_PASS = process.env.ADMIN_PASS || 'Furioz2026!Secure';
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'furioz_admin_2026_secure';

    let body = req.body;
    if(typeof body === 'string'){
      try{ body = JSON.parse(body); }catch{ body = {}; }
    }
    if(!body) body = {};

    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    console.log('[ADMIN LOGIN] Attempt user=', username, 'expected=', ADMIN_USER, 'hasPassEnv=', !!process.env.ADMIN_PASS);

    if(!username || !password){
      return res.status(400).json({ error:'Username et password requis' });
    }

    if(username === ADMIN_USER && password === ADMIN_PASS){
      return res.status(200).json({ ok:true, token: ADMIN_TOKEN, user: username });
    }else{
      return res.status(401).json({ error:'Identifiants invalides' });
    }
  }catch(e){
    console.error('[ADMIN LOGIN ERROR]', e);
    return res.status(500).json({ error:'Erreur serveur: '+ e.message });
  }
}
