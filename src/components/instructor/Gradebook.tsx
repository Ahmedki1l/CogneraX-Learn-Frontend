import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Book, 
  Plus, 
  Filter, 
  Download, 
  Upload, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  MessageSquare, 
  Mic, 
  Video, 
  FileText, 
  Users, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Save,
  Send,
  Calendar,
  Target,
  Award,
  BarChart3,
  TrendingUp,
  ClipboardList,
  Brain
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { api } from '../../services/api';
import type { Exam, ExamSubmission } from '../../interfaces/exam.types';
import type { GradebookOverviewStats, GradebookStudent, Rubric, RubricCriterion } from '../../interfaces/gradebook.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';

interface GradebookProps {
  user: any;
}

interface Assignment {
  id: string;
  title: string;
  type: string;
  dueDate: string;
  maxPoints: number;
  submissions: number;
  graded: number;
  avgScore: number;
  status: string;
}

interface Submission {
  id: string;
  userId: string;
  userName: string;
  submittedAt: string;
  content: string;
  score?: number;
  feedback?: string;
  status: string;
  attachments?: any[];
}

interface Course {
  id: string;
  name: string;
  students: number;
}

type Student = GradebookStudent;



export function Gradebook({ user }: GradebookProps) {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingMode, setGradingMode] = useState('overview');
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [rubricsLoading, setRubricsLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [overviewStats, setOverviewStats] = useState<GradebookOverviewStats | null>(null);
  const [students, setStudents] = useState<GradebookStudent[]>([]);
  const [rubricCriteria, setRubricCriteria] = useState<RubricCriterion[]>([]);
  const [rubrics, setRubrics] = useState<Rubric[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // View mode: 'assignments' or 'exams'
  const [viewMode, setViewMode] = useState<'assignments' | 'exams'>('assignments');
  
  // Exam-related state
  const [exams, setExams] = useState<Exam[]>([]);
  const [examSubmissions, setExamSubmissions] = useState<Record<string, ExamSubmission[]>>({});
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [examsLoading, setExamsLoading] = useState(false);

  // Fetch assignments and submissions from API
  React.useEffect(() => {
    const fetchGradebookData = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId || !selectedCourse) {
          return;
        }

        const assignmentsResponse = await api.assignment.getAssignments({
          courseId: selectedCourse,
          instructorId: userId
        });
        
        if (assignmentsResponse && Array.isArray(assignmentsResponse) && assignmentsResponse.length > 0) {
          setAssignments(assignmentsResponse);
        } else if (assignmentsResponse && Array.isArray(assignmentsResponse)) {
          setAssignments([]);
          toast.info('No assignments available for this course');
        } else {
          setAssignments([]);
        }

        // Only fetch submissions if an assignment is selected
        if (selectedAssignment?.id) {
          const submissionsResponse = await api.assignment.getAssignmentSubmissions(selectedAssignment.id);
          
          if (submissionsResponse && Array.isArray(submissionsResponse)) {
            setSubmissions(submissionsResponse);
          } else {
            setSubmissions([]);
          }
        }

      } catch (error: any) {
        console.error('Error fetching gradebook data:', error);
        setAssignments([]);
        setSubmissions([]);
        toast.error(error?.message || 'Failed to load gradebook data');
      } finally {
        setLoading(false);
      }
    };

    if ((user?.id || user?._id) && selectedCourse) {
      fetchGradebookData();
    }
  }, [user?.id, user?._id, selectedCourse, selectedAssignment?.id]);

  // Reset selection when course changes
  useEffect(() => {
    setSelectedAssignment(null);
  }, [selectedCourse]);

  // Fetch courses accessible to instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true);
        const instructorId = user?.id || user?._id;
        if (!instructorId) return;

        const response = await api.course.getAccessibleCourses(instructorId);
        const data = response?.data?.fields || response?.fields || response || [];

        // Flatten fields -> courses if the response is grouped
        const flattenedCourses: Course[] = Array.isArray(data)
          ? data.flatMap((field: any) => (field.courses || [])).map((course: any) => ({
              id: course._id || course.id,
              name: course.title || course.name || 'Untitled course',
              students: course.students || 0,
            }))
          : [];

        // Fallback if response is a simple array of courses
        const simpleCourses: Course[] = Array.isArray(response)
          ? response.map((course: any) => ({
              id: course._id || course.id,
              name: course.title || course.name || 'Untitled course',
              students: course.students || 0,
            }))
          : [];

        const finalCourses = flattenedCourses.length > 0 ? flattenedCourses : simpleCourses;
        setCourses(finalCourses);

        // If no course selected yet, default to the first available
        if (!selectedCourse && finalCourses.length > 0) {
          setSelectedCourse(finalCourses[0].id);
        }
      } catch (error: any) {
        console.error('Error fetching courses for instructor:', error);
        toast.error(error?.message || 'Failed to load courses');
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    fetchCourses();
  }, [user?.id, user?._id]);

  // Fetch overview statistics
  useEffect(() => {
    const fetchOverview = async () => {
      if (!selectedCourse) return;
      try {
        setOverviewLoading(true);
        const response = await api.gradebook.getGradebookOverview(selectedCourse);
        const stats = response?.data || response || null;
        setOverviewStats(stats);
      } catch (error: any) {
        console.error('Error fetching gradebook overview:', error);
        setOverviewStats(null);
      } finally {
        setOverviewLoading(false);
      }
    };

    fetchOverview();
  }, [selectedCourse]);

  // Fetch students with grades
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedCourse) return;
      try {
        setStudentsLoading(true);
        const response = await api.gradebook.getGradebookStudents(selectedCourse, { limit: 100 });
        const data = response?.data?.students || response?.students || response || [];
        setStudents(Array.isArray(data) ? data : []);
      } catch (error: any) {
        console.error('Error fetching gradebook students:', error);
        toast.error(error?.message || 'Failed to load students');
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse]);

  // Fetch rubrics
  useEffect(() => {
    const fetchRubrics = async () => {
      if (!selectedCourse) return;
      try {
        setRubricsLoading(true);
        const response = await api.gradebook.getRubrics(selectedCourse);
        const data = response?.data?.rubrics || response?.rubrics || response || [];
        setRubrics(Array.isArray(data) ? data : []);
        const criteria = Array.isArray(data) && data.length > 0 ? data[0].criteria || [] : [];
        setRubricCriteria(criteria);
      } catch (error: any) {
        console.error('Error fetching rubrics:', error);
        setRubrics([]);
        setRubricCriteria([]);
      } finally {
        setRubricsLoading(false);
      }
    };

    fetchRubrics();
  }, [selectedCourse]);

  // Fetch exams data
  React.useEffect(() => {
    const fetchExamsData = async () => {
      if (viewMode !== 'exams') return;
      
      try {
        setExamsLoading(true);
        const userId = user?.id || user?._id;
        
        if (!userId) return;

        const response = await api.exam.getExams({
          instructorId: userId,
          courseId: selectedCourse || undefined,
          limit: 100
        });
        
        const examsData = response?.data?.exams || response?.exams || [];
        setExams(examsData);
        
        // Load submissions for each exam
        const submissionsMap: Record<string, ExamSubmission[]> = {};
        for (const exam of examsData) {
          try {
            const submissionsResponse = await api.exam.getSubmissions(exam.id, { limit: 100 });
            submissionsMap[exam.id] = submissionsResponse?.data?.submissions || submissionsResponse?.submissions || [];
          } catch (error) {
            console.error(`Failed to load submissions for exam ${exam.id}:`, error);
            submissionsMap[exam.id] = [];
          }
        }
        setExamSubmissions(submissionsMap);
        
      } catch (error: any) {
        console.error('Error fetching exams:', error);
        setExams([]);
        toast.error(error?.message || 'Failed to load exams');
      } finally {
        setExamsLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchExamsData();
    }
  }, [user?.id, user?._id, selectedCourse, viewMode]);

  // Grade submission function
  const handleGradeSubmission = async (submissionId: string, score: number, feedback: string) => {
    try {
      const response = await api.assignment.gradeSubmission(submissionId, {
        score,
        feedback,
        isGraded: true
      });
      
      if (response) {
        setSubmissions(prev => prev.map(sub => 
          sub.id === submissionId ? { ...sub, score, feedback, status: 'graded' } : sub
        ));
        toast.success('Grade submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error grading submission:', error);
      toast.error(error?.message || 'Failed to grade submission');
    }
  };

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'homework': return FileText;
      case 'project': return Users;
      case 'essay': return Edit;
      case 'peer-review': return MessageSquare;
      default: return FileText;
    }
  };

  // Helper to get exam statistics
  const getExamStats = (examId: string) => {
    const submissions = examSubmissions[examId] || [];
    const graded = submissions.filter(s => s.status === 'graded');
    const totalScore = graded.reduce((sum, s) => sum + (s.score || 0), 0);
    const avgScore = graded.length > 0 ? Math.round(totalScore / graded.length) : 0;
    
    return {
      totalSubmissions: submissions.length,
      gradedCount: graded.length,
      pendingCount: submissions.filter(s => s.status === 'submitted').length,
      avgScore
    };
  };

  // Navigate to ExamSubmissions for grading
  const handleGradeExam = (exam: Exam) => {
    navigate(`/instructor/exam-submissions?examId=${exam.id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'grading': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const GradingInterface = ({ student, assignment }: { student: Student; assignment: Assignment }) => (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{student.name}</h3>
            <p className="text-gray-600">{assignment.title}</p>
          </div>
          <Badge className={getStatusColor(assignment.status)}>
            {assignment.status}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Score (out of {assignment.maxPoints})</Label>
              <Input 
                type="number" 
                placeholder="Enter score" 
                max={assignment.maxPoints}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Written Feedback</Label>
              <Textarea 
                placeholder="Provide detailed feedback..." 
                className="mt-1 h-32"
              />
            </div>

            <div className="space-y-2">
              <Label>Audio/Video Feedback</Label>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Record Audio
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Video className="h-4 w-4" />
                  Record Video
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Rubric Assessment</Label>
              <div className="mt-2 space-y-3">
                {rubricCriteria.map((criteria) => (
                  <div key={criteria.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{criteria.name}</span>
                      <span className="text-sm text-gray-500">{criteria.weight}%</span>
                    </div>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        {criteria.levels.map((level) => (
                          <SelectItem key={level.points} value={level.points.toString()}>
                            {level.points} - {level.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline">Save Draft</Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Submit Grade
          </Button>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            {t('gradebook.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('gradebook.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button 
              variant={viewMode === 'assignments' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('assignments')}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Assignments
            </Button>
            <Button 
              variant={viewMode === 'exams' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('exams')}
              className="gap-2"
            >
              <ClipboardList className="h-4 w-4" />
              Exams
            </Button>
          </div>
          
          <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={coursesLoading || courses.length === 0}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder={coursesLoading ? 'Loading courses...' : 'Select Course'} />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import Grades
          </Button>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {viewMode === 'assignments' ? 'New Assignment' : 'New Exam'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t('gradebook.overview')}</TabsTrigger>
          <TabsTrigger value="assignments">{t('gradebook.assignments')}</TabsTrigger>
          <TabsTrigger value="exams">{t('exams.title')}</TabsTrigger>
          <TabsTrigger value="grading">{t('gradebook.gradeSubmission')}</TabsTrigger>
          <TabsTrigger value="rubrics">{t('gradebook.rubric')}</TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {overviewLoading ? '...' : overviewStats?.totalAssignments ?? 0}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600">
                    {overviewLoading ? '...' : `${overviewStats?.activeAssignments ?? 0} active`}
                  </span>
                  <span className="text-gray-500 ml-2">
                    {overviewLoading ? '' : `${overviewStats?.completedAssignments ?? 0} completed`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Pending Grades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {overviewLoading ? '...' : overviewStats?.pendingGrades ?? 0}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">
                    {overviewLoading ? 'Loading...' : 'Needs attention'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Class Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {overviewLoading ? '...' : `${overviewStats?.classAverage ?? 0}%`}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">
                    {overviewLoading
                      ? 'Loading...'
                      : overviewStats?.classAverageDelta !== undefined
                        ? `${overviewStats.classAverageDelta}% vs last period`
                        : 'Class trend'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {overviewLoading ? '...' : `${overviewStats?.completionRate ?? 0}%`}
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">
                    {overviewLoading ? 'Loading...' : 'On track'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Student Overview Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Student Progress Overview</CardTitle>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {studentsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading students...</div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No students found for this course.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Student</th>
                        <th className="text-left py-3 px-4">Overall Grade</th>
                        {assignments.map((assignment) => (
                          <th key={assignment.id} className="text-center py-3 px-2 min-w-24">
                            <div className="text-sm font-medium">{assignment.title}</div>
                            <div className="text-xs text-gray-500">/{assignment.maxPoints}</div>
                          </th>
                        ))}
                        {exams.map((exam) => (
                          <th key={exam.id} className="text-center py-3 px-2 min-w-24">
                            <div className="text-sm font-medium">{exam.title}</div>
                            <div className="text-xs text-gray-500">/{exam.totalPoints}</div>
                          </th>
                        ))}
                        <th className="text-center py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {student.avatar || student.name?.[0] || '?'}
                                </span>
                              </div>
                              <span className="font-medium">{student.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-lg">{student.overall ?? 0}%</span>
                              <Badge variant={student.overall >= 90 ? 'default' : student.overall >= 80 ? 'secondary' : 'destructive'}>
                                {student.overall >= 90 ? 'A' : student.overall >= 80 ? 'B' : student.overall >= 70 ? 'C' : 'D'}
                              </Badge>
                            </div>
                          </td>
                          {assignments.map((assignment) => {
                            const submission = student.assignments?.[assignment.id];
                            return (
                              <td key={assignment.id} className="py-4 px-2 text-center">
                                {submission?.submitted ? (
                                  <div className="space-y-1">
                                    <div className={`font-medium ${submission.late ? 'text-yellow-600' : 'text-gray-900'}`}>
                                      {submission.score ?? '-'} / {submission.maxPoints}
                                    </div>
                                    {submission.late && (
                                      <Badge variant="outline" className="text-xs">
                                        Late
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">Not submitted</span>
                                )}
                              </td>
                            );
                          })}
                          {exams.map((exam) => {
                            const grade = student.exams?.[exam.id];
                            return (
                              <td key={exam.id} className="py-4 px-2 text-center">
                                {grade ? (
                                  <div className="space-y-1">
                                    <div className="font-medium text-gray-900">
                                      {grade.score ?? '-'} / {grade.maxScore ?? exam.totalPoints}
                                    </div>
                                    {grade.letterGrade && (
                                      <Badge variant="outline" className="text-xs">
                                        {grade.letterGrade}
                                      </Badge>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400">No grade</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="py-4 px-4 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Grade Assignment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Assignments Management */}
        <TabsContent value="assignments" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const TypeIcon = getAssignmentTypeIcon(assignment.type);
              return (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          <TypeIcon className="h-5 w-5 text-teal-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                          <CardDescription className="capitalize">
                            {assignment.type.replace('-', ' ')}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Due Date:</span>
                          <div className="font-medium">{assignment.dueDate}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Max Points:</span>
                          <div className="font-medium">{assignment.maxPoints}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Submissions:</span>
                          <div className="font-medium">{assignment.submissions}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Graded:</span>
                          <div className="font-medium">{assignment.graded}</div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-500">Grading Progress</span>
                          <span className="text-sm font-medium">
                            {assignment.submissions > 0 ? Math.round((assignment.graded / assignment.submissions) * 100) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={assignment.submissions > 0 ? (assignment.graded / assignment.submissions) * 100 : 0} 
                          className="h-2"
                        />
                      </div>

                      {assignment.avgScore > 0 && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Average Score</span>
                            <span className="font-semibold text-lg">{assignment.avgScore}%</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" className="gap-2">
                          <BarChart3 className="h-4 w-4" />
                          Grade
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Exams Management */}
        <TabsContent value="exams" className="space-y-6">
          {examsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-teal-200 border-t-teal-600 rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading exams...</p>
            </div>
          ) : exams.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700">No Exams Found</h3>
                <p className="text-gray-500 mt-2">Create an exam to start grading student submissions.</p>
                <Button className="mt-4 gap-2" onClick={() => navigate('/instructor/exam-management')}>
                  <Plus className="h-4 w-4" />
                  Create New Exam
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map((exam) => {
                const stats = getExamStats(exam.id);
                return (
                  <Card key={exam.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <ClipboardList className="h-5 w-5 text-purple-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{exam.title}</CardTitle>
                            <CardDescription>
                              {exam.duration} minutes • {exam.totalPoints} points
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={getStatusColor(exam.status)}>
                          {exam.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Scheduled:</span>
                            <div className="font-medium">
                              {exam.scheduledDate 
                                ? new Date(exam.scheduledDate).toLocaleDateString() 
                                : 'Not scheduled'}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Questions:</span>
                            <div className="font-medium">{exam.questionCount || exam.sections?.reduce((sum, s) => sum + (s.questions?.length || 0), 0) || 0}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Submissions:</span>
                            <div className="font-medium">{stats.totalSubmissions}</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Graded:</span>
                            <div className="font-medium">{stats.gradedCount}</div>
                          </div>
                        </div>

                        {stats.totalSubmissions > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-gray-500">Grading Progress</span>
                              <span className="text-sm font-medium">
                                {Math.round((stats.gradedCount / stats.totalSubmissions) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(stats.gradedCount / stats.totalSubmissions) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}

                        {stats.gradedCount > 0 && (
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Average Score</span>
                              <span className="font-semibold text-lg">{stats.avgScore}%</span>
                            </div>
                          </div>
                        )}

                        {stats.pendingCount > 0 && (
                          <div className="flex items-center gap-2 text-amber-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {stats.pendingCount} submission(s) pending grading
                          </div>
                        )}

                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => navigate(`/instructor/exam-management?edit=${exam.id}`)}>
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                          <Button size="sm" className="gap-2" onClick={() => handleGradeExam(exam)}>
                            <BarChart3 className="h-4 w-4" />
                            Grade
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Grading Interface */}
        <TabsContent value="grading" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Grade Assignments</h2>
              <p className="text-gray-600">Provide detailed feedback and grades for student submissions</p>
            </div>
            <Select>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select assignment to grade" />
              </SelectTrigger>
              <SelectContent>
                {assignments.filter(a => a.submissions > a.graded).map((assignment) => (
                  <SelectItem key={assignment.id} value={assignment.id.toString()}>
                    {assignment.title} ({assignment.submissions - assignment.graded} pending)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sample grading interface */}
          <GradingInterface 
            student={students[0]} 
            assignment={assignments[0]} 
          />
        </TabsContent>

        {/* Rubric Manager */}
        <TabsContent value="rubrics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Custom Rubrics</h2>
              <p className="text-gray-600">Create and manage assessment rubrics for consistent grading</p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create New Rubric
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mathematics Problem Solving Rubric</CardTitle>
              <CardDescription>
                Comprehensive rubric for evaluating mathematical problem-solving skills
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rubricsLoading ? (
                <div className="text-center text-gray-500 py-6">Loading rubrics...</div>
              ) : rubrics.length === 0 ? (
                <div className="text-center text-gray-500 py-6">No rubrics found for this course.</div>
              ) : (
                <div className="space-y-6">
                  {rubricCriteria.map((criteria) => (
                    <div key={criteria.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">{criteria.name}</h4>
                        <Badge variant="secondary">{criteria.weight}% weight</Badge>
                      </div>
                      <div className="grid gap-3">
                        {criteria.levels.map((level) => (
                          <div key={level.points} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className="text-center">
                              <div className="font-bold text-lg">{level.points}</div>
                              <div className="text-xs text-gray-500">points</div>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">{level.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex justify-end space-x-2 mt-6">
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Rubric
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}