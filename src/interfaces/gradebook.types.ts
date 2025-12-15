export interface GradebookOverviewStats {
  totalAssignments: number;
  activeAssignments: number;
  completedAssignments: number;
  totalExams: number;
  pendingGrades: number;
  pendingAssignmentGrades: number;
  pendingExamGrades: number;
  classAverage: number;
  classAverageDelta?: number;
  completionRate: number;
  averageProgress?: number;
  totalStudents?: number;
  activeStudents?: number;
}

export interface GradebookStudentAssignmentGrade {
  assignmentId: string;
  score: number | null;
  maxPoints: number;
  submitted: boolean;
  late?: boolean;
  feedback?: string;
}

export interface GradebookStudentExamGrade {
  examId: string;
  score: number | null;
  maxScore: number;
  percentage?: number | null;
  letterGrade?: string | null;
  status?: 'submitted' | 'graded' | 'in-progress' | 'pending';
}

export interface GradebookStudent {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  overall: number;
  assignments: Record<string, GradebookStudentAssignmentGrade>;
  exams: Record<string, GradebookStudentExamGrade>;
}

export interface RubricLevel {
  points: number;
  description: string;
}

export interface RubricCriterion {
  id: string;
  name: string;
  weight: number;
  levels: RubricLevel[];
}

export interface Rubric {
  id: string;
  name: string;
  courseId: string;
  criteria: RubricCriterion[];
}
