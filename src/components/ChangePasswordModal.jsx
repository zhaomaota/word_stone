import React, { useState } from 'react';
import { api, auth } from '../utils/api';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError('');

    // 验证
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('请填写所有字段');
      return;
    }

    if (newPassword.length < 6) {
      setError('新密码至少6个字符');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    setLoading(true);

    try {
      const token = auth.getToken();
      const result = await api.changePassword(token, oldPassword, newPassword);
      
      if (result.success) {
        // 直接登出并刷新页面，跳转到登录界面
        auth.logout();
        window.location.reload();
      } else {
        setError(result.error || '修改失败');
      }
    } catch (err) {
      console.error('修改密码失败:', err);
      setError('修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          border: '1px solid var(--neon-cyan)',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 0 40px rgba(0, 243, 255, 0.3)',
          width: '360px'
        }}
      >
        <h2 style={{
          color: 'var(--neon-cyan)',
          marginBottom: '30px',
          textAlign: 'center',
          fontSize: '18px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          修改密码
        </h2>

        {/* 旧密码 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            当前密码
          </label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="输入当前密码"
            autoComplete="off"
            data-form-type="other"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--neon-cyan)',
              fontSize: '14px',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
        </div>

        {/* 新密码 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            新密码
          </label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="输入新密码（至少6位）"
            autoComplete="off"
            data-form-type="other"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--neon-cyan)',
              fontSize: '14px',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
        </div>

        {/* 确认密码 */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{
            display: 'block',
            color: '#888',
            fontSize: '11px',
            marginBottom: '6px',
            textTransform: 'uppercase'
          }}>
            确认密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="再次输入新密码"
            autoComplete="off"
            data-form-type="other"
            style={{
              width: '100%',
              padding: '12px',
              background: 'rgba(0, 243, 255, 0.05)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
              color: 'var(--neon-cyan)',
              fontSize: '14px',
              borderRadius: '6px',
              outline: 'none'
            }}
          />
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
        <div style={{ display: 'flex', gap: '10px' }}>
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
            {loading ? '...' : '确认修改'}
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
      </div>
    </div>
  );
}
