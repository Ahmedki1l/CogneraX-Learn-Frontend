import React, { useState, useEffect } from "react";
import {
  Database,
  Search,
  Filter,
  Plus,
  CheckCircle,
  FileQuestion,
  BookOpen,
  Building2,
  X,
  ArrowLeft,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";
import { api } from "../../services/api";
import { ErrorBoundary } from "../shared/ErrorBoundary";
import {
  formatApiError,
  getErrorMessage,
  isRetryableError,
} from "../../utils/errorHandling";
import { toast } from "sonner";
import { useLanguage } from '../context/LanguageContext';

interface Question {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "essay";
  options?: string[];
  correctAnswer: number | string;
  explanation?: string;
  difficulty: "easy" | "medium" | "hard";
  points?: number;
  fieldId: string;
  fieldName: string;
  courseId: string;
  courseName: string;
  source: "ai-generated" | "manual" | "exam";
  tags: string[];
  createdAt: string;
  lastModified: string;
  usageCount: number;
  isActive: boolean;
}

interface Course {
  id: string;
  name: string;
  fieldId: string;
  fieldName: string;
  questionCount: number;
}

interface Field {
  id: string;
  name: string;
  courses: Course[];
  questionCount: number;
}

interface QuestionBankSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuestions: (questions: Question[]) => void;
  alreadySelectedQuestions?: string[];
  maxQuestions?: number;
}

export function QuestionBankSelector({
  isOpen,
  onClose,
  onSelectQuestions,
  alreadySelectedQuestions = [],
  maxQuestions,
}: QuestionBankSelectorProps) {
  const { t, isRTL } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedField, setSelectedField] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(
    alreadySelectedQuestions
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Load question bank hierarchy and all questions when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadHierarchy();
      loadAllQuestions();
    }
  }, [isOpen]);

  // Load filtered questions when field/course is selected
  useEffect(() => {
    if (isOpen && selectedFieldId && selectedCourseId) {
      loadQuestions(selectedFieldId, selectedCourseId);
    }
  }, [isOpen, selectedFieldId, selectedCourseId]);

  const loadHierarchy = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.question.getHierarchy({ depth: "summary" });

      if (response) {
        const hierarchy = response;
        const transformedFields: Field[] = (hierarchy.fields || []).map(
          (field: any) => ({
            id: field.id || field._id,
            name: field.name,
            courses: (field.courses || []).map((course: any) => ({
              id: course.id || course._id,
              name: course.name,
              fieldId: field.id || field._id,
              fieldName: field.name,
              questionCount:
                course.questionCount || course.activeQuestionCount || 0,
            })),
            questionCount:
              field.questionCount || field.activeQuestionCount || 0,
          })
        );

        setFields(transformedFields);
      }
    } catch (error: any) {
      console.error("Failed to load question bank hierarchy:", error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || "Failed to load question bank");
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuestions = async (fieldId: string, courseId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.question.getFieldCourseQuestions(
        fieldId,
        courseId,
        {
          isActive: true,
        }
      );

      if (response) {
        const loadedQuestions: Question[] = (response.questions || []).map(
          (q: any) => ({
            id: q.id || q._id,
            question: q.question,
            type: q.type,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            points: q.points || 1,
            fieldId:
              response.field?.id || response.field?._id || fieldId,
            fieldName: response.field?.name || "",
            courseId:
              response.course?.id || response.course?._id || courseId,
            courseName: response.course?.name || "",
            source: q.source || "manual",
            tags: q.tags || [],
            createdAt: q.createdAt || new Date().toISOString(),
            lastModified:
              q.updatedAt || q.lastModified || new Date().toISOString(),
            usageCount: q.usageCount || 0,
            isActive: q.isActive !== false,
          })
        );

        setQuestions(loadedQuestions);
        setFilteredQuestions(loadedQuestions);
      }
    } catch (error: any) {
      console.error("Failed to load questions:", error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.question.getQuestions({
        isActive: true,
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response) {
        const loadedQuestions: Question[] = (response.questions || []).map(
          (q: any) => ({
            id: q.id || q._id,
            question: q.question,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty,
            points: q.points || 1,
            fieldId: q.fieldId,
            // Handle fieldName - if it's the same as fieldId, use a default name
            fieldName:
              q.fieldName && q.fieldName !== q.fieldId
                ? q.fieldName
                : "General",
            courseId: q.courseId,
            courseName: q.courseName || "General",
            source: q.source || "manual",
            tags: q.tags || [],
            createdAt: q.createdAt || new Date().toISOString(),
            lastModified:
              q.updatedAt || q.lastModified || new Date().toISOString(),
            usageCount: q.usageCount || 0,
            isActive: q.isActive !== false,
          })
        );

        setQuestions(loadedQuestions);
        setFilteredQuestions(loadedQuestions);

        // Extract unique fields and courses from loaded questions for filters
        const uniqueFields = new Map();
        const uniqueCourses = new Map();

        loadedQuestions.forEach((q) => {
          if (q.fieldId && q.fieldName) {
            uniqueFields.set(q.fieldId, { id: q.fieldId, name: q.fieldName });
          }
          if (q.courseId && q.courseName) {
            uniqueCourses.set(q.courseId, {
              id: q.courseId,
              name: q.courseName,
              fieldId: q.fieldId,
              fieldName: q.fieldName,
            });
          }
        });

        // If we don't have fields from hierarchy, use fields from questions
        if (fields.length === 0) {
          const fieldsList: Field[] = Array.from(uniqueFields.values()).map(
            (f) => ({
              id: f.id,
              name: f.name,
              courses: [],
              questionCount: loadedQuestions.filter((q) => q.fieldId === f.id)
                .length,
            })
          );
          setFields(fieldsList);
        }
      }
    } catch (error: any) {
      console.error("Failed to load all questions:", error);
      const formattedError = formatApiError(error);
      setError(formattedError.message);
      toast.error(formattedError.message || "Failed to load questions");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter questions based on search and filters
  useEffect(() => {
    let filtered = questions.filter((question) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === "" ||
        question.question.toLowerCase().includes(searchLower) ||
        (question.tags &&
          question.tags.some((tag) =>
            tag.toLowerCase().includes(searchLower)
          )) ||
        (question.fieldName &&
          question.fieldName.toLowerCase().includes(searchLower)) ||
        (question.courseName &&
          question.courseName.toLowerCase().includes(searchLower));

      const matchesDifficulty =
        selectedDifficulty === "all" ||
        question.difficulty === selectedDifficulty;
      const matchesType =
        selectedType === "all" || question.type === selectedType;
      const matchesField =
        selectedField === "all" || question.fieldId === selectedField;
      const matchesCourse =
        selectedCourse === "all" || question.courseId === selectedCourse;
      const matchesSource =
        selectedSource === "all" || question.source === selectedSource;

      return (
        matchesSearch &&
        matchesDifficulty &&
        matchesType &&
        matchesField &&
        matchesCourse &&
        matchesSource &&
        question.isActive
      );
    });

    setFilteredQuestions(filtered);
  }, [
    questions,
    searchTerm,
    selectedDifficulty,
    selectedType,
    selectedField,
    selectedCourse,
    selectedSource,
  ]);

  const availableCourses =
    selectedField === "all"
      ? fields.flatMap((f) => f.courses)
      : fields.find((f) => f.id === selectedField)?.courses || [];

  const handleSelectQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId);
      } else {
        if (maxQuestions && prev.length >= maxQuestions) {
          return prev; // Don't add if max reached
        }
        return [...prev, questionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedQuestions.length === filteredQuestions.length) {
      setSelectedQuestions([]);
    } else {
      const questionsToSelect = filteredQuestions.slice(
        0,
        maxQuestions || filteredQuestions.length
      );
      setSelectedQuestions(questionsToSelect.map((q) => q.id));
    }
  };

  const handleConfirmSelection = () => {
    const selectedQuestionObjects = questions.filter((q) =>
      selectedQuestions.includes(q.id)
    );
    onSelectQuestions(selectedQuestionObjects);
    onClose();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "multiple-choice":
        return <CheckSquare className="h-3 w-3" />;
      case "true-false":
        return <CheckCircle className="h-3 w-3" />;
      case "short-answer":
        return <FileQuestion className="h-3 w-3" />;
      case "essay":
        return <FileQuestion className="h-3 w-3" />;
      default:
        return <FileQuestion className="h-3 w-3" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (!isOpen) return null;

  return (
    <ErrorBoundary>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-teal-600" />
              {t('questionBank.selector.title')}
            </DialogTitle>
            <DialogDescription>
              {t('questionBank.selector.subtitle')}
              {maxQuestions && ` (${t('questionBank.selector.max')} ${maxQuestions} ${t('questionBank.selector.questions')})`}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-full space-y-4">
            {/* Error Display */}
            {error && (
              <Card className="bg-red-50 border-red-200">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-red-800">
                      <AlertCircle className="h-5 w-5" />
                      <span className="font-medium">{t('questionBank.selector.error')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isRetryableError({ message: error }) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (selectedFieldId && selectedCourseId) {
                              loadQuestions(selectedFieldId, selectedCourseId);
                            } else {
                              loadHierarchy();
                            }
                          }}
                          className="text-red-700 border-red-300 hover:bg-red-100"
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          {t('questionBank.selector.retry')}
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setError(null)}
                      >
                        {t('questionBank.selector.dismiss')}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-red-700 mt-2">{error}</p>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
                <span className="ml-2 text-gray-600">{t('questionBank.selector.loading')}</span>
              </div>
            )}

            {/* Question Statistics */}
            {!isLoading && questions.length > 0 && (
              <div className="bg-gradient-to-r from-teal-50 to-purple-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      {questions.length} {t('questionBank.selector.available')}
                    </span>
                    {filteredQuestions.length < questions.length && (
                      <span className="text-sm text-gray-600">
                        ({filteredQuestions.length} {t('questionBank.selector.matching')})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="text-gray-600">
                      {
                        questions.filter((q) => q.type === "multiple-choice")
                          .length
                      }{" "}
                      MCQ
                    </span>
                    <span className="text-gray-600">
                      {questions.filter((q) => q.type === "true-false").length}{" "}
                      T/F
                    </span>
                    <span className="text-gray-600">
                      {questions.filter((q) => q.type === "essay").length} Essay
                    </span>
                    <span className="text-gray-600">
                      {
                        questions.filter((q) => q.type === "short-answer")
                          .length
                      }{" "}
                      Short
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder={t('questionBank.selector.search')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Select
                    value={selectedDifficulty}
                    onValueChange={setSelectedDifficulty}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('questionBank.selector.difficulty')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('questionBank.selector.allDifficulties')}</SelectItem>
                      <SelectItem value="easy">{t('common.easy') || 'Easy'}</SelectItem>
                      <SelectItem value="medium">{t('common.medium') || 'Medium'}</SelectItem>
                      <SelectItem value="hard">{t('common.hard') || 'Hard'}</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('questionBank.selector.type')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('questionBank.selector.allTypes')}</SelectItem>
                      <SelectItem value="multiple-choice">
                        Multiple Choice
                      </SelectItem>
                      <SelectItem value="true-false">True/False</SelectItem>
                      <SelectItem value="short-answer">Short Answer</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedField}
                    onValueChange={(value: string) => {
                      setSelectedField(value);
                      setSelectedCourse("all");
                      if (value !== "all") {
                        setSelectedFieldId(value);
                        setSelectedCourseId(null);
                      } else {
                        setSelectedFieldId(null);
                        setSelectedCourseId(null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('questionBank.fields')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('questionBank.allFields')}</SelectItem>
                      {fields.map((field) => (
                        <SelectItem key={field.id} value={field.id}>
                          {field.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedCourse}
                    onValueChange={(value: string) => {
                      setSelectedCourse(value);
                      if (value !== "all" && selectedField !== "all") {
                        setSelectedCourseId(value);
                        loadQuestions(selectedField, value);
                      } else {
                        setSelectedCourseId(null);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('common.course') || 'Course'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.allCourses') || 'All Courses'}</SelectItem>
                      {availableCourses.map((course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedSource}
                    onValueChange={setSelectedSource}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('questionBank.selector.source')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('questionBank.selector.allSources')}</SelectItem>
                      <SelectItem value="ai-generated">{t('questionBank.aiGenerated')}</SelectItem>
                      <SelectItem value="manual">{t('questionBank.selector.manual') || 'Manual'}</SelectItem>
                      <SelectItem value="exam">{t('questionBank.selector.exam') || 'From Exam'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedQuestions.length} {t('questionBank.selector.questions')} {t('questionBank.selector.selected')}
                </span>
                {maxQuestions && (
                  <span className="text-xs text-blue-700">
                    ({t('questionBank.selector.max')} {maxQuestions})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                  disabled={filteredQuestions.length === 0}
                >
                  {selectedQuestions.length === filteredQuestions.length
                    ? t('questionBank.selector.deselectAll')
                    : t('questionBank.selector.selectAll')}
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmSelection}
                  disabled={selectedQuestions.length === 0}
                  className="bg-gradient-to-r from-teal-500 to-purple-600"
                >
                  {t('questionBank.selector.add')} {selectedQuestions.length} {t('questionBank.selector.questions')}
                </Button>
              </div>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto">
              {!isLoading && questions.length === 0 ? (
                <div className="text-center py-12">
                  <FileQuestion className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('questionBank.selector.noQuestions')}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t('questionBank.selector.noQuestionsDesc')}
                  </p>
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {t('questionBank.selector.noMatching')}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {t('questionBank.selector.noMatchingDesc')}
                  </p>
                  <p className="text-sm text-gray-400">
                    {questions.length} {t('questionBank.selector.available')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredQuestions.map((question) => (
                    <div
                      key={question.id}
                      className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          <Checkbox
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() =>
                              handleSelectQuestion(question.id)
                            }
                            className="mt-1"
                            disabled={
                              maxQuestions &&
                              !selectedQuestions.includes(question.id) &&
                              selectedQuestions.length >= maxQuestions
                            }
                          />

                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 mb-2 leading-relaxed line-clamp-3">
                              {question.question}
                            </p>

                            {/* Show options for multiple choice questions */}
                            {question.type === "multiple-choice" &&
                              question.options &&
                              question.options.length > 0 && (
                                <div className="mb-2 pl-4">
                                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {question.options
                                      .slice(0, 2)
                                      .map((option, idx) => (
                                        <li key={idx} className="line-clamp-1">
                                          {option}
                                        </li>
                                      ))}
                                    {question.options.length > 2 && (
                                      <li className="text-gray-400">
                                        ... {t('questionBank.selector.and')} {question.options.length - 2}{" "}
                                        {t('questionBank.selector.moreOptions')}
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Show True/False options */}
                            {question.type === "true-false" && (
                              <div className="mb-2 pl-4">
                                <span className="text-sm text-gray-600">
                                  {t('questionBank.selector.options')}: True / False
                                </span>
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 mb-3">
                              <Badge
                                className={`flex items-center gap-1 ${getDifficultyColor(
                                  question.difficulty
                                )}`}
                              >
                                {getTypeIcon(question.type)}
                                {question.difficulty}
                              </Badge>

                              <Badge variant="outline" className="text-xs">
                                {question.type.replace("-", " ")}
                              </Badge>

                              <Badge variant="outline" className="text-xs">
                                {question.points} point
                                {question.points !== 1 ? "s" : ""}
                              </Badge>

                              {question.source && (
                                <Badge variant="outline" className="text-xs">
                                  {question.source}
                                </Badge>
                              )}

                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <Building2 className="h-3 w-3" />
                                {question.fieldName || "General"}
                              </Badge>

                              <Badge
                                variant="outline"
                                className="flex items-center gap-1"
                              >
                                <BookOpen className="h-3 w-3" />
                                {question.courseName || "General"}
                              </Badge>
                            </div>

                            {question.tags && question.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {question.tags.slice(0, 5).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {question.tags.length > 5 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-400">
                                    +{question.tags.length - 5} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </ErrorBoundary>
  );
}
