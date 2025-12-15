import { BaseApiService } from './base';

export class CourseApiService extends BaseApiService {
  // Course Management
  async getCourses(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    field?: string;
    instructor?: string;
    level?: string;
    status?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/courses?${params.toString()}`);
  }

  async getAccessibleCourses(instructorId: string): Promise<any> {
    return this.request(`/instructors/${instructorId}/accessible-courses`);
  }

  async getCourseById(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}`);
  }

  async createCourse(courseData: {
    title: string;
    description: string;
    category: string;
    level: string;
    duration: number;
    price: number;
    thumbnail?: string;
    isPublic: boolean;
    prerequisites?: string[];
    learningObjectives?: string[];
    tags?: string[];
    field?: string;
  }): Promise<any> {
    return this.request('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(courseId: string, courseData: Partial<{
    title: string;
    description: string;
    category: string;
    level: string;
    duration: number;
    price: number;
    thumbnail: string;
    isPublic: boolean;
    prerequisites: string[];
    learningObjectives: string[];
    tags: string[];
    status: string;
    field?: string;
  }>): Promise<any> {
    return this.request(`/courses/${courseId}`, {
      method: 'PATCH',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(courseId: string): Promise<void> {
    return this.request(`/courses/${courseId}`, {
      method: 'DELETE',
    });
  }

  async publishCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/publish`, {
      method: 'POST',
    });
  }

  async unpublishCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/unpublish`, {
      method: 'POST',
    });
  }

  // Course Content
  async getLessons(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/lessons`);
  }

  async getLesson(lessonId: string): Promise<any> {
    return this.request(`/lessons/${lessonId}`);
  }

  async createLesson(courseId: string, lessonData: {
    title: string;
    description: string;
    content: string;
    type: 'video' | 'text' | 'interactive' | 'quiz';
    duration: number;
    order: number;
    isPublished: boolean;
    resources?: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  }): Promise<any> {
    return this.request(`/courses/${courseId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  async updateLesson(lessonId: string, lessonData: Partial<{
    title: string;
    description: string;
    content: string;
    type: string;
    duration: number;
    order: number;
    isPublished: boolean;
    resources: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  }>): Promise<any> {
    return this.request(`/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(lessonData),
    });
  }

  async deleteLesson(lessonId: string): Promise<void> {
    return this.request(`/lessons/${lessonId}`, {
      method: 'DELETE',
    });
  }

  // Quizzes
  async getQuizzes(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/quizzes`);
  }

  async getQuiz(quizId: string): Promise<any> {
    return this.request(`/quizzes/${quizId}`);
  }

  async createQuiz(courseId: string, quizData: {
    title: string;
    description: string;
    questions: Array<{
      question: string;
      type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      explanation?: string;
    }>;
    timeLimit?: number;
    attempts?: number;
    passingScore: number;
    isPublished: boolean;
  }): Promise<any> {
    return this.request(`/courses/${courseId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(quizId: string, quizData: Partial<{
    title: string;
    description: string;
    questions: Array<{
      question: string;
      type: string;
      options?: string[];
      correctAnswer: string | string[];
      points: number;
      explanation?: string;
    }>;
    timeLimit?: number;
    attempts?: number;
    passingScore: number;
    isPublished: boolean;
  }>): Promise<any> {
    return this.request(`/quizzes/${quizId}`, {
      method: 'PATCH',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(quizId: string): Promise<void> {
    return this.request(`/quizzes/${quizId}`, {
      method: 'DELETE',
    });
  }

  // Assignments
  async getAssignments(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/assignments`);
  }

  async getAssignment(assignmentId: string): Promise<any> {
    return this.request(`/assignments/${assignmentId}`);
  }

  async createAssignment(courseId: string, assignmentData: {
    title: string;
    description: string;
    instructions: string;
    dueDate: string;
    points: number;
    type: 'essay' | 'project' | 'presentation' | 'code';
    attachments?: Array<{
      name: string;
      url: string;
      type: string;
    }>;
    rubric?: Array<{
      criterion: string;
      points: number;
      description: string;
    }>;
    isPublished: boolean;
  }): Promise<any> {
    return this.request(`/courses/${courseId}/assignments`, {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async updateAssignment(assignmentId: string, assignmentData: Partial<{
    title: string;
    description: string;
    instructions: string;
    dueDate: string;
    points: number;
    type: string;
    attachments: Array<{
      name: string;
      url: string;
      type: string;
    }>;
    rubric: Array<{
      criterion: string;
      points: number;
      description: string;
    }>;
    isPublished: boolean;
  }>): Promise<any> {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteAssignment(assignmentId: string): Promise<void> {
    return this.request(`/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
  }


  async getEnrollments(filters?: {
    page?: number;
    limit?: number;
    courseId?: string;
    studentId?: string;
    status?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/enrollments?${params.toString()}`);
  }

  // Course Progress
  async getCourseProgress(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/progress`);
  }

  async updateLessonProgress(lessonId: string, progress: {
    completed: boolean;
    timeSpent: number;
    lastPosition?: number;
  }): Promise<any> {
    return this.request(`/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(progress),
    });
  }

  async getStudentProgress(courseId: string, studentId: string): Promise<any> {
    return this.request(`/courses/${courseId}/students/${studentId}/progress`);
  }


  // Course Categories
  async getCategories(): Promise<any> {
    return this.request('/categories');
  }

  async createCategory(categoryData: {
    name: string;
    description: string;
    parentId?: string;
  }): Promise<any> {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryId: string, categoryData: {
    name: string;
    description: string;
    parentId?: string;
  }): Promise<any> {
    return this.request(`/categories/${categoryId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(categoryId: string): Promise<void> {
    return this.request(`/categories/${categoryId}`, {
      method: 'DELETE',
    });
  }

  // Course Fields
  async getCourseFields(): Promise<any> {
    return this.request('/courses/fields');
  }

  // Enrolled Courses
  // Student Enrolled Courses - GET /courses/enrolled
  async getEnrolledCourses(filters?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    return this.request(`/courses/enrolled?${params.toString()}`);
  }

  // Student Enrolled Courses by Fields - GET /courses/enrolled/fields
  async getEnrolledCoursesByFields(): Promise<any> {
    return this.request('/courses/enrolled/fields');
  }

  // Course Enrollment - POST /courses/:id/enroll
  async enrollInCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'POST',
    });
  }

  // Course Unenrollment - DELETE /courses/:id/enroll
  async unenrollFromCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/enroll`, {
      method: 'DELETE',
    });
  }


  // Course Students
  async getCourseStudents(courseId: string, filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/courses/${courseId}/students?${params.toString()}`);
  }

  // TODO: BACKEND IMPLEMENTATION REQUIRED
  // Course Instructor Assignment (pending backend implementation)
  async assignInstructors(courseId: string, instructorIds: string[]): Promise<any> {
    console.warn('⚠️ Backend not implemented yet: assignInstructors');
    return this.request(`/courses/${courseId}/assign-instructors`, {
      method: 'POST',
      body: JSON.stringify({ instructorIds }),
    });
  }

  async removeInstructors(courseId: string, instructorIds: string[]): Promise<any> {
    console.warn('⚠️ Backend not implemented yet: removeInstructors');
    return this.request(`/courses/${courseId}/assign-instructors`, {
      method: 'DELETE',
      body: JSON.stringify({ instructorIds }),
    });
  }

  async getCourseInstructors(courseId: string, includeFields: boolean = true): Promise<any> {
    console.warn('⚠️ Backend not implemented yet: getCourseInstructors');
    const params = new URLSearchParams();
    if (includeFields) params.append('includeFields', 'true');
    return this.request(`/courses/${courseId}/instructors?${params.toString()}`);
  }

  // Course Bookmarks - POST /courses/:id/bookmark
  async bookmarkCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/bookmark`, {
      method: 'POST',
    });
  }

  // Remove Bookmark - DELETE /courses/:id/bookmark
  async unbookmarkCourse(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/bookmark`, {
      method: 'DELETE',
    });
  }

  // Get Bookmarked Courses - GET /users/me/bookmarked-courses
  async getBookmarkedCourses(filters?: {
    field?: string;
    level?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.field) params.append('field', filters.field);
    if (filters?.level) params.append('level', filters.level);
    return this.request(`/users/me/bookmarked-courses?${params.toString()}`);
  }

  // Add Course Review - POST /courses/:id/reviews
  async addCourseReview(courseId: string, data: { 
    rating: number; 
    comment: string;
    wouldRecommend?: boolean;
  }): Promise<any> {
    return this.request(`/courses/${courseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get Course Reviews - GET /courses/:id/reviews
  async getCourseReviews(courseId: string, filters?: {
    rating?: number;
    sortBy?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.rating) params.append('rating', filters.rating.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    return this.request(`/courses/${courseId}/reviews?${params.toString()}`);
  }

  // Update Course Review - PUT /courses/:id/reviews/:reviewId
  async updateCourseReview(courseId: string, reviewId: string, data: {
    rating?: number;
    comment?: string;
    wouldRecommend?: boolean;
  }): Promise<any> {
    return this.request(`/courses/${courseId}/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete Course Review - DELETE /courses/:id/reviews/:reviewId
  async deleteCourseReview(courseId: string, reviewId: string): Promise<any> {
    return this.request(`/courses/${courseId}/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  }
}
