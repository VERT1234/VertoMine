import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Mining.css'; // 引入外部CSS样式

const Mining = () => {
    const [account, setAccount] = useState(null);
    const [canMine, setCanMine] = useState(false);
    const [miningTotal, setMiningTotal] = useState(0); // 记录总挖矿数
    const [isMining, setIsMining] = useState(false);
    const [timer, setTimer] = useState(60); // 倒计时，默认为60秒
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

    // 连接钱包
    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setErrorMessage('');
                } else {
                    setErrorMessage('No wallet connected.');
                }
            } catch (error) {
                setErrorMessage('User denied wallet connection.');
            }
        } else {
            setErrorMessage('Please install MetaMask.');
        }
    };

    // 检查是否可以挖矿 (使用本地存储来记录挖矿时间)
    const checkCanMine = async () => {
        try {
            const lastMiningTime = localStorage.getItem(`lastMiningTime_${account}`);
            const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳 (秒)

            if (lastMiningTime && currentTime - lastMiningTime < 86400) {
                setCanMine(false);
            } else {
                setCanMine(true);
            }
        } catch (error) {
            setErrorMessage('Error checking mining status.');
            console.error('Error checking mining status:', error);
        }
    };

    useEffect(() => {
        if (account) {
            checkCanMine(); // 检查用户是否可以挖矿
        }
    }, [account]);

    // 页面加载时自动尝试连接钱包
    useEffect(() => {
        if (!account) {
            connectWallet(); // 自动尝试连接钱包
        }
    }, []);

    // 点击挖矿按钮，增加随机的挖矿数量
    const handleClickMine = () => {
        if (!canMine || timer <= 0 || !account) {
            setErrorMessage('Cannot mine. Please ensure wallet is connected and try again.');
            return;
        }

        const reward = (Math.random() * 0.15 + 0.05).toFixed(3); // 生成 0.05 到 0.2 之间的随机 Vert 数量
        setMiningTotal((prevTotal) => prevTotal + parseFloat(reward)); // 累积总挖矿数
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
            setTimer(60); // 重置倒计时
        }
    }, [timer, isMining]);

    // 开始挖矿，启动倒计时
    const startMining = async () => {
        if (!canMine || !account) {
            setErrorMessage('You can only mine once every 24 hours.');
            return;
        }
        setIsMining(true);
        setErrorMessage('');

        // 记录当前挖矿时间到本地存储
        const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）
        localStorage.setItem(`lastMiningTime_${account}`, currentTime);

        setCanMine(false);
    };

    // 提现挖矿所得的代币
    const handleWithdraw = async () => {
        if (miningTotal <= 0 || !account) {
            setErrorMessage('No tokens to withdraw or wallet not connected.');
            return;
        }

        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const amountToWithdraw = web3.utils.toWei(miningTotal.toString(), 'ether'); // 转换为 Wei 单位

            // 调用合约的分发代币函数
            await contract.methods.distributeTokens(account, amountToWithdraw).send({
                from: account,
                gas: 300000,
            });

            setSuccessMessage('Tokens withdrawn successfully!');
            setMiningTotal(0); // 清空挖矿总数
            checkCanMine(); // 检查是否可以再次挖矿
        } catch (error) {
            console.error('Error withdrawing tokens:', error);
            setErrorMessage('Error withdrawing tokens.');
        }
    };

    return (
        <div className="mining-container">
            <h1 className="mining-main-title">CLICK LIKE CRAZY!</h1>  {/* 主标题 */}
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
            ) : miningTotal > 0 ? (
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
            </p>  {/* 提示文字容器 */}
        </div>
    );
};

export default Mining;
