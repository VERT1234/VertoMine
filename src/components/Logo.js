import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 主Logo

const supportedChains = {
  '0x1': 'Ethereum Mainnet',
  '0x38': 'Binance Smart Chain',
  '0x89': 'Polygon',
  // 可以根据需要添加其他支持的链
};

const Logo = ({ account, setAccount, setWeb3 }) => {
  const [bnbBalance, setBnbBalance] = useState('Loading...');
  const [networkLogo, setNetworkLogo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showChainOptions, setShowChainOptions] = useState(false);
  const [availableChains, setAvailableChains] = useState([]);
  const [availableAccounts, setAvailableAccounts] = useState([]);

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

  const fetchNetworkLogo = (chainId) => {
    const logos = {
      '0x1': 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      '0x38': 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
      '0x89': 'https://cryptologos.cc/logos/polygon-matic-logo.png',
    };
    const logoUrl = logos[chainId];
    setNetworkLogo(logoUrl ? logoUrl : null); // 如果找不到Logo，设置为null
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      setIsConnecting(true); // 开始加载
      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // 获取可用的链和账户
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });

        // 如果有可用账户，显示选择框
        if (accounts.length > 0) {
          setAvailableChains([chainId]); // 假设目前只有一个链可用
          setAvailableAccounts(accounts); // 显示可用的账户
          setShowChainOptions(true); // 显示链和账户选择框
        } else {
          alert('No accounts found.');
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
      } finally {
        setIsConnecting(false); // 加载结束
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const handleChainSelect = async (selectedChainId) => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: selectedChainId }],
      });
      setShowChainOptions(false); // 隐藏选择框
      fetchNetworkLogo(selectedChainId);
    } catch (switchError) {
      console.error('Failed to switch chain', switchError);
    }
  };

  const handleAccountSelect = (selectedAccount) => {
    setAccount(selectedAccount);
    setShowChainOptions(false); // 隐藏选择框
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
        <div>
          <button className="connect-button" onClick={connectWallet} disabled={isConnecting}>
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>

          {showChainOptions && (
            <div className="chain-options">
              <h3>Select a Chain</h3>
              {availableChains.map((chainId) => (
                <button key={chainId} onClick={() => handleChainSelect(chainId)}>
                  {supportedChains[chainId] || `Chain ID: ${chainId}`}
                </button>
              ))}
              <h3>Select an Account</h3>
              {availableAccounts.map((acc) => (
                <button key={acc} onClick={() => handleAccountSelect(acc)}>
                  {acc.slice(0, 6)}...{acc.slice(-4)}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
