// api/canMine.js
export default function handler(req, res) {
  const wallet = req.query.wallet;
  const lastMiningTime = miningTimes[wallet] || 0;
  const currentTime = Date.now();
  const canMine = (currentTime - lastMiningTime) >= 24 * 60 * 60 * 1000; // 24小时限制

  res.json({ canMine });
}
