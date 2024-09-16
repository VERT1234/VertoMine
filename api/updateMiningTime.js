// api/updateMiningTime.js
export default function handler(req, res) {
  const wallet = req.query.wallet;
  const currentTime = Date.now();

  miningTimes[wallet] = currentTime; // 更新最后挖矿时间
  res.json({ success: true, lastMiningTime: currentTime });
}
