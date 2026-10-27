module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const r = await fetch('https://www.tefas.gov.tr/api/DB/BindFundSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({Fontip:'YAT',FonKod:'',FonUnvan:'',KurucuKod:'',FonTuruKod:'',Bastarih:'',Bittarih:''})
    });
    const data = await r.json();
    res.json({success:true, source:'TEFAS CANLI GERCEK', count: data.data?.length||data.length, data: data.data||data});
  } catch(e){ res.status(500).json({success:false, error:e.message}); }
}
