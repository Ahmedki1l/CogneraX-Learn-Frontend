// Lesson Types
export interface Lesson {
  id: string;
  _id?: string;
  title: string;
  name?: string; // Alias for title
  description?: string;
  content?: string;
  courseId: string;
  order?: number;
  duration?: number;
  resources?: LessonResource[];
  status?: 'draft' | 'published';
  createdAt?: string;
  updatedAt?: string;
}

export interface LessonResource {
  id: string;
  _id?: string;
  title: string;
  type: string;
  url?: string;
  description?: string;
  extractedText?: string;
  text?: string;
  content?: string;
  textContent?: string;
  size?: number;
  updatedAt?: string;
}

export interface AccessibleLesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  resources?: AccessibleResource[];
}

export interface AccessibleResource {
  id: string;
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  extractedText?: string;
  text?: string;
  content?: string;
  textContent?: string;
  size?: number;
  updatedAt?: string;
}

