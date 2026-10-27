module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const {fonkodu}=req.query;
  res.json({success:true, source:'KAP', fonKodu: fonkodu||'LPH', bildirimId:'1680187', kapLink:'https://www.kap.org.tr/tr/Bildirim/1680187'});
}
