import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from '../ui/calendar';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Calendar as CalendarIcon,
  Upload,
  Download,
  Eye,
  Edit,
  Star,
  BookOpen,
  Timer,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface Assignment {
  id: string;
  title: string;
  course: string;
  instructor: string;
  type: 'essay' | 'project' | 'quiz' | 'presentation';
  dueDate: string;
  submittedDate?: string;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  grade?: number;
  maxGrade: number;
  feedback?: string;
  description: string;
  attachments?: string[];
  submissionFile?: string;
}

interface ScheduledEvent {
  id: string;
  title: string;
  course: string;
  type: 'assignment' | 'quiz' | 'exam' | 'presentation';
  date: string;
  time: string;
  duration?: string;
  description: string;
  isCompleted: boolean;
}

interface StudentSubmissionsProps {
  user?: any;
}

export function StudentSubmissions({ user }: StudentSubmissionsProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<ScheduledEvent[]>([]);

  // Fetch assignments and submissions from API
  React.useEffect(() => {
    const fetchSubmissionsData = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          toast.error('User ID not found');
          return;
        }

        // Fetch assignments for the instructor
        const assignmentsResponse = await api.assignment.getAssignments({
          instructorId: userId
        });
        
        if (assignmentsResponse && Array.isArray(assignmentsResponse) && assignmentsResponse.length > 0) {
          setAssignments(assignmentsResponse);
        } else if (assignmentsResponse && Array.isArray(assignmentsResponse)) {
          setAssignments([]);
          toast.info('No assignments available');
        } else {
          setAssignments([]);
        }

        // For scheduled events, we'll fetch upcoming assignments and convert them
        const upcomingAssignments = await api.assignment.getAssignments({
          instructorId: userId,
          status: 'published'
        });
        
        if (upcomingAssignments && Array.isArray(upcomingAssignments)) {
          // Convert assignments to scheduled events for display
          const events: ScheduledEvent[] = upcomingAssignments.map((assignment: any) => ({
            id: assignment.id,
            title: assignment.title,
            course: assignment.course || 'General',
            type: assignment.type || 'assignment',
            date: assignment.dueDate || new Date().toISOString().split('T')[0],
            time: '00:00',
            duration: 'TBD',
            description: assignment.description || '',
            isCompleted: assignment.status === 'graded' || assignment.status === 'completed'
          }));
          setScheduledEvents(events);
        } else {
          setScheduledEvents([]);
        }

      } catch (error: any) {
        console.error('Error fetching submissions data:', error);
        setAssignments([]);
        setScheduledEvents([]);
        toast.error(error?.message || 'Failed to load assignments data');
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user ID is available
    if (user?.id || user?._id) {
      fetchSubmissionsData();
    }
  }, [user?.id, user?._id]);

  // Submit assignment function
  const handleSubmitAssignment = async (assignmentId: string, file: File, comment?: string) => {
    try {
      // Prepare submission data according to API spec
      const submissionData = {
        content: `File uploaded: ${file.name}`,
        attachments: [], // Will be handled by upload API separately
        notes: comment || ''
      };

      const response = await api.assignment.submitAssignment(assignmentId, submissionData);
      
      if (response) {
        setAssignments(prev => prev.map(assignment => 
          assignment.id === assignmentId 
            ? { ...assignment, status: 'submitted', submittedDate: new Date().toISOString().split('T')[0] }
            : assignment
        ));
        toast.success('Assignment submitted successfully!');
      }
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      toast.error(error?.message || 'Failed to submit assignment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'graded':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'essay':
        return <FileText className="h-4 w-4" />;
      case 'project':
        return <Target className="h-4 w-4" />;
      case 'quiz':
        return <BookOpen className="h-4 w-4" />;
      case 'presentation':
        return <Eye className="h-4 w-4" />;
      case 'exam':
        return <Timer className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const handleUploadSubmission = async (assignmentId: string) => {
    setLoading(true);
    
    try {
      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Submission uploaded successfully!');
    } catch (error) {
      toast.error('Failed to upload submission');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (assignment: Assignment) => {
    toast.info(`Opening ${assignment.submissionFile}`);
  };

  const upcomingDeadlines = assignments
    .filter(a => a.status === 'pending' || a.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 3);

  const recentlyGraded = assignments
    .filter(a => a.status === 'graded')
    .sort((a, b) => new Date(b.submittedDate || '').getTime() - new Date(a.submittedDate || '').getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Submissions & Assignments
          </h1>
          <p className="text-gray-600 mt-2">
            Track your assignments, submissions, and upcoming deadlines
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Submitted</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'submitted').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'graded').length}
                </p>
              </div>
              <Star className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {assignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignments and Calendar */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="assignments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>

            <TabsContent value="assignments" className="space-y-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(assignment.type)}
                          <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        </div>
                        <CardDescription>
                          {assignment.course} • {assignment.instructor}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(assignment.status)}>
                        {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{assignment.description}</p>

                    {/* Assignment Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        <span>Max: {assignment.maxGrade} points</span>
                      </div>
                      {assignment.submittedDate && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <span>Submitted: {new Date(assignment.submittedDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Grade and Feedback */}
                    {assignment.status === 'graded' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800">Grade:</span>
                          <span className="text-xl font-bold text-green-600">
                            {assignment.grade}/{assignment.maxGrade}
                          </span>
                        </div>
                        {assignment.feedback && (
                          <div>
                            <span className="font-medium text-green-800">Feedback:</span>
                            <p className="text-sm text-green-700 mt-1">{assignment.feedback}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {assignment.status === 'pending' ? (
                        <Button
                          onClick={() => handleUploadSubmission(assignment.id)}
                          disabled={loading}
                          className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Submission
                        </Button>
                      ) : assignment.submissionFile ? (
                        <Button
                          variant="outline"
                          onClick={() => handleViewSubmission(assignment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      ) : null}
                      
                      {assignment.status === 'pending' && (
                        <Button variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Draft
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              {scheduledEvents.map((event) => (
                <Card key={event.id} className={`hover:shadow-lg transition-shadow ${event.isCompleted ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(event.type)}
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                        </div>
                        <CardDescription>{event.course}</CardDescription>
                      </div>
                      <Badge className={event.isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {event.isCompleted ? 'Completed' : 'Upcoming'}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{event.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(event.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{event.time}</span>
                      </div>
                      {event.duration && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-4 w-4" />
                          <span>{event.duration}</span>
                        </div>
                      )}
                    </div>

                    {!event.isCompleted && (
                      <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white">
                        Join {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
              />
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingDeadlines.map((assignment) => (
                <div key={assignment.id} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex-shrink-0">
                    {getTypeIcon(assignment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.course}</p>
                    <p className="text-xs text-orange-600 font-medium mt-1">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recently Graded */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-green-500" />
                Recently Graded
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentlyGraded.map((assignment) => (
                <div key={assignment.id} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex-shrink-0">
                    {getTypeIcon(assignment.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{assignment.title}</p>
                    <p className="text-xs text-gray-500">{assignment.course}</p>
                    <p className="text-sm text-green-600 font-bold mt-1">
                      {assignment.grade}/{assignment.maxGrade}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}