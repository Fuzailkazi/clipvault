import { Bookmark, ChatResponse } from '../types';

const API_BASE = '/api/v1';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('clipvault_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 403 && endpoint !== '/signin' && endpoint !== '/signup') {
    // Dispatch unauthorized event to trigger logout and auth modal
    window.dispatchEvent(new CustomEvent('clipvault:unauthorized'));
  }

  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // Handle non-JSON or empty response
  }

  if (!response.ok) {
    throw new Error(data.message || response.statusText || 'Request failed');
  }

  return data as T;
}

export const api = {
  // Health
  checkHealth: async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/bookmarks`, {
        headers: getAuthHeader(),
      });
      // As long as backend responds (even with 403 if unauthenticated), it is online
      return res.status !== 502 && res.status !== 503 && res.status !== 504;
    } catch {
      return false;
    }
  },

  // Auth
  signup: (username: string, password: string) =>
    request<{ message: string }>('/signup', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  signin: (username: string, password: string) =>
    request<{ token: string }>('/signin', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  // Bookmarks
  getBookmarks: (tag?: string, search?: string) => {
    const params = new URLSearchParams();
    if (tag) params.append('tag', tag);
    if (search) params.append('search', search);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return request<{ bookmarks: Bookmark[] }>(`/bookmarks${queryString}`);
  },

  createBookmark: (url: string, notes?: string) =>
    request<{ message: string; bookmark: Bookmark }>('/bookmarks', {
      method: 'POST',
      body: JSON.stringify({ url, notes }),
    }),

  deleteBookmark: (id: string) =>
    request<{ message: string }>(`/bookmarks/${id}`, {
      method: 'DELETE',
    }),

  // Chat
  chat: (message: string) =>
    request<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
};
