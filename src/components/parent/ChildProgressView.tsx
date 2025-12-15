import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  BookOpen, 
  Clock,
  Award,
  TrendingUp,
  Sparkles,
  MessageSquare,
  ChevronRight,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';
import { ChildProgress, ChildInstructor, ChildCourse } from '../../interfaces/parent.types';

export function ChildProgressView() {
  const { t, isRTL } = useLanguage();
  const { childId } = useParams<{ childId: string }>();
  const navigate = useNavigate();
  
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [instructors, setInstructors] = useState<ChildInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (childId) {
      loadChildData();
    }
  }, [childId]);

  const loadChildData = async () => {
    if (!childId) return;
    
    try {
      setIsLoading(true);
      
      const [progressData, instructorData] = await Promise.all([
        api.parent.getChildProgress(childId),
        api.parent.getChildInstructors(childId)
      ]);
      
      setProgress(progressData);
      setInstructors(instructorData);
      
    } catch (error) {
      console.error('Error loading child data:', error);
      toast.error(t('childProgress.errorLoading'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactInstructor = async (instructorId: string) => {
    if (!childId) return;
    
    try {
      const conversation = await api.parent.contactInstructor(childId, {
        instructorId,
        message: t('childProgress.defaultMessage')
      });
      
      navigate(`/messages/${conversation._id}`);
      toast.success(t('childProgress.conversationStarted'));
      
    } catch (error) {
      console.error('Error contacting instructor:', error);
      toast.error(t('childProgress.errorContacting'));
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">{t('childProgress.notFound')}</p>
        <Button onClick={() => navigate('/parent/dashboard')} className="mt-4">
          {t('childProgress.backToDashboard')}
        </Button>
      </div>
    );
  }

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Back Button & Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/parent/dashboard')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-4 flex-1">
          <Avatar className="h-16 w-16">
            <AvatarImage src={progress.student.avatar} alt={progress.student.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-lg">
              {getInitials(progress.student.name)}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{progress.student.name}</h1>
            <p className="text-gray-600">{progress.student.email}</p>
          </div>
        </div>

        {/* AI Credits Quick Link */}
        <Button 
          variant="outline"
          onClick={() => navigate(`/parent/child/${childId}/ai-credits`)}
        >
          <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
          {t('childProgress.viewAICredits')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('childProgress.learningStreak')}</p>
                <p className="text-xl font-bold">{progress.stats.learningStreak.current} {t('childProgress.days')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('childProgress.courses')}</p>
                <p className="text-xl font-bold">
                  {progress.stats.completedCoursesCount}/{progress.stats.enrolledCoursesCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('childProgress.avgProgress')}</p>
                <p className="text-xl font-bold">{Math.round(progress.stats.averageProgress)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('childProgress.studyTime')}</p>
                <p className="text-xl font-bold">{Math.round(progress.stats.studyTime.total / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">
            <BookOpen className="h-4 w-4 mr-2" />
            {t('childProgress.courses')}
          </TabsTrigger>
          <TabsTrigger value="instructors">
            <MessageSquare className="h-4 w-4 mr-2" />
            {t('childProgress.instructors')}
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('childProgress.enrolledCourses')}</CardTitle>
              <CardDescription>{t('childProgress.enrolledCoursesDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {progress.courses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('childProgress.noCourses')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progress.courses.map((course) => (
                    <div 
                      key={course.courseId}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {course.thumbnail ? (
                        <img 
                          src={course.thumbnail} 
                          alt={course.title}
                          className="w-16 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-gray-900 truncate">{course.title}</h4>
                          <Badge className={getStatusColor(course.status)}>
                            {t(`childProgress.status.${course.status}`)}
                          </Badge>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                            <span>{t('childProgress.progress')}</span>
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-2" />
                        </div>
                      </div>

                      <div className="text-right">
                        {course.grade && (
                          <Badge variant="outline" className="text-lg font-bold">
                            {course.grade}
                          </Badge>
                        )}
                        {course.lastAccessed && (
                          <p className="text-xs text-gray-500 mt-1">
                            {t('childProgress.lastAccessed')}: {new Date(course.lastAccessed).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instructors Tab */}
        <TabsContent value="instructors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('childProgress.courseInstructors')}</CardTitle>
              <CardDescription>{t('childProgress.courseInstructorsDesc')}</CardDescription>
            </CardHeader>
            <CardContent>
              {instructors.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">{t('childProgress.noInstructors')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {instructors.map((instructor) => (
                    <div 
                      key={instructor._id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={instructor.avatar} alt={instructor.name} />
                        <AvatarFallback>{getInitials(instructor.name)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">{instructor.name}</h4>
                        <p className="text-sm text-gray-500">
                          {t('childProgress.teaches')}: {instructor.courses.map(c => c.title).join(', ')}
                        </p>
                      </div>
                      
                      <Button 
                        size="sm"
                        onClick={() => handleContactInstructor(instructor._id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {t('childProgress.message')}
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
