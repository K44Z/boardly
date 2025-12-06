const API_BASE_URL = "http://localhost:8080";
import { List, Card, Board, BoardWithLists, User, Label } from "@/types/types";

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

export interface CreateBoardRequest {
  name: string;
}

export interface UpdateBoardRequest {
  name: string;
}

// Re-export types from board.ts for convenience
export type { User, Board, List, Card, BoardWithLists, Label };

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 204) {
        return { data: {} as T };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || "An error occurred",
        };
      }

      return { data };
    } catch (error) {
      console.error("API request failed:", error);
      return {
        error: error instanceof Error ? error.message : "Network error",
      };
    }
  }

  async login(
    credentials: LoginRequest,
  ): Promise<ApiResponse<{ token: string }>> {
    return this.request<{ token: string }>("/api/user/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse> {
    return this.request("/api/user/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getUserById(id: number): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>(`/api/user/userId/${id}`, {
      method: "GET",
    });
  }

  async searchUsers(query: string): Promise<ApiResponse<{ users: User[] }>> {
    return this.request<{ users: User[] }>("/api/user/search", {
      method: "POST",
      body: JSON.stringify({ query }),
    });
  }

  async getBoards(): Promise<ApiResponse<{ boards: Board[] }>> {
    return this.request<{ boards: Board[] }>("/api/board/", {
      method: "GET",
    });
  }

  async getBoardById(id: number): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>(`/api/board/${id}`, {
      method: "GET",
    });
  }

  async createBoard(
    data: CreateBoardRequest,
  ): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>("/api/board", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateBoard(
    id: number,
    data: UpdateBoardRequest,
  ): Promise<ApiResponse<{ board: Board }>> {
    return this.request<{ board: Board }>(`/api/board/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async deleteBoard(id: number): Promise<ApiResponse> {
    return this.request(`/api/board/${id}`, {
      method: "DELETE",
    });
  }

  // Board with lists and cards
  async getBoardWithLists(id: number): Promise<ApiResponse<BoardWithLists>> {
    return this.request<BoardWithLists>(`/api/board/${id}/full`, {
      method: "GET",
    });
  }

  // List operations
  async createList(boardId: number, name: string): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/create`, {
      method: "POST",
      body: JSON.stringify({ name, position: 0, board_id: boardId }),
    });
  }

  async updateListTitle(
    listId: number,
    updates: Partial<List>,
  ): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/${listId}/title`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async updateListPosition(
    listId: number,
    updates: Partial<List>,
  ): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/${listId}/position`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteList(listId: number): Promise<ApiResponse> {
    return this.request(`/api/lists/${listId}`, {
      method: "DELETE",
    });
  }

  async createCard(
    listId: number,
    title: string,
    description?: string,
    position?: number,
  ): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards`, {
      method: "POST",
      body: JSON.stringify({
        list_id: listId,
        title: title,
        description: description || "",
        position: position || 0,
      }),
    });
  }

  async updateCard(
    cardId: number,
    updates: Partial<Card>,
  ): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${cardId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async deleteCard(cardId: number): Promise<ApiResponse> {
    return this.request(`/api/cards/${cardId}`, {
      method: "DELETE",
    });
  }

  async moveCard(
    cardId: number,
    targetListId: number,
    position: number,
  ): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${cardId}/move`, {
      method: "PATCH",
      body: JSON.stringify({ list_id: targetListId, position: position }),
    });
  }

  async assignUserToCard(
    cardId: number,
    userId: number,
  ): Promise<ApiResponse<User>> {
    return this.request(`/api/cards/${cardId}/assign`, {
      method: "POST",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async unassignUserFromCard(
    cardId: number,
    userId: number,
  ): Promise<ApiResponse> {
    return this.request(`/api/cards/${cardId}/unassign`, {
      method: "DELETE",
      body: JSON.stringify({ user_id: userId }),
    });
  }

  async getCard(cardId: number): Promise<ApiResponse<Card>> {
    return this.request<Card>(`/api/cards/${cardId}/details`, {
      method: "GET",
    });
  }

  async addLabelToCard(
    cardId: number,
    labelId: number,
  ): Promise<ApiResponse<Label>> {
    return this.request(`/api/labels/${cardId}/labels`, {
      method: "POST",
      body: JSON.stringify({ label_id: labelId }),
    });
  }

  async removeLabelFromCard(
    cardId: number,
    labelId: number,
  ): Promise<ApiResponse> {
    return this.request(`/api/labels/${cardId}/labels/${labelId}`, {
      method: "DELETE",
    });
  }

  async getAvailableLabels(): Promise<ApiResponse<{ labels: Label[] }>> {
    return this.request<{ labels: Label[] }>("/api/labels/all", {
      method: "GET",
    });
  }

  updateList(
    listId: number,
    name: string,
  ): Promise<ApiResponse<List>> {
    return this.request<List>(`/api/lists/${listId}/title`, {
      method: "PUT",
      body: JSON.stringify({ name }),
    });
  }

  getAgoraToken(boardId: number): Promise<ApiResponse<{ token: string; appId: string; uid: number; channel: string }>> {
    return this.request<{ token: string; appId: string; uid: number; channel: string }>(`/api/board/${boardId}/token`);
  }

  async uploadProfileImage(file: File): Promise<ApiResponse<{ image_url: string }>> {
    const formData = new FormData();
    formData.append("image", file);
    return this.request<{ image_url: string }>("/api/user/upload-profile-image", {
      method: "POST",
      body: formData,
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
