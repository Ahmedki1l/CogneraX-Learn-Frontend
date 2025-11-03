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
  BarChart3
} from 'lucide-react';
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
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';

interface CommunicationHubProps {
  user: any;
}

export function CommunicationHub({ user }: CommunicationHubProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('announcements');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewAnnouncementDialog, setShowNewAnnouncementDialog] = useState(false);
  const [showScheduleSessionDialog, setShowScheduleSessionDialog] = useState(false);

  // Mock data for announcements
  const announcements = [
    {
      id: 1,
      title: 'Important: Quiz 3 Postponed',
      content: 'Due to the unexpected circumstances, Quiz 3 has been postponed to next Friday. Please use this extra time to review chapters 8-10.',
      recipients: 'All Students',
      priority: 'high',
      readCount: 34,
      totalStudents: 45,
      createdAt: '2024-02-10T10:30:00Z',
      isPinned: true,
      tags: ['quiz', 'important']
    },
    {
      id: 2,
      title: 'Office Hours Update',
      content: 'My office hours for this week have been extended. I will be available Monday through Wednesday from 2-5 PM for any questions about the upcoming project.',
      recipients: 'Mathematics Class',
      priority: 'medium',
      readCount: 28,
      totalStudents: 45,
      createdAt: '2024-02-09T14:15:00Z',
      isPinned: false,
      tags: ['office-hours', 'project']
    },
    {
      id: 3,
      title: 'Guest Lecture: Dr. Sarah Wilson',
      content: 'We have a special guest lecture next Tuesday by Dr. Sarah Wilson from MIT. She will be discussing real-world applications of calculus in engineering.',
      recipients: 'Advanced Mathematics',
      priority: 'low',
      readCount: 42,
      totalStudents: 45,
      createdAt: '2024-02-08T09:00:00Z',
      isPinned: false,
      tags: ['guest-lecture', 'calculus']
    }
  ];

  // Mock data for conversations
  const conversations = [
    {
      id: 1,
      type: 'direct',
      participants: [
        { id: 1, name: 'Sarah Johnson', avatar: 'SJ', lastSeen: '2 min ago', online: true }
      ],
      lastMessage: {
        content: 'Thank you for the feedback on my assignment. Could you clarify the third question?',
        timestamp: '2024-02-10T15:30:00Z',
        senderId: 1
      },
      unreadCount: 2
    },
    {
      id: 2,
      type: 'direct',
      participants: [
        { id: 2, name: 'Mike Chen', avatar: 'MC', lastSeen: '1 hour ago', online: false }
      ],
      lastMessage: {
        content: 'I submitted the project report. Please let me know if you need any clarifications.',
        timestamp: '2024-02-10T14:45:00Z',
        senderId: 2
      },
      unreadCount: 0
    },
    {
      id: 3,
      type: 'group',
      name: 'Study Group Alpha',
      participants: [
        { id: 3, name: 'Emily Rodriguez', avatar: 'ER' },
        { id: 4, name: 'James Wilson', avatar: 'JW' },
        { id: 5, name: 'Lisa Park', avatar: 'LP' }
      ],
      lastMessage: {
        content: 'Great session today! Same time next week?',
        timestamp: '2024-02-10T13:20:00Z',
        senderId: 3
      },
      unreadCount: 1
    }
  ];

  // Mock data for office hours
  const officeHours = [
    {
      id: 1,
      title: 'Regular Office Hours',
      time: 'Monday, Wednesday, Friday 2:00-4:00 PM',
      location: 'Room 304 or Zoom',
      type: 'recurring',
      status: 'active',
      nextSession: '2024-02-12T14:00:00Z',
      bookedSlots: 3,
      totalSlots: 6
    },
    {
      id: 2,
      title: 'Exam Prep Session',
      time: 'Thursday 6:00-8:00 PM',
      location: 'Online Only',
      type: 'special',
      status: 'upcoming',
      nextSession: '2024-02-15T18:00:00Z',
      bookedSlots: 8,
      totalSlots: 20
    }
  ];

  // Mock data for scheduled sessions
  const scheduledSessions = [
    {
      id: 1,
      title: 'One-on-one: Sarah Johnson',
      type: 'individual',
      time: '2024-02-12T15:30:00Z',
      duration: 30,
      location: 'Zoom',
      status: 'confirmed',
      student: { name: 'Sarah Johnson', avatar: 'SJ' },
      topic: 'Calculus Assignment Questions'
    },
    {
      id: 2,
      title: 'Group Session: Project Discussion',
      type: 'group',
      time: '2024-02-13T16:00:00Z',
      duration: 60,
      location: 'Room 304',
      status: 'pending',
      students: [
        { name: 'Mike Chen', avatar: 'MC' },
        { name: 'Emily Rodriguez', avatar: 'ER' },
        { name: 'James Wilson', avatar: 'JW' }
      ],
      topic: 'Final Project Guidelines'
    }
  ];

  const messages = [
    {
      id: 1,
      content: 'Hi Professor, I had a question about the assignment we discussed in class.',
      senderId: 1,
      timestamp: '2024-02-10T15:20:00Z',
      type: 'text'
    },
    {
      id: 2,
      content: 'Of course! What specific part would you like to discuss?',
      senderId: 'instructor',
      timestamp: '2024-02-10T15:22:00Z',
      type: 'text'
    },
    {
      id: 3,
      content: 'Thank you for the feedback on my assignment. Could you clarify the third question?',
      senderId: 1,
      timestamp: '2024-02-10T15:30:00Z',
      type: 'text'
    }
  ];

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

  const AnnouncementCard = ({ announcement }) => (
    <Card className={`${announcement.isPinned ? 'border-teal-200 bg-teal-50' : ''} hover:shadow-md transition-shadow`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {announcement.isPinned && <Pin className="h-4 w-4 text-teal-600" />}
              <CardTitle className="text-lg">{announcement.title}</CardTitle>
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority}
              </Badge>
            </div>
            <CardDescription>
              To: {announcement.recipients} • {formatTime(announcement.createdAt)}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Pin className="h-4 w-4 mr-2" />
                {announcement.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4">{announcement.content}</p>
        
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {announcement.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{announcement.readCount}/{announcement.totalStudents} read</span>
            </div>
            <Button variant="ghost" size="sm" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ConversationList = () => (
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
            onClick={() => setSelectedConversation(conversation)}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                {conversation.type === 'direct' ? (
                  <Avatar>
                    <AvatarFallback>{participant.avatar}</AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-teal-600 flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                )}
                {conversation.type === 'direct' && participant.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium truncate">
                    {conversation.type === 'direct' 
                      ? participant.name 
                      : conversation.name}
                  </h4>
                  <div className="flex items-center space-x-2">
                    {conversation.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {conversation.unreadCount}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTime(conversation.lastMessage.timestamp).split(',')[1]}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {conversation.lastMessage.content}
                </p>
                {conversation.type === 'direct' && (
                  <p className="text-xs text-gray-500">
                    Last seen: {participant.lastSeen}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const MessageThread = ({ conversation }) => (
    <div className="flex flex-col h-full">
      <div className="border-b p-4">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {conversation.type === 'direct' 
                ? conversation.participants[0].avatar 
                : 'GR'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">
              {conversation.type === 'direct' 
                ? conversation.participants[0].name 
                : conversation.name}
            </h3>
            <p className="text-sm text-gray-600">
              {conversation.type === 'direct' 
                ? conversation.participants[0].online ? 'Online' : 'Offline'
                : `${conversation.participants.length} members`}
            </p>
          </div>
          <div className="ml-auto flex space-x-2">
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'instructor' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.senderId === 'instructor'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === 'instructor' ? 'text-teal-200' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp).split(',')[1]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Image className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                // Handle send message
                setNewMessage('');
              }
            }}
          />
          <Button size="sm" className="gap-2">
            <Send className="h-4 w-4" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );

  const NewAnnouncementDialog = () => (
    <Dialog open={showNewAnnouncementDialog} onOpenChange={setShowNewAnnouncementDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Announcement</DialogTitle>
          <DialogDescription>
            Send targeted messages to your students with priority levels and tags
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Title</Label>
            <Input placeholder="Enter announcement title..." className="mt-1" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Recipients</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select recipients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="math">Mathematics Class</SelectItem>
                  <SelectItem value="physics">Physics Class</SelectItem>
                  <SelectItem value="custom">Custom Selection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Priority</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
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
            <Label>Content</Label>
            <Textarea 
              placeholder="Write your announcement..." 
              className="mt-1 h-32"
            />
          </div>
          
          <div>
            <Label>Tags (optional)</Label>
            <Input placeholder="e.g., important, exam, project" className="mt-1" />
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="pin" />
            <Label htmlFor="pin">Pin this announcement</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="email" />
            <Label htmlFor="email">Also send via email</Label>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => setShowNewAnnouncementDialog(false)}>
            Cancel
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            Communication Hub
          </h1>
          <p className="text-gray-600 mt-2">
            Announcements, messaging, and virtual office hours management
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule Session
          </Button>
          <Button className="gap-2" onClick={() => setShowNewAnnouncementDialog(true)}>
            <Plus className="h-4 w-4" />
            New Announcement
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="messages">Direct Messages</TabsTrigger>
          <TabsTrigger value="office-hours">Office Hours</TabsTrigger>
          <TabsTrigger value="sessions">Scheduled Sessions</TabsTrigger>
        </TabsList>

        {/* Announcements */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search announcements..."
                  className="pl-10 w-64"
                />
              </div>
              <Select>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>Quick stats:</span>
              <Badge variant="outline">3 announcements</Badge>
              <Badge variant="outline">89% read rate</Badge>
            </div>
          </div>

          <div className="space-y-4">
            {announcements.map((announcement) => (
              <AnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>
        </TabsContent>

        {/* Direct Messages */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Conversations
                  <Badge variant="outline">
                    {conversations.filter(c => c.unreadCount > 0).length} unread
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-80">
                  <ConversationList />
                </ScrollArea>
              </CardContent>
            </Card>
            
            <Card className="lg:col-span-2">
              <CardContent className="p-0 h-full">
                {selectedConversation ? (
                  <MessageThread conversation={selectedConversation} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Select a conversation to start messaging</p>
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
                  <CardDescription>{session.time}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Next session: {formatTime(session.nextSession)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>Location: {session.location}</span>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Booking Status</span>
                        <span className="text-sm font-medium">
                          {session.bookedSlots}/{session.totalSlots} slots
                        </span>
                      </div>
                      <Progress 
                        value={(session.bookedSlots / session.totalSlots) * 100} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
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
                      <div className="flex items-center space-x-3 mb-2">
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
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatTime(session.time)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <span className="text-sm text-gray-600 block mb-2">Participants:</span>
                        <div className="flex space-x-2">
                          {session.type === 'individual' ? (
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="text-xs">
                                  {session.student.avatar}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{session.student.name}</span>
                            </div>
                          ) : (
                            session.students.map((student, index) => (
                              <div key={index} className="flex items-center space-x-2">
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
                      
                      <div className="flex space-x-2">
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