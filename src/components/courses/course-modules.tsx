"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Plus,
  Edit,
  Trash2,
  MoreVertical,
  GripVertical,
  PlayCircle,
  FileText,
  Video,
  ClipboardList,
  BookOpen,
  Clock,
  Eye,
  EyeOff
} from "lucide-react"
import { createModule, createLesson, updateModule, updateLesson, deleteModule, deleteLesson } from "@/lib/actions/courses"
import { toast } from "sonner"

interface Module {
  id: string
  title: string
  description?: string | null
  order: number
  lessons: Lesson[]
}

interface Lesson {
  id: string
  title: string
  description?: string | null
  content?: string | null
  videoUrl?: string | null
  duration?: number | null
  order: number
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'live'
  isPreview: boolean
  isActive: boolean
}

interface CourseModulesProps {
  course: {
    id: string
    title: string
    modules: Module[]
  }
}

export function CourseModules({ course }: CourseModulesProps) {
  const [modules, setModules] = useState<Module[]>(course.modules || [])
  const [showModuleDialog, setShowModuleDialog] = useState(false)
  const [showLessonDialog, setShowLessonDialog] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson | null; moduleId: string }>({ lesson: null, moduleId: '' })
  const [deleteDialog, setDeleteDialog] = useState<{ type: 'module' | 'lesson' | null; id: string; title: string }>({ type: null, id: '', title: '' })
  const [isLoading, setIsLoading] = useState(false)

  // Module form state
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
  })

  // Lesson form state
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    content: '',
    videoUrl: '',
    duration: '',
    type: 'video' as Lesson['type'],
    isPreview: false,
  })

  const resetModuleForm = () => {
    setModuleForm({ title: '', description: '' })
    setEditingModule(null)
  }

  const resetLessonForm = () => {
    setLessonForm({
      title: '',
      description: '',
      content: '',
      videoUrl: '',
      duration: '',
      type: 'video',
      isPreview: false,
    })
    setEditingLesson({ lesson: null, moduleId: '' })
  }

  const handleCreateModule = () => {
    setShowModuleDialog(true)
    resetModuleForm()
  }

  const handleEditModule = (module: Module) => {
    setEditingModule(module)
    setModuleForm({
      title: module.title,
      description: module.description || '',
    })
    setShowModuleDialog(true)
  }

  const handleCreateLesson = (moduleId: string) => {
    setEditingLesson({ lesson: null, moduleId })
    resetLessonForm()
    setShowLessonDialog(true)
  }

  const handleEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson({ lesson, moduleId })
    setLessonForm({
      title: lesson.title,
      description: lesson.description || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      duration: lesson.duration?.toString() || '',
      type: lesson.type,
      isPreview: lesson.isPreview,
    })
    setShowLessonDialog(true)
  }

  const handleModuleSubmit = async () => {
    if (!moduleForm.title.trim()) {
      toast.error("Module title is required")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', moduleForm.title)
      formData.append('description', moduleForm.description)
      formData.append('courseId', course.id)
      
      if (editingModule) {
        formData.append('order', editingModule.order.toString())
        const result = await updateModule(editingModule.id, formData)
        
        if (result.success) {
          setModules(modules.map(m => 
            m.id === editingModule.id 
              ? { ...m, title: moduleForm.title, description: moduleForm.description }
              : m
          ))
          toast.success("Module updated successfully")
        } else {
          toast.error(result.error || "Failed to update module")
        }
      } else {
        formData.append('order', (modules.length + 1).toString())
        const result = await createModule(formData)
        
        if (result.success && result.module) {
          const newModule: Module = {
            id: result.module.id,
            title: result.module.title,
            description: result.module.description,
            order: result.module.order,
            lessons: []
          }
          setModules([...modules, newModule])
          toast.success("Module created successfully")
        } else {
          toast.error(result.error || "Failed to create module")
        }
      }
      
      setShowModuleDialog(false)
      resetModuleForm()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLessonSubmit = async () => {
    if (!lessonForm.title.trim()) {
      toast.error("Lesson title is required")
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('title', lessonForm.title)
      formData.append('description', lessonForm.description)
      formData.append('content', lessonForm.content)
      formData.append('videoUrl', lessonForm.videoUrl)
      formData.append('duration', lessonForm.duration)
      formData.append('type', lessonForm.type)
      formData.append('isPreview', lessonForm.isPreview.toString())
      formData.append('moduleId', editingLesson.moduleId)

      if (editingLesson.lesson) {
        formData.append('order', editingLesson.lesson.order.toString())
        const result = await updateLesson(editingLesson.lesson.id, formData)
        
        if (result.success) {
          setModules(modules.map(m => 
            m.id === editingLesson.moduleId 
              ? {
                  ...m,
                  lessons: m.lessons.map(l => 
                    l.id === editingLesson.lesson!.id 
                      ? { 
                          ...l, 
                          title: lessonForm.title,
                          description: lessonForm.description,
                          content: lessonForm.content,
                          videoUrl: lessonForm.videoUrl,
                          duration: lessonForm.duration ? parseInt(lessonForm.duration) : null,
                          type: lessonForm.type,
                          isPreview: lessonForm.isPreview
                        }
                      : l
                  )
                }
              : m
          ))
          toast.success("Lesson updated successfully")
        } else {
          toast.error(result.error || "Failed to update lesson")
        }
      } else {
        const currentModule = modules.find(m => m.id === editingLesson.moduleId)
        formData.append('order', (currentModule ? currentModule.lessons.length + 1 : 1).toString())
        const result = await createLesson(formData)
        
        if (result.success && result.lesson) {
          const newLesson: Lesson = {
            id: result.lesson.id,
            title: result.lesson.title,
            description: result.lesson.description,
            content: result.lesson.content,
            videoUrl: result.lesson.videoUrl,
            duration: result.lesson.duration,
            order: result.lesson.order,
            type: result.lesson.type,
            isPreview: result.lesson.isPreview,
            isActive: true
          }
          
          setModules(modules.map(m => 
            m.id === editingLesson.moduleId 
              ? { ...m, lessons: [...m.lessons, newLesson] }
              : m
          ))
          toast.success("Lesson created successfully")
        } else {
          toast.error(result.error || "Failed to create lesson")
        }
      }
      
      setShowLessonDialog(false)
      resetLessonForm()
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteDialog.type) return

    setIsLoading(true)
    try {
      if (deleteDialog.type === 'module') {
        const result = await deleteModule(deleteDialog.id)
        if (result.success) {
          setModules(modules.filter(m => m.id !== deleteDialog.id))
          toast.success("Module deleted successfully")
        } else {
          toast.error(result.error || "Failed to delete module")
        }
      } else {
        const result = await deleteLesson(deleteDialog.id)
        if (result.success) {
          setModules(modules.map(m => ({
            ...m,
            lessons: m.lessons.filter(l => l.id !== deleteDialog.id)
          })))
          toast.success("Lesson deleted successfully")
        } else {
          toast.error(result.error || "Failed to delete lesson")
        }
      }
      setDeleteDialog({ type: null, id: '', title: '' })
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />
      case 'text': return <FileText className="h-4 w-4" />
      case 'quiz': return <ClipboardList className="h-4 w-4" />
      case 'assignment': return <BookOpen className="h-4 w-4" />
      case 'live': return <PlayCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getLessonTypeBadge = (type: string) => {
    const colors = {
      video: 'bg-blue-100 text-blue-800',
      text: 'bg-gray-100 text-gray-800',
      quiz: 'bg-purple-100 text-purple-800',
      assignment: 'bg-orange-100 text-orange-800',
      live: 'bg-red-100 text-red-800'
    }
    return colors[type as keyof typeof colors] || colors.text
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Course Curriculum</h2>
          <p className="text-gray-600 text-sm">Organize your course content into modules and lessons</p>
        </div>
        <Button onClick={handleCreateModule}>
          <Plus className="mr-2 h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your course by creating the first module
            </p>
            <Button onClick={handleCreateModule}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Module
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <Card key={module.id} className="overflow-hidden">
              <CardHeader className="bg-gray-50 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                    <div>
                      <CardTitle className="text-base">
                        Module {moduleIndex + 1}: {module.title}
                      </CardTitle>
                      {module.description && (
                        <CardDescription>{module.description}</CardDescription>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCreateLesson(module.id)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Lesson
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditModule(module)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Module
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => setDeleteDialog({ type: 'module', id: module.id, title: module.title })}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Module
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {module.lessons.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-gray-600 text-sm mb-4">No lessons in this module</p>
                    <Button variant="outline" size="sm" onClick={() => handleCreateLesson(module.id)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Lesson
                    </Button>
                  </div>
                ) : (
                  <div>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="border-b last:border-b-0 p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                            <div className="flex items-center space-x-2">
                              {getLessonIcon(lesson.type)}
                              <span className="font-medium">
                                {lessonIndex + 1}. {lesson.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getLessonTypeBadge(lesson.type)}`}>
                                {lesson.type}
                              </Badge>
                              {lesson.isPreview && (
                                <Badge variant="outline" className="text-xs">
                                  <Eye className="mr-1 h-3 w-3" />
                                  Preview
                                </Badge>
                              )}
                              {lesson.duration && (
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="mr-1 h-3 w-3" />
                                  {lesson.duration}min
                                </div>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditLesson(lesson, module.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Lesson
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => setDeleteDialog({ type: 'lesson', id: lesson.id, title: lesson.title })}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Lesson
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {lesson.description && (
                          <p className="text-sm text-gray-600 mt-2 ml-7">{lesson.description}</p>
                        )}
                      </div>
                    ))}
                    <div className="p-4 border-t bg-gray-50">
                      <Button variant="outline" size="sm" onClick={() => handleCreateLesson(module.id)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Lesson
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Module Dialog */}
      <Dialog open={showModuleDialog} onOpenChange={setShowModuleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingModule ? 'Edit Module' : 'Create New Module'}
            </DialogTitle>
            <DialogDescription>
              {editingModule ? 'Update the module details' : 'Add a new module to organize your course content'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Module Title *</label>
              <Input
                value={moduleForm.title}
                onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="Enter module title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={moduleForm.description}
                onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Brief description of this module"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModuleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleModuleSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingModule ? 'Update Module' : 'Create Module'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lesson Dialog */}
      <Dialog open={showLessonDialog} onOpenChange={setShowLessonDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLesson.lesson ? 'Edit Lesson' : 'Create New Lesson'}
            </DialogTitle>
            <DialogDescription>
              {editingLesson.lesson ? 'Update the lesson details' : 'Add a new lesson to this module'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Lesson Title *</label>
                <Input
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="Enter lesson title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Lesson Type</label>
                <Select value={lessonForm.type} onValueChange={(value: Lesson['type']) => setLessonForm({ ...lessonForm, type: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="text">Text/Article</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="live">Live Session</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={lessonForm.description}
                onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                placeholder="Brief description of this lesson"
                rows={2}
              />
            </div>

            {lessonForm.type === 'video' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Video URL</label>
                  <Input
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Duration (minutes)</label>
                  <Input
                    type="number"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    placeholder="15"
                  />
                </div>
              </div>
            )}

            {lessonForm.type === 'text' && (
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={lessonForm.content}
                  onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
                  placeholder="Enter the lesson content..."
                  rows={6}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPreview"
                checked={lessonForm.isPreview}
                onChange={(e) => setLessonForm({ ...lessonForm, isPreview: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isPreview" className="text-sm font-medium">
                Allow preview (students can access without enrollment)
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLessonDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLessonSubmit} disabled={isLoading}>
              {isLoading ? 'Saving...' : editingLesson.lesson ? 'Update Lesson' : 'Create Lesson'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.type !== null} onOpenChange={() => setDeleteDialog({ type: null, id: '', title: '' })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {deleteDialog.type} 
              "{deleteDialog.title}"{deleteDialog.type === 'module' ? ' and all its lessons' : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? 'Deleting...' : `Delete ${deleteDialog.type}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 