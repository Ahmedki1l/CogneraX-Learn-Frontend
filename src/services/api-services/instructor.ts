import { BaseApiService } from './base';

export class InstructorApiService extends BaseApiService {
  // Get instructor's accessible courses in hierarchical structure
  async getAccessibleCourses(instructorId: string): Promise<any> {
    return this.request(`/instructors/${instructorId}/accessible-courses`);
  }
}

