import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
  Upload,
  Eye,
  Star,
  Timer,
  Target,
  BookOpen
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../context/LanguageContext';

interface StudentAssignmentsProps {
  user?: any;
}

export function StudentAssignments({ user }: StudentAssignmentsProps) {
  const { t, isRTL } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id && !user?._id) return;
      
      try {
        setLoading(true);
        const userId = user.id || user._id;

        // 1. Get Enrolled Courses
        const enrolledResponse = await api.course.getEnrolledCourses({});
        
        let enrolledCourses = [];
        if (Array.isArray(enrolledResponse)) {
          enrolledCourses = enrolledResponse;
        } else if (Array.isArray(enrolledResponse?.data)) {
          enrolledCourses = enrolledResponse.data;
        } else if (enrolledResponse?.courses && Array.isArray(enrolledResponse.courses)) {
           enrolledCourses = enrolledResponse.courses;
        }

        let allAssignments: any[] = [];
        
        if (enrolledCourses.length > 0) {
          // Fetch assignments for each course
          const promises = enrolledCourses.map((course: any) => {
            const courseId = course.id || course._id;
            return api.assignment.getAssignments({ courseId });
          });
          
          const results = await Promise.all(promises);
          
          allAssignments = results.flatMap(r => {
             if (Array.isArray(r)) return r;
             if (r && Array.isArray(r.data)) return r.data;
             return [];
          });
        }

        // Remove duplicates if any
        const uniqueAssignments = Array.from(new Map(allAssignments.map(item => [item.id || item._id, item])).values());
        setAssignments(uniqueAssignments);

      } catch (error) {
        console.error('Error fetching student assignments:', error);
        toast.error(t('common.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [user, t]);

  const handleOpenSubmit = (assignment: any) => {
    setSelectedAssignment(assignment);
    setSubmissionFile(null);
    setSubmissionNote('');
    setUploadProgress(0);
    setIsSubmitDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedAssignment) return;
    
    // Require file for now?
    if (!submissionFile && !submissionNote) {
      toast.error(t('assignments.error.fillAll'));
      return;
    }

    try {
      setLoading(true);

      // Simulate Upload
      if (submissionFile) {
        for (let i = 0; i <= 100; i += 20) {
          setUploadProgress(i);
          await new Promise(r => setTimeout(r, 200));
        }
      }

      // Real API Call
      await api.assignment.submitAssignment(selectedAssignment.id || selectedAssignment._id, {
        content: submissionFile ? `File: ${submissionFile.name}` : 'Text Submission',
        notes: submissionNote,
        attachments: submissionFile ? [{
          name: submissionFile.name,
          type: submissionFile.type,
          size: submissionFile.size,
          url: URL.createObjectURL(submissionFile) // Local URL for now
        }] : []
      });

      toast.success(t('assignments.status.submitted'));
      setIsSubmitDialogOpen(false);
      
      // Update local state
      setAssignments(prev => prev.map(a => {
        if (a.id === selectedAssignment.id || a._id === selectedAssignment._id) {
          return {
            ...a,
            status: 'submitted',
            submittedDate: new Date().toISOString()
          };
        }
        return a;
      }));

    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error?.message || t('error.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'; // pending
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
        case 'project': return <Target className="h-4 w-4" />;
        case 'quiz': return <BookOpen className="h-4 w-4" />;
        case 'exam': return <Timer className="h-4 w-4" />;
        default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t('assignments.pageTitle')}</h1>
        <p className="text-gray-600 mt-1">{t('assignments.pageSubtitle')}</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-4" isRTL={isRTL}>
        <TabsList>
          <TabsTrigger value="pending">{t('assignments.tab.todo')}</TabsTrigger>
          <TabsTrigger value="submitted">{t('assignments.tab.submitted')}</TabsTrigger>
          <TabsTrigger value="graded">{t('assignments.tab.graded')}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {assignments.filter(a => !['submitted', 'graded'].includes(a.status)).map(assignment => (
            <AssignmentCard 
              key={assignment.id || assignment._id} 
              assignment={assignment} 
              onAction={() => handleOpenSubmit(assignment)}
              actionLabel={t('assignments.submitAssignment')}
              getTypeIcon={getTypeIcon}
              getStatusColor={getStatusColor}
              t={t}
              isRTL={isRTL}
            />
          ))}
          {assignments.filter(a => !['submitted', 'graded'].includes(a.status)).length === 0 && (
             <EmptyState message={t('assignments.noPending')} />
          )}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4">
          {assignments.filter(a => a.status === 'submitted').map(assignment => (
            <AssignmentCard 
              key={assignment.id || assignment._id} 
              assignment={assignment} 
              actionLabel={t('assignments.viewSubmission')}
              getTypeIcon={getTypeIcon}
              getStatusColor={getStatusColor}
              t={t}
              isRTL={isRTL}
            />
          ))}
           {assignments.filter(a => a.status === 'submitted').length === 0 && (
             <EmptyState message={t('assignments.noSubmitted')} />
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {assignments.filter(a => a.status === 'graded').map(assignment => (
            <AssignmentCard 
              key={assignment.id || assignment._id} 
              assignment={assignment} 
              actionLabel={t('assignments.viewFeedback')}
              getTypeIcon={getTypeIcon}
              getStatusColor={getStatusColor}
              showGrade
              t={t}
              isRTL={isRTL}
            />
          ))}
           {assignments.filter(a => a.status === 'graded').length === 0 && (
             <EmptyState message={t('assignments.noGraded')} />
          )}
        </TabsContent>
      </Tabs>

      {/* Submit Dialog */}
      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('assignments.submitAssignment')}</DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{t('assignments.uploadFile')}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">
                    {submissionFile ? submissionFile.name : t('assignments.clickToUpload')}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    {t('assignments.fileConstraints')}
                  </span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('assignments.notes')}</Label>
              <Textarea 
                value={submissionNote}
                onChange={(e) => setSubmissionNote(e.target.value)}
                placeholder={t('assignments.notesPlaceholder')}
              />
            </div>
            
            {uploadProgress > 0 && uploadProgress < 100 && (
                 <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-teal-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                 </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>{t('assignments.cancel')}</Button>
            <Button onClick={handleSubmit} disabled={loading || (!submissionFile && !submissionNote)}>
              {loading ? t('assignments.submitting') : t('assignments.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AssignmentCard({ assignment, onAction, actionLabel, getTypeIcon, getStatusColor, showGrade = false, t, isRTL }: any) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 rtl:space-x-reverse">
            <div className="p-3 bg-gray-100 rounded-lg h-fit">
              {getTypeIcon(assignment.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900">{assignment.title}</h3>
              <p className="text-gray-500 text-sm mb-2">{assignment.course?.title || t('courses.courseName')}</p>
              
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 rtl:space-x-reverse">
                <span className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {t('assignments.due')} {new Date(assignment.dueDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Target className="h-4 w-4" />
                  {t('assignments.points')} {assignment.maxPoints || 100}
                </span>
                {showGrade && (
                     <span className="flex items-center gap-1 font-bold text-green-600">
                        <Star className="h-4 w-4" />
                        {t('assignments.grade')} {assignment.grade} / {assignment.maxPoints || 100}
                     </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <Badge className={getStatusColor(assignment.status || 'pending')}>
              {t(`assignments.status.${assignment.status || 'pending'}`)}
            </Badge>
            {onAction && (
              <Button size="sm" onClick={onAction} className="bg-teal-600 hover:bg-teal-700">
                {actionLabel}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-gray-500">{message}</p>
        </div>
    );
}
