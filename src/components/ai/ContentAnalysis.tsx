import React, { useEffect, useMemo, useState } from 'react';
import {
  Upload,
  Brain,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Wand2,
  Download,
  Sparkles,
  BookOpen,
  ArrowRight,
  Clock,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Input } from '../ui/input';
import { api } from '../../services/api';
import { useAICredits } from '../context/AICreditsContext';
import { toast } from 'sonner';
import { useLanguage } from '../context/LanguageContext';

const HISTORY_LIMIT = 20;

interface AccessibleResource {
  id: string;
  title?: string;
  type?: string;
  url?: string;
  description?: string;
  extractedText?: string;
  text?: string;
  content?: string;
  textContent?: string;
  size?: number;
  updatedAt?: string;
}

interface AccessibleLesson {
  _id: string;
  title: string;
  description?: string;
  content?: string;
  resources?: AccessibleResource[];
}

interface AccessibleCourse {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  lessons?: number;
  students?: number;
}

interface AccessibleField {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  accessType?: string;
  permissions?: string[];
  courses: AccessibleCourse[];
}

interface HistoryEntry {
  id: string;
  type: string;
  language?: string;
  createdAt: string;
  creditsUsed?: number;
  payload: any;
  result: any;
}

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

const normalizeAccessibleFields = (response: any): AccessibleField[] => {
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
      title: course.title || course.name || 'Untitled course',
      description: course.description,
      status: course.status,
      lessons: course.lessons,
      students: course.students,
    })),
  }));
};

const mapLesson = (lesson: any): AccessibleLesson => ({
  _id: lesson._id || lesson.id,
  title: lesson.title || lesson.name || 'Untitled lesson',
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

const downloadJson = (filename: string, data: any) => {
  try {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download file', error);
    toast.error('Unable to download file');
  }
};

const formatHistoryType = (type: string) => {
  switch (type) {
    case 'analyze-content':
      return 'Analysis';
    case 'recreate-content':
      return 'Enhanced Content';
    case 'generate-teaching-plan':
      return 'Teaching Plan';
    default:
      return type;
  }
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Unknown date';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export function ContentAnalysis() {
  const { refresh: refreshCredits } = useAICredits();

  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  const [user, setUser] = useState<any>(null);

  const [accessibleFields, setAccessibleFields] = useState<AccessibleField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [courses, setCourses] = useState<AccessibleCourse[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');

  const [lessons, setLessons] = useState<AccessibleLesson[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string>('');
  const [selectedLesson, setSelectedLesson] = useState<AccessibleLesson | null>(null);

  const [lessonResources, setLessonResources] = useState<AccessibleResource[]>([]);
  const [selectedResourceId, setSelectedResourceId] = useState<string>('');
  const [selectedResource, setSelectedResource] = useState<AccessibleResource | null>(null);
  const [resourceContent, setResourceContent] = useState<string>('');

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [resourcesLoading, setResourcesLoading] = useState(false);

  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [recreatedContent, setRecreatedContent] = useState<any>(null);
  const [teachingPlanResult, setTeachingPlanResult] = useState<any>(null);
  const [sessionMinutes, setSessionMinutes] = useState<number>(60);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRecreating, setIsRecreating] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const resourcePreview = useMemo(
    () => resourceContent.slice(0, 2000) + (resourceContent.length > 2000 ? '…' : ''),
    [resourceContent],
  );

  const canRunAI = resourceContent.trim().length > 0;

  const appendHistoryEntry = (entry: Partial<HistoryEntry>) => {
    const id = entry.id || `${entry.type}-${entry.createdAt || Date.now()}`;
    const createdAt = entry.createdAt || new Date().toISOString();
    const normalized: HistoryEntry = {
      id,
      type: entry.type || 'unknown',
      language: entry.language,
      createdAt,
      creditsUsed: entry.creditsUsed,
      payload: entry.payload || {},
      result: entry.result,
    };
    setHistoryEntries((prev) => [normalized, ...prev].slice(0, HISTORY_LIMIT));
  };

  const fetchHistory = async () => {
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const response = await api.ai.getAIHistory({ limit: HISTORY_LIMIT });
      const items = normalizeCollection(response).map((item: any) => ({
        id: item.id || item._id,
        type: item.type || item.action,
        language: item.language || item.payload?.language,
        createdAt: item.createdAt || item.timestamp || item.created_at || new Date().toISOString(),
        creditsUsed:
          item.creditsUsed || item.metadata?.creditsUsed || item.response?.creditsUsed,
        payload: item.payload || item.request || {},
        result: item.result || item.response?.data || item.response || item.output,
      }));
      setHistoryEntries(items.slice(0, HISTORY_LIMIT));
    } catch (error: any) {
      console.error('Failed to load AI history', error);
      setHistoryError(error?.message || 'Unable to load AI history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAccessibleHierarchy = async (currentUser: any) => {
    if (!currentUser) return;
    setCoursesLoading(true);
    try {
      const instructorId = currentUser._id || currentUser.id;
      const response = await api.course.getAccessibleCourses(instructorId);
      const fields = normalizeAccessibleFields(response);
      setAccessibleFields(fields);
      if (fields.length > 0) {
        setSelectedFieldId((prev) => prev || fields[0]._id);
      }
    } catch (error) {
      console.error('Failed to load accessible courses', error);
      toast.error('Unable to load accessible courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchLessons = async (courseId: string) => {
    if (!courseId) {
      setLessons([]);
      setSelectedLessonId('');
      return;
    }
    setLessonsLoading(true);
    try {
      const response = await api.course.getLessons(courseId);
      const normalized = normalizeCollection(response).map(mapLesson);
      setLessons(normalized);
      if (normalized.length > 0) {
        setSelectedLessonId((prev) => prev || normalized[0]._id);
      }
    } catch (error) {
      console.error('Failed to load lessons', error);
      toast.error('Unable to load lessons for this course');
      setLessons([]);
      setSelectedLessonId('');
    } finally {
      setLessonsLoading(false);
    }
  };

  const fetchLessonResources = async (lesson: AccessibleLesson | null) => {
    if (!lesson) {
      setLessonResources([]);
      setSelectedResourceId('');
      setSelectedResource(null);
      setResourceContent('');
      return;
    }
    if ((lesson.resources?.length || 0) > 0) {
      setLessonResources(lesson.resources as AccessibleResource[]);
      setSelectedResourceId((prev) => prev || (lesson.resources as AccessibleResource[])[0].id);
      return;
    }
    setResourcesLoading(true);
    try {
      const response = await api.course.getLesson(lesson._id);
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
      setLessonResources(resources);
      if (resources.length > 0) {
        setSelectedResourceId(resources[0].id);
      }
    } catch (error) {
      console.error('Failed to load lesson resources', error);
      toast.error('Unable to load resources for this lesson');
      setLessonResources([]);
      setSelectedResourceId('');
      setSelectedResource(null);
      setResourceContent('');
    } finally {
      setResourcesLoading(false);
    }
  };

  const loadResourceContent = async (resource: AccessibleResource | null) => {
    if (!resource) {
      setSelectedResource(null);
      setResourceContent('');
      return;
    }
    setResourcesLoading(true);
    try {
      let text = extractResourceText(resource);
      if (!text && resource.url) {
        try {
          const resp = await fetch(resource.url);
          const blob = await resp.blob();
          if (blob.type.startsWith('text/')) {
            text = await blob.text();
          } else {
            text = '[Unsupported resource type for inline preview]';
          }
        } catch (error) {
          console.error('Failed to fetch resource content', error);
          text = '[Unable to fetch resource content]';
        }
      }
      const enriched = { ...resource, textContent: text };
      setSelectedResource(enriched);
      setResourceContent(text || '');
    } finally {
      setResourcesLoading(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const me = await api.getMe();
        setUser(me);
        await loadAccessibleHierarchy(me);
      } catch (error) {
        console.error('Failed to load user', error);
      }
      await fetchHistory();
      void refreshCredits();
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
      setSelectedCourseId((prev) => (fieldCourses.some((c) => c._id === prev) ? prev : fieldCourses[0]._id));
    } else {
      setSelectedCourseId('');
    }
  }, [selectedFieldId, accessibleFields]);

  useEffect(() => {
    if (selectedCourseId) {
      void fetchLessons(selectedCourseId);
    } else {
      setLessons([]);
      setSelectedLessonId('');
    }
    setLessonResources([]);
    setSelectedResourceId('');
    setSelectedResource(null);
    setResourceContent('');
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedLessonId) {
      setSelectedLesson(null);
      void fetchLessonResources(null);
      return;
    }
    const lesson = lessons.find((item) => item._id === selectedLessonId) || null;
    setSelectedLesson(lesson);
    void fetchLessonResources(lesson);
  }, [selectedLessonId, lessons]);

  useEffect(() => {
    if (!selectedResourceId) {
      setSelectedResource(null);
      setResourceContent('');
      return;
    }
    const resource = lessonResources.find((item) => item.id === selectedResourceId) || null;
    void loadResourceContent(resource);
  }, [selectedResourceId, lessonResources]);

  const currentResourceMeta = selectedResource
    ? {
        fieldId: selectedFieldId,
        courseId: selectedCourseId,
        lessonId: selectedLessonId,
        resourceId: selectedResource.id,
        fieldTitle: accessibleFields.find((f) => f._id === selectedFieldId)?.name,
        courseTitle: courses.find((c) => c._id === selectedCourseId)?.title,
        lessonTitle: selectedLesson?.title,
        resourceTitle: selectedResource.title,
      }
    : null;

  const handleAnalyze = async () => {
    if (!canRunAI || !selectedResource) {
      toast.error('Select a resource before running AI analysis');
      return;
    }
    setIsAnalyzing(true);
    try {
      const payload: any = {
        content: resourceContent,
        language,
        resource: currentResourceMeta,
      };
      const response = await api.ai.analyzeContent(payload);
      const raw = response.data || response;
      const normalizedStudentImpact = raw.studentImpact ?? {
        beginnerFriendly: raw.readabilityScore ?? raw.overallScore ?? 0,
        practicalApplication: raw.engagementScore ?? raw.overallScore ?? 0,
        comprehensiveness: raw.overallScore ?? 0,
        engagement: raw.engagementScore ?? 0,
      };
      const analysis = {
        ...raw,
        studentImpact: normalizedStudentImpact,
        strengths: Array.isArray(raw.strengths) ? raw.strengths : [],
        weaknesses: Array.isArray(raw.weaknesses) ? raw.weaknesses : [],
        improvements: Array.isArray(raw.improvements) ? raw.improvements : [],
        learningObjectives: Array.isArray(raw.learningObjectives) ? raw.learningObjectives : [],
      };
      setAnalysisResults(analysis);
      toast.success(
        `Content analyzed! Used ${response.creditsUsed || analysis.creditsUsed || 0} AI credits`,
      );
      appendHistoryEntry({
        type: 'analyze-content',
        language,
        creditsUsed: response.creditsUsed || analysis.creditsUsed || 0,
        createdAt: new Date().toISOString(),
        payload,
        result: analysis,
      });
      void refreshCredits();
    } catch (error: any) {
      console.error('Analysis failed', error);
      toast.error(error?.error?.message || 'Failed to analyze content');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleContentRecreation = async () => {
    if (!canRunAI || !selectedResource) {
      toast.error('Select a resource before enhancing content');
      return;
    }
    setIsRecreating(true);
    setRecreatedContent(null);
    try {
      const payload: any = {
        originalContent: resourceContent,
        enhancementType: 'enhanced',
        language,
        resource: currentResourceMeta,
      };
      const response = await api.ai.recreateContent(payload);
      const raw = response.data || response;
      const normalized = {
        sections: raw.enhancedContent?.sections ?? raw.sections ?? [],
        improvements: raw.improvements ?? [],
        addedFeatures: raw.addedFeatures ?? [],
        creditsUsed: raw.creditsUsed ?? response.creditsUsed ?? 0,
        language: raw.language ?? response.language ?? language,
      };
      setRecreatedContent(normalized);
      toast.success(
        `Content recreated! Used ${normalized.creditsUsed || 0} AI credits`,
      );
      appendHistoryEntry({
        type: 'recreate-content',
        language,
        creditsUsed: normalized.creditsUsed,
        createdAt: new Date().toISOString(),
        payload,
        result: normalized,
      });
      void refreshCredits();
    } catch (error: any) {
      console.error('Recreation failed', error);
      toast.error(error?.error?.message || 'Failed to recreate content');
    } finally {
      setIsRecreating(false);
    }
  };

  const handleTeachingPlan = async () => {
    if (!canRunAI || !selectedResource) {
      toast.error('Select a resource before generating a teaching plan');
      return;
    }
    if (!Number.isFinite(sessionMinutes) || sessionMinutes < 1) {
      toast.error('Enter a valid session duration (minutes)');
      return;
    }
    setIsGeneratingPlan(true);
    setTeachingPlanResult(null);
    try {
      const payload: any = {
        content: resourceContent,
        sessionMinutes,
        language,
        resource: currentResourceMeta,
      };
      const response = await api.ai.generateTeachingPlan(payload);
      const raw = response.data || response;
      setTeachingPlanResult(raw);
      toast.success(
        `Teaching plan generated! Used ${response.creditsUsed || raw.creditsUsed || 0} AI credits`,
      );
      appendHistoryEntry({
        type: 'generate-teaching-plan',
        language,
        creditsUsed: response.creditsUsed || raw.creditsUsed || 0,
        createdAt: new Date().toISOString(),
        payload,
        result: raw,
      });
      void refreshCredits();
    } catch (error: any) {
      console.error('Teaching plan generation failed', error);
      toast.error(error?.error?.message || 'Failed to generate teaching plan');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleLoadHistory = (entry: HistoryEntry) => {
    if (!entry) return;
    if (entry.language) {
      setLanguage(entry.language as 'en' | 'ar');
    }
    if (entry.payload?.resource) {
      const { fieldId, courseId, lessonId, resourceId } = entry.payload.resource;
      if (fieldId) setSelectedFieldId(fieldId);
      if (courseId) setSelectedCourseId(courseId);
      if (lessonId) setSelectedLessonId(lessonId);
      if (resourceId) setSelectedResourceId(resourceId);
    }
    if (typeof entry.payload?.sessionMinutes === 'number') {
      setSessionMinutes(entry.payload.sessionMinutes);
    }
    if (entry.type === 'analyze-content') {
      setAnalysisResults(entry.result);
    }
    if (entry.type === 'recreate-content') {
      setRecreatedContent(entry.result);
    }
    if (entry.type === 'generate-teaching-plan') {
      setTeachingPlanResult(entry.result);
    }
  };

  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('contentAnalysis.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('contentAnalysis.subtitle')}
            </p>
          </div>
          <Badge
            variant="secondary"
            className="bg-purple-100 text-purple-700 flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {t('contentAnalysis.geminiAssisted')}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !canRunAI}
            size="lg"
            className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                {t('contentAnalysis.analyzing')}
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                {t('contentAnalysis.analyze')}
              </>
            )}
          </Button>

          <Button
            onClick={handleContentRecreation}
            disabled={isRecreating || !canRunAI}
            variant="outline"
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            {t('contentAnalysis.enhanceContent')}
          </Button>

          <Button
            onClick={handleTeachingPlan}
            disabled={isGeneratingPlan || !canRunAI}
            variant="outline"
            className="border-teal-200 text-teal-600 hover:bg-teal-50"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            {t('contentAnalysis.teachingPlan')}
          </Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <p className="text-xs uppercase font-semibold text-gray-500">{t('contentAnalysis.outputLanguage')}</p>
            <Select value={language} onValueChange={(value: 'en' | 'ar') => setLanguage(value)}>
              <SelectTrigger className="w-40 mt-1">
                <SelectValue placeholder={t('contentAnalysis.selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedResource && (
            <div className="flex flex-col text-xs text-gray-500">
              <span className="font-semibold text-gray-600">{t('contentAnalysis.selectedResource')}</span>
              <span>
                {selectedResource.title || t('contentAnalysis.resource')} · {selectedResource.type || 'content'}
              </span>
            </div>
          )}
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mr-3">
              <Upload className="h-5 w-5 text-white" />
            </div>
            {t('contentAnalysis.selectResourceTitle')}
          </CardTitle>
          <CardDescription>
            {t('contentAnalysis.selectResourceDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase font-semibold text-gray-500">{t('contentAnalysis.field')}</p>
              <Select
                value={selectedFieldId}
                onValueChange={(value: string) => setSelectedFieldId(value)}
                disabled={coursesLoading || accessibleFields.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={coursesLoading ? t('contentAnalysis.loadingFields') : t('contentAnalysis.selectField')} />
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

            <div className="space-y-1">
              <p className="text-xs uppercase font-semibold text-gray-500">{t('contentAnalysis.course')}</p>
              <Select
                value={selectedCourseId}
                onValueChange={(value: string) => setSelectedCourseId(value)}
                disabled={coursesLoading || courses.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      coursesLoading
                        ? t('contentAnalysis.loadingCourses')
                        : selectedFieldId
                        ? t('contentAnalysis.selectCourse')
                        : t('contentAnalysis.selectFieldFirst')
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
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase font-semibold text-gray-500">{t('contentAnalysis.lesson')}</p>
              <Select
                value={selectedLessonId}
                onValueChange={(value: string) => setSelectedLessonId(value)}
                disabled={lessonsLoading || lessons.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedCourseId
                        ? lessonsLoading
                          ? t('contentAnalysis.loadingLessons')
                          : 'Select a lesson'
                        : 'Choose a course first'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson._id} value={lesson._id}>
                      {lesson.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs uppercase font-semibold text-gray-500">Resource</p>
              <Select
                value={selectedResourceId}
                onValueChange={(value: string) => setSelectedResourceId(value)}
                disabled={resourcesLoading || lessonResources.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      selectedLessonId
                        ? resourcesLoading
                          ? t('contentAnalysis.loadingResources')
                          : lessonResources.length > 0
                          ? t('contentAnalysis.selectResource')
                          : t('contentAnalysis.noResources')
                        : t('contentAnalysis.selectLessonFirst')
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {lessonResources.map((resource) => (
                    <SelectItem key={resource.id} value={resource.id}>
                      {resource.type ? `[${resource.type}] ` : ''}{resource.title || 'Resource'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase font-semibold text-gray-500">Session Minutes</p>
              <Input
                type="number"
                min={1}
                step={5}
                value={sessionMinutes}
                onChange={(event) =>
                  setSessionMinutes(Math.max(1, Number(event.target.value) || 1))
                }
              />
              <p className="text-xs text-gray-500">
                {t('contentAnalysis.enteredSessionDurationDesc')}
              </p>
            </div>
          </div>

          <Card className="bg-gray-50 border-dashed border-gray-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-gray-700">
                Resource preview
              </CardTitle>
              <CardDescription>
                The AI will process the content below. Ensure the correct resource is selected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resourcesLoading ? (
                <p className="text-sm text-gray-500">Loading resource content…</p>
              ) : canRunAI ? (
                <div className="max-h-48 overflow-auto text-xs bg-white border rounded p-3 whitespace-pre-wrap leading-snug text-gray-700">
                  {resourcePreview}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {t('contentAnalysis.selectResourceContentLoad')}
                </p>
              )}
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {analysisResults && !isAnalyzing && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                  {t('contentAnalysis.overallScore')}
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
                  <div className="text-2xl font-bold text-teal-600">
                    {analysisResults.studentImpact?.beginnerFriendly ?? 0}%
                  </div>
                  <div className="text-sm text-gray-500">Beginner Friendly</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {analysisResults.studentImpact?.practicalApplication ?? 0}%
                  </div>
                  <div className="text-sm text-gray-500">Practical Application</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {analysisResults.studentImpact?.comprehensiveness ?? 0}%
                  </div>
                  <div className="text-sm text-gray-500">Comprehensiveness</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {analysisResults.studentImpact?.engagement ?? 0}%
                  </div>
                  <div className="text-sm text-gray-500">Engagement</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Content Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResults.strengths.length === 0 ? (
                  <p className="text-sm text-gray-500">No strengths detected.</p>
                ) : (
                  <div className="space-y-3">
                    {analysisResults.strengths.map((strength: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-green-800">{strength}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResults.weaknesses.length === 0 ? (
                  <p className="text-sm text-gray-500">No specific weaknesses detected.</p>
                ) : (
                  <div className="space-y-3">
                    {analysisResults.weaknesses.map((weakness: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                        <p className="text-orange-800">{weakness}</p>
                      </div>
                    ))}
                  </div>
                )}
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
                {analysisResults.improvements.length === 0 ? (
                  <p className="text-sm text-gray-500">No recommendations generated.</p>
                ) : (
                  <div className="space-y-3">
                    {analysisResults.improvements.map((improvement: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <p className="text-yellow-800">{improvement}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analysisResults.learningObjectives.length === 0 ? (
                  <p className="text-sm text-gray-500">No learning objectives suggested.</p>
                ) : (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {analysisResults.learningObjectives.map((objective: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {recreatedContent && !isRecreating && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
                  AI-Generated Content
                </span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  Enhanced Content
                </Badge>
              </CardTitle>
              <CardDescription>
                {t('contentAnalysis.recreatedContentDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
                Suggested Course Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recreatedContent.sections?.length ? (
                recreatedContent.sections.map((section: any, index: number) => (
                  <div key={index} className="border rounded-xl p-6 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-purple-900 flex-1">
                        {section.title || `Section ${index + 1}`}
                      </h3>
                      <Badge variant="outline" className="text-xs uppercase">
                        {section.type || 'text'}
                      </Badge>
                      {section.component && (
                        <Badge variant="secondary" className="text-xs uppercase">
                          {section.component}
                        </Badge>
                      )}
                    </div>
                    {section.content && (
                      <div className="space-y-3 text-sm text-gray-700 whitespace-pre-wrap">
                        {section.content}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No enhanced sections returned.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Improvements Suggested
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recreatedContent.improvements?.length ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {recreatedContent.improvements.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No improvements provided.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-orange-600" />
                  Feature Ideas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recreatedContent.addedFeatures?.length ? (
                  <ul className="space-y-2 text-sm text-gray-700">
                    {recreatedContent.addedFeatures.map((item: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <ArrowRight className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No additional features were suggested.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {teachingPlanResult && !isGeneratingPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Teaching Plan
            </CardTitle>
            <CardDescription>{t('contentAnalysis.teachingPlanDesc')}</CardDescription>


          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-gray-700">
            {typeof teachingPlanResult === 'string' ? (
              <pre className="whitespace-pre-wrap text-sm">{teachingPlanResult}</pre>
            ) : teachingPlanResult.markdown ? (
              <pre className="whitespace-pre-wrap text-sm">{teachingPlanResult.markdown}</pre>
            ) : (
              <pre className="bg-gray-900 text-gray-100 text-xs p-4 rounded-lg overflow-auto">
                {JSON.stringify(teachingPlanResult, null, 2)}
              </pre>
            )}
          </CardContent>
        </Card>
      )}

      {isGeneratingPlan && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50">
          <CardContent className="p-10 text-center space-y-4">
            <div className="relative mx-auto h-16 w-16">
              <div className="animate-spin h-16 w-16 border-4 border-teal-200 border-t-teal-600 rounded-full"></div>
              <BookOpen className="absolute inset-0 m-auto h-6 w-6 text-teal-600 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-teal-700">Generating teaching plan...</h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Structuring sessions, learning objectives, and recommended activities based on your content.
            </p>
          </CardContent>
        </Card>
      )}

      {(analysisResults || recreatedContent || teachingPlanResult) && (
        <div className="flex flex-wrap gap-3">
          {analysisResults && (
            <Button variant="outline" onClick={() => downloadJson(`analysis-${Date.now()}.json`, analysisResults)}>
              <Download className="h-4 w-4 mr-2" />
              Download Analysis
            </Button>
          )}
          {recreatedContent && (
            <Button
              variant="outline"
              onClick={() => downloadJson(`enhanced-content-${Date.now()}.json`, recreatedContent)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Enhanced Content
            </Button>
          )}
          {teachingPlanResult && (
            <Button
              variant="outline"
              onClick={() => downloadJson(`teaching-plan-${Date.now()}.json`, teachingPlanResult)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Teaching Plan
            </Button>
          )}
        </div>
      )}

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-600" />
              AI History
            </CardTitle>
            <CardDescription>{t('contentAnalysis.historyDesc')}</CardDescription>


          </div>
          <Button variant="outline" size="sm" onClick={fetchHistory} disabled={historyLoading}>
            {historyLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardHeader>
        <CardContent>
          {historyError && <p className="text-sm text-red-500 mb-3">{historyError}</p>}
          {historyLoading && historyEntries.length === 0 ? (
            <p className="text-sm text-gray-500">Loading history…</p>
          ) : historyEntries.length === 0 ? (
            <p className="text-sm text-gray-500">No AI history recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {historyEntries.map((entry) => (
                <div key={entry.id} className="border rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{formatHistoryType(entry.type)}</p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(entry.createdAt)} · {(entry.language || 'en').toUpperCase()}
                      </p>
                      {entry.creditsUsed !== undefined && (
                        <p className="text-xs text-gray-400">Credits used: {entry.creditsUsed}</p>
                      )}
                      {entry.payload?.resource?.resourceTitle && (
                        <p className="text-xs text-gray-500 mt-1">
                          {entry.payload.resource.courseTitle || 'Course'} · {entry.payload.resource.lessonTitle || 'Lesson'} · {entry.payload.resource.resourceTitle}
                        </p>
                      )}
                      {typeof entry.payload?.sessionMinutes === 'number' && (
                        <p className="text-xs text-gray-500">
                          Session: {entry.payload.sessionMinutes} minutes
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleLoadHistory(entry)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => downloadJson(`history-${entry.id}.json`, entry)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
