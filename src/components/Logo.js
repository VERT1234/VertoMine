import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 主Logo

const supportedChains = {
  '0x1': { name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  '0x38': { name: 'Binance Smart Chain', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
  '0x89': { name: 'Polygon', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  // 其他链可以根据需要添加
};

const Logo = ({ account, setAccount, setWeb3 }) => {
  const [bnbBalance, setBnbBalance] = useState('Loading...');
  const [networkLogo, setNetworkLogo] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false); // 控制模态框显示
  const [availableChains, setAvailableChains] = useState(Object.keys(supportedChains));
  const [availableAccounts, setAvailableAccounts] = useState([]);
  const [selectedChainId, setSelectedChainId] = useState(null);
  const [noAccountsFound, setNoAccountsFound] = useState(false); // 标记是否找不到账户

  // 适配多个Web3提供者
  const detectProvider = () => {
    let provider;
    if (window.ethereum) {
      provider = window.ethereum;

      // 检测特定钱包
      if (provider.isMetaMask) {
        console.log('Detected MetaMask');
      } else if (provider.isBinanceChain) {
        console.log('Detected Binance Wallet');
      } else if (provider.isOkxWallet) {
        console.log('Detected OKX Wallet');
      }
    } else if (window.BinanceChain) {
      provider = window.BinanceChain;
      console.log('Detected Binance Wallet');
    } else {
      provider = null;
      alert('Please install a Web3 wallet (MetaMask, Binance Wallet, OKX Wallet).');
    }
    return provider;
  };

  useEffect(() => {
    const checkConnectedWallet = async () => {
      const provider = detectProvider();
      if (provider && localStorage.getItem('connected') === 'true') {
        try {
          const web3Instance = new Web3(provider);
          const accounts = await web3Instance.eth.getAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            setWeb3(web3Instance);
            fetchBalance(web3Instance, accounts[0]);
            fetchNetworkLogo(provider.chainId); // 获取网络Logo
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
    const chainInfo = supportedChains[chainId];
    setNetworkLogo(chainInfo ? chainInfo.logo : null); // 如果找不到Logo，设置为null
  };

  const connectWallet = async () => {
    const provider = detectProvider();
    if (provider) {
      setIsConnecting(true); // 开始加载
      try {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);

        // 获取账户和链信息
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
          setAvailableAccounts(accounts); // 存储可用账户
          setShowModal(true); // 显示模态框
          setNoAccountsFound(false); // 重置找不到账户的标记
          localStorage.setItem('connected', 'true'); // 记住连接状态
        } else {
          setNoAccountsFound(true); // 标记找不到账户
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
      } finally {
        setIsConnecting(false); // 加载结束
      }
    }
  };

  const handleChainSelect = async (selectedChainId) => {
    try {
      setSelectedChainId(selectedChainId);
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: selectedChainId }],
      });
      fetchNetworkLogo(selectedChainId);
    } catch (switchError) {
      console.error('Failed to switch chain', switchError);
    }
  };

  const handleAccountSelect = (selectedAccount) => {
    setAccount(selectedAccount);
    setShowModal(false); // 隐藏模态框
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

          {noAccountsFound && (
            <p style={{ color: 'red' }}>未找到账户，请先连接钱包。</p>
          )}

          {showModal && (
            <div className="modal">
              <div className="modal-content">
                {!selectedChainId ? (
                  <>
                    <h3>Select a Chain</h3>
                    <div className="chain-options">
                      {availableChains.map((chainId) => (
                        <div key={chainId} className="chain-option" onClick={() => handleChainSelect(chainId)}>
                          <img src={supportedChains[chainId].logo} alt={supportedChains[chainId].name} className="chain-logo" />
                          <span>{supportedChains[chainId].name}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3>Select an Account</h3>
                    <div className="account-options">
                      {availableAccounts.map((acc) => (
                        <div key={acc} className="account-option" onClick={() => handleAccountSelect(acc)}>
                          {acc.slice(0, 6)}...{acc.slice(-4)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                <button className="close-button" onClick={() => setShowModal(false)}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
