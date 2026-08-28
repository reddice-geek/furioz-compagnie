export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type, Authorization');
  if(req.method==='OPTIONS') return res.status(200).end();

  // Mémoire simple (en prod, utiliser Vercel KV)
  if(!global._guestbook){
    global._guestbook = [
      { id:'1', name:'Zafkiel', message:"Meilleure team depuis 2024 !", rating:5, date:'2024-11-25', verified:true },
      { id:'2', name:'FoxySword', message:"Ambiance incroyable depuis Canada", rating:5, date:'2026-08-18', verified:true },
    ];
  }
  let guestbook = global._guestbook;

  if(req.method==='GET'){
    return res.status(200).json(guestbook.slice().reverse());
  }
  if(req.method==='POST'){
    try{
      let body=req.body;
      if(typeof body==='string'){ try{ body=JSON.parse(body);}catch{ body={}; } }
      const name=(body.name||'').trim().substring(0,30);
      const message=(body.message||'').trim().substring(0,500);
      const rating=Math.min(5,Math.max(1,parseInt(body.rating)||5));
      if(name.length<2 || message.length<10) return res.status(400).json({error:'Nom 2-30, message 10-500'});
      if(/<script|javascript:|onerror=/i.test(name+message)) return res.status(400).json({error:'Contenu interdit'});
      const entry={ id:Date.now().toString(), name, message, rating, date:new Date().toISOString().split('T')[0], verified:false };
      guestbook.push(entry);
      if(guestbook.length>200) guestbook.shift();
      global._guestbook=guestbook;
      return res.status(201).json({ok:true, entry});
    }catch(e){ return res.status(500).json({error:'Erreur: '+e.message}); }
  }
  if(req.method==='DELETE'){
    const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'furioz_admin_2026_secure';
    if(req.headers.authorization !== `Bearer ${ADMIN_TOKEN}`) return res.status(401).json({error:'Non autorisé'});
    const {id}=req.query;
    const before=guestbook.length;
    global._guestbook = guestbook.filter(g=>g.id!==id);
    return res.status(200).json({ok:true, deleted:before-global._guestbook.length});
  }
  return res.status(405).json({error:'Method not allowed'});
}
