import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 正确导入图片

const Logo = ({ account, setAccount, setWeb3 }) => {
  const [bnbBalance, setBnbBalance] = useState('Loading...');

  useEffect(() => {
    if (account && window.ethereum) {
      const fetchBalance = async () => {
        try {
          const web3Instance = new Web3(window.ethereum);
          const balance = await web3Instance.eth.getBalance(account);
          setBnbBalance(parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(3));
        } catch (error) {
          console.error("Failed to fetch BNB balance", error);
          setBnbBalance('Error');
        }
      };

      fetchBalance();
    }
  }, [account]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        // 获取 BNB 余额
        const balance = await web3Instance.eth.getBalance(accounts[0]);
        setBnbBalance(parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(3));

        localStorage.setItem('connected', 'true');
      } catch (error) {
        console.error("Failed to connect wallet", error);
        setBnbBalance('Error');
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setBnbBalance('Loading...'); // 断开连接时重置余额
    localStorage.removeItem('connected');
  };

  return (
    <div className="logo-container">
      <img src={logo} alt="Logo" className="logo-image" /> {/* 使用导入的图片 */}
      {account ? (
        <button className="wallet-button" onClick={disconnectWallet}>
          {account.slice(0, 3) + '...' + account.slice(-4)} | BNB: {bnbBalance}
        </button>
      ) : (
        <button className="connect-button" onClick={connectWallet}>
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default Logo;
