// src/lib/api/chats.ts - Chat API Service
import { TokenService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ChatMessage {
  id: number;
  conversation_id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: number;
  user_id: number;
  title: string;
  created_at: string;
  updated_at: string;
  is_archived: boolean;
  messages: ChatMessage[];
}

export interface ChatConversationSummary {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count: number;
}

export const ChatsAPI = {
  async createConversation(title: string, firstMessage: string): Promise<ChatConversation> {
    const response = await fetch(`${API_BASE_URL}/chats/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...TokenService.getAuthHeader(),
      },
      body: JSON.stringify({
        title,
        first_message: {
          role: 'user',
          content: firstMessage
        }
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    return response.json();
  },

  async getMyConversations(skip: number = 0, limit: number = 20): Promise<ChatConversationSummary[]> {
    const response = await fetch(
      `${API_BASE_URL}/chats/?skip=${skip}&limit=${limit}`,
      {
        headers: {
          ...TokenService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    return response.json();
  },

  async getRecentConversations(limit: number = 5): Promise<ChatConversationSummary[]> {
    const response = await fetch(
      `${API_BASE_URL}/chats/recent?limit=${limit}`,
      {
        headers: {
          ...TokenService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch recent conversations');
    }

    return response.json();
  },

  async getConversation(conversationId: number): Promise<ChatConversation> {
    const response = await fetch(
      `${API_BASE_URL}/chats/${conversationId}`,
      {
        headers: {
          ...TokenService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch conversation');
    }

    return response.json();
  },

  async addMessage(conversationId: number, role: 'user' | 'assistant', content: string): Promise<ChatMessage> {
    const response = await fetch(
      `${API_BASE_URL}/chats/${conversationId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...TokenService.getAuthHeader(),
        },
        body: JSON.stringify({ role, content }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to add message');
    }

    return response.json();
  },

  async deleteConversation(conversationId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/chats/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          ...TokenService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete conversation');
    }
  },

  async updateTitle(conversationId: number, newTitle: string): Promise<ChatConversation> {
    const response = await fetch(
      `${API_BASE_URL}/chats/${conversationId}/title?new_title=${encodeURIComponent(newTitle)}`,
      {
        method: 'PUT',
        headers: {
          ...TokenService.getAuthHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update title');
    }

    return response.json();
  }
};
