import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Slider } from '../ui/slider';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Brain, FileText, RefreshCw, CheckCircle, AlertCircle, Download, Plus, Trash2, GripVertical } from 'lucide-react';
import { api } from '../../services/api';
import { useAICredits } from '../context/AICreditsContext';
import { toast } from 'sonner';
import { ErrorBoundary } from '../shared/ErrorBoundary';
import { formatApiError, getErrorMessage, isRetryableError } from '../../utils/errorHandling';
import type {
  AccessibleResource,
  AccessibleLesson,
} from '../../interfaces/lesson.types';
import type {
  AccessibleCourse,
  AccessibleField,
} from '../../interfaces/course.types';
import type { ExamSection, ExamQuestion, CreateExamRequest } from '../../interfaces/exam.types';
import type { GeneratedExam } from '../../interfaces/ai.types';
import { QuestionBankSelector } from '../tools/QuestionBankSelector';
import { useLanguage } from '../context/LanguageContext';

const normalizeCollection = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.results)) return response.results;
  if (response.data?.items) return response.data.items;
  if (Array.isArray(response.courses)) return response.courses;
  if (Array.isArray(response.lessons)) return response.lessons;
  if (Array.isArray(response.history)) return response.history;
  return [];
};

const normalizeAccessibleFields = (response: any, t: (key: string) => string): AccessibleField[] => {
  const source = response?.data?.fields || response?.fields || [];
  return source.map((field: any) => ({
    _id: field._id || field.id,
    name: field.name,
    description: field.description,
    icon: field.icon,
    accessType: field.accessType,
    permissions: field.permissions || [],
    courses: (field.courses || []).map((course: any) => ({
      _id: course._id || course.id,
      title: course.title || course.name || t('aiExam.untitledCourse'),
      description: course.description,
      status: course.status,
      lessons: course.lessons,
      students: course.students,
    })),
  }));
};

const mapLesson = (lesson: any, t: (key: string) => string): AccessibleLesson => ({
  _id: lesson._id || lesson.id,
  title: lesson.title || lesson.name || t('aiExam.untitledLesson'),
  description: lesson.description,
  content: lesson.content,
  resources: (lesson.resources || []).map((resource: any) => ({
    id: resource._id || resource.id,
    title: resource.title,
    type: resource.type,
    url: resource.url,
    description: resource.description,
    extractedText: resource.extractedText,
    text: resource.text,
    content: resource.content,
    textContent: resource.textContent,
    size: resource.size,
    updatedAt: resource.updatedAt,
  })),
});

const extractResourceText = (resource: AccessibleResource | null): string => {
  if (!resource) return '';
  return (
    resource.textContent ||
    resource.content ||
    resource.extractedText ||
    resource.text ||
    ''
  );
};

const QUESTION_TYPE_VALUES = ['multiple-choice', 'true-false', 'essay'];


const normalizeExamResponse = (response: any, t: (key: string) => string): GeneratedExam | null => {
  if (!response) return null;
  
  const exam = response.data?.exam || response.exam || response;
  if (!exam) return null;
  
  // If exam has sections, use them; otherwise try to use questions array
  if (exam.sections && Array.isArray(exam.sections)) {
    return {
      title: exam.title || '',
      description: exam.description || '',
      timeLimit: exam.duration || exam.timeLimit || 60,
      totalPoints: exam.totalPoints || 0,
      passingScore: exam.passingScore,
      sections: exam.sections,
    };
  }
  
  // Fallback for old format
  if (exam.questions && Array.isArray(exam.questions)) {
    return {
      title: exam.title || '',
      description: exam.description || '',
      timeLimit: exam.duration || exam.timeLimit || 60,
      totalPoints: exam.totalPoints || 0,
      passingScore: exam.passingScore,
      sections: [{
        title: 'All Questions',
        questions: exam.questions,
        points: exam.totalPoints || 0,
      }],
    };
  }
  
  return null;
};

const getAllQuestions = (exam: GeneratedExam | null): any[] => {
  if (!exam) return [];
  return exam.sections?.flatMap(section => section.questions || []) || [];
};

const distributeQuestionCounts = (types: string[], total: number): Record<string, number> => {
  if (types.length === 0) {
    return {};
  }
  if (total <= 0) {
    return types.reduce((acc, type) => {
      acc[type] = 0;
      return acc;
    }, {} as Record<string, number>);
  }
  const base = Math.floor(total / types.length);
  const remainder = total % types.length;
  const result: Record<string, number> = {};
  types.forEach((type, index) => {
    result[type] = base + (index < remainder ? 1 : 0);
  });
  return result;
};

export function AIExamGenerator() {

  const { t, isRTL } = useLanguage();
  const { refresh: refreshAICredits } = useAICredits();

  const questionTypeOptions = useMemo(() => [
    { value: 'multiple-choice', label: t('aiExam.types.multipleChoice') },
    { value: 'true-false', label: t('aiExam.types.trueFalse') },
    { value: 'essay', label: t('aiExam.types.essay') },
  ], [t]);

  // Mode: 'ai' or 'manual'
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  
  // Shared exam metadata
  const [examTitle, setExamTitle] = useState('');
  const [examDescription, setExamDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [totalPoints, setTotalPoints] = useState(100);
  const [passingScore, setPassingScore] = useState(60);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [instructions, setInstructions] = useState('');
  
  // AI Generation specific state
  const [totalQuestions, setTotalQuestions] = useState(20);
  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 30,
    medium: 50,
    hard: 20,
  });
  
  // Manual Creation specific state
  const [manualSections, setManualSections] = useState<ExamSection[]>([
    { id: '1', title: `${t('aiExam.sectionDefault')} 1`, questions: [], points: 0, order: 1 }
  ]);
  const [showQuestionBankSelector, setShowQuestionBankSelector] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('1');

  const [language, setLanguage] = useState<'en' | 'ar' | 'auto'>('en');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<string[]>(
    QUESTION_TYPE_VALUES,
  );
  const [questionTypeCounts, setQuestionTypeCounts] = useState<Record<string, number>>({});

  const [accessibleFields, setAccessibleFields] = useState<AccessibleField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState('');
  const [courses, setCourses] = useState<AccessibleCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [lessons, setLessons] = useState<AccessibleLesson[]>([]);
  const [lessonResources, setLessonResources] = useState<Record<string, AccessibleResource[]>>({});
  const [lessonResourcesLoading, setLessonResourcesLoading] = useState<Record<string, boolean>>({});
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<Record<string, Set<string>>>({});
  const [resourceTexts, setResourceTexts] = useState<Record<string, string>>({});
  const [resourceTextLoading, setResourceTextLoading] = useState<Record<string, boolean>>({});

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const me = await api.getMe();
        await loadAccessibleHierarchy(me);
      } catch (error) {
        console.error('Failed to load accessible hierarchy', error);
        toast.error(t('aiExam.errors.loadCourses'));
      }
    };

    void initialize();
  }, []);

  useEffect(() => {
    if (!selectedFieldId) {
      setCourses([]);
      setSelectedCourseId('');
      return;
    }
    const field = accessibleFields.find((item) => item._id === selectedFieldId);
    const fieldCourses = field?.courses || [];
    setCourses(fieldCourses);
    if (fieldCourses.length > 0) {
      setSelectedCourseId((prev) =>
        fieldCourses.some((course: AccessibleCourse) => course._id === prev) ? prev : fieldCourses[0]._id,
      );
    } else {
      setSelectedCourseId('');
    }
  }, [selectedFieldId, accessibleFields]);

  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      setSelectedLessons([]);
      setSelectedResourceIds({});
      setLessonResources({});
      setResourceTexts({});
      return;
    }
    void fetchLessons(selectedCourseId);
    setSelectedLessons([]);
    setSelectedResourceIds({});
    setLessonResources({});
    setResourceTexts({});
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedQuestionTypes.length === 0) {
      setQuestionTypeCounts({});
      return;
    }

    setQuestionTypeCounts((prev) => {
      const next: Record<string, number> = {};
      let preservedSum = 0;
      selectedQuestionTypes.forEach((type) => {
        if (prev[type] !== undefined) {
          next[type] = prev[type];
          preservedSum += prev[type];
        }
      });

      if (
        preservedSum === totalQuestions &&
        Object.keys(next).length === selectedQuestionTypes.length
      ) {
        return next;
      }

      const distributed = distributeQuestionCounts(selectedQuestionTypes, totalQuestions);
      selectedQuestionTypes.forEach((type) => {
        next[type] = distributed[type];
      });
      return next;
    });
  }, [selectedQuestionTypes, totalQuestions]);

  useEffect(() => {
    setSelectedLessons((prev) => prev.filter((lessonId) => lessons.some((lesson) => lesson._id === lessonId)));
    setSelectedResourceIds((prev) => {
      const next: Record<string, Set<string>> = {};
      Object.entries(prev).forEach(([lessonId, ids]) => {
        if (lessons.some((lesson) => lesson._id === lessonId) && ids.size > 0) {
          next[lessonId] = ids;
        }
      });
      return next;
    });
  }, [lessons]);

  const loadAccessibleHierarchy = async (currentUser: any) => {
    if (!currentUser) return;
    setCoursesLoading(true);
    try {
      const instructorId = currentUser._id || currentUser.id;
      const response = await api.course.getAccessibleCourses(instructorId);
      const fields = normalizeAccessibleFields(response, t);
      setAccessibleFields(fields);
      if (fields.length > 0) {
        setSelectedFieldId((prev) => prev || fields[0]._id);
      }
    } catch (error) {
      console.error('Failed to load accessible courses', error);
      toast.error('Unable to fetch accessible courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    setLessonsLoading(true);
    try {
      const response = await api.course.getLessons(courseId);
      const normalized = normalizeCollection(response).map(lesson => mapLesson(lesson, t));
      setLessons(normalized);
      if (normalized.length === 0) {
        toast.info('No lessons found for this course');
      }
    } catch (error) {
      console.error('Failed to load lessons', error);
      toast.error('Unable to load lessons for the selected course');
      setLessons([]);
    } finally {
      setLessonsLoading(false);
    }
  };

  const ensureLessonResources = async (lessonId: string) => {
    if (lessonResources[lessonId]) return;
    setLessonResourcesLoading((prev) => ({ ...prev, [lessonId]: true }));
    try {
      const response = await api.course.getLesson(lessonId);
      const details = response?.data || response;
      const resources = (details?.resources || []).map((resource: any) => ({
        id: resource._id || resource.id,
        title: resource.title,
        type: resource.type,
        url: resource.url,
        description: resource.description,
        extractedText: resource.extractedText,
        text: resource.text,
        content: resource.content,
        textContent: resource.textContent,
        size: resource.size,
        updatedAt: resource.updatedAt,
      }));
      setLessonResources((prev) => ({ ...prev, [lessonId]: resources }));
    } catch (error) {
      console.error('Failed to load lesson resources', error);
      toast.error('Unable to load resources for the selected lesson');
      setLessonResources((prev) => ({ ...prev, [lessonId]: [] }));
    } finally {
      setLessonResourcesLoading((prev) => ({ ...prev, [lessonId]: false }));
    }
  };

  const handleToggleLesson = async (lessonId: string, checked: boolean) => {
    if (checked) {
      setSelectedLessons((prev) => Array.from(new Set([...prev, lessonId])));
      await ensureLessonResources(lessonId);
    } else {
      setSelectedLessons((prev) => prev.filter((id) => id !== lessonId));
      setSelectedResourceIds((prev) => {
        const next = { ...prev };
        delete next[lessonId];
        return next;
      });
    }
  };

  const loadResourceText = async (resource: AccessibleResource) => {
    if (resourceTexts[resource.id] || resourceTextLoading[resource.id]) {
      return;
    }
    setResourceTextLoading((prev) => ({ ...prev, [resource.id]: true }));
    try {
      let text = extractResourceText(resource);
      if (!text && resource.url) {
        try {
          const resp = await fetch(resource.url);
          const blob = await resp.blob();
          if (blob.type.startsWith('text/')) {
            text = await blob.text();
          }
        } catch (error) {
          console.error('Failed to fetch resource content', error);
        }
      }
      if (text) {
        setResourceTexts((prev) => ({ ...prev, [resource.id]: text }));
      }
    } finally {
      setResourceTextLoading((prev) => ({ ...prev, [resource.id]: false }));
    }
  };

  const handleQuestionTypeCountChange = (type: string, value: number) => {
    const sanitized = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
    setQuestionTypeCounts((prev) => ({ ...prev, [type]: sanitized }));
  };

  const handleToggleResource = async (
    lessonId: string,
    resource: AccessibleResource,
    checked: boolean,
  ) => {
    setSelectedResourceIds((prev) => {
      const next: Record<string, Set<string>> = { ...prev };
      const current = new Set(next[lessonId] ?? []);
      if (checked) {
        current.add(resource.id);
      } else {
        current.delete(resource.id);
      }
      if (current.size > 0) {
        next[lessonId] = current;
      } else {
        delete next[lessonId];
      }
      return next;
    });

    if (checked) {
      await loadResourceText(resource);
    }
  };

  const aggregatedSelections = useMemo(() => {
    const entries: Array<{
      lessonId: string;
      lessonTitle: string;
      resourceId: string;
      resource: AccessibleResource;
      text: string;
    }> = [];

    Object.entries(selectedResourceIds).forEach(([lessonId, resourceSet]) => {
      const lesson = lessons.find((item) => item._id === lessonId);
      const resources = lessonResources[lessonId] || [];
      resourceSet.forEach((resourceId) => {
        const resource = resources.find((res) => res.id === resourceId);
        if (resource) {
          entries.push({
            lessonId,
            lessonTitle: lesson?.title || 'Lesson',
            resourceId,
            resource,
            text: resourceTexts[resourceId] || '',
          });
        }
      });
    });

    return entries;
  }, [selectedResourceIds, lessons, lessonResources, resourceTexts]);

  const aggregatedContent = useMemo(() => {
    const parts = aggregatedSelections.map((entry) => {
      const text = entry.text?.trim();
      if (text && text.length > 0) {
        return text;
      }
      return `Resource: ${entry.resource.title || entry.resourceId}`;
    });

    if (instructions.trim()) {
      parts.push(`Additional Instructions:\n${instructions.trim()}`);
    }

    return parts.join('\n\n').trim();
  }, [aggregatedSelections, instructions]);

  const totalSelectedResources = aggregatedSelections.length;
  const questionTypeCountSum = selectedQuestionTypes.reduce(
    (sum, type) => sum + (questionTypeCounts[type] ?? 0),
    0,
  );
  const questionTypeCountsValid =
    selectedQuestionTypes.length > 0 && questionTypeCountSum === totalQuestions;
  const canGenerateExam =
    Boolean(examTitle.trim()) &&
    Boolean(selectedFieldId) &&
    Boolean(selectedCourseId) &&
    totalSelectedResources > 0 &&
    selectedQuestionTypes.length > 0 &&
    questionTypeCountsValid &&
    duration > 0 &&
    totalQuestions > 0;

  const handleGenerate = async () => {
    if (!canGenerateExam) {
      toast.error(t('aiExam.errors.incomplete'));
      return;
    }

    const resourceSelectionsPayload = Object.entries(selectedResourceIds).map(
      ([lessonId, resourceSet]) => ({
        lessonId,
        resourceIds: Array.from(resourceSet),
      }),
    );

    const resourceMetadata = aggregatedSelections.map((entry) => ({
      lessonId: entry.lessonId,
      lessonTitle: entry.lessonTitle,
      resourceId: entry.resourceId,
      resourceTitle: entry.resource.title,
      resourceType: entry.resource.type,
    }));

    const questionTypeDistribution = selectedQuestionTypes.reduce(
      (acc, type) => {
        acc[type] = questionTypeCounts[type] ?? 0;
        return acc;
      },
      {} as Record<string, number>,
    );

    const distributionTotal =
      difficultyDistribution.easy + difficultyDistribution.medium + difficultyDistribution.hard;
    const normalizedDifficulty = distributionTotal && distributionTotal !== 100
      ? {
          easy: Math.round((difficultyDistribution.easy / distributionTotal) * 100),
          medium: Math.round((difficultyDistribution.medium / distributionTotal) * 100),
          hard: 100 -
            Math.round((difficultyDistribution.easy / distributionTotal) * 100) -
            Math.round((difficultyDistribution.medium / distributionTotal) * 100),
        }
      : difficultyDistribution;

    const payload = {
      content: aggregatedContent,
      courseId: selectedCourseId,
      language,
      examConfig: {
        title: examTitle,
        totalQuestions,
        duration,
        difficultyDistribution: normalizedDifficulty,
        fieldId: selectedFieldId,
        questionTypes: selectedQuestionTypes,
        questionTypeDistribution,
        resourceSelections: resourceSelectionsPayload,
        resourceMetadata,
        instructions: instructions.trim() || undefined,
      },
      autoAddToBank: true,
    };

    setLoading(true);
    try {
      const response = await api.ai.generateExam(payload);

      if (response) {
        const normalizedExam = normalizeExamResponse(response, t);
        if (normalizedExam) {
          setGeneratedExam(normalizedExam);
          const totalQuestions = getAllQuestions(normalizedExam).length;
          toast.success(
            t('aiExam.success.generated', {
              count: totalQuestions,
              credits: response.creditsUsed || response.data?.creditsUsed || 0
            })
          );
          void refreshAICredits();
        } else {
          toast.error(t('aiExam.errors.parse'));
        }
      }
    } catch (error: any) {
      console.error('Exam generation failed:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      if (isRetryableError(error)) {
        toast.error(`${formattedError.message}. Please try again.`);
      } else {
        toast.error(formattedError.message || t('aiExam.errors.generate'));
      }

      const mockQuestions = Array.from({ length: totalQuestions }, (_, i) => ({
        question: `${t('aiExam.demo.question')} ${i + 1}`,
        type: selectedQuestionTypes[0] || 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: t('aiExam.demo.explanation'),
        difficulty:
          i < totalQuestions * 0.3
            ? 'easy'
            : i < totalQuestions * 0.8
            ? 'medium'
            : 'hard',
        points: 2,
      }));
      
      const mockExam: GeneratedExam = {
        title: examTitle,
        description: t('aiExam.demo.description'),
        timeLimit: duration,
        totalPoints: totalQuestions * 2,
        passingScore: 60,
        sections: [{
          title: t('aiExam.allQuestions'),
          questions: mockQuestions,
          points: totalQuestions * 2,
        }],
      };
      setGeneratedExam(mockExam);
      toast.info(t('aiExam.demo.ready'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExam = () => {
    if (!generatedExam) return;
    
    const allQuestions = getAllQuestions(generatedExam);
    let questionNumber = 1;
    
    const examText = `
${generatedExam.title}
${'='.repeat(generatedExam.title.length)}

${generatedExam.description || ''}

Duration: ${generatedExam.timeLimit} minutes
Total Points: ${generatedExam.totalPoints}
${generatedExam.passingScore ? `Passing Score: ${generatedExam.passingScore}%` : ''}

${generatedExam.sections.map((section) => `
${section.title}
${'-'.repeat(section.title.length)}

${section.questions.map((q: any) => {
  const qNum = questionNumber++;
  let text = `${qNum}. ${q.question}\n`;
  if (q.options && q.options.length > 0) {
    text += q.options.map((opt: string, j: number) => 
      `   ${String.fromCharCode(65 + j)}. ${opt}`
    ).join('\n') + '\n';
  }
  text += `${t('aiExam.correctAnswer')}: ${typeof q.correctAnswer === 'number' ? String.fromCharCode(65 + q.correctAnswer) : q.correctAnswer}\n`;
  text += `${t('aiExam.points')}: ${q.points}\n`;
  if (q.explanation) {
    text += `${t('aiExam.explanation')}: ${q.explanation}\n`;
  }
  return text;
}).join('\n')}
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

  // Manual creation handlers
  const handleAddSection = () => {
    const newId = String(Date.now());
    setManualSections([...manualSections, {
      id: newId,
      title: `${t('aiExam.sectionDefault')} ${manualSections.length + 1}`,
      questions: [],
      points: 0,
      order: manualSections.length + 1
    }]);
    setSelectedSectionId(newId);
  };

  const handleDeleteSection = (sectionId: string) => {
    if (manualSections.length <= 1) {
      toast.error('At least one section is required');
      return;
    }
    const updated = manualSections.filter(s => s.id !== sectionId);
    setManualSections(updated);
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(updated[0]?.id || '');
    }
  };

  const handleQuestionsFromBank = (questions: any[]) => {
    const section = manualSections.find(s => s.id === selectedSectionId);
    if (!section) return;
    
    const newQuestions: ExamQuestion[] = questions.map((q, idx) => ({
      id: q.id || `q-${Date.now()}-${idx}`,
      question: q.question,
      type: q.type,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      points: q.points || 1,
      difficulty: q.difficulty || 'medium',
      order: section.questions.length + idx + 1
    }));
    
    const updatedSections = manualSections.map(s => 
      s.id === selectedSectionId 
        ? { ...s, questions: [...s.questions, ...newQuestions], points: s.points + newQuestions.reduce((sum, q) => sum + q.points, 0) }
        : s
    );
    setManualSections(updatedSections);
    setShowQuestionBankSelector(false);
    toast.success(`Added ${questions.length} question(s) to section`);
  };

  const handleCreateExam = async () => {
    if (!examTitle.trim()) {
      toast.error('Please enter an exam title');
      return;
    }
    if (!selectedFieldId || !selectedCourseId) {
      toast.error('Please select a field and course');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      let sections: ExamSection[];
      if (mode === 'ai' && generatedExam) {
        sections = generatedExam.sections.map((s, idx) => ({
          id: String(idx + 1),
          title: s.title,
          questions: s.questions.map((q: any, qIdx: number) => ({
            id: `q-${idx}-${qIdx}`,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            points: q.points || 1,
            difficulty: q.difficulty || 'medium',
            order: qIdx + 1
          })),
          points: s.points,
          order: idx + 1
        }));
      } else {
        sections = manualSections.map((s, idx) => ({
          ...s,
          order: idx + 1
        }));
      }

      const examData: CreateExamRequest = {
        title: examTitle,
        description: examDescription,
        courseId: selectedCourseId,
        fieldId: selectedFieldId,
        duration,
        // totalPoints is calculated from sections
        passingScore,
        maxAttempts,
        sections,
        settings: {
          shuffleQuestions: false,
          shuffleAnswers: false,
          showResultsImmediately: false,
          allowLateSubmission: false
        },
        instructions,
        status: 'draft'
      };

      const result = await api.exam.createExam(examData);
      toast.success('Exam created successfully!');
      setGeneratedExam(null);
      setExamTitle('');
      setExamDescription('');
      setManualSections([{ id: '1', title: `${t('aiExam.sectionDefault')} 1`, questions: [], points: 0, order: 1 }]);
    } catch (error: any) {
      console.error('Failed to create exam:', error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      if (isRetryableError(error)) {
        toast.error(`${formattedError.message}. Please try again.`);
      } else {
        toast.error(formattedError.message || t('aiExam.errors.createExam'));
      }
    } finally {
      setLoading(false);
    }
  };

  const totalManualQuestions = manualSections.reduce((sum, s) => sum + s.questions.length, 0);
  const totalManualPoints = manualSections.reduce((sum, s) => sum + s.points, 0);

  return (
    <ErrorBoundary>
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{t('aiExam.error')}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => setError(null)}>
                  {t('aiExam.dismiss')}
                </Button>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </CardContent>
          </Card>
        )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('aiExam.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('aiExam.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Brain className="h-6 w-6 text-indigo-600" />
          <span className="font-medium text-indigo-600">{t('aiExam.poweredBy')}</span>
        </div>
      </div>

      {/* Tabs for AI/Manual Mode */}
      <Tabs value={mode} onValueChange={(v: string) => setMode(v as 'ai' | 'manual')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai">
            <Brain className="h-4 w-4 mr-2" />
            {t('aiExam.aiGeneration')}
          </TabsTrigger>
          <TabsTrigger value="manual">
            <FileText className="h-4 w-4 mr-2" />
            {t('aiExam.manualCreation')}
          </TabsTrigger>
        </TabsList>

        {/* AI Generation Tab */}
        <TabsContent value="ai" className="space-y-6">
          {/* Shared Metadata Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aiExam.examMetadata')}</CardTitle>
              <CardDescription>{t('aiExam.basicInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.examTitle')} *</label>
                  <Input
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder={t('aiExam.enterExamTitle')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.durationMinutes')}</label>
                  <Input
                    type="number"
                    min="10"
                    max="240"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">{t('aiExam.description')}</label>
                <Textarea
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder={t('aiExam.optionalDescription')}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {t('aiExam.examConfiguration')}
          </CardTitle>
          <CardDescription>
            {t('aiExam.configDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.examTitle')}</label>
              <Input
                placeholder={t('aiExam.enterExamTitle')}
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.questionLanguage')}</label>
              <Select value={language} onValueChange={(value: 'en' | 'ar' | 'auto') => setLanguage(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('aiExam.selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t('aiExam.english')}</SelectItem>
                  <SelectItem value="ar">{t('aiExam.arabic')}</SelectItem>
                  <SelectItem value="auto">{t('aiExam.matchResource')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.durationMinutes')}</label>
              <Input
                type="number"
                min="10"
                max="240"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.totalQuestions')}</label>
              <Input
                type="number"
                min="5"
                max="100"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(parseInt(e.target.value, 10) || 20)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.field')}</label>
              <Select
                value={selectedFieldId}
                onValueChange={setSelectedFieldId}
                disabled={coursesLoading || accessibleFields.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={coursesLoading ? t('aiExam.loadingFields') : t('aiExam.selectField')} />
                </SelectTrigger>
                <SelectContent>
                  {accessibleFields.map((field) => (
                    <SelectItem key={field._id} value={field._id}>
                      {field.icon ? `${field.icon} ` : ''}{field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.course')}</label>
              <Select
                value={selectedCourseId}
                onValueChange={setSelectedCourseId}
                disabled={coursesLoading || courses.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      coursesLoading
                        ? t('aiExam.loadingCourses')
                        : selectedFieldId
                        ? t('aiExam.selectCourse')
                        : t('aiExam.chooseFieldFirst')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">{t('aiExam.questionTypes')}</label>
              <div className="space-y-3 rounded-lg border p-3">
                <div className="space-y-2">
                  {questionTypeOptions.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 text-sm">
                      <Checkbox
                        checked={selectedQuestionTypes.includes(option.value)}
                        onCheckedChange={(checked: boolean | 'indeterminate') =>
                          setSelectedQuestionTypes((prev) => {
                            if (checked === true) {
                              return Array.from(new Set([...prev, option.value]));
                            }
                            return prev.filter((value) => value !== option.value);
                          })
                        }
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {selectedQuestionTypes.length === 0 && (
                  <p className="text-xs text-red-500">{t('aiExam.errors.selectQuestionType')}</p>
                )}
                {selectedQuestionTypes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-200">
                    <p className="text-xs uppercase text-gray-500">{t('aiExam.questionsPerType')}</p>
                    <div className="space-y-2">
                      {selectedQuestionTypes.map((type) => {
                        const option = questionTypeOptions.find((opt) => opt.value === type);
                        return (
                          <div key={type} className="flex items-center gap-3">
                            <span className="w-36 text-sm text-gray-700">
                              {option?.label || type}
                            </span>
                            <Input
                              type="number"
                              min={0}
                              max={totalQuestions}
                              value={questionTypeCounts[type] ?? 0}
                              onChange={(event) =>
                                handleQuestionTypeCountChange(type, Number(event.target.value))
                              }
                              className="w-24"
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p
                      className={`text-xs ${
                        questionTypeCountsValid ? 'text-gray-500' : 'text-red-500'
                      }`}
                    >
                      {t('aiExam.total')}: {questionTypeCountSum} / {totalQuestions}
                      {!questionTypeCountsValid
                        ? ` • ${t('aiExam.adjustCounts')}`
                        : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">{t('aiExam.difficultyDistribution')}</label>
            <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{t('aiExam.diff.easy')}</span>
                  <Badge variant="outline">{difficultyDistribution.easy}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.easy]}
                  onValueChange={([value]: number[]) =>
                    setDifficultyDistribution((prev) => ({ ...prev, easy: value ?? prev.easy }))
                  }
                  max={100}
                  step={5}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{t('aiExam.diff.medium')}</span>
                  <Badge variant="outline">{difficultyDistribution.medium}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.medium]}
                  onValueChange={([value]: number[]) =>
                    setDifficultyDistribution((prev) => ({ ...prev, medium: value ?? prev.medium }))
                  }
                  max={100}
                  step={5}
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm">{t('aiExam.diff.hard')}</span>
                  <Badge variant="outline">{difficultyDistribution.hard}%</Badge>
                </div>
                <Slider
                  value={[difficultyDistribution.hard]}
                  onValueChange={([value]: number[]) =>
                    setDifficultyDistribution((prev) => ({ ...prev, hard: value ?? prev.hard }))
                  }
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{t('aiExam.lessonsHeader')}</h3>
              {lessonsLoading && <span className="text-xs text-gray-500">{t('myCourses.loadingLessons')}</span>}
            </div>
            {lessons.length === 0 ? (
              <p className="text-sm text-gray-500">{t('aiExam.selectLessonsPrompt')}</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {lessons.map((lesson) => {
                  const checked = selectedLessons.includes(lesson._id);
                  return (
                    <div key={lesson._id} className="border rounded-lg p-3">
                      <label className="flex items-start gap-2 text-sm font-medium text-gray-700">
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(value: boolean | 'indeterminate') =>
                            void handleToggleLesson(lesson._id, value === true)
                          }
                        />
                        <span>
                          {lesson.title}
                          {lessonResources[lesson._id]?.length ? (
                            <span className="block text-xs text-gray-500">
                              {lessonResources[lesson._id]?.length || 0} {t('aiExam.resourcesAvailable')}
                            </span>
                          ) : null}
                        </span>
                      </label>
                      {lessonResourcesLoading[lesson._id] && (
                        <p className="text-xs text-gray-500 mt-2">{t('aiExam.loadingResources')}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-700">{t('aiExam.resourcesHeader')}</h3>
              {totalSelectedResources > 0 && (
                <Badge variant="outline">{totalSelectedResources} {t('aiExam.selected')}</Badge>
              )}
            </div>
            {selectedLessons.length === 0 ? (
              <p className="text-sm text-gray-500">{t('aiExam.selectLessonsPrompt')}</p>
            ) : (
              <div className="space-y-4">
                {selectedLessons.map((lessonId) => {
                  const lesson = lessons.find((item) => item._id === lessonId);
                  const resources = lessonResources[lessonId] || [];
                  const resourceSet = selectedResourceIds[lessonId] || new Set<string>();
                  return (
                    <div key={lessonId} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-800">{lesson?.title || t('aiExam.lesson')}</p>
                          <p className="text-xs text-gray-500">{t('aiExam.selectResourcesPrompt')}</p>
                        </div>
                        <Badge variant="outline">{resourceSet.size} {t('aiExam.selected')}</Badge>
                      </div>
                      {lessonResourcesLoading[lessonId] ? (
                        <p className="text-xs text-gray-500">{t('aiExam.loadingResources')}</p>
                      ) : resources.length === 0 ? (
                        <p className="text-xs text-gray-500">{t('aiExam.noResourcesPrompt')}</p>
                      ) : (
                        <div className="space-y-2">
                          {resources.map((resource) => (
                            <label
                              key={resource.id}
                              className="flex items-start gap-2 text-sm text-gray-700 border rounded-md p-2"
                            >
                              <Checkbox
                                checked={resourceSet.has(resource.id)}
                                onCheckedChange={(value: boolean | 'indeterminate') =>
                                  void handleToggleResource(lessonId, resource, value === true)
                                }
                              />
                              <span className="flex-1">
                                <span className="font-medium block">
                                  {resource.title || t('aiExam.resource')}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {resource.type || 'content'}
                                  {resourceTextLoading[resource.id]
                                    ? ' • Loading text…'
                                    : resourceTexts[resource.id]
                                    ? ` • ${resourceTexts[resource.id].length} characters`
                                    : ''}
                                </span>
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Additional Instructions (optional)</label>
            <Textarea
              placeholder="Add any extra guidance or constraints for the AI (optional)."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={5}
              className="resize-none"
            />
          </div>

          <Card className="bg-gray-50 border-dashed border-gray-200">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <span>Lessons selected: {selectedLessons.length}</span>
                <span>Resources selected: {totalSelectedResources}</span>
                <span>Preview characters: {aggregatedContent.length}</span>
                <span>
                  Question distribution sum: {questionTypeCountSum}/{totalQuestions}
                </span>
              </div>
              {aggregatedSelections.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {aggregatedSelections.slice(0, 6).map((entry) => (
                    <Badge key={entry.resourceId} variant="outline">
                      {entry.lessonTitle} · {entry.resource.title || 'Resource'}
                    </Badge>
                  ))}
                  {aggregatedSelections.length > 6 && (
                    <Badge variant="outline">+{aggregatedSelections.length - 6} more</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={loading || !canGenerateExam}
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
      {generatedExam && (() => {
        const allQuestions = getAllQuestions(generatedExam);
        return (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    {generatedExam.title}
                  </CardTitle>
                  <CardDescription>
                    {allQuestions.length} {t('aiExam.questionsGenerated')} • {generatedExam.timeLimit} {t('studentSettings.minutes')} • {generatedExam.totalPoints} {t('aiExam.points')}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleDownloadExam}>
                    <Download className="h-4 w-4 mr-2" />
                    {t('aiExam.download')}
                  </Button>
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {t('aiExam.addedToBank')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedExam.description && (
                <div className="bg-indigo-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm text-indigo-900"><strong>{t('aiExam.description')}:</strong> {generatedExam.description}</p>
                  {generatedExam.passingScore && (
                    <p className="text-sm text-indigo-900"><strong>{t('aiExam.passingScore')}:</strong> {generatedExam.passingScore}%</p>
                  )}
                </div>
              )}

              {generatedExam.sections.map((section, sectionIndex) => {
                const questionsToShow = sectionIndex === 0 ? 3 : 2;
                return (
                  <div key={sectionIndex} className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                      {section.title} ({section.questions.length} {t('aiExam.questionsGenerated')}, {section.points} {t('aiExam.points')})
                    </h3>
                    {section.questions.slice(0, questionsToShow).map((question: any, qIndex: number) => (
                      <div key={qIndex} className="border rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{question.type}</Badge>
                          <Badge variant="outline">{question.difficulty}</Badge>
                          <Badge variant="outline">{question.points} pts</Badge>
                        </div>
                        <h4 className="font-medium mb-2">{question.question}</h4>
                        {question.options && question.options.length > 0 && (
                          <div className="space-y-1 ml-4 text-sm">
                            {question.options.map((opt: string, optIndex: number) => (
                              <div
                                key={optIndex}
                                className={`p-2 rounded ${
                                  (typeof question.correctAnswer === 'number' && optIndex === question.correctAnswer) ||
                                  (typeof question.correctAnswer === 'string' && opt === question.correctAnswer)
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-gray-50'
                                }`}
                              >
                                {String.fromCharCode(65 + optIndex)}. {opt}
                              </div>
                            ))}
                          </div>
                        )}
                        {question.explanation && (
                          <p className="text-xs text-gray-600 mt-2 italic">{t('aiExam.explanation')}: {question.explanation}</p>
                        )}
                      </div>
                    ))}
                    {section.questions.length > questionsToShow && (
                      <p className="text-center text-sm text-gray-500">
                        ... and {section.questions.length - questionsToShow} more questions in this section
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })()}

      {/* Info Card */}
      <Card className="bg-indigo-50 border-indigo-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-indigo-600 mt-0.5" />
            <div className="text-sm text-indigo-900">
              <p className="font-medium mb-1">{t('aiExam.features.title')}</p>
              <ul className="list-disc list-inside space-y-1 text-indigo-800">
                <li>{t('aiExam.features.list.1')}</li>
                <li>{t('aiExam.features.list.2')}</li>
                <li>{t('aiExam.features.list.3')}</li>
                <li>{t('aiExam.features.list.4')}</li>
                <li>{t('aiExam.features.list.5')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Manual Creation Tab */}
        <TabsContent value="manual" className="space-y-6">
          {/* Shared Metadata Form */}
          <Card>
            <CardHeader>
              <CardTitle>{t('aiExam.examMetadata')}</CardTitle>
              <CardDescription>{t('aiExam.basicInfo')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.examTitle')} *</label>
                  <Input
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    placeholder={t('aiExam.enterExamTitle')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.durationMinutes')}</label>
                  <Input
                    type="number"
                    min="10"
                    max="240"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 60)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.totalPoints')}</label>
                  <Input
                    type="number"
                    min="1"
                    value={totalPoints}
                    onChange={(e) => setTotalPoints(parseInt(e.target.value, 10) || 100)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">{t('aiExam.passingScore')}</label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(parseInt(e.target.value, 10) || 60)}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={examDescription}
                  onChange={(e) => setExamDescription(e.target.value)}
                  placeholder="Optional exam description"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Field *</label>
                  <Select
                    value={selectedFieldId}
                    onValueChange={setSelectedFieldId}
                    disabled={coursesLoading || accessibleFields.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={coursesLoading ? 'Loading fields…' : 'Select a field'} />
                    </SelectTrigger>
                    <SelectContent>
                      {accessibleFields.map((field) => (
                        <SelectItem key={field._id} value={field._id}>
                          {field.icon ? `${field.icon} ` : ''}{field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Course *</label>
                  <Select
                    value={selectedCourseId}
                    onValueChange={setSelectedCourseId}
                    disabled={coursesLoading || courses.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          coursesLoading
                            ? 'Loading courses…'
                            : selectedFieldId
                            ? 'Select a course'
                            : 'Choose a field first'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Max Attempts</label>
                  <Input
                    type="number"
                    min="1"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(parseInt(e.target.value, 10) || 1)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Exam Sections</CardTitle>
                  <CardDescription>
                    Organize questions into sections. Total: {totalManualQuestions} questions, {totalManualPoints} points
                  </CardDescription>
                </div>
                <Button onClick={handleAddSection} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {manualSections.map((section) => (
                <div key={section.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        setManualSections(manualSections.map(s =>
                          s.id === section.id ? { ...s, title: e.target.value } : s
                        ));
                      }}
                      className="font-medium max-w-xs"
                    />
                    <div className="flex gap-2">
                      <Badge variant="outline">
                        {section.questions.length} questions
                      </Badge>
                      <Badge variant="outline">
                        {section.points} points
                      </Badge>
                      {manualSections.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {section.questions.map((q) => (
                      <div key={q.id} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                        <GripVertical className="h-4 w-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{q.question}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{q.type}</Badge>
                            <Badge variant="outline" className="text-xs">{q.points} pts</Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setManualSections(manualSections.map(s =>
                              s.id === section.id
                                ? { ...s, questions: s.questions.filter(qq => qq.id !== q.id), points: s.points - q.points }
                                : s
                            ));
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedSectionId(section.id);
                        setShowQuestionBankSelector(true);
                      }}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Questions from Bank
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleCreateExam}
              disabled={loading || !examTitle.trim() || !selectedFieldId || !selectedCourseId || totalManualQuestions === 0}
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Creating Exam...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Create Exam
                </>
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Question Bank Selector */}
      <QuestionBankSelector
        isOpen={showQuestionBankSelector}
        onClose={() => setShowQuestionBankSelector(false)}
        onSelectQuestions={handleQuestionsFromBank}
        alreadySelectedQuestions={manualSections.flatMap(s => s.questions.map(q => q.id))}
      />
      </div>
    </ErrorBoundary>
  );
}

