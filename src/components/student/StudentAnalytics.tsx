import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Clock, Award, Target, BookOpen, 
  Brain, Zap, Calendar, Star, Trophy, ChartBar, Users, Flame
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface StudentAnalyticsProps {
  user: any;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ user }) => {
  const { t, language, isRTL } = useLanguage();
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real analytics data from API
  const [overallStats, setOverallStats] = useState({
    totalHours: 0,
    coursesCompleted: 0,
    coursesInProgress: 0,
    averageScore: 0,
    streak: 0,
    totalQuizzes: 0,
    totalAchievements: 0
  });

  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([]);
  const [skillProgress, setSkillProgress] = useState<any[]>([]);
  const [courseProgress, setCourseProgress] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [studyPatterns, setStudyPatterns] = useState<any[]>([]);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch student analytics - Extract data from response wrapper
        const analyticsResponse = await api.analytics.getStudentDashboard();
        console.log('📊 Student analytics response:', analyticsResponse);

        if (analyticsResponse && analyticsResponse.success && analyticsResponse.data) {
          const data = analyticsResponse.data;
          setOverallStats({
            totalHours: data.overview?.totalTimeSpent || 0,
            coursesCompleted: data.overview?.completedCourses || 0,
            coursesInProgress: data.overview?.activeCourses || 0,
            averageScore: data.overview?.averageProgress || 0,
            streak: data.overview?.learningStreak || 0,
            totalQuizzes: data.overview?.totalQuizzes || 0,
            totalAchievements: data.overview?.achievements || 0
          });

          // Use real data from API if available
          if (data.progressByField) {
            setSkillProgress(data.progressByField.map((field: any) => ({
              skill: field.fieldName || field.name,
              current: field.progress || 0,
              target: 100,
              improvement: field.improvement || 0
            })));
          } else {
            setSkillProgress([]);
          }

          if (data.recentActivity) {
            setWeeklyProgress(data.recentActivity.map((activity: any) => ({
              day: activity.day || activity.date,
              hours: activity.hours || activity.timeSpent || 0,
              quizzes: activity.quizzes || 0,
              score: activity.score || activity.averageScore || 0
            })));
          } else {
            setWeeklyProgress([]);
          }
        } else {
          console.warn('⚠️ No analytics data or invalid response structure');
          setOverallStats({
            totalHours: 0,
            coursesCompleted: 0,
            coursesInProgress: 0,
            averageScore: 0,
            streak: 0,
            totalQuizzes: 0,
            totalAchievements: 0
          });
          setSkillProgress([]);
          setWeeklyProgress([]);
        }

      } catch (error: any) {
        console.error('Error fetching analytics data:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Student analytics endpoint not implemented yet');
          setError(null);
          setOverallStats({
            totalHours: 0,
            coursesCompleted: 0,
            coursesInProgress: 0,
            averageScore: 0,
            streak: 0,
            totalQuizzes: 0,
            totalAchievements: 0
          });
          setSkillProgress([]);
          setWeeklyProgress([]);
        } else {
          setError('Failed to load analytics data');
          toast.error('Failed to load analytics data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [user?.id, user?._id, selectedTimeframe]);

  const mockSkillProgress = [
    { skill: 'JavaScript', current: 85, target: 90, improvement: 12 },
    { skill: 'React', current: 78, target: 85, improvement: 15 },
    { skill: 'Python', current: 92, target: 95, improvement: 8 },
    { skill: 'Data Analysis', current: 67, target: 80, improvement: 23 },
    { skill: 'Machine Learning', current: 45, target: 70, improvement: 35 }
  ];

  const performanceBySubject = [
    { subject: 'Frontend Development', score: 89, hours: 25, quizzes: 12 },
    { subject: 'Backend Development', score: 82, hours: 18, quizzes: 8 },
    { subject: 'Data Science', score: 76, hours: 15, quizzes: 6 },
    { subject: 'Mobile Development', score: 91, hours: 12, quizzes: 4 }
  ];

  const learningPattern = [
    { time: '6-8 AM', focus: 95, productivity: 88 },
    { time: '8-10 AM', focus: 78, productivity: 82 },
    { time: '10-12 PM', focus: 85, productivity: 90 },
    { time: '2-4 PM', focus: 72, productivity: 75 },
    { time: '4-6 PM', focus: 68, productivity: 70 },
    { time: '8-10 PM', focus: 82, productivity: 85 }
  ];

  const recommendations = [
    {
      type: 'course',
      title: 'Advanced React Patterns',
      reason: 'Based on your React progress and JavaScript skills',
      priority: 'high',
      estimatedTime: '6 hours'
    },
    {
      type: 'skill',
      title: 'TypeScript Fundamentals',
      reason: 'Complements your JavaScript knowledge',
      priority: 'medium',
      estimatedTime: '4 hours'
    },
    {
      type: 'practice',
      title: 'Data Structures Practice',
      reason: 'Improve your problem-solving skills',
      priority: 'high',
      estimatedTime: '8 hours'
    }
  ];

  const COLORS = ['#2dd4bf', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('Loading analytics...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-400 mx-auto mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('Error Loading Analytics')}</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          {t('Try Again')}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('Learning Analytics')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Track your progress and optimize your learning journey')}
          </p>
        </div>
        <div className="flex gap-2">
          {['week', 'month', 'quarter', 'year'].map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className={selectedTimeframe === timeframe ? 'bg-cognerax-gradient' : ''}
            >
              {t(timeframe.charAt(0).toUpperCase() + timeframe.slice(1))}
            </Button>
          ))}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 hover:shadow-cognerax transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Total Study Hours')}</p>
                <p className="text-2xl font-bold text-cognerax-teal">{overallStats.totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-cognerax-teal" />
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600 rtl:flex-row-reverse">
              <TrendingUp className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('+2.5h this week')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-cognerax transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Average Score')}</p>
                <p className="text-2xl font-bold text-cognerax-purple">{overallStats.averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-cognerax-purple" />
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600 rtl:flex-row-reverse">
              <TrendingUp className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('+3.2% improvement')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-cognerax transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Learning Streak')}</p>
                <p className="text-2xl font-bold text-orange-500">{overallStats.streak} days</p>
              </div>
              <Flame className="h-8 w-8 text-orange-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600 rtl:flex-row-reverse">
              <TrendingUp className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('Personal best!')}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-cognerax transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('Achievements')}</p>
                <p className="text-2xl font-bold text-yellow-500">{overallStats.totalAchievements}</p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="flex items-center mt-2 text-xs text-green-600 rtl:flex-row-reverse">
              <TrendingUp className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
              {t('+2 this week')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="progress" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="progress">{t('Progress Overview')}</TabsTrigger>
          <TabsTrigger value="skills">{t('Skill Development')}</TabsTrigger>
          <TabsTrigger value="performance">{t('Performance')}</TabsTrigger>
          <TabsTrigger value="insights">{t('AI Insights')}</TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Learning Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                  <ChartBar className="h-5 w-5 text-cognerax-teal" />
                  {t('Weekly Learning Hours')}
                </CardTitle>
                <CardDescription>
                  {t('Your study time distribution over the past week')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Quiz Performance Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 rtl:flex-row-reverse">
                  <Brain className="h-5 w-5 text-cognerax-purple" />
                  {t('Quiz Performance Trend')}
                </CardTitle>
                <CardDescription>
                  {t('Your quiz scores over time')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Course Progress */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Course Progress')}</CardTitle>
              <CardDescription>
                {t('Track your advancement in each enrolled course')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'React Development Masterclass', progress: 78, lessons: 42, total: 54 },
                  { name: 'Python for Data Science', progress: 65, lessons: 28, total: 43 },
                  { name: 'Machine Learning Fundamentals', progress: 32, lessons: 15, total: 47 },
                  { name: 'Mobile App Development', progress: 89, lessons: 34, total: 38 }
                ].map((course, index) => (
                  <div key={index} className="space-y-2" dir={isRTL ? 'rtl' : 'ltr'}>
                    <div className="flex justify-between items-center">
                      <h4 className={`font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{course.name}</h4>
                      <span className={`text-sm text-muted-foreground ${isRTL ? 'text-left' : 'text-right'}`}>
                        {course.lessons}/{course.total} {t('lessons')}
                      </span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{course.progress}% {t('complete')}</span>
                      <span>{course.total - course.lessons} {t('lessons remaining')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Radar Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cognerax-teal" />
                  {t('Skill Assessment')}
                </CardTitle>
                <CardDescription>
                  {t('Your current skill levels across different areas')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillProgress}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="skill" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Current" dataKey="current" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.1} strokeWidth={2} />
                    <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.1} strokeWidth={2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Skill Progress Details */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Skill Development Progress')}</CardTitle>
                <CardDescription>
                  {t('Detailed breakdown of your skill improvements')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillProgress.map((skill, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{skill.skill}</h4>
                        <Badge variant={skill.improvement > 20 ? 'default' : 'secondary'} className={skill.improvement > 20 ? 'bg-cognerax-gradient' : ''}>
                          +{skill.improvement}%
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Progress value={skill.current} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-16">
                          {skill.current}/{skill.target}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance by Subject */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Performance by Subject')}</CardTitle>
                <CardDescription>
                  {t('Compare your performance across different subjects')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceBySubject} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="subject" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#2dd4bf" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Learning Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>{t('Learning Pattern Analysis')}</CardTitle>
                <CardDescription>
                  {t('Your focus and productivity throughout the day')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={learningPattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="focus" stroke="#2dd4bf" strokeWidth={2} name="Focus Level" />
                    <Line type="monotone" dataKey="productivity" stroke="#8b5cf6" strokeWidth={2} name="Productivity" />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Detailed Performance Metrics')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">{t('Subject')}</th>
                      <th className="text-left p-2">{t('Average Score')}</th>
                      <th className="text-left p-2">{t('Study Hours')}</th>
                      <th className="text-left p-2">{t('Quizzes Taken')}</th>
                      <th className="text-left p-2">{t('Status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceBySubject.map((subject, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{subject.subject}</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <span>{subject.score}%</span>
                            <Progress value={subject.score} className="w-16 h-1" />
                          </div>
                        </td>
                        <td className="p-2">{subject.hours}h</td>
                        <td className="p-2">{subject.quizzes}</td>
                        <td className="p-2">
                          <Badge variant={subject.score >= 80 ? 'default' : 'secondary'} className={subject.score >= 80 ? 'bg-cognerax-gradient' : ''}>
                            {subject.score >= 80 ? t('Excellent') : t('Good')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* AI Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-cognerax-purple" />
                {t('AI-Powered Recommendations')}
              </CardTitle>
              <CardDescription>
                {t('Personalized suggestions based on your learning patterns')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow">
                    <div className={`p-2 rounded-full ${rec.priority === 'high' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {rec.type === 'course' && <BookOpen className="h-4 w-4" />}
                      {rec.type === 'skill' && <Zap className="h-4 w-4" />}
                      {rec.type === 'practice' && <Target className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{rec.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                        </div>
                        <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                          {t(rec.priority)} {t('priority')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {rec.estimatedTime}
                        </span>
                        <Button size="sm" variant="outline" className="ml-auto">
                          {t('Start Learning')}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Learning Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-cognerax-teal" />
                {t('Learning Goals & Milestones')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { goal: 'Complete React Masterclass', progress: 78, deadline: '2024-02-15', status: 'on-track' },
                  { goal: 'Master Python Fundamentals', progress: 45, deadline: '2024-03-01', status: 'behind' },
                  { goal: 'Build Portfolio Project', progress: 23, deadline: '2024-03-15', status: 'ahead' }
                ].map((goal, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{goal.goal}</h4>
                        <Badge variant={goal.status === 'on-track' ? 'default' : goal.status === 'ahead' ? 'secondary' : 'destructive'}>
                          {t(goal.status)}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="mb-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{goal.progress}% complete</span>
                        <span>{t('Due')}: {goal.deadline}</span>
                      </div>
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
};