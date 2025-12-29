import React, { useState, useEffect, useRef } from 'react';
import OnlineUsersButton from './OnlineUsersButton';
import AvatarDropdown from './AvatarDropdown';
import { FaCalendarCheck, FaGift, FaBook, FaEnvelope } from 'react-icons/fa';

export default function Header({ packs, onAddPacks, onOpenPack, onCheat, onlineUsers = [], isConnected = false, currentUsername = '', userRoses = 0, userAvatar = '', userNickname = '', onEditProfile, onChangePassword, onLogout }) {
  const [showPackMenu, setShowPackMenu] = useState(false);
  const packMenuRef = useRef(null);
  
  const totalPacks = Object.values(packs).reduce((sum, count) => sum + count, 0);
  
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (packMenuRef.current && !packMenuRef.current.contains(event.target)) {
        setShowPackMenu(false);
      }
    };
    
    if (showPackMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPackMenu]);
  
  const packTypes = [
    { type: 'normal', name: '卡包', color: '#888', icon: '📦' },
    { type: 'rare', name: '稀有卡包', color: 'var(--rare)', icon: '💎' },
    { type: 'epic', name: '史诗卡包', color: 'var(--epic)', icon: '👑' },
    { type: 'legendary', name: '传说卡包', color: 'var(--legendary)', icon: '✨' }
  ];
  
  const iconButtons = [
    { icon: FaCalendarCheck, label: '每日签到', color: '#ffd700' },
    { icon: FaGift, label: '在线奖励', color: '#ff69b4' },
    { icon: FaBook, label: '图鉴', color: '#00f3ff' },
    { icon: FaEnvelope, label: '邮件', color: '#90ee90' }
  ];

  return (
    <header>
      <h1>Wordstone <span style={{ fontSize: '12px', color: 'var(--neon-blue)' }}>// BETA</span></h1>
      <div className="controls">
        {/* 功能图标按钮 */}
        {iconButtons.map((btn, index) => {
          const IconComponent = btn.icon;
          return (
            <button
              key={index}
              className="icon-btn"
              title={btn.label}
              onClick={() => {}}
              style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '2px solid #333',
                borderRadius: '2px',
                padding: '8px 10px',
                fontSize: '16px',
                color: btn.color,
                cursor: 'pointer',
                transition: 'all 0.1s',
                marginRight: '6px',
                minWidth: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                filter: 'drop-shadow(0 0 3px ' + btn.color + ')'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.borderColor = btn.color;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 6px ' + btn.color + ')';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.3)';
                e.currentTarget.style.borderColor = '#333';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.filter = 'drop-shadow(0 0 3px ' + btn.color + ')';
              }}
            >
              <IconComponent />
            </button>
          );
        })}
        
        {/* 在线用户按钮 */}
        <OnlineUsersButton 
          users={onlineUsers}
          isConnected={isConnected}
          currentUsername={currentUsername}
          userRoses={userRoses}
        />
        
        {/* 头像下拉菜单 */}
        <AvatarDropdown
          avatar={userAvatar}
          username={currentUsername}
          nickname={userNickname}
          onEditProfile={onEditProfile}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
        
        <button className="cyber-btn cheat" onClick={onCheat}>[测试: 注入全部词汇]</button>
        <span style={{ color: '#555' }}>|</span>
        <span style={{ fontSize: '12px', color: '#888' }}>🌹:</span>
        <span className="pack-badge" style={{ color: '#ff69b4' }}>{userRoses}</span>
        <span style={{ color: '#555' }}>|</span>
        <span style={{ fontSize: '12px', color: '#888' }}>PACKS:</span>
        <span className="pack-badge">{totalPacks}</span>
        <button className="cyber-btn" onClick={onAddPacks}>领取卡包</button>
        
        {/* 开启卡包按钮 + 下拉菜单 */}
        <div ref={packMenuRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button 
            className="cyber-btn" 
            onClick={() => setShowPackMenu(!showPackMenu)}
            disabled={totalPacks <= 0}
          >
            开启卡包
          </button>
          
          {showPackMenu && totalPacks > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: '0',
              minWidth: '200px',
              background: 'rgba(0, 0, 0, 0.98)',
              border: '1px solid var(--neon-cyan)',
              borderRadius: '4px',
              boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
              zIndex: 1000,
              overflow: 'hidden'
            }}>
              {packTypes.map(({ type, name, color, icon }) => (
                <button
                  key={type}
                  onClick={() => {
                    setShowPackMenu(false);
                    onOpenPack(type);
                  }}
                  disabled={packs[type] <= 0}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: '1px solid #222',
                    color: packs[type] > 0 ? color : '#444',
                    cursor: packs[type] > 0 ? 'pointer' : 'not-allowed',
                    textAlign: 'left',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                  onMouseEnter={(e) => {
                    if (packs[type] > 0) {
                      e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>
                    <span style={{ marginRight: '8px' }}>{icon}</span>
                    {name}
                  </span>
                  <span style={{ 
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {packs[type]}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
