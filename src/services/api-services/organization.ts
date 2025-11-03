import { BaseApiService } from './base';

export class OrganizationApiService extends BaseApiService {
  // Get all organizations
  async getOrganizations(filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/organizations?${params.toString()}`);
  }

  // Get organization by ID
  async getOrganization(orgId: string): Promise<any> {
    return this.request(`/organizations/${orgId}`);
  }

  // Create organization
  async createOrganization(data: {
    name: string;
    domain: string;
    primaryColor?: string;
    secondaryColor?: string;
    settings?: any;
  }): Promise<any> {
    return this.request('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update organization
  async updateOrganization(orgId: string, data: {
    name?: string;
    domain?: string;
    primaryColor?: string;
    secondaryColor?: string;
    settings?: any;
  }): Promise<any> {
    return this.request(`/organizations/${orgId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete organization
  async deleteOrganization(orgId: string): Promise<any> {
    return this.request(`/organizations/${orgId}`, {
      method: 'DELETE',
    });
  }

  // Get organization statistics
  async getOrganizationStats(orgId: string): Promise<any> {
    return this.request(`/organizations/${orgId}/stats`);
  }

  // Update organization settings
  async updateOrganizationSettings(orgId: string, settings: any): Promise<any> {
    return this.request(`/organizations/${orgId}/settings`, {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // Get organization members
  async getOrganizationMembers(orgId: string, filters?: {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/organizations/${orgId}/members?${params.toString()}`);
  }

  // Add member to organization
  async addMemberToOrganization(orgId: string, data: {
    userId: string;
    role: string;
  }): Promise<any> {
    return this.request(`/organizations/${orgId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Remove member from organization
  async removeMemberFromOrganization(orgId: string, userId: string): Promise<any> {
    return this.request(`/organizations/${orgId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // Update member role
  async updateMemberRole(orgId: string, userId: string, role: string): Promise<any> {
    return this.request(`/organizations/${orgId}/members/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }
}
