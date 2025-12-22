import React, { useState, useRef, useMemo, useCallback } from 'react';
import { findClosestWord } from '../utils/helpers';

export default function InputArea({ 
  inventory, 
  onSendMessage,      // (html, tokens) => void
  onSystemMessage,    // (content, isError) => void
  isOnlineMode = false 
}) {
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const debounceTimer = useRef(null);

  const lowerInventory = useMemo(() => {
    const lower = {};
    Object.keys(inventory).forEach(key => {
      lower[key.toLowerCase()] = key;
    });
    return lower;
  }, [inventory]);

  const handleInput = useCallback((e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9\s.,!?;:'"()\-]/g, '');
    setInput(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      const words = value.split(/\s+/);
      const current = words[words.length - 1];

      if (!current || current.length < 1) {
        setSuggestions([]);
        return;
      }

      const currentLower = current.toLowerCase();
      const matches = Object.keys(lowerInventory)
        .filter(w => w.startsWith(currentLower))
        .slice(0, 10)
        .map(w => lowerInventory[w]);

      setSuggestions(matches);
      setSelectedIndex(0);
    }, 100);
  }, [lowerInventory]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[selectedIndex] || suggestions[0]);
      } else {
        handleSend();
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (suggestions.length > 0) {
        selectSuggestion(suggestions[selectedIndex] || suggestions[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    }
  };

  const selectSuggestion = (word) => {
    const words = input.split(/\s+/);
    words.pop();
    words.push(word);
    const newInput = words.join(' ') + ' ';
    setInput(newInput);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // 使用 useCallback 并依赖 input，确保总是使用最新值
  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text) return;

    const tokens = text.split(/\s+/);
    let html = '';
    let unknownWords = [];
    let validTokens = [];

    tokens.forEach(t => {
      // 修复：保留连字符，只提取字母和连字符
      const clean = t.replace(/[^a-zA-Z\-]/g, '');
      if (!clean) {
        html += t + ' ';
        return;
      }

      const cleanLower = clean.toLowerCase();
      const matchedWord = lowerInventory[cleanLower];

      if (matchedWord) {
        const { rarity, trans } = inventory[matchedWord];
        html += `<span class="token c-${rarity}" data-t="${trans}">${t}</span> `;
        validTokens.push(clean);
      } else {
        unknownWords.push(clean);
        html += `<span style="text-decoration:line-through; color:var(--neon-pink);">${t}</span> `;
      }
    });

    if (isOnlineMode) {
      // 在线模式：直接发送到服务器，不管是否有未知词汇
      // 服务器会验证并决定是否广播
      onSendMessage(html, validTokens);
    } else {
      // 离线模式：先显示消息
      onSendMessage(html, validTokens);

      // 如果有未知词汇，显示错误提示
      if (unknownWords.length > 0) {
        const lowerInv = {};
        Object.keys(inventory).forEach(key => {
          lowerInv[key.toLowerCase()] = inventory[key];
        });

        let suggestionList = [];
        unknownWords.forEach(word => {
          const guess = findClosestWord(word.toLowerCase(), lowerInv);
          if (guess) {
            const originalWord = lowerInventory[guess];
            if (originalWord) {
              suggestionList.push(
                `"${word}" &rarr; <span class="c-${inventory[originalWord].rarity}">${originalWord}</span>`
              );
            }
          }
        });

        let errMsg = ` ACCESS DENIED: 未识别的数据块 [${unknownWords.join(', ')}]`;
        if (suggestionList.length > 0) {
          errMsg += `<br><br>[系统建议]:<br>${suggestionList.join('<br>')}`;
        } else {
          errMsg += `<br><br>[系统提示]: 你还没有这些词汇，无法使用。快开卡包吧！`;
        }
        onSystemMessage(errMsg, true);
      }
    }

    setInput('');
    setSuggestions([]);
  }, [input, inventory, lowerInventory, isOnlineMode, onSendMessage, onSystemMessage]);

  return (
    <div id="input-area">
      {suggestions.length > 0 && (
        <div id="suggestions" style={{ display: 'block' }}>
          {suggestions.map((word, idx) => (
            <div
              key={word}
              className={`s-item ${idx === selectedIndex ? 'active' : ''}`}
              onClick={() => selectSuggestion(word)}
            >
              <span className={`s-word c-${inventory[word].rarity}`}>{word}</span>
              <span className="s-trans">{inventory[word].trans}</span>
            </div>
          ))}
        </div>
      )}
      
      <div className="input-box">
        <span style={{ color: 'var(--neon-green)', marginRight: '10px' }}>$</span>
        <input
          ref={inputRef}
          type="text"
          id="cmd-input"
          placeholder="输入想说的话... (Tab补全)"
          autoComplete="off"
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
        />
        <button className="cyber-btn" style={{ border: 'none', fontSize: '12px' }} onClick={handleSend}>
          SEND
        </button>
      </div>
    </div>
  );
}
