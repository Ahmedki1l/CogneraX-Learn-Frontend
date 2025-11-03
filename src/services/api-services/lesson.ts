import { BaseApiService } from './base';

export class LessonApiService extends BaseApiService {
  // Get lessons by course ID - GET /lessons?courseId=:courseId
  async getLessons(courseId: string, filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    params.append('courseId', courseId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/lessons?${params.toString()}`);
  }

  // Get lesson by ID
  async getLesson(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}`);
  }

  // Create lesson with FormData (multipart/form-data)
  // Accepts FormData directly to support file uploads (video and resources)
  async createLesson(courseId: string, formData: FormData): Promise<any> {
    return this.request(`/courses/${courseId}/lessons`, {
      method: 'POST',
      body: formData, // FormData is sent directly, not stringified
    });
  }

  // Update lesson
  async updateLesson(lessonId: string, data: {
    title?: string;
    description?: string;
    content?: string;
    type?: 'video' | 'text' | 'quiz' | 'assignment';
    order?: number;
    duration?: number;
    isPublished?: boolean;
    prerequisites?: string[];
    resources?: any[];
    settings?: any;
  }): Promise<any> {
    return this.request(`/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete lesson
  async deleteLesson(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  // Mark lesson as complete
  async completeLesson(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/complete`, {
      method: 'POST',
    });
  }

  // Get lesson progress
  async getLessonProgress(lessonId: string, userId?: string): Promise<any> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/lessons/${lessonId}/progress${params}`);
  }

  // Update lesson progress
  async updateLessonProgress(lessonId: string, data: {
    progress: number;
    completed?: boolean;
    timeSpent?: number;
    completedAt?: string;
    lastPosition?: {
      type: string;
      timestamp: number;
    };
  }): Promise<any> {
    return this.request(`/lessons/${lessonId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get lesson resources - GET /lessons/:id/resources
  async getLessonResources(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/resources`);
  }

  // Add resource to lesson
  async addLessonResource(lessonId: string, data: {
    name: string;
    type: string;
    url: string;
    description?: string;
  }): Promise<any> {
    return this.request(`/lessons/${lessonId}/resources`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remove resource from lesson
  async removeLessonResource(lessonId: string, resourceId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/resources/${resourceId}`, {
      method: 'DELETE',
    });
  }

  // Get lesson quizzes - GET /lessons/:id/quizzes
  async getLessonQuizzes(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/quizzes`);
  }

  // Add quiz to lesson
  async addLessonQuiz(lessonId: string, quizId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    });
  }

  // Remove quiz from lesson
  async removeLessonQuiz(lessonId: string, quizId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Reorder lessons
  async reorderLessons(courseId: string, lessonIds: string[]): Promise<any> {
    return this.request(`/courses/${courseId}/lessons/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ lessonIds }),
    });
  }

  // Get lesson analytics
  async getLessonAnalytics(lessonId: string, filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/lessons/${lessonId}/analytics?${params.toString()}`);
  }
}
