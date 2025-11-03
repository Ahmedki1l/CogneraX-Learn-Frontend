import { BaseApiService } from './base';

export class AdminApiService extends BaseApiService {
  // System Administration
  async getSystemMetrics(): Promise<any> {
    return this.request('/system/metrics');
  }

  async getAuditLogs(filters?: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/system/audit-logs?${params.toString()}`);
  }

  async getBackups(): Promise<any> {
    return this.request('/system/backups');
  }

  async createBackup(name: string, description?: string): Promise<any> {
    return this.request('/system/backups', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  }

  async restoreBackup(backupId: string): Promise<any> {
    return this.request(`/system/backups/${backupId}/restore`, {
      method: 'POST',
    });
  }

  async deleteBackup(backupId: string): Promise<any> {
    return this.request(`/system/backups/${backupId}`, {
      method: 'DELETE',
    });
  }

  async getComplianceReports(): Promise<any> {
    return this.request('/system/compliance-reports');
  }

  // Platform Configuration
  async getIntegrations(): Promise<any> {
    return this.request('/config/integrations');
  }

  async updateIntegration(integrationId: string, settings: any): Promise<any> {
    return this.request(`/config/integrations/${integrationId}`, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async getFeatureFlags(): Promise<any> {
    return this.request('/config/feature-flags');
  }

  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<any> {
    return this.request(`/config/feature-flags/${flagId}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  }

  async getBrandingSettings(): Promise<any> {
    return this.request('/config/branding');
  }

  async updateBrandingSettings(settings: any): Promise<any> {
    return this.request('/config/branding', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  // AI Credits Management
  async getAICreditsBalance(): Promise<any> {
    return this.request('/ai/ai-credits/balance');
  }

  async getAICreditsStats(): Promise<any> {
    return this.request('/ai/ai-credits/stats');
  }

  async getAICreditsHistory(filters?: {
    page?: number;
    limit?: number;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/ai/ai-credits/history?${params.toString()}`);
  }

  async allocateAICredits(userId: string, credits: number, reason?: string): Promise<any> {
    return this.request('/ai/ai-credits/allocate', {
      method: 'POST',
      body: JSON.stringify({ userId, credits, reason }),
    });
  }

  async bulkAllocateCredits(allocations: Array<{
    userId: string;
    credits: number;
    reason?: string;
  }>): Promise<any> {
    return this.request('/ai/ai-credits/bulk-allocate', {
      method: 'POST',
      body: JSON.stringify({ allocations }),
    });
  }

  async getInstructorCredits(): Promise<any> {
    return this.request('/ai/ai-credits/instructors');
  }

  // Students Management
  async getStudents(filters?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    courseId?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/students?${params.toString()}`);
  }

  async getStudentDetails(studentId: string): Promise<any> {
    return this.request(`/students/${studentId}`);
  }

  async getStudentProgress(studentId: string): Promise<any> {
    return this.request(`/students/${studentId}/progress`);
  }

  async inviteStudents(data: {
    courseId: string;
    emails: string[];
    message?: string;
  }): Promise<any> {
    return this.request('/students', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async exportStudentsData(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/students/export?format=${format}`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }

  // Platform Analytics
  async getPlatformAnalytics(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/platform?${params.toString()}`);
  }

  async getUserEngagementStats(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/engagement?${params.toString()}`);
  }

  async getRevenueAnalytics(dateRange?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (dateRange) {
      Object.entries(dateRange).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString());
      });
    }
    return this.request(`/analytics/revenue?${params.toString()}`);
  }

  async getPredictiveAnalytics(): Promise<any> {
    return this.request('/analytics/predictive');
  }

  async exportAnalyticsReport(type: 'platform' | 'engagement' | 'revenue' | 'predictive'): Promise<Blob> {
    const response = await fetch(`${this.constructor.prototype.API_BASE_URL || 'http://localhost:5000/api/v1'}/analytics/export/${type}`, {
      method: 'GET',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  }
}
