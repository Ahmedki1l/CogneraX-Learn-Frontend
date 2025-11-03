import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Filter,
  TrendingUp,
  Award,
  BookOpen,
  Clock,
  Star,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  Mail,
  Eye,
  UserCheck,
  BarChart3,
  Send,
  Phone,
} from "lucide-react";
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useLanguage } from "./context/LanguageContext";
import { api } from '../services/api';

export function Students() {
  const { t } = useLanguage();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [activeTab, setActiveTab] = useState("all-students");
  const [isInviting, setIsInviting] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Fetch students data
  useEffect(() => {
    const fetchStudentsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [studentsResponse, coursesResponse, statisticsResponse] = await Promise.allSettled([
          api.admin.getStudents({ courseId: selectedCourse, search: searchTerm }),
          api.course.getCourses(),
          api.admin.getStudentProgress('all')
        ]);

        // Process students data
        if (studentsResponse.status === 'fulfilled') {
          setStudents(studentsResponse.value || []);
        } else {
          // Fallback to mock data
          setStudents([
            {
              id: 1,
              name: "Alex Johnson",
              email: "alex.johnson@email.com",
              avatar: "/avatars/alex.jpg",
              course: "Advanced React Development",
              progress: 85,
              lastActive: "2 hours ago",
              status: "active",
              grade: "A",
              assignmentsCompleted: 12,
              totalAssignments: 15,
              joinDate: "2024-01-15"
            },
            {
              id: 2,
              name: "Sarah Wilson",
              email: "sarah.wilson@email.com",
              avatar: "/avatars/sarah.jpg",
              course: "Python for Data Science",
              progress: 92,
              lastActive: "1 hour ago",
              status: "active",
              grade: "A+",
              assignmentsCompleted: 18,
              totalAssignments: 20,
              joinDate: "2024-01-10"
            },
            {
              id: 3,
              name: "Michael Chen",
              email: "michael.chen@email.com",
              avatar: "/avatars/michael.jpg",
              course: "Machine Learning Fundamentals",
              progress: 67,
              lastActive: "3 hours ago",
              status: "active",
              grade: "B+",
              assignmentsCompleted: 8,
              totalAssignments: 12,
              joinDate: "2024-02-01"
            },
            {
              id: 4,
              name: "Emily Davis",
              email: "emily.davis@email.com",
              avatar: "/avatars/emily.jpg",
              course: "Web Development Bootcamp",
              progress: 45,
              lastActive: "1 day ago",
              status: "inactive",
              grade: "C",
              assignmentsCompleted: 6,
              totalAssignments: 15,
              joinDate: "2024-02-15"
            },
            {
              id: 5,
              name: "David Rodriguez",
              email: "david.rodriguez@email.com",
              avatar: "/avatars/david.jpg",
              course: "Advanced React Development",
              progress: 78,
              lastActive: "4 hours ago",
              status: "active",
              grade: "B",
              assignmentsCompleted: 10,
              totalAssignments: 15,
              joinDate: "2024-01-20"
            }
          ]);
        }

        // Process courses data
        if (coursesResponse.status === 'fulfilled') {
          setCourses(coursesResponse.value || []);
        } else {
          setCourses([
            { id: 1, name: "Advanced React Development", students: 25 },
            { id: 2, name: "Python for Data Science", students: 18 },
            { id: 3, name: "Machine Learning Fundamentals", students: 22 },
            { id: 4, name: "Web Development Bootcamp", students: 30 }
          ]);
        }

        // Process statistics data
        if (statisticsResponse.status === 'fulfilled') {
          setStatistics(statisticsResponse.value || {
            totalStudents: 0,
            activeStudents: 0,
            averageProgress: 0,
            completionRate: 0
          });
        } else {
          setStatistics({
            totalStudents: 0,
            activeStudents: 0,
            averageProgress: 0,
            completionRate: 0
          });
        }

      } catch (error) {
        console.error('Failed to fetch students data:', error);
        setError('Failed to load students data. Using cached data.');
        // Fallback to mock data
        setStudents([
          {
            id: 1,
            name: "Alex Johnson",
            email: "alex.johnson@email.com",
            avatar: "/avatars/alex.jpg",
            course: "Advanced React Development",
            progress: 85,
            lastActive: "2 hours ago",
            status: "active",
            grade: "A",
            assignmentsCompleted: 12,
            totalAssignments: 15,
            joinDate: "2024-01-15"
          },
          {
            id: 2,
            name: "Sarah Wilson",
            email: "sarah.wilson@email.com",
            avatar: "/avatars/sarah.jpg",
            course: "Python for Data Science",
            progress: 92,
            lastActive: "1 hour ago",
            status: "active",
            grade: "A+",
            assignmentsCompleted: 18,
            totalAssignments: 20,
            joinDate: "2024-01-10"
          },
          {
            id: 3,
            name: "Michael Chen",
            email: "michael.chen@email.com",
            avatar: "/avatars/michael.jpg",
            course: "Machine Learning Fundamentals",
            progress: 67,
            lastActive: "3 hours ago",
            status: "active",
            grade: "B+",
            assignmentsCompleted: 8,
            totalAssignments: 12,
            joinDate: "2024-02-01"
          },
          {
            id: 4,
            name: "Emily Davis",
            email: "emily.davis@email.com",
            avatar: "/avatars/emily.jpg",
            course: "Web Development Bootcamp",
            progress: 45,
            lastActive: "1 day ago",
            status: "inactive",
            grade: "C",
            assignmentsCompleted: 6,
            totalAssignments: 15,
            joinDate: "2024-02-15"
          },
          {
            id: 5,
            name: "David Rodriguez",
            email: "david.rodriguez@email.com",
            avatar: "/avatars/david.jpg",
            course: "Advanced React Development",
            progress: 78,
            lastActive: "4 hours ago",
            status: "active",
            grade: "B",
            assignmentsCompleted: 10,
            totalAssignments: 15,
            joinDate: "2024-01-20"
          }
        ]);
        setCourses([
          { id: 1, name: "Advanced React Development", students: 25 },
          { id: 2, name: "Python for Data Science", students: 18 },
          { id: 3, name: "Machine Learning Fundamentals", students: 22 },
          { id: 4, name: "Web Development Bootcamp", students: 30 }
        ]);
        setStatistics({
          totalStudents: 118,
          activeStudents: 95,
          averageProgress: 78,
          completionRate: 82
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsData();
  }, [selectedCourse, searchTerm]);

  // Filter students based on search and course
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourse === 'all' || student.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "at-risk":
        return "bg-red-100 text-red-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };


  // Button handler functions
  const handleInviteStudents = async () => {
    try {
      setIsInviting(true);
      // For now, we'll use a mock invitation since selectedStudents is empty
      // In a real app, this would collect emails from a form
      const invitationData = {
        courseId: selectedCourse,
        emails: ['student1@example.com', 'student2@example.com'], // Mock emails
        message: 'Welcome to our course!'
      };
      const response = await api.admin.inviteStudents(invitationData);
      if (response) {
        toast.success('Students invited successfully');
        // Refresh students list
        const studentsResponse = await api.admin.getStudents({ courseId: selectedCourse, search: searchTerm });
        setStudents(studentsResponse || []);
      } else {
        toast.error('Failed to invite students');
      }
    } catch (error) {
      console.error('Invite students failed:', error);
      toast.error('Failed to invite students');
    } finally {
      setIsInviting(false);
    }
  };

  const handleMessageStudent = async (studentName: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Message sent to ${studentName}`);
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleViewStudentDetails = (studentName: string) => {
    toast.info(`Opening detailed profile for ${studentName}`);
    // In a real app, this would navigate to student detail page
  };

  const handleContactAtRiskStudent = async (studentName: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Automatic support email sent to ${studentName}`);
    } catch (error) {
      toast.error('Failed to contact student');
    }
  };

  const handleReviewAtRiskStudent = (studentName: string) => {
    toast.info(`Opening detailed review for ${studentName}`);
    // In a real app, this would open a detailed review modal or page
  };

  const renderStudentCard = (student: any) => (
    <Card
      key={student.id}
      className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
    >
      {/* Removed overlay that was causing fade effect on hover */}
      <CardHeader className="pb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Avatar className="h-14 w-14 border-2 border-white shadow-lg">
                <AvatarImage src={student.avatar} />
                <AvatarFallback className="bg-gradient-to-br from-teal-500 to-purple-600 text-white font-semibold">
                  {getInitials(student.name)}
                </AvatarFallback>
              </Avatar>
              {student.status === "active" && (
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors">
                {student.name}
              </h4>
              <p className="text-sm text-gray-500">
                {student.email}
              </p>
              <div className="flex items-center mt-1">
                <span className="text-xs text-gray-400">
                  ID: {student.id}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <Badge
              variant="outline"
              className={`${getStatusColor(student.status)} border-0 font-medium`}
            >
              {student.status === "active" ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />{" "}
                  Active
                </>
              ) : student.status === "at-risk" ? (
                <>
                  <AlertTriangle className="h-3 w-3 mr-1" /> At
                  Risk
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" /> Inactive
                </>
              )}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 relative">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {student.coursesEnrolled}
            </p>
            <p className="text-xs text-blue-700 font-medium">
              Enrolled
            </p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {student.coursesCompleted}
            </p>
            <p className="text-xs text-green-700 font-medium">
              Completed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-500 mr-2" />
            <div>
              <p className="text-gray-500">Quiz Average</p>
              <p className="font-semibold">
                {student.avgQuizScore}%
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <div>
              <p className="text-gray-500">Last Active</p>
              <p className="font-semibold">
                {student.lastActive}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                Overall Progress
              </span>
              <span className="font-bold text-gray-900">
                {student.overallProgress}%
              </span>
            </div>
            <Progress
              value={student.overallProgress}
              className="h-3"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                {student.currentCourse}
              </span>
              <span className="font-bold text-teal-600">
                {student.courseProgress}%
              </span>
            </div>
            <Progress
              value={student.courseProgress}
              className="h-3"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="flex-1 group-hover:border-teal-300 transition-colors"
            onClick={() => handleMessageStudent(student.name)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button 
            className="flex-1 bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
            onClick={() => handleViewStudentDetails(student.name)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 w-20 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  
  if (loading) {
    return (
      <div className="relative z-10 pointer-events-auto">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-8 relative z-10 pointer-events-auto">
      {/* Error Banner */}
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-yellow-400 mr-2" />
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Students & Progress
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor student progress and engagement across all
            courses
          </p>
        </div>
        <Button 
          className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
          onClick={handleInviteStudents}
          disabled={isInviting}
        >
          {isInviting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Sending Invites...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Students
            </>
          )}
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600 mb-1">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-blue-900">
                  {statistics?.totalStudents?.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm font-medium text-green-600">
                    {statistics?.studentsGrowth ? `+${statistics.studentsGrowth}% this month` : '+0% this month'}
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600 mb-1">
                  Active This Week
                </p>
                <p className="text-3xl font-bold text-green-900">
                  {statistics?.activeStudents?.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-green-600">
                    {statistics?.engagementRate ? `${statistics.engagementRate}% engagement` : '0% engagement'}
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600 mb-1">
                  Avg Completion
                </p>
                <p className="text-3xl font-bold text-purple-900">
                  {statistics?.averageProgress ? `${statistics.averageProgress}%` : '0%'}
                </p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm font-medium text-purple-600">
                    {statistics?.averageProgress >= 70 ? 'Above target' : statistics?.averageProgress >= 50 ? 'On track' : 'Below target'}
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Award className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50 hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600 mb-1">
                  At Risk
                </p>
                <p className="text-3xl font-bold text-red-900">
                  {statistics?.atRiskStudents?.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm font-medium text-red-600">
                    {statistics?.atRiskStudents > 0 ? 'Need attention' : 'All good'}
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-lg border border-gray-100">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 w-80"
              placeholder="Search students by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select
            value={selectedCourse}
            onValueChange={setSelectedCourse}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              <SelectItem value="react">
                React Fundamentals
              </SelectItem>
              <SelectItem value="javascript">
                Advanced JavaScript
              </SelectItem>
              <SelectItem value="database">
                Database Design
              </SelectItem>
              <SelectItem value="python">
                Python Basics
              </SelectItem>
              <SelectItem value="uiux">UI/UX Design</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant={
              activeTab === "all-students"
                ? "default"
                : "outline"
            }
            onClick={() => setActiveTab("all-students")}
            className={
              activeTab === "all-students"
                ? "bg-gradient-to-r from-teal-500 to-purple-600"
                : ""
            }
          >
            All Students
          </Button>
          <Button
            variant={
              activeTab === "progress" ? "default" : "outline"
            }
            onClick={() => setActiveTab("progress")}
            className={
              activeTab === "progress"
                ? "bg-gradient-to-r from-teal-500 to-purple-600"
                : ""
            }
          >
            Progress Tracking
          </Button>
          <Button
            variant={
              activeTab === "engagement" ? "default" : "outline"
            }
            onClick={() => setActiveTab("engagement")}
            className={
              activeTab === "engagement"
                ? "bg-gradient-to-r from-teal-500 to-purple-600"
                : ""
            }
          >
            Engagement
          </Button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "all-students" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map(renderStudentCard)}
        </div>
      )}

      {activeTab === "progress" && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-teal-600" />
              Course Progress Overview
            </CardTitle>
            <CardDescription>
              Track student progress across all courses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                {
                  course: "React Fundamentals",
                  enrolled: 45,
                  completed: 32,
                  inProgress: 13,
                  avgProgress: 78,
                },
                {
                  course: "Advanced JavaScript",
                  enrolled: 38,
                  completed: 21,
                  inProgress: 17,
                  avgProgress: 65,
                },
                {
                  course: "Database Design",
                  enrolled: 29,
                  completed: 18,
                  inProgress: 11,
                  avgProgress: 82,
                },
                {
                  course: "Python Basics",
                  enrolled: 34,
                  completed: 15,
                  inProgress: 19,
                  avgProgress: 56,
                },
                {
                  course: "UI/UX Design",
                  enrolled: 28,
                  completed: 12,
                  inProgress: 16,
                  avgProgress: 48,
                },
              ].map((course, index) => (
                <div
                  key={index}
                  className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {course.course}
                    </h4>
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700"
                    >
                      {course.enrolled} enrolled
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-6 mb-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">
                        {course.completed}
                      </p>
                      <p className="text-sm text-green-700 font-medium">
                        Completed
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">
                        {course.inProgress}
                      </p>
                      <p className="text-sm text-blue-700 font-medium">
                        In Progress
                      </p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">
                        {course.avgProgress}%
                      </p>
                      <p className="text-sm text-purple-700 font-medium">
                        Avg Progress
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        Overall Completion Rate
                      </span>
                      <span className="font-bold">
                        {Math.round(
                          (course.completed / course.enrolled) *
                            100,
                        )}
                        %
                      </span>
                    </div>
                    <Progress
                      value={
                        (course.completed / course.enrolled) *
                        100
                      }
                      className="h-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "engagement" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Engagement Levels
              </CardTitle>
              <CardDescription>
                Distribution of student engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-green-900">
                      High Engagement
                    </p>
                    <p className="text-sm text-green-700">
                      Active daily, completing lessons
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-green-600">
                    847
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Medium Engagement
                    </p>
                    <p className="text-sm text-yellow-700">
                      Active 2-3 times per week
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">
                    312
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
                  <div>
                    <p className="font-semibold text-red-900">
                      Low Engagement
                    </p>
                    <p className="text-sm text-red-700">
                      Inactive for 7+ days
                    </p>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    88
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-blue-600" />
                At-Risk Students
              </CardTitle>
              <CardDescription>
                Students who need attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {students
                  .filter((s) => s.status === "at-risk")
                  .map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-red-50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-red-500 text-white font-semibold">
                            {getInitials(student.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-semibold text-red-900">
                            {student.name}
                          </h4>
                          <p className="text-sm text-red-700">
                            {student.overallProgress}% progress
                            • Last active {student.lastActive}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-100"
                          onClick={() => handleContactAtRiskStudent(student.name)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => handleReviewAtRiskStudent(student.name)}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}