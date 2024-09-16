const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const { wallet } = req.query;  // 使用 req.query 代替 req.params
  const currentTime = Date.now();

  // 生成 JWT，包含钱包地址和挖矿时间
  const token = jwt.sign(
    { wallet, lastMiningTime: currentTime }, 
    process.env.SECRET_KEY, // 使用环境变量作为密钥
    { expiresIn: '24h' } // 设置 JWT 的过期时间为 24 小时
  );

  // 更新挖矿时间
  miningTimes[wallet] = currentTime;  // 更新挖矿时间

  // 返回 JWT 和成功信息
  res.status(200).json({ success: true, token });
};
