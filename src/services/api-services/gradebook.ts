import { BaseApiService } from './base';

export class GradebookApiService extends BaseApiService {
  // Overview statistics for a course
  async getGradebookOverview(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/gradebook/overview`);
  }

  // Students with grades for a course
  async getGradebookStudents(courseId: string, filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) params.append(key, value.toString());
      });
    }
    const query = params.toString();
    return this.request(`/courses/${courseId}/gradebook/students${query ? `?${query}` : ''}`);
  }

  // Detailed grades for a specific student in a course
  async getStudentGrades(courseId: string, studentId: string): Promise<any> {
    return this.request(`/courses/${courseId}/gradebook/students/${studentId}`);
  }

  // Rubrics for a course
  async getRubrics(courseId: string): Promise<any> {
    return this.request(`/courses/${courseId}/rubrics`);
  }

  async createRubric(courseId: string, rubricData: any): Promise<any> {
    return this.request(`/courses/${courseId}/rubrics`, {
      method: 'POST',
      body: JSON.stringify(rubricData),
    });
  }

  async updateRubric(rubricId: string, rubricData: any): Promise<any> {
    return this.request(`/rubrics/${rubricId}`, {
      method: 'PUT',
      body: JSON.stringify(rubricData),
    });
  }

  async deleteRubric(rubricId: string): Promise<any> {
    return this.request(`/rubrics/${rubricId}`, {
      method: 'DELETE',
    });
  }

  // Export gradebook data
  async exportGradebook(courseId: string, format: 'csv' | 'json' = 'csv'): Promise<Blob> {
    const response = await this.request(`/courses/${courseId}/gradebook/export?format=${format}`, {
      method: 'GET',
    });
    return response as Blob;
  }
}

// Singleton instance is provided via src/services/api-services/index.ts
export default GradebookApiService;
