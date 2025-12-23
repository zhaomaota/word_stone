import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatLog from './components/ChatLog';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import CardOverlay from './components/CardOverlay';
import LoginModal from './components/LoginModal';
import { useGame } from './hooks/useGame';
import { useSocket } from './hooks/useSocket';
import './App.css';

function App() {
  const { packs, myInventory, chatLog, addLog, updateLogRoses, addPacks, cheatMode, openPack } = useGame();
  const [overlayCards, setOverlayCards] = useState([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [userRoses, setUserRoses] = useState(0);
  const [messageRoses, setMessageRoses] = useState({}); // 存储每条消息的鲜花数
  const inputAreaRef = useRef(null); // 改名：从 inputRef 改为 inputAreaRef

  const { isConnected, onlineUsers, sendMessage, sendRose, onMessage, offMessage, onRoseUpdate, offRoseUpdate } = useSocket(username, myInventory);

useEffect(() => {
  const handleMessage = (msg) => {
    console.log('📨 收到消息:', msg);
    
    if (msg.type === 'user') {
      const newLog = `<strong style="color: var(--neon-green)">[${msg.username}]</strong> ${msg.content}`;
      
      // 🔥 传递后端的 ID 和其他数据
      addLog('user', newLog, false, msg.username, msg.id, msg.roses || 0);
      //                                         ↑ msg.id (后端生成的)
      
      console.log('✅ 已添加消息:', { 
        username: msg.username, 
        id: msg.id, 
        idType: typeof msg.id 
      });
    } else {
      // 系统消息不需要 ID
      addLog('sys', msg.content, msg.isError);
    }
  };

  onMessage(handleMessage);
  return () => offMessage(handleMessage);
}, [onMessage, offMessage, addLog]);


  // 监听鲜花更新
  useEffect(() => {
    const handleRoseUpdate = (data) => {
      // data 包含 messageId、roses、sender、receiver 等字段
      if (data.messageId) {
        // 使用服务器返回的精确值（不要盲目 +1）
        setMessageRoses(prev => ({
          ...prev,
          [data.messageId]: data.roses ?? (prev[data.messageId] || 0)
        }));
        // 也同时更新 chatLog 中对应消息，确保本地显示一致（包括自己的消息）
        updateLogRoses(data.messageId, data.roses ?? 0);
      }

      // 仅当此次更新是针对当前用户时，才更新 userRoses
      const receiverName = data.receiver ?? data.receiverUsername ?? data.receiverName;
      if (receiverName && receiverName === username && data.totalRoses !== undefined) {
        setUserRoses(data.totalRoses);

        // 在聊天中插入一条系统提示，告知谁给你送了花
        const senderName = data.sender ?? data.senderUsername ?? '有人';
        addLog('sys', `🌹 ${senderName} 为你的发言送上了鲜花`, false);
      }
    };

    onRoseUpdate(handleRoseUpdate);
    return () => offRoseUpdate(handleRoseUpdate);
  }, [onRoseUpdate, offRoseUpdate]);

  const handleLogin = useCallback((name) => {
    setUsername(name);
  }, []);

  const handleOpenPack = useCallback(() => {
    const cards = openPack();
    if (cards) {
      setOverlayCards(cards);
      setIsOverlayOpen(true);
    }
  }, [openPack]);

  const handleCloseOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setOverlayCards([]);
  }, []);

  const handleOpenAnother = useCallback(() => {
    const cards = openPack();
    if (cards) {
      setOverlayCards(cards);
    }
  }, [openPack]);

  const handleSendMessage = useCallback((html, tokens) => {
    sendMessage(html, tokens);
  }, [sendMessage]);

  const handleSystemMessage = useCallback((content, isError) => {
    addLog('sys', content, isError);
  }, [addLog]);

  const handleLocalMessage = useCallback((html) => {
    addLog('user', html, false, username);
  }, [addLog, username]);

  const handleSendRose = useCallback((targetUsername, messageId) => {
    sendRose(targetUsername, messageId);
  }, [sendRose]);

  const handleInsertWord = useCallback((word) => {
    if (inputAreaRef.current) {
      inputAreaRef.current.insertWord(word);
    }
  }, []);

  // 将messageRoses与chatLog合并，展示时包含roses数量
  const enrichedChatLog = chatLog.map(log => ({
    ...log,
    roses: messageRoses[log.id] || log.roses || 0
  }));

  if (!username) {
    return <LoginModal onLogin={handleLogin} />;
  }

  return (
    <>
      <Header
        packs={packs}
        onAddPacks={addPacks}
        onOpenPack={handleOpenPack}
        onCheat={cheatMode}
        onlineUsers={onlineUsers}
        isConnected={isConnected}
        currentUsername={username}
        userRoses={userRoses}
      />

      <div id="main-container">
        <div id="left-panel">
          <ChatLog 
            logs={enrichedChatLog} 
            onSendRose={handleSendRose}
            currentUsername={username}
          />
          <InputArea
            ref={inputAreaRef} 
            inventory={myInventory}
            onSendMessage={handleSendMessage}
            onSystemMessage={handleSystemMessage}
            onLocalMessage={handleLocalMessage}
            isOnlineMode={isConnected}
          />
        </div>

        <Sidebar
          inventory={myInventory}
          onInsertWord={handleInsertWord}
        />
      </div>

      <CardOverlay
        cards={overlayCards}
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onOpenAnother={handleOpenAnother}
        hasMorePacks={packs > 0}
      />
    </>
  );
}

export default App;
