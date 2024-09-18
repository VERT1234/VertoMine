import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// WalletConnect 组件，用于处理钱包连接逻辑
const WalletConnect = ({ setAccount }) => {
    const [walletConnected, setWalletConnected] = useState(false); // 标识是否连接了钱包
    const [balance, setBalance] = useState(0); // 用户的BNB余额
    const [errorMessage, setErrorMessage] = useState(''); // 错误信息

    // 检查是否安装了MetaMask或其他Web3兼容钱包
    const checkIfWalletIsInstalled = () => {
        return typeof window.ethereum !== 'undefined'; // 检查是否存在以太坊对象
    };

    // 连接钱包的函数
    const connectWallet = async () => {
        if (checkIfWalletIsInstalled()) {
            try {
                // 请求MetaMask连接账户
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                if (accounts.length > 0) {
                    const account = accounts[0]; // 获取用户的钱包地址
                    setAccount(account); // 将钱包地址传递给父组件
                    setWalletConnected(true); // 设置为钱包已连接
                    setErrorMessage('');

                    // 获取账户余额
                    const web3 = new Web3(window.ethereum);
                    const balanceInWei = await web3.eth.getBalance(account); // 获取余额（Wei）
                    const balanceInEth = web3.utils.fromWei(balanceInWei, 'ether'); // 将Wei转换为BNB
                    setBalance(parseFloat(balanceInEth).toFixed(4)); // 设置余额，保留四位小数
                }
            } catch (error) {
                setErrorMessage('Failed to connect wallet. Please try again.'); // 捕捉连接错误
            }
        } else {
            setErrorMessage('Please install MetaMask.'); // 提示用户安装MetaMask
        }
    };

    // 使用 React 的 useEffect 来处理网络切换
    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]); // 当用户切换账户时更新账户
                    setWalletConnected(true); // 重新标记钱包已连接
                } else {
                    setAccount(null); // 没有账户时清空账户
                    setWalletConnected(false); // 标记钱包未连接
                }
            });
        }
    }, [setAccount]);

    return (
        <div className="wallet-connect">
            {walletConnected ? ( // 如果钱包已经连接，显示余额信息
                <div>
                    <p>Wallet Connected: {balance} BNB</p>
                </div>
            ) : (
                // 如果未连接钱包，显示连接按钮
                <button className="wallet-connect-button" onClick={connectWallet}>
                    Connect Wallet
                </button>
            )}
            {errorMessage && <p className="error-message">{errorMessage}</p>} {/* 显示错误信息 */}
        </div>
    );
};

export default WalletConnect;
