import React, { useState, useEffect } from 'react';
import './Team.css';

const Team = ({ account, web3, contract }) => {
  const [inviteLink, setInviteLink] = useState('Please connect your wallet to generate an invite link.');
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);  // 总点击量
  const [yesterdayClicks, setYesterdayClicks] = useState(0);  // 昨日点击量
  const [yesterdayPurchases, setYesterdayPurchases] = useState(0);  // 昨日购买量
  const [totalPurchases, setTotalPurchases] = useState(0);  // 总购买量
  const [earnedFromPurchases, setEarnedFromPurchases] = useState(0);  // 从购买中赚取的总量
  const [totalStakes, setTotalStakes] = useState(0);  // 总质押量
  const [earnedFromStakes, setEarnedFromStakes] = useState(0);  // 从质押中赚取的总量
  const [totalEarned, setTotalEarned] = useState(0);  // 下线为您总共赚取的数量
  const [copySuccess, setCopySuccess] = useState('');  // 复制成功提示

  useEffect(() => {
    if (account && contract) {
      setIsConnected(true);
      generateInviteLink(account);
      fetchReferralStats(account);  // 获取点击统计信息
    } else {
      setIsConnected(false);
      setInviteLink('Please connect your wallet to generate an invite link.');
      resetStats();
    }
  }, [account, contract]);

  // 生成邀请链接
  const generateInviteLink = (address) => {
    const baseUrl = window.location.origin;
    setInviteLink(`${baseUrl}?ref=${address}`);
  };

  // 重置统计数据
  const resetStats = () => {
    setTotalClicks(0);
    setYesterdayClicks(0);
    setYesterdayPurchases(0);
    setTotalPurchases(0);
    setEarnedFromPurchases(0);
    setTotalStakes(0);
    setEarnedFromStakes(0);
    setTotalEarned(0);
  };

  // 获取邀请链接的统计数据
  const fetchReferralStats = async (account) => {
    setLoading(true);
    try {
      const stats = await contract.methods.getReferralStats(account).call();
      console.log('Referral Stats:', stats);  // 调试时输出
      setTotalClicks(parseInt(stats.totalClicks, 10));
      setYesterdayClicks(calculateYesterdayClicks(stats.lastClicked));
      setYesterdayPurchases(calculateYesterdayPurchases(stats.lastPurchaseTime));
      setTotalPurchases(parseInt(stats.totalPurchases, 10));
      setEarnedFromPurchases(parseFloat(web3.utils.fromWei(stats.totalPurchaseAmount, 'ether')));
      setTotalStakes(parseInt(stats.totalStakes, 10));
      setEarnedFromStakes(parseFloat(web3.utils.fromWei(stats.totalStakeAmount, 'ether')));
      setTotalEarned(parseFloat(web3.utils.fromWei(stats.totalEarned, 'ether')));
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      resetStats();
    }
    setLoading(false);
  };

  // 示例函数，用于计算昨日点击量
  const calculateYesterdayClicks = (lastClicked) => {
    const now = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 86400;
    if (lastClicked > now - oneDayInSeconds) {
      return 1; // 示例逻辑，你可以根据实际需求调整
    }
    return 0;
  };

  // 示例函数，用于计算昨日购买量
  const calculateYesterdayPurchases = (lastPurchaseTime) => {
    const now = Math.floor(Date.now() / 1000);
    const oneDayInSeconds = 86400;
    if (lastPurchaseTime > now - oneDayInSeconds) {
      return 1; // 示例逻辑，你可以根据实际需求调整
    }
    return 0;
  };

  const handleCopy = async () => {
    try {
      // 尝试使用现代的 clipboard API
      await navigator.clipboard.writeText(inviteLink);
      setCopySuccess('Invite link copied to clipboard!');
    } catch (error) {
      console.warn('Modern clipboard API failed, trying execCommand fallback.');

      // 现代的 clipboard API 失败时，尝试使用 document.execCommand 作为后备
      const textArea = document.createElement('textarea');
      textArea.value = inviteLink;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand('copy');
        setCopySuccess(successful ? 'Invite link copied to clipboard!' : 'Failed to copy invite link, please try again.');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        setCopySuccess('Failed to copy invite link, please try again.');
      }

      document.body.removeChild(textArea);
    }

    setTimeout(() => setCopySuccess(''), 3000);  // 3秒后清除提示信息
  };

  return (
    <div className="team-container">
      <div className="invite-section">
        <input
          type="text"
          value={inviteLink}
          readOnly
          className="invite-input"
        />
        <button onClick={handleCopy} className="copy-button" disabled={!isConnected}>
          Copy Invite Link
        </button>
      </div>
      {copySuccess && (
        <p className="copy-success">{copySuccess}</p>
      )}
      <div className="wallet-status">
        {isConnected ? (
          <p className="status-connected">Wallet is connected</p>
        ) : (
          <p className="status-disconnected">Wallet is not connected</p>
        )}
      </div>
      <div className="stats-section">
        <h3>Referral Statistics</h3>
        <p>Total clicks on your invite link: <strong>{totalClicks}</strong></p>
        <p>Clicks on your invite link yesterday: <strong>{yesterdayClicks}</strong></p>
        <p>Yesterday's purchases via your link: <strong>{yesterdayPurchases}</strong></p>
        <p>Total purchases via your link: <strong>{totalPurchases}</strong></p>
        <p>Total earned from purchases: <strong>{earnedFromPurchases} VERT</strong></p>
        <p>Total stakes via your link: <strong>{totalStakes}</strong></p>
        <p>Total earned from stakes: <strong>{earnedFromStakes} VERT</strong></p>
        <p>Total earned from your referrals: <strong>{totalEarned} VERT</strong></p>
      </div>
    </div>
  );
};

export default Team;
