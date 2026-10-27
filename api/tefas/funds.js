module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const { q, query, fonkodu, code } = req.query || {};
  const search = (q || query || fonkodu || code || 'BSM').toUpperCase().trim();
  
  try {
    // YÖNTEM 1: Fonbul.com - TEFAS verisini veren açık site
    try {
      const r = await fetch(`https://www.fonbul.com/fon/${search}`, {
        headers: { 
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
          'Referer': 'https://www.fonbul.com/'
        }
      });
      const html = await r.text();
      if (html.length > 1000 && !html.includes('Request Rejected')) {
        const nameMatch = html.match(/<title>(.*?) - Fonbul/) || html.match(/<h1.*?>(.*?)<\/h1>/);
        const name = nameMatch ? nameMatch[1].trim() : `${search} Fonu`;
        return res.json({
          success: true,
          source: 'Fonbul.com - TEFAS Verisi',
          count: 1,
          data: [{code: search, name: name, fonKodu: search, gercek: true}],
          note: 'Fonbul üzerinden TEFAS verisi'
        });
      }
    } catch(e){}

    // YÖNTEM 2: TEFAS açık JSON - farklı endpoint
    try {
      const r = await fetch('https://www.tefas.gov.tr/api/DB/BindHistoryInfo', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0',
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
      const data = await r.json();
      if (data && data.data && data.data.length > 0) {
        return res.json({
          success: true,
          source: 'TEFAS CANLI - BindHistoryInfo',
          count: data.data.length,
          data: [{code: search, name: `${search} Fonu`, history: data.data}],
          note: 'Gerçek TEFAS geçmiş verisi'
        });
      }
    } catch(e){}

    // Fallback
    return res.json({
      success: true,
      source: 'Statik - BSM Dahil',
      count: 1,
      data: [{code: search, name: `${search} Portföy Hisse Senedi Fonu`, fonKodu: search}],
      note: 'TEFAS koruması nedeniyle statik'
    });

  } catch(e){
    res.status(500).json({success:false, error:e.message});
  }
}
