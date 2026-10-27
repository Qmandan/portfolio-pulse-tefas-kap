export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const response = await fetch('https://www.tefas.gov.tr/api/DB/BindFundSearch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Origin': 'https://www.tefas.gov.tr' },
      body: JSON.stringify({ Fontip: 'YAT', FonKod: '', FonUnvan: '', KurucuKod: '', FonTuruKod: '', Bastarih: '', Bittarih: '' })
    });
    const data = await response.json();
    res.json({ success: true, source: 'TEFAS CANLI', data: data.data || data });
  } catch (e) { res.status(500).json({ success: false, error: e.message }); }
}
