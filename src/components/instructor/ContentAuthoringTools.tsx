import React, { useState } from 'react';
import { 
  Palette, 
  Type, 
  Image, 
  Video, 
  Mic, 
  FileText, 
  Code, 
  Layers, 
  Move, 
  RotateCcw, 
  Save, 
  Eye, 
  Play, 
  Pause, 
  Volume2, 
  Upload, 
  Download, 
  Share, 
  Copy, 
  Trash2, 
  Plus, 
  Edit, 
  Settings, 
  Zap, 
  MousePointer, 
  Square, 
  Circle, 
  Triangle, 
  Star, 
  Heart, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Grid, 
  List, 
  MoreHorizontal,
  GitBranch,
  Users,
  Clock,
  MessageSquare,
  Target,
  BookOpen,
  Puzzle,
  Gamepad2,
  BarChart3,
  Activity,
  Shuffle
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';

interface ContentAuthoringToolsProps {
  user: any;
}

export function ContentAuthoringTools({ user }: ContentAuthoringToolsProps) {
  const { t, isRTL } = useLanguage();
  const [selectedTool, setSelectedTool] = useState('editor');
  const [currentProject, setCurrentProject] = useState(null);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showCollaborationDialog, setShowCollaborationDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [contentElements, setContentElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch content projects and lessons
  React.useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          return;
        }

        // Fetch lessons/content for the instructor
        // Note: getLessons expects courseId, so we'll fetch all lessons
        // TODO: Update API to support instructorId filter
        const lessonsResponse = await api.lesson.getLessons('');
        
        if (lessonsResponse && Array.isArray(lessonsResponse) && lessonsResponse.length > 0) {
          // Transform lessons to projects format
          const transformedProjects = lessonsResponse.map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title,
            type: lesson.type || 'lesson',
            lastModified: lesson.updatedAt || lesson.createdAt,
            status: lesson.isPublished ? 'published' : 'draft',
            collaborators: [], // TODO: Fetch from collaboration API
            version: '1.0', // TODO: Get from version history
            elements: lesson.content?.length || 0,
            duration: `${lesson.duration || 0} min`
          }));
          setProjects(transformedProjects);
        } else {
          setProjects([]);
        }

      } catch (error: any) {
        console.error('Error fetching content:', error);
        setProjects([]);
        toast.error(error?.message || 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id || user?._id) {
      fetchContent();
    }
  }, [user?.id, user?._id]);

  // AI Content Generation Functions
  const handleGenerateContent = async (type: string, prompt: string) => {
    try {
      setIsGenerating(true);
      
      let response;
      switch (type) {
        case 'analyze':
          response = await api.ai.analyzeContent({
            content: prompt,
            type: 'lesson'
          });
          break;
        case 'recreate':
          response = await api.ai.recreateContent({
            content: prompt,
            style: 'educational',
            level: 'intermediate'
          });
          break;
        case 'teaching-plan':
          response = await api.ai.generateTeachingPlan({
            topic: prompt,
            duration: '45 minutes',
            level: 'intermediate'
          });
          break;
        default:
          throw new Error('Invalid content type');
      }
      
      if (response) {
        setGeneratedContent(response);
        toast.success('Content generated successfully!');
      } else {
        throw new Error('Failed to generate content');
      }
    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error(error?.message || 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  // Mock data removed - now using API data from state

  // Mock data for interactive templates
  const interactiveTemplates = [
    {
      id: 1,
      name: 'Drag & Drop',
      description: 'Students drag items to correct categories',
      icon: MousePointer,
      category: 'sorting',
      difficulty: 'easy'
    },
    {
      id: 2,
      name: 'Multiple Choice Quiz',
      description: 'Interactive quiz with immediate feedback',
      icon: Target,
      category: 'assessment',
      difficulty: 'easy'
    },
    {
      id: 3,
      name: 'Timeline Builder',
      description: 'Students arrange events in chronological order',
      icon: Clock,
      category: 'sequencing',
      difficulty: 'medium'
    },
    {
      id: 4,
      name: 'Physics Simulation',
      description: 'Interactive physics experiments and simulations',
      icon: Activity,
      category: 'simulation',
      difficulty: 'hard'
    },
    {
      id: 5,
      name: 'Word Puzzle',
      description: 'Crosswords, word searches, and vocabulary games',
      icon: Puzzle,
      category: 'games',
      difficulty: 'medium'
    },
    {
      id: 6,
      name: 'Data Visualization',
      description: 'Interactive charts and graphs',
      icon: BarChart3,
      category: 'visualization',
      difficulty: 'medium'
    }
  ];

  // Mock data for version history
  const versionHistory = [
    {
      version: '2.0',
      date: '2024-02-10T15:30:00Z',
      author: 'Prof. Smith',
      changes: 'Added interactive elements and improved layout',
      status: 'current'
    },
    {
      version: '1.5',
      date: '2024-02-08T10:15:00Z',
      author: 'Dr. Johnson',
      changes: 'Updated content and fixed responsive issues',
      status: 'archived'
    },
    {
      version: '1.2',
      date: '2024-02-05T14:20:00Z',
      author: 'Prof. Smith',
      changes: 'Initial content creation and basic styling',
      status: 'archived'
    }
  ];

  const collaborators = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      avatar: 'SJ',
      role: 'Co-Author',
      status: 'online',
      permissions: ['edit', 'comment', 'share']
    },
    {
      id: 2,
      name: 'Ms. Emily Wilson',
      avatar: 'EW',
      role: 'Reviewer',
      status: 'offline',
      permissions: ['comment', 'view']
    },
    {
      id: 3,
      name: 'Prof. Mike Chen',
      avatar: 'MC',
      role: 'Contributor',
      status: 'online',
      permissions: ['edit', 'comment']
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const ContentEditor = () => (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-screen">
      {/* Tool Palette */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Content Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Basic Elements</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Type className="h-4 w-4" />
                  Text
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Image className="h-4 w-4" />
                  Image
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Video className="h-4 w-4" />
                  Video
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mic className="h-4 w-4" />
                  Audio
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Interactive Elements</h4>
              <div className="space-y-2">
                {interactiveTemplates.slice(0, 4).map((template) => {
                  const Icon = template.icon;
                  return (
                    <Button 
                      key={template.id} 
                      variant="outline" 
                      size="sm" 
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {template.name}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Shapes</h4>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  <Square className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Circle className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Triangle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Canvas */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Canvas</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewMode('smartphone')}>
                <Smartphone className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode('tablet')}>
                <Tablet className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setPreviewMode('desktop')}>
                <Monitor className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`relative border-2 border-dashed border-gray-200 rounded-lg ${
            previewMode === 'smartphone' ? 'w-80 h-[600px]' :
            previewMode === 'tablet' ? 'w-[600px] h-[800px]' :
            'w-full h-[600px]'
          } mx-auto bg-white overflow-hidden`}>
            {/* Canvas content would go here */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Layers className="h-12 w-12 mx-auto mb-4" />
                <p>Drag elements here to start creating</p>
              </div>
            </div>
            
            {/* Mock content elements */}
            {contentElements.map((element) => (
              <div
                key={element.id}
                className="absolute border-2 border-teal-400 rounded p-2 bg-white cursor-move"
                style={{ 
                  left: element.position.x, 
                  top: element.position.y,
                  transform: previewMode === 'smartphone' ? 'scale(0.7)' : 'scale(1)'
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium">{element.title}</span>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </div>
                {element.type === 'text' && (
                  <div className="text-sm">{element.content}</div>
                )}
                {element.type === 'video' && (
                  <div className="w-32 h-20 bg-gray-100 rounded flex items-center justify-center">
                    <Play className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                {element.type === 'interactive' && (
                  <div className="w-40 h-16 bg-teal-50 rounded flex items-center justify-center">
                    <Gamepad2 className="h-6 w-6 text-teal-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Properties Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="text-lg">Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Element Type</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select element" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="interactive">Interactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Position</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input placeholder="X" type="number" />
                <Input placeholder="Y" type="number" />
              </div>
            </div>

            <div>
              <Label>Size</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <Input placeholder="Width" type="number" />
                <Input placeholder="Height" type="number" />
              </div>
            </div>

            <div>
              <Label>Opacity</Label>
              <Slider defaultValue={[100]} max={100} step={1} className="mt-2" />
            </div>

            <div>
              <Label>Background Color</Label>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-8 h-8 bg-teal-500 rounded border"></div>
                <Input placeholder="#14b8a6" />
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Animation</h4>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select animation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="fade">Fade In</SelectItem>
                  <SelectItem value="slide">Slide In</SelectItem>
                  <SelectItem value="bounce">Bounce</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const InteractiveBuilder = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Interactive Element Builder</h2>
          <p className="text-gray-600">Create engaging interactive activities and simulations</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Custom Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {interactiveTemplates.map((template) => {
          const Icon = template.icon;
          return (
            <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-teal-100 rounded-lg">
                    <Icon className="h-6 w-6 text-teal-600" />
                  </div>
                  <Badge className={getDifficultyColor(template.difficulty)}>
                    {template.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline" className="capitalize">
                    {template.category}
                  </Badge>
                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom Interactive Elements</CardTitle>
          <CardDescription>
            Build your own interactive components with advanced scripting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label>JavaScript Code</Label>
              <Textarea 
                className="mt-1 h-40 font-mono text-sm" 
                placeholder="// Write your interactive code here..."
              />
            </div>
            <div>
              <Label>CSS Styling</Label>
              <Textarea 
                className="mt-1 h-40 font-mono text-sm" 
                placeholder="/* Add custom styles here... */"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" className="gap-2">
              <Play className="h-4 w-4" />
              Test
            </Button>
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const VersionControl = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Version Control</h2>
          <p className="text-gray-600">Track changes and manage content versions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Create Branch
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save Version
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Version History</CardTitle>
          <CardDescription>
            View and restore previous versions of your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {versionHistory.map((version, index) => (
              <div key={version.version} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        v{version.version}
                      </span>
                    </div>
                    {version.status === 'current' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">Version {version.version}</h4>
                    <p className="text-sm text-gray-600">{version.changes}</p>
                    <p className="text-xs text-gray-500">
                      By {version.author} • {formatTime(version.date)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {version.status === 'current' ? (
                    <Badge variant="default">Current</Badge>
                  ) : (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" className="gap-2">
                        <Eye className="h-4 w-4" />
                        Preview
                      </Button>
                      <Button size="sm" className="gap-2">
                        <RotateCcw className="h-4 w-4" />
                        Restore
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compare Versions</CardTitle>
            <CardDescription>
              See what changed between different versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Version A</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versionHistory.map((version) => (
                        <SelectItem key={version.version} value={version.version}>
                          Version {version.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Version B</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {versionHistory.map((version) => (
                        <SelectItem key={version.version} value={version.version}>
                          Version {version.version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full gap-2">
                <Eye className="h-4 w-4" />
                Compare Versions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Backup & Export</CardTitle>
            <CardDescription>
              Download and backup your content versions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export HTML
                </Button>
              </div>
              <Separator />
              <div>
                <Label>Auto-backup</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Checkbox id="auto-backup" />
                  <Label htmlFor="auto-backup" className="text-sm">
                    Automatically backup every 10 minutes
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const CollaborationPanel = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Collaboration</h2>
          <p className="text-gray-600">Work together with colleagues on content creation</p>
        </div>
        <Button className="gap-2" onClick={() => setShowCollaborationDialog(true)}>
          <Users className="h-4 w-4" />
          Invite Collaborator
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Collaborators</CardTitle>
            <CardDescription>
              People currently working on this content
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {collaborators.map((collaborator) => (
                <div key={collaborator.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {collaborator.avatar}
                        </span>
                      </div>
                      {collaborator.status === 'online' && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">{collaborator.name}</h4>
                      <p className="text-sm text-gray-600">{collaborator.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={collaborator.status === 'online' ? 'default' : 'secondary'}>
                      {collaborator.status}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Settings className="h-4 w-4 mr-2" />
                          Change Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest changes and comments from your team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  user: 'Dr. Johnson',
                  action: 'added a comment',
                  target: 'Interactive Quiz',
                  time: '5 minutes ago'
                },
                {
                  user: 'Ms. Wilson',
                  action: 'edited',
                  target: 'Introduction Text',
                  time: '15 minutes ago'
                },
                {
                  user: 'Prof. Chen',
                  action: 'uploaded',
                  target: 'Physics Simulation Video',
                  time: '1 hour ago'
                }
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {activity.user.split(' ')[1][0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span> {activity.action}{' '}
                      <span className="font-medium">{activity.target}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sharing & Permissions</CardTitle>
          <CardDescription>
            Control who can access and edit your content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  value="https://cognerax.com/content/intro-calculus-v2" 
                  readOnly 
                  className="flex-1"
                />
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
            
            <div>
              <Label>Default Permission Level</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="public" />
              <Label htmlFor="public">Make this content publicly discoverable</Label>
            </div>

            <div className="flex space-x-2">
              <Button className="gap-2">
                <Share className="h-4 w-4" />
                Share Content
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
            Content Authoring Tools
          </h1>
          <p className="text-gray-600 mt-2">
            Advanced multimedia content creation with interactive elements and collaboration
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview
          </Button>
          <Button className="gap-2">
            <Save className="h-4 w-4" />
            Save & Publish
          </Button>
        </div>
      </div>

      {/* Projects Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Projects</CardTitle>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium">{project.title}</h3>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>Type: {project.type}</div>
                      <div>v{project.version}</div>
                      <div>{project.elements} elements</div>
                      <div>{project.duration}</div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {project.collaborators.length} collaborators
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={selectedTool} onValueChange={setSelectedTool} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="editor">Visual Editor</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Builder</TabsTrigger>
          <TabsTrigger value="versions">Version Control</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <ContentEditor />
        </TabsContent>

        <TabsContent value="interactive">
          <InteractiveBuilder />
        </TabsContent>

        <TabsContent value="versions">
          <VersionControl />
        </TabsContent>

        <TabsContent value="collaboration">
          <CollaborationPanel />
        </TabsContent>
      </Tabs>

      {/* Collaboration Dialog */}
      <Dialog open={showCollaborationDialog} onOpenChange={setShowCollaborationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Collaborator</DialogTitle>
            <DialogDescription>
              Add team members to work on this content together
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Email Address</Label>
              <Input placeholder="Enter email address..." className="mt-1" />
            </div>
            
            <div>
              <Label>Permission Level</Label>
              <Select>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="admin">Full Access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Message (optional)</Label>
              <Textarea 
                placeholder="Add a personal message..." 
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button variant="outline" onClick={() => setShowCollaborationDialog(false)}>
              Cancel
            </Button>
            <Button>
              Send Invitation
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}