// _utils.js - Anti-DDoS + Rate Limit + Storage (Vercel KV ready)
const RATE_LIMITS = {
  guestbook: { window: 60 * 1000, max: 3 },
  login: { window: 15 * 60 * 1000, max: 5 },
  api: { window: 60 * 1000, max: 60 }
};
const ipStore = new Map();
const intrusionLogs = [];
const visitLogs = [];

export function getIP(req){
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.headers['x-real-ip'] || 'unknown';
}
export function rateLimit(ip, type='api'){
  const cfg = RATE_LIMITS[type] || RATE_LIMITS.api;
  const key = `${ip}:${type}`;
  const now = Date.now();
  let data = ipStore.get(key);
  if(!data || now - data.start > cfg.window){
    data = { count:1, start: now, blockedUntil:0 };
    ipStore.set(key, data);
    return { allowed:true, remaining: cfg.max -1 };
  }
  if(data.blockedUntil && now < data.blockedUntil){
    return { allowed:false, retryAfter: Math.ceil((data.blockedUntil - now)/1000), reason:'blocked' };
  }
  data.count++;
  if(data.count > cfg.max){
    data.blockedUntil = now + 15*60*1000;
    logIntrusion(ip, type, `Rate limit ${type}: ${data.count} req`);
    return { allowed:false, retryAfter: 900, reason:'rate_limit' };
  }
  ipStore.set(key, data);
  return { allowed:true, remaining: cfg.max - data.count };
}
export function logVisit(req){
  const ip = getIP(req);
  visitLogs.push({
    time: new Date().toISOString(),
    ip, ua: (req.headers['user-agent']||'').substring(0,200),
    country: req.headers['x-vercel-ip-country'] || '??',
    city: req.headers['x-vercel-ip-city'] || '',
    page: req.headers.referer || req.url || '/'
  });
  if(visitLogs.length > 1000) visitLogs.shift();
}
export function logIntrusion(ip, type, details){
  intrusionLogs.push({ time: new Date().toISOString(), ip, type, details: String(details).substring(0,500) });
  if(intrusionLogs.length > 1000) intrusionLogs.shift();
  console.warn('[INTRUSION]', ip, type, details);
}
export function getStats(){
  const now = Date.now();
  const last24h = visitLogs.filter(v => now - new Date(v.time).getTime() < 86400000).length;
  return {
    totalVisits: visitLogs.length,
    visits24h: last24h,
    uniqueVisitors: new Set(visitLogs.map(v=>v.ip)).size,
    totalIntrusions: intrusionLogs.length,
    blockedIPs: Array.from(ipStore.values()).filter(v=> v.blockedUntil && v.blockedUntil > now).length,
    intrusionLast24h: intrusionLogs.filter(l=> now - new Date(l.time).getTime() < 86400000).length,
  };
}
export { intrusionLogs, visitLogs };
