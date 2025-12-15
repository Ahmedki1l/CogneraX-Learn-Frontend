import { BaseApiService } from './base';

export class AIApiService extends BaseApiService {
  // AI Content Analysis
  async analyzeContent(payload: {
    content: string;
    analysisType?: string;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/analyze-content', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async generateContentOutline(topic: string, level: string, duration: number): Promise<any> {
    return this.request('/ai/content/outline', {
      method: 'POST',
      body: JSON.stringify({ topic, level, duration }),
    });
  }

  async generateLessonContent(outline: {
    title: string;
    objectives: string[];
    duration: number;
    level: string;
    type: 'video' | 'text' | 'interactive';
  }): Promise<any> {
    return this.request('/ai/content/lesson', {
      method: 'POST',
      body: JSON.stringify(outline),
    });
  }

  async improveContent(content: {
    text: string;
    type: 'lesson' | 'assignment' | 'quiz';
    improvements: string[];
  }): Promise<any> {
    return this.request('/ai/content/improve', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  // AI Question Generation
  async generateQuestions(payload: {
    content: string;
    courseId: string;
    count: number;
    questionTypes?: string[];
    difficulty?: string;
    autoAddToBank?: boolean;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/generate-questions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async generateExam(payload: {
    content: string;
    courseId: string;
    examConfig: Record<string, any>;
    autoAddToBank?: boolean;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/generate-exam', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Essay Grading
  async gradeEssay(payload: {
    essayContent: string;
    rubric: string;
    maxScore?: number;
    submissionId?: string;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/grade-essay', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Tutoring System
  async startTutoringSession(subject: string, level: string): Promise<any> {
    return this.request('/ai/tutoring/session', {
      method: 'POST',
      body: JSON.stringify({ subject, level }),
    });
  }

  async askTutorQuestion(sessionId: string, question: string): Promise<any> {
    return this.request(`/ai/tutoring/session/${sessionId}/ask`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  async getTutoringHistory(filters?: {
    page?: number;
    limit?: number;
    subject?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/ai/tutoring/history?${params.toString()}`);
  }

  async endTutoringSession(sessionId: string): Promise<any> {
    return this.request(`/ai/tutoring/session/${sessionId}/end`, {
      method: 'POST',
    });
  }

  // AI Recommendation Engine
  async getCourseRecommendations(userId: string, filters?: {
    limit?: number;
    categories?: string[];
    difficulty?: string;
    duration?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/ai/recommendations/courses/${userId}?${params.toString()}`);
  }

  async getContentRecommendations(userId: string, contentType: 'lesson' | 'quiz' | 'assignment'): Promise<any> {
    return this.request(`/ai/recommendations/${contentType}/${userId}`);
  }

  async getLearningPathRecommendations(userId: string, goals: string[]): Promise<any> {
    return this.request('/ai/recommendations/learning-path', {
      method: 'POST',
      body: JSON.stringify({ userId, goals }),
    });
  }

  async updateRecommendationPreferences(userId: string, preferences: {
    interests: string[];
    learningStyle: string;
    timeCommitment: number;
    difficulty: string;
  }): Promise<any> {
    return this.request(`/ai/recommendations/preferences/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(preferences),
    });
  }

  // AI Content Recreation
  async recreateContent(payload: {
    originalContent: string;
    enhancementType?: string;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/recreate-content', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async translateContent(content: {
    text: string;
    sourceLanguage: string;
    targetLanguage: string;
    preserveFormatting?: boolean;
  }): Promise<any> {
    return this.request('/ai/content/translate', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async summarizeContent(content: {
    text: string;
    length: 'short' | 'medium' | 'long';
    focus?: string[];
  }): Promise<any> {
    return this.request('/ai/content/summarize', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  // AI Teaching Plan Generation
  async generateTeachingPlan(payload: {
    content: string;
    sessionMinutes: number;
    studentLevel?: string;
    learningObjectives?: string[];
    teachingStyle?: string;
    language?: string;
  }): Promise<any> {
    return this.request('/ai/generate-teaching-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // AI Credits Management
  async getAICreditsBalance(): Promise<any> {
    return this.request('/ai/credits/balance');
  }

  async getAICreditsUsage(filters?: {
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
    return this.request(`/ai/credits/usage?${params.toString()}`);
  }

  async purchaseAICredits(amount: number, paymentMethodId: string): Promise<any> {
    return this.request('/ai/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount, paymentMethodId }),
    });
  }

  // AI Model Management
  async getAvailableModels(): Promise<any> {
    return this.request('/ai/models');
  }

  async getModelInfo(modelId: string): Promise<any> {
    return this.request(`/ai/models/${modelId}`);
  }

  async switchModel(modelId: string): Promise<any> {
    return this.request(`/ai/models/${modelId}/switch`, {
      method: 'POST',
    });
  }

  // AI Analytics
  async getAIUsageStats(filters?: {
    startDate?: string;
    endDate?: string;
    feature?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/ai/analytics/usage?${params.toString()}`);
  }

  async getAIPerformanceMetrics(): Promise<any> {
    return this.request('/ai/analytics/performance');
  }

  async getAIQualityMetrics(): Promise<any> {
    return this.request('/ai/analytics/quality');
  }

  // Additional AI methods for components
  async getInstructorCredits(): Promise<any> {
    return this.request('/ai/ai-credits/instructors');
  }

  async getAICreditsHistory(filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    instructorId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/ai/ai-credits/history?${params.toString()}`);
  }

  async allocateAICredits(data: {
    userId: string;
    amount: number;
    description?: string;
  }): Promise<any> {
    return this.request('/ai/credits/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkAllocateCredits(data: {
    allocations: Array<{
      userId: string;
      amount: number;
      description?: string;
    }>;
  }): Promise<any> {
    return this.request('/ai/ai-credits/bulk-allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIHistory(filters?: {
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const query = params.toString();
    return this.request(`/ai/history${query ? `?${query}` : ''}`);
  }

  // AI Recommendations (for AIRecommendationEngine component)
  async getRecommendations(data: {
    userId?: string;
    preferences?: any;
    interests?: string[];
  }): Promise<any> {
    return this.request('/ai/recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLearningPath(data: {
    userId?: string;
    currentLevel: string;
    goals: string[];
  }): Promise<any> {
    return this.request('/ai/learning-path', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateRecommendations(data: {
    userId?: string;
    preferences?: any;
    interests?: string[];
    searchQuery?: string;
    category?: string;
  }): Promise<any> {
    return this.request('/ai/generate-recommendations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Tutoring (for AITutoringSystem component)
  async getLearningProfile(data: {
    userId?: string;
  }): Promise<any> {
    return this.request('/ai/learning-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPersonalizedHints(data: {
    userId?: string;
    courseId?: string;
  }): Promise<any> {
    return this.request('/ai/personalized-hints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async sendTutoringMessage(data: {
    userId?: string;
    message: string;
    context?: any;
  }): Promise<any> {
    return this.request('/ai/tutoring-message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Study Tools (for StudyTools component)
  async getStudyNotes(data: {
    userId?: string;
  }): Promise<any> {
    return this.request('/ai/study-notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFlashcards(data: {
    userId?: string;
  }): Promise<any> {
    return this.request('/ai/flashcards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getStudyEvents(data: {
    userId?: string;
  }): Promise<any> {
    return this.request('/ai/study-events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
