import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Link,
  Shield,
  Settings,
  Copy,
  CheckCircle,
  Mail,
  Calendar,
  TrendingUp,
  BookOpen,
  FileText,
  HelpCircle,
  Database,
  Eye,
  Edit,
  Download,
  Filter,
  Search,
  ChevronRight,
  BarChart3,
  Clock,
  Star,
  ArrowUpRight,
  Globe,
  Zap,
  Target,
  Plus,
  GraduationCap,
  PlayCircle,
  FolderOpen,
  ChevronLeft,
  MoreVertical,
  Archive,
  Trash2,
  X,
  Save,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Progress } from '../ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from "sonner";
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';

interface OrganizationProps {
  onNavigateToLesson?: (lesson: any) => void;
}

interface Organization {
  id: number;
  name: string;
  domain: string;
  description: string;
  members: number;
  instructors: number;
  students: number;
  fieldsOfStudy: number;
  totalCourses: number;
  totalLessons: number;
  totalQuizzes: number;
  totalResources: number;
  totalQuestions: number;
  activeLinks: number;
  monthlyGrowth: number;
  createdDate: string;
  status: string;
}

interface Field {
  id: string;
  name: string;
  description: string;
  icon: string;
  courses: number;
  students: number;
  instructors: number;
  lessons: number;
  quizzes: number;
  resources: number;
  questions: number;
  completion: number;
  status: string;
}

interface Course {
  id: string;
  fieldId: string;
  name: string;
  description: string;
  instructor: string;
  students: number;
  lessons: number;
  duration: string;
  difficulty: string;
  completion: number;
  quizzes: number;
  resources: number;
  questions: number;
  status: string;
  thumbnail: string;
  createdDate: string;
  price: number;
}

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  duration: string;
  type: string;
  completed: number;
  resources: number;
  quiz: boolean;
  order: number;
  status: string;
}

export function Organization({ onNavigateToLesson }: OrganizationProps = {}) {
  const { t, isRTL } = useLanguage();
  const [copiedLink, setCopiedLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeView, setActiveView] = useState('overview');
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Data states
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [fieldsOfStudy, setFieldsOfStudy] = useState<Field[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showFieldForm, setShowFieldForm] = useState(false);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  
  // Form data
  const [fieldFormData, setFieldFormData] = useState({
    name: '',
    description: '',
    icon: '📚',
    status: 'active'
  });
  
  const [courseFormData, setCourseFormData] = useState({
    name: '',
    description: '',
    fieldId: '',
    difficulty: 'beginner',
    duration: '',
    price: 0,
    status: 'draft'
  });
  
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    type: 'video',
    duration: '',
    order: 1,
    status: 'draft'
  });

  // Default organization data (fallback)
  const defaultOrganization = {
    id: 1,
    name: 'CogneraX Learn University',
    domain: 'cognerax-learn.edu',
    description: 'Premier AI-powered educational institution',
    members: 0,
    instructors: 0,
    students: 0,
    fieldsOfStudy: 0,
    totalCourses: 0,
    totalLessons: 0,
    totalQuizzes: 0,
    totalResources: 0,
    totalQuestions: 0,
    activeLinks: 0,
    monthlyGrowth: 0,
    createdDate: '2023-01-15',
    status: 'active'
  };

  // Data fetching
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch organization data
      const orgResponse = await api.organization.getOrganizations();
      if (orgResponse && orgResponse.length > 0) {
        setOrganization(orgResponse[0]); // Use first organization
      } else {
        setOrganization(defaultOrganization);
      }

      // Fetch fields of study
      const fieldsResponse = await api.field.getFields();
      if (fieldsResponse) {
        setFieldsOfStudy(fieldsResponse);
      }

      // Fetch courses
      const coursesResponse = await api.course.getCourses();
      if (coursesResponse) {
        setCourses(coursesResponse);
      }

    } catch (error) {
      console.error('Failed to fetch organization data:', error);
      // Use fallback data
      setOrganization(defaultOrganization);
      setFieldsOfStudy([]);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFieldCourses = async (fieldId: string) => {
    try {
      const response = await api.field.getFieldCourses(fieldId);
      if (response) {
        setCourses(response);
      }
    } catch (error) {
      console.error('Failed to fetch field courses:', error);
    }
  };

  const fetchCourseLessons = async (courseId: string) => {
    try {
      const response = await api.lesson.getLessons(courseId);
      if (response) {
        setLessons(response);
      }
    } catch (error) {
      console.error('Failed to fetch course lessons:', error);
    }
  };

  // Form handlers
  const handleCreateField = async () => {
    try {
      const response = await api.field.createField({
        name: fieldFormData.name,
        description: fieldFormData.description,
        organizationId: 'mock-org-id', // This should come from user context
        icon: fieldFormData.icon,
        color: '#3B82F6'
      });
      if (response) {
        toast.success('Field created successfully!');
        setShowFieldForm(false);
        setFieldFormData({ name: '', description: '', icon: '📚', status: 'active' });
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to create field');
      }
    } catch (error) {
      console.error('Error creating field:', error);
      toast.error('Failed to create field');
    }
  };

  const handleUpdateField = async () => {
    if (!editingField) return;
    
    try {
      const response = await api.field.updateField(editingField.id, fieldFormData);
      if (response) {
        toast.success('Field updated successfully!');
        setShowFieldForm(false);
        setEditingField(null);
        setFieldFormData({ name: '', description: '', icon: '📚', status: 'active' });
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to update field');
      }
    } catch (error) {
      console.error('Error updating field:', error);
      toast.error('Failed to update field');
    }
  };

  const handleDeleteField = async (fieldId: string) => {
    if (!confirm('Are you sure you want to delete this field? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.field.deleteField(fieldId);
      if (response) {
        toast.success('Field deleted successfully!');
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to delete field');
      }
    } catch (error) {
      console.error('Error deleting field:', error);
      toast.error('Failed to delete field');
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await api.course.createCourse({
        title: courseFormData.name,
        description: courseFormData.description,
        category: courseFormData.fieldId,
        level: courseFormData.difficulty,
        duration: parseInt(courseFormData.duration),
        price: courseFormData.price,
        isPublic: courseFormData.status === 'published'
      });
      if (response) {
        toast.success('Course created successfully!');
        setShowCourseForm(false);
        setCourseFormData({ 
          name: '', 
          description: '', 
          fieldId: '', 
          difficulty: 'beginner', 
          duration: '', 
          price: 0, 
          status: 'draft' 
        });
        fetchData(); // Refresh data
      } else {
        toast.error('Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleCreateLesson = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await api.lesson.createLesson(selectedCourse.id, {
        title: lessonFormData.title,
        description: lessonFormData.description,
        type: lessonFormData.type as 'video' | 'text' | 'quiz' | 'assignment',
        order: lessonFormData.order,
        duration: parseInt(lessonFormData.duration),
        isPublished: lessonFormData.status === 'published'
      });
      if (response) {
        toast.success('Lesson created successfully!');
        setShowLessonForm(false);
        setLessonFormData({ 
          title: '', 
          description: '', 
      type: 'video',
          duration: '', 
      order: 1,
          status: 'draft' 
        });
        fetchCourseLessons(selectedCourse.id); // Refresh lessons
      } else {
        toast.error('Failed to create lesson');
      }
    } catch (error) {
      console.error('Error creating lesson:', error);
      toast.error('Failed to create lesson');
    }
  };

  const openFieldForm = (field: Field | null = null) => {
    if (field) {
      setEditingField(field);
      setFieldFormData({
        name: field.name,
        description: field.description,
        icon: field.icon || '📚',
        status: field.status
      });
    } else {
      setEditingField(null);
      setFieldFormData({ name: '', description: '', icon: '📚', status: 'active' });
    }
    setShowFieldForm(true);
  };

  const openCourseForm = (course: Course | null = null) => {
    if (course) {
      setEditingCourse(course);
      setCourseFormData({
        name: course.name,
        description: course.description,
        fieldId: course.fieldId || selectedField?.id || '',
        difficulty: course.difficulty,
        duration: course.duration,
        price: course.price || 0,
        status: course.status
      });
    } else {
      setEditingCourse(null);
      setCourseFormData({ 
        name: '', 
        description: '', 
        fieldId: selectedField?.id || '', 
        difficulty: 'beginner', 
        duration: '', 
        price: 0, 
        status: 'draft' 
      });
    }
    setShowCourseForm(true);
  };

  const openLessonForm = (lesson: Lesson | null = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonFormData({
        title: lesson.title,
        description: lesson.description,
        type: lesson.type,
        duration: lesson.duration,
        order: lesson.order,
        status: lesson.status
      });
    } else {
      setEditingLesson(null);
      setLessonFormData({ 
        title: '', 
        description: '', 
      type: 'video',
        duration: '', 
        order: lessons.length + 1, 
      status: 'draft'
      });
    }
    setShowLessonForm(true);
  };

  const copyToClipboard = (link: string, linkId: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(linkId);
    toast("Link copied to clipboard!");
    setTimeout(() => setCopiedLink(''), 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'published': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderBreadcrumb = () => {
    const breadcrumbs = [
      { label: organization?.name || 'Organization', action: () => setActiveView('overview') }
    ];

    if (selectedField) {
      breadcrumbs.push({ 
        label: selectedField.name, 
        action: () => setActiveView('field-details') 
      });
    }

    if (selectedCourse) {
      breadcrumbs.push({ 
        label: selectedCourse.name, 
        action: () => setActiveView('course-details') 
      });
    }

    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <button 
              onClick={crumb.action}
              className="hover:text-teal-600 transition-colors"
            >
              {crumb.label}
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronRight className="h-4 w-4" />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderOverview = () => {
    const orgData = organization || defaultOrganization;
    
    return (
    <div className="space-y-8">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{orgData.name}</h1>
            <p className="text-gray-600 mt-1">{orgData.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {orgData.status}
              </Badge>
              <span className="text-sm text-gray-500">{orgData.domain}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {t('organization.settings')}
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('organization.inviteMembers')}
          </Button>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">{t('organization.totalMembers')}</p>
                <p className="text-3xl font-bold text-blue-900">{orgData.members.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">+{orgData.monthlyGrowth}% this month</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">{t('organization.fieldsOfStudy')}</p>
                <p className="text-3xl font-bold text-green-900">{fieldsOfStudy.length}</p>
                <div className="flex items-center mt-2">
                  <GraduationCap className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">{orgData.totalCourses} courses</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Total Lessons</p>
                <p className="text-3xl font-bold text-purple-900">{orgData.totalLessons.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <PlayCircle className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">{orgData.totalQuizzes} quizzes</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <PlayCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Question Bank</p>
                <p className="text-3xl font-bold text-teal-900">{orgData.totalQuestions.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <Database className="h-4 w-4 text-teal-500 mr-1" />
                  <span className="text-sm font-medium text-teal-600">{orgData.totalResources} resources</span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Database className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fields of Study */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-green-600" />
                Fields of Study
              </CardTitle>
              <CardDescription>Academic disciplines and specializations</CardDescription>
            </div>
            <Button 
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              onClick={() => openFieldForm()}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Loading fields...</span>
            </div>
          ) : fieldsOfStudy.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-500 mb-2">No fields of study yet</p>
              <p className="text-sm text-gray-400 mb-4">Create your first field to organize courses and content</p>
              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={() => openFieldForm()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Field
              </Button>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {fieldsOfStudy.map((field) => (
              <Card key={field.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{field.icon}</div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                            {field.name}
                          </h3>
                          <p className="text-sm text-gray-500">{field.description}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={getStatusColor(field.status)}>
                        {field.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-xl font-bold text-blue-600">{field.courses}</p>
                        <p className="text-xs text-blue-700 font-medium">Courses</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <p className="text-xl font-bold text-green-600">{field.students}</p>
                        <p className="text-xs text-green-700 font-medium">Students</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs text-center">
                      <div className="p-2 bg-purple-50 rounded">
                        <p className="font-bold text-purple-600">{field.lessons}</p>
                        <p className="text-purple-700">Lessons</p>
                      </div>
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="font-bold text-orange-600">{field.quizzes}</p>
                        <p className="text-orange-700">Quizzes</p>
                      </div>
                      <div className="p-2 bg-teal-50 rounded">
                        <p className="font-bold text-teal-600">{field.resources}</p>
                        <p className="text-teal-700">Resources</p>
                      </div>
                      <div className="p-2 bg-indigo-50 rounded">
                        <p className="font-bold text-indigo-600">{field.questions}</p>
                        <p className="text-indigo-700">Questions</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Avg Completion</span>
                        <span className="font-medium">{field.completion}%</span>
                      </div>
                      <Progress value={field.completion} className="h-2" />
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedField(field);
                          setActiveView('field-details');
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedField(field);
                          setActiveView('field-courses');
                        }}
                      >
                        <BookOpen className="h-4 w-4 mr-2" />
                        Courses
                      </Button>
                    </div>
                    
                    <div className="flex space-x-2 pt-2 border-t border-gray-100">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => openFieldForm(field)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteField(field.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
  };

  const renderFieldDetails = () => {
    if (!selectedField) return null;
    
    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{selectedField.icon}</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedField.name}</h1>
            <p className="text-gray-600 mt-1">{selectedField.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Field
          </Button>
          <Button 
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            onClick={() => setActiveView('field-courses')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Courses
          </Button>
        </div>
      </div>

      {/* Field Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Courses</p>
                <p className="text-3xl font-bold text-blue-900">{selectedField.courses}</p>
                <p className="text-sm text-green-600 mt-1">{selectedField.instructors} instructors</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Students Enrolled</p>
                <p className="text-3xl font-bold text-green-900">{selectedField.students}</p>
                <p className="text-sm text-green-600 mt-1">{selectedField.completion}% avg completion</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Learning Content</p>
                <p className="text-3xl font-bold text-purple-900">{selectedField.lessons}</p>
                <p className="text-sm text-purple-600 mt-1">lessons available</p>
              </div>
              <PlayCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Assessments</p>
                <p className="text-3xl font-bold text-teal-900">{selectedField.quizzes}</p>
                <p className="text-sm text-teal-600 mt-1">{selectedField.questions} questions</p>
              </div>
              <HelpCircle className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  };

  const renderFieldCourses = () => {
    if (!selectedField) return null;
    
    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses in {selectedField.name}</h1>
          <p className="text-gray-600 mt-1">Manage and organize course content</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          onClick={() => openCourseForm()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.filter(course => course.fieldId === selectedField.id).map((course) => (
          <Card key={course.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                      {course.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <p className="text-sm text-gray-400 mt-1">by {course.instructor}</p>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold text-blue-600">{course.students}</p>
                    <p className="text-blue-700">Students</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-bold text-green-600">{course.lessons}</p>
                    <p className="text-green-700">Lessons</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-bold text-purple-600">{course.quizzes}</p>
                    <p className="text-purple-700">Quizzes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{course.completion}%</span>
                  </div>
                  <Progress value={course.completion} className="h-2" />
                </div>

                <div className="flex text-xs text-gray-500 space-x-4">
                  <span>Duration: {course.duration}</span>
                  <span>Created: {new Date(course.createdDate).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveView('course-details');
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => {
                      setSelectedCourse(course);
                      setActiveView('course-content');
                    }}
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
  };

  const renderCourseDetails = () => {
    if (!selectedCourse) return null;
    
    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.name}</h1>
          <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className={getDifficultyColor(selectedCourse.difficulty)}>
              {selectedCourse.difficulty}
            </Badge>
            <Badge variant="outline" className={getStatusColor(selectedCourse.status)}>
              {selectedCourse.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
          <Button 
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            onClick={() => setActiveView('course-content')}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Manage Content
          </Button>
        </div>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Students Enrolled</p>
                <p className="text-3xl font-bold text-blue-900">{selectedCourse.students}</p>
                <p className="text-sm text-green-600 mt-1">{selectedCourse.completion}% completion</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">Lessons</p>
                <p className="text-3xl font-bold text-green-900">{selectedCourse.lessons}</p>
                <p className="text-sm text-green-600 mt-1">{selectedCourse.duration} duration</p>
              </div>
              <PlayCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">Quizzes</p>
                <p className="text-3xl font-bold text-purple-900">{selectedCourse.quizzes}</p>
                <p className="text-sm text-purple-600 mt-1">{selectedCourse.questions} questions</p>
              </div>
              <HelpCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 to-cyan-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-teal-600 mb-1">Resources</p>
                <p className="text-3xl font-bold text-teal-900">{selectedCourse.resources}</p>
                <p className="text-sm text-teal-600 mt-1">files available</p>
              </div>
              <FileText className="h-8 w-8 text-teal-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
  };

  const renderCourseContent = () => {
    if (!selectedCourse) return null;
    
    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.name} - Content</h1>
          <p className="text-gray-600 mt-1">Lessons, resources, quizzes, and questions</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          onClick={() => openLessonForm()}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Content
        </Button>
      </div>

      <Tabs defaultValue="lessons" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlayCircle className="h-5 w-5 mr-2 text-green-600" />
                Course Lessons
              </CardTitle>
              <CardDescription>Manage lesson content and structure</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lessons.filter(lesson => lesson.courseId === selectedCourse.id).map((lesson) => (
                  <Card key={lesson.id} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold">{lesson.order}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">{lesson.description}</p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              <span>Duration: {lesson.duration}</span>
                              <span>Type: {lesson.type}</span>
                              <span>Resources: {lesson.resources}</span>
                              {lesson.quiz && <span>Has Quiz</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getStatusColor(lesson.status)}>
                            {lesson.status}
                          </Badge>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{lesson.completed}%</p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-teal-600" />
                Course Resources
              </CardTitle>
              <CardDescription>Learning materials and downloadable content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No resources uploaded yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quizzes" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-purple-600" />
                Course Quizzes
              </CardTitle>
              <CardDescription>Assessments and knowledge checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No quizzes created yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Quiz
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-orange-600" />
                Question Bank
              </CardTitle>
              <CardDescription>Question library for this course</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No questions in the bank yet</p>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
    );
  };

  // Form components
  const renderFieldForm = () => (
    <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingField ? 'Edit Field' : 'Create New Field'}
          </DialogTitle>
          <DialogDescription>
            {editingField ? 'Update field information' : 'Add a new field of study to organize courses'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="field-name">Field Name</Label>
            <Input
              id="field-name"
              value={fieldFormData.name}
              onChange={(e) => setFieldFormData({...fieldFormData, name: e.target.value})}
              placeholder="e.g., Computer Science"
            />
          </div>
          
          <div>
            <Label htmlFor="field-description">Description</Label>
            <Textarea
              id="field-description"
              value={fieldFormData.description}
              onChange={(e) => setFieldFormData({...fieldFormData, description: e.target.value})}
              placeholder="Brief description of the field"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field-icon">Icon</Label>
              <Input
                id="field-icon"
                value={fieldFormData.icon}
                onChange={(e) => setFieldFormData({...fieldFormData, icon: e.target.value})}
                placeholder="📚"
                maxLength={2}
              />
            </div>
            
            <div>
              <Label htmlFor="field-status">Status</Label>
              <Select 
                value={fieldFormData.status} 
                onValueChange={(value: string) => setFieldFormData({...fieldFormData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowFieldForm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={editingField ? handleUpdateField : handleCreateField}
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingField ? 'Update Field' : 'Create Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderCourseForm = () => (
    <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {editingCourse ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
          <DialogDescription>
            {editingCourse ? 'Update course information' : 'Add a new course to the selected field'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="course-name">Course Name</Label>
            <Input
              id="course-name"
              value={courseFormData.name}
              onChange={(e) => setCourseFormData({...courseFormData, name: e.target.value})}
              placeholder="e.g., React Fundamentals"
            />
          </div>
          
          <div>
            <Label htmlFor="course-description">Description</Label>
            <Textarea
              id="course-description"
              value={courseFormData.description}
              onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
              placeholder="Course description and learning objectives"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course-difficulty">Difficulty</Label>
              <Select 
                value={courseFormData.difficulty} 
                onValueChange={(value: string) => setCourseFormData({...courseFormData, difficulty: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="course-duration">Duration</Label>
              <Input
                id="course-duration"
                value={courseFormData.duration}
                onChange={(e) => setCourseFormData({...courseFormData, duration: e.target.value})}
                placeholder="e.g., 8 weeks"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course-price">Price ($)</Label>
              <Input
                id="course-price"
                type="number"
                value={courseFormData.price}
                onChange={(e) => setCourseFormData({...courseFormData, price: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
            
            <div>
              <Label htmlFor="course-status">Status</Label>
              <Select 
                value={courseFormData.status} 
                onValueChange={(value: string) => setCourseFormData({...courseFormData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowCourseForm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateCourse}
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingCourse ? 'Update Course' : 'Create Course'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderLessonForm = () => (
    <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
          <DialogDescription>
            {editingLesson ? 'Update lesson information' : 'Add a new lesson to the course'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="lesson-title">Lesson Title</Label>
            <Input
              id="lesson-title"
              value={lessonFormData.title}
              onChange={(e) => setLessonFormData({...lessonFormData, title: e.target.value})}
              placeholder="e.g., Introduction to React"
            />
          </div>
          
          <div>
            <Label htmlFor="lesson-description">Description</Label>
            <Textarea
              id="lesson-description"
              value={lessonFormData.description}
              onChange={(e) => setLessonFormData({...lessonFormData, description: e.target.value})}
              placeholder="Lesson description and objectives"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lesson-type">Type</Label>
              <Select 
                value={lessonFormData.type} 
                onValueChange={(value: string) => setLessonFormData({...lessonFormData, type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="lesson-duration">Duration</Label>
              <Input
                id="lesson-duration"
                value={lessonFormData.duration}
                onChange={(e) => setLessonFormData({...lessonFormData, duration: e.target.value})}
                placeholder="e.g., 45 min"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lesson-order">Order</Label>
              <Input
                id="lesson-order"
                type="number"
                value={lessonFormData.order}
                onChange={(e) => setLessonFormData({...lessonFormData, order: parseInt(e.target.value) || 1})}
                placeholder="1"
              />
            </div>
            
            <div>
              <Label htmlFor="lesson-status">Status</Label>
              <Select 
                value={lessonFormData.status} 
                onValueChange={(value: string) => setLessonFormData({...lessonFormData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowLessonForm(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreateLesson}
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {editingLesson ? 'Update Lesson' : 'Create Lesson'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {activeView === 'overview' && renderOverview()}
      {activeView === 'field-details' && renderFieldDetails()}
      {activeView === 'field-courses' && renderFieldCourses()}
      {activeView === 'course-details' && renderCourseDetails()}
      {activeView === 'course-content' && renderCourseContent()}
      
      {/* Forms */}
      {renderFieldForm()}
      {renderCourseForm()}
      {renderLessonForm()}
    </div>
  );
}