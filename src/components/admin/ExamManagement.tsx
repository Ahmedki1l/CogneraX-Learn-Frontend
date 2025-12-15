import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
  Calendar,
  BarChart3,
  Edit,
  Trash2,
  Copy,
  Eye,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { useAsyncOperation } from '../../hooks/useAsyncOperation';
import { formatApiError, getErrorMessage } from '../../utils/errorHandling';
import type { Exam, ExamFilters } from '../../interfaces/exam.types';
import type { AccessibleField, AccessibleCourse } from '../../interfaces/course.types';
import { useLanguage } from '../context/LanguageContext';

interface ExamManagementProps {
  user?: any;
}

export function ExamManagement({ user }: ExamManagementProps) {
  const navigate = useNavigate();
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [accessibleFields, setAccessibleFields] = useState<AccessibleField[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation state: 'fields' | 'field-detail' | 'exam-detail'
  const [currentView, setCurrentView] = useState<'fields' | 'field-detail' | 'exam-detail'>('fields');
  const [selectedField, setSelectedField] = useState<AccessibleField | null>(null);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedFieldId, setSelectedFieldId] = useState<string>('all');
  
  const loadFieldsOperation = useAsyncOperation({
    onSuccess: (data: any) => {
      const fields = data?.data?.fields || data?.fields || [];
      setAccessibleFields(fields.map((f: any) => ({
        _id: f._id || f.id,
        name: f.name,
        description: f.description,
        icon: f.icon,
        accessType: f.accessType,
        permissions: f.permissions || [],
        courses: (f.courses || []).map((c: any) => ({
          _id: c._id || c.id,
          title: c.title || c.name || 'Untitled course',
          description: c.description,
          status: c.status,
          lessons: c.lessons,
          students: c.students,
        })),
      })));
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
    showToast: true,
    retry: true,
  });
  
  const loadExamsOperation = useAsyncOperation({
    onSuccess: (data: any) => {
      const examsData = data?.data?.exams || data?.exams || [];
      setExams(examsData);
      setError(null);
    },
    onError: (err) => {
      setError(getErrorMessage(err));
    },
    showToast: true,
    retry: true,
  });

  useEffect(() => {
    loadAccessibleFields();
  }, []);

  const loadAccessibleFields = async () => {
    await loadFieldsOperation.execute(async () => {
      setLoading(true);
      try {
        return await api.instructor.getAccessibleCourses(user?.id || user?._id);
      } finally {
        setLoading(false);
      }
    });
  };

  const loadExams = async (courseId?: string, fieldId?: string) => {
    await loadExamsOperation.execute(async () => {
      setLoading(true);
      try {
        const filters: ExamFilters = {
          page: 1,
          limit: 100,
        };
        if (courseId) filters.courseId = courseId;
        if (fieldId) filters.fieldId = fieldId;
        if (searchTerm) filters.search = searchTerm;
        if (filterStatus !== 'all') filters.status = filterStatus as Exam['status'];

        return await api.exam.getExams(filters);
      } finally {
        setLoading(false);
      }
    });
  };

  const handleViewField = (field: AccessibleField) => {
    setSelectedField(field);
    setCurrentView('field-detail');
    loadExams(undefined, field._id);
  };

  const handleViewExam = async (exam: Exam) => {
    try {
      setLoading(true);
      setError(null);
      const examData = await api.exam.getExam(exam.id);
      setSelectedExam(examData?.data || examData);
      setCurrentView('exam-detail');
    } catch (error: any) {
      console.error('Failed to load exam:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId: string) => {
    if (!confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.exam.deleteExam(examId);
      toast.success('Exam deleted successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
      if (currentView === 'exam-detail' && selectedExam?.id === examId) {
        setCurrentView('fields');
        setSelectedExam(null);
      }
    } catch (error: any) {
      console.error('Failed to delete exam:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateExam = async (examId: string) => {
    try {
      setLoading(true);
      await api.exam.duplicateExam(examId);
      toast.success('Exam duplicated successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
    } catch (error: any) {
      console.error('Failed to duplicate exam:', error);
      toast.error('Failed to duplicate exam');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleExam = async (examId: string, scheduledDate: string, duration?: number) => {
    try {
      setLoading(true);
      await api.exam.scheduleExam(examId, {
        scheduledDate,
        duration,
      });
      toast.success('Exam scheduled successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
    } catch (error: any) {
      console.error('Failed to schedule exam:', error);
      toast.error('Failed to schedule exam');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Exam['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
      scheduled: { label: 'Scheduled', variant: 'default' as const, icon: Calendar },
      active: { label: 'Active', variant: 'default' as const, icon: Clock },
      completed: { label: 'Completed', variant: 'outline' as const, icon: CheckCircle2 },
      archived: { label: 'Archived', variant: 'secondary' as const, icon: XCircle },
    };
    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  // Fields View
  if (currentView === 'fields') {
    return (
      <ErrorBoundary>
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('adminExams.title')}</h1>
            <p className="text-gray-600 mt-1">{t('adminExams.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/ai-exam-generator')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('adminExams.createExam')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('adminExams.fieldsAndCourses')}</CardTitle>
            <CardDescription>{t('adminExams.selectField')}</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Error loading fields</p>
                </div>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadAccessibleFields}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading fields...</div>
            ) : accessibleFields.length === 0 && !error ? (
              <div className="text-center py-8 text-gray-500">No fields available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessibleFields.map((field) => (
                  <Card
                    key={field._id}
                    className="cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleViewField(field)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {field.icon && <span>{field.icon}</span>}
                        {field.name}
                      </CardTitle>
                      <CardDescription>{field.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {field.courses?.length || 0} courses
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </ErrorBoundary>
    );
  }

  // Field Detail View
  if (currentView === 'field-detail' && selectedField) {
    const filteredExams = exams.filter((exam) => {
      const matchesSearch = !searchTerm || exam.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || exam.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    return (
      <ErrorBoundary>
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setCurrentView('fields'); setSelectedField(null); }}>
            ← {t('adminExams.backToFields')}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{selectedField.name}</h1>
            <p className="text-gray-600 mt-1">{selectedField.description}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Exams</CardTitle>
                <CardDescription>Manage exams in this field</CardDescription>
              </div>
              <Button onClick={() => navigate('/ai-exam-generator')}>
                <Plus className="h-4 w-4 mr-2" />
                Create Exam
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading exams...</div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No exams found</div>
            ) : (
              <div className="space-y-3">
                {filteredExams.map((exam) => (
                  <Card key={exam.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{exam.title}</h3>
                            {getStatusBadge(exam.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{exam.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {exam.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {exam.questionCount} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-4 w-4" />
                              {exam.totalPoints} points
                            </span>
                            {exam.scheduledDate && (
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(exam.scheduledDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewExam(exam)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateExam(exam.id)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Duplicate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteExam(exam.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
        </div>
      </ErrorBoundary>
    );
  }

  // Exam Detail View
  if (currentView === 'exam-detail' && selectedExam) {
    return (
      <ErrorBoundary>
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => { setCurrentView('field-detail'); setSelectedExam(null); }}>
            ← Back to Exams
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h1>
            <p className="text-gray-600 mt-1">{selectedExam.description}</p>
          </div>
        </div>

        <Tabs defaultValue="details">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="statistics">Statistics</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">{getStatusBadge(selectedExam.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Duration</label>
                    <p className="mt-1">{selectedExam.duration} minutes</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Total Points</label>
                    <p className="mt-1">{selectedExam.totalPoints}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Question Count</label>
                    <p className="mt-1">{selectedExam.questionCount}</p>
                  </div>
                  {selectedExam.passingScore && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Passing Score</label>
                      <p className="mt-1">{selectedExam.passingScore}%</p>
                    </div>
                  )}
                  {selectedExam.maxAttempts && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Max Attempts</label>
                      <p className="mt-1">{selectedExam.maxAttempts}</p>
                    </div>
                  )}
                  {selectedExam.scheduledDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Scheduled Date</label>
                      <p className="mt-1">{new Date(selectedExam.scheduledDate).toLocaleString()}</p>
                    </div>
                  )}
                  {selectedExam.scheduledEndDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="mt-1">{new Date(selectedExam.scheduledEndDate).toLocaleString()}</p>
                    </div>
                  )}
                </div>
                {selectedExam.instructions && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Instructions</label>
                    <p className="mt-1 text-sm">{selectedExam.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Questions by Section</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedExam.sections && selectedExam.sections.length > 0 ? (
                  <div className="space-y-6">
                    {selectedExam.sections.map((section, idx) => (
                      <div key={section.id || idx} className="border rounded-lg p-4">
                        <h3 className="font-semibold mb-3">
                          {section.title} ({section.questions.length} questions, {section.points} points)
                        </h3>
                        <div className="space-y-3">
                          {section.questions.map((q, qIdx) => (
                            <div key={q.id || qIdx} className="bg-gray-50 p-3 rounded">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{q.type}</Badge>
                                <Badge variant="outline">{q.points} pts</Badge>
                                {q.difficulty && (
                                  <Badge variant="outline">{q.difficulty}</Badge>
                                )}
                              </div>
                              <p className="text-sm font-medium">{q.question}</p>
                              {q.options && q.options.length > 0 && (
                                <ul className="mt-2 space-y-1 ml-4 text-sm">
                                  {q.options.map((opt, optIdx) => (
                                    <li key={optIdx}>
                                      {String.fromCharCode(65 + optIdx)}. {opt}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">No questions found</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="statistics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Exam Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-center text-gray-500 py-8">Statistics will be available after students submit exams</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </ErrorBoundary>
    );
  }

  return null;
}
