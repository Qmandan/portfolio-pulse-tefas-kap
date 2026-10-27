module.exports = async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  const {symbol}=req.query;
  try{
    const r=await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.IS`);
    const d=await r.json();
    const meta=d.chart.result[0].meta;
    res.json({success:true, symbol, price:meta.regularMarketPrice});
  }catch(e){ res.status(500).json({error:e.message}); }
}
