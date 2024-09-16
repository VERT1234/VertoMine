import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Mining.css'; // Ensure the stylesheet is correctly imported

const MINING_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BSC_CHAIN_ID = '0x38'; // BSC 主网的 Chain ID (十六进制)

const Mining = ({ account, web3 }) => {
  const [lastMiningTime, setLastMiningTime] = useState(null);
  const [miningInProgress, setMiningInProgress] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  useEffect(() => {
    if (account && web3) {
      checkNetwork();
      fetchLastMiningTime();
    }
  }, [account, web3]);

  const checkNetwork = async () => {
    try {
      const chainId = await web3.eth.getChainId();
      if (chainId === parseInt(BSC_CHAIN_ID, 16)) {
        setIsCorrectNetwork(true);
      } else {
        setIsCorrectNetwork(false);
        setError('Please switch to the Binance Smart Chain (BSC) network.');
      }
    } catch (err) {
      console.error('Error checking network:', err);
      setError('Failed to detect network.');
    }
  };

  const fetchLastMiningTime = async () => {
    try {
      const latestBlockNumber = await web3.eth.getBlockNumber();

      const blocksToCheck = 10000; // This number depends on your network's block time
      const startBlock = Math.max(0, latestBlockNumber - blocksToCheck);

      for (let i = latestBlockNumber; i >= startBlock; i--) {
        const block = await web3.eth.getBlock(i, true);
        if (block && block.transactions) {
          for (let tx of block.transactions) {
            if (
              tx.from &&
              tx.from.toLowerCase() === account.toLowerCase() &&
              tx.to &&
              tx.to.toLowerCase() === '0xyourminingcontractaddress' // Replace with your mining contract address in lowercase
            ) {
              const txTime = block.timestamp * 1000; // Convert to milliseconds
              setLastMiningTime(txTime);
              return;
            }
          }
        }
      }

      setLastMiningTime(null);
    } catch (err) {
      console.error('Error fetching last mining time:', err);
      setError('Failed to fetch last mining time.');
    }
  };

  const handleMining = async () => {
    if (!account || !web3) {
      setError('Please connect your wallet.');
      return;
    }

    if (!isCorrectNetwork) {
      setError('Please switch to the Binance Smart Chain (BSC) network.');
      return;
    }

    try {
      const currentTime = Date.now();

      if (lastMiningTime && currentTime - lastMiningTime < MINING_INTERVAL) {
        const timeLeft = MINING_INTERVAL - (currentTime - lastMiningTime);
        const hoursLeft = (timeLeft / (1000 * 60 * 60)).toFixed(2);
        setError(`You can only mine once every 24 hours. Please wait another ${hoursLeft} hours.`);
        return;
      }

      setMiningInProgress(true);
      setError('');

      const transaction = {
        from: account,
        to: '0xYourMiningContractAddress', // Replace with your mining contract address
        value: web3.utils.toWei('0.01', 'ether'), // Adjust the value as needed
        gas: 200000,
      };

      await web3.eth.sendTransaction(transaction);

      setLastMiningTime(Date.now());
      setSuccessMessage('Successfully mined VERT!');
    } catch (err) {
      console.error('Mining error:', err);
      setError('An error occurred during mining. Please try again.');
    } finally {
      setMiningInProgress(false);
    }
  };

  return (
    <div className="mining-container">
      <h1>VERT Token Mining</h1>
      {!isCorrectNetwork && (
        <p className="error-message">Please switch to the Binance Smart Chain (BSC) network to continue mining.</p>
      )}
      <button
        onClick={handleMining}
        disabled={miningInProgress || !isCorrectNetwork}
        className="mining-button"
      >
        {miningInProgress ? 'Mining in progress...' : 'Start Mining'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
    </div>
  );
};

export default Mining;
