import React, { useState, useEffect } from 'react';

export default function CardOverlay({ cards, isOpen, onClose, onOpenAnother, hasMorePacks, packType = 'normal' }) {
  const [flippedCards, setFlippedCards] = useState([]);
  const [cardKey, setCardKey] = useState(0); // 用于强制重新渲染卡片

  useEffect(() => {
    if (isOpen) {
      setFlippedCards([]);
      setCardKey(prev => prev + 1); // 每次打开时更新 key
    }
  }, [isOpen, cards]);

  const flipCard = (index) => {
    if (flippedCards.includes(index)) return;
    
    setFlippedCards(prev => [...prev, index]);
    
    const card = cards[index];
    if (card.r === 'legendary' && navigator.vibrate) {
      navigator.vibrate(200);
    }
  };

  const flipAll = () => {
    cards.forEach((_, idx) => {
      if (!flippedCards.includes(idx)) {
        setTimeout(() => flipCard(idx), idx * 150);
      }
    });
  };

  const handleOpenAnother = () => {
    // 先重置状态，然后调用父组件的开包方法
    setFlippedCards([]);
    setCardKey(prev => prev + 1);
    onOpenAnother();
  };

  const allFlipped = flippedCards.length === cards.length;
  
  // 根据卡包类型设置样式
  const packStyles = {
    normal: {
      bg: 'rgba(136, 136, 136, 0.1)',
      border: '#888',
      glow: 'rgba(136, 136, 136, 0.2)',
      title: '普通卡包'
    },
    rare: {
      bg: 'rgba(0, 112, 221, 0.1)',
      border: 'var(--rare)',
      glow: 'rgba(0, 112, 221, 0.3)',
      title: '稀有卡包'
    },
    epic: {
      bg: 'rgba(163, 53, 238, 0.1)',
      border: 'var(--epic)',
      glow: 'rgba(163, 53, 238, 0.3)',
      title: '史诗卡包'
    },
    legendary: {
      bg: 'rgba(255, 128, 0, 0.1)',
      border: 'var(--legendary)',
      glow: 'rgba(255, 128, 0, 0.4)',
      title: '传说卡包'
    }
  };
  
  const style = packStyles[packType] || packStyles.normal;

  if (!isOpen) return null;

  return (
    <div id="overlay" style={{ 
      display: 'flex',
      background: `radial-gradient(circle at center, ${style.bg} 0%, rgba(0, 0, 0, 0.95) 100%)`
    }}>
      {/* 卡包标题 */}
      <div style={{
        position: 'absolute',
        top: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: '24px',
        fontWeight: 'bold',
        color: style.border,
        textShadow: `0 0 20px ${style.glow}`,
        letterSpacing: '2px',
        textTransform: 'uppercase'
      }}>
        {style.title}
      </div>
      
      <div className="cards-container">
        {cards.map((card, idx) => (
          <div
            key={`${cardKey}-${idx}`}
            className={`card ${flippedCards.includes(idx) ? 'flipped' : ''}`}
            onClick={() => flipCard(idx)}
            style={{
              boxShadow: flippedCards.includes(idx) 
                ? `0 0 30px ${style.glow}` 
                : undefined
            }}
          >
            <div className="face back" style={{
              borderColor: style.border,
              boxShadow: `0 0 15px ${style.glow}`
            }}></div>
            <div className={`face front ${card.r}`}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                {card.w}
              </div>
              <div style={{ fontSize: '14px', color: '#aaa' }}>
                {card.t}
              </div>
              <div style={{ marginTop: 'auto', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {card.r}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="overlay-btns">
        {!allFlipped && (
          <button className="cyber-btn" onClick={flipAll}>
            全部翻开
          </button>
        )}
        
        {allFlipped && (
          <>
            <button
              className="cyber-btn"
              onClick={handleOpenAnother}
              disabled={!hasMorePacks}
            >
              再开一包
            </button>
            <button
              className="cyber-btn"
              style={{ borderColor: 'var(--neon-green)', color: 'var(--neon-green)' }}
              onClick={onClose}
            >
              收入词库
            </button>
          </>
        )}
      </div>
    </div>
  );
}
