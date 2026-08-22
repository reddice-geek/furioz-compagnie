import { getIP, rateLimit, logVisit, logIntrusion } from './_utils.js';
let guestbook = [
  { id:'1', name:'Zafkiel', message:"Meilleure team depuis 2024, entraide de fou ! 🔥", rating:5, date:'2024-11-25', verified:true, ip:'hidden' },
  { id:'2', name:'FoxySword', message:"Rejoins depuis Canada, ambiance incroyable", rating:5, date:'2026-08-18', verified:true, ip:'hidden' },
];
export default function handler(req, res){
  const ip = getIP(req);
  logVisit(req);
  if(req.method === 'POST'){
    const rl = rateLimit(ip, 'guestbook');
    if(!rl.allowed){
      logIntrusion(ip, 'guestbook_spam', `Blocked ${rl.retryAfter}s`);
      return res.status(429).json({ error:`Trop de messages, réessaye dans ${rl.retryAfter}s`, retryAfter: rl.retryAfter });
    }
  }
  if(req.method === 'GET'){
    return res.status(200).json(guestbook.map(({ip, ...r})=>r).reverse());
  }
  if(req.method === 'POST'){
    try{
      const body = typeof req.body==='string'? JSON.parse(req.body): req.body;
      const { name, message, rating } = body;
      if(!name || !message || name.length<2 || name.length>30 || message.length<10 || message.length>500){
        return res.status(400).json({ error:'Nom 2-30, message 10-500 chars' });
      }
      if(/<script|javascript:|onerror=|onload=|eval\(/i.test(name+message)){
        logIntrusion(ip, 'xss_guestbook', message.substring(0,100));
        return res.status(400).json({ error:'Contenu interdit' });
      }
      const entry = { id: Date.now().toString(), name:name.trim().substring(0,30), message:message.trim().substring(0,500), rating: Math.min(5,Math.max(1,parseInt(rating)||5)), date:new Date().toISOString().split('T')[0], verified:false, ip, ua:(req.headers['user-agent']||'').substring(0,200) };
      guestbook.push(entry);
      if(guestbook.length>200) guestbook.shift();
      const {ip:_, ua:__, ...pub}=entry;
      return res.status(201).json({ ok:true, entry:pub });
    }catch{ return res.status(500).json({ error:'Erreur serveur' }); }
  }
  if(req.method === 'DELETE'){
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'furioz_admin_2026_secure';
    if(req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`){
      logIntrusion(ip, 'unauth_delete', 'Tentative suppression avis');
      return res.status(401).json({ error:'Non autorisé' });
    }
    const { id } = req.query;
    const before=guestbook.length;
    guestbook = guestbook.filter(g=>g.id!==id);
    return res.status(200).json({ ok:true, deleted: before-guestbook.length });
  }
  return res.status(405).json({ error:'Method not allowed' });
}
