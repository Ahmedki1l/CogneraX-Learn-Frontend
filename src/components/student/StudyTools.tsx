import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { 
  BookOpen, Plus, Search, Edit3, Trash2, Star, Clock, Calendar as CalendarIcon,
  StickyNote, Brain, Bookmark, Highlighter, Archive, Filter, Tag,
  CheckSquare, Circle, AlertCircle, RefreshCw, Download, Share2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface StudyToolsProps {
  user: any;
}

interface Note {
  id: string;
  title: string;
  content: string;
  course: string;
  lesson: string;
  tags: string[];
  highlights: string[];
  bookmarks: string[];
  createdAt: Date;
  updatedAt: Date;
  starred: boolean;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  course: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastReviewed: Date;
  nextReview: Date;
  reviewCount: number;
  correctCount: number;
  tags: string[];
}

interface StudyEvent {
  id: string;
  title: string;
  description: string;
  type: 'deadline' | 'exam' | 'study-session' | 'reminder';
  course: string;
  date: Date;
  duration?: number;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
}

export const StudyTools: React.FC<StudyToolsProps> = ({ user }) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState('notes');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(false);

  // State for study tools data
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [studyEvents, setStudyEvents] = useState<StudyEvent[]>([]);
  const [studyResources, setStudyResources] = useState<any[]>([]);

  // Fetch study tools data from API
  useEffect(() => {
    const fetchStudyToolsData = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        // Fetch study resources
        const resourcesResponse = await api.user.getStudyResources();
        console.log('📚 Study resources response:', resourcesResponse);
        
        if (resourcesResponse && resourcesResponse.success && resourcesResponse.data) {
          setStudyResources(resourcesResponse.data);
        } else {
          console.warn('⚠️ No study resources or invalid response structure');
          setStudyResources([]);
        }

        // Fetch study notes
        const notesResponse = await api.user.getStudyNotes();
        console.log('📝 Study notes response:', notesResponse);
        
        if (notesResponse && notesResponse.success && notesResponse.data) {
          const formattedNotes = notesResponse.data.map((note: any) => ({
            id: note._id || note.id,
            title: note.title,
            content: note.content,
            course: note.course?.title || note.courseName || '',
            lesson: note.lesson?.title || note.lessonName || '',
            tags: note.tags || [],
            highlights: note.highlights || [],
            bookmarks: note.bookmarks || [],
            createdAt: new Date(note.createdAt),
            updatedAt: new Date(note.updatedAt),
            starred: note.starred || false
          }));
          setNotes(formattedNotes);
        } else {
          console.warn('⚠️ No study notes or invalid response structure');
          setNotes([]);
        }

      } catch (error: any) {
        console.error('Error fetching study tools data:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Study tools endpoints not implemented yet');
          setNotes([]);
          setFlashcards([]);
          setStudyEvents([]);
          setStudyResources([]);
        } else {
          toast.error('Failed to load study tools data');
          setNotes([]);
          setFlashcards([]);
          setStudyEvents([]);
          setStudyResources([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStudyToolsData();
  }, [user?.id, user?._id]);

  // Note CRUD handlers
  const handleSaveNote = async (noteData: Partial<Note>) => {
    try {
      const response = await api.user.saveStudyNote({
        title: noteData.title || '',
        content: noteData.content || '',
        courseId: noteData.course || '',
        lessonId: noteData.lesson || '',
        tags: noteData.tags || []
      });
      
      console.log('📝 Save note response:', response);
      
      if (response && response.success && response.data) {
        const newNote = {
          id: response.data._id || response.data.id,
          title: response.data.title,
          content: response.data.content,
          course: response.data.course?.title || '',
          lesson: response.data.lesson?.title || '',
          tags: response.data.tags || [],
          highlights: [],
          bookmarks: [],
          createdAt: new Date(response.data.createdAt),
          updatedAt: new Date(response.data.updatedAt),
          starred: false
        };
        setNotes([...notes, newNote]);
        toast.success('Note saved successfully!');
        return newNote;
      } else {
        console.warn('⚠️ Note save failed or invalid response');
        toast.error('Failed to save note');
        return null;
      }
    } catch (error: any) {
      console.error('Failed to save note:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Save note endpoint not implemented yet');
        toast.info('Note saving feature coming soon');
      } else {
        toast.error('Failed to save note');
      }
      return null;
    }
  };

  const handleUpdateNote = async (noteId: string, noteData: Partial<Note>) => {
    try {
      const response = await api.user.updateStudyNote(noteId, {
        title: noteData.title || '',
        content: noteData.content || '',
        tags: noteData.tags || []
      });
      
      console.log('📝 Update note response:', response);
      
      if (response && response.success) {
        setNotes(notes.map(note => 
          note.id === noteId 
            ? { ...note, ...noteData, updatedAt: new Date() }
            : note
        ));
        toast.success('Note updated successfully!');
        return true;
      } else {
        console.warn('⚠️ Note update failed or invalid response');
        toast.error('Failed to update note');
        return false;
      }
    } catch (error: any) {
      console.error('Failed to update note:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Update note endpoint not implemented yet');
        toast.info('Note updating feature coming soon');
      } else {
        toast.error('Failed to update note');
      }
      return false;
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const response = await api.user.deleteStudyNote(noteId);
      
      console.log('📝 Delete note response:', response);
      
      if (response && response.success) {
        setNotes(notes.filter(note => note.id !== noteId));
        toast.success('Note deleted successfully!');
        return true;
      } else {
        console.warn('⚠️ Note delete failed or invalid response');
        toast.error('Failed to delete note');
        return false;
      }
    } catch (error: any) {
      console.error('Failed to delete note:', error);
      
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Delete note endpoint not implemented yet');
        toast.info('Note deletion feature coming soon');
      } else {
        toast.error('Failed to delete note');
      }
      return false;
    }
  };

  // Mock data for fallback
  const mockNotes: Note[] = [
    {
      id: '1',
      title: 'React Hooks Introduction',
      content: 'React Hooks allow you to use state and other React features in functional components. The most commonly used hooks are useState and useEffect...',
      course: 'React Development',
      lesson: 'Introduction to Hooks',
      tags: ['react', 'hooks', 'state'],
      highlights: ['useState', 'useEffect'],
      bookmarks: ['Important concept'],
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15'),
      starred: true
    },
    {
      id: '2',
      title: 'Python Data Types',
      content: 'Python has several built-in data types including strings, integers, floats, lists, tuples, dictionaries, and sets...',
      course: 'Python Fundamentals',
      lesson: 'Data Types and Variables',
      tags: ['python', 'data-types', 'basics'],
      highlights: ['list', 'dictionary', 'tuple'],
      bookmarks: [],
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14'),
      starred: false
    }
  ];

  // Mock flashcards data
  const mockFlashcards: Flashcard[] = [
    {
      id: '1',
      front: 'What is useState in React?',
      back: 'useState is a Hook that lets you add React state to functional components. It returns an array with two values: the current state and a function that updates it.',
      course: 'React Development',
      topic: 'Hooks',
      difficulty: 'medium',
      lastReviewed: new Date('2024-01-14'),
      nextReview: new Date('2024-01-16'),
      reviewCount: 3,
      correctCount: 2,
      tags: ['react', 'hooks']
    },
    {
      id: '2',
      front: 'What is the difference between let and const in JavaScript?',
      back: 'let allows you to declare variables that can be reassigned, while const declares variables that cannot be reassigned after their initial declaration.',
      course: 'JavaScript Fundamentals',
      topic: 'Variables',
      difficulty: 'easy',
      lastReviewed: new Date('2024-01-15'),
      nextReview: new Date('2024-01-17'),
      reviewCount: 5,
      correctCount: 5,
      tags: ['javascript', 'variables']
    }
  ];

  // Mock study events data
  const mockStudyEvents: StudyEvent[] = [
    {
      id: '1',
      title: 'React Quiz',
      description: 'Complete the React fundamentals quiz',
      type: 'deadline',
      course: 'React Development',
      date: new Date('2024-01-20'),
      priority: 'high',
      completed: false
    },
    {
      id: '2',
      title: 'Python Study Session',
      description: 'Review data structures and algorithms',
      type: 'study-session',
      course: 'Python Fundamentals',
      date: new Date('2024-01-18'),
      duration: 120,
      priority: 'medium',
      completed: false
    }
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [newNote, setNewNote] = useState({ title: '', content: '', course: '', lesson: '', tags: [] as string[] });
  const [newFlashcard, setNewFlashcard] = useState({ front: '', back: '', course: '', topic: '', difficulty: 'medium', tags: [] });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', type: 'deadline', course: '', date: new Date(), priority: 'medium' });
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);

  const courses = ['React Development', 'Python Fundamentals', 'JavaScript Fundamentals', 'Data Science'];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || note.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const filteredFlashcards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = selectedCourse === 'all' || card.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const upcomingEvents = studyEvents
    .filter(event => event.date >= new Date() && !event.completed)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5);

  const eventsForSelectedDate = selectedDate 
    ? studyEvents.filter(event => 
        event.date.toDateString() === selectedDate.toDateString()
      )
    : [];

  const handleCreateNote = () => {
    if (newNote.title && newNote.content) {
      const note: Note = {
        id: Date.now().toString(),
        ...newNote,
        tags: newNote.tags,
        highlights: [],
        bookmarks: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        starred: false
      };
      setNotes([note, ...notes]);
      setNewNote({ title: '', content: '', course: '', lesson: '', tags: [] });
      setIsNoteDialogOpen(false);
    }
  };

  const handleCreateFlashcard = () => {
    if (newFlashcard.front && newFlashcard.back) {
      const flashcard: Flashcard = {
        id: Date.now().toString(),
        ...newFlashcard,
        difficulty: newFlashcard.difficulty as 'easy' | 'medium' | 'hard',
        lastReviewed: new Date(),
        nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        reviewCount: 0,
        correctCount: 0,
        tags: newFlashcard.tags
      };
      setFlashcards([flashcard, ...flashcards]);
      setNewFlashcard({ front: '', back: '', course: '', topic: '', difficulty: 'medium', tags: [] });
      setIsFlashcardDialogOpen(false);
    }
  };

  const handleCreateEvent = () => {
    if (newEvent.title) {
      const event: StudyEvent = {
        id: Date.now().toString(),
        ...newEvent,
        type: newEvent.type as 'deadline' | 'exam' | 'study-session' | 'reminder',
        priority: newEvent.priority as 'low' | 'medium' | 'high',
        completed: false
      };
      setStudyEvents([event, ...studyEvents]);
      setNewEvent({ title: '', description: '', type: 'deadline', course: '', date: new Date(), priority: 'medium' });
      setIsEventDialogOpen(false);
    }
  };

  const toggleNoteStar = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId ? { ...note, starred: !note.starred } : note
    ));
  };

  const deleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <AlertCircle className="h-4 w-4" />;
      case 'exam': return <CheckSquare className="h-4 w-4" />;
      case 'study-session': return <BookOpen className="h-4 w-4" />;
      case 'reminder': return <Circle className="h-4 w-4" />;
      default: return <Circle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('Study Tools')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Organize your learning with notes, flashcards, and study planning')}
          </p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder={t('Search notes, flashcards...')}
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('All Courses')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('All Courses')}</SelectItem>
              {courses.map(course => (
                <SelectItem key={course} value={course}>{course}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <StickyNote className="h-4 w-4" />
            {t('Notes')}
          </TabsTrigger>
          <TabsTrigger value="flashcards" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {t('Flashcards')}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {t('Study Calendar')}
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            {t('Overview')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('My Notes')}</h2>
            <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cognerax-gradient text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('New Note')}
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{t('Create New Note')}</DialogTitle>
                  <DialogDescription>
                    {t('Add a new study note with highlights and bookmarks')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t('Note title')}
                    value={newNote.title}
                    onChange={(e: any) => setNewNote({ ...newNote, title: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newNote.course} onValueChange={(value: any) => setNewNote({ ...newNote, course: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Select Course')} />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(course => (
                          <SelectItem key={course} value={course}>{course}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={t('Lesson name')}
                      value={newNote.lesson}
                      onChange={(e: any) => setNewNote({ ...newNote, lesson: e.target.value })}
                    />
                  </div>
                  <Textarea
                    placeholder={t('Write your note content here...')}
                    value={newNote.content}
                    onChange={(e: any) => setNewNote({ ...newNote, content: e.target.value })}
                    rows={6}
                  />
                  <Input
                    placeholder={t('Tags (comma separated)')}
                    onChange={(e: any) => setNewNote({ ...newNote, tags: e.target.value.split(',').map((tag: string) => tag.trim()) })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={handleCreateNote} className="bg-cognerax-gradient">
                    {t('Create Note')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="hover:shadow-cognerax transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{note.title}</CardTitle>
                    <div className="flex gap-1 ml-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleNoteStar(note.id)}
                        className={note.starred ? 'text-yellow-500' : 'text-muted-foreground'}
                      >
                        <Star className="h-4 w-4" fill={note.starred ? 'currentColor' : 'none'} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNote(note.id)}
                        className="text-muted-foreground hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="secondary" className="text-xs">{note.course}</Badge>
                    {note.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {note.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{format(note.updatedAt, 'MMM dd, yyyy')}</span>
                    <div className="flex gap-2">
                      {note.highlights.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Highlighter className="h-3 w-3" />
                          {note.highlights.length}
                        </span>
                      )}
                      {note.bookmarks.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Bookmark className="h-3 w-3" />
                          {note.bookmarks.length}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="flashcards" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('Flashcards')}</h2>
            <div className="flex gap-2">
              <Button variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                {t('Review Session')}
              </Button>
              <Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
                <DialogTrigger asChild>
                  <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cognerax-gradient text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('New Flashcard')}
                  </button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('Create New Flashcard')}</DialogTitle>
                    <DialogDescription>
                      {t('Create a flashcard for spaced repetition learning')}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder={t('Front of the card (question)')}
                      value={newFlashcard.front}
                      onChange={(e: any) => setNewFlashcard({ ...newFlashcard, front: e.target.value })}
                      rows={3}
                    />
                    <Textarea
                      placeholder={t('Back of the card (answer)')}
                      value={newFlashcard.back}
                      onChange={(e: any) => setNewFlashcard({ ...newFlashcard, back: e.target.value })}
                      rows={3}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={newFlashcard.course} onValueChange={(value: any) => setNewFlashcard({ ...newFlashcard, course: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('Select Course')} />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map(course => (
                            <SelectItem key={course} value={course}>{course}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder={t('Topic')}
                        value={newFlashcard.topic}
                        onChange={(e: any) => setNewFlashcard({ ...newFlashcard, topic: e.target.value })}
                      />
                    </div>
                    <Select value={newFlashcard.difficulty} onValueChange={(value: any) => setNewFlashcard({ ...newFlashcard, difficulty: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Difficulty')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">{t('Easy')}</SelectItem>
                        <SelectItem value="medium">{t('Medium')}</SelectItem>
                        <SelectItem value="hard">{t('Hard')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsFlashcardDialogOpen(false)}>
                      {t('Cancel')}
                    </Button>
                    <Button onClick={handleCreateFlashcard} className="bg-cognerax-gradient">
                      {t('Create Flashcard')}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlashcards.map((card) => (
              <Card key={card.id} className="hover:shadow-cognerax transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm font-medium">{card.course}</CardTitle>
                    <Badge className={getDifficultyColor(card.difficulty)}>
                      {t(card.difficulty)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{card.topic}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">{t('Question:')}</p>
                    <p className="text-sm">{card.front}</p>
                  </div>
                  <div className="p-3 bg-cognerax-gradient/10 rounded-lg">
                    <p className="text-sm font-medium mb-2">{t('Answer:')}</p>
                    <p className="text-sm">{card.back}</p>
                  </div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{t('Success Rate')}: {Math.round((card.correctCount / Math.max(card.reviewCount, 1)) * 100)}%</span>
                    <span>{t('Next Review')}: {format(card.nextReview, 'MMM dd')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {card.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">{t('Study Calendar')}</h2>
            <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
              <DialogTrigger asChild>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-cognerax-gradient text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('Add Event')}
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('Create Study Event')}</DialogTitle>
                  <DialogDescription>
                    {t('Schedule deadlines, exams, and study sessions')}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder={t('Event title')}
                    value={newEvent.title}
                    onChange={(e: any) => setNewEvent({ ...newEvent, title: e.target.value })}
                  />
                  <Textarea
                    placeholder={t('Description (optional)')}
                    value={newEvent.description}
                    onChange={(e: any) => setNewEvent({ ...newEvent, description: e.target.value })}
                    rows={3}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Select value={newEvent.type} onValueChange={(value: any) => setNewEvent({ ...newEvent, type: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Event Type')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="deadline">{t('Deadline')}</SelectItem>
                        <SelectItem value="exam">{t('Exam')}</SelectItem>
                        <SelectItem value="study-session">{t('Study Session')}</SelectItem>
                        <SelectItem value="reminder">{t('Reminder')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={newEvent.priority} onValueChange={(value: any) => setNewEvent({ ...newEvent, priority: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('Priority')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t('Low')}</SelectItem>
                        <SelectItem value="medium">{t('Medium')}</SelectItem>
                        <SelectItem value="high">{t('High')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Select value={newEvent.course} onValueChange={(value: any) => setNewEvent({ ...newEvent, course: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('Select Course')} />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course} value={course}>{course}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="datetime-local"
                    value={newEvent.date.toISOString().slice(0, 16)}
                    onChange={(e: any) => setNewEvent({ ...newEvent, date: new Date(e.target.value) })}
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                    {t('Cancel')}
                  </Button>
                  <Button onClick={handleCreateEvent} className="bg-cognerax-gradient">
                    {t('Create Event')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{t('Calendar')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <div className="space-y-4">
              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('Upcoming Events')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-1 rounded-full ${getPriorityColor(event.priority)}`}>
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{event.title}</h4>
                            <p className="text-xs text-muted-foreground">{event.course}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(event.date, 'MMM dd, yyyy HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Events for Selected Date */}
              {selectedDate && eventsForSelectedDate.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      {format(selectedDate, 'MMM dd, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {eventsForSelectedDate.map((event) => (
                        <div key={event.id} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className={`p-1 rounded-full ${getPriorityColor(event.priority)}`}>
                            {getEventTypeIcon(event.type)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                            <p className="text-xs text-muted-foreground">{event.course}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Total Notes')}</p>
                    <p className="text-2xl font-bold text-cognerax-teal">{notes.length}</p>
                  </div>
                  <StickyNote className="h-8 w-8 text-cognerax-teal" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Flashcards')}</p>
                    <p className="text-2xl font-bold text-cognerax-purple">{flashcards.length}</p>
                  </div>
                  <Brain className="h-8 w-8 text-cognerax-purple" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Upcoming Events')}</p>
                    <p className="text-2xl font-bold text-orange-500">{upcomingEvents.length}</p>
                  </div>
                  <CalendarIcon className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('Starred Notes')}</p>
                    <p className="text-2xl font-bold text-yellow-500">{notes.filter(n => n.starred).length}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Quick Actions')}</CardTitle>
              <CardDescription>
                {t('Shortcuts to common study tasks')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setIsNoteDialogOpen(true)}>
                  <StickyNote className="h-6 w-6" />
                  <span className="text-xs">{t('Quick Note')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setIsFlashcardDialogOpen(true)}>
                  <Brain className="h-6 w-6" />
                  <span className="text-xs">{t('New Flashcard')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setIsEventDialogOpen(true)}>
                  <CalendarIcon className="h-6 w-6" />
                  <span className="text-xs">{t('Schedule Event')}</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Download className="h-6 w-6" />
                  <span className="text-xs">{t('Export Notes')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Recent Activity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: 'note', action: 'Created note', item: 'React Hooks Introduction', time: '2 hours ago' },
                  { type: 'flashcard', action: 'Reviewed flashcard', item: 'JavaScript Variables', time: '4 hours ago' },
                  { type: 'event', action: 'Added deadline', item: 'React Quiz', time: '1 day ago' },
                  { type: 'note', action: 'Updated note', item: 'Python Data Types', time: '2 days ago' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="p-2 rounded-full bg-cognerax-gradient/10">
                      {activity.type === 'note' && <StickyNote className="h-4 w-4 text-cognerax-teal" />}
                      {activity.type === 'flashcard' && <Brain className="h-4 w-4 text-cognerax-purple" />}
                      {activity.type === 'event' && <CalendarIcon className="h-4 w-4 text-orange-500" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{activity.action} <span className="font-medium">"{activity.item}"</span></p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};