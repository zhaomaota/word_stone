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
  const { packs, myInventory, chatLog, addLog, addPacks, cheatMode, openPack } = useGame();
  const [overlayCards, setOverlayCards] = useState([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [username, setUsername] = useState('');
  const inputAreaRef = useRef(null); // 改名：从 inputRef 改为 inputAreaRef

  const { isConnected, onlineUsers, sendMessage, onMessage, offMessage } = useSocket(username, myInventory);

  useEffect(() => {
    const handleMessage = (msg) => {
      if (msg.type === 'user') {
        addLog('user', `<strong style="color: var(--neon-green)">[${msg.username}]</strong> ${msg.content}`, false);
      } else {
        addLog('sys', msg.content, msg.isError);
      }
    };

    onMessage(handleMessage);
    return () => offMessage(handleMessage);
  }, [onMessage, offMessage, addLog]);

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
    addLog('user', html, false);
  }, [addLog]);

  const handleInsertWord = useCallback((word) => {
    if (inputAreaRef.current) {
      inputAreaRef.current.insertWord(word);
    }
  }, []);

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
      />

      <div id="main-container">
        <div id="left-panel">
          <ChatLog logs={chatLog} />
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
