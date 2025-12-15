import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  PlayCircle, 
  Clock,
  Calendar,
  Trophy,
  Target,
  TrendingUp,
  Star,
  CheckCircle2,
  Circle,
  Search,
  Filter,
  Download,
  MessageCircle,
  Bookmark,
  Award,
  Activity,
  BarChart3,
  FileText,
  Users,
  Zap,
  Brain
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
import { useLanguage } from '../context/LanguageContext';

interface StudentDashboardProps {
  user: any;
  onNavigateToLesson?: (lesson: any) => void;
}

export function StudentDashboard({ user, onNavigateToLesson }: StudentDashboardProps) {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch student dashboard data
  useEffect(() => {
    console.log('🎯 StudentDashboard MOUNTED', { user });
    
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('🎯 Fetching student analytics...');
        
        // Fetch student analytics - Extract data from response wrapper
        const analyticsResponse = await api.analytics.getStudentDashboard();
        console.log('🎯 Student analytics response:', analyticsResponse);
        
        if (analyticsResponse && analyticsResponse.success && analyticsResponse.data) {
          // Extract data from response wrapper
          const data = analyticsResponse.data;
          setDashboardData({
            overview: data.overview || {
              totalCourses: 0,
              activeCourses: 0,
              completedCourses: 0,
              averageProgress: 0,
              totalTimeSpent: 0,
              learningStreak: 0,
              achievements: 0
            },
            courseProgress: data.recentActivity || [],
            recentActivity: data.recentActivity || [],
            achievements: data.performanceMetrics || {},
            upcomingDeadlines: data.upcomingDeadlines || [],
            studyActivity: data.progressByField || []
          });
        } else {
          // Use empty dashboard data if no success response
          console.warn('⚠️ No analytics data received or invalid structure - using empty state');
          setDashboardData({
            overview: {
              enrolledCourses: 0,
              completedCourses: 0,
              studyTime: 0,
              achievements: 0,
              learningStreak: 0
            },
            courseProgress: [],
            recentActivity: [],
            achievements: [],
            upcomingDeadlines: [],
            studyActivity: []
          });
        }
      } catch (error: any) {
        console.error('❌ Error fetching student data:', error);
        
        // If the endpoint doesn't exist yet (401/404), show empty state instead of error
        if (error.status === 401 || error.status === 404 || error.message?.includes('401') || error.message?.includes('404')) {
          console.warn('⚠️ Student analytics endpoint not implemented yet - using empty state');
          setDashboardData({
            overview: {
              enrolledCourses: 0,
              completedCourses: 0,
              studyTime: 0,
              achievements: 0,
              learningStreak: 0
            },
            courseProgress: [],
            recentActivity: [],
            achievements: [],
            upcomingDeadlines: [],
            studyActivity: []
          });
          setError(null); // Don't show error for missing endpoints
        } else {
          setError('Failed to load dashboard data');
          toast.error('Failed to load dashboard data');
        }
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
      console.log('✅ User ID exists:', userId, 'calling fetchDashboardData()');
      fetchDashboardData();
    } else {
      console.log('❌ No user ID found, NOT calling fetchDashboardData()');
      console.log('User object:', user);
      setLoading(false);
    }
  }, [user?.id, user?._id]);

  const studentStats = dashboardData?.overview || {
    enrolledCourses: 0,
    completedCourses: 0,
    studyTime: 0,
    learningStreak: 0,
    achievements: 0
  };

  const quizPerformance = dashboardData?.quizPerformance || {
    averageScore: 0,
    totalAttempts: 0,
    passedCount: 0,
    passRate: 0
  };

  const courseProgress = dashboardData?.courseProgress || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const achievements = dashboardData?.achievements || [];

  const enrolledCourses = courseProgress;
  const recentLessons = recentActivity;
  const upcomingDeadlines = dashboardData?.upcomingDeadlines || [];
  const studyActivity = dashboardData?.studyActivity || [];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-800';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTimeUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 0) return `${diffDays} days left`;
    return 'Overdue';
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('student.dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('student.dashboard.failedToLoad')}</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              {t('student.dashboard.retry')}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('student.dashboard.title')}</h1>
          <p className="text-gray-600 mt-1">{t('student.dashboard.welcome').replace('{name}', user?.name || 'Student')}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Calendar className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('common.schedule')}
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
            <Search className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('student.dashboard.explore')}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">{t('student.stats.enrolled')}</p>
                <p className="text-3xl font-bold text-blue-900">{studentStats.enrolledCourses}</p>
                <p className="text-sm text-green-600 mt-1">{studentStats.completedCourses} {t('student.stats.completed')}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">{t('student.stats.progress')}</p>
                <p className="text-3xl font-bold text-green-900">{studentStats.overallProgress}%</p>
                <p className="text-sm text-green-600 mt-1">{studentStats.completedLessons}/{studentStats.totalLessons} {t('common.lessons')}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Target className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">{t('student.stats.studyTime')}</p>
                <p className="text-3xl font-bold text-purple-900">{studentStats.studyTime}h</p>
                <p className="text-sm text-purple-600 mt-1">{studentStats.currentStreak} {t('student.stats.streak')}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">{t('student.stats.avgGrade')}</p>
                <p className="text-3xl font-bold text-teal-900">{studentStats.averageGrade}</p>
                <p className="text-sm text-teal-600 mt-1">{studentStats.certificatesEarned} {t('student.stats.certificates')}</p>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Trophy className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-green-600`} />
                {t('student.dashboard.continueLearning')}
              </CardTitle>
              <CardDescription>{t('student.dashboard.pickUp')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {enrolledCourses.map((course: any) => (
                  <Card key={course.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BookOpen className="h-8 w-8 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-gray-500">by {course.instructor}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                                {course.difficulty}
                              </Badge>
                              <Badge variant="outline" className={getGradeColor(course.grade)}>
                                {course.grade}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {course.category}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium">{course.progress}%</span>
                            <Progress value={course.progress} className="w-24 h-2" />
                          </div>
                          <p className="text-sm text-gray-500">{course.completedLessons}/{course.lessons} {t('common.lessons')}</p>
                          <p className="text-xs text-gray-400">{course.estimatedTime}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{t('student.dashboard.next')} {course.nextLesson}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600">{course.rating} {t('instructor.course.rating')}</span>
                            </div>
                          </div>
                          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                            <PlayCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                            {t('student.dashboard.continue')}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Lessons */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-600`} />
                {t('student.dashboard.recentLessons')}
              </CardTitle>
              <CardDescription>{t('student.dashboard.yourActivity')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLessons.map((lesson: any) => (
                  <div key={lesson.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                        lesson.completed ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {lesson.completed ? (
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        ) : (
                          <PlayCircle className="h-6 w-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                        <p className="text-sm text-gray-500">{lesson.course} • {lesson.duration}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-400">{lesson.watchedAt}</span>
                          {lesson.bookmarked && (
                            <Bookmark className="h-3 w-3 text-teal-600 fill-current" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {lesson.completed && lesson.rating && (
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < lesson.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onNavigateToLesson && onNavigateToLesson(lesson)}
                      >
                        {lesson.completed ? t('student.dashboard.review') : t('student.dashboard.continue')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Deadlines */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-red-600`} />
                {t('student.dashboard.deadlines')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline: any) => (
                  <div key={deadline.id} className={`p-3 border rounded-lg ${getPriorityColor(deadline.priority)}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-sm">{deadline.title}</h4>
                        <p className="text-xs text-gray-600">{deadline.course}</p>
                        <p className="text-xs font-medium mt-1">{getTimeUntilDue(deadline.dueDate)}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {deadline.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Study Activity */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-600`} />
                {t('student.dashboard.activity')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {studyActivity.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.day}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-teal-500 to-purple-600 h-2 rounded-full" 
                          style={{ width: `${(day.hours / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{day.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-yellow-600`} />
                {t('student.dashboard.achievements')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {achievements.map((achievement: any) => (
                  <div 
                    key={achievement.id} 
                    className={`flex items-center space-x-3 p-3 rounded-lg ${
                      achievement.earned ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                    }`}
                  >
                    <div className={`flex-shrink-0 ${achievement.earned ? 'opacity-100' : 'opacity-40'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-sm ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                        {achievement.title}
                      </h4>
                      <p className={`text-xs ${achievement.earned ? 'text-gray-600' : 'text-gray-400'}`}>
                        {achievement.description}
                      </p>
                      {achievement.earned && achievement.earnedDate && (
                        <p className="text-xs text-yellow-600 mt-1">
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}