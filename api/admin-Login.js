import { getIP, rateLimit, logIntrusion } from './_utils.js';
const ADMIN_USER = process.env.ADMIN_USER;
const ADMIN_PASS = process.env.ADMIN_PASS;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
export default function handler(req, res){
  if(!ADMIN_USER || !ADMIN_PASS || !ADMIN_TOKEN){
    return res.status(503).json({error:'Configuration serveur incomplète'});
  }
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  const ip=getIP(req);
  const rl=rateLimit(ip,'login');
  if(!rl.allowed){
    logIntrusion(ip,'bruteforce_login',`Blocked ${rl.retryAfter}s`);
    return res.status(429).json({error:`Trop de tentatives, réessaye dans ${rl.retryAfter}s`});
  }
  try{
    const body=typeof req.body==='string'? JSON.parse(req.body): req.body;
    if(body.username===ADMIN_USER && body.password===ADMIN_PASS){
      return res.status(200).json({ok:true, token:ADMIN_TOKEN, user:body.username});
    }else{
      logIntrusion(ip,'failed_login',`user=${body.username}`);
      return res.status(401).json({error:'Identifiants invalides', remaining:rl.remaining});
    }
  }catch{ return res.status(500).json({error:'Erreur'}); }
}
