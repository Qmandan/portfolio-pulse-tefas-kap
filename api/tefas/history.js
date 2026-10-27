export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { fonkodu, start, end } = req.query;
  if (!fonkodu) return res.status(400).json({ success: false, error: 'fonkodu gerekli' });

  try {
    const today = new Date().toISOString().split('T')[0];
    const response = await fetch('https://www.tefas.gov.tr/api/DB/BindHistoryInfo', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://www.tefas.gov.tr',
        'Referer': 'https://www.tefas.gov.tr/FonAnaliz.aspx'
      },
      body: JSON.stringify({
        FonKod: fonkodu.toUpperCase(),
        Bastarih: start || '2024-01-01',
        Bittarih: end || today,
        Fontip: 'YAT'
      })
    });

    const raw = await response.json();
    const history = raw.data || raw || [];

    // Cashflow & return calculation
    let enriched = [];
    let totalReturn = 0;

    if (Array.isArray(history) && history.length > 1) {
      const firstPrice = parseFloat(history[0].FIYAT || history[0].fiyat || 1);
      const lastPrice = parseFloat(history[history.length - 1].FIYAT || history[history.length - 1].fiyat || 1);
      totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

      enriched = history.map((h, i) => {
        if (i === 0) return { ...h, dailyReturn: 0, cashflow: 0 };
        const prev = parseFloat(history[i - 1].FIYAT || history[i - 1].fiyat || 1);
        const curr = parseFloat(h.FIYAT || h.fiyat || 1);
        const daily = ((curr - prev) / prev) * 100;
        return {
          ...h,
          dailyReturn: Number(daily.toFixed(4)),
          cashflow: Number((curr - prev).toFixed(6))
        };
      });
    } else {
      enriched = history;
    }

    res.json({
      success: true,
      source: 'TEFAS TARIHSEL CANLI + CASHFLOW',
      fonkodu: fonkodu.toUpperCase(),
      totalReturn: totalReturn.toFixed(2) + '%',
      days: history.length,
      data: enriched
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}
