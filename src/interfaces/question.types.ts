// Question Bank Types
export interface Question {
  id: string;
  _id?: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'short-answer';
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  fieldId?: string;
  courseId?: string;
  lessonId?: string;
  tags?: string[];
  subject?: string;
  source?: 'ai-generated' | 'manual';
  usageCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  order?: number;
}

export interface QuestionFilters {
  fieldId?: string;
  courseId?: string;
  lessonId?: string;
  type?: Question['type'];
  difficulty?: Question['difficulty'];
  tags?: string[];
  search?: string;
  isActive?: boolean; // Added to support filtering by active status
}

export interface QuestionBankStats {
  totalQuestions: number;
  byType: Record<string, number>;
  byDifficulty: Record<string, number>;
  byField: Record<string, number>;
}

// Request/Response Types for API
export interface CreateQuestionRequest {
  question: string;
  type: Question['type'];
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  difficulty: Question['difficulty'];
  points: number;
  fieldId: string;
  courseId: string;
  lessonId?: string;
  tags?: string[];
  subject?: string;
  source?: 'ai-generated' | 'manual' | 'exam';
}

export interface UpdateQuestionRequest {
  question?: string;
  type?: Question['type'];
  options?: string[];
  correctAnswer?: number | string;
  explanation?: string;
  difficulty?: Question['difficulty'];
  points?: number;
  fieldId?: string;
  courseId?: string;
  lessonId?: string;
  tags?: string[];
  subject?: string;
  isActive?: boolean;
}

export interface HierarchyOptions {
  includeQuestions?: boolean;
  includeInactive?: boolean;
  fieldId?: string;
  courseId?: string;
  instructorId?: string;
  depth?: 'summary' | 'full';
}

export interface SearchRequest {
  query?: string;
  filters?: {
    fieldIds?: string[];
    courseIds?: string[];
    lessonIds?: string[];
    types?: Question['type'][];
    difficulties?: Question['difficulty'][];
    tags?: string[];
    sources?: ('ai-generated' | 'manual' | 'exam')[];
    isActive?: boolean;
    minUsageCount?: number;
    maxUsageCount?: number;
    dateRange?: {
      start: string;
      end: string;
    };
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StatisticsFilters {
  fieldId?: string;
  courseId?: string;
  instructorId?: string;
}

export interface ExportOptions {
  format?: 'csv' | 'json' | 'xlsx';
  fieldId?: string;
  courseId?: string;
  questionIds?: string[];
  includeInactive?: boolean;
}

export interface ImportOptions {
  fieldId: string;
  courseId: string;
  lessonId?: string;
  source?: 'manual';
  skipDuplicates?: boolean;
  validateOnly?: boolean;
}

