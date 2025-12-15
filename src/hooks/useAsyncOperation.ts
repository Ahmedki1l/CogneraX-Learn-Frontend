import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { getErrorMessage, isRetryableError, retryWithBackoff, formatApiError } from '../utils/errorHandling';

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
  showToast?: boolean;
  retry?: boolean;
  maxRetries?: number;
  successMessage?: string;
  errorMessage?: string;
}

export function useAsyncOperation<T = any>(options: UseAsyncOperationOptions = {}) {
  const {
    onSuccess,
    onError,
    showToast = true,
    retry = false,
    maxRetries = 3,
    successMessage,
    errorMessage,
  } = options;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      // Cancel previous operation if still running
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);

      try {
        const operationWrapper = async () => {
          const result = await operation();
          
          // Check if operation was aborted
          if (abortControllerRef.current?.signal.aborted) {
            return null;
          }
          
          return result;
        };

        const result = retry
          ? await retryWithBackoff(
              operationWrapper,
              maxRetries,
              1000,
              (attempt, err) => {
                if (showToast) {
                  toast.info(`Retrying... (Attempt ${attempt}/${maxRetries})`);
                }
              }
            )
          : await operationWrapper();

        if (result === null) {
          // Operation was aborted
          return null;
        }

        setData(result);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        if (successMessage && showToast) {
          toast.success(successMessage);
        }

        return result;
      } catch (err: unknown) {
        const formattedError = formatApiError(err);
        const errorMsg = errorMessage || formattedError.message;
        
        setError(errorMsg);
        
        if (onError) {
          onError(err);
        }
        
        if (showToast) {
          if (isRetryableError(err)) {
            toast.error(`${errorMsg}. Please try again.`);
          } else {
            toast.error(errorMsg);
          }
        }

        return null;
      } finally {
        setLoading(false);
        abortControllerRef.current = null;
      }
    },
    [onSuccess, onError, showToast, retry, maxRetries, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setError(null);
    setData(null);
    setLoading(false);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  }, []);

  return {
    execute,
    loading,
    error,
    data,
    reset,
    cancel,
  };
}

