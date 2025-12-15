import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Flag,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage, isRetryableError } from '../../utils/errorHandling';
import type { Exam, ExamSession, ExamQuestion, ExamSection } from '../../interfaces/exam.types';
import { useLanguage } from '../context/LanguageContext';

interface ExamTakingProps {
  user?: any;
}

export function ExamTaking({ user }: ExamTakingProps) {
  const { id: examId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [exam, setExam] = useState<Exam | null>(null);
  const [session, setSession] = useState<ExamSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [autoSaveInterval, setAutoSaveInterval] = useState<NodeJS.Timeout | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examId) {
      startExam();
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
      }
    };
  }, [examId]);

  useEffect(() => {
    if (timeRemaining > 0 && session) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            handleAutoSubmit();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeRemaining, session]);

  useEffect(() => {
    // Auto-save every 30 seconds
    if (session && examId) {
      const interval = setInterval(() => {
        saveProgress();
      }, 30000); // 30 seconds
      setAutoSaveInterval(interval);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [session, examId, answers]);

  const startExam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.exam.startExam(examId!);
      const { session: newSession, exam: examData } = (response as any)?.data || response;
      
      setSession(newSession);
      setExam(examData);
      setTimeRemaining(newSession.timeRemaining || examData.duration * 60);
      
      toast.success(t('examTaking.started'));
    } catch (error: any) {
      console.error('Failed to start exam:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('examTaking.failedToStart'));
      navigate('/exam-schedule');
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = async (showRetry: boolean = false) => {
    if (!session || !examId) return;
    
    try {
      setSaveError(null);
      await api.exam.saveExamProgress(examId, session.id, {
        answers,
        currentQuestionIndex: getGlobalQuestionIndex(),
        timeRemaining,
      });
      setRetryCount(0);
      // Silent save - don't show toast every time
    } catch (error) {
      console.error('Failed to save progress:', error);
      const formattedError = formatApiError(error);
      setSaveError(formattedError.message);
      
      if (showRetry && isRetryableError(error)) {
        const newRetryCount = retryCount + 1;
        setRetryCount(newRetryCount);
        if (newRetryCount < 3) {
          setTimeout(() => saveProgress(true), 2000 * newRetryCount); // Exponential backoff
        } else {
          toast.error(`Failed to save progress after ${newRetryCount} attempts: ${formattedError.message}. Please check your connection.`);
        }
      }
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
    // Save immediately on answer change
    setTimeout(() => {
      saveProgress();
    }, 500);
  };

  const getGlobalQuestionIndex = (): number => {
    if (!exam) return 0;
    let index = 0;
    for (let i = 0; i < currentSectionIndex; i++) {
      index += exam.sections[i]?.questions.length || 0;
    }
    return index + currentQuestionIndex;
  };

  const getAllQuestions = (): Array<{ question: ExamQuestion; sectionIndex: number; questionIndex: number; globalIndex: number }> => {
    if (!exam) return [];
    const allQuestions: Array<{ question: ExamQuestion; sectionIndex: number; questionIndex: number; globalIndex: number }> = [];
    let globalIndex = 0;
    
    exam.sections.forEach((section, sIdx) => {
      section.questions.forEach((question, qIdx) => {
        allQuestions.push({
          question,
          sectionIndex: sIdx,
          questionIndex: qIdx,
          globalIndex: globalIndex++,
        });
      });
    });
    
    return allQuestions;
  };

  const navigateToQuestion = (sectionIdx: number, questionIdx: number) => {
    setCurrentSectionIndex(sectionIdx);
    setCurrentQuestionIndex(questionIdx);
  };

  const navigateToGlobalIndex = (globalIdx: number) => {
    const allQuestions = getAllQuestions();
    if (allQuestions[globalIdx]) {
      const { sectionIndex, questionIndex } = allQuestions[globalIdx];
      navigateToQuestion(sectionIndex, questionIndex);
    }
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else if (currentSectionIndex > 0) {
      setCurrentSectionIndex(prev => prev - 1);
      const prevSection = exam?.sections[currentSectionIndex - 1];
      setCurrentQuestionIndex(prevSection?.questions.length ? prevSection.questions.length - 1 : 0);
    }
  };

  const goToNext = () => {
    const currentSection = exam?.sections[currentSectionIndex];
    if (!currentSection) return;
    
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else if (currentSectionIndex < (exam?.sections.length || 0) - 1) {
      setCurrentSectionIndex(prev => prev + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const toggleFlag = (questionId: string) => {
    setFlaggedQuestions(prev => {
      const newFlags = new Set(prev);
      if (newFlags.has(questionId)) {
        newFlags.delete(questionId);
      } else {
        newFlags.add(questionId);
      }
      return newFlags;
    });
  };

  const handleAutoSubmit = async () => {
    if (!session || !examId) return;
    
    try {
      await submitExam();
      toast.info(t('examTaking.timeExpired'));
    } catch (error) {
      console.error('Failed to auto-submit:', error);
    }
  };

  const submitExam = async () => {
    if (!session || !examId) {
      toast.error(t('examTaking.noActiveSession'));
      return;
    }

    if (!confirm(t('examTaking.confirmSubmit'))) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await saveProgress(); // Final save before submit
      
      const response = await api.exam.submitExam(examId, {
        sessionId: session.id,
        answers,
        submittedAt: new Date().toISOString(),
      });
      
      toast.success(t('examTaking.submitted'));
      navigate(`/exam-grades`);
    } catch (error: any) {
      console.error('Failed to submit exam:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      
      if (isRetryableError(error)) {
        toast.error(`${formattedError.message}. ${t('examTaking.retry')}`);
      } else {
        toast.error(formattedError.message || t('examTaking.failedToSubmit'));
      }
    } finally {
      setLoading(false);
      setShowSubmitDialog(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!exam) return 0;
    const totalQuestions = exam.questionCount;
    const answeredQuestions = Object.keys(answers).length;
    return totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  };

  if (loading && !exam) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-lg font-medium mb-2">{t('examTaking.loading')}</div>
            <div className="text-sm text-gray-500">{t('examTaking.pleaseWait')}</div>
          </div>
        </div>
      </ErrorBoundary>
    );
  }

  if (!exam || !session) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center min-h-screen">
          <Card className="max-w-md">
            <CardContent className="py-8 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">{t('examTaking.examNotFound')}</h2>
              <p className="text-gray-600 mb-4">
                {error || t('examTaking.unableToLoad')}
              </p>
              <div className="flex gap-2 justify-center">
                <Button onClick={() => navigate('/exam-schedule')}>{t('examTaking.backToSchedule')}</Button>
                {error && (
                  <Button variant="outline" onClick={startExam}>
                    {t('examTaking.retry')}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  const currentSection = exam.sections[currentSectionIndex];
  const currentQuestion = currentSection?.questions[currentQuestionIndex];
  const allQuestions = getAllQuestions();
  // Fallback to calculating total questions if questionCount is 0 or undefined
  const totalQuestions = exam.questionCount || exam.sections.reduce((acc, section) => acc + (section.questions?.length || 0), 0);
  const answeredCount = Object.keys(answers).length;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Save Error Indicator */}
        {saveError && (
          <div className="bg-red-50 border-b border-red-200 px-4 py-2 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{t('examTaking.saveError')} {saveError}</span>
              </div>
              <Button variant="outline" size="sm" onClick={() => saveProgress(true)} className="h-8 bg-white border-red-200 text-red-700 hover:bg-red-50">
                <Save className={`h-3 w-3 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {t('examTaking.retrySave')}
              </Button>
            </div>
          </div>
        )}
        
        {/* Professional Header */}
        <header className="bg-white border-b shadow-sm sticky top-0 z-40 h-16">
          <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between">
             <div className="flex items-center gap-4">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                  C
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 leading-tight line-clamp-1">{exam.title}</h1>
                  <p className="text-xs text-gray-500 font-medium">
                    {currentSection?.title} &bull; {t('examTaking.question')} {getGlobalQuestionIndex() + 1} {t('examTaking.of')} {totalQuestions}
                  </p>
                </div>
             </div>

             <div className="flex items-center gap-6">
                <div className="hidden md:block w-48">
                   <div className="flex justify-between text-xs mb-1 font-medium text-gray-500">
                      <span>{t('examTaking.progress')}</span>
                      <span>{Math.round(getProgress())}%</span>
                   </div>
                   <Progress value={getProgress()} className="h-2 bg-gray-100" />
                </div>

                <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                  <Clock className={`h-4 w-4 ${timeRemaining < 300 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`} />
                  <span className={`font-mono text-lg font-bold ${timeRemaining < 300 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                
                <Button 
                   variant="default" 
                   size="sm" 
                   onClick={() => setShowSubmitDialog(true)}
                   className="bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  {t('examTaking.submitExam')}
                </Button>
             </div>
          </div>
        </header>

        {/* Main Layout */}
        <div className="flex-1 max-w-[1600px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-[calc(100vh-64px)] overflow-hidden">
          
          {/* Main Question Area (Left/Center) */}
          <div className="lg:col-span-9 h-full flex flex-col min-h-0">
             <ScrollArea className="flex-1 pr-4">
                <div className="max-w-3xl mx-auto pb-10">
                   {currentQuestion ? (
                     <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Question Card */}
                        <Card className="border-none shadow-md overflow-hidden bg-white">
                          <div className="border-b bg-gray-50/50 px-6 py-4 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                 <Badge variant="secondary" className="bg-white border-gray-200 text-gray-700 shadow-sm">
                                   Q{getGlobalQuestionIndex() + 1}
                                 </Badge>
                                 <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase tracking-wider text-[10px] font-bold">
                                   {currentQuestion.type.replace('-', ' ')}
                                 </Badge>
                                 <Badge variant="outline" className="text-gray-500 font-normal">
                                   {currentQuestion.points} {t('examTaking.points')}
                                 </Badge>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleFlag(currentQuestion.id)}
                                className={`text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 ${flaggedQuestions.has(currentQuestion.id) ? 'text-yellow-600 bg-yellow-50' : ''}`}
                              >
                                <Flag className={`h-4 w-4 ${isRTL ? 'ml-1.5' : 'mr-1.5'} ${flaggedQuestions.has(currentQuestion.id) ? 'fill-current' : ''}`} />
                                {flaggedQuestions.has(currentQuestion.id) ? t('examTaking.flagged') : t('examTaking.flagForReview')}
                              </Button>
                          </div>
                          
                          <CardContent className="p-8">
                             <div className="prose prose-lg max-w-none text-gray-800 mb-8 font-medium leading-relaxed">
                                {currentQuestion.question}
                             </div>

                             {/* Answer Area */}
                             <div className="space-y-4">
                                {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                                  <RadioGroup
                                    value={answers[currentQuestion.id]?.toString() || ''}
                                    onValueChange={(value: string) => handleAnswerChange(currentQuestion.id, parseInt(value))}
                                    className="gap-3"
                                  >
                                    {currentQuestion.options.map((option, idx) => {
                                      const isSelected = answers[currentQuestion.id] === idx;
                                      return (
                                        <div key={idx}>
                                          <RadioGroupItem value={idx.toString()} id={`option-${idx}`} className="sr-only" />
                                          <Label 
                                            htmlFor={`option-${idx}`} 
                                            className={`
                                              flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                              ${isSelected 
                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                              }
                                            `}
                                          >
                                            <div className={`
                                              h-8 w-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                              ${isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300 text-gray-500 group-hover:border-blue-300'}
                                            `}>
                                               {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`text-base flex-1 ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                              {option}
                                            </span>
                                            {isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}
                                          </Label>
                                        </div>
                                      );
                                    })}
                                  </RadioGroup>
                                )}

                                {currentQuestion.type === 'true-false' && (
                                  <RadioGroup
                                    value={answers[currentQuestion.id]?.toString() || ''}
                                    onValueChange={(value: string) => handleAnswerChange(currentQuestion.id, value === 'true')}
                                    className="gap-3"
                                  >
                                    {['true', 'false'].map((val) => {
                                      const isTrue = val === 'true';
                                      const isSelected = answers[currentQuestion.id] === isTrue;
                                      return (
                                        <div key={val}>
                                          <RadioGroupItem value={val} id={`opt-${val}`} className="sr-only" />
                                          <Label 
                                            htmlFor={`opt-${val}`} 
                                            className={`
                                              flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group
                                              ${isSelected 
                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                                                : 'border-gray-200 hover:border-blue-200 hover:bg-gray-50'
                                              }
                                            `}
                                          >
                                             <div className={`
                                              h-6 w-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
                                              ${isSelected ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-300'}
                                            `}>
                                              {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-white" />}
                                            </div>
                                            <span className={`text-base font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                                              {isTrue ? 'True' : 'False'}
                                            </span>
                                          </Label>
                                        </div>
                                      );
                                    })}
                                  </RadioGroup>
                                )}

                                {currentQuestion.type === 'essay' && (
                                  <div className="relative">
                                    <Textarea
                                      value={answers[currentQuestion.id] || ''}
                                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                      placeholder="Type your detailed answer here..."
                                      className="min-h-[300px] text-base leading-relaxed p-4 resize-y focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                                    />
                                    <div className="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                                      {(answers[currentQuestion.id] || '').length} chars
                                    </div>
                                  </div>
                                )}

                                {currentQuestion.type === 'short-answer' && (
                                  <Textarea
                                     value={answers[currentQuestion.id] || ''}
                                     onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                                     placeholder={t('examTaking.typeAnswer')}
                                     className="min-h-[100px] text-base p-4 rounded-xl"
                                  />
                                )}
                             </div>
                          </CardContent>
                          <div className="bg-gray-50 px-8 py-4 border-t flex justify-between items-center text-sm text-gray-500">
                             <div>
                               {t('examTaking.autosaved')} {new Date().toLocaleTimeString()}
                             </div>
                             <div>
                               {t('examTaking.step')} {currentQuestionIndex + 1} {t('examTaking.of')} {currentSection.questions.length} {t('examTaking.inThisSection')}
                             </div>
                          </div>
                        </Card>

                        {/* Navigation Footer */}
                        <div className={`flex items-center justify-between pt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                           <Button
                             variant="outline"
                             onClick={goToPrevious}
                             disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
                             className="w-32 h-11 text-base shadow-sm hover:bg-white hover:text-blue-600 hover:border-blue-200"
                           >
                             <ChevronLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                             {t('examTaking.previous')}
                           </Button>
                           
                           <Button
                             onClick={() => {
                               if (currentSectionIndex === exam.sections.length - 1 && currentQuestionIndex === (currentSection?.questions.length || 0) - 1) {
                                 setShowSubmitDialog(true);
                               } else {
                                 goToNext();
                               }
                             }}
                             className={`w-32 h-11 text-base shadow-md transition-all ${
                               currentSectionIndex === exam.sections.length - 1 && currentQuestionIndex === (currentSection?.questions.length || 0) - 1
                               ? 'bg-green-600 hover:bg-green-700'
                               : 'bg-blue-600 hover:bg-blue-700'
                             }`}
                           >
                             {currentSectionIndex === exam.sections.length - 1 && currentQuestionIndex === (currentSection?.questions.length || 0) - 1 
                               ? t('examTaking.finish') 
                               : t('examTaking.next')
                             }
                             {!(currentSectionIndex === exam.sections.length - 1 && currentQuestionIndex === (currentSection?.questions.length || 0) - 1) && <ChevronRight className={`h-4 w-4 ${isRTL ? 'mr-2' : 'ml-2'}`} />}
                           </Button>
                        </div>
                     </div>
                     ) : (
                     <div className="text-center py-20 text-gray-500">
                       {t('examTaking.selectQuestion')}
                     </div>
                   )}
                </div>
             </ScrollArea>
          </div>

          {/* Right/Sidebar Navigation Area */}
          <div className="lg:col-span-3 h-full flex flex-col min-h-0">
            <Card className="h-full border-none shadow-md overflow-hidden bg-white flex flex-col">
               <div className="p-4 border-b bg-gray-50 font-semibold text-gray-700 flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                 {t('examTaking.questionPalette')}
               </div>
               <ScrollArea className="flex-1">
                 <div className="p-4 space-y-6">
                   {exam.sections.map((section, sIdx) => (
                      <div key={section.id || sIdx} className="space-y-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">{section.title}</h4>
                        <div className="grid grid-cols-5 gap-2">
                          {section.questions.map((q, qIdx) => {
                             const isAnswered = answers[q.id] !== undefined && answers[q.id] !== '';
                             const isFlagged = flaggedQuestions.has(q.id);
                             const isCurrent = sIdx === currentSectionIndex && qIdx === currentQuestionIndex;
                             const globalIdx = allQuestions.findIndex(
                               item => item.sectionIndex === sIdx && item.questionIndex === qIdx
                             );

                             return (
                               <button
                                 key={q.id || qIdx}
                                 onClick={() => navigateToQuestion(sIdx, qIdx)}
                                 className={`
                                   relative w-10 h-10 rounded-lg text-sm font-semibold transition-all duration-200 border-2
                                   ${isCurrent 
                                     ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105 z-10' 
                                     : isAnswered 
                                       ? 'bg-white text-gray-700 border-green-500 hover:bg-green-50' 
                                       : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100 hover:border-gray-300'
                                   }
                                   ${isFlagged && !isCurrent ? 'ring-2 ring-yellow-400 ring-offset-1' : ''}
                                 `}
                               >
                                 {globalIdx + 1}
                                 {isFlagged && <div className="absolute -top-1 -right-1 h-3 w-3 bg-yellow-400 rounded-full border-2 border-white" />}
                                 {isAnswered && !isCurrent && <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />}
                               </button>
                             );
                          })}
                        </div>
                      </div>
                   ))}
                 </div>
               </ScrollArea>
               
               {/* Legend */}
               <div className="p-4 bg-gray-50 border-t text-xs text-gray-500 space-y-2">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-blue-600 border border-blue-600" /> 
                   <span>{t('examTaking.current')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-white border-2 border-green-500" />
                   <span>{t('examTaking.answered')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-gray-50 border border-transparent" />
                   <span>{t('examTaking.notAttempted')}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded bg-yellow-400 border border-yellow-400" />
                   <span>{t('examTaking.flagged')}</span>
                 </div>
               </div>
            </Card>
          </div>
        </div>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">{t('examTaking.readyToSubmit')}</DialogTitle>
              <DialogDescription className="pt-2">
                {t('examTaking.verifyProgress')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4 py-4">
               <div className="bg-blue-50 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-blue-700">{answeredCount}</div>
                  <div className="text-sm text-blue-600 font-medium">{t('examTaking.answered')}</div>
               </div>
               <div className="bg-gray-50 p-4 rounded-xl text-center">
                  <div className="text-3xl font-bold text-gray-700">{totalQuestions - answeredCount}</div>
                  <div className="text-sm text-gray-600 font-medium">{t('examTaking.unanswered')}</div>
               </div>
            </div>

            {totalQuestions - answeredCount > 0 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-sm mb-4">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p>{t('examTaking.unansweredWarning')} <strong>{totalQuestions - answeredCount} {t('examTaking.unansweredQuestions')}</strong>. {t('examTaking.proceedQuestion')}</p>
              </div>
            )}

            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-3 mt-2`}>
              <Button variant="outline" onClick={() => setShowSubmitDialog(false)} className="h-11 px-6">
                {t('examTaking.backToExam')}
              </Button>
              <Button 
                onClick={submitExam} 
                disabled={loading}
                className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
              >
                {loading ? t('examTaking.submitting') : t('examTaking.confirmSubmission')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
}
