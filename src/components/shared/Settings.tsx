import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell,
  Shield,
  Palette,
  Globe,
  Database,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  Save,
  CheckCircle,
  AlertTriangle,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { InstructorSettings } from '../instructor/InstructorSettings';
import { StudentSettings } from '../student/StudentSettings';

interface SettingsProps {
  user?: any;
  onLogout?: () => void;
}

export function Settings({ user, onLogout }: SettingsProps = {}) {
  // Route to appropriate settings based on user role
  if (user?.role === 'instructor') {
    return <InstructorSettings user={user} onLogout={onLogout} />;
  }
  
  if (user?.role === 'student') {
    return <StudentSettings user={user} onLogout={onLogout} />;
  }

  // Default admin settings (existing component)
  const { t, isRTL } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@cognerax.com',
    phone: '',
    jobTitle: '',
    department: '',
    bio: ''
  });
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    studentProgress: true,
    systemUpdates: true,
    weeklyReport: true
  });
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Handler functions
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const response = await api.user.updateUser(user?.id, {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website
      });
      
      if (response) {
        toast.success('Profile updated successfully!');
        // Update user data in parent component if needed
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error?.message || 'Failed to update profile');
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

  const handleChangePhoto = () => {
    toast.info('Photo upload feature coming soon!');
  };

  const handleRemovePhoto = () => {
    toast.success('Profile photo removed');
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.auth.updatePassword({
        currentPassword: passwordData.current,
        newPassword: passwordData.new
      });
      
      if (response) {
        toast.success('Password updated successfully!');
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        throw new Error('Failed to update password');
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      toast.error(error?.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable2FA = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Two-factor authentication disabled');
    } catch (error) {
      toast.error('Failed to disable 2FA');
    }
  };

  const handleRevokeSession = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session');
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success('Data export ready for download!');
    } catch (error) {
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion requires admin confirmation. Please contact support.');
  };

  const handleSaveAppearance = async () => {
    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Appearance settings saved!');
    } catch (error) {
      toast.error('Failed to save appearance settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('settings.subtitle')}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <SettingsIcon className={`h-6 w-6 text-gray-600 ${isRTL ? 'transform scale-x-[-1]' : ''}`} />
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">{t('settings.tabs.profile')}</TabsTrigger>
          <TabsTrigger value="notifications">{t('settings.tabs.notifications')}</TabsTrigger>
          <TabsTrigger value="security">{t('settings.tabs.security')}</TabsTrigger>
          <TabsTrigger value="appearance">{t('settings.tabs.appearance')}</TabsTrigger>
          <TabsTrigger value="data">{t('settings.tabs.data')}</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-blue-600`} />
                {t('settings.profile.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.profile.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-r from-teal-500 to-purple-600 text-white text-xl">
                    A
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" onClick={handleChangePhoto}>
                    <Upload className="h-4 w-4 mr-2" />
                    {t('settings.changePhoto')}
                  </Button>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleRemovePhoto}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('settings.removePhoto')}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.firstName')}
                  </label>
                  <Input defaultValue="Admin" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('settings.lastName')}
                  </label>
                  <Input defaultValue="User" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input defaultValue="admin@cognerax.com" type="email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input placeholder="+1 (555) 123-4567" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title
                  </label>
                  <Input placeholder="e.g., Learning Administrator" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <Input placeholder="e.g., Education Technology" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Profile Visibility</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show profile to students
                      </label>
                      <p className="text-xs text-gray-500">
                        Students can see your profile information
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Show email to instructors
                      </label>
                      <p className="text-xs text-gray-500">
                        Other instructors can see your email
                      </p>
                    </div>
                    <Switch />
                  </div>
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-yellow-600`} />
                {t('settings.notifications.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.notifications.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Delivery Methods</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Notifications
                      </label>
                      <p className="text-xs text-gray-500">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.email}
                      onCheckedChange={(checked) => setNotifications({...notifications, email: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Push Notifications
                      </label>
                      <p className="text-xs text-gray-500">
                        Receive browser push notifications
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.push}
                      onCheckedChange={(checked) => setNotifications({...notifications, push: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Notification Types</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Student Progress Updates
                      </label>
                      <p className="text-xs text-gray-500">
                        When students complete courses or struggle
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.studentProgress}
                      onCheckedChange={(checked) => setNotifications({...notifications, studentProgress: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        System Updates
                      </label>
                      <p className="text-xs text-gray-500">
                        Platform updates and maintenance notices
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.systemUpdates}
                      onCheckedChange={(checked) => setNotifications({...notifications, systemUpdates: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Weekly Progress Reports
                      </label>
                      <p className="text-xs text-gray-500">
                        Summary of organization activity
                      </p>
                    </div>
                    <Switch 
                      checked={notifications.weeklyReport}
                      onCheckedChange={(checked) => setNotifications({...notifications, weeklyReport: checked})}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Quiet Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="10:00 PM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="21:00">9:00 PM</SelectItem>
                        <SelectItem value="22:00">10:00 PM</SelectItem>
                        <SelectItem value="23:00">11:00 PM</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="8:00 AM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="07:00">7:00 AM</SelectItem>
                        <SelectItem value="08:00">8:00 AM</SelectItem>
                        <SelectItem value="09:00">9:00 AM</SelectItem>
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

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-red-600`} />
                {t('settings.security.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.security.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Change Password</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Enter current password" 
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <Input type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <Input type="password" placeholder="Confirm new password" />
                  </div>
                </div>
                <Button variant="outline" onClick={handleUpdatePassword} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Update Password
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-900">2FA is enabled</p>
                    <p className="text-sm text-green-700">Your account is protected with two-factor authentication</p>
                  </div>
                  <Button variant="outline" className="text-red-600 hover:text-red-700" onClick={handleDisable2FA}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Disable 2FA
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Active Sessions</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Current Session</p>
                      <p className="text-sm text-gray-500">Chrome on Windows • New York, NY</p>
                      <p className="text-xs text-green-600">Active now</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Current
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Mobile Session</p>
                      <p className="text-sm text-gray-500">Safari on iPhone • New York, NY</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={handleRevokeSession}>
                      <LogOut className="h-3 w-3 mr-1" />
                      Revoke
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Login Alerts</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email me about suspicious login attempts
                    </label>
                    <p className="text-xs text-gray-500">
                      Get notified when someone tries to access your account
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-purple-600`} />
                {t('settings.appearance.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.appearance.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Theme</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border-2 border-teal-500 rounded-lg bg-white cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">Light (Current)</p>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-lg bg-gray-900 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-3 h-3 bg-teal-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium text-white">Dark</p>
                  </div>
                  <div className="p-4 border-2 border-gray-200 rounded-lg bg-gradient-to-br from-white to-gray-100 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    </div>
                    <p className="text-sm font-medium">Auto</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Display Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Compact sidebar
                      </label>
                      <p className="text-xs text-gray-500">
                        Show icons only in the navigation sidebar
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Animations
                      </label>
                      <p className="text-xs text-gray-500">
                        Enable smooth transitions and animations
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        High contrast mode
                      </label>
                      <p className="text-xs text-gray-500">
                        Increase contrast for better accessibility
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Language & Region</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Language
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="English (US)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time Zone
                    </label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Eastern Time" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EST">Eastern Time</SelectItem>
                        <SelectItem value="CST">Central Time</SelectItem>
                        <SelectItem value="MST">Mountain Time</SelectItem>
                        <SelectItem value="PST">Pacific Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button 
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                onClick={handleSaveAppearance}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    Save Appearance Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Database className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'} text-green-600`} />
                {t('settings.data.title')}
              </CardTitle>
              <CardDescription>
                {t('settings.data.desc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data Export</h4>
                <p className="text-sm text-gray-600">
                  Download a copy of your data including courses, progress, and analytics.
                </p>
                <Button variant="outline" onClick={handleExportData} disabled={isExporting}>
                  {isExporting ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export My Data
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Privacy Settings</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Analytics tracking
                      </label>
                      <p className="text-xs text-gray-500">
                        Help improve our platform with usage analytics
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Marketing communications
                      </label>
                      <p className="text-xs text-gray-500">
                        Receive updates about new features and improvements
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Third-party integrations
                      </label>
                      <p className="text-xs text-gray-500">
                        Allow approved third-party services to access your data
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data Retention</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800 mb-2">
                    Your data is automatically backed up and retained according to our data policy.
                  </p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Active data: Retained while your account is active</li>
                    <li>• Course progress: Retained for 7 years after completion</li>
                    <li>• Analytics data: Anonymized after 2 years</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-red-900">Danger Zone</h4>
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h5 className="font-medium text-red-900 mb-2">Delete Account</h5>
                  <p className="text-sm text-red-700 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50" onClick={handleDeleteAccount}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}