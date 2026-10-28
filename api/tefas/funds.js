export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { kod } = req.query;
  if (!kod) return res.status(400).json({ error: 'kod required' });

  try {
    const r = await fetch(
      `https://api.fonoloji.com/v1/funds/${kod.toUpperCase()}`,
      { headers: { 'User-Agent': 'PortfolioPulse/1.0' } }
    );
    if (!r.ok) throw new Error(`Fonoloji ${r.status}`);
    const data = await r.json();

    return res.json({
      kod: kod.toUpperCase(),
      real: true,
      source: 'Fonoloji - TEFAS, KAP, BIST - 34 tarama/gün',
      fetched_at: new Date().toISOString(),
      // Fonoloji already includes: SON GÜNDE DEĞİŞEN, portfolio, flow
      ...data
    });
  } catch (e) {
    return res.status(500).json({ error: e.message, hint: 'Fonoloji kapalıysa mock fallback kullan' });
  }
}
