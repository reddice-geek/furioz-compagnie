import { getIP, logIntrusion, getStats, intrusionLogs, visitLogs } from './_utils.js';
export default function handler(req, res){
  const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
  if(!ADMIN_TOKEN){
    return res.status(503).json({error:'Configuration Admin manquante'});
  }
  if(req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`){
    logIntrusion(getIP(req),'unauth_stats','Accès stats sans auth');
    return res.status(401).json({error:'Non autorisé'});
  }
  const s=getStats();
  const topCountries = Object.entries(visitLogs.reduce((a,v)=>{a[v.country]=(a[v.country]||0)+1; return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,10);
  return res.status(200).json({ stats:s, recentVisits: visitLogs.slice(-50).reverse(), recentIntrusions: intrusionLogs.slice(-50).reverse(), topCountries, serverTime:new Date().toISOString() });
}
