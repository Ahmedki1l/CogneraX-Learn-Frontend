import React, { useState } from 'react';
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
  Settings
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

interface AICreditsManagementProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AICreditsManagement({ isOpen, onClose }: AICreditsManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newCredits, setNewCredits] = useState('');
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [creditsToAdd, setCreditsToAdd] = useState('');

  // Mock organization credits data
  const [orgCredits, setOrgCredits] = useState({
    total: 5000,
    used: 1250,
    remaining: 3750,
    monthlyUsage: 850,
    lastPurchased: '2024-03-01',
    nextRenewal: '2024-04-01'
  });

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
      studentsCount: 105
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
      studentsCount: 78
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
      studentsCount: 32
    }
  ]);

  // Mock usage history
  const usageHistory = [
    { date: '2024-03-20', user: 'Dr. Sarah Johnson', action: 'Quiz Generation', credits: 15, type: 'usage' },
    { date: '2024-03-20', user: 'Admin', action: 'Credits Allocated to Prof. Chen', credits: 50, type: 'allocation' },
    { date: '2024-03-19', user: 'Prof. Michael Chen', action: 'Content Analysis', credits: 8, type: 'usage' },
    { date: '2024-03-19', user: 'Dr. Emily Rodriguez', action: 'AI Content Recreation', credits: 12, type: 'usage' },
    { date: '2024-03-18', user: 'Admin', action: 'Credits Purchase', credits: 1000, type: 'purchase' }
  ];

  if (!isOpen) return null;

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || instructor.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const totalAllocated = instructors.reduce((sum, instructor) => sum + instructor.credits.allocated, 0);
  const totalUsed = instructors.reduce((sum, instructor) => sum + instructor.credits.used, 0);
  const totalRemaining = instructors.reduce((sum, instructor) => sum + instructor.credits.remaining, 0);

  const handleUpdateCredits = async (instructorId: number, newCreditAmount: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setInstructors(prev => prev.map(instructor => {
        if (instructor.id === instructorId) {
          const creditDiff = newCreditAmount - instructor.credits.allocated;
          return {
            ...instructor,
            credits: {
              ...instructor.credits,
              allocated: newCreditAmount,
              remaining: instructor.credits.remaining + creditDiff
            }
          };
        }
        return instructor;
      }));
      
      setOrgCredits(prev => ({
        ...prev,
        used: prev.used + (newCreditAmount - (editingUser?.credits.allocated || 0))
      }));
      
      toast.success(`Credits updated for ${editingUser?.name}`);
      setEditingUser(null);
      setNewCredits('');
    } catch (error) {
      toast.error('Failed to update credits');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchaseCredits = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const creditsAmount = parseInt(creditsToAdd);
      setOrgCredits(prev => ({
        ...prev,
        total: prev.total + creditsAmount,
        remaining: prev.remaining + creditsAmount
      }));
      
      toast.success(`${creditsAmount} credits added to organization`);
      setShowAddCredits(false);
      setCreditsToAdd('');
    } catch (error) {
      toast.error('Failed to purchase credits');
    } finally {
      setIsLoading(false);
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-orange-600';
    return 'text-green-600';
  };

  const getUsageBadgeColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-100 text-red-800';
    if (percentage >= 70) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Zap className="h-6 w-6 mr-2 text-teal-600" />
              AI Credits Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage organization AI credits and instructor allocations
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="instructors">Instructors</TabsTrigger>
              <TabsTrigger value="history">Usage History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Organization Credits Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Credits</p>
                        <p className="text-2xl font-bold text-gray-900">{orgCredits.total.toLocaleString()}</p>
                      </div>
                      <Wallet className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Used Credits</p>
                        <p className="text-2xl font-bold text-gray-900">{orgCredits.used.toLocaleString()}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Remaining</p>
                        <p className="text-2xl font-bold text-gray-900">{orgCredits.remaining.toLocaleString()}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Monthly Usage</p>
                        <p className="text-2xl font-bold text-gray-900">{orgCredits.monthlyUsage.toLocaleString()}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Credit Usage Progress */}
              <Card>
                <CardHeader>
                  <CardTitle>Organization Credit Usage</CardTitle>
                  <CardDescription>
                    Current usage: {((orgCredits.used / orgCredits.total) * 100).toFixed(1)}% of total credits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress value={(orgCredits.used / orgCredits.total) * 100} className="h-4 mb-4" />
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-900">Used</p>
                      <p className="text-gray-600">{orgCredits.used.toLocaleString()} credits</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Remaining</p>
                      <p className="text-gray-600">{orgCredits.remaining.toLocaleString()} credits</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Next Renewal</p>
                      <p className="text-gray-600">{new Date(orgCredits.nextRenewal).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Purchase Credits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-teal-600" />
                    Purchase More Credits
                  </CardTitle>
                  <CardDescription>
                    Add credits to your organization's balance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setShowAddCredits(true)}
                    className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Purchase Credits
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Instructors Tab */}
            <TabsContent value="instructors" className="space-y-6">
              {/* Instructor Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Users className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{instructors.length}</div>
                    <div className="text-sm text-gray-600">Total Instructors</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <Zap className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{totalAllocated.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Allocated</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-900">{totalUsed.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Used</div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Instructors List */}
              <div className="space-y-4">
                {filteredInstructors.map((instructor) => {
                  const usagePercentage = (instructor.credits.used / instructor.credits.allocated) * 100;
                  
                  return (
                    <Card key={instructor.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={instructor.avatar} />
                              <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white">
                                {instructor.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div>
                              <h3 className="font-semibold text-gray-900">{instructor.name}</h3>
                              <p className="text-sm text-gray-600">{instructor.email}</p>
                              <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                <span>{instructor.coursesCount} courses</span>
                                <span>{instructor.studentsCount} students</span>
                                <span>Active {instructor.lastActive}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            <div className="text-right">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">Credits Usage</span>
                                <Badge className={getUsageBadgeColor(usagePercentage)}>
                                  {usagePercentage.toFixed(0)}%
                                </Badge>
                              </div>
                              <div className="text-xs text-gray-600 mb-2">
                                {instructor.credits.used}/{instructor.credits.allocated} used
                              </div>
                              <Progress value={usagePercentage} className="w-32 h-2" />
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {instructor.credits.remaining} remaining
                              </div>
                              <div className="text-xs text-gray-600">
                                {instructor.usage.thisMonth} used this month
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingUser(instructor);
                                setNewCredits(instructor.credits.allocated.toString());
                              }}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit Credits
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-purple-600" />
                    Usage History
                  </CardTitle>
                  <CardDescription>
                    Recent AI credit activities and transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {usageHistory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-full ${
                            entry.type === 'usage' ? 'bg-red-100' :
                            entry.type === 'allocation' ? 'bg-blue-100' : 'bg-green-100'
                          }`}>
                            {entry.type === 'usage' ? <Minus className="h-4 w-4 text-red-600" /> :
                             entry.type === 'allocation' ? <Users className="h-4 w-4 text-blue-600" /> :
                             <Plus className="h-4 w-4 text-green-600" />}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{entry.action}</p>
                            <p className="text-sm text-gray-600">{entry.user} • {entry.date}</p>
                          </div>
                        </div>
                        <div className={`text-right ${
                          entry.type === 'usage' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          <div className="font-medium">
                            {entry.type === 'usage' ? '-' : '+'}{entry.credits} credits
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
      </div>

      {/* Edit Credits Dialog */}
      <Dialog open={editingUser !== null} onOpenChange={() => setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Credits for {editingUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allocated Credits
              </label>
              <Input
                type="number"
                value={newCredits}
                onChange={(e) => setNewCredits(e.target.value)}
                placeholder="Enter credit amount"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {editingUser?.credits.allocated} credits
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingUser(null)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleUpdateCredits(editingUser?.id, parseInt(newCredits))}
                disabled={!newCredits || isLoading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Credits
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Credits Dialog */}
      <Dialog open={showAddCredits} onOpenChange={setShowAddCredits}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Purchase AI Credits</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credits to Purchase
              </label>
              <Input
                type="number"
                value={creditsToAdd}
                onChange={(e) => setCreditsToAdd(e.target.value)}
                placeholder="Enter number of credits"
              />
              <p className="text-xs text-gray-500 mt-1">
                $0.02 per credit • Minimum 100 credits
              </p>
            </div>
            
            {creditsToAdd && parseInt(creditsToAdd) >= 100 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm">
                  <span className="font-medium">Total Cost:</span> ${(parseInt(creditsToAdd) * 0.02).toFixed(2)}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowAddCredits(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePurchaseCredits}
                disabled={!creditsToAdd || parseInt(creditsToAdd) < 100 || isLoading}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Purchase Credits
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}