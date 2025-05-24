"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Home, 
  BookOpen, 
  Video, 
  User, 
  Menu,
  Bell,
  Search,
  LogOut,
  Settings,
  BarChart3,
  Calendar,
  FileText,
  CreditCard,
  Award,
  X
} from "lucide-react"

const bottomNavItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Live", href: "/dashboard/live-classes", icon: Video },
  { name: "Profile", href: "/dashboard/profile", icon: User },
]

const sideNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "My Courses", href: "/dashboard/courses", icon: BookOpen },
  { name: "Live Classes", href: "/dashboard/live-classes", icon: Video },
  { name: "Assignments", href: "/dashboard/assignments", icon: FileText },
  { name: "Certificates", href: "/dashboard/certificates", icon: Award },
  { name: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
  { name: "Profile", href: "/dashboard/profile", icon: User },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

interface MobileNavProps {
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      {/* Top Mobile Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="flex flex-col h-full">
                  <SheetHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <SheetTitle className="flex items-center">
                        <BookOpen className="h-6 w-6 text-blue-600 mr-2" />
                        RojgarSkill
                      </SheetTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 h-6 w-6"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </SheetHeader>
                  
                  {/* User Profile in Sidebar */}
                  <div className="p-6 border-b">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
                        <AvatarFallback>
                          {user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || "user@example.com"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Items */}
                  <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {sideNavItems.map((item) => {
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-blue-100 text-blue-700"
                              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      )
                    })}
                  </nav>

                  {/* Logout Button */}
                  <div className="p-4 border-t">
                    <Button variant="ghost" className="w-full justify-start" asChild>
                      <Link href="/auth/signin">
                        <LogOut className="mr-3 h-5 w-5" />
                        Sign Out
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <Link href="/dashboard" className="flex items-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
              <span className="ml-2 text-lg font-bold">RojgarSkill</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative p-2">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Avatar */}
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setSearchOpen(false)}>
          <div className="absolute top-0 left-0 right-0 bg-background p-4 border-b">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, lessons..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSearchOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t lg:hidden">
        <div className="grid grid-cols-4 h-16">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-blue-600" : ""}`} />
                <span className={`text-xs font-medium ${isActive ? "text-blue-600" : ""}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Bottom Spacing for Fixed Navigation */}
      <div className="h-16 lg:hidden" />
    </>
  )
} 