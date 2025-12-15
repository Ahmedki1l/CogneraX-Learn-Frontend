// Course Types
export interface Course {
  id: string;
  _id?: string;
  title: string;
  name?: string; // Alias for title
  description: string;
  instructor?: CourseInstructor;
  fieldId?: string;
  field?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  difficulty?: string;
  status: 'draft' | 'published' | 'archived';
  price: number;
  thumbnail?: string;
  thumbnailUrl?: string;
  students?: number;
  studentsCount?: number;
  lessons?: number;
  lessonsCount?: number;
  rating?: number;
  ratingsCount?: number;
  reviewsCount?: number;
  createdAt?: string;
  createdDate?: string;
  updatedAt?: string;
}

export interface CourseInstructor {
  _id: string;
  id: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  email?: string;
}

export interface AccessibleCourse {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  lessons?: number;
  students?: number;
}

export interface AccessibleField {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  accessType?: string;
  permissions?: string[];
  courses: AccessibleCourse[];
}

