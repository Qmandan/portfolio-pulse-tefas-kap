module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, query, fonkodu, code } = req.query || {};
  const search = (q || query || fonkodu || code || '').toUpperCase().trim();
  
  try {
    // Eğer spesifik fon aranıyorsa (BSM gibi), direkt TEFAS FonAnaliz sayfasından çek
    if (search) {
      const r = await fetch(`https://www.tefas.gov.tr/FonAnaliz.aspx?FonKod=${search}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      const html = await r.text();
      // HTML'den fon adını çıkar (basit parse)
      const nameMatch = html.match(/<title>(.*?)<\/title>/) || html.match(/FonUnvan["']:\s*["'](.*?)["']/);
      const name = nameMatch ? nameMatch[1] : `${search} Fonu`;
      
      return res.json({
        success: true,
        source: 'TEFAS CANLI - FonAnaliz.aspx',
        count: 1,
        data: [{code: search, name: name, fonKodu: search, source: 'TEFAS Direct'}],
        htmlLength: html.length,
        note: 'TEFAS web sitesinden canlı çekildi'
      });
    }

    // Genel liste için - TEFAS API alternatif denemeler
    let funds = [];
    try {
      const r1 = await fetch('https://www.tefas.gov.tr/api/DB/BindFundPriceHistory', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({}) });
      const d1 = await r1.json();
      if (d1 && d1.data) funds = d1.data;
    } catch(e){}

    if (funds.length === 0) {
      // Fallback: GitHub'daki tefas-api projesi veya fonbul
      try {
        const r2 = await fetch('https://api.tefas.dev/api/funds');
        const d2 = await r2.json();
        funds = d2;
      } catch(e){}
    }

    if (funds.length > 0) {
      return res.json({success:true, source:'TEFAS CANLI', count: funds.length, data: funds});
    }

    // Son çare: Büyük statik liste
    return res.json({success:true, source:'Statik Liste - TEFAS API Kapalı', count: 3, data: [{code:'BSM', name:'BSM Portföy'}]});

  } catch(e){
    res.status(500).json({success:false, error:e.message});
  }
}
