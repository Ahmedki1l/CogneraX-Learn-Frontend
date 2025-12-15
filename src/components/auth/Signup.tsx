import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ArrowRight, 
  ArrowLeft,
  User, 
  Building2, 
  CheckCircle,
  GraduationCap,
  Sparkles,
  Leaf,
  Globe
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';

interface SignupProps {
  onSignup: (userData: any) => void;
  onNavigateToLogin: () => void;
  logo: string;
}

export function Signup({ onSignup, onNavigateToLogin, logo }: SignupProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    organizationName: '',
    agreedToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t, isRTL } = useLanguage();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!formData.agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsLoading(true);

    try {
      const registerPayload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role as 'student' | 'instructor' | 'admin',
        ...(formData.organizationName ? { organizationName: formData.organizationName } : {})
      } as any;

      const user = await api.register(registerPayload);
      
      console.log('Registration successful:', user);
      toast.success(t('success.signupSuccess'));
      
      // Auto login after signup? Or just redirect?
      // The current flow seems to suggest immediate login or at least callback execution
      onSignup(user);

    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error.message || t('error.somethingWentWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // Features description based on role
  const getRoleFeatures = () => {
    switch (formData.role) {
      case 'instructor':
        return [
          { icon: <Sparkles className="h-5 w-5" />, text: t('signup.aiCourseCreation') },
          { icon: <Globe className="h-5 w-5" />, text: t('signup.reachGlobalAudience') },
          { icon: <CheckCircle className="h-5 w-5" />, text: t('signup.advancedAnalytics') }
        ];
      case 'admin':
        return [
          { icon: <Building2 className="h-5 w-5" />, text: t('signup.orgManagement') },
          { icon: <Leaf className="h-5 w-5" />, text: t('signup.scalableInfra') },
          { icon: <CheckCircle className="h-5 w-5" />, text: t('signup.enterpriseSecurity') }
        ];
      default: // student
        return [
          { icon: <GraduationCap className="h-5 w-5" />, text: t('signup.personalizedPath') },
          { icon: <Sparkles className="h-5 w-5" />, text: t('signup.aiTutorAssistance') },
          { icon: <CheckCircle className="h-5 w-5" />, text: t('signup.earnCertificates') }
        ];
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Left Panel - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-zinc-400 blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <img src={logo} alt="CogneraX" className={`h-10 w-auto ${isRTL ? 'ml-3' : 'mr-3'}`} />
            <span className="text-2xl font-bold text-white">CogneraX Learn</span>
          </div>

          <div className="space-y-6 mt-12">
            <h2 className="text-4xl font-bold text-white leading-tight">
              {t('signup.startJourney')}
            </h2>
            <p className="text-lg text-zinc-400 max-w-md">
              {t('signup.joinThousands')}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-4">
            {getRoleFeatures().map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 rtl:space-x-reverse text-zinc-300">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  {feature.icon}
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <p className="text-sm text-zinc-500">
              © 2024 CogneraX. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left rtl:lg:text-right">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('auth.createAccount')}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {t('auth.alreadyHaveAccount')} {' '}
              <button onClick={onNavigateToLogin} className="font-medium text-zinc-900 hover:text-zinc-700">
                {t('auth.login')}
              </button>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignup}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
                  <div className="relative">
                    <User className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} border-gray-200 focus:border-zinc-500 focus:ring-zinc-500`}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <div className="relative">
                    <Mail className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} border-gray-200 focus:border-zinc-500 focus:ring-zinc-500`}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">I am a...</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger className="border-gray-200 focus:ring-zinc-500">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="instructor">Instructor</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role !== 'student' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <Label htmlFor="organizationName">{t('auth.organization')}</Label>
                  <div className="relative">
                    <Building2 className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="organizationName"
                      placeholder="Organization Name"
                      value={formData.organizationName}
                      onChange={handleInputChange}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} border-gray-200 focus:border-zinc-500 focus:ring-zinc-500`}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} border-gray-200 focus:border-zinc-500 focus:ring-zinc-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <div className="relative">
                    <Lock className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 ${isRTL ? 'right-3' : 'left-3'}`} />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`${isRTL ? 'pr-10' : 'pl-10'} border-gray-200 focus:border-zinc-500 focus:ring-zinc-500`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`absolute top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 ${isRTL ? 'left-3' : 'right-3'}`}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 rtl:space-x-reverse pt-2">
                <Checkbox 
                  id="terms" 
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked: boolean) => 
                    setFormData(prev => ({ ...prev, agreedToTerms: checked as boolean }))
                  }
                  className="mt-1 data-[state=checked]:bg-zinc-900 border-gray-300"
                />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-600"
                  >
                    I agree to the <a href="#" className="text-zinc-900 hover:underline">Terms of Service</a> and <a href="#" className="text-zinc-900 hover:underline">Privacy Policy</a>
                  </Label>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white h-11 shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t('auth.createAccount')}...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 rtl:space-x-reverse">
                    <span>{t('auth.createAccount')}</span>
                    {isRTL ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}