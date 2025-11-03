import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  FileText,
  Download,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Star,
  Clock,
  User,
  Calendar,
  Target,
  CheckCircle2,
  Circle,
  Settings,
  MoreVertical,
  Share2,
  Flag,
  ThumbsUp,
  Eye,
  PenTool,
  Lightbulb,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  Zap,
  Award,
  TrendingUp,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { PdfViewer } from '../shared/PdfViewer';
import { CustomVideoPlayer } from '../shared/CustomVideoPlayer';

// Utility function to fix URLs with wrong port
const fixBackendUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    // If URL contains wrong port, fix it
    if (url.includes(':5173')) {
      return url.replace(':5173', ':5000');
    }
    
    // If it's a localhost URL without port or with wrong port
    if (url.includes('localhost') && !url.includes(':5000')) {
      return url.replace(/localhost(:\d+)?/, 'localhost:5000');
    }
    
    return url;
  } catch (error) {
    console.error('Error fixing URL:', error);
    return url;
  }
};

interface LessonViewProps {
  onNavigateBack?: () => void;
  lessonData?: any;
  lessonId?: string;
  isAdminView?: boolean;
}

export function LessonView({ onNavigateBack, lessonData, lessonId: propLessonId, isAdminView = false }: LessonViewProps = {}) {
  // Get lessonId from URL params if not provided as prop (when used as a route)
  const { id: urlLessonId } = useParams<{ id?: string }>();
  const lessonId = propLessonId || urlLessonId;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0); // Will be set from real lesson data
  const [volume, setVolume] = useState([80]);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [notes, setNotes] = useState('');
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Fetch lesson from backend
  useEffect(() => {
    const fetchLesson = async () => {
      if (lessonData) {
        // Transform lessonData to match expected structure
        const transformedLesson = {
          id: lessonData._id || lessonData.id,
          title: lessonData.title,
          description: lessonData.description,
          content: lessonData.content,
          order: lessonData.order,
          estimatedTime: lessonData.estimatedTime,
          views: lessonData.views || 0,
          completionRate: lessonData.completionRate || 0,
          isPreview: lessonData.isPreview || false,
          status: lessonData.status || 'draft',
          video: lessonData.video ? {
            ...lessonData.video,
            url: fixBackendUrl(lessonData.video.url)
          } : null,
          resources: (lessonData.resources || []).map((resource: any) => ({
            ...resource,
            url: fixBackendUrl(resource.url)
          })),
          quizzes: lessonData.quizzes || [],
          createdAt: lessonData.createdAt,
          updatedAt: lessonData.updatedAt,
          // Course information
          course: lessonData.course?.title || 'Course',
          courseId: lessonData.courseId,
          // Instructor information
          instructor: lessonData.instructor || null,
          // Additional properties
          duration: lessonData.video?.duration || lessonData.estimatedTime || 0,
          difficulty: lessonData.difficulty || 'intermediate',
          type: lessonData.video ? 'video' : 'text',
          likes: lessonData.likes || 0,
          lastUpdated: lessonData.updatedAt,
          learningObjectives: lessonData.learningObjectives || [],
          tags: lessonData.tags || [],
          transcript: lessonData.video?.transcript || [],
          // Navigation
          previousLesson: lessonData.previousLesson || null,
          nextLesson: lessonData.nextLesson || null
        };
        setLesson(transformedLesson);
        setLoading(false);
        return;
      }

      if (!lessonId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await api.lesson.getLesson(lessonId);
        console.log('📖 Lesson response:', response);

        // BaseApiService auto-extracts data, so response is already the lesson data object
        if (response && (response._id || response.id)) {
          const lessonData = response;
          
          // Handle courseId - it can be an object or string
          const courseInfo = typeof lessonData.courseId === 'object' 
            ? lessonData.courseId 
            : { _id: lessonData.courseId, title: 'Course' };
          
          // Handle video - check if it has actual video content or just metadata
          const hasVideoUrl = lessonData.video?.url || lessonData.videoUrlCDN;
          const videoUrl = hasVideoUrl ? fixBackendUrl(hasVideoUrl) : null;
          
          const transformedLesson = {
            id: lessonData._id || lessonData.id,
            title: lessonData.title,
            description: lessonData.description || '',
            content: lessonData.content || '',
            order: lessonData.order,
            estimatedTime: lessonData.estimatedTime || lessonData.formattedDuration || 0,
            views: lessonData.views || 0,
            completionRate: lessonData.completionRate || 0,
            isPreview: lessonData.isPreview || false,
            status: lessonData.status || 'draft',
            video: hasVideoUrl && lessonData.video ? {
              ...lessonData.video,
              url: videoUrl,
              subtitles: lessonData.video.subtitles || []
            } : null,
            resources: (lessonData.resources || []).map((resource: any) => ({
              ...resource,
              url: fixBackendUrl(resource.url),
              id: resource._id || resource.id,
              title: resource.title,
              type: resource.type,
              size: resource.size,
              description: resource.description || '',
              isDownloadable: resource.isDownloadable !== false
            })),
            quizzes: lessonData.quizzes || lessonData.availableQuizzes || lessonData.assignedQuizzes || [],
            createdAt: lessonData.createdAt,
            updatedAt: lessonData.updatedAt,
            // Course information
            course: courseInfo.title || 'Course',
            courseId: courseInfo._id || courseInfo.id || lessonData.courseId,
            // Instructor information
            instructor: lessonData.instructor || courseInfo.instructor || null,
            // Additional properties
            duration: lessonData.video?.duration || lessonData.formattedDuration || lessonData.estimatedTime || 0,
            difficulty: lessonData.difficulty || 'intermediate',
            type: hasVideoUrl ? 'video' : (lessonData.content ? 'text' : 'resources'),
            likes: lessonData.likes || 0,
            lastUpdated: lessonData.updatedAt,
            learningObjectives: lessonData.learningObjectives || [],
            tags: lessonData.tags || [],
            transcript: lessonData.video?.transcript || lessonData.video?.subtitles || [],
            // Navigation
            previousLesson: lessonData.previousLesson || null,
            nextLesson: lessonData.nextLesson || null
          };
          
          console.log('✅ Transformed lesson:', transformedLesson);
          setLesson(transformedLesson);
          setDuration(transformedLesson.duration);
        } else {
          console.warn('⚠️ No lesson data or invalid response structure:', response);
          setLesson(null);
        }
      } catch (error: any) {
        console.error('Failed to fetch lesson:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Lesson endpoint not implemented yet');
          setLesson(null);
        } else {
          toast.error('Failed to load lesson data');
          setLesson(null);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [lessonId, lessonData]);

  // Use real data from lesson only
  const resources = lesson?.resources || [];
  const comments: any[] = []; // No mock comments - only real data from backend

  // PDF viewer handlers
  const handleOpenPdfViewer = (resource: any) => {
    setSelectedResource(resource);
    setShowPdfViewer(true);
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setSelectedResource(null);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  // Mark lesson as complete
  const markComplete = async () => {
    if (!lesson || lessonCompleted) return;

    try {
      const response = await api.lesson.completeLesson(lesson.id);
      console.log('📖 Complete lesson response:', response);
      
      if (response && response.success) {
        setLessonCompleted(true);
        toast.success('Lesson marked as complete! 🎉');
        
        // Track analytics
        try {
          await api.analytics.trackEvent({
            type: 'lesson_completion',
            lessonId: lesson.id,
            data: { timeSpent: currentTime }
          });
        } catch (analyticsError) {
          console.warn('Analytics tracking failed:', analyticsError);
        }
      } else {
        console.warn('⚠️ Lesson completion failed or invalid response');
        toast.error('Failed to mark lesson complete');
      }
    } catch (error: any) {
      console.error('Failed to mark lesson complete:', error);
      
      // Handle missing endpoint gracefully
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Lesson completion endpoint not implemented yet');
        setLessonCompleted(true);
        toast.info('Lesson completion feature coming soon');
      } else {
        toast.error('Failed to mark lesson complete');
      }
    }
  };

  // Auto-complete when video reaches 90%
  useEffect(() => {
    if (progressPercentage >= 90 && !lessonCompleted && lesson) {
      markComplete();
    }
  }, [progressPercentage, lessonCompleted, lesson]);

  // Show loading state if lesson is not available
  if (!lesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Lesson Navigation Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={onNavigateBack}
                className="flex items-center hover:bg-gray-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Button>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  {lesson.course || 'Course'}
                </Badge>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Lesson {lesson.order || 1}</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Player Section */}
      <div className="bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            {/* Check if lesson has video */}
            {lesson.video?.url ? (
              <>
                {/* Custom Video Player */}
                <div className="absolute inset-0">
                  <CustomVideoPlayer
                    src={lesson.video.url}
                    poster={lesson.video.thumbnail}
                    title={lesson.video.title || lesson.title}
                    className="w-full h-full"
                  />
                </div>
              </>
            ) : (
              /* No Video Message */
              <div className="relative z-10 text-center text-white">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-8 w-8 text-white/60" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Video Yet</h3>
                <p className="text-white/70">This lesson doesn't have a video uploaded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Lesson Header */}
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      Lesson {lesson.order || 1}
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {lesson.difficulty || 'intermediate'}
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {lesson.video ? 'video' : 'text'}
                    </Badge>
                  </div>
                  
                  <h1 className="text-3xl font-bold text-gray-900">{lesson.title || 'Untitled Lesson'}</h1>
                  <p className="text-lg text-gray-600 leading-relaxed">{lesson.description || 'No description available'}</p>
                  
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{lesson.video?.duration ? formatTime(lesson.video.duration) : lesson.estimatedTime ? `${lesson.estimatedTime} min` : 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{(lesson.views || 0).toLocaleString()} views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Updated {lesson.lastUpdated ? new Date(lesson.lastUpdated).toLocaleDateString() : 'Recently'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline"
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className="flex items-center space-x-2"
                  >
                    {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                    <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
                  </Button>
                  
                  <Button variant="outline">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  
                  <Button variant="outline">
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {lesson.likes || 0}
                  </Button>
                </div>
              </div>

              {/* Instructor Info */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                <CardContent className="p-6">
                  {lesson.instructor ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-16 w-16 border-2 border-white shadow-lg">
                          <AvatarImage src={lesson.instructor.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-purple-600 text-white font-semibold text-lg">
                            {lesson.instructor.name?.split(' ').map((n: string) => n[0]).join('') || 'IN'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{lesson.instructor.name}</h3>
                          <p className="text-gray-600">{lesson.instructor.title || 'Course Instructor'}</p>
                          {lesson.instructor.rating && (
                            <div className="flex items-center space-x-1 mt-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{lesson.instructor.rating}</span>
                              <span className="text-sm text-gray-500">instructor rating</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline">
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Instructor Assigned</h3>
                      <p className="text-gray-500">This lesson doesn't have an instructor assigned yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Lesson Content Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="discussion">Discussion</TabsTrigger>
                <TabsTrigger value="transcript">Transcript</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Learning Objectives */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Learning Objectives
                    </CardTitle>
                    <CardDescription>What you'll learn in this lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(lesson.learningObjectives || []).map((objective: any, index: number) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          </div>
                          <p className="text-gray-700 flex-1">{objective}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Tags */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Topics Covered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {(lesson.tags || []).map((tag: any, index: number) => (
                        <Badge key={index} variant="outline" className="bg-teal-50 text-teal-700">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Lesson Resources
                    </CardTitle>
                    <CardDescription>Additional materials to enhance your learning</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {resources.map((resource: any, index: number) => (
                        <div key={resource.id || index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-center space-x-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                              <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">{resource.title}</h4>
                              <p className="text-sm text-gray-500">{resource.description}</p>
                              <div className="flex items-center space-x-3 mt-1 text-xs text-gray-400">
                                <span className="capitalize">{resource.type}</span>
                                <span>{resource.size ? `${Math.round(resource.size / 1024)}KB` : 'Unknown size'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {resource.type === 'pdf' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenPdfViewer(resource)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Download functionality
                                const link = document.createElement('a');
                                link.href = resource.url;
                                link.download = resource.title || 'download';
                                link.click();
                              }}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PenTool className="h-5 w-5 mr-2 text-purple-600" />
                      My Notes
                    </CardTitle>
                    <CardDescription>Take notes while you learn</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your notes here..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="min-h-[300px] resize-none"
                      />
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Lightbulb className="h-4 w-4" />
                          <span>Auto-saved</span>
                        </div>
                        <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussion" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                      Discussion
                    </CardTitle>
                    <CardDescription>Join the conversation with fellow learners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Add Comment */}
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Ask a question or share your thoughts..."
                          className="resize-none"
                        />
                        <div className="flex justify-end">
                          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                            Post Comment
                          </Button>
                        </div>
                      </div>

                      <Separator />

                      {/* Comments */}
                      <div className="space-y-6">
                        {comments.map((comment) => (
                          <div key={comment.id} className="space-y-3">
                            <div className="flex items-start space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={comment.user.avatar} />
                                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-purple-600 text-white">
                                  {comment.user.initials}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-gray-900">{comment.user.name}</span>
                                  <span className="text-sm text-gray-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-gray-700 mb-2">{comment.content}</p>
                                <div className="flex items-center space-x-4 text-sm">
                                  <button className="flex items-center space-x-1 text-gray-500 hover:text-teal-600">
                                    <ThumbsUp className="h-4 w-4" />
                                    <span>{comment.likes}</span>
                                  </button>
                                  <button className="text-gray-500 hover:text-teal-600">
                                    Reply ({comment.replies})
                                  </button>
                                  <button className="text-gray-500 hover:text-red-600">
                                    <Flag className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="transcript" className="space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-gray-600" />
                      Video Transcript
                    </CardTitle>
                    <CardDescription>Full text transcript of the lesson</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {(lesson.transcript || []).map((item: any, index: number) => (
                        <div key={index} className="flex space-x-4">
                          <button className="text-sm text-teal-600 font-mono hover:underline">
                            {item.time}
                          </button>
                          <p className="text-gray-700 flex-1">{item.text}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Lesson Progress</h3>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {Math.round(progressPercentage)}%
                    </Badge>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatTime(currentTime)} watched</span>
                    <span>{lesson.video?.duration ? formatTime(lesson.video.duration) : lesson.estimatedTime ? `${lesson.estimatedTime} min` : 'N/A'} total</span>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    onClick={() => setLessonCompleted(!lessonCompleted)}
                  >
                    {lessonCompleted ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Lesson Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lesson.previousLesson ? (
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Previous: {lesson.previousLesson.title}
                  </Button>
                ) : (
                  <div className="w-full p-3 text-center text-gray-500 bg-gray-50 rounded-lg">
                    <ArrowLeft className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm">No previous lesson</span>
                  </div>
                )}
                
                {lesson.nextLesson ? (
                  <Button variant="outline" className="w-full justify-start">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Next: {lesson.nextLesson.title}
                  </Button>
                ) : (
                  <div className="w-full p-3 text-center text-gray-500 bg-gray-50 rounded-lg">
                    <ArrowRight className="h-4 w-4 mx-auto mb-1" />
                    <span className="text-sm">End of course</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Stats */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Lesson Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm text-gray-600">Completion Rate</span>
                  </div>
                  <span className="font-semibold">{lesson.completionRate || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">Total Views</span>
                  </div>
                  <span className="font-semibold">{(lesson.views || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThumbsUp className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-gray-600">Likes</span>
                  </div>
                  <span className="font-semibold">{lesson.likes || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-600">Est. Time</span>
                  </div>
                  <span className="font-semibold">{lesson.estimatedTime || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Take Quiz
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Award className="h-4 w-4 mr-2" />
                  View Certificate
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Zap className="h-4 w-4 mr-2" />
                  AI Summary
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PDF Viewer for resources */}
      <PdfViewer 
        isOpen={showPdfViewer}
        onClose={handleClosePdfViewer}
        resource={selectedResource}
      />
    </div>
  );
}