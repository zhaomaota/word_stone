import React, { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';

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
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef(null);
  const [width, setWidth] = useState(() => {
    try {
      const stored = localStorage.getItem('sidebarWidth');
      return stored ? parseInt(stored, 10) : 320;
    } catch (e) {
      return 320;
    }
  });
  const draggingRef = useRef(false);
  const rafRef = useRef(null);

  const ITEM_HEIGHT = 50; // 每个词汇项的高度
  const CONTAINER_HEIGHT = 600; // 容器高度，根据你的布局调整
  const BUFFER = 5; // 上下额外渲染的项数

  // 预处理：将 inventory 转换为数组，只做一次
  const inventoryArray = useMemo(() => {
    return Object.entries(inventory).map(([word, data]) => ({
      word,
      wordLower: word.toLowerCase(),
      transLower: data.trans.toLowerCase(),
      rarity: data.rarity,
      trans: data.trans
    }));
  }, [inventory]);

  const filteredWords = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    let items = inventoryArray;

    // 先过滤稀有度（更快）
    if (activeRarity) {
      items = items.filter(item => item.rarity === activeRarity);
    }

    // 再搜索（在更小的数据集上）
    if (searchLower) {
      items = items.filter(item => 
        item.wordLower.includes(searchLower) || 
        item.transLower.includes(searchLower)
      );
    }

    // 排序
    items.sort((a, b) => a.wordLower.localeCompare(b.wordLower));

    return items;
  }, [inventoryArray, searchTerm, activeRarity]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / ITEM_HEIGHT) - BUFFER);
    const endIndex = Math.min(
      filteredWords.length,
      Math.ceil((scrollTop + CONTAINER_HEIGHT) / ITEM_HEIGHT) + BUFFER
    );
    return { startIndex, endIndex };
  }, [scrollTop, filteredWords.length, ITEM_HEIGHT, CONTAINER_HEIGHT, BUFFER]);

  // 只渲染可见的项
  const visibleItems = useMemo(() => {
    return filteredWords.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [filteredWords, visibleRange]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const toggleRarity = useCallback((rarity) => {
    setActiveRarity(prev => prev === rarity ? null : rarity);
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // 重置滚动位置
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [searchTerm, activeRarity]);

  const totalHeight = filteredWords.length * ITEM_HEIGHT;

  // Persist width when it changes
  useEffect(() => {
    try {
      localStorage.setItem('sidebarWidth', String(width));
    } catch (e) {}
  }, [width]);

  // cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div id="sidebar" style={{ width: `${width}px` }}>
      {/* 左侧竖向拖拽条（靠近 sidebar 的左边缘） */}
      <div
        className="sidebar-resizer"
        role="separator"
        aria-orientation="vertical"
        onPointerDown={(e) => {
          e.preventDefault();
          draggingRef.current = true;
          // capture pointer to continue receiving events even if leaving element
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (!draggingRef.current) return;
          // throttle with rAF
          if (rafRef.current) return;
          rafRef.current = requestAnimationFrame(() => {
            rafRef.current = null;
            // calculate new width based on pointer position
            // sidebar is on the right; pointer's clientX is distance from left edge
            const newWidth = Math.max(220, Math.min(window.innerWidth - 200, window.innerWidth - e.clientX));
            setWidth(newWidth);
          });
        }}
        onPointerUp={(e) => {
          if (!draggingRef.current) return;
          draggingRef.current = false;
          try { localStorage.setItem('sidebarWidth', String(width)); } catch (err) {}
          try { e.currentTarget.releasePointerCapture(e.pointerId); } catch (err) {}
        }}
        onPointerCancel={() => {
          draggingRef.current = false;
        }}
      />
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

      <div 
        id="inventory-list"
        ref={listRef}
        onScroll={handleScroll}
        style={{ 
          height: `${CONTAINER_HEIGHT}px`, 
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {filteredWords.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444' }}>
            [无匹配数据]
          </div>
        ) : (
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            <div 
              style={{ 
                transform: `translateY(${visibleRange.startIndex * ITEM_HEIGHT}px)`,
                willChange: 'transform'
              }}
            >
              {visibleItems.map((item, index) => (
                <InventoryItem
                  key={visibleRange.startIndex + index}
                  word={item.word}
                  rarity={item.rarity}
                  trans={item.trans}
                  onClick={() => onInsertWord(item.word)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
