import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';
import { AICreditsResponse, AICreditsEntry } from '../../interfaces/parent.types';

export function AICreditsMonitor() {
  const { t, isRTL } = useLanguage();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  
  const [credits, setCredits] = useState<AICreditsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadCredits();
    }
  }, [childId]);

  const loadCredits = async () => {
    if (!childId) return;
    
    try {
      setIsLoading(true);
      const data = await api.parent.getChildAICredits(childId);
      setCredits(data);
    } catch (error) {
      console.error('Error loading AI credits:', error);
      toast.error(t('aiCreditsMonitor.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!credits) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">{t('aiCreditsMonitor.notFound')}</p>
        <Button onClick={() => navigate('/parent/dashboard')} className="mt-4">
          {t('aiCreditsMonitor.backToDashboard')}
        </Button>
      </div>
    );
  }

  const usagePercentage = credits.aiCredits.total > 0 
    ? (credits.aiCredits.available / credits.aiCredits.total) * 100 
    : 0;

  return (
    <div className={`p-6 max-w-4xl mx-auto space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate(`/parent/child/${childId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('aiCreditsMonitor.title')}
          </h1>
          <p className="text-gray-600">
            {credits.student.name} • {credits.student.email}
          </p>
        </div>
      </div>

      {/* Credit Balance Card */}
      <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm">{t('aiCreditsMonitor.availableCredits')}</p>
              <p className="text-4xl font-bold mt-1">
                {credits.aiCredits.available.toLocaleString()}
              </p>
              <p className="text-white/70 text-sm mt-1">
                {t('aiCreditsMonitor.of')} {credits.aiCredits.total.toLocaleString()} {t('aiCreditsMonitor.total')}
              </p>
            </div>
            
            <div className="relative w-32 h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="white"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${usagePercentage * 3.52} 352`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-10 w-10" />
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/20 grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/70 text-sm">{t('aiCreditsMonitor.used')}</p>
              <p className="text-xl font-semibold">{credits.aiCredits.used.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-white/70 text-sm">{t('aiCreditsMonitor.remaining')}</p>
              <p className="text-xl font-semibold">{Math.round(usagePercentage)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-gray-500" />
            {t('aiCreditsMonitor.recentUsage')}
          </CardTitle>
          <CardDescription>{t('aiCreditsMonitor.recentUsageDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          {credits.aiCredits.history.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">{t('aiCreditsMonitor.noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credits.aiCredits.history.slice(0, 20).map((entry, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      entry.type === 'earned' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {entry.type === 'earned' ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{entry.description}</p>
                      <p className="text-sm text-gray-500">{formatDate(entry.createdAt)}</p>
                    </div>
                  </div>
                  
                  <Badge 
                    variant="outline"
                    className={entry.type === 'earned' 
                      ? 'text-green-600 border-green-600' 
                      : 'text-red-600 border-red-600'
                    }
                  >
                    {entry.type === 'earned' ? '+' : '-'}{entry.amount}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
