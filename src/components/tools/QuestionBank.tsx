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
  Building2
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

interface Question {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
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

  // Mock data for demonstration - organized by Field -> Course -> Questions
  useEffect(() => {
    const mockQuestions: Question[] = [
      {
        id: '1',
        question: 'What is the main purpose of React Hooks?',
        type: 'multiple-choice',
        options: [
          'To replace class components entirely',
          'To add state and lifecycle methods to functional components',
          'To improve performance',
          'To handle routing'
        ],
        correctAnswer: 1,
        explanation: 'React Hooks allow you to use state and other React features in functional components without writing a class.',
        difficulty: 'medium',
        fieldId: 'cs-001',
        fieldName: 'Computer Science',
        courseId: 'cs-react-001',
        courseName: 'React Fundamentals',
        source: 'ai-generated',
        tags: ['hooks', 'state', 'functional-components'],
        createdAt: '2024-01-15T10:30:00Z',
        lastModified: '2024-01-15T10:30:00Z',
        usageCount: 5,
        isActive: true
      },
      {
        id: '2',
        question: 'JavaScript is a compiled language.',
        type: 'true-false',
        options: ['True', 'False'],
        correctAnswer: 1,
        explanation: 'JavaScript is an interpreted language, not a compiled language.',
        difficulty: 'easy',
        fieldId: 'cs-001',
        fieldName: 'Computer Science',
        courseId: 'cs-js-001',
        courseName: 'Advanced JavaScript',
        source: 'manual',
        tags: ['basics', 'language-features'],
        createdAt: '2024-01-14T14:20:00Z',
        lastModified: '2024-01-14T14:20:00Z',
        usageCount: 12,
        isActive: true
      },
      {
        id: '3',
        question: 'Explain the concept of database normalization and its benefits.',
        type: 'essay',
        correctAnswer: 'Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity...',
        explanation: 'Expected answer should cover: elimination of redundancy, data integrity, reduced storage space, and easier maintenance.',
        difficulty: 'hard',
        fieldId: 'cs-001',
        fieldName: 'Computer Science',
        courseId: 'cs-db-001',
        courseName: 'Database Design',
        source: 'exam',
        tags: ['normalization', 'database-design', 'theory'],
        createdAt: '2024-01-13T09:15:00Z',
        lastModified: '2024-01-13T09:15:00Z',
        usageCount: 3,
        isActive: true
      },
      {
        id: '4',
        question: 'Which method is used to add an element to the end of an array in JavaScript?',
        type: 'short-answer',
        correctAnswer: 'push',
        explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.',
        difficulty: 'easy',
        fieldId: 'cs-001',
        fieldName: 'Computer Science',
        courseId: 'cs-js-002',
        courseName: 'JavaScript Basics',
        source: 'ai-generated',
        tags: ['arrays', 'methods'],
        createdAt: '2024-01-12T16:45:00Z',
        lastModified: '2024-01-12T16:45:00Z',
        usageCount: 8,
        isActive: true
      },
      {
        id: '5',
        question: 'What is the derivative of x²?',
        type: 'short-answer',
        correctAnswer: '2x',
        explanation: 'Using the power rule: d/dx(x^n) = n*x^(n-1), so d/dx(x²) = 2x¹ = 2x',
        difficulty: 'medium',
        fieldId: 'math-001',
        fieldName: 'Mathematics',
        courseId: 'math-calc-001',
        courseName: 'Calculus I',
        source: 'manual',
        tags: ['derivatives', 'power-rule', 'calculus'],
        createdAt: '2024-01-11T11:20:00Z',
        lastModified: '2024-01-11T11:20:00Z',
        usageCount: 15,
        isActive: true
      },
      {
        id: '6',
        question: 'The integral of 1/x dx is:',
        type: 'multiple-choice',
        options: ['x²/2', 'ln|x| + C', '1/x²', 'e^x + C'],
        correctAnswer: 1,
        explanation: 'The integral of 1/x is the natural logarithm: ∫(1/x)dx = ln|x| + C',
        difficulty: 'medium',
        fieldId: 'math-001',
        fieldName: 'Mathematics',
        courseId: 'math-calc-001',
        courseName: 'Calculus I',
        source: 'ai-generated',
        tags: ['integration', 'logarithms', 'calculus'],
        createdAt: '2024-01-10T15:30:00Z',
        lastModified: '2024-01-10T15:30:00Z',
        usageCount: 7,
        isActive: true
      }
    ];

    setQuestions(mockQuestions);
    setFilteredQuestions(mockQuestions);

    // Build field/course hierarchy
    const fieldMap = new Map<string, Field>();
    
    mockQuestions.forEach(question => {
      if (!fieldMap.has(question.fieldId)) {
        fieldMap.set(question.fieldId, {
          id: question.fieldId,
          name: question.fieldName,
          courses: [],
          questionCount: 0
        });
      }
      
      const field = fieldMap.get(question.fieldId)!;
      field.questionCount++;
      
      let course = field.courses.find(c => c.id === question.courseId);
      if (!course) {
        course = {
          id: question.courseId,
          name: question.courseName,
          fieldId: question.fieldId,
          fieldName: question.fieldName,
          questionCount: 0
        };
        field.courses.push(course);
      }
      course.questionCount++;
    });

    setFields(Array.from(fieldMap.values()));
  }, []);

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

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowEditDialog(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, isActive: false } : q
      ));
      
      toast.success('Question moved to archive');
    } catch (error) {
      toast.error('Failed to delete question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateQuestion = async (question: Question) => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const duplicatedQuestion: Question = {
        ...question,
        id: Date.now().toString(),
        question: `${question.question} (Copy)`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        usageCount: 0
      };
      
      setQuestions(prev => [duplicatedQuestion, ...prev]);
      toast.success('Question duplicated successfully');
    } catch (error) {
      toast.error('Failed to duplicate question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('No questions selected');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setQuestions(prev => prev.map(q => 
        selectedQuestions.includes(q.id) ? { ...q, isActive: false } : q
      ));
      
      setSelectedQuestions([]);
      toast.success(`${selectedQuestions.length} questions moved to archive`);
    } catch (error) {
      toast.error('Failed to delete selected questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportQuestions = async () => {
    if (selectedQuestions.length === 0) {
      toast.error('No questions selected for export');
      return;
    }

    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const exportData = questions.filter(q => selectedQuestions.includes(q.id));
      
      toast.success(`${selectedQuestions.length} questions exported successfully`);
    } catch (error) {
      toast.error('Failed to export questions');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your question library by field and course
          </p>
          {getBreadcrumbs().length > 0 && (
            <div className="flex items-center space-x-2 mt-2 text-sm text-gray-500">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewChange('hierarchy')}
                className="p-0 h-auto text-teal-600 hover:text-teal-700"
              >
                All Fields
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
              Hierarchy
            </Button>
            <Button
              variant={currentView === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleViewChange('list')}
              className={currentView === 'list' ? 'bg-gradient-to-r from-teal-500 to-purple-600' : ''}
            >
              <Database className="h-4 w-4 mr-1" />
              List View
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-teal-600" />
            <span className="font-medium text-teal-600">{questions.filter(q => q.isActive).length} Questions</span>
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
                <p className="text-sm font-medium text-gray-500">Total Questions</p>
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
                <p className="text-sm font-medium text-gray-500">AI Generated</p>
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
                <p className="text-sm font-medium text-gray-500">Most Used</p>
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
                <p className="text-sm font-medium text-gray-500">Fields</p>
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
            Search & Filter
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
            
            <Select value={selectedField} onValueChange={(value) => {
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
              Field & Course Hierarchy
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFieldClick(field.id);
                        }}
                        className="text-teal-600 border-teal-300 hover:bg-teal-50"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Questions
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
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Questions
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-gray-600"
                                >
                                  <Plus className="h-3 w-3 mr-1" />
                                  Add Question
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No fields found</h3>
                  <p className="text-gray-500 mb-4">
                    Start organizing your questions by creating fields and courses
                  </p>
                  <Button className="bg-gradient-to-r from-teal-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Field
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
                {selectedQuestions.length === filteredQuestions.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-gradient-to-r from-teal-500 to-purple-600">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Question</DialogTitle>
                    <DialogDescription>
                      Create a new question to add to your question bank
                    </DialogDescription>
                  </DialogHeader>
                  {/* Add question form would go here */}
                  <div className="text-center py-8 text-gray-500">
                    Question creation form coming soon...
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
                {searchTerm || selectedDifficulty !== 'all' || selectedType !== 'all' || selectedSubject !== 'all' || selectedSource !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Start building your question bank by adding your first question'
                }
              </p>
              <Button onClick={() => setShowAddDialog(true)} className="bg-gradient-to-r from-teal-500 to-purple-600">
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
                            <Badge className={`flex items-center gap-1 ${getDifficultyColor(question.difficulty)}`}>
                              {getTypeIcon(question.type)}
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
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Question</DialogTitle>
            <DialogDescription>
              Make changes to your question
            </DialogDescription>
          </DialogHeader>
          {editingQuestion && (
            <div className="text-center py-8 text-gray-500">
              Question editing form coming soon...
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}