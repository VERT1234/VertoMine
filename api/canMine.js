const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // 获取 Bearer token

  if (!token) {
    return res.status(403).json({ message: 'No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY); // 验证 JWT
    const lastMiningTime = decoded.lastMiningTime;
    const currentTime = Date.now();

    const canMine = (currentTime - lastMiningTime) >= 24 * 60 * 60 * 1000;  // 24 小时挖矿限制

    res.json({ canMine });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
};
