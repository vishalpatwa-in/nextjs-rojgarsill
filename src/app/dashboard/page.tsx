import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  TrendingUp,
  Calendar,
  PlayCircle,
  CheckCircle,
  Star,
  ArrowRight,
  Video,
  FileText,
  Target
} from "lucide-react"

export default function DashboardPage() {
  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: "Enrolled Courses",
      value: "12",
      change: "+2 this month",
      icon: BookOpen,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Completed Courses",
      value: "8",
      change: "+3 this month",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Certificates Earned",
      value: "6",
      change: "+2 this month",
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Study Hours",
      value: "124",
      change: "+18 this week",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  const recentCourses = [
    {
      id: 1,
      title: "Full Stack Web Development",
      instructor: "John Doe",
      progress: 75,
      nextLesson: "React Hooks Deep Dive",
      thumbnail: "/placeholder-course.jpg",
      level: "Intermediate"
    },
    {
      id: 2,
      title: "Digital Marketing Mastery",
      instructor: "Jane Smith",
      progress: 45,
      nextLesson: "SEO Fundamentals",
      thumbnail: "/placeholder-course.jpg",
      level: "Beginner"
    },
    {
      id: 3,
      title: "Data Science with Python",
      instructor: "Mike Johnson",
      progress: 30,
      nextLesson: "Pandas Data Manipulation",
      thumbnail: "/placeholder-course.jpg",
      level: "Advanced"
    }
  ]

  const upcomingClasses = [
    {
      id: 1,
      title: "React Advanced Patterns",
      instructor: "John Doe",
      time: "2:00 PM - 3:30 PM",
      date: "Today",
      platform: "Zoom"
    },
    {
      id: 2,
      title: "Digital Marketing Strategy",
      instructor: "Jane Smith",
      time: "10:00 AM - 11:30 AM",
      date: "Tomorrow",
      platform: "Google Meet"
    },
    {
      id: 3,
      title: "Python Data Analysis",
      instructor: "Mike Johnson",
      time: "4:00 PM - 5:30 PM",
      date: "Dec 28",
      platform: "Zoom"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "course_completed",
      title: "Completed JavaScript Fundamentals",
      time: "2 hours ago",
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      id: 2,
      type: "assignment_submitted",
      title: "Submitted React Project Assignment",
      time: "1 day ago",
      icon: FileText,
      color: "text-blue-600"
    },
    {
      id: 3,
      type: "certificate_earned",
      title: "Earned HTML/CSS Certificate",
      time: "3 days ago",
      icon: Award,
      color: "text-yellow-600"
    },
    {
      id: 4,
      type: "live_class_attended",
      title: "Attended Advanced React Patterns",
      time: "1 week ago",
      icon: Video,
      color: "text-purple-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, John!</h1>
          <p className="text-gray-600 mt-1">Continue your learning journey</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button>
            <PlayCircle className="mr-2 h-4 w-4" />
            Continue Learning
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Schedule
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Learning */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                Continue Learning
              </CardTitle>
              <CardDescription>
                Pick up where you left off
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentCourses.map((course) => (
                <div key={course.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                    <PlayCircle className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {course.title}
                      </h3>
                      <Badge variant="secondary">{course.level}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">By {course.instructor}</p>
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Next: {course.nextLesson}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Classes */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="mr-2 h-5 w-5" />
                Upcoming Classes
              </CardTitle>
              <CardDescription>
                Don't miss your live sessions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((class_) => (
                <div key={class_.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {class_.title}
                    </h4>
                    <Badge variant="outline" className="text-xs">
                      {class_.platform}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    By {class_.instructor}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">{class_.date}</span>
                    <span className="text-blue-600 font-medium">{class_.time}</span>
                  </div>
                  <Button size="sm" className="w-full mt-2">
                    Join Class
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your learning progress this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <activity.icon className={`h-4 w-4 ${activity.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="mr-2 h-5 w-5" />
              Learning Goals
            </CardTitle>
            <CardDescription>
              Track your monthly objectives
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Complete 3 Courses</span>
                <span className="text-sm text-gray-500">2/3</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Earn 2 Certificates</span>
                <span className="text-sm text-gray-500">2/2</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Study 40 Hours</span>
                <span className="text-sm text-gray-500">32/40</span>
              </div>
              <Progress value={80} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Attend 8 Live Classes</span>
                <span className="text-sm text-gray-500">6/8</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 