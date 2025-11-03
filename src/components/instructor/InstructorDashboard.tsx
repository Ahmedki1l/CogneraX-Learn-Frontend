import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  TrendingUp, 
  Clock,
  PlayCircle,
  FileText,
  MessageCircle,
  Award,
  Calendar,
  BarChart3,
  PlusCircle,
  Eye,
  Edit,
  Star,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Download,
  Upload,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface InstructorDashboardProps {
  user: any;
  onNavigateToLesson?: (lesson: any) => void;
}

export function InstructorDashboard({ user, onNavigateToLesson }: InstructorDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real instructor data from API
  const [instructorStats, setInstructorStats] = useState({
    totalStudents: 0,
    activeCourses: 0,
    totalLessons: 0,
    avgRating: 0,
    completionRate: 0,
    monthlyEngagement: 0,
    totalRevenue: 0,
    newStudentsThisMonth: 0
  });

  const [courses, setCourses] = useState<any[]>([]);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);

  // Fetch instructor dashboard data
  useEffect(() => {
    console.log('🎯 InstructorDashboard MOUNTED', { user });
    
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎯 Fetching instructor analytics...');
        // Fetch instructor analytics
        const analyticsResponse = await api.analytics.getInstructorDashboard();
        console.log('🎯 Instructor analytics response:', analyticsResponse);
        if (analyticsResponse) {
          setInstructorStats({
            totalStudents: analyticsResponse.totalStudents || 0,
            activeCourses: analyticsResponse.activeCourses || 0,
            totalLessons: analyticsResponse.totalLessons || 0,
            avgRating: analyticsResponse.avgRating || 0,
            completionRate: analyticsResponse.completionRate || 0,
            monthlyEngagement: analyticsResponse.monthlyEngagement || 0,
            totalRevenue: analyticsResponse.totalRevenue || 0,
            newStudentsThisMonth: analyticsResponse.newStudentsThisMonth || 0
          });
        }

        // Fetch instructor courses
        // Use either user.id or user._id (MongoDB)
        const instructorId = user?.id || user?._id;
        console.log('🔍 Fetching courses for instructor:', instructorId);
        const coursesResponse = await api.course.getCourses({ instructor: instructorId });
        console.log('📚 Courses response:', coursesResponse);
        if (coursesResponse) {
          setCourses(coursesResponse);
        }

        // Fetch recent lessons (mock for now as we don't have a specific endpoint)
        setRecentLessons([
          {
            id: 1,
            courseId: 1,
            title: 'Introduction to React Hooks',
            courseTitle: 'React Fundamentals',
            duration: '15 min',
            views: 89,
            completion: 78,
            lastUpdated: '2024-02-15',
            status: 'published'
          },
          {
            id: 2,
            courseId: 2,
            title: 'Async/Await in JavaScript',
            courseTitle: 'Advanced JavaScript',
            duration: '22 min',
            views: 67,
            completion: 65,
            lastUpdated: '2024-02-10',
            status: 'published'
          },
          {
            id: 3,
            courseId: 1,
            title: 'State Management with Redux',
            courseTitle: 'React Fundamentals',
            duration: '18 min',
            views: 45,
            completion: 82,
            lastUpdated: '2024-02-20',
            status: 'draft'
          }
        ]);

      } catch (error) {
        console.error('Error fetching instructor data:', error);
        setError('Failed to load dashboard data');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    console.log('🔍 Checking user condition:', { 
      hasUser: !!user, 
      userId: user?.id, 
      user_id: user?._id,
      userFull: user 
    });
    
    // Use either user.id or user._id (MongoDB)
    const userId = user?.id || user?._id;
    
    if (userId) {
      console.log('✅ User ID exists:', userId, 'calling fetchInstructorData()');
      fetchInstructorData();
    } else {
      console.log('❌ No user ID found, NOT calling fetchInstructorData()');
      console.log('User object:', user);
    }
  }, [user?.id, user?._id]);


  const students = [
    {
      id: 1,
      name: 'Alex Johnson',
      email: 'alex@example.com',
      avatar: '',
      enrolledCourses: ['React Fundamentals', 'Advanced JavaScript'],
      progress: 78,
      lastActive: '2 hours ago',
      totalTime: '24h 30m',
      completedLessons: 18,
      grade: 'A-'
    },
    {
      id: 2,
      name: 'Emma Davis',
      email: 'emma@example.com',
      avatar: '',
      enrolledCourses: ['React Fundamentals'],
      progress: 65,
      lastActive: '1 day ago',
      totalTime: '18h 45m',
      completedLessons: 12,
      grade: 'B+'
    },
    {
      id: 3,
      name: 'Michael Chen',
      email: 'michael@example.com',
      avatar: '',
      enrolledCourses: ['Full Stack Web Development', 'Node.js Backend Development'],
      progress: 92,
      lastActive: '30 minutes ago',
      totalTime: '45h 20m',
      completedLessons: 35,
      grade: 'A+'
    }
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'new_enrollment',
      student: 'Sarah Wilson',
      course: 'React Fundamentals',
      time: '2 hours ago',
      icon: <Users className="h-4 w-4 text-green-600" />
    },
    {
      id: 2,
      type: 'lesson_completed',
      student: 'Alex Johnson',
      lesson: 'Introduction to React Hooks',
      time: '3 hours ago',
      icon: <CheckCircle2 className="h-4 w-4 text-blue-600" />
    },
    {
      id: 3,
      type: 'question_asked',
      student: 'Emma Davis',
      lesson: 'Component Lifecycle',
      time: '5 hours ago',
      icon: <MessageCircle className="h-4 w-4 text-purple-600" />
    },
    {
      id: 4,
      type: 'review_submitted',
      student: 'Michael Chen',
      course: 'Advanced JavaScript',
      rating: 5,
      time: '1 day ago',
      icon: <Star className="h-4 w-4 text-yellow-600" />
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user.name}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-blue-900">{instructorStats.totalStudents}</p>
                <p className="text-sm text-green-600 mt-1">+{instructorStats.newStudentsThisMonth} this month</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Active Courses</p>
                <p className="text-3xl font-bold text-green-900">{instructorStats.activeCourses}</p>
                <p className="text-sm text-green-600 mt-1">{instructorStats.totalLessons} total lessons</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Avg Rating</p>
                <p className="text-3xl font-bold text-purple-900">{instructorStats.avgRating}</p>
                <p className="text-sm text-purple-600 mt-1">{instructorStats.completionRate}% completion</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Star className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Monthly Revenue</p>
                <p className="text-3xl font-bold text-teal-900">${instructorStats.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-teal-600 mt-1">+{instructorStats.monthlyEngagement}% growth</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="lessons">Recent Lessons</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    My Courses
                  </CardTitle>
                  <CardDescription>Manage your course content and track performance</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search courses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                            <Badge variant="outline" className="mt-2 text-xs">
                              {course.category}
                            </Badge>
                          </div>
                          <Badge variant="outline" className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <p className="font-bold text-blue-600">{course.students}</p>
                            <p className="text-blue-700">Students</p>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <p className="font-bold text-green-600">{course.lessons}</p>
                            <p className="text-green-700">Lessons</p>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <p className="font-bold text-purple-600">{course.rating}</p>
                            <p className="text-purple-700">Rating</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-medium">{course.completion}%</span>
                          </div>
                          <Progress value={course.completion} className="h-2" />
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>Revenue: ${course.revenue}</span>
                          <span>Updated: {new Date(course.lastUpdated).toLocaleDateString()}</span>
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Analytics
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lessons" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className="h-5 w-5 mr-2 text-purple-600" />
                Recent Lessons
              </CardTitle>
              <CardDescription>Monitor lesson performance and student engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLessons.map((lesson) => (
                  <Card key={lesson.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center">
                            <PlayCircle className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">{lesson.courseTitle}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              <span>Duration: {lesson.duration}</span>
                              <span>Views: {lesson.views}</span>
                              <span>Comments: {lesson.comments}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{lesson.completion}%</p>
                            <p className="text-xs text-gray-500">completion</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{lesson.rating}</span>
                            </div>
                            <p className="text-xs text-gray-500">rating</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onNavigateToLesson && onNavigateToLesson(lesson)}
                              className="bg-gradient-to-r from-teal-50 to-purple-50 hover:from-teal-100 hover:to-purple-100"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-600" />
                My Students
              </CardTitle>
              <CardDescription>Track student progress and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students.map((student) => (
                  <Card key={student.id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-purple-600 text-white font-semibold">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold text-gray-900">{student.name}</h3>
                            <p className="text-sm text-gray-500">{student.email}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              {student.enrolledCourses.map((course, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {course}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{student.progress}%</p>
                            <p className="text-xs text-gray-500">progress</p>
                          </div>
                          <div className="text-center">
                            <Badge variant="outline" className={getGradeColor(student.grade)}>
                              {student.grade}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">grade</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-gray-900">{student.totalTime}</p>
                            <p className="text-xs text-gray-500">total time</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics charts would be rendered here</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Student Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Engagement metrics would be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest student interactions and course updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.icon}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.type === 'new_enrollment' && `${activity.student} enrolled in ${activity.course}`}
                        {activity.type === 'lesson_completed' && `${activity.student} completed "${activity.lesson}"`}
                        {activity.type === 'question_asked' && `${activity.student} asked a question in "${activity.lesson}"`}
                        {activity.type === 'review_submitted' && `${activity.student} left a ${activity.rating}-star review for ${activity.course}`}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}