// User Types
export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  avatar?: string;
  avatarUrl?: string;
  status?: string;
  isEmailVerified?: boolean;
  organization?: any;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
  adminData?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'instructor' | 'student';
  organizationId?: string;
}

