import { BaseApiService } from './base';

export class ForumApiService extends BaseApiService {
  // Get forums
  async getForums(filters?: {
    courseId?: string;
    category?: string;
    status?: 'active' | 'archived' | 'locked';
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/forums?${params.toString()}`);
  }

  // Get forum by ID
  async getForum(forumId: string): Promise<any> {
    return this.request(`/forums/${forumId}`);
  }

  // Create forum
  async createForum(data: {
    title: string;
    description?: string;
    courseId?: string;
    category?: string;
    isPublic?: boolean;
    settings?: any;
  }): Promise<any> {
    return this.request('/forums', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update forum
  async updateForum(forumId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    isPublic?: boolean;
    settings?: any;
  }): Promise<any> {
    return this.request(`/forums/${forumId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete forum
  async deleteForum(forumId: string): Promise<any> {
    return this.request(`/forums/${forumId}`, {
      method: 'DELETE',
    });
  }

  // Get forum topics
  async getForumTopics(forumId: string, filters?: {
    status?: 'active' | 'pinned' | 'locked' | 'archived';
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/forums/${forumId}/topics?${params.toString()}`);
  }

  // Get topic by ID
  async getTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}`);
  }

  // Create topic
  async createTopic(forumId: string, data: {
    title: string;
    content: string;
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
  }): Promise<any> {
    return this.request(`/forums/${forumId}/topics`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update topic
  async updateTopic(topicId: string, data: {
    title?: string;
    content?: string;
    tags?: string[];
    isPinned?: boolean;
    isLocked?: boolean;
  }): Promise<any> {
    return this.request(`/topics/${topicId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete topic
  async deleteTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}`, {
      method: 'DELETE',
    });
  }

  // Get topic replies
  async getTopicReplies(topicId: string, filters?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/topics/${topicId}/replies?${params.toString()}`);
  }

  // Create reply
  async createReply(topicId: string, data: {
    content: string;
    parentReplyId?: string;
  }): Promise<any> {
    return this.request(`/topics/${topicId}/replies`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update reply
  async updateReply(replyId: string, data: {
    content: string;
  }): Promise<any> {
    return this.request(`/replies/${replyId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete reply
  async deleteReply(replyId: string): Promise<any> {
    return this.request(`/replies/${replyId}`, {
      method: 'DELETE',
    });
  }

  // Like topic
  async likeTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/like`, {
      method: 'POST',
    });
  }

  // Unlike topic
  async unlikeTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/unlike`, {
      method: 'DELETE',
    });
  }

  // Like reply
  async likeReply(replyId: string): Promise<any> {
    return this.request(`/replies/${replyId}/like`, {
      method: 'POST',
    });
  }

  // Unlike reply
  async unlikeReply(replyId: string): Promise<any> {
    return this.request(`/replies/${replyId}/unlike`, {
      method: 'DELETE',
    });
  }

  // Pin topic
  async pinTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/pin`, {
      method: 'POST',
    });
  }

  // Unpin topic
  async unpinTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/unpin`, {
      method: 'DELETE',
    });
  }

  // Lock topic
  async lockTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/lock`, {
      method: 'POST',
    });
  }

  // Unlock topic
  async unlockTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/unlock`, {
      method: 'DELETE',
    });
  }

  // Archive topic
  async archiveTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/archive`, {
      method: 'POST',
    });
  }

  // Unarchive topic
  async unarchiveTopic(topicId: string): Promise<any> {
    return this.request(`/topics/${topicId}/unarchive`, {
      method: 'DELETE',
    });
  }

  // Get forum categories
  async getForumCategories(): Promise<any> {
    return this.request('/forums/categories');
  }

  // Create forum category
  async createForumCategory(data: {
    name: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<any> {
    return this.request('/forums/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update forum category
  async updateForumCategory(categoryId: string, data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
  }): Promise<any> {
    return this.request(`/forums/categories/${categoryId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete forum category
  async deleteForumCategory(categoryId: string): Promise<any> {
    return this.request(`/forums/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Get forum analytics
  async getForumAnalytics(forumId: string, filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/forums/${forumId}/analytics?${params.toString()}`);
  }

  // Search forums
  async searchForums(query: string, filters?: {
    courseId?: string;
    category?: string;
    type?: 'forums' | 'topics' | 'replies';
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/forums/search?${params.toString()}`);
  }
}
