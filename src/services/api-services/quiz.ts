import { BaseApiService } from './base';

export class QuizApiService extends BaseApiService {
  // Get quizzes
  async getQuizzes(filters?: {
    courseId?: string;
    instructorId?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.instructorId) params.append('instructorId', filters.instructorId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/quizzes?${params.toString()}`);
  }

  // Get quiz by ID
  async getQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}`);
  }

  // Create quiz
  async createQuiz(data: {
    title: string;
    description?: string;
    courseId: string;
    timeLimit?: number;
    maxAttempts?: number;
    passingScore?: number;
    isPublished?: boolean;
    settings?: any;
    questions?: any[];
  }): Promise<any> {
    return this.request('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update quiz
  async updateQuiz(quizId: string, data: {
    title?: string;
    description?: string;
    timeLimit?: number;
    maxAttempts?: number;
    passingScore?: number;
    isPublished?: boolean;
    settings?: any;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Start quiz attempt
  async startQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/start`, {
      method: 'POST',
    });
  }

  // Start quiz attempt - POST /quizzes/:id/attempts
  async startQuizAttempt(quizId: string, mode?: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/attempts`, {
      method: 'POST',
      body: JSON.stringify({ mode }),
    });
  }

  // Save quiz progress during attempt - PUT /quizzes/:id/attempts/:attemptId
  async saveQuizProgress(quizId: string, attemptId: string, data: {
    answers: any[];
    currentQuestionIndex?: number;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}/attempts/${attemptId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Submit quiz
  async submitQuiz(quizId: string, data: {
    attemptId: string;
    answers: any[];
    timeSpent?: number;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get quiz attempts
  async getQuizAttempts(quizId: string, filters?: {
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/quizzes/${quizId}/attempts?${params.toString()}`);
  }

  // Get quiz results
  async getQuizResults(quizId: string, attemptId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/results/${attemptId}`);
  }

  // Get quiz questions
  async getQuizQuestions(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/questions`);
  }

  // Add question to quiz
  async addQuizQuestion(quizId: string, data: {
    question: string;
    type: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points: number;
    explanation?: string;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update quiz question
  async updateQuizQuestion(quizId: string, questionId: string, data: {
    question?: string;
    type?: 'multiple-choice' | 'true-false' | 'fill-in-blank' | 'essay';
    options?: string[];
    correctAnswer?: string | string[];
    points?: number;
    explanation?: string;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete quiz question
  async deleteQuizQuestion(quizId: string, questionId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // Reorder quiz questions
  async reorderQuizQuestions(quizId: string, questionIds: string[]): Promise<any> {
    return this.request(`/quizzes/${quizId}/questions/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
    });
  }

  // Grade quiz attempt
  async gradeQuizAttempt(quizId: string, attemptId: string, data: {
    scores: { questionId: string; score: number; feedback?: string }[];
    totalScore: number;
    passed: boolean;
  }): Promise<any> {
    return this.request(`/quizzes/${quizId}/attempts/${attemptId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get quiz analytics
  async getQuizAnalytics(quizId: string, filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/quizzes/${quizId}/analytics?${params.toString()}`);
  }

  // Duplicate quiz
  async duplicateQuiz(quizId: string, newTitle: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title: newTitle }),
    });
  }

  // Publish quiz
  async publishQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/publish`, {
      method: 'POST',
    });
  }

  // Unpublish quiz
  async unpublishQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}/unpublish`, {
      method: 'POST',
    });
  }
}
