import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Award, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Target,
  BookOpen,
  BarChart3,
  CheckCircle,
  XCircle,
  MinusCircle,
  Eye,
  Download,
  Repeat
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { toast } from 'sonner';

interface QuizAttempt {
  id: string;
  quizTitle: string;
  course: string;
  instructor: string;
  attemptNumber: number;
  maxAttempts: number;
  score: number;
  maxScore: number;
  percentage: number;
  timeSpent: string;
  dateTaken: string;
  status: 'completed' | 'in_progress' | 'failed';
  questions?: QuestionResult[];
  feedback?: string;
  canRetake: boolean;
  retakeAvailableDate?: string;
}

interface QuestionResult {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  feedback?: string;
}

interface QuizResultsProps {
  user?: any;
}

export function QuizResults({ user }: QuizResultsProps) {
  const [selectedQuiz, setSelectedQuiz] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);

  // Fetch quiz attempts from backend
  React.useEffect(() => {
    const fetchQuizAttempts = async () => {
      setLoading(true);
      try {
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (userId) {
          // Fetch quiz attempts - this would need to be implemented in the API
          // For now, we'll use empty state
          console.log('📊 Fetching quiz attempts for user:', userId);
          setQuizAttempts([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch quiz attempts:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Quiz attempts endpoint not implemented yet');
          setQuizAttempts([]);
        } else {
          toast.error('Failed to load quiz attempts');
          setQuizAttempts([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchQuizAttempts();
  }, [user?.id, user?._id]);

  // Mock data for quiz attempts (fallback)
  const mockQuizAttempts: QuizAttempt[] = [
    {
      id: '1',
      quizTitle: 'React Hooks Fundamentals',
      course: 'Advanced React Development',
      instructor: 'Brad Traversy',
      attemptNumber: 2,
      maxAttempts: 3,
      score: 18,
      maxScore: 20,
      percentage: 90,
      timeSpent: '12 minutes',
      dateTaken: '2024-11-15',
      status: 'completed',
      canRetake: true,
      retakeAvailableDate: '2024-11-22',
      questions: [
        {
          id: '1',
          question: 'Which hook is used to manage component state?',
          type: 'multiple_choice',
          userAnswer: 'useState',
          correctAnswer: 'useState',
          isCorrect: true,
          points: 2,
          maxPoints: 2
        },
        {
          id: '2',
          question: 'useEffect runs after every render by default.',
          type: 'true_false',
          userAnswer: 'True',
          correctAnswer: 'True',
          isCorrect: true,
          points: 1,
          maxPoints: 1
        },
        {
          id: '3',
          question: 'What is the cleanup function in useEffect used for?',
          type: 'short_answer',
          userAnswer: 'To prevent memory leaks',
          correctAnswer: 'To clean up side effects and prevent memory leaks',
          isCorrect: false,
          points: 1,
          maxPoints: 2,
          feedback: 'Good understanding, but could be more specific about side effects.'
        }
      ]
    },
    {
      id: '2',
      quizTitle: 'Machine Learning Basics',
      course: 'Machine Learning A-Z',
      instructor: 'Kirill Eremenko',
      attemptNumber: 1,
      maxAttempts: 2,
      score: 22,
      maxScore: 25,
      percentage: 88,
      timeSpent: '25 minutes',
      dateTaken: '2024-11-10',
      status: 'completed',
      canRetake: true,
      questions: []
    },
    {
      id: '3',
      quizTitle: 'Digital Marketing Strategy',
      course: 'Digital Marketing Masterclass',
      instructor: 'Sarah Johnson',
      attemptNumber: 1,
      maxAttempts: 3,
      score: 15,
      maxScore: 20,
      percentage: 75,
      timeSpent: '18 minutes',
      dateTaken: '2024-11-08',
      status: 'completed',
      canRetake: true,
      questions: []
    },
    {
      id: '4',
      quizTitle: 'Python Basics Assessment',
      course: 'Data Science with Python',
      instructor: 'Jose Portilla',
      attemptNumber: 1,
      maxAttempts: 2,
      score: 12,
      maxScore: 15,
      percentage: 80,
      timeSpent: '15 minutes',
      dateTaken: '2024-11-05',
      status: 'completed',
      canRetake: false,
      questions: []
    },
    {
      id: '5',
      quizTitle: 'Web Development Fundamentals',
      course: 'Complete Web Development Bootcamp',
      instructor: 'Dr. Angela Yu',
      attemptNumber: 1,
      maxAttempts: 3,
      score: 8,
      maxScore: 15,
      percentage: 53,
      timeSpent: '22 minutes',
      dateTaken: '2024-11-03',
      status: 'failed',
      canRetake: true,
      retakeAvailableDate: '2024-11-10'
    }
  ];

  // Performance data for charts
  const performanceData = [
    { date: '2024-11-03', score: 53 },
    { date: '2024-11-05', score: 80 },
    { date: '2024-11-08', score: 75 },
    { date: '2024-11-10', score: 88 },
    { date: '2024-11-15', score: 90 },
  ];

  const coursePerformance = [
    { course: 'React Dev', avgScore: 90 },
    { course: 'ML A-Z', avgScore: 88 },
    { course: 'Marketing', avgScore: 75 },
    { course: 'Python', avgScore: 80 },
    { course: 'Web Dev', avgScore: 53 },
  ];

  const averageScore = Math.round(quizAttempts.reduce((acc, quiz) => acc + quiz.percentage, 0) / quizAttempts.length);
  const totalQuizzes = quizAttempts.length;
  const passedQuizzes = quizAttempts.filter(quiz => quiz.percentage >= 70).length;
  const improvementTrend = performanceData[performanceData.length - 1].score - performanceData[0].score;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-800 border-green-200">Excellent</Badge>;
    if (percentage >= 80) return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Good</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pass</Badge>;
    return <Badge className="bg-red-100 text-red-800 border-red-200">Needs Improvement</Badge>;
  };

  const handleRetakeQuiz = async (quizId: string) => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Quiz retake started!');
    } catch (error) {
      toast.error('Failed to start quiz retake');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (quiz: QuizAttempt) => {
    setSelectedQuiz(quiz);
  };

  const handleDownloadCertificate = async (quizId: string) => {
    setLoading(true);
    
    try {
      // Simulate certificate generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Certificate downloaded!');
    } catch (error) {
      toast.error('Failed to download certificate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            Quiz Results
          </h1>
          <p className="text-gray-600 mt-2">
            Track your quiz performance and learning progress
          </p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuizzes}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passed</p>
                <p className="text-2xl font-bold text-gray-900">{passedQuizzes}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{averageScore}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Improvement</p>
                <p className={`text-2xl font-bold ${improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {improvementTrend >= 0 ? '+' : ''}{improvementTrend}%
                </p>
              </div>
              {improvementTrend >= 0 ? (
                <TrendingUp className="h-8 w-8 text-green-500" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-500" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Trend
            </CardTitle>
            <CardDescription>Your quiz scores over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  formatter={(value) => [`${value}%`, 'Score']}
                />
                <Line type="monotone" dataKey="score" stroke="#14b8a6" strokeWidth={3} dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance by Course
            </CardTitle>
            <CardDescription>Average quiz scores by course</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={coursePerformance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 100]} />
                <YAxis dataKey="course" type="category" width={80} />
                <Tooltip formatter={(value) => [`${value}%`, 'Average Score']} />
                <Bar dataKey="avgScore" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quiz Results */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Results</TabsTrigger>
          <TabsTrigger value="passed">Passed</TabsTrigger>
          <TabsTrigger value="retake">Need Retake</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {quizAttempts.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg">{quiz.quizTitle}</CardTitle>
                      <CardDescription>
                        {quiz.course} • {quiz.instructor}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getScoreBadge(quiz.percentage)}
                      <span className={`text-2xl font-bold ${getScoreColor(quiz.percentage)}`}>
                        {quiz.percentage}%
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Score Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Score</span>
                      <span className="font-medium">{quiz.score}/{quiz.maxScore} points</span>
                    </div>
                    <Progress value={quiz.percentage} className="h-2" />
                  </div>

                  {/* Quiz Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(quiz.dateTaken).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{quiz.timeSpent}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Repeat className="h-4 w-4" />
                      <span>Attempt {quiz.attemptNumber}/{quiz.maxAttempts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {quiz.status === 'completed' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : quiz.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <MinusCircle className="h-4 w-4 text-yellow-500" />
                      )}
                      <span className="capitalize">{quiz.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      onClick={() => handleViewDetails(quiz)}
                      className="flex-1 sm:flex-none"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {quiz.canRetake && quiz.status !== 'completed' && (
                      <Button
                        onClick={() => handleRetakeQuiz(quiz.id)}
                        disabled={loading}
                        className="flex-1 sm:flex-none bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                      >
                        <Repeat className="h-4 w-4 mr-2" />
                        Retake Quiz
                      </Button>
                    )}

                    {quiz.percentage >= 80 && (
                      <Button
                        variant="outline"
                        onClick={() => handleDownloadCertificate(quiz.id)}
                        disabled={loading}
                        className="flex-1 sm:flex-none"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                  </div>

                  {/* Retake availability */}
                  {quiz.canRetake && quiz.retakeAvailableDate && quiz.status === 'failed' && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                      <p className="text-yellow-800">
                        Retake available from: {new Date(quiz.retakeAvailableDate).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="passed" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {quizAttempts.filter(quiz => quiz.percentage >= 70).map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{quiz.quizTitle}</CardTitle>
                      <CardDescription>{quiz.course}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-xl font-bold text-green-600">{quiz.percentage}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleViewDetails(quiz)}>
                      View Details
                    </Button>
                    {quiz.percentage >= 80 && (
                      <Button variant="outline" onClick={() => handleDownloadCertificate(quiz.id)}>
                        <Download className="h-4 w-4 mr-2" />
                        Certificate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="retake" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {quizAttempts.filter(quiz => quiz.percentage < 70 || quiz.canRetake).map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{quiz.quizTitle}</CardTitle>
                      <CardDescription>{quiz.course}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-500" />
                      <span className="text-xl font-bold text-red-600">{quiz.percentage}%</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleRetakeQuiz(quiz.id)}
                      disabled={loading}
                      className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                    >
                      <Repeat className="h-4 w-4 mr-2" />
                      Retake Quiz
                    </Button>
                    <Button variant="outline" onClick={() => handleViewDetails(quiz)}>
                      Review Answers
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quiz Detail Modal would be implemented here */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedQuiz.quizTitle}</CardTitle>
                  <CardDescription>{selectedQuiz.course}</CardDescription>
                </div>
                <Button variant="outline" onClick={() => setSelectedQuiz(null)}>
                  Close
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>Score: {selectedQuiz.score}/{selectedQuiz.maxScore}</div>
                  <div>Percentage: {selectedQuiz.percentage}%</div>
                  <div>Time Spent: {selectedQuiz.timeSpent}</div>
                  <div>Date Taken: {new Date(selectedQuiz.dateTaken).toLocaleDateString()}</div>
                </div>
                
                {selectedQuiz.questions && selectedQuiz.questions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold">Question Review:</h3>
                    {selectedQuiz.questions.map((question, index) => (
                      <div key={question.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <p className="font-medium">Q{index + 1}: {question.question}</p>
                          <Badge className={question.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {question.points}/{question.maxPoints} pts
                          </Badge>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><strong>Your Answer:</strong> {question.userAnswer}</p>
                          <p><strong>Correct Answer:</strong> {question.correctAnswer}</p>
                          {question.feedback && (
                            <p className="text-blue-600"><strong>Feedback:</strong> {question.feedback}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}