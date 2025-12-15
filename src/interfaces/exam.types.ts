// Exam Core Types
export interface Exam {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  courseId: string;
  fieldId: string;
  instructorId: string;
  
  // Scheduling
  scheduledDate?: string; // ISO date-time
  scheduledEndDate?: string; // ISO date-time
  duration: number; // minutes
  allowLateSubmission?: boolean;
  
  // Configuration
  totalPoints: number;
  passingScore?: number;
  maxAttempts?: number;
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showResultsImmediately?: boolean;
  
  // Questions
  sections: ExamSection[];
  questionCount: number;
  
  // Metadata
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
  createdBy?: 'ai' | 'manual' | 'hybrid';
  instructions?: string;
}

export interface ExamSection {
  id: string;
  title: string;
  questions: ExamQuestion[];
  points: number;
  order?: number;
}

export interface ExamQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'short-answer';
  options?: string[]; // For multiple-choice/true-false
  correctAnswer?: number | string; // Index for MC, answer string for others
  explanation?: string;
  points: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  order?: number;
}

// Exam Taking & Sessions
export interface ExamSession {
  id: string;
  examId: string;
  studentId: string;
  startedAt: string;
  expiresAt: string;
  timeRemaining: number; // seconds
  lastSavedAt?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentId: string;
  sessionId: string;
  startedAt: string;
  submittedAt?: string;
  answers: Record<string, any>; // questionId -> answer
  status: 'in-progress' | 'submitted' | 'graded';
  score?: number;
  grade?: string;
  gradedAt?: string;
  gradedBy?: string;
  feedback?: ExamFeedback;
}

// Grading
export interface ExamGrade {
  id: string;
  _id?: string;
  submissionId: string;
  examId: string;
  studentId: string;
  totalScore: number;
  maxScore: number;
  percentage: number;
  letterGrade?: string;
  questionGrades: QuestionGrade[];
  overallFeedback?: string;
  gradedAt: string;
  gradedBy: string;
  gradingMethod: 'ai' | 'manual' | 'auto';
  updatedAt?: string;
}

export interface QuestionGrade {
  questionId: string;
  pointsAwarded: number;
  maxPoints: number;
  feedback?: string;
  correctAnswer?: string | number;
  studentAnswer?: string | number;
}

export interface ExamFeedback {
  strengths?: string[];
  weaknesses?: string[];
  suggestions?: string[];
  detailed?: Record<string, any>;
}

// Request/Response Types
export interface CreateExamRequest {
  title: string;
  description?: string;
  courseId: string;
  fieldId: string;
  duration: number;
  passingScore?: number;
  maxAttempts?: number;
  scheduledDate?: string;
  scheduledEndDate?: string;
  sections: ExamSection[];
  settings: ExamSettings;
  instructions?: string;
  status?: 'draft' | 'scheduled';
}

export interface ExamSettings {
  shuffleQuestions?: boolean;
  shuffleAnswers?: boolean;
  showResultsImmediately?: boolean;
  allowLateSubmission?: boolean;
}

export interface ExamFilters {
  fieldId?: string;
  courseId?: string;
  status?: Exam['status'];
  instructorId?: string;
  scheduledDateFrom?: string;
  scheduledDateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ScheduleExamRequest {
  scheduledDate: string;
  scheduledEndDate?: string;
  duration?: number; // Override exam duration if needed
}

export interface StartExamResponse {
  session: ExamSession;
  exam: Exam;
}

export interface SubmitExamRequest {
  sessionId: string;
  answers: Record<string, any>;
  submittedAt?: string;
}

export interface SaveProgressRequest {
  answers: Record<string, any>;
  currentQuestionIndex?: number;
  timeRemaining?: number;
}

// Analytics
export interface ExamAnalytics {
  examId: string;
  totalSubmissions: number;
  averageScore: number;
  passingRate: number;
  completionRate: number;
  averageTimeSpent: number;
  questionStatistics: QuestionStatistics[];
  scoreDistribution: ScoreDistribution;
  submissionTrends: SubmissionTrend[];
}

export interface QuestionStatistics {
  questionId: string;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTimeSpent: number;
  difficultyRating: number;
}

export interface ScoreDistribution {
  excellent: number; // 90-100
  good: number; // 80-89
  satisfactory: number; // 70-79
  needsImprovement: number; // <70
}

export interface SubmissionTrend {
  date: string;
  count: number;
  averageScore: number;
}

// Submission & Grading Types
export interface SubmissionFilters {
  status?: 'submitted' | 'graded' | 'in-progress';
  studentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AIGradingOptions {
  rubric?: string;
  maxScore?: number;
  criteria?: GradingCriteria;
  language?: 'en' | 'ar' | 'auto';
}

export interface GradingCriteria {
  structure?: number; // weight percentage
  content?: number;
  grammar?: number;
  originality?: number;
  citations?: number;
}

export interface ManualGrades {
  questionGrades: Record<string, {
    pointsAwarded: number;
    maxPoints: number;
    feedback?: string;
  }>;
  overallFeedback?: string;
  isGraded: boolean;
}

export interface BulkGradeRequest {
  submissionIds: string[];
  gradeMethod: 'auto' | 'ai' | 'manual';
  rubric?: string;
}

export interface GradeFilters {
  examId?: string;
  courseId?: string;
  status?: 'graded' | 'pending';
  page?: number;
  limit?: number;
}

export interface AnalyticsFilters {
  timeRange?: '7d' | '30d' | '90d' | 'all';
  groupBy?: 'day' | 'week' | 'month';
}

export interface StatsFilters {
  courseId?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

export interface ExportOptions {
  includeAnswers?: boolean;
  includeFeedback?: boolean;
}

export interface ScheduleFilters {
  fieldId?: string;
  courseId?: string;
  status?: 'scheduled' | 'active';
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

