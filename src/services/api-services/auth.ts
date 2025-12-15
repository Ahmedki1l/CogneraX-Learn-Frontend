import { BaseApiService, LoginCredentials, RegisterData, User, API_BASE_URL } from './base';

export class AuthApiService extends BaseApiService {
  // Login
  async login(credentials: LoginCredentials): Promise<User> {
    console.log('API login attempt with:', credentials);
    console.log('API_BASE_URL:', API_BASE_URL);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      console.log('Login response status:', response.status);
      const jsonResponse = await response.json();
      console.log('Login response data:', jsonResponse);

      if (!response.ok) {
        console.log('Login failed with status:', response.status);
        throw jsonResponse;
      }

      if (jsonResponse.success && jsonResponse.user && jsonResponse.token) {
        const { user, token, refreshToken } = jsonResponse;
        console.log('Login successful, storing tokens');
        // Clear old cached user data to prevent stale role information
        localStorage.removeItem('user');
        this.setTokens(token, refreshToken || token);
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }

      throw new Error('Invalid response format');
    } catch (error) {
      console.log('API login error:', error);
      throw error;
    }
  }

  // Register
  async register(data: RegisterData): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const jsonResponse = await response.json();

    if (!response.ok) {
      throw jsonResponse;
    }

    if (jsonResponse.success && jsonResponse.user && jsonResponse.token) {
      const { user, token, refreshToken } = jsonResponse;
      this.setTokens(token, refreshToken || token);
      localStorage.setItem('user', JSON.stringify(user));
      return user;
    }

    throw new Error('Invalid response format');
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearTokens();
      window.dispatchEvent(new CustomEvent('auth:logout'));
    }
  }

  // Forgot Password
  async forgotPassword(email: string): Promise<void> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Reset Password
  async resetPassword(token: string, password: string): Promise<void> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  // Change Password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  // Verify Email
  async verifyEmail(token: string): Promise<void> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Resend Verification Email
  async resendVerificationEmail(): Promise<void> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
    });
  }

  // Enable 2FA
  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    return this.request('/auth/2fa/enable', {
      method: 'POST',
    });
  }

  // Verify 2FA Setup
  async verify2FASetup(token: string): Promise<void> {
    return this.request('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  // Disable 2FA
  async disable2FA(password: string): Promise<void> {
    return this.request('/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  // Get 2FA Status
  async get2FAStatus(): Promise<{ enabled: boolean; backupCodes?: string[] }> {
    return this.request('/auth/2fa/status');
  }

  // Generate Backup Codes
  async generateBackupCodes(): Promise<{ codes: string[] }> {
    return this.request('/auth/2fa/backup-codes', {
      method: 'POST',
    });
  }

  // Refresh token (using correct endpoint)
  async refreshSessionToken(): Promise<{ token: string; refreshToken: string }> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }

  // Verify email with token
  async verifyEmailWithToken(token: string): Promise<void> {
    return this.request(`/auth/verify-email/${token}`, {
      method: 'POST',
    });
  }

  // Update password
  async updatePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    return this.request('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Register with invitation (public endpoint, no auth required)
  async registerWithInvitation(data: {
    name: string;
    email: string;
    password: string;
    invitationToken: string;
  }): Promise<any> {
    // Skip authentication for invitation registration
    return this.request('/auth/register/invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true); // skipAuth = true
  }
}
