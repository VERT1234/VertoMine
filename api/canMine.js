const jwt = require('jsonwebtoken');

const SECRET_KEY = 'K29udXdTQ3FjUHZKdVJDb3ZTbHV5WXhWYjRlNU9HVFA=';  // 请确保密钥的安全

module.exports = async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];  // 获取 JWT
  if (!token) {
    return res.status(403).json({ canMine: false, message: 'No token provided.' });
  }

  try {
    // 验证 JWT
    const decoded = jwt.verify(token, SECRET_KEY);
    const lastMiningTime = decoded.lastMiningTime;
    const currentTime = Date.now();

    // 检查是否已经过了 24 小时
    const canMine = (currentTime - lastMiningTime) >= 24 * 60 * 60 * 1000;

    res.json({ canMine });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ canMine: false, message: 'Invalid token.' });
  }
};
