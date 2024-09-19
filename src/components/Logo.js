import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Logo.css';
import logo from '../assets/logo.png'; // 主Logo

const supportedChains = {
  '0x1': { name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
  '0x38': { name: 'Binance Smart Chain', logo: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png' },
  '0x89': { name: 'Polygon', logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' },
  // 可以根据需要添加其他支持的链
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

  // 检测Web3提供者
  const detectProvider = () => {
    let provider = null;
    if (window.BinanceChain) {
      provider = window.BinanceChain;
      window.BinanceChain.autoRefreshOnNetworkChange = false;
    } else if (window.ethereum) {
      provider = window.ethereum;
    }
    return provider;
  };

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
    setNetworkLogo(chainInfo ? chainInfo.logo : null);
  };

  const connectWallet = async () => {
    const provider = detectProvider();
    if (provider) {
      setIsConnecting(true);
      try {
        const web3Instance = new Web3(provider);
        setWeb3(web3Instance);
        const accounts = await provider.request({ method: 'eth_requestAccounts' });

        if (accounts.length > 0) {
          setAvailableAccounts(accounts);
          setShowModal(true); // 显示模态框，要求选择账户
          setNoAccountsFound(false);
          localStorage.setItem('connected', 'true');
        } else {
          setNoAccountsFound(true);
        }
      } catch (error) {
        console.error('Failed to connect wallet', error);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert('Please install a Web3 wallet (MetaMask, Binance Wallet, OKX Wallet).');
    }
  };

  const handleChainSelect = async (selectedChainId) => {
    try {
      setSelectedChainId(selectedChainId);
      await (window.ethereum || window.BinanceChain).request({
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
    fetchBalance(new Web3(window.ethereum || window.BinanceChain), selectedAccount);
  };

  const disconnectWallet = () => {
    setAccount(null);
    setWeb3(null);
    setBnbBalance('Loading...');
    setNetworkLogo(null);
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

          {noAccountsFound && <p style={{ color: 'red' }}>未找到账户，请先连接钱包。</p>}

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
