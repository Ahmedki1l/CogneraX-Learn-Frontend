// Main API Service - Combines all API services
import { BaseApiService, User, LoginCredentials, RegisterData } from './base';
import { AuthApiService } from './auth';
import { AdminApiService } from './admin';
import { UserApiService } from './user';
import { AnalyticsApiService } from './analytics';
import { CourseApiService } from './course';
import { AIApiService } from './ai';
import { PaymentApiService } from './payment';
import { UploadApiService } from './upload';
import { OrganizationApiService } from './organization';
import { FieldApiService } from './field';
import { LessonApiService } from './lesson';
import { QuizApiService } from './quiz';
import { AssignmentApiService } from './assignment';
import { NotificationApiService } from './notification';
import { ForumApiService } from './forum';
import { CartApiService } from './cart';
import { InvitationApiService } from './invitation';
import { SystemApiService } from './system';
import { InstructorApiService } from './instructor';
import { ExamApiService } from './exam';
import { QuestionApiService } from './question';
import { GradebookApiService } from './gradebook';
import { CommunicationApiService } from './communication';
import { ParentApiService } from './parent';

export class ApiService extends BaseApiService {
  // Initialize all API services
  public auth: AuthApiService;
  public admin: AdminApiService;
  public user: UserApiService;
  public analytics: AnalyticsApiService;
  public course: CourseApiService;
  public ai: AIApiService;
  public payment: PaymentApiService;
  public upload: UploadApiService;
  public organization: OrganizationApiService;
  public field: FieldApiService;
  public lesson: LessonApiService;
  public quiz: QuizApiService;
  public assignment: AssignmentApiService;
  public notification: NotificationApiService;
  public forum: ForumApiService;
  public cart: CartApiService;
  public invitation: InvitationApiService;
  public system: SystemApiService;
  public instructor: InstructorApiService;
  public exam: ExamApiService;
  public question: QuestionApiService;
  public gradebook: GradebookApiService;
  public communication: CommunicationApiService;
  public parent: ParentApiService;

  constructor() {
    super();
    
    // Initialize all API services with shared token management
    this.auth = new AuthApiService();
    this.admin = new AdminApiService();
    this.user = new UserApiService();
    this.analytics = new AnalyticsApiService();
    this.course = new CourseApiService();
    this.ai = new AIApiService();
    this.payment = new PaymentApiService();
    this.upload = new UploadApiService();
    this.organization = new OrganizationApiService();
    this.field = new FieldApiService();
    this.lesson = new LessonApiService();
    this.quiz = new QuizApiService();
    this.assignment = new AssignmentApiService();
    this.notification = new NotificationApiService();
    this.forum = new ForumApiService();
    this.cart = new CartApiService();
    this.invitation = new InvitationApiService();
    this.system = new SystemApiService();
    this.instructor = new InstructorApiService();
    this.exam = new ExamApiService();
    this.question = new QuestionApiService();
    this.gradebook = new GradebookApiService();
    this.communication = new CommunicationApiService();
    this.parent = new ParentApiService();

    // Sync tokens across all services
    this.syncTokens();
  }

  private syncTokens(): void {
    // Sync tokens from base service to all sub-services
    const token = this.token;
    const refreshToken = this.refreshToken;

    if (token && refreshToken) {
      this.auth.setTokens(token, refreshToken);
      this.admin.setTokens(token, refreshToken);
      this.user.setTokens(token, refreshToken);
      this.analytics.setTokens(token, refreshToken);
      this.course.setTokens(token, refreshToken);
      this.ai.setTokens(token, refreshToken);
      this.payment.setTokens(token, refreshToken);
      this.upload.setTokens(token, refreshToken);
      this.organization.setTokens(token, refreshToken);
      this.field.setTokens(token, refreshToken);
      this.gradebook.setTokens(token, refreshToken);
      this.lesson.setTokens(token, refreshToken);
      this.quiz.setTokens(token, refreshToken);
      this.assignment.setTokens(token, refreshToken);
      this.notification.setTokens(token, refreshToken);
      this.forum.setTokens(token, refreshToken);
      this.cart.setTokens(token, refreshToken);
      this.invitation.setTokens(token, refreshToken);
      this.system.setTokens(token, refreshToken);
      this.instructor.setTokens(token, refreshToken);
      this.exam.setTokens(token, refreshToken);
      this.question.setTokens(token, refreshToken);
      this.communication.setTokens(token, refreshToken);
      this.parent.setTokens(token, refreshToken);
    }
  }

  // Override setTokens to sync across all services
  public setTokens(token: string, refreshToken: string): void {
    super.setTokens(token, refreshToken);
    
    // Sync to all sub-services
    this.auth.setTokens(token, refreshToken);
    this.admin.setTokens(token, refreshToken);
    this.user.setTokens(token, refreshToken);
    this.analytics.setTokens(token, refreshToken);
    this.course.setTokens(token, refreshToken);
    this.ai.setTokens(token, refreshToken);
    this.payment.setTokens(token, refreshToken);
    this.upload.setTokens(token, refreshToken);
    this.organization.setTokens(token, refreshToken);
    this.field.setTokens(token, refreshToken);
    this.gradebook.setTokens(token, refreshToken);
    this.instructor.setTokens(token, refreshToken);
    this.lesson.setTokens(token, refreshToken);
    this.quiz.setTokens(token, refreshToken);
    this.assignment.setTokens(token, refreshToken);
    this.notification.setTokens(token, refreshToken);
    this.forum.setTokens(token, refreshToken);
    this.cart.setTokens(token, refreshToken);
    this.invitation.setTokens(token, refreshToken);
    this.system.setTokens(token, refreshToken);
    this.exam.setTokens(token, refreshToken);
    this.question.setTokens(token, refreshToken);
    this.communication.setTokens(token, refreshToken);
    this.parent.setTokens(token, refreshToken);
  }

  // Override clearTokens to sync across all services
  public clearTokens(): void {
    super.clearTokens();
    
    // Clear tokens in all sub-services
    this.auth.clearTokens();
    this.admin.clearTokens();
    this.user.clearTokens();
    this.analytics.clearTokens();
    this.course.clearTokens();
    this.ai.clearTokens();
    this.payment.clearTokens();
    this.upload.clearTokens();
    this.organization.clearTokens();
    this.field.clearTokens();
    this.gradebook.clearTokens();
    this.instructor.clearTokens();
    this.lesson.clearTokens();
    this.quiz.clearTokens();
    this.assignment.clearTokens();
    this.notification.clearTokens();
    this.forum.clearTokens();
    this.cart.clearTokens();
    this.invitation.clearTokens();
    this.system.clearTokens();
    this.exam.clearTokens();
    this.question.clearTokens();
    this.communication.clearTokens();
    this.parent.clearTokens();
  }

  // Convenience methods for common operations
  async login(credentials: LoginCredentials): Promise<User> {
    const user = await this.auth.login(credentials);
    // Reload tokens from storage to get the new token set by auth service
    this.loadTokensFromStorage();
    this.syncTokens();
    
    // Force sync with explicit token read if loadTokensFromStorage doesn't work as expected immediately
    // (localStorage write might be async-ish in some browsers/environments but usually sync)
    // Double check to be sure we propagate the NEW token
    const newToken = localStorage.getItem('token');
    const newRefreshToken = localStorage.getItem('refreshToken');
    if (newToken && newRefreshToken) {
        this.setTokens(newToken, newRefreshToken);
    }
    
    return user;
  }

  async register(data: RegisterData): Promise<User> {
    const user = await this.auth.register(data);
    // Reload tokens from storage to get the new token set by auth service
    this.loadTokensFromStorage();
    this.syncTokens();
    
    const newToken = localStorage.getItem('token');
    const newRefreshToken = localStorage.getItem('refreshToken');
    if (newToken && newRefreshToken) {
        this.setTokens(newToken, newRefreshToken);
    }
    
    return user;
  }

  async logout(): Promise<void> {
    await this.auth.logout();
    this.clearTokens();
  }

  // Legacy methods for backward compatibility
  async getMe(): Promise<User> {
    return super.getMe();
  }

  async refreshAccessTokenManually(): Promise<boolean> {
    const result = await super.refreshAccessTokenManually();
    if (result) {
      this.syncTokens();
    }
    return result;
  }

  async initializeAuth(): Promise<User | null> {
    const result = await super.initializeAuth();
    if (result) {
      this.syncTokens();
    }
    return result;
  }

  // Legacy method mappings for backward compatibility
  async getPlatformAnalytics(dateRange?: any): Promise<any> {
    return this.analytics.getPlatformAnalytics(dateRange);
  }

  async getUserEngagementStats(dateRange?: any): Promise<any> {
    return this.analytics.getUserEngagementStats(dateRange);
  }

  async getRevenueAnalytics(dateRange?: any): Promise<any> {
    return this.analytics.getRevenueAnalytics(dateRange);
  }

  async getPredictiveAnalytics(): Promise<any> {
    return this.analytics.getPredictiveAnalytics();
  }

  async exportAnalyticsReport(type: string): Promise<Blob> {
    return this.analytics.exportAnalyticsReport(type as any);
  }

  // Admin methods
  async getSystemMetrics(): Promise<any> {
    return this.admin.getSystemMetrics();
  }

  async getAuditLogs(filters?: any): Promise<any> {
    return this.admin.getAuditLogs(filters);
  }

  async getBackups(): Promise<any> {
    return this.admin.getBackups();
  }

  async createBackup(name: string, description?: string): Promise<any> {
    return this.admin.createBackup(name, description);
  }

  async restoreBackup(backupId: string): Promise<any> {
    return this.admin.restoreBackup(backupId);
  }

  async getComplianceReports(): Promise<any> {
    return this.admin.getComplianceReports();
  }

  async getIntegrations(): Promise<any> {
    return this.admin.getIntegrations();
  }

  async updateIntegration(integrationId: string, settings: any): Promise<any> {
    return this.admin.updateIntegration(integrationId, settings);
  }

  async getFeatureFlags(): Promise<any> {
    return this.admin.getFeatureFlags();
  }

  async updateFeatureFlag(flagId: string, enabled: boolean): Promise<any> {
    return this.admin.updateFeatureFlag(flagId, enabled);
  }

  async getBrandingSettings(): Promise<any> {
    return this.admin.getBrandingSettings();
  }

  async updateBrandingSettings(settings: any): Promise<any> {
    return this.admin.updateBrandingSettings(settings);
  }

  // AI Credits methods
  async getAICreditsBalance(): Promise<any> {
    return this.admin.getAICreditsBalance();
  }

  async getAICreditsStats(): Promise<any> {
    return this.admin.getAICreditsStats();
  }

  async getAICreditsHistory(filters?: any): Promise<any> {
    return this.admin.getAICreditsHistory(filters);
  }

  async allocateAICredits(userId: string, credits: number, reason?: string): Promise<any> {
    return this.admin.allocateAICredits(userId, credits, reason);
  }

  async bulkAllocateCredits(allocations: any): Promise<any> {
    return this.admin.bulkAllocateCredits(allocations);
  }

  async getInstructorCredits(): Promise<any> {
    return this.admin.getInstructorCredits();
  }

  // Students methods
  async getStudents(filters?: any): Promise<any> {
    return this.admin.getStudents(filters);
  }

  async getStudentDetails(studentId: string): Promise<any> {
    return this.admin.getStudentDetails(studentId);
  }

  async getStudentProgress(studentId: string): Promise<any> {
    return this.admin.getStudentProgress(studentId);
  }

  async inviteStudents(data: any): Promise<any> {
    return this.admin.inviteStudents(data);
  }

  async exportStudentsData(format?: string): Promise<Blob> {
    return this.admin.exportStudentsData(format as any);
  }

  // User methods
  async getUsers(filters?: any): Promise<any> {
    return this.user.getUsers(filters);
  }

  async createUser(userData: any): Promise<any> {
    return this.user.createUser(userData);
  }

  async updateUser(userId: string, userData: any): Promise<any> {
    return this.user.updateUser(userId, userData);
  }

  async deleteUser(userId: string): Promise<void> {
    return this.user.deleteUser(userId);
  }

  async updateUserRole(userId: string, role: string): Promise<any> {
    return this.user.updateUserRole(userId, role);
  }

  async updateUserPermissions(userId: string, permissions: string[]): Promise<any> {
    return this.user.updateUserPermissions(userId, permissions);
  }

  async bulkUserActions(action: string, userIds: string[], data?: any): Promise<any> {
    return this.user.bulkUserActions(action as any, userIds, data);
  }

  async exportUsers(format?: string): Promise<Blob> {
    return this.user.exportUsers(format as any);
  }

  // Course methods
  async getCourses(filters?: any): Promise<any> {
    return this.course.getCourses(filters);
  }

  async getLesson(lessonId: string): Promise<any> {
    return this.course.getLesson(lessonId);
  }
}

// Create and export a singleton instance
export const api = new ApiService();

// Export all types and services for individual use
export * from './base';
export * from './auth';
export * from './admin';
export * from './user';
export * from './analytics';
export * from './course';
export * from './ai';
export * from './payment';
export * from './upload';
export * from './organization';
export * from './field';
export * from './lesson';
export * from './quiz';
export * from './assignment';
export * from './notification';
export * from './forum';
export * from './cart';
export * from './invitation';
export * from './system';
export * from './exam';
export * from './question';
export * from './gradebook';
export * from './communication';
export * from './parent';

// Default export
export default api;
