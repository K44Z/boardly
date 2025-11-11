const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  token?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Board {
  id: number;
  name: string;
  owner_id: number;
  created_at: string;
  owner_username?: string;
  member_count?: number;
}

export interface CreateBoardRequest {
  name: string;
}

export interface UpdateBoardRequest {
  name: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || 'An error occurred',
        };
      }

      return { data };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>('/api/user/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse> {
    return this.request('/api/user/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/api/user/userId/${id}`, {
      method: 'GET',
    });
  }

  async searchUsers(query: string): Promise<ApiResponse<{ users: User[] }>> {
    return this.request<{ users: User[] }>('/api/user/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  // Board endpoints
  async getBoards(): Promise<ApiResponse<{ boards: Board[] }>> {
    return this.request<{ boards: Board[] }>('/api/board/', {
      method: 'GET',
    });
  }

  async getBoardById(id: number): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>(`/api/board/${id}`, {
      method: 'GET',
    });
  }

  async createBoard(data: CreateBoardRequest): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>('/api/board', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBoard(id: number, data: UpdateBoardRequest): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>(`/api/board/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBoard(id: number): Promise<ApiResponse> {
    return this.request(`/api/board/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
