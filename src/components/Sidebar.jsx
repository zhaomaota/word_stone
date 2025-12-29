import React, { useState, useMemo, memo, useCallback, useRef, useEffect } from 'react';
import { api, auth } from '../utils/api';

// 使用 memo 避免不必要的重渲染
const InventoryItem = memo(({ word, rarity, trans, onClick }) => (
  <div className="inv-item" onClick={onClick}>
    <span className={`inv-word c-${rarity}`}>{word}</span>
    <span className="inv-trans">{trans}</span>
  </div>
));

InventoryItem.displayName = 'InventoryItem';

export default function Sidebar({ inventory, onInsertWord }) {
  const [viewMode, setViewMode] = useState('vocabulary'); // 'vocabulary' or 'favorites'
  const [searchTerm, setSearchTerm] = useState('');
  const [activeRarity, setActiveRarity] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const listRef = useRef(null);
  const loadingTimerRef = useRef(null);
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

  // 加载生词本
  useEffect(() => {
    if (viewMode === 'favorites') {
      loadFavorites();
    }
  }, [viewMode]);
  
  // 监听 inventory 变化，如果当前在生词本视图，则刷新
  useEffect(() => {
    if (viewMode === 'favorites') {
      loadFavorites();
    }
  }, [inventory]);

  const loadFavorites = async () => {
    setLoadingFavorites(true);
    setShowLoading(false);
    
    // 延迟300ms显示loading，避免快速加载时闪烁
    loadingTimerRef.current = setTimeout(() => {
      if (loadingFavorites) {
        setShowLoading(true);
      }
    }, 300);
    
    try {
      const token = auth.getToken();
      const result = await api.getUserWords(token, { isFavorited: true });
      
      if (result.success) {
        setFavorites(result.data.words || []);
      }
    } catch (error) {
      console.error('加载生词本失败:', error);
    } finally {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      setLoadingFavorites(false);
      setShowLoading(false);
    }
  };

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

  // 将生词本转换为数组格式
  const favoritesArray = useMemo(() => {
    return favorites.map(item => ({
      word: item.word,
      wordLower: item.word.toLowerCase(),
      transLower: item.definition.toLowerCase(),
      rarity: item.rarity,
      trans: item.definition
    }));
  }, [favorites]);

  const filteredWords = useMemo(() => {
    const searchLower = searchTerm.toLowerCase().trim();
    // 根据视图模式选择数据源
    let items = viewMode === 'favorites' ? favoritesArray : inventoryArray;

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
  }, [inventoryArray, favoritesArray, searchTerm, activeRarity, viewMode]);

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
        {/* 优雅的标签页切换 */}
        <div style={{
          display: 'flex',
          gap: '2px',
          marginBottom: '16px',
          background: 'rgba(0, 0, 0, 0.3)',
          padding: '4px',
          borderRadius: '8px',
          border: '1px solid rgba(0, 243, 255, 0.2)'
        }}>
          <div
            onClick={() => setViewMode('vocabulary')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: viewMode === 'vocabulary' 
                ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.2), rgba(0, 243, 255, 0.1))'
                : 'transparent',
              color: viewMode === 'vocabulary' ? 'var(--neon-cyan)' : '#666',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              border: viewMode === 'vocabulary' ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid transparent',
              boxShadow: viewMode === 'vocabulary' ? '0 0 10px rgba(0, 243, 255, 0.2)' : 'none',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'vocabulary') {
                e.currentTarget.style.background = 'rgba(0, 243, 255, 0.05)';
                e.currentTarget.style.color = '#999';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'vocabulary') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>词汇库</span>
            </div>
          </div>
          <div
            onClick={() => setViewMode('favorites')}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: viewMode === 'favorites'
                ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 215, 0, 0.1))'
                : 'transparent',
              color: viewMode === 'favorites' ? '#ffd700' : '#666',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              textAlign: 'center',
              border: viewMode === 'favorites' ? '1px solid rgba(255, 215, 0, 0.3)' : '1px solid transparent',
              boxShadow: viewMode === 'favorites' ? '0 0 10px rgba(255, 215, 0, 0.2)' : 'none',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (viewMode !== 'favorites') {
                e.currentTarget.style.background = 'rgba(255, 215, 0, 0.05)';
                e.currentTarget.style.color = '#999';
              }
            }}
            onMouseLeave={(e) => {
              if (viewMode !== 'favorites') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#666';
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span>生词本</span>
            </div>
          </div>
        </div>

        <div className="vocab-stats">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '11px', 
              textTransform: 'uppercase', 
              letterSpacing: '1px',
              color: viewMode === 'vocabulary' ? 'var(--neon-cyan)' : '#ffd700'
            }}>
              {viewMode === 'vocabulary' ? 'VOCABULARY' : 'FAVORITES'}
            </span>
            <span className="vocab-count" style={{
              color: viewMode === 'vocabulary' ? 'var(--neon-cyan)' : '#ffd700'
            }}>
              {viewMode === 'vocabulary' ? Object.keys(inventory).length : favorites.length}
            </span>
          </div>
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
            placeholder={viewMode === 'vocabulary' ? '搜索已拥有词汇...' : '搜索生词本...'}
            autoComplete="off"
            value={searchTerm}
            onChange={handleSearch}
          />
          {searchTerm && (
            <button className="search-clear-btn" style={{ display: 'block' }} onClick={clearSearch}>
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
        {showLoading && viewMode === 'favorites' ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--neon-cyan)' }}>
            加载中...
          </div>
        ) : filteredWords.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#444' }}>
            {viewMode === 'favorites' ? '[暂无生词]' : '[无匹配数据]'}
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
