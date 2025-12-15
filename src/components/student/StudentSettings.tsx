import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  BookOpen,
  Bell,
  Target,
  Award,
  Clock,
  Calendar,
  Brain,
  Eye,
  EyeOff,
  Upload,
  Save,
  Download,
  BarChart3,
  Trophy,
  Zap,
  CheckCircle2,
  Star,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Globe,
  Lock
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
import { Progress } from '../ui/progress';
import { Slider } from '../ui/slider';
import { FileUpload } from '../shared/FileUpload';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';

interface StudentSettingsProps {
  user?: any;
  onLogout?: () => void;
}

export function StudentSettings({ user, onLogout }: StudentSettingsProps = {}) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const { t, isRTL } = useLanguage();

  // Profile state - Initialize with user data
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || user?.name?.split(' ')[0] || '',
    lastName: user?.lastName || user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    major: user?.major || '',
    year: user?.year || '',
    gpa: user?.gpa || '',
    bio: user?.bio || '',
    goals: user?.goals || '',
    linkedIn: user?.linkedIn || '',
    github: user?.github || '',
    portfolio: user?.portfolio || ''
  });

  // Learning preferences
  const [learningPrefs, setLearningPrefs] = useState({
    studyReminders: true,
    preferredStudyTime: 'morning',
    learningStyle: 'visual',
    difficultyPreference: 'adaptive',
    autoPlayVideos: true,
    showSubtitles: true,
    playbackSpeed: '1.0',
    darkMode: false,
    fontSize: 'medium',
    soundEnabled: true,
    focusMode: false,
    studyGoalHours: 2,
    weeklyGoal: 10
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    assignmentDueDates: true,
    gradeUpdates: true,
    courseAnnouncements: true,
    discussionReplies: true,
    studyReminders: true,
    achievementUnlocked: true,
    weeklyProgress: true,
    emailDigest: 'daily',
    pushNotifications: true,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'classmates',
    showProgress: true,
    showAchievements: true,
    allowPeerMessaging: true,
    shareStudyStats: false,
    participateInLeaderboards: true,
    dataCollection: true
  });

  // Mock achievements and progress data
  const achievements = [
    { id: 1, title: 'First Steps', description: 'Complete your first lesson', earned: true, icon: '🎯' },
    { id: 2, title: 'Quiz Master', description: 'Score 100% on 5 quizzes', earned: true, icon: '🏆' },
    { id: 3, title: 'Study Streak', description: 'Study for 7 consecutive days', earned: false, icon: '🔥' },
    { id: 4, title: 'Course Completionist', description: 'Complete your first course', earned: false, icon: '🎓' }
  ];

  const learningStats = {
    totalHours: 156,
    coursesCompleted: 2,
    coursesInProgress: 3,
    averageScore: 87,
    currentStreak: 5,
    longestStreak: 12
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.user.updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        name: `${profileData.firstName} ${profileData.lastName}`,
        phone: profileData.phone,
        bio: profileData.bio,
        studentId: profileData.studentId,
        major: profileData.major,
        year: profileData.year,
        gpa: profileData.gpa,
        goals: profileData.goals,
        linkedIn: profileData.linkedIn,
        github: profileData.github,
        portfolio: profileData.portfolio
      });
      
      console.log('👤 Update profile response:', response);
      
      if (response && response.success) {
        toast.success('Profile updated successfully!');
      } else {
        console.warn('⚠️ Profile update failed or invalid response');
        toast.error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Profile update failed:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Profile update endpoint not implemented yet');
        toast.info('Profile update feature coming soon');
      } else {
        toast.error(error?.error?.message || 'Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLearningPrefs = async () => {
    setIsSaving(true);
    try {
      const response = await api.user.updateUser({
        preferences: learningPrefs
      });
      
      console.log('🎯 Update learning preferences response:', response);
      
      if (response && response.success) {
        toast.success('Learning preferences saved!');
      } else {
        console.warn('⚠️ Learning preferences update failed or invalid response');
        toast.error('Failed to save learning preferences');
      }
    } catch (error: any) {
      console.error('Learning preferences update failed:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Learning preferences update endpoint not implemented yet');
        toast.info('Learning preferences feature coming soon');
      } else {
        toast.error('Failed to save learning preferences');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    try {
      const response = await api.user.updateUser({
        notificationPreferences: notifications
      });
      
      console.log('🔔 Update notifications response:', response);
      
      if (response && response.success) {
        toast.success('Notification preferences saved!');
      } else {
        console.warn('⚠️ Notifications update failed or invalid response');
        toast.error('Failed to save notification preferences');
      }
    } catch (error: any) {
      console.error('Notifications update failed:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Notifications update endpoint not implemented yet');
        toast.info('Notification preferences feature coming soon');
      } else {
        toast.error('Failed to save notification preferences');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async () => {
    setIsSaving(true);
    try {
      const response = await api.user.updateUser({
        privacySettings: privacySettings
      });
      
      console.log('🔒 Update privacy settings response:', response);
      
      if (response && response.success) {
        toast.success('Privacy settings saved!');
      } else {
        console.warn('⚠️ Privacy settings update failed or invalid response');
        toast.error('Failed to save privacy settings');
      }
    } catch (error: any) {
      console.error('Privacy settings update failed:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Privacy settings update endpoint not implemented yet');
        toast.info('Privacy settings feature coming soon');
      } else {
        toast.error('Failed to save privacy settings');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = async () => {
    toast.info('Preparing your data export...');
    // Simulate export process
    setTimeout(() => {
      toast.success('Data export ready for download!');
    }, 2000);
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('studentSettings.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('studentSettings.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsIcon className="h-6 w-6 text-gray-600" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('studentSettings.profile')}</TabsTrigger>
          <TabsTrigger value="learning">{t('studentSettings.learning')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('studentSettings.notifications')}</TabsTrigger>
          <TabsTrigger value="privacy">{t('studentSettings.privacy')}</TabsTrigger>
          <TabsTrigger value="progress">{t('studentSettings.progress')}</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-600`} />
                {t('studentSettings.studentProfile')}
              </CardTitle>
              <CardDescription>
                {t('studentSettings.updatePersonalInfo')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xl">
                    AJ
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    {t('studentSettings.changePhoto')}
                  </Button>
                  <p className="text-sm text-gray-500">
                    {t('studentSettings.photoRequirements')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.firstName')}
                  </label>
                  <Input 
                    value={profileData.firstName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.lastName')}
                  </label>
                  <Input 
                    value={profileData.lastName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.email')}
                  </label>
                  <Input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.phoneNumber')}
                  </label>
                  <Input 
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.studentId')}
                  </label>
                  <Input 
                    value={profileData.studentId}
                    onChange={(e) => setProfileData(prev => ({ ...prev, studentId: e.target.value }))}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.major')}
                  </label>
                  <Input 
                    value={profileData.major}
                    onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.academicYear')}
                  </label>
                  <Select 
                    value={profileData.year} 
                    onValueChange={(value) => setProfileData(prev => ({ ...prev, year: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="freshman">{t('studentSettings.freshman')}</SelectItem>
                      <SelectItem value="sophomore">{t('studentSettings.sophomore')}</SelectItem>
                      <SelectItem value="junior">{t('studentSettings.junior')}</SelectItem>
                      <SelectItem value="senior">{t('studentSettings.senior')}</SelectItem>
                      <SelectItem value="graduate">{t('studentSettings.graduate')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.currentGPA')}
                  </label>
                  <Input 
                    value={profileData.gpa}
                    onChange={(e) => setProfileData(prev => ({ ...prev, gpa: e.target.value }))}
                    placeholder="3.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('studentSettings.bio')}
                </label>
                <Textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder={t('studentSettings.bioPlaceholder')}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('studentSettings.learningGoals')}
                </label>
                <Textarea
                  value={profileData.goals}
                  onChange={(e) => setProfileData(prev => ({ ...prev, goals: e.target.value }))}
                  placeholder={t('studentSettings.goalsPlaceholder')}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.linkedInProfile')}
                  </label>
                  <Input 
                    value={profileData.linkedIn}
                    onChange={(e) => setProfileData(prev => ({ ...prev, linkedIn: e.target.value }))}
                    placeholder="linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.githubProfile')}
                  </label>
                  <Input 
                    value={profileData.github}
                    onChange={(e) => setProfileData(prev => ({ ...prev, github: e.target.value }))}
                    placeholder="github.com/username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('studentSettings.portfolioWebsite')}
                  </label>
                  <Input 
                    value={profileData.portfolio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, portfolio: e.target.value }))}
                    placeholder="yoursite.com"
                  />
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveProfile}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('studentSettings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('studentSettings.saveProfile')}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Preferences Tab */}
        <TabsContent value="learning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="h-5 w-5 mr-2 text-green-600" />
                {t('studentSettings.learningPreferences')}
              </CardTitle>
              <CardDescription>
                {t('studentSettings.learningPreferencesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.studyHabits')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('studentSettings.preferredStudyTime')}
                    </label>
                    <Select 
                      value={learningPrefs.preferredStudyTime} 
                      onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, preferredStudyTime: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">{t('studentSettings.morning')}</SelectItem>
                        <SelectItem value="afternoon">{t('studentSettings.afternoon')}</SelectItem>
                        <SelectItem value="evening">{t('studentSettings.evening')}</SelectItem>
                        <SelectItem value="night">{t('studentSettings.night')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('studentSettings.learningStyle')}
                    </label>
                    <Select 
                      value={learningPrefs.learningStyle} 
                      onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, learningStyle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visual">{t('studentSettings.visual')}</SelectItem>
                        <SelectItem value="auditory">{t('studentSettings.auditory')}</SelectItem>
                        <SelectItem value="kinesthetic">{t('studentSettings.kinesthetic')}</SelectItem>
                        <SelectItem value="reading">{t('studentSettings.readingWriting')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('studentSettings.dailyStudyGoal')}: {learningPrefs.studyGoalHours} {t('studentSettings.hours')}
                    </label>
                    <Slider
                      value={[learningPrefs.studyGoalHours]}
                      onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, studyGoalHours: value[0] }))}
                      max={8}
                      min={0.5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('studentSettings.weeklyStudyGoal')}: {learningPrefs.weeklyGoal} {t('studentSettings.hours')}
                    </label>
                    <Slider
                      value={[learningPrefs.weeklyGoal]}
                      onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, weeklyGoal: value[0] }))}
                      max={50}
                      min={5}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.videoMediaSettings')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.autoPlayVideos')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.autoPlayVideosDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={learningPrefs.autoPlayVideos}
                      onCheckedChange={(checked) => setLearningPrefs(prev => ({ ...prev, autoPlayVideos: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.showSubtitles')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.showSubtitlesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={learningPrefs.showSubtitles}
                      onCheckedChange={(checked) => setLearningPrefs(prev => ({ ...prev, showSubtitles: checked }))}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('studentSettings.videoPlaybackSpeed')}
                      </label>
                      <Select 
                        value={learningPrefs.playbackSpeed} 
                        onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, playbackSpeed: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1.0">1.0x ({t('studentSettings.normal')})</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2.0">2.0x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('studentSettings.textSize')}
                      </label>
                      <Select 
                        value={learningPrefs.fontSize} 
                        onValueChange={(value) => setLearningPrefs(prev => ({ ...prev, fontSize: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t('studentSettings.small')}</SelectItem>
                          <SelectItem value="medium">{t('studentSettings.medium')}</SelectItem>
                          <SelectItem value="large">{t('studentSettings.large')}</SelectItem>
                          <SelectItem value="extra-large">{t('studentSettings.extraLarge')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.interfaceSettings')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.darkMode')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.darkModeDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={learningPrefs.darkMode}
                      onCheckedChange={(checked) => setLearningPrefs(prev => ({ ...prev, darkMode: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.soundEffects')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.soundEffectsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={learningPrefs.soundEnabled}
                      onCheckedChange={(checked) => setLearningPrefs(prev => ({ ...prev, soundEnabled: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.focusMode')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.focusModeDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={learningPrefs.focusMode}
                      onCheckedChange={(checked) => setLearningPrefs(prev => ({ ...prev, focusMode: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveLearningPrefs}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    {t('studentSettings.saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('studentSettings.savePreferences')}
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
                {t('studentSettings.notificationPreferences')}
              </CardTitle>
              <CardDescription>
                {t('studentSettings.notificationPreferencesDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.courseActivities')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.assignmentDueDates')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.assignmentDueDatesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.assignmentDueDates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, assignmentDueDates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.gradeUpdates')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.gradeUpdatesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.gradeUpdates}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, gradeUpdates: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.courseAnnouncements')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.courseAnnouncementsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.courseAnnouncements}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, courseAnnouncements: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.discussionReplies')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.discussionRepliesDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.discussionReplies}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, discussionReplies: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.studyProgress')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.studyReminders')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.studyRemindersDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.studyReminders}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, studyReminders: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.achievementUnlocked')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.achievementUnlockedDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.achievementUnlocked}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, achievementUnlocked: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.weeklyProgressReport')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.weeklyProgressReportDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.weeklyProgress}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, weeklyProgress: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">{t('studentSettings.deliverySettings')}</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {t('studentSettings.pushNotifications')}
                      </label>
                      <p className="text-xs text-gray-500">
                        {t('studentSettings.pushNotificationsDesc')}
                      </p>
                    </div>
                    <Switch
                      checked={notifications.pushNotifications}
                      onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, pushNotifications: checked }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('studentSettings.emailDigestFrequency')}
                    </label>
                    <Select 
                      value={notifications.emailDigest} 
                      onValueChange={(value) => setNotifications(prev => ({ ...prev, emailDigest: value }))}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">{t('studentSettings.immediate')}</SelectItem>
                        <SelectItem value="daily">{t('studentSettings.daily')}</SelectItem>
                        <SelectItem value="weekly">{t('studentSettings.weekly')}</SelectItem>
                        <SelectItem value="never">{t('studentSettings.never')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours Start
                      </label>
                      <Input
                        type="time"
                        value={notifications.quietHoursStart}
                        onChange={(e) => setNotifications(prev => ({ ...prev, quietHoursStart: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiet Hours End
                      </label>
                      <Input
                        type="time"
                        value={notifications.quietHoursEnd}
                        onChange={(e) => setNotifications(prev => ({ ...prev, quietHoursEnd: e.target.value }))}
                      />
                    </div>
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

        {/* Privacy Tab */}
        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2 text-red-600" />
                Privacy & Data Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information and how your data is used
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Who can see your profile?
                  </label>
                  <Select 
                    value={privacy.profileVisibility} 
                    onValueChange={(value) => setPrivacy(prev => ({ ...prev, profileVisibility: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="classmates">Classmates only</SelectItem>
                      <SelectItem value="instructors">Instructors only</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show progress to others
                      </label>
                      <p className="text-xs text-gray-500">
                        Let classmates see your course progress
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showProgress}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showProgress: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show achievements
                      </label>
                      <p className="text-xs text-gray-500">
                        Display your badges and achievements publicly
                      </p>
                    </div>
                    <Switch
                      checked={privacy.showAchievements}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, showAchievements: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Allow peer messaging
                      </label>
                      <p className="text-xs text-gray-500">
                        Let other students send you direct messages
                      </p>
                    </div>
                    <Switch
                      checked={privacy.allowPeerMessaging}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, allowPeerMessaging: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Learning Analytics</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Share study statistics
                      </label>
                      <p className="text-xs text-gray-500">
                        Help improve the platform with anonymous usage data
                      </p>
                    </div>
                    <Switch
                      checked={privacy.shareStudyStats}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, shareStudyStats: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Participate in leaderboards
                      </label>
                      <p className="text-xs text-gray-500">
                        Appear in class rankings and competitions
                      </p>
                    </div>
                    <Switch
                      checked={privacy.participateInLeaderboards}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, participateInLeaderboards: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Learning analytics
                      </label>
                      <p className="text-xs text-gray-500">
                        Allow collection of learning data for personalization
                      </p>
                    </div>
                    <Switch
                      checked={privacy.dataCollection}
                      onCheckedChange={(checked) => setPrivacy(prev => ({ ...prev, dataCollection: checked }))}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data Export & Deletion</h4>
                <div className="space-y-3">
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export My Data
                  </Button>
                  <p className="text-xs text-gray-500">
                    Download a copy of all your data including progress, submissions, and settings.
                  </p>
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSavePrivacy}
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
                    Save Privacy Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="h-8 w-8 text-teal-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{learningStats.totalHours}</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{learningStats.coursesCompleted}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{learningStats.averageScore}%</div>
                <div className="text-sm text-gray-600">Avg. Score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Zap className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900">{learningStats.currentStreak}</div>
                <div className="text-sm text-gray-600">Day Streak</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                Achievements
              </CardTitle>
              <CardDescription>
                Your learning milestones and accomplishments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.earned 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.earned && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Learning Progress
              </CardTitle>
              <CardDescription>
                Track your progress across different courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Introduction to React</span>
                    <span className="text-sm text-gray-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Advanced JavaScript</span>
                    <span className="text-sm text-gray-600">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Database Design</span>
                    <span className="text-sm text-gray-600">45%</span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}