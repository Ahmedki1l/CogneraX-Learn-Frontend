import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Eye, 
  Edit, 
  Trash2, 
  Users, 
  Clock, 
  Target, 
  BarChart3, 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Download, 
  Share, 
  Settings, 
  Calendar, 
  Award, 
  TrendingUp, 
  Activity,

  CheckCircle2,
  Star,
  MessageSquare,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { CourseCreator } from './CourseCreator';
import { ResourceManager } from '../tools/ResourceManager';

interface CourseManagementProps {
  user?: any;
}

interface Course {
  id: string | number;
  title: string;
  description: string;
  status: string;
  field?: string;
  category?: string;
  level?: string;
  students: number; // Made required
  maxStudents: number; // Made required
  startDate?: string;
  endDate?: string;
  progress?: number;
  rating: number; // Made required with default
  reviews?: number;
  lessons?: number;
  assignments?: number;
  quizzes?: number;
  resources?: number;
  lastActivity?: string;
  thumbnail?: string | null;
}

export function CourseManagement({ user }: CourseManagementProps = {}) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedFieldFilter, setSelectedFieldFilter] = useState<string>('all');
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [showResourceManager, setShowResourceManager] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [accessibleFields, setAccessibleFields] = useState<any[]>([]);
  
  // Navigation state: 'fields' | 'field-detail' | 'course-detail'
  const [currentView, setCurrentView] = useState<'fields' | 'field-detail' | 'course-detail'>('fields');
  const [selectedField, setSelectedField] = useState<any>(null);
  const [selectedCourseForDetail, setSelectedCourseForDetail] = useState<any>(null);
  const [courseLessons, setCourseLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Fetch accessible fields and courses from API
  React.useEffect(() => {
    console.log('🔵 CourseManagement useEffect triggered', { 
      hasUser: !!user, 
      userId: user?.id || user?._id,
      userKeys: user ? Object.keys(user) : []
    });
    
    const fetchAccessibleCourses = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          console.log('⚠️ No user ID found in CourseManagement');
          return;
        }
        
        console.log('🚀 Fetching accessible courses for instructor:', userId);
        console.log('🔗 Endpoint: /instructors/' + userId + '/accessible-courses');
        const response = await api.instructor.getAccessibleCourses(userId);
        console.log('✅ Accessible courses response:', response);
        
        // BaseApiService auto-extracts data, so response should be { fields: [...] }
        // Handle both cases: direct data object or wrapped response
        const fields = (response?.fields || response?.data?.fields || []);
        
        if (fields && Array.isArray(fields) && fields.length > 0) {
          setAccessibleFields(fields);
          console.log('Set accessible fields:', fields.length, 'fields');
        } else {
          setAccessibleFields([]);
          console.log('No accessible fields found. Response structure:', {
            response,
            hasFields: !!response?.fields,
            hasDataFields: !!response?.data?.fields,
            responseKeys: response ? Object.keys(response) : []
          });
        }

      } catch (error: any) {
        console.error('Error fetching accessible courses:', error);
        console.error('Error details:', {
          message: error?.message,
          status: error?.status,
          statusText: error?.statusText,
          response: error?.response || error?.data
        });
        setAccessibleFields([]);
        
        // More specific error messages
        if (error?.status === 404 || error?.message?.includes('404')) {
          toast.error('Instructor accessible courses endpoint not found. Backend endpoint required: GET /instructors/:instructorId/accessible-courses');
        } else if (error?.status === 401 || error?.message?.includes('401')) {
          toast.error('Authentication required');
        } else {
          toast.error(error?.message || 'Failed to load courses');
        }
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchAccessibleCourses();
    }
  }, [user?.id, user?._id]);

  // Mock AI credits data (in real app, this would come from props/context)
  const aiCredits = {
    available: user?.aiCredits || 150,
    used: user?.aiCreditsUsed || 45,
    total: user?.aiCreditsTotal || 200
  };

  // Compute filtered fields based on selection
  const filteredFields = selectedFieldFilter === 'all' 
    ? accessibleFields 
    : accessibleFields.filter(f => (f._id || f.id) === selectedFieldFilter);

  // Flatten all courses with their field info for filtering and display
  const allCourses = accessibleFields.flatMap(field => {
    const fieldId = field._id || field.id;
    return (field.courses || []).map((course: any) => ({
      ...course,
      fieldId,
      fieldName: field.name,
      accessType: field.accessType,
      permissions: field.permissions
    }));
  });

  // Filter courses by search and status
  const filteredCourses = allCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Permission checkers
  const canCreateCourse = (fieldId: string) => {
    const field = accessibleFields.find(f => (f._id || f.id) === fieldId);
    return field?.accessType === 'full' && field?.permissions?.includes('create_course');
  };
  
  const canEditCourse = (courseId: string, fieldId: string) => {
    const field = accessibleFields.find(f => (f._id || f.id) === fieldId);
    return field?.permissions?.includes('update_course');
  };
  
  const canDeleteCourse = (courseId: string, fieldId: string) => {
    const field = accessibleFields.find(f => (f._id || f.id) === fieldId);
    return field?.permissions?.includes('delete_course');
  };

  const handleCourseCreated = (courseData: any) => {
    // Refresh accessible fields after course creation/update
    const fetchAccessibleCourses = async () => {
      const userId = user?.id || user?._id;
      if (userId) {
        try {
          const response = await api.instructor.getAccessibleCourses(userId);
          const fields = (response?.fields || response?.data?.fields || []);
          if (fields && Array.isArray(fields)) {
            setAccessibleFields(fields);
          }
        } catch (error: any) {
          console.error('Error refreshing accessible courses:', error);
        }
      }
    };
    
    fetchAccessibleCourses();
    toast.success(editingCourse ? 'Course updated successfully!' : 'Course created successfully!');
    setEditingCourse(null);
  };

  const handleDeleteCourse = async (courseId: string | number) => {
    try {
      await api.course.deleteCourse(String(courseId));
      // Refresh accessible fields after deletion
      const userId = user?.id || user?._id;
      if (userId) {
        try {
          const response = await api.instructor.getAccessibleCourses(userId);
          const fields = (response?.fields || response?.data?.fields || []);
          if (fields && Array.isArray(fields)) {
            setAccessibleFields(fields);
          }
        } catch (refreshError: any) {
          console.error('Error refreshing accessible courses:', refreshError);
        }
      }
      toast.success('Course deleted successfully');
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast.error(error?.message || 'Failed to delete course');
    }
  };

  const handlePublishCourse = async (courseId: string | number) => {
    try {
      const response = await api.course.publishCourse(String(courseId));
      if (response) {
        // Refresh accessible fields after publishing
        const userId = user?.id || user?._id;
        if (userId) {
          try {
            const updatedResponse = await api.instructor.getAccessibleCourses(userId);
            const fields = (updatedResponse?.fields || updatedResponse?.data?.fields || []);
            if (fields && Array.isArray(fields)) {
              setAccessibleFields(fields);
            }
          } catch (refreshError: any) {
            console.error('Error refreshing accessible courses:', refreshError);
          }
        }
        toast.success('Course published successfully!');
      }
    } catch (error: any) {
      console.error('Error publishing course:', error);
      toast.error(error?.message || 'Failed to publish course');
    }
  };

  const handleDuplicateCourse = (course: any) => {
    toast.info('Course duplication feature coming soon');
  };

  // Navigation handlers
  const handleViewField = (field: any) => {
    setSelectedField(field);
    setCurrentView('field-detail');
    setSearchTerm(''); // Clear search when navigating
  };

  const handleViewCourse = async (course: any) => {
    setSelectedCourseForDetail(course);
    setCurrentView('course-detail');
    setLoadingLessons(true);
    
    try {
      // Fetch lessons for this course
      const lessonsResponse = await api.lesson.getLessons(course._id || course.id);
      console.log('Lessons response:', lessonsResponse);
      
      // Handle response - BaseApiService auto-extracts data
      const lessons = Array.isArray(lessonsResponse) 
        ? lessonsResponse 
        : (lessonsResponse?.lessons || lessonsResponse?.data?.lessons || []);
      
      setCourseLessons(lessons);
    } catch (error: any) {
      console.error('Error fetching lessons:', error);
      toast.error('Failed to load lessons');
      setCourseLessons([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleViewLesson = (lessonId: string) => {
    // Navigate to lesson view using existing route
    navigate(`/lesson/${lessonId}`);
  };

  const handleBackToFields = () => {
    setCurrentView('fields');
    setSelectedField(null);
    setSelectedCourseForDetail(null);
    setCourseLessons([]);
  };

  const handleBackToField = () => {
    setCurrentView('field-detail');
    setSelectedCourseForDetail(null);
    setCourseLessons([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-orange-100 text-orange-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const CourseCard = ({ course }: { course: any }) => (
    <Card className="hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getStatusColor(course.status)}>
                {course.status}
              </Badge>
              <Badge className={getLevelColor(course.level)}>
                {course.level}
              </Badge>
              {course.fieldName && (
                <Badge variant="outline" className="bg-blue-50 text-blue-800">
                  {course.fieldName}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {course.description}
            </CardDescription>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            {canEditCourse(course._id || course.id, course.fieldId) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingCourse(course);
                  setShowCourseCreator(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <Users className="h-4 w-4 mr-2" />
              {course.students}/{course.maxStudents} students
            </div>
            <div className="flex items-center text-gray-600">
              <BookOpen className="h-4 w-4 mr-2" />
              {course.lessons} lessons
            </div>
            <div className="flex items-center text-gray-600">
              <Target className="h-4 w-4 mr-2" />
              {course.assignments} assignments
            </div>
            <div className="flex items-center text-gray-600">
              <FileText className="h-4 w-4 mr-2" />
              {course.resources} resources
            </div>
          </div>

          {course.status === 'active' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-gray-600">Course Progress</span>
                <span className="text-sm font-medium">{course.progress}%</span>
              </div>
              <Progress value={course.progress} className="h-2" />
            </div>
          )}

          {course.rating > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium ml-1">{course.rating}</span>
              </div>
              <span className="text-sm text-gray-500">({course.reviews} reviews)</span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => {
                const field = accessibleFields.find(f => (f._id || f.id) === course.fieldId);
                if (field) {
                  handleViewField(field);
                }
              }}
              className="flex-1"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Field
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewCourse(course)}
              className="flex-1"
            >
              <BookOpen className="h-3 w-3 mr-1" />
              View Course
            </Button>
            {canEditCourse(course._id || course.id, course.fieldId) && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => {
                  setEditingCourse(course);
                  setShowCourseCreator(true);
                }}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            {canDeleteCourse(course._id || course.id, course.fieldId) && (
              <Button 
                size="sm" 
                variant="outline" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteCourse(course._id || course.id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CourseListItem = ({ course }: { course: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-lg flex items-center justify-center">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{course.title}</h3>
                <Badge className={getStatusColor(course.status)}>
                  {course.status}
                </Badge>
                <Badge className={getLevelColor(course.level)}>
                  {course.level}
                </Badge>
                {course.fieldName && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-800">
                    {course.fieldName}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm line-clamp-1">{course.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {course.students} students
                </span>
                <span className="flex items-center">
                  <BookOpen className="h-3 w-3 mr-1" />
                  {course.lessons} lessons
                </span>
                <span className="flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  {course.lastActivity}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {course.rating > 0 && (
              <div className="flex items-center text-sm">
                <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                {course.rating}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleViewCourse(course)}
              title="View Course"
            >
              <Eye className="h-4 w-4" />
            </Button>
            {canEditCourse(course._id || course.id, course.fieldId) && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setEditingCourse(course);
                  setShowCourseCreator(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDeleteCourse(course._id || course.id, course.fieldId) && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleDeleteCourse(course._id || course.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Breadcrumb navigation
  const renderBreadcrumb = () => {
    const breadcrumbs: Array<{ label: string; onClick: (() => void) | null }> = [
      { label: 'Course Management', onClick: handleBackToFields }
    ];
    
    if (currentView === 'field-detail' && selectedField) {
      breadcrumbs.push({ 
        label: selectedField.name, 
        onClick: null 
      });
    }
    
    if (currentView === 'course-detail' && selectedField && selectedCourseForDetail) {
      breadcrumbs.push({ 
        label: selectedField.name, 
        onClick: handleBackToField 
      });
      breadcrumbs.push({ 
        label: selectedCourseForDetail.title, 
        onClick: null 
      });
    }
    
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            {crumb.onClick ? (
              <button 
                onClick={crumb.onClick}
                className="hover:text-gray-900 transition-colors"
              >
                {crumb.label}
              </button>
            ) : (
              <span className="text-gray-900 font-medium">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600 mt-1">
            {currentView === 'field-detail' && selectedField 
              ? `Courses in ${selectedField.name}` 
              : currentView === 'course-detail' && selectedCourseForDetail
              ? `Lessons in ${selectedCourseForDetail.title}`
              : 'Create, manage, and track your courses'}
          </p>
          {renderBreadcrumb()}
        </div>
        <div className="flex items-center gap-3">
          {accessibleFields.some(f => canCreateCourse(f._id || f.id)) && (
            <Button 
              onClick={() => setShowCourseCreator(true)}
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          )}
        </div>
      </div>

      {/* Conditional Rendering Based on Current View */}
      {currentView === 'fields' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Courses</p>
                    <p className="text-2xl font-bold text-gray-900">{allCourses.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-teal-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Courses</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allCourses.filter(c => c.status === 'active').length}
                    </p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allCourses.reduce((sum, course) => sum + (course.students || 0), 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {allCourses.filter(c => c.rating > 0).length > 0 
                        ? (allCourses.reduce((sum, course) => sum + (course.rating || 0), 0) / allCourses.filter(c => c.rating > 0).length).toFixed(1)
                        : '0.0'
                      }
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={selectedFieldFilter} onValueChange={setSelectedFieldFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  {accessibleFields.map(field => (
                    <SelectItem key={field._id || field.id} value={field._id || field.id}>
                      {field.icon || '📚'} {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowResourceManager(true)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Manage Resources
              </Button>
              
              <div className="flex border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Courses Display */}
          {filteredFields.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by creating your first course.'
                }
              </p>
              {!searchTerm && filterStatus === 'all' && accessibleFields.some(f => canCreateCourse(f._id || f.id)) && (
                <Button 
                  onClick={() => setShowCourseCreator(true)}
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFields.map((field: any) => {
                const fieldId = field._id || field.id;
                const fieldCourses = field.courses || [];
                const filteredFieldCourses = fieldCourses.filter((course: any) => {
                  const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                       course.description.toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
                  return matchesSearch && matchesStatus;
                });

                if (filteredFieldCourses.length === 0) return null;

                return (
                  <div key={fieldId}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 
                          className="text-xl font-bold cursor-pointer hover:text-teal-600 transition-colors"
                          onClick={() => handleViewField(field)}
                        >
                          {field.icon || '📚'} {field.name}
                        </h3>
                        <Badge variant={field.accessType === 'full' ? 'default' : 'secondary'} className={
                          field.accessType === 'full' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                        }>
                          {field.accessType === 'full' ? 'Full Access' : 'Limited Access'}
                        </Badge>
                      </div>
                      {canCreateCourse(fieldId) && (
                        <Button 
                          onClick={() => {
                            setEditingCourse(null);
                            setShowCourseCreator(true);
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Create Course
                        </Button>
                      )}
                    </div>
                    
                    <div className={
                      viewMode === 'grid' 
                        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-4'
                    }>
                      {filteredFieldCourses.map((course: any) => 
                        viewMode === 'grid' 
                          ? <CourseCard key={course._id || course.id} course={course} />
                          : <CourseListItem key={course._id || course.id} course={course} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Field Detail View - Shows Courses */}
      {currentView === 'field-detail' && selectedField && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBackToFields}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to All Fields
            </Button>
            {canCreateCourse(selectedField._id || selectedField.id) && (
              <Button 
                onClick={() => {
                  setEditingCourse(null);
                  setShowCourseCreator(true);
                }}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            )}
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedField.icon || '📚'}</span>
                <div>
                  <CardTitle className="text-2xl">{selectedField.name}</CardTitle>
                  <CardDescription>{selectedField.description || 'Field description'}</CardDescription>
                </div>
                <Badge variant={selectedField.accessType === 'full' ? 'default' : 'secondary'} className={
                  selectedField.accessType === 'full' 
                    ? 'bg-green-100 text-green-800 border-green-300' 
                    : 'bg-yellow-100 text-yellow-800 border-yellow-300'
                }>
                  {selectedField.accessType === 'full' ? 'Full Access' : 'Limited Access'}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedField.courses || []).map((course: any) => (
              <CourseCard key={course._id || course.id} course={course} />
            ))}
          </div>

          {(selectedField.courses || []).length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses in this field</h3>
              {canCreateCourse(selectedField._id || selectedField.id) && (
                <Button 
                  onClick={() => {
                    setEditingCourse(null);
                    setShowCourseCreator(true);
                  }}
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Course
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Course Detail View - Shows Lessons */}
      {currentView === 'course-detail' && selectedCourseForDetail && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleBackToField}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to {selectedField?.name || 'Field'}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{selectedCourseForDetail.title}</CardTitle>
              <CardDescription>{selectedCourseForDetail.description || 'Course description'}</CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <Badge className={getStatusColor(selectedCourseForDetail.status)}>
                  {selectedCourseForDetail.status}
                </Badge>
                <Badge className={getLevelColor(selectedCourseForDetail.level)}>
                  {selectedCourseForDetail.level}
                </Badge>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedCourseForDetail.students || 0} students
                </span>
              </div>
            </CardHeader>
          </Card>

          <div>
            <h3 className="text-lg font-semibold mb-4">Lessons</h3>
            {loadingLessons ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading lessons...</p>
              </div>
            ) : courseLessons.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons found</h3>
                <p className="text-gray-600">This course doesn't have any lessons yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courseLessons.map((lesson: any) => (
                  <Card 
                    key={lesson._id || lesson.id || lesson.lessonId}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => handleViewLesson(lesson._id || lesson.id || lesson.lessonId)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{lesson.title || lesson.name || 'Untitled Lesson'}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">
                            {lesson.description || 'No description'}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {lesson.duration || 'N/A'}
                        </span>
                        <Badge variant={lesson.status === 'published' ? 'default' : 'secondary'}>
                          {lesson.status || 'draft'}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Course Creator Modal */}
      {showCourseCreator && (
        <CourseCreator
          isOpen={showCourseCreator}
          onClose={() => {
            setShowCourseCreator(false);
            setEditingCourse(null);
          }}
          existingCourse={editingCourse}
          onSave={handleCourseCreated}
          availableFields={accessibleFields.filter(f => canCreateCourse(f._id || f.id))}
        />
      )}

      {/* Resource Manager Modal */}
      {showResourceManager && (
        <ResourceManager
          isOpen={showResourceManager}
          onClose={() => setShowResourceManager(false)}
        />
      )}
    </div>
  );
}