import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SERVER_URL = 'http://localhost:3001';

export function useSocket(username, inventory) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!username) return;

    // 创建连接
    socketRef.current = io(SERVER_URL);

    socketRef.current.on('connect', () => {
      console.log('✅ 已连接到服务器');
      setIsConnected(true);
      
      // 发送用户信息
      socketRef.current.emit('join', { username, inventory });
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ 已断开连接');
      setIsConnected(false);
    });

    // 接收在线用户列表
    socketRef.current.on('users-update', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [username]);

  // 当词库更新时通知服务器
  useEffect(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('update-inventory', inventory);
    }
  }, [inventory, isConnected]);

  const sendMessage = (html, tokens) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', { html, tokens });
    }
  };

const sendRose = (targetUsername, messageId) => {
  console.log('🌹 准备送花:', { targetUsername, messageId });
  console.log('📡 Socket 状态:', {
    exists: !!socketRef.current,
    isConnected: isConnected,
    socketId: socketRef.current?.id,
    connected: socketRef.current?.connected
  });
  
  if (socketRef.current && isConnected) {
    console.log('✅ 发送 send-rose 事件');
    socketRef.current.emit('send-rose', { targetUsername, messageId });
  } else {
    console.error('❌ Socket 未连接，无法送花');
  }
};

  const onMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('message', callback);
    }
  };

  const offMessage = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('message', callback);
    }
  };

  const onRoseUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.on('rose-update', callback);
    }
  };

  const offRoseUpdate = (callback) => {
    if (socketRef.current) {
      socketRef.current.off('rose-update', callback);
    }
  };

  return {
    isConnected,
    onlineUsers,
    sendMessage,
    sendRose,
    onMessage,
    offMessage,
    onRoseUpdate,
    offRoseUpdate
  };
}
