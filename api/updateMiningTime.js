const jwt = require('jsonwebtoken');
const SECRET_KEY = 'K29udXdTQ3FjUHZKdVJDb3ZTbHV5WXhWYjRlNU9HVFA=';  // 设置你的密钥

module.exports = async (req, res) => {
  const wallet = req.query.wallet;  // 获取用户的钱包地址
  const currentTime = Date.now();

  // 生成新的 JWT，将当前时间存储为上次挖矿时间
  const token = jwt.sign({ wallet, lastMiningTime: currentTime }, SECRET_KEY, { expiresIn: '24h' });

  res.json({ success: true, token });
};
