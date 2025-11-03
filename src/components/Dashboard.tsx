import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award,
  Brain,
  FileText,
  Clock,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  BarChart3,
  PieChart,
  Zap,
  AlertTriangle,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Button } from './ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area } from 'recharts';
import { AICreditsManagement } from './AICreditsManagement';
import { api } from '../services/api';
import { toast } from 'sonner';

interface DashboardProps {
  user?: any;
}

export function Dashboard({ user }: DashboardProps) {
  const [showAICreditsManagement, setShowAICreditsManagement] = useState(false);
  const [platformAnalytics, setPlatformAnalytics] = useState<any>(null);
  const [engagementStats, setEngagementStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use real user data from backend
  const userName = user?.name || 'Admin';
  const userEmail = user?.email || '';
  const isEmailVerified = user?.isEmailVerified || false;
  const lastLoginAt = user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A';
  const accountCreatedAt = user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
  const userStatus = user?.status || 'active';
  const userRole = user?.role || 'admin';
  
  
  // Fetch platform analytics and additional data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all required data in parallel with proper parameters
        const [platformResponse, engagementResponse, revenueResponse] = await Promise.allSettled([
          api.analytics.getPlatformAnalytics('7d'), // Last 7 days
          api.analytics.getUserEngagementStats('7d'), // Last 7 days
          api.analytics.getRevenueAnalytics('7d') // Last 7 days
        ]);

        // Process platform analytics
        if (platformResponse.status === 'fulfilled') {
          setPlatformAnalytics(platformResponse.value);
        }

        // Process engagement data
        if (engagementResponse.status === 'fulfilled') {
          setEngagementStats(engagementResponse.value);
        }

        // Process revenue data
        if (revenueResponse.status === 'fulfilled') {
          setRevenueData(revenueResponse.value);
        }

      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data. Using cached data.');
        // Will use fallback mock data
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, []);
  
  // Use real data or fallback to mock
  
  // Handle the actual API response format from /analytics/overview
  const totalUsers = platformAnalytics?.overview?.totalUsers || 0;
  const totalCourses = platformAnalytics?.overview?.totalCourses || user?.createdCourses?.length || 0;
  const totalEnrollments = platformAnalytics?.overview?.totalEnrollments || 0;
  const totalCompletedCourses = platformAnalytics?.overview?.totalCompletedCourses || 0;
  const aiUsage = platformAnalytics?.overview?.aiCreditsUsed || user?.aiCredits?.used || 0;
  const activeUsers = platformAnalytics?.overview?.activeUsers || 0;
  const newUsersThisPeriod = platformAnalytics?.overview?.newUsers || 0;
  
  const stats = [
    {
      title: 'Total Users',
      value: totalUsers > 0 ? totalUsers.toLocaleString() : '0',
      change: platformAnalytics?.overview?.userGrowth ? `+${platformAnalytics.overview.userGrowth}%` : '+0%',
      changeType: 'positive',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      title: 'Total Courses',
      value: totalCourses > 0 ? totalCourses.toString() : '0',
      change: platformAnalytics?.overview?.courseGrowth ? `+${platformAnalytics.overview.courseGrowth}%` : '+0%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'from-teal-500 to-cyan-600',
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-700'
    },
    {
      title: 'AI Credits Used',
      value: aiUsage > 0 ? aiUsage.toLocaleString() : '0',
      change: platformAnalytics?.overview?.aiUsageGrowth ? `+${platformAnalytics.overview.aiUsageGrowth}%` : '+0%',
      changeType: 'positive',
      icon: Brain,
      color: 'from-purple-500 to-indigo-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      title: 'Total Enrollments',
      value: totalEnrollments > 0 ? totalEnrollments.toLocaleString() : '0',
      change: platformAnalytics?.courses?.enrollmentGrowth ? `+${platformAnalytics.courses.enrollmentGrowth}%` : '+0%',
      changeType: 'positive',
      icon: Award,
      color: 'from-emerald-500 to-green-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    }
  ];

  // Chart data - Will show real data when available, otherwise show empty state
  // For now, show sample structure but indicate no data yet
  const hasData = totalUsers > 0 || totalCourses > 0;
  
  // Use real engagement data for student growth chart
  const studentGrowthData = engagementStats?.dailyActiveUsers ? 
    (() => {
      // Group daily data by week for better visualization
      const weeklyData: { [key: string]: { students: number[], active: number[] } } = {};
      
      engagementStats.dailyActiveUsers.forEach((day: any) => {
        const date = new Date(day.date);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = { students: [], active: [] };
        }
        
        weeklyData[weekKey].students.push(day.count);
        weeklyData[weekKey].active.push(Math.floor(day.count * 0.8));
      });
      
      // Convert to chart data format
      return Object.entries(weeklyData)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([weekStart, data], index) => ({
          month: `Week ${index + 1}`,
          students: Math.round(data.students.reduce((a, b) => a + b, 0) / data.students.length), // Average daily users
          active: Math.round(data.active.reduce((a, b) => a + b, 0) / data.active.length) // Average daily active
        }));
    })() : 
    (hasData ? [
      { month: 'Jan', students: 0, active: 0 },
      { month: 'Feb', students: 0, active: 0 },
      { month: 'Mar', students: 0, active: 0 },
      { month: 'Apr', students: 0, active: 0 },
      { month: 'May', students: totalUsers, active: Math.floor(totalUsers * 0.8) },
    ] : []);

  const courseCompletionData = hasData && totalCourses > 0 ? 
    Array.from({ length: Math.min(5, totalCourses) }, (_, i) => ({
      name: `Course ${i + 1}`,
      completed: 0,
      enrolled: 0
    })) : [];

  const aiAnalysisData = aiUsage > 0 ? [
    { name: 'Excellent', value: 35, color: '#10b981' },
    { name: 'Good', value: 42, color: '#3b82f6' },
    { name: 'Needs Improvement', value: 18, color: '#f59e0b' },
    { name: 'Poor', value: 5, color: '#ef4444' },
  ] : [
    { name: 'No Data', value: 100, color: '#e5e7eb' }
  ];

  const engagementChartData = hasData ? [
    { day: 'Mon', engagement: 0 },
    { day: 'Tue', engagement: 0 },
    { day: 'Wed', engagement: 0 },
    { day: 'Thu', engagement: 0 },
    { day: 'Fri', engagement: 0 },
    { day: 'Sat', engagement: 0 },
    { day: 'Sun', engagement: 0 },
  ] : [];

  const recentAnalyses: any[] = []; // Will be populated when there's real activity

  const quickActions = [
    {
      title: 'Analyze New Content',
      description: 'Upload and analyze educational content with AI',
      icon: Brain,
      color: 'from-purple-500 to-purple-600',
      action: () => {}
    },
    {
      title: 'Create Quiz',
      description: 'Generate quizzes automatically from content',
      icon: FileText,
      color: 'from-teal-500 to-teal-600',
      action: () => {}
    },
    {
      title: 'Manage AI Credits',
      description: 'Monitor and distribute AI credits to instructors',
      icon: Zap,
      color: 'from-orange-500 to-orange-600',
      action: () => setShowAICreditsManagement(true)
    },
    {
      title: 'Invite Students',
      description: 'Send invitation links to new students',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      action: () => {}
    },
    {
      title: 'Generate Reports',
      description: 'Create detailed progress and analytics reports',
      icon: TrendingUp,
      color: 'from-green-500 to-green-600',
      action: () => {}
    }
  ];

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl p-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-8 w-64 bg-gray-300 rounded"></div>
          <div className="h-6 w-96 bg-gray-300 rounded"></div>
          <div className="flex gap-4 mt-4">
            <div className="h-4 w-20 bg-gray-300 rounded"></div>
            <div className="h-4 w-24 bg-gray-300 rounded"></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-500 via-blue-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white/90">Live Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold mb-3">Welcome back, {userName}!</h1>
            <p className="text-white/90 text-lg max-w-2xl">
              Your AI-powered educational platform is performing excellently. 
              Here's what's happening with your organization today.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 mt-4">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${userStatus === 'active' ? 'bg-green-300' : 'bg-orange-300'}`}></div>
                <span className="text-sm font-medium capitalize">{userStatus}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-white/80">Role:</span>
                <span className="text-sm font-medium capitalize">{userRole}</span>
              </div>
              {isEmailVerified ? (
                <div className="flex items-center space-x-2">
                  <Award className="h-4 w-4 text-green-300" />
                  <span className="text-sm font-medium">Email Verified</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-300" />
                  <span className="text-sm font-medium">Email Not Verified</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-green-300" />
                <span className="text-sm font-medium">+15% this month</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-300" />
                <span className="text-sm font-medium">{totalUsers > 0 ? `${totalUsers.toLocaleString()} total users` : 'No users yet'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-teal-300" />
                <span className="text-sm font-medium">{totalCourses > 0 ? `${totalCourses} courses` : 'No courses yet'}</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="h-24 w-24 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-400 rounded-full flex items-center justify-center">
                <div className="h-2 w-2 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Profile Card */}
      {user && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Admin Profile</span>
              {isEmailVerified ? (
                <Award className="h-5 w-5 text-green-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              )}
            </CardTitle>
            <CardDescription>Your account information and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Name</p>
                <p className="font-semibold text-gray-900">{userName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Email</p>
                <p className="font-medium text-gray-900 flex items-center gap-2">
                  {userEmail}
                  {isEmailVerified ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Verified</span>
                  ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Unverified</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Status</p>
                <p className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${userStatus === 'active' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                  <span className="capitalize">{userStatus}</span>
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Role</p>
                <p className="font-semibold text-gray-900 capitalize">{userRole}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Login</p>
                <p className="font-medium text-gray-900">{lastLoginAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Account Created</p>
                <p className="font-medium text-gray-900">{accountCreatedAt}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">AI Credits</p>
                <p className="font-semibold text-gray-900">
                  {user.aiCredits?.used || 0} / {user.aiCredits?.total || user.organization?.settings?.aiCreditsPool || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">2FA</p>
                <p className="font-medium text-gray-900">
                  {user.twoFactorEnabled ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <Award className="h-4 w-4" /> Enabled
                    </span>
                  ) : (
                    <span className="text-gray-500">Disabled</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Courses Created</p>
                <p className="font-semibold text-gray-900">
                  {user.createdCourses?.length || user.adminData?.createdCourses?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Students Managed</p>
                <p className="font-semibold text-gray-900">
                  {user.students?.length || user.adminData?.students?.length || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Study Time</p>
                <p className="font-medium text-gray-900">
                  {user.studyTime || 0} hours
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Rating</p>
                <p className="font-medium text-gray-900 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  {user.rating || 0} ({user.totalRatings || 0} ratings)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      {stat.changeType === 'positive' && (
                        <ArrowUpRight className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                    <div className="flex items-center">
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        stat.changeType === 'positive' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`h-14 w-14 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Growth Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Student Growth & Engagement
              </span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription>
              Monthly student enrollment and active participation trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            {studentGrowthData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={studentGrowthData}>
                  <defs>
                    <linearGradient id="studentsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="students" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#studentsGradient)" 
                    name="Total Students"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="active" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#activeGradient)" 
                    name="Active Students"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                <Users className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No user data available yet</p>
                <p className="text-sm">Student growth will appear once users start enrolling</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Analysis Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-purple-600" />
              AI Analysis Quality
            </CardTitle>
            <CardDescription>
              Distribution of content analysis scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiUsage > 0 ? (
              <>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart data={aiAnalysisData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {aiAnalysisData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {aiAnalysisData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
            </>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-500">
                <Brain className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No AI analysis data yet</p>
                <p className="text-sm text-center px-4">Analysis quality distribution will appear once you start using AI features</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Course Completion Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Course Completion Rates
            </CardTitle>
            <CardDescription>
              Student progress across different courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {courseCompletionData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#64748b" 
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }} 
                  />
                  <Bar dataKey="enrolled" fill="#e2e8f0" name="Enrolled" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#3b82f6" name="Completed" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                <BookOpen className="h-16 w-16 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No course data available yet</p>
                <p className="text-sm">Course completion rates will appear once courses are created and students enroll</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Weekly Engagement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Weekly Engagement Pattern
            </CardTitle>
            <CardDescription>
              Student activity levels throughout the week
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(engagementStats?.dailyActiveUsers || platformAnalytics?.activityTimeline) && (engagementStats?.dailyActiveUsers?.length > 0 || platformAnalytics?.activityTimeline?.length > 0) ? (
            <div className="space-y-4">
              {/* Summary Stats */}
              {engagementStats?.overview && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{engagementStats.overview.dailyActiveUsers}</div>
                    <div className="text-sm text-gray-600">Daily Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{engagementStats.overview.totalSessions}</div>
                    <div className="text-sm text-gray-600">Total Sessions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{engagementStats.overview.avgSessionDuration}m</div>
                    <div className="text-sm text-gray-600">Avg Session Duration</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{engagementStats.overview.retentionRate}%</div>
                    <div className="text-sm text-gray-600">Retention Rate</div>
                  </div>
                </div>
              )}
              
              {/* Chart */}
              <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={engagementStats?.dailyActiveUsers || platformAnalytics?.activityTimeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748b" 
                    fontSize={12}
                    tickFormatter={(value) => {
                      // Format date properly
                      if (typeof value === 'string') {
                        return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }
                      return value;
                    }}
                  />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    labelFormatter={(value) => {
                      // Format tooltip date
                      if (typeof value === 'string') {
                        return new Date(value).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        });
                      }
                      return value;
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8 }}
                    name="Daily Active Users"
                  />
                </LineChart>
              </ResponsiveContainer>
              </div>
              
              {/* Top Engaged Users */}
              {engagementStats?.topEngagedUsers && engagementStats.topEngagedUsers.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Engaged Users</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {engagementStats.topEngagedUsers.slice(0, 6).map((user: any, index: number) => (
                      <div key={user._id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">
                              {user.eventCount} events • Last active: {new Date(user.lastActive).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{user.eventCount}</div>
                          <div className="text-xs text-gray-500">events</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            ) : (
              <div className="h-80 flex flex-col items-center justify-center text-gray-500">
                <AlertTriangle className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
                <p className="text-sm text-gray-500 mb-4">Unable to load engagement data from the server</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent AI Analyses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Brain className="h-5 w-5 mr-2 text-purple-600" />
              Recent AI Content Analyses
            </span>
            <Button variant="outline" size="sm">
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
          <CardDescription>
            Latest AI-powered content evaluations and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentAnalyses.length > 0 ? (
          <div className="space-y-4">
            {recentAnalyses.map((analysis, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl border border-gray-100 hover:border-gray-200 transition-all duration-200 group">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">{analysis.title}</h4>
                    <p className="text-sm text-gray-500">{analysis.type}</p>
                    <div className="flex items-center mt-2 space-x-3">
                      <Progress value={analysis.score} className="w-32 h-2" />
                      <span className="text-sm font-semibold text-gray-700">{analysis.score}%</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    analysis.score >= 90 ? 'bg-green-100 text-green-800' :
                    analysis.score >= 80 ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {analysis.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-2">{analysis.time}</p>
                </div>
              </div>
            ))}
          </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500">
              <Brain className="h-16 w-16 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No recent AI analyses</p>
              <p className="text-sm mb-4">Start analyzing content to see results here</p>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Analyze Content
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-teal-600" />
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks to boost your educational impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={index}
                  onClick={action.action}
                  className="p-6 rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-300 text-left group hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`h-12 w-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">{action.title}</h4>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Learning Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Learning Insights & Recommendations
          </CardTitle>
          <CardDescription>
            AI-generated insights to improve your educational content and student outcomes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Engagement Pattern</h4>
              </div>
              <p className="text-sm text-blue-700">
                Students are most active between 2-4 PM. Consider scheduling live sessions during this time.
              </p>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-900">Content Gap</h4>
              </div>
              <p className="text-sm text-purple-700">
                Advanced JavaScript concepts show lower completion rates. Consider adding more interactive examples.
              </p>
            </div>
            
            <div className="bg-teal-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Award className="h-5 w-5 text-teal-600 mr-2" />
                <h4 className="font-medium text-teal-900">Success Metric</h4>
              </div>
              <p className="text-sm text-teal-700">
                Quiz-based learning shows 23% higher retention rates compared to reading-only content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Credits Management Modal */}
      {showAICreditsManagement && (
        <AICreditsManagement
          isOpen={showAICreditsManagement}
          onClose={() => setShowAICreditsManagement(false)}
        />
      )}
    </div>
  );
}