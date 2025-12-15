import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Clock, 
  Target,
  Activity,
  Brain,
  BookOpen,
  Award,
  Calendar,
  Filter,
  Download,
  Eye,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Zap,
  CheckCircle,
  XCircle,
  Timer
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface InstructorAnalyticsProps {
  user: any;
}

export function InstructorAnalytics({ user }: InstructorAnalyticsProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real analytics data from API
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [engagementHeatmap, setEngagementHeatmap] = useState<any[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<any[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<any[]>([]);
  const [studentProgress, setStudentProgress] = useState<any[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<any>({});
  const [courses, setCourses] = useState<any[]>([]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          return;
        }

        // Fetch course analytics
        const courseAnalyticsResponse = selectedCourse === 'all' 
          ? await api.analytics.getInstructorDashboard()
          : await api.analytics.getCourseAnalyticsById(selectedCourse);
        if (courseAnalyticsResponse && Array.isArray(courseAnalyticsResponse)) {
          setCourseAnalytics(courseAnalyticsResponse);
        } else {
          setCourseAnalytics([]);
        }

        // Fetch instructor courses for dropdown
        const coursesResponse = await api.course.getCourses({ instructor: userId });
        if (coursesResponse && Array.isArray(coursesResponse)) {
          setCourses(coursesResponse);
        } else {
          setCourses([]);
        }

        // TODO: Replace with real API calls when endpoints are available
        setPerformanceData([
          { week: 'Week 1', completion: 85, engagement: 78, score: 82 },
          { week: 'Week 2', completion: 88, engagement: 82, score: 85 },
          { week: 'Week 3', completion: 92, engagement: 85, score: 88 },
          { week: 'Week 4', completion: 89, engagement: 80, score: 86 },
          { week: 'Week 5', completion: 95, engagement: 88, score: 92 },
          { week: 'Week 6', completion: 91, engagement: 85, score: 89 },
        ]);

        setEngagementHeatmap([
          { day: 'Mon', hour: '08:00', value: 12 },
          { day: 'Mon', hour: '10:00', value: 25 },
          { day: 'Mon', hour: '14:00', value: 45 },
          { day: 'Mon', hour: '16:00', value: 38 },
          { day: 'Mon', hour: '20:00', value: 22 },
          { day: 'Tue', hour: '08:00', value: 15 },
          { day: 'Tue', hour: '10:00', value: 28 },
          { day: 'Tue', hour: '14:00', value: 42 },
          { day: 'Tue', hour: '16:00', value: 35 },
          { day: 'Tue', hour: '20:00', value: 25 },
        ]);

        setAtRiskStudents([
          {
            id: 1,
            name: 'Sarah Johnson',
            avatar: 'SJ',
            course: 'Advanced Mathematics',
            riskLevel: 'high',
            lastActive: '3 days ago',
            completionRate: 45,
            averageScore: 62,
            issues: ['Low engagement', 'Missing assignments', 'Poor quiz performance']
          },
          {
            id: 2,
            name: 'Mike Chen',
            avatar: 'MC',
            course: 'Physics 101',
            riskLevel: 'medium',
            lastActive: '1 day ago',
            completionRate: 72,
            averageScore: 78,
            issues: ['Inconsistent performance', 'Late submissions']
          }
        ]);

        setEngagementMetrics({
          totalSessions: 1247,
          avgSessionDuration: 24,
          peakHours: '2-4 PM',
          mostActiveDay: 'Tuesday',
          bounceRate: 12,
          returnRate: 88
        });

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError('Failed to load analytics data');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchAnalyticsData();
    }
  }, [user?.id, selectedCourse, selectedTimeframe]);

  const learningOutcomes = [
    { outcome: 'Problem Solving', achieved: 78, target: 85, trend: 'up' },
    { outcome: 'Critical Thinking', achieved: 82, target: 80, trend: 'up' },
    { outcome: 'Communication', achieved: 75, target: 80, trend: 'down' },
    { outcome: 'Collaboration', achieved: 88, target: 85, trend: 'up' },
    { outcome: 'Technical Skills', achieved: 72, target: 90, trend: 'up' }
  ];

  const assessmentEffectiveness = [
    { name: 'Quiz 1: Basics', attempts: 45, avgScore: 85, difficulty: 'Easy', discrimination: 0.65 },
    { name: 'Quiz 2: Intermediate', attempts: 42, avgScore: 78, difficulty: 'Medium', discrimination: 0.72 },
    { name: 'Quiz 3: Advanced', attempts: 38, avgScore: 72, difficulty: 'Hard', discrimination: 0.58 },
    { name: 'Midterm Exam', attempts: 40, avgScore: 80, difficulty: 'Medium', discrimination: 0.78 }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Analytics</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            Advanced Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into student performance and engagement
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses.map((course) => (
                <SelectItem key={course.id || course._id} value={course.id || course._id}>
                  {course.title || course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">Semester</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Active Students
              </CardTitle>
              <Users className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">143</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Completion Rate
              </CardTitle>
              <Target className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">87%</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+5%</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg Score
              </CardTitle>
              <Award className="h-5 w-5 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">84.2</div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+2.1</span>
              <span className="text-gray-500 ml-1">vs last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                At-Risk Students
              </CardTitle>
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">8</div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-red-600">Needs attention</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance Trends</TabsTrigger>
          <TabsTrigger value="engagement">Engagement Heatmap</TabsTrigger>
          <TabsTrigger value="outcomes">Learning Outcomes</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Students</TabsTrigger>
        </TabsList>

        {/* Performance Trends */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends Over Time</CardTitle>
              <CardDescription>
                Track completion rates, engagement, and average scores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="completion" 
                    stroke="#14b8a6" 
                    strokeWidth={3}
                    name="Completion Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="engagement" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    name="Engagement Score"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    name="Average Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Effectiveness</CardTitle>
                <CardDescription>
                  Analyze how well your assessments measure learning
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assessmentEffectiveness.map((assessment, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{assessment.name}</h4>
                        <Badge variant={
                          assessment.difficulty === 'Easy' ? 'default' :
                          assessment.difficulty === 'Medium' ? 'secondary' : 'destructive'
                        }>
                          {assessment.difficulty}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Attempts:</span>
                          <div className="font-medium">{assessment.attempts}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Avg Score:</span>
                          <div className="font-medium">{assessment.avgScore}%</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Discrimination:</span>
                          <div className="font-medium">{assessment.discrimination}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Course Completion Distribution</CardTitle>
                <CardDescription>
                  How students are progressing through your courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: 35, fill: '#10b981' },
                        { name: '75-99%', value: 28, fill: '#14b8a6' },
                        { name: '50-74%', value: 22, fill: '#f59e0b' },
                        { name: '25-49%', value: 10, fill: '#f97316' },
                        { name: '0-24%', value: 5, fill: '#ef4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Heatmap */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Student Activity Heatmap</CardTitle>
              <CardDescription>
                When are your students most active? Optimize your content timing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 7 * 24 }).map((_, index) => {
                  const intensity = Math.random();
                  return (
                    <div
                      key={index}
                      className={`h-8 rounded ${
                        intensity > 0.7 ? 'bg-teal-600' :
                        intensity > 0.5 ? 'bg-teal-400' :
                        intensity > 0.3 ? 'bg-teal-200' :
                        intensity > 0.1 ? 'bg-teal-100' : 'bg-gray-100'
                      }`}
                      title={`Activity level: ${Math.round(intensity * 100)}%`}
                    />
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                <span>Less active</span>
                <div className="flex space-x-1">
                  <div className="h-3 w-3 bg-gray-100 rounded"></div>
                  <div className="h-3 w-3 bg-teal-100 rounded"></div>
                  <div className="h-3 w-3 bg-teal-200 rounded"></div>
                  <div className="h-3 w-3 bg-teal-400 rounded"></div>
                  <div className="h-3 w-3 bg-teal-600 rounded"></div>
                </div>
                <span>More active</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Activity Hours</CardTitle>
                <CardDescription>
                  Best times to post content and announcements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '2:00 PM - 4:00 PM', activity: 92, students: 87 },
                    { time: '10:00 AM - 12:00 PM', activity: 85, students: 76 },
                    { time: '8:00 PM - 10:00 PM', activity: 78, students: 65 },
                    { time: '6:00 PM - 8:00 PM', activity: 72, students: 58 }
                  ].map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{slot.time}</div>
                        <div className="text-sm text-gray-600">{slot.students} active students</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-teal-600">{slot.activity}%</div>
                        <div className="text-sm text-gray-500">activity</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Engagement</CardTitle>
                <CardDescription>
                  Which content types get the most engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Interactive Videos', engagement: 94, icon: Eye },
                    { type: 'Discussion Forums', engagement: 87, icon: MessageSquare },
                    { type: 'Practice Quizzes', engagement: 82, icon: Brain },
                    { type: 'Reading Materials', engagement: 68, icon: BookOpen },
                    { type: 'Assignments', engagement: 75, icon: CheckCircle }
                  ].map((content, index) => {
                    const Icon = content.icon;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <Icon className="h-5 w-5 text-teal-600" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{content.type}</span>
                            <span className="text-sm text-gray-600">{content.engagement}%</span>
                          </div>
                          <Progress value={content.engagement} className="h-2" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Learning Outcomes */}
        <TabsContent value="outcomes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Learning Outcome Achievement</CardTitle>
              <CardDescription>
                Track how well students are meeting course objectives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningOutcomes.map((outcome, index) => {
                  const percentage = (outcome.achieved / outcome.target) * 100;
                  const isOnTrack = outcome.achieved >= outcome.target;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{outcome.outcome}</h4>
                        <div className="flex items-center space-x-2">
                          {outcome.trend === 'up' ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                          )}
                          <span className="text-sm text-gray-600">
                            {outcome.achieved}% / {outcome.target}%
                          </span>
                          <Badge variant={isOnTrack ? 'default' : 'destructive'}>
                            {isOnTrack ? 'On Track' : 'Below Target'}
                          </Badge>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min(percentage, 100)} 
                        className={`h-3 ${percentage > 100 ? 'progress-exceeded' : ''}`}
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Current: {outcome.achieved}%</span>
                        <span>Target: {outcome.target}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Skill Development Progress</CardTitle>
                <CardDescription>
                  Student growth in key competency areas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={learningOutcomes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="outcome" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="achieved" fill="#14b8a6" name="Achieved" />
                    <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outcome Improvement Suggestions</CardTitle>
                <CardDescription>
                  AI-powered recommendations to boost learning outcomes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      outcome: 'Communication',
                      suggestion: 'Add more peer review assignments and discussion prompts',
                      priority: 'high',
                      icon: MessageSquare
                    },
                    {
                      outcome: 'Technical Skills',
                      suggestion: 'Include more hands-on practice exercises and coding challenges',
                      priority: 'medium',
                      icon: Brain
                    },
                    {
                      outcome: 'Problem Solving',
                      suggestion: 'Introduce case studies and real-world problem scenarios',
                      priority: 'low',
                      icon: Target
                    }
                  ].map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-teal-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{item.outcome}</h5>
                              <Badge variant={
                                item.priority === 'high' ? 'destructive' :
                                item.priority === 'medium' ? 'secondary' : 'default'
                              }>
                                {item.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">{item.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* At-Risk Students */}
        <TabsContent value="at-risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Early Warning System</CardTitle>
              <CardDescription>
                Students who may need additional support and intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {atRiskStudents.map((student) => (
                  <div key={student.id} className="p-6 border rounded-lg">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white font-semibold">{student.avatar}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">{student.name}</h4>
                          <p className="text-gray-600">{student.course}</p>
                          <p className="text-sm text-gray-500">Last active: {student.lastActive}</p>
                        </div>
                      </div>
                      <Badge className={getRiskColor(student.riskLevel)}>
                        {student.riskLevel} risk
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Completion Rate</span>
                          <span className="text-sm font-medium">{student.completionRate}%</span>
                        </div>
                        <Progress value={student.completionRate} className="h-2" />
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className="text-sm font-medium">{student.averageScore}%</span>
                        </div>
                        <Progress value={student.averageScore} className="h-2" />
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium mb-2">Identified Issues:</h5>
                      <div className="flex flex-wrap gap-2">
                        {student.issues.map((issue, index) => (
                          <Badge key={index} variant="outline" className="text-red-600 border-red-200">
                            {issue}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Send Message
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Schedule Meeting
                      </Button>
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Factor Analysis</CardTitle>
                <CardDescription>
                  Common patterns among at-risk students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { factor: 'Low login frequency', percentage: 78, students: 6 },
                    { factor: 'Missing assignments', percentage: 67, students: 5 },
                    { factor: 'Poor quiz performance', percentage: 56, students: 4 },
                    { factor: 'No discussion participation', percentage: 44, students: 3 },
                    { factor: 'Late submissions', percentage: 33, students: 2 }
                  ].map((factor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <div className="font-medium">{factor.factor}</div>
                        <div className="text-sm text-gray-600">{factor.students} students affected</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-red-600">{factor.percentage}%</div>
                        <div className="text-sm text-gray-500">of at-risk</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Intervention Strategies</CardTitle>
                <CardDescription>
                  Recommended actions to support struggling students
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      strategy: 'Personalized Check-ins',
                      description: 'Schedule 1-on-1 meetings to understand challenges',
                      effectiveness: '85%',
                      icon: MessageSquare
                    },
                    {
                      strategy: 'Extended Deadlines',
                      description: 'Provide flexible timelines for assignment completion',
                      effectiveness: '72%',
                      icon: Clock
                    },
                    {
                      strategy: 'Peer Mentoring',
                      description: 'Connect with high-performing students for support',
                      effectiveness: '68%',
                      icon: Users
                    },
                    {
                      strategy: 'Additional Resources',
                      description: 'Provide supplementary materials and tutorials',
                      effectiveness: '65%',
                      icon: BookOpen
                    }
                  ].map((strategy, index) => {
                    const Icon = strategy.icon;
                    return (
                      <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 text-teal-600 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h5 className="font-medium">{strategy.strategy}</h5>
                              <Badge variant="secondary">{strategy.effectiveness}</Badge>
                            </div>
                            <p className="text-sm text-gray-600">{strategy.description}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}