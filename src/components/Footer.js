import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css'; // 引入CSS文件以匹配整体风格

const Footer = () => {
  return (
    <div className="footer-container">
      <Link to="/" className="nav-button">Home</Link>
      <Link to="/mining" className="nav-button">Mining</Link> {/* 添加Mining页面的链接 */}
      <Link to="/settings" className="nav-button">Settings</Link>
    </div>
  );
};

export default Footer;
