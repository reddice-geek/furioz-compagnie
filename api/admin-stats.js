export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();
  try{
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'furioz_admin_2026_secure';
    const auth = req.headers.authorization || '';
    if(auth !== `Bearer ${ADMIN_TOKEN}`){
      return res.status(401).json({ error:'Non autorisé - token invalide' });
    }
    // Import dynamique pour éviter crash si _utils manque
    let visitLogs=[], intrusionLogs=[], getStats=()=>({totalVisits:0,visits24h:0,uniqueVisitors:0,totalIntrusions:0,blockedIPs:0,intrusionLast24h:0});
    try{
      const utils = await import('./_utils.js');
      visitLogs = utils.visitLogs || [];
      intrusionLogs = utils.intrusionLogs || [];
      getStats = utils.getStats || getStats;
    }catch(e){ console.error('utils import failed', e); }

    const stats = getStats();
    const topCountries = {};
    visitLogs.forEach(v=>{ topCountries[v.country]=(topCountries[v.country]||0)+1; });
    const top = Object.entries(topCountries).sort((a,b)=>b[1]-a[1]).slice(0,10);

    return res.status(200).json({ stats, recentVisits: visitLogs.slice(-50).reverse(), recentIntrusions: intrusionLogs.slice(-50).reverse(), topCountries: top, serverTime: new Date().toISOString() });
  }catch(e){
    console.error(e);
    return res.status(500).json({ error:'Erreur: '+e.message });
  }
}
