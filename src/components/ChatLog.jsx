import React, { useEffect, useRef } from 'react';

export default function ChatLog({ logs }) {
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
      
      {recentLogs.map(log => (
        <div key={log.id} className="log-entry">
          <div className={`avatar ${log.type === 'sys' ? 'sys' : 'user'}`}>
            {log.type === 'sys' ? 'SYS' : 'USR'}
          </div>
          <div 
            className={`msg-content ${log.type === 'sys' ? (log.isError ? 'err-msg' : 'sys-msg') : ''}`}
            dangerouslySetInnerHTML={{ __html: log.content }}
          />
        </div>
      ))}
    </div>
  );
}
