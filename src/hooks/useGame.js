import { useState, useEffect, useRef } from 'react';
import vocabularyData from '../data/vocabulary.json';
import { api, auth } from '../utils/api';

const fallbackDB = [
  { "word": "abandon", "definition": "v.放弃", "rarity": "common" },
  { "word": "ability", "definition": "n.能力", "rarity": "common" },
  { "word": "background", "definition": "n.背景", "rarity": "rare" },
  { "word": "calculate", "definition": "v.计算", "rarity": "rare" },
  { "word": "data", "definition": "n.数据", "rarity": "epic" },
  { "word": "economy", "definition": "n.经济", "rarity": "epic" },
  { "word": "ubiquitous", "definition": "adj.无处不在", "rarity": "legendary" }
];

export function useGame() {
  const [gameDB, setGameDB] = useState({ common: [], rare: [], epic: [], legendary: [] });
  const [packs, setPacks] = useState(0);
  const [myInventory, setMyInventory] = useState({});
  const [chatLog, setChatLog] = useState([]);
  
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      // Add initial system log
      setChatLog([{
        id: Date.now() + Math.random(),
        type: 'sys',
        content: '系统初始化...<br />&gt; 正在尝试挂载外部数据库 [vocabulary.json]...',
        username: null,
        roses: 0,
        timestamp: new Date().toISOString(),
        isError: false
      }]);
      loadVocabulary();
    }
  }, []);

  const loadVocabulary = () => {
    try {
      const data = vocabularyData.length > 0 ? vocabularyData : fallbackDB;
      const { processedDB, stats } = processVocabulary(data);
      setGameDB(processedDB);
      
      let msg = `> 数据库挂载成功! 加载了 ${data.length} 个词条。`;
      if (stats.duplicates > 0) {
        msg += `<br>> 检测到 ${stats.duplicates} 个完全重复的词汇（已去重）。`;
      }
      msg += `<br>> 实际可用: ${stats.unique} 个唯一词汇。`;
      
      addLog('sys', msg, false);
    } catch (error) {
      console.warn("JSON Load Failed:", error);
      const { processedDB } = processVocabulary(fallbackDB);
      setGameDB(processedDB);
      addLog('sys', `> [警告] 无法读取 vocabulary.json。<br>> 已启用备用应急数据库。`, true);
    }
  };

  const processVocabulary = (data) => {
    const db = { common: [], rare: [], epic: [], legendary: [] };
    const seen = new Set();
    let duplicates = 0;
    
    data.forEach(item => {
      const key = item.word.trim();
      const rarity = item.rarity || 'common';
      
      if (seen.has(key)) {
        duplicates++;
        return;
      }
      
      seen.add(key);
      if (db[rarity]) {
        db[rarity].push({ w: item.word, t: item.definition });
      }
    });
    
    return {
      processedDB: db,
      stats: {
        unique: seen.size,
        duplicates: duplicates
      }
    };
  };

  // 🔥 修改 addLog 函数，接收完整的消息数据并保证有唯一 id
  const addLog = (type, content, isError = false, username = null, id = null, roses = 0, nickname = null) => {
    const messageId = id ?? (Date.now() + Math.random());
    const timestamp = Date.now();
    setChatLog(prev => [...prev, {
      type,
      content,
      isError,
      username,
      nickname,  // 添加 nickname 字段
      id: messageId,
      roses,
      timestamp
    }]);
  };

  // 更新指定消息的鲜花数（用于接收服务器的 rose-update）
  const updateLogRoses = (messageId, roses) => {
    if (!messageId) return;
    setChatLog(prev => prev.map(log => {
      if (String(log.id) === String(messageId)) {
        return { ...log, roses: roses ?? (log.roses || 0) };
      }
      return log;
    }));
  };

  // 清除聊天日志（仅本地操作）
  const clearChatLog = () => {
    setChatLog([]);
  };

  // 从数据库加载卡包数量和单词库存
  useEffect(() => {
    const loadUserData = async () => {
      const token = auth.getToken();
      if (token) {
        try {
          // 加载卡包数量
          const packsResult = await api.getUserPacks(token);
          if (packsResult.success) {
            setPacks(packsResult.data.totalPacks || 0);
          }

          // 加载单词库存
          const wordsResult = await api.getUserWords(token);
          if (wordsResult.success) {
            const inventory = {};
            wordsResult.data.words.forEach(item => {
              inventory[item.word] = {
                id: item.wordId,
                rarity: item.rarity.toLowerCase(),
                trans: item.definition,
                isFavorited: item.isFavorited || false
              };
            });
            console.log('📚 加载了', wordsResult.data.words.length, '个单词到 inventory');
            console.log('📝 示例单词数据:', wordsResult.data.words[0]);
            setMyInventory(inventory);
          }
        } catch (error) {
          console.error('加载用户数据失败:', error);
        }
      }
    };
    
    // 初次加载
    loadUserData();
    
    // 监听登录事件，重新加载数据
    const handleLoginEvent = () => {
      loadUserData();
    };
    window.addEventListener('user-login', handleLoginEvent);
    
    return () => {
      window.removeEventListener('user-login', handleLoginEvent);
    };
  }, []);

  const addPacks = async () => {
    const newPackCount = 5;
    setPacks(prev => prev + newPackCount);
    addLog('sys', '已领取 5 个卡包。', false);
    
    // 同步到数据库
    const token = auth.getToken();
    if (token) {
      try {
        await api.addPacks(token, 'default-pack-001', newPackCount);
      } catch (error) {
        console.error('保存卡包失败:', error);
      }
    }
  };

  const cheatMode = () => {
    let addedCount = 0;
    const newInventory = { ...myInventory };
    
    ['legendary', 'epic', 'rare', 'common'].forEach(rarity => {
      gameDB[rarity].forEach(item => {
        const key = item.w;
        if (!newInventory[key]) {
          newInventory[key] = { 
            rarity, 
            trans: item.t,
            id: null,  // cheat mode 不保存到数据库，所以没有 id
            isFavorited: false
          };
          addedCount++;
        }
      });
    });
    
    setMyInventory(newInventory);
    addLog('sys', `[测试模式] 强制注入完成。新增 ${addedCount} 个词汇。`, false);
  };

  const openPack = async () => {
    if (packs <= 0) return null;
    
    const cards = [];
    const newInventory = { ...myInventory };
    
    // 先生成卡片
    for (let i = 0; i < 5; i++) {
      const card = getRandomCard();
      if (card) {
        cards.push(card);
        const key = card.w;
        if (!newInventory[key]) {
          newInventory[key] = { 
            rarity: card.r, 
            trans: card.t,
            id: null,  // 暂时没有 id
            isFavorited: false
          };
        }
      }
    }
    
    // 更新本地状态
    setPacks(prev => prev - 1);
    setMyInventory(newInventory);
    
    // 异步同步到数据库（不阻塞返回）
    const token = auth.getToken();
    if (token) {
      try {
        // 使用卡包
        await api.usePack(token, 'default-pack-001');
        
        // 保存新获得的单词
        const newWords = cards.filter(card => !myInventory[card.w]);
        if (newWords.length > 0) {
          // 转换数据格式：{ w, t, r } -> { word, definition, rarity }
          const wordsToSave = newWords.map(card => ({
            word: card.w,
            definition: card.t,
            rarity: card.r
          }));
          await api.saveUserWords(token, wordsToSave);
          
          // 重新加载 inventory 以获取正确的 wordId
          const wordsResult = await api.getUserWords(token);
          if (wordsResult.success) {
            const inventory = {};
            wordsResult.data.words.forEach(item => {
              inventory[item.word] = {
                id: item.wordId,
                rarity: item.rarity.toLowerCase(),
                trans: item.definition,
                isFavorited: item.isFavorited || false
              };
            });
            setMyInventory(inventory);
          }
        }
      } catch (error) {
        console.error('开卡包同步失败:', error);
      }
    }
    
    return cards;
  };

  const getRandomCard = () => {
    const totalWords = Object.values(gameDB).reduce((sum, arr) => sum + arr.length, 0);
    if (totalWords === 0) return null;

    const weights = {
      legendary: gameDB.legendary.length / totalWords,
      epic: gameDB.epic.length / totalWords,
      rare: gameDB.rare.length / totalWords,
      common: gameDB.common.length / totalWords
    };

    const r = Math.random();
    let rarity = 'common';

    if (r < weights.legendary) rarity = 'legendary';
    else if (r < weights.legendary + weights.epic) rarity = 'epic';
    else if (r < weights.legendary + weights.epic + weights.rare) rarity = 'rare';

    const list = gameDB[rarity];
    if (!list || list.length === 0) return null;

    const item = list[Math.floor(Math.random() * list.length)];
    return { w: item.w, t: item.t, r: rarity };
  };

  return {
    gameDB,
    packs,
    myInventory,
    chatLog,
    addLog,
    updateLogRoses,
    clearChatLog,
    addPacks,
    cheatMode,
    openPack
  };
}
