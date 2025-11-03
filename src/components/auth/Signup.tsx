import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2,
  ArrowRight, 
  ArrowLeft,
  Check,
  Shield,
  Sparkles,
  Users,
  BookOpen
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import { api } from '../../services/api';

interface SignupProps {
  onSignup: (userData: any) => void;
  onNavigateToLogin: () => void;
  logo: string;
}

export function Signup({ onSignup, onNavigateToLogin, logo }: SignupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    organization: '',
    agreedToTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword || !formData.role || !formData.organization) {
      toast("Please fill in all required fields");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast("Passwords do not match");
      return false;
    }

    if (formData.password.length < 8) {
      toast("Password must be at least 8 characters long");
      return false;
    }

    if (!formData.agreedToTerms) {
      toast("Please agree to the Terms of Service and Privacy Policy");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Step 1: Register to create account and get token
      const registerResponse = await api.register({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: 'admin',
        organizationName: formData.organization
      });

      if (registerResponse.success && registerResponse.token) {
        // Store token
        localStorage.setItem('token', registerResponse.token);
        
        // Step 2: Call /auth/me to get complete user data
        try {
          const meResponse = await api.getMe();
          
          if (meResponse.success && meResponse.data) {
            toast.success(`Account created successfully! Welcome, ${meResponse.data.name}!`);
            onSignup(meResponse.data);
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (meError) {
          console.error('Failed to fetch user data:', meError);
          // Clear invalid token
          localStorage.removeItem('token');
          toast.error('Account created but authentication failed. Please login.');
          setIsLoading(false);
          return;
        }
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error?.error?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = {
    hasMinLength: formData.password.length >= 8,
    hasNumber: /\d/.test(formData.password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    hasUpperCase: /[A-Z]/.test(formData.password)
  };

  const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

  const features = [
    {
      icon: <Sparkles className="h-5 w-5 text-teal-600" />,
      text: "AI-powered content creation and analysis"
    },
    {
      icon: <Users className="h-5 w-5 text-purple-600" />,
      text: "Collaborative learning environment"
    },
    {
      icon: <BookOpen className="h-5 w-5 text-blue-600" />,
      text: "Comprehensive course management"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-600" />,
      text: "Secure and privacy-focused platform"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex">
      {/* Left Panel - Features */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-purple-600 via-purple-700 to-teal-600 p-12 flex-col justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-28 h-28 border-2 border-white transform rotate-45"></div>
          <div className="absolute top-32 right-28 w-20 h-20 border-2 border-white transform rotate-12"></div>
          <div className="absolute bottom-28 left-32 w-24 h-24 border-2 border-white transform -rotate-12"></div>
          <div className="absolute bottom-16 right-16 w-32 h-32 border-2 border-white transform rotate-45"></div>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="flex items-center mb-8">
            <img src={logo} alt="CogneraX" className="h-12 w-auto mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-white">CogneraX Learn</h1>
              <p className="text-purple-100">Join the Future of Education</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Start Your 
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Learning Journey
            </span>
          </h2>

          <p className="text-xl text-purple-100 mb-8 leading-relaxed">
            Join thousands of educators and learners who are already transforming 
            education with our AI-powered platform.
          </p>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  {feature.icon}
                </div>
                <p className="text-purple-100">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-3/5 flex items-center justify-center p-8">
        <Card className="w-full max-w-lg border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center lg:hidden mb-4">
              <img src={logo} alt="CogneraX" className="h-10 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>
            
            <div className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-gray-600 mt-2">
                Join the next generation of learning
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleSignup} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Role and Organization */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="instructor">Instructor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="organization"
                      placeholder="Organization name"
                      value={formData.organization}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
                      className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="pl-9 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formData.password && (
                  <div className="space-y-2 mt-2">
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= strengthScore
                              ? strengthScore === 1
                                ? 'bg-red-500'
                                : strengthScore === 2
                                ? 'bg-yellow-500'
                                : strengthScore === 3
                                ? 'bg-blue-500'
                                : 'bg-green-500'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasMinLength ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3" />
                        <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${passwordStrength.hasNumber ? 'text-green-600' : 'text-gray-400'}`}>
                        <Check className="h-3 w-3" />
                        <span>Contains a number</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-9 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked)}
                  className="mt-1"
                />
                <label htmlFor="terms" className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button type="button" className="text-teal-600 hover:text-teal-700 font-medium">
                    Privacy Policy
                  </button>
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-medium text-base shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <Separator />

            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <button
                  onClick={onNavigateToLogin}
                  className="text-teal-600 hover:text-teal-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}