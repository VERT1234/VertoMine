import React, { useState, useEffect } from 'react';
import './Settings.css';

const Settings = ({ totalTokens = 10500000, soldTokens = 4725000 }) => {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [progress, setProgress] = useState(45); 
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const endDate = new Date('2024-11-01T00:00:00Z');
      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining('Pre-sale has ended.');
      }
    };

    const updateProgress = () => {
      const totalTime = 30; 
      const daysElapsed = Math.floor((new Date() - new Date('2024-10-01T00:00:00Z')) / (1000 * 60 * 60 * 24));
      const dailyIncrease = 0.3;
      const calculatedProgress = progress + daysElapsed * dailyIncrease;
      const currentProgress = (soldTokens / totalTokens) * 100;
      setProgress(currentProgress > calculatedProgress ? currentProgress : calculatedProgress);
    };

    const timerId = setInterval(() => {
      calculateTimeRemaining();
      updateProgress();
    }, 1000);

    return () => clearInterval(timerId);
  }, [progress, soldTokens, totalTokens]);

  const handleExplainClick = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <div className="settings-container">
      <h2 className="settings-title">SHOW</h2>

      <div className="presale-section">
        <h3 className="section-title">Pre-sale Countdown</h3>
        <p className="countdown-text">{timeRemaining}</p>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${progress}%` }}>
            <span className="progress-text">{progress.toFixed(2)}%</span>
          </div>
        </div>
        <p className="progress-info">Pre-sale Progress: {progress.toFixed(2)}%</p>
      </div>

      <div className="button-group">
        <button className="action-button" onClick={() => window.open('https://vertominewhitepaper.vertomine.com/', '_blank')}>
          WHITEPAPER
        </button>
        <button className="action-button" onClick={() => window.open('https://x.com/VertoMine', '_blank')}>
          Twitter
        </button>
        <button className="action-button" onClick={() => window.open('https://t.me/VERT_token', '_blank')}>
          Telegram
        </button>
      </div>

      <div className="explain-section">
        <button className="explain-button" onClick={handleExplainClick}>Explain</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <span className="modal-close" onClick={closeModal}>&times;</span>
            <p>VertoMine's pre-sale event offers early supporters an opportunity to join the project at a low entry cost, while also providing essential funding for its technological development, marketing, and operations. The pre-sale is designed to attract a broad community of participants, fostering a fair and transparent process to collectively drive the project's growth.</p>
            <p>During the early pre-sale, VERT tokens are priced as low as 0.03 USDT per token. Additionally, if you refer friends through your invitation link and they participate in the pre-sale, you will earn a 5% commission on their purchase amount. Moreover, if your invited friends engage in staking and mining, they will receive a 30% yield, with 10% of this automatically credited back to you as the inviter. All of these processes are fully automated, requiring no manual intervention.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact us for prompt support.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
