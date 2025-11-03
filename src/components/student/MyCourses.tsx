import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  BookOpen, 
  Clock, 
  Users, 
  PlayCircle, 
  CheckCircle, 
  Calendar,
  Award,
  TrendingUp,
  FileText,
  Video,
  ClipboardCheck,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface Course {
  id: string;
  title: string;
  instructor: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  nextLesson: string;
  dueDate?: string;
  field: string;
  thumbnail: string;
  status: 'active' | 'completed' | 'overdue';
  lastAccessed: string;
  grade?: number;
}

interface MyCoursesProps {
  user?: any;
  onNavigateToLesson?: (lesson: any) => void;
  onNavigateToQuiz?: (quizId: string) => void;
}

export function MyCourses({ user, onNavigateToLesson, onNavigateToQuiz }: MyCoursesProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  
  // Navigation state for course detail view
  const [currentView, setCurrentView] = useState<'courses' | 'course-detail'>('courses');
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Fetch enrolled courses data
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;

        // Fetch enrolled courses - Data is auto-extracted by BaseApiService
        const coursesData = await api.course.getEnrolledCourses();
        console.log('📚 Enrolled courses data:', coursesData);
        
        if (coursesData && Array.isArray(coursesData)) {
          // Data is already extracted from response wrapper by BaseApiService
          // Preserve full course object for navigation to course detail
          const courses = coursesData.map((course: any) => ({
            ...course, // Preserve full course object
            id: course._id || course.id,
            title: course.title,
            instructor: course.instructor?.name || course.instructor || 'Unknown Instructor',
            progress: course.progress || 0,
            totalLessons: course.totalLessons || course.lessonsCount || 0,
            completedLessons: course.completedLessons || 0,
            nextLesson: 'Continue Learning', // Can be derived from API data
            dueDate: course.enrolledAt || course.dueDate,
            field: course.field || '',
            thumbnail: course.thumbnail || course.thumbnailUrl || '',
            status: course.status || 'active',
            lastAccessed: course.lastAccessedAt || 'Recently',
            grade: course.grade
          }));
          setEnrolledCourses(courses);
        } else {
          // Use empty state if no data received
          console.warn('⚠️ No enrolled courses data received');
          setEnrolledCourses([]);
        }

      } catch (error: any) {
        console.error('Error fetching enrolled courses:', error);
        
        // If endpoint doesn't exist yet, show empty state
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Enrolled courses endpoint not implemented yet');
          setEnrolledCourses([]);
          setError(null);
        } else {
          setError('Failed to load courses');
          toast.error('Failed to load courses');
          setEnrolledCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Use either user.id or user._id (MongoDB)
    const userId = user?.id || user?._id;
    
    if (userId) {
      fetchEnrolledCourses();
    } else {
      setLoading(false);
    }
  }, [user?.id, user?._id]);

  const activeCoursesCount = enrolledCourses.filter(course => course.status === 'active').length;
  const completedCoursesCount = enrolledCourses.filter(course => course.status === 'completed').length;
  const averageProgress = Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length);

  const handleContinueLearning = async (course: any) => {
    setSelectedCourse(course);
    setCurrentView('course-detail');
    setLoadingLessons(true);
    
    try {
      // Fetch lessons for this course
      const courseId = course._id || course.id || course.id;
      console.log('📚 Fetching lessons for course:', courseId);
      const lessonsResponse = await api.lesson.getLessons(courseId);
      console.log('📖 Lessons response:', lessonsResponse);
      
      // Handle response - BaseApiService auto-extracts data
      const lessons = Array.isArray(lessonsResponse) 
        ? lessonsResponse 
        : (lessonsResponse?.lessons || lessonsResponse?.data?.lessons || []);
      
      setCourseLessons(lessons);
      
      if (lessons.length === 0) {
        toast.info('This course has no lessons yet');
      }
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
      setCourseLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleViewLesson = (lessonId: string) => {
    // Navigate to lesson view using existing route
    navigate(`/lesson/${lessonId}`);
  };

  const handleBackToCourses = () => {
    setCurrentView('courses');
    setSelectedCourse(null);
    setCourseLessons([]);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Overdue</Badge>;
      default:
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Active</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mx-auto mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Courses</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  // Course Detail View - Shows Lessons
  if (currentView === 'course-detail' && selectedCourse) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Button
              variant="outline"
              onClick={handleBackToCourses}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Courses
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
              {selectedCourse.title}
            </h1>
            <p className="text-gray-600 mt-2">
              {selectedCourse.description || 'Course description'}
            </p>
          </div>
        </div>

        {/* Course Info Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">{selectedCourse.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2">
                    <Users className="h-4 w-4" />
                    {selectedCourse.instructor}
                  </CardDescription>
                </div>
              </div>
              {selectedCourse.status && (
                <Badge className={
                  selectedCourse.status === 'completed' 
                    ? 'bg-green-100 text-green-800 border-green-200'
                    : selectedCourse.status === 'overdue'
                    ? 'bg-red-100 text-red-800 border-red-200'
                    : 'bg-blue-100 text-blue-800 border-blue-200'
                }>
                  {selectedCourse.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{selectedCourse.progress || 0}%</span>
                </div>
                <Progress value={selectedCourse.progress || 0} className="h-2" />
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{selectedCourse.completedLessons || 0}/{selectedCourse.totalLessons || 0} lessons completed</span>
                  <span>Last accessed {selectedCourse.lastAccessed || 'Recently'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lessons Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Lessons</h2>
          {loadingLessons ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading lessons...</p>
            </div>
          ) : courseLessons.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
              <p className="text-gray-600">This course doesn't have any lessons yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseLessons.map((lesson: any, index: number) => (
                <Card 
                  key={lesson._id || lesson.id || lesson.lessonId || index}
                  className="hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => handleViewLesson(lesson._id || lesson.id || lesson.lessonId)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-medium">
                            {index + 1}
                          </div>
                          {lesson.isPreview && (
                            <Badge variant="outline" className="bg-yellow-50 text-yellow-800">
                              Preview
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg line-clamp-2">
                          {lesson.title || lesson.name || `Lesson ${index + 1}`}
                        </CardTitle>
                        <CardDescription className="line-clamp-2 mt-2">
                          {lesson.description || 'No description'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {lesson.duration || lesson.length || 'N/A'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {lesson.hasVideo ? 'Video' : 'Text'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Courses List View (Default)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            My Courses
          </h1>
          <p className="text-gray-600 mt-2">
            Track your learning progress and continue your educational journey
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{activeCoursesCount}</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{completedCoursesCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-gray-900">{averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(course.status)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-800">
                      {course.field}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {course.instructor}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{course.completedLessons}/{course.totalLessons} lessons</span>
                      <span>Last accessed {course.lastAccessed}</span>
                    </div>
                  </div>

                  {/* Next Lesson or Grade */}
                  {course.status !== 'completed' ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Video className="h-4 w-4 text-blue-500" />
                      <span className="text-gray-600">Next:</span>
                      <span className="font-medium">{course.nextLesson}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-gray-600">Final Grade:</span>
                      <span className="font-bold text-green-600">{course.grade}%</span>
                    </div>
                  )}

                  {/* Due Date */}
                  {course.dueDate && course.status !== 'completed' && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-600">Due:</span>
                      <span className={`font-medium ${course.status === 'overdue' ? 'text-red-600' : 'text-gray-900'}`}>
                        {course.dueDate}
                      </span>
                    </div>
                  )}

                  {/* Action Button */}
                  <Button 
                    onClick={() => handleContinueLearning(course)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                  >
                    {loading ? (
                      'Loading...'
                    ) : course.status === 'completed' ? (
                      'Review Course'
                    ) : (
                      'Continue Learning'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.filter(course => course.status === 'active').map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                {/* Same card content as above - you could extract this into a component */}
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(course.status)}
                  </div>
                </div>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {course.instructor}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  <Button 
                    onClick={() => handleContinueLearning(course)}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                  >
                    Continue Learning
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.filter(course => course.status === 'completed').map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(course.status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-gray-600">Final Grade:</span>
                    <span className="font-bold text-green-600">{course.grade}%</span>
                  </div>
                  <Button variant="outline" className="w-full">
                    View Certificate
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="overdue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {enrolledCourses.filter(course => course.status === 'overdue').map((course) => (
              <Card key={course.id} className="overflow-hidden border-red-200">
                <div className="aspect-video relative overflow-hidden">
                  <img 
                    src={course.thumbnail} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-red-900/20" />
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(course.status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{course.title}</CardTitle>
                  <CardDescription>{course.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Progress value={course.progress} className="h-2" />
                    <div className="text-sm text-red-600 font-medium">
                      Due date passed: {course.dueDate}
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleContinueLearning(course)}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                  >
                    Catch Up Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}