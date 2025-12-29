import React, { useEffect, useState } from 'react';
import { api, auth } from '../utils/api';

export default function TokenModal({ open, word = '', rarity = '', trans = '', wordId = null, isFavorited: initialFavorited = false, onClose, onFavoriteToggle, onSystemMessage }) {
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsFavorited(initialFavorited);
  }, [initialFavorited, word]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleToggleFavorite = async () => {
    if (!wordId || loading) return;
    
    console.log('🔄 开始切换收藏状态:', { word, wordId, currentState: isFavorited });
    
    setLoading(true);
    const newFavoriteState = !isFavorited;
    
    try {
      const token = auth.getToken();
      const result = await api.toggleFavorite(token, wordId, newFavoriteState);
      
      console.log('✅ API返回结果:', result);
      
      if (result.success) {
        setIsFavorited(newFavoriteState);
        if (onFavoriteToggle) {
          onFavoriteToggle(wordId, newFavoriteState);
        }
        if (onSystemMessage) {
          const message = newFavoriteState 
            ? `已将 <span class="token c-${rarity}" data-t="${trans}">${word}</span> 收藏到生词本`
            : `已将 <span class="token c-${rarity}" data-t="${trans}">${word}</span> 移出生词本`;
          console.log('📢 发送系统消息:', message);
          onSystemMessage(message);
        }
      }
    } catch (error) {
      console.error('收藏失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  console.log('TokenModal props:', { word, wordId, isFavorited }); // 调试日志

  return (
    <div id="token-modal-overlay" onClick={onClose}>
      <div id="token-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tm-header">
          <h3>{word}</h3>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              className="tm-favorite-btn"
              onClick={handleToggleFavorite}
              disabled={loading || !wordId}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: '20px',
                lineHeight: '1',
                cursor: (loading || !wordId) ? 'not-allowed' : 'pointer',
                opacity: (loading || !wordId) ? 0.3 : 1,
                transition: 'all 0.2s ease',
                padding: '0',
                color: isFavorited ? '#ffd700' : '#999',
                textShadow: isFavorited ? '0 0 8px rgba(255, 215, 0, 0.6)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (!loading && wordId) {
                  e.currentTarget.style.color = '#ffd700';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = isFavorited ? '#ffd700' : '#999';
              }}
              title={!wordId ? '登录后可收藏' : (isFavorited ? '取消收藏' : '收藏到生词本')}
            >
              ★
            </button>
            <button className="tm-close" onClick={onClose}>×</button>
          </div>
        </div>

        <div className="tm-body">
          <div className={`tm-rarity tm-${rarity}`}>{rarity || 'unknown'}</div>
          <div className="tm-trans">{trans || 'No translation available.'}</div>
        </div>
      </div>
    </div>
  );
}
