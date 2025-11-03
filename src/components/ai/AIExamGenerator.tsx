import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Brain, FileText, RefreshCw, CheckCircle, AlertCircle, Download, Copy } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface ExamQuestion {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: string;
  points: number;
}

interface GeneratedExam {
  title: string;
  description: string;
  timeLimit: number;
  totalPoints: number;
  passingScore: number;
  questions: ExamQuestion[];
}

export function AIExamGenerator() {
  const [syllabus, setSyllabus] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 30,
    medium: 50,
    hard: 20
  });
  const [field, setField] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);

  const handleGenerate = async () => {
    if (!syllabus.trim() || !examTitle.trim()) {
      toast.error('Please enter exam title and syllabus');
      return;
    }

    if (!field || !course) {
      toast.error('Please select field and course for question bank');
      return;
    }

    setLoading(true);
    try {
      const response = await api.ai.generateExam({
        syllabus,
        examTitle,
        duration,
        totalQuestions,
        difficultyDistribution,
        field,
        course
      });

      if (response) {
        setGeneratedExam(response.exam || response);
        toast.success(
          `Exam generated with ${(response.exam || response).questions?.length || 0} questions! Used ${response.creditsUsed || 0} AI credits. All questions added to question bank.`
        );
      }
    } catch (error: any) {
      console.error('Exam generation failed:', error);
      toast.error(error?.error?.message || 'Failed to generate exam');
      
      // Fallback to mock data
      const mockExam: GeneratedExam = {
        title: examTitle,
        description: 'AI-generated comprehensive exam based on the provided syllabus',
        timeLimit: duration,
        totalPoints: totalQuestions * 2,
        passingScore: 60,
        questions: Array.from({ length: totalQuestions }, (_, i) => ({
          question: `Question ${i + 1} about the syllabus content?`,
          type: 'multiple-choice',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 0,
          explanation: 'Explanation for this question.',
          difficulty: i < totalQuestions * 0.3 ? 'easy' : i < totalQuestions * 0.8 ? 'medium' : 'hard',
          points: 2
        }))
      };
      setGeneratedExam(mockExam);
      toast.info('Showing demo exam. Backend integration ready.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExam = () => {
    if (!generatedExam) return;
    
    const examText = `
${generatedExam.title}
${'='.repeat(generatedExam.title.length)}

${generatedExam.description}

Duration: ${generatedExam.timeLimit} minutes
Total Points: ${generatedExam.totalPoints}
Passing Score: ${generatedExam.passingScore}%

Questions:
${generatedExam.questions.map((q, i) => `
${i + 1}. ${q.question}
${q.options ? q.options.map((opt, j) => `   ${String.fromCharCode(65 + j)}. ${opt}`).join('\n') : ''}
Correct Answer: ${typeof q.correctAnswer === 'number' ? String.fromCharCode(65 + q.correctAnswer) : q.correctAnswer}
Points: ${q.points}
`).join('\n')}
    `.trim();

    const blob = new Blob([examText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${examTitle.replace(/\s+/g, '_')}_exam.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exam downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Exam Generator</h1>
          <p className="text-gray-600 mt-1">
            Generate comprehensive exams from your syllabus using AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <span className="font-medium text-indigo-600">Powered by Gemini AI</span>
        </div>
      </div>

      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-indigo-600" />
            Exam Configuration
          </CardTitle>
          <CardDescription>
            Configure your exam parameters and provide the syllabus
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Exam Title</label>
              <Input
                placeholder="e.g., Final Exam - React Development"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Duration (minutes)</label>
              <Input
                type="number"
                min="15"
                max="180"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Total Questions</label>
              <Input
                type="number"
                min="5"
                max="50"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value) || 20)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Field (for Question Bank)</label>
              <Input
                placeholder="e.g., Computer Science"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium mb-2 block">Course (for Question Bank)</label>
              <Input
                placeholder="e.g., React Development"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Difficulty Distribution</label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Easy</span>
                  <Badge variant="outline">{difficultyDistribution.easy}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.easy]}
                  onValueChange={([value]) => setDifficultyDistribution(prev => ({ ...prev, easy: value }))}
                  max={100}
                  step={10}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Medium</span>
                  <Badge variant="outline">{difficultyDistribution.medium}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.medium]}
                  onValueChange={([value]) => setDifficultyDistribution(prev => ({ ...prev, medium: value }))}
                  max={100}
                  step={10}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">Hard</span>
                  <Badge variant="outline">{difficultyDistribution.hard}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.hard]}
                  onValueChange={([value]) => setDifficultyDistribution(prev => ({ ...prev, hard: value }))}
                  max={100}
                  step={10}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Syllabus / Topics to Cover</label>
            <Textarea
              placeholder="Enter the syllabus or topics that should be covered in the exam. The AI will generate questions based on this content..."
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {syllabus.length} characters • Cost: {totalQuestions} credits (1 credit per question)
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading || !syllabus.trim() || !examTitle.trim() || !field || !course}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating Exam...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Complete Exam
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Exam */}
      {generatedExam && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  {generatedExam.title}
                </CardTitle>
                <CardDescription>
                  {generatedExam.questions.length} questions • {generatedExam.timeLimit} minutes • {generatedExam.totalPoints} points
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleDownloadExam}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Added to Question Bank
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-indigo-900"><strong>Description:</strong> {generatedExam.description}</p>
              <p className="text-sm text-indigo-900"><strong>Passing Score:</strong> {generatedExam.passingScore}%</p>
            </div>

            <div className="space-y-3">
              {generatedExam.questions.slice(0, 5).map((question, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{question.type}</Badge>
                    <Badge variant="outline">{question.difficulty}</Badge>
                    <Badge variant="outline">{question.points} pts</Badge>
                  </div>
                  <h4 className="font-medium mb-2">{index + 1}. {question.question}</h4>
                  {question.options && (
                    <div className="space-y-1 ml-4 text-sm">
                      {question.options.map((opt, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === question.correctAnswer ? 'bg-green-50 border border-green-200' : 'bg-gray-50'
                          }`}
                        >
                          {String.fromCharCode(65 + optIndex)}. {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {generatedExam.questions.length > 5 && (
                <p className="text-center text-sm text-gray-500">
                  ... and {generatedExam.questions.length - 5} more questions
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-medium mb-1">Exam Generation Features:</p>
              <ul className="list-disc list-inside space-y-1 text-indigo-800">
                <li>AI creates a complete exam based on your syllabus</li>
                <li>Questions distributed according to difficulty preferences</li>
                <li>All questions automatically added to question bank (Field → Course hierarchy)</li>
                <li>Can be used immediately in your courses</li>
                <li>Download exam for offline use or review</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

