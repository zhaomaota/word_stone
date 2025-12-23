import React from 'react';
import OnlineUsersButton from './OnlineUsersButton';

export default function Header({ packs, onAddPacks, onOpenPack, onCheat, onlineUsers = [], isConnected = false, currentUsername = '', userRoses = 0 }) {
  return (
    <header>
      <h1>Wordstone <span style={{ fontSize: '12px', color: 'var(--neon-blue)' }}>// BETA</span></h1>
      <div className="controls">
        {/* 在线用户按钮 */}
        <OnlineUsersButton 
          users={onlineUsers}
          isConnected={isConnected}
          currentUsername={currentUsername}
          userRoses={userRoses}
        />
        
        <button className="cyber-btn cheat" onClick={onCheat}>[测试: 注入全部词汇]</button>
        <span style={{ color: '#555' }}>|</span>
        <span style={{ fontSize: '12px', color: '#888' }}>🌹:</span>
        <span className="pack-badge" style={{ color: '#ff69b4' }}>{userRoses}</span>
        <span style={{ color: '#555' }}>|</span>
        <span style={{ fontSize: '12px', color: '#888' }}>PACKS:</span>
        <span className="pack-badge">{packs}</span>
        <button className="cyber-btn" onClick={onAddPacks}>领取卡包</button>
        <button 
          className="cyber-btn" 
          onClick={onOpenPack} 
          disabled={packs <= 0}
        >
          开启卡包
        </button>
      </div>
    </header>
  );
}
