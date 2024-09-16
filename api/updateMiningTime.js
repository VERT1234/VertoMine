const miningTimes = {};  // 假设这是存储挖矿时间的数据

module.exports = async (req, res) => {
  const { wallet } = req.query;  // 使用 req.query 代替 req.params
  const currentTime = Date.now();

  miningTimes[wallet] = currentTime;  // 更新挖矿时间
  res.status(200).json({ success: true, lastMiningTime: currentTime });
};
