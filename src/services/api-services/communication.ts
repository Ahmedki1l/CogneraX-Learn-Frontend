import { BaseApiService } from './base';
import type {
  Announcement,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
  Conversation,
  Message,
  CreateConversationRequest,
  SendMessageRequest,
  OfficeHour,
  Session,
  BookSessionRequest
} from '../../interfaces/communication.types';

export class CommunicationApiService extends BaseApiService {
  // ==================== Announcements ====================

  async getAnnouncements(filters?: { courseId?: string; priority?: string; limit?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value.toString());
      });
    }
    return this.request(`/announcements?${params.toString()}`);
  }

  async createAnnouncement(data: CreateAnnouncementRequest): Promise<any> {
    return this.request('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncement(id: string, data: UpdateAnnouncementRequest): Promise<any> {
    return this.request(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string): Promise<void> {
    return this.request(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async markAnnouncementRead(id: string): Promise<void> {
    return this.request(`/announcements/${id}/read`, {
      method: 'POST',
    });
  }

  // ==================== Messaging / Conversations ====================

  async getConversations(type?: 'direct' | 'group'): Promise<any> {
    const query = type ? `?type=${type}` : '';
    return this.request(`/conversations${query}`);
  }

  async getMessages(conversationId: string, limit: number = 50, before?: string): Promise<any> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (before) params.append('before', before);
    return this.request(`/conversations/${conversationId}/messages?${params.toString()}`);
  }

  async createConversation(data: CreateConversationRequest): Promise<any> {
    return this.request('/conversations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendMessage(conversationId: string, data: SendMessageRequest): Promise<any> {
    // If attachments are present, we might need FormData (skipped for now as simplified)
    return this.request(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markConversationRead(conversationId: string): Promise<void> {
    return this.request(`/conversations/${conversationId}/read`, {
      method: 'PUT',
    });
  }

  // ==================== Office Hours & Sessions ====================

  async getOfficeHours(instructorId?: string): Promise<any> {
    const query = instructorId ? `?instructorId=${instructorId}` : '';
    return this.request(`/office-hours${query}`);
  }

  async createOfficeHour(data: Partial<OfficeHour>): Promise<any> {
    return this.request('/office-hours', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessions(status?: 'upcoming' | 'completed' | 'pending'): Promise<any> {
    const query = status ? `?status=${status}` : '';
    return this.request(`/sessions${query}`);
  }

  async bookSession(data: BookSessionRequest): Promise<any> {
    return this.request('/sessions/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSessionStatus(sessionId: string, status: 'confirmed' | 'cancelled'): Promise<any> {
    return this.request(`/sessions/${sessionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // ==================== Contacts ====================

  async getContacts(): Promise<any> {
    return this.request('/contacts');
  }
}
