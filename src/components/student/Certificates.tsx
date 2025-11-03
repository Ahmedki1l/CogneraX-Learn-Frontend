import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { ScrollArea } from '../ui/scroll-area';
import { Input } from '../ui/input';
import { 
  Award, Download, Share2, Eye, Star, Calendar, Clock, 
  Trophy, Shield, Zap, Target, Hexagon, ChevronRight,
  Copy, Check, ExternalLink, Medal, Crown, Gem,
  Facebook, Twitter, Linkedin, Mail, Link2
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { format } from 'date-fns';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface CertificatesProps {
  user: any;
}

interface Certificate {
  id: string;
  title: string;
  description: string;
  course: string;
  instructor: string;
  completionDate: Date;
  issueDate: Date;
  certificateNumber: string;
  creditsEarned: number;
  grade: string;
  skills: string[];
  verificationUrl: string;
  isVerified: boolean;
  template: 'standard' | 'premium' | 'advanced';
}

interface Badge_Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'completion' | 'performance' | 'engagement' | 'special';
  earnedDate: Date;
  progress: number;
  maxProgress: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

interface DigitalCredential {
  id: string;
  title: string;
  issuer: string;
  issueDate: Date;
  expiryDate?: Date;
  credentialUrl: string;
  blockchainVerified: boolean;
  skills: string[];
  type: 'certificate' | 'badge' | 'endorsement';
}

export const Certificates: React.FC<CertificatesProps> = ({ user }) => {
  const { t, language } = useLanguage();
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [activeTab, setActiveTab] = useState('certificates');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // State for certificates
  const [certificates, setCertificates] = useState<Certificate[]>([]);

  // Fetch certificates from API
  React.useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await api.user.getCertificates();
        console.log('🏆 Certificates response:', response);
        
        // Extract data from response wrapper
        if (response && response.success && response.data) {
          const certificatesData = response.data;
          const formattedCertificates = certificatesData.map((cert: any) => ({
            id: cert._id || cert.id,
            title: cert.title,
            description: cert.description || '',
            course: cert.course?.title || cert.courseName || '',
            instructor: cert.instructor?.name || cert.instructorName || '',
            completionDate: new Date(cert.completedAt || cert.completionDate),
            issueDate: new Date(cert.issuedAt || cert.issueDate),
            certificateNumber: cert.certificateNumber || cert.number || '',
            creditsEarned: cert.creditsEarned || 0,
            grade: cert.grade || 'A',
            skills: cert.skills || [],
            verificationUrl: cert.verificationUrl || '',
            isVerified: cert.isVerified || false,
            template: cert.template || 'standard'
          }));
          setCertificates(formattedCertificates);
        } else {
          console.warn('⚠️ No certificates or invalid response structure');
          setCertificates([]);
        }

      } catch (error: any) {
        console.error('Error fetching certificates:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Certificates endpoint not implemented yet');
          setCertificates([]);
        } else {
          toast.error('Failed to load certificates');
          setCertificates([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, [user?.id, user?._id]);

  // Mock data for fallback
  const mockCertificates: Certificate[] = [
    {
      id: '1',
      title: 'React Development Mastery',
      description: 'Comprehensive certification in React development covering hooks, state management, and advanced patterns',
      course: 'React Development Masterclass',
      instructor: 'Dr. Emily Watson',
      completionDate: new Date('2024-01-15'),
      issueDate: new Date('2024-01-16'),
      certificateNumber: 'CX-RDM-2024-001',
      creditsEarned: 40,
      grade: 'A+',
      skills: ['React', 'JavaScript', 'State Management', 'Component Architecture'],
      verificationUrl: 'https://cognerax.learn/verify/CX-RDM-2024-001',
      isVerified: true,
      template: 'premium'
    },
    {
      id: '2',
      title: 'Python Fundamentals',
      description: 'Foundation certification in Python programming fundamentals and best practices',
      course: 'Python Programming Basics',
      instructor: 'Prof. Michael Chen',
      completionDate: new Date('2023-12-20'),
      issueDate: new Date('2023-12-21'),
      certificateNumber: 'CX-PYF-2023-087',
      creditsEarned: 25,
      grade: 'A',
      skills: ['Python', 'Data Structures', 'Algorithms', 'Problem Solving'],
      verificationUrl: 'https://cognerax.learn/verify/CX-PYF-2023-087',
      isVerified: true,
      template: 'standard'
    }
  ];

  const [badges, setBadges] = useState<Badge_Achievement[]>([
    {
      id: '1',
      name: 'First Course Complete',
      description: 'Completed your first course successfully',
      icon: 'trophy',
      category: 'completion',
      earnedDate: new Date('2023-12-21'),
      progress: 1,
      maxProgress: 1,
      rarity: 'common',
      points: 50
    },
    {
      id: '2',
      name: 'Perfect Score',
      description: 'Achieved 100% on a quiz',
      icon: 'star',
      category: 'performance',
      earnedDate: new Date('2024-01-10'),
      progress: 3,
      maxProgress: 5,
      rarity: 'rare',
      points: 100
    },
    {
      id: '3',
      name: 'Learning Streak',
      description: 'Maintained a 7-day learning streak',
      icon: 'zap',
      category: 'engagement',
      earnedDate: new Date('2024-01-15'),
      progress: 7,
      maxProgress: 7,
      rarity: 'epic',
      points: 200
    },
    {
      id: '4',
      name: 'React Master',
      description: 'Completed all React courses with distinction',
      icon: 'crown',
      category: 'special',
      earnedDate: new Date('2024-01-16'),
      progress: 1,
      maxProgress: 1,
      rarity: 'legendary',
      points: 500
    }
  ]);

  const [credentials, setCredentials] = useState<DigitalCredential[]>([
    {
      id: '1',
      title: 'CogneraX Certified React Developer',
      issuer: 'CogneraX Education',
      issueDate: new Date('2024-01-16'),
      credentialUrl: 'https://cognerax.learn/credentials/react-dev-2024',
      blockchainVerified: true,
      skills: ['React', 'JavaScript', 'Frontend Development'],
      type: 'certificate'
    },
    {
      id: '2',
      title: 'Python Programming Proficiency',
      issuer: 'CogneraX Education',
      issueDate: new Date('2023-12-21'),
      credentialUrl: 'https://cognerax.learn/credentials/python-basic-2023',
      blockchainVerified: true,
      skills: ['Python', 'Programming Fundamentals'],
      type: 'badge'
    }
  ]);

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'trophy': return <Trophy className="h-6 w-6" />;
      case 'star': return <Star className="h-6 w-6" />;
      case 'zap': return <Zap className="h-6 w-6" />;
      case 'crown': return <Crown className="h-6 w-6" />;
      case 'shield': return <Shield className="h-6 w-6" />;
      case 'target': return <Target className="h-6 w-6" />;
      case 'medal': return <Medal className="h-6 w-6" />;
      case 'gem': return <Gem className="h-6 w-6" />;
      default: return <Award className="h-6 w-6" />;
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'legendary': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800 border-orange-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'common': return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
      case 'rare': return <div className="w-2 h-2 bg-blue-500 rounded-full" />;
      case 'epic': return <div className="w-2 h-2 bg-purple-500 rounded-full" />;
      case 'legendary': return <div className="w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full" />;
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const downloadCertificate = async (certificate: Certificate) => {
    try {
      const response = await api.user.downloadCertificate(certificate.id);
      console.log('📄 Download certificate response:', response);
      
      if (response && response.success && response.data) {
        // Handle PDF download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${certificate.title.replace(/\s+/g, '_')}_Certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Certificate downloaded successfully!');
      } else {
        console.warn('⚠️ Certificate download failed or invalid response');
        toast.error('Failed to download certificate');
      }
    } catch (error: any) {
      console.error('Failed to download certificate:', error);
      
      // Handle missing endpoint gracefully
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Certificate download endpoint not implemented yet');
        toast.info('Certificate download feature coming soon');
      } else {
        toast.error('Failed to download certificate');
      }
    }
  };

  const verifyCertificate = async (certificateNumber: string) => {
    try {
      const response = await api.user.verifyCertificate(certificateNumber);
      console.log('🔍 Verify certificate response:', response);
      
      if (response && response.success && response.data) {
        toast.success('Certificate verified successfully!');
        return response.data;
      } else {
        console.warn('⚠️ Certificate verification failed or invalid response');
        toast.error('Failed to verify certificate');
        return null;
      }
    } catch (error: any) {
      console.error('Failed to verify certificate:', error);
      
      // Handle missing endpoint gracefully
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Certificate verification endpoint not implemented yet');
        toast.info('Certificate verification feature coming soon');
        return null;
      } else {
        toast.error('Failed to verify certificate');
        return null;
      }
    }
  };

  const shareToSocial = (platform: string, certificate: Certificate) => {
    const url = certificate.verificationUrl;
    const text = `I just earned my ${certificate.title} certificate from CogneraX Learn!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyVerificationLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const CertificateTemplate: React.FC<{ certificate: Certificate }> = ({ certificate }) => (
    <div ref={certificateRef} className="bg-white p-12 border-8 border-cognerax-teal relative overflow-hidden" style={{ width: '1056px', height: '816px' }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="grid grid-cols-8 grid-rows-6 gap-4 h-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <Hexagon key={i} className="w-full h-full text-cognerax-purple" />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-8 relative">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-cognerax-gradient rounded-full flex items-center justify-center">
            <Award className="h-12 w-12 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-cognerax-teal mb-2">CogneraX Learn</h1>
        <p className="text-lg text-gray-600">{t('Certificate of Completion')}</p>
      </div>

      {/* Main Content */}
      <div className="text-center mb-8 relative">
        <p className="text-xl mb-4">{t('This is to certify that')}</p>
        <h2 className="text-5xl font-bold text-cognerax-purple mb-6">{user.name}</h2>
        <p className="text-xl mb-4">{t('has successfully completed the course')}</p>
        <h3 className="text-3xl font-semibold text-cognerax-teal mb-6">{certificate.title}</h3>
        
        <div className="grid grid-cols-3 gap-8 mb-8">
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('Completion Date')}</p>
            <p className="font-semibold">{format(certificate.completionDate, 'MMMM dd, yyyy')}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('Final Grade')}</p>
            <p className="font-semibold">{certificate.grade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">{t('Credits Earned')}</p>
            <p className="font-semibold">{certificate.creditsEarned} {t('credits')}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-end relative">
        <div className="text-center">
          <div className="w-48 border-t-2 border-gray-300 mb-2"></div>
          <p className="text-sm font-semibold">{certificate.instructor}</p>
          <p className="text-xs text-gray-600">{t('Course Instructor')}</p>
        </div>
        
        <div className="text-center">
          <div className="w-48 border-t-2 border-gray-300 mb-2"></div>
          <p className="text-sm font-semibold">CogneraX Education</p>
          <p className="text-xs text-gray-600">{t('Digital Learning Platform')}</p>
        </div>
      </div>

      {/* Certificate Number */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        {t('Certificate No')}: {certificate.certificateNumber}
      </div>
      
      {/* Verification QR placeholder */}
      <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-200 flex items-center justify-center text-xs text-gray-500">
        QR Code
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-cognerax-gradient bg-clip-text text-transparent">
            {t('Certificates & Credentials')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('Your earned certificates, badges, and digital credentials')}
          </p>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Award className="h-6 w-6 text-cognerax-teal mx-auto mb-1" />
              <p className="text-2xl font-bold text-cognerax-teal">{certificates.length}</p>
              <p className="text-xs text-muted-foreground">{t('Certificates')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-cognerax-purple mx-auto mb-1" />
              <p className="text-2xl font-bold text-cognerax-purple">{badges.length}</p>
              <p className="text-xs text-muted-foreground">{t('Badges')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-500">{badges.reduce((sum, badge) => sum + badge.points, 0)}</p>
              <p className="text-xs text-muted-foreground">{t('Points')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {t('Certificates')}
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            {t('Badges')}
          </TabsTrigger>
          <TabsTrigger value="credentials" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            {t('Digital Credentials')}
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            {t('Share & Verify')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate.id} className="hover:shadow-cognerax transition-all duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-cognerax-teal" />
                        {certificate.title}
                        {certificate.isVerified && <Shield className="h-4 w-4 text-green-500" />}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {certificate.description}
                      </CardDescription>
                    </div>
                    <Badge className={`${certificate.template === 'premium' ? 'bg-cognerax-gradient' : 'bg-gray-500'} text-white`}>
                      {t(certificate.template)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Course')}</p>
                      <p className="font-medium">{certificate.course}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Grade')}</p>
                      <p className="font-medium">{certificate.grade}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Completed')}</p>
                      <p className="font-medium">{format(certificate.completionDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Credits')}</p>
                      <p className="font-medium">{certificate.creditsEarned}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('Skills Demonstrated')}</p>
                    <div className="flex flex-wrap gap-1">
                      {certificate.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="flex-1 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3">
                          <Eye className="h-4 w-4 mr-2" />
                          {t('Preview')}
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                        <DialogHeader>
                          <DialogTitle>{certificate.title}</DialogTitle>
                        </DialogHeader>
                        <div className="flex justify-center">
                          <div className="transform scale-75 origin-top">
                            <CertificateTemplate certificate={certificate} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={() => downloadCertificate(certificate)} className="bg-cognerax-gradient">
                            <Download className="h-4 w-4 mr-2" />
                            {t('Download PDF')}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      className="bg-cognerax-gradient"
                      onClick={() => downloadCertificate(certificate)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {t('Download')}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedCertificate(certificate)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      {t('Share')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className={`hover:shadow-cognerax transition-all duration-200 border-2 ${getRarityColor(badge.rarity)}`}>
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    <div className={`p-4 rounded-full ${getRarityColor(badge.rarity)}`}>
                      {getBadgeIcon(badge.icon)}
                    </div>
                  </div>
                  
                  <h3 className="font-semibold mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {badge.description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1">
                        {getRarityIcon(badge.rarity)}
                        {t(badge.rarity)}
                      </span>
                      <span className="font-medium">{badge.points} pts</span>
                    </div>
                    
                    {badge.maxProgress > 1 && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{t('Progress')}</span>
                          <span>{badge.progress}/{badge.maxProgress}</span>
                        </div>
                        <Progress value={(badge.progress / badge.maxProgress) * 100} className="h-1" />
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {t('Earned')} {format(badge.earnedDate, 'MMM dd, yyyy')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Badge Categories */}
          <Card>
            <CardHeader>
              <CardTitle>{t('Badge Categories')}</CardTitle>
              <CardDescription>
                {t('Track your progress across different achievement categories')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { category: 'completion', icon: <Award className="h-5 w-5" />, count: badges.filter(b => b.category === 'completion').length },
                  { category: 'performance', icon: <Star className="h-5 w-5" />, count: badges.filter(b => b.category === 'performance').length },
                  { category: 'engagement', icon: <Zap className="h-5 w-5" />, count: badges.filter(b => b.category === 'engagement').length },
                  { category: 'special', icon: <Crown className="h-5 w-5" />, count: badges.filter(b => b.category === 'special').length }
                ].map((cat) => (
                  <div key={cat.category} className="text-center p-4 border rounded-lg">
                    <div className="flex justify-center mb-2 text-cognerax-teal">
                      {cat.icon}
                    </div>
                    <p className="font-semibold">{cat.count}</p>
                    <p className="text-sm text-muted-foreground">{t(cat.category)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {credentials.map((credential) => (
              <Card key={credential.id} className="hover:shadow-cognerax transition-all duration-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-cognerax-teal" />
                    {credential.title}
                    {credential.blockchainVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        {t('Blockchain Verified')}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t('Issued by')} {credential.issuer}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">{t('Issue Date')}</p>
                      <p className="font-medium">{format(credential.issueDate, 'MMM dd, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t('Type')}</p>
                      <p className="font-medium">{t(credential.type)}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{t('Skills')}</p>
                    <div className="flex flex-wrap gap-1">
                      {credential.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => window.open(credential.credentialUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      {t('View Online')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => copyVerificationLink(credential.credentialUrl)}
                    >
                      {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="share" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('Share Your Achievements')}</CardTitle>
              <CardDescription>
                {t('Share your certificates and achievements on social media or with employers')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{certificate.title}</h4>
                      <p className="text-sm text-muted-foreground">{certificate.course}</p>
                    </div>
                    <Badge className="bg-cognerax-gradient text-white">
                      {t('Verified')}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">{t('Verification Link')}</p>
                      <div className="flex gap-2">
                        <Input 
                          value={certificate.verificationUrl} 
                          readOnly 
                          className="font-mono text-xs"
                        />
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => copyVerificationLink(certificate.verificationUrl)}
                        >
                          {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">{t('Share on Social Media')}</p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareToSocial('linkedin', certificate)}
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareToSocial('twitter', certificate)}
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => shareToSocial('facebook', certificate)}
                        >
                          <Facebook className="h-4 w-4 mr-2" />
                          Facebook
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          
          {/* Verification Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>{t('For Employers & Verifiers')}</CardTitle>
              <CardDescription>
                {t('How to verify certificates and credentials')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-cognerax-teal text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">{t('Visit Verification URL')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('Use the verification link provided by the certificate holder')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-cognerax-teal text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">{t('Enter Certificate Number')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('Input the certificate number to access detailed information')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 bg-cognerax-teal text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">{t('View Verification Details')}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t('Access comprehensive details about the achievement and skills')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Share Certificate Modal */}
      {selectedCertificate && (
        <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('Share Certificate')}</DialogTitle>
              <DialogDescription>
                {selectedCertificate.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">{t('Share on Social Media')}</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocial('linkedin', selectedCertificate)}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Linkedin className="h-5 w-5" />
                    <span className="text-xs">LinkedIn</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocial('twitter', selectedCertificate)}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Twitter className="h-5 w-5" />
                    <span className="text-xs">Twitter</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => shareToSocial('facebook', selectedCertificate)}
                    className="flex flex-col gap-1 h-auto py-3"
                  >
                    <Facebook className="h-5 w-5" />
                    <span className="text-xs">Facebook</span>
                  </Button>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">{t('Verification Link')}</p>
                <div className="flex gap-2">
                  <Input 
                    value={selectedCertificate.verificationUrl} 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyVerificationLink(selectedCertificate.verificationUrl)}
                  >
                    {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                {copySuccess && (
                  <p className="text-xs text-green-600 mt-1">{t('Link copied to clipboard!')}</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={() => setSelectedCertificate(null)}>
                {t('Close')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};