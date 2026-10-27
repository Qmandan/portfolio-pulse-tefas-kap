module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  const { fonkodu, q, code } = req.query || {};
  const search = (fonkodu || q || code || 'BSM').toUpperCase().trim();
  
  try {
    // TEFAS'ın hala açık olan API'si - BindHistoryInfo
    const r = await fetch('https://www.tefas.gov.tr/api/DB/BindHistoryInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Origin': 'https://www.tefas.gov.tr',
        'Referer': 'https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=' + search
      },
      body: JSON.stringify({
        fonkodu: search,
        bastarih: '01.10.2026',
        bittarih: '27.10.2026',
        fontip: 'YAT'
      })
    });
    
    const text = await r.text();
    let data;
    try { data = JSON.parse(text); } catch(e){ data = {raw: text.substring(0,500)}; }
    
    if (data && data.data && data.data.length > 0) {
      // Gerçek TEFAS verisi geldi!
      const last = data.data[0];
      const prev = data.data[1];
      const dailyReturn = prev ? ((parseFloat(last.FIYAT) - parseFloat(prev.FIYAT)) / parseFloat(prev.FIYAT) * 100) : 0;
      
      return res.json({
        success: true,
        source: 'TEFAS CANLI GERÇEK - BindHistoryInfo',
        fonkodu: search,
        count: data.data.length,
        dailyReturn: dailyReturn,
        lastPrice: last.FIYAT,
        data: data.data,
        note: 'TEFAS resmi geçmiş verisi - %100 gerçek'
      });
    }
    
    return res.json({
      success: false,
      source: 'TEFAS API',
      fonkodu: search,
      raw: text.substring(0,500),
      note: 'TEFAS veri döndürmedi veya engelledi'
    });
    
  } catch(e){
    res.status(500).json({success:false, error:e.message, fonkodu: search});
  }
}
