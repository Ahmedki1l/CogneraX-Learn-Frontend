import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  CheckCircle, 
  Trash2,
  MessageSquare,
  BookOpen,
  FileText,
  Calendar,
  Award,
  Users,
  AlertCircle,
  GraduationCap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

// Extended notification interface to support all backend types
interface Notification {
  id: string;
  _id?: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'message' | 'announcement' | 
        'assignment_scheduled' | 'assignment_due' | 'exam_scheduled' | 'exam_reminder' | 
        'grade_posted' | 'child_activity' | 'enrollment' | 'assignment' | 'quiz' | 
        'forum' | 'system' | 'course_update';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  fromUser?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  metadata?: {
    conversationId?: string;
    announcementId?: string;
    assignmentId?: string;
    examId?: string;
    childId?: string;
    grade?: string;
    scheduledDate?: string;
    dueDate?: string;
    [key: string]: any;
  };
}

interface NotificationsResponse {
  success?: boolean;
  data?: Notification[];
  meta?: {
    unreadCount: number;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export function NotificationBell() {
  const { t, isRTL } = useLanguage();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      const response = await api.notification.getNotifications({
        page: 1,
        limit: 20
      }) as NotificationsResponse | Notification[];
      
      // Handle both response formats
      if (response) {
        if (Array.isArray(response)) {
          // Direct array response
          const normalized = response.map(n => ({
            ...n,
            id: n.id || n._id || String(Math.random())
          }));
          setNotifications(normalized);
          setUnreadCount(normalized.filter(n => !n.read).length);
        } else if ((response as NotificationsResponse).data) {
          // Paginated response with data array
          const data = (response as NotificationsResponse).data || [];
          const normalized = data.map(n => ({
            ...n,
            id: n.id || n._id || String(Math.random())
          }));
          setNotifications(normalized);
          setUnreadCount((response as NotificationsResponse).meta?.unreadCount || normalized.filter(n => !n.read).length);
        } else {
          // Fallback - empty state
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Keep existing notifications on error
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await api.notification.markAsRead(id);
      
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error(t('notifications.errorMarkingRead'));
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await api.notification.markAllAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success(t('notifications.allMarkedRead'));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error(t('notifications.errorMarkingAllRead'));
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.notification.deleteNotification(id);
      
      const notification = notifications.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success(t('notifications.deleted'));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error(t('notifications.errorDeleting'));
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }
    
    // Close popover
    setOpen(false);
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'message':
        if (notification.metadata?.conversationId) {
          navigate(`/communication?conversation=${notification.metadata.conversationId}`);
        } else {
          navigate('/communication');
        }
        break;
        
      case 'announcement':
        if (notification.metadata?.announcementId) {
          navigate(`/communication?announcement=${notification.metadata.announcementId}`);
        } else {
          navigate('/communication');
        }
        break;
        
      case 'assignment_scheduled':
      case 'assignment_due':
      case 'assignment':
        if (notification.metadata?.assignmentId) {
          navigate(`/my-assignments?assignment=${notification.metadata.assignmentId}`);
        } else {
          navigate('/my-assignments');
        }
        break;
        
      case 'exam_scheduled':
      case 'exam_reminder':
        navigate('/exam-schedule');
        break;
        
      case 'grade_posted':
        if (notification.metadata?.examId) {
          navigate('/exam-grades');
        } else if (notification.metadata?.assignmentId) {
          navigate('/my-assignments');
        } else {
          navigate('/student-analytics');
        }
        break;
        
      case 'child_activity':
        if (notification.metadata?.childId) {
          navigate(`/parent/child/${notification.metadata.childId}`);
        } else {
          navigate('/parent/dashboard');
        }
        break;
        
      case 'enrollment':
      case 'course_update':
        navigate('/my-courses');
        break;
        
      case 'quiz':
        navigate('/my-courses');
        break;
        
      case 'forum':
        navigate('/communication');
        break;
        
      default:
        // For info/success/warning/error or unknown types
        break;
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'announcement':
        return <AlertCircle className="h-4 w-4 text-purple-500" />;
      case 'assignment_scheduled':
      case 'assignment_due':
      case 'assignment':
        return <FileText className="h-4 w-4 text-orange-500" />;
      case 'exam_scheduled':
      case 'exam_reminder':
        return <Calendar className="h-4 w-4 text-red-500" />;
      case 'grade_posted':
        return <Award className="h-4 w-4 text-green-500" />;
      case 'child_activity':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'enrollment':
      case 'course_update':
        return <BookOpen className="h-4 w-4 text-blue-500" />;
      case 'quiz':
        return <GraduationCap className="h-4 w-4 text-indigo-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeLabel = (type: Notification['type']) => {
    const labels: Record<string, string> = {
      message: t('notifications.types.message'),
      announcement: t('notifications.types.announcement'),
      assignment_scheduled: t('notifications.types.assignment'),
      assignment_due: t('notifications.types.assignmentDue'),
      assignment: t('notifications.types.assignment'),
      exam_scheduled: t('notifications.types.exam'),
      exam_reminder: t('notifications.types.examReminder'),
      grade_posted: t('notifications.types.grade'),
      child_activity: t('notifications.types.childActivity'),
      enrollment: t('notifications.types.enrollment'),
      course_update: t('notifications.types.courseUpdate'),
      quiz: t('notifications.types.quiz'),
      forum: t('notifications.types.forum'),
      success: t('notifications.types.success'),
      warning: t('notifications.types.warning'),
      error: t('notifications.types.error'),
      info: t('notifications.types.info'),
      system: t('notifications.types.system'),
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
      case 'grade_posted':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
      case 'assignment_due':
      case 'exam_reminder':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'message':
      case 'announcement':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'exam_scheduled':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'child_activity':
        return 'text-indigo-600 bg-indigo-50 border-indigo-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return t('notifications.justNow');
    if (minutes < 60) return `${minutes}${t('notifications.minutesAgo')}`;
    if (hours < 24) return `${hours}${t('notifications.hoursAgo')}`;
    if (days < 7) return `${days}${t('notifications.daysAgo')}`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative p-2.5 rounded-xl text-gray-400 hover:text-zinc-900 hover:bg-zinc-50"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b py-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                {t('notifications.title')}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs"
                >
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {t('notifications.markAllRead')}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                  <Bell className="h-12 w-12 mb-2 opacity-20" />
                  <p className="text-sm">{t('notifications.noNotifications')}</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${getTypeColor(notification.type)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                            )}
                            <h4 className="text-sm font-medium truncate">
                              {notification.title}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{formatTime(notification.createdAt)}</span>
                            <span>•</span>
                            <Badge
                              variant="outline"
                              className={`text-xs py-0 ${getTypeColor(notification.type)}`}
                            >
                              {getTypeLabel(notification.type)}
                            </Badge>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-1 flex-shrink-0">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsRead(notification.id);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:text-red-700"
                            onClick={(e) => deleteNotification(notification.id, e)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
