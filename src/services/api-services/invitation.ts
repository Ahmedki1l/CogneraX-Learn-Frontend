import { BaseApiService } from './base';

export class InvitationApiService extends BaseApiService {
  // Get invitations
  async getInvitations(filters?: {
    status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
    type?: 'student' | 'instructor' | 'admin' | 'parent';
    courseId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/invitations?${params.toString()}`);
  }

  // Get invitation by ID
  async getInvitation(invitationId: string): Promise<any> {
    return this.request(`/invitations/${invitationId}`);
  }

  // Get invitation by token
  async getInvitationByToken(token: string): Promise<any> {
    return this.request(`/invitations/token/${token}`, {}, true); // Skip auth for public invitation lookup
  }

  // Create invitation
  async createInvitation(data: {
    role: 'student' | 'instructor' | 'parent';
    email?: string;
    message?: string;
    description?: string;
    expiresInDays?: number;
    maxUses?: number;
  }): Promise<any> {
    return this.request('/invitations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Create bulk invitations
  async createBulkInvitations(data: {
    invitations: {
      email: string;
      role: 'student' | 'instructor' | 'admin' | 'parent';
      courseId?: string;
      organizationId?: string;
      message?: string;
      expiresAt?: string;
      customFields?: any;
    }[];
  }): Promise<any> {
    return this.request('/invitations/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update invitation
  async updateInvitation(invitationId: string, data: {
    role?: 'student' | 'instructor' | 'admin' | 'parent';
    courseId?: string;
    organizationId?: string;
    message?: string;
    expiresAt?: string;
    customFields?: any;
  }): Promise<any> {
    return this.request(`/invitations/${invitationId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Cancel invitation
  async cancelInvitation(invitationId: string): Promise<any> {
    return this.request(`/invitations/${invitationId}/cancel`, {
      method: 'POST',
    });
  }

  // Accept invitation
  async acceptInvitation(token: string, data: {
    password: string;
    name: string;
    customFields?: any;
  }): Promise<any> {
    return this.request(`/invitations/${token}/accept`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reject invitation
  async rejectInvitation(token: string): Promise<any> {
    return this.request(`/invitations/${token}/reject`, {
      method: 'POST',
    });
  }

  // Delete invitation
  async deleteInvitation(invitationId: string): Promise<any> {
    return this.request(`/invitations/${invitationId}`, {
      method: 'DELETE',
    });
  }

  // Get invitation templates
  async getInvitationTemplates(): Promise<any> {
    return this.request('/invitations/templates');
  }

  // Create invitation template
  async createInvitationTemplate(data: {
    name: string;
    subject: string;
    content: string;
    type: 'student' | 'instructor' | 'admin' | 'parent';
    variables?: string[];
  }): Promise<any> {
    return this.request('/invitations/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update invitation template
  async updateInvitationTemplate(templateId: string, data: {
    name?: string;
    subject?: string;
    content?: string;
    type?: 'student' | 'instructor' | 'admin' | 'parent';
    variables?: string[];
  }): Promise<any> {
    return this.request(`/invitations/templates/${templateId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete invitation template
  async deleteInvitationTemplate(templateId: string): Promise<any> {
    return this.request(`/invitations/templates/${templateId}`, {
      method: 'DELETE',
    });
  }

  // Test invitation
  async testInvitation(templateId: string, data: {
    email: string;
    variables?: any;
  }): Promise<any> {
    return this.request(`/invitations/templates/${templateId}/test`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get invitation analytics
  async getInvitationAnalytics(filters?: {
    timeRange?: string;
    groupBy?: string;
    type?: 'student' | 'instructor' | 'admin' | 'parent';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.groupBy) params.append('groupBy', filters.groupBy);
    if (filters?.type) params.append('type', filters.type);

    return this.request(`/invitations/analytics?${params.toString()}`);
  }

  // Export invitations
  async exportInvitations(format: 'csv' | 'excel' | 'pdf', filters?: {
    status?: 'pending' | 'accepted' | 'expired' | 'cancelled';
    type?: 'student' | 'instructor' | 'admin' | 'parent';
    courseId?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    params.append('format', format);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);

    return this.request(`/invitations/export?${params.toString()}`);
  }

  // Validate invitation token
  async validateInvitationToken(token: string): Promise<any> {
    return this.request(`/invitations/validate/${token}`);
  }

  // Get invitation statistics
  async getInvitationStats(): Promise<any> {
    return this.request('/invitations/stats');
  }

  // Resend invitation URL
  async resendInvitation(invitationId: string): Promise<any> {
    return this.request(`/invitations/${invitationId}/resend`, {
      method: 'POST',
    });
  }
}
