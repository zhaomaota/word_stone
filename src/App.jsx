import React, { useState, useRef, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ChatLog from './components/ChatLog';
import InputArea from './components/InputArea';
import Sidebar from './components/Sidebar';
import CardOverlay from './components/CardOverlay';
import LoginModal from './components/LoginModal';
import EditProfileModal from './components/EditProfileModal';
import ChangePasswordModal from './components/ChangePasswordModal';
import { useGame } from './hooks/useGame';
import { useSocket } from './hooks/useSocket';
import { auth, api } from './utils/api';
import './App.css';

function App() {
  const { packs, myInventory, chatLog, addLog, updateLogRoses, clearChatLog, addPacks, cheatMode, openPack, updateInventory } = useGame();
  const [overlayCards, setOverlayCards] = useState([]);
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const [currentPackType, setCurrentPackType] = useState('normal');
  const [username, setUsername] = useState('');
  const [userRoses, setUserRoses] = useState(0);
  const [userAvatar, setUserAvatar] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [messageRoses, setMessageRoses] = useState({}); // 存储每条消息的鲜花数
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // 检查登录状态
  const inputAreaRef = useRef(null); // 改名：从 inputRef 改为 inputAreaRef

  const { isConnected, onlineUsers, sendMessage, sendRose, onMessage, offMessage, onRoseUpdate, offRoseUpdate } = useSocket(username, myInventory);

  // 应用启动时检查是否已登录
  useEffect(() => {
    const checkAuth = async () => {
      const token = auth.getToken();
      const savedUser = auth.getUser();
      
      if (token && savedUser) {
        try {
          // 验证 token 是否有效
          const result = await api.verify(token);
          if (result.success) {
            // Token 有效，自动登录
            setUsername(savedUser.username);
            
            // 获取用户最新信息（包括鲜花数和头像）
            const userInfo = await api.getCurrentUser(token);
            if (userInfo.success) {
              setUserRoses(userInfo.data.totalRoses || 0);
              setUserAvatar(userInfo.data.avatar || '');
              setUserInfo(userInfo.data);
            }
          } else {
            // Token 无效，清除登录信息
            auth.logout();
          }
        } catch (error) {
          console.error('自动登录失败:', error);
          auth.logout();
        }
      }
      
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, []);

useEffect(() => {
  const handleMessage = (msg) => {
    console.log('📨 收到消息:', msg);
    
    if (msg.type === 'user') {
      // 优先显示昵称，没有昵称才显示用户名
      const displayName = msg.nickname || msg.username;
      const newLog = `<strong style="color: var(--neon-green)">[${displayName}]</strong> ${msg.content}`;
      
      // 🔥 传递后端的 ID 和其他数据，包括 nickname
      addLog('user', newLog, false, msg.username, msg.id, msg.roses || 0, msg.nickname);
      //                                         ↑ msg.id (后端生成的)
      
      console.log('✅ 已添加消息:', { 
        username: msg.username,
        nickname: msg.nickname,
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

  const handleLogin = useCallback(async (name) => {
    setUsername(name);
    
    // 登录后立即加载用户数据
    const token = auth.getToken();
    if (token) {
      try {
        // 获取用户信息（包括鲜花数和头像）
        const userInfo = await api.getCurrentUser(token);
        if (userInfo.success) {
          setUserRoses(userInfo.data.totalRoses || 0);
          setUserAvatar(userInfo.data.avatar || '');
          setUserInfo(userInfo.data);
        }
        
        // 触发 useGame 重新加载卡包和单词
        window.dispatchEvent(new Event('user-login'));
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    }
  }, []);

  const handleOpenPack = useCallback(async (packType = 'normal') => {
    const cards = await openPack(packType);
    if (cards) {
      setCurrentPackType(packType);
      setOverlayCards(cards);
      setIsOverlayOpen(true);
    }
  }, [openPack]);

  const handleCloseOverlay = useCallback(() => {
    setIsOverlayOpen(false);
    setOverlayCards([]);
  }, []);

  const handleOpenAnother = useCallback(async () => {
    const cards = await openPack(currentPackType);
    if (cards) {
      setOverlayCards(cards);
    }
  }, [openPack, currentPackType]);

  const handleEditProfile = useCallback(() => {
    setIsEditProfileOpen(true);
  }, []);

  const handleChangePassword = useCallback(() => {
    setIsChangePasswordOpen(true);
  }, []);

  const handleLogout = useCallback(() => {
    auth.logout();
    window.location.reload();
  }, []);

  const handleUpdateUser = useCallback((updatedUser) => {
    if (updatedUser.nickname !== undefined) {
      // 更新昵称后，需要更新聊天显示
      setUserInfo(prev => ({ ...prev, nickname: updatedUser.nickname }));
    }
    if (updatedUser.avatar !== undefined) {
      setUserAvatar(updatedUser.avatar || '');
    }
  }, []);

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

  // 正在检查登录状态时显示加载界面
  if (isCheckingAuth) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#0a0a0a',
        color: 'var(--neon-cyan)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>WORDSTONE</h2>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

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
        userAvatar={userAvatar}
        userNickname={userInfo?.nickname || ''}
        onEditProfile={handleEditProfile}
        onChangePassword={handleChangePassword}
        onLogout={handleLogout}
      />

      <div id="main-container">
        <div id="left-panel">
          <ChatLog 
            logs={enrichedChatLog} 
            onSendRose={handleSendRose}
            currentUsername={username}
            onClearLog={clearChatLog}
            inventory={myInventory}
            onSystemMessage={(msg) => addLog('sys', msg, false)}
            onUpdateInventory={updateInventory}
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
        hasMorePacks={packs[currentPackType] > 0}
        packType={currentPackType}
      />

      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        currentUser={userInfo}
        onUpdateUser={handleUpdateUser}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
}

export default App;
