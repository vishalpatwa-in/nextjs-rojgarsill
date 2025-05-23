import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Users, 
  Award, 
  Video, 
  Clock, 
  Star,
  CheckCircle,
  PlayCircle,
  TrendingUp,
  Globe,
  Shield,
  Zap
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <BookOpen className="h-6 w-6 mr-2" />
          <span className="font-bold text-xl">RojgarSkill</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/courses">
            Courses
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/contact">
            Contact
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/auth/signin">
            Sign In
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Master New Skills with
                <span className="text-blue-600"> RojgarSkill</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl">
                Join thousands of learners in our comprehensive E-Learning platform. 
                Live classes, expert instructors, and industry-recognized certificates.
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Learning
              </Button>
              <Button variant="outline" size="lg">
                <Video className="mr-2 h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                10,000+ Students
              </div>
              <div className="flex items-center">
                <BookOpen className="mr-1 h-4 w-4" />
                500+ Courses
              </div>
              <div className="flex items-center">
                <Award className="mr-1 h-4 w-4" />
                Industry Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Why Choose RojgarSkill?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Our platform combines the best of online learning with cutting-edge technology
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            <Card className="flex flex-col items-center text-center p-6">
              <Video className="h-12 w-12 text-blue-600 mb-4" />
              <CardHeader>
                <CardTitle>Live Interactive Classes</CardTitle>
                <CardDescription>
                  Join live sessions with expert instructors using Zoom and Google Meet integration
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col items-center text-center p-6">
              <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
                <CardDescription>
                  Monitor your learning journey with detailed analytics and progress reports
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col items-center text-center p-6">
              <Award className="h-12 w-12 text-yellow-600 mb-4" />
              <CardHeader>
                <CardTitle>Industry Certificates</CardTitle>
                <CardDescription>
                  Earn verified certificates upon course completion to boost your career
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col items-center text-center p-6">
              <Shield className="h-12 w-12 text-purple-600 mb-4" />
              <CardHeader>
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Multiple payment options with Razorpay and Cashfree integration
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col items-center text-center p-6">
              <Globe className="h-12 w-12 text-indigo-600 mb-4" />
              <CardHeader>
                <CardTitle>White-label Ready</CardTitle>
                <CardDescription>
                  Customize the platform with your branding and domain
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="flex flex-col items-center text-center p-6">
              <Zap className="h-12 w-12 text-orange-600 mb-4" />
              <CardHeader>
                <CardTitle>Fast & Responsive</CardTitle>
                <CardDescription>
                  Optimized for all devices with lightning-fast performance
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Courses Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Popular Courses
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Discover our most popular courses across various domains
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
            {[
              {
                title: "Full Stack Web Development",
                instructor: "John Doe",
                rating: 4.8,
                students: 1250,
                price: "₹2,999",
                image: "/placeholder-course.jpg",
                level: "Intermediate"
              },
              {
                title: "Digital Marketing Mastery",
                instructor: "Jane Smith",
                rating: 4.9,
                students: 980,
                price: "₹1,999",
                image: "/placeholder-course.jpg",
                level: "Beginner"
              },
              {
                title: "Data Science with Python",
                instructor: "Mike Johnson",
                rating: 4.7,
                students: 750,
                price: "₹3,499",
                image: "/placeholder-course.jpg",
                level: "Advanced"
              }
            ].map((course, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <PlayCircle className="h-12 w-12 text-blue-600" />
                </div>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{course.level}</Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="ml-1 text-sm">{course.rating}</span>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription>By {course.instructor}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="mr-1 h-4 w-4" />
                      {course.students} students
                    </div>
                    <div className="text-lg font-bold text-blue-600">
                      {course.price}
                    </div>
                  </div>
                  <Button className="w-full mt-4">
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-blue-600">10,000+</div>
              <div className="text-sm text-gray-500">Active Students</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-green-600">500+</div>
              <div className="text-sm text-gray-500">Courses Available</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-purple-600">100+</div>
              <div className="text-sm text-gray-500">Expert Instructors</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-gray-500">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-blue-600">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
                Ready to Start Learning?
              </h2>
              <p className="max-w-[600px] text-blue-100 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join thousands of students who are already advancing their careers with RojgarSkill
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg" variant="secondary">
                Get Started Free
              </Button>
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-blue-600">
                View All Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-gray-500">
          © 2024 RojgarSkill. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy Policy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/support">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
