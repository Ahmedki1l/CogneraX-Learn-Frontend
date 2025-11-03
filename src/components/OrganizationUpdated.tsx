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
  ExternalLink,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from "sonner";
import { api } from '../services/api';
import { PdfViewer } from './shared/PdfViewer';

interface OrganizationProps {
  onNavigateToLesson?: (lesson: any) => void;
}

interface Organization {
  id?: number;
  _id?: string;
  name: string;
  domain?: string;
  description?: string;
  members?: number;
  memberCount?: number;
  instructors?: any[];
  students?: any[];
  fieldsOfStudy?: number;
  fields?: any[];
  totalCourses?: number;
  totalLessons?: number;
  totalQuizzes?: number;
  totalResources?: number;
  totalQuestions?: number;
  activeLinks?: number;
  monthlyGrowth?: number;
  createdDate?: string;
  createdAt?: string;
  status: string;
  stats?: {
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    totalRevenue: number;
    storageUsedGB: number;
    totalLessons?: number;
    totalQuizzes?: number;
    totalQuestions?: number;
    totalResources?: number;
    monthlyGrowth?: number;
  };
  settings?: {
    allowPublicCourses: boolean;
    requireApproval: boolean;
    enableSSO: boolean;
    maxStorageGB: number;
    aiCreditsPool: number;
  };
  subscription?: {
    plan: string;
    status: string;
    maxUsers: number;
    features: string[];
    startDate: string;
  };
}

interface Field {
  id: string;
  _id?: string;
  name: string;
  description: string;
  icon?: string;
  courses?: number;
  students?: number;
  instructors?: any[];
  lessons?: number;
  quizzes?: number;
  resources?: number;
  questions?: number;
  completion?: number;
  status?: string;
}

interface Course {
  id?: string;
  _id?: string;
  fieldId?: string;
  field?: string;
  name?: string;
  title?: string;
  description: string;
  category?: string;
  instructor?: {
    _id: string;
    name: string;
    avatar?: string;
    avatarUrl?: string;
    id: string;
  };
  students?: number;
  studentsCount?: number;
  lessons?: number;
  lessonsCount?: number;
  duration?: string | number;
  difficulty?: string;
  level?: string;
  completion?: number;
  completionRate?: number;
  quizzes?: number;
  resources?: number;
  questions?: number;
  status: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  createdDate?: string;
  createdAt?: string;
  price: number;
  rating?: number;
  ratingsCount?: number;
}

interface Lesson {
  id?: string;
  _id?: string;
  courseId?: string;
  title: string;
  description?: string;
  content?: string;
  order?: number;
  video?: {
    url: string;
    title?: string;
    description?: string;
    duration?: number; // seconds
    thumbnail?: string;
    transcript?: string;
    subtitles?: Array<{
      language: string;
      url: string;
    }>;
  };
  quizzes?: string[]; // Array of quiz IDs
  resources?: Array<{
    title: string;
    type: string;
    url: string;
    size?: number; // bytes
    description?: string;
    isDownloadable?: boolean;
    uploadedAt?: string;
  }>;
  isPreview?: boolean;
  isStarter?: boolean; // Added based on error message
  estimatedTime?: number; // minutes
  views?: number;
  completionRate?: number;
  contentSummary?: {
    hasContent: boolean;
    hasText: boolean;
    hasVideo: boolean;
    hasResources: boolean;
    hasQuizzes: boolean;
    resourceCount: number;
    quizCount: number;
    estimatedDuration: number;
    videoDuration?: number;
  };
  availableQuizzes?: Array<{
    _id: string;
    title: string;
    description?: string;
    questionsCount: number;
    duration: number;
    type: string;
  }>;
  assignedQuizzes?: Array<{
    _id: string;
    title: string;
    description?: string;
    questionsCount: number;
    duration: number;
    type: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
  // Legacy fields for backward compatibility
  duration?: string;
  type?: string;
  completed?: number;
  quiz?: boolean;
  status?: string;
  course?: string;
  instructor?: {
    name: string;
    avatar: string;
    title: string;
    rating: number;
  };
  difficulty?: string;
  totalLessons?: number;
  estimatedTimeString?: string;
  lastUpdated?: string;
  likes?: number;
  tags?: string[];
  learningObjectives?: string[];
}

export function Organization({ onNavigateToLesson }: OrganizationProps = {}) {
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
  
  // Instructor assignment state
  const [showInstructorAssignment, setShowInstructorAssignment] = useState(false);
  const [selectedFieldForInstructors, setSelectedFieldForInstructors] = useState<Field | null>(null);
  const [availableInstructors, setAvailableInstructors] = useState<any[]>([]);
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  
  const [courseFormData, setCourseFormData] = useState({
    title: '',
    description: '',
    fieldId: '',
    category: '',
    difficulty: 'beginner',
    duration: '',
    price: 0,
    status: 'draft'
  });
  
  const [lessonFormData, setLessonFormData] = useState({
    title: '',
    description: '',
    content: '',
    courseId: '',
    order: 1,
    estimatedTime: 30,
    isPreview: false,
    video: {
      url: '',
      title: '',
      description: '',
      duration: 0,
      thumbnail: '',
      transcript: ''
    },
    resources: [] as Array<{
      title: string;
      type: string;
      url: string;
      size?: number;
      description?: string;
      isDownloadable: boolean;
    }>,
    quizzes: [] as string[],
    status: 'draft'
  });

  // Upload state
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingResources, setUploadingResources] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resourceFiles, setResourceFiles] = useState<File[]>([]);
  const [resourceMetadata, setResourceMetadata] = useState<Array<{
    title: string;
    description: string;
    isDownloadable: boolean;
  }>>([]);

  // PDF viewer state
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Get current user to determine organization
      const userResponse = await api.getMe();
      if (!userResponse?.organization) {
        toast.error('Unable to determine organization');
        return;
      }

      const orgId = (userResponse as any).organization._id || (userResponse as any).organizationId;

      // Load organization data
      const orgResponse = await api.organization.getOrganization(orgId);
      if (orgResponse) {
        setOrganization(orgResponse);
      }

      // Load fields of study for the organization
      const fieldsResponse = await api.field.getFields(orgId);
      if (fieldsResponse) {
        setFieldsOfStudy(fieldsResponse);
      }

      // Load available instructors for the organization
      if (orgResponse.success && orgResponse.data?.instructors) {
        // If instructors array contains IDs, we need to fetch instructor details
        if (orgResponse.data.instructors.length > 0 && typeof orgResponse.data.instructors[0] === 'string') {
          // TODO: Fetch instructor details from user endpoints
          setAvailableInstructors([]);
        } else {
          setAvailableInstructors(orgResponse.data.instructors);
        }
      } else {
        setAvailableInstructors([]);
      }

      // Load courses for the organization
      const coursesResponse = await api.getCourses({ orgId });
      if (coursesResponse.success) {
        setCourses(coursesResponse.data);
      }

      // Load lessons (need to get lessons for all courses)
      const allLessons: Lesson[] = [];
      if (coursesResponse.success && coursesResponse.data) {
        for (const course of coursesResponse.data) {
          try {
            const courseId = course.id || course._id;
            if (!courseId) {
              console.warn('Course missing ID:', course);
              continue;
            }
            
            const lessonsResponse = await api.lesson.getLessons(courseId);
            if (lessonsResponse) {
              
              // Ensure each lesson has the courseId property and is a valid object
              const lessonsWithCourseId = lessonsResponse.map((lesson: any) => {
                
                // Validate lesson object
                if (!lesson || typeof lesson !== 'object') {
                  console.error('Invalid lesson object found:', lesson);
                  return null;
                }
                
                // Ensure required properties exist
                const validLesson = {
                  id: lesson.id || lesson._id || '',
                  _id: lesson._id || lesson.id || '',
                  courseId: courseId,
                  title: lesson.title || 'Untitled Lesson',
                  description: lesson.description || '',
                  order: lesson.order || 1,
                  estimatedTime: lesson.estimatedTime || 30,
                  views: lesson.views || 0,
                  completionRate: lesson.completionRate || 0,
                  isPreview: lesson.isPreview || false,
                  status: lesson.status || 'draft',
                  video: lesson.video || null,
                  resources: lesson.resources || [],
                  quizzes: lesson.quizzes || [],
                  content: lesson.content || '',
                  createdAt: lesson.createdAt || '',
                  updatedAt: lesson.updatedAt || ''
                };
                
                return validLesson;
              }).filter(Boolean); // Remove null entries
              
              allLessons.push(...lessonsWithCourseId);
            }
          } catch (error) {
            console.error(`Failed to load lessons for course ${course.id || course._id}:`, error);
          }
        }
      }
      setLessons(allLessons);
    } catch (error) {
      console.error('Failed to load organization data:', error);
      toast.error('Failed to load organization data');
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleFieldSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get current user to determine organization
      const userResponse = await api.getMe();
      if (!userResponse?.organization) {
        toast.error('Unable to determine organization');
        return;
      }

      const orgId = (userResponse as any).organization._id || (userResponse as any).organizationId;

      if (editingField) {
        const response = await api.field.updateField(editingField.id, {
          ...fieldFormData
        });
        if (response) {
          toast.success('Field updated successfully!');
          setShowFieldForm(false);
          setEditingField(null);
          loadData();
        }
      } else {
        const response = await api.field.createField({
          ...fieldFormData,
          organizationId: orgId
        });
        if (response) {
          toast.success('Field created successfully!');
          setShowFieldForm(false);
          loadData();
        }
      }
    } catch (error: any) {
      console.error('Field operation failed:', error);
      toast.error(error?.error?.message || 'Failed to save field');
    }
  };

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Get current user to determine organization
      const userResponse = await api.getMe();
      if (!userResponse?.organization) {
        toast.error('Unable to determine organization');
        return;
      }

      const orgId = (userResponse as any).organization._id || (userResponse as any).organizationId;

      if (editingCourse) {
        const response = await api.course.updateCourse(editingCourse.id || editingCourse._id || '', {
          title: courseFormData.title,
          description: courseFormData.description,
          category: courseFormData.category,
          level: courseFormData.difficulty,
          duration: parseInt(courseFormData.duration),
          price: courseFormData.price,
          isPublic: courseFormData.status === 'published'
        });
        if (response) {
          toast.success('Course updated successfully!');
          setShowCourseForm(false);
          setEditingCourse(null);
          loadData();
        }
      } else {
        const response = await api.course.createCourse({
          title: courseFormData.title,
          description: courseFormData.description,
          category: courseFormData.category,
          level: courseFormData.difficulty,
          duration: parseInt(courseFormData.duration),
          price: courseFormData.price,
          isPublic: courseFormData.status === 'published'
        });
        if (response) {
          toast.success('Course created successfully!');
          setShowCourseForm(false);
          loadData();
        }
      }
    } catch (error: any) {
      console.error('Course operation failed:', error);
      toast.error(error?.error?.message || 'Failed to save course');
    }
  };

  const handleLessonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!selectedCourse?.id) {
        toast.error('Please select a course first');
        return;
      }

      // Check if there are pending resource uploads
      if (resourceFiles.length > 0) {
        toast.error('Please upload all selected resources before saving the lesson');
        return;
      }

      // Filter out resources without URLs (incomplete uploads)
      const validResources = lessonFormData.resources.filter(resource => resource.url && resource.url.trim() !== '');
      
      // Prepare lesson data with only valid resources
      const lessonData = {
        title: lessonFormData.title,
        description: lessonFormData.description,
        content: lessonFormData.content,
        type: 'video' as 'video' | 'text' | 'quiz' | 'assignment',
        order: lessonFormData.order,
        duration: lessonFormData.estimatedTime,
        isPublished: lessonFormData.status === 'published',
        resources: validResources
      };

      if (editingLesson) {
        const response = await api.lesson.updateLesson(editingLesson.id || editingLesson._id || '', lessonData);
        if (response) {
          toast.success('Lesson updated successfully!');
          setShowLessonForm(false);
          setEditingLesson(null);
          loadData();
        }
      } else {
        const response = await api.lesson.createLesson(selectedCourse.id, lessonData);
        if (response) {
          toast.success('Lesson created successfully!');
          setShowLessonForm(false);
          loadData();
        }
      }
    } catch (error: any) {
      console.error('Lesson operation failed:', error);
      toast.error(error?.error?.message || 'Failed to save lesson');
    }
  };

  const handleEditField = (field: Field) => {
    setEditingField(field);
    setFieldFormData({
      name: field.name,
      description: field.description,
      icon: field.icon || '📚',
      status: field.status || 'active'
    });
    setShowFieldForm(true);
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setCourseFormData({
      title: course.name || course.title || '',
      description: course.description,
      fieldId: course.fieldId || '',
      category: course.category || '',
      difficulty: course.difficulty || 'beginner',
      duration: course.duration ? String(course.duration) : '',
      price: course.price || 0,
      status: course.status || 'draft'
    });
    setShowCourseForm(true);
  };

  const handleEditLesson = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setLessonFormData({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      courseId: lesson.courseId || selectedCourse?.id || selectedCourse?._id || '',
      order: lesson.order || 1,
      estimatedTime: lesson.estimatedTime || 30,
      isPreview: lesson.isPreview || false,
      video: lesson.video ? {
        url: lesson.video.url || '',
        title: lesson.video.title || '',
        description: lesson.video.description || '',
        duration: lesson.video.duration || 0,
        thumbnail: lesson.video.thumbnail || '',
        transcript: lesson.video.transcript || ''
      } : {
        url: '',
        title: '',
        description: '',
        duration: 0,
      thumbnail: '',
        transcript: ''
      },
      resources: lesson.resources ? lesson.resources.map(resource => ({
        title: resource.title,
        type: resource.type,
        url: resource.url,
        size: resource.size,
        description: resource.description,
        isDownloadable: resource.isDownloadable || true
      })) : [],
      quizzes: lesson.quizzes || [],
      status: lesson.status || 'draft'
    });
    setShowLessonForm(true);
  };

  const handleDeleteField = async (fieldId: string) => {
    if (window.confirm('Are you sure you want to delete this field?')) {
      try {
        const response = await api.field.deleteField(fieldId);
        if (response) {
          toast.success('Field deleted successfully!');
          loadData();
        }
      } catch (error: any) {
        console.error('Delete field failed:', error);
        toast.error(error?.error?.message || 'Failed to delete field');
      }
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      try {
        await api.course.deleteCourse(courseId);
        toast.success('Course deleted successfully!');
        loadData();
      } catch (error: any) {
        console.error('Delete course failed:', error);
        toast.error(error?.error?.message || 'Failed to delete course');
      }
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (window.confirm('Are you sure you want to delete this lesson?')) {
      try {
        const response = await api.lesson.deleteLesson(lessonId);
        if (response) {
          toast.success('Lesson deleted successfully!');
          loadData();
        }
      } catch (error: any) {
        console.error('Delete lesson failed:', error);
        toast.error(error?.error?.message || 'Failed to delete lesson');
      }
    }
  };

  // Video upload handler
  const handleVideoUpload = async (file: File) => {
    setUploadingVideo(true);
    try {
      const response = await api.upload.uploadVideo(file, {
        folder: 'videos',
        public: true,
        generateThumbnail: true
      });

      if (response.success && response.data) {
        
        // Get the URL and ensure it uses the correct backend URL
        let videoUrl = response.data.fullUrl || response.data.fileUrl;
        
        // Get the backend base URL
        const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';
        const backendBaseUrl = apiBaseUrl.replace('/api/v1', ''); // e.g., http://localhost:5000
        
        // Fix URL to use correct backend port (5000 instead of 5173)
        if (videoUrl && videoUrl.startsWith('http')) {
          try {
            const urlObj = new URL(videoUrl);
            // Replace wrong port with correct backend port
            if (urlObj.port === '5173' || urlObj.hostname === 'localhost' && urlObj.port !== '5000') {
              const path = urlObj.pathname + urlObj.search;
              videoUrl = `${backendBaseUrl}${path}`;
            }
          } catch (error) {
            console.error('Error parsing video URL:', error);
            // If URL parsing fails, try to fix it manually
            videoUrl = videoUrl.replace(':5173', ':5000');
          }
        } else if (videoUrl && !videoUrl.startsWith('http')) {
          // If the URL is relative, construct full URL with backend domain
          videoUrl = `${backendBaseUrl}${videoUrl.startsWith('/') ? '' : '/'}${videoUrl}`;
        }
        
        setLessonFormData(prev => ({
          ...prev,
          video: {
            ...prev.video,
            url: videoUrl,
            title: response.data.title || response.data.originalName || prev.video.title,
            duration: response.data.duration || 0,
            thumbnail: response.data.thumbnail || ''
          }
        }));
        toast.success('Video uploaded successfully');
      } else {
        toast.error(response.error?.message || 'Failed to upload video');
      }
    } catch (error: any) {
      console.error('Video upload failed:', error);
      toast.error(error?.error?.message || 'Failed to upload video');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Helper function to map MIME type to enum value
  const getResourceTypeFromMime = (mimeType: string): string => {
    const mimeToType: { [key: string]: string } = {
      'application/pdf': 'pdf',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-powerpoint': 'ppt',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'text/plain': 'txt',
      'image/jpeg': 'image',
      'image/jpg': 'image',
      'image/png': 'image',
      'image/gif': 'image',
      'image/webp': 'image',
      'video/mp4': 'video',
      'video/webm': 'video',
      'video/avi': 'video',
      'audio/mp3': 'audio',
      'audio/wav': 'audio',
      'audio/ogg': 'audio',
      'text/html': 'code',
      'text/css': 'code',
      'text/javascript': 'code',
      'application/json': 'code',
      'application/xml': 'code'
    };
    
    return mimeToType[mimeType] || 'other';
  };

  // Resource upload handler
  const handleResourceUpload = async (file: File, index: number) => {
    setUploadingResources(true);
    try {
      const metadata = resourceMetadata[index] || { title: file.name, description: '', isDownloadable: true };
      const response = await api.upload.uploadResource(file, 'lesson-resource');

      if (response.success && response.data) {
        
        const mimeType = response.data.mimeType || file.type;
        
        // Get the URL and ensure it uses the correct backend URL
        let resourceUrl = response.data.fullUrl || response.data.fileUrl;
        
        // Get the backend base URL
        const apiBaseUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api/v1';
        const backendBaseUrl = apiBaseUrl.replace('/api/v1', ''); // e.g., http://localhost:5000
        
        // Fix URL to use correct backend port (5000 instead of 5173)
        if (resourceUrl && resourceUrl.startsWith('http')) {
          try {
            const urlObj = new URL(resourceUrl);
            // Replace wrong port with correct backend port
            if (urlObj.port === '5173' || urlObj.hostname === 'localhost' && urlObj.port !== '5000') {
              const path = urlObj.pathname + urlObj.search;
              resourceUrl = `${backendBaseUrl}${path}`;
            }
          } catch (error) {
            console.error('Error parsing URL:', error);
            // If URL parsing fails, try to fix it manually
            resourceUrl = resourceUrl.replace(':5173', ':5000');
          }
        } else if (resourceUrl && !resourceUrl.startsWith('http')) {
          // If the URL is relative, construct full URL with backend domain
          resourceUrl = `${backendBaseUrl}${resourceUrl.startsWith('/') ? '' : '/'}${resourceUrl}`;
        }
        
        const newResource = {
          title: response.data.title || response.data.originalName || file.name,
          type: getResourceTypeFromMime(mimeType),
          url: resourceUrl,
          size: response.data.fileSize || file.size,
          description: response.data.description || metadata.description,
          isDownloadable: metadata.isDownloadable
        };

        setLessonFormData(prev => ({
          ...prev,
          resources: [...prev.resources, newResource]
        }));

        // Remove uploaded file from pending list
        setResourceFiles(prev => prev.filter((_, i) => i !== index));
        setResourceMetadata(prev => prev.filter((_, i) => i !== index));

        toast.success('Resource uploaded successfully');
      } else {
        toast.error(response.error?.message || 'Failed to upload resource');
      }
    } catch (error: any) {
      console.error('Resource upload failed:', error);
      toast.error(error?.error?.message || 'Failed to upload resource');
    } finally {
      setUploadingResources(false);
    }
  };

  // Remove resource handler
  const handleRemoveResource = (index: number) => {
    setLessonFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  // Add resource file handler
  const handleAddResourceFile = (file: File) => {
    setResourceFiles(prev => [...prev, file]);
    setResourceMetadata(prev => [...prev, { title: file.name, description: '', isDownloadable: true }]);
  };

  // Update resource metadata handler
  const handleUpdateResourceMetadata = (index: number, field: string, value: string | boolean) => {
    setResourceMetadata(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  // PDF viewer handlers
  const handleOpenPdfViewer = (resource: any) => {
    setSelectedResource(resource);
    setShowPdfViewer(true);
  };

  const handleClosePdfViewer = () => {
    setShowPdfViewer(false);
    setSelectedResource(null);
  };

  // Download resource handler (for non-PDF files)
  const handleDownloadResource = async (resource: any) => {
    try {
      const response = await fetch(resource.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = resource.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Resource downloaded successfully');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download resource');
    }
  };

  // Instructor assignment handlers
  const handleAssignInstructors = (field: Field) => {
    setSelectedFieldForInstructors(field);
    setSelectedInstructors(
      Array.isArray(field.instructors) 
        ? field.instructors.map((inst: any) => inst._id || inst.id) 
        : []
    );
    setShowInstructorAssignment(true);
  };

  const handleInstructorAssignmentSubmit = async () => {
    if (!selectedFieldForInstructors) return;

    try {
      const response = await api.field.assignInstructorsToField(
        selectedFieldForInstructors.id,
        selectedInstructors
      );
      
      if (response.success) {
        toast.success('Instructors assigned successfully!');
        setShowInstructorAssignment(false);
        setSelectedFieldForInstructors(null);
        loadData();
      }
    } catch (error: any) {
      console.error('Instructor assignment failed:', error);
      toast.error(error?.error?.message || 'Failed to assign instructors');
    }
  };

  const handleRemoveInstructors = async () => {
    if (!selectedFieldForInstructors) return;

    try {
      const response = await api.field.removeInstructorsFromField(
        selectedFieldForInstructors.id,
        selectedInstructors
      );
      
      if (response.success) {
        toast.success('Instructors removed successfully!');
        setShowInstructorAssignment(false);
        setSelectedFieldForInstructors(null);
        loadData();
      }
    } catch (error: any) {
      console.error('Instructor removal failed:', error);
      toast.error(error?.error?.message || 'Failed to remove instructors');
    }
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
        label: selectedCourse.title || selectedCourse.name || 'Course', 
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-teal-600" />
            <p className="text-gray-600">Loading organization data...</p>
          </div>
        </div>
      );
    }

    if (!organization) {
      return (
        <div className="text-center py-12">
          <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Organization Data</h3>
          <p className="text-gray-500">Unable to load organization information.</p>
        </div>
      );
    }

    return (
    <div className="space-y-8">
      {/* Organization Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
            <p className="text-gray-600 mt-1">{organization.description}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {organization.status}
              </Badge>
              <span className="text-sm text-gray-500">{organization.domain || organization.name}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Organization Settings
          </Button>
          <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
        </div>
      </div>

      {/* Organization Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-blue-900">{organization.memberCount?.toLocaleString() || organization.members?.toLocaleString() || '0'}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">+{organization.stats?.monthlyGrowth || organization.monthlyGrowth || '0'}% this month</span>
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
                <p className="text-sm font-medium text-green-600 mb-1">Fields of Study</p>
                <p className="text-3xl font-bold text-green-900">{organization.fields?.length || organization.fieldsOfStudy || '0'}</p>
                <div className="flex items-center mt-2">
                  <GraduationCap className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">{organization.stats?.totalCourses || organization.totalCourses || '0'} courses</span>
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
                <p className="text-3xl font-bold text-purple-900">{organization.stats?.totalLessons || organization.totalLessons || '0'}</p>
                <div className="flex items-center mt-2">
                  <PlayCircle className="h-4 w-4 text-purple-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">{organization.stats?.totalQuizzes || organization.totalQuizzes || '0'} quizzes</span>
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
                <p className="text-3xl font-bold text-teal-900">{organization.stats?.totalQuestions || organization.totalQuestions || '0'}</p>
                <div className="flex items-center mt-2">
                  <Database className="h-4 w-4 text-teal-500 mr-1" />
                  <span className="text-sm font-medium text-teal-600">{organization.stats?.totalResources || organization.totalResources || '0'} resources</span>
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
                onClick={() => {
                  setEditingField(null);
                  setFieldFormData({ name: '', description: '', icon: '📚', status: 'active' });
                  setShowFieldForm(true);
                }}
              >
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            {fieldsOfStudy.length === 0 ? (
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No fields of study created yet</p>
                <Button 
                  className="bg-gradient-to-r from-teal-500 to-purple-600"
                  onClick={() => {
                    setEditingField(null);
                    setFieldFormData({ name: '', description: '', icon: '📚', status: 'active' });
                    setShowFieldForm(true);
                  }}
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
                      <Badge variant="outline" className={getStatusColor(field.status || 'active')}>
                        {field.status || 'active'}
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
                        onClick={() => handleEditField(field)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handleAssignInstructors(field)}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Instructors
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
    if (!selectedField) {
      return (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Selected</h3>
          <p className="text-gray-500">Please select a field to view details.</p>
        </div>
      );
    }

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
    if (!selectedField) {
      return (
        <div className="text-center py-12">
          <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Field Selected</h3>
          <p className="text-gray-500">Please select a field to view courses.</p>
        </div>
      );
    }

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
          onClick={() => {
            setEditingCourse(null);
            setCourseFormData({ 
              title: '', 
              description: '', 
              fieldId: selectedField._id || selectedField.id, 
              category: '',
              difficulty: 'beginner', 
              duration: '', 
              price: 0, 
              status: 'draft' 
            });
            setShowCourseForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Course
        </Button>
      </div>

      {courses.filter(course => (course.fieldId === selectedField.id || course.field === selectedField.id || course.field === selectedField._id)).length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No courses created in this field yet</p>
          <Button 
            className="bg-gradient-to-r from-teal-500 to-purple-600"
            onClick={() => {
              setEditingCourse(null);
              setCourseFormData({ 
                title: '', 
                description: '', 
                fieldId: selectedField._id || selectedField.id, 
                category: '',
                difficulty: 'beginner', 
                duration: '', 
                price: 0, 
                status: 'draft' 
              });
              setShowCourseForm(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create First Course
          </Button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.filter(course => (course.fieldId === selectedField.id || course.field === selectedField.id || course.field === selectedField._id)).map((course) => (
          <Card key={course.id} className="border border-gray-200 hover:shadow-lg transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 group-hover:text-teal-600 transition-colors">
                      {course.title || course.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                    <p className="text-sm text-gray-400 mt-1">by {course.instructor?.name || 'Unknown Instructor'}</p>
                  </div>
                  <Badge variant="outline" className={getDifficultyColor(course.difficulty || course.level || 'beginner')}>
                    {course.difficulty || course.level || 'beginner'}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <p className="font-bold text-blue-600">{Array.isArray(course.students) ? course.students.length : (course.studentsCount || 0)}</p>
                    <p className="text-blue-700">Students</p>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <p className="font-bold text-green-600">{Array.isArray(course.lessons) ? course.lessons.length : (course.lessonsCount || 0)}</p>
                    <p className="text-green-700">Lessons</p>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <p className="font-bold text-purple-600">{Array.isArray(course.quizzes) ? course.quizzes.length : (course.quizzes || 0)}</p>
                    <p className="text-purple-700">Quizzes</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium">{course.completion || course.completionRate || 0}%</span>
                  </div>
                  <Progress value={course.completion || course.completionRate || 0} className="h-2" />
                </div>

                <div className="flex text-xs text-gray-500 space-x-4">
                  <span>Duration: {course.duration ? (typeof course.duration === 'number' ? `${course.duration} weeks` : course.duration) : 'N/A'}</span>
                  <span>Created: {new Date(course.createdDate || course.createdAt || Date.now()).toLocaleDateString()}</span>
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
                
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditCourse(course)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCourse(course.id || course._id || '')}
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
    </div>
  );
  };

  const renderCourseDetails = () => {
    if (!selectedCourse) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
          <p className="text-gray-500">Please select a course to view details.</p>
        </div>
      );
    }

    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.title || selectedCourse.name}</h1>
          <p className="text-gray-600 mt-1">{selectedCourse.description}</p>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className={getDifficultyColor(selectedCourse.difficulty || selectedCourse.level || 'beginner')}>
              {selectedCourse.difficulty || selectedCourse.level || 'beginner'}
            </Badge>
            <Badge variant="outline" className={getStatusColor(selectedCourse.status || 'draft')}>
              {selectedCourse.status || 'draft'}
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
                <p className="text-3xl font-bold text-blue-900">{selectedCourse.students || selectedCourse.studentsCount || 0}</p>
                <p className="text-sm text-green-600 mt-1">{selectedCourse.completion || selectedCourse.completionRate || 0}% completion</p>
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
                <p className="text-3xl font-bold text-green-900">{selectedCourse.lessons || selectedCourse.lessonsCount || 0}</p>
                <p className="text-sm text-green-600 mt-1">{selectedCourse.duration ? (typeof selectedCourse.duration === 'number' ? `${selectedCourse.duration} weeks` : selectedCourse.duration) : 'N/A'} duration</p>
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
    if (!selectedCourse) {
      return (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Course Selected</h3>
          <p className="text-gray-500">Please select a course to view content.</p>
        </div>
      );
    }

    return (
    <div className="space-y-8">
      {renderBreadcrumb()}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{selectedCourse.title || selectedCourse.name} - Content</h1>
          <p className="text-gray-600 mt-1">Lessons, resources, quizzes, and questions</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          onClick={() => {
            setEditingLesson(null);
            setLessonFormData({ 
              title: '', 
              description: '', 
              content: '',
              courseId: selectedCourse.id || selectedCourse._id || '',
              order: lessons.filter(lesson => (lesson.courseId === selectedCourse.id || lesson.courseId === selectedCourse._id)).length + 1,
              estimatedTime: 30,
              isPreview: false,
              video: {
                url: '',
                title: '',
                description: '',
                duration: 0,
                thumbnail: '',
                transcript: ''
              },
              resources: [],
              quizzes: [],
              status: 'draft' 
            });
            setShowLessonForm(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lesson
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
              {lessons.filter(lesson => (lesson.courseId === selectedCourse.id || lesson.courseId === selectedCourse._id)).length === 0 ? (
                <div className="text-center py-12">
                  <PlayCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No lessons created in this course yet</p>
                  <Button 
                    className="bg-gradient-to-r from-teal-500 to-purple-600"
                    onClick={() => {
                      setEditingLesson(null);
            setLessonFormData({ 
              title: '', 
              description: '', 
              content: '',
              courseId: selectedCourse.id || selectedCourse._id || '',
              order: 1,
              estimatedTime: 30,
              isPreview: false,
              video: {
                url: '',
                title: '',
                description: '',
                duration: 0,
                thumbnail: '',
                transcript: ''
              },
              resources: [],
              quizzes: [],
              status: 'draft' 
            });
                      setShowLessonForm(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Lesson
                  </Button>
                </div>
              ) : (
              <div className="space-y-4">
                {lessons.filter(lesson => {
                  
                  if (lesson && typeof lesson === 'object') {
                    // Check if lesson has the expected structure
                    const hasExpectedKeys = lesson.id || lesson._id;
                    const hasTitle = lesson.title;
                    const hasCourseId = lesson.courseId;
                    
                    
                    if (!hasExpectedKeys || !hasTitle || !hasCourseId) {
                      console.error('INVALID LESSON OBJECT DETECTED:', lesson);
                      return false;
                    }
                  }
                  
                  const matches = (lesson.courseId === selectedCourse.id || lesson.courseId === selectedCourse._id);
                  return matches;
                }).filter(lesson => {
                  // Additional safety filter to remove any invalid lessons
                  if (!lesson || typeof lesson !== 'object') {
                    console.error('Invalid lesson object in filter:', lesson);
                    return false;
                  }
                  
                  // Check for required properties
                  const hasId = lesson.id || lesson._id;
                  const hasTitle = lesson.title;
                  const hasCourseId = lesson.courseId;
                  
                  if (!hasId || !hasTitle || !hasCourseId) {
                    console.error('Lesson missing required properties:', lesson);
                    return false;
                  }
                  
                  return true;
                }).map((lesson, index) => {
                  
                  // Final safety check
                  if (!lesson || typeof lesson !== 'object') {
                    console.error('CRITICAL: Invalid lesson object in render:', lesson);
                    return null;
                  }
                  
                  return (
                  <Card key={lesson.id || lesson._id} className="border border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-semibold">{lesson.order || 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                            <p className="text-sm text-gray-500">
                              {lesson.description ? lesson.description.substring(0, 100) + '...' : 'No description'}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-400">
                              <span>Duration: {lesson.estimatedTime ? `${lesson.estimatedTime} min` : 'N/A'}</span>
                              <span>Views: {lesson.views || 0}</span>
                              <span>Resources: {Array.isArray(lesson.resources) ? lesson.resources.length : 0}</span>
                              {Array.isArray(lesson.quizzes) && lesson.quizzes.length > 0 && <span>Has {lesson.quizzes.length} Quiz{lesson.quizzes.length > 1 ? 'zes' : ''}</span>}
                              {lesson.video && <span>Has Video</span>}
                              {lesson.content && <span>Has Content</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline" className={getStatusColor(lesson.status || 'draft')}>
                            {lesson.status || 'draft'}
                          </Badge>
                          {lesson.isPreview && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600">
                              Preview
                            </Badge>
                          )}
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">{lesson.completionRate || lesson.completed || 0}%</p>
                            <p className="text-xs text-gray-500">completed</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => onNavigateToLesson && onNavigateToLesson(lesson)}
                              className="bg-gradient-to-r from-teal-50 to-purple-50 hover:from-teal-100 hover:to-purple-100 border-teal-200"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Preview Lesson
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditLesson(lesson)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDeleteLesson(lesson.id || lesson._id || '')}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  );
                }).filter(Boolean)}
              </div>
              )}
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

  return (
    <div className="space-y-8">
      {activeView === 'overview' && renderOverview()}
      {activeView === 'field-details' && renderFieldDetails()}
      {activeView === 'field-courses' && renderFieldCourses()}
      {activeView === 'course-details' && renderCourseDetails()}
      {activeView === 'course-content' && renderCourseContent()}

      {/* Field Form Dialog */}
      <Dialog open={showFieldForm} onOpenChange={setShowFieldForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Edit Field of Study' : 'Create Field of Study'}
            </DialogTitle>
            <DialogDescription>
              {editingField ? 'Update the field information' : 'Add a new field of study to your organization'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFieldSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fieldName">Field Name</Label>
              <Input
                id="fieldName"
                value={fieldFormData.name}
                onChange={(e) => setFieldFormData({ ...fieldFormData, name: e.target.value })}
                placeholder="e.g., Computer Science"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldDescription">Description</Label>
              <Textarea
                id="fieldDescription"
                value={fieldFormData.description}
                onChange={(e) => setFieldFormData({ ...fieldFormData, description: e.target.value })}
                placeholder="Brief description of the field"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldIcon">Icon</Label>
              <Input
                id="fieldIcon"
                value={fieldFormData.icon}
                onChange={(e) => setFieldFormData({ ...fieldFormData, icon: e.target.value })}
                placeholder="📚"
                maxLength={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fieldStatus">Status</Label>
              <Select
                value={fieldFormData.status}
                onValueChange={(value: string) => setFieldFormData({ ...fieldFormData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowFieldForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-500 to-purple-600">
                <Save className="h-4 w-4 mr-2" />
                {editingField ? 'Update Field' : 'Create Field'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Course Form Dialog */}
      <Dialog open={showCourseForm} onOpenChange={setShowCourseForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCourse ? 'Edit Course' : 'Create Course'}
            </DialogTitle>
            <DialogDescription>
              {editingCourse ? 'Update the course information' : 'Add a new course to your organization'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="courseTitle">Course Title</Label>
              <Input
                id="courseTitle"
                value={courseFormData.title}
                onChange={(e) => setCourseFormData({ ...courseFormData, title: e.target.value })}
                placeholder="e.g., React Fundamentals"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseDescription">Description</Label>
              <Textarea
                id="courseDescription"
                value={courseFormData.description}
                onChange={(e) => setCourseFormData({ ...courseFormData, description: e.target.value })}
                placeholder="Brief description of the course"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseField">Field of Study</Label>
              <Select
                value={courseFormData.fieldId}
                onValueChange={(value: string) => setCourseFormData({ ...courseFormData, fieldId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a field" />
                </SelectTrigger>
                <SelectContent>
                  {fieldsOfStudy.map((field) => (
                    <SelectItem key={field._id || field.id} value={field._id || field.id}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseCategory">Category</Label>
              <Input
                id="courseCategory"
                value={courseFormData.category}
                onChange={(e) => setCourseFormData({ ...courseFormData, category: e.target.value })}
                placeholder="e.g., Programming, Design, Business"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="courseDifficulty">Difficulty</Label>
                <Select
                  value={courseFormData.difficulty}
                  onValueChange={(value: string) => setCourseFormData({ ...courseFormData, difficulty: value })}
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
              <div className="space-y-2">
                <Label htmlFor="courseDuration">Duration</Label>
                <Input
                  id="courseDuration"
                  value={courseFormData.duration}
                  onChange={(e) => setCourseFormData({ ...courseFormData, duration: e.target.value })}
                  placeholder="e.g., 8 weeks"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coursePrice">Price ($)</Label>
              <Input
                id="coursePrice"
                type="number"
                value={courseFormData.price}
                onChange={(e) => setCourseFormData({ ...courseFormData, price: Number(e.target.value) })}
                placeholder="0"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="courseStatus">Status</Label>
              <Select
                value={courseFormData.status}
                onValueChange={(value: string) => setCourseFormData({ ...courseFormData, status: value })}
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCourseForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-500 to-purple-600">
                <Save className="h-4 w-4 mr-2" />
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Lesson Form Dialog */}
      <Dialog open={showLessonForm} onOpenChange={setShowLessonForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingLesson ? 'Edit Lesson' : 'Create Lesson'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson ? 'Update the lesson information' : 'Add a new lesson to the course'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleLessonSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonTitle">Lesson Title</Label>
                  <Input
                    id="lessonTitle"
                    value={lessonFormData.title}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                    placeholder="e.g., Introduction to React Hooks"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonOrder">Order</Label>
                  <Input
                    id="lessonOrder"
                    type="number"
                    value={lessonFormData.order}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, order: Number(e.target.value) })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonDescription">Description</Label>
                <Textarea
                  id="lessonDescription"
                  value={lessonFormData.description}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, description: e.target.value })}
                  placeholder="Brief description of the lesson"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lessonContent">Content</Label>
                <Textarea
                  id="lessonContent"
                  value={lessonFormData.content}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, content: e.target.value })}
                  placeholder="Lesson text content (optional)"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lessonEstimatedTime">Estimated Time (minutes)</Label>
                  <Input
                    id="lessonEstimatedTime"
                    type="number"
                    value={lessonFormData.estimatedTime}
                    onChange={(e) => setLessonFormData({ ...lessonFormData, estimatedTime: Number(e.target.value) })}
                    placeholder="30"
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lessonStatus">Status</Label>
                  <Select
                    value={lessonFormData.status}
                    onValueChange={(value: string) => setLessonFormData({ ...lessonFormData, status: value })}
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
                <div className="space-y-2">
                  <Label htmlFor="lessonPreview">Preview Mode</Label>
                  <Select
                    value={lessonFormData.isPreview ? 'true' : 'false'}
                    onValueChange={(value: string) => setLessonFormData({ ...lessonFormData, isPreview: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">No Preview</SelectItem>
                      <SelectItem value="true">Preview Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Video Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Video Content</h3>
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="videoTitle">Video Title</Label>
                    <Input
                      id="videoTitle"
                      value={lessonFormData.video.title}
                      onChange={(e) => setLessonFormData({
                        ...lessonFormData,
                        video: { ...lessonFormData.video, title: e.target.value }
                      })}
                      placeholder="Video title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="videoDuration">Duration (seconds)</Label>
                    <Input
                      id="videoDuration"
                      type="number"
                      value={lessonFormData.video.duration}
                      onChange={(e) => setLessonFormData({
                        ...lessonFormData,
                        video: { ...lessonFormData.video, duration: Number(e.target.value) }
                      })}
                      placeholder="1800"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoDescription">Video Description</Label>
                  <Textarea
                    id="videoDescription"
                    value={lessonFormData.video.description}
                    onChange={(e) => setLessonFormData({
                      ...lessonFormData,
                      video: { ...lessonFormData.video, description: e.target.value }
                    })}
                    placeholder="Video description"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="videoTranscript">Transcript</Label>
                  <Textarea
                    id="videoTranscript"
                    value={lessonFormData.video.transcript}
                    onChange={(e) => setLessonFormData({
                      ...lessonFormData,
                      video: { ...lessonFormData.video, transcript: e.target.value }
                    })}
                    placeholder="Video transcript (optional)"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Upload Video</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setVideoFile(file);
                          setLessonFormData({
                            ...lessonFormData,
                            video: { ...lessonFormData.video, title: file.name }
                          });
                        }
                      }}
                    />
                    {videoFile && (
                      <Button
                        type="button"
                        onClick={() => handleVideoUpload(videoFile)}
                        disabled={uploadingVideo}
                        size="sm"
                      >
                        {uploadingVideo ? 'Uploading...' : 'Upload'}
                      </Button>
                    )}
                  </div>
                  {lessonFormData.video.url && (
                    <div className="text-sm text-green-600">
                      ✓ Video uploaded: {lessonFormData.video.title}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Resources Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Resources</h3>
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label>Upload Resources</Label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => handleAddResourceFile(file));
                    }}
                  />
                </div>

                {/* Pending Resource Files */}
                {resourceFiles.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Label>Pending Uploads</Label>
                      <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                        {resourceFiles.length} file{resourceFiles.length > 1 ? 's' : ''} pending
                      </span>
                    </div>
                    {resourceFiles.map((file, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border rounded">
                        <span className="flex-1 text-sm">{file.name}</span>
                        <Input
                          placeholder="Title"
                          value={resourceMetadata[index]?.title || ''}
                          onChange={(e) => handleUpdateResourceMetadata(index, 'title', e.target.value)}
                          className="w-32"
                        />
                        <Input
                          placeholder="Description"
                          value={resourceMetadata[index]?.description || ''}
                          onChange={(e) => handleUpdateResourceMetadata(index, 'description', e.target.value)}
                          className="w-40"
                        />
                        <Button
                          type="button"
                          onClick={() => handleResourceUpload(file, index)}
                          disabled={uploadingResources}
                          size="sm"
                        >
                          {uploadingResources ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded Resources */}
                {lessonFormData.resources.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Resources</Label>
                    {lessonFormData.resources.map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{resource.title}</div>
                          <div className="text-sm text-gray-500">{resource.type} • {resource.size ? `${Math.round(resource.size / 1024)}KB` : 'Unknown size'}</div>
                          {resource.description && (
                            <div className="text-sm text-gray-600 mt-1">{resource.description}</div>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {resource.type === 'pdf' && (
                            <Button
                              type="button"
                              onClick={() => handleOpenPdfViewer(resource)}
                              variant="outline"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            onClick={() => handleDownloadResource(resource)}
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => handleRemoveResource(index)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLessonForm(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-teal-500 to-purple-600">
                <Save className="h-4 w-4 mr-2" />
                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Instructor Assignment Dialog */}
      <Dialog open={showInstructorAssignment} onOpenChange={setShowInstructorAssignment}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Assign Instructors to {selectedFieldForInstructors?.name}
            </DialogTitle>
            <DialogDescription>
              Select instructors to assign to this field of study
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {availableInstructors.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No instructors available</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableInstructors.map((instructor) => (
                  <div key={instructor._id || instructor.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      id={`instructor-${instructor._id || instructor.id}`}
                      checked={selectedInstructors.includes(instructor._id || instructor.id)}
                      onChange={(e) => {
                        const instructorId = instructor._id || instructor.id;
                        if (e.target.checked) {
                          setSelectedInstructors([...selectedInstructors, instructorId]);
                        } else {
                          setSelectedInstructors(selectedInstructors.filter(id => id !== instructorId));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                    <label 
                      htmlFor={`instructor-${instructor._id || instructor.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={instructor.avatar} />
                          <AvatarFallback>{instructor.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{instructor.name}</p>
                          <p className="text-xs text-gray-500">{instructor.email}</p>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setShowInstructorAssignment(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="destructive"
              onClick={handleRemoveInstructors}
              disabled={selectedInstructors.length === 0}
            >
              Remove Selected
            </Button>
            <Button 
              type="button" 
              className="bg-gradient-to-r from-teal-500 to-purple-600"
              onClick={handleInstructorAssignmentSubmit}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Assign Selected
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer */}
      <PdfViewer 
        isOpen={showPdfViewer}
        onClose={handleClosePdfViewer}
        resource={selectedResource}
      />
    </div>
  );
}