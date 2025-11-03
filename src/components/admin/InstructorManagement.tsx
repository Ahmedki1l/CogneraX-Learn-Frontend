import React, { useState, useEffect } from 'react';
import { 
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  UserPlus,
  X,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Plus,
  Loader2,
  Info
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Save } from 'lucide-react';

interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  permissions: string[];
  assignedFields: string[];
  assignedCourses: string[];
  status: 'active' | 'inactive' | 'suspended';
}

interface Field {
  id?: string;
  _id?: string;
  name: string;
  description: string;
  icon?: string;
}

interface Course {
  id: string;
  title: string;
  field?: string;
}

export function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [fields, setFields] = useState<Field[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [activeTab, setActiveTab] = useState('fields');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Field assignment state
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showFieldAssignDialog, setShowFieldAssignDialog] = useState(false);

  // Course assignment state
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [showCourseAssignDialog, setShowCourseAssignDialog] = useState(false);

  // Permissions state
  const [permissions, setPermissions] = useState<string[]>([]);

  // Fetch instructors
  useEffect(() => {
    fetchInstructors();
    fetchFields();
    fetchCourses();
  }, []);

  const fetchInstructors = async () => {
    setLoading(true);
    try {
      const response = await api.user.getUsers({ role: 'instructor' });
      if (response && Array.isArray(response)) {
        setInstructors(response);
      }
    } catch (error) {
      console.error('Failed to fetch instructors:', error);
      toast.error('Failed to load instructors');
    } finally {
      setLoading(false);
    }
  };

  const fetchFields = async () => {
    try {
      const response = await api.field.getFields();
      if (response) {
        setFields(response);
      }
    } catch (error) {
      console.error('Failed to fetch fields:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.course.getCourses();
      if (response) {
        setCourses(response);
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleSelectInstructor = (instructor: Instructor) => {
    setSelectedInstructor(instructor);
    setSelectedFields(instructor.assignedFields || []);
    setPermissions(instructor.permissions || []);
    // TODO: Fetch assigned courses for this instructor once backend is ready
  };

  const handleAssignToFields = async () => {
    if (!selectedInstructor || selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    try {
      // Assign instructor to each selected field
      for (const fieldId of selectedFields) {
        await api.field.assignInstructorsToField(fieldId, [selectedInstructor.id]);
      }

      toast.success(`Instructor assigned to ${selectedFields.length} field(s)`);
      setShowFieldAssignDialog(false);
      setSelectedFields([]);
      fetchInstructors();
    } catch (error: any) {
      console.error('Failed to assign instructor:', error);
      toast.error(error?.message || 'Failed to assign instructor to fields');
    }
  };

  const handleRemoveFromFields = async (fieldId: string) => {
    if (!selectedInstructor) return;

    if (!confirm('Are you sure you want to remove this instructor from this field?')) {
      return;
    }

    try {
      await api.field.removeInstructorsFromField(fieldId, [selectedInstructor.id]);
      toast.success('Instructor removed from field');
      fetchInstructors();
      if (selectedInstructor) {
        handleSelectInstructor({ ...selectedInstructor, assignedFields: selectedInstructor.assignedFields.filter(id => id !== fieldId) });
      }
    } catch (error: any) {
      console.error('Failed to remove instructor:', error);
      toast.error(error?.message || 'Failed to remove instructor from field');
    }
  };

  const handleAssignToCourses = async () => {
    if (!selectedInstructor || selectedCourses.length === 0) {
      toast.error('Please select at least one course');
      return;
    }

    // TODO: Once backend is implemented, use api.course.assignInstructors
    toast.warning('⚠️ Backend implementation pending: Course-level instructor assignment');
    
    // For now, just show a warning
    // try {
    //   for (const courseId of selectedCourses) {
    //     await api.course.assignInstructors(courseId, [selectedInstructor.id]);
    //   }
    //   toast.success(`Instructor assigned to ${selectedCourses.length} course(s)`);
    //   setShowCourseAssignDialog(false);
    //   setSelectedCourses([]);
    //   fetchInstructors();
    // } catch (error: any) {
    //   console.error('Failed to assign instructor:', error);
    //   toast.error(error?.message || 'Failed to assign instructor to courses');
    // }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedInstructor) return;

    try {
      await api.user.updateUserPermissions(selectedInstructor.id, permissions);
      toast.success('Permissions updated successfully');
      fetchInstructors();
      if (selectedInstructor) {
        handleSelectInstructor({ ...selectedInstructor, permissions });
      }
    } catch (error: any) {
      console.error('Failed to update permissions:', error);
      toast.error(error?.message || 'Failed to update permissions');
    }
  };

  const filteredInstructors = instructors.filter(instructor => {
    const matchesSearch = instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || instructor.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instructor Management</h1>
          <p className="text-gray-600 mt-1">
            Assign instructors to fields or courses and manage permissions
          </p>
        </div>
      </div>

      {/* Alert for course assignment */}
      {activeTab === 'courses' && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-800">Backend Implementation Pending</AlertTitle>
          <AlertDescription className="text-yellow-700">
            Course-level instructor assignment requires backend implementation. Please refer to BACKEND_REQUIREMENTS_INSTRUCTOR_PERMISSIONS.md
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Instructor List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Instructors</CardTitle>
                <Badge variant="outline">{filteredInstructors.length}</Badge>
              </div>
              <CardDescription>Select an instructor to manage</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="space-y-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search instructors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Instructor List */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredInstructors.map((instructor) => (
                  <div
                    key={instructor.id}
                    onClick={() => handleSelectInstructor(instructor)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedInstructor?.id === instructor.id
                        ? 'bg-teal-50 border-2 border-teal-500'
                        : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={instructor.avatar} />
                        <AvatarFallback className="bg-teal-100 text-teal-600">
                          {instructor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {instructor.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{instructor.email}</p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={
                          instructor.status === 'active' ? 'bg-green-100 text-green-800' :
                          instructor.status === 'suspended' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {instructor.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel - Assignment Management */}
        <div className="lg:col-span-2">
          {selectedInstructor ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={selectedInstructor.avatar} />
                        <AvatarFallback className="bg-teal-100 text-teal-600">
                          {selectedInstructor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-xl font-semibold">{selectedInstructor.name}</h2>
                        <p className="text-sm text-gray-500">{selectedInstructor.email}</p>
                      </div>
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="fields" className="flex items-center">
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Fields
                    </TabsTrigger>
                    <TabsTrigger value="courses" className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Courses
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="flex items-center">
                      <Shield className="h-4 w-4 mr-2" />
                      Permissions
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="fields" className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Field Assignments</h3>
                        <p className="text-sm text-gray-500">
                          Assign instructor to fields for full access to all courses
                        </p>
                      </div>
                      <Button onClick={() => setShowFieldAssignDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Assign to Field
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fields.filter(field => selectedFields.includes(field.id || field._id || '')).map((field) => {
                        const fieldId = field.id || field._id || '';
                        return (
                          <Card key={fieldId} className="border-teal-200 bg-teal-50">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="text-2xl">{field.icon}</div>
                                  <div>
                                    <h4 className="font-semibold text-gray-900">{field.name}</h4>
                                    <p className="text-sm text-gray-600">{field.description}</p>
                                    <Badge variant="outline" className="mt-1 bg-green-100 text-green-800">
                                      Full Access
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveFromFields(fieldId)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                      {selectedFields.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-2">No field assignments</p>
                          <p className="text-sm text-gray-500 mb-4">
                            Assign this instructor to a field to grant full access to all courses in that field
                          </p>
                          <Button onClick={() => setShowFieldAssignDialog(true)} variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Assign to Field
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="courses" className="space-y-4 mt-6">
                    <Alert className="bg-yellow-50 border-yellow-200 mb-4">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <AlertTitle className="text-yellow-800">Course Assignment</AlertTitle>
                      <AlertDescription className="text-yellow-700 text-sm">
                        When backend is implemented, instructors assigned to specific courses will have limited permissions (Update & Delete only, no Create)
                      </AlertDescription>
                    </Alert>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">Course Assignments</h3>
                        <p className="text-sm text-gray-500">
                          Assign instructor to specific courses for limited access
                        </p>
                      </div>
                      <Button 
                        onClick={() => {
                          toast.warning('Backend implementation pending');
                          // setShowCourseAssignDialog(true);
                        }}
                        variant="outline"
                        disabled
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Assign to Course
                      </Button>
                    </div>

                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Backend Implementation Required</p>
                      <p className="text-sm text-gray-500">
                        Course-level assignment feature will be available once backend APIs are implemented
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-4 mt-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Permission Management</h3>
                      <p className="text-sm text-gray-500">
                        Grant or revoke specific permissions for this instructor
                      </p>
                    </div>

                    <div className="space-y-4">
                      {[
                        { id: 'create_course', label: 'Create Courses', description: 'Allow instructor to create new courses' },
                        { id: 'update_course', label: 'Update Courses', description: 'Allow instructor to edit existing courses' },
                        { id: 'delete_course', label: 'Delete Courses', description: 'Allow instructor to delete courses' },
                        { id: 'view_analytics', label: 'View Analytics', description: 'Allow instructor to view course and student analytics' }
                      ].map((perm) => (
                        <Card key={perm.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <Label htmlFor={perm.id} className="flex items-center cursor-pointer">
                                  <div className="font-semibold text-gray-900">{perm.label}</div>
                                  {perm.id === 'create_course' && (
                                    <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800">
                                      Field Required
                                    </Badge>
                                  )}
                                </Label>
                                <p className="text-sm text-gray-500 mt-1">{perm.description}</p>
                              </div>
                              <Switch
                                id={perm.id}
                                checked={permissions.includes(perm.id)}
                                onCheckedChange={(checked: boolean) => {
                                  if (checked) {
                                    setPermissions([...permissions, perm.id]);
                                  } else {
                                    setPermissions(permissions.filter(p => p !== perm.id));
                                  }
                                }}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                      <Button variant="outline" onClick={() => setPermissions(selectedInstructor.permissions || [])}>
                        Cancel
                      </Button>
                      <Button onClick={handleUpdatePermissions} className="bg-teal-600 hover:bg-teal-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Permissions
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-900 mb-2">No Instructor Selected</p>
                <p className="text-gray-600">
                  Select an instructor from the list to manage their assignments and permissions
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Field Assignment Dialog */}
      <Dialog open={showFieldAssignDialog} onOpenChange={setShowFieldAssignDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Assign Instructor to Fields</DialogTitle>
            <DialogDescription>
              Select one or more fields. Instructor will have full access to all courses in selected fields.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {fields.map((field) => {
              const fieldId = field.id || field._id || '';
              return (
                <div key={fieldId} className="flex items-center space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id={fieldId}
                    checked={selectedFields.includes(fieldId)}
                    onCheckedChange={(checked: boolean) => {
                      if (checked) {
                        setSelectedFields([...selectedFields, fieldId]);
                      } else {
                        setSelectedFields(selectedFields.filter(id => id !== fieldId));
                      }
                    }}
                  />
                  <Label htmlFor={fieldId} className="flex-1 cursor-pointer">
                    <div className="font-semibold flex items-center">
                      <span className="mr-2">{field.icon}</span>
                      {field.name}
                    </div>
                    <p className="text-sm text-gray-500">{field.description}</p>
                  </Label>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFieldAssignDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignToFields} className="bg-teal-600 hover:bg-teal-700">
              Assign to {selectedFields.length} Field(s)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

