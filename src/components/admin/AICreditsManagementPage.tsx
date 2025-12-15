import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Plus, 
  Minus, 
  Search, 
  Filter, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart3, 
  Calendar, 
  Edit, 
  Save, 
  X, 
  RefreshCw,
  CreditCard,
  Wallet,
  History,
  Settings,
  Award,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Separator } from '../ui/separator';
import { useLanguage } from '../context/LanguageContext';
import { useAICredits } from '../context/AICreditsContext';
import { api } from '../../services/api';

interface AICreditsManagementPageProps {
  user?: any;
}

export function AICreditsManagementPage({ user }: AICreditsManagementPageProps) {
  const { t, isRTL } = useLanguage();
  const { refresh: refreshAICredits } = useAICredits();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newCredits, setNewCredits] = useState('');
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Organization credits data
  const [orgCredits, setOrgCredits] = useState({
    total: 5000,
    used: 1250,
    remaining: 3750,
    monthlyUsage: 850,
    lastPurchased: '2024-03-01',
    nextRenewal: '2024-04-01'
  });

  // Fetch credits data
  useEffect(() => {
    const fetchCreditsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [creditsResponse, instructorsResponse, historyResponse] = await Promise.allSettled([
          api.ai.getAICreditsBalance(),
          api.ai.getInstructorCredits(),
          api.ai.getAICreditsHistory()
        ]);

        // Process organization credits
        if (creditsResponse.status === 'fulfilled' && creditsResponse.value) {
          const apiData = creditsResponse.value;
          setOrgCredits({
            total: apiData.total ?? 5000,
            used: apiData.used ?? 0,
            remaining: apiData.remaining ?? (apiData.total ?? 5000) - (apiData.used ?? 0),
            monthlyUsage: apiData.monthlyUsage ?? 0,
            lastPurchased: apiData.lastPurchased ?? new Date().toISOString().split('T')[0],
            nextRenewal: apiData.nextRenewal ?? new Date().toISOString().split('T')[0]
          });
        }

        // Process instructor credits
        if (instructorsResponse.status === 'fulfilled' && instructorsResponse.value && Array.isArray(instructorsResponse.value)) {
          setInstructors(instructorsResponse.value);
        } else {
          // Fallback to mock data
          setInstructors([
            {
              id: 1,
              name: 'Dr. Sarah Johnson',
              email: 'sarah.johnson@cognerax.com',
              role: 'Senior Instructor',
              avatar: null,
              credits: { allocated: 850, used: 320, remaining: 530 },
              usage: { thisMonth: 45, lastMonth: 38, avgPerWeek: 11 },
              lastActive: '2024-03-15',
              coursesCount: 3,
              studentsCount: 120,
              usageBreakdown: { quizGeneration: 15, contentAnalysis: 8, essayGrading: 12, tutoring: 10 }
            },
            {
              id: 2,
              name: 'Prof. Michael Chen',
              email: 'michael.chen@cognerax.com',
              role: 'Lead Instructor',
              avatar: null,
              credits: { allocated: 1200, used: 680, remaining: 520 },
              usage: { thisMonth: 68, lastMonth: 72, avgPerWeek: 17 },
              lastActive: '2024-03-14',
              coursesCount: 5,
              studentsCount: 180,
              usageBreakdown: { quizGeneration: 25, contentAnalysis: 15, essayGrading: 18, tutoring: 10 }
            },
            {
              id: 3,
              name: 'Dr. Emily Rodriguez',
              email: 'emily.rodriguez@cognerax.com',
              role: 'Instructor',
              avatar: null,
              credits: { allocated: 600, used: 450, remaining: 150 },
              usage: { thisMonth: 45, lastMonth: 42, avgPerWeek: 11 },
              lastActive: '2024-03-13',
              coursesCount: 2,
              studentsCount: 85,
              usageBreakdown: { quizGeneration: 12, contentAnalysis: 8, essayGrading: 15, tutoring: 10 }
            },
            {
              id: 4,
              name: 'Prof. David Kim',
              email: 'david.kim@cognerax.com',
              role: 'Senior Instructor',
              avatar: null,
              credits: { allocated: 900, used: 0, remaining: 900 },
              usage: { thisMonth: 0, lastMonth: 15, avgPerWeek: 0 },
              lastActive: '2024-03-12',
              coursesCount: 4,
              studentsCount: 95,
              usageBreakdown: { quizGeneration: 0, contentAnalysis: 0, essayGrading: 0, tutoring: 0 }
            }
          ]);
        }

        // Process credits history
        if (historyResponse.status === 'fulfilled' && historyResponse.value && Array.isArray(historyResponse.value)) {
          setCreditsHistory(historyResponse.value);
        } else {
          // Fallback to mock data
          setCreditsHistory([
            {
              id: 1,
              type: 'allocation',
              amount: 500,
              instructor: 'Dr. Sarah Johnson',
              reason: 'Monthly allocation',
              date: '2024-03-01',
              status: 'completed'
            },
            {
              id: 2,
              type: 'usage',
              amount: -50,
              instructor: 'Prof. Michael Chen',
              reason: 'AI Essay Grading',
              date: '2024-03-15',
              status: 'completed'
            },
            {
              id: 3,
              type: 'purchase',
              amount: 1000,
              instructor: 'Organization',
              reason: 'Credits purchase',
              date: '2024-03-01',
              status: 'completed'
            }
          ]);
        }

      } catch (error) {
        console.error('Failed to fetch credits data:', error);
        setError('Failed to load credits data. Using cached data.');
        // Fallback to mock data
        setInstructors([
          {
            id: 1,
            name: 'Dr. Sarah Johnson',
            email: 'sarah.johnson@cognerax.com',
            role: 'Senior Instructor',
            avatar: null,
            credits: { allocated: 850, used: 320, remaining: 530 },
            usage: { thisMonth: 45, lastMonth: 38, avgPerWeek: 11 },
            lastActive: '2024-03-15',
            coursesCount: 3,
            studentsCount: 120,
            usageBreakdown: { quizGeneration: 15, contentAnalysis: 8, essayGrading: 12, tutoring: 10 }
          },
          {
            id: 2,
            name: 'Prof. Michael Chen',
            email: 'michael.chen@cognerax.com',
            role: 'Lead Instructor',
            avatar: null,
            credits: { allocated: 1200, used: 680, remaining: 520 },
            usage: { thisMonth: 68, lastMonth: 72, avgPerWeek: 17 },
            lastActive: '2024-03-14',
            coursesCount: 5,
            studentsCount: 180,
            usageBreakdown: { quizGeneration: 25, contentAnalysis: 15, essayGrading: 18, tutoring: 10 }
          },
          {
            id: 3,
            name: 'Dr. Emily Rodriguez',
            email: 'emily.rodriguez@cognerax.com',
            role: 'Instructor',
            avatar: null,
            credits: { allocated: 600, used: 450, remaining: 150 },
            usage: { thisMonth: 45, lastMonth: 42, avgPerWeek: 11 },
            lastActive: '2024-03-13',
            coursesCount: 2,
            studentsCount: 85,
            usageBreakdown: { quizGeneration: 12, contentAnalysis: 8, essayGrading: 15, tutoring: 10 }
          },
          {
            id: 4,
            name: 'Prof. David Kim',
            email: 'david.kim@cognerax.com',
            role: 'Senior Instructor',
            avatar: null,
            credits: { allocated: 900, used: 0, remaining: 900 },
            usage: { thisMonth: 0, lastMonth: 15, avgPerWeek: 0 },
            lastActive: '2024-03-12',
            coursesCount: 4,
            studentsCount: 95,
            usageBreakdown: { quizGeneration: 0, contentAnalysis: 0, essayGrading: 0, tutoring: 0 }
          }
        ]);
        setCreditsHistory([
          {
            id: 1,
            type: 'allocation',
            amount: 500,
            instructor: 'Dr. Sarah Johnson',
            reason: 'Monthly allocation',
            date: '2024-03-01',
            status: 'completed'
          },
          {
            id: 2,
            type: 'usage',
            amount: -50,
            instructor: 'Prof. Michael Chen',
            reason: 'AI Essay Grading',
            date: '2024-03-15',
            status: 'completed'
          },
          {
            id: 3,
            type: 'purchase',
            amount: 1000,
            instructor: 'Organization',
            reason: 'Credits purchase',
            date: '2024-03-01',
            status: 'completed'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditsData();
  }, []);

  // Credits history state
  const [creditsHistory, setCreditsHistory] = useState<any[]>([]);

  // Mock instructor credits data
  const [instructors, setInstructors] = useState([
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@university.edu',
      role: 'instructor',
      avatar: null,
      credits: {
        allocated: 200,
        used: 45,
        remaining: 155
      },
      usage: {
        thisMonth: 25,
        lastMonth: 20,
        avgPerWeek: 6
      },
      lastActive: '2 hours ago',
      coursesCount: 3,
      studentsCount: 105,
      usageBreakdown: {
        contentAnalysis: 15,
        quizGeneration: 18,
        essayGrading: 8,
        tutoring: 4
      }
    },
    {
      id: 2,
      name: 'Prof. Michael Chen',
      email: 'michael.chen@university.edu',
      role: 'instructor',
      avatar: null,
      credits: {
        allocated: 150,
        used: 89,
        remaining: 61
      },
      usage: {
        thisMonth: 42,
        lastMonth: 47,
        avgPerWeek: 11
      },
      lastActive: '5 hours ago',
      coursesCount: 2,
      studentsCount: 78,
      usageBreakdown: {
        contentAnalysis: 25,
        quizGeneration: 30,
        essayGrading: 22,
        tutoring: 12
      }
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@university.edu',
      role: 'instructor',
      avatar: null,
      credits: {
        allocated: 100,
        used: 15,
        remaining: 85
      },
      usage: {
        thisMonth: 8,
        lastMonth: 7,
        avgPerWeek: 2
      },
      lastActive: '1 day ago',
      coursesCount: 1,
      studentsCount: 32,
      usageBreakdown: {
        contentAnalysis: 8,
        quizGeneration: 5,
        essayGrading: 2,
        tutoring: 0
      }
    },
    {
      id: 4,
      name: 'Dr. James Park',
      email: 'james.park@university.edu',
      role: 'instructor',
      avatar: null,
      credits: {
        allocated: 250,
        used: 180,
        remaining: 70
      },
      usage: {
        thisMonth: 65,
        lastMonth: 55,
        avgPerWeek: 15
      },
      lastActive: '30 minutes ago',
      coursesCount: 4,
      studentsCount: 142,
      usageBreakdown: {
        contentAnalysis: 45,
        quizGeneration: 60,
        essayGrading: 50,
        tutoring: 25
      }
    }
  ]);

  // Mock usage history
  const usageHistory = [
    { id: 1, date: '2024-03-20', user: 'Dr. Sarah Johnson', action: 'Quiz Generation', credits: 15, type: 'usage', details: 'Generated 3 math quizzes for Calculus I' },
    { id: 2, date: '2024-03-20', user: 'Admin', action: 'Credits Allocated to Prof. Chen', credits: 50, type: 'allocation', details: 'Monthly credit top-up' },
    { id: 3, date: '2024-03-19', user: 'Prof. Michael Chen', action: 'Content Analysis', credits: 8, type: 'usage', details: 'Analyzed 4 lecture documents' },
    { id: 4, date: '2024-03-19', user: 'Dr. Emily Rodriguez', action: 'AI Content Recreation', credits: 12, type: 'usage', details: 'Recreated biology lab manual section' },
    { id: 5, date: '2024-03-18', user: 'Admin', action: 'Credits Purchase', credits: 1000, type: 'purchase', details: 'Monthly credits package' },
    { id: 6, date: '2024-03-18', user: 'Dr. James Park', action: 'Essay Grading', credits: 25, type: 'usage', details: 'Graded 50 essays for English Literature' },
    { id: 7, date: '2024-03-17', user: 'Dr. Sarah Johnson', action: 'AI Tutoring Session', credits: 5, type: 'usage', details: 'Student tutoring for advanced calculus' }
  ];

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || instructor.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleAllocateCredits = async (instructorId: number, amount: number) => {
    if (amount <= 0 || amount > (orgCredits?.remaining ?? 0)) {
      toast.error('Invalid credit amount');
      return;
    }

    try {
      const response = await api.ai.allocateAICredits({
        userId: instructorId.toString(),
        amount: amount,
        description: 'Manual allocation'
      });
      if (response) {
        toast.success(`Allocated ${amount} credits to instructor`);
        void refreshAICredits();
        
        // Refresh data
        const [creditsResponse, instructorsResponse] = await Promise.allSettled([
          api.ai.getAICreditsBalance(),
          api.ai.getInstructorCredits()
        ]);
        
        if (creditsResponse.status === 'fulfilled' && creditsResponse.value) {
          const apiData = creditsResponse.value;
          setOrgCredits({
            total: apiData.total ?? 5000,
            used: apiData.used ?? 0,
            remaining: apiData.remaining ?? (apiData.total ?? 5000) - (apiData.used ?? 0),
            monthlyUsage: apiData.monthlyUsage ?? 0,
            lastPurchased: apiData.lastPurchased ?? new Date().toISOString().split('T')[0],
            nextRenewal: apiData.nextRenewal ?? new Date().toISOString().split('T')[0]
          });
        }
        
        if (instructorsResponse.status === 'fulfilled' && instructorsResponse.value && Array.isArray(instructorsResponse.value)) {
          setInstructors(instructorsResponse.value);
        }
      } else {
        toast.error('Failed to allocate credits');
      }
    } catch (error) {
      console.error('Allocate credits failed:', error);
      toast.error('Failed to allocate credits');
    }

    setEditingUser(null);
    setNewCredits('');
  };

  const handleBulkAllocate = async () => {
    const amount = parseInt(creditsToAdd);
    if (amount <= 0 || amount > (orgCredits?.remaining ?? 0)) {
      toast.error('Invalid credit amount');
      return;
    }

    const creditsPerInstructor = Math.floor(amount / instructors.length);
    
    try {
      const allocations = instructors.map(instructor => ({
        userId: instructor.id.toString(),
        amount: creditsPerInstructor,
        description: 'Bulk allocation'
      }));

      const response = await api.ai.bulkAllocateCredits({ allocations });
      if (response) {
        toast.success(`Allocated ${creditsPerInstructor} credits to each instructor`);
        void refreshAICredits();
        
        // Refresh data
        const [creditsResponse, instructorsResponse] = await Promise.allSettled([
          api.ai.getAICreditsBalance(),
          api.ai.getInstructorCredits()
        ]);
        
        if (creditsResponse.status === 'fulfilled' && creditsResponse.value) {
          const apiData = creditsResponse.value;
          setOrgCredits({
            total: apiData.total ?? 5000,
            used: apiData.used ?? 0,
            remaining: apiData.remaining ?? (apiData.total ?? 5000) - (apiData.used ?? 0),
            monthlyUsage: apiData.monthlyUsage ?? 0,
            lastPurchased: apiData.lastPurchased ?? new Date().toISOString().split('T')[0],
            nextRenewal: apiData.nextRenewal ?? new Date().toISOString().split('T')[0]
          });
        }
        
        if (instructorsResponse.status === 'fulfilled' && instructorsResponse.value && Array.isArray(instructorsResponse.value)) {
          setInstructors(instructorsResponse.value);
        }
      } else {
        toast.error('Failed to allocate credits');
      }
    } catch (error) {
      console.error('Bulk allocate failed:', error);
      toast.error('Failed to allocate credits');
    }

    setShowAddCredits(false);
    setCreditsToAdd('');
  };

  const getUsageColor = (usedPercentage: number) => {
    if (usedPercentage < 50) return 'text-green-600';
    if (usedPercentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'usage': return <Minus className="h-4 w-4 text-red-500" />;
      case 'allocation': return <Plus className="h-4 w-4 text-green-500" />;
      case 'purchase': return <CreditCard className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'usage': return 'bg-red-50 border-red-200';
      case 'allocation': return 'bg-green-50 border-green-200';
      case 'purchase': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl shadow-lg">
          <Zap className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            {t('aiCredits.title', 'AI Credits Management')}
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            {t('aiCredits.description', 'Manage AI credits distribution and track usage across your organization')}
          </p>
        </div>
      </div>

      {/* Organization Credits Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">{t('aiCredits.totalCredits', 'Total Credits')}</p>
                <p className="text-2xl font-bold text-blue-800">{(orgCredits?.total ?? 0).toLocaleString()}</p>
              </div>
              <Wallet className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">{t('aiCredits.used', 'Used Credits')}</p>
                <p className="text-2xl font-bold text-red-800">{(orgCredits?.used ?? 0).toLocaleString()}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">{t('aiCredits.remaining', 'Remaining Credits')}</p>
                <p className="text-2xl font-bold text-green-800">{(orgCredits?.remaining ?? 0).toLocaleString()}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">{t('aiCredits.monthlyUsage', 'Monthly Usage')}</p>
                <p className="text-2xl font-bold text-purple-800">{orgCredits.monthlyUsage.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="instructors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="instructors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('aiCredits.instructors', 'Instructors')}
          </TabsTrigger>
          <TabsTrigger value="usage" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {t('aiCredits.usage', 'Usage History')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('aiCredits.analytics', 'Analytics')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            {t('aiCredits.settings', 'Settings')}
          </TabsTrigger>
        </TabsList>

        {/* Instructors Tab */}
        <TabsContent value="instructors" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('aiCredits.searchInstructors', 'Search instructors...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('aiCredits.allRoles', 'All Roles')}</SelectItem>
                  <SelectItem value="instructor">{t('aiCredits.instructors', 'Instructors')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={() => setShowAddCredits(true)}
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {t('aiCredits.bulkAllocate', 'Bulk Allocate')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredInstructors.map((instructor) => {
              const credits = instructor.credits || { allocated: 0, used: 0, remaining: 0 };
              const usageBreakdown = instructor.usageBreakdown || { contentAnalysis: 0, quizGeneration: 0, essayGrading: 0, tutoring: 0 };
              const usagePercentage = credits.allocated > 0 ? (credits.used / credits.allocated) * 100 : 0;
              return (
                <Card key={instructor.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={instructor.avatar} />
                          <AvatarFallback>{instructor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">{instructor.name}</CardTitle>
                          <CardDescription>{instructor.email}</CardDescription>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingUser(instructor)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{credits.allocated}</p>
                        <p className="text-xs text-gray-600">{t('aiCredits.allocated', 'Allocated')}</p>
                      </div>
                      <div>
                        <p className={`text-2xl font-bold ${getUsageColor(usagePercentage)}`}>
                          {credits.used}
                        </p>
                        <p className="text-xs text-gray-600">{t('aiCredits.used', 'Used')}</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-600">{credits.remaining}</p>
                        <p className="text-xs text-gray-600">{t('aiCredits.remaining', 'Remaining')}</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{t('aiCredits.usage', 'Usage')}</span>
                        <span>{Math.round(usagePercentage)}%</span>
                      </div>
                      <Progress value={usagePercentage} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-700">{t('aiCredits.usageBreakdown', 'Usage Breakdown')}</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('aiCredits.contentAnalysis', 'Content Analysis')}:</span>
                          <span className="font-medium">{usageBreakdown.contentAnalysis}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('aiCredits.quizGeneration', 'Quiz Generation')}:</span>
                          <span className="font-medium">{usageBreakdown.quizGeneration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('aiCredits.essayGrading', 'Essay Grading')}:</span>
                          <span className="font-medium">{usageBreakdown.essayGrading}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('aiCredits.tutoring', 'Tutoring')}:</span>
                          <span className="font-medium">{usageBreakdown.tutoring}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>{instructor.coursesCount} courses • {instructor.studentsCount} students</span>
                      <span>{t('aiCredits.lastActive', 'Last active')}: {instructor.lastActive}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Usage History Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-600" />
                {t('aiCredits.recentActivity', 'Recent Activity')}
              </CardTitle>
              <CardDescription>
                {t('aiCredits.recentActivityDesc', 'Track all credit-related activities in your organization')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageHistory.map((activity) => (
                  <div key={activity.id} className={`border rounded-lg p-4 ${getActionColor(activity.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getActionIcon(activity.type)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{activity.user}</span>
                            <Badge variant="secondary" className="text-xs">
                              {activity.type}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{activity.action}</p>
                          <p className="text-xs text-gray-600 mt-1">{activity.details}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          activity.type === 'usage' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {activity.type === 'usage' ? '-' : '+'}{activity.credits}
                        </div>
                        <div className="text-xs text-gray-500">{activity.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('aiCredits.averageUsage', 'Average Monthly Usage')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">847</div>
                <p className="text-xs text-gray-500 mt-1">{t('aiCredits.creditsPerMonth', 'credits per month')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('aiCredits.mostUsedFeature', 'Most Used Feature')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-600">{t('aiCredits.quizGeneration', 'Quiz Generation')}</div>
                <p className="text-xs text-gray-500 mt-1">45% {t('aiCredits.ofTotalUsage', 'of total usage')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('aiCredits.topUser', 'Top User This Month')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-600">Dr. James Park</div>
                <p className="text-xs text-gray-500 mt-1">65 {t('aiCredits.creditsUsed', 'credits used')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('aiCredits.usageTrends', 'Usage Trends')}</CardTitle>
              <CardDescription>
                {t('aiCredits.usageTrendsDesc', 'AI credits usage patterns across different features')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('aiCredits.contentAnalysis', 'Content Analysis')}</span>
                    <span>32%</span>
                  </div>
                  <Progress value={32} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('aiCredits.quizGeneration', 'Quiz Generation')}</span>
                    <span>45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('aiCredits.essayGrading', 'Essay Grading')}</span>
                    <span>18%</span>
                  </div>
                  <Progress value={18} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('aiCredits.tutoring', 'AI Tutoring')}</span>
                    <span>5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                {t('aiCredits.creditSettings', 'Credit Settings')}
              </CardTitle>
              <CardDescription>
                {t('aiCredits.creditSettingsDesc', 'Configure credit allocation and usage policies')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">{t('aiCredits.allocationRules', 'Allocation Rules')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.autoAllocate', 'Auto-allocate monthly')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('aiCredits.enabled', 'Enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.rolloverUnused', 'Rollover unused credits')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('aiCredits.enabled', 'Enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.alertLowBalance', 'Alert on low balance')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('aiCredits.enabled', 'Enabled')}</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">{t('aiCredits.usageLimits', 'Usage Limits')}</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.dailyLimit', 'Daily limit per instructor')}</span>
                      <Badge variant="secondary">50 {t('aiCredits.credits', 'credits')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.monthlyLimit', 'Monthly limit per instructor')}</span>
                      <Badge variant="secondary">500 {t('aiCredits.credits', 'credits')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('aiCredits.minAllocation', 'Minimum allocation')}</span>
                      <Badge variant="secondary">10 {t('aiCredits.credits', 'credits')}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-4">{t('aiCredits.creditCosts', 'Credit Costs per Feature')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('aiCredits.contentAnalysis', 'Content Analysis')}</span>
                      <span className="text-sm font-medium">2 {t('aiCredits.credits', 'credits')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('aiCredits.quizGeneration', 'Quiz Generation')}</span>
                      <span className="text-sm font-medium">5 {t('aiCredits.credits', 'credits')}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('aiCredits.essayGrading', 'Essay Grading')}</span>
                      <span className="text-sm font-medium">3 {t('aiCredits.credits', 'credits')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('aiCredits.tutoring', 'AI Tutoring Session')}</span>
                      <span className="text-sm font-medium">1 {t('aiCredits.credits', 'credit')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                  {t('common.save', 'Save Settings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('aiCredits.allocateCredits', 'Allocate Credits')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t('aiCredits.allocatingTo', 'Allocating credits to')}: <strong>{editingUser?.name}</strong>
              </p>
              <Input
                type="number"
                placeholder={t('aiCredits.enterAmount', 'Enter credit amount')}
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAllocateCredits(editingUser?.id, parseInt(newCredits))}
                disabled={!newCredits || parseInt(newCredits) <= 0}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              >
                {t('aiCredits.allocate', 'Allocate')}
              </Button>
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Allocate Dialog */}
      <Dialog open={showAddCredits} onOpenChange={setShowAddCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('aiCredits.bulkAllocate', 'Bulk Allocate Credits')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {t('aiCredits.bulkAllocateDesc', 'Credits will be distributed equally among all instructors')}
              </p>
              <Input
                type="number"
                placeholder={t('aiCredits.totalCredits', 'Total credits to distribute')}
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
              />
              {creditsToAdd && (
                <p className="text-xs text-gray-500 mt-1">
                  {Math.floor(parseInt(creditsToAdd) / instructors.length)} {t('aiCredits.creditsPerInstructor', 'credits per instructor')}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkAllocate}
                disabled={!creditsToAdd || parseInt(creditsToAdd) <= 0}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              >
                {t('aiCredits.distribute', 'Distribute')}
              </Button>
              <Button variant="outline" onClick={() => setShowAddCredits(false)}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}