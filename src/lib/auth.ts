import { NextAuthOptions } from "next-auth"
import { SupabaseAdapter } from "@auth/supabase-adapter"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
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