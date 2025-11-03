import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { useLanguage } from '../context/LanguageContext';
import { 
  Clock, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle,
  Flag,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface Question {
  id: string;
  _id?: string;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'true-false' | 'fill-in-the-blank' | 'matching' | 'mcq' | 'code_completion';
  question: string;
  options?: string[];
  correctAnswer?: string | number;
  points: number;
  timeLimit?: number;
  order?: number;
}

interface Quiz {
  id: string;
  _id?: string;
  quizId?: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  totalPoints: number;
  questions: Question[];
  allowReview?: boolean;
  shuffleQuestions?: boolean;
  randomizeQuestions?: boolean;
  showResults?: boolean;
  showAnswers?: boolean;
  attemptNumber?: number;
  antiCheating?: {
    enabled: boolean;
    fullscreenRequired: boolean;
    preventTabSwitch: boolean;
    shuffleOptions: boolean;
  };
}

interface QuizTakingProps {
  user: any;
  quizId?: string;
  onComplete: (results: any) => void;
  onNavigateBack: () => void;
}

export function QuizTaking({ user, quizId, onComplete, onNavigateBack }: QuizTakingProps) {
  const { t, language } = useLanguage();
  
  // Quiz state
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);
  
  // Cheating detection
  const [suspiciousActivity, setSuspiciousActivity] = useState<string[]>([]);
  const [cheatingIncidents, setCheatingIncidents] = useState<any[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  const [fullscreenExitCount, setFullscreenExitCount] = useState(0);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<Date>();
  
  // Fetch quiz from backend
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!quizId) return;
      
      setLoading(true);
      try {
        const response = await api.quiz.startQuiz(quizId);
        console.log('📝 Quiz response:', response);

        // Extract data from response wrapper
        if (response && response.success && response.data) {
          const quizData = response.data;
          setQuiz({
            id: quizData.quizId || quizId,
            _id: quizData.quizId,
            quizId: quizData.quizId,
            title: quizData.title,
            description: quizData.description || '',
            timeLimit: quizData.timeLimit || 30,
            totalPoints: quizData.totalPoints || 100,
            questions: quizData.questions.map((q: any) => ({
              id: q._id || q.id,
              _id: q._id,
              type: q.type,
              question: q.question,
              options: q.options || [],
              points: q.points || 1,
              order: q.order
            })),
            attemptNumber: quizData.attemptNumber || 1,
            showAnswers: quizData.showAnswers !== false,
            antiCheating: quizData.antiCheating || {
              enabled: false,
              fullscreenRequired: false,
              preventTabSwitch: false,
              shuffleOptions: false
            }
          });
          
          setTimeRemaining((quizData.timeLimit || 30) * 60); // Convert to seconds
          startTimeRef.current = new Date();
        } else {
          console.warn('⚠️ No quiz data or invalid response structure');
          setQuiz(null);
        }
      } catch (error: any) {
        console.error('Failed to fetch quiz:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Quiz endpoint not implemented yet');
          setQuiz(null);
        } else {
          toast.error('Failed to load quiz');
          setQuiz(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);
  
  // Mock quiz data
  const getMockQuiz = (): Quiz => ({
    id: quizId || 'quiz-1',
    title: 'JavaScript Fundamentals Quiz',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and objects.',
    timeLimit: 30, // 30 minutes
    totalPoints: 100,
    allowReview: true,
    shuffleQuestions: false,
    showResults: true,
    questions: [
      {
        id: 'q1',
        type: 'mcq',
        question: 'What is the correct way to declare a variable in JavaScript?',
        options: ['var myVar = 5;', 'variable myVar = 5;', 'v myVar = 5;', 'declare myVar = 5;'],
        correctAnswer: 'var myVar = 5;',
        points: 2
      },
      {
        id: 'q2',
        type: 'true_false',
        question: 'JavaScript is a statically typed language.',
        correctAnswer: 'false',
        points: 1
      },
      {
        id: 'q3',
        type: 'short_answer',
        question: 'What does DOM stand for?',
        correctAnswer: 'Document Object Model',
        points: 3
      },
      {
        id: 'q4',
        type: 'code_completion',
        question: 'Complete the function to return the sum of two numbers:\n\nfunction addNumbers(a, b) {\n  return ______;\n}',
        correctAnswer: 'a + b',
        points: 3
      },
      {
        id: 'q5',
        type: 'mcq',
        question: 'Which method is used to add an element to the end of an array?',
        options: ['push()', 'pop()', 'shift()', 'unshift()'],
        correctAnswer: 'push()',
        points: 2
      }
    ]
  });

  // Initialize quiz (only if not already fetched)
  useEffect(() => {
    if (!quiz && !loading) {
      const mockQuiz = getMockQuiz();
      setQuiz(mockQuiz);
      setTimeRemaining(mockQuiz.timeLimit * 60); // Convert to seconds
    }
  }, [quiz, loading]);

  // Timer effect
  useEffect(() => {
    if (quizStarted && !quizCompleted && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [quizStarted, quizCompleted, timeRemaining]);

  // Cheating detection effects
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && quizStarted && !quizCompleted) {
        setTabSwitchCount(prev => prev + 1);
        setSuspiciousActivity(prev => [...prev, `${t('quiz.suspicious.tabSwitch')} - ${new Date().toLocaleTimeString()}`]);
        toast.warning(t('quiz.warning.tabSwitch'));
      }
    };

    const handleWindowFocus = () => {
      setIsWindowFocused(true);
    };

    const handleWindowBlur = () => {
      if (quizStarted && !quizCompleted) {
        setIsWindowFocused(false);
        setSuspiciousActivity(prev => [...prev, `${t('quiz.suspicious.windowBlur')} - ${new Date().toLocaleTimeString()}`]);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && quizStarted && !quizCompleted) {
        setFullscreenExitCount(prev => prev + 1);
        setSuspiciousActivity(prev => [...prev, `${t('quiz.suspicious.fullscreenExit')} - ${new Date().toLocaleTimeString()}`]);
        toast.warning(t('quiz.warning.fullscreen'));
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (quizStarted && !quizCompleted) {
        e.preventDefault();
        setSuspiciousActivity(prev => [...prev, `${t('quiz.suspicious.rightClick')} - ${new Date().toLocaleTimeString()}`]);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (quizStarted && !quizCompleted) {
        // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u') ||
          (e.ctrlKey && e.shiftKey && e.key === 'C')
        ) {
          e.preventDefault();
          setSuspiciousActivity(prev => [...prev, `${t('quiz.suspicious.devTools')} - ${new Date().toLocaleTimeString()}`]);
          toast.warning(t('quiz.warning.devTools'));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [quizStarted, quizCompleted, t]);

  const startQuiz = async () => {
    try {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (error) {
    }
    
    setQuizStarted(true);
    startTimeRef.current = new Date();
    toast.success(t('quiz.started'));
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleAutoSubmit = () => {
    toast.info(t('quiz.timeUp'));
    submitQuiz();
  };

  const submitQuiz = async () => {
    setIsSubmitting(true);
    
    try {
      if (!quiz || !startTimeRef.current) return;
      
      // Prepare answers for submission
      const submissionAnswers = quiz.questions.map((question, index) => ({
        questionId: question._id || question.id,
        answer: answers[question.id] || '',
        timeSpent: 0 // Could track per-question time if needed
      }));
      
      // Submit to backend
      try {
        const response = await api.quiz.submitQuiz(quiz.quizId || quiz.id, {
          answers: submissionAnswers,
          startedAt: startTimeRef.current.toISOString(),
          cheatingIncidents: cheatingIncidents
        });
        
        console.log('📝 Submit quiz response:', response);
        
        if (response && response.success && response.data) {
          const results = {
            ...response.data,
            totalQuestions: quiz.questions.length,
            suspiciousActivity: cheatingIncidents.length
          };
          
          setQuizResults(results);
          setQuizCompleted(true);
          onComplete(results);
          toast.success('Quiz submitted successfully!');
        } else {
          console.warn('⚠️ Quiz submission failed or invalid response');
          toast.error('Failed to submit quiz');
        }
      } catch (apiError: any) {
        console.error('API submission failed:', apiError);
        
        // Handle missing endpoint gracefully
        if (apiError.status === 401 || apiError.status === 404) {
          console.warn('⚠️ Quiz submission endpoint not implemented yet');
          toast.info('Quiz submission feature coming soon');
        } else {
          // Fallback to local calculation
          const results = calculateResults();
          setQuizResults(results);
          setQuizCompleted(true);
          onComplete(results);
          toast.success('Quiz completed (offline mode)');
        }
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateResults = () => {
    if (!quiz) return null;
    
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    quiz.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer && userAnswer.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim()) {
        correctAnswers++;
        earnedPoints += question.points;
      }
    });
    
    const percentage = (earnedPoints / totalPoints) * 100;
    const timeTaken = startTimeRef.current ? Math.floor((Date.now() - startTimeRef.current.getTime()) / 1000) : 0;
    
    return {
      quizId: quiz.id,
      correctAnswers,
      totalQuestions: quiz.questions.length,
      earnedPoints,
      totalPoints,
      percentage: Math.round(percentage),
      timeTaken,
      suspiciousActivity,
      tabSwitchCount,
      fullscreenExitCount
    };
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id] || '';
    
    switch (question.type) {
      case 'mcq':
        return (
          <RadioGroup value={userAnswer} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            {question.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                <Label htmlFor={`${question.id}-${index}`} className="cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case 'true_false':
        return (
          <RadioGroup value={userAnswer} onValueChange={(value) => handleAnswerChange(question.id, value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${question.id}-true`} />
              <Label htmlFor={`${question.id}-true`} className="cursor-pointer">
                {t('quiz.true')}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${question.id}-false`} />
              <Label htmlFor={`${question.id}-false`} className="cursor-pointer">
                {t('quiz.false')}
              </Label>
            </div>
          </RadioGroup>
        );
      
      case 'short_answer':
        return (
          <Input
            value={userAnswer}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder={t('quiz.shortAnswerPlaceholder')}
            className="w-full"
          />
        );
      
      case 'code_completion':
        return (
          <div className="space-y-4">
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{question.question}</code>
            </pre>
            <Textarea
              value={userAnswer}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder={t('quiz.codeCompletionPlaceholder')}
              className="font-mono"
              rows={3}
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>{t('quiz.loading')}</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{quiz.title}</CardTitle>
            <p className="text-muted-foreground">{quiz.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-gray-50 rounded-lg">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t('quiz.timeLimit')}</p>
                <p className="font-semibold">{quiz.timeLimit} {t('quiz.minutes')}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t('quiz.questions')}</p>
                <p className="font-semibold">{quiz.questions.length}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <Flag className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">{t('quiz.totalPoints')}</p>
                <p className="font-semibold">{quiz.questions.reduce((sum, q) => sum + q.points, 0)}</p>
              </div>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {t('quiz.instructions')}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-4">
              <Button variant="outline" onClick={onNavigateBack} className="flex-1">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.back')}
              </Button>
              <Button onClick={startQuiz} className="flex-1">
                {t('quiz.startQuiz')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (quizCompleted) {
    const results = calculateResults();
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{t('quiz.completed')}</CardTitle>
            <p className="text-muted-foreground">{t('quiz.results')}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {results && (
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('quiz.score')}</p>
                  <p className="text-2xl font-bold text-primary">{results.percentage}%</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">{t('quiz.correctAnswers')}</p>
                  <p className="text-2xl font-bold">{results.correctAnswers}/{results.totalQuestions}</p>
                </div>
              </div>
            )}
            
            {suspiciousActivity.length > 0 && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  {t('quiz.suspiciousActivityDetected')}: {suspiciousActivity.length} {t('quiz.incidents')}
                </AlertDescription>
              </Alert>
            )}
            
            <Button onClick={onNavigateBack} className="w-full">
              {t('common.backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with timer and progress */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">{quiz.title}</h1>
              <Badge variant="outline">
                {currentQuestionIndex + 1} / {quiz.questions.length}
              </Badge>
            </div>
            
            <div className="flex items-center gap-4">
              {!isWindowFocused && (
                <Badge variant="destructive" className="animate-pulse">
                  <EyeOff className="h-3 w-3 mr-1" />
                  {t('quiz.notFocused')}
                </Badge>
              )}
              
              {suspiciousActivity.length > 0 && (
                <Badge variant="secondary">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {suspiciousActivity.length}
                </Badge>
              )}
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className={`font-mono ${timeRemaining < 300 ? 'text-red-600' : 'text-primary'}`}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      {/* Question content */}
      <div className="max-w-4xl mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {t('quiz.question')} {currentQuestionIndex + 1}
              </CardTitle>
              <Badge variant="outline">
                {currentQuestion.points} {t('quiz.points')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-lg whitespace-pre-wrap">
              {currentQuestion.question}
            </div>
            
            {renderQuestion(currentQuestion)}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('quiz.previous')}
          </Button>
          
          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              onClick={submitQuiz}
              disabled={isSubmitting}
              className="min-w-32"
            >
              {isSubmitting ? t('quiz.submitting') : t('quiz.submit')}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(quiz.questions.length - 1, prev + 1))}
            >
              {t('quiz.next')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
        
        {/* Question navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">{t('quiz.questionOverview')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {quiz.questions.map((_, index) => (
                <Button
                  key={index}
                  variant={index === currentQuestionIndex ? "default" : answers[quiz.questions[index].id] ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setCurrentQuestionIndex(index)}
                  className="aspect-square p-0"
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}