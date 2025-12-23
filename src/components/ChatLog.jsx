import React, { useEffect, useRef } from 'react';

export default function ChatLog({ logs, onSendRose, currentUsername }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  // 只显示最近 50 条消息
  const recentLogs = logs.slice(-50);

  return (
    <div id="chat-log" ref={logRef}>
      <div className="log-entry">
        <div className="avatar sys">SYS</div>
        <div className="msg-content sys-msg">
          系统初始化...<br />
          &gt; 正在尝试挂载外部数据库 [vocabulary.json]...
        </div>
      </div>
      
      {recentLogs.map((log, idx) => (
        <div key={log.id ?? log.timestamp ?? idx} className="log-entry">
          <div className={`avatar ${log.type === 'sys' ? 'sys' : 'user'}`}>
            {log.type === 'sys' ? 'SYS' : 'USR'}
          </div>
          <div style={{ flex: 1 }}>
            <div 
              className={`msg-content ${log.type === 'sys' ? (log.isError ? 'err-msg' : 'sys-msg') : ''}`}
            >
              <span dangerouslySetInnerHTML={{ __html: log.content }} />
              {log.roses > 0 && log.username && log.username === currentUsername && (
                <span className="msg-roses"> 🌹{log.roses}</span>
              )}
            </div>
            
            {/* 用户消息才显示鲜花功能 */}
            {log.type === 'user' && log.username !== currentUsername && (
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
      ))}
    </div>
  );
}
