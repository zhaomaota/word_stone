import React, { useState } from 'react';

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: '#0a0a0a',
        border: '2px solid var(--neon-cyan)',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 0 30px var(--neon-cyan)',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h2 style={{
          color: 'var(--neon-cyan)',
          marginBottom: '20px',
          textAlign: 'center',
          fontSize: '24px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          WORDSTONE: ONLINE
        </h2>
        
        <p style={{
          color: '#888',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '14px'
        }}>
          输入你的用户名加入多人游戏
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="输入用户名..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            autoFocus
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              fontSize: '16px',
              borderRadius: '4px',
              marginBottom: '20px',
              outline: 'none'
            }}
          />
          
          <button
            type="submit"
            className="cyber-btn"
            disabled={!username.trim()}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}
          >
            连接服务器
          </button>
        </form>
      </div>
    </div>
  );
}
