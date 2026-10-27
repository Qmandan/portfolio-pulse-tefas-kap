export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ success: false, error: 'symbol gerekli - ornek: THYAO, GARAN' });

  try {
    const cleanSymbol = symbol.toUpperCase().trim();
    const yahooSymbol = cleanSymbol.includes('.IS') ? cleanSymbol : `${cleanSymbol}.IS`;

    const yahooRes = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=1d&range=1mo&includePrePost=false`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      }
    );

    const json = await yahooRes.json();
    const result = json.chart?.result?.[0];
    
    if (!result) throw new Error(`${yahooSymbol} icin BIST verisi bulunamadi`);

    const meta = result.meta;
    const quote = result.indicators.quote[0];
    const timestamps = result.timestamp;

    const history = timestamps
      .map((t, i) => ({
        date: new Date(t * 1000).toISOString().split('T')[0],
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i]
      }))
      .filter(h => h.close !== null);

    res.json({
      success: true,
      source: 'YAHOO FINANCE BIST CANLI GERCEK',
      symbol: yahooSymbol,
      originalSymbol: cleanSymbol,
      currentPrice: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      currency: meta.currency,
      changePercent: (((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100).toFixed(2) + '%',
      count: history.length,
      data: history
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message, source: 'BIST YAHOO HATA' });
  }
}
