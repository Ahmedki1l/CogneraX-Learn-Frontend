import { BaseApiService } from './base';

export class AssignmentApiService extends BaseApiService {
  // Get assignments
  async getAssignments(filters?: {
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

    return this.request(`/assignments?${params.toString()}`);
  }

  // Get assignment by ID
  async getAssignment(assignmentId: string): Promise<any> {
    return this.request(`/assignments/${assignmentId}`);
  }

  // Create assignment
  async createAssignment(data: {
    title: string;
    description?: string;
    courseId: string;
    dueDate: string;
    maxPoints: number;
    type: 'essay' | 'project' | 'presentation' | 'other';
    instructions?: string;
    attachments?: any[];
    rubric?: any;
    isPublished?: boolean;
    settings?: any;
  }): Promise<any> {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update assignment
  async updateAssignment(assignmentId: string, data: {
    title?: string;
    description?: string;
    dueDate?: string;
    maxPoints?: number;
    type?: 'essay' | 'project' | 'presentation' | 'other';
    instructions?: string;
    attachments?: any[];
    rubric?: any;
    isPublished?: boolean;
    settings?: any;
  }): Promise<any> {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete assignment
  async deleteAssignment(assignmentId: string): Promise<any> {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }

  // Get assignment submissions
  async getAssignmentSubmissions(assignmentId: string, filters?: {
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

    return this.request(`/assignments/${assignmentId}/submissions?${params.toString()}`);
  }

  // Get submission by ID
  async getSubmission(submissionId: string): Promise<any> {
    return this.request(`/submissions/${submissionId}`);
  }

  // Submit assignment
  async submitAssignment(assignmentId: string, data: {
    content: string;
    attachments?: any[];
    notes?: string;
  }): Promise<any> {
    return this.request(`/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update submission
  async updateSubmission(submissionId: string, data: {
    content?: string;
    attachments?: any[];
    notes?: string;
  }): Promise<any> {
    return this.request(`/submissions/${submissionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete submission
  async deleteSubmission(submissionId: string): Promise<any> {
    return this.request(`/submissions/${submissionId}`, {
      method: 'DELETE',
    });
  }

  // Grade submission
  async gradeSubmission(submissionId: string, data: {
    score: number;
    feedback?: string;
    rubricScores?: { criterionId: string; score: number }[];
    isGraded: boolean;
  }): Promise<any> {
    return this.request(`/submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get submission feedback
  async getSubmissionFeedback(submissionId: string): Promise<any> {
    return this.request(`/submissions/${submissionId}/feedback`);
  }

  // Add feedback to submission
  async addSubmissionFeedback(submissionId: string, data: {
    feedback: string;
    type: 'general' | 'rubric' | 'peer';
    rubricCriterionId?: string;
  }): Promise<any> {
    return this.request(`/submissions/${submissionId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get assignment analytics
  async getAssignmentAnalytics(assignmentId: string, filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/assignments/${assignmentId}/analytics?${params.toString()}`);
  }

  // Get submission analytics
  async getSubmissionAnalytics(assignmentId: string, filters?: {
    timeRange?: string;
    groupBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);

    return this.request(`/assignments/${assignmentId}/submissions/analytics?${params.toString()}`);
  }

  // Download submission
  async downloadSubmission(submissionId: string, attachmentId: string): Promise<any> {
    return this.request(`/submissions/${submissionId}/download/${attachmentId}`);
  }

  // Bulk grade submissions
  async bulkGradeSubmissions(assignmentId: string, data: {
    submissions: {
      submissionId: string;
      score: number;
      feedback?: string;
    }[];
  }): Promise<any> {
    return this.request(`/assignments/${assignmentId}/bulk-grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Export submissions
  async exportSubmissions(assignmentId: string, format: 'csv' | 'excel' | 'pdf'): Promise<any> {
    return this.request(`/assignments/${assignmentId}/export?format=${format}`);
  }

  // Publish assignment
  async publishAssignment(assignmentId: string): Promise<any> {
    return this.request(`/assignments/${assignmentId}/publish`, {
      method: 'POST',
    });
  }

  // Unpublish assignment
  async unpublishAssignment(assignmentId: string): Promise<any> {
    return this.request(`/assignments/${assignmentId}/unpublish`, {
      method: 'POST',
    });
  }
}
