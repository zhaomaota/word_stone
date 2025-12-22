import React, { useState, useEffect } from 'react';

export default function CardOverlay({ cards, isOpen, onClose, onOpenAnother, hasMorePacks }) {
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

  if (!isOpen) return null;

  return (
    <div id="overlay" style={{ display: 'flex' }}>
      <div className="cards-container">
        {cards.map((card, idx) => (
          <div
            key={`${cardKey}-${idx}`} // 添加 key 确保重新渲染
            className={`card ${flippedCards.includes(idx) ? 'flipped' : ''}`}
            onClick={() => flipCard(idx)}
          >
            <div className="face back"></div>
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
