import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Web3 from 'web3';
import Home from './components/Home';
import Team from './components/Team';
import Settings from './components/Settings';
import Mining from './components/Mining'; // 引入Mining组件
import Footer from './components/Footer';
import Logo from './components/Logo';

// 合约地址和 ABI
const VERT_CONTRACT_ADDRESS = '0xEd7ac42dEc44E256A5Ab6fB30686c4695F72E726';
const VERT_ABI = [
  {"inputs":[],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"owner","type":"address"},{"indexed":true,"internalType":"address","name":"spender","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Approval","type":"event"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"from","type":"address"},{"indexed":true,"internalType":"address","name":"to","type":"address"},{"indexed":false,"internalType":"uint256","name":"value","type":"uint256"}],"name":"Transfer","type":"event"},
  {"inputs":[],"name":"PRE_SALE_END_TIME","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"addLiquidity","outputs":[],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"spender","type":"address"}],"name":"allowance","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"address","name":"spender","type":"address"},{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"approve","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"nonpayable","type":"function"},
  {"inputs":[{"internalType":"address","name":"account","type":"address"}],"name":"balanceOf","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  //... 其他合约方法省略
];

const App = () => {
  const [account, setAccount] = useState(null);
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);

  // 连接钱包
  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          setAccount(accounts[0]);
          setWeb3(web3Instance);

          const vertContract = new web3Instance.eth.Contract(VERT_ABI, VERT_CONTRACT_ADDRESS);
          setContract(vertContract); // 设置合约实例
        } catch (error) {
          console.error('Error connecting to wallet', error);
        }
      } else {
        console.error('Please install MetaMask');
      }
    };

    initWeb3();
  }, []);

  return (
    <Router>
      <div style={styles.app}>
        <Logo account={account} setAccount={setAccount} setWeb3={setWeb3} />
        <div style={styles.content}>
          <Routes>
            <Route path="/" element={<Home account={account} web3={web3} contract={contract} />} />
            <Route path="/mining" element={<Mining account={account} web3={web3} contract={contract} />} />
            <Route path="/team" element={<Team account={account} web3={web3} contract={contract} />} />
            <Route path="/settings" element={<Settings account={account} web3={web3} contract={contract} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
};

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#121212',
    color: '#ffffff',
    fontFamily: 'Arial, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    flex: 1,
    padding: '20px',
  },
};

export default App;
