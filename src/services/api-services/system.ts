import { BaseApiService } from './base';

export class SystemApiService extends BaseApiService {
  // Get system metrics
  async getSystemMetrics(): Promise<any> {
    return this.request('/system/metrics');
  }

  // Get system health
  async getSystemHealth(): Promise<any> {
    return this.request('/system/health');
  }

  // Get system status
  async getSystemStatus(): Promise<any> {
    return this.request('/system/status');
  }

  // Get audit logs
  async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource) params.append('resource', filters.resource);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    return this.request(`/system/audit-logs?${params.toString()}`);
  }

  // Get system backups
  async getSystemBackups(filters?: {
    status?: 'completed' | 'failed' | 'in-progress';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/system/backups?${params.toString()}`);
  }

  // Create system backup
  async createSystemBackup(data: {
    name: string;
    description?: string;
    includeData?: boolean;
    includeFiles?: boolean;
  }): Promise<any> {
    return this.request('/system/backups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Restore system backup
  async restoreSystemBackup(backupId: string): Promise<any> {
    return this.request(`/system/backups/${backupId}/restore`, {
      method: 'POST',
    });
  }

  // Delete system backup
  async deleteSystemBackup(backupId: string): Promise<any> {
    return this.request(`/system/backups/${backupId}`, {
      method: 'DELETE',
    });
  }

  // Download system backup
  async downloadSystemBackup(backupId: string): Promise<any> {
    return this.request(`/system/backups/${backupId}/download`);
  }

  // Get compliance reports
  async getComplianceReports(filters?: {
    type?: 'gdpr' | 'ferpa' | 'sox' | 'hipaa';
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/system/compliance-reports?${params.toString()}`);
  }

  // Generate compliance report
  async generateComplianceReport(data: {
    type: 'gdpr' | 'ferpa' | 'sox' | 'hipaa';
    dateFrom: string;
    dateTo: string;
    includeDetails?: boolean;
  }): Promise<any> {
    return this.request('/system/compliance-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Download compliance report
  async downloadComplianceReport(reportId: string): Promise<any> {
    return this.request(`/system/compliance-reports/${reportId}/download`);
  }

  // Get system configuration
  async getSystemConfiguration(): Promise<any> {
    return this.request('/system/configuration');
  }

  // Update system configuration
  async updateSystemConfiguration(data: {
    maintenanceMode?: boolean;
    registrationEnabled?: boolean;
    emailNotifications?: boolean;
    fileUploadLimit?: number;
    sessionTimeout?: number;
    passwordPolicy?: any;
    securitySettings?: any;
  }): Promise<any> {
    return this.request('/system/configuration', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Get system logs
  async getSystemLogs(filters?: {
    level?: 'error' | 'warn' | 'info' | 'debug';
    service?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    if (filters?.service) params.append('service', filters.service);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/system/logs?${params.toString()}`);
  }

  // Clear system logs
  async clearSystemLogs(olderThan?: string): Promise<any> {
    const params = olderThan ? `?olderThan=${olderThan}` : '';
    return this.request(`/system/logs${params}`, {
      method: 'DELETE',
    });
  }

  // Get system performance
  async getSystemPerformance(filters?: {
    timeRange?: string;
    metric?: string;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.timeRange) params.append('timeRange', filters.timeRange);
    if (filters?.metric) params.append('metric', filters.metric);

    return this.request(`/system/performance?${params.toString()}`);
  }

  // Get system alerts
  async getSystemAlerts(filters?: {
    severity?: 'low' | 'medium' | 'high' | 'critical';
    status?: 'active' | 'resolved' | 'dismissed';
    page?: number;
    limit?: number;
  }): Promise<any> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    return this.request(`/system/alerts?${params.toString()}`);
  }

  // Acknowledge system alert
  async acknowledgeSystemAlert(alertId: string): Promise<any> {
    return this.request(`/system/alerts/${alertId}/acknowledge`, {
      method: 'POST',
    });
  }

  // Resolve system alert
  async resolveSystemAlert(alertId: string, data: {
    resolution: string;
    notes?: string;
  }): Promise<any> {
    return this.request(`/system/alerts/${alertId}/resolve`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get system maintenance schedule
  async getSystemMaintenanceSchedule(): Promise<any> {
    return this.request('/system/maintenance');
  }

  // Schedule system maintenance
  async scheduleSystemMaintenance(data: {
    startTime: string;
    endTime: string;
    description: string;
    type: 'scheduled' | 'emergency';
    notifyUsers?: boolean;
  }): Promise<any> {
    return this.request('/system/maintenance', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Cancel system maintenance
  async cancelSystemMaintenance(maintenanceId: string): Promise<any> {
    return this.request(`/system/maintenance/${maintenanceId}/cancel`, {
      method: 'POST',
    });
  }

  // Get system statistics
  async getSystemStatistics(): Promise<any> {
    return this.request('/system/statistics');
  }

  // Get system updates
  async getSystemUpdates(): Promise<any> {
    return this.request('/system/updates');
  }

  // Install system update
  async installSystemUpdate(updateId: string): Promise<any> {
    return this.request(`/system/updates/${updateId}/install`, {
      method: 'POST',
    });
  }

  // Get system integrations
  async getSystemIntegrations(): Promise<any> {
    return this.request('/system/integrations');
  }

  // Test system integration
  async testSystemIntegration(integrationId: string): Promise<any> {
    return this.request(`/system/integrations/${integrationId}/test`, {
      method: 'POST',
    });
  }

  // Configuration management methods
  async getIntegrations(): Promise<any> {
    return this.request('/config/integrations');
  }

  async getFeatureFlags(): Promise<any> {
    return this.request('/config/feature-flags');
  }

  async getBrandingSettings(): Promise<any> {
    return this.request('/config/branding');
  }

  async updateFeatureFlag(featureId: string, enabled: boolean): Promise<any> {
    return this.request(`/config/feature-flags/${featureId}`, {
      method: 'PATCH',
      body: JSON.stringify({ enabled }),
    });
  }

  async updateIntegration(integrationId: string, config: any): Promise<any> {
    return this.request(`/config/integrations/${integrationId}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async updateBrandingSettings(settings: any): Promise<any> {
    return this.request('/config/branding', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}
