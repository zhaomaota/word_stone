import React, { useState, useRef } from 'react';
import { api, auth } from '../utils/api';

export default function UserProfileModal({ isOpen, onClose, currentUser, onUpdateUser }) {
  const [username, setUsername] = useState(currentUser?.username || '');
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.avatar || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('文件大小不能超过5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('只能上传图片文件');
        return;
      }
      
      // 压缩图片
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // 限制最大尺寸为 800px
          const maxSize = 800;
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // 转换为 base64，质量 0.8
          const compressed = canvas.toDataURL('image/jpeg', 0.8);
          setAvatarPreview(compressed);
          setError('');
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setError('');
    setLoading(true);

    try {
      const token = auth.getToken();
      const updates = {};
      
      if (username !== currentUser.username) {
        updates.username = username.trim();
      }
      
      if (avatarPreview !== currentUser.avatar) {
        updates.avatar = avatarPreview;
      }

      if (Object.keys(updates).length === 0) {
        onClose();
        return;
      }

      const result = await api.updateCurrentUser(token, updates);
      
      if (result.success) {
        const savedUser = auth.getUser();
        auth.setUser({
          ...savedUser,
          username: result.data.username,
          avatar: result.data.avatar
        });
        
        onUpdateUser(result.data);
        onClose();
        
        if (username !== currentUser.username) {
          window.location.reload();
        }
      } else {
        setError(result.error || '保存失败');
      }
    } catch (err) {
      console.error('更新用户信息失败:', err);
      setError('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    auth.logout();
    window.location.reload();
  };

  const canChangeUsername = () => {
    if (!currentUser?.lastUsernameChange) return true;
    const lastChange = new Date(currentUser.lastUsernameChange);
    const now = new Date();
    const hoursSinceLastChange = (now - lastChange) / (1000 * 60 * 60);
    return hoursSinceLastChange >= 24;
  };

  const getTimeUntilNextChange = () => {
    if (!currentUser?.lastUsernameChange) return null;
    const lastChange = new Date(currentUser.lastUsernameChange);
    const now = new Date();
    const hoursSinceLastChange = (now - lastChange) / (1000 * 60 * 60);
    const hoursRemaining = Math.ceil(24 - hoursSinceLastChange);
    return hoursRemaining > 0 ? hoursRemaining : 0;
  };

  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 10000
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        border: '1px solid var(--neon-cyan)',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 0 40px rgba(0, 243, 255, 0.3)',
        width: '360px',
        position: 'relative'
      }}>
        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* 头像 */}
        <div 
          style={{ 
            textAlign: 'center', 
            marginBottom: '30px',
            cursor: 'pointer'
          }}
          onClick={handleAvatarClick}
          onMouseEnter={() => setIsHoveringAvatar(true)}
          onMouseLeave={() => setIsHoveringAvatar(false)}
        >
          {avatarPreview ? (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img 
                src={avatarPreview} 
                alt="Avatar" 
                style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  border: '3px solid var(--neon-cyan)',
                  objectFit: 'cover',
                  opacity: isHoveringAvatar ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
              />
              {isHoveringAvatar && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  color: 'var(--neon-cyan)',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  pointerEvents: 'none',
                  textAlign: 'center'
                }}>
                  点击更换
                </div>
              )}
            </div>
          ) : (
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid var(--neon-cyan)',
              background: 'rgba(0, 243, 255, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: 'var(--neon-cyan)',
              opacity: isHoveringAvatar ? 0.6 : 1,
              transition: 'opacity 0.2s',
              position: 'relative'
            }}>
              {currentUser?.username?.[0]?.toUpperCase() || '?'}
              {isHoveringAvatar && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  color: 'var(--neon-cyan)',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  上传头像
                </div>
              )}
            </div>
          )}
        </div>

        {/* 用户名 */}
        <div style={{ marginBottom: '25px' }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={!canChangeUsername()}
            placeholder="用户名"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--neon-cyan)',
              fontSize: '16px',
              borderRadius: '6px',
              outline: 'none',
              opacity: canChangeUsername() ? 1 : 0.5,
              transition: 'all 0.2s',
              textAlign: 'center'
            }}
          />
          {!canChangeUsername() && (
            <div style={{
              color: '#ff6b6b',
              fontSize: '11px',
              marginTop: '6px',
              textAlign: 'center'
            }}>
              {getTimeUntilNextChange()}小时后可修改
            </div>
          )}
        </div>

        {/* 错误信息 */}
        {error && (
          <div style={{
            color: '#ff6b6b',
            fontSize: '12px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* 按钮组 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: loading ? '#555' : 'var(--neon-green)',
              color: '#000',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            {loading ? '...' : '保存'}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px',
              background: 'transparent',
              color: '#666',
              border: '1px solid #333',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.2s'
            }}
          >
            取消
          </button>
        </div>

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '10px',
            background: 'transparent',
            color: '#ff6b6b',
            border: '1px solid rgba(255, 107, 107, 0.3)',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.2s'
          }}
        >
          退出登录
        </button>
      </div>
    </div>
  );
}
