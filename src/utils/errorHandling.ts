/**
 * Utility functions for error handling across the application
 */

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

/**
 * Extracts a user-friendly error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    const err = error as any;
    
    // API error response
    if (err.response?.data?.error?.message) {
      return err.response.data.error.message;
    }
    
    if (err.response?.data?.message) {
      return err.response.data.message;
    }
    
    if (err.message) {
      return err.message;
    }
    
    // Network error
    if (err.name === 'NetworkError' || err.message?.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Timeout error
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return 'Request timed out. Please try again.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const err = error as any;
    const status = err.response?.status || err.status;
    
    // Retryable status codes
    const retryableStatuses = [408, 429, 500, 502, 503, 504];
    if (status && retryableStatuses.includes(status)) {
      return true;
    }
    
    // Network errors are retryable
    if (err.name === 'NetworkError' || err.message?.includes('network')) {
      return true;
    }
    
    // Timeout errors are retryable
    if (err.name === 'TimeoutError' || err.message?.includes('timeout')) {
      return true;
    }
  }
  
  return false;
}

/**
 * Gets error code from error
 */
export function getErrorCode(error: unknown): string | undefined {
  if (error && typeof error === 'object') {
    const err = error as any;
    return err.response?.data?.error?.code || err.code || err.response?.status?.toString();
  }
  return undefined;
}

/**
 * Gets HTTP status code from error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object') {
    const err = error as any;
    return err.response?.status || err.status;
  }
  return undefined;
}

/**
 * Checks if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
}

/**
 * Checks if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  const status = getErrorStatus(error);
  return status === 400;
}

/**
 * Formats API error for display
 */
export function formatApiError(error: unknown): ApiError {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  const status = getErrorStatus(error);
  
  let details: Record<string, any> = {};
  
  if (error && typeof error === 'object') {
    const err = error as any;
    if (err.response?.data?.error?.details) {
      details = err.response.data.error.details;
    } else if (err.response?.data?.details) {
      details = err.response.data.details;
    }
  }
  
  return {
    message,
    code,
    status,
    details,
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
  onRetry?: (attempt: number, error: unknown) => void
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (!isRetryableError(error)) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        const delay = initialDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

