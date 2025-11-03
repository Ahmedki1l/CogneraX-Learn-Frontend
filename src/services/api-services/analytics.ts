import { BaseApiService } from './base';

export class AnalyticsApiService extends BaseApiService {
  // Platform Analytics
  async getPlatformAnalytics(timeRange?: string): Promise<any> {
    const params = new URLSearchParams();
    if (timeRange) params.append('timeRange', timeRange);
    return this.request(`/analytics/overview?${params.toString()}`);
  }

  async getUserEngagementStats(period?: string): Promise<any> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    return this.request(`/analytics/engagement?${params.toString()}`);
  }

  async getRevenueAnalytics(period?: string): Promise<any> {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    return this.request(`/analytics/revenue?${params.toString()}`);
  }

  async getPredictiveAnalytics(): Promise<any> {
    return this.request('/analytics/predictive');
  }

  // Course Analytics
  async getCourseAnalytics(courseId: string, dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/courses/${courseId}?${params.toString()}`);
  }

  async getCourseEngagement(courseId: string): Promise<any> {
    return this.request(`/analytics/courses/${courseId}/engagement`);
  }

  async getCourseCompletion(courseId: string): Promise<any> {
    return this.request(`/analytics/courses/${courseId}/completion`);
  }

  async getCoursePerformance(courseId: string): Promise<any> {
    return this.request(`/analytics/courses/${courseId}/performance`);
  }

  // Student Analytics
  async getStudentAnalytics(studentId: string, dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/students/${studentId}?${params.toString()}`);
  }

  async getStudentProgressById(studentId: string): Promise<any> {
    return this.request(`/analytics/students/${studentId}/progress`);
  }

  async getStudentPerformance(studentId: string): Promise<any> {
    return this.request(`/analytics/students/${studentId}/performance`);
  }

  async getStudentEngagement(studentId: string): Promise<any> {
    return this.request(`/analytics/students/${studentId}/engagement`);
  }

  // Instructor Analytics
  async getInstructorAnalytics(instructorId: string, dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/instructors/${instructorId}?${params.toString()}`);
  }

  async getInstructorCourses(instructorId: string): Promise<any> {
    return this.request(`/analytics/instructors/${instructorId}/courses`);
  }

  async getInstructorStudents(instructorId: string): Promise<any> {
    return this.request(`/analytics/instructors/${instructorId}/students`);
  }

  async getInstructorPerformance(instructorId: string): Promise<any> {
    return this.request(`/analytics/instructors/${instructorId}/performance`);
  }

  // Content Analytics
  async getContentAnalytics(contentId: string, contentType: 'lesson' | 'quiz' | 'assignment'): Promise<any> {
    return this.request(`/analytics/content/${contentType}/${contentId}`);
  }

  async getContentEngagement(contentId: string, contentType: 'lesson' | 'quiz' | 'assignment'): Promise<any> {
    return this.request(`/analytics/content/${contentType}/${contentId}/engagement`);
  }

  async getContentPerformance(contentId: string, contentType: 'lesson' | 'quiz' | 'assignment'): Promise<any> {
    return this.request(`/analytics/content/${contentType}/${contentId}/performance`);
  }

  // AI Analytics
  async getAIAnalytics(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/ai?${params.toString()}`);
  }

  async getAIUsageStats(): Promise<any> {
    return this.request('/analytics/ai/usage');
  }

  async getAIPerformance(): Promise<any> {
    return this.request('/analytics/ai/performance');
  }

  async getAICreditsUsage(): Promise<any> {
    return this.request('/analytics/ai/credits');
  }

  // Learning Analytics
  async getLearningPathAnalytics(pathId: string): Promise<any> {
    return this.request(`/analytics/learning-paths/${pathId}`);
  }

  async getLearningOutcomes(): Promise<any> {
    return this.request('/analytics/learning-outcomes');
  }

  async getKnowledgeGaps(): Promise<any> {
    return this.request('/analytics/knowledge-gaps');
  }

  async getSkillDevelopment(): Promise<any> {
    return this.request('/analytics/skill-development');
  }

  // Export Functions
  async exportAnalyticsReport(type: 'platform' | 'engagement' | 'revenue' | 'predictive' | 'course' | 'student' | 'instructor' | 'ai'): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/analytics/export/${type}`, {
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

  async exportCustomReport(reportConfig: {
    type: string;
    filters: any;
    format: 'csv' | 'excel' | 'pdf';
    dateRange?: {
      startDate: string;
      endDate: string;
    };
  }): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/analytics/export/custom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: JSON.stringify(reportConfig),
    });

    if (!response.ok) {
      throw new Error('Custom report export failed');
    }

    return response.blob();
  }

  // Real-time Analytics
  async getRealTimeMetrics(): Promise<any> {
    return this.request('/analytics/realtime/metrics');
  }

  async getActiveUsers(): Promise<any> {
    return this.request('/analytics/realtime/active-users');
  }

  async getSystemHealth(): Promise<any> {
    return this.request('/analytics/realtime/system-health');
  }

  // Track events
  async trackEvent(data: {
    event: string;
    properties?: any;
    userId?: string;
    courseId?: string;
    lessonId?: string;
  }): Promise<any> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Student dashboard analytics
  async getStudentDashboard(): Promise<any> {
    return this.request('/analytics/student/dashboard', {});
  }

  // Student progress analytics
  async getStudentProgress(filters?: {
    courseId?: string;
    timeRange?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    return this.request(`/analytics/student/progress?${params.toString()}`);
  }

  // Student time tracking analytics
  async getStudentTimeTracking(filters?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    return this.request(`/analytics/student/time-tracking?${params.toString()}`);
  }

  // Instructor dashboard analytics
  async getInstructorDashboard(): Promise<any> {
    return this.request('/analytics/instructor/dashboard');
  }

  // Course analytics by courseId
  async getCourseAnalyticsById(courseId: string): Promise<any> {
    return this.request(`/analytics/course/${courseId}`);
  }
}
