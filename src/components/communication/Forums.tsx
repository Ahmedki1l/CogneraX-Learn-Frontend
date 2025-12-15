import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  MessageSquare, Plus, Search, ThumbsUp, ThumbsDown, Reply, Pin, 
  Users, BookOpen, HelpCircle, Lightbulb, Star, Clock, 
  TrendingUp, Eye, MessageCircle, Award, Flag, Filter,
  ChevronUp, ChevronDown, Send, Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface ForumsProps {
  user: any;
}

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    reputation: number;
  };
  course: string;
  category: 'general' | 'help' | 'discussion' | 'announcement' | 'project';
  tags: string[];
  upvotes: number;
  downvotes: number;
  replies: number;
  views: number;
  isPinned: boolean;
  isSolved: boolean;
  createdAt: Date;
  lastActivity: Date;
  userVote?: 'up' | 'down' | null;
}

interface ForumReply {
  id: string;
  postId: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: 'student' | 'instructor' | 'admin';
    reputation: number;
  };
  upvotes: number;
  downvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: Date;
  userVote?: 'up' | 'down' | null;
}

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  course: string;
  members: number;
  maxMembers: number;
  isPrivate: boolean;
  createdBy: string;
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
}

export const Forums: React.FC<ForumsProps> = ({ user }) => {
  const { t, language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState('discussions');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [sortBy, setSortBy] = useState('recent');
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);

  // Fetch forums data from API
  React.useEffect(() => {
    const fetchForumsData = async () => {
      try {
        setLoading(true);
        
        const postsResponse = await api.forum.getPosts({
          course: selectedCourse !== 'all' ? selectedCourse : undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchTerm || undefined,
          sortBy,
          page: 1,
          limit: 20
        });
        
        if (postsResponse) {
          setPosts(postsResponse);
        } else {
          // Use mock data as fallback
          setPosts(mockPosts);
        }

        const groupsResponse = await api.forum.getStudyGroups({
          course: selectedCourse !== 'all' ? selectedCourse : undefined,
          search: searchTerm || undefined
        });
        
        if (groupsResponse) {
          setStudyGroups(groupsResponse);
        } else {
          // Use mock data as fallback
          setStudyGroups(mockStudyGroups);
        }

      } catch (error) {
        console.error('Error fetching forums data:', error);
        // Use mock data as fallback
        setPosts(mockPosts);
        setStudyGroups(mockStudyGroups);
        setReplies(mockReplies);
        toast.error('Failed to load forums data');
      } finally {
        setLoading(false);
      }
    };

    fetchForumsData();
  }, [selectedCourse, selectedCategory, searchTerm, sortBy]);

  // Fetch replies when a post is selected
  React.useEffect(() => {
    const fetchReplies = async () => {
      if (selectedPost) {
        try {
          const repliesResponse = await api.forum.getReplies(selectedPost.id);
          if (repliesResponse) {
            setReplies(repliesResponse);
          }
        } catch (error) {
          console.error('Error fetching replies:', error);
          toast.error('Failed to load replies');
        }
      }
    };

    fetchReplies();
  }, [selectedPost]);

  // Create new post
  const handleCreatePost = async (postData: { title: string; content: string; category: string; tags: string[] }) => {
    try {
      const response = await api.forum.createPost({
        title: postData.title,
        content: postData.content,
        category: postData.category,
        tags: postData.tags,
        course: selectedCourse !== 'all' ? selectedCourse : undefined
      });
      
      if (response) {
        setPosts(prev => [response, ...prev]);
        setIsNewPostOpen(false);
        toast.success('Post created successfully!');
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error?.message || 'Failed to create post');
    }
  };

  // Create new reply
  const handleCreateReply = async (postId: string, content: string) => {
    try {
      const response = await api.forum.createReply(postId, { content });
      
      if (response) {
        setReplies(prev => [...prev, response]);
        setNewReply('');
        toast.success('Reply posted successfully!');
      }
    } catch (error: any) {
      console.error('Error creating reply:', error);
      toast.error(error?.message || 'Failed to post reply');
    }
  };

  // Vote on post
  const handleVotePost = async (postId: string, voteType: 'up' | 'down') => {
    try {
      const response = await api.forum.votePost(postId, voteType);
      
      if (response) {
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                upvotes: response.upvotes, 
                downvotes: response.downvotes,
                userVote: voteType
              }
            : post
        ));
      }
    } catch (error: any) {
      console.error('Error voting on post:', error);
      toast.error(error?.message || 'Failed to vote');
    }
  };

  // Mock data (fallback)
  const courses = ['React Development', 'Python Fundamentals', 'JavaScript Fundamentals', 'Data Science'];
  
  // Mock data (fallback)
  const mockPosts: ForumPost[] = [
    {
      id: '1',
      title: 'Best practices for React component composition?',
      content: 'I\'m working on a complex React application and wondering about the best practices for composing components. Should I use HOCs, render props, or custom hooks?',
      author: {
        id: '1',
        name: 'Sarah Chen',
        role: 'student',
        reputation: 156
      },
      course: 'React Development',
      category: 'discussion',
      tags: ['react', 'components', 'best-practices'],
      upvotes: 12,
      downvotes: 1,
      replies: 8,
      views: 234,
      isPinned: false,
      isSolved: true,
      createdAt: new Date('2024-01-15T10:30:00'),
      lastActivity: new Date('2024-01-16T14:20:00'),
      userVote: 'up'
    },
    {
      id: '2',
      title: 'How to debug Python memory leaks?',
      content: 'My Python application is consuming more and more memory over time. What are the best tools and techniques for identifying and fixing memory leaks?',
      author: {
        id: '2',
        name: 'Mike Rodriguez',
        role: 'student',
        reputation: 89
      },
      course: 'Python Fundamentals',
      category: 'help',
      tags: ['python', 'debugging', 'memory'],
      upvotes: 8,
      downvotes: 0,
      replies: 5,
      views: 167,
      isPinned: false,
      isSolved: false,
      createdAt: new Date('2024-01-16T09:15:00'),
      lastActivity: new Date('2024-01-16T16:45:00')
    },
    {
      id: '3',
      title: 'Welcome to the React Development Course!',
      content: 'Welcome everyone to our React Development course! This is the place to ask questions, share insights, and collaborate on projects. Please read the course guidelines and introduce yourselves.',
      author: {
        id: '3',
        name: 'Dr. Emily Watson',
        role: 'instructor',
        reputation: 1250
      },
      course: 'React Development',
      category: 'announcement',
      tags: ['welcome', 'guidelines'],
      upvotes: 45,
      downvotes: 0,
      replies: 23,
      views: 892,
      isPinned: true,
      isSolved: false,
      createdAt: new Date('2024-01-10T08:00:00'),
      lastActivity: new Date('2024-01-16T11:30:00')
    }
  ];

  const mockReplies: ForumReply[] = [
    {
      id: '1',
      postId: '1',
      content: 'I\'d recommend using custom hooks for stateful logic and composition patterns. They\'re more flexible than HOCs and easier to test than render props.',
      author: {
        id: '3',
        name: 'Dr. Emily Watson',
        role: 'instructor',
        reputation: 1250
      },
      upvotes: 15,
      downvotes: 0,
      isAcceptedAnswer: true,
      createdAt: new Date('2024-01-15T11:45:00'),
      userVote: 'up'
    },
    {
      id: '2',
      postId: '1',
      content: 'Custom hooks are great, but don\'t forget about the composition pattern with children props. It\'s often overlooked but very powerful for creating flexible components.',
      author: {
        id: '4',
        name: 'Alex Kumar',
        role: 'student',
        reputation: 234
      },
      upvotes: 8,
      downvotes: 1,
      isAcceptedAnswer: false,
      createdAt: new Date('2024-01-15T14:20:00')
    }
  ];

  const mockStudyGroups: StudyGroup[] = [
    {
      id: '1',
      name: 'React Developers Unite',
      description: 'A group for React enthusiasts to share projects, discuss best practices, and help each other grow.',
      course: 'React Development',
      members: 24,
      maxMembers: 50,
      isPrivate: false,
      createdBy: 'user1',
      createdAt: new Date('2024-01-10'),
      lastActivity: new Date('2024-01-16'),
      tags: ['react', 'projects', 'collaboration']
    },
    {
      id: '2',
      name: 'Python Data Science Study Group',
      description: 'Weekly study sessions for data science concepts, sharing datasets, and working on group projects.',
      course: 'Data Science',
      members: 15,
      maxMembers: 25,
      isPrivate: false,
      createdBy: 'user2',
      createdAt: new Date('2024-01-12'),
      lastActivity: new Date('2024-01-15'),
      tags: ['python', 'data-science', 'study-group']
    }
  ];

  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    course: '',
    category: 'discussion',
    tags: []
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    course: '',
    maxMembers: 25,
    isPrivate: false,
    tags: []
  });

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || post.course === selectedCourse;
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCourse && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return b.lastActivity.getTime() - a.lastActivity.getTime();
      case 'popular':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'views':
        return b.views - a.views;
      case 'replies':
        return b.replies - a.replies;
      default:
        return 0;
    }
  });


  const handleCreateGroup = () => {
    if (newGroup.name && newGroup.description && newGroup.course) {
      const group: StudyGroup = {
        id: Date.now().toString(),
        ...newGroup,
        members: 1,
        createdBy: user.id,
        createdAt: new Date(),
        lastActivity: new Date(),
        tags: newGroup.tags
      };
      setStudyGroups([group, ...studyGroups]);
      setNewGroup({ name: '', description: '', course: '', maxMembers: 25, isPrivate: false, tags: [] });
      setIsNewGroupOpen(false);
    }
  };

  const handleVote = (postId: string, voteType: 'up' | 'down') => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const currentVote = post.userVote;
        let newUpvotes = post.upvotes;
        let newDownvotes = post.downvotes;
        let newUserVote: 'up' | 'down' | null = voteType;

        // Remove previous vote
        if (currentVote === 'up') newUpvotes--;
        if (currentVote === 'down') newDownvotes--;

        // Add new vote (or remove if same)
        if (currentVote === voteType) {
          newUserVote = null;
        } else {
          if (voteType === 'up') newUpvotes++;
          if (voteType === 'down') newDownvotes++;
        }

        return {
          ...post,
          upvotes: newUpvotes,
          downvotes: newDownvotes,
          userVote: newUserVote
        };
      }
      return post;
    }));
  };

  const handleReply = (postId: string) => {
    if (newReply.trim()) {
      const reply: ForumReply = {
        id: Date.now().toString(),
        postId,
        content: newReply,
        author: {
          id: user.id,
          name: user.name,
          role: user.role,
          reputation: 0
        },
        upvotes: 0,
        downvotes: 0,
        isAcceptedAnswer: false,
        createdAt: new Date()
      };
      setReplies([...replies, reply]);
      setNewReply('');
      
      // Update post reply count
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, replies: post.replies + 1, lastActivity: new Date() }
          : post
      ));
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'instructor': return 'bg-purple-100 text-purple-800';
      case 'admin': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'help': return <HelpCircle className="h-4 w-4" />;
      case 'discussion': return <MessageSquare className="h-4 w-4" />;
      case 'announcement': return <Pin className="h-4 w-4" />;
      case 'project': return <Lightbulb className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'help': return 'bg-orange-100 text-orange-800';
      case 'discussion': return 'bg-blue-100 text-blue-800';
      case 'announcement': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('Discussion Forums')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Connect with peers, ask questions, and share knowledge')}
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('Search discussions...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('All Courses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Courses')}</SelectItem>
              {courses.map(course => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">{t('Recent')}</SelectItem>
              <SelectItem value="popular">{t('Popular')}</SelectItem>
              <SelectItem value="views">{t('Most Viewed')}</SelectItem>
              <SelectItem value="replies">{t('Most Replied')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discussions" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('Discussions')}
          </TabsTrigger>
          <TabsTrigger value="study-groups" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('Study Groups')}
          </TabsTrigger>
          <TabsTrigger value="q-and-a" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            {t('Q&A')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="discussions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('All Categories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('All Categories')}</SelectItem>
                  <SelectItem value="general">{t('General')}</SelectItem>
                  <SelectItem value="help">{t('Help')}</SelectItem>
                  <SelectItem value="discussion">{t('Discussion')}</SelectItem>
                  <SelectItem value="announcement">{t('Announcements')}</SelectItem>
                  <SelectItem value="project">{t('Projects')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Dialog open={isNewPostOpen} onOpenChange={setIsNewPostOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cognerax-gradient text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('New Discussion')}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('Start a New Discussion')}</DialogTitle>
                  <DialogDescription>
                    {t('Share your thoughts, ask questions, or start a conversation')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t('Discussion title')}
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newPost.course} onValueChange={(value) => setNewPost({ ...newPost, course: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select Course')} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={newPost.category} onValueChange={(value) => setNewPost({ ...newPost, category: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discussion">{t('Discussion')}</SelectItem>
                        <SelectItem value="help">{t('Help')}</SelectItem>
                        <SelectItem value="project">{t('Project')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Textarea
                    placeholder={t('Write your discussion content here...')}
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    rows={6}
                  />
                  <Input
                    placeholder={t('Tags (comma separated)')}
                    onChange={(e) => setNewPost({ ...newPost, tags: e.target.value.split(',').map(tag => tag.trim()) })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewPostOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={() => handleCreatePost(newPost)} className="bg-cognerax-gradient">
                    {t('Post Discussion')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Posts List */}
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-cognerax transition-all duration-200 cursor-pointer" onClick={() => setSelectedPost(post)}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center gap-1 min-w-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post.id, 'up');
                        }}
                        className={`p-1 ${post.userVote === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-medium">{post.upvotes - post.downvotes}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVote(post.id, 'down');
                        }}
                        className={`p-1 ${post.userVote === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                            {post.isSolved && <Star className="h-4 w-4 text-green-500" />}
                            <Badge className={getCategoryColor(post.category)}>
                              {getCategoryIcon(post.category)}
                              <span className="ml-1">{t(post.category)}</span>
                            </Badge>
                            <Badge variant="outline">{post.course}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{post.title}</h3>
                          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.content}</p>
                          
                          <div className="flex flex-wrap gap-1 mb-3">
                            {post.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="text-right text-sm text-muted-foreground">
                          <div className="flex items-center gap-4 mb-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {post.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {post.replies}
                            </span>
                          </div>
                          <div className="text-xs">
                            {formatDistanceToNow(post.lastActivity, { addSuffix: true })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={post.author.avatar} />
                            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{post.author.name}</span>
                          <Badge className={getRoleColor(post.author.role)} variant="secondary">
                            {t(post.author.role)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {post.author.reputation} {t('reputation')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="study-groups" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('Study Groups')}</h2>
            <Dialog open={isNewGroupOpen} onOpenChange={setIsNewGroupOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cognerax-gradient text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Create Group')}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('Create Study Group')}</DialogTitle>
                  <DialogDescription>
                    {t('Form a study group to collaborate with peers')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t('Group name')}
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  />
                  <Textarea
                    placeholder={t('Group description')}
                    value={newGroup.description}
                    onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                    rows={3}
                  />
                  <Select value={newGroup.course} onValueChange={(value) => setNewGroup({ ...newGroup, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select Course')} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder={t('Max members')}
                      value={newGroup.maxMembers}
                      onChange={(e) => setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) || 25 })}
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="private"
                        checked={newGroup.isPrivate}
                        onChange={(e) => setNewGroup({ ...newGroup, isPrivate: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor="private" className="text-sm">{t('Private group')}</label>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewGroupOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={handleCreateGroup} className="bg-cognerax-gradient">
                    {t('Create Group')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyGroups
              .filter(group => selectedCourse === 'all' || group.course === selectedCourse)
              .map((group) => (
                <Card key={group.id} className="hover:shadow-cognerax transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg line-clamp-2">{group.name}</CardTitle>
                      <Badge variant={group.isPrivate ? 'secondary' : 'default'}>
                        {group.isPrivate ? t('Private') : t('Public')}
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-2">
                      {group.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{group.course}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {group.members}/{group.maxMembers} {t('members')}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {group.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{t('Created')} {formatDistanceToNow(group.createdAt, { addSuffix: true })}</span>
                        <span>{t('Active')} {formatDistanceToNow(group.lastActivity, { addSuffix: true })}</span>
                      </div>
                      
                      <Button className="w-full" variant="outline">
                        {group.members >= group.maxMembers ? t('Full') : t('Join Group')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="q-and-a" className="space-y-6">
          <div className="text-center py-12">
            <HelpCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('Q&A Section')}</h3>
            <p className="text-muted-foreground mb-6">
              {t('Get quick answers to your questions from instructors and peers')}
            </p>
            <Button className="bg-cognerax-gradient">
              <Plus className="h-4 w-4 mr-2" />
              {t('Ask a Question')}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Post Detail Modal */}
      {selectedPost && (
        <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {selectedPost.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                {selectedPost.isSolved && <Star className="h-4 w-4 text-green-500" />}
                <Badge className={getCategoryColor(selectedPost.category)}>
                  {getCategoryIcon(selectedPost.category)}
                  <span className="ml-1">{t(selectedPost.category)}</span>
                </Badge>
                <Badge variant="outline">{selectedPost.course}</Badge>
              </div>
              <DialogTitle className="text-left">{selectedPost.title}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Original Post */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleVote(selectedPost.id, 'up')}
                    className={`p-1 ${selectedPost.userVote === 'up' ? 'text-green-600' : 'text-muted-foreground'}`}
                  >
                    <ChevronUp className="h-5 w-5" />
                  </Button>
                  <span className="text-lg font-medium">{selectedPost.upvotes - selectedPost.downvotes}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleVote(selectedPost.id, 'down')}
                    className={`p-1 ${selectedPost.userVote === 'down' ? 'text-red-600' : 'text-muted-foreground'}`}
                  >
                    <ChevronDown className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="prose max-w-none mb-4">
                    <p>{selectedPost.content}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {selectedPost.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={selectedPost.author.avatar} />
                        <AvatarFallback>{selectedPost.author.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{selectedPost.author.name}</span>
                          <Badge className={getRoleColor(selectedPost.author.role)} variant="secondary">
                            {t(selectedPost.author.role)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedPost.author.reputation} {t('reputation')} • {format(selectedPost.createdAt, 'MMM dd, yyyy HH:mm')}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Flag className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Replies */}
              <div className="space-y-4">
                <h3 className="font-semibold">{selectedPost.replies} {t('Replies')}</h3>
                
                {replies
                  .filter(reply => reply.postId === selectedPost.id)
                  .map((reply) => (
                    <div key={reply.id} className="flex gap-4 p-4 border rounded-lg">
                      <div className="flex flex-col items-center gap-1">
                        <Button size="sm" variant="ghost" className="p-1">
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <span className="text-sm">{reply.upvotes - reply.downvotes}</span>
                        <Button size="sm" variant="ghost" className="p-1">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex-1">
                        {reply.isAcceptedAnswer && (
                          <Badge className="bg-green-100 text-green-800 mb-2">
                            <Award className="h-3 w-3 mr-1" />
                            {t('Accepted Answer')}
                          </Badge>
                        )}
                        
                        <div className="prose max-w-none mb-3">
                          <p>{reply.content}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={reply.author.avatar} />
                              <AvatarFallback>{reply.author.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{reply.author.name}</span>
                            <Badge className={getRoleColor(reply.author.role)} variant="secondary">
                              {t(reply.author.role)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(reply.createdAt, { addSuffix: true })}
                            </span>
                          </div>
                          
                          <Button size="sm" variant="outline">
                            <Reply className="h-4 w-4 mr-1" />
                            {t('Reply')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Reply Form */}
              <div className="space-y-3">
                <Textarea
                  placeholder={t('Write your reply...')}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  rows={4}
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={() => handleReply(selectedPost.id)}
                    className="bg-cognerax-gradient"
                    disabled={!newReply.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {t('Post Reply')}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};