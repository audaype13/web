const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  token?: string;
}

export interface Category {
  id: string;
  name: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  color?: string | null;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  title_en?: string | null;
  content: string;
  content_en?: string | null;
  excerpt?: string | null;
  excerpt_en?: string | null;
  cover_image?: string | null;
  author_id: string;
  category_id?: string | null;
  status: 'draft' | 'published' | 'archived';
  read_time: number;
  views: number;
  featured: boolean;
  tag_ids: string[];
  created_at: string;
  updated_at: string;
  published_at?: string | null;
}

export interface PostWithCategory extends Post {
  category?: { name: string; slug: string; color?: string } | null;
  tags?: { name: string; slug: string }[];
}

export interface PostListResponse {
  posts: PostWithCategory[];
  total: number;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
}

export interface TagListResponse {
  tags: Tag[];
  total: number;
}

export interface Comment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  author_name: string;
  author_email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  replies?: Comment[];
}

export interface CommentListResponse {
  comments: Comment[];
  total: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface SearchResponse {
  posts: Post[];
  total: number;
  query: string;
}

export interface RecommendationResponse {
  posts: Post[];
}

export interface AIChatResponse {
  response: string;
  message?: string;
  session_id: string;
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
  delete: <T>(path: string, token?: string) =>
    apiFetch<T>(path, { method: 'DELETE', token }),

  posts: {
    list: (params?: { page?: number; pageSize?: number; category?: string; tag?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.page) query.set('page', String(params.page));
      if (params?.pageSize) query.set('page_size', String(params.pageSize));
      if (params?.category) query.set('category', params.category);
      if (params?.tag) query.set('tag', params.tag);
      if (params?.search) query.set('search', params.search);
      return api.get<PostListResponse>(`/posts/?${query.toString()}`);
    },
    get: (slug: string) => api.get<Post>(`/posts/${slug}`),
    create: (data: unknown, token: string) => api.post<Post>('/posts/', data, token),
    update: (slug: string, data: unknown, token: string) => api.put<Post>(`/posts/${slug}`, data, token),
    delete: (slug: string, token: string) => api.delete(`/posts/${slug}`, token),
  },

  comments: {
    getByPost: (postId: string, page = 1) =>
      api.get<CommentListResponse>(`/comments/post/${postId}?page=${page}`),
    create: (data: unknown) => api.post<Comment>('/comments/', data),
    list: (postId?: string, status?: string, page = 1, pageSize = 20, token?: string) => {
      const query = new URLSearchParams();
      if (postId) query.set('post_id', postId);
      if (status) query.set('status', status);
      query.set('page', String(page));
      query.set('page_size', String(pageSize));
      return api.get<CommentListResponse>(`/comments/?${query.toString()}`, { token });
    },
  },

  categories: {
    list: () => api.get<CategoryListResponse>('/categories/'),
  },

  tags: {
    list: () => api.get<TagListResponse>('/tags/'),
  },

  search: (query: string, mode = 'hybrid') =>
    api.get<SearchResponse>(`/search/?q=${encodeURIComponent(query)}&mode=${mode}`),

  recommendations: (postId: string, userId?: string) => {
    const query = new URLSearchParams({ post_id: postId });
    if (userId) query.set('user_id', userId);
    return api.get<RecommendationResponse>(`/recommendations/?${query.toString()}`);
  },

  ai: {
    chat: (message: string, sessionId?: string, postId?: string, token?: string) =>
      api.post<AIChatResponse>('/ai/chat', { message, session_id: sessionId, post_id: postId }, token),
    generateDraft: (data: unknown, token: string) =>
      api.post<Post>('/ai/generate-draft', data, token),
  },

  auth: {
    login: (username: string, password: string) =>
      api.post<AuthResponse>('/auth/login', { username, password }),
    register: (data: unknown) => api.post<AuthResponse>('/auth/register', data),
    me: (token: string) => api.get<User>('/auth/me', { token }),
  },
};
