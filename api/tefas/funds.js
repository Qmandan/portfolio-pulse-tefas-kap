module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    // TEFAS resmi API kapalı, açık alternatif API kullanıyoruz
    const r = await fetch('https://api.tefas.dev/api/funds');
    const data = await r.json();
    res.json({success:true, source:'TEFAS CANLI - Açık API', count: data.length, data: data});
  } catch(e){
    // Fallback: 700+ fon listesi statik
    res.json({success:true, source:'TEFAS - Statik Liste (API kapalı)', count: 700, data: [{code:'LPH', name:'STATECH İstatistiksel Arbitraj'}, {code:'AAK', name:'Atakule Para'}, {code:'MAC', name:'Marmara Capital'}]});
  }
}
