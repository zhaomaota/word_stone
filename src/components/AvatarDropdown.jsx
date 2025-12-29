import React, { useState, useRef, useEffect } from 'react';

export default function AvatarDropdown({ avatar, username, nickname, onEditProfile, onChangePassword, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getAvatarDisplay = () => {
    if (avatar) return avatar;
    return null;
  };

  // 优先显示昵称，没有昵称才显示用户名
  const displayName = nickname || username;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          background: 'rgba(0, 243, 255, 0.1)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 243, 255, 0.2)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {getAvatarDisplay() ? (
          <img 
            src={getAvatarDisplay()} 
            alt="Avatar" 
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--neon-cyan)',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid var(--neon-cyan)',
              background: 'rgba(0, 243, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'var(--neon-cyan)'
            }}
          >
            {username?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <span style={{ 
          fontSize: '14px', 
          color: '#00f3ff',
          fontWeight: 'bold',
          textShadow: '0 0 8px rgba(0, 243, 255, 0.8)'
        }}>
          {displayName}
        </span>
        <span style={{ fontSize: '10px', color: 'var(--neon-cyan)' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '8px',
          boxShadow: '0 0 20px rgba(0, 243, 255, 0.3)',
          minWidth: '160px',
          zIndex: 10001,
          overflow: 'hidden'
        }}>
          <button
            onClick={() => {
              setIsOpen(false);
              onEditProfile();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--neon-cyan)',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              borderBottom: '1px solid rgba(0, 243, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            修改信息
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onChangePassword();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: 'var(--neon-cyan)',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              borderBottom: '1px solid rgba(0, 243, 255, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 243, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            修改密码
          </button>
          <button
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: '#ff6b6b',
              fontSize: '13px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 107, 107, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
