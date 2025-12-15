import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Brain, 
  FileQuestion,
  Tag,
  Calendar,
  BarChart3,
  BookOpen,
  Clock,
  CheckCircle,
  AlertCircle,
  Archive,
  Eye,
  Download,
  Upload,
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Building2,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { api } from '../../services/api';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage, isRetryableError } from '../../utils/errorHandling';
import type { CreateQuestionRequest, UpdateQuestionRequest, QuestionBankStats } from '../../interfaces/question.types';
import { useLanguage } from '../context/LanguageContext';

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points?: number;
  fieldId: string;
  fieldName: string;
  courseId: string;
  courseName: string;
  source: 'ai-generated' | 'manual' | 'exam';
  tags: string[];
  createdAt: string;
  lastModified: string;
  usageCount: number;
  isActive: boolean;
}

interface Course {
  id: string;
  name: string;
  fieldId: string;
  fieldName: string;
  questionCount: number;
}

interface Field {
  id: string;
  name: string;
  courses: Course[];
  questionCount: number;
}

export function QuestionBank() {
  const { t, isRTL } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuestion, setPreviewQuestion] = useState<Question | null>(null);
  const [expandedFields, setExpandedFields] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<'hierarchy' | 'list'>('hierarchy');
  const [selectedFieldForView, setSelectedFieldForView] = useState<string | null>(null);
  const [selectedCourseForView, setSelectedCourseForView] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<QuestionBankStats | null>(null);
  
  // Form state for Add/Edit Question
  const [formQuestion, setFormQuestion] = useState('');
  const [formType, setFormType] = useState<'multiple-choice' | 'true-false' | 'short-answer' | 'essay'>('multiple-choice');
  const [formOptions, setFormOptions] = useState<string[]>(['', '', '', '']);
  const [formCorrectAnswer, setFormCorrectAnswer] = useState<number | string>(0);
  const [formExplanation, setFormExplanation] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formPoints, setFormPoints] = useState(1);
  const [formFieldId, setFormFieldId] = useState('');
  const [formCourseId, setFormCourseId] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load question bank hierarchy from API
  useEffect(() => {
    loadQuestionBank();
  }, []);

  const loadQuestionBank = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const hierarchy = await api.question.getHierarchy({ includeQuestions: true, depth: 'full' });
      
      if (hierarchy?.fields) {
        
        // Transform API response to component format
        const allQuestions: Question[] = [];
        const transformedFields: Field[] = hierarchy.fields.map((field: any) => {
          const courses: Course[] = (field.courses || []).map((course: any) => {
            const courseQuestions: Question[] = (course.questions || []).map((q: any) => ({
              id: q.id || q._id,
              question: q.question,
              type: q.type,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              difficulty: q.difficulty,
              points: q.points || 1,
              fieldId: field.id || field._id,
              fieldName: field.name,
              courseId: course.id || course._id,
              courseName: course.name,
              source: q.source || 'manual',
              tags: q.tags || [],
              createdAt: q.createdAt || new Date().toISOString(),
              lastModified: q.updatedAt || q.lastModified || new Date().toISOString(),
              usageCount: q.usageCount || 0,
              isActive: q.isActive !== false
            }));
            
            allQuestions.push(...courseQuestions);
            
            return {
              id: course.id || course._id,
              name: course.name,
              fieldId: field.id || field._id,
              fieldName: field.name,
              questionCount: course.questionCount || courseQuestions.length
            };
          });
          
          return {
            id: field.id || field._id,
            name: field.name,
            courses,
            questionCount: field.questionCount || field.activeQuestionCount || 0
          };
        });
        
        setFields(transformedFields);
        setQuestions(allQuestions);
        setFilteredQuestions(allQuestions.filter(q => q.isActive));
        
        // Load statistics
        loadStatistics();
      }
    } catch (error: any) {
      console.error('Failed to load question bank:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      setFields([]);
      setQuestions([]);
      setFilteredQuestions([]);
      toast.error(formattedError.message || t('questionBank.messages.loadError'));
      setFields([]);
      setQuestions([]);
      setFilteredQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const statsData = await api.question.getStatistics();
      if (statsData) {
        setStats({
          totalQuestions: statsData.totalQuestions || 0,
          byType: statsData.byType || {},
          byDifficulty: statsData.byDifficulty || {},
          byField: statsData.byField || {}
        });
      }
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
      // Statistics failure is not critical, continue without it
    }
  };


  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions.filter(question => {
      const matchesSearch = question.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                           question.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           question.courseName.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDifficulty = selectedDifficulty === 'all' || question.difficulty === selectedDifficulty;
      const matchesType = selectedType === 'all' || question.type === selectedType;
      const matchesField = selectedField === 'all' || question.fieldId === selectedField;
      const matchesCourse = selectedCourse === 'all' || question.courseId === selectedCourse;
      const matchesSource = selectedSource === 'all' || question.source === selectedSource;
      
      // Additional filtering for current view
      const matchesViewFilter = currentView === 'list' || 
        (selectedFieldForView ? question.fieldId === selectedFieldForView : true) &&
        (selectedCourseForView ? question.courseId === selectedCourseForView : true);
      
      return matchesSearch && matchesDifficulty && matchesType && matchesField && matchesCourse && matchesSource && matchesViewFilter && question.isActive;
    });
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedDifficulty, selectedType, selectedField, selectedCourse, selectedSource, currentView, selectedFieldForView, selectedCourseForView]);

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      setSelectedQuestions(filteredQuestions.map(q => q.id));
    }
  };

  const resetForm = () => {
    setFormQuestion('');
    setFormType('multiple-choice');
    setFormOptions(['', '', '', '']);
    setFormCorrectAnswer(0);
    setFormExplanation('');
    setFormDifficulty('medium');
    setFormPoints(1);
    setFormFieldId('');
    setFormCourseId('');
    setFormTags([]);
    setFormTagInput('');
    setFormSubject('');
  };

  const populateFormForEdit = (question: Question) => {
    setFormQuestion(question.question);
    setFormType(question.type);
    setFormOptions(question.options || ['', '', '', '']);
    setFormCorrectAnswer(question.correctAnswer);
    setFormExplanation(question.explanation || '');
    setFormDifficulty(question.difficulty);
    setFormPoints(question.points || 1);
    setFormFieldId(question.fieldId);
    setFormCourseId(question.courseId);
    setFormTags(question.tags || []);
    setFormTagInput('');
    setFormSubject('');
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    populateFormForEdit(question);
    setShowEditDialog(true);
  };

  const handleAddTag = () => {
    if (formTagInput.trim() && !formTags.includes(formTagInput.trim())) {
      setFormTags([...formTags, formTagInput.trim()]);
      setFormTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormTags(formTags.filter(t => t !== tag));
  };

  const handleSaveQuestion = async (isEdit: boolean) => {
    // Validation
    if (!formQuestion.trim()) {
      toast.error(t('questionBank.messages.questionRequired'));
      return;
    }
    if (!formFieldId) {
      toast.error(t('questionBank.messages.fieldRequired'));
      return;
    }
    if (!formCourseId) {
      toast.error(t('questionBank.messages.courseRequired'));
      return;
    }
    if ((formType === 'multiple-choice' || formType === 'true-false') && !formOptions.filter(o => o.trim()).length) {
      toast.error(t('questionBank.messages.optionRequired'));
      return;
    }
    if ((formType === 'multiple-choice' || formType === 'true-false') && typeof formCorrectAnswer !== 'number') {
      toast.error(t('questionBank.messages.answerRequired'));
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const questionData: CreateQuestionRequest | UpdateQuestionRequest = {
        question: formQuestion.trim(),
        type: formType,
        options: (formType === 'multiple-choice' || formType === 'true-false') ? formOptions.filter(o => o.trim()) : undefined,
        correctAnswer: formCorrectAnswer,
        explanation: formExplanation.trim() || undefined,
        difficulty: formDifficulty,
        points: formPoints,
        fieldId: formFieldId,
        courseId: formCourseId,
        tags: formTags.length > 0 ? formTags : undefined,
        subject: formSubject.trim() || undefined,
        source: 'manual'
      };

      if (isEdit && editingQuestion) {
        await api.question.updateQuestion(editingQuestion.id, questionData);
        toast.success(t('questionBank.messages.updateSuccess'));
        setShowEditDialog(false);
      } else {
        await api.question.createQuestion(questionData as CreateQuestionRequest);
        toast.success(t('questionBank.messages.createSuccess'));
        setShowAddDialog(false);
      }

      // Reload question bank
      await loadQuestionBank();
      resetForm();
    } catch (error: any) {
      console.error('Failed to save question:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('questionBank.messages.saveError'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await api.question.deleteQuestion(questionId, false);
      
      // Reload question bank to reflect changes
      await loadQuestionBank();
      
      toast.success(t('questionBank.messages.archiveSuccess'));
    } catch (error: any) {
      console.error('Failed to delete question:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('questionBank.messages.deleteError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const questionData: CreateQuestionRequest = {
        question: `${question.question} (Copy)`,
        type: question.type,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty,
        points: question.points || 1,
        fieldId: question.fieldId,
        courseId: question.courseId,
        tags: question.tags,
        source: 'manual'
      };
      
      await api.question.createQuestion(questionData);
      
      await loadQuestionBank();
      
      toast.success(t('questionBank.messages.duplicateSuccess'));
    } catch (error: any) {
      console.error('Failed to duplicate question:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('questionBank.messages.duplicateError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast.error(t('questionBank.messages.noSelection'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await api.question.bulkDeleteQuestions(selectedQuestions, false);
      
      // Reload question bank to reflect changes
      await loadQuestionBank();
      
      setSelectedQuestions([]);
      const deletedCount = response?.data?.deleted || selectedQuestions.length;
      toast.success(`${deletedCount} ${t('questionBank.messages.bulkArchiveSuccess')}`);
    } catch (error: any) {
      console.error('Failed to delete questions:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('questionBank.messages.bulkDeleteError'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error(t('questionBank.messages.noExportSelection'));
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const blob = await api.question.exportQuestions({
        format: 'json',
        questionIds: selectedQuestions
      });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `questions-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast.success(`${selectedQuestions.length} ${t('questionBank.messages.exportSuccess')}`);
    } catch (error: any) {
      console.error('Failed to export questions:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || t('questionBank.messages.exportError'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return <FileQuestion className="h-4 w-4" />;
      case 'true-false': return <CheckCircle className="h-4 w-4" />;
      case 'short-answer': return <Edit className="h-4 w-4" />;
      case 'essay': return <BookOpen className="h-4 w-4" />;
      default: return <FileQuestion className="h-4 w-4" />;
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'ai-generated': return <Brain className="h-4 w-4" />;
      case 'manual': return <Edit className="h-4 w-4" />;
      case 'exam': return <BarChart3 className="h-4 w-4" />;
      default: return <FileQuestion className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'ai-generated': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'manual': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'exam': return 'bg-teal-100 text-teal-800 border-teal-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const toggleFieldExpansion = (fieldId: string) => {
    setExpandedFields(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleViewChange = (view: 'hierarchy' | 'list') => {
    setCurrentView(view);
    if (view === 'list') {
      setSelectedFieldForView(null);
      setSelectedCourseForView(null);
    }
  };

  const handleFieldClick = (fieldId: string) => {
    if (currentView === 'hierarchy') {
      setSelectedFieldForView(fieldId);
      setSelectedCourseForView(null);
      setCurrentView('list');
    }
  };

  const handleCourseClick = (courseId: string) => {
    if (currentView === 'hierarchy') {
      setSelectedCourseForView(courseId);
      setCurrentView('list');
    }
  };

  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    if (selectedFieldForView) {
      const field = fields.find(f => f.id === selectedFieldForView);
      if (field) {
        breadcrumbs.push({ label: field.name, action: () => handleFieldClick(selectedFieldForView) });
        
        if (selectedCourseForView) {
          const course = field.courses.find(c => c.id === selectedCourseForView);
          if (course) {
            breadcrumbs.push({ label: course.name, action: () => handleCourseClick(selectedCourseForView) });
          }
        }
      }
    }
    
    return breadcrumbs;
  };

  const availableCourses = selectedField === 'all' ? 
    fields.flatMap(f => f.courses) :
    fields.find(f => f.id === selectedField)?.courses || [];

  return (
    <ErrorBoundary>
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{t('questionBank.selector.error')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isRetryableError({ message: error }) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadQuestionBank()}
                      className="text-red-700 border-red-300 hover:bg-red-100"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      {t('questionBank.selector.retry')}
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setError(null)}>
                    {t('questionBank.selector.dismiss')}
                  </Button>
                </div>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('questionBank.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('questionBank.subtitle')}
          </p>
          {getBreadcrumbs().length > 0 && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewChange('hierarchy')}
                className="p-0 h-auto text-teal-600 hover:text-teal-700"
              >
                {t('questionBank.allFields')}
              </Button>
              {getBreadcrumbs().map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="h-3 w-3" />
                  <button 
                    onClick={breadcrumb.action}
                    className="text-gray-700 hover:text-teal-600 transition-colors"
                  >
                    {breadcrumb.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant={currentView === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('hierarchy')}
              className={currentView === 'hierarchy' ? 'bg-gradient-to-r from-teal-500 to-purple-600' : ''}
            >
              <Building2 className="h-4 w-4 mr-1" />
              {t('questionBank.hierarchy')}
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('list')}
              className={currentView === 'list' ? 'bg-gradient-to-r from-teal-500 to-purple-600' : ''}
            >
              <Database className="h-4 w-4 mr-1" />
              {t('questionBank.listView')}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-teal-600" />
            <span className="font-medium text-teal-600">{questions.filter(q => q.isActive).length} {t('questionBank.questions')}</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Database className="h-8 w-8 text-blue-600 bg-blue-100 rounded-lg p-2" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{t('questionBank.totalQuestions')}</p>
                <p className="text-2xl font-bold text-gray-900">{questions.filter(q => q.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-purple-600 bg-purple-100 rounded-lg p-2" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{t('questionBank.aiGenerated')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {questions.filter(q => q.source === 'ai-generated' && q.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-teal-600 bg-teal-100 rounded-lg p-2" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{t('questionBank.mostUsed')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...questions.map(q => q.usageCount), 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600 bg-green-100 rounded-lg p-2" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">{t('questionBank.fields')}</p>
                <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="h-5 w-5 mr-2 text-blue-600" />
            {t('questionBank.searchFilter')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search questions, tags, fields, courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                <SelectItem value="true-false">True/False</SelectItem>
                <SelectItem value="short-answer">Short Answer</SelectItem>
                <SelectItem value="essay">Essay</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedField} onValueChange={(value: string) => {
              setSelectedField(value);
              setSelectedCourse('all'); // Reset course when field changes
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Fields</SelectItem>
                {fields.map(field => (
                  <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Course" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {availableCourses.map(course => (
                  <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSource} onValueChange={setSelectedSource}>
              <SelectTrigger>
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="ai-generated">AI Generated</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="exam">Exam</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedQuestions.length > 0 && (
        <Card className="border-teal-200 bg-teal-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-teal-800">
                  {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedQuestions([])}
                  className="text-teal-700 border-teal-300 hover:bg-teal-100"
                >
                  Clear Selection
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportQuestions}
                  disabled={isLoading}
                  className="text-blue-700 border-blue-300 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={isLoading}
                  className="text-red-700 border-red-300 hover:bg-red-50"
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hierarchical View */}
      {currentView === 'hierarchy' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="h-5 w-5 mr-2 text-teal-600" />
              {t('questionBank.hierarchy.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {fields.map((field) => (
                <div key={field.id} className="border border-gray-200 rounded-lg">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleFieldExpansion(field.id)}
                  >
                    <div className="flex items-center space-x-3">
                      {expandedFields.includes(field.id) ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      {expandedFields.includes(field.id) ? (
                        <FolderOpen className="h-5 w-5 text-teal-600" />
                      ) : (
                        <Folder className="h-5 w-5 text-teal-600" />
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{field.name}</h3>
                        <p className="text-sm text-gray-500">
                          {field.courses.length} courses • {field.questionCount} questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          handleFieldClick(field.id);
                        }}
                        className="text-teal-600 border-teal-300 hover:bg-teal-50"
                      >
                        {t('questionBank.actions.viewQuestions')}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Courses within the field */}
                  {expandedFields.includes(field.id) && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-4 space-y-3">
                        {field.courses.length === 0 ? (
                          <p className="text-sm text-gray-500 italic">No courses in this field yet</p>
                        ) : (
                          field.courses.map((course) => (
                            <div key={course.id} className="flex items-center justify-between p-3 bg-white rounded border border-gray-100 hover:shadow-sm transition-shadow">
                              <div className="flex items-center space-x-3">
                                <BookOpen className="h-4 w-4 text-purple-600" />
                                <div>
                                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                                  <p className="text-sm text-gray-500">{course.questionCount} questions</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCourseClick(course.id)}
                                  className="text-purple-600 border-purple-300 hover:bg-purple-50"
                                >
                                  {t('questionBank.actions.viewQuestions')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600"
                                >
                                  {t('questionBank.actions.addQuestion')}
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {fields.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{t('questionBank.empty.noFields')}</h3>
                  <p className="text-gray-500 mb-4">
                    {t('questionBank.empty.noFieldsDesc')}
                  </p>
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('questionBank.empty.createField')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions List */}
      {currentView === 'list' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileQuestion className="h-5 w-5 mr-2 text-purple-600" />
              Questions ({filteredQuestions.length})
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="text-gray-600"
              >
                {selectedQuestions.length === filteredQuestions.length ? t('questionBank.selector.deselectAll') : t('questionBank.selector.selectAll')}
              </Button>
              <Dialog open={showAddDialog} onOpenChange={(open: boolean) => {
                setShowAddDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-teal-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('questionBank.actions.addQuestion')}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{t('questionBank.form.header')}</DialogTitle>
                    <DialogDescription>
                      {t('questionBank.form.description')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    {/* Question Text */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.questionText')} *</label>
                      <Textarea
                        value={formQuestion}
                        onChange={(e) => setFormQuestion(e.target.value)}
                        placeholder={t('questionBank.form.questionPlaceholder')}
                        className="min-h-[100px]"
                        required
                      />
                    </div>

                    {/* Question Type */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.type')} *</label>
                      <Select value={formType} onValueChange={(value: any) => {
                        setFormType(value);
                        if (value === 'true-false') {
                          setFormOptions(['True', 'False']);
                        } else if (value === 'multiple-choice' && formOptions.length < 2) {
                          setFormOptions(['', '', '', '']);
                        }
                      }}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="true-false">True/False</SelectItem>
                          <SelectItem value="short-answer">Short Answer</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Options (for multiple-choice and true-false) */}
                    {(formType === 'multiple-choice' || formType === 'true-false') && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.options')} *</label>
                        <div className="space-y-2">
                          {formOptions.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <Input
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...formOptions];
                                  newOptions[index] = e.target.value;
                                  setFormOptions(newOptions);
                                }}
                                placeholder={`${t('questionBank.form.optionPlaceholder')} ${index + 1}`}
                                disabled={formType === 'true-false'}
                              />
                              {(formType === 'multiple-choice' || formType === 'true-false') && (
                                <Checkbox
                                  checked={formCorrectAnswer === index}
                                  onCheckedChange={(checked: boolean) => {
                                    if (checked) setFormCorrectAnswer(index);
                                  }}
                                />
                              )}
                            </div>
                          ))}
                          {formType === 'multiple-choice' && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setFormOptions([...formOptions, ''])}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              {t('questionBank.form.addOption')}
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{t('questionBank.form.correctAnswerHint')}</p>
                      </div>
                    )}

                    {/* Correct Answer (for short-answer and essay) */}
                    {(formType === 'short-answer' || formType === 'essay') && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                          {formType === 'short-answer' ? t('questionBank.form.correctAnswer') : t('questionBank.form.sampleAnswer')}
                        </label>
                        <Textarea
                          value={typeof formCorrectAnswer === 'string' ? formCorrectAnswer : ''}
                          onChange={(e) => setFormCorrectAnswer(e.target.value)}
                          placeholder={formType === 'short-answer' ? t('questionBank.form.answerPlaceholder') : t('questionBank.form.samplePlaceholder')}
                          className="min-h-[80px]"
                        />
                      </div>
                    )}

                    {/* Explanation */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.explanation')}</label>
                      <Textarea
                        value={formExplanation}
                        onChange={(e) => setFormExplanation(e.target.value)}
                        placeholder={t('questionBank.form.explanationPlaceholder')}
                        className="min-h-[80px]"
                      />
                    </div>

                    {/* Difficulty and Points */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.selector.difficulty')} *</label>
                        <Select value={formDifficulty} onValueChange={(value: any) => setFormDifficulty(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.points')} *</label>
                        <Input
                          type="number"
                          value={formPoints}
                          onChange={(e) => setFormPoints(parseInt(e.target.value) || 1)}
                          min="1"
                          required
                        />
                      </div>
                    </div>

                    {/* Field and Course */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t('courseDiscovery.field')} *</label>
                        <Select value={formFieldId} onValueChange={(value: string) => {
                          setFormFieldId(value);
                          setFormCourseId(''); // Reset course when field changes
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('questionBank.selector.field')} />
                          </SelectTrigger>
                          <SelectContent>
                            {fields.map(field => (
                              <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.course')} *</label>
                        <Select 
                          value={formCourseId} 
                          onValueChange={(value: string) => setFormCourseId(value)}
                          disabled={!formFieldId}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={formFieldId ? t('questionBank.selector.course') : t('questionBank.form.selectFieldFirst')} />
                          </SelectTrigger>
                          <SelectContent>
                            {formFieldId && fields.find(f => f.id === formFieldId)?.courses.map(course => (
                              <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">{t('questionBank.form.tags')}</label>
                      <div className="flex items-center space-x-2 mb-2">
                        <Input
                          value={formTagInput}
                          onChange={(e) => setFormTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          placeholder={t('questionBank.form.tagPlaceholder')}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      {formTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formTags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => handleRemoveTag(tag)}
                              />
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Subject */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                      <Input
                        value={formSubject}
                        onChange={(e) => setFormSubject(e.target.value)}
                        placeholder="Optional subject or topic"
                      />
                    </div>

                    {/* Error Display */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                        {error}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowAddDialog(false);
                          resetForm();
                        }}
                        disabled={isSubmitting}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => handleSaveQuestion(false)}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-teal-500 to-purple-600"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Question
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-12">
              <Database className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedDifficulty !== 'all' || selectedType !== 'all' || selectedSource !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Start building your question bank by adding your first question'
                }
              </p>
              <Button onClick={() => {
                resetForm();
                setShowAddDialog(true);
              }} className="bg-gradient-to-r from-teal-500 to-purple-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Question
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((question) => (
                <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedQuestions.includes(question.id)}
                      onCheckedChange={() => handleSelectQuestion(question.id)}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2 leading-relaxed">
                            {question.question}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100">
                              {getTypeIcon(question.type)}
                              {question.type.replace('-', ' ')}
                            </Badge>

                            <Badge className={`flex items-center gap-1 ${getDifficultyColor(question.difficulty)}`}>
                              {question.difficulty}
                            </Badge>
                            
                            <Badge className={`flex items-center gap-1 ${getSourceColor(question.source)}`}>
                              {getSourceIcon(question.source)}
                              {question.source.replace('-', ' ')}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {question.fieldName}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {question.courseName}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Used {question.usageCount} times
                            </Badge>
                          </div>
                          
                          {question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {question.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center text-xs text-gray-500 space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(question.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              Last modified: {new Date(question.lastModified).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewQuestion(question);
                              setShowPreview(true);
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditQuestion(question)}
                            className="text-gray-600 hover:text-gray-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicateQuestion(question)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Preview</DialogTitle>
          </DialogHeader>
          {previewQuestion && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{previewQuestion.question}</h3>
                
                {previewQuestion.type === 'multiple-choice' && previewQuestion.options && (
                  <div className="space-y-2">
                    {previewQuestion.options.map((option, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded border ${
                          index === previewQuestion.correctAnswer
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        {index === previewQuestion.correctAnswer ? '✓ ' : '• '}{option}
                      </div>
                    ))}
                  </div>
                )}
                
                {previewQuestion.type === 'true-false' && (
                  <div className="space-y-2">
                    <div className={`p-2 rounded border ${previewQuestion.correctAnswer === 0 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}>
                      {previewQuestion.correctAnswer === 0 ? '✓ ' : '• '}True
                    </div>
                    <div className={`p-2 rounded border ${previewQuestion.correctAnswer === 1 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-50 border-gray-200'}`}>
                      {previewQuestion.correctAnswer === 1 ? '✓ ' : '• '}False
                    </div>
                  </div>
                )}
                
                {previewQuestion.explanation && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <h4 className="font-medium text-blue-900 mb-1">Explanation:</h4>
                    <p className="text-blue-800 text-sm">{previewQuestion.explanation}</p>
                  </div>
                )}
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Difficulty:</span>
                  <Badge className={`ml-2 ${getDifficultyColor(previewQuestion.difficulty)}`}>
                    {previewQuestion.difficulty}
                  </Badge>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2 text-gray-900">{previewQuestion.type.replace('-', ' ')}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Field:</span>
                  <span className="ml-2 text-gray-900">{previewQuestion.fieldName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Course:</span>
                  <span className="ml-2 text-gray-900">{previewQuestion.courseName}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Source:</span>
                  <Badge className={`ml-2 ${getSourceColor(previewQuestion.source)}`}>
                    {previewQuestion.source.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open: boolean) => {
        setShowEditDialog(open);
        if (!open) {
          resetForm();
          setEditingQuestion(null);
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make changes to your question
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="space-y-4 mt-4">
              {/* Question Text */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Question Text *</label>
                <Textarea
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="Enter your question here..."
                  className="min-h-[100px]"
                  required
                />
              </div>

              {/* Question Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Question Type *</label>
                <Select value={formType} onValueChange={(value: any) => {
                  setFormType(value);
                  if (value === 'true-false') {
                    setFormOptions(['True', 'False']);
                  } else if (value === 'multiple-choice' && formOptions.length < 2) {
                    setFormOptions(['', '', '', '']);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                    <SelectItem value="true-false">True/False</SelectItem>
                    <SelectItem value="short-answer">Short Answer</SelectItem>
                    <SelectItem value="essay">Essay</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options (for multiple-choice and true-false) */}
              {(formType === 'multiple-choice' || formType === 'true-false') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Options *</label>
                  <div className="space-y-2">
                    {formOptions.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formOptions];
                            newOptions[index] = e.target.value;
                            setFormOptions(newOptions);
                          }}
                          placeholder={`Option ${index + 1}`}
                          disabled={formType === 'true-false'}
                        />
                        {(formType === 'multiple-choice' || formType === 'true-false') && (
                          <Checkbox
                            checked={formCorrectAnswer === index}
                            onCheckedChange={(checked: boolean) => {
                              if (checked) setFormCorrectAnswer(index);
                            }}
                          />
                        )}
                      </div>
                    ))}
                    {formType === 'multiple-choice' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setFormOptions([...formOptions, ''])}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Option
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Check the box next to the correct answer</p>
                </div>
              )}

              {/* Correct Answer (for short-answer and essay) */}
              {(formType === 'short-answer' || formType === 'essay') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    {formType === 'short-answer' ? 'Correct Answer' : 'Sample Answer / Rubric'}
                  </label>
                  <Textarea
                    value={typeof formCorrectAnswer === 'string' ? formCorrectAnswer : ''}
                    onChange={(e) => setFormCorrectAnswer(e.target.value)}
                    placeholder={formType === 'short-answer' ? 'Enter the correct answer...' : 'Enter sample answer or grading rubric...'}
                    className="min-h-[80px]"
                  />
                </div>
              )}

              {/* Explanation */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Explanation</label>
                <Textarea
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Explain why this is the correct answer..."
                  className="min-h-[80px]"
                />
              </div>

              {/* Difficulty and Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Difficulty *</label>
                  <Select value={formDifficulty} onValueChange={(value: any) => setFormDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Points *</label>
                  <Input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Field and Course */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Field *</label>
                  <Select value={formFieldId} onValueChange={(value: string) => {
                    setFormFieldId(value);
                    setFormCourseId(''); // Reset course when field changes
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field" />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(field => (
                        <SelectItem key={field.id} value={field.id}>{field.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Course *</label>
                  <Select 
                    value={formCourseId} 
                    onValueChange={(value: string) => setFormCourseId(value)}
                    disabled={!formFieldId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={formFieldId ? "Select course" : "Select field first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {formFieldId && fields.find(f => f.id === formFieldId)?.courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags</label>
                <div className="flex items-center space-x-2 mb-2">
                  <Input
                    value={formTagInput}
                    onChange={(e) => setFormTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    placeholder="Add a tag and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Subject</label>
                <Input
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                  placeholder="Optional subject or topic"
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditDialog(false);
                    resetForm();
                    setEditingQuestion(null);
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSaveQuestion(true)}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-teal-500 to-purple-600"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Update Question
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ErrorBoundary>
  );
}