import { BaseApiService } from './base';
import { 
  Child, 
  ChildProgress, 
  AICreditsResponse, 
  ChildInstructor,
  ContactInstructorRequest 
} from '../../interfaces/parent.types';

export class ParentApiService extends BaseApiService {
  
  // Get linked children - GET /parents/children
  async getChildren(): Promise<Child[]> {
    const response = await this.request('/parents/children') as any;
    return response.data || response;
  }

  // Link a child by email - POST /parents/children
  async linkChild(email: string): Promise<Child> {
    const response = await this.request('/parents/children', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }) as any;
    return response.data || response;
  }

  // Get child's academic progress - GET /parents/children/:childId/progress
  async getChildProgress(childId: string): Promise<ChildProgress> {
    const response = await this.request(`/parents/children/${childId}/progress`) as any;
    return response.data || response;
  }

  // Get child's AI credit balance - GET /parents/children/:childId/ai-credits
  async getChildAICredits(childId: string): Promise<AICreditsResponse> {
    const response = await this.request(`/parents/children/${childId}/ai-credits`) as any;
    return response.data || response;
  }

  // List child's course instructors - GET /parents/children/:childId/instructors
  async getChildInstructors(childId: string): Promise<ChildInstructor[]> {
    const response = await this.request(`/parents/children/${childId}/instructors`) as any;
    return response.data || response;
  }

  // Start conversation with instructor - POST /parents/children/:childId/contact-instructor
  async contactInstructor(
    childId: string, 
    data: ContactInstructorRequest
  ): Promise<{ _id: string; participants: any[]; type: string }> {
    const response = await this.request(`/parents/children/${childId}/contact-instructor`, {
      method: 'POST',
      body: JSON.stringify(data),
    }) as any;
    return response.data || response;
  }

  // Get subscription details from user profile
  async getSubscription(): Promise<any> {
    const user = await this.getMe() as any;
    return user.subscription;
  }

  // Get generated child invites from user profile
  async getChildInvites(): Promise<any[]> {
    const user = await this.getMe() as any;
    return user.generatedChildInvites || [];
  }
}
