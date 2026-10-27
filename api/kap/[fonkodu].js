export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { fonkodu } = req.query;
  if (!fonkodu) return res.status(400).json({ success: false, error: 'fonkodu gerekli' });

  try {
    const kod = fonkodu.toUpperCase();
    
    // KAP Real API - Fund Detail
    const kapResponse = await fetch(`https://www.kap.org.tr/tr/api/fund/${kod}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.kap.org.tr/',
        'Origin': 'https://www.kap.org.tr'
      }
    });

    if (!kapResponse.ok) {
      // Fallback: KAP search endpoint
      const searchRes = await fetch('https://www.kap.org.tr/tr/api/fundSearch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        body: JSON.stringify({ text: kod })
      });
      const searchData = await searchRes.json();
      return res.json({ success: true, source: 'KAP CANLI - SEARCH', fonkodu: kod, data: searchData });
    }

    const data = await kapResponse.json();
    res.json({ success: true, source: 'KAP CANLI GERCEK', fonkodu: kod, data });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, source: 'KAP HATA' });
  }
}
