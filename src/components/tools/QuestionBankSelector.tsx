import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle,
  FileQuestion,
  BookOpen,
  Building2,
  X,
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
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

interface QuestionBankSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestions: (questions: Question[]) => void;
  alreadySelectedQuestions?: string[];
  maxQuestions?: number;
}

export function QuestionBankSelector({ 
  isOpen, 
  onClose, 
  onSelectQuestions, 
  alreadySelectedQuestions = [],
  maxQuestions 
}: QuestionBankSelectorProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(alreadySelectedQuestions);

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
      
      return matchesSearch && matchesDifficulty && matchesType && matchesField && matchesCourse && matchesSource && question.isActive;
    });
    
    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedDifficulty, selectedType, selectedField, selectedCourse, selectedSource]);

  const availableCourses = selectedField === 'all' ? 
    fields.flatMap(f => f.courses) :
    fields.find(f => f.id === selectedField)?.courses || [];

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        if (maxQuestions && prev.length >= maxQuestions) {
          return prev; // Don't add if max reached
        }
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      const questionsToSelect = filteredQuestions.slice(0, maxQuestions || filteredQuestions.length);
      setSelectedQuestions(questionsToSelect.map(q => q.id));
    }
  };

  const handleConfirmSelection = () => {
    const selectedQuestionObjects = questions.filter(q => selectedQuestions.includes(q.id));
    onSelectQuestions(selectedQuestionObjects);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple-choice': return <CheckSquare className="h-3 w-3" />;
      case 'true-false': return <CheckCircle className="h-3 w-3" />;
      case 'short-answer': return <FileQuestion className="h-3 w-3" />;
      case 'essay': return <FileQuestion className="h-3 w-3" />;
      default: return <FileQuestion className="h-3 w-3" />;
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

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2 text-teal-600" />
            Select Questions from Bank
          </DialogTitle>
          <DialogDescription>
            Choose questions from your question bank to add to this quiz
            {maxQuestions && ` (max ${maxQuestions} questions)`}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-full space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div className="md:col-span-2">
                  <Input
                    placeholder="Search questions..."
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
                  setSelectedCourse('all');
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
              </div>
            </CardContent>
          </Card>

          {/* Selection Summary */}
          <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedQuestions.length} question{selectedQuestions.length !== 1 ? 's' : ''} selected
              </span>
              {maxQuestions && (
                <span className="text-xs text-blue-700">
                  (max {maxQuestions})
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredQuestions.length === 0}
              >
                {selectedQuestions.length === filteredQuestions.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmSelection}
                disabled={selectedQuestions.length === 0}
                className="bg-gradient-to-r from-teal-500 to-purple-600"
              >
                Add {selectedQuestions.length} Question{selectedQuestions.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>

          {/* Questions List */}
          <div className="flex-1 overflow-y-auto">
            {filteredQuestions.length === 0 ? (
              <div className="text-center py-12">
                <FileQuestion className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.map((question) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={selectedQuestions.includes(question.id)}
                          onCheckedChange={() => handleSelectQuestion(question.id)}
                          className="mt-1"
                          disabled={maxQuestions && !selectedQuestions.includes(question.id) && selectedQuestions.length >= maxQuestions}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 mb-2 leading-relaxed">
                            {question.question}
                          </p>
                          
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Badge className={`flex items-center gap-1 ${getDifficultyColor(question.difficulty)}`}>
                              {getTypeIcon(question.type)}
                              {question.difficulty}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {question.fieldName}
                            </Badge>
                            
                            <Badge variant="outline" className="flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              {question.courseName}
                            </Badge>
                          </div>
                          
                          {question.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {question.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}