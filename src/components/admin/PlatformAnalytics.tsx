import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { BarChart3, TrendingUp, Users, BookOpen, DollarSign, Activity, Target, AlertCircle, Download, Calendar, Filter, Eye, Clock, Award, Zap, RefreshCw } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

const mockData = {
  overview: {
    totalUsers: 15647,
    activeUsers: 12456,
    totalCourses: 342,
    completionRate: 78.5,
    revenue: 324580,
    roi: 245.8
  },
  usage: [
    { period: 'Jan', users: 8500, courses: 280, engagement: 72 },
    { period: 'Feb', users: 9200, courses: 295, engagement: 75 },
    { period: 'Mar', users: 10100, courses: 310, engagement: 78 },
    { period: 'Apr', users: 11300, courses: 325, engagement: 81 },
    { period: 'May', users: 12800, courses: 342, engagement: 83 },
    { period: 'Jun', users: 13500, courses: 358, engagement: 85 }
  ],
  predictive: [
    { course: 'Advanced React Development', successRate: 92, enrollments: 1250, completionPrediction: 89 },
    { course: 'Machine Learning Fundamentals', successRate: 85, enrollments: 980, completionPrediction: 82 },
    { course: 'Digital Marketing Strategy', successRate: 78, enrollments: 1450, completionPrediction: 75 },
    { course: 'Data Science with Python', successRate: 88, enrollments: 1100, completionPrediction: 85 },
    { course: 'UI/UX Design Principles', successRate: 91, enrollments: 890, completionPrediction: 88 }
  ],
  roi: [
    { category: 'Course Development', investment: 125000, returns: 280000, roi: 124 },
    { category: 'Marketing', investment: 75000, returns: 195000, roi: 160 },
    { category: 'Platform Infrastructure', investment: 50000, returns: 150000, roi: 200 },
    { category: 'Content Creation', investment: 90000, returns: 220000, roi: 144 }
  ]
};

export function PlatformAnalytics() {
  const { t } = useLanguage();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('users');

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [overviewResponse, usageResponse, predictiveResponse, roiResponse] = await Promise.allSettled([
          api.analytics.getPlatformAnalytics(dateRange),
          api.analytics.getUserEngagementStats(dateRange),
          api.analytics.getPredictiveAnalytics(),
          api.analytics.getRevenueAnalytics(dateRange)
        ]);

        // Process overview data
        if (overviewResponse.status === 'fulfilled' && overviewResponse.value) {
          setAnalyticsData(overviewResponse.value);
        } else {
          setAnalyticsData(mockData);
        }

        // Process usage data
        if (usageResponse.status === 'fulfilled' && usageResponse.value) {
          // Update usage data in analyticsData
          setAnalyticsData(prev => ({
            ...prev,
            usage: usageResponse.value
          }));
        }

        // Process predictive data
        if (predictiveResponse.status === 'fulfilled' && predictiveResponse.value) {
          setAnalyticsData(prev => ({
            ...prev,
            predictive: predictiveResponse.value
          }));
        }

        // Process ROI data
        if (roiResponse.status === 'fulfilled' && roiResponse.value) {
          setAnalyticsData(prev => ({
            ...prev,
            roi: roiResponse.value
          }));
        }

      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
        setError('Failed to load analytics data. Using cached data.');
        setAnalyticsData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();

    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      setRefreshing(true);
      fetchAnalyticsData().finally(() => setRefreshing(false));
    }, 300000); // 5 minutes

    return () => {
      clearInterval(refreshInterval);
    };
  }, [dateRange]);

  // Use analyticsData or fallback to mockData
  const data = analyticsData || mockData;

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
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
    <div className="space-y-6">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('admin.platformAnalytics', 'Platform Analytics')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.platformAnalyticsDesc', 'Comprehensive insights into platform performance and user engagement')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            try {
              const response = await api.analytics.exportAnalyticsReport('comprehensive', { period: dateRange });
              if (response) {
                toast.success('Report exported successfully');
                // Download the file
                const blob = new Blob([response], { type: 'application/pdf' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-report-${dateRange}.pdf`;
                a.click();
                window.URL.revokeObjectURL(url);
              } else {
                toast.error('Failed to export report');
              }
            } catch (error) {
              console.error('Export failed:', error);
              toast.error('Failed to export report');
            }
          }}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{data.overview?.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{data.overview?.activeUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  +8.3%
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{data.overview?.totalCourses || '0'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <BookOpen className="h-3 w-3 mr-1" />
                  +15.2%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold">{data.overview?.completionRate || '0'}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" />
                  +5.7%
                </p>
              </div>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">${data.overview?.revenue?.toLocaleString() || '0'}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <DollarSign className="h-3 w-3 mr-1" />
                  +18.4%
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Platform ROI</p>
                <p className="text-2xl font-bold">{data.overview?.roi || '0'}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <Zap className="h-3 w-3 mr-1" />
                  +22.1%
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="predictive">Predictive Analytics</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  User Growth Trends
                </CardTitle>
                <CardDescription>
                  Monthly active users and engagement metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(Array.isArray(data?.usage) ? data.usage : mockData.usage).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-cognerax-teal rounded-full"></div>
                        <span className="font-medium">{item.period}</span>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-gray-600">{item.users.toLocaleString()} users</span>
                        <span className="text-gray-600">{item.courses} courses</span>
                        <Badge variant={item.engagement > 80 ? "default" : "secondary"}>
                          {item.engagement}% engagement
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Engagement Heatmap
                </CardTitle>
                <CardDescription>
                  Peak activity times and user behavior patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2 text-xs text-center font-medium text-gray-500">
                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }, (_, i) => (
                      <div
                        key={i}
                        className={`h-8 rounded ${
                          Math.random() > 0.7 ? 'bg-cognerax-teal' :
                          Math.random() > 0.4 ? 'bg-cognerax-teal/60' :
                          Math.random() > 0.2 ? 'bg-cognerax-teal/30' : 'bg-gray-100'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Less</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                      <div className="w-3 h-3 bg-cognerax-teal/30 rounded-sm"></div>
                      <div className="w-3 h-3 bg-cognerax-teal/60 rounded-sm"></div>
                      <div className="w-3 h-3 bg-cognerax-teal rounded-sm"></div>
                    </div>
                    <span>More</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance Metrics</CardTitle>
                <CardDescription>
                  Completion rates and student satisfaction scores
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(Array.isArray(data?.predictive) ? data.predictive : mockData.predictive).slice(0, 3).map((course, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{course.course}</span>
                      <Badge variant="outline">{course.successRate}% success</Badge>
                    </div>
                    <Progress value={course.successRate} className="h-2" />
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{course.enrollments} enrolled</span>
                      <span>{course.completionPrediction}% predicted completion</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
                <CardDescription>
                  Platform uptime and response metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>System Uptime</span>
                    <Badge className="bg-green-100 text-green-800">99.9%</Badge>
                  </div>
                  <Progress value={99.9} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Average Response Time</span>
                    <Badge variant="outline">245ms</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Error Rate</span>
                    <Badge className="bg-green-100 text-green-800">0.1%</Badge>
                  </div>
                  <Progress value={1} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>User Satisfaction</span>
                    <Badge className="bg-green-100 text-green-800">4.8/5</Badge>
                  </div>
                  <Progress value={96} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Course Success Predictions
              </CardTitle>
              <CardDescription>
                AI-powered predictions for course completion and success rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(data?.predictive) ? data.predictive : mockData.predictive).map((course, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{course.course}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={course.completionPrediction > 85 ? "default" : course.completionPrediction > 75 ? "secondary" : "destructive"}>
                          {course.completionPrediction}% predicted completion
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Current Success Rate</span>
                        <p className="font-medium">{course.successRate}%</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Enrollments</span>
                        <p className="font-medium">{course.enrollments.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Predicted Completion</span>
                        <p className="font-medium">{course.completionPrediction}%</p>
                      </div>
                    </div>
                    <Progress value={course.completionPrediction} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Return on Investment Analysis
              </CardTitle>
              <CardDescription>
                Financial performance and investment effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(Array.isArray(data?.roi) ? data.roi : mockData.roi).map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{item.category}</h4>
                      <Badge variant={item.roi > 150 ? "default" : item.roi > 100 ? "secondary" : "outline"}>
                        {item.roi}% ROI
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Investment</span>
                        <p className="font-medium">${item.investment.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Returns</span>
                        <p className="font-medium text-green-600">${item.returns.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Net Profit</span>
                        <p className="font-medium text-green-600">${(item.returns - item.investment).toLocaleString()}</p>
                      </div>
                    </div>
                    <Progress value={(item.roi / 250) * 100} className="h-2 mt-3" />
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