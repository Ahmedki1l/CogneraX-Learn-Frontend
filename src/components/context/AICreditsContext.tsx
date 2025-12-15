import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api } from '../../services/api';

interface AICreditsContextValue {
  balance: number | null;
  summary: {
    available?: number;
    remaining?: number;
    used?: number;
    total?: number;
    [key: string]: any;
  } | null;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  refresh: () => Promise<void>;
}

const AICreditsContext = createContext<AICreditsContextValue | undefined>(
  undefined,
);

const SUPPORTED_ROLES = new Set(['admin', 'instructor']);

const extractRemainingCredits = (payload: any): number | null => {
  if (!payload || typeof payload !== 'object') return null;
  if (typeof payload.remaining === 'number') return payload.remaining;
  if (typeof payload.available === 'number') return payload.available;
  if (typeof payload.balance === 'number') return payload.balance;
  if (
    typeof payload.total === 'number' &&
    typeof payload.used === 'number'
  ) {
    return payload.total - payload.used;
  }
  if (payload.data) {
    return extractRemainingCredits(payload.data);
  }
  return null;
};

interface AICreditsProviderProps {
  user?: any;
  children: React.ReactNode;
}

export const AICreditsProvider: React.FC<AICreditsProviderProps> = ({
  user,
  children,
}) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const role = user?.role;
    if (!role || !SUPPORTED_ROLES.has(role)) {
      setBalance(null);
      setSummary(null);
      setError(null);
      setLoading(false);
      setLastUpdated(Date.now());
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.ai.getAICreditsBalance();
      const details = response?.data && typeof response.data === 'object' ? response.data : response;
      const remaining = extractRemainingCredits(details);
      setBalance(
        typeof remaining === 'number' && Number.isFinite(remaining)
          ? remaining
          : 0,
      );
      setSummary(typeof details === 'object' ? details : null);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error('Failed to refresh AI credits balance:', err);
      setError('Unable to load AI credits');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<AICreditsContextValue>(
    () => ({
      balance,
      summary,
      loading,
      error,
      lastUpdated,
      refresh,
    }),
    [balance, summary, loading, error, lastUpdated, refresh],
  );

  return (
    <AICreditsContext.Provider value={value}>
      {children}
    </AICreditsContext.Provider>
  );
};

export const useAICredits = (): AICreditsContextValue => {
  const context = useContext(AICreditsContext);
  if (!context) {
    throw new Error('useAICredits must be used within an AICreditsProvider');
  }
  return context;
};

