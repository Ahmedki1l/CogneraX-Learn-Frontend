import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar, 
  Clock, 
  Bell, 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Pin, 
  Star, 
  Archive, 
  Trash2, 
  Eye, 
  EyeOff, 
  Video, 
  Phone, 
  Mail, 
  Paperclip, 
  Image, 
  Smile, 
  CheckCircle, 
  Circle, 
  User, 
  Users2, 
  Target, 
  Zap,
  Edit,
  Copy,
  Download,
  Share,
  Settings,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { api } from '../../services/api';
import type { Announcement, Conversation, OfficeHour, Session } from '../../interfaces/communication.types';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

// ==================== Helper Components ====================

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString();
};

const AnnouncementCard = ({ announcement, user }: { announcement: Announcement, user: any }) => {
  const { t, isRTL } = useLanguage();
  
  return (
    <Card className={`${announcement.isPinned ? 'border-teal-200 bg-teal-50' : ''} hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 rtl:space-x-reverse mb-2">
              {announcement.isPinned && <Pin className="h-4 w-4 text-teal-600" />}
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority}
              </Badge>
            </div>
            <CardDescription>
              {t('communication.recipients')}: {Array.isArray(announcement.recipients) ? announcement.recipients.join(', ') : announcement.recipients} • {formatTime(announcement.createdAt)}
            </CardDescription>
          </div>
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align={isRTL ? "start" : "end"}>
                  <DropdownMenuItem>
                    <Edit className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Pin className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {announcement.isPinned ? t('communication.pinAnnouncement') : t('communication.pinAnnouncement')}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('communication.duplicate')}
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('common.delete')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{announcement.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2 rtl:space-x-reverse">
            {(announcement.tags || []).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <div className="flex items-center space-x-4 rtl:space-x-reverse text-sm text-gray-600">
              <div className="flex items-center space-x-1 rtl:space-x-reverse">
                <Eye className="h-4 w-4" />
                <span>{announcement.readCount}/{announcement.totalStudents} read</span>
              </div>
              <Button variant="ghost" size="sm" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                {t('aiCredits.analytics')}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ConversationList = ({ conversations, selectedConversation, onSelect }: { conversations: Conversation[], selectedConversation: Conversation | null, onSelect: (c: Conversation) => void }) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => {
        const participant = conversation.type === 'direct' 
          ? conversation.participants[0] 
          : null;
        
        return (
          <div
            key={conversation.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors ${
              selectedConversation?.id === conversation.id 
                ? 'bg-teal-50 border border-teal-200' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => onSelect(conversation)}
          >
            <div className="flex items-center space-x-3 rtl:space-x-reverse">
                {conversation.type === 'direct' ? (
                  <Avatar>
                    <AvatarImage src={participant?.avatar} />
                    <AvatarFallback>
                      {participant?.name 
                        ? participant.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                        : 'U'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                )}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {conversation.type === 'direct' 
                      ? participant?.name 
                      : conversation.name}
                  </h4>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage ? formatTime(conversation.lastMessage.createdAt).split(',')[1] : ''}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>

              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const MessageThread = ({ 
  conversation, 
  messages, 
  user,
  newMessage, 
  setNewMessage, 
  onSendMessage 
}: { 
  conversation: Conversation, 
  messages: any[], 
  user: any,
  newMessage: string,
  setNewMessage: (msg: string) => void,
  onSendMessage: () => void
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const { t, isRTL } = useLanguage();

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
  <div className="flex flex-col h-full">
    <div className="border-b p-4">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <Avatar>
          <AvatarImage src={conversation.type === 'direct' ? conversation.participants[0]?.avatar : undefined} />
          <AvatarFallback>
            {conversation.type === 'direct' 
              ? (conversation.participants[0]?.name 
                  ? conversation.participants[0].name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
                  : 'U')
              : 'GR'}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium">
            {conversation.type === 'direct' 
              ? conversation.participants[0]?.name 
              : conversation.name}
          </h3>
          <p className="text-sm text-gray-600">
            {conversation.type === 'direct' 
              ? '' // Hidden status
              : `${conversation.participants.length} ${t('communication.members')}`}
          </p>
        </div>
        <div className="ml-auto flex space-x-2 rtl:space-x-reverse">
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
    
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => {
          // Resolve sender ID (handle both string and populated object)
          const senderId = typeof message.senderId === 'object' 
            ? (message.senderId._id || message.senderId.id) 
            : message.senderId;
            
          const senderName = typeof message.senderId === 'object' ? message.senderId.name : 'Unknown';
          const currentUserId = user?.id || user?._id;
          const isMe = senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
            {!isMe && (
              <span className={`text-xs text-gray-500 mb-1 ${isRTL ? 'mr-1' : 'ml-1'}`}>{senderName}</span>
            )}
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                isMe
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p>{message.content}</p>
              <p className={`text-xs mt-1 ${
                isMe ? 'text-teal-200' : 'text-gray-500'
              }`}>
                {formatTime(message.createdAt).split(',')[1]}
              </p>
            </div>
          </div>
          );
        })}
      </div>
      <div ref={scrollRef} />
    </ScrollArea>
    
    <div className="border-t p-4">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Button variant="ghost" size="sm">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Image className="h-4 w-4" />
        </Button>
        <Input
          placeholder={t('communication.typeMessage')}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-1"
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              onSendMessage();
            }
          }}
        />
        <Button size="sm" className="gap-2" onClick={onSendMessage}>
          {isRTL ? <Send className="h-4 w-4 ml-2" /> : <Send className="h-4 w-4 mr-2" />}
          {t('communication.send')}
        </Button>
      </div>
    </div>
  </div>
);
};

// ==================== Main Component ====================

interface CommunicationHubProps {
  user: any;
}

export function CommunicationHub({ user }: CommunicationHubProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('announcements');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewAnnouncementDialog, setShowNewAnnouncementDialog] = useState(false);
  const [showNewConversationDialog, setShowNewConversationDialog] = useState(false);
  const [showScheduleSessionDialog, setShowScheduleSessionDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  // Data state
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [officeHours, setOfficeHours] = useState<OfficeHour[]>([]);
  const [scheduledSessions, setScheduledSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<any[]>([]); // Current conversation messages
  const [contacts, setContacts] = useState<any[]>([]);

  // Fetch initial data
  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch announcements
      const announcementsRes = await api.communication.getAnnouncements();
      setAnnouncements(announcementsRes?.data?.announcements || announcementsRes || []);

      // Fetch conversations
      const conversationsRes = await api.communication.getConversations();
      setConversations(conversationsRes?.data?.conversations || conversationsRes || []);

      // Fetch office hours
      const officeHoursRes = await api.communication.getOfficeHours();
      setOfficeHours(officeHoursRes?.data?.officeHours || officeHoursRes || []);

      // Fetch sessions
      const sessionsRes = await api.communication.getSessions();
      setScheduledSessions(sessionsRes?.data?.sessions || sessionsRes || []);

      // Fetch contacts for messaging
      const contactsRes = await api.communication.getContacts();
      setContacts(contactsRes?.data?.contacts || contactsRes || []);


    } catch (error) {
      console.error('Error fetching communication data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial data
  React.useEffect(() => {
    loadData();
  }, []);

  // Fetch messages when conversation selected
  React.useEffect(() => {
    if (selectedConversation?.id) {
      const fetchMessages = async () => {
        try {
          const res = await api.communication.getMessages(selectedConversation.id);
          setMessages(res?.data?.messages || res || []);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      };
      fetchMessages();
    }
  }, [selectedConversation?.id]);

  // Polling for real-time messages
  React.useEffect(() => {
    if (!selectedConversation?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.communication.getMessages(selectedConversation.id);
        setMessages(prev => {
          // Only update if there are changes (simple length check or deep compare)
          // For now, doing a simple replacement but we could optimize
          const newMessages = res?.data?.messages || res || [];
          if (newMessages.length !== prev.length) return newMessages;
          // Check last message ID
          if (newMessages.length > 0 && prev.length > 0 && newMessages[newMessages.length - 1].id !== prev[prev.length - 1].id) return newMessages;
          return prev;
        });
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [selectedConversation?.id]);

  const handleCreateAnnouncement = async (data: any) => {
    try {
      await api.communication.createAnnouncement(data);
      setShowNewAnnouncementDialog(false);
      // Refresh list
      const res = await api.communication.getAnnouncements();
      setAnnouncements(res?.data?.announcements || res || []);
    } catch (error) {
      console.error('Error creating announcement:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    try {
      await api.communication.sendMessage(selectedConversation.id, { content: newMessage });
      setNewMessage('');
      // Refresh messages
      const res = await api.communication.getMessages(selectedConversation.id);
      setMessages(res?.data?.messages || res || []);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Data loading handled in useEffect



  const NewAnnouncementDialog = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('medium');
    const [recipients, setRecipients] = useState('all');

    const handleSubmit = () => {
      handleCreateAnnouncement({
        title,
        content,
        priority,
        recipients
      });
    };

    return (
    <Dialog open={showNewAnnouncementDialog} onOpenChange={setShowNewAnnouncementDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('communication.createAnnouncement')}</DialogTitle>
          <DialogDescription>
            {t('communication.createAnnouncementDesc')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>{t('communication.announcementTitle')}</Label>
            <Input 
              placeholder={t('communication.announcementTitlePlaceholder')}
              className="mt-1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>{t('communication.recipients')}</Label>
              <Select value={recipients} onValueChange={setRecipients}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('communication.selectRecipients')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('communication.filter.all')}</SelectItem>
                  <SelectItem value="math">Mathematics Class</SelectItem>
                  <SelectItem value="physics">Physics Class</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>{t('communication.priority')}</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={t('communication.selectPriority')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label>{t('communication.content')}</Label>
            <Textarea 
              placeholder={t('communication.contentPlaceholder')}
              className="mt-1 h-32"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
          
          <div>
            <Label>{t('communication.tags')}</Label>
            <Input placeholder={t('communication.tagsPlaceholder')} className="mt-1" />
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="pin" />
            <Label htmlFor="pin">{t('communication.pinAnnouncement')}</Label>
          </div>
          
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <Checkbox id="email" />
            <Label htmlFor="email">{t('communication.sendEmail')}</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 rtl:space-x-reverse mt-6">
          <Button variant="outline" onClick={() => setShowNewAnnouncementDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleSubmit}>
            <Send className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
            {t('communication.sendBtn')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
  };

  const NewConversationDialog = () => {
    const [selectedRole, setSelectedRole] = useState<'instructor' | 'student'>('instructor');
    const [selectedContactId, setSelectedContactId] = useState('');
    const [message, setMessage] = useState('');

    const filteredContacts = contacts.filter(c => c.role === selectedRole);

    const handleSubmit = async () => {
      try {
        if (!selectedContactId) return;

        // 1. Create conversation
        const conversationResponse = await api.communication.createConversation({
          recipients: [selectedContactId],
          type: 'direct'
        });
        
        // 2. Send initial message if provided
        if (message) {
          const conversationId = conversationResponse?.data?.id || conversationResponse?.id;
          if (conversationId) {
            await api.communication.sendMessage(conversationId, {
              content: message,
              type: 'text'
            });
          }
        }

        // 3. Refresh
        loadData();
        setShowNewConversationDialog(false);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };

    return (
      <Dialog open={showNewConversationDialog} onOpenChange={setShowNewConversationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('communication.newMessage')}</DialogTitle>
            <DialogDescription>{t('communication.startConversation')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t('communication.messageTo')}</Label>
              <Select value={selectedRole} onValueChange={(v: 'instructor' | 'student') => {
                setSelectedRole(v);
                setSelectedContactId(''); // Reset selection
              }}>
                <SelectTrigger>
                  <SelectValue placeholder={t('communication.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('communication.selectRecipient')}</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder={`${t('communication.selectRecipient')}...`} />
                </SelectTrigger>
                <SelectContent>
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map((contact) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.name || contact.email || contact.id}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-gray-500 text-center">No {selectedRole}s found</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('communication.messageLabel')}</Label>
              <Textarea 
                placeholder={t('communication.typeMessage')}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <div className="flex justify-end space-x-2 rtl:space-x-reverse">
              <Button variant="outline" onClick={() => setShowNewConversationDialog(false)}>{t('common.cancel')}</Button>
              <Button onClick={handleSubmit} disabled={!selectedContactId}>{t('communication.send')}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <NewAnnouncementDialog />
      <NewConversationDialog />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            {t('communication.title')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('communication.subtitle')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {(user?.role === 'instructor' || user?.role === 'admin') && (
            <>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {t('communication.scheduleSession')}
              </Button>
              <Button className="gap-2" onClick={() => setShowNewAnnouncementDialog(true)}>
                <Plus className="h-4 w-4" />
                {t('communication.newAnnouncement')}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} isRTL={isRTL} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="announcements">{t('communication.announcements')}</TabsTrigger>
            <TabsTrigger value="messages">{t('communication.messages')}</TabsTrigger>
            {/* <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
            <TabsTrigger value="sessions">Scheduled Sessions</TabsTrigger> */}
          </TabsList>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="relative">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={t('communication.searchAnnouncements')}
                  className={`${isRTL ? 'pr-10' : 'pl-10'} w-64`}
                />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder={t('communication.filter')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('communication.filter.all')}</SelectItem>
                  <SelectItem value="pinned">{t('communication.filter.pinned')}</SelectItem>
                  <SelectItem value="high">{t('communication.filter.high')}</SelectItem>
                  <SelectItem value="unread">{t('communication.filter.unread')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
              <span>{t('communication.quickStats')}</span>
              <Badge variant="outline">3 {t('communication.announcements').toLowerCase()}</Badge>
              <Badge variant="outline">89% read rate</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} user={user} />
            ))}
          </div>
        </TabsContent>

        {/* Direct Messages */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{t('communication.conversations')}</span>
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <Badge variant="outline">
                      {conversations.filter(c => c.unreadCount > 0).length} {t('communication.unread')}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => setShowNewConversationDialog(true)}>
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[200px]">
                  <ConversationList 
                    conversations={conversations} 
                    selectedConversation={selectedConversation} 
                    onSelect={setSelectedConversation} 
                  />
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardContent className="p-0 h-[500px]">
                {selectedConversation ? (
                  <MessageThread 
                    conversation={selectedConversation}
                    messages={messages}
                    user={user}
                    newMessage={newMessage}
                    setNewMessage={setNewMessage}
                    onSendMessage={handleSendMessage}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>{t('communication.selectToStart')}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Office Hours */}
        <TabsContent value="office-hours" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {officeHours.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{session.title}</CardTitle>
                    <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                  <CardDescription>{new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Next session: {new Date(session.startTime).toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Location: {session.location}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Booking Status</span>
                        <span className="text-sm font-medium">
                          {session.bookedSlots}/{session.maxSlots || 0} slots
                        </span>
                      </div>
                      <Progress 
                        value={(session.bookedSlots / (session.maxSlots || 1)) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex space-x-2 rtl:space-x-reverse">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button size="sm" className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Bookings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Office Hours Management</CardTitle>
              <CardDescription>
                Configure your availability and manage student appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Office Hours
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  View Calendar
                </Button>
                <Button variant="outline" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Sessions */}
        <TabsContent value="sessions" className="space-y-6">
          <div className="space-y-4">
            {scheduledSessions.map((session) => (
              <Card key={session.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 rtl:space-x-reverse mb-2">
                        <div className="p-2 bg-teal-100 rounded-lg">
                          {session.type === 'individual' ? (
                            <User className="h-5 w-5 text-teal-600" />
                          ) : (
                            <Users2 className="h-5 w-5 text-teal-600" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{session.title}</h3>
                          <p className="text-sm text-gray-600">{session.topic}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(session.startTime)}</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-2 rtl:space-x-reverse text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-sm text-gray-600 block mb-2">Participants:</span>
                        <div className="flex space-x-2 rtl:space-x-reverse">
                          {session.type === 'individual' && session.participants[0] ? (
                            <div className="flex items-center space-x-2 rtl:space-x-reverse">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {session.participants[0].avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{session.participants[0].name}</span>
                            </div>
                          ) : (
                            session.participants.map((student, index) => (
                              <div key={index} className="flex items-center space-x-2 rtl:space-x-reverse">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs">
                                    {student.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{student.name}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant={session.status === 'confirmed' ? 'default' : 'secondary'}>
                        {session.status}
                      </Badge>
                      
                      <div className="flex space-x-2 rtl:space-x-reverse">
                        <Button size="sm" variant="outline" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button size="sm" className="gap-2">
                          <Video className="h-4 w-4" />
                          Start Session
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Session Management</CardTitle>
              <CardDescription>
                Schedule and manage one-on-one and group sessions with students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="gap-2">
                  <Calendar className="h-4 w-4" />
                  View All Sessions
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <NewAnnouncementDialog />
    </div>
  );
}