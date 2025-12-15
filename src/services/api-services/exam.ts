import { BaseApiService } from './base';
import type {
  Exam,
  CreateExamRequest,
  ExamFilters,
  ScheduleExamRequest,
  StartExamResponse,
  SubmitExamRequest,
  SaveProgressRequest,
  SubmissionFilters,
  AIGradingOptions,
  ManualGrades,
  BulkGradeRequest,
  GradeFilters,
  ExamAnalytics,
  AnalyticsFilters,
  StatsFilters,
  ExportOptions,
  ScheduleFilters,
} from '../../interfaces/exam.types';

export class ExamApiService extends BaseApiService {
  // ==================== Exam CRUD Operations ====================

  /**
   * Get exams with optional filtering and pagination
   */
  async getExams(filters?: ExamFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams?${params.toString()}`);
  }

  /**
   * Get exam by ID
   */
  async getExam(examId: string): Promise<any> {
    return this.request(`/exams/${examId}`);
  }

  /**
   * Create a new exam
   */
  async createExam(examData: CreateExamRequest): Promise<any> {
    return this.request('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }

  /**
   * Update an existing exam
   */
  async updateExam(examId: string, examData: Partial<Exam>): Promise<any> {
    return this.request(`/exams/${examId}`, {
      method: 'PATCH',
      body: JSON.stringify(examData),
    });
  }

  /**
   * Delete an exam
   */
  async deleteExam(examId: string): Promise<void> {
    return this.request(`/exams/${examId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Duplicate an exam
   */
  async duplicateExam(examId: string, newTitle?: string): Promise<any> {
    return this.request(`/exams/${examId}/duplicate`, {
      method: 'POST',
      body: JSON.stringify({ title: newTitle }),
    });
  }

  // ==================== Exam Scheduling ====================

  /**
   * Schedule an exam for a specific date and time
   */
  async scheduleExam(examId: string, schedule: ScheduleExamRequest): Promise<any> {
    return this.request(`/exams/${examId}/schedule`, {
      method: 'POST',
      body: JSON.stringify(schedule),
    });
  }

  /**
   * Update exam schedule
   */
  async updateExamSchedule(examId: string, schedule: Partial<ScheduleExamRequest>): Promise<any> {
    return this.request(`/exams/${examId}/schedule`, {
      method: 'PATCH',
      body: JSON.stringify(schedule),
    });
  }

  /**
   * Cancel scheduled exam
   */
  async cancelExamSchedule(examId: string): Promise<any> {
    return this.request(`/exams/${examId}/schedule`, {
      method: 'DELETE',
    });
  }

  /**
   * Get upcoming exams for student
   */
  async getUpcomingExams(filters?: { courseId?: string; daysAhead?: number; page?: number; limit?: number }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/upcoming?${params.toString()}`);
  }

  /**
   * Get scheduled exams for instructor
   */
  async getScheduledExams(filters?: ScheduleFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/scheduled?${params.toString()}`);
  }

  // ==================== Exam Taking & Sessions ====================

  /**
   * Start an exam session for a student
   */
  async startExam(examId: string): Promise<StartExamResponse> {
    return this.request(`/exams/${examId}/start`, {
      method: 'POST',
    });
  }

  /**
   * Save exam progress during attempt (auto-save)
   */
  async saveExamProgress(examId: string, sessionId: string, data: SaveProgressRequest): Promise<any> {
    return this.request(`/exams/${examId}/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Submit completed exam for grading
   */
  async submitExam(examId: string, data: SubmitExamRequest): Promise<any> {
    return this.request(`/exams/${examId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get exam session status
   */
  async getExamSession(examId: string, sessionId: string): Promise<any> {
    return this.request(`/exams/${examId}/sessions/${sessionId}`);
  }

  /**
   * Extend exam time (Admin/Instructor only)
   */
  async extendExamTime(examId: string, sessionId: string, additionalMinutes: number): Promise<any> {
    return this.request(`/exams/${examId}/sessions/${sessionId}/extend`, {
      method: 'POST',
      body: JSON.stringify({ additionalMinutes }),
    });
  }

  // ==================== Exam Submissions & Grading ====================

  /**
   * Get all submissions for an exam
   */
  async getSubmissions(examId: string, filters?: SubmissionFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/${examId}/submissions?${params.toString()}`);
  }

  /**
   * Get submission details
   */
  async getSubmission(examId: string, submissionId: string): Promise<any> {
    return this.request(`/exams/${examId}/submissions/${submissionId}`);
  }

  /**
   * Grade submission with AI (for essay questions)
   */
  async gradeWithAI(submissionId: string, options?: AIGradingOptions): Promise<any> {
    return this.request(`/exam-submissions/${submissionId}/ai-grade`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  /**
   * Grade submission manually
   */
  async gradeManually(submissionId: string, grades: ManualGrades): Promise<any> {
    return this.request(`/exam-submissions/${submissionId}/grade`, {
      method: 'POST',
      body: JSON.stringify(grades),
    });
  }

  /**
   * Auto-grade submission (multiple choice/true-false)
   */
  async autoGradeSubmission(submissionId: string): Promise<any> {
    return this.request(`/exam-submissions/${submissionId}/auto-grade`, {
      method: 'POST',
    });
  }

  /**
   * Update submission grade
   */
  async updateSubmissionGrade(submissionId: string, gradeData: Partial<any>): Promise<any> {
    return this.request(`/exam-submissions/${submissionId}/grade`, {
      method: 'PATCH',
      body: JSON.stringify(gradeData),
    });
  }

  /**
   * Bulk grade submissions
   */
  async bulkGradeSubmissions(examId: string, data: BulkGradeRequest): Promise<any> {
    return this.request(`/exams/${examId}/submissions/bulk-grade`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== Student Exam Grades ====================

  /**
   * Get all exam grades for the authenticated student
   */
  async getStudentGrades(filters?: GradeFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/grades?${params.toString()}`);
  }

  /**
   * Get exam grade details
   */
  async getExamGrade(examId: string, gradeId: string): Promise<any> {
    return this.request(`/exams/${examId}/grades/${gradeId}`);
  }

  /**
   * Get student exam attempts
   */
  async getExamAttempts(examId: string, studentId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (studentId) {
      params.append('studentId', studentId);
    }
    return this.request(`/exams/${examId}/attempts?${params.toString()}`);
  }

  // ==================== Exam Questions & Sections ====================

  /**
   * Get exam questions organized by sections
   */
  async getExamQuestions(examId: string): Promise<any> {
    return this.request(`/exams/${examId}/questions`);
  }

  /**
   * Add question to exam
   */
  async addExamQuestion(examId: string, question: any, sectionId?: string): Promise<any> {
    return this.request(`/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question, sectionId }),
    });
  }

  /**
   * Update exam question
   */
  async updateExamQuestion(examId: string, questionId: string, question: Partial<any>): Promise<any> {
    return this.request(`/exams/${examId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(question),
    });
  }

  /**
   * Delete exam question
   */
  async deleteExamQuestion(examId: string, questionId: string): Promise<void> {
    return this.request(`/exams/${examId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reorder exam questions
   */
  async reorderExamQuestions(examId: string, questionIds: string[]): Promise<any> {
    return this.request(`/exams/${examId}/questions/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ questionIds }),
    });
  }

  /**
   * Add section to exam
   */
  async addExamSection(examId: string, section: Partial<any>): Promise<any> {
    return this.request(`/exams/${examId}/sections`, {
      method: 'POST',
      body: JSON.stringify(section),
    });
  }

  /**
   * Update exam section
   */
  async updateExamSection(examId: string, sectionId: string, section: Partial<any>): Promise<any> {
    return this.request(`/exams/${examId}/sections/${sectionId}`, {
      method: 'PUT',
      body: JSON.stringify(section),
    });
  }

  /**
   * Delete exam section
   */
  async deleteExamSection(examId: string, sectionId: string): Promise<void> {
    return this.request(`/exams/${examId}/sections/${sectionId}`, {
      method: 'DELETE',
    });
  }

  // ==================== Exam Analytics ====================

  /**
   * Get comprehensive analytics for an exam
   */
  async getExamAnalytics(examId: string, filters?: AnalyticsFilters): Promise<ExamAnalytics> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/${examId}/analytics?${params.toString()}`);
  }

  /**
   * Get student exam statistics
   */
  async getStudentExamStats(filters?: StatsFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/exams/statistics?${params.toString()}`);
  }

  /**
   * Export exam results
   */
  async exportExamResults(examId: string, format: 'csv' | 'excel' | 'pdf' = 'pdf', options?: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (options?.includeAnswers) {
      params.append('includeAnswers', 'true');
    }
    if (options?.includeFeedback) {
      params.append('includeFeedback', 'true');
    }
    return this.request(`/exams/${examId}/export?${params.toString()}`, {
      responseType: 'blob',
    });
  }

  // ==================== Exam Publishing & Status ====================

  /**
   * Publish an exam
   */
  async publishExam(examId: string): Promise<any> {
    return this.request(`/exams/${examId}/publish`, {
      method: 'POST',
    });
  }

  /**
   * Unpublish an exam
   */
  async unpublishExam(examId: string): Promise<any> {
    return this.request(`/exams/${examId}/unpublish`, {
      method: 'POST',
    });
  }

  /**
   * Archive an exam
   */
  async archiveExam(examId: string): Promise<any> {
    return this.request(`/exams/${examId}/archive`, {
      method: 'POST',
    });
  }
}

