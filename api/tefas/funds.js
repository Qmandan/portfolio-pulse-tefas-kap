module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const r = await fetch('https://www.tefas.gov.tr/api/DB/BindFundSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({Fontip:'YAT',FonKod:'',FonUnvan:'',KurucuKod:'',FonTuruKod:'',Bastarih:'',Bittarih:''})
    });
    const data = await r.json();
    res.json({success:true, source:'TEFAS CANLI', data:[STRIPPED]
  } catch(e){ res.status(500).json({success:false, error:e.message}); }
}
