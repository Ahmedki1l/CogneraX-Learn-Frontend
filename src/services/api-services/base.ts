// Base API Configuration and Common Functionality
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Logger utility for production safety
const isDevelopment = (import.meta as any).env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) console.log(...args);
  },
  error: (...args: any[]) => {
    if (isDevelopment) {
      console.error(...args);
    } else {
      // Send to error tracking service (Sentry, etc.) in production
      // trackError(...args);
    }
  },
  warn: (...args: any[]) => {
    if (isDevelopment) console.warn(...args);
  },
};

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'instructor' | 'student';
  avatar?: string;
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
  role?: string;
  organizationId?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  token?: string;
  refreshToken?: string;
  user?: User;
}

export type ApiResponse<T = any> = T;

// Base API Service Class
export class BaseApiService {
  protected token: string | null = null;
  protected refreshToken: string | null = null;
  protected refreshPromise: Promise<boolean> | null = null;
  protected isRefreshing = false;
  protected failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  protected tokenRefreshTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadTokensFromStorage();
    this.scheduleTokenRefresh();
  }

  // Token Management
  protected loadTokensFromStorage(): void {
    this.token = localStorage.getItem('token');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  public setTokens(token: string, refreshToken: string): void {
    this.token = token;
    this.refreshToken = refreshToken;
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  }

  public clearTokens(): void {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }

  protected navigateToLogin(): void {
    // Save current URL for redirect after login
    const returnUrl = window.location.pathname + window.location.search;
    sessionStorage.setItem('returnUrl', returnUrl);
    
    // Dispatch logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
    
    // Clear tokens and redirect
    this.clearTokens();
    window.location.href = '/login';
  }

  // Queue Management
  protected processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Token Refresh
  protected async refreshAccessToken(): Promise<boolean> {
    if (this.isRefreshing) {
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshWithRetry();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  protected async refreshWithRetry(maxRetries = 3): Promise<boolean> {
    let lastError: any;

    for (let i = 0; i < maxRetries; i++) {
      try {
        if (!this.refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        if (!response.ok) throw new Error('Failed to refresh token');
        
        const jsonResponse = await response.json();
        if (jsonResponse.success && jsonResponse.token) {
          this.setTokens(jsonResponse.token, jsonResponse.refreshToken || this.refreshToken!);
          this.processQueue(null, jsonResponse.token);
          return true;
        }
        throw new Error('Invalid refresh response');
      } catch (error: any) {
        lastError = error;
        
        // Check if it's a network error
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, i) * 1000;
          logger.warn(`Refresh attempt ${i + 1} failed, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Non-network error, don't retry
          break;
        }
      }
    }

    // All retries failed
    logger.error('Token refresh failed after all retries:', lastError);
    this.processQueue(lastError, null);
    this.navigateToLogin();
    return false;
  }

  // Proactive Token Refresh
  protected scheduleTokenRefresh(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    // Schedule refresh 5 minutes before expiry
    const refreshTime = 10 * 60 * 1000; // 10 minutes in milliseconds
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken().then(success => {
        if (success) {
          logger.log('Token refreshed proactively');
          this.notifyTokenStatus('refreshed');
        } else {
          logger.error('Proactive token refresh failed');
          this.notifyTokenStatus('failed');
        }
      });
    }, refreshTime);
  }

  protected notifyTokenStatus(status: 'refreshed' | 'failed' | 'expired'): void {
    window.dispatchEvent(new CustomEvent('auth:token-status', { 
      detail: { status } 
    }));
  }

  // Request Method
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    skipAuth = false
  ): Promise<T> {
    // Ensure we have a valid token for authenticated requests
    if (!skipAuth) {
      const tokenValid = await this.ensureValidToken();
      if (!tokenValid) {
        throw new Error('Authentication required');
      }
    }

    // Don't set Content-Type for FormData - browser sets it with boundary automatically
    const isFormData = options.body instanceof FormData;
    
    const config: RequestInit = {
      ...options,
      headers: {
        // Only set Content-Type for non-FormData requests
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(this.token && !skipAuth && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    let response: Response;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount <= maxRetries) {
      try {
        response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const jsonResponse = await response.json();

        if (!response.ok) {
          throw jsonResponse;
        }

        // Auto-extract data property from backend response
        if (jsonResponse.success && jsonResponse.data !== undefined) {
          return jsonResponse.data;
        }
        
        // Handle responses without data property (like simple success messages)
        return jsonResponse;
      } catch (error: any) {
        // Handle 401 errors (unauthorized)
        if (error.status === 401 || error.message?.includes('401')) {
          if (retryCount === 0) {
            // Try to refresh token once
            const refreshed = await this.refreshAccessToken();
            
            if (refreshed) {
              // Update authorization header with new token
              config.headers = {
                ...config.headers,
                Authorization: `Bearer ${this.token}`,
              };
              retryCount++;
              continue;
            }
          }
          
          this.navigateToLogin();
          throw error;
        }

        // Handle network errors with retry
        if (error.message?.includes('fetch') || error.message?.includes('network') || error.message?.includes('Failed to fetch')) {
          if (retryCount < maxRetries) {
            const delay = Math.pow(2, retryCount) * 1000;
            logger.warn(`Request failed, retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries + 1})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            retryCount++;
            continue;
          }
        }

        throw error;
      }
    }

    throw new Error('Request failed after all retries');
  }

  protected async ensureValidToken(): Promise<boolean> {
    // If no token but localStorage has one, reload from storage
    if (!this.token && localStorage.getItem('token')) {
      this.loadTokensFromStorage();
    }

    if (!this.token) {
      this.navigateToLogin();
      return false;
    }

    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(this.token.split('.')[1]));
      const now = Date.now() / 1000;
      
      if (payload.exp && payload.exp < now) {
        logger.warn('Token expired, attempting refresh...');
        const refreshed = await this.refreshAccessToken();
        if (!refreshed) {
          this.notifyTokenStatus('expired');
          return false;
        }
        this.notifyTokenStatus('refreshed');
      }
    } catch (error) {
      logger.error('Error checking token validity:', error);
      return false;
    }

    return true;
  }

  // Public method to manually refresh token
  async refreshAccessTokenManually(): Promise<boolean> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    return this.refreshAccessToken();
  }

  // Initialize authentication
  async initializeAuth(): Promise<User | null> {
    if (!this.token || !this.refreshToken) {
      return null;
    }

    try {
      const isValid = await this.ensureValidToken();
      if (!isValid) {
        return null;
      }

      // Verify token with server and get user data
      const userData = await this.getMe();
      return userData;
    } catch (error) {
      logger.error('Token refresh failed during initialization:', error);
      this.clearTokens();
      return null;
    }
  }

  // Get current user
  async getMe(): Promise<User> {
    // Use the request method to ensure proper authentication handling
    return this.request('/auth/me');
  }
}

export { API_BASE_URL };
