import React, { useState } from 'react';
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
  TrendingUp
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { api } from '../../services/api';
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

interface Student {
  id: number;
  name: string;
  avatar: string;
  assignments: Record<number, {
    score: number | null;
    submitted: boolean;
    late: boolean;
    feedback: string;
  }>;
  overall: number;
}

interface RubricCriterion {
  id: number;
  name: string;
  weight: number;
  levels: Array<{
    points: number;
    description: string;
  }>;
}

export function Gradebook({ user }: GradebookProps) {
  const { t, isRTL } = useLanguage();
  const [selectedCourse, setSelectedCourse] = useState('math');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingMode, setGradingMode] = useState('overview');
  const [showRubricDialog, setShowRubricDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

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

  // TODO: Fetch courses, students, and rubric criteria from API
  // For now, using empty arrays - these should be populated from API calls
  const courses: Course[] = [];
  const students: Student[] = [];
  const rubricCriteria: RubricCriterion[] = [];

  // Legacy mock data structure - keeping interfaces but removing data
  // These will be replaced with API data
  const _emptyRubricCriteria = [
    {
      id: 1,
      name: 'Problem Understanding',
      weight: 25,
      levels: [
        { points: 4, description: 'Demonstrates complete understanding of the problem' },
        { points: 3, description: 'Demonstrates substantial understanding' },
        { points: 2, description: 'Demonstrates partial understanding' },
        { points: 1, description: 'Demonstrates little understanding' },
        { points: 0, description: 'No understanding demonstrated' }
      ]
    },
    {
      id: 2,
      name: 'Mathematical Reasoning',
      weight: 30,
      levels: [
        { points: 4, description: 'Uses complex and refined mathematical reasoning' },
        { points: 3, description: 'Uses effective mathematical reasoning' },
        { points: 2, description: 'Some evidence of mathematical reasoning' },
        { points: 1, description: 'Little evidence of mathematical reasoning' },
        { points: 0, description: 'No evidence of mathematical reasoning' }
      ]
    },
    {
      id: 3,
      name: 'Communication',
      weight: 25,
      levels: [
        { points: 4, description: 'Clear, detailed explanation of solution process' },
        { points: 3, description: 'Clear explanation with minor gaps' },
        { points: 2, description: 'Somewhat clear explanation' },
        { points: 1, description: 'Unclear or confusing explanation' },
        { points: 0, description: 'No explanation provided' }
      ]
    },
    {
      id: 4,
      name: 'Accuracy',
      weight: 20,
      levels: [
        { points: 4, description: 'All calculations and final answer are correct' },
        { points: 3, description: 'Minor calculation errors' },
        { points: 2, description: 'Some calculation errors' },
        { points: 1, description: 'Major calculation errors' },
        { points: 0, description: 'No correct calculations' }
      ]
    }
  ];

  const getAssignmentTypeIcon = (type: string) => {
    switch (type) {
      case 'homework': return FileText;
      case 'project': return Users;
      case 'essay': return Edit;
      case 'peer-review': return MessageSquare;
      default: return FileText;
    }
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
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            Comprehensive Gradebook
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced grading system with custom rubrics and multimedia feedback
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Course" />
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
            New Assignment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="grading">Grade Assignments</TabsTrigger>
          <TabsTrigger value="rubrics">Rubric Manager</TabsTrigger>
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
                <div className="text-2xl font-bold text-gray-900">12</div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-green-600">4 active</span>
                  <span className="text-gray-500 ml-2">8 completed</span>
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
                <div className="text-2xl font-bold text-gray-900">23</div>
                <div className="flex items-center mt-2 text-sm">
                  <AlertCircle className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-yellow-600">Needs attention</span>
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
                <div className="text-2xl font-bold text-gray-900">84.2%</div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">+2.1% vs last week</span>
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
                <div className="text-2xl font-bold text-gray-900">91%</div>
                <div className="flex items-center mt-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">On track</span>
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
                      <th className="text-center py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">{student.avatar}</span>
                            </div>
                            <span className="font-medium">{student.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-lg">{student.overall}%</span>
                            <Badge variant={student.overall >= 90 ? 'default' : student.overall >= 80 ? 'secondary' : 'destructive'}>
                              {student.overall >= 90 ? 'A' : student.overall >= 80 ? 'B' : student.overall >= 70 ? 'C' : 'D'}
                            </Badge>
                          </div>
                        </td>
                        {assignments.map((assignment) => {
                          const submission = student.assignments[assignment.id];
                          return (
                            <td key={assignment.id} className="py-4 px-2 text-center">
                              {submission?.submitted ? (
                                <div className="space-y-1">
                                  <div className={`font-medium ${submission.late ? 'text-yellow-600' : 'text-gray-900'}`}>
                                    {submission.score || '-'}/{assignment.maxPoints}
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