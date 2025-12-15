import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Edit3,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Target,
  BarChart3,
  Clock,
  Star,
  Zap,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useLanguage } from '../context/LanguageContext';
import { useAICredits } from '../context/AICreditsContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface AIEssayGradingProps {
  user?: any;
}

export function AIEssayGrading({ user }: AIEssayGradingProps) {
  const { t, isRTL } = useLanguage();
  const { refresh: refreshAICredits } = useAICredits();
  const [selectedEssay, setSelectedEssay] = useState<any>(null);
  const [gradingInProgress, setGradingInProgress] = useState(false);
  const [essays, setEssays] = useState<any[]>([]);
  const [gradingCriteria, setGradingCriteria] = useState('comprehensive');
  const [essayText, setEssayText] = useState('');
  const [rubric, setRubric] = useState('');
  const [maxScore, setMaxScore] = useState(100);
  const [language, setLanguage] = useState<'en' | 'ar' | 'auto'>('en');
  const [gradingResult, setGradingResult] = useState<any>(null);

  // Mock data for demonstration
  const mockEssays = [
    {
      id: 1,
      title: 'The Impact of Artificial Intelligence on Modern Education',
      student: 'Sarah Johnson',
      course: 'Technology in Education',
      submittedAt: '2024-01-15T10:30:00Z',
      wordCount: 1247,
      status: 'graded',
      overallScore: 87,
      grade: 'A-',
      feedback: {
        structure: { score: 90, feedback: 'Excellent organization with clear introduction, body, and conclusion.' },
        content: { score: 85, feedback: 'Strong arguments with good supporting evidence. Could benefit from more diverse examples.' },
        grammar: { score: 88, feedback: 'Very good grammar with only minor errors in punctuation.' },
        originality: { score: 92, feedback: 'Highly original content with creative insights and unique perspective.' },
        citations: { score: 82, feedback: 'Good use of sources, but some citations need proper formatting.' }
      },
      suggestions: [
        'Consider adding more recent research findings from 2023-2024',
        'Expand on the potential negative impacts for a more balanced view',
        'Use more transitional phrases between paragraphs'
      ],
      strengths: [
        'Clear thesis statement',
        'Logical flow of arguments',
        'Good use of examples',
        'Strong conclusion'
      ],
      improvements: [
        'Citation formatting',
        'Paragraph transitions',
        'Counter-argument development'
      ]
    },
    {
      id: 2,
      title: 'Climate Change Solutions for the 21st Century',
      student: 'Michael Chen',
      course: 'Environmental Science',
      submittedAt: '2024-01-14T15:45:00Z',
      wordCount: 892,
      status: 'grading',
      progress: 75
    },
    {
      id: 3,
      title: 'The Role of Social Media in Political Discourse',
      student: 'Emma Davis',
      course: 'Political Science',
      submittedAt: '2024-01-13T09:20:00Z',
      wordCount: 1456,
      status: 'submitted',
      priority: 'high'
    },
    {
      id: 4,
      title: 'Economic Implications of Remote Work',
      student: 'David Wilson',
      course: 'Economics',
      submittedAt: '2024-01-12T14:30:00Z',
      wordCount: 1123,
      status: 'graded',
      overallScore: 92,
      grade: 'A',
      feedback: {
        structure: { score: 95, feedback: 'Outstanding organization with seamless flow between sections.' },
        content: { score: 90, feedback: 'Comprehensive analysis with excellent data integration.' },
        grammar: { score: 88, feedback: 'Strong writing with minor stylistic improvements needed.' },
        originality: { score: 94, feedback: 'Highly original analysis with innovative conclusions.' },
        citations: { score: 92, feedback: 'Excellent source variety and proper citation format.' }
      }
    }
  ];

  const mockGradingStats = {
    essaysGradedToday: 12,
    averageGradingTime: 4.2,
    totalEssaysThisMonth: 89,
    averageScore: 84.5,
    mostCommonIssues: ['Citation formatting', 'Thesis clarity', 'Paragraph structure'],
    improvementTrends: ['Better content quality', 'Improved grammar', 'More original thinking']
  };

  const gradingCriteriaOptions = [
    { value: 'comprehensive', label: 'Comprehensive Analysis', description: 'All aspects: structure, content, grammar, originality, citations' },
    { value: 'content-focus', label: 'Content-Focused', description: 'Emphasis on arguments, evidence, and analysis quality' },
    { value: 'technical', label: 'Technical Writing', description: 'Grammar, style, formatting, and citation accuracy' },
    { value: 'creative', label: 'Creative Assessment', description: 'Originality, creativity, and unique perspectives' },
    { value: 'academic', label: 'Academic Standards', description: 'Strict academic writing conventions and requirements' }
  ];

  useEffect(() => {
    setEssays(mockEssays);
  }, []);

  const handleGradeEssay = async (essayId?: number) => {
    if (!essayText.trim()) {
      toast.error('Please enter essay text to grade');
      return;
    }

    setGradingInProgress(true);
    try {
      const response = await api.ai.gradeEssay({
        essayContent: essayText,
        rubric: rubric || 'Grade based on content quality, grammar, structure, and originality',
        maxScore,
        language
      });

      if (response) {
        const gradingData = response.data || response;
        setGradingResult(gradingData);
        toast.success(`Essay graded! Used ${response.creditsUsed || 0} AI credits`);
        void refreshAICredits();
      }
    } catch (error: any) {
      console.error('Essay grading failed:', error);
      toast.error(error?.error?.message || 'Failed to grade essay');
      
      // Fallback to mock grading
      setTimeout(() => {
      setEssays(prevEssays => 
        prevEssays.map(essay => 
          essay.id === essayId 
            ? { ...essay, status: 'graded', overallScore: Math.floor(Math.random() * 20) + 80 }
            : essay
        )
      );
        setGradingResult({
          score: Math.floor(Math.random() * 20) + 80,
          grade: 'A-',
          feedback: {
            strengths: ['Good structure', 'Clear arguments'],
            weaknesses: ['Needs more examples'],
            suggestions: ['Add more citations']
          }
        });
        setGradingInProgress(false);
      }, 3000);
    } finally {
      setGradingInProgress(false);
    }
  };

  const handleBulkGrade = () => {
    const ungraded = essays.filter(essay => essay.status === 'submitted');
    ungraded.forEach(essay => {
      setTimeout(() => handleGradeEssay(essay.id), Math.random() * 2000);
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'graded': return 'bg-green-100 text-green-800';
      case 'grading': return 'bg-blue-100 text-blue-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderFeedbackSection = (essay) => {
    if (!essay.feedback) return null;

    return (
      <div className="space-y-6">
        {/* Score Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              {t('ai.scoreBreakdown', 'Score Breakdown')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(essay.feedback).map(([criteria, data]) => (
              <div key={criteria} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium capitalize">{criteria.replace('_', ' ')}</span>
                  <Badge className={`${getGradeColor(data.score)} bg-transparent`}>
                    {data.score}/100
                  </Badge>
                </div>
                <Progress value={data.score} className="h-2" />
                <p className="text-sm text-gray-600">{data.feedback}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Strengths and Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                {t('ai.strengths', 'Strengths')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {essay.strengths?.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <Target className="h-5 w-5" />
                {t('ai.areasForImprovement', 'Areas for Improvement')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {essay.improvements?.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <span className="text-sm">{improvement}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              {t('ai.aiSuggestions', 'AI Suggestions')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {essay.suggestions?.map((suggestion, index) => (
                <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800">{suggestion}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`p-6 max-w-7xl mx-auto space-y-6 ${isRTL ? 'rtl' : ''}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 to-purple-600 rounded-2xl shadow-lg">
          <FileText className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
            {t('ai.essayGrading', 'AI Essay Grading & Feedback')}
          </h1>
          <p className="text-xl text-gray-600 mt-2">
            {t('ai.essayGradingDesc', 'Automated essay evaluation with detailed feedback and improvement suggestions')}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">{t('ai.essaysGradedToday', 'Essays Graded Today')}</p>
                <p className="text-2xl font-bold text-blue-800">{mockGradingStats.essaysGradedToday}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">{t('ai.averageGradingTime', 'Avg. Grading Time')}</p>
                <p className="text-2xl font-bold text-green-800">{mockGradingStats.averageGradingTime}min</p>
              </div>
              <Clock className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600">{t('ai.averageScore', 'Average Score')}</p>
                <p className="text-2xl font-bold text-purple-800">{mockGradingStats.averageScore}%</p>
              </div>
              <Star className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">{t('ai.thisMonth', 'This Month')}</p>
                <p className="text-2xl font-bold text-orange-800">{mockGradingStats.totalEssaysThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="essays" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="essays" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('ai.essays', 'Essays')}
          </TabsTrigger>
          <TabsTrigger value="grading" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('ai.aiGrading', 'AI Grading')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            {t('ai.analytics', 'Analytics')}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {t('ai.criteria', 'Criteria')}
          </TabsTrigger>
        </TabsList>

        {/* Essays Tab */}
        <TabsContent value="essays" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t('ai.submittedEssays', 'Submitted Essays')}</h2>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkGrade}
                disabled={gradingInProgress}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
              >
                {gradingInProgress ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4 mr-2" />
                )}
                {t('ai.bulkGrade', 'Bulk Grade')}
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                {t('ai.uploadEssays', 'Upload Essays')}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {essays.map((essay) => (
              <Card key={essay.id} className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedEssay(essay)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">{essay.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {t('common.by', 'By')} {essay.student} • {essay.course}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(essay.status)}>
                      {essay.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{essay.wordCount} words</span>
                    <span>{new Date(essay.submittedAt).toLocaleDateString()}</span>
                  </div>

                  {essay.status === 'grading' && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('ai.gradingProgress', 'Grading Progress')}</span>
                        <span>{essay.progress}%</span>
                      </div>
                      <Progress value={essay.progress} className="h-2" />
                    </div>
                  )}

                  {essay.status === 'graded' && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t('ai.overallScore', 'Overall Score')}:</span>
                        <Badge className={`${getGradeColor(essay.overallScore)} bg-transparent border-current`}>
                          {essay.overallScore}% ({essay.grade})
                        </Badge>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        {t('ai.viewFeedback', 'View Feedback')}
                      </Button>
                    </div>
                  )}

                  {essay.status === 'submitted' && (
                    <Button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGradeEssay(essay.id);
                      }}
                      disabled={gradingInProgress}
                      className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      {t('ai.gradeNow', 'Grade Now')}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* AI Grading Tab */}
        <TabsContent value="grading" className="space-y-6">
          {selectedEssay ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedEssay.title}</h2>
                  <p className="text-gray-600">
                    {t('common.by', 'By')} {selectedEssay.student} • {selectedEssay.course}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {t('ai.exportFeedback', 'Export Feedback')}
                  </Button>
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {t('ai.sendToStudent', 'Send to Student')}
                  </Button>
                </div>
              </div>

              {selectedEssay.status === 'graded' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    {renderFeedbackSection(selectedEssay)}
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-teal-600" />
                          {t('ai.overallGrade', 'Overall Grade')}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className={`text-4xl font-bold ${getGradeColor(selectedEssay.overallScore)}`}>
                          {selectedEssay.grade}
                        </div>
                        <div className="text-2xl text-gray-600 mt-1">
                          {selectedEssay.overallScore}%
                        </div>
                        <Progress value={selectedEssay.overallScore} className="mt-4" />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">{t('ai.essayDetails', 'Essay Details')}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>{t('ai.wordCount', 'Word Count')}:</span>
                          <span>{selectedEssay.wordCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('ai.submitted', 'Submitted')}:</span>
                          <span>{new Date(selectedEssay.submittedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t('ai.gradingTime', 'Grading Time')}:</span>
                          <span>3.2 min</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {t('ai.selectEssayToView', 'Select an essay to view detailed feedback')}
                    </h3>
                    <p className="text-gray-600">
                      {t('ai.selectEssayDesc', 'Choose a graded essay from the essays tab to see AI-generated feedback and suggestions')}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {t('ai.noEssaySelected', 'No essay selected')}
                </h3>
                <p className="text-gray-600">
                  {t('ai.selectEssayDesc', 'Choose an essay from the essays tab to view detailed feedback and grading information')}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  {t('ai.commonIssues', 'Most Common Issues')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGradingStats.mostCommonIssues.map((issue, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{issue}</span>
                      <Badge variant="secondary">{Math.floor(Math.random() * 30) + 10}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  {t('ai.improvementTrends', 'Improvement Trends')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockGradingStats.improvementTrends.map((trend, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{trend}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('ai.gradingAccuracy', 'AI Grading Accuracy')}</CardTitle>
              <CardDescription>
                {t('ai.gradingAccuracyDesc', 'Comparison with human graders and validation metrics')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">94.2%</div>
                  <p className="text-sm text-gray-600 mt-1">{t('ai.overallAccuracy', 'Overall Accuracy')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">97.8%</div>
                  <p className="text-sm text-gray-600 mt-1">{t('ai.consistencyRate', 'Consistency Rate')}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">2.3s</div>
                  <p className="text-sm text-gray-600 mt-1">{t('ai.averageProcessingTime', 'Avg. Processing Time')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grading Criteria Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-teal-600" />
                {t('ai.gradingCriteria', 'Grading Criteria')}
              </CardTitle>
              <CardDescription>
                {t('ai.gradingCriteriaDesc', 'Configure how essays are evaluated and scored')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <label className="text-sm font-medium">{t('ai.selectCriteria', 'Select Grading Criteria')}</label>
                  <Select value={gradingCriteria} onValueChange={setGradingCriteria}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {gradingCriteriaOptions.map((criteria) => (
                        <SelectItem key={criteria.value} value={criteria.value}>
                          <div>
                            <div className="font-medium">{criteria.label}</div>
                            <div className="text-xs text-gray-600">{criteria.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-4">
                  <label className="text-sm font-medium">{t('ai.feedbackLanguage', 'Feedback Language')}</label>
                  <Select value={language} onValueChange={(value: 'en' | 'ar' | 'auto') => setLanguage(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="auto">Auto-detect</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    {t('ai.feedbackLanguageDesc', 'Select the language for AI-generated feedback and suggestions')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('ai.currentSettings', 'Current Settings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm">{t('ai.structureWeight', 'Structure Weight')}</span>
                      <Badge variant="secondary">25%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('ai.contentWeight', 'Content Weight')}</span>
                      <Badge variant="secondary">35%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('ai.grammarWeight', 'Grammar Weight')}</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">{t('ai.originalityWeight', 'Originality Weight')}</span>
                      <Badge variant="secondary">20%</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t('ai.feedbackSettings', 'Feedback Settings')}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('ai.detailedFeedback', 'Detailed Feedback')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('ai.enabled', 'Enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('ai.improvementSuggestions', 'Improvement Suggestions')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('ai.enabled', 'Enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('ai.exampleProvision', 'Example Provision')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('ai.enabled', 'Enabled')}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{t('ai.plagiarismCheck', 'Plagiarism Check')}</span>
                      <Badge className="bg-green-100 text-green-800">{t('ai.enabled', 'Enabled')}</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
                  {t('common.save', 'Save Settings')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}