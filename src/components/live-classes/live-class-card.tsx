"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {  Video,  MoreHorizontal,  Calendar,  Clock,  Users,  PlayCircle,  StopCircle,  Edit,  Trash2,  Copy,  Download,  Settings,  ExternalLink,  FileVideo} from "lucide-react"
import { toast } from "sonner"
import { deleteLiveClass, startLiveClass, endLiveClass } from "@/lib/actions/live-classes"

interface LiveClass {
  id: string
  title: string
  description?: string | null
  scheduledAt: Date
  duration: number
  meetingUrl?: string | null
  meetingId?: string | null
  platform: 'zoom' | 'google_meet' | 'custom'
  recordingUrl?: string | null
  status: 'scheduled' | 'live' | 'completed' | 'cancelled'
  maxAttendees?: number | null
  createdAt: Date
  updatedAt: Date
}

interface LiveClassCardProps {
  liveClass: LiveClass
}

export function LiveClassCard({ liveClass }: LiveClassCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const isUpcoming = new Date(liveClass.scheduledAt) > new Date()
  const isLive = liveClass.status === 'live'
  const isCompleted = liveClass.status === 'completed'
  const isCancelled = liveClass.status === 'cancelled'

  const getStatusColor = () => {
    switch (liveClass.status) {
      case 'scheduled': return isUpcoming ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      case 'live': return 'bg-red-100 text-red-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = () => {
    switch (liveClass.status) {
      case 'scheduled': return <Calendar className="h-3 w-3" />
      case 'live': return <PlayCircle className="h-3 w-3" />
      case 'completed': return <StopCircle className="h-3 w-3" />
      case 'cancelled': return <Clock className="h-3 w-3" />
      default: return <Calendar className="h-3 w-3" />
    }
  }

  const getPlatformIcon = () => {
    switch (liveClass.platform) {
      case 'zoom': return '📹'
      case 'google_meet': return '🎥' 
      case 'custom': return '🔗'
      default: return '📹'
    }
  }

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const handleStartClass = async () => {
    setIsLoading(true)
    try {
      const result = await startLiveClass(liveClass.id)
      if (result.success) {
        toast.success('Live class started')
        // Open meeting URL in new tab
        if (liveClass.meetingUrl) {
          window.open(liveClass.meetingUrl, '_blank')
        }
      } else {
        toast.error(result.error || 'Failed to start live class')
      }
    } catch (error) {
      toast.error('Failed to start live class')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEndClass = async () => {
    setIsLoading(true)
    try {
      const result = await endLiveClass(liveClass.id)
      if (result.success) {
        toast.success('Live class ended')
      } else {
        toast.error(result.error || 'Failed to end live class')
      }
    } catch (error) {
      toast.error('Failed to end live class')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClass = async () => {
    setIsLoading(true)
    try {
      const result = await deleteLiveClass(liveClass.id)
      if (result.success) {
        toast.success('Live class deleted')
        setShowDeleteDialog(false)
      } else {
        toast.error(result.error || 'Failed to delete live class')
      }
    } catch (error) {
      toast.error('Failed to delete live class')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyMeetingUrl = () => {
    if (liveClass.meetingUrl) {
      navigator.clipboard.writeText(liveClass.meetingUrl)
      toast.success('Meeting URL copied to clipboard')
    }
  }

  const handleJoinMeeting = () => {
    if (liveClass.meetingUrl) {
      window.open(liveClass.meetingUrl, '_blank')
    }
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getPlatformIcon()}</span>
                    <h3 className="font-semibold text-lg text-gray-900">{liveClass.title}</h3>
                    <Badge className={`text-xs ${getStatusColor()}`}>
                      {getStatusIcon()}
                      <span className="ml-1 capitalize">{liveClass.status}</span>
                    </Badge>
                  </div>
                  {liveClass.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{liveClass.description}</p>
                  )}
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                      <Settings className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    {liveClass.meetingUrl && (
                      <>
                        <DropdownMenuItem onClick={handleJoinMeeting}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Join Meeting
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleCopyMeetingUrl}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Meeting URL
                        </DropdownMenuItem>
                      </>
                    )}
                    {liveClass.recordingUrl && (
                      <DropdownMenuItem onClick={() => window.open(liveClass.recordingUrl!, '_blank')}>
                        <Download className="mr-2 h-4 w-4" />
                        Download Recording
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Class
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => setShowDeleteDialog(true)}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Class
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDateTime(liveClass.scheduledAt)}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {formatDuration(liveClass.duration)}
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {liveClass.maxAttendees ? `Max ${liveClass.maxAttendees}` : 'Unlimited'}
                </div>
                                {liveClass.recordingUrl && (                  <div className="flex items-center">                    <FileVideo className="h-4 w-4 mr-1" />                    Recording available                  </div>                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Platform: {liveClass.platform === 'zoom' ? 'Zoom' : 
                        liveClass.platform === 'google_meet' ? 'Google Meet' : 'Custom'}
            </div>
            
            <div className="flex space-x-2">
              {isLive && (
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleEndClass}
                  disabled={isLoading}
                >
                  <StopCircle className="h-4 w-4 mr-1" />
                  End Class
                </Button>
              )}
              
              {liveClass.status === 'scheduled' && isUpcoming && (
                <Button 
                  size="sm"
                  onClick={handleStartClass}
                  disabled={isLoading}
                >
                  <PlayCircle className="h-4 w-4 mr-1" />
                  Start Class
                </Button>
              )}
              
              {liveClass.meetingUrl && !isCompleted && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleJoinMeeting}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Join Meeting
                </Button>
              )}

              {liveClass.recordingUrl && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => window.open(liveClass.recordingUrl!, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Recording
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{liveClass.title}</DialogTitle>
            <DialogDescription>Live class details and information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <div className="mt-1">
                  <Badge className={`text-xs ${getStatusColor()}`}>
                    {getStatusIcon()}
                    <span className="ml-1 capitalize">{liveClass.status}</span>
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Platform</label>
                <p className="mt-1">{liveClass.platform === 'zoom' ? 'Zoom' : 
                                   liveClass.platform === 'google_meet' ? 'Google Meet' : 'Custom'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Scheduled Date & Time</label>
                <p className="mt-1">{formatDateTime(liveClass.scheduledAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duration</label>
                <p className="mt-1">{formatDuration(liveClass.duration)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Max Attendees</label>
                <p className="mt-1">{liveClass.maxAttendees || 'Unlimited'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Meeting ID</label>
                <p className="mt-1 font-mono text-sm">{liveClass.meetingId || 'N/A'}</p>
              </div>
            </div>
            
            {liveClass.description && (
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="mt-1 text-gray-700">{liveClass.description}</p>
              </div>
            )}

            {liveClass.meetingUrl && (
              <div>
                <label className="text-sm font-medium text-gray-600">Meeting URL</label>
                <div className="mt-1 flex items-center space-x-2">
                  <code className="flex-1 p-2 bg-gray-100 rounded text-sm break-all">
                    {liveClass.meetingUrl}
                  </code>
                  <Button size="sm" variant="outline" onClick={handleCopyMeetingUrl}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Live Class</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{liveClass.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClass}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
} 