import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Lightbulb, 
  MessageSquare, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Zap,
  CheckCircle,
  AlertCircle,
  User,
  Send,
  Sparkles,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../context/LanguageContext';
import { useAICredits } from '../context/AICreditsContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface AITutoringSystemProps {
  user?: any;
}

export function AITutoringSystem({ user }: AITutoringSystemProps) {
  const { t, isRTL } = useLanguage();
  const { refresh: refreshAICredits } = useAICredits();
  const [activeSession, setActiveSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [learningPath, setLearningPath] = useState(null);
  const [personalizedHints, setPersonalizedHints] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tutoring data from API
  useEffect(() => {
    const fetchTutoringData = async () => {
      try {
        setLoading(true);
        
        // Fetch learning data
        const learningDataResponse = await api.ai.getLearningProfile({
          userId: user?.id
        });
        
        if (learningDataResponse) {
          setLearningPath(learningDataResponse);
        }

        // Fetch personalized hints
        const hintsResponse = await api.ai.getPersonalizedHints({
          userId: user?.id,
          courseId: mockLearningData.currentCourse
        });
        
        if (hintsResponse) {
          setPersonalizedHints(hintsResponse);
        }

      } catch (error) {
        console.error('Error fetching tutoring data:', error);
        // Use mock data as fallback
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchTutoringData();
    }
  }, [user?.id]);

  // Mock data for demonstration
  const mockLearningData = {
    currentCourse: 'Advanced Mathematics',
    currentLesson: 'Calculus Integration',
    strugglingAreas: ['Chain Rule', 'Integration by Parts', 'Substitution'],
    strengths: ['Basic Derivatives', 'Limits', 'Continuity'],
    learningStyle: 'Visual & Practice-oriented',
    recommendedApproach: 'Step-by-step examples with interactive practice'
  };

  const mockTutoringStats = {
    sessionsToday: 3,
    totalQuestions: 147,
    hintsProvided: 89,
    conceptsMastered: 12,
    learningStreak: 15,
    averageSessionTime: 18
  };

  const mockConversationHistory = [
    {
      id: 1,
      type: 'user',
      message: 'I\'m struggling with integration by parts. Can you help me understand the concept?',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      type: 'ai',
      message: 'I\'d be happy to help you with integration by parts! Let\'s start with the formula: ∫u dv = uv - ∫v du. Think of it as a way to transform a difficult integral into easier parts.',
      timestamp: '10:31 AM',
      hints: ['Choose u as the function that becomes simpler when differentiated', 'Choose dv as the function you can easily integrate']
    },
    {
      id: 3,
      type: 'user',
      message: 'How do I choose which part should be u and which should be dv?',
      timestamp: '10:33 AM'
    },
    {
      id: 4,
      type: 'ai',
      message: 'Great question! Use the LIATE rule: Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential. Choose u in that priority order.',
      timestamp: '10:34 AM',
      hints: ['Try a practice problem: ∫x·e^x dx', 'Here, x is algebraic and e^x is exponential, so u = x']
    }
  ];

  const mockPersonalizedHints = [
    {
      id: 1,
      concept: 'Chain Rule',
      hint: 'Remember: derivative of outer function × derivative of inner function',
      difficulty: 'medium',
      success_rate: 0.75,
      examples: ['d/dx[sin(x²)] = cos(x²) × 2x', 'd/dx[(3x+1)⁵] = 5(3x+1)⁴ × 3']
    },
    {
      id: 2,
      concept: 'Integration by Parts',
      hint: 'Use LIATE to choose u, then apply ∫u dv = uv - ∫v du',
      difficulty: 'hard',
      success_rate: 0.45,
      examples: ['∫x·ln(x) dx', '∫x·e^x dx']
    },
    {
      id: 3,
      concept: 'Substitution Method',
      hint: 'Look for a function and its derivative in the integral',
      difficulty: 'medium',
      success_rate: 0.82,
      examples: ['∫2x·e^(x²) dx', '∫sin(x)·cos(x) dx']
    }
  ];

  const mockLearningPath = {
    currentLevel: 3,
    totalLevels: 5,
    progress: 65,
    completedConcepts: ['Limits', 'Basic Derivatives', 'Product Rule'],
    currentConcepts: ['Chain Rule', 'Integration by Parts'],
    upcomingConcepts: ['Partial Fractions', 'Trigonometric Substitution'],
    estimatedTimeToComplete: '2 weeks',
    adaptiveRecommendations: [
      'Focus on more chain rule practice problems',
      'Review integration by parts with step-by-step examples',
      'Take short breaks every 25 minutes for better retention'
    ]
  };

  useEffect(() => {
    setConversationHistory(mockConversationHistory);
    setPersonalizedHints(mockPersonalizedHints);
    setLearningPath(mockLearningPath);
  }, []);

  const handleSendMessage = async () => {
    if (!currentQuestion.trim()) return;

    const newMessage = {
      id: conversationHistory.length + 1,
      type: 'user',
      message: currentQuestion,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversationHistory([...conversationHistory, newMessage]);
    const question = currentQuestion;
    setCurrentQuestion('');
    setIsTyping(true);

    try {
      // Send message to AI tutoring API
      const response = await api.ai.sendTutoringMessage({
        userId: user?.id,
        message: question,
        context: {
          course: mockLearningData.currentCourse,
          lesson: mockLearningData.currentLesson,
          strugglingAreas: mockLearningData.strugglingAreas
        }
      });

      if (response) {
        const aiResponse = {
          id: conversationHistory.length + 2,
          type: 'ai',
          message: response.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hints: response.hints || []
        };
        setConversationHistory(prev => [...prev, aiResponse]);
        void refreshAICredits();
      } else {
        // Fallback to mock response
        const aiResponse = {
          id: conversationHistory.length + 2,
          type: 'ai',
          message: generateAIResponse(question),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hints: generatePersonalizedHints(question)
        };
        setConversationHistory(prev => [...prev, aiResponse]);
      }
    } catch (error) {
      console.error('Error sending tutoring message:', error);
      toast.error('Failed to get AI response');
      
      // Fallback to mock response
      const aiResponse = {
        id: conversationHistory.length + 2,
        type: 'ai',
        message: generateAIResponse(question),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hints: generatePersonalizedHints(question)
      };
      setConversationHistory(prev => [...prev, aiResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateAIResponse = (question) => {
    // Mock AI response generation based on question
    const responses = [
      "Let me break this down step by step for you. Based on your learning pattern, I recommend starting with a visual approach.",
      "I notice you're working on a concept you've struggled with before. Let's use a different strategy this time.",
      "Great question! This connects to what we learned yesterday. Let me show you the connection.",
      "I can see you're ready for the next level. Let's challenge you with a slightly more complex example."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const generatePersonalizedHints = (question) => {
    const hints = [
      "Try drawing a diagram to visualize the problem",
      "Break the problem into smaller, manageable steps",
      "Look for patterns you've seen in similar problems",
      "Check your work by substituting back into the original equation"
    ];
    return hints.slice(0, 2);
  };

  const startNewSession = () => {
    setActiveSession({
      id: Date.now(),
      startTime: new Date(),
      topic: mockLearningData.currentLesson
    });
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
    <div className={`p-6 max-w-7xl mx-auto space-y-6`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4 mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl shadow-lg">
          <Brain className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            {t('ai.intelligentTutoring', 'Intelligent Tutoring System')}
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            {t('ai.intelligentTutoringDesc', 'Get personalized hints, guidance, and AI-powered learning assistance')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">{t('ai.sessionsToday', 'Sessions Today')}</p>
                <p className="text-2xl font-bold text-blue-800">{mockTutoringStats.sessionsToday}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">{t('ai.hintsProvided', 'Hints Provided')}</p>
                <p className="text-2xl font-bold text-green-800">{mockTutoringStats.hintsProvided}</p>
              </div>
              <Lightbulb className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">{t('ai.conceptsMastered', 'Concepts Mastered')}</p>
                <p className="text-2xl font-bold text-purple-800">{mockTutoringStats.conceptsMastered}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">{t('ai.learningStreak', 'Learning Streak')}</p>
                <p className="text-2xl font-bold text-orange-800">{mockTutoringStats.learningStreak} days</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t('ai.aiChat', 'AI Chat')}
          </TabsTrigger>
          <TabsTrigger value="hints" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            {t('ai.personalizedHints', 'Personalized Hints')}
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('ai.learningPath', 'Learning Path')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('ai.analytics', 'Analytics')}
          </TabsTrigger>
        </TabsList>

        {/* AI Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="bg-gradient-to-r from-teal-500 to-purple-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    {t('ai.intelligentTutor', 'Intelligent Tutor')}
                  </CardTitle>
                  <CardDescription className="text-teal-100">
                    {t('ai.currentTopic', 'Current Topic')}: {mockLearningData.currentLesson}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Conversation History */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationHistory.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? (isRTL ? 'justify-start' : 'justify-end') : (isRTL ? 'justify-end' : 'justify-start')}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.type === 'user'
                              ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {message.type === 'ai' && (
                              <Brain className="h-4 w-4 mt-0.5 text-teal-600" />
                            )}
                            {message.type === 'user' && (
                              <User className="h-4 w-4 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm">{message.message}</p>
                              <p className={`text-xs mt-1 ${
                                message.type === 'user' ? 'text-teal-100' : 'text-gray-500'
                              }`}>
                                {message.timestamp}
                              </p>
                              {message.hints && (
                                <div className="mt-2 space-y-1">
                                  {message.hints.map((hint, index) => (
                                    <div
                                      key={index}
                                      className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800"
                                    >
                                      <Lightbulb className={`h-3 w-3 inline ${isRTL ? 'ml-1' : 'mr-1'}`} />
                                      {hint}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className={`flex ${isRTL ? 'justify-end' : 'justify-start'}`}>
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center gap-2">
                          <Brain className="h-4 w-4 text-teal-600" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Textarea
                        value={currentQuestion}
                        onChange={(e) => setCurrentQuestion(e.target.value)}
                        placeholder={t('ai.askQuestion', 'Ask a question or describe what you\'re struggling with...')}
                        className="flex-1 min-h-[60px] resize-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!currentQuestion.trim() || isTyping}
                        className="self-end bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Learning Context */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-teal-600" />
                    {t('ai.learningContext', 'Learning Context')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-700">{t('ai.currentCourse', 'Current Course')}</h4>
                    <p className="text-sm text-gray-600">{mockLearningData.currentCourse}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">{t('ai.currentLesson', 'Current Lesson')}</h4>
                    <p className="text-sm text-gray-600">{mockLearningData.currentLesson}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700">{t('ai.learningStyle', 'Learning Style')}</h4>
                    <Badge variant="secondary">{mockLearningData.learningStyle}</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-600" />
                    {t('ai.strugglingAreas', 'Struggling Areas')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockLearningData.strugglingAreas.map((area, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-700">{area}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    {t('ai.strengths', 'Strengths')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {mockLearningData.strengths.map((strength, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{strength}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Personalized Hints Tab */}
        <TabsContent value="hints" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {personalizedHints.map((hint) => (
              <Card key={hint.id} className="group hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{hint.concept}</CardTitle>
                    <Badge className={getDifficultyColor(hint.difficulty)}>
                      {hint.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{t('ai.successRate', 'Success Rate')}:</span>
                    <div className="flex-1">
                      <Progress value={hint.success_rate * 100} className="h-2" />
                    </div>
                    <span className="text-sm font-medium">{Math.round(hint.success_rate * 100)}%</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{hint.hint}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">{t('ai.examples', 'Examples')}:</h4>
                    <div className="space-y-1">
                      {hint.examples.map((example, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2 text-sm font-mono text-gray-700">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full group-hover:bg-gradient-to-r group-hover:from-teal-500 group-hover:to-purple-600 group-hover:text-white"
                  >
                    {t('ai.practiceThis', 'Practice This Concept')}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-600" />
                {t('ai.adaptiveLearningPath', 'Adaptive Learning Path')}
              </CardTitle>
              <CardDescription>
                {t('ai.learningPathDesc', 'Your personalized journey based on performance and learning style')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t('ai.overallProgress', 'Overall Progress')}: Level {learningPath?.currentLevel} of {learningPath?.totalLevels}
                </span>
                <span className="text-sm text-gray-600">{learningPath?.progress}% Complete</span>
              </div>
              <Progress value={learningPath?.progress} className="h-3" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-green-600 mb-3">{t('ai.completed', 'Completed')}</h4>
                  <div className="space-y-2">
                    {learningPath?.completedConcepts.map((concept, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-blue-600 mb-3">{t('ai.inProgress', 'In Progress')}</h4>
                  <div className="space-y-2">
                    {learningPath?.currentConcepts.map((concept, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-600 mb-3">{t('ai.upcoming', 'Upcoming')}</h4>
                  <div className="space-y-2">
                    {learningPath?.upcomingConcepts.map((concept, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                        <span className="text-sm text-gray-600">{concept}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {t('ai.aiRecommendations', 'AI Recommendations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {learningPath?.adaptiveRecommendations.map((recommendation, index) => (
                  <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
                      <p className="text-sm text-purple-800">{recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.averageSessionTime', 'Average Session Time')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">{mockTutoringStats.averageSessionTime} min</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.thisWeek', 'This week')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.totalQuestions', 'Total Questions Asked')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{mockTutoringStats.totalQuestions}</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.allTime', 'All time')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.helpfulnessRating', 'Helpfulness Rating')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">4.8/5</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.basedOnFeedback', 'Based on your feedback')}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('ai.learningImpact', 'Learning Impact')}</CardTitle>
              <CardDescription>
                {t('ai.learningImpactDesc', 'How AI tutoring has improved your understanding')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.conceptUnderstanding', 'Concept Understanding')}</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.problemSolvingSpeed', 'Problem Solving Speed')}</span>
                    <span>78%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.confidenceLevel', 'Confidence Level')}</span>
                    <span>92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}