import { BaseApiService } from './base';

export class NotificationApiService extends BaseApiService {
  // Get notifications - GET /notifications
  async getNotifications(filters?: {
    isRead?: boolean;
    type?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.isRead !== undefined) params.append('isRead', filters.isRead.toString());
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/notifications?${params.toString()}`);
  }

  // Get notification by ID
  async getNotification(notificationId: string): Promise<any> {
    return this.request(`/notifications/${notificationId}`);
  }

  // Mark notification as read - PATCH /notifications/:id/read
  async markNotificationAsRead(notificationId: string): Promise<any> {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  // Legacy alias
  async markAsRead(notificationId: string): Promise<any> {
    return this.markNotificationAsRead(notificationId);
  }

  // Mark all notifications as read - PATCH /notifications/read-all
  async markAllNotificationsAsRead(): Promise<any> {
    return this.request('/notifications/read-all', {
      method: 'PATCH',
    });
  }

  // Legacy alias
  async markAllAsRead(): Promise<any> {
    return this.markAllNotificationsAsRead();
  }

  // Delete notification
  async deleteNotification(notificationId: string): Promise<any> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // Create notification
  async createNotification(data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'medium' | 'high';
    userId?: string;
    courseId?: string;
    assignmentId?: string;
    quizId?: string;
    metadata?: any;
  }): Promise<any> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update notification
  async updateNotification(notificationId: string, data: {
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    priority?: 'low' | 'medium' | 'high';
    metadata?: any;
  }): Promise<any> {
    return this.request(`/notifications/${notificationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get notification preferences
  async getNotificationPreferences(): Promise<any> {
    return this.request('/notifications/preferences');
  }

  // Update notification preferences
  async updateNotificationPreferences(data: {
    email?: boolean;
    push?: boolean;
    inApp?: boolean;
    types?: {
      courseUpdates?: boolean;
      assignmentDeadlines?: boolean;
      quizResults?: boolean;
      systemAlerts?: boolean;
      forumReplies?: boolean;
    };
  }): Promise<any> {
    return this.request('/notifications/preferences', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get notification statistics
  async getNotificationStats(): Promise<any> {
    return this.request('/notifications/stats');
  }

  // Send bulk notifications
  async sendBulkNotifications(data: {
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'medium' | 'high';
    userIds?: string[];
    courseId?: string;
    role?: string;
    metadata?: any;
  }): Promise<any> {
    return this.request('/notifications/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get notification templates
  async getNotificationTemplates(): Promise<any> {
    return this.request('/notifications/templates');
  }

  // Create notification template
  async createNotificationTemplate(data: {
    name: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    variables?: string[];
  }): Promise<any> {
    return this.request('/notifications/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update notification template
  async updateNotificationTemplate(templateId: string, data: {
    name?: string;
    title?: string;
    message?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
    variables?: string[];
  }): Promise<any> {
    return this.request(`/notifications/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete notification template
  async deleteNotificationTemplate(templateId: string): Promise<any> {
    return this.request(`/notifications/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Test notification
  async testNotification(data: {
    templateId?: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    priority: 'low' | 'medium' | 'high';
    testUserId?: string;
  }): Promise<any> {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
