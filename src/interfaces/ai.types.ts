// AI Exam Generation Types
export interface GenerateExamRequest {
  content: string;
  courseId: string;
  language: 'en' | 'ar' | 'auto';
  examConfig: ExamGenerationConfig;
  autoAddToBank?: boolean;
}

export interface ExamGenerationConfig {
  title: string;
  totalQuestions: number;
  duration: number;
  difficultyDistribution: DifficultyDistribution;
  fieldId: string;
  questionTypes: string[];
  questionTypeDistribution: Record<string, number>;
  resourceSelections: ResourceSelection[];
  resourceMetadata: ResourceMetadata[];
  instructions?: string;
}

export interface DifficultyDistribution {
  easy: number; // percentage
  medium: number; // percentage
  hard: number; // percentage
}

export interface ResourceSelection {
  lessonId: string;
  resourceIds: string[];
}

export interface ResourceMetadata {
  lessonId: string;
  lessonTitle: string;
  resourceId: string;
  resourceTitle: string;
  resourceType: string;
}

export interface GeneratedExam {
  title: string;
  description?: string;
  timeLimit: number;
  totalPoints: number;
  passingScore?: number;
  sections: GeneratedExamSection[];
  questions?: any[]; // Keep for backward compatibility
}

export interface GeneratedExamSection {
  title: string;
  questions: any[];
  points: number;
}

export interface GenerateExamResponse {
  exam: GeneratedExam;
  creditsUsed: number;
  questionsAddedToBank?: number;
}

// AI Essay Grading Types
export interface GradeEssayRequest {
  essayContent: string;
  rubric?: string;
  maxScore: number;
  criteria?: GradingCriteria;
}

export interface GradingCriteria {
  structure?: number; // weight percentage
  content?: number;
  grammar?: number;
  originality?: number;
  citations?: number;
}

export interface EssayGradingResult {
  score: number;
  grade: string;
  feedback: EssayFeedback;
  creditsUsed: number;
}

export interface EssayFeedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  detailed: {
    structure?: CriteriaFeedback;
    content?: CriteriaFeedback;
    grammar?: CriteriaFeedback;
    originality?: CriteriaFeedback;
    citations?: CriteriaFeedback;
  };
}

export interface CriteriaFeedback {
  score: number;
  feedback: string;
}

// AI Question Generation Types
export interface GenerateQuestionRequest {
  content: string;
  type: 'multiple-choice' | 'true-false' | 'essay' | 'short-answer';
  difficulty?: 'easy' | 'medium' | 'hard';
  courseId?: string;
  fieldId?: string;
  lessonId?: string;
}

export interface GeneratedQuestion {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

