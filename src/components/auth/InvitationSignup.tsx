import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Building2,
  ArrowRight, 
  Check,
  Shield,
  UserPlus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { toast } from "sonner";
import { api } from '../../services/api';

interface InvitationSignupProps {
  onSignup: (userData: any) => void;
  logo: string;
}

export function InvitationSignup({ onSignup, logo }: InvitationSignupProps) {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [invitationError, setInvitationError] = useState('');


  useEffect(() => {
    const fetchInvitation = async () => {
      if (!token) {
        setInvitationError('Invalid invitation link');
        return;
      }

      try {
        const response = await api.invitation.getInvitationByToken(token);
        
        // Handle two possible response structures:
        // 1. { success: true, data: { invitation: {...} } }
        // 2. { invitation: {...} } (direct structure)
        let invitationData = null;
        
        if (response.success && response.data?.invitation) {
          invitationData = response.data.invitation;
        } else if (response.invitation) {
          invitationData = response.invitation;
        } else if (response.data?.invitation) {
          invitationData = response.data.invitation;
        }
        
        if (invitationData) {
          setInvitation(invitationData);
        } else {
          // Handle specific error cases
          const errorMessage = response.error?.message || response.message || 'Invalid invitation';
          if (errorMessage.includes('expired')) {
            setInvitationError('This invitation has expired. Please contact the administrator for a new invitation.');
          } else if (errorMessage.includes('exhausted') || errorMessage.includes('max uses')) {
            setInvitationError('This invitation has reached its maximum number of uses. Please contact the administrator for a new invitation.');
          } else if (errorMessage.includes('revoked')) {
            setInvitationError('This invitation has been revoked. Please contact the administrator.');
          } else if (errorMessage.includes('not found') || errorMessage.includes('invalid')) {
            setInvitationError('Invalid invitation link. Please check the URL or contact the administrator.');
          } else {
            setInvitationError(errorMessage);
          }
        }
      } catch (error: any) {
        console.error('Failed to load invitation:', error);
        if (error?.response?.status === 404) {
          setInvitationError('Invalid invitation link. Please check the URL or contact the administrator.');
        } else if (error?.response?.status === 400) {
          setInvitationError('This invitation is no longer valid. Please contact the administrator.');
        } else {
          setInvitationError('Failed to load invitation. Please check your internet connection and try again.');
        }
      }
    };

    fetchInvitation();
  }, [token]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast("Please fill in all required fields");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast("Please enter a valid email address");
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

    if (!formData.acceptTerms) {
      toast("You must accept the terms and conditions");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Register with invitation
      const response = await api.auth.registerWithInvitation({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        invitationToken: token!
      });
      
      if (response.success) {
        // Store tokens
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        toast(`Welcome to ${invitation?.organization?.name || 'the organization'}, ${response.user.name}!`);
        onSignup(response.user);
      } else {
        throw new Error(response.error.message);
      }
    } catch (error: any) {
      console.error('Signup failed:', error);
      toast.error(error?.message || 'Failed to create account. Please try again.');
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'instructor': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Shield className="h-4 w-4" />;
      case 'instructor': return <User className="h-4 w-4" />;
      case 'student': return <UserPlus className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  if (invitationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-8">
        <Card className="w-full max-w-md border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={logo} alt="CogneraX" className="h-10 w-auto mr-3" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                  CogneraX Learn
                </h1>
              </div>
            </div>
            
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <CardTitle className="text-xl font-bold text-gray-900">Invitation Error</CardTitle>
            <CardDescription className="text-gray-600">
              {invitationError}
            </CardDescription>
            
            {token && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-500 mb-2">Invitation Token:</p>
                <div className="flex items-center space-x-2">
                  <code className="text-xs bg-white px-2 py-1 rounded border flex-1 truncate">
                    {token}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(token);
                      toast('Token copied to clipboard');
                    }}
                    className="text-xs px-2 py-1"
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Please contact the administrator or try using a different invitation link.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast('URL copied to clipboard');
                  }}
                  variant="outline"
                  className="w-full h-10 border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Copy Invitation URL
                </Button>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                    className="flex-1 h-11 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={() => navigate('/login')}
                    className="flex-1 h-11 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white font-medium"
                  >
                    Go to Login
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Validating invitation...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center p-8">
      <Card className="w-full max-w-lg border-0 shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex items-center justify-center mb-4">
            <img src={logo} alt="CogneraX" className="h-10 w-auto mr-3" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-500 to-purple-600 bg-clip-text text-transparent">
                CogneraX Learn
              </h1>
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mx-auto mb-4">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">You're Invited!</CardTitle>
            <CardDescription className="text-gray-600 mt-2">
              Complete your account setup to join {invitation.organization?.name || 'the organization'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Invitation Details */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Organization:</span>
                <span className="text-sm text-blue-800 font-semibold">{invitation.organization?.name || 'Unknown'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Role:</span>
                <Badge variant="outline" className={getRoleColor(invitation.role || 'student')}>
                  {getRoleIcon(invitation.role || 'student')}
                  <span className="ml-1 capitalize">{invitation.role || 'student'}</span>
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Invited by:</span>
                <span className="text-sm text-blue-800">{invitation.invitedBy?.name || 'Administrator'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Remaining uses:</span>
                <span className="text-sm text-blue-800">{invitation.remainingUses || 0} / {invitation.maxUses || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-900">Expires:</span>
                <span className="text-sm text-blue-800">{invitation.expiresAt ? new Date(invitation.expiresAt).toLocaleDateString() : 'Unknown'}</span>
              </div>
              {invitation.message && (
                <div className="pt-2 border-t border-blue-200">
                  <span className="text-sm font-medium text-blue-900">Message:</span>
                  <p className="text-sm text-blue-800 mt-1">{invitation.message}</p>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  placeholder="Full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-9 h-11 bg-gray-50 border-gray-200 focus:bg-white focus:border-teal-500 focus:ring-teal-500"
                  required
                />
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
            <div className="flex items-center space-x-2">
              <input
                id="acceptTerms"
                type="checkbox"
                checked={formData.acceptTerms}
                onChange={(e) => handleInputChange('acceptTerms', e.target.checked)}
                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                required
              />
              <Label htmlFor="acceptTerms" className="text-sm text-gray-600">
                I accept the Terms of Service and Privacy Policy
              </Label>
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
                  <span>Complete Setup</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              By completing setup, you agree to the Terms of Service and Privacy Policy
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}