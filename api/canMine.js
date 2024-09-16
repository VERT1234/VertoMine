const miningTimes = {};  // 假设这是存储挖矿时间的数据

module.exports = async (req, res) => {
  const { wallet } = req.query;  // 使用 req.query 代替 req.params
  const lastMiningTime = miningTimes[wallet] || 0;
  const currentTime = Date.now();
  const canMine = (currentTime - lastMiningTime) >= 24 * 60 * 60 * 1000;  // 24 小时挖矿限制

  res.status(200).json({ canMine });
};
