import React, { useEffect } from 'react';
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
  GraduationCap,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../commerce/CartContext';
import { useAICredits } from '../context/AICreditsContext';

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
  const {
    balance: aiCredits,
    summary: aiSummary,
    loading: aiCreditsLoading,
    error: aiCreditsError,
    refresh: refreshAICredits,
  } = useAICredits();

  const shouldShowCredits = user?.role === 'instructor' || user?.role === 'admin';
  useEffect(() => {
    if (shouldShowCredits) {
      void refreshAICredits();
    }
  }, [refreshAICredits, shouldShowCredits]);

  const creditsDisplay = aiCreditsLoading
    ? '...'
    : aiCredits ?? aiSummary?.available ?? aiSummary?.remaining ?? (shouldShowCredits ? 0 : null);
  const getMenuItems = () => {
    const baseItems = [
      {
        id: user?.role === 'student' ? 'student-dashboard' : user?.role === 'instructor' ? 'instructor-dashboard' : user?.role === 'parent' ? 'parent/dashboard' : 'dashboard',
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
        // {
        //   id: '/ai-question-generator',
        //   label: t('nav.quizCreator'),
        //   icon: Sparkles,
        //   color: 'text-pink-600'
        // },
        {
          id: '/ai-exam-generator',
          label: t('nav.examGenerator'),
          icon: ClipboardCheck,
          color: 'text-indigo-500'
        },
        {
          id: '/exams',
          label: t('nav.gradebook'),
          icon: FileQuestion,
          color: 'text-indigo-600'
        },
        {
          id: '/students',
          label: t('nav.students'),
          icon: Users,
          color: 'text-green-600'
        },
        // {
        //   id: '/organization',
        //   label: t('nav.organization'),
        //   icon: Building2,
        //   color: 'text-orange-600'
        // },
        {
          id: '/communication',
          label: t('nav.communicationHub'),
          icon: MessageSquare,
          color: 'text-blue-500'
        },
        {
          id: '/platform-analytics',
          label: t('nav.platformAnalytics'),
          icon: BarChart3,
          color: 'text-cyan-600'
        },
        {
          id: '/user-access',
          label: t('nav.userAccessManagement'),
          icon: UserCheck,
          color: 'text-teal-600'
        },
        {
          id: '/system-admin',
          label: t('nav.systemAdministration'),
          icon: Database,
          color: 'text-red-600'
        },
        {
          id: '/platform-config',
          label: t('nav.platformConfiguration'),
          icon: Settings,
          color: 'text-gray-600'
        },
        {
          id: '/ai-credits',
          label: t('nav.aiCredits'),
          icon: Zap,
          color: 'text-yellow-500'
        }
      ];
    }

    if (user?.role === 'instructor') {
      return [
        ...baseItems,
        {
          id: '/courses',
          label: t('nav.myCourses'),
          icon: BookOpen,
          color: 'text-purple-600'
        },
        {
          id: '/content-analysis',
          label: t('nav.contentAnalysis'),
          icon: BrainCircuit,
          color: 'text-purple-600'
        },
        // {
        //   id: '/ai-question-generator',
        //   label: t('nav.quizCreator'),
        //   icon: Sparkles,
        //   color: 'text-pink-600'
        // },
        {
          id: '/ai-exam-generator',
          label: t('nav.examGenerator'),
          icon: ClipboardCheck,
          color: 'text-indigo-500'
        },
        {
          id: '/exams',
          label: t('nav.gradebook'),
          icon: FileQuestion,
          color: 'text-indigo-600'
        },
        {
          id: '/assignments',
          label: t('nav.assignments'),
          icon: FileText,
          color: 'text-orange-500'
        },
        {
          id: '/students',
          label: t('nav.students'),
          icon: Users,
          color: 'text-green-600'
        },
        {
          id: '/communication',
          label: t('nav.communicationHub'),
          icon: MessageSquare,
          color: 'text-blue-500'
        },
        // {
        //   id: '/analytics',
        //   label: t('nav.analytics'),
        //   icon: BarChart3,
        //   color: 'text-orange-600'
        // },
        // ...(shouldShowCredits ? [{
        //   id: '/ai-credits',
        //   label: t('nav.aiCredits'),
        //   icon: Zap,
        //   color: 'text-yellow-500'
        // }] : [])
      ];
    }

    // Student menu items
    const studentItems = [
      ...baseItems,
      // {
      //   id: '/courses/catalog',
      //   label: t('nav.courseDiscovery'),
      //   icon: BookOpen,
      //   color: 'text-blue-600'
      // },
      {
        id: '/my-courses',
        label: t('nav.myCourses'),
        icon: GraduationCap,
        color: 'text-purple-600'
      },
      {
        id: '/my-assignments',
        label: t('nav.assignments'),
        icon: FileText,
        color: 'text-orange-500'
      },
      {
        id: '/student-analytics',
        label: t('nav.analytics'),
        icon: Activity,
        color: 'text-green-500'
      },
      /*{
        id: '/achievements',
        label: t('nav.achievements'),
        icon: Award,
        color: 'text-yellow-500'
      },*/
      {
        id: '/study-tools',
        label: t('nav.studyTools'),
        icon: Calendar,
        color: 'text-pink-500'
      },
      {
        id: '/ai-tutoring',
        label: t('nav.aiTutoring'),
        icon: Brain,
        color: 'text-violet-500'
      },
      {
        id: '/communication',
        label: t('nav.communicationHub'),
        icon: MessageSquare,
        color: 'text-blue-500'
      },
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
        item.id !== '/courses/catalog' && item.id !== '/cart'
      );
    }

    return studentItems;
  };

  const menuItems = getMenuItems();

  // Override menu items for parent role
  const parentMenuItems = user?.role === 'parent' ? [
    {
      id: 'parent/dashboard',
      label: t('nav.dashboard'),
      icon: LayoutDashboard,
      color: 'text-blue-600'
    },
    {
      id: '/parent/dashboard',
      label: t('nav.myChildren'),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: '/communication',
      label: t('nav.communicationHub'),
      icon: MessageSquare,
      color: 'text-blue-500'
    },
    {
      id: '/settings',
      label: t('nav.settings'),
      icon: Settings,
      color: 'text-gray-600'
    }
  ] : null;

  const finalMenuItems = parentMenuItems || menuItems;

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
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-zinc-900 rounded-full border-2 border-white"></div>
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent whitespace-nowrap">
                {t('sidebar.title')}
              </h2>
              <p className="text-xs text-gray-500 mt-1">{t('sidebar.subtitle')}</p>
            </div>
          </div>
          
          {/* Scrollable Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto scrollbar-hide">
                        {finalMenuItems.map((item) => {
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
                      ? 'bg-gray-900 text-white shadow-lg transform scale-105'
                      : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 hover:scale-105'
                  }`}
                >
                  {location.pathname === item.id && (
                    <div className="absolute inset-0 bg-gray-500/20 rounded-xl"></div>
                  )}
                  <Icon
                    className={`mr-3 h-5 w-5 relative z-10 ${
                      location.pathname === item.id ? 'text-white' : `text-zinc-500 group-hover:text-zinc-900 group-hover:scale-110 transition-transform duration-300`
                    }`}
                  />
                  <span className="relative z-10 font-medium">{item.label}</span>
                  {(item as any).badge ? (
                    <div className="ml-auto relative z-10">
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        location.pathname === item.id 
                          ? 'bg-white text-black' 
                          : 'bg-zinc-900 text-white'
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
            <div className="flex items-center p-3 rounded-xl hover:bg-zinc-100 transition-all duration-300 cursor-pointer group">
              <div className="relative">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold">
                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                  </span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-zinc-900 rounded-full border-2 border-white"></div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-zinc-900 transition-colors">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {t(`roles.${user?.role?.toLowerCase()}` as any) || user?.role || 'User'}
                </p>
                {/* AI Credits for instructors */}
                {shouldShowCredits && creditsDisplay !== null && (
                  <div
                    className="flex items-center mt-1 text-xs text-teal-600"
                    title={aiCreditsError || undefined}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="font-medium">
                      {creditsDisplay} {t('sidebar.credits')}
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
                  {t('sidebar.title')}
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
                        {finalMenuItems.map((item) => {
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
                  {t(`roles.${user?.role?.toLowerCase()}` as any) || user?.role || 'User'}
                </p>
                {/* AI Credits for instructors */}
                {shouldShowCredits && (
                  <div
                    className="flex items-center mt-1 text-xs text-teal-600"
                    title={aiCreditsError || undefined}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    <span className="font-medium">
                      {creditsDisplay} {t('sidebar.credits')}
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