import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Video, 
  Image, 
  Link, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical,
  X,
  Save,
  ExternalLink,
  Calendar,
  User,
  File,
  Folder,
  Globe,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Progress } from '../ui/progress';

interface ResourceManagerProps {
  isOpen: boolean;
  onClose: () => void;
  courseId?: string;
  initialResources?: any[];
  onResourcesUpdate?: (resources: any[]) => void;
}

export function ResourceManager({ 
  isOpen, 
  onClose, 
  courseId, 
  initialResources = [], 
  onResourcesUpdate 
}: ResourceManagerProps) {
  const [resources, setResources] = useState(initialResources);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [showAddResource, setShowAddResource] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document',
    url: '',
    file: null,
    isPublic: true,
    category: '',
    tags: [],
    accessLevel: 'all'
  });

  if (!isOpen) return null;

  // Mock resources for demonstration
  const mockResources = [
    {
      id: 1,
      title: 'Course Introduction Video',
      description: 'Overview of what students will learn',
      type: 'video',
      url: '/videos/intro.mp4',
      size: '45.2 MB',
      uploadedAt: '2024-03-15',
      uploadedBy: 'Dr. Sarah Johnson',
      downloads: 234,
      isPublic: true,
      category: 'lectures',
      tags: ['introduction', 'overview'],
      accessLevel: 'all'
    },
    {
      id: 2,
      title: 'JavaScript Fundamentals Guide',
      description: 'Comprehensive guide covering JS basics',
      type: 'document',
      url: '/docs/js-fundamentals.pdf',
      size: '2.1 MB',
      uploadedAt: '2024-03-14',
      uploadedBy: 'Dr. Sarah Johnson',
      downloads: 156,
      isPublic: true,
      category: 'readings',
      tags: ['javascript', 'fundamentals'],
      accessLevel: 'enrolled'
    },
    {
      id: 3,
      title: 'Practice Exercises',
      description: 'Coding exercises for hands-on practice',
      type: 'link',
      url: 'https://codepen.io/collection/practice',
      uploadedAt: '2024-03-13',
      uploadedBy: 'Dr. Sarah Johnson',
      downloads: 89,
      isPublic: false,
      category: 'exercises',
      tags: ['practice', 'coding'],
      accessLevel: 'enrolled'
    }
  ];

  const allResources = [...mockResources, ...resources];

  const resourceTypes = [
    { value: 'all', label: 'All Types', icon: File },
    { value: 'document', label: 'Documents', icon: FileText },
    { value: 'video', label: 'Videos', icon: Video },
    { value: 'image', label: 'Images', icon: Image },
    { value: 'link', label: 'Links', icon: Link }
  ];

  const filteredResources = allResources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || resource.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (file: File, resourceData: any) => {
    const uploadId = Date.now().toString();
    setUploadProgress(prev => ({ ...prev, [uploadId]: 0 }));

    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(prev => ({ ...prev, [uploadId]: i }));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const newResourceWithFile = {
      ...resourceData,
      id: Date.now(),
      file: file,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: 'Current User',
      downloads: 0,
      url: URL.createObjectURL(file)
    };

    setResources(prev => [...prev, newResourceWithFile]);
    setUploadProgress(prev => {
      const { [uploadId]: removed, ...rest } = prev;
      return rest;
    });

    toast.success('Resource uploaded successfully!');
    return newResourceWithFile;
  };

  const handleAddResource = async () => {
    try {
      let finalResource = { ...newResource };

      if (newResource.file) {
        finalResource = await handleFileUpload(newResource.file, newResource);
      } else {
        finalResource = {
          ...newResource,
          id: Date.now(),
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: 'Current User',
          downloads: 0
        };
        setResources(prev => [...prev, finalResource]);
        toast.success('Resource added successfully!');
      }

      // Reset form
      setNewResource({
        title: '',
        description: '',
        type: 'document',
        url: '',
        file: null,
        isPublic: true,
        category: '',
        tags: [],
        accessLevel: 'all'
      });
      
      setShowAddResource(false);
      onResourcesUpdate?.(resources);
    } catch (error) {
      toast.error('Failed to add resource');
    }
  };

  const handleDeleteResource = (resourceId: number) => {
    setResources(prev => prev.filter(resource => resource.id !== resourceId));
    toast.success('Resource deleted successfully');
  };

  const handleDownload = (resource: any) => {
    // Simulate download
    toast.success(`Downloading ${resource.title}...`);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'link': return Link;
      default: return FileText;
    }
  };

  const getResourceBadgeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'image': return 'bg-green-100 text-green-800';
      case 'link': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Resource Manager</h2>
            <p className="text-gray-600 mt-1">
              Manage course materials, documents, and media files
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6">
          {/* Header Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {resourceTypes.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center">
                        <type.icon className="h-4 w-4 mr-2" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={() => setShowAddResource(true)}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>

          {/* Resources Grid */}
          <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm truncate">{resource.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {resource.description}
                            </CardDescription>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDownload(resource)}>
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setEditingResource(resource)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {resource.type === 'link' && (
                              <DropdownMenuItem onClick={() => window.open(resource.url, '_blank')}>
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Open Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-3">
                        <Badge className={getResourceBadgeColor(resource.type)}>
                          {resource.type}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500">
                          {resource.isPublic ? (
                            <Globe className="h-3 w-3 mr-1" />
                          ) : (
                            <Lock className="h-3 w-3 mr-1" />
                          )}
                          {resource.isPublic ? 'Public' : 'Private'}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-xs text-gray-600">
                        {resource.size && (
                          <div className="flex items-center justify-between">
                            <span>Size:</span>
                            <span>{resource.size}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span>Uploaded:</span>
                          <span>{resource.uploadedAt}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Downloads:</span>
                          <span>{resource.downloads}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => handleDownload(resource)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setEditingResource(resource)}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <File className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Get started by adding your first resource.'
                  }
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Resource Dialog */}
        <Dialog open={showAddResource} onOpenChange={setShowAddResource}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                  <TabsTrigger value="link">Add Link</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 mb-2">Drag and drop or click to upload</p>
                      <input
                        type="file"
                        className="hidden"
                        id="file-upload"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setNewResource(prev => ({ 
                              ...prev, 
                              file, 
                              title: prev.title || file.name.split('.')[0],
                              type: file.type.startsWith('video/') ? 'video' : 
                                    file.type.startsWith('image/') ? 'image' : 'document'
                            }));
                          }
                        }}
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Button type="button" variant="outline">
                          Choose File
                        </Button>
                      </label>
                      {newResource.file && (
                        <p className="text-sm text-green-600 mt-2">
                          Selected: {newResource.file.name}
                        </p>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="link" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL
                    </label>
                    <Input
                      value={newResource.url}
                      onChange={(e) => setNewResource(prev => ({ 
                        ...prev, 
                        url: e.target.value,
                        type: 'link'
                      }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <Input
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <Select 
                    value={newResource.category} 
                    onValueChange={(value) => setNewResource(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lectures">Lectures</SelectItem>
                      <SelectItem value="readings">Readings</SelectItem>
                      <SelectItem value="exercises">Exercises</SelectItem>
                      <SelectItem value="assignments">Assignments</SelectItem>
                      <SelectItem value="supplementary">Supplementary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={newResource.description}
                  onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this resource..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Access Level
                  </label>
                  <Select 
                    value={newResource.accessLevel} 
                    onValueChange={(value) => setNewResource(prev => ({ ...prev, accessLevel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="enrolled">Enrolled Students Only</SelectItem>
                      <SelectItem value="instructors">Instructors Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Public Resource
                    </label>
                    <p className="text-xs text-gray-500">
                      Visible to all users
                    </p>
                  </div>
                  <Switch
                    checked={newResource.isPublic}
                    onCheckedChange={(checked) => setNewResource(prev => ({ ...prev, isPublic: checked }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowAddResource(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddResource}
                  disabled={!newResource.title || (!newResource.file && !newResource.url)}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}