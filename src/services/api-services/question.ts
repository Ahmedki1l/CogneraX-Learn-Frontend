import { BaseApiService } from './base';
import type {
  Question,
  QuestionFilters,
  QuestionBankStats,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  HierarchyOptions,
  SearchRequest,
  StatisticsFilters,
  ExportOptions,
  ImportOptions,
} from '../../interfaces/question.types';

export class QuestionApiService extends BaseApiService {
  // ==================== Question CRUD Operations ====================

  /**
   * Get questions with optional filtering and pagination
   */
  async getQuestions(filters?: QuestionFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array values (e.g., tags)
            value.forEach((item) => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    return this.request(`/questions?${params.toString()}`);
  }

  /**
   * Get question by ID
   */
  async getQuestion(questionId: string): Promise<any> {
    return this.request(`/questions/${questionId}`);
  }

  /**
   * Create a new question
   */
  async createQuestion(questionData: CreateQuestionRequest): Promise<any> {
    return this.request('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  /**
   * Update an existing question
   */
  async updateQuestion(questionId: string, questionData: UpdateQuestionRequest): Promise<any> {
    return this.request(`/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  /**
   * Delete a question (soft delete by default)
   */
  async deleteQuestion(questionId: string, hardDelete?: boolean): Promise<void> {
    const params = new URLSearchParams();
    if (hardDelete) {
      params.append('hardDelete', 'true');
    }
    const queryString = params.toString();
    return this.request(`/questions/${questionId}${queryString ? `?${queryString}` : ''}`, {
      method: 'DELETE',
    });
  }

  /**
   * Bulk delete questions
   */
  async bulkDeleteQuestions(questionIds: string[], hardDelete?: boolean): Promise<any> {
    return this.request('/questions/bulk', {
      method: 'DELETE',
      body: JSON.stringify({
        questionIds,
        hardDelete: hardDelete || false,
      }),
    });
  }

  // ==================== Question Bank Hierarchy ====================

  /**
   * Get complete question bank hierarchy (Field → Course → Questions)
   * This is the primary endpoint for hierarchical navigation
   */
  async getHierarchy(options?: HierarchyOptions): Promise<any> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return this.request(`/questions/hierarchy?${params.toString()}`);
  }

  /**
   * Get all fields with question counts
   */
  async getFields(): Promise<any> {
    return this.request('/questions/fields');
  }

  /**
   * Get courses for a specific field
   */
  async getFieldCourses(fieldId: string): Promise<any> {
    return this.request(`/questions/fields/${fieldId}/courses`);
  }

  /**
   * Get questions for a specific field and course
   */
  async getFieldCourseQuestions(
    fieldId: string,
    courseId: string,
    filters?: {
      lessonId?: string;
      type?: string;
      difficulty?: string;
      isActive?: boolean;
      includeInactive?: boolean;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return this.request(`/questions/fields/${fieldId}/courses/${courseId}${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== Question Search & Statistics ====================

  /**
   * Advanced search with complex filters
   */
  async searchQuestions(searchData: SearchRequest): Promise<any> {
    return this.request('/questions/search', {
      method: 'POST',
      body: JSON.stringify(searchData),
    });
  }

  /**
   * Get question bank statistics
   */
  async getStatistics(filters?: StatisticsFilters): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    const queryString = params.toString();
    return this.request(`/questions/statistics${queryString ? `?${queryString}` : ''}`);
  }

  // ==================== Question Import/Export ====================

  /**
   * Export questions to CSV, JSON, or Excel format
   */
  async exportQuestions(options?: ExportOptions): Promise<Blob> {
    const params = new URLSearchParams();
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array values (e.g., questionIds)
            value.forEach((item) => params.append(key, item.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    const queryString = params.toString();
    return this.request(`/questions/export${queryString ? `?${queryString}` : ''}`, {
      responseType: 'blob',
    });
  }

  /**
   * Import questions from CSV, JSON, or Excel file
   */
  async importQuestions(file: File, options: ImportOptions): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, value.toString());
        }
      });
    }

    return this.request('/questions/import', {
      method: 'POST',
      body: formData,
    });
  }

  // ==================== Integration with Exams ====================

  /**
   * Get all exams that use a specific question
   */
  async getQuestionExams(questionId: string): Promise<any> {
    return this.request(`/questions/${questionId}/exams`);
  }
}

