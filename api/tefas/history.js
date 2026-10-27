module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {fonkodu} = req.query || req.body || {};
  if(!fonkodu) return res.status(400).json({error:'fonkodu gerekli'});
  try {
    const r = await fetch(`https://api.tefas.dev/api/funds/${fonkodu.toUpperCase()}/history`);
    const data = await r.json();
    res.json({success:true, source:'TEFAS CANLI', fonkodu, data});
  } catch(e){
    res.json({success:true, source:'DEMO', fonkodu, data: []});
  }
}
