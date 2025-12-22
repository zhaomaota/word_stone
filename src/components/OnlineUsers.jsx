import React, { useState } from 'react';

export default function OnlineUsers({ users, isConnected, currentUsername }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={{ display: 'inline-block', marginRight: '15px' }}>
      {/* 简洁状态指示器 */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 15px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '20px',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          verticalAlign: 'middle'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(0, 255, 255, 0.1)';
          e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.95)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: isConnected ? 'var(--neon-green)' : '#666',
          boxShadow: isConnected ? '0 0 10px var(--neon-green)' : 'none'
        }} />
        <span style={{
          color: 'var(--neon-cyan)',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {users.length} 在线
        </span>
        <span style={{ color: '#666', fontSize: '10px' }}>
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {/* 展开的用户列表 */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: '65px',
          right: '280px',
          background: 'rgba(0, 0, 0, 0.95)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '8px',
          padding: '15px',
          minWidth: '260px',
          maxHeight: '400px',
          overflowY: 'auto',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 20px rgba(0, 255, 255, 0.2)',
          zIndex: 1000
        }}>
          {users.length === 0 ? (
            <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '10px 0' }}>
              暂无其他用户
            </div>
          ) : (
            users.map(user => {
              const isCurrentUser = user.username === currentUsername;
              
              return (
                <div key={user.id} style={{
                  padding: '10px',
                  marginBottom: '8px',
                  background: isCurrentUser ? 'rgba(0, 255, 0, 0.1)' : '#111',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${isCurrentUser ? 'var(--neon-green)' : 'var(--neon-cyan)'}`,
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = isCurrentUser ? 'rgba(0, 255, 0, 0.15)' : '#1a1a1a';
                  e.currentTarget.style.transform = 'translateX(5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isCurrentUser ? 'rgba(0, 255, 0, 0.1)' : '#111';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                >
                  <div style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px'
                  }}>
                    <div style={{ 
                      color: isCurrentUser ? 'var(--neon-green)' : 'var(--neon-cyan)', 
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}>
                      {user.username}
                    </div>
                    {isCurrentUser && (
                      <span style={{
                        fontSize: '10px',
                        color: 'var(--neon-green)',
                        background: 'rgba(0, 255, 0, 0.2)',
                        padding: '2px 6px',
                        borderRadius: '10px',
                        border: '1px solid var(--neon-green)'
                      }}>
                        YOU
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    gap: '12px',
                    fontSize: '11px',
                    color: '#888'
                  }}>
                    <span>📚 {user.vocabCount}</span>
                    <span style={{ color: '#ff69b4' }}>🌹 {user.roses || 0}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
