import React, { useState } from 'react';
import { 
  Upload, 
  Brain, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target,
  Users,
  Clock,
  Wand2,
  RefreshCw,
  Download,
  Copy,
  Edit3,
  Sparkles,
  BookOpen,
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { api } from '../../services/api';
import { toast } from 'sonner';

export function ContentAnalysis() {
  const [content, setContent] = useState('');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecreating, setIsRecreating] = useState(false);
  const [recreatedContent, setRecreatedContent] = useState<any>(null);
  const [recreationType, setRecreationType] = useState<string | null>(null);
  const [activeRecreationTab, setActiveRecreationTab] = useState('overview');

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await api.ai.analyzeContent(content);
      if (response) {
        setAnalysisResults(response);
        toast.success(`Content analyzed! Used ${response.creditsUsed || 0} AI credits`);
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast.error(error?.error?.message || 'Failed to analyze content');
      // Fallback to mock data for demo
      setTimeout(() => {
      setAnalysisResults({
        overallScore: 87,
        keyTopics: ['React Hooks', 'State Management', 'Component Lifecycle', 'Performance Optimization'],
        strengths: [
          'Clear explanation of useState and useEffect',
          'Good code examples with practical applications',
          'Progressive difficulty structure'
        ],
        weaknesses: [
          'Missing advanced hooks coverage',
          'Limited error handling examples',
          'Could use more interactive elements'
        ],
        improvements: [
          'Add useCallback and useMemo examples',
          'Include error boundary patterns',
          'Create interactive coding exercises',
          'Add visual diagrams for complex concepts'
        ],
        studentImpact: {
          beginnerFriendly: 92,
          practicalApplication: 85,
          comprehensiveness: 78,
          engagement: 81
        },
        estimatedTime: '45 minutes',
        difficulty: 'Intermediate',
        prerequisites: ['Basic JavaScript', 'HTML/CSS fundamentals']
      });
      setIsAnalyzing(false);
    }, 3000);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContentRecreation = async (type: string) => {
    if (!content.trim()) {
      toast.error('Please enter content to recreate');
      return;
    }

    setRecreationType(type);
    setIsRecreating(true);
    
    try {
      const response = await api.ai.recreateContent(content, type);
      if (response) {
        setRecreatedContent(response);
        toast.success(`Content recreated! Used ${response.creditsUsed || 0} AI credits`);
      }
    } catch (error: any) {
      console.error('Recreation failed:', error);
      toast.error(error?.error?.message || 'Failed to recreate content');
      // Fallback to mock data for demo
      setTimeout(() => {
      const recreationResults = {
        enhanced: {
          title: "React Hooks: Complete Interactive Guide",
          sections: [
            {
              title: "Introduction to React Hooks",
              content: "React Hooks revolutionized functional components by allowing state and lifecycle management without classes. This comprehensive guide will take you from beginner to advanced hooks usage with practical examples and real-world applications.",
              type: "text",
              enhanced: true
            },
            {
              title: "useState Hook - Interactive Demo",
              content: "Experience state management in action with this interactive counter example. Click the buttons below to see how useState updates component state in real-time.",
              type: "interactive",
              component: "CounterDemo"
            },
            {
              title: "useEffect Hook - Visual Timeline",
              content: "Understanding useEffect is crucial for side effects management. This visual timeline shows exactly when useEffect runs in the component lifecycle.",
              type: "visualization",
              component: "EffectTimeline"
            },
            {
              title: "Advanced Hooks Workshop",
              content: "Put your knowledge to test with these hands-on coding challenges. Each exercise builds upon the previous one, reinforcing your understanding.",
              type: "exercise",
              component: "HooksWorkshop"
            }
          ],
          improvements: [
            "Added interactive demonstrations",
            "Included visual learning aids",
            "Created hands-on exercises",
            "Enhanced with real-world examples",
            "Improved accessibility features"
          ]
        },
        comprehensive: {
          title: "Complete React Hooks Mastery Course",
          sections: [
            { title: "Module 1: Hook Fundamentals", lessons: 8, duration: "2 hours" },
            { title: "Module 2: State Management", lessons: 12, duration: "3 hours" },
            { title: "Module 3: Side Effects", lessons: 10, duration: "2.5 hours" },
            { title: "Module 4: Performance Optimization", lessons: 15, duration: "4 hours" },
            { title: "Module 5: Custom Hooks", lessons: 8, duration: "2 hours" },
            { title: "Module 6: Advanced Patterns", lessons: 12, duration: "3.5 hours" }
          ],
          features: [
            "65 comprehensive lessons",
            "Interactive coding environment",
            "Real-world project builds",
            "Automated assessment system",
            "Progress tracking dashboard",
            "Community discussion forums"
          ]
        },
        targeted: {
          beginners: {
            title: "React Hooks for Beginners",
            focus: "Gentle introduction with step-by-step guidance",
            features: ["Visual metaphors", "Simplified examples", "Glossary included", "Video explanations"]
          },
          intermediate: {
            title: "React Hooks in Practice",
            focus: "Real-world applications and best practices",
            features: ["Case studies", "Performance tips", "Common pitfalls", "Code reviews"]
          },
          advanced: {
            title: "Advanced React Hooks Patterns",
            focus: "Complex patterns and optimization techniques",
            features: ["Custom hook libraries", "Performance profiling", "Advanced patterns", "Architecture decisions"]
          }
        },
        multimodal: {
          text: "Enhanced written content with clear explanations",
          video: "12 video lessons with screen recordings",
          interactive: "8 hands-on coding exercises",
          quizzes: "15 assessment quizzes with instant feedback",
          projects: "3 real-world projects to build"
        }
      };
      
      setRecreatedContent(recreationResults);
      setIsRecreating(false);
    }, 4000);
    } finally {
      setIsRecreating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Content Analysis</h1>
          <p className="text-gray-600 mt-1">
            Upload educational content to get AI-powered insights and recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="font-medium text-purple-600">Powered by AI</span>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-white" />
            </div>
            Upload Content for Analysis
          </CardTitle>
          <CardDescription>
            Supported formats: PDF, DOCX, TXT, MD, Video (MP4), Audio (MP3)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste your educational content here for AI analysis..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {content.length} characters • AI analysis cost: 10 credits
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button variant="outline" size="lg" className="min-w-32">
                <FileText className="h-4 w-4 mr-2" />
                Browse Files
              </Button>
              <Button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 min-w-32"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Sample Content
                  </>
                )}
              </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Loading */}
      {isAnalyzing && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="animate-spin h-16 w-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Brain className="h-6 w-6 text-purple-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-teal-600 bg-clip-text text-transparent mb-3">
                AI is analyzing your content...
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Our advanced AI is processing and evaluating your material to provide comprehensive insights
              </p>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse mr-2"></div>
                  Extracting key topics
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse mr-2"></div>
                  Analyzing structure
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-teal-600 rounded-full animate-pulse mr-2"></div>
                  Generating insights
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {analysisResults && !isAnalyzing && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  Overall Content Score
                </span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {analysisResults.overallScore}/100
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={analysisResults.overallScore} className="h-3 mb-4" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">{analysisResults.studentImpact.beginnerFriendly}%</div>
                  <div className="text-sm text-gray-500">Beginner Friendly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{analysisResults.studentImpact.practicalApplication}%</div>
                  <div className="text-sm text-gray-500">Practical Application</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{analysisResults.studentImpact.comprehensiveness}%</div>
                  <div className="text-sm text-gray-500">Comprehensiveness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{analysisResults.studentImpact.engagement}%</div>
                  <div className="text-sm text-gray-500">Engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Tabs defaultValue="insights" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
              <TabsTrigger value="strengths">Strengths</TabsTrigger>
              <TabsTrigger value="improvements">Improvements</TabsTrigger>
              <TabsTrigger value="impact">Student Impact</TabsTrigger>
            </TabsList>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-600" />
                      Key Topics Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {analysisResults.keyTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-purple-600" />
                      Content Metadata
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="font-medium">{analysisResults.estimatedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty Level:</span>
                      <Badge variant="secondary">{analysisResults.difficulty}</Badge>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-2">Prerequisites:</span>
                      <div className="flex flex-wrap gap-1">
                        {analysisResults.prerequisites.map((prereq, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {prereq}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="strengths" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Content Strengths
                  </CardTitle>
                  <CardDescription>
                    Areas where your content excels and provides excellent learning value
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisResults.strengths.map((strength, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800">{strength}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="improvements" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResults.weaknesses.map((weakness, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                          <p className="text-orange-800">{weakness}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-600" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysisResults.improvements.map((improvement, index) => (
                        <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <p className="text-yellow-800">{improvement}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-blue-600" />
                    Predicted Student Impact
                  </CardTitle>
                  <CardDescription>
                    How this content will likely perform with different student groups
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Beginner Students</h4>
                        <Progress value={analysisResults.studentImpact.beginnerFriendly} className="mb-2" />
                        <p className="text-sm text-blue-700">
                          Content is well-structured for newcomers with clear explanations and examples.
                        </p>
                      </div>
                      
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <h4 className="font-medium text-purple-900 mb-2">Advanced Students</h4>
                        <Progress value={75} className="mb-2" />
                        <p className="text-sm text-purple-700">
                          May need additional advanced topics and edge cases to fully engage experienced learners.
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Practical Application</h4>
                        <Progress value={analysisResults.studentImpact.practicalApplication} className="mb-2" />
                        <p className="text-sm text-green-700">
                          Students will be able to apply concepts immediately in real-world scenarios.
                        </p>
                      </div>
                      
                      <div className="bg-teal-50 p-4 rounded-lg">
                        <h4 className="font-medium text-teal-900 mb-2">Knowledge Retention</h4>
                        <Progress value={88} className="mb-2" />
                        <p className="text-sm text-teal-700">
                          Strong foundation with examples should lead to good long-term retention.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* AI Content Recreation Section */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mr-3">
                  <Wand2 className="h-5 w-5 text-white" />
                </div>
                AI Content Recreation
              </CardTitle>
              <CardDescription>
                Let AI recreate and enhance your content based on the analysis insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => handleContentRecreation('enhanced')}
                  disabled={isRecreating}
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50"
                >
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Enhanced Version</span>
                </Button>
                
                <Button
                  onClick={() => handleContentRecreation('comprehensive')}
                  disabled={isRecreating}
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                >
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Comprehensive Course</span>
                </Button>
                
                <Button
                  onClick={() => handleContentRecreation('targeted')}
                  disabled={isRecreating}
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50"
                >
                  <Target className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Targeted Versions</span>
                </Button>
                
                <Button
                  onClick={() => handleContentRecreation('multimodal')}
                  disabled={isRecreating}
                  variant="outline"
                  className="h-20 flex-col space-y-2 border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50"
                >
                  <PlusCircle className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Multimodal Content</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700">
              Generate Quiz from Content
            </Button>
            <Button variant="outline">
              Create Teacher Plan
            </Button>
            <Button variant="outline">
              Download Report
            </Button>
            <Button variant="outline">
              Save Analysis
            </Button>
          </div>
        </div>
      )}

      {/* Content Recreation Loading */}
      {isRecreating && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
          <CardContent className="p-12">
            <div className="text-center">
              <div className="relative mb-8">
                <div className="animate-spin h-16 w-16 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Wand2 className="h-6 w-6 text-purple-600 animate-pulse" />
                </div>
              </div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                AI is recreating your content...
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Generating enhanced content with improved structure, interactivity, and learning outcomes
              </p>
              
              <div className="flex justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-purple-600 rounded-full animate-pulse mr-2"></div>
                  Enhancing content structure
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-pink-600 rounded-full animate-pulse mr-2"></div>
                  Adding interactive elements
                </div>
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-indigo-600 rounded-full animate-pulse mr-2"></div>
                  Optimizing for engagement
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recreated Content Results */}
      {recreatedContent && !isRecreating && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Wand2 className="h-6 w-6 mr-3 text-purple-600" />
                  AI-Generated Content
                </span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {recreationType} Version
                </Badge>
              </CardTitle>
              <CardDescription>
                Your content has been recreated and enhanced using advanced AI
              </CardDescription>
            </CardHeader>
          </Card>

          <Tabs value={activeRecreationTab} onValueChange={setActiveRecreationTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {recreationType === 'enhanced' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                      Enhanced Content Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{recreatedContent.enhanced.title}</h3>
                        <p className="text-gray-600">Your content has been enhanced with interactive elements, visual aids, and improved structure.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Key Improvements</h4>
                          <ul className="space-y-1 text-sm text-green-700">
                            {recreatedContent.enhanced.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Content Sections</h4>
                          <div className="space-y-2">
                            {recreatedContent.enhanced.sections.map((section, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span className="text-blue-700">{section.title}</span>
                                <Badge variant="outline" className="text-xs">
                                  {section.type}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recreationType === 'comprehensive' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
                      Comprehensive Course Structure
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{recreatedContent.comprehensive.title}</h3>
                        <p className="text-gray-600">A complete course curriculum with multiple modules and comprehensive coverage.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Course Modules</h4>
                          <div className="space-y-3">
                            {recreatedContent.comprehensive.sections.map((module, index) => (
                              <div key={index} className="bg-blue-50 p-3 rounded-lg">
                                <div className="flex justify-between items-start mb-1">
                                  <h5 className="font-medium text-blue-900">{module.title}</h5>
                                  <Badge variant="outline" className="text-xs">{module.duration}</Badge>
                                </div>
                                <p className="text-sm text-blue-700">{module.lessons} lessons</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Course Features</h4>
                          <div className="space-y-2">
                            {recreatedContent.comprehensive.features.map((feature, index) => (
                              <div key={index} className="flex items-start">
                                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {recreationType === 'targeted' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-green-600" />
                      Targeted Learning Paths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(recreatedContent.targeted).map(([level, content]) => (
                        <div key={level} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border">
                          <div className="flex items-center mb-3">
                            <div className={`h-3 w-3 rounded-full mr-2 ${
                              level === 'beginners' ? 'bg-green-500' : 
                              level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}></div>
                            <h4 className="font-medium capitalize">{level}</h4>
                          </div>
                          <h5 className="font-semibold text-sm mb-2">{content.title}</h5>
                          <p className="text-xs text-gray-600 mb-3">{content.focus}</p>
                          <div className="space-y-1">
                            {content.features.map((feature, index) => (
                              <div key={index} className="flex items-center text-xs">
                                <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {recreationType === 'multimodal' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PlusCircle className="h-5 w-5 mr-2 text-orange-600" />
                      Multimodal Learning Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {Object.entries(recreatedContent.multimodal).map(([type, description]) => (
                        <div key={type} className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200">
                          <div className="text-center">
                            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                              {type === 'text' && <FileText className="h-6 w-6 text-orange-600" />}
                              {type === 'video' && <Upload className="h-6 w-6 text-orange-600" />}
                              {type === 'interactive' && <Brain className="h-6 w-6 text-orange-600" />}
                              {type === 'quizzes' && <CheckCircle className="h-6 w-6 text-orange-600" />}
                              {type === 'projects' && <Target className="h-6 w-6 text-orange-600" />}
                            </div>
                            <h4 className="font-medium text-orange-900 capitalize mb-2">{type}</h4>
                            <p className="text-xs text-orange-700">{description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Generated Content Preview</CardTitle>
                  <CardDescription>Preview of the AI-generated content structure and sections</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-300">
                    <div className="text-center text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Content Preview</h3>
                      <p className="text-sm">
                        Full content preview will be available after export. 
                        The AI has generated comprehensive content based on your analysis.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>AI Enhancement Features</CardTitle>
                  <CardDescription>Advanced features added to improve learning outcomes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <Brain className="h-8 w-8 text-blue-600 mb-3" />
                      <h4 className="font-medium text-blue-900 mb-2">Interactive Elements</h4>
                      <p className="text-sm text-blue-700">Code sandboxes, live demos, and interactive examples</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <Target className="h-8 w-8 text-green-600 mb-3" />
                      <h4 className="font-medium text-green-900 mb-2">Adaptive Learning</h4>
                      <p className="text-sm text-green-700">Content adapts to different skill levels and learning preferences</p>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <Sparkles className="h-8 w-8 text-purple-600 mb-3" />
                      <h4 className="font-medium text-purple-900 mb-2">Visual Enhancements</h4>
                      <p className="text-sm text-purple-700">Diagrams, animations, and visual learning aids</p>
                    </div>
                    
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-orange-600 mb-3" />
                      <h4 className="font-medium text-orange-900 mb-2">Assessment Integration</h4>
                      <p className="text-sm text-orange-700">Embedded quizzes and progress tracking</p>
                    </div>
                    
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <Users className="h-8 w-8 text-pink-600 mb-3" />
                      <h4 className="font-medium text-pink-900 mb-2">Collaboration Tools</h4>
                      <p className="text-sm text-pink-700">Discussion forums and peer learning features</p>
                    </div>
                    
                    <div className="bg-teal-50 p-4 rounded-lg">
                      <RefreshCw className="h-8 w-8 text-teal-600 mb-3" />
                      <h4 className="font-medium text-teal-900 mb-2">Continuous Updates</h4>
                      <p className="text-sm text-teal-700">Content automatically updates with latest best practices</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Export Your Enhanced Content</CardTitle>
                  <CardDescription>Choose your preferred format to export the AI-generated content</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">PDF Document</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <BookOpen className="h-6 w-6" />
                      <span className="text-sm">Interactive Course</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Upload className="h-6 w-6" />
                      <span className="text-sm">LMS Package</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col space-y-2">
                      <Copy className="h-6 w-6" />
                      <span className="text-sm">Copy Content</span>
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700">
                      <Download className="h-4 w-4 mr-2" />
                      Download Enhanced Content
                    </Button>
                    <Button variant="outline">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Continue Editing
                    </Button>
                    <Button variant="outline">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate with Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}