import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Settings.css';

const VERT_CONTRACT_ADDRESS = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726'; // VERT 合约地址
const USDT_TO_VERT_RATE = 0.03; // 每个VERT代币的价格

const Settings = ({ totalTokens = 10500000, soldTokens = 4725000, account }) => {
  const [timeRemaining, setTimeRemaining] = useState(''); // 倒计时
  const [progress, setProgress] = useState(45); // 初始进度设为 45%
  const [showModal, setShowModal] = useState(false);
  const [vertBalance, setVertBalance] = useState(0);
  const [vertAmountInput, setVertAmountInput] = useState(''); // 用户输入的 VERT 数量
  const [bnbPrice, setBnbPrice] = useState(0);
  const [bnbAmount, setBnbAmount] = useState(0); // 转换后的 BNB 数量
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // 按钮状态

  // 获取实时 BNB 价格
  useEffect(() => {
    const fetchBnbPrice = async () => {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT');
      const data = await response.json();
      setBnbPrice(parseFloat(data.price));
    };
    fetchBnbPrice();
  }, []);

  // 初始化 Web3 并获取钱包中的 VERT 余额
  useEffect(() => {
    if (window.ethereum && account) {
      const web3 = new Web3(window.ethereum);
      const vertContract = new web3.eth.Contract([
        {
          "constant": true,
          "inputs": [{"name": "_owner", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"name": "balance", "type": "uint256"}],
          "type": "function"
        }
      ], VERT_CONTRACT_ADDRESS);

      vertContract.methods.balanceOf(account).call().then(balance => {
        setVertBalance(web3.utils.fromWei(balance, 'ether'));
      });
    }
  }, [account]);

  // 处理 VERT 数量输入的变化，并转换为 BNB，同时限制输入不超过余额
  const handleVertAmountChange = (e) => {
    const vertAmount = e.target.value;

    // 当输入为空时，不更新为最大余额
    if (vertAmount === '') {
      setVertAmountInput(''); 
      setBnbAmount(0);
      setIsButtonDisabled(true);
      return;
    }

    if (parseFloat(vertAmount) <= parseFloat(vertBalance)) {
      setVertAmountInput(vertAmount);
      const usdtAmount = vertAmount * USDT_TO_VERT_RATE;
      const convertedBnb = usdtAmount / bnbPrice;
      setBnbAmount(convertedBnb.toFixed(6));
      setIsButtonDisabled(vertAmount <= 0);
    } else {
      setVertAmountInput(vertBalance);
    }
  };

  // 更新倒计时和进度条
  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endDate = new Date('2024-11-01T00:00:00Z'); // 设置预售结束时间
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Pre-sale has ended.');
      }
    };

    const updateProgress = () => {
      const minIncrease = 0.05;
      const maxIncrease = 0.1;
      const randomIncrease = Math.random() * (maxIncrease - minIncrease) + minIncrease;
      const newProgress = progress + randomIncrease;

      setProgress(Math.min(newProgress, 100)); // 进度最大为100%
    };

    calculateTimeRemaining(); // 初始调用倒计时
    const countdownTimer = setInterval(() => {
      calculateTimeRemaining(); // 每秒更新倒计时
    }, 1000);

    const progressTimer = setInterval(() => {
      updateProgress(); // 每 60 分钟更新一次进度
    }, 60 * 60 * 1000);

    return () => {
      clearInterval(countdownTimer);
      clearInterval(progressTimer);
    };
  }, [progress]);

  const handleExplainClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="settings-container">
      {/* 代币换算区域 */}
      <div className="conversion-section">
        <h3 className="section-title">VERT to BNB Conversion</h3>
        <p>Your VERT Balance: {vertBalance} VERT</p>
        <div className="conversion-input-group">
          <input
            type="number"
            placeholder="Enter VERT amount"
            value={vertAmountInput}
            onChange={handleVertAmountChange}
            className="vert-input"
            max={vertBalance} // 限制输入不超过余额
          />
          <button
            className="action-button"
            onClick={() => window.open('https://t.me/david_thompson_coo', '_blank')}
            disabled={isButtonDisabled}
          >
            Contact Reviewer
          </button>
        </div>
        <p>Converted BNB: {bnbAmount} BNB</p>
      </div>

      <h2 className="settings-title">SHOW</h2>

      <div className="presale-section">
        <h3 className="section-title">Pre-sale Countdown</h3>
        <p className="countdown-text">{timeRemaining}</p>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{progress.toFixed(2)}%</span>
          </div>
        </div>
        <p className="progress-info">Pre-sale Progress: {progress.toFixed(2)}%</p>
      </div>

      <div className="button-group">
        <button className="action-button" onClick={() => window.open('https://vertominewhitepaper.vertomine.com/', '_blank')}>
          WHITEPAPER
        </button>
        <button className="action-button" onClick={() => window.open('https://x.com/VertoMine', '_blank')}>
          Twitter
        </button>
        <button className="action-button" onClick={() => window.open('https://t.me/VERT_token', '_blank')}>
          Telegram
        </button>
      </div>

      <div className="explain-section">
        <button className="explain-button" onClick={handleExplainClick}>Explain</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={closeModal}>&times;</span>
            <p>VertoMine's pre-sale event offers early supporters an opportunity to join the project at a low entry cost, while also providing essential funding for its technological development, marketing, and operations. The pre-sale is designed to attract a broad community of participants, fostering a fair and transparent process to collectively drive the project's growth.</p>
            <p>During the early pre-sale, VERT tokens are priced as low as 0.03 USDT per token. Additionally, if you refer friends through your invitation link and they participate in the pre-sale, you will earn a 5% commission on their purchase amount. Moreover, if your invited friends engage in staking and mining, they will receive a 30% yield, with 10% of this automatically credited back to you as the inviter. All of these processes are fully automated, requiring no manual intervention.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact us for prompt support.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
