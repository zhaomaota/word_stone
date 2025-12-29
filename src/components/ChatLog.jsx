import React, { useEffect, useRef, useState } from 'react';
import TokenModal from './TokenModal';

export default function ChatLog({ logs, onSendRose, currentUsername, onClearLog, inventory = {}, onSystemMessage, onUpdateInventory }) {
  const logRef = useRef(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [tokenInfo, setTokenInfo] = useState({ word: '', rarity: '', trans: '', wordId: null, isFavorited: false });
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleTokenClick = (e) => {
    const t = e.target.closest?.('.token');
    if (!t) return;
    const word = t.textContent?.trim() || '';
    const cls = Array.from(t.classList || []);
    const rarityCls = cls.find(c => c.startsWith('c-')) || '';
    const rarity = rarityCls ? rarityCls.replace('c-', '') : '';
    const trans = t.getAttribute('data-t') || '';
    
    // 从 inventory 中获取 wordId 和收藏状态
    const wordData = inventory[word];
    const wordId = wordData?.id || null;
    const isFavorited = wordData?.isFavorited || false;
    
    console.log('🔍 点击单词:', word);
    console.log('📦 inventory[word]:', wordData);
    console.log('🆔 wordId:', wordId);
    
    setTokenInfo({ word, rarity, trans, wordId, isFavorited });
    setModalOpen(true);
  };

  const handleFavoriteToggle = (wordId, isFavorited) => {
    // 更新本地状态
    setTokenInfo(prev => ({ ...prev, isFavorited }));
    
    // 同步到父组件的 inventory
    if (onUpdateInventory && tokenInfo.word) {
      onUpdateInventory(tokenInfo.word, isFavorited);
    }
  };

  // 只显示最近 50 条消息
  const recentLogs = logs.slice(-50);

  return (
    <div id="chat-log-container">
      <div className="chatlog-toolbar">
        <button className="chatlog-btn clear-btn" onClick={onClearLog}>
          ⊘ Clear
        </button>
        <button 
          className={`chatlog-btn lock-btn ${!autoScroll ? 'locked' : ''}`} 
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? '🔓 Unlock' : '🔒 Lock'}
        </button>
      </div>
      <div id="chat-log" ref={logRef} onClick={handleTokenClick}>
        {recentLogs.map((log, idx) => {
          const isCurrentUser = log.username === currentUsername;
          
          return (
          <div key={log.id ?? log.timestamp ?? idx} className="log-entry">
          <div className={
            `avatar ${log.type === 'sys' ? 'sys' : (isCurrentUser ? 'you' : 'user')}`
          }>
            {log.type === 'sys' ? 'SYS' : (isCurrentUser ? 'YOU' : 'USR')}
          </div>
          <div style={{ flex: 1 }}>
            <div 
              className={`msg-content ${log.type === 'sys' ? (log.isError ? 'err-msg' : 'sys-msg') : ''}`}
            >
              <span dangerouslySetInnerHTML={{ __html: log.content }} />
              {log.roses > 0 && log.username && isCurrentUser && (
                <span className="msg-roses"> 🌹{log.roses}</span>
              )}
            </div>
            
            {/* 用户消息才显示鲜花功能 */}
            {log.type === 'user' && !isCurrentUser && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: '8px',
                fontSize: '14px'
              }}>
                <button
                  onClick={() => onSendRose && onSendRose(log.username, log.id)}
                  style={{
                    background: 'none',
                    border: '1px solid var(--neon-cyan)',
                    color: '#ff69b4',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    borderRadius: '3px',
                    fontSize: '14px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 105, 180, 0.1)';
                    e.currentTarget.style.boxShadow = '0 0 8px rgba(255, 105, 180, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span>🌹</span>
                  <span>{log.roses || 0}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )})}
      </div>
      <TokenModal
        open={modalOpen}
        word={tokenInfo.word}
        rarity={tokenInfo.rarity}
        trans={tokenInfo.trans}
        wordId={tokenInfo.wordId}
        isFavorited={tokenInfo.isFavorited}
        onClose={() => setModalOpen(false)}
        onFavoriteToggle={handleFavoriteToggle}
        onSystemMessage={onSystemMessage}
      />
    </div>
  );
}
