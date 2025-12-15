import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useCart } from '../commerce/CartContext';
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Clock, 
  PlayCircle,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Award,
  TrendingUp,
  Zap,
  ShoppingCart,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '../../services/api';
import { useLanguage } from '../context/LanguageContext';

interface Course {
  id: string;
  _id?: string;
  title: string;
  instructor: string | any;
  field: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'beginner' | 'intermediate' | 'advanced';
  duration: string;
  lessonsCount: number;
  studentsCount: number;
  rating: number;
  reviewsCount?: number;
  ratingsCount?: number;
  price: number;
  originalPrice?: number;
  image: string;
  thumbnail?: string;
  description: string;
  skills?: string[];
  tags?: string[];
  isBookmarked: boolean;
  isEnrolled: boolean;
  isFree: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  status?: string;
}

interface CourseDiscoveryProps {
  user?: any;
}

export function CourseDiscovery({ user }: CourseDiscoveryProps) {
  const { t, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const { addToCart, isInCart } = useCart();

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        // Fetch courses - Data is auto-extracted by BaseApiService
        const coursesData = await api.course.getCourses({
          search: searchQuery || undefined,
          field: selectedField !== 'all' ? selectedField : undefined,
          level: selectedLevel !== 'all' ? selectedLevel : undefined,
          status: 'published',
        });
        console.log('📚 Courses data:', coursesData);

        // Data is already extracted from response wrapper by BaseApiService
        if (coursesData && Array.isArray(coursesData)) {
          const formattedCourses = coursesData.map((course: any) => ({
            id: course._id || course.id,
            _id: course._id,
            title: course.title,
            instructor: typeof course.instructor === 'object' ? course.instructor.name : course.instructor,
            field: course.field || '',
            category: course.category || course.field || '',
            level: course.level,
            duration: `${course.duration || 40} hours`,
            lessonsCount: course.lessonsCount || 0,
            studentsCount: course.studentsCount || 0,
            rating: course.averageRating || 0,
            reviewsCount: course.totalRatings || 0,
            ratingsCount: course.totalRatings || 0,
            price: course.price || 0,
            originalPrice: course.originalPrice,
            image: course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
            thumbnail: course.thumbnail,
            description: course.description || course.shortDescription || '',
            skills: course.tags || [],
            tags: course.tags,
            isBookmarked: false,
            isEnrolled: false,
            isFree: course.isFree || course.price === 0,
            isPopular: course.studentsCount > 1000,
            isNew: new Date(course.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000,
            status: course.status
          })).filter((course: any) => course.status === 'published' || !course.status);

          setCourses(formattedCourses);
        } else {
          console.warn('⚠️ No courses data received');
          setCourses([]);
        }
      } catch (error: any) {
        console.error('Failed to fetch courses:', error);
        
        // Show empty state for missing endpoints
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Courses endpoint issue - showing empty state');
          setCourses([]);
        } else {
          toast.error('Failed to load courses');
          setCourses([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchQuery, selectedField, selectedLevel]);

  const availableCourses = courses;

  // Original mock data kept as fallback
  const originalMockCourses: Course[] = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'Dr. Angela Yu',
      field: 'Web Development',
      category: 'Programming',
      level: 'Beginner',
      duration: '65 hours',
      lessonsCount: 62,
      studentsCount: 125000,
      rating: 4.7,
      reviewsCount: 35000,
      price: 84.99,
      originalPrice: 199.99,
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
      description: 'Learn HTML, CSS, JavaScript, Node, React, MongoDB and more! Build 32+ projects and get hired as a web developer.',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB'],
      isBookmarked: false,
      isEnrolled: false,
      isFree: false,
      isPopular: true
    },
    {
      id: '2',
      title: 'Machine Learning A-Z',
      instructor: 'Kirill Eremenko',
      field: 'Data Science',
      category: 'AI & Machine Learning',
      level: 'Intermediate',
      duration: '44 hours',
      lessonsCount: 320,
      studentsCount: 85000,
      rating: 4.5,
      reviewsCount: 28000,
      price: 89.99,
      originalPrice: 189.99,
      image: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=200&fit=crop',
      description: 'Learn to create Machine Learning Algorithms in Python and R from two Data Science experts.',
      skills: ['Python', 'R', 'Machine Learning', 'Data Analysis', 'Statistics'],
      isBookmarked: true,
      isEnrolled: false,
      isFree: false,
      isPopular: true
    },
    {
      id: '3',
      title: 'Introduction to Programming',
      instructor: 'John Smith',
      field: 'Computer Science',
      category: 'Programming',
      level: 'Beginner',
      duration: '25 hours',
      lessonsCount: 45,
      studentsCount: 15000,
      rating: 4.3,
      reviewsCount: 2500,
      price: 0,
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop',
      description: 'Learn the fundamentals of programming with this free comprehensive course.',
      skills: ['Programming Basics', 'Logic', 'Problem Solving'],
      isBookmarked: false,
      isEnrolled: false,
      isFree: true,
      isNew: true
    },
    {
      id: '4',
      title: 'Digital Marketing Masterclass',
      instructor: 'Sarah Johnson',
      field: 'Marketing',
      category: 'Business',
      level: 'Intermediate',
      duration: '30 hours',
      lessonsCount: 85,
      studentsCount: 42000,
      rating: 4.6,
      reviewsCount: 8500,
      price: 79.99,
      originalPrice: 149.99,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=200&fit=crop',
      description: 'Master digital marketing with real-world projects and actionable strategies.',
      skills: ['SEO', 'Social Media', 'Content Marketing', 'Analytics', 'PPC'],
      isBookmarked: false,
      isEnrolled: false,
      isFree: false
    },
    {
      id: '5',
      title: 'Advanced React Development',
      instructor: 'Brad Traversy',
      field: 'Web Development',
      category: 'Programming',
      level: 'Advanced',
      duration: '52 hours',
      lessonsCount: 78,
      studentsCount: 28000,
      rating: 4.8,
      reviewsCount: 5200,
      price: 94.99,
      originalPrice: 179.99,
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop',
      description: 'Master advanced React concepts, hooks, context, and modern development patterns.',
      skills: ['React', 'Redux', 'Context API', 'Hooks', 'Testing'],
      isBookmarked: true,
      isEnrolled: false,
      isFree: false,
      isNew: true
    },
    {
      id: '6',
      title: 'Data Science with Python',
      instructor: 'Jose Portilla',
      field: 'Data Science',
      category: 'Data Analysis',
      level: 'Beginner',
      duration: '40 hours',
      lessonsCount: 165,
      studentsCount: 95000,
      rating: 4.6,
      reviewsCount: 18000,
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop',
      description: 'Learn data analysis, visualization, and machine learning with Python.',
      skills: ['Python', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn'],
      isBookmarked: false,
      isEnrolled: false,
      isFree: false,
      isPopular: true
    }
  ];

  const fields = ['all', 'Web Development', 'Data Science', 'Computer Science', 'Marketing'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesField = selectedField === 'all' || course.field === selectedField;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    const matchesPrice = priceFilter === 'all' || 
                        (priceFilter === 'free' && course.isFree) ||
                        (priceFilter === 'paid' && !course.isFree);
    
    return matchesSearch && matchesField && matchesLevel && matchesPrice;
  });

  const handleBookmark = async (courseId: string) => {
    try {
      const course = courses.find(c => c.id === courseId);
      if (!course) return;

      if (course.isBookmarked) {
        // Unbookmark
        const response = await api.course.unbookmarkCourse(courseId);
        if (response) {
          setCourses(courses.map(c => 
            c.id === courseId ? { ...c, isBookmarked: false } : c
          ));
          toast.success('Bookmark removed!');
        }
      } else {
        // Bookmark
        const response = await api.course.bookmarkCourse(courseId);
        if (response) {
          setCourses(courses.map(c => 
            c.id === courseId ? { ...c, isBookmarked: true } : c
          ));
          toast.success('Course bookmarked!');
        }
      }
    } catch (error: any) {
      console.error('Failed to bookmark course:', error);
      
      // Handle missing endpoint gracefully
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Bookmark endpoint not implemented yet');
        toast.info('Bookmarking feature coming soon');
      } else {
        toast.error('Failed to bookmark course');
      }
    }
  };

  const handleEnroll = async (course: Course) => {
    setLoading(true);
    
    try {
      if (course.isFree || course.price === 0) {
        // Free course enrollment via API
        try {
          const response = await api.payment.enrollFreeCourse(course.id);
          if (response) {
            const enrolledCourse = {
              ...course,
              enrolledAt: new Date(),
              progress: 0,
              status: 'active'
            };

            const existingEnrollments = JSON.parse(localStorage.getItem('student_enrollments') || '[]');
            const updatedEnrollments = [...existingEnrollments, enrolledCourse];
            localStorage.setItem('student_enrollments', JSON.stringify(updatedEnrollments));
            
            toast.success(`Successfully enrolled in "${course.title}"!`);
            
            // Update local state
            const updatedCourses = courses.map(c => 
              c.id === course.id ? { ...c, isEnrolled: true } : c
            );
            setCourses(updatedCourses);
          }
        } catch (apiError) {
          // Fallback to local enrollment if API fails
          const enrolledCourse = {
            ...course,
            enrolledAt: new Date(),
            progress: 0,
            status: 'active'
          };

          const existingEnrollments = JSON.parse(localStorage.getItem('student_enrollments') || '[]');
          const updatedEnrollments = [...existingEnrollments, enrolledCourse];
          localStorage.setItem('student_enrollments', JSON.stringify(updatedEnrollments));
          
          toast.success(`Successfully enrolled in "${course.title}"!`);
        }
      } else {
        // Paid courses - add to cart
        try {
          await api.cart.addToCart(course.id);
          addToCart(course);
          toast.success('Added to cart! Proceed to checkout.');
        } catch (apiError) {
          // Fallback to local cart
          addToCart(course);
          toast.success('Added to cart!');
        }
      }
    } catch (error) {
      toast.error('Failed to enroll in course');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (course: Course) => {
    addToCart(course);
  };

  const CourseCard = ({ course }: { course: Course }) => (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg">
      <div className="aspect-video relative overflow-hidden">
        <img 
          src={course.image} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {course.isPopular && (
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
              <TrendingUp className="h-3 w-3 mr-1" />
              {t('courseDiscovery.popular')}
            </Badge>
          )}
          {course.isNew && (
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
              <Zap className="h-3 w-3 mr-1" />
              {t('courseDiscovery.new')}
            </Badge>
          )}
          {course.isFree && (
            <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">
              {t('courseDiscovery.free')}
            </Badge>
          )}
        </div>

        {/* Bookmark */}
        <button
          onClick={() => handleBookmark(course.id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
        >
          {course.isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-purple-600" />
          ) : (
            <Bookmark className="h-4 w-4 text-gray-600" />
          )}
        </button>

        {/* Duration overlay */}
        <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {course.duration}
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{course.field}</span>
              <span>•</span>
              <Badge variant="outline" className="text-xs">{course.level}</Badge>
            </div>
            <CardTitle className="text-lg leading-tight line-clamp-2 group-hover:text-purple-600 transition-colors">
              {course.title}
            </CardTitle>
            <CardDescription className="text-sm">{course.instructor}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Rating and Students */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{course.rating}</span>
            <span className="text-gray-500">({course.reviewsCount.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <Users className="h-4 w-4" />
            <span>{course.studentsCount.toLocaleString()}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {course.skills.slice(0, 3).map((skill, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {course.skills.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{course.skills.length - 3} {t('courseDiscovery.more')}
            </Badge>
          )}
        </div>

        {/* Price and Actions */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2">
            {course.isFree ? (
              <span className="text-xl font-bold text-green-600">{t('courseDiscovery.free')}</span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-900">${course.price}</span>
                {course.originalPrice && (
                  <span className="text-sm text-gray-500 line-through">${course.originalPrice}</span>
                )}
              </div>
            )}
          </div>
          
          {course.isFree ? (
            <Button
              onClick={() => handleEnroll(course)}
              disabled={loading || course.isEnrolled}
              className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
            >
              {course.isEnrolled ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  {t('courseDiscovery.enrolled')}
                </>
              ) : (
                t('courseDiscovery.enrollFree')
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              {course.isEnrolled ? (
                <Button disabled className="bg-gray-200 text-gray-500">
                  <Check className="h-4 w-4 mr-2" />
                  {t('courseDiscovery.enrolled')}
                </Button>
              ) : isInCart(course.id) ? (
                <Button disabled className="bg-green-500 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  {t('courseDiscovery.inCart')}
                </Button>
              ) : (
                <Button
                  onClick={() => handleAddToCart(course)}
                  className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('courseDiscovery.addToCart')}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
          {t('courseDiscovery.title')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('courseDiscovery.subtitle')}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('courseDiscovery.search')}</label>
            <div className="relative">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400`} />
              <Input
                placeholder={t('courseDiscovery.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('courseDiscovery.field')}</label>
            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger>
                <SelectValue placeholder={t('courseDiscovery.allFields')} />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field} value={field}>
                    {field === 'all' ? t('courseDiscovery.allFields') : field}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('courseDiscovery.level')}</label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder={t('courseDiscovery.allLevels')} />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level === 'all' ? t('courseDiscovery.allLevels') : level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">{t('courseDiscovery.price')}</label>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t('courseDiscovery.allPrices')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('courseDiscovery.allPrices')}</SelectItem>
                <SelectItem value="free">{t('courseDiscovery.free')}</SelectItem>
                <SelectItem value="paid">{t('courseDiscovery.paid')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {filteredCourses.length} {t('courseDiscovery.coursesFound')}
        </h2>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('courseDiscovery.noCourses')}</h3>
          <p className="text-gray-500">{t('courseDiscovery.noCoursesDesc')}</p>
        </div>
      )}
    </div>
  );
}