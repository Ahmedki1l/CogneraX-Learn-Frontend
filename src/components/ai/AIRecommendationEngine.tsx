import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  BookOpen, 
  Target, 
  Users, 
  Clock, 
  Star,
  Brain,
  Filter,
  Search,
  ArrowRight,
  PlayCircle,
  Award,
  BarChart3,
  Zap,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Heart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { useAICredits } from '../context/AICreditsContext';
import { toast } from 'sonner';

interface AIRecommendationEngineProps {
  user?: any;
}

export function AIRecommendationEngine({ user }: AIRecommendationEngineProps) {
  const { refresh: refreshAICredits } = useAICredits();
  const { t, isRTL } = useLanguage();
  const [recommendations, setRecommendations] = useState([]);
  const [learningPath, setLearningPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data for demonstration
  const mockUserProfile = {
    learningPreferences: ['Visual Learning', 'Interactive Content', 'Short Sessions'],
    interests: ['Mathematics', 'Data Science', 'Machine Learning', 'Statistics'],
    completedCourses: 12,
    averageRating: 4.6,
    preferredDifficulty: 'Intermediate',
    studyTime: 'Evenings',
    goals: ['Career Advancement', 'Skill Development', 'Academic Achievement']
  };

  const mockRecommendations = [
    {
      id: 1,
      type: 'course',
      title: 'Advanced Machine Learning Algorithms',
      description: 'Deep dive into neural networks, ensemble methods, and advanced ML techniques',
      instructor: 'Dr. Sarah Chen',
      rating: 4.8,
      students: 2341,
      duration: '8 weeks',
      difficulty: 'Advanced',
      category: 'Data Science',
      matchScore: 95,
      reasons: [
        'Builds on your completed Data Science Fundamentals course',
        'Matches your interest in Machine Learning',
        'Advanced level suits your current skill progression'
      ],
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
      price: 299,
      tags: ['Machine Learning', 'Python', 'Neural Networks']
    },
    {
      id: 2,
      type: 'resource',
      title: 'Interactive Statistics Playground',
      description: 'Hands-on statistical concepts with real-world datasets and visualizations',
      author: 'StatLab Team',
      rating: 4.7,
      views: 15420,
      estimatedTime: '3 hours',
      category: 'Mathematics',
      matchScore: 88,
      reasons: [
        'Visual learning approach matches your preference',
        'Interactive content aligns with your learning style',
        'Statistics knowledge gap identified in your profile'
      ],
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      type_icon: BookOpen,
      tags: ['Statistics', 'Interactive', 'Visualization']
    },
    {
      id: 3,
      type: 'project',
      title: 'Build a Recommendation System',
      description: 'Create your own recommendation engine using collaborative filtering',
      mentor: 'Alex Rodriguez',
      rating: 4.9,
      participants: 847,
      duration: '2 weeks',
      difficulty: 'Intermediate',
      category: 'Data Science',
      matchScore: 92,
      reasons: [
        'Perfect for your intermediate skill level',
        'Practical application of ML concepts',
        'Project-based learning matches your preference'
      ],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      type_icon: Target,
      tags: ['Machine Learning', 'Python', 'Collaborative Filtering']
    },
    {
      id: 4,
      type: 'skill_path',
      title: 'Data Science Career Track',
      description: 'Complete learning path from basics to professional data scientist',
      provider: 'CogneraX Learn',
      courses: 15,
      totalDuration: '6 months',
      completionRate: 78,
      category: 'Career Development',
      matchScore: 90,
      reasons: [
        'Aligns with your career advancement goals',
        'Structured progression path',
        'High completion rate among similar learners'
      ],
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop',
      type_icon: TrendingUp,
      tags: ['Career Track', 'Data Science', 'Professional Development']
    },
    {
      id: 5,
      type: 'mentor',
      title: 'AI Research Mentorship',
      description: '1-on-1 mentoring sessions with industry expert in AI and ML',
      mentor: 'Dr. Michael Park',
      experience: '15 years',
      specialization: 'AI Research',
      rating: 4.95,
      sessions: 342,
      category: 'Mentorship',
      matchScore: 85,
      reasons: [
        'Expert in your area of interest',
        'Personalized guidance for advanced topics',
        'High rating from previous mentees'
      ],
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop',
      type_icon: Users,
      tags: ['Mentorship', 'AI Research', '1-on-1']
    },
    {
      id: 6,
      type: 'event',
      title: 'Machine Learning Workshop Series',
      description: 'Weekly hands-on workshops covering latest ML trends and techniques',
      organizer: 'Tech Community',
      startDate: '2024-02-01',
      sessions: 8,
      attendees: 1250,
      category: 'Events',
      matchScore: 82,
      reasons: [
        'Regular schedule fits your evening availability',
        'Community learning environment',
        'Hands-on approach matches your learning style'
      ],
      image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop',
      type_icon: Users,
      tags: ['Workshop', 'Community', 'Hands-on']
    }
  ];

  const mockLearningPath = [
    {
      id: 1,
      title: 'Statistics Fundamentals',
      type: 'Foundation',
      status: 'recommended',
      estimatedTime: '4 weeks',
      description: 'Build strong statistical foundation for data science',
      prerequisites: [],
      difficulty: 'Beginner'
    },
    {
      id: 2,
      title: 'Python for Data Analysis',
      type: 'Technical Skill',
      status: 'recommended',
      estimatedTime: '6 weeks',
      description: 'Master Python libraries for data manipulation and analysis',
      prerequisites: ['Statistics Fundamentals'],
      difficulty: 'Intermediate'
    },
    {
      id: 3,
      title: 'Machine Learning Foundations',
      type: 'Core Knowledge',
      status: 'suggested',
      estimatedTime: '8 weeks',
      description: 'Introduction to ML algorithms and model building',
      prerequisites: ['Statistics Fundamentals', 'Python for Data Analysis'],
      difficulty: 'Intermediate'
    },
    {
      id: 4,
      title: 'Deep Learning Specialization',
      type: 'Advanced Skill',
      status: 'future',
      estimatedTime: '10 weeks',
      description: 'Advanced neural networks and deep learning techniques',
      prerequisites: ['Machine Learning Foundations'],
      difficulty: 'Advanced'
    }
  ];

  const mockStats = {
    totalRecommendations: 347,
    acceptanceRate: 73,
    averageMatchScore: 87,
    categoriesExplored: 15,
    timesSaved: 124,
    learningGoalsAchieved: 8
  };

  // Fetch recommendations from API
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        // Fetch AI recommendations
        const recommendationsResponse = await api.ai.getRecommendations({
          userId: user?.id,
          preferences: mockUserProfile.learningPreferences,
          interests: mockUserProfile.interests
        });
        
        if (recommendationsResponse) {
          setRecommendations(recommendationsResponse);
        } else {
          // Fallback to mock data
          setRecommendations(mockRecommendations);
        }

        // Fetch learning path
        const learningPathResponse = await api.ai.getLearningPath({
          userId: user?.id,
          currentLevel: 'intermediate',
          goals: ['Data Science', 'Machine Learning']
        });
        
        if (learningPathResponse) {
          setLearningPath(learningPathResponse);
        } else {
          // Fallback to mock data
          setLearningPath(mockLearningPath);
        }

      } catch (error) {
        console.error('Error fetching recommendations:', error);
        // Use mock data as fallback
        setRecommendations(mockRecommendations);
        setLearningPath(mockLearningPath);
      }
    };

    if (user?.id) {
      fetchRecommendations();
    } else {
      // Use mock data if no user
      setRecommendations(mockRecommendations);
      setLearningPath(mockLearningPath);
    }
  }, [user?.id]);

  const generateNewRecommendations = async () => {
    setIsGenerating(true);
    try {
      const response = await api.ai.generateRecommendations({
        userId: user?.id,
        preferences: mockUserProfile.learningPreferences,
        interests: mockUserProfile.interests,
        searchQuery: searchQuery || undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined
      });
      
      if (response) {
        setRecommendations(response);
        toast.success('New recommendations generated!');
        void refreshAICredits();
      }
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast.error('Failed to generate new recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRecommendationAction = (id, action) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === id
          ? { ...rec, userAction: action }
          : rec
      )
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'course': return BookOpen;
      case 'resource': return BookOpen;
      case 'project': return Target;
      case 'skill_path': return TrendingUp;
      case 'mentor': return Users;
      case 'event': return Users;
      default: return BookOpen;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800';
      case 'resource': return 'bg-green-100 text-green-800';
      case 'project': return 'bg-purple-100 text-purple-800';
      case 'skill_path': return 'bg-orange-100 text-orange-800';
      case 'mentor': return 'bg-pink-100 text-pink-800';
      case 'event': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'recommended': return 'bg-green-100 text-green-800 border-green-300';
      case 'suggested': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'future': return 'bg-gray-100 text-gray-800 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesSearch = rec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || rec.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl shadow-lg">
          <Sparkles className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            {t('ai.recommendationEngine', 'AI Content Recommendation Engine')}
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            {t('ai.recommendationDesc', 'Personalized learning recommendations powered by AI and your learning patterns')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">{t('ai.totalRecommendations', 'Total Recommendations')}</p>
                <p className="text-2xl font-bold text-blue-800">{mockStats.totalRecommendations}</p>
              </div>
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">{t('ai.acceptanceRate', 'Acceptance Rate')}</p>
                <p className="text-2xl font-bold text-green-800">{mockStats.acceptanceRate}%</p>
              </div>
              <ThumbsUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">{t('ai.matchScore', 'Avg. Match Score')}</p>
                <p className="text-2xl font-bold text-purple-800">{mockStats.averageMatchScore}%</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">{t('ai.timesSaved', 'Hours Saved')}</p>
                <p className="text-2xl font-bold text-orange-800">{mockStats.timesSaved}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recommendations" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            {t('ai.recommendations', 'Recommendations')}
          </TabsTrigger>
          <TabsTrigger value="learning-path" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            {t('ai.learningPath', 'Learning Path')}
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('ai.learningProfile', 'Learning Profile')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('ai.analytics', 'Analytics')}
          </TabsTrigger>
        </TabsList>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('ai.searchRecommendations', 'Search recommendations...')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('ai.allCategories', 'All Categories')}</SelectItem>
                  <SelectItem value="data science">{t('ai.dataScience', 'Data Science')}</SelectItem>
                  <SelectItem value="mathematics">{t('ai.mathematics', 'Mathematics')}</SelectItem>
                  <SelectItem value="career development">{t('ai.careerDevelopment', 'Career Development')}</SelectItem>
                  <SelectItem value="mentorship">{t('ai.mentorship', 'Mentorship')}</SelectItem>
                  <SelectItem value="events">{t('ai.events', 'Events')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={generateNewRecommendations}
              disabled={isGenerating}
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {t('ai.generateNew', 'Generate New')}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecommendations.map((recommendation) => {
              const TypeIcon = getTypeIcon(recommendation.type);
              return (
                <Card key={recommendation.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img
                      src={recommendation.image}
                      alt={recommendation.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={getTypeColor(recommendation.type)}>
                        <TypeIcon className="h-3 w-3 mr-1" />
                        {recommendation.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-white/90 text-gray-800">
                        {recommendation.matchScore}% match
                      </Badge>
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">{recommendation.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {recommendation.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      {recommendation.instructor && (
                        <span>{t('common.by', 'By')} {recommendation.instructor}</span>
                      )}
                      {recommendation.author && (
                        <span>{t('common.by', 'By')} {recommendation.author}</span>
                      )}
                      {recommendation.mentor && (
                        <span>{t('common.by', 'By')} {recommendation.mentor}</span>
                      )}
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{recommendation.rating}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {recommendation.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">
                        {t('ai.whyRecommended', 'Why recommended:')}
                      </h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        {recommendation.reasons?.slice(0, 2).map((reason, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <Zap className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                        onClick={() => handleRecommendationAction(recommendation.id, 'accepted')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t('ai.viewDetails', 'View Details')}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(recommendation.id, 'liked')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(recommendation.id, 'disliked')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRecommendationAction(recommendation.id, 'saved')}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Learning Path Tab */}
        <TabsContent value="learning-path" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                {t('ai.personalizedLearningPath', 'Personalized Learning Path')}
              </CardTitle>
              <CardDescription>
                {t('ai.learningPathDesc', 'AI-curated sequence of courses and resources tailored to your goals')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {learningPath.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index < learningPath.length - 1 && (
                      <div className="absolute left-8 top-16 w-0.5 h-16 bg-gray-200" />
                    )}
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                          step.status === 'recommended' 
                            ? 'bg-gradient-to-br from-teal-500 to-purple-600 text-white' 
                            : step.status === 'suggested'
                            ? 'bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1">
                        <Card className={`border-2 ${
                          step.status === 'recommended' 
                            ? 'border-teal-300 bg-teal-50' 
                            : step.status === 'suggested'
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-300 bg-gray-50'
                        }`}>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-lg">{step.title}</CardTitle>
                              <Badge className={getStatusColor(step.status)}>
                                {step.status}
                              </Badge>
                            </div>
                            <CardDescription>{step.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">{t('ai.type', 'Type')}:</span>
                                <p className="text-gray-600">{step.type}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{t('ai.duration', 'Duration')}:</span>
                                <p className="text-gray-600">{step.estimatedTime}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{t('ai.difficulty', 'Difficulty')}:</span>
                                <p className="text-gray-600">{step.difficulty}</p>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">{t('ai.prerequisites', 'Prerequisites')}:</span>
                                <p className="text-gray-600">
                                  {step.prerequisites.length > 0 ? step.prerequisites.length : 'None'}
                                </p>
                              </div>
                            </div>
                            {step.status === 'recommended' && (
                              <div className="mt-4">
                                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                                  <PlayCircle className="h-4 w-4 mr-2" />
                                  {t('ai.startLearning', 'Start Learning')}
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  {t('ai.learningPreferences', 'Learning Preferences')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{t('ai.preferredStyle', 'Preferred Learning Style')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockUserProfile.learningPreferences.map((pref, index) => (
                      <Badge key={index} variant="secondary">{pref}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{t('ai.interests', 'Interests')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockUserProfile.interests.map((interest, index) => (
                      <Badge key={index} className="bg-teal-100 text-teal-800">{interest}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">{t('ai.goals', 'Learning Goals')}</h4>
                  <div className="flex flex-wrap gap-2">
                    {mockUserProfile.goals.map((goal, index) => (
                      <Badge key={index} className="bg-purple-100 text-purple-800">{goal}</Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                  {t('ai.learningStats', 'Learning Statistics')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('ai.completedCourses', 'Completed Courses')}</span>
                  <span className="font-bold text-green-600">{mockUserProfile.completedCourses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('ai.averageRating', 'Average Rating')}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-bold text-yellow-600">{mockUserProfile.averageRating}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('ai.preferredDifficulty', 'Preferred Difficulty')}</span>
                  <Badge variant="secondary">{mockUserProfile.preferredDifficulty}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">{t('ai.studyTime', 'Preferred Study Time')}</span>
                  <Badge variant="secondary">{mockUserProfile.studyTime}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                {t('ai.aiInsights', 'AI Insights')}
              </CardTitle>
              <CardDescription>
                {t('ai.aiInsightsDesc', 'How AI understands your learning patterns and preferences')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">{t('ai.learningPattern', 'Learning Pattern Analysis')}</h4>
                <p className="text-sm text-purple-700">
                  {t('ai.learningPatternDesc', 'You prefer visual and interactive learning experiences with moderate difficulty progression. Your engagement is highest during evening study sessions, and you show strong completion rates for project-based content.')}
                </p>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                <h4 className="font-medium text-teal-800 mb-2">{t('ai.skillGaps', 'Identified Skill Gaps')}</h4>
                <p className="text-sm text-teal-700">
                  {t('ai.skillGapsDesc', 'Based on your course history and career goals, we\'ve identified opportunities to strengthen your foundation in advanced statistics and deep learning frameworks.')}
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">{t('ai.nextSteps', 'Recommended Next Steps')}</h4>
                <p className="text-sm text-orange-700">
                  {t('ai.nextStepsDesc', 'Focus on practical applications of machine learning through project-based courses. Consider joining study groups for peer learning opportunities.')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.recommendationAccuracy', 'Recommendation Accuracy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">94.2%</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.last30Days', 'Last 30 days')}</p>
                <Progress value={94.2} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.engagementRate', 'Engagement Rate')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">87.5%</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.recommendedContent', 'With recommended content')}</p>
                <Progress value={87.5} className="mt-2 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">{t('ai.timeSaved', 'Time Saved')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">124h</div>
                <p className="text-xs text-gray-500 mt-1">{t('ai.throughSmartRecommendations', 'Through smart recommendations')}</p>
                <Progress value={75} className="mt-2 h-2" />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('ai.recommendationTrends', 'Recommendation Trends')}</CardTitle>
              <CardDescription>
                {t('ai.recommendationTrendsDesc', 'How your recommendation preferences have evolved over time')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.technicalContent', 'Technical Content')}</span>
                    <span>+15%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.practicalProjects', 'Practical Projects')}</span>
                    <span>+22%</span>
                  </div>
                  <Progress value={78} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.theoryBasedLearning', 'Theory-based Learning')}</span>
                    <span>-8%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{t('ai.collaborativeLearning', 'Collaborative Learning')}</span>
                    <span>+12%</span>
                  </div>
                  <Progress value={67} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}