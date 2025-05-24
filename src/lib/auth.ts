import { NextAuthOptions } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import CredentialsProvider from "next-auth/providers/credentials"
import { createSupabaseServiceClient } from "./supabase"

export const authOptions: NextAuthOptions = {
  adapter: SupabaseAdapter({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    secret: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      from: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
    }),
    // Credentials provider for admin and instructor login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        
        try {
          // Use Supabase to authenticate with email/password
          const supabase = createSupabaseServiceClient()
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password
          })
          
          if (error || !data.user) {
            return null
          }
          
          // Check the user's role
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name, role')
            .eq('id', data.user.id)
            .single()
            
          if (userError || !userData) {
            return null
          }
          
          // Only allow admin and instructor roles to use credentials login
          if (userData.role !== 'admin' && userData.role !== 'instructor') {
            return null
          }
          
          return {
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account: _account }) {
      if (user) {
        token.role = user.role || 'student'
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async signIn({ user: _user, account: _account, profile: _profile }) {
      // Allow sign in
      return true
    },
  },
  pages: {    signIn: '/auth/signin',    error: '/auth/error',    verifyRequest: '/auth/verify-request',  },
  events: {
    async createUser({ user }) {
      // Create user profile when a new user is created
      const supabase = createSupabaseServiceClient()
      
      await supabase
        .from('user_profiles')
        .insert({
          user_id: user.id,
          bio: '',
          skills: [],
          social_links: {},
        })
    },
  },
} 