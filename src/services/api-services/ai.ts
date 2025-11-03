import { BaseApiService } from './base';

export class AIApiService extends BaseApiService {
  // AI Content Analysis
  async analyzeContent(content: {
    text: string;
    type: 'lesson' | 'assignment' | 'quiz' | 'course';
    language?: string;
  }): Promise<any> {
    return this.request('/ai/content/analyze', {
      method: 'POST',
      body: JSON.stringify(content),
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
  async generateQuestions(content: {
    text: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
    topics?: string[];
  }): Promise<any> {
    return this.request('/ai/questions/generate', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async generateQuizFromContent(content: {
    text: string;
    questionCount: number;
    timeLimit?: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<any> {
    return this.request('/ai/quiz/generate', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async generateExamFromCourse(courseId: string, examConfig: {
    questionCount: number;
    timeLimit: number;
    difficulty: 'easy' | 'medium' | 'hard';
    topics?: string[];
  }): Promise<any> {
    return this.request(`/ai/exam/generate/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(examConfig),
    });
  }

  // AI Essay Grading
  async gradeEssay(essay: {
    text: string;
    prompt: string;
    rubric?: Array<{
      criterion: string;
      weight: number;
      description: string;
    }>;
    maxPoints?: number;
  }): Promise<any> {
    return this.request('/ai/essay/grade', {
      method: 'POST',
      body: JSON.stringify(essay),
    });
  }

  async getEssayFeedback(essayId: string): Promise<any> {
    return this.request(`/ai/essay/${essayId}/feedback`);
  }

  async generateEssayRubric(topic: string, level: string): Promise<any> {
    return this.request('/ai/essay/rubric', {
      method: 'POST',
      body: JSON.stringify({ topic, level }),
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
  async recreateContent(originalContent: {
    text: string;
    type: 'lesson' | 'assignment' | 'quiz';
    style: 'formal' | 'casual' | 'academic' | 'conversational';
    length: 'short' | 'medium' | 'long';
  }): Promise<any> {
    return this.request('/ai/content/recreate', {
      method: 'POST',
      body: JSON.stringify(originalContent),
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
  async generateTeachingPlan(courseData: {
    title: string;
    description: string;
    duration: number;
    level: string;
    objectives: string[];
    prerequisites?: string[];
  }): Promise<any> {
    return this.request('/ai/teaching-plan/generate', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async customizeTeachingPlan(planId: string, customizations: {
    teachingStyle: string;
    timeConstraints: number;
    resources: string[];
    assessmentMethods: string[];
  }): Promise<any> {
    return this.request(`/ai/teaching-plan/${planId}/customize`, {
      method: 'PATCH',
      body: JSON.stringify(customizations),
    });
  }

  async getTeachingPlan(planId: string): Promise<any> {
    return this.request(`/ai/teaching-plan/${planId}`);
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
    instructorId: string;
    amount: number;
    reason: string;
  }): Promise<any> {
    return this.request('/ai/credits/allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkAllocateCredits(data: {
    allocations: Array<{
      instructorId: string;
      amount: number;
      reason: string;
    }>;
  }): Promise<any> {
    return this.request('/ai/ai-credits/bulk-allocate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Content Analysis (for ContentAnalysis component)
  async analyzeContent(data: {
    content: string;
    type: string;
    level?: string;
  }): Promise<any> {
    return this.request('/ai/analyze-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Content Recreation (for ContentAnalysis component)
  async recreateContent(data: {
    content: string;
    style: string;
    level: string;
  }): Promise<any> {
    return this.request('/ai/recreate-content', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // AI Teaching Plan Generation (for ContentAuthoringTools component)
  async generateTeachingPlan(data: {
    topic: string;
    duration: string;
    level: string;
  }): Promise<any> {
    return this.request('/ai/generate-teaching-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
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
