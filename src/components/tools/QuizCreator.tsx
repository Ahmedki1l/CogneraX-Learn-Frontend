import React, { useState } from 'react';
import { 
  FileQuestion, 
  Plus, 
  Brain, 
  Clock,
  Users,
  Settings,
  Save,
  Play,
  Trash2,
  Edit,
  BarChart3,
  Copy,
  CheckCircle,
  AlertCircle,
  Download,
  Database,
  Search,
  Filter,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { QuestionBankSelector } from './QuestionBankSelector';

interface QuizCreatorProps {
  user?: any;
}

export function QuizCreator({ user }: QuizCreatorProps = {}) {
  const [quizTitle, setQuizTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    difficulty: 'medium'
  });

  const [aiGenerated, setAiGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // AI Credits - mock data (in real app would come from user context)
  const aiCredits = {
    available: user?.aiCredits || 150,
    used: user?.aiCreditsUsed || 45,
    total: user?.aiCreditsTotal || 200
  };
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [attemptsAllowed, setAttemptsAllowed] = useState('');
  const [randomizeQuestions, setRandomizeQuestions] = useState(false);
  const [sourceContent, setSourceContent] = useState('');
  const [questionCount, setQuestionCount] = useState('5');
  const [difficultyDistribution, setDifficultyDistribution] = useState('mixed');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState('mc');
  const [showQuestionBankSelector, setShowQuestionBankSelector] = useState(false);
  const [aiGenerationMode, setAiGenerationMode] = useState('new'); // 'new', 'bank', 'hybrid'
  const [aiNewQuestionCount, setAiNewQuestionCount] = useState('5');
  const [aiBankQuestionCount, setAiBankQuestionCount] = useState('5');
  const [showAiBankSelector, setShowAiBankSelector] = useState(false);
  
  // Question Bank integration
  const [questionBank] = useState([
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
      subject: 'React',
      course: 'React Fundamentals',
      source: 'ai-generated',
      tags: ['hooks', 'state', 'functional-components'],
      usageCount: 5
    },
    {
      id: '2',
      question: 'JavaScript is a compiled language.',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 1,
      explanation: 'JavaScript is an interpreted language, not a compiled language.',
      difficulty: 'easy',
      subject: 'JavaScript',
      course: 'Advanced JavaScript',
      source: 'manual',
      tags: ['basics', 'language-features'],
      usageCount: 12
    },
    {
      id: '3',
      question: 'Which method is used to add an element to the end of an array in JavaScript?',
      type: 'short-answer',
      correctAnswer: 'push',
      explanation: 'The push() method adds one or more elements to the end of an array and returns the new length.',
      difficulty: 'easy',
      subject: 'JavaScript',
      course: 'JavaScript Basics',
      source: 'ai-generated',
      tags: ['arrays', 'methods'],
      usageCount: 8
    }
  ]);
  
  const [bankSearchTerm, setBankSearchTerm] = useState('');
  const [bankSelectedDifficulty, setBankSelectedDifficulty] = useState('all');
  const [bankSelectedType, setBankSelectedType] = useState('all');
  const [bankSelectedSubject, setBankSelectedSubject] = useState('all');
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [showQuestionBank, setShowQuestionBank] = useState(false);

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'essay', label: 'Essay' }
  ];

  const addQuestion = () => {
    if (!currentQuestion.question.trim()) {
      toast.error('Please enter a question');
      return;
    }
    
    if (currentQuestion.type === 'multiple-choice') {
      const emptyOptions = currentQuestion.options.filter(opt => !opt.trim()).length;
      if (emptyOptions > 0) {
        toast.error('Please fill in all answer options');
        return;
      }
    }
    
    const newQuestion = { ...currentQuestion, id: Date.now() };
    setQuestions([...questions, newQuestion]);
    
    // Add to question bank for future use
    // In a real app, this would save to the backend
    
    setCurrentQuestion({
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      difficulty: 'medium'
    });
    
    toast.success('Question added successfully!');
  };

  const handleQuestionsFromBank = (selectedQuestions) => {
    setQuestions(prev => [...prev, ...selectedQuestions]);
    toast.success(`Added ${selectedQuestions.length} question${selectedQuestions.length !== 1 ? 's' : ''} from bank!`);
  };

  const handleAiQuestionsFromBank = (selectedQuestions) => {
    if (aiGenerationMode === 'bank') {
      setQuestions(selectedQuestions);
      setAiGenerated(true);
      setQuizTitle('Question Bank Quiz');
      toast.success(`Created quiz with ${selectedQuestions.length} questions from bank!`);
    } else if (aiGenerationMode === 'hybrid') {
      // For hybrid mode, just add the bank questions - AI questions will be added when generate is clicked
      const existingNonBankQuestions = questions.filter(q => !q.source || q.source === 'manual' || q.source === 'ai-generated');
      setQuestions([...existingNonBankQuestions, ...selectedQuestions]);
      toast.success(`Selected ${selectedQuestions.length} questions from bank for hybrid quiz!`);
    }
  };

  const addQuestionsFromBank = () => {
    if (selectedBankQuestions.length === 0) {
      toast.error('Please select questions from the bank');
      return;
    }

    const questionsToAdd = questionBank.filter(q => selectedBankQuestions.includes(q.id));
    const newQuestions = questionsToAdd.map(q => ({
      ...q,
      id: Date.now() + Math.random() // Ensure unique IDs
    }));

    setQuestions([...questions, ...newQuestions]);
    setSelectedBankQuestions([]);
    setShowQuestionBank(false);
    
    toast.success(`Added ${questionsToAdd.length} questions from bank!`);
  };

  const handleBankQuestionSelect = (questionId) => {
    setSelectedBankQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const filteredBankQuestions = questionBank.filter(question => {
    const matchesSearch = question.question.toLowerCase().includes(bankSearchTerm.toLowerCase()) ||
                         question.tags.some(tag => tag.toLowerCase().includes(bankSearchTerm.toLowerCase())) ||
                         question.subject.toLowerCase().includes(bankSearchTerm.toLowerCase());
    
    const matchesDifficulty = bankSelectedDifficulty === 'all' || question.difficulty === bankSelectedDifficulty;
    const matchesType = bankSelectedType === 'all' || question.type === bankSelectedType;
    const matchesSubject = bankSelectedSubject === 'all' || question.subject === bankSelectedSubject;
    
    return matchesSearch && matchesDifficulty && matchesType && matchesSubject;
  });

  const generateAIQuiz = async () => {
    // Check AI credits for AI generation
    if ((aiGenerationMode === 'new' || aiGenerationMode === 'hybrid') && aiCredits.available <= 0) {
      toast.error('Insufficient AI credits. Please contact your administrator to add more credits.');
      return;
    }
    
    // Validation based on generation mode
    if (aiGenerationMode === 'new' && !sourceContent) {
      toast.error('Please select source content first');
      return;
    }
    
    if (aiGenerationMode === 'bank') {
      toast.error('Please select questions from the bank first');
      return;
    }
    
    if (aiGenerationMode === 'hybrid' && !sourceContent) {
      toast.error('Please select source content for AI generation');
      return;
    }

    setIsGenerating(true);
    setAiGenerated(false);
    
    try {
      // Different processing based on mode
      if (aiGenerationMode === 'new') {
        // Original AI generation logic
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const aiQuestions = [
        {
          id: Date.now() + 1,
          type: 'multiple-choice',
          question: 'What is the main purpose of React Hooks?',
          options: [
            'To replace class components entirely',
            'To add state and lifecycle methods to functional components',
            'To improve performance',
            'To handle routing'
          ],
          correctAnswer: 1,
          explanation: 'React Hooks allow you to use state and other React features in functional components without writing a class.',
          difficulty: 'medium'
        },
        {
          id: Date.now() + 2,
          type: 'multiple-choice',
          question: 'Which Hook is used for managing component state?',
          options: ['useEffect', 'useState', 'useContext', 'useCallback'],
          correctAnswer: 1,
          explanation: 'useState is the Hook that lets you add React state to functional components.',
          difficulty: 'easy'
        },
        {
          id: Date.now() + 3,
          type: 'true-false',
          question: 'useEffect runs after every render by default.',
          options: ['True', 'False'],
          correctAnswer: 0,
          explanation: 'useEffect runs after every completed render, making it perfect for side effects.',
          difficulty: 'medium'
        }
      ];
      
      // Generate more questions based on count
      const totalQuestions = parseInt(questionCount);
      const finalQuestions = [];
      for (let i = 0; i < totalQuestions; i++) {
        const baseQuestion = aiQuestions[i % aiQuestions.length];
        finalQuestions.push({
          ...baseQuestion,
          id: Date.now() + i,
          question: `${baseQuestion.question} (Question ${i + 1})`
        });
      }
      
        setQuestions(finalQuestions);
        setQuizTitle(`${sourceContent.replace('-', ' ').toUpperCase()} - AI Generated Quiz`);
        setAiGenerated(true);
        toast.success(`Successfully generated ${totalQuestions} questions! (Used ${Math.ceil(totalQuestions / 2)} AI credits)`);
        
      } else if (aiGenerationMode === 'hybrid') {
        // Hybrid generation - combine AI + bank questions
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const newQuestionCount = parseInt(aiNewQuestionCount);
        const bankQuestionCount = parseInt(aiBankQuestionCount);
        
        // Generate new AI questions
        const aiQuestions = [
          {
            id: Date.now() + 1,
            type: 'multiple-choice',
            question: 'What is the main purpose of React Hooks?',
            options: [
              'To replace class components entirely',
              'To add state and lifecycle methods to functional components',
              'To improve performance',
              'To handle routing'
            ],
            correctAnswer: 1,
            explanation: 'React Hooks allow you to use state and other React features in functional components without writing a class.',
            difficulty: 'medium',
            source: 'ai-generated'
          },
          {
            id: Date.now() + 2,
            type: 'true-false',
            question: 'useEffect runs after every render by default.',
            options: ['True', 'False'],
            correctAnswer: 0,
            explanation: 'useEffect runs after every completed render, making it perfect for side effects.',
            difficulty: 'medium',
            source: 'ai-generated'
          }
        ];
        
        const newAiQuestions = [];
        for (let i = 0; i < newQuestionCount; i++) {
          const baseQuestion = aiQuestions[i % aiQuestions.length];
          newAiQuestions.push({
            ...baseQuestion,
            id: Date.now() + i + 100,
            question: i < aiQuestions.length ? baseQuestion.question : `${baseQuestion.question} (Variant ${i + 1})`
          });
        }
        
        // Note: Bank questions would be selected separately via the bank selector
        // This would be combined with the questions already selected from the bank
        const existingBankQuestions = questions.filter(q => q.source && q.source !== 'manual');
        const combinedQuestions = [...existingBankQuestions, ...newAiQuestions];
        
        setQuestions(combinedQuestions);
        setQuizTitle(`Hybrid Quiz - ${sourceContent.replace('-', ' ').toUpperCase()}`);
        setAiGenerated(true);
        toast.success(`Generated hybrid quiz with ${newQuestionCount} new questions! (Used ${Math.ceil(newQuestionCount / 2)} AI credits)`);
      }
    } catch (error) {
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveQuizDraft = async () => {
    if (!quizTitle.trim()) {
      toast.error('Please enter a quiz title');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsSaving(true);
    try {
      // Simulate save
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Quiz draft saved successfully!');
    } catch (error) {
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  const publishQuiz = async () => {
    if (!quizTitle.trim() || !selectedCourse || !timeLimit || !attemptsAllowed) {
      toast.error('Please fill in all required quiz settings');
      return;
    }
    if (questions.length === 0) {
      toast.error('Please add at least one question');
      return;
    }

    setIsPublishing(true);
    try {
      // Simulate publish
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Quiz published successfully! Students can now access it.');
    } catch (error) {
      toast.error('Failed to publish quiz');
    } finally {
      setIsPublishing(false);
    }
  };

  const duplicateQuiz = async (quizTitle) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Quiz "${quizTitle}" duplicated successfully!`);
    } catch (error) {
      toast.error('Failed to duplicate quiz');
    }
  };

  const viewQuizResults = (quizTitle) => {
    toast.info(`Opening results for "${quizTitle}"`);
    // In a real app, this would navigate to results page
  };

  const editQuiz = (quizTitle) => {
    toast.info(`Opening editor for "${quizTitle}"`);
    // In a real app, this would load the quiz for editing
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
    toast.success('Question removed successfully');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz & Exam Creator</h1>
          <p className="text-gray-600 mt-1">
            Create engaging quizzes and exams with AI assistance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="font-medium text-purple-600">AI-Powered</span>
        </div>
      </div>

      <Tabs defaultValue="create" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="create">Create Quiz</TabsTrigger>
          <TabsTrigger value="ai-generate">AI Generator</TabsTrigger>
          <TabsTrigger value="manage">Manage Quizzes</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          {/* Quiz Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-teal-600" />
                Quiz Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quiz Title
                  </label>
                  <Input
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    placeholder="Enter quiz title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course
                  </label>
                  <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react">React Fundamentals</SelectItem>
                      <SelectItem value="javascript">Advanced JavaScript</SelectItem>
                      <SelectItem value="database">Database Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <Input 
                    type="number" 
                    placeholder="60" 
                    value={timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attempts Allowed
                  </label>
                  <Select value={attemptsAllowed} onValueChange={setAttemptsAllowed}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 attempt</SelectItem>
                      <SelectItem value="3">3 attempts</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2 mt-6">
                  <Switch 
                    id="randomize" 
                    checked={randomizeQuestions}
                    onCheckedChange={setRandomizeQuestions}
                  />
                  <label htmlFor="randomize" className="text-sm font-medium">
                    Randomize Questions
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Question */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-blue-600" />
                Add New Question
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type
                  </label>
                  <Select 
                    value={currentQuestion.type}
                    onValueChange={(value) => setCurrentQuestion({...currentQuestion, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {questionTypeOptions.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty
                  </label>
                  <Select 
                    value={currentQuestion.difficulty}
                    onValueChange={(value) => setCurrentQuestion({...currentQuestion, difficulty: value})}
                  >
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question
                </label>
                <Textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                  placeholder="Enter your question here..."
                  rows={3}
                />
              </div>

              {currentQuestion.type === 'multiple-choice' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options
                  </label>
                  {currentQuestion.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={currentQuestion.correctAnswer === index}
                        onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: index})}
                        className="h-4 w-4 text-teal-600"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...currentQuestion.options];
                          newOptions[index] = e.target.value;
                          setCurrentQuestion({...currentQuestion, options: newOptions});
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'true-false' && (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Correct Answer
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tf-answer"
                        checked={currentQuestion.correctAnswer === 0}
                        onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: 0})}
                        className="h-4 w-4 text-teal-600 mr-2"
                      />
                      True
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tf-answer"
                        checked={currentQuestion.correctAnswer === 1}
                        onChange={() => setCurrentQuestion({...currentQuestion, correctAnswer: 1})}
                        className="h-4 w-4 text-teal-600 mr-2"
                      />
                      False
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <Textarea
                  value={currentQuestion.explanation}
                  onChange={(e) => setCurrentQuestion({...currentQuestion, explanation: e.target.value})}
                  placeholder="Explain why this is the correct answer..."
                  rows={2}
                />
              </div>

              <div className="flex space-x-3">
                <Button onClick={addQuestion} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
                <Button 
                  onClick={() => setShowQuestionBankSelector(true)}
                  variant="outline"
                  className="flex-1 border-teal-300 text-teal-700 hover:bg-teal-50"
                >
                  <Database className="h-4 w-4 mr-2" />
                  From Bank
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions List */}
          {questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <FileQuestion className="h-5 w-5 mr-2 text-purple-600" />
                      Quiz Questions ({questions.length})
                    </span>
                    {questions.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          <Database className="h-3 w-3 mr-1" />
                          {questions.filter(q => q.source && q.source !== 'manual').length} from bank
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Plus className="h-3 w-3 mr-1" />
                          {questions.filter(q => !q.source || q.source === 'manual').length} manual
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={saveQuizDraft}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Draft
                        </>
                      )}
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-teal-500 to-purple-600"
                      onClick={publishQuiz}
                      disabled={isPublishing}
                    >
                      {isPublishing ? (
                        <>
                          <div className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Publish Quiz
                        </>
                      )}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-500">
                              Question {index + 1}
                            </span>
                            <Badge variant="outline" className={getDifficultyColor(question.difficulty)}>
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {questionTypeOptions.find(t => t.value === question.type)?.label}
                            </Badge>
                            {(question.source && question.source !== 'manual') ? (
                              <Badge variant="outline" className="text-teal-700 border-teal-300 bg-teal-50">
                                <Database className="h-3 w-3 mr-1" />
                                From Bank
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                                <Plus className="h-3 w-3 mr-1" />
                                Manual
                              </Badge>
                            )}
                          </div>
                          <p className="font-medium text-gray-900 mb-2">{question.question}</p>
                          
                          {question.type === 'multiple-choice' && (
                            <div className="space-y-1">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className={`text-sm ${
                                  optIndex === question.correctAnswer 
                                    ? 'text-green-700 font-medium' 
                                    : 'text-gray-600'
                                }`}>
                                  {optIndex === question.correctAnswer ? '✓ ' : '• '}{option}
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {question.explanation && (
                            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-800">
                              <strong>Explanation:</strong> {question.explanation}
                            </div>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeQuestion(question.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="ai-generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-purple-600" />
                AI Quiz Generator
              </CardTitle>
              <CardDescription>
                Generate quizzes automatically from your course content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* AI Generation Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quiz Generation Method
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      aiGenerationMode === 'new' 
                        ? 'border-purple-500 bg-purple-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAiGenerationMode('new')}
                  >
                    <div className="flex items-center space-x-3">
                      <Brain className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium">Create New</div>
                        <div className="text-sm text-gray-600">Generate entirely new questions</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      aiGenerationMode === 'bank' 
                        ? 'border-teal-500 bg-teal-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAiGenerationMode('bank')}
                  >
                    <div className="flex items-center space-x-3">
                      <Database className="h-5 w-5 text-teal-600" />
                      <div>
                        <div className="font-medium">From Bank</div>
                        <div className="text-sm text-gray-600">Select existing questions</div>
                      </div>
                    </div>
                  </div>
                  
                  <div 
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      aiGenerationMode === 'hybrid' 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAiGenerationMode('hybrid')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <Database className="h-4 w-4 text-teal-600 -ml-1" />
                      </div>
                      <div>
                        <div className="font-medium">Hybrid</div>
                        <div className="text-sm text-gray-600">Mix new & bank questions</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuration based on selected mode */}
              {aiGenerationMode === 'new' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source Content
                      </label>
                  <Select value={sourceContent} onValueChange={setSourceContent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="react-hooks">React Hooks Tutorial</SelectItem>
                      <SelectItem value="js-advanced">Advanced JavaScript Concepts</SelectItem>
                      <SelectItem value="database">Database Design Principles</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <Select value={questionCount} onValueChange={setQuestionCount}>
                    <SelectTrigger>
                      <SelectValue placeholder="5" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 questions</SelectItem>
                      <SelectItem value="10">10 questions</SelectItem>
                      <SelectItem value="15">15 questions</SelectItem>
                      <SelectItem value="20">20 questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Distribution
                  </label>
                  <Select value={difficultyDistribution} onValueChange={setDifficultyDistribution}>
                    <SelectTrigger>
                      <SelectValue placeholder="Mixed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Mostly Easy</SelectItem>
                      <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                      <SelectItem value="hard">Mostly Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Types
                  </label>
                  <Select value={selectedQuestionTypes} onValueChange={setSelectedQuestionTypes}>
                    <SelectTrigger>
                      <SelectValue placeholder="Multiple Choice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mc">Multiple Choice Only</SelectItem>
                      <SelectItem value="mixed">Mixed Types</SelectItem>
                      <SelectItem value="tf">True/False Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
                </div>
              )}

              {/* Bank Mode Configuration */}
              {aiGenerationMode === 'bank' && (
                <div className="space-y-4">
                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Database className="h-5 w-5 text-teal-600" />
                      <h4 className="font-medium text-teal-900">Select from Question Bank</h4>
                    </div>
                    <p className="text-sm text-teal-700">
                      Choose existing questions from your question bank organized by field and course.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => setShowAiBankSelector(true)}
                    variant="outline"
                    className="w-full border-teal-300 text-teal-700 hover:bg-teal-50"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Select Questions from Bank
                  </Button>
                </div>
              )}

              {/* Hybrid Mode Configuration */}
              {aiGenerationMode === 'hybrid' && (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex">
                        <Brain className="h-4 w-4 text-purple-600" />
                        <Database className="h-4 w-4 text-teal-600 -ml-1" />
                      </div>
                      <h4 className="font-medium text-indigo-900">Hybrid Generation</h4>
                    </div>
                    <p className="text-sm text-indigo-700">
                      Combine AI-generated questions with existing questions from your bank.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
                      <h5 className="font-medium text-purple-900 mb-3 flex items-center">
                        <Brain className="h-4 w-4 mr-2" />
                        AI Generated Questions
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            Source Content
                          </label>
                          <Select value={sourceContent} onValueChange={setSourceContent}>
                            <SelectTrigger className="border-purple-300">
                              <SelectValue placeholder="Select content source" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="react-hooks">React Hooks Tutorial</SelectItem>
                              <SelectItem value="js-advanced">Advanced JavaScript Concepts</SelectItem>
                              <SelectItem value="database">Database Design Principles</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-purple-700 mb-1">
                            New Questions
                          </label>
                          <Select value={aiNewQuestionCount} onValueChange={setAiNewQuestionCount}>
                            <SelectTrigger className="border-purple-300">
                              <SelectValue placeholder="3" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 questions</SelectItem>
                              <SelectItem value="3">3 questions</SelectItem>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="7">7 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 border-2 border-teal-200 rounded-lg bg-teal-50">
                      <h5 className="font-medium text-teal-900 mb-3 flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        Bank Questions
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-teal-700 mb-1">
                            From Bank
                          </label>
                          <Select value={aiBankQuestionCount} onValueChange={setAiBankQuestionCount}>
                            <SelectTrigger className="border-teal-300">
                              <SelectValue placeholder="2" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="2">2 questions</SelectItem>
                              <SelectItem value="3">3 questions</SelectItem>
                              <SelectItem value="5">5 questions</SelectItem>
                              <SelectItem value="7">7 questions</SelectItem>
                              <SelectItem value="10">10 questions</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <Button 
                          onClick={() => setShowAiBankSelector(true)}
                          variant="outline"
                          size="sm"
                          className="w-full border-teal-300 text-teal-700 hover:bg-teal-100"
                        >
                          <Database className="h-3 w-3 mr-1" />
                          Select from Bank
                        </Button>
                        
                        {questions.filter(q => q.source && q.source !== 'manual' && q.source !== 'ai-generated').length > 0 && (
                          <div className="text-xs text-teal-600 bg-teal-100 px-2 py-1 rounded">
                            {questions.filter(q => q.source && q.source !== 'manual' && q.source !== 'ai-generated').length} questions selected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Distribution
                      </label>
                      <Select value={difficultyDistribution} onValueChange={setDifficultyDistribution}>
                        <SelectTrigger>
                          <SelectValue placeholder="Mixed" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Mostly Easy</SelectItem>
                          <SelectItem value="mixed">Mixed Difficulty</SelectItem>
                          <SelectItem value="hard">Mostly Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Question Types
                      </label>
                      <Select value={selectedQuestionTypes} onValueChange={setSelectedQuestionTypes}>
                        <SelectTrigger>
                          <SelectValue placeholder="Multiple Choice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mc">Multiple Choice Only</SelectItem>
                          <SelectItem value="mixed">Mixed Types</SelectItem>
                          <SelectItem value="tf">True/False Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={generateAIQuiz}
                disabled={isGenerating || 
                  (aiGenerationMode === 'new' && !sourceContent) ||
                  (aiGenerationMode === 'hybrid' && !sourceContent)
                }
                className={`w-full ${
                  aiGenerationMode === 'new' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                    : aiGenerationMode === 'bank'
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700'
                    : 'bg-gradient-to-r from-purple-500 to-teal-600 hover:from-purple-600 hover:to-teal-700'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    {aiGenerationMode === 'new' && (
                      <>
                        <Brain className="h-4 w-4 mr-2" />
                        Generate Quiz with AI
                      </>
                    )}
                    {aiGenerationMode === 'bank' && (
                      <>
                        <Database className="h-4 w-4 mr-2" />
                        Use Selected Questions
                      </>
                    )}
                    {aiGenerationMode === 'hybrid' && (
                      <>
                        <div className="flex mr-2">
                          <Brain className="h-4 w-4 text-white" />
                          <Database className="h-4 w-4 text-white -ml-1" />
                        </div>
                        Generate Hybrid Quiz
                      </>
                    )}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {aiGenerated && questions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  ✅ {aiGenerationMode === 'hybrid' ? 'Hybrid Quiz' : 'AI Quiz'} Generated Successfully!
                </CardTitle>
                <CardDescription>
                  Review the generated questions and make any necessary adjustments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">{quizTitle}</h4>
                  <p className="text-sm text-green-700">
                    {aiGenerationMode === 'new' && `Generated ${questions.length} questions with explanations based on ${sourceContent.replace('-', ' ')} content.`}
                    {aiGenerationMode === 'hybrid' && `Created hybrid quiz with ${questions.filter(q => q.source === 'ai-generated').length} AI-generated and ${questions.filter(q => q.source && q.source !== 'ai-generated' && q.source !== 'manual').length} bank questions.`}
                    {aiGenerationMode === 'bank' && `Selected ${questions.length} questions from the question bank.`}
                    You can edit, add, or remove questions as needed.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Existing Quizzes</CardTitle>
              <CardDescription>
                View, edit, and manage your published quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: 'React Hooks Fundamentals', questions: 15, attempts: 42, avgScore: 87 },
                  { title: 'JavaScript ES6 Features', questions: 20, attempts: 38, avgScore: 79 },
                  { title: 'Database Normalization', questions: 12, attempts: 23, avgScore: 91 }
                ].map((quiz, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                        <span>{quiz.questions} questions</span>
                        <span>{quiz.attempts} attempts</span>
                        <span>Avg: {quiz.avgScore}%</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => editQuiz(quiz.title)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => viewQuizResults(quiz.title)}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Results
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => duplicateQuiz(quiz.title)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Question Bank Selector */}
      <QuestionBankSelector
        isOpen={showQuestionBankSelector}
        onClose={() => setShowQuestionBankSelector(false)}
        onSelectQuestions={handleQuestionsFromBank}
        alreadySelectedQuestions={questions.map(q => q.id)}
        maxQuestions={50}
      />

      {/* AI Bank Selector */}
      <QuestionBankSelector
        isOpen={showAiBankSelector}
        onClose={() => setShowAiBankSelector(false)}
        onSelectQuestions={handleAiQuestionsFromBank}
        alreadySelectedQuestions={questions.filter(q => q.source && q.source !== 'manual' && q.source !== 'ai-generated').map(q => q.id)}
        maxQuestions={aiGenerationMode === 'hybrid' ? parseInt(aiBankQuestionCount) : 50}
      />
    </div>
  );
}