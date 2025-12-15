import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  Eye,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage } from '../../utils/errorHandling';
import type { Exam } from '../../interfaces/exam.types';
import { useLanguage } from '../context/LanguageContext';

interface ExamScheduleProps {
  user?: any;
}

export function ExamSchedule({ user }: ExamScheduleProps) {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadUpcomingExams();
  }, []);

  const loadUpcomingExams = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.exam.getUpcomingExams({ daysAhead: 30 });
      const examsData = response?.data?.exams || response?.exams || [];
      setExams(examsData.sort((a: Exam, b: Exam) => {
        const dateA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
        const dateB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
        return dateA - dateB;
      }));
    } catch (error: any) {
      console.error('Failed to load upcoming exams:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || 'Failed to load upcoming exams');
    } finally {
      setLoading(false);
    }
  };

  const getTimeUntil = (examDate: string): string => {
    const now = new Date();
    const exam = new Date(examDate);
    const diff = exam.getTime() - now.getTime();
    
    if (diff < 0) return 'Past';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStatusBadge = (exam: Exam) => {
    if (!exam.scheduledDate) return null;
    
    const now = new Date();
    const examDate = new Date(exam.scheduledDate);
    const diff = examDate.getTime() - now.getTime();
    
    if (diff < 0) {
      return <Badge variant="outline" className="text-gray-500">{t('examSchedule.past')}</Badge>;
    }
    
    if (diff < 60 * 60 * 1000) { // Less than 1 hour
      return <Badge variant="destructive">{t('examSchedule.startingSoon')}</Badge>;
    }
    
    if (diff < 24 * 60 * 60 * 1000) { // Less than 24 hours
      return <Badge variant="default">{t('examSchedule.today')}</Badge>;
    }
    
    return <Badge variant="secondary">{t('examSchedule.upcoming')}</Badge>;
  };

  const handleStartExam = (examId: string) => {
    navigate(`/exam/${examId}/take`);
  };

  const handleViewExam = (exam: Exam) => {
    setSelectedExam(exam);
  };

  // Calendar View Helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getExamsForDate = (date: Date): Exam[] => {
    return exams.filter(exam => {
      if (!exam.scheduledDate) return false;
      const examDate = new Date(exam.scheduledDate);
      return examDate.toDateString() === date.toDateString();
    });
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const dayExams = getExamsForDate(date);
      
      days.push(
        <div key={day} className="h-24 border border-gray-200 p-1">
          <div className="text-sm font-medium mb-1">{day}</div>
          <div className="space-y-1 overflow-y-auto max-h-16">
            {dayExams.map(exam => (
              <div
                key={exam.id}
                className="text-xs bg-blue-100 text-blue-900 p-1 rounded cursor-pointer hover:bg-blue-200"
                onClick={() => handleViewExam(exam)}
                title={exam.title}
              >
                {exam.title.substring(0, 15)}...
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const upcomingExams = exams.filter(exam => {
    if (!exam.scheduledDate) return false;
    const now = new Date();
    const startDate = new Date(exam.scheduledDate);
    
    // Calculate end time
    let endDate = new Date(startDate);
    if (exam.scheduledEndDate) {
      endDate = new Date(exam.scheduledEndDate);
    } else {
      // Default to duration if no specific end date
      endDate = new Date(startDate.getTime() + (exam.duration * 60 * 1000));
    }
    
    // Show if it hasn't ended yet (future start OR currently active)
    return endDate >= now;
  });

  const pastExams = exams.filter(exam => {
    if (!exam.scheduledDate) return false;
    const now = new Date();
    const startDate = new Date(exam.scheduledDate);
    
    // Calculate end time
    let endDate = new Date(startDate);
    if (exam.scheduledEndDate) {
      endDate = new Date(exam.scheduledEndDate);
    } else {
      endDate = new Date(startDate.getTime() + (exam.duration * 60 * 1000));
    }
    
    // Show if it has ended
    return endDate < now;
  });

  return (
    <ErrorBoundary>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{t('examSchedule.errorLoading')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={loadUpcomingExams}>
                  {t('examSchedule.retry')}
                </Button>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('examSchedule.title')}</h1>
          <p className="text-gray-600 mt-1">{t('examSchedule.subtitle')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            <List className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('examSchedule.list')}
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('examSchedule.calendar')}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">{t('examSchedule.upcoming')} ({upcomingExams.length})</TabsTrigger>
          <TabsTrigger value="past">{t('examSchedule.past')} ({pastExams.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {viewMode === 'list' ? (
            <>
              {loading ? (
                <div className="text-center py-8 text-gray-500">{t('examSchedule.loading')}</div>
              ) : upcomingExams.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-gray-500">
                    {t('examSchedule.noUpcoming')}
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {upcomingExams.map((exam) => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{exam.title}</h3>
                              {getStatusBadge(exam)}
                            </div>
                            <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-gray-500">{t('examSchedule.date')}</div>
                                  <div className="font-medium">
                                    {exam.scheduledDate
                                      ? new Date(exam.scheduledDate).toLocaleDateString()
                                      : t('examSchedule.notScheduled')}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-gray-500">{t('examSchedule.time')}</div>
                                  <div className="font-medium">
                                    {exam.scheduledDate
                                      ? new Date(exam.scheduledDate).toLocaleTimeString([], {
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : '-'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-gray-500">{t('examSchedule.duration')}</div>
                                  <div className="font-medium">{exam.duration} min</div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div className="text-gray-500">{t('examSchedule.questions')}</div>
                                  <div className="font-medium">{exam.questionCount}</div>
                                </div>
                              </div>
                            </div>

                            {exam.scheduledDate && (
                              <div className="mt-4 flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-sm font-medium text-orange-600">
                                  {t('examSchedule.timeRemaining')} {getTimeUntil(exam.scheduledDate)}
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className={`flex flex-col gap-2 ${isRTL ? 'mr-4' : 'ml-4'}`}>
                            {exam.scheduledDate && new Date(exam.scheduledDate) <= new Date() && (
                              <Button onClick={() => handleStartExam(exam.id)}>
                                {t('examSchedule.startExam')}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              onClick={() => handleViewExam(exam)}
                            >
                              <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                              {t('examSchedule.details')}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={prevMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={nextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>
                      {t('examSchedule.today')}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
                  {/* Day headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-100 p-2 text-center text-sm font-medium border-b">
                      {day}
                    </div>
                  ))}
                  {/* Calendar days */}
                  {renderCalendar()}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('examSchedule.loading')}</div>
          ) : pastExams.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                {t('examSchedule.noPast')}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pastExams.map((exam) => (
                <Card key={exam.id} className="opacity-75">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{exam.title}</h3>
                          <Badge variant="outline" className="text-gray-500">{t('examSchedule.completed')}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            {exam.scheduledDate
                              ? new Date(exam.scheduledDate).toLocaleDateString()
                              : t('examSchedule.notScheduled')}
                          </span>
                          <span>{exam.duration} min</span>
                          <span>{exam.questionCount} {t('examSchedule.questions').toLowerCase()}</span>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => navigate('/exam-grades')}
                      >
                        <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                        {t('examSchedule.viewResults')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Exam Detail Dialog */}
      {selectedExam && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{selectedExam.title}</CardTitle>
            <CardDescription>{t('examSchedule.examDetails')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examSchedule.dateTime')}</label>
                <p className="mt-1">
                  {selectedExam.scheduledDate
                    ? new Date(selectedExam.scheduledDate).toLocaleString()
                    : t('examSchedule.notScheduled')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examSchedule.duration')}</label>
                <p className="mt-1">{selectedExam.duration} minutes</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examSchedule.totalPoints')}</label>
                <p className="mt-1">{selectedExam.totalPoints}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examSchedule.questionCount')}</label>
                <p className="mt-1">{selectedExam.questionCount}</p>
              </div>
            </div>
            {selectedExam.instructions && (
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examSchedule.instructions')}</label>
                <p className="mt-1 text-sm">{selectedExam.instructions}</p>
              </div>
            )}
            {selectedExam.scheduledDate && new Date(selectedExam.scheduledDate) <= new Date() && (
              <div className="flex justify-end">
                <Button onClick={() => handleStartExam(selectedExam.id)}>
                  {t('examSchedule.startExam')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      </div>
    </ErrorBoundary>
  );
}
