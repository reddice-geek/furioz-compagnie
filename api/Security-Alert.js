import { getIP, logIntrusion, logVisit } from './_utils.js';
export default async function handler(req, res){
  if(req.method !== 'POST') return res.status(405).json({error:'Method not allowed'});
  const ip = getIP(req);
  logVisit(req);
  const country = req.headers['x-vercel-ip-country'] || 'unknown';
  const city = req.headers['x-vercel-ip-city'] || 'unknown';
  let body={}; try{ body = typeof req.body==='string'? JSON.parse(req.body): req.body||{}; }catch{}
  const { type, details, page } = body;
  if(['127.0.0.1','::1'].includes(ip)) return res.status(200).json({ok:true});
  logIntrusion(ip, type||'unknown', details||'No details');
  console.warn('[SECURITY]', {ip, country, city, type, details, page});
  const webhook = process.env.DISCORD_WEBHOOK_URL;
  if(webhook){
    try{
      await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        username:'Furioz Shield', embeds:[{ title:`🚨 ${type} - ${ip}`, color:15158332, fields:[
          {name:'IP', value:`\`${ip}\``, inline:true},
          {name:'Pays', value:`${city}, ${country}`, inline:true},
          {name:'Type', value:type||'unknown', inline:true},
          {name:'Page', value:(page||'').substring(0,200), inline:false},
          {name:'Détails', value:String(details||'').substring(0,1000), inline:false}
        ], timestamp:new Date().toISOString()}]
      })});
    }catch(e){ console.error(e); }
  }
  return res.status(200).json({ok:true});
}
