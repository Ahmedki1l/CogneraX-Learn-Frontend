import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Search,
  Filter,
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
  Calendar as CalendarIcon,
  CalendarOff,
} from 'lucide-react';
import { format } from "date-fns";
import { cn } from "../ui/utils";
import { Calendar } from "../ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage } from '../../utils/errorHandling';
import type { Exam, ExamFilters } from '../../interfaces/exam.types';
import type { AccessibleField } from '../../interfaces/course.types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { Separator } from '../ui/separator';
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
  
  // Scheduling State
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [schedulingExamId, setSchedulingExamId] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>(undefined);
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [scheduledEndDate, setScheduledEndDate] = useState<Date | undefined>(undefined);
  const [scheduledEndTime, setScheduledEndTime] = useState("13:00");
  const [durationOverride, setDurationOverride] = useState<string>("");

  useEffect(() => {
    loadAccessibleFields();
  }, []);

  const loadAccessibleFields = async () => {
    try {
      setLoading(true);
      setError(null);
      // Instructors can only access fields they have access to
      const userId = user?.id || user?._id;
      if (!userId) {
        setError('User ID not found');
        return;
      }
      const response = await api.instructor.getAccessibleCourses(userId);
      const fields = response?.fields || [];
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
    } catch (error: any) {
      console.error('Failed to load fields:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || 'Failed to load fields');
    } finally {
      setLoading(false);
    }
  };

  const loadExams = async (courseId?: string, fieldId?: string) => {
    try {
      setLoading(true);
      setError(null);
      const filters: ExamFilters = {
        page: 1,
        limit: 100,
        // Instructor can only see their own exams
        instructorId: user?.id || user?._id,
      };
      if (courseId) filters.courseId = courseId;
      if (fieldId) filters.fieldId = fieldId;
      if (searchTerm) filters.search = searchTerm;
      if (filterStatus !== 'all') filters.status = filterStatus as Exam['status'];

      const response = await api.exam.getExams(filters);
      const examsData = response?.exams || [];
      setExams(examsData);
    } catch (error: any) {
      console.error('Failed to load exams:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleViewField = (field: AccessibleField) => {
    // Only show fields the instructor has access to
    if (field.accessType === 'none') {
      toast.error('You do not have access to this field');
      return;
    }
    setSelectedField(field);
    setCurrentView('field-detail');
    loadExams(undefined, field._id);
  };

  const handleViewExam = async (exam: Exam) => {
    try {
      setLoading(true);
      const examData = await api.exam.getExam(exam.id);
      const rawExam = examData?.data || examData;

      // Transform nested question structure if needed
      if (rawExam && rawExam.sections) {
        rawExam.sections = rawExam.sections.map((section: any) => ({
          ...section,
          questions: (section.questions || []).map((q: any) => {
            // Check if question details are populated in questionId property
            if (q.questionId && typeof q.questionId === 'object') {
              return {
                ...q,
                ...q.questionId, // Flatten the structure
                id: q._id || q.id, // Preserve the entry ID
                originalQuestionId: q.questionId._id || q.questionId.id,
                points: q.points || q.questionId.points, // Prefer exam-specific points
              };
            }
            return q;
          }),
        }));
      }

      setSelectedExam(rawExam);
      setCurrentView('exam-detail');
    } catch (error: any) {
      console.error('Failed to load exam:', error);
      toast.error('Failed to load exam details');
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
      toast.error(error?.message || 'Failed to delete exam');
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

  const handleScheduleClick = (examId: string) => {
    setSchedulingExamId(examId);
    // Find the exam to set initial values
    const exam = exams.find(e => e.id === examId);
    if (exam && exam.scheduledDate) {
      const date = new Date(exam.scheduledDate);
      setScheduledDate(date);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      setScheduledTime(`${hours}:${minutes}`);
    } else {
      setScheduledDate(undefined);
      setScheduledTime("12:00");
    }
    // Always reset optional fields for new schedule attempt
    setScheduledEndDate(undefined);
    setScheduledEndTime("13:00");
    setDurationOverride("");
    setIsScheduleDialogOpen(true);
  };

  const handleConfirmSchedule = async () => {
    if (!schedulingExamId || !scheduledDate) return;

    try {
      setLoading(true);
      
      // Combine date and time
      const finalDate = new Date(scheduledDate);
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      finalDate.setHours(hours, minutes);

      // Prepare payload
      const payload: any = {
        scheduledDate: finalDate.toISOString(),
      };

      // Add End Date if exists
      if (scheduledEndDate) {
        const finalEndDate = new Date(scheduledEndDate);
        const [endHours, endMinutes] = scheduledEndTime.split(':').map(Number);
        finalEndDate.setHours(endHours, endMinutes);
        payload.scheduledEndDate = finalEndDate.toISOString();
      }

      // Add Duration Override if exists
      if (durationOverride) {
        payload.duration = parseInt(durationOverride, 10);
      }

      await api.exam.scheduleExam(schedulingExamId, payload);
      toast.success('Exam scheduled successfully');
      setIsScheduleDialogOpen(false);
      setSchedulingExamId(null);
      setScheduledDate(undefined);
      setScheduledTime("12:00");
      setScheduledEndDate(undefined);
      setScheduledEndTime("13:00");
      setDurationOverride("");
      
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

  const handlePublishExam = async (examId: string) => {
    if (!confirm('Are you sure you want to publish this exam? It will be visible to students immediately.')) {
      return;
    }

    try {
      setLoading(true);
      // Auto-schedule for immediate start
      await api.exam.scheduleExam(examId, {
        scheduledDate: new Date().toISOString(),
      });
      await api.exam.publishExam(examId);
      toast.success('Exam published successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
    } catch (error: any) {
      console.error('Failed to publish exam:', error);
      toast.error('Failed to publish exam');
    } finally {
      setLoading(false);
    }
  };

  const handleUnpublishExam = async (examId: string) => {
    if (!confirm('Are you sure you want to unpublish this exam? It will be hidden from students.')) {
      return;
    }

    try {
      setLoading(true);
      await api.exam.unpublishExam(examId);
      toast.success('Exam unpublished successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
    } catch (error: any) {
      console.error('Failed to unpublish exam:', error);
      toast.error('Failed to unpublish exam');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSchedule = async (examId: string) => {
    if (!confirm('Are you sure you want to cancel the schedule for this exam? It will be reverted to draft status.')) {
      return;
    }

    try {
      setLoading(true);
      await api.exam.cancelExamSchedule(examId);
      toast.success('Exam schedule cancelled successfully');
      if (selectedField) {
        loadExams(undefined, selectedField._id);
      } else {
        loadExams();
      }
      
      // If we are in detail view, refresh the exam
      if (currentView === 'exam-detail' && selectedExam?.id === examId) {
        const updatedExam = await api.exam.getExam(examId);
        setSelectedExam(updatedExam?.data || updatedExam);
      }
    } catch (error: any) {
      console.error('Failed to cancel schedule:', error);
      toast.error(error?.message || 'Failed to cancel schedule');
    } finally {
      setLoading(false);
    }
  };

  const canEditExam = (field: AccessibleField | null): boolean => {
    if (!field) return false;
    return field.accessType === 'full' && field.permissions?.includes('update_course') || false;
  };

  const canDeleteExam = (field: AccessibleField | null): boolean => {
    if (!field) return false;
    return field.permissions?.includes('delete_course') || false;
  };

  const getStatusBadge = (status: Exam['status']) => {
    const statusConfig = {
      draft: { label: 'Draft', variant: 'secondary' as const, icon: FileText },
      scheduled: { label: 'Scheduled', variant: 'default' as const, icon: CalendarIcon },
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

  const schedulingDialog = (
    <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
      <DialogContent className="sm:max-w-[425px] overflow-visible">
        <DialogHeader>
          <DialogTitle>Schedule Exam</DialogTitle>
          <DialogDescription>
            Choose a date and time for this exam to start. Students will be notified.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
      <div className="flex-col space-y-2">
            <label className="text-sm font-medium">Start Date & Time</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  value={scheduledDate ? format(scheduledDate, "yyyy-MM-dd") : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setScheduledDate(date);
                  }}
                  className="w-full justify-start text-left font-normal"
                />
              </div>
              <div className="w-[120px]">
                <input
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex-col space-y-2">
            <label className="text-sm font-medium">End Date & Time (Optional)</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="date"
                  value={scheduledEndDate ? format(scheduledEndDate, "yyyy-MM-dd") : ''}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setScheduledEndDate(date);
                  }}
                  className="w-full justify-start text-left font-normal"
                />
              </div>
              <div className="w-[120px]">
                <input
                  type="time"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={scheduledEndTime}
                  onChange={(e) => setScheduledEndTime(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">If not set, it will be calculated based on duration.</p>
          </div>

          <div className="flex-col space-y-2">
            <label className="text-sm font-medium">Duration Override (Minutes)</label>
            <Input
              type="number"
              placeholder="Leave empty to use exam duration"
              value={durationOverride}
              onChange={(e) => setDurationOverride(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSchedule} disabled={!scheduledDate}>Confirm Schedule</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (currentView === 'fields') {
    const accessibleFieldsOnly = accessibleFields.filter(f => 
      f.accessType !== 'none'
    );

    return (
      <>{schedulingDialog}
      <ErrorBoundary>
        <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error loading fields</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={loadAccessibleFields}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('examManagement.title')}</h1>
            <p className="text-gray-600 mt-1">{t('examManagement.subtitle')}</p>
          </div>
          <Button onClick={() => navigate('/ai-exam-generator')}>
            <Plus className="h-4 w-4 mr-2" />
            {t('examManagement.createExam')}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('examManagement.fieldsAndCourses')}</CardTitle>
            <CardDescription>{t('examManagement.selectField')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading fields...</div>
            ) : accessibleFieldsOnly.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No accessible fields available</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {accessibleFieldsOnly.map((field) => (
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
      </>
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
      <>{schedulingDialog}
      <ErrorBoundary>
        <div className="space-y-6">
          {error && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Error loading exams</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => loadExams(undefined, selectedField._id)}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
                <p className="text-sm text-red-700 mt-2">{error}</p>
              </CardContent>
            </Card>
          )}
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => { setCurrentView('fields'); setSelectedField(null); }}>
              ← Back to Fields
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
              {canEditExam(selectedField) && (
                <Button onClick={() => navigate('/ai-exam-generator')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Exam
                </Button>
              )}
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
                                <CalendarIcon className="h-4 w-4" />
                                {new Date(exam.scheduledDate).toLocaleString()}
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
                          {canEditExam(selectedField) && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDuplicateExam(exam.id)}
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Duplicate
                              </Button>
                            </>
                          )}
                          {canDeleteExam(selectedField) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteExam(exam.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          )}
                          
                          {/* Publish/Schedule Actions */}
                          {canEditExam(selectedField) && exam.status === 'draft' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleScheduleClick(exam.id)}
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Schedule
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handlePublishExam(exam.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Publish
                              </Button>
                            </>
                          )}

                           {canEditExam(selectedField) && (exam.status === 'active' || exam.status === 'scheduled') && (
                             <>
                               {exam.status === 'scheduled' && (
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => handleCancelSchedule(exam.id)}
                                   className="text-red-600 border-red-200 hover:bg-red-50"
                                 >
                                   <CalendarOff className="h-4 w-4 mr-1" />
                                   Cancel Schedule
                                 </Button>
                               )}
                               <Button
                                 variant="outline"
                                 size="sm"
                                 onClick={() => handleUnpublishExam(exam.id)}
                                 className="text-orange-600 border-orange-200 hover:bg-orange-50"
                               >
                                 <XCircle className="h-4 w-4 mr-1" />
                                 Unpublish
                               </Button>
                             </>
                           )}
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
      </>
    );
  }

  // Exam Detail View - Same as admin but with permission checks
  if (currentView === 'exam-detail' && selectedExam) {
    return (
      <>{schedulingDialog}
      <ErrorBoundary>
        <div className="space-y-6">
        {/* ... existing exam detail content ... */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => { setCurrentView('field-detail'); setSelectedExam(null); }}>
              ← Back to Exams
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{selectedExam.title}</h1>
              <p className="text-gray-600 mt-1">{selectedExam.description}</p>
            </div>
             <div className="flex gap-2">
                {canEditExam(selectedField) && selectedExam.status === 'draft' && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleScheduleClick(selectedExam.id)}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    <Button
                      onClick={() => handlePublishExam(selectedExam.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Publish Now
                    </Button>
                  </>
                )}
                
                {canEditExam(selectedField) && selectedExam.status === 'scheduled' && (
                  <Button
                    variant="outline"
                    onClick={() => handleCancelSchedule(selectedExam.id)}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <CalendarOff className="h-4 w-4 mr-2" />
                    Cancel Schedule
                  </Button>
                )}
             </div>
          </div>

        <Tabs defaultValue="details">
          {/* ... tabs content ... */}
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
      </>
    );
  }

  return null;
}
