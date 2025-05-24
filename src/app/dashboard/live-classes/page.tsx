import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Video, 
  Plus, 
  Search,
  Calendar,
  Clock,
  Users,
  PlayCircle,
  StopCircle,
  Download,
  Settings,
  Filter
} from "lucide-react"
import { getLiveClassesByInstructor, getUpcomingLiveClasses } from "@/lib/actions/live-classes"
import { LiveClassCard } from "@/components/live-classes/live-class-card"
import { CreateLiveClassButton } from "@/components/live-classes/create-live-class-button"

// Mock data for now - will be replaced with actual user session
const MOCK_INSTRUCTOR_ID = "instructor-123"

export default async function LiveClassesPage() {
  const { success, liveClasses, error } = await getLiveClassesByInstructor(MOCK_INSTRUCTOR_ID)
  const { success: upcomingSuccess, liveClasses: upcomingClasses } = await getUpcomingLiveClasses(MOCK_INSTRUCTOR_ID)

  if (!success) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load live classes</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const stats = {
    total: liveClasses?.length || 0,
    upcoming: upcomingClasses?.length || 0,
    completed: liveClasses?.filter(lc => lc.status === 'completed').length || 0,
    live: liveClasses?.filter(lc => lc.status === 'live').length || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Classes</h1>
          <p className="text-gray-600">Schedule and manage your live sessions</p>
        </div>
        <CreateLiveClassButton />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Classes</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">{stats.upcoming}</p>
              </div>
              <div className="p-3 rounded-full bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Live Now</p>
                <p className="text-2xl font-bold text-red-600">{stats.live}</p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <PlayCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <StopCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Classes Section */}
      {upcomingClasses && upcomingClasses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Classes</h2>
            <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
              {upcomingClasses.length} scheduled
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingClasses.slice(0, 3).map((liveClass) => (
              <Card key={liveClass.id} className="border-orange-200 bg-orange-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge className="bg-orange-100 text-orange-800">
                      {liveClass.platform === 'zoom' ? 'Zoom' : 
                       liveClass.platform === 'google_meet' ? 'Google Meet' : 'Custom'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(liveClass.scheduledAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="text-base">{liveClass.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {liveClass.description?.substring(0, 80)}...
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {new Date(liveClass.scheduledAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {liveClass.maxAttendees || 'Unlimited'}
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <Button size="sm" className="flex-1">
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Start
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search live classes..."
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            All Status
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
        </div>
      </div>

      {/* Live Classes List */}
      {!liveClasses || liveClasses.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Video className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No live classes yet</h3>
            <p className="text-gray-600 mb-6">
              Start by creating your first live class to engage with your students in real-time.
            </p>
            <CreateLiveClassButton />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Live Classes</h2>
            <span className="text-sm text-gray-500">{liveClasses.length} total classes</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {liveClasses.map((liveClass) => (
              <LiveClassCard 
                key={liveClass.id} 
                liveClass={liveClass}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 