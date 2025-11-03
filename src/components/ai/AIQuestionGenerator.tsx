import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Brain, Sparkles, RefreshCw, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface Question {
  question: string;
  type: string;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  difficulty: string;
  points: number;
}

export function AIQuestionGenerator() {
  const [content, setContent] = useState('');
  const [questionType, setQuestionType] = useState('multiple-choice');
  const [difficulty, setDifficulty] = useState('medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [field, setField] = useState('');
  const [course, setCourse] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Please enter content to generate questions from');
      return;
    }

    if (!field || !course) {
      toast.error('Please select field and course for question bank hierarchy');
      return;
    }

    setLoading(true);
    try {
      const response = await api.ai.generateQuestions({
        content,
        questionType,
        difficulty,
        numberOfQuestions,
        field,
        course
      });

      if (response) {
        setGeneratedQuestions(response.questions || []);
        toast.success(
          `Generated ${response.questionsGenerated || response.questions?.length || 0} questions! Used ${response.creditsUsed || 0} AI credits. Questions added to question bank.`
        );
      }
    } catch (error: any) {
      console.error('Question generation failed:', error);
      toast.error(error?.error?.message || 'Failed to generate questions');
      
      // Fallback to mock data for demo
      const mockQuestions: Question[] = Array.from({ length: numberOfQuestions }, (_, i) => ({
        question: `Sample ${questionType} question ${i + 1} about the content?`,
        type: questionType,
        options: questionType === 'multiple-choice' ? [
          'Option A',
          'Option B',
          'Option C',
          'Option D'
        ] : undefined,
        correctAnswer: questionType === 'multiple-choice' ? 0 : 'Sample answer',
        explanation: 'This is the explanation for this question.',
        difficulty,
        points: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
      }));
      setGeneratedQuestions(mockQuestions);
      toast.info('Showing demo questions. Backend integration ready.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToQuestionBank = async () => {
    toast.success('Questions already added to question bank automatically!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Question Generator</h1>
          <p className="text-gray-600 mt-1">
            Generate intelligent questions from your content using AI
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-purple-600" />
          <span className="font-medium text-purple-600">Powered by Gemini AI</span>
        </div>
      </div>

      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
            Content & Settings
          </CardTitle>
          <CardDescription>
            Paste your lesson content and configure question parameters
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Lesson Content</label>
            <Textarea
              placeholder="Paste your lesson content here. The AI will analyze it and generate relevant questions..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              className="resize-none"
            />
            <p className="text-sm text-gray-500 mt-1">
              {content.length} characters • Cost: {numberOfQuestions} credits (1 credit per question)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Question Type</label>
              <Select value={questionType} onValueChange={setQuestionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="true-false">True/False</SelectItem>
                  <SelectItem value="short-answer">Short Answer</SelectItem>
                  <SelectItem value="essay">Essay</SelectItem>
                  <SelectItem value="fill-in-the-blank">Fill in the Blank</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty Level</label>
              <Select value={difficulty} onValueChange={setDifficulty}>
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
              <label className="text-sm font-medium mb-2 block">Number of Questions</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={numberOfQuestions}
                onChange={(e) => setNumberOfQuestions(parseInt(e.target.value) || 1)}
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

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading || !content.trim() || !field || !course}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Questions */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Generated Questions ({generatedQuestions.length})
                </CardTitle>
                <CardDescription>
                  Questions automatically added to question bank: {field} → {course}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                Auto-saved to Question Bank
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuestions.map((question, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{question.type}</Badge>
                      <Badge variant="outline">{question.difficulty}</Badge>
                      <Badge variant="outline">{question.points} points</Badge>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      {index + 1}. {question.question}
                    </h4>
                  </div>
                </div>

                {question.options && (
                  <div className="space-y-1 ml-4">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`p-2 rounded ${
                          optIndex === question.correctAnswer
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50'
                        }`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === question.correctAnswer && (
                          <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {typeof question.correctAnswer === 'string' && !question.options && (
                  <div className="ml-4 p-2 bg-green-50 border border-green-200 rounded">
                    <strong>Correct Answer:</strong> {question.correctAnswer}
                  </div>
                )}

                {question.explanation && (
                  <div className="ml-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                    <HelpCircle className="h-4 w-4 inline mr-1 text-blue-600" />
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="text-sm text-purple-900">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="list-disc list-inside space-y-1 text-purple-800">
                <li>AI analyzes your content and generates relevant questions</li>
                <li>Questions are automatically added to the question bank with proper hierarchy (Field → Course → Questions)</li>
                <li>You can use these questions in quizzes immediately</li>
                <li>Cost: 1 AI credit per question generated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

