import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation, Outlet } from 'react-router-dom';
// Shared components
import { Sidebar } from './components/shared/Sidebar';
import { Header } from './components/shared/Header';
import { Settings } from './components/shared/Settings';
import { Toaster } from './components/ui/sonner';
import { LanguageProvider } from './components/context/LanguageContext';
import { CartProvider } from './components/commerce/CartContext';
import { Cart } from './components/commerce/Cart';

// Admin components
import { Dashboard } from './components/admin/Dashboard';
import { Students } from './components/admin/Students';
import { Organization } from './components/admin/OrganizationUpdated';
import { PlatformAnalytics } from './components/admin/PlatformAnalytics';
import { UserAccessManagement } from './components/admin/UserAccessManagement';
import { SystemAdministration } from './components/admin/SystemAdministration';
import { PlatformConfiguration } from './components/admin/PlatformConfiguration';
import { AICreditsManagementPage } from './components/admin/AICreditsManagementPage';
import { InstructorManagement } from './components/admin/InstructorManagement';

// Instructor components
import { InstructorDashboard } from './components/instructor/InstructorDashboard';
import { CourseManagement } from './components/instructor/CourseManagement';
import { StudentSubmissions } from './components/instructor/StudentSubmissions';
import { InstructorAnalytics } from './components/instructor/InstructorAnalytics';
import { Gradebook } from './components/instructor/Gradebook';
import { ContentAuthoringTools } from './components/instructor/ContentAuthoringTools';

// Student components
import { StudentDashboard } from './components/student/StudentDashboard';
import { MyCourses } from './components/student/MyCourses';
import { CourseDiscovery } from './components/student/CourseDiscovery';
import { LessonView } from './components/student/LessonView';
import { QuizResults } from './components/student/QuizResults';
import { Achievements } from './components/student/Achievements';
import { QuizTaking } from './components/student/QuizTaking';
import { StudentAnalytics } from './components/student/StudentAnalytics';
import { StudyTools } from './components/student/StudyTools';
import { Certificates } from './components/student/Certificates';

// Auth components
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { InvitationSignup } from './components/auth/InvitationSignup';

// AI components
import { ContentAnalysis } from './components/ai/ContentAnalysis';
import { AITutoringSystem } from './components/ai/AITutoringSystem';
import { AIEssayGrading } from './components/ai/AIEssayGrading';
import { AIRecommendationEngine } from './components/ai/AIRecommendationEngine';

// Tools components
import { QuizCreator } from './components/tools/QuizCreator';
import { QuestionBank } from './components/tools/QuestionBank';

// Communication components
import { CommunicationHub } from './components/communication/CommunicationHub';
import { Forums } from './components/communication/Forums';

// Legacy components (to be moved later)
import { AICreditsManagement } from './components/admin/AICreditsManagement';
import exampleImage from './assets/1a0665958bd51afeafab073a021c9a5023632f55.png';
import { api } from './services/api';

// Debug logger that persists across page refreshes
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString().split('T')[1].substring(0, 12);
  const logEntry = `[${timestamp}] ${message}${data ? ': ' + JSON.stringify(data) : ''}`;
  
  // Get existing logs from sessionStorage
  const existingLogs = sessionStorage.getItem('debugLogs') || '';
  const newLogs = existingLogs + '\n' + logEntry;
  
  // Keep only last 50 lines
  const lines = newLogs.split('\n').slice(-50);
  sessionStorage.setItem('debugLogs', lines.join('\n'));
  
  // Also log to console
  console.log(logEntry, data || '');
};

const clearDebugLogs = () => {
  sessionStorage.removeItem('debugLogs');
};

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  
  // Debug panel state
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // App state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [navigationContext, setNavigationContext] = useState('organization');

  // Track if login was just performed to skip initial auth check
  const loginJustPerformed = React.useRef(false);

  // React Router hooks
  const navigate = useNavigate();
  const location = useLocation();

  // Helper function to get default route based on role
  const getDefaultRoute = (role: string) => {
    switch (role) {
      case 'admin': return '/dashboard';
      case 'instructor': return '/instructor-dashboard';
      case 'student': return '/student-dashboard';
      default: return '/dashboard';
    }
  };

  // Authentication handlers
  const handleLogin = (userData: any) => {
    debugLog('=== HANDLELOGIN CALLED ===', {
      user: userData.email,
      role: userData.role
    });
    debugLog('Setting loginJustPerformed=true');
    
    // Set flag to skip auth check - keep it set for this session
    loginJustPerformed.current = true;
    
    debugLog('Setting currentUser and isAuthenticated=true');
    setCurrentUser(userData);
    setIsAuthenticated(true);
    
    // Navigate to default route based on role
    const defaultRoute = getDefaultRoute(userData.role);
    debugLog('🔒 Navigating to default route from handleLogin', { route: defaultRoute });
    
    // Use setTimeout to ensure state is set before navigation
    setTimeout(() => {
      navigate(defaultRoute, { replace: true });
    }, 0);
    
    debugLog('=== HANDLELOGIN COMPLETE ===');
  };

  const handleSignup = (userData: any) => {
    handleLogin(userData);
  };

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    navigate('/login', { replace: true });
  };

  // Track page loads
  React.useEffect(() => {
    debugLog('🔄 PAGE LOADED/REFRESHED', {
      pathname: window.location.pathname,
      timestamp: Date.now()
    });
  }, []);
  
  // Track location changes
  React.useEffect(() => {
    debugLog('📍 Location changed', { pathname: location.pathname });
  }, [location.pathname]);

  // Check authentication on app load
  React.useEffect(() => {
    debugLog('=== AUTH CHECK STARTED ===');
    debugLog('Current state', {
      isAuthenticated,
      isLoadingUser,
      currentUser: currentUser?.email || 'none',
      currentRole: currentUser?.role || 'none',
      loginJustPerformed: loginJustPerformed.current,
      path: window.location.pathname
    });
    
    const checkAuth = async () => {
      try {
        // Skip auth check if login was just performed
        if (loginJustPerformed.current) {
          debugLog('✅ Login just performed, skipping auth check');
          debugLog('✅ LOGINJUSTPERFORMED FLAG IS TRUE - Keeping user authenticated');
          // Don't reset the flag here - keep it set to prevent re-checks during navigation
          setIsLoadingUser(false);
          debugLog('=== AUTH CHECK COMPLETE (login skip) ===');
          return;
        }
        
        debugLog('⚠️ LOGINJUSTPERFORMED FLAG IS FALSE - Will verify tokens');
        
        // Check if we're on an invitation URL
        const path = window.location.pathname;
        const inviteMatch = path.match(/^\/invite\/(.+)$/);
        
        if (inviteMatch) {
          debugLog('✅ INVITATION URL DETECTED', { path });
          setIsLoadingUser(false);
          debugLog('=== AUTH CHECK COMPLETE (invitation) ===');
          return;
        }
        
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('user');
        
        debugLog('🔑 Token check', {
          token: token ? 'exists' : 'MISSING',
          refreshToken: refreshToken ? 'exists' : 'MISSING',
          user: user ? 'exists' : 'MISSING'
        });
        
        if (token && refreshToken && user) {
          // Check if these are mock tokens
          if (token.startsWith('mock-jwt-token-')) {
            debugLog('✅ MOCK TOKENS - Using for dev');
            const userData = JSON.parse(user);
            setCurrentUser(userData);
            setIsAuthenticated(true);
            setIsLoadingUser(false);
            debugLog('=== AUTH CHECK COMPLETE (mock tokens) ===');
            return;
          }
          
          // Real tokens - verify with server
          debugLog('🌐 Verifying real tokens with server...');
          try {
            const userData = await api.initializeAuth();
            debugLog('Server response', { hasUserData: !!userData });
            
            if (userData) {
              setCurrentUser(userData);
              setIsAuthenticated(true);
              setIsLoadingUser(false);
              debugLog('=== AUTH CHECK COMPLETE (verified) ===');
              return;
            }
          } catch (error: any) {
            debugLog('❌ SERVER VERIFICATION FAILED', { error: error.message });
            debugLog('🗑️ CLEARING TOKENS FROM LOCALSTORAGE');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
        
        // No valid authentication
        debugLog('⚠️ NO VALID AUTH - Setting isAuthenticated=false');
        setIsAuthenticated(false);
        setCurrentUser(null);
      } catch (error: any) {
        debugLog('❌ AUTH CHECK ERROR', { error: error.message });
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      
      setIsLoadingUser(false);
      debugLog('=== AUTH CHECK COMPLETE (no auth) ===');
    };

    checkAuth();
  }, []);

  // Removed automatic navigation after login - handled in handleLogin instead

  // Handle auth logout events
  // React.useEffect(() => {
  //   const handleLogout = (event: CustomEvent) => {
  //     setCurrentUser(null);
  //     setIsAuthenticated(false);
  //     navigate('/login', { replace: true });
  //   };
    
  //   window.addEventListener('auth:logout', handleLogout as EventListener);
  //   return () => {
  //     window.removeEventListener('auth:logout', handleLogout as EventListener);
  //   };
  // }, []);

  // Handle token status notifications
  // React.useEffect(() => {
  //   const handleTokenStatus = (event: CustomEvent) => {
  //     const { status } = event.detail;
      
  //     if (status === 'warning') {
  //       // You can add a toast notification here
  //       console.log('Your session will expire soon. Activity will refresh it automatically.');
  //     } else if (status === 'expired') {
  //       // You can add a toast notification here
  //       console.log('Your session has expired. Please log in again.');
  //     }
  //   };
    
  //   window.addEventListener('auth:token-status', handleTokenStatus as EventListener);
  //   return () => {
  //     window.removeEventListener('auth:token-status', handleTokenStatus as EventListener);
  //   };
  // }, []);


  // Debug panel component
  const DebugPanel = () => {
    if (!showDebugPanel) return null;
    
    const logs = sessionStorage.getItem('debugLogs') || 'No logs yet...';
    
    return (
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        maxHeight: '300px',
        backgroundColor: '#1a1a1a',
        color: '#00ff00',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '10px',
        overflowY: 'auto',
        zIndex: 99999,
        borderTop: '2px solid #00ff00'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <strong>🐛 DEBUG LOGS (Persisted in sessionStorage)</strong>
          <div>
            <button onClick={clearDebugLogs} style={{ marginRight: '10px', padding: '2px 8px' }}>Clear</button>
            <button onClick={() => setShowDebugPanel(false)} style={{ padding: '2px 8px' }}>Hide</button>
          </div>
        </div>
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
          {logs}
        </pre>
      </div>
    );
  };

  // Show loading screen while checking authentication
  if (isLoadingUser) {
    debugLog('⏳ SHOWING LOADING SCREEN', { pathname: location.pathname });
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  debugLog('🚀 RENDERING MAIN APP', { 
    isLoadingUser, 
    isAuthenticated, 
    pathname: location.pathname 
  });

  // ProtectedRoute component for authenticated users
  const ProtectedRoute = () => {
    // Debug: Track when ProtectedRoute renders
    React.useEffect(() => {
      debugLog('🎯 ROUTES COMPONENT MOUNTED', { pathname: location.pathname });
    }, [location.pathname]);
    
    debugLog('🔒 ProtectedRoute render', {
      isLoadingUser,
      isAuthenticated,
      currentPath: location.pathname
    });
    
    if (isLoadingUser) {
  return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }
    
    if (!isAuthenticated) {
      debugLog('❌ ProtectedRoute: NOT AUTHENTICATED, redirecting to /login');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          logo={exampleImage}
          user={currentUser}
          onLogout={handleLogout}
        />
        
        <div className="flex-1 lg:ml-72 relative z-10 pointer-events-auto">
            <Header 
              setSidebarOpen={setSidebarOpen}
              logo={exampleImage}
              user={currentUser}
              onCartClick={() => navigate('/cart')}
            />
          
            <main className="p-4 lg:p-8 max-w-7xl mx-auto relative z-10">
              <div className="animate-in fade-in-50 duration-500">
                <Outlet />
              </div>
            </main>
        </div>
        </div>
      </div>
    );
  };

  return (
    <LanguageProvider>
      <CartProvider>
        {/* Debug panel - remove in production */}
        <DebugPanel />
        
        {/* Debug toggle button */}
        {!showDebugPanel && (
          <button
            onClick={() => setShowDebugPanel(true)}
            style={{
              position: 'fixed',
              bottom: '10px',
              right: '10px',
              padding: '10px 20px',
              backgroundColor: '#1a1a1a',
              color: '#00ff00',
              border: '2px solid #00ff00',
              borderRadius: '5px',
              cursor: 'pointer',
              zIndex: 99999,
              fontFamily: 'monospace'
            }}
          >
            🐛 Show Debug Logs
          </button>
        )}
        
        {/* Debug: Routes render */}
        <Routes>
          {/* Public Routes (no auth required) */}
          <Route path="/invite/:token" element={
            <InvitationSignup
              onSignup={handleSignup}
              logo={exampleImage}
            />
          } />
          <Route path="/login" element={
            <Login
              onLogin={handleLogin}
              onNavigateToSignup={() => navigate('/signup')}
              logo={exampleImage}
            />
          } />
          <Route path="/signup" element={
            <Signup
              onSignup={handleSignup}
              onNavigateToLogin={() => navigate('/login')}
              logo={exampleImage}
            />
          } />
          
          {/* Protected Routes (auth required) */}
          <Route element={<ProtectedRoute />}>
            {/* Admin Routes */}
            <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
            <Route path="/organization/*" element={<Organization />} />
            <Route path="/students" element={<Students />} />
            <Route path="/platform-analytics" element={<PlatformAnalytics />} />
            <Route path="/user-access" element={<UserAccessManagement />} />
            <Route path="/instructor-management" element={<InstructorManagement />} />
            <Route path="/system-admin" element={<SystemAdministration />} />
            <Route path="/platform-config" element={<PlatformConfiguration />} />
            <Route path="/ai-credits" element={<AICreditsManagementPage />} />
            
            {/* Instructor Routes */}
            <Route path="/instructor-dashboard" element={<InstructorDashboard user={currentUser} />} />
            <Route path="/courses" element={<CourseManagement user={currentUser} />} />
            <Route path="/gradebook" element={<Gradebook user={currentUser} />} />
            <Route path="/submissions" element={<StudentSubmissions user={currentUser} />} />
            <Route path="/instructor-analytics" element={<InstructorAnalytics user={currentUser} />} />
            <Route path="/content-authoring" element={<ContentAuthoringTools user={currentUser} />} />
            
            {/* Student Routes */}
            <Route path="/student-dashboard" element={<StudentDashboard user={currentUser} />} />
            <Route path="/my-courses" element={<MyCourses user={currentUser} />} />
            <Route path="/course-discovery" element={<CourseDiscovery user={currentUser} />} />
            <Route path="/achievements" element={<Achievements user={currentUser} />} />
            <Route path="/certificates" element={<Certificates user={currentUser} />} />
            <Route path="/student-analytics" element={<StudentAnalytics user={currentUser} />} />
            <Route path="/study-tools" element={<StudyTools user={currentUser} />} />
            
            {/* Shared Routes */}
            <Route path="/lesson/:id" element={<LessonView />} />
            <Route path="/quiz/:id" element={<QuizTaking user={currentUser} onComplete={() => {}} onNavigateBack={() => {}} />} />
            <Route path="/quiz-results/:id" element={<QuizResults user={currentUser} />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai-tutoring" element={<AITutoringSystem />} />
            <Route path="/ai-essay-grading" element={<AIEssayGrading />} />
            <Route path="/ai-recommendations" element={<AIRecommendationEngine />} />
            <Route path="/content-analysis" element={<ContentAnalysis />} />
            <Route path="/communication" element={<CommunicationHub user={currentUser} />} />
            <Route path="/forums" element={<Forums user={currentUser} />} />
            <Route path="/cart" element={<Cart user={currentUser} />} />
            
            {/* Tools Routes */}
            <Route path="/quiz-creator" element={<QuizCreator user={currentUser} />} />
            <Route path="/question-bank" element={<QuestionBank />} />
            
            {/* Legacy Routes - Commented out as it requires props */}
            {/* <Route path="/ai-credits-legacy" element={<AICreditsManagement isOpen={true} onClose={() => {}} />} /> */}
            
            {/* Default redirect based on role */}
            <Route path="/" element={<Navigate to={getDefaultRoute(currentUser?.role)} replace />} />
          </Route>
          
          {/* 404 Route */}
          {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
        </Routes>
        <Toaster />
    </CartProvider>
    </LanguageProvider>
  );
}