"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Search,
  Filter,
  MoreVertical,
  Users,
  UserPlus,
  Mail,
  Eye,
  Download,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp
} from "lucide-react"
import { toast } from "sonner"

interface Student {
  id: string
  name: string
  email: string
  avatar?: string
  enrolledAt: Date
  progress: number
  status: 'active' | 'completed' | 'dropped'
  lastActivity: Date
  completedLessons: number
  totalLessons: number
  certificateIssued: boolean
}

interface CourseStudentsProps {
  courseId: string
}

// Mock data - in real app, this would come from API
const mockStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '/placeholder-avatar.jpg',
    enrolledAt: new Date('2024-01-15'),
    progress: 85,
    status: 'active',
    lastActivity: new Date('2024-12-20'),
    completedLessons: 17,
    totalLessons: 20,
    certificateIssued: false
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    enrolledAt: new Date('2024-01-10'),
    progress: 100,
    status: 'completed',
    lastActivity: new Date('2024-12-18'),
    completedLessons: 20,
    totalLessons: 20,
    certificateIssued: true
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    enrolledAt: new Date('2024-02-01'),
    progress: 45,
    status: 'active',
    lastActivity: new Date('2024-12-15'),
    completedLessons: 9,
    totalLessons: 20,
    certificateIssued: false
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    enrolledAt: new Date('2024-01-20'),
    progress: 20,
    status: 'dropped',
    lastActivity: new Date('2024-11-30'),
    completedLessons: 4,
    totalLessons: 20,
    certificateIssued: false
  }
]

export function CourseStudents({ courseId }: CourseStudentsProps) {
  const [students, setStudents] = useState<Student[]>(mockStudents)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'dropped'>('all')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [showStudentDialog, setShowStudentDialog] = useState(false)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'active').length,
    completed: students.filter(s => s.status === 'completed').length,
    dropped: students.filter(s => s.status === 'dropped').length,
    averageProgress: Math.round(students.reduce((acc, s) => acc + s.progress, 0) / students.length)
  }

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student)
    setShowStudentDialog(true)
  }

  const handleRemoveStudent = (student: Student) => {
    setStudentToRemove(student)
    setShowRemoveDialog(true)
  }

  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return

    setIsLoading(true)
    try {
      // Mock API call - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setStudents(students.filter(s => s.id !== studentToRemove.id))
      toast.success(`${studentToRemove.name} has been removed from the course`)
      setShowRemoveDialog(false)
      setStudentToRemove(null)
    } catch (error) {
      toast.error('Failed to remove student')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMessage = (student: Student) => {
    // Mock implementation - would integrate with email service
    toast.success(`Message sent to ${student.name}`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'dropped': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'dropped': return <AlertCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Enrolled Students</h2>
          <p className="text-gray-600 text-sm">Manage students and track their progress</p>
        </div>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Dropped</p>
                <p className="text-2xl font-bold text-red-600">{stats.dropped}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-bold text-purple-600">{stats.averageProgress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search students by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All
          </Button>
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </Button>
          <Button
            variant={statusFilter === 'dropped' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('dropped')}
          >
            Dropped
          </Button>
        </div>
      </div>

      {/* Students List */}
      {filteredStudents.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' ? 'No students found' : 'No students enrolled yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Students will appear here once they enroll in your course'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={student.avatar} alt={student.name} />
                      <AvatarFallback>
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                        <Badge className={`text-xs ${getStatusColor(student.status)}`}>
                          {getStatusIcon(student.status)}
                          <span className="ml-1 capitalize">{student.status}</span>
                        </Badge>
                        {student.certificateIssued && (
                          <Badge variant="outline" className="text-xs">
                            Certified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Enrolled {formatDate(student.enrolledAt)}</span>
                        <span>•</span>
                        <span>Last active {formatRelativeTime(student.lastActivity)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {student.progress}% Complete
                      </div>
                      <div className="text-xs text-gray-500">
                        {student.completedLessons}/{student.totalLessons} lessons
                      </div>
                      <Progress 
                        value={student.progress} 
                        className="h-2 w-24 mt-1" 
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewStudent(student)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSendMessage(student)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export Progress
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleRemoveStudent(student)}
                          className="text-red-600"
                        >
                          <AlertCircle className="mr-2 h-4 w-4" />
                          Remove Student
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Student Details Dialog */}
      <Dialog open={showStudentDialog} onOpenChange={setShowStudentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
            <DialogDescription>
              Detailed progress and information for {selectedStudent?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                  <AvatarFallback className="text-lg">
                    {selectedStudent.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-medium">{selectedStudent.name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={`text-xs ${getStatusColor(selectedStudent.status)}`}>
                      {getStatusIcon(selectedStudent.status)}
                      <span className="ml-1 capitalize">{selectedStudent.status}</span>
                    </Badge>
                    {selectedStudent.certificateIssued && (
                      <Badge variant="outline" className="text-xs">
                        Certificate Issued
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Enrollment Date</label>
                  <p className="mt-1">{formatDate(selectedStudent.enrolledAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Activity</label>
                  <p className="mt-1">{formatDate(selectedStudent.lastActivity)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Lessons Completed</label>
                  <p className="mt-1">{selectedStudent.completedLessons} / {selectedStudent.totalLessons}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Overall Progress</label>
                  <div className="mt-1">
                    <div className="flex items-center space-x-2">
                      <Progress value={selectedStudent.progress} className="h-2 flex-1" />
                      <span className="text-sm font-medium">{selectedStudent.progress}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStudentDialog(false)}>
              Close
            </Button>
            <Button onClick={() => selectedStudent && handleSendMessage(selectedStudent)}>
              <Mail className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Student Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Student</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {studentToRemove?.name} from this course? 
              This action cannot be undone and the student will lose access to all course materials.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveStudent}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Removing...' : 'Remove Student'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 