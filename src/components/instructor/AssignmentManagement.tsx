import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Users, 
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useLanguage } from '../context/LanguageContext';

interface AssignmentManagementProps {
  user?: any;
}

export function AssignmentManagement({ user }: AssignmentManagementProps) {
  const { t, isRTL } = useLanguage();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  
  // New assignment form state
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    maxPoints: 100,
    type: 'essay'
  });

  // Fetch assignments and courses
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id && !user?._id) return;
      
      try {
        setLoading(true);
        const userId = user.id || user._id;
        
        // Fetch courses for dropdown
        const coursesData = await api.instructor.getAccessibleCourses(userId);
        const accessibleCourses = coursesData?.fields 
          ? coursesData.fields.flatMap((f: any) => f.courses || [])
          : (coursesData?.data || []);
        setCourses(accessibleCourses);

        // Fetch existing assignments
        const assignmentsData = await api.assignment.getAssignments({ instructorId: userId });
        if (assignmentsData && Array.isArray(assignmentsData)) {
          setAssignments(assignmentsData);
        } else {
          setAssignments([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error(t('common.error'));
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user, t]);

  const handleCreateAssignment = async () => {
    try {
      if (!newAssignment.title || !newAssignment.courseId || !newAssignment.dueDate) {
        toast.error(t('assignments.error.fillAll'));
        return;
      }
      
      await api.assignment.createAssignment({
        ...newAssignment,
        type: newAssignment.type as 'essay' | 'project' | 'presentation' | 'other'
      });
      
      toast.success(t('assignments.success.created'));
      setShowCreateDialog(false);
      
      // Refresh list
      const userId = user?.id || user?._id;
      if (userId) {
        const updated = await api.assignment.getAssignments({ instructorId: userId });
        setAssignments(updated || []);
      }
      
      // Reset form
      setNewAssignment({
        title: '',
        description: '',
        courseId: '',
        dueDate: '',
        maxPoints: 100,
        type: 'essay'
      });
    } catch (error: any) {
      console.error('Error creating assignment:', error);
      toast.error(error?.message || t('error.somethingWentWrong'));
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm(t('assignments.deleteConfirm'))) return;
    
    try {
      await api.assignment.deleteAssignment(id);
      setAssignments(prev => prev.filter(a => a.id !== id && a._id !== id));
      toast.success(t('assignments.deleteSuccess'));
    } catch (error) {
      toast.error(t('error.somethingWentWrong'));
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && assignment.isPublished) ||
      (statusFilter === 'draft' && !assignment.isPublished);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('assignments.managementTitle')}</h1>
          <p className="text-gray-600 mt-1">{t('assignments.managementSubtitle')}</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-gradient-to-r from-teal-500 to-purple-600 text-white gap-2"
        >
          <Plus className="h-4 w-4" />
          {t('assignments.createAssignment')}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className={`absolute top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input 
            placeholder={t('assignments.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t('assignments.filterStatus')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('assignments.allStatus')}</SelectItem>
            <SelectItem value="published">{t('assignments.published')}</SelectItem>
            <SelectItem value="draft">{t('assignments.draft')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">{t('common.loading')}</div>
      ) : filteredAssignments.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900">{t('assignments.noAssignmentsFound')}</h3>
          <p className="text-gray-500">{t('assignments.createFirst')}</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredAssignments.map((assignment: any) => (
            <Card key={assignment.id || assignment._id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{assignment.title}</h3>
                    <p className="text-sm text-gray-500">{assignment.course?.title || t('common.unknown')}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 rtl:space-x-reverse">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {t('assignments.due')} {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {assignment.submissionsCount || 0} {t('assignments.submissions')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={assignment.isPublished ? 'default' : 'secondary'}>
                    {assignment.isPublished ? t('assignments.published') : t('assignments.draft')}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600"
                    onClick={() => handleDeleteAssignment(assignment.id || assignment._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('assignments.createTitle')}</DialogTitle>
            <DialogDescription>{t('assignments.createDesc')}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label>{t('assignments.form.title')}</Label>
              <Input 
                value={newAssignment.title}
                onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                placeholder="e.g. Final Project Proposal"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('assignments.form.course')}</Label>
                <Select 
                  value={newAssignment.courseId} 
                  onValueChange={(v: string) => setNewAssignment({...newAssignment, courseId: v})}

                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('assignments.form.selectCourse')} />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id || c._id} value={c.id || c._id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label>{t('assignments.form.type')}</Label>
                <Select 
                  value={newAssignment.type} 
                  onValueChange={(v: string) => setNewAssignment({...newAssignment, type: v})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essay">Essay</SelectItem>
                    <SelectItem value="project">Project</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t('assignments.form.dueDate')}</Label>
                <Input 
                  type="datetime-local"
                  value={newAssignment.dueDate}
                  onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label>{t('assignments.form.maxPoints')}</Label>
                <Input 
                  type="number"
                  value={newAssignment.maxPoints}
                  onChange={(e) => setNewAssignment({...newAssignment, maxPoints: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>{t('assignments.form.description')}</Label>
              <Textarea 
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                placeholder={t('assignments.form.instructions')}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>{t('assignments.cancel')}</Button>
            <Button onClick={handleCreateAssignment}>{t('assignments.createAssignment')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
