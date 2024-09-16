import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Settings.css';

const VERT_CONTRACT_ADDRESS = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726'; // VERT 合约地址
const USDT_TO_VERT_RATE = 0.03; // 每个VERT代币的价格
const MIN_VERT_AMOUNT = 300; // 最低兑换数量

const Settings = ({ account, web3, contract }) => {
  const [vertBalance, setVertBalance] = useState(0);
  const [vertAmountInput, setVertAmountInput] = useState('');
  const [bnbPrice, setBnbPrice] = useState(0);
  const [bnbAmount, setBnbAmount] = useState(0);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  
  // Invitation Section States
  const [inviteLink, setInviteLink] = useState('Please connect your wallet to generate an invite link.');
  const [copySuccess, setCopySuccess] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const bnbApiUrls = [
    'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT',
    'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
    'https://api.coinpaprika.com/v1/tickers/bnb-binance-coin',
    'https://www.okx.com/api/v5/market/ticker?instId=BNB-USDT'
  ];

  // 获取实时 BNB 价格
  useEffect(() => {
    const fetchBnbPrice = async () => {
      for (const url of bnbApiUrls) {
        try {
          const response = await fetch(url);
          const data = await response.json();

          let price = 0;
          // 根据不同API的返回结构设置价格
          if (url.includes('binance.com')) {
            price = parseFloat(data.price);
          } else if (url.includes('coingecko.com')) {
            price = parseFloat(data.binancecoin.usd);
          } else if (url.includes('coinpaprika.com')) {
            price = parseFloat(data.quotes.USD.price);
          } else if (url.includes('okx.com')) {
            price = parseFloat(data.data[0].last);
          }

          if (price) {
            setBnbPrice(price);
            break; // 一旦获取到价格，跳出循环
          }
        } catch (error) {
          console.error(`Failed to fetch from ${url}:`, error);
        }
      }
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
          "inputs": [{ "name": "_owner", "type": "address" }],
          "name": "balanceOf",
          "outputs": [{ "name": "balance", "type": "uint256" }],
          "type": "function"
        }
      ], VERT_CONTRACT_ADDRESS);

      vertContract.methods.balanceOf(account).call().then(balance => {
        const vertBalanceInEther = web3.utils.fromWei(balance, 'ether');
        setVertBalance(vertBalanceInEther);

        // 检查余额是否大于或等于最低兑换数量
        if (parseFloat(vertBalanceInEther) >= MIN_VERT_AMOUNT) {
          setIsButtonDisabled(false);
        } else {
          setIsButtonDisabled(true);
        }
      });
    }
  }, [account]);

  // Invitation Link Generation
  useEffect(() => {
    if (account && contract) {
      setIsConnected(true);
      generateInviteLink(account);
    } else {
      setIsConnected(false);
      setInviteLink('Please connect your wallet to generate an invite link.');
    }
  }, [account, contract]);

  const generateInviteLink = (address) => {
    const baseUrl = window.location.origin;
    setInviteLink(`${baseUrl}?ref=${address}`);
  };

  // Invitation Link Copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess('Invite link copied to clipboard!');
    } catch (error) {
      setCopySuccess('Failed to copy invite link.');
    }
    setTimeout(() => setCopySuccess(''), 3000);
  };

  // 处理 VERT 数量输入的变化，并转换为 BNB，同时限制输入不超过余额
  const handleVertAmountChange = (e) => {
    const vertAmount = e.target.value;

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
      setIsButtonDisabled(vertAmount < MIN_VERT_AMOUNT); // 检查输入的金额是否小于最低兑换数量
    } else {
      setVertAmountInput(vertBalance);
    }
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
            placeholder="Enter VERT amount (min 300)"
            value={vertAmountInput}
            onChange={handleVertAmountChange}
            className="vert-input"
            max={vertBalance}
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

      {/* 邀请区域 */}
      <div className="invite-section">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="invite-input"
        />
        <button onClick={handleCopy} className="copy-button" disabled={!isConnected}>
          Copy Invite Link
        </button>
        {copySuccess && <p className="copy-success">{copySuccess}</p>}
      </div>

      {/* 社交媒体按钮 */}
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
    </div>
  );
};

export default Settings;
