const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
    cache: 'no-store',
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  get: <T>(path: string, options?: { token?: string }) => apiFetch<T>(path, { method: 'GET', ...options }),
  post: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'POST', body, token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    apiFetch<T>(path, { method: 'PUT', body, token }),
  delete: (path: string, token?: string) =>
    apiFetch(path, { method: 'DELETE', token }),

  posts: {
    list: (params?: { page?: number; pageSize?: number; category?: string; tag?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('page_size', String(params.pageSize));
      if (params?.category) query.set('category', params.category);
      if (params?.tag) query.set('tag', params.tag);
      if (params?.search) query.set('search', params.search);
      return api.get(`/posts/?${query.toString()}`);
    },
    get: (slug: string) => api.get(`/posts/${slug}`),
    create: (data: unknown, token: string) => api.post('/posts/', data, token),
    update: (slug: string, data: unknown, token: string) => api.put(`/posts/${slug}`, data, token),
    delete: (slug: string, token: string) => api.delete(`/posts/${slug}`, token),
  },

  comments: {
    getByPost: (postId: string, page = 1) =>
      api.get(`/comments/post/${postId}?page=${page}`),
    create: (data: unknown) => api.post('/comments/', data),
  },

  categories: {
    list: () => api.get('/categories/'),
  },

  tags: {
    list: () => api.get('/tags/'),
  },

  search: (query: string, mode = 'hybrid') =>
    api.get(`/search/?q=${encodeURIComponent(query)}&mode=${mode}`),

  recommendations: (postId: string, userId?: string) => {
    const query = new URLSearchParams({ post_id: postId });
    if (userId) query.set('user_id', userId);
    return api.get(`/recommendations/?${query.toString()}`);
  },

  ai: {
    chat: (message: string, sessionId?: string, postId?: string, token?: string) =>
      api.post('/ai/chat', { message, session_id: sessionId, post_id: postId }, token),
    generateDraft: (data: unknown, token: string) =>
      api.post('/ai/generate-draft', data, token),
  },

  auth: {
    login: (username: string, password: string) =>
      api.post('/auth/login', { username, password }),
    register: (data: unknown) => api.post('/auth/register', data),
    me: (token: string) => api.get('/auth/me', { token }),
  },
};

export type { FetchOptions };
