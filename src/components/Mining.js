import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Mining.css'; // 引入外部CSS样式

const Mining = ({ account }) => { // 接收 account 作为 props
    const [canMine, setCanMine] = useState(false); // 是否可以挖矿
    const [miningTotal, setMiningTotal] = useState(0); // 记录累积的挖矿数
    const [isMining, setIsMining] = useState(false); // 挖矿状态
    const [timer, setTimer] = useState(60); // 60秒倒计时
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isWithdrawable, setIsWithdrawable] = useState(false); // 是否可以提现

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
    // 检查用户是否可以挖矿（基于本地存储的24小时冷却期）
    const checkCanMine = () => {
        if (!account) return; // 如果没有连接钱包，不能挖矿

        const lastMiningTime = localStorage.getItem(`lastMiningTime_${account}`);
        const currentTime = Math.floor(Date.now() / 1000); // 当前时间戳（秒）

        if (lastMiningTime && currentTime - lastMiningTime < 86400) {
            const remainingTime = 86400 - (currentTime - lastMiningTime);
            const hours = Math.floor(remainingTime / 3600);
            const minutes = Math.floor((remainingTime % 3600) / 60);
            const seconds = remainingTime % 60;
            setErrorMessage(`You can mine again in ${hours}h ${minutes}m ${seconds}s.`);
            setCanMine(false);
        } else {
            setCanMine(true);
            setErrorMessage('');
        }
    };

    useEffect(() => {
        if (account) {
            checkCanMine(); // 检查用户是否可以挖矿
        }
    }, [account]);

    const handleClickMine = () => {
        if (!account) {
            setErrorMessage('Please connect your wallet to mine.');
            return;
        }

        if (!canMine || timer <= 0) {
            setErrorMessage('Cannot mine. Either mining session is over or cooldown period is active.');
            return;
        }

        const reward = (Math.random() * 0.15 + 0.05).toFixed(3); // 生成 0.05 到 0.2 之间的随机 Vert 数量
        setMiningTotal((prevTotal) => prevTotal + parseFloat(reward)); // 累积总挖矿数
    };

    useEffect(() => {
        let countdown;
        if (isMining && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        } else if (timer === 0 && isMining) {
            setIsMining(false); // 停止挖矿状态
            setIsWithdrawable(true); // 启用提现按钮
            localStorage.setItem(`lastMiningTime_${account}`, Math.floor(Date.now() / 1000)); // 存储挖矿时间
            setCanMine(false); // 进入24小时冷却期
        }
        return () => clearInterval(countdown);
    }, [timer, isMining, account]);

    const startMining = () => {
        if (!account) {
            setErrorMessage('Please connect your wallet to start mining.');
            return;
        }

        if (!canMine) {
            setErrorMessage('You are in a cooldown period. Please wait 24 hours before mining again.');
            return;
        }

        setIsMining(true);
        setIsWithdrawable(false); // 重置提现状态
        setMiningTotal(0); // 重置挖矿总额
        setTimer(60); // 重置倒计时
        setErrorMessage('');
    };

    const handleWithdraw = async () => {
        if (!account || miningTotal <= 0) {
            setErrorMessage('No tokens to withdraw or wallet not connected.');
            return;
        }

        try {
            const web3 = new Web3(window.ethereum);
            const contract = new web3.eth.Contract(contractABI, contractAddress);
            const amountToWithdraw = web3.utils.toWei(miningTotal.toString(), 'ether'); // 转换为 Wei 单位

            await contract.methods.distributeTokens(account, amountToWithdraw).send({
                from: account,
                gas: 300000,
            });

            setSuccessMessage(`Successfully withdrawn ${miningTotal} Vert!`);
            setMiningTotal(0); // 清空挖矿总数
            setIsWithdrawable(false); // 禁用提现按钮
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
            ) : (
                <div className="mining-action">
                    {isMining ? (
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
                    ) : (
                        <button className="mining-start-button" onClick={startMining} disabled={!canMine}>
                            Start Mining
                        </button>
                    )}

                    <p className="mining-total">
                        Total Mined Vert: {miningTotal.toFixed(3)} Vert
                    </p>

                    {isWithdrawable && (
                        <button
                            onClick={handleWithdraw}
                            className="withdraw-button"
                            disabled={miningTotal <= 0}
                        >
                            Withdraw Tokens
                        </button>
                    )}

                    {errorMessage && <p className="error-message">{errorMessage}</p>}
                    {successMessage && <p className="success-message">{successMessage}</p>}
                </div>
            )}

            <p className="mining-warning">
                During mining, please do not leave this page. After mining is complete, you will need to withdraw the mined Vert tokens to your BSC wallet. If you do not withdraw, the collected Vert will be lost.
            </p>
        </div>
    );
};

export default Mining;
