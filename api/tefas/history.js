module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const {fonkodu, days} = req.query || req.body || {};
  if(!fonkodu) return res.status(400).json({error:'fonkodu gerekli'});
  const end=new Date(); const start=new Date(); start.setDate(end.getDate()-(parseInt(days)||15));
  const fmt=d=>d.toLocaleDateString('tr-TR');
  try {
    const r=await fetch('https://www.tefas.gov.tr/api/DB/BindHistoryInfo',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({fonkodu:fonkodu.toUpperCase(), bastarih:fmt(start), bittarih:fmt(end), fontip:'YAT'})
    });
    const data=await r.json();
    res.json({success:true, source:'TEFAS CANLI', fonkodu, data: data.data||data});
  } catch(e){ res.status(500).json({success:false, error:e.message}); }
}
