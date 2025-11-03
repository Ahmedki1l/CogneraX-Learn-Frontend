import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Award, 
  Trophy, 
  Star, 
  Target, 
  Flame, 
  BookOpen, 
  Zap, 
  Crown, 
  Medal,
  CheckCircle,
  Lock,
  Calendar,
  TrendingUp,
  Users,
  Clock,
  Brain,
  Sparkles,
  Gift
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../../services/api';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'completion' | 'performance' | 'streak' | 'social' | 'special';
  icon: React.ComponentType<any>;
  iconColor: string;
  bgColor: string;
  borderColor: string;
  isEarned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirements: string;
}

interface AchievementsProps {
  user?: any;
}

export function Achievements({ user }: AchievementsProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();

  // Fetch achievements from API
  React.useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setLoading(true);
        
        // Use either user.id or user._id (MongoDB)
        const userId = user?.id || user?._id;
        
        if (!userId) {
          setLoading(false);
          return;
        }

        const response = await api.user.getAchievements();
        console.log('🏆 Achievements response:', response);
        
        // Extract data from response wrapper
        if (response && response.success && response.data) {
          const achievementsData = response.data;
          const formattedAchievements = achievementsData.map((achievement: any) => ({
            id: achievement._id || achievement.id,
            title: achievement.title,
            description: achievement.description,
            category: achievement.category || 'completion',
            icon: getIconForCategory(achievement.category),
            iconColor: getIconColorForCategory(achievement.category),
            bgColor: getBgColorForCategory(achievement.category),
            borderColor: getBorderColorForCategory(achievement.category),
            isEarned: achievement.status === 'earned',
            earnedDate: achievement.earnedAt,
            progress: achievement.progress || 0,
            maxProgress: achievement.maxProgress || 100,
            rarity: achievement.rarity || 'common',
            points: achievement.points || 10,
            requirements: achievement.requirements || ''
          }));
          setAchievements(formattedAchievements);
        } else {
          console.warn('⚠️ No achievements or invalid response structure');
          setAchievements([]);
        }

      } catch (error: any) {
        console.error('Error fetching achievements:', error);
        
        // Handle missing endpoint gracefully
        if (error.status === 401 || error.status === 404) {
          console.warn('⚠️ Achievements endpoint not implemented yet');
          setAchievements([]);
        } else {
          toast.error('Failed to load achievements');
          setAchievements([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user?.id, user?._id]);

  // Helper functions for achievement formatting
  const getIconForCategory = (category: string) => {
    switch (category) {
      case 'completion': return BookOpen;
      case 'performance': return Target;
      case 'streak': return Flame;
      case 'social': return Users;
      case 'special': return Crown;
      default: return Award;
    }
  };

  const getIconColorForCategory = (category: string) => {
    switch (category) {
      case 'completion': return 'text-blue-600';
      case 'performance': return 'text-green-600';
      case 'streak': return 'text-orange-600';
      case 'social': return 'text-purple-600';
      case 'special': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getBgColorForCategory = (category: string) => {
    switch (category) {
      case 'completion': return 'bg-blue-50';
      case 'performance': return 'bg-green-50';
      case 'streak': return 'bg-orange-50';
      case 'social': return 'bg-purple-50';
      case 'special': return 'bg-yellow-50';
      default: return 'bg-gray-50';
    }
  };

  const getBorderColorForCategory = (category: string) => {
    switch (category) {
      case 'completion': return 'border-blue-200';
      case 'performance': return 'border-green-200';
      case 'streak': return 'border-orange-200';
      case 'social': return 'border-purple-200';
      case 'special': return 'border-yellow-200';
      default: return 'border-gray-200';
    }
  };

  // Claim achievement handler
  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const response = await api.user.claimAchievement(achievementId);
      console.log('🏆 Claim achievement response:', response);
      
      if (response && response.success) {
        // Update local state
        setAchievements(achievements.map(achievement => 
          achievement.id === achievementId 
            ? { ...achievement, isEarned: true, earnedDate: new Date().toISOString() }
            : achievement
        ));
        toast.success('Achievement claimed! 🎉');
      } else {
        console.warn('⚠️ Achievement claim failed or invalid response');
        toast.error('Failed to claim achievement');
      }
    } catch (error: any) {
      console.error('Failed to claim achievement:', error);
      
      // Handle missing endpoint gracefully
      if (error.status === 401 || error.status === 404) {
        console.warn('⚠️ Claim achievement endpoint not implemented yet');
        toast.info('Achievement claiming feature coming soon');
      } else {
        toast.error('Failed to claim achievement');
      }
    }
  };

  // Mock data for achievements
  const mockAchievements: Achievement[] = [
    // Earned Achievements
    {
      id: '1',
      title: 'First Steps',
      description: 'Complete your first course',
      category: 'completion',
      icon: BookOpen,
      iconColor: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      isEarned: true,
      earnedDate: '2024-11-10',
      rarity: 'common',
      points: 10,
      requirements: 'Complete 1 course'
    },
    {
      id: '2',
      title: 'Quiz Master',
      description: 'Score 100% on a quiz',
      category: 'performance',
      icon: Trophy,
      iconColor: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      isEarned: true,
      earnedDate: '2024-11-15',
      rarity: 'rare',
      points: 25,
      requirements: 'Score 100% on any quiz'
    },
    {
      id: '3',
      title: 'Learning Streak',
      description: 'Study for 7 consecutive days',
      category: 'streak',
      icon: Flame,
      iconColor: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      isEarned: true,
      earnedDate: '2024-11-08',
      rarity: 'rare',
      points: 30,
      requirements: 'Study for 7 consecutive days'
    },

    // Pending Achievements
    {
      id: '4',
      title: 'Course Collector',
      description: 'Complete 5 courses',
      category: 'completion',
      icon: Star,
      iconColor: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      isEarned: false,
      progress: 1,
      maxProgress: 5,
      rarity: 'epic',
      points: 50,
      requirements: 'Complete 5 courses'
    },
    {
      id: '5',
      title: 'Speed Learner',
      description: 'Complete a course in under 24 hours',
      category: 'performance',
      icon: Zap,
      iconColor: 'text-cyan-500',
      bgColor: 'bg-cyan-50',
      borderColor: 'border-cyan-200',
      isEarned: false,
      rarity: 'epic',
      points: 40,
      requirements: 'Complete any course within 24 hours'
    },
    {
      id: '6',
      title: 'Perfect Month',
      description: 'Study every day for a month',
      category: 'streak',
      icon: Calendar,
      iconColor: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      isEarned: false,
      progress: 12,
      maxProgress: 30,
      rarity: 'legendary',
      points: 100,
      requirements: 'Study for 30 consecutive days'
    },
    {
      id: '7',
      title: 'Knowledge Sharer',
      description: 'Help 10 fellow students',
      category: 'social',
      icon: Users,
      iconColor: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200',
      isEarned: false,
      progress: 3,
      maxProgress: 10,
      rarity: 'rare',
      points: 35,
      requirements: 'Help 10 fellow students in discussions'
    },
    {
      id: '8',
      title: 'Grade A Student',
      description: 'Maintain 90%+ average across all courses',
      category: 'performance',
      icon: Crown,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      isEarned: false,
      progress: 88,
      maxProgress: 90,
      rarity: 'epic',
      points: 60,
      requirements: 'Maintain 90%+ average grade'
    },
    {
      id: '9',
      title: 'Early Bird',
      description: 'Complete 50 early morning study sessions',
      category: 'special',
      icon: Clock,
      iconColor: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      isEarned: false,
      progress: 15,
      maxProgress: 50,
      rarity: 'rare',
      points: 30,
      requirements: 'Study before 8 AM, 50 times'
    },
    {
      id: '10',
      title: 'Brain Power',
      description: 'Score 95%+ on 10 different quizzes',
      category: 'performance',
      icon: Brain,
      iconColor: 'text-violet-500',
      bgColor: 'bg-violet-50',
      borderColor: 'border-violet-200',
      isEarned: false,
      progress: 4,
      maxProgress: 10,
      rarity: 'legendary',
      points: 75,
      requirements: 'Score 95%+ on 10 different quizzes'
    },
    {
      id: '11',
      title: 'Course Creator\'s Choice',
      description: 'Get featured as student of the month',
      category: 'special',
      icon: Sparkles,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      isEarned: false,
      rarity: 'legendary',
      points: 150,
      requirements: 'Be selected as student of the month'
    },
    {
      id: '12',
      title: 'Milestone Master',
      description: 'Complete 100 lessons',
      category: 'completion',
      icon: Target,
      iconColor: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      isEarned: false,
      progress: 45,
      maxProgress: 100,
      rarity: 'epic',
      points: 80,
      requirements: 'Complete 100 individual lessons'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Achievements', icon: Award },
    { id: 'completion', label: 'Completion', icon: BookOpen },
    { id: 'performance', label: 'Performance', icon: Trophy },
    { id: 'streak', label: 'Streaks', icon: Flame },
    { id: 'social', label: 'Social', icon: Users },
    { id: 'special', label: 'Special', icon: Sparkles }
  ];

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  const earnedAchievements = achievements.filter(a => a.isEarned);
  const pendingAchievements = achievements.filter(a => !a.isEarned);
  const totalPoints = earnedAchievements.reduce((sum, a) => sum + a.points, 0);
  const completionRate = Math.round((earnedAchievements.length / achievements.length) * 100);

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Common</Badge>;
      case 'rare':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Rare</Badge>;
      case 'epic':
        return <Badge className="bg-purple-100 text-purple-800 border-purple-300">Epic</Badge>;
      case 'legendary':
        return <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">Legendary</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Common</Badge>;
    }
  };

  const AchievementCard = ({ achievement }: { achievement: Achievement }) => (
    <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-lg ${
      achievement.isEarned 
        ? `${achievement.bgColor} ${achievement.borderColor} border-2` 
        : 'bg-gray-50 border-gray-200 opacity-75'
    }`}>
      {achievement.isEarned && (
        <div className="absolute top-3 right-3">
          <CheckCircle className="h-6 w-6 text-green-500" />
        </div>
      )}
      
      {!achievement.isEarned && (
        <div className="absolute top-3 right-3">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-full ${achievement.isEarned ? achievement.bgColor : 'bg-gray-100'}`}>
            <achievement.icon className={`h-6 w-6 ${achievement.isEarned ? achievement.iconColor : 'text-gray-400'}`} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className={`text-lg ${achievement.isEarned ? 'text-gray-900' : 'text-gray-500'}`}>
                {achievement.title}
              </CardTitle>
              {getRarityBadge(achievement.rarity)}
            </div>
            <CardDescription className={achievement.isEarned ? 'text-gray-600' : 'text-gray-400'}>
              {achievement.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar for Pending Achievements */}
        {!achievement.isEarned && achievement.progress !== undefined && achievement.maxProgress && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-gray-700">
                {achievement.progress}/{achievement.maxProgress}
              </span>
            </div>
            <Progress 
              value={(achievement.progress / achievement.maxProgress) * 100} 
              className="h-2"
            />
          </div>
        )}

        {/* Earned Date */}
        {achievement.isEarned && achievement.earnedDate && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="h-4 w-4" />
            <span>Earned on {new Date(achievement.earnedDate).toLocaleDateString()}</span>
          </div>
        )}

        {/* Requirements */}
        <div className="text-sm text-gray-500">
          <span className="font-medium">Requirements: </span>
          {achievement.requirements}
        </div>

        {/* Points */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <Gift className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium text-purple-600">
              {achievement.points} points
            </span>
          </div>
          
          {!achievement.isEarned && achievement.progress !== undefined && achievement.maxProgress && (
            <div className="text-xs text-gray-500">
              {Math.round((achievement.progress / achievement.maxProgress) * 100)}% complete
            </div>
          )}
        </div>

        {/* Claim Button for Ready Achievements */}
        {!achievement.isEarned && achievement.progress !== undefined && achievement.maxProgress && 
         achievement.progress >= achievement.maxProgress && (
          <Button 
            onClick={() => handleClaimAchievement(achievement.id)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Gift className="h-4 w-4 mr-2" />
            Claim Achievement
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent">
          {t('achievements.title')}
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('achievements.description')}
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Points</p>
                <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
              </div>
              <Gift className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Earned</p>
                <p className="text-2xl font-bold text-gray-900">{earnedAchievements.length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{pendingAchievements.length}</p>
              </div>
              <Lock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completion</p>
                <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 ${
                  selectedCategory === category.id 
                    ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white' 
                    : ''
                }`}
              >
                <Icon className="h-4 w-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* Achievements Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Achievements</TabsTrigger>
          <TabsTrigger value="earned">Earned ({earnedAchievements.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingAchievements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="space-y-4">
          {earnedAchievements.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements earned yet</h3>
              <p className="text-gray-500">Start learning to unlock your first achievement!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {earnedAchievements
                .filter(achievement => selectedCategory === 'all' || achievement.category === selectedCategory)
                .map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingAchievements
              .filter(achievement => selectedCategory === 'all' || achievement.category === selectedCategory)
              .sort((a, b) => {
                // Sort by progress percentage for achievements with progress
                if (a.progress && a.maxProgress && b.progress && b.maxProgress) {
                  const aPercent = (a.progress / a.maxProgress) * 100;
                  const bPercent = (b.progress / b.maxProgress) * 100;
                  return bPercent - aPercent;
                }
                // Sort achievements with progress first
                if (a.progress && !b.progress) return -1;
                if (!a.progress && b.progress) return 1;
                return 0;
              })
              .map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Achievement Points Leaderboard Teaser */}
      <Card className="bg-gradient-to-r from-teal-50 to-purple-50 border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Achievement Leaderboard
          </CardTitle>
          <CardDescription>
            See how you rank among your peers in achievement points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
              <div className="flex items-center gap-3">
                <Medal className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">You</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-purple-600">{totalPoints} points</span>
                <Badge variant="outline">Rank #12</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full">
              View Full Leaderboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}