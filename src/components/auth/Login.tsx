import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
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
import { LanguageSwitcher } from '../context/LanguageSwitcher';
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

      if (loginResponse) {
        // The api.login() method already handles token storage internally
        // Just call the onLogin callback with the user data
        toast.success(t('success.loginSuccess') + `, ${loginResponse.name}!`);
        onLogin(loginResponse);
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(t('error.invalidCredentials'));
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Sparkles className="h-6 w-6 text-white" />,
      title: t('login.features.aiTitle'),
      description: t('login.features.aiDesc')
    },
    {
      icon: <Users className="h-6 w-6 text-zinc-200" />,
      title: t('login.features.collabTitle'),
      description: t('login.features.collabDesc')
    },
    {
      icon: <BookOpen className="h-6 w-6 text-white" />,
      title: t('login.features.contentTitle'),
      description: t('login.features.contentDesc')
    },
    {
      icon: <Zap className="h-6 w-6 text-zinc-200" />,
      title: t('login.features.analyticsTitle'),
      description: t('login.features.analyticsDesc')
    }
  ];

  return (
    <div className="min-h-screen flex relative" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Language Switcher - Fixed Position */}
      <div className={`absolute top-4 z-50 ${isRTL ? 'left-4' : 'right-4'}`}>
        <LanguageSwitcher variant="outline" size="sm" />
      </div>

      {/* Left Panel - Features (becomes Right in RTL) */}
      <div className={`hidden lg:flex lg:w-1/2 p-12 flex-col justify-center relative overflow-hidden ${isRTL ? 'order-2' : 'order-1'}`}
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)'
        }}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          {/* Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl"></div>
        </div>
        
        {/* Geometric Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-20 w-32 h-32 border-2 border-teal-400/50 transform rotate-45"></div>
          <div className="absolute top-40 right-32 w-24 h-24 border-2 border-purple-400/50 transform rotate-12"></div>
          <div className="absolute bottom-32 left-40 w-20 h-20 border-2 border-cyan-400/50 transform -rotate-12"></div>
          <div className="absolute bottom-20 right-20 w-28 h-28 border-2 border-teal-400/50 transform rotate-45"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-8">
            <img src={logo} alt="CogneraX" className="h-12 w-auto me-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">CogneraX Learn</h1>
              <p className="text-white/80">{t('login.brand.subtitle')}</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            {t('login.hero.title')}{' '}
            <span className="block bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-white">
              {t('login.hero.subtitle')}
            </span>
          </h2>

          <p className="text-xl text-white/80 mb-12 leading-relaxed">
            {t('login.hero.description')}
          </p>

          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4 rtl:space-x-reverse">
                <div className="flex-shrink-0 w-12 h-12 text-white bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Right Panel - Login Form (becomes Left in RTL) */}
      <div className={`w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 via-white to-gray-100 ${isRTL ? 'order-1' : 'order-2'}`}>
        <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-4 pb-8">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <img src={logo} alt="CogneraX" className="h-10 w-auto me-3" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-zinc-900 to-zinc-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>

            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">{t('auth.welcomeBack')}</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                {t('auth.signInToAccount')}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">{t('auth.email')}</Label>
                <div className="relative">
                  {/* <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-4' : 'left-4'}`} /> */}
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-zinc-500 focus:ring-zinc-500 ${isRTL ? 'pr-14 pl-4' : 'pl-14 pr-4'}`}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                </div>
                <div className="relative">
                  {/* <Lock className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-4' : 'left-4'}`} /> */}
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 bg-gray-50 border-gray-200 focus:bg-white focus:border-zinc-500 focus:ring-zinc-500 ${isRTL ? 'pr-14 pl-12' : 'pl-14 pr-12'}`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-5 h-5 border-2 border-gray-300 rounded peer-checked:bg-zinc-900 peer-checked:border-zinc-900 transition-all duration-200"></div>
                    <div className="absolute top-1 left-1.5 w-2 h-3 border-r-2 border-b-2 border-white transform rotate-45 opacity-0 peer-checked:opacity-100 transition-opacity duration-200"></div>
                  </div>
                  <span className="text-gray-600 group-hover:text-gray-900 transition-colors">{t('auth.rememberMe')}</span>
                </label>
                <button type="button" className="text-sm text-zinc-600 hover:text-zinc-900 font-medium transition-colors">
                  {t('auth.forgotPassword')}
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gray-900 hover:bg-zinc-800 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('common.loading')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span>{t('auth.login')}</span>
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-gray-600">
                {t('auth.dontHaveAccount')}{' '}
                <button
                  onClick={onNavigateToSignup}
                  className="text-zinc-900 hover:text-zinc-700 font-medium transition-colors"
                >
                  {t('auth.signup')}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}