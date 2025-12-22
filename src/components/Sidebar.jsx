import React, { useState, useMemo, memo } from 'react';

// 使用 memo 避免不必要的重渲染
const InventoryItem = memo(({ word, rarity, trans, onClick }) => (
  <div className="inv-item" onClick={onClick}>
    <span className={`inv-word c-${rarity}`}>{word}</span>
    <span className="inv-trans">{trans}</span>
  </div>
));

InventoryItem.displayName = 'InventoryItem';

export default function Sidebar({ inventory, onInsertWord }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRarity, setActiveRarity] = useState(null);

  const filteredWords = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    let words = Object.keys(inventory);

    if (searchTerm) {
      words = words.filter(w => w.toLowerCase().includes(searchLower));
    }

    if (activeRarity) {
      words = words.filter(w => inventory[w].rarity === activeRarity);
    }

    return words.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [inventory, searchTerm, activeRarity]);

  const toggleRarity = (rarity) => {
    setActiveRarity(prev => prev === rarity ? null : rarity);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div id="sidebar">
      <div className="sidebar-header">
        <div className="vocab-stats">
          <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            VOCABULARY
          </span>
          <span className="vocab-count">{Object.keys(inventory).length}</span>
        </div>

        <div className="rarity-filter">
          {['common', 'rare', 'epic', 'legendary'].map(rarity => (
            <button
              key={rarity}
              className={`rarity-btn ${rarity} ${activeRarity === rarity ? 'active' : ''}`}
              onClick={() => toggleRarity(rarity)}
              title={rarity}
            >
              {rarity === 'common' ? '普通' : rarity === 'rare' ? '稀有' : rarity === 'epic' ? '史诗' : '传说'}
            </button>
          ))}
        </div>

        <div className="search-wrapper">
          <input
            type="text"
            id="side-search-input"
            placeholder="搜索已拥有词汇..."
            autoComplete="off"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button className="clear-btn" style={{ display: 'block' }} onClick={clearSearch}>
              ×
            </button>
          )}
        </div>
      </div>

      <div id="inventory-list">
        {filteredWords.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444' }}>
            [无匹配数据]
          </div>
        ) : (
          filteredWords.map(word => {
            const { rarity, trans } = inventory[word];
            return (
              <InventoryItem
                key={word}
                word={word}
                rarity={rarity}
                trans={trans}
                onClick={() => onInsertWord(word)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
