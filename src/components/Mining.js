import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import axios from 'axios';
import './Mining.css'; // 引入外部CSS样式

const Mining = ({ account }) => {
  const [canMine, setCanMine] = useState(false);
  const [miningTotal, setMiningTotal] = useState(0); // 记录总挖矿数
  const [isMining, setIsMining] = useState(false);
  const [hasMined, setHasMined] = useState(false); // 记录是否已完成挖矿但未提现
  const [timer, setTimer] = useState(60); // 倒计时，默认为60秒
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [miningClicks, setMiningClicks] = useState(0); // 记录点击次数

  const contractABI = [
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
  const contractAddress = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726'; // 合约地址

  useEffect(() => {
    if (account) {
      checkCanMine(); // 仅在有账户时检查挖矿状态
    }
  }, [account]);

  const checkCanMine = async () => {
  try {
    const token = localStorage.getItem('miningToken');

    const response = await axios.get(`/api/canMine`, {
      headers: {
        'Authorization': `Bearer ${token}`,  // 携带 JWT
      },
      params: { wallet: account }
    });

    setCanMine(response.data.canMine);
  } catch (err) {
    setErrorMessage('Error fetching mining status.');
    console.error('Error fetching mining status:', err);  // 打印错误信息进行调试
  }
};


  // 点击挖矿按钮，增加随机的挖矿数量
  const handleClickMine = () => {
    if (!canMine || timer <= 0 || !account) {
      setErrorMessage('Cannot mine. Please ensure wallet is connected and try again.');
      return;
    }

    const reward = (Math.random() * 0.15 + 0.05).toFixed(3); // 生成 0.05 到 0.2 之间的随机Vert数量
    setMiningTotal((prevTotal) => prevTotal + parseFloat(reward)); // 增加总挖矿数
    setMiningClicks((prevClicks) => prevClicks + 1); // 增加点击次数

    // 添加点击效果
    const button = document.querySelector('.mining-button');
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 200); // 200ms后移除点击效果
  };

  // 倒计时逻辑
  useEffect(() => {
    if (timer > 0 && isMining) {
      const countdown = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
      return () => clearInterval(countdown); // 清除倒计时
    } else if (timer === 0 && isMining) {
      setIsMining(false);
      setHasMined(true); // 设置已完成挖矿
      setTimer(60); // 重置计时器
    }
  }, [timer, isMining]);

  // 开始挖矿，启动倒计时并存储 JWT
  const startMining = async () => {
  if (!canMine || !account) {
    setErrorMessage('Please connect your wallet to start mining.');
    return;
  }
  setIsMining(true);
  setErrorMessage('');
  setHasMined(false); // 重置 hasMined 状态

  // 更新挖矿时间
  try {
    const response = await axios.post(`/api/updateMiningTime`, null, {
      params: { wallet: account },
    });

    if (response.data.success) {
      localStorage.setItem('miningToken', response.data.token); // 存储 JWT
    }

  } catch (err) {
    setErrorMessage('Failed to update mining time.');
    console.error('Error updating mining time:', err);
  }
};


  // 提现代币
  const handleWithdraw = async () => {
    if (miningTotal <= 0 || !account) {
      setErrorMessage('No tokens to withdraw or wallet not connected.');
      return;
    }

    try {
      const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(contractABI, contractAddress);
      const amountToWithdraw = web3.utils.toWei(miningTotal.toString(), 'ether'); // 转换为Wei

      await contract.methods.distributeTokens(account, amountToWithdraw).send({
        from: account,
        gas: 300000,
      });

      setSuccessMessage('Tokens withdrawn successfully!');
      setMiningTotal(0); // 清空挖矿总数
      setMiningClicks(0); // 清空点击次数
      setHasMined(false); // 重置 hasMined 状态
      checkCanMine(); // 刷新 canMine 状态
    } catch (error) {
      console.error('Error withdrawing tokens:', error);
      setErrorMessage('Error withdrawing tokens.');
    }
  };

  return (
    <div className="mining-container">
      <h1 className="mining-main-title">CLICK LIKE CRAZY!</h1>
      <h1 className="mining-header">Mining Area</h1>

      {!account ? (
        <p className="mining-error">
          Please connect your wallet to start mining.
        </p>
      ) : isMining ? (
        <div className="mining-action">
          <div>
            <button
              className="mining-button"
              onClick={handleClickMine}
              disabled={timer <= 0}
            >
              {timer > 0 ? 'Click to Mine' : 'Time’s Up'}
            </button>
            <div className="progress-container">
              <progress value={60 - timer} max="60"></progress>
              <p>{timer}s remaining</p>
            </div>
          </div>
          <p className="mining-total">
            Total Mined Vert: {miningTotal.toFixed(3)} Vert
          </p>
        </div>
      ) : hasMined || miningTotal > 0 ? (
        <div className="mining-action">
          <p className="mining-total">
            Total Mined Vert: {miningTotal.toFixed(3)} Vert
          </p>
          <button
            onClick={handleWithdraw}
            className="withdraw-button"
            disabled={miningTotal <= 0}
          >
            Withdraw Tokens
          </button>
        </div>
      ) : canMine ? (
        <div className="mining-action">
          <button className="mining-start-button" onClick={startMining}>
            Start Mining
          </button>
        </div>
      ) : (
        <p className="mining-error">
          You can mine only once every 24 hours. Please come back later.
        </p>
      )}

      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <p className="mining-warning">
        During mining, please do not leave this page. After mining is complete, you will need to withdraw the mined Vert tokens to your BSC wallet. If you do not withdraw, the collected Vert will be lost.
      </p>
    </div>
  );
};

export default Mining;
