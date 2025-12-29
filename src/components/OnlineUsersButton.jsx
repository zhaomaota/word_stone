import React, { useState, useEffect, useRef } from 'react';

export default function OnlineUsersButton({ users = [], isConnected = false, currentUsername = '', userRoses = 0 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef(null);
  
  // 点击外部关闭下拉菜单（仅当未固定时）
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isPinned && containerRef.current && !containerRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded, isPinned]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* 主按钮 */}
      <button
        className="cyber-btn"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* 连接状态点 */}
        <span style={{
          display: 'inline-block',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: isConnected ? 'var(--neon-green)' : '#555',
          boxShadow: isConnected ? '0 0 8px var(--neon-green)' : 'none',
          marginRight: '8px'
        }} />
        
        {users.length} 在线
        
        <span style={{ 
          fontSize: '10px', 
          color: '#666',
          marginLeft: '6px',
          transition: 'transform 0.2s',
          display: 'inline-block',
          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
        }}>
          ▼
        </span>
      </button>

      {/* 用户列表 */}
      {isExpanded && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 10px)',
          left: '0',
          minWidth: '240px',
          background: 'rgba(0, 0, 0, 0.98)',
          border: '1px solid var(--neon-cyan)',
          borderRadius: '4px',
          boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)',
          zIndex: 1000,
          overflow: 'hidden'
        }}>
          {/* 标题 */}
          <div style={{
            padding: '12px 14px',
            borderBottom: '1px solid #333',
            fontSize: '12px',
            color: 'var(--neon-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: 'bold',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>Online Users</span>
            <button
              onClick={() => setIsPinned(!isPinned)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isPinned ? 'var(--neon-cyan)' : '#666',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '4px',
                transition: 'all 0.2s',
                transform: isPinned ? 'rotate(45deg)' : 'rotate(0)',
                textShadow: isPinned ? '0 0 8px var(--neon-cyan)' : 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--neon-cyan)';
              }}
              onMouseLeave={(e) => {
                if (!isPinned) e.currentTarget.style.color = '#666';
              }}
              title={isPinned ? '取消固定' : '固定列表'}
            >
              📌
            </button>
          </div>

          {/* 用户列表内容 */}
          <div style={{
            maxHeight: '350px',
            overflowY: 'auto'
          }}>
            {users.length === 0 ? (
              <div style={{
                padding: '30px 20px',
                textAlign: 'center',
                color: '#888',
                fontSize: '13px'
              }}>
                暂无用户在线
              </div>
            ) : (
              users.map(user => {
                const isCurrentUser = user.username === currentUsername;
                const displayRoses = isCurrentUser ? userRoses : (user.roses || 0);
                // 优先显示昵称，没有昵称才显示用户名
                const displayName = user.nickname || user.username;
                
                return (
                  <div
                    key={user.id}
                    style={{
                      padding: '12px 14px',
                      borderBottom: '1px solid #1a1a1a',
                      background: isCurrentUser ? 'rgba(0, 255, 0, 0.08)' : 'transparent',
                      transition: 'background 0.2s',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isCurrentUser 
                        ? 'rgba(0, 255, 0, 0.12)' 
                        : 'rgba(0, 255, 255, 0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isCurrentUser 
                        ? 'rgba(0, 255, 0, 0.08)' 
                        : 'transparent';
                    }}
                  >
                    {/* 用户名行 */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px'
                    }}>
                      <div style={{
                        fontSize: '14px',
                        color: isCurrentUser ? 'var(--neon-green)' : 'var(--neon-cyan)',
                        fontWeight: 'bold',
                        textShadow: isCurrentUser 
                          ? '0 0 5px var(--neon-green)' 
                          : '0 0 5px var(--neon-cyan)'
                      }}>
                        {displayName}
                      </div>
                      
                      {isCurrentUser && (
                        <span style={{
                          fontSize: '10px',
                          color: 'var(--neon-green)',
                          border: '1px solid var(--neon-green)',
                          padding: '3px 8px',
                          borderRadius: '3px',
                          fontWeight: 'bold',
                          letterSpacing: '0.5px'
                        }}>
                          YOU
                        </span>
                      )}
                    </div>

                    {/* 词汇量和鲜花 - 使用 grid 布局对齐 */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 80px',
                      gap: '12px',
                      fontSize: '12px',
                      color: '#999'
                    }}>
                      <div>
                        拥有词汇: <span style={{ 
                          color: '#ccc',
                          fontWeight: 'bold'
                        }}>
                          {user.vocabCount}
                        </span>
                      </div>
                      
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>🌹</span>
                        <span style={{ 
                          color: '#ff69b4',
                          fontWeight: 'bold'
                        }}>
                          {displayRoses}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
