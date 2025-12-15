import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Brain,
  User,
  Calendar,
  Download,
  CheckSquare,
  Square,
  Eye,
  BarChart3,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage, isRetryableError } from '../../utils/errorHandling';
import { useAICredits } from '../context/AICreditsContext';
import { useLanguage } from '../context/LanguageContext';
import type { ExamSubmission, SubmissionFilters, Exam, ExamGrade } from '../../interfaces/exam.types';

interface ExamSubmissionsProps {
  user?: any;
}

export function ExamSubmissions({ user }: ExamSubmissionsProps) {
  const navigate = useNavigate();
  const { refresh: refreshAICredits } = useAICredits();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ExamSubmission | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showGradeDialog, setShowGradeDialog] = useState(false);
  const [showAIGradeDialog, setShowAIGradeDialog] = useState(false);
  const [gradingMethod, setGradingMethod] = useState<'auto' | 'ai' | 'manual'>('auto');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterExamId, setFilterExamId] = useState<string>('all');
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  
  // Bulk selection
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<Set<string>>(new Set());
  
  // Manual grading state
  const [manualGrades, setManualGrades] = useState<Record<string, { points: number; feedback: string }>>({});
  const [overallFeedback, setOverallFeedback] = useState('');
  
  // AI Grading options
  const [aiGradeLanguage, setAiGradeLanguage] = useState<'en' | 'ar' | 'auto'>('en');
  const [aiGradeRubric, setAiGradeRubric] = useState('');

  useEffect(() => {
    loadSubmissions();
    loadAvailableExams();
  }, [filterExamId, filterStatus]);

  const loadAvailableExams = async () => {
    try {
      const response = await api.exam.getExams({ limit: 100 });
      const exams = response?.data?.exams || response?.exams || [];
      setAvailableExams(exams);
    } catch (error) {
      console.error('Failed to load exams:', error);
    }
  };

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: SubmissionFilters = {
        page: 1,
        limit: 100,
      };
      if (filterExamId !== 'all') filters.status = filterStatus as any;
      
      if (filterExamId !== 'all') {
        const response = await api.exam.getSubmissions(filterExamId, filters);
        const submissionsData = response?.data?.submissions || response?.submissions || [];
        setSubmissions(submissionsData);
      } else {
        // Load submissions from all exams
        setSubmissions([]);
      }
    } catch (error: any) {
      console.error('Failed to load submissions:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = async (submission: ExamSubmission) => {
    try {
      setLoading(true);
      const submissionData = await api.exam.getSubmission(submission.examId, submission.id);
      
      // BaseApiService automatically extracts 'data' from the response
      // so submissionData is likely { submission: ..., exam: ..., student: ... }
      
      // We need to extract the actual submission object which contains 'answers'
      const submissionDetail = submissionData?.submission || submissionData?.data?.submission || submissionData;
      
      console.log('Submission Detail Loaded:', {
        hasAnswers: !!submissionDetail.answers,
        keys: Object.keys(submissionDetail.answers || {}),
        id: submissionDetail.id
      });

      setSelectedSubmission(submissionDetail);
      
      // Use exam from response if available, otherwise fetch
      const embeddedExam = submissionData?.exam || submissionData?.data?.exam;
      if (embeddedExam) {
        setSelectedExam(embeddedExam);
      } else {
        const examData = await api.exam.getExam(submission.examId);
        setSelectedExam(examData?.data || examData);
      }
      setShowGradeDialog(true);
    } catch (error: any) {
      console.error('Failed to load submission:', error);
      toast.error('Failed to load submission details');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoGrade = async (submissionId: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.exam.autoGradeSubmission(submissionId);
      toast.success('Submission auto-graded successfully');
      await loadSubmissions();
      setShowGradeDialog(false);
    } catch (error: any) {
      console.error('Failed to auto-grade:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      if (isRetryableError(error)) {
        toast.error(`${formattedError.message}. Please try again.`);
      } else {
        toast.error(formattedError.message || 'Failed to auto-grade submission');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAIGrade = async (submissionId: string) => {
    try {
      setLoading(true);
      const result = await api.exam.gradeWithAI(submissionId, { 
        rubric: aiGradeRubric || undefined,
        language: aiGradeLanguage 
      });
      toast.success(`Submission graded with AI. Credits used: ${result?.data?.creditsUsed || 0}`);
      refreshAICredits();
      await loadSubmissions();
      setShowAIGradeDialog(false);
      setShowGradeDialog(false);
      // Reset AI grading options
      setAiGradeRubric('');
    } catch (error: any) {
      console.error('Failed to AI-grade:', error);
      toast.error(error?.message || 'Failed to grade with AI');
    } finally {
      setLoading(false);
    }
  };

  const handleManualGrade = async (submissionId: string) => {
    try {
      setLoading(true);
      const questionGrades: Record<string, any> = {};
      
      // Get exam questions to know max points for each
      if (!selectedExam) {
        toast.error('Exam data not loaded');
        return;
      }

      selectedExam.sections.forEach(section => {
        section.questions.forEach(q => {
          // Robust ID resolution matching the render logic
          const getQuestionId = (question: any) => {
            if (question.questionId) {
              if (typeof question.questionId === 'object') {
                 return question.questionId._id || question.questionId.id;
              }
              return question.questionId;
            }
            return question.id || question._id;
          };

          const questionId = getQuestionId(q);
          const grade = manualGrades[questionId];
          
          if (grade) {
            questionGrades[questionId] = {
              pointsAwarded: grade.points,
              maxPoints: q.points,
              feedback: grade.feedback || '',
            };
          }
        });
      });

      await api.exam.gradeManually(submissionId, {
        questionGrades,
        overallFeedback,
        isGraded: true,
      });
      
      toast.success('Submission graded manually');
      await loadSubmissions();
      setShowGradeDialog(false);
      setManualGrades({});
      setOverallFeedback('');
    } catch (error: any) {
      console.error('Failed to manually grade:', error);
      toast.error(error?.message || 'Failed to grade submission');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGrade = async (method: 'auto' | 'ai' | 'manual') => {
    if (selectedSubmissionIds.size === 0) {
      toast.error('Please select at least one submission');
      return;
    }

    try {
      setLoading(true);
      const submissionIds = Array.from(selectedSubmissionIds);
      
      if (filterExamId === 'all') {
        toast.error('Please filter by a specific exam for bulk grading');
        return;
      }

      await api.exam.bulkGradeSubmissions(filterExamId, {
        submissionIds,
        gradeMethod: method,
      });
      
      toast.success(`Graded ${submissionIds.length} submission(s)`);
      setSelectedSubmissionIds(new Set());
      await loadSubmissions();
    } catch (error: any) {
      console.error('Failed to bulk grade:', error);
      toast.error(error?.message || 'Failed to bulk grade submissions');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    const newSelection = new Set(selectedSubmissionIds);
    if (newSelection.has(submissionId)) {
      newSelection.delete(submissionId);
    } else {
      newSelection.add(submissionId);
    }
    setSelectedSubmissionIds(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedSubmissionIds.size === submissions.length) {
      setSelectedSubmissionIds(new Set());
    } else {
      setSelectedSubmissionIds(new Set(submissions.map(s => s.id)));
    }
  };

  const getStatusBadge = (status: ExamSubmission['status']) => {
    const statusConfig = {
      'in-progress': { label: 'In Progress', variant: 'secondary' as const, icon: Clock },
      'submitted': { label: 'Submitted', variant: 'default' as const, icon: FileText },
      'graded': { label: 'Graded', variant: 'outline' as const, icon: CheckCircle2 },
    };
    const config = statusConfig[status] || statusConfig['submitted'];
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const filteredSubmissions = submissions.filter((submission) => {
    const matchesSearch = !searchTerm || submission.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || submission.status === filterStatus;
    return matchesSearch && matchesStatus;
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
                  <span className="font-medium">Error</span>
                </div>
                <Button variant="outline" size="sm" onClick={loadSubmissions}>
                  Retry
                </Button>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}
        
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('examSubmissions.title')}</h1>
          <p className="text-gray-600 mt-1">{t('examSubmissions.subtitle')}</p>
        </div>
        {selectedSubmissionIds.size > 0 && (
          <div className="flex gap-2">
            <Button onClick={() => handleBulkGrade('auto')} variant="outline">
              <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('examSubmissions.autoGradeSelected')} ({selectedSubmissionIds.size})
            </Button>
            <Button onClick={() => handleBulkGrade('ai')} variant="outline">
              <Brain className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t('examSubmissions.aiGradeSelected')} ({selectedSubmissionIds.size})
            </Button>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('examSubmissions.submissions')}</CardTitle>
          <CardDescription>{t('examSubmissions.filterManage')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={filterExamId} onValueChange={setFilterExamId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder={t('examSubmissions.selectExam')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('examSubmissions.allExams')}</SelectItem>
                {availableExams.map((exam) => (
                  <SelectItem key={exam.id} value={exam.id}>
                    {exam.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('examSubmissions.filterByStatus')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('examSubmissions.allStatus')}</SelectItem>
                <SelectItem value="submitted">{t('examSubmissions.submitted')}</SelectItem>
                <SelectItem value="graded">{t('examSubmissions.graded')}</SelectItem>
                <SelectItem value="in-progress">{t('examSubmissions.inProgress')}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1">
              <Input
                placeholder={t('examSubmissions.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">{t('examSubmissions.loading')}</div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {filterExamId === 'all' ? t('examSubmissions.selectToView') : t('examSubmissions.noSubmissions')}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 pb-2 border-b">
                <Checkbox
                  checked={selectedSubmissionIds.size === filteredSubmissions.length && filteredSubmissions.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <span className="text-sm text-gray-600">
                  {t('examSubmissions.selectAll')} ({selectedSubmissionIds.size} {t('examSubmissions.selected')})
                </span>
              </div>
              
              {filteredSubmissions.map((submission) => {
                // Resolve Exam Title from available exams list
                const examTitle = availableExams.find(e => e.id === submission.examId)?.title 
                  || (submission as any).exam?.title 
                  || `Submission ${submission.id.slice(0, 8)}`;

                // Resolve Student Name from flat property or nested object
                const studentName = (submission as any).studentName 
                  || (submission as any).student?.name 
                  || submission.studentId.slice(0, 8);

                return (
                  <Card key={submission.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <Checkbox
                            checked={selectedSubmissionIds.has(submission.id)}
                            onCheckedChange={() => toggleSubmissionSelection(submission.id)}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">
                                {examTitle}
                              </h3>
                              {getStatusBadge(submission.status)}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {t('examSubmissions.student')} {studentName}
                              </span>
                              <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {t('examSubmissions.submittedAt')} {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : t('examSubmissions.notSubmitted')}
                            </span>
                            {submission.score !== undefined && (
                              <span className="flex items-center gap-1">
                                <BarChart3 className="h-4 w-4" />
                                {t('examSubmissions.score')} {submission.score}
                              </span>
                            )}
                            {submission.grade && (
                              <Badge variant="outline">{submission.grade}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewSubmission(submission)}
                          >
                            <Eye className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                            {t('examSubmissions.view')}
                          </Button>
                          {submission.status === 'submitted' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAutoGrade(submission.id)}
                              >
                                <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {t('examSubmissions.autoGrade')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowAIGradeDialog(true);
                                }}
                              >
                                <Brain className={`h-4 w-4 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                {t('examSubmissions.aiGrade')}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )})}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Dialog */}
      <Dialog open={showGradeDialog} onOpenChange={setShowGradeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('examSubmissions.gradeSubmission')}</DialogTitle>
            <DialogDescription>{t('examSubmissions.reviewGrade')}</DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && selectedExam && (
            <div className="space-y-4">
              <Tabs defaultValue="auto" value={gradingMethod} onValueChange={(v: string) => setGradingMethod(v as any)}>
                <TabsList>
                  <TabsTrigger value="auto">{t('examSubmissions.autoGrade')}</TabsTrigger>
                  <TabsTrigger value="ai">{t('examSubmissions.aiGrade')}</TabsTrigger>
                  <TabsTrigger value="manual">{t('examSubmissions.manualGrade')}</TabsTrigger>
                </TabsList>

                <TabsContent value="auto" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-900">
                      {t('examSubmissions.autoGradeInfo')}
                    </p>
                  </div>
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Button onClick={() => handleAutoGrade(selectedSubmission.id)}>
                      <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('examSubmissions.autoGradeSubmission')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-900">
                      {t('examSubmissions.aiGradeInfo')}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">{t('examSubmissions.feedbackLanguage')}</label>
                      <Select value={aiGradeLanguage} onValueChange={(value: 'en' | 'ar' | 'auto') => setAiGradeLanguage(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('examSubmissions.selectLanguage')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">{t('examSubmissions.english')}</SelectItem>
                          <SelectItem value="ar">{t('examSubmissions.arabic')}</SelectItem>
                          <SelectItem value="auto">{t('examSubmissions.autoDetect')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('examSubmissions.rubricOptional')}</label>
                    <Textarea
                      placeholder={t('examSubmissions.rubricPlaceholder')}
                      rows={4}
                      value={aiGradeRubric}
                      onChange={(e) => setAiGradeRubric(e.target.value)}
                    />
                  </div>
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Button onClick={() => handleAIGrade(selectedSubmission.id)} disabled={loading}>
                      <Brain className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {loading ? t('examSubmissions.grading') : t('examSubmissions.gradeWithAI')}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-900">
                      {t('examSubmissions.manualGradeInfo')}
                    </p>
                  </div>
                  
                  {selectedExam.sections.map((section, sIdx) => (
                    <div key={section.id || sIdx} className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">{section.title}</h4>
                      <div className="space-y-4">
                        {section.questions.map((q, qIdx) => {
                          // Helper to resolve question ID and details robustly
                          const resolveQuestionDetails = (question: any) => {
                            let id = question.id || question._id;
                            let text = question.question;
                            let type = question.type;
                            let points = question.points;

                            // If questionId field is populated/present
                            if (question.questionId) {
                              if (typeof question.questionId === 'object') {
                                // Populated object
                                id = question.questionId._id || question.questionId.id;
                                text = question.questionId.question || text;
                                type = question.questionId.type || type;
                              } else {
                                // String ID reference
                                id = question.questionId;
                              }
                            }
                            
                            return { id, text, type, rawPoints: points };
                          };

                          const { id: questionId, text: questionText, type: questionType } = resolveQuestionDetails(q);
                          
                          
                          // Try looking up answer by the resolved inner ID, or fallback to the outer assignment ID
                          const studentAnswer = selectedSubmission.answers?.[questionId] || 
                                              selectedSubmission.answers?.[q.id] || 
                                              selectedSubmission.answers?.[(q as any)._id];
                          
                          return (
                            <div key={questionId || qIdx} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <p className="font-medium">{questionText}</p>
                                  <Badge variant="outline" className="mt-1">{questionType}</Badge>
                                  <Badge variant="outline" className="mt-1 ml-2">{q.points} {t('examSubmissions.ptsMax')}</Badge>
                                </div>
                              </div>
                              <div className="mt-2">
                                <label className="text-sm font-medium">{t('examSubmissions.studentAnswer')}</label>
                                <p className="text-sm text-gray-700 mt-1 p-2 bg-white rounded">
                                  {studentAnswer || <span className="text-gray-400 italic">{t('examSubmissions.noAnswer')}</span>}
                                </p>
                              </div>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                  <label className="text-sm font-medium">{t('examSubmissions.pointsAwarded')}</label>
                                  <Input
                                    type="number"
                                    min="0"
                                    max={q.points}
                                    value={manualGrades[questionId]?.points || 0}
                                    onChange={(e) => {
                                      setManualGrades({
                                        ...manualGrades,
                                        [questionId]: {
                                          ...manualGrades[questionId],
                                          points: parseInt(e.target.value) || 0,
                                          feedback: manualGrades[questionId]?.feedback || '',
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium">{t('examSubmissions.feedback')}</label>
                                  <Input
                                    placeholder={t('examSubmissions.feedbackPlaceholder')}
                                    value={manualGrades[questionId]?.feedback || ''}
                                    onChange={(e) => {
                                      setManualGrades({
                                        ...manualGrades,
                                        [questionId]: {
                                          ...manualGrades[questionId],
                                          points: manualGrades[questionId]?.points || 0,
                                          feedback: e.target.value,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">{t('examSubmissions.overallFeedback')}</label>
                    <Textarea
                      value={overallFeedback}
                      onChange={(e) => setOverallFeedback(e.target.value)}
                      placeholder={t('examSubmissions.overallFeedbackPlaceholder')}
                      rows={3}
                    />
                  </div>
                  
                  <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
                    <Button onClick={() => handleManualGrade(selectedSubmission.id)}>
                      <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {t('examSubmissions.submitGrade')}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* AI Grade Dialog */}
      <Dialog open={showAIGradeDialog} onOpenChange={setShowAIGradeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('examSubmissions.aiGradeSubmission')}</DialogTitle>
            <DialogDescription>{t('examSubmissions.gradeEssays')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('examSubmissions.feedbackLanguage')}</label>
              <Select value={aiGradeLanguage} onValueChange={(value: 'en' | 'ar' | 'auto') => setAiGradeLanguage(value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('examSubmissions.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('examSubmissions.english')}</SelectItem>
                  <SelectItem value="ar">{t('examSubmissions.arabic')}</SelectItem>
                  <SelectItem value="auto">{t('examSubmissions.autoDetect')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                {t('examSubmissions.feedbackLangNote')}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('examSubmissions.rubricOptional')}</label>
              <Textarea
                placeholder={t('examSubmissions.rubricPlaceholder')}
                rows={4}
                value={aiGradeRubric}
                onChange={(e) => setAiGradeRubric(e.target.value)}
              />
            </div>
            <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'} gap-2`}>
              <Button variant="outline" onClick={() => setShowAIGradeDialog(false)}>
                {t('examSubmissions.cancel')}
              </Button>
              <Button
                onClick={() => selectedSubmission && handleAIGrade(selectedSubmission.id)}
                disabled={loading}
              >
                <Brain className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {loading ? t('examSubmissions.grading') : t('examSubmissions.gradeWithAI')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      </div>
    </ErrorBoundary>
  );
}
