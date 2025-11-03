import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  BookOpen,
  Users,
  Bell,
  Shield,
  Palette,
  Database,
  Calendar,
  Clock,
  Target,
  Award,
  BarChart3,
  Upload,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Lock,
  Globe,
  MessageSquare,
  FileText,
  Video,
  Image,
  Link
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { CourseCreator } from './CourseCreator';
import { ResourceManager } from '../tools/ResourceManager';

interface InstructorSettingsProps {
  user?: any;
  onLogout?: () => void;
}

export function InstructorSettings({ user, onLogout }: InstructorSettingsProps = {}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showCourseCreator, setShowCourseCreator] = useState(false);
  const [showResourceManager, setShowResourceManager] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Profile state
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Dr. Sarah',
    lastName: user?.lastName || 'Johnson',
    email: user?.email || 'sarah.johnson@university.edu',
    phone: '+1 (555) 123-4567',
    department: 'Computer Science',
    title: 'Associate Professor',
    bio: 'Passionate educator with 10+ years of experience in computer science and web development.',
    specialization: 'Web Development, Data Structures',
    office: 'Room 342, Computer Science Building',
    officeHours: 'Monday & Wednesday 2-4 PM'
  });

  // Course management state
  const [courses, setCourses] = useState([
    {
      id: 1,
      title: 'Introduction to React',
      students: 45,
      status: 'active',
      startDate: '2024-01-15',
      endDate: '2024-05-15',
      resources: 23,
      assignments: 8
    },
    {
      id: 2,
      title: 'Advanced JavaScript',
      students: 32,
      status: 'active',
      startDate: '2024-02-01',
      endDate: '2024-06-01',
      resources: 18,
      assignments: 6
    },
    {
      id: 3,
      title: 'Database Design',
      students: 28,
      status: 'draft',
      startDate: '2024-03-01',
      endDate: '2024-07-01',
      resources: 5,
      assignments: 0
    }
  ]);

  // Teaching preferences
  const [teachingPrefs, setTeachingPrefs] = useState({
    autoGrading: true,
    allowLateSubmissions: true,
    requireDiscussionParticipation: false,
    enablePeerReview: true,
    sendProgressNotifications: true,
    allowAnonymousQuestions: true,
    defaultQuizTimeLimit: '60',
    gradingScale: 'percentage',
    attendanceTracking: true
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    newEnrollments: true,
    assignmentSubmissions: true,
    studentQuestions: true,
    discussionPosts: false,
    gradeRequests: true,
    systemUpdates: true,
    weeklyReports: true,
    emailDigest: 'daily'
  });

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTeachingPrefs = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Teaching preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Notification preferences saved!');
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCourseCreated = (courseData: any) => {
    if (editingCourse) {
      setCourses(prev => prev.map(course => 
        course.id === editingCourse.id ? { ...courseData, id: editingCourse.id } : course
      ));
    } else {
      setCourses(prev => [...prev, { ...courseData, students: 0, resources: 0, assignments: 0 }]);
    }
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: number) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
    toast.success('Course deleted successfully');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Settings</h1>
          <p className="text-gray-600 mt-1">
            Manage your teaching profile, courses, and preferences
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="courses">My Courses</TabsTrigger>
          <TabsTrigger value="teaching">Teaching</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-blue-600" />
                Instructor Profile
              </CardTitle>
              <CardDescription>
                Update your professional information and teaching credentials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xl">
                    SJ
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-sm text-gray-500">
                    JPG, GIF or PNG. Max size 2MB.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input 
                    value={profileData.department}
                    onChange={(e) => setProfileData(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Academic Title
                  </label>
                  <Input 
                    value={profileData.title}
                    onChange={(e) => setProfileData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Location
                  </label>
                  <Input 
                    value={profileData.office}
                    onChange={(e) => setProfileData(prev => ({ ...prev, office: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Office Hours
                  </label>
                  <Input 
                    value={profileData.officeHours}
                    onChange={(e) => setProfileData(prev => ({ ...prev, officeHours: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <Input 
                  value={profileData.specialization}
                  onChange={(e) => setProfileData(prev => ({ ...prev, specialization: e.target.value }))}
                  placeholder="e.g., Web Development, Data Structures, Algorithms"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell students about your background and teaching philosophy..."
                  rows={4}
                />
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Profile
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Courses</h3>
              <p className="text-gray-600">Manage your courses and create new ones</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowResourceManager(true)}
              >
                <Database className="h-4 w-4 mr-2" />
                Manage Resources
              </Button>
              <Button 
                onClick={() => setShowCourseCreator(true)}
                className="bg-teal-600 hover:bg-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{course.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge 
                          variant={course.status === 'active' ? 'default' : 'secondary'}
                          className={course.status === 'active' ? 'bg-green-500' : ''}
                        >
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditingCourse(course);
                        setShowCourseCreator(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Students:</span>
                      <span className="font-medium">{course.students}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Resources:</span>
                      <span className="font-medium">{course.resources}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Assignments:</span>
                      <span className="font-medium">{course.assignments}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">
                        {new Date(course.startDate).toLocaleDateString()} - {new Date(course.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Teaching Preferences Tab */}
        <TabsContent value="teaching" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                Teaching Preferences
              </CardTitle>
              <CardDescription>
                Configure your default teaching settings and grading preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Assignment & Grading</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Enable auto-grading for quizzes
                      </label>
                      <p className="text-xs text-gray-500">
                        Automatically grade multiple choice and true/false questions
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.autoGrading}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, autoGrading: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Allow late submissions
                      </label>
                      <p className="text-xs text-gray-500">
                        Students can submit assignments after the deadline
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.allowLateSubmissions}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, allowLateSubmissions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Enable peer review
                      </label>
                      <p className="text-xs text-gray-500">
                        Students can review each other's work
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.enablePeerReview}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, enablePeerReview: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default Quiz Time Limit (minutes)
                      </label>
                      <Input
                        type="number"
                        value={teachingPrefs.defaultQuizTimeLimit}
                        onChange={(e) => setTeachingPrefs(prev => ({ ...prev, defaultQuizTimeLimit: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grading Scale
                      </label>
                      <Select 
                        value={teachingPrefs.gradingScale} 
                        onValueChange={(value) => setTeachingPrefs(prev => ({ ...prev, gradingScale: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">Percentage (0-100%)</SelectItem>
                          <SelectItem value="points">Points Based</SelectItem>
                          <SelectItem value="letter">Letter Grades (A-F)</SelectItem>
                          <SelectItem value="gpa">GPA Scale (0-4.0)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Class Management</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Track attendance
                      </label>
                      <p className="text-xs text-gray-500">
                        Monitor student attendance and participation
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.attendanceTracking}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, attendanceTracking: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Require discussion participation
                      </label>
                      <p className="text-xs text-gray-500">
                        Students must participate in course discussions
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.requireDiscussionParticipation}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, requireDiscussionParticipation: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Allow anonymous questions
                      </label>
                      <p className="text-xs text-gray-500">
                        Students can ask questions anonymously
                      </p>
                    </div>
                    <Switch
                      checked={teachingPrefs.allowAnonymousQuestions}
                      onCheckedChange={(checked) => setTeachingPrefs(prev => ({ ...prev, allowAnonymousQuestions: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveTeachingPrefs}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2 text-yellow-600" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Choose how you want to be notified about course activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Student Activities</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        New enrollments
                      </label>
                      <p className="text-xs text-gray-500">
                        When students enroll in your courses
                      </p>
                    </div>
                    <Switch
                      checked={notifications.newEnrollments}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, newEnrollments: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Assignment submissions
                      </label>
                      <p className="text-xs text-gray-500">
                        When students submit assignments
                      </p>
                    </div>
                    <Switch
                      checked={notifications.assignmentSubmissions}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, assignmentSubmissions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Student questions
                      </label>
                      <p className="text-xs text-gray-500">
                        When students ask questions in discussions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studentQuestions}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, studentQuestions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Discussion posts
                      </label>
                      <p className="text-xs text-gray-500">
                        When students post in course discussions
                      </p>
                    </div>
                    <Switch
                      checked={notifications.discussionPosts}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, discussionPosts: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">System & Reports</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        System updates
                      </label>
                      <p className="text-xs text-gray-500">
                        Platform updates and maintenance notices
                      </p>
                    </div>
                    <Switch
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, systemUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Weekly reports
                      </label>
                      <p className="text-xs text-gray-500">
                        Summary of course activities and student progress
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyReports}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyReports: checked }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Digest Frequency
                    </label>
                    <Select 
                      value={notifications.emailDigest} 
                      onValueChange={(value) => setNotifications(prev => ({ ...prev, emailDigest: value }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveNotifications}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-purple-600" />
                Teaching Analytics
              </CardTitle>
              <CardDescription>
                Overview of your teaching performance and student engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">105</div>
                  <div className="text-sm text-gray-600">Total Students</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-gray-600">Avg. Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">87%</div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">92%</div>
                  <div className="text-sm text-gray-600">Satisfaction</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Detailed analytics and reports are available in the full analytics dashboard.
                </p>
                <Button variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Course Creator Modal */}
      {showCourseCreator && (
        <CourseCreator
          isOpen={showCourseCreator}
          onClose={() => {
            setShowCourseCreator(false);
            setEditingCourse(null);
          }}
          existingCourse={editingCourse}
          onSave={handleCourseCreated}
        />
      )}

      {/* Resource Manager Modal */}
      {showResourceManager && (
        <ResourceManager
          isOpen={showResourceManager}
          onClose={() => setShowResourceManager(false)}
        />
      )}
    </div>
  );
}