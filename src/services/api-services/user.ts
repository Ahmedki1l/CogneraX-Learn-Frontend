import { BaseApiService, User } from './base';

export class UserApiService extends BaseApiService {
  // User Management
  async getUsers(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    organization?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/users?${params.toString()}`);
  }

  async getUserById(userId: string): Promise<User> {
    return this.request(`/users/${userId}`);
  }

  async createUser(userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    organizationId?: string;
    permissions?: string[];
  }): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(userId: string, userData: Partial<{
    name: string;
    email: string;
    bio: string;
    status: string;
  }>): Promise<User> {
    return this.request(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(userId: string): Promise<void> {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<User> {
    return this.request(`/users/${userId}/permissions`, {
      method: 'PATCH',
      body: JSON.stringify({ permissions }),
    });
  }

  async bulkUserActions(action: 'activate' | 'deactivate' | 'delete' | 'changeRole', userIds: string[], data?: any): Promise<any> {
    return this.request('/users/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, userIds, data }),
    });
  }

  async exportUsers(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/users/export?format=${format}`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // User Profile
  async updateProfile(userData: Partial<{
    name: string;
    email: string;
    avatar: string;
    bio: string;
    preferences: any;
  }>): Promise<User> {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/users/avatar`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Avatar upload failed');
    }

    return response.json();
  }

  async deleteAvatar(): Promise<void> {
    return this.request('/users/avatar', {
      method: 'DELETE',
    });
  }

  // User Preferences
  async getPreferences(): Promise<any> {
    return this.request('/users/preferences');
  }

  async updatePreferences(preferences: any): Promise<any> {
    return this.request('/users/preferences', {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // User Activity
  async getUserActivity(userId: string, filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/users/${userId}/activity?${params.toString()}`);
  }

  async getUserSessions(userId: string): Promise<any> {
    return this.request(`/users/${userId}/sessions`);
  }

  async terminateSession(sessionId: string): Promise<void> {
    return this.request(`/users/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async terminateAllSessions(): Promise<void> {
    return this.request('/users/sessions', {
      method: 'DELETE',
    });
  }

  // User Notifications
  async getNotifications(filters?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/users/notifications?${params.toString()}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request(`/users/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    return this.request('/users/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async deleteNotification(notificationId: string): Promise<void> {
    return this.request(`/users/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // User Settings
  async getSettings(): Promise<any> {
    return this.request('/users/settings');
  }

  async updateSettings(settings: any): Promise<any> {
    return this.request('/users/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // TODO: BACKEND IMPLEMENTATION REQUIRED
  // Get assigned courses for an instructor (pending backend implementation)
  async getAssignedCourses(instructorId: string, filters?: {
    assignmentType?: 'course' | 'field';
    status?: string;
  }): Promise<any> {
    console.warn('⚠️ Backend not implemented yet: getAssignedCourses');
    const params = new URLSearchParams();
    if (filters?.assignmentType) params.append('assignmentType', filters.assignmentType);
    if (filters?.status) params.append('status', filters.status);
    return this.request(`/users/${instructorId}/assigned-courses?${params.toString()}`);
  }

  // Student Achievements - GET /users/me/achievements
  async getAchievements(filters?: { 
    category?: string;
    status?: 'earned' | 'locked' | 'in-progress';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    return this.request(`/users/me/achievements?${params.toString()}`);
  }

  // Claim Achievement - POST /users/me/achievements/:id/claim
  async claimAchievement(achievementId: string): Promise<any> {
    return this.request(`/users/me/achievements/${achievementId}/claim`, {
      method: 'POST',
    });
  }

  // Student Certificates - GET /users/me/certificates
  async getCertificates(filters?: { 
    status?: string;
    courseId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    return this.request(`/users/me/certificates?${params.toString()}`);
  }

  // Download Certificate - GET /certificates/:id/download
  async downloadCertificate(certificateId: string): Promise<any> {
    return this.request(`/certificates/${certificateId}/download`);
  }

  // Verify Certificate - POST /certificates/verify
  async verifyCertificate(certificateNumber: string): Promise<any> {
    return this.request('/certificates/verify', {
      method: 'POST',
      body: JSON.stringify({ certificateNumber }),
    });
  }

  // Student Study Resources - GET /users/me/study-resources
  async getStudyResources(courseId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (courseId) params.append('courseId', courseId);
    return this.request(`/users/me/study-resources?${params.toString()}`);
  }

  // Save Study Note - POST /users/me/notes
  async saveStudyNote(data: {
    title: string;
    content: string;
    courseId?: string;
    lessonId?: string;
    tags?: string[];
  }): Promise<any> {
    return this.request('/users/me/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Study Notes - GET /users/me/notes
  async getStudyNotes(filters?: {
    courseId?: string;
    lessonId?: string;
    search?: string;
    tags?: string[];
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.lessonId) params.append('lessonId', filters.lessonId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.tags) params.append('tags', filters.tags.join(','));
    return this.request(`/users/me/notes?${params.toString()}`);
  }

  // Update Study Note - PUT /users/me/notes/:id
  async updateStudyNote(noteId: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
  }): Promise<any> {
    return this.request(`/users/me/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete Study Note - DELETE /users/me/notes/:id
  async deleteStudyNote(noteId: string): Promise<any> {
    return this.request(`/users/me/notes/${noteId}`, {
      method: 'DELETE',
    });
  }
}
