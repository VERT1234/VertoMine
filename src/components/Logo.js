import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 主Logo

// 网络上的主流链 Logo URL
const logos = {
  '0x1': 'https://cryptologos.cc/logos/ethereum-eth-logo.png', // Ethereum 主网
  '0x38': 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png', // BSC 主网
  '0x89': 'https://cryptologos.cc/logos/polygon-matic-logo.png', // Polygon 主网
  '0xa86a': 'https://cryptologos.cc/logos/avalanche-avax-logo.png', // Avalanche 主网
  '0xfa': 'https://cryptologos.cc/logos/fantom-ftm-logo.png', // Fantom 主网
  '0x1f': 'https://cryptologos.cc/logos/arbitrum-arb-logo.png', // Arbitrum
  '0xa4b1': 'https://cryptologos.cc/logos/optimism-op-logo.png', // Optimism
  '0x2': 'https://cryptologos.cc/logos/solana-sol-logo.png' // Solana
};

const Logo = ({ account, setAccount, setWeb3 }) => {
  const [bnbBalance, setBnbBalance] = useState('Loading...');
  const [networkLogo, setNetworkLogo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

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
            fetchNetworkLogo(window.ethereum.chainId); // 获取网络Logo
          }
        } catch (error) {
          console.error('Failed to reconnect wallet', error);
        }
      }
    };

    checkConnectedWallet();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          fetchBalance(new Web3(window.ethereum), accounts[0]);
          fetchNetworkLogo(window.ethereum.chainId); // 更新网络Logo
        } else {
          disconnectWallet();
        }
      };

      const handleChainChanged = (chainId) => {
        fetchNetworkLogo(chainId);
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [setAccount, setWeb3]);

  useEffect(() => {
    if (account && window.ethereum) {
      fetchBalance(new Web3(window.ethereum), account);
      fetchNetworkLogo(window.ethereum.chainId); // 设置网络Logo
    }
  }, [account]);

  const fetchBalance = async (web3Instance, account) => {
    try {
      const balance = await web3Instance.eth.getBalance(account);
      setBnbBalance(parseFloat(web3Instance.utils.fromWei(balance, 'ether')).toFixed(3));
    } catch (error) {
      console.error('Failed to fetch BNB balance', error);
      setBnbBalance('Error');
    }
  };

  // 根据 chainId 显示网络Logo
  const fetchNetworkLogo = (chainId) => {
    const logoUrl = logos[chainId];
    setNetworkLogo(logoUrl ? logoUrl : null); // 如果找不到Logo，设置为null
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      setIsConnecting(true); // 开始加载
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);

        fetchBalance(web3Instance, accounts[0]);
        fetchNetworkLogo(window.ethereum.chainId); // 设置网络Logo

        localStorage.setItem('connected', 'true');
      } catch (error) {
        console.error('Failed to connect wallet', error);
        setBnbBalance('Error');
      } finally {
        setIsConnecting(false); // 加载结束
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setBnbBalance('Loading...');
    setNetworkLogo(null); // 重置网络Logo
    localStorage.removeItem('connected');
  };

  return (
    <div className="logo-container">
      <img src={logo} alt="Logo" className="logo-image" />
      {account ? (
        <div className="wallet-info">
          <button className="wallet-button" onClick={disconnectWallet}>
            <div className="wallet-details">
              {networkLogo && <img src={networkLogo} alt="Network Logo" className="network-logo" />}
              <span>{account.slice(0, 3) + '...' + account.slice(-4)} | BNB: {bnbBalance}</span>
            </div>
          </button>
        </div>
      ) : (
        <button className="connect-button" onClick={connectWallet} disabled={isConnecting}>
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      )}
    </div>
  );
};

export default Logo;
