import React, { useState, useEffect } from 'react';
import BN from 'bn.js'; // 从 'bn.js' 导入 BN
import axios from 'axios';
import { fromWei, toWei } from 'web3-utils';
import './Home.css';

const VERT_CONTRACT_ADDRESS = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726'; // 合约地址
const MINING_ADDRESS = '0x29415552aef03D024caD77A45B76E4bF47c9B185'; // 矿池地址
const USDT_TO_VERT_RATE = 0.03; // 1 VERT = 0.03 USDT
const DISCOUNT_RATE = 0.8; // 80% 折扣
const MIN_VERT_AMOUNT = 200; // 最低购买数量
const PRE_SALE_END_DATE = '2024-11-01T00:00:00Z'; // 预售结束日期

// 合约 ABI
const VERT_ABI = [
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
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"getReferralStats","outputs":[{"components":[{"internalType":"uint256","name":"totalClicks","type":"uint256"},{"internalType":"uint256","name":"totalPurchases","type":"uint256"},{"internalType":"uint256","name":"totalPurchaseAmount","type":"uint256"},{"internalType":"uint256","name":"totalStakes","type":"uint256"},{"internalType":"uint256","name":"totalStakeAmount","type":"uint256"},{"internalType":"uint256","name":"totalEarned","type":"uint256"},{"internalType":"uint256","name":"lastClicked","type":"uint256"},{"internalType":"uint256","name":"lastPurchaseTime","type":"uint256"}],"internalType":"struct VertoMine.ReferralStats","name":"","type":"tuple"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakeRecords","outputs":[{"components":[{"internalType":"uint256","name":"amount","type":"uint256"},{"internalType":"uint256","name":"startTime","type":"uint256"},{"internalType":"uint256","name":"endTime","type":"uint256"},{"internalType":"uint256","name":"claimedRewards","type":"uint256"},{"internalType":"bool","name":"claimed","type":"bool"}],"internalType":"struct VertoMine.StakeInfo[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"_staker","type":"address"}],"name":"getStakedBalance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"isOwnershipRenounced","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"mint","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"purchase","outputs":[],"stateMutability":"nonpayable","type":"function"},
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

const Home = ({ account, web3 }) => {
  const [vertAmount, setVertAmount] = useState('');
  const [bnbAmount, setBnbAmount] = useState('');
  const [bnbPrice, setBnbPrice] = useState(null);
  const [vertBalance, setVertBalance] = useState(null);
  const [bnbBalance, setBnbBalance] = useState(null);
  const [miningAmount, setMiningAmount] = useState('');
  const [stakedVert, setStakedVert] = useState('0');
  const [rewards, setRewards] = useState('0');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [isDiscountValid, setIsDiscountValid] = useState(false);

  useEffect(() => {
    if (account && web3) {
      initializeData(web3, account);
    }
  }, [account, web3]);

  const calculateTimeRemaining = () => {
    const endDate = new Date(PRE_SALE_END_DATE);
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

  useEffect(() => {
    calculateTimeRemaining();
    const countdownTimer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  const initializeData = async (web3Instance, account) => {
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
      setVertBalance(fromWei(vertBalance, 'ether'));
      setBnbBalance(fromWei(bnbBalance, 'ether'));
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const fetchStakedVert = async (account, web3Instance) => {
    try {
      const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
      const staked = await vertContract.methods.getStakedBalance(account).call();
      setStakedVert(fromWei(staked, 'ether'));
    } catch (error) {
      console.error('Error fetching staked VERT:', error);
    }
  };

  const fetchRewards = async (account, web3Instance) => {
    try {
      const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
      const stakeRecords = await vertContract.methods.getStakeRecords(account).call();

      let totalRewards = new BN(0); // 使用 'bn.js' 的 BN
      for (let i = 0; i < stakeRecords.length; i++) {
        const reward = await vertContract.methods.calculateRewards(account, i).call();
        totalRewards = totalRewards.add(new BN(reward));
      }
      setRewards(fromWei(totalRewards, 'ether'));
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const fetchBnbPrice = async () => {
    const apis = [
      'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT',
      'https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd',
      'https://api.coinpaprika.com/v1/tickers/bnb-binance-coin',
      'https://www.okx.com/api/v5/market/ticker?instId=BNB-USDT',
    ];

    for (let i = 0; i < apis.length; i++) {
      try {
        const response = await axios.get(apis[i]);
        let price;
        if (i === 0) {
          price = parseFloat(response.data.price);
        } else if (i === 1) {
          price = parseFloat(response.data.binancecoin.usd);
        } else if (i === 2) {
          price = parseFloat(response.data.quotes.USD.price);
        } else if (i === 3) {
          price = parseFloat(response.data.data[0].last);
        }
        setBnbPrice(price);
        break;
      } catch (error) {
        console.error(`API ${i + 1} failed, trying next API...`);
      }
    }
  };

  const handleVertAmountChange = (e) => {
    const vert = e.target.value;
    if (vert >= 0) {
      setVertAmount(vert);
      let usdtAmount = vert * USDT_TO_VERT_RATE;
      if (isDiscountValid) {
        usdtAmount *= DISCOUNT_RATE;
      }
      if (bnbPrice) {
        const bnbAmount = usdtAmount / bnbPrice;
        setBnbAmount(bnbAmount.toFixed(6));
      }
    }
  };
  const handlePurchase = async () => {
    if (web3 && account && vertAmount && bnbAmount) {
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
        await web3.eth.sendTransaction({
          from: account,
          to: MINING_ADDRESS,
          value: toWei(bnbAmount, 'ether'),
        });
        alert('Purchase successful!');
        fetchBalances(account, web3);
      } catch (error) {
        console.error('Purchase failed:', error.message);
        alert(`There was an issue with your purchase: ${error.message}`);
      }
    } else {
      alert('Please make sure your wallet is connected and you have entered a valid amount.');
    }
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
      // 更多折扣码...
    ];

    if (validCodes.includes(institutionCode)) {
      setIsDiscountValid(true);
      alert('Institution code applied successfully!');
    } else {
      setIsDiscountValid(false);
      alert('Invalid institution code.');
    }
  };

  const handleStake = async () => {
    if (web3 && account && miningAmount) {
      if (parseFloat(vertBalance) < parseFloat(miningAmount)) {
        alert('You do not have enough VERT to stake.');
        return;
      }
      try {
        const vertContract = new web3.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
        const miningAmountInWei = toWei(miningAmount, 'ether');

        // 批准合约从您的账户中花费 VERT 代币
        await vertContract.methods
          .approve(VERT_CONTRACT_ADDRESS, miningAmountInWei)
          .send({ from: account });

        await vertContract.methods.stakeTokens(miningAmountInWei).send({ from: account });
        alert('Staking successful!');
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

  const handleClaimRewards = async () => {
    if (web3 && account) {
      if (parseFloat(rewards) === 0) {
        alert('You have no rewards to claim.');
        return;
      }
      try {
        const vertContract = new web3.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);

        // 获取用户的质押记录
        const stakeRecords = await vertContract.methods.getStakeRecords(account).call();

        if (stakeRecords.length === 0) {
          alert('You have not staked any VERT tokens.');
          return;
        }

        // 遍历质押记录，领取奖励
        for (let i = 0; i < stakeRecords.length; i++) {
          await vertContract.methods.distributeDailyRewards(account).send({ from: account });
        }

        alert('Rewards claimed successfully!');
        fetchRewards(account, web3);
        fetchBalances(account, web3);
        fetchStakedVert(account, web3);
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
      <div className="presale-countdown">
        <h3>Pre-sale Countdown</h3>
        <p>{timeRemaining}</p>
      </div>
      <h2>VERT Token Pre-Sale</h2>
      {bnbPrice ? (
        <p>Current BNB Price: <strong>{bnbPrice} USDT</strong></p>
      ) : (
        <p>Loading BNB price...</p>
      )}
      <div className="institution-section">
        <input
          type="text"
          placeholder="Enter institution code"
          value={institutionCode}
          onChange={(e) => setInstitutionCode(e.target.value)}
          className="institution-input short-input"
        />
        <button
          onClick={validateInstitutionCode}
          className="apply-button short-button"
        >
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
        <p>
          You will pay approximately <strong>{bnbAmount}</strong> BNB for{' '}
          <strong>{vertAmount}</strong> VERT.
        </p>
      )}
	  <div className="arrow-down">↓</div>
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
            onChange={(e) => setMiningAmount(e.target.value)}
            className="vert-input short-input"
          />
          <button onClick={handleStake} className="stake-button short-button">
            Stake VERT
          </button>
        </div>
        <button onClick={handleClaimRewards} className="claim-button" disabled={parseFloat(rewards) === 0}>
          Claim Rewards
        </button>
        <p className="expected-income">Expected mining income: 30%</p>
      </div>
    </div>
  );
};

export default Home;
