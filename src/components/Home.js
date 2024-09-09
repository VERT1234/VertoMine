import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios'; // 确保 axios 已导入
import './Home.css';

const VERT_CONTRACT_ADDRESS = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726'; // 更新后的合约地址
const MINING_ADDRESS = '0x29415552aef03D024caD77A45B76E4bF47c9B185'; // 矿池地址
const USDT_TO_VERT_RATE = 0.03; // 1 VERT = 0.03 USDT
const DISCOUNT_RATE = 0.8; // 80% 折扣
const MIN_VERT_AMOUNT = 200; // 最低购买数量限制

const VERT_ABI = [
  // 合约 ABI 的定义
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[],"name":"PRE_SALE_END_TIME","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"staker","type":"address"},{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"calculateRewards","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"decimals","outputs":[{"internalType":"uint8","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"staker","type":"address"}],"name":"distributeDailyRewards","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"distributeTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakeRecords","outputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimedRewards","type":"uint256"},{"internalType":"bool","name":"claimed","type":"bool"}],"internalType":"struct VertoMine.StakeInfo[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakedBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"isOwnershipRenounced","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"newLpAddress","type":"address"}],"name":"setLpAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"setReferrer","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_amount","type":"uint256"}],"name":"stakeTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"symbol","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"totalSupply","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"sender","type":"address"},{"internalType":"address","name":"recipient","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"transferFrom","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_index","type":"uint256"}],"name":"unstakeTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdrawBNB","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"stateMutability":"payable","type":"receive"}
];

const Home = ({ account }) => {
  const [vertAmount, setVertAmount] = useState('');
  const [bnbAmount, setBnbAmount] = useState('');
  const [bnbPrice, setBnbPrice] = useState(null);
  const [vertBalance, setVertBalance] = useState(null);
  const [bnbBalance, setBnbBalance] = useState(null);
  const [miningAmount, setMiningAmount] = useState('');
  const [stakedVert, setStakedVert] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [web3, setWeb3] = useState(null);
  const [referrer, setReferrer] = useState(null);
  const [institutionCode, setInstitutionCode] = useState(''); // 机构代码
  const [isDiscountValid, setIsDiscountValid] = useState(false); // 机构代码是否有效

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);

      // 初始化账户和数据
      initializeData(web3Instance);

      // 获取URL中的推荐人参数
      const urlParams = new URLSearchParams(window.location.search);
      const referrerAddress = urlParams.get('ref');
      if (referrerAddress) {
        setReferrer(referrerAddress);
      }
    } else {
      alert('Please install MetaMask!');
    }
  }, [account]);

  const initializeData = async (web3Instance) => {
    try {
      await fetchBalances(account, web3Instance);
      await fetchStakedVert(account, web3Instance);
      await fetchRewards(account, web3Instance);
      await fetchBnbPrice();
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const fetchBalances = async (account, web3Instance) => {
    try {
      const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
      const vertBalance = await vertContract.methods.balanceOf(account).call();
      const bnbBalance = await web3Instance.eth.getBalance(account);
      setVertBalance(web3Instance.utils.fromWei(vertBalance, 'ether'));
      setBnbBalance(web3Instance.utils.fromWei(bnbBalance, 'ether'));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  // 获取已质押 VERT
  const fetchStakedVert = async (account, web3Instance) => {
    try {
      const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
      const staked = await vertContract.methods.getStakedBalance(account).call();
      setStakedVert(web3Instance.utils.fromWei(staked, 'ether'));
    } catch (error) {
      console.error('Error fetching staked VERT:', error);
    }
  };

  // 获取奖励
  const fetchRewards = async (account, web3Instance) => {
    try {
      const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
      const reward = await vertContract.methods.calculateRewards(account, 0).call();
      setRewards(web3Instance.utils.fromWei(reward, 'ether'));
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  // 获取 BNB 价格
  const fetchBnbPrice = async () => {
    const apis = [
      'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT',
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      'https://api.coinpaprika.com/v1/tickers/bnb-binance-coin',
      'https://www.okx.com/api/v5/market/ticker?instId=BNB-USDT' // OKX API
    ];

    for (let i = 0; i < apis.length; i++) {
      try {
        const response = await axios.get(apis[i]);
        let price;

        // 根据API结构解析BNB价格
        if (i === 0) {
          price = parseFloat(response.data.price);
        } else if (i === 1) {
          price = parseFloat(response.data.binancecoin.usd);
        } else if (i === 2) {
          price = parseFloat(response.data.quotes.USD.price);
        } else if (i === 3) { // OKX API
          price = parseFloat(response.data.data[0].last);
        }

        setBnbPrice(price);
        break; // 如果成功获取价格则跳出循环
      } catch (error) {
        console.error(`API ${i + 1} failed, trying next API...`);
      }
    }
  };

  // 处理 VERT 数量变化
  const handleVertAmountChange = (e) => {
    const vert = e.target.value;
    if (vert >= 0) {
      setVertAmount(vert);
      let usdtAmount = vert * USDT_TO_VERT_RATE;

      if (isDiscountValid) {
        usdtAmount *= DISCOUNT_RATE; // 应用折扣
      }

      if (bnbPrice) {
        const bnbAmount = usdtAmount / bnbPrice;
        setBnbAmount(bnbAmount.toFixed(6));
      }
    }
  };

  // 处理挖矿数量变化
  const handleMiningAmountChange = (e) => {
    setMiningAmount(e.target.value);
  };

  const validateInstitutionCode = () => {
    const validCodes = [
      process.env.REACT_APP_DISCOUNT_CODE_1,
      process.env.REACT_APP_DISCOUNT_CODE_2,
      process.env.REACT_APP_DISCOUNT_CODE_3,
      process.env.REACT_APP_DISCOUNT_CODE_4,
      process.env.REACT_APP_DISCOUNT_CODE_5,
      process.env.REACT_APP_DISCOUNT_CODE_6,
      process.env.REACT_APP_DISCOUNT_CODE_7,
      process.env.REACT_APP_DISCOUNT_CODE_8,
      process.env.REACT_APP_DISCOUNT_CODE_9,
      process.env.REACT_APP_DISCOUNT_CODE_10,
    ];

    if (validCodes.includes(institutionCode)) {
      setIsDiscountValid(true);
      alert('Institution code applied successfully!');
    } else {
      setIsDiscountValid(false);
      alert('Invalid institution code.');
    }
  };

  // 处理购买
  const handlePurchase = async () => {
    if (web3 && account && vertAmount && bnbAmount) {
      // 检查VERT是否大于最低限额
      if (parseFloat(vertAmount) < MIN_VERT_AMOUNT) {
        alert(`You must purchase at least ${MIN_VERT_AMOUNT} VERT.`);
        return;
      }

      if (parseFloat(bnbBalance) < parseFloat(bnbAmount)) {
        alert('You do not have enough BNB to complete this purchase.');
        return;
      }
      try {
        const vertContract = new web3.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);

        // 如果存在推荐人，设置推荐人
        if (referrer) {
          await vertContract.methods.setReferrer(referrer).send({ from: account });
        }

        // 发送 BNB 到预售地址
        await web3.eth.sendTransaction({
          from: account,
          to: MINING_ADDRESS,
          value: web3.utils.toWei(bnbAmount, 'ether')
        });

        // 转移 VERT 到用户账户
        const vertAmountInWei = web3.utils.toWei(vertAmount, 'ether');
        await vertContract.methods.transfer(account, vertAmountInWei).send({ from: MINING_ADDRESS });

        alert('Purchase successful!');
        // 更新余额
        fetchBalances(account, web3);
      } catch (error) {
        console.error('Purchase failed:', error.message);
        alert(`There was an issue with your purchase: ${error.message}`);
      }
    } else {
      alert('Please make sure your wallet is connected and you have entered a valid amount.');
    }
  };

  // 处理质押
  const handleStake = async () => {
    if (web3 && account && miningAmount) {
      if (parseFloat(vertBalance) < parseFloat(miningAmount)) {
        alert('You do not have enough VERT to stake.');
        return;
      }
      try {
        const vertContract = new web3.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
        const miningAmountInWei = web3.utils.toWei(miningAmount, 'ether');

        // 直接调用质押函数，无需预先批准
        await vertContract.methods.stakeTokens(miningAmountInWei).send({ from: account });

        alert('Staking successful!');
        // 更新余额和已质押数量
        fetchBalances(account, web3);
        fetchStakedVert(account, web3);
        fetchRewards(account, web3);
      } catch (error) {
        console.error('Staking failed:', error.message);
        alert(`There was an issue with your staking: ${error.message}`);
      }
    } else {
      alert('Please make sure your wallet is connected and you have entered a valid amount.');
    }
  };

  // 处理领取奖励
  const handleClaimRewards = async () => {
    if (web3 && account) {
      try {
        const vertContract = new web3.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);

        // 调用领取奖励函数
        await vertContract.methods.distributeDailyRewards(account).send({ from: account });

        alert('Rewards claimed successfully!');
        // 更新奖励
        fetchRewards(account, web3);
      } catch (error) {
        console.error('Claiming rewards failed:', error.message);
        alert(`There was an issue with claiming your rewards: ${error.message}`);
      }
    } else {
      alert('Please make sure your wallet is connected.');
    }
  };

  return (
    <div className="home-container">
      <h2>VERT Token Pre-Sale</h2>
      {bnbPrice ? (
        <p>Current BNB Price: <strong>{bnbPrice} USDT</strong></p>
      ) : (
        <p>Loading BNB price...</p>
      )}

      {/* 机构代码输入框 */}
      <div className="institution-section">
        <input
          type="text"
          placeholder="Enter institution code"
          value={institutionCode}
          onChange={(e) => setInstitutionCode(e.target.value)}
          className="institution-input short-input"
        />
        <button onClick={validateInstitutionCode} className="apply-button short-button">
          Apply Institution Code
        </button>
      </div>

      <div className="purchase-section">
        <input
          type="number"
          min="0"
          placeholder="Enter VERT amount"
          value={vertAmount}
          onChange={handleVertAmountChange}
          className="vert-input short-input"
        />
        <button onClick={handlePurchase} className="purchase-button short-button">
          Buy VERT
        </button>
      </div>
      {bnbAmount && (
        <p>You will pay approximately <strong>{bnbAmount}</strong> BNB for <strong>{vertAmount}</strong> VERT.</p>
      )}
      <p className="price-info">Pre-sale price: 0.03 USDT, Listing price: 0.1+ USDT</p>
      
      {/* 添加一个向下的箭头 */}
      <div className="arrow-down">↓</div>
      
      {/* 挖矿区域 */}
      <div className="mining-section">
        <h2>VERT Mining</h2>
        <p>Your VERT Balance: {vertBalance ? `${vertBalance} VERT` : 'Loading...'}</p>
        <p>Your Staked VERT: {stakedVert} VERT</p>
        <p>Your Rewards: {rewards} VERT</p>
        <div className="staking-actions">
          <input
            type="number"
            min="0"
            placeholder="Enter VERT amount"
            value={miningAmount}
            onChange={handleMiningAmountChange}
            className="vert-input short-input"
          />
          <button onClick={handleStake} className="stake-button short-button">
            Stake VERT
          </button>
        </div>
        <button onClick={handleClaimRewards} className="claim-button" disabled={rewards === '0'}>
          Claim Rewards
        </button>
        <p className="expected-income">Expected mining income: 30%</p>
      </div>
    </div>
  );
};

export default Home;
