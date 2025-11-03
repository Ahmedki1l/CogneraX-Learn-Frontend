import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BrainCircuit, 
  FileQuestion, 
  Users, 
  Building2, 
  Settings, 
  BookOpen,
  PlusCircle,
  BarChart3,
  UserCheck,
  X,
  PlayCircle,
  Database,
  Zap,
  Award,
  ShoppingCart,
  ClipboardCheck,
  MessageSquare,
  Edit,
  TrendingUp,
  Shield,
  Activity,
  Palette,
  Brain,
  FileText,
  Sparkles,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../commerce/CartContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  logo: string;
  user?: any;
  onLogout?: () => void;
}

export function Sidebar({ isOpen, setIsOpen, logo, user, onLogout }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, isRTL } = useLanguage();
  const { getTotalItems } = useCart();
  const getMenuItems = () => {
    const baseItems = [
      {
        id: user?.role === 'student' ? 'student-dashboard' : user?.role === 'instructor' ? 'instructor-dashboard' : 'dashboard',
        label: t('nav.dashboard'),
        icon: LayoutDashboard,
        color: 'text-blue-600'
      }
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          id: '/content-analysis',
          label: t('nav.contentAnalysis'),
          icon: BrainCircuit,
          color: 'text-purple-600'
        },
        {
          id: '/quiz-creator',
          label: t('nav.quizCreator'),
          icon: FileQuestion,
          color: 'text-teal-600'
        },
        {
          id: '/question-bank',
          label: t('nav.questionBank'),
          icon: Database,
          color: 'text-blue-600'
        },
        {
          id: '/students',
          label: t('nav.students'),
          icon: Users,
          color: 'text-green-600'
        },
        {
          id: '/organization',
          label: t('nav.organization'),
          icon: Building2,
          color: 'text-indigo-600'
        },
        {
          id: '/platform-analytics',
          label: t('nav.platformAnalytics') || 'Platform Analytics',
          icon: TrendingUp,
          color: 'text-blue-500'
        },
        {
          id: '/user-access',
          label: t('nav.userAccessManagement') || 'User & Access Management',
          icon: Shield,
          color: 'text-purple-500'
        },
        {
          id: '/instructor-management',
          label: 'Instructor Management',
          icon: GraduationCap,
          color: 'text-teal-600'
        },
        // {
        //   id: '/system-admin',
        //   label: t('nav.systemAdministration') || 'System Administration',
        //   icon: Activity,
        //   color: 'text-red-500'
        // },
        // {
        //   id: '/platform-config',
        //   label: t('nav.platformConfiguration') || 'Platform Configuration',
        //   icon: Palette,
        //   color: 'text-teal-500'
        // },
        // {
        //   id: '/ai-tutoring',
        //   label: t('nav.aiTutoring') || 'AI Tutoring System',
        //   icon: Brain,
        //   color: 'text-purple-600'
        // },
        {
          id: '/ai-essay-grading',
          label: t('nav.aiEssayGrading') || 'AI Essay Grading',
          icon: FileText,
          color: 'text-blue-600'
        },
        // {
        //   id: '/ai-recommendations',
        //   label: t('nav.aiRecommendations') || 'AI Recommendations',
        //   icon: Sparkles,
        //   color: 'text-teal-600'
        // },
        {
          id: '/ai-credits',
          label: t('nav.aiCredits') || 'AI Credits Management',
          icon: Zap,
          color: 'text-yellow-600'
        },
        {
          id: '/settings',
          label: t('nav.settings'),
          icon: Settings,
          color: 'text-gray-600'
        }
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...baseItems,
        {
          id: '/courses',
          label: t('nav.courseManagement'),
          icon: BookOpen,
          color: 'text-purple-600'
        },
        {
          id: '/instructor-analytics',
          label: t('nav.instructorAnalytics') || 'Advanced Analytics',
          icon: BarChart3,
          color: 'text-teal-600'
        },
        {
          id: '/gradebook',
          label: t('nav.gradebook') || 'Gradebook & Assessment',
          icon: UserCheck,
          color: 'text-blue-600'
        },
        {
          id: '/communication',
          label: t('nav.communicationHub') || 'Communication Hub',
          icon: MessageSquare,
          color: 'text-green-600'
        },
        // {
        //   id: '/content-authoring',
        //   label: t('nav.contentAuthoring') || 'Content Authoring',
        //   icon: Edit,
        //   color: 'text-purple-600'
        // },
        {
          id: '/quiz-creator',
          label: t('nav.quizCreator'),
          icon: FileQuestion,
          color: 'text-orange-600'
        },
        {
          id: '/question-bank',
          label: t('nav.questionBank'),
          icon: Database,
          color: 'text-indigo-600'
        },
        {
          id: '/submissions',
          label: t('nav.students'),
          icon: Users,
          color: 'text-pink-600'
        },
        // {
        //   id: '/ai-tutoring',
        //   label: t('nav.aiTutoring') || 'AI Tutoring System',
        //   icon: Brain,
        //   color: 'text-purple-600'
        // },
        {
          id: '/ai-essay-grading',
          label: t('nav.aiEssayGrading') || 'AI Essay Grading',
          icon: FileText,
          color: 'text-blue-600'
        },
        // {
        //   id: '/ai-recommendations',
        //   label: t('nav.aiRecommendations') || 'AI Recommendations',
        //   icon: Sparkles,
        //   color: 'text-teal-600'
        // },
        {
          id: '/settings',
          label: t('nav.settings'),
          icon: Settings,
          color: 'text-gray-600'
        }
      ];
    }

    // Student menu items
    const studentItems = [
      ...baseItems,
      {
        id: '/my-courses',
        label: t('nav.myCourses'),
        icon: BookOpen,
        color: 'text-blue-600'
      },
      {
        id: '/course-discovery',
        label: t('nav.courseDiscovery'),
        icon: PlusCircle,
        color: 'text-green-600'
      },
      {
        id: '/cart',
        label: t('nav.cart') || 'Shopping Cart',
        icon: ShoppingCart,
        color: 'text-purple-600',
        badge: getTotalItems() > 0 ? getTotalItems() : undefined
      },
      {
        id: '/achievements',
        label: t('nav.achievements'),
        icon: Award,
        color: 'text-yellow-600'
      },
      {
        id: '/student-analytics',
        label: t('nav.analytics') || 'Learning Analytics',
        icon: BarChart3,
        color: 'text-teal-600'
      },
      {
        id: '/study-tools',
        label: t('nav.studyTools') || 'Study Tools',
        icon: BookOpen,
        color: 'text-purple-600'
      },
      {
        id: '/forums',
        label: t('nav.forums') || 'Discussion Forums',
        icon: MessageSquare,
        color: 'text-blue-600'
      },
      {
        id: '/certificates',
        label: t('nav.certificates') || 'Certificates',
        icon: Award,
        color: 'text-green-600'
      },
      // {
      //   id: '/ai-tutoring',
      //   label: t('nav.aiTutoring') || 'AI Tutoring System',
      //   icon: Brain,
      //   color: 'text-purple-600'
      // },
      // {
      //   id: '/ai-recommendations',
      //   label: t('nav.aiRecommendations') || 'AI Recommendations',
      //   icon: Sparkles,
      //   color: 'text-teal-600'
      // },
      {
        id: '/settings',
        label: t('nav.settings'),
        icon: Settings,
        color: 'text-gray-600'
      }
    ];

    // For school organizations, hide Course Discovery and Shopping Cart
    const isSchool = user?.organization?.type === 'school';
    if (isSchool) {
      return studentItems.filter(item => 
        item.id !== '/course-discovery' && item.id !== '/cart'
      );
    }

    return studentItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <div className="flex flex-col h-full bg-white border-r border-gray-200 shadow-xl">
          {/* Fixed Header */}
          <div className="flex items-center flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="relative">
              <img 
                className="h-10 w-auto" 
                src={logo} 
                alt="CogneraX" 
              />
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent whitespace-nowrap">
                CogneraX Learn
              </h2>
              <p className="text-xs text-gray-500 mt-1">AI-Powered Platform</p>
            </div>
          </div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setIsOpen(false); // Close mobile sidebar after navigation
                  }}
                  className={`w-full group flex items-center px-4 py-3 text-sm rounded-xl transition-all duration-300 relative overflow-hidden ${
                    location.pathname === item.id
                      ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-gradient-to-r hover:from-teal-50 hover:to-purple-50 hover:text-gray-900 hover:scale-105'
                  }`}
                >
                  {location.pathname === item.id && (
                    <div className="absolute inset-0 bg-white opacity-20 rounded-xl"></div>
                  )}
                  <Icon
                    className={`mr-3 h-5 w-5 relative z-10 ${
                      location.pathname === item.id ? 'text-white' : `${item.color} group-hover:scale-110 transition-transform duration-300`
                    }`}
                  />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {(item as any).badge ? (
                    <div className="ml-auto relative z-10">
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        location.pathname === item.id 
                          ? 'bg-white text-purple-600' 
                          : 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                      }`}>
                        {(item as any).badge}
                      </div>
                    </div>
                  ) : location.pathname === item.id && (
                    <div className="ml-auto relative z-10">
                      <div className="h-2 w-2 bg-white rounded-full opacity-80"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <div className="flex items-center p-3 rounded-xl hover:bg-gradient-to-r hover:from-teal-50 hover:to-purple-50 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">
                    {user?.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
                {/* AI Credits for instructors */}
                {user?.role === 'instructor' && (
                  <div className="flex items-center mt-1 text-xs text-teal-600">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="font-medium">
                      {user?.aiCredits || 150} credits
                    </span>
                  </div>
                )}
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between flex-shrink-0 px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <img 
                className="h-8 w-auto" 
                src={logo} 
                alt="CogneraX" 
              />
              <div className="ml-2">
                <h2 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h2>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <nav className="mt-4 flex-1 px-2 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full group flex items-center px-2 py-3 text-sm rounded-lg transition-all duration-200 ${
                    location.pathname === item.id
                      ? 'bg-gradient-to-r from-teal-50 to-purple-50 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 ${
                      location.pathname === item.id ? item.color : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs font-medium text-gray-500 capitalize">
                  {user?.role || 'User'}
                </p>
                {/* AI Credits for instructors */}
                {user?.role === 'instructor' && (
                  <div className="flex items-center mt-1 text-xs text-teal-600">
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="font-medium">
                      {user?.aiCredits || 150} credits
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}