"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookOpen, Loader2, GraduationCap } from "lucide-react"

export default function InstructorSignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Use credentials provider for instructor login
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard/courses"
      })

      if (result?.error) {
        setError("Invalid email or password. Please try again.")
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-100 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <BookOpen className="h-8 w-8 mr-2 text-green-600" />
            <span className="font-bold text-2xl">RojgarSkill</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Instructor Portal</h1>
          <p className="text-gray-600 mt-2">Sign in to manage your courses and students</p>
        </div>

        <Card className="border-green-200">
          <CardHeader className="bg-green-50 rounded-t-lg">
            <div className="flex items-center justify-center mb-2">
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Instructor Login</CardTitle>
            <CardDescription>
              Access your teaching dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Instructor Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="instructor@rojgarskill.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-green-200 focus:border-green-400"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <GraduationCap className="mr-2 h-4 w-4" />
                )}
                Sign In as Instructor
              </Button>
            </form>

            {/* Error Messages */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Back to regular login */}
            <div className="text-center text-sm pt-2">
              <Link href="/auth/signin" className="text-green-600 hover:underline font-medium">
                ← Back to regular login
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            Not an instructor yet?{" "}
            <Link href="/become-instructor" className="text-green-600 hover:underline font-medium">
              Apply to teach
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
} 