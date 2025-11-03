import { BaseApiService } from "./base";

export class FieldApiService extends BaseApiService {
  // Get all fields
  async getFields(
    orgId?: string,
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.search) params.append("search", filters.search);
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());
    if (filters?.sortBy) params.append("sortBy", filters.sortBy);
    if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

    if (orgId) params.append('orgId', orgId);
    const queryString = params.toString();
    return this.request(queryString ? `/fields?${queryString}` : '/fields');
  }

  // Get field by ID
  async getField(fieldId: string): Promise<any> {
    return this.request(`/fields/${fieldId}`);
  }

  // Create field
  async createField(data: {
    name: string;
    description?: string;
    organizationId: string;
    color?: string;
    icon?: string;
    settings?: any;
  }): Promise<any> {
    return this.request("/fields", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Update field
  async updateField(
    fieldId: string,
    data: {
      name?: string;
      description?: string;
      color?: string;
      icon?: string;
      settings?: any;
    }
  ): Promise<any> {
    return this.request(`/fields/${fieldId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  // Delete field
  async deleteField(fieldId: string): Promise<any> {
    return this.request(`/fields/${fieldId}`, {
      method: "DELETE",
    });
  }

  // Get field courses
  async getFieldCourses(
    fieldId: string,
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    return this.request(queryString ? `/fields/${fieldId}/courses?${queryString}` : `/fields/${fieldId}/courses`);
  }

  // Get field instructors
  async getFieldInstructors(
    fieldId: string,
    filters?: {
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.page) params.append("page", filters.page.toString());
    if (filters?.limit) params.append("limit", filters.limit.toString());

    const queryString = params.toString();
    return this.request(queryString ? `/fields/${fieldId}/instructors?${queryString}` : `/fields/${fieldId}/instructors`);
  }

  // Assign instructors to field
  async assignInstructorsToField(
    fieldId: string,
    instructorIds: string[]
  ): Promise<any> {
    return this.request(`/fields/${fieldId}/assign-instructors`, {
      method: "POST",
      body: JSON.stringify({ instructorIds }),
    });
  }

  // Remove instructors from field
  async removeInstructorsFromField(
    fieldId: string,
    instructorIds: string[]
  ): Promise<any> {
    return this.request(`/fields/${fieldId}/assign-instructors`, {
      method: "DELETE",
      body: JSON.stringify({ instructorIds }),
    });
  }

  // Get field statistics
  async getFieldStats(fieldId: string): Promise<any> {
    return this.request(`/fields/${fieldId}/stats`);
  }

  // Update field settings
  async updateFieldSettings(fieldId: string, settings: any): Promise<any> {
    return this.request(`/fields/${fieldId}/settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
  }
}
