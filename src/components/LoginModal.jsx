import React, { useState } from 'react';
import { api, auth } from '../utils/api';

export default function LoginModal({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('用户名和密码不能为空');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isRegister) {
        // 注册
        result = await api.register(username.trim(), password, inviteCode.trim() || undefined);
      } else {
        // 登录
        result = await api.login(username.trim(), password);
      }

      if (result.success) {
        // 保存 token 和用户信息
        auth.setToken(result.data.token);
        auth.setUser({
          userId: result.data.userId,
          username: result.data.username,
          role: result.data.role
        });

        // 调用原来的 onLogin 回调
        onLogin(result.data.username);
      } else {
        setError(result.error || '操作失败');
      }
    } catch (err) {
      console.error('请求错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
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
          {isRegister ? '注册新账号加入游戏' : '登录账号加入多人游戏'}
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="用户名 (3-20个字符)"
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
              marginBottom: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <input
            type="password"
            placeholder="密码 (至少6位)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#111',
              border: '1px solid var(--neon-cyan)',
              color: 'var(--neon-cyan)',
              fontSize: '16px',
              borderRadius: '4px',
              marginBottom: '15px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          {isRegister && (
            <input
              type="text"
              placeholder="邀请码 (可选)"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              maxLength={8}
              style={{
                width: '100%',
                padding: '12px',
                background: '#111',
                border: '1px solid var(--neon-cyan)',
                color: 'var(--neon-cyan)',
                fontSize: '16px',
                borderRadius: '4px',
                marginBottom: '15px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          )}

          {error && (
            <div style={{
              color: '#ff3860',
              fontSize: '14px',
              marginBottom: '15px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="cyber-btn"
            disabled={loading || !username.trim() || !password.trim()}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              marginBottom: '15px'
            }}
          >
            {loading ? '处理中...' : (isRegister ? '注册' : '登录')}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            style={{
              width: '100%',
              padding: '10px',
              background: 'transparent',
              border: '1px solid var(--neon-purple)',
              color: 'var(--neon-purple)',
              fontSize: '14px',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            {isRegister ? '已有账号？去登录' : '没有账号？去注册'}
          </button>
        </form>
      </div>
    </div>
  );
}
