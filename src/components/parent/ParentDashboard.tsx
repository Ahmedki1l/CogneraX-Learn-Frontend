import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  CreditCard, 
  Bell, 
  Sparkles,
  Copy,
  Check,
  ChevronRight,
  TrendingUp,
  Clock,
  Award,
  Plus,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Child, ChildInvite, Subscription } from '../../interfaces/parent.types';

export function ParentDashboard() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  
  const [children, setChildren] = useState<Child[]>([]);
  const [pendingInvites, setPendingInvites] = useState<ChildInvite[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Invite child state
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [createdInviteLink, setCreatedInviteLink] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load children
      const childrenData = await api.parent.getChildren();
      setChildren(childrenData);
      
      // Load invites and subscription from user profile
      const invites = await api.parent.getChildInvites();
      setPendingInvites(invites.filter(i => i.status === 'pending'));
      
      const sub = await api.parent.getSubscription();
      setSubscription(sub);
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error(t('parentDashboard.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/register?token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    toast.success(t('parentDashboard.inviteCopied'));
    
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const handleInviteChild = async () => {
    try {
      setIsInviting(true);
      const response = await api.invitation.createInvitation({
        role: 'student',
        email: inviteEmail || undefined,
        message: inviteMessage,
        maxUses: 1
      });
      
      if (response && response.invitation) {
        setCreatedInviteLink(response.invitation.invitationUrl);
        toast.success(t('parentDashboard.inviteCreatedSuccess', 'Invitation created successfully'));
        loadDashboardData(); // Refresh list
      } else {
        toast.error(t('parentDashboard.inviteFailed', 'Failed to create invitation'));
      }
    } catch (error) {
      console.error('Failed to invite child:', error);
      toast.error(t('parentDashboard.inviteFailed', 'Failed to create invitation'));
    } finally {
      setIsInviting(false);
    }
  };

  const closeInviteDialog = () => {
    setIsInviteDialogOpen(false);
    setCreatedInviteLink(null);
    setInviteEmail('');
    setInviteMessage('');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('parentDashboard.title')}
          </h1>
          <p className="text-gray-600 mt-1">
            {t('parentDashboard.subtitle')}
          </p>
        </div>
        
        {/* Subscription Status */}
        {subscription && (
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6" />
                <div>
                  <p className="text-sm opacity-90">{t('parentDashboard.subscription')}</p>
                  <p className="font-semibold">
                    {subscription.childrenCount} {t('parentDashboard.children')} • {subscription.amount} {subscription.currency}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {subscription.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('parentDashboard.linkedChildren')}</p>
                <p className="text-2xl font-bold">{children.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('parentDashboard.totalCourses')}</p>
                <p className="text-2xl font-bold">
                  {children.reduce((acc, c) => acc + (c.enrolledCourses?.length || 0), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('parentDashboard.pendingInvites')}</p>
                <p className="text-2xl font-bold">{pendingInvites.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="children" className="space-y-4">
        <TabsList>
          <TabsTrigger value="children">
            <Users className="h-4 w-4 mr-2" />
            {t('parentDashboard.myChildren')}
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Bell className="h-4 w-4 mr-2" />
            {t('parentDashboard.invites')}
          </TabsTrigger>
        </TabsList>

        {/* Children Tab */}
        <TabsContent value="children" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t('parentDashboard.noChildren')}
                  </h3>
                  <p className="text-gray-600">
                    {t('parentDashboard.noChildrenDesc')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              children.map((child) => (
                <Card 
                  key={child._id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/parent/child/${child._id}`)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={child.avatar} alt={child.name} />
                        <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
                          {getInitials(child.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{child.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{child.email}</p>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">
                              {child.enrolledCourses?.length || 0} {t('parentDashboard.courses')}
                            </span>
                          </div>
                          
                          {child.learningStreak && child.learningStreak.current > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="h-4 w-4 text-orange-500" />
                              <span className="text-sm">
                                {child.learningStreak.current} {t('parentDashboard.dayStreak')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Invites Tab */}
        <TabsContent value="invites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('parentDashboard.pendingInvitesTitle')}</CardTitle>
              <CardDescription>
                {t('parentDashboard.pendingInvitesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Dialog open={isInviteDialogOpen} onOpenChange={(open) => {
                  if (!open) closeInviteDialog();
                  else setIsInviteDialogOpen(true);
                }}>
                  <DialogTrigger asChild>
                    <Button className="w-full md:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('parentDashboard.inviteChild', 'Invite Child')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>{t('parentDashboard.inviteChildTitle', 'Invite Your Child')}</DialogTitle>
                      <DialogDescription>
                        {createdInviteLink 
                          ? t('parentDashboard.inviteCreatedDesc', 'Copy the link below and send it to your child.')
                          : t('parentDashboard.inviteDesc', 'Create an invitation link for your child to join.')}
                      </DialogDescription>
                    </DialogHeader>
                    
                    {createdInviteLink ? (
                      <div className="space-y-4 pt-4">
                        <div className="p-4 bg-muted rounded-lg border">
                          <p className="text-sm font-medium mb-2">{t('parentDashboard.inviteLink', 'Invitation Link')}</p>
                          <div className="flex items-center gap-2">
                            <Input value={createdInviteLink} readOnly className="font-mono text-xs" />
                            <Button size="icon" variant="outline" onClick={() => copyInviteLink(createdInviteLink.split('token=')[1] || '')}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button className="w-full" onClick={closeInviteDialog}>
                          {t('common.done', 'Done')}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="child-email">{t('parentDashboard.childEmail', 'Child Email (Optional)')}</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              id="child-email" 
                              placeholder="child@example.com" 
                              className="pl-9"
                              value={inviteEmail}
                              onChange={(e) => setInviteEmail(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="invite-message">{t('parentDashboard.message', 'Message (Optional)')}</Label>
                          <div className="relative">
                            <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Textarea 
                              id="invite-message" 
                              placeholder="Hi! Join me on CogneraX Learn..." 
                              className="pl-9 min-h-[80px]"
                              value={inviteMessage}
                              onChange={(e) => setInviteMessage(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                            {t('common.cancel', 'Cancel')}
                          </Button>
                          <Button onClick={handleInviteChild} disabled={isInviting}>
                            {isInviting ? t('common.creating', 'Creating...') : t('parentDashboard.createInvite', 'Create Invitation')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </div>

              {pendingInvites.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">{t('parentDashboard.allInvitesAccepted')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingInvites.map((invite, idx) => (
                    <div 
                      key={invite.token} 
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-full">
                          <Users className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {t('parentDashboard.childInvite')} {idx + 1}
                          </p>
                          <p className="text-sm text-gray-500">
                            {t('parentDashboard.generatedAt')}: {new Date(invite.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyInviteLink(invite.token)}
                      >
                        {copiedToken === invite.token ? (
                          <>
                            <Check className="h-4 w-4 mr-2 text-green-500" />
                            {t('parentDashboard.copied')}
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" />
                            {t('parentDashboard.copyLink')}
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
