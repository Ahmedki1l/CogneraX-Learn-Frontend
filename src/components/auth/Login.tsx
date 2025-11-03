import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  Shield,
  Sparkles,
  Users,
  BookOpen,
  Zap
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from "sonner";
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';

interface LoginProps {
  onLogin: (userData: any) => void;
  onNavigateToSignup: () => void;
  logo: string;
}

export function Login({ onLogin, onNavigateToSignup, logo }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, isRTL } = useLanguage();


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Step 1: Login to get token
      const loginResponse = await api.login({ email, password });
      
      console.log('Login response:', loginResponse);
      console.log('Token after login:', localStorage.getItem('token'));
      console.log('RefreshToken after login:', localStorage.getItem('refreshToken'));
      console.log('User after login:', localStorage.getItem('user'));
      
      if (loginResponse) {
        // The api.login() method already handles token storage internally
        // Just call the onLogin callback with the user data
        toast.success(`Welcome back, ${loginResponse.name}!`);
        onLogin(loginResponse);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-teal-600" />,
      title: "AI-Powered Learning",
      description: "Intelligent content analysis and adaptive learning paths"
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Collaborative Platform",
      description: "Connect instructors, students, and administrators seamlessly"
    },
    {
      icon: <BookOpen className="h-6 w-6 text-blue-600" />,
      title: "Rich Content Library",
      description: "Comprehensive courses with interactive lessons and assessments"
    },
    {
      icon: <Zap className="h-6 w-6 text-orange-600" />,
      title: "Real-time Analytics",
      description: "Track progress and performance with advanced insights"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-teal-500 via-teal-600 to-purple-700 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-white transform rotate-45"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-white transform rotate-12"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-white transform -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-white transform rotate-45"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-8">
            <img src={logo} alt="CogneraX" className="h-12 w-auto mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">CogneraX Learn</h1>
              <p className="text-teal-100">AI-Powered Educational Platform</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Transform Education with 
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Artificial Intelligence
            </span>
          </h2>

          <p className="text-xl text-teal-100 mb-12 leading-relaxed">
            Experience the future of learning with our comprehensive platform that combines 
            AI-driven insights, interactive content, and collaborative tools.
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-teal-100">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <img src={logo} alt="CogneraX" className="h-10 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>
            
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Sign in to your account to continue learning
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm">
                  <input type="checkbox" className="rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                  Forgot password?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <button
                  onClick={onNavigateToSignup}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}