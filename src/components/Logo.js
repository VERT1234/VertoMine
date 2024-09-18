import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 正确导入图片

const Logo = ({ account, setAccount, setWeb3 }) => {
  const [bnbBalance, setBnbBalance] = useState('Loading...');

  useEffect(() => {
    const checkConnectedWallet = async () => {
      if (window.ethereum && localStorage.getItem('connected') === 'true') {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setWeb3(web3Instance);
            fetchBalance(web3Instance, accounts[0]);
          }
        } catch (error) {
          console.error("Failed to reconnect wallet", error);
        }
      }
    };

    checkConnectedWallet();

    if (window.ethereum) {
      // 监听账户更改
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(new Web3(window.ethereum), accounts[0]);
        } else {
          disconnectWallet();
        }
      });

      // 监听网络更改
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [setAccount, setWeb3]);

  useEffect(() => {
    if (account && window.ethereum) {
      fetchBalance(new Web3(window.ethereum), account);
    }
  }, [account]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balance = await web3Instance.eth.getBalance(account);
      setBnbBalance(parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(3));
    } catch (error) {
      console.error("Failed to fetch BNB balance", error);
      setBnbBalance('Error');
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        console.log("Web3 Instance:", web3Instance); // 添加日志
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log("Connected Account:", accounts[0]); // 添加日志
        setAccount(accounts[0]);

        // 获取 BNB 余额
        fetchBalance(web3Instance, accounts[0]);

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
    setBnbBalance('Loading...');
    localStorage.removeItem('connected');
  };

  return (
    <div className="logo-container">
      <img src={logo} alt="Logo" className="logo-image" />
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
