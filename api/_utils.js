// _utils.js - compatible Vercel
const RATE_LIMITS = { guestbook:{window:60000,max:3}, login:{window:900000,max:5}, api:{window:60000,max:60} };
const ipStore = new Map();
export const intrusionLogs = [];
export const visitLogs = [];

export function getIP(req){
  return (req.headers['x-forwarded-for']||'').split(',')[0]?.trim() || req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}
export function rateLimit(ip, type='api'){
  const cfg = RATE_LIMITS[type] || RATE_LIMITS.api;
  const key = `${ip}:${type}`;
  const now = Date.now();
  let data = ipStore.get(key);
  if(!data || now - data.start > cfg.window){
    data = { count:1, start:now, blockedUntil:0 };
    ipStore.set(key,data);
    return { allowed:true, remaining:cfg.max-1 };
  }
  if(data.blockedUntil && now < data.blockedUntil){
    return { allowed:false, retryAfter: Math.ceil((data.blockedUntil-now)/1000) };
  }
  data.count++;
  if(data.count > cfg.max){
    data.blockedUntil = now + 900000;
    logIntrusion(ip,type,`Rate limit ${type}: ${data.count}`);
    return { allowed:false, retryAfter:900 };
  }
  ipStore.set(key,data);
  return { allowed:true, remaining: cfg.max - data.count };
}
export function logVisit(req){
  try{
    visitLogs.push({ time:new Date().toISOString(), ip:getIP(req), ua:(req.headers['user-agent']||'').substring(0,200), country:req.headers['x-vercel-ip-country']||'??', city:req.headers['x-vercel-ip-city']||'', page:req.headers['referer']||req.url||'/' });
    if(visitLogs.length>1000) visitLogs.shift();
  }catch{}
}
export function logIntrusion(ip,type,details){
  try{
    intrusionLogs.push({ time:new Date().toISOString(), ip, type, details:String(details).substring(0,500) });
    if(intrusionLogs.length>1000) intrusionLogs.shift();
  }catch{}
}
export function getStats(){
  const now=Date.now();
  return {
    totalVisits: visitLogs.length,
    visits24h: visitLogs.filter(v=> now - new Date(v.time).getTime() < 86400000).length,
    uniqueVisitors: new Set(visitLogs.map(v=>v.ip)).size,
    totalIntrusions: intrusionLogs.length,
    blockedIPs: Array.from(ipStore.values()).filter(v=> v.blockedUntil && v.blockedUntil > now).length,
    intrusionLast24h: intrusionLogs.filter(l=> now - new Date(l.time).getTime() < 86400000).length,
  };
}
