const API_BASE_URL = 'http://localhost:8080';

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

export interface List {
  id: string;
  title: string;
  cards: Card[];
}

export interface Card {
  id: string;
  title: string;
  description: string;
  labels: string[];
  assignees: string[];
  comments: number;
}

export interface BoardWithLists {
  id: number;
  title: string;
  lists: List[];
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

      // Handle 204 No Content (for delete operations)
      if (response.status === 204) {
        return { data: {} as T };
      }

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

  // Board with lists and cards
  async getBoardWithLists(id: number): Promise<ApiResponse<BoardWithLists>> {
    return this.request<BoardWithLists>(`/api/board/${id}/full`, {
      method: 'GET',
    });
  }

  // List operations
  async createList(boardId: number, title: string): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/create`, {
      method: 'POST',
      body: JSON.stringify({ name:title, position:0,board_id: boardId}),
    });
  }

  async updateListTitle(listId: string, updates: Partial<List>): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/${listId}/title`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateListPosition(listId: string, updates: Partial<List>): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/${listId}/position`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteList(listId: string): Promise<ApiResponse> {
    return this.request(`/api/lists/${listId}`, {
      method: 'DELETE',
    });
  }

  // Card operations
  async createCard(listId: string, card: Omit<Card, 'id'>): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/lists/${listId}/cards`, {
      method: 'POST',
      body: JSON.stringify(card),
    });
  }

  async updateCard(cardId: string, updates: Partial<Card>): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${cardId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async deleteCard(cardId: string): Promise<ApiResponse> {
    return this.request(`/api/cards/${cardId}`, {
      method: 'DELETE',
    });
  }

  async moveCard(cardId: string, targetListId: string): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${cardId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ listId: targetListId }),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
