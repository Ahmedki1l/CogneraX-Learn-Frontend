import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Save, 
  X, 
  Plus, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Calendar,
  Users,
  Clock,
  Target,
  Tag,
  Globe,
  Lock,
  Eye,
  AlertCircle,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useLanguage } from '../context/LanguageContext';

interface CourseCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  existingCourse?: any;
  onSave: (courseData: any) => void;
  availableFields?: Array<{ _id?: string; id?: string; name: string; icon?: string; accessType?: string; permissions?: string[] }>;
}

export function CourseCreator({ isOpen, onClose, existingCourse, onSave, availableFields = [] }: CourseCreatorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { t, isRTL } = useLanguage();
  const [courseData, setCourseData] = useState({
    title: existingCourse?.title || '',
    description: existingCourse?.description || '',
    field: existingCourse?.field || '',
    category: existingCourse?.category || '',
    level: existingCourse?.level || 'beginner',
    language: existingCourse?.language || 'english',
    tags: existingCourse?.tags || [],
    duration: existingCourse?.duration || '',
    maxStudents: existingCourse?.maxStudents || '',
    startDate: existingCourse?.startDate || '',
    endDate: existingCourse?.endDate || '',
    visibility: existingCourse?.visibility || 'public',
    price: existingCourse?.price || '',
    prerequisites: existingCourse?.prerequisites || '',
    objectives: existingCourse?.objectives || [''],
    syllabus: existingCourse?.syllabus || [{ 
      title: '', 
      description: '', 
      duration: '', 
      resources: [] 
    }],
    resources: existingCourse?.resources || [],
    thumbnail: existingCourse?.thumbnail || null,
    enableDiscussions: existingCourse?.enableDiscussions || true,
    enableQuizzes: existingCourse?.enableQuizzes || true,
    enableCertificate: existingCourse?.enableCertificate || false,
    autoEnroll: existingCourse?.autoEnroll || false
  });

  const [newTag, setNewTag] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Auto-select field if only one available
  useEffect(() => {
    if (availableFields.length === 1 && !courseData.field && !existingCourse) {
      handleInputChange('field', availableFields[0]._id || availableFields[0].id);
    }
  }, [availableFields.length, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: string, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayUpdate = (field: string, index: number, value: any) => {
    setCourseData(prev => ({
      ...prev,
      [field]: prev[field].map((item: any, i: number) => 
        i === index ? value : item
      )
    }));
  };

  const addObjective = () => {
    setCourseData(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }));
  };

  const removeObjective = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_: any, i: number) => i !== index)
    }));
  };

  const addSyllabusModule = () => {
    setCourseData(prev => ({
      ...prev,
      syllabus: [...prev.syllabus, { 
        title: '', 
        description: '', 
        duration: '', 
        resources: [] 
      }]
    }));
  };

  const removeSyllabusModule = (index: number) => {
    setCourseData(prev => ({
      ...prev,
      syllabus: prev.syllabus.filter((_: any, i: number) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove)
    }));
  };

  const handleFileUpload = async (type: string) => {
    setUploadProgress(0);
    // Simulate file upload
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    toast.success(`${type} uploaded successfully!`);
    setUploadProgress(0);
  };

  const handleSave = async (draft = false) => {
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!courseData.title.trim()) {
        toast.error('Course title is required');
        return;
      }
      if (!courseData.description.trim()) {
        toast.error('Course description is required');
        return;
      }
      if (!courseData.field) {
        toast.error('Please select a field of study');
        return;
      }

      // Prepare course data for API
      const coursePayload = {
        title: courseData.title,
        description: courseData.description,
        field: courseData.field,
        category: courseData.category,
        level: courseData.level,
        duration: courseData.duration,
        price: courseData.price,
        isFree: courseData.isFree,
        maxStudents: courseData.maxStudents,
        isPublic: courseData.isPublic,
        objectives: courseData.objectives.filter(obj => obj.trim()),
        syllabus: courseData.syllabus,
        tags: courseData.tags,
        thumbnail: courseData.thumbnail,
        resources: courseData.resources,
        status: draft ? 'draft' : 'published'
      };

      let savedCourse;
      if (existingCourse?.id) {
        // Update existing course
        const response = await api.course.updateCourse(existingCourse.id, coursePayload);
        if (response) {
          savedCourse = response;
        } else {
          throw new Error('Failed to update course');
        }
      } else {
        // Create new course
        const response = await api.course.createCourse(coursePayload);
        if (response) {
          savedCourse = response;
        } else {
          throw new Error('Failed to create course');
        }
      }

      onSave(savedCourse);
      toast.success(`Course ${draft ? 'saved as draft' : 'published'} successfully!`);
      onClose();
    } catch (error: any) {
      console.error('Error saving course:', error);
      toast.error(error?.message || 'Failed to save course');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Course title, description, and category' },
    { id: 2, title: 'Content', description: 'Syllabus, objectives, and learning outcomes' },
    { id: 3, title: 'Settings', description: 'Enrollment, pricing, and visibility' },
    { id: 4, title: 'Resources', description: 'Additional materials and media' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {existingCourse ? 'Edit Course' : 'Create New Course'}
            </h2>
            <p className="text-gray-600 mt-1">
              Build engaging courses for your students
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-teal-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    currentStep >= step.id ? 'text-teal-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-px mx-4 ${
                    currentStep > step.id ? 'bg-teal-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Title *
                      </label>
                      <Input
                        value={courseData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="e.g., Introduction to React Development"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Field of Study *
                      </label>
                      <Select 
                        value={courseData.field} 
                        onValueChange={(value) => handleInputChange('field', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select field" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableFields.length > 0 ? (
                            availableFields.map(field => (
                              <SelectItem key={field._id || field.id} value={field._id || field.id}>
                                {field.icon || '📚'} {field.name}
                              </SelectItem>
                            ))
                          ) : (
                            <>
                              <SelectItem value="computer-science">Computer Science</SelectItem>
                              <SelectItem value="mathematics">Mathematics</SelectItem>
                              <SelectItem value="physics">Physics</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="design">Design</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                      </label>
                      <Select 
                        value={courseData.category} 
                        onValueChange={(value) => handleInputChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="web-development">Web Development</SelectItem>
                          <SelectItem value="data-science">Data Science</SelectItem>
                          <SelectItem value="mobile-development">Mobile Development</SelectItem>
                          <SelectItem value="design">Design</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Level
                        </label>
                        <Select 
                          value={courseData.level} 
                          onValueChange={(value) => handleInputChange('level', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <Select 
                          value={courseData.language} 
                          onValueChange={(value) => handleInputChange('language', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="english">English</SelectItem>
                            <SelectItem value="spanish">Spanish</SelectItem>
                            <SelectItem value="french">French</SelectItem>
                            <SelectItem value="german">German</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course Description *
                      </label>
                      <Textarea
                        value={courseData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe what students will learn in this course..."
                        rows={6}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prerequisites
                      </label>
                      <Textarea
                        value={courseData.prerequisites}
                        onChange={(e) => handleInputChange('prerequisites', e.target.value)}
                        placeholder="What should students know before taking this course?"
                        rows={3}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {courseData.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button onClick={addTag} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Content */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Objectives</h3>
                  <div className="space-y-3">
                    {courseData.objectives.map((objective: string, index: number) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={objective}
                          onChange={(e) => handleArrayUpdate('objectives', index, e.target.value)}
                          placeholder={`Learning objective ${index + 1}`}
                          className="flex-1"
                        />
                        {courseData.objectives.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeObjective(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button onClick={addObjective} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Learning Objective
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Syllabus</h3>
                  <div className="space-y-4">
                    {courseData.syllabus.map((module: any, index: number) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">Module {index + 1}</CardTitle>
                            {courseData.syllabus.length > 1 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSyllabusModule(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <Input
                            value={module.title}
                            onChange={(e) => handleArrayUpdate('syllabus', index, { ...module, title: e.target.value })}
                            placeholder="Module title"
                          />
                          <Textarea
                            value={module.description}
                            onChange={(e) => handleArrayUpdate('syllabus', index, { ...module, description: e.target.value })}
                            placeholder="Module description"
                            rows={2}
                          />
                          <Input
                            value={module.duration}
                            onChange={(e) => handleArrayUpdate('syllabus', index, { ...module, duration: e.target.value })}
                            placeholder="Duration (e.g., 2 hours)"
                          />
                        </CardContent>
                      </Card>
                    ))}
                    <Button onClick={addSyllabusModule} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Enrollment Settings</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maximum Students
                      </label>
                      <Input
                        type="number"
                        value={courseData.maxStudents}
                        onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                        placeholder="Leave empty for unlimited"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={courseData.startDate}
                          onChange={(e) => handleInputChange('startDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={courseData.endDate}
                          onChange={(e) => handleInputChange('endDate', e.target.value)}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Duration
                      </label>
                      <Input
                        value={courseData.duration}
                        onChange={(e) => handleInputChange('duration', e.target.value)}
                        placeholder="e.g., 6 weeks, 40 hours"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Course Settings</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Visibility
                      </label>
                      <Select 
                        value={courseData.visibility} 
                        onValueChange={(value) => handleInputChange('visibility', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="public">
                            <div className="flex items-center">
                              <Globe className="h-4 w-4 mr-2" />
                              Public - Anyone can enroll
                            </div>
                          </SelectItem>
                          <SelectItem value="private">
                            <div className="flex items-center">
                              <Lock className="h-4 w-4 mr-2" />
                              Private - Invitation only
                            </div>
                          </SelectItem>
                          <SelectItem value="hidden">
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-2" />
                              Hidden - Not listed publicly
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price (USD)
                      </label>
                      <Input
                        type="number"
                        value={courseData.price}
                        onChange={(e) => handleInputChange('price', e.target.value)}
                        placeholder="0 for free"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Enable Discussions
                          </label>
                          <p className="text-xs text-gray-500">
                            Allow students to post questions and discussions
                          </p>
                        </div>
                        <Switch
                          checked={courseData.enableDiscussions}
                          onCheckedChange={(checked) => handleInputChange('enableDiscussions', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Enable Quizzes
                          </label>
                          <p className="text-xs text-gray-500">
                            Include quizzes and assessments
                          </p>
                        </div>
                        <Switch
                          checked={courseData.enableQuizzes}
                          onCheckedChange={(checked) => handleInputChange('enableQuizzes', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Enable Certificates
                          </label>
                          <p className="text-xs text-gray-500">
                            Issue completion certificates
                          </p>
                        </div>
                        <Switch
                          checked={courseData.enableCertificate}
                          onCheckedChange={(checked) => handleInputChange('enableCertificate', checked)}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium text-gray-700">
                            Auto-enrollment
                          </label>
                          <p className="text-xs text-gray-500">
                            Automatically enroll new organization members
                          </p>
                        </div>
                        <Switch
                          checked={courseData.autoEnroll}
                          onCheckedChange={(checked) => handleInputChange('autoEnroll', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Resources */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Thumbnail</h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Upload a course thumbnail</p>
                    <p className="text-sm text-gray-500 mb-4">PNG, JPG up to 5MB</p>
                    <Button onClick={() => handleFileUpload('Thumbnail')}>
                      Choose File
                    </Button>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Resources</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 border-2 border-dashed border-gray-300 hover:border-teal-500 cursor-pointer transition-colors">
                      <div className="text-center">
                        <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Documents</p>
                        <p className="text-xs text-gray-500">PDF, DOC, PPT</p>
                      </div>
                    </Card>

                    <Card className="p-4 border-2 border-dashed border-gray-300 hover:border-teal-500 cursor-pointer transition-colors">
                      <div className="text-center">
                        <Video className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">Videos</p>
                        <p className="text-xs text-gray-500">MP4, AVI, MOV</p>
                      </div>
                    </Card>

                    <Card className="p-4 border-2 border-dashed border-gray-300 hover:border-teal-500 cursor-pointer transition-colors">
                      <div className="text-center">
                        <Link className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-700">External Links</p>
                        <p className="text-xs text-gray-500">Websites, articles</p>
                      </div>
                    </Card>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                  <Card>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{courseData.title || 'Course Title'}</CardTitle>
                          <CardDescription className="mt-2">
                            {courseData.description || 'Course description will appear here...'}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary">{courseData.level}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {courseData.duration || 'Duration TBD'}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {courseData.maxStudents ? `Max ${courseData.maxStudents}` : 'Unlimited'} students
                        </div>
                        <div className="flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          {courseData.objectives.filter(obj => obj.trim()).length} objectives
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(true)}
              disabled={isLoading}
            >
              Save as Draft
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={() => handleSave(false)}
                disabled={isLoading}
                className="bg-teal-600 hover:bg-teal-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Publish Course
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}