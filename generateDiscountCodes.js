const crypto = require('crypto');
const fs = require('fs');

const DISCOUNT_CODES_COUNT = 10; // 折扣券数量
const CODE_LENGTH = 20; // 折扣券长度
const ENCRYPTION_KEY = 'abcdefghijklmnopqrstuvwx12345678'; // 必须是32字节的密钥
const IV_LENGTH = 16;

// 生成随机的折扣券
function generateDiscountCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// 使用 AES 加密折扣券
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

// 生成加密的折扣券并保存到文件
function generateAndSaveDiscountCodes() {
  const discountCodes = [];
  for (let i = 0; i < DISCOUNT_CODES_COUNT; i++) {
    const code = generateDiscountCode(CODE_LENGTH);
    const encryptedCode = encrypt(code);
    discountCodes.push(encryptedCode);
  }

  fs.writeFileSync('encryptedDiscountCodes.json', JSON.stringify(discountCodes, null, 2));
  console.log('Discount codes generated and saved to encryptedDiscountCodes.json');
}

generateAndSaveDiscountCodes();
