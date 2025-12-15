import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Switch } from '../ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Users, Shield, UserPlus, Settings, Search, Filter, MoreHorizontal, Edit, Trash2, Key, UserCheck, UserX, Download, Upload, RefreshCw, Eye, Lock, AlertTriangle, Copy, QrCode, ExternalLink, Calendar, Hash } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

const mockUsers = [
  { id: 1, name: 'Ahmed Hassan', email: 'ahmed.hassan@email.com', role: 'student', status: 'active', lastActive: '2024-01-15', permissions: ['read_courses', 'submit_assignments'], ssoEnabled: true, avatar: null },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', role: 'instructor', status: 'active', lastActive: '2024-01-14', permissions: ['read_courses', 'create_courses', 'grade_assignments'], ssoEnabled: false, avatar: null },
  { id: 3, name: 'Mohamed Ali', email: 'mohamed.ali@email.com', role: 'admin', status: 'active', lastActive: '2024-01-15', permissions: ['all'], ssoEnabled: true, avatar: null },
  { id: 4, name: 'Emily Chen', email: 'emily.chen@email.com', role: 'instructor', status: 'inactive', lastActive: '2024-01-10', permissions: ['read_courses', 'create_courses'], ssoEnabled: false, avatar: null },
  { id: 5, name: 'Omar Khalil', email: 'omar.khalil@email.com', role: 'student', status: 'pending', lastActive: 'Never', permissions: ['read_courses'], ssoEnabled: false, avatar: null }
];

const rolePermissions = {
  admin: ['user_management', 'content_management', 'analytics', 'system_settings', 'billing', 'integrations'],
  instructor: ['course_creation', 'content_editing', 'student_management', 'grading', 'analytics_view'],
  student: ['course_access', 'assignment_submit', 'discussion_participate', 'progress_view'],
  parent: ['progress_view']
};

const availablePermissions = [
  { id: 'user_management', name: 'User Management', description: 'Create, edit, and delete users' },
  { id: 'content_management', name: 'Content Management', description: 'Manage courses, lessons, and resources' },
  { id: 'analytics', name: 'Analytics Access', description: 'View platform analytics and reports' },
  { id: 'system_settings', name: 'System Settings', description: 'Configure platform settings' },
  { id: 'billing', name: 'Billing Management', description: 'Manage billing and subscriptions' },
  { id: 'integrations', name: 'Integration Management', description: 'Configure third-party integrations' },
  { id: 'course_creation', name: 'Course Creation', description: 'Create and publish courses' },
  { id: 'content_editing', name: 'Content Editing', description: 'Edit course content and materials' },
  { id: 'student_management', name: 'Student Management', description: 'Manage student enrollments and progress' },
  { id: 'grading', name: 'Grading Access', description: 'Grade assignments and provide feedback' },
  { id: 'analytics_view', name: 'Analytics View', description: 'View analytics for own courses' },
  { id: 'course_access', name: 'Course Access', description: 'Access enrolled courses' },
  { id: 'assignment_submit', name: 'Assignment Submission', description: 'Submit assignments and quizzes' },
  { id: 'discussion_participate', name: 'Discussion Participation', description: 'Participate in course discussions' },
  { id: 'progress_view', name: 'Progress View', description: 'View learning progress and achievements' }
];

export function UserAccessManagement() {
  const { t, isRTL } = useLanguage();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bulkAction, setBulkAction] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  // Invitation management state
  const [invitations, setInvitations] = useState<any[]>([]);
  const [invitationStats, setInvitationStats] = useState<any | null>(null);
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [invitationRole, setInvitationRole] = useState<'instructor' | 'student' | 'parent'>('instructor');
  const [invitationData, setInvitationData] = useState({
    message: '',
    description: '',
    expiresInDays: 7,
    maxUses: 50
  });
  const [generatedInvitation, setGeneratedInvitation] = useState<any | null>(null);
  
  // School organization field selection
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('');
  const [loadingFields, setLoadingFields] = useState(false);

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const filters = {
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
          search: searchQuery || undefined,
          page: pagination.page,
          limit: pagination.limit
        };

        const response = await api.user.getUsers(filters);
        if (response && Array.isArray(response)) {
          setUsers(response);
          setPagination(prev => ({
            ...prev,
            total: response.length
          }));
        } else {
          // Fallback to mock data if API fails
          setUsers(mockUsers);
          setPagination(prev => ({
            ...prev,
            total: mockUsers.length
          }));
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setError('Failed to load users. Using cached data.');
        // Fallback to mock data
        setUsers(mockUsers);
        setPagination(prev => ({
          ...prev,
          total: mockUsers.length
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [filterRole, filterStatus, searchQuery, pagination.page, pagination.limit]);

  // Fetch invitation data
  useEffect(() => {
    fetchInvitations();
    fetchInvitationStats();
  }, []);

  // Fetch current user to check organization type
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await api.getMe();
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error);
      }
    };
    fetchCurrentUser();
  }, []);

  // Fetch fields when organization type is "school"
  useEffect(() => {
    const fetchFields = async () => {
      if (currentUser?.organization?.type === 'school') {
        try {
          setLoadingFields(true);
          const fieldsData = await api.field.getFields();
          if (fieldsData && Array.isArray(fieldsData)) {
            setFields(fieldsData);
          }
        } catch (error) {
          console.error('Failed to fetch fields:', error);
          setFields([]);
        } finally {
          setLoadingFields(false);
        }
      } else {
        setFields([]);
        setSelectedFieldId('');
      }
    };
    fetchFields();
  }, [currentUser]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(user => user.id)
    );
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;
    
    try {
      const response = await api.user.bulkUserActions(bulkAction, selectedUsers);
      if (response) {
        toast.success(`Bulk action completed successfully`);
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to perform bulk action');
      }
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error('Failed to perform bulk action');
    }
    
    setSelectedUsers([]);
    setBulkAction('');
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await api.user.createUser(userData);
      if (response) {
        toast.success('User created successfully');
        setCreatingUser(false);
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to create user');
      }
    } catch (error) {
      console.error('Create user failed:', error);
      toast.error('Failed to create user');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await api.user.updateUser(userId, userData);
      if (response) {
        toast.success('User updated successfully');
        setEditingUser(null);
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to update user');
      }
    } catch (error) {
      console.error('Update user failed:', error);
      toast.error('Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await api.user.deleteUser(userId);
      if (response) {
        toast.success('User deleted successfully');
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Delete user failed:', error);
      toast.error('Failed to delete user');
    }
  };

  // Invitation management functions
  const fetchInvitations = async () => {
    try {
      const response = await api.invitation.getInvitations();
      if (response && Array.isArray(response)) {
        setInvitations(response);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  };

  const fetchInvitationStats = async () => {
    try {
      const response = await api.invitation.getInvitationStats();
      if (response) {
        setInvitationStats(response);
      }
    } catch (error) {
      console.error('Failed to fetch invitation stats:', error);
    }
  };

  const handleCreateInvitation = async () => {
    try {
      // Validate field selection for school organizations
      if (currentUser?.organization?.type === 'school' && invitationRole === 'student' && !selectedFieldId) {
        toast.error('Please select a class (field) for the student invitation');
        return;
      }

      setCreatingInvitation(true);
      const invitationPayload: any = {
        role: invitationRole,
        message: invitationData.message,
        description: invitationData.description,
        expiresInDays: invitationData.expiresInDays,
        maxUses: invitationData.maxUses
      };

      // Add fieldId for school organizations when inviting students
      if (currentUser?.organization?.type === 'school' && invitationRole === 'student' && selectedFieldId) {
        invitationPayload.fieldId = selectedFieldId;
      }

      const response = await api.invitation.createInvitation(invitationPayload);

      if (response && response.invitation) {
        setGeneratedInvitation(response.invitation);
        toast.success('Invitation created successfully');
        fetchInvitations();
        fetchInvitationStats();
        // Reset form
        setInvitationData({
          message: '',
          description: '',
          expiresInDays: 7,
          maxUses: 50
        });
        setSelectedFieldId('');
      } else {
        toast.error('Failed to create invitation');
      }
    } catch (error) {
      console.error('Create invitation failed:', error);
      toast.error('Failed to create invitation');
    } finally {
      setCreatingInvitation(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await api.invitation.resendInvitation(invitationId);
      if (response && response.invitationUrl) {
        await navigator.clipboard.writeText(response.invitationUrl);
        toast.success('Invitation URL copied to clipboard');
      } else {
        toast.error('Failed to get invitation URL');
      }
    } catch (error) {
      console.error('Resend invitation failed:', error);
      toast.error('Failed to resend invitation');
    }
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    try {
      const response = await api.invitation.cancelInvitation(invitationId);
      if (response) {
        toast.success('Invitation revoked successfully');
        fetchInvitations();
        fetchInvitationStats();
      } else {
        toast.error('Failed to revoke invitation');
      }
    } catch (error) {
      console.error('Revoke invitation failed:', error);
      toast.error('Failed to revoke invitation');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateUserRole = async (userId, role) => {
    try {
      const response = await api.user.updateUserRole(userId, role);
      if (response) {
        toast.success('User role updated successfully');
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      console.error('Update user role failed:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleUpdateUserPermissions = async (userId, permissions) => {
    try {
      const response = await api.user.updateUserPermissions(userId, permissions);
      if (response) {
        toast.success('User permissions updated successfully');
        // Refresh users list
        const usersResponse = await api.user.getUsers();
        if (usersResponse && Array.isArray(usersResponse)) {
          setUsers(usersResponse);
        }
      } else {
        toast.error('Failed to update user permissions');
      }
    } catch (error) {
      console.error('Update user permissions failed:', error);
      toast.error('Failed to update user permissions');
    }
  };

  const handleExportUsers = async () => {
    try {
      const filters = {
        role: filterRole !== 'all' ? filterRole : undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchQuery || undefined
      };
      
      const response = await api.user.exportUsers('csv');
      if (response) {
        // Create download link
        const blob = new Blob([response], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'users-export.csv';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Users exported successfully');
      } else {
        toast.error('Failed to export users');
      }
    } catch (error) {
      console.error('Export users failed:', error);
      toast.error('Failed to export users');
    }
  };


  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <div className="h-12 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
          <div className="h-32 w-full bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('admin.userAccessManagement', 'User & Access Management')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('admin.userAccessDesc', 'Manage users, roles, permissions, and access controls')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Users
          </Button>
          <Dialog open={creatingUser} onOpenChange={setCreatingUser}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the platform with specific roles and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input placeholder="Enter full name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Role</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="send-invitation" />
                  <label htmlFor="send-invitation" className="text-sm">
                    Send invitation email
                  </label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreatingUser(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setCreatingUser(false)}>
                    Create User
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold">{mockUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'active').length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">SSO Enabled</p>
                <p className="text-2xl font-bold">{mockUsers.filter(u => u.ssoEnabled).length}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{mockUsers.filter(u => u.status === 'pending').length}</p>
              </div>
              <UserX className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="sso">SSO Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          {/* Filters and Bulk Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input 
                      placeholder="Search users..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Select value={bulkAction} onValueChange={setBulkAction}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="Bulk Actions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="activate">Activate Users</SelectItem>
                        <SelectItem value="deactivate">Deactivate Users</SelectItem>
                        <SelectItem value="delete">Delete Users</SelectItem>
                        <SelectItem value="change-role">Change Role</SelectItem>
                        <SelectItem value="enable-sso">Enable SSO</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" onClick={handleBulkAction} disabled={!bulkAction}>
                      Apply ({selectedUsers.length})
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                User List
                <div className="flex items-center gap-2">
                  <Checkbox 
                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">Select All</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Checkbox 
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => handleSelectUser(user.id)}
                      />
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      {user.ssoEnabled && (
                        <Badge variant="outline" className="text-xs">
                          <Shield className="h-3 w-3 mr-1" />
                          SSO
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500 min-w-20">
                        {user.lastActive}
                      </span>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit User: {user.name}</DialogTitle>
                            <DialogDescription>
                              Modify user details, role, and permissions.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input defaultValue={user.name} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Email</label>
                                <Input defaultValue={user.email} />
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Role</label>
                                <Select defaultValue={user.role}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="instructor">Instructor</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select defaultValue={user.status}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="inactive">Inactive</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch defaultChecked={user.ssoEnabled} />
                                <label className="text-sm">Enable SSO</label>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <h4 className="font-medium">Permissions</h4>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {availablePermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-start space-x-2">
                                    <Checkbox 
                                      id={permission.id}
                                      defaultChecked={rolePermissions[user.role]?.includes(permission.id)}
                                    />
                                    <div className="space-y-1">
                                      <label htmlFor={permission.id} className="text-sm font-medium">
                                        {permission.name}
                                      </label>
                                      <p className="text-xs text-gray-600">{permission.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline">Cancel</Button>
                            <Button>Save Changes</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete {user.name}? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-6">
          {/* Invitation Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Invitations</p>
                    <p className="text-2xl font-bold">{invitationStats?.total || 0}</p>
                  </div>
                  <Hash className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Accepted Users</p>
                    <p className="text-2xl font-bold">{invitationStats?.totalAcceptedUsers || 0}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Invitations</p>
                    <p className="text-2xl font-bold">{invitationStats?.byStatus?.active || 0}</p>
                  </div>
                  <ExternalLink className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Instructors</p>
                    <p className="text-2xl font-bold">{invitationStats?.byRole?.instructors || 0}</p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Invitation Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Create New Invitation
              </CardTitle>
              <CardDescription>
                Generate invitation links for instructors, students, and parents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setInvitationRole('instructor');
                    setSelectedFieldId(''); // Reset field selection when changing role
                  }}
                  variant={invitationRole === 'instructor' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  Invite Instructors
                </Button>
                <Button
                  onClick={() => {
                    setInvitationRole('student');
                    setSelectedFieldId(''); // Reset field selection when changing role
                  }}
                  variant={invitationRole === 'student' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Invite Students
                </Button>
                <Button
                  onClick={() => {
                    setInvitationRole('parent');
                    setSelectedFieldId(''); // Reset field selection when changing role
                  }}
                  variant={invitationRole === 'parent' ? 'default' : 'outline'}
                  className="flex items-center gap-2"
                >
                  <Users className="h-4 w-4" />
                  Invite Parents
                </Button>
              </div>

              {/* Field selection for school organizations when inviting students */}
              {currentUser?.organization?.type === 'school' && invitationRole === 'student' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Class (Field) <span className="text-red-500">*</span>
                  </label>
                  {loadingFields ? (
                    <div className="text-sm text-gray-500">Loading classes...</div>
                  ) : (
                    <Select value={selectedFieldId} onValueChange={setSelectedFieldId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a class (field)" />
                      </SelectTrigger>
                      <SelectContent>
                        {fields.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">No classes available</div>
                        ) : (
                          fields.map((field: any) => (
                            <SelectItem key={field._id || field.id} value={field._id || field.id}>
                              {field.name || field.title}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <p className="text-xs text-gray-500">
                    Select the class (field) for the student invitation. This is required for school organizations.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message (Optional)</label>
                  <textarea
                    value={invitationData.message}
                    onChange={(e) => setInvitationData({...invitationData, message: e.target.value})}
                    placeholder="Welcome message for invited users"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description (Optional)</label>
                  <Input
                    value={invitationData.description}
                    onChange={(e) => setInvitationData({...invitationData, description: e.target.value})}
                    placeholder="Brief description of the invitation"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiration (Days)</label>
                  <Input
                    type="number"
                    value={invitationData.expiresInDays}
                    onChange={(e) => setInvitationData({...invitationData, expiresInDays: parseInt(e.target.value)})}
                    min="1"
                    max="365"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Max Uses</label>
                  <Input
                    type="number"
                    value={invitationData.maxUses}
                    onChange={(e) => setInvitationData({...invitationData, maxUses: parseInt(e.target.value)})}
                    min="1"
                    max="1000"
                  />
                </div>
              </div>

              <Button
                onClick={handleCreateInvitation}
                disabled={creatingInvitation}
                className="w-full"
              >
                {creatingInvitation ? 'Creating...' : `Create ${invitationRole} Invitation`}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Invitation Display */}
          {generatedInvitation && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Invitation Created Successfully!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                  <p className="text-sm font-medium text-gray-600 mb-2">Invitation URL:</p>
                  <div className="flex items-center gap-2">
                    <Input
                      value={generatedInvitation.invitationUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => copyToClipboard(generatedInvitation.invitationUrl)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Role:</span> {generatedInvitation.role}
                  </div>
                  <div>
                    <span className="font-medium">Max Uses:</span> {generatedInvitation.maxUses}
                  </div>
                  <div>
                    <span className="font-medium">Expires:</span> {new Date(generatedInvitation.expiresAt).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Status:</span> <Badge variant="outline">{generatedInvitation.status}</Badge>
                  </div>
                </div>
                <Button
                  onClick={() => setGeneratedInvitation(null)}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Invitations List */}
          <Card>
            <CardHeader>
              <CardTitle>All Invitations</CardTitle>
              <CardDescription>
                Manage existing invitations and view their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No invitations found. Create your first invitation above.
                  </div>
                ) : (
                  invitations.map((invitation) => (
                    <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className={getRoleColor(invitation.role)}>
                            {invitation.role}
                          </Badge>
                          <Badge variant={invitation.status === 'active' ? 'default' : 'secondary'}>
                            {invitation.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendInvitation(invitation.id)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Get URL
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRevokeInvitation(invitation.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Revoke
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Created:</span> {new Date(invitation.createdAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {new Date(invitation.expiresAt).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Uses:</span> {invitation.currentUses} / {invitation.maxUses}
                        </div>
                        <div>
                          <span className="font-medium">Remaining:</span> {invitation.remainingUses}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(rolePermissions).map(([role, permissions]) => (
              <Card key={role}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="capitalize">{role}</span>
                    <Badge className={getRoleColor(role)}>
                      {mockUsers.filter(u => u.role === role).length} users
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Manage permissions for {role} role
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {permissions.map((permission) => (
                    <div key={permission} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{permission.replace('_', ' ')}</span>
                      <Switch defaultChecked />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Role
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Permission Management</CardTitle>
              <CardDescription>
                Configure granular permissions for different user roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {availablePermissions.map((permission) => (
                  <div key={permission.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{permission.name}</h4>
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configure
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.keys(rolePermissions).map((role) => (
                        <div key={role} className="flex items-center justify-between">
                          <span className="text-sm capitalize">{role}</span>
                          <Switch 
                            defaultChecked={rolePermissions[role].includes(permission.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sso" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  SSO Configuration
                </CardTitle>
                <CardDescription>
                  Configure single sign-on integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">SSO Provider</label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select SSO provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="saml">SAML 2.0</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                      <SelectItem value="openid">OpenID Connect</SelectItem>
                      <SelectItem value="ldap">LDAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entity ID</label>
                  <Input placeholder="https://your-sso-provider.com/entity" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">SSO URL</label>
                  <Input placeholder="https://your-sso-provider.com/sso" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">X.509 Certificate</label>
                  <textarea 
                    className="w-full h-24 p-2 border rounded-md text-sm"
                    placeholder="Paste your X.509 certificate here..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch />
                  <label className="text-sm">Enable automatic user provisioning</label>
                </div>
                <Button className="w-full">
                  Save SSO Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SSO Status</CardTitle>
                <CardDescription>
                  Current SSO integration status and statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="font-medium">SSO Status</span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total SSO Users</span>
                    <span className="font-medium">{mockUsers.filter(u => u.ssoEnabled).length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Sync</span>
                    <span className="font-medium">2 minutes ago</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sync Status</span>
                    <Badge variant="outline">Successful</Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Test SSO Connection
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Sync Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}