import { config } from '../config';

export const api = {
  // 注册
  async register(username, password, inviteCode) {
    const response = await fetch(`${config.API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, inviteCode })
    });
    console.log('注册响应:', response);
    return response.json();
  },

  // 登录
  async login(username, password) {
    const response = await fetch(`${config.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  // 验证 Token
  async verify(token) {
    const response = await fetch(`${config.API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 获取当前用户信息
  async getCurrentUser(token) {
    const response = await fetch(`${config.API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 更新当前用户信息
  async updateCurrentUser(token, updates) {
    const response = await fetch(`${config.API_BASE_URL}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // 获取指定用户信息
  async getUser(userId) {
    const response = await fetch(`${config.API_BASE_URL}/users/${userId}`);
    return response.json();
  },

  // 获取用户卡包库存
  async getUserPacks(token) {
    const response = await fetch(`${config.API_BASE_URL}/packs/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 添加卡包
  async addPacks(token, packId, count = 1) {
    const response = await fetch(`${config.API_BASE_URL}/packs/me/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ packId, count })
    });
    return response.json();
  },

  // 使用卡包
  async usePack(token, packId) {
    const response = await fetch(`${config.API_BASE_URL}/packs/me/${packId}/use`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 获取用户单词库存
  async getUserWords(token, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${config.API_BASE_URL}/words/me${queryString ? '?' + queryString : ''}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  // 保存用户获得的单词
  async saveUserWords(token, words) {
    const response = await fetch(`${config.API_BASE_URL}/words/me`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ words })
    });
    return response.json();
  },

  // 收藏/取消收藏单词
  async toggleFavorite(token, wordId, isFavorited) {
    const response = await fetch(`${config.API_BASE_URL}/words/me/${wordId}/favorite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isFavorited })
    });
    return response.json();
  },

  // 修改密码
  async changePassword(token, oldPassword, newPassword) {
    const response = await fetch(`${config.API_BASE_URL}/users/me/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ oldPassword, newPassword })
    });
    return response.json();
  }
};

// Token 管理 - 使用 localStorage 保持持久化登录
export const auth = {
  setToken(token) {
    localStorage.setItem('token', token);
  },

  getToken() {
    return localStorage.getItem('token');
  },

  removeToken() {
    localStorage.removeItem('token');
  },

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser() {
    localStorage.removeItem('user');
  },

  logout() {
    this.removeToken();
    this.removeUser();
  }
};
