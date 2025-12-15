import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  FileText,
  Calendar,
  BarChart3,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage } from '../../utils/errorHandling';
import type { ExamGrade, GradeFilters, Exam } from '../../interfaces/exam.types';
import { useLanguage } from '../context/LanguageContext';

interface ExamGradesProps {
  user?: any;
}

export function ExamGrades({ user }: ExamGradesProps) {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState<ExamGrade[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<ExamGrade | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  
  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCourseId, setFilterCourseId] = useState<string>('all');

  useEffect(() => {
    loadGrades();
  }, [filterStatus, filterCourseId]);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: GradeFilters = {
        page: 1,
        limit: 100,
      };
      if (filterStatus !== 'all') filters.status = filterStatus as any;
      if (filterCourseId !== 'all') filters.courseId = filterCourseId;

      const response = await api.exam.getStudentGrades(filters);
      const gradesData = response?.data?.grades || response?.grades || [];
      setGrades(gradesData);
    } catch (error: any) {
      console.error('Failed to load grades:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (grade: ExamGrade) => {
    try {
      setLoading(true);
      const gradeId = grade.id || grade._id;
      if (!gradeId) throw new Error('Grade ID not found');
      
      const gradeData = await api.exam.getExamGrade(grade.examId, gradeId);
      
      // Handle data unwrapping if coming from BaseApiService
      const gradeDetails = gradeData?.grade || gradeData?.data?.grade || gradeData;
      setSelectedGrade(gradeDetails);
      
      // Use the exam embedded in the grade response. 
      // Students cannot call api.exam.getExam() (returns 403), so we must rely on what's returned here.
      const embeddedExam = gradeData?.exam || gradeData?.data?.exam;
      if (embeddedExam) {
         setSelectedExam(embeddedExam);
      } else {
         // Fallback just in case, but warn if it might fail
         console.warn('Exam details not found in grade response, rendering might be incomplete.');
         // We do NOT call getExam here as it will likely fail for students
      }
      
      setShowDetailDialog(true);
    } catch (error: any) {
      console.error('Failed to load grade details:', error);
      toast.error('Failed to load grade details');
    } finally {
      setLoading(false);
    }
  };

  const getGradeBadge = (percentage: number) => {
    if (typeof percentage !== 'number' || isNaN(percentage)) return <Badge variant="outline">N/A</Badge>;
    
    if (percentage >= 90) {
      return <Badge className="bg-green-600">A ({percentage.toFixed(1)}%)</Badge>;
    } else if (percentage >= 80) {
      return <Badge className="bg-blue-600">B ({percentage.toFixed(1)}%)</Badge>;
    } else if (percentage >= 70) {
      return <Badge className="bg-yellow-600">C ({percentage.toFixed(1)}%)</Badge>;
    } else if (percentage >= 60) {
      return <Badge className="bg-orange-600">D ({percentage.toFixed(1)}%)</Badge>;
    } else {
      return <Badge variant="destructive">F ({percentage.toFixed(1)}%)</Badge>;
    }
  };

  const getLetterGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const calculateAverage = (): number => {
    if (grades.length === 0) return 0;
    const validGrades = grades.filter(g => typeof g.percentage === 'number' && !isNaN(g.percentage));
    if (validGrades.length === 0) return 0;
    const sum = validGrades.reduce((acc, grade) => acc + grade.percentage, 0);
    return sum / validGrades.length;
  };

  const getStatistics = () => {
    const validGrades = grades.filter(g => typeof g.percentage === 'number' && !isNaN(g.percentage));
    const passed = validGrades.filter(g => g.percentage >= 60).length;
    const failed = validGrades.filter(g => g.percentage < 60).length;
    const average = calculateAverage();
    const best = validGrades.length > 0 ? Math.max(...validGrades.map(g => g.percentage)) : 0;
    const worst = validGrades.length > 0 ? Math.min(...validGrades.map(g => g.percentage)) : 0;

    return { passed, failed, average, best, worst };
  };

  const stats = getStatistics();
  const filteredGrades = grades.filter((grade) => {
    if (filterStatus !== 'all') {
      if (filterStatus === 'graded' && !grade.gradedAt) return false;
      if (filterStatus === 'pending' && grade.gradedAt) return false;
    }
    return true;
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
                  <span className="font-medium">{t('examGrades.errorLoading')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={loadGrades}>
                  {t('common.retry')}
                </Button>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('examGrades.title')}</h1>
          <p className="text-gray-600 mt-1">{t('examGrades.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('examGrades.averageScore')}</p>
                <p className="text-2xl font-bold">
                  {(typeof stats.average === 'number' && !isNaN(stats.average)) ? stats.average.toFixed(1) : '0.0'}%
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('examGrades.bestScore')}</p>
                <p className="text-2xl font-bold">
                   {(typeof stats.best === 'number' && !isNaN(stats.best)) ? stats.best.toFixed(1) : '0.0'}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('examGrades.passed')}</p>
                <p className="text-2xl font-bold">{stats.passed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('examGrades.failed')}</p>
                <p className="text-2xl font-bold">{stats.failed}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('examGrades.examResults')}</CardTitle>
              <CardDescription>{t('examGrades.examResultsDesc')}</CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('examGrades.allStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('examGrades.allStatus')}</SelectItem>
                  <SelectItem value="graded">{t('examGrades.graded')}</SelectItem>
                  <SelectItem value="pending">{t('examGrades.pending')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('examGrades.loading')}</div>
          ) : filteredGrades.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t('examGrades.noGrades')}</div>
          ) : (
            <div className="space-y-4">
              {filteredGrades.map((grade) => (
                <Card key={grade.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            Example Exam
                          </h3>
                          {getGradeBadge(grade.percentage)}
                          {grade.letterGrade && (
                            <Badge variant="outline">{grade.letterGrade}</Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                          <div>
                            <div className="text-gray-500">{t('examGrades.score')}</div>
                            <div className="font-medium text-lg">
                              {grade.gradedAt ? `${grade.totalScore} / ${grade.maxScore}` : t('examGrades.pending')}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">{t('examGrades.percentage')}</div>
                            <div className="font-medium text-lg">
                              {(typeof grade.percentage === 'number' && !isNaN(grade.percentage)) 
                                ? `${grade.percentage.toFixed(1)}%` 
                                : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">{t('examGrades.gradedOn')}</div>
                            <div className="font-medium">
                              {grade.gradedAt
                                ? new Date(grade.gradedAt).toLocaleDateString()
                                : t('examGrades.pending')}
                            </div>
                          </div>
                          <div>
                            <div className="text-gray-500">{t('examGrades.method')}</div>
                            <div className="font-medium capitalize">{grade.gradingMethod || '-'}</div>
                          </div>
                        </div>
                        
                        {grade.overallFeedback && (
                          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">{grade.overallFeedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className={isRTL ? 'mr-4' : 'ml-4'}>
                        <Button
                          variant="outline"
                          onClick={() => handleViewDetails(grade)}
                          disabled={!grade.gradedAt || (!grade.id && !grade._id)}
                          title={!grade.gradedAt ? t('examGrades.pending') : t('examGrades.viewDetails')}
                        >
                          <Eye className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {t('examGrades.viewDetails')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Detail Dialog */}
      {showDetailDialog && selectedGrade && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t('examGrades.gradeDetails')}</CardTitle>
            <CardDescription>{selectedExam?.title || t('examGrades.examResults')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examGrades.totalScore')}</label>
                <p className="text-2xl font-bold mt-1">
                  {selectedGrade.totalScore} / {selectedGrade.maxScore}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examGrades.percentage')}</label>
                <p className="text-2xl font-bold mt-1">
                  {(typeof selectedGrade.percentage === 'number' && !isNaN(selectedGrade.percentage)) 
                    ? `${selectedGrade.percentage.toFixed(1)}%` 
                    : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examGrades.letterGrade')}</label>
                <p className="text-lg font-medium mt-1">
                  {selectedGrade.letterGrade || getLetterGrade(selectedGrade.percentage)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">{t('examGrades.gradingMethod')}</label>
                <p className="text-lg font-medium mt-1 capitalize">{selectedGrade.gradingMethod}</p>
              </div>
            </div>

            {selectedGrade.overallFeedback && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-2 block">{t('examGrades.overallFeedback')}</label>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{selectedGrade.overallFeedback}</p>
                </div>
              </div>
            )}

            {selectedGrade.questionGrades && selectedGrade.questionGrades.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500 mb-4 block">{t('examGrades.questionFeedback')}</label>
                <div className="space-y-4">
                  {selectedExam?.sections ? (
                    // Render using Exam Structure (Sections)
                    selectedExam.sections.map((section, sIdx) => (
                      <div key={section.id || sIdx} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">{section.title}</h4>
                        <div className="space-y-3">
                          {section.questions.map((q, qIdx) => {
                            const questionGrade = selectedGrade.questionGrades.find(
                              qg => qg.questionId === q.id || qg.questionId === (q as any)._id
                            );
                            if (!questionGrade) return null;
                            
                            const isCorrect = questionGrade.pointsAwarded >= questionGrade.maxPoints * 0.8;
                            
                            return (
                              <div key={q.id || qIdx} className="bg-gray-50 p-3 rounded">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900">{q.question}</p>
                                    <div className="mt-2 text-sm">
                                       <span className="font-medium text-gray-700">{t('examGrades.yourAnswer')} </span>
                                       <span className="text-gray-600">{questionGrade.studentAnswer || t('examGrades.noAnswer')}</span>
                                    </div>
                                  </div>
                                  <Badge variant={isCorrect ? "default" : "secondary"} className={isCorrect ? "bg-green-600" : "bg-orange-500"}>
                                    {questionGrade.pointsAwarded} / {questionGrade.maxPoints} pts
                                  </Badge>
                                </div>
                                {questionGrade.feedback && (
                                  <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border">
                                    <span className="font-medium">{t('examGrades.feedback')} </span> {questionGrade.feedback}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback: Render flat list from Grade data if Exam structure is missing
                    selectedGrade.questionGrades.map((qg, idx) => {
                      const isCorrect = qg.pointsAwarded >= qg.maxPoints * 0.8;
                      return (
                        <div key={qg.questionId || idx} className="bg-gray-50 p-3 rounded mb-3">
                           <div className="flex justify-between items-start mb-2">
                               <div className="flex-1">
                                <p className="font-medium text-gray-900">{(qg as any).question || 'Question Text Unavailable'}</p>
                                <div className="mt-2 text-sm">
                                   <span className="font-medium text-gray-700">{t('examGrades.yourAnswer')} </span>
                                   <span className="text-gray-600">{qg.studentAnswer || t('examGrades.noAnswer')}</span>
                                </div>
                              </div>
                              <Badge variant={isCorrect ? "default" : "secondary"} className={isCorrect ? "bg-green-600" : "bg-orange-500"}>
                                {qg.pointsAwarded} / {qg.maxPoints} pts
                              </Badge>
                           </div>
                           {qg.feedback && (
                              <div className="mt-2 text-sm text-gray-600 bg-white p-2 rounded border">
                                <span className="font-medium">{t('examGrades.feedback')} </span> {qg.feedback}
                              </div>
                           )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                {t('examGrades.close')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </ErrorBoundary>
  );
}
