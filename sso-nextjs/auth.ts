import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { User } from "next-auth"

// Temporary type until we integrate Supabase
interface ExtendedUser extends User {
  role?: string
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "이메일",
          type: "email",
          placeholder: "user@example.com"
        },
        password: {
          label: "비밀번호",
          type: "password"
        },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        // TODO: Phase 3에서 Supabase 연동 및 rate limiting 추가
        // 현재는 기본 검증만 수행

        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Placeholder: 실제로는 Supabase에서 사용자 조회
        // const { data: authData, error } = await supabase.auth.signInWithPassword({...})
        // const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id)

        // 임시 테스트 사용자
        if (
          credentials.email === "admin@example.com" &&
          credentials.password === "Admin1234!"
        ) {
          return {
            id: "1",
            email: credentials.email as string,
            name: "Admin User",
            role: "admin",
          }
        }

        if (
          credentials.email === "user@example.com" &&
          credentials.password === "User1234!"
        ) {
          return {
            id: "2",
            email: credentials.email as string,
            name: "Regular User",
            role: "user",
          }
        }

        return null
      },
    }),
  ],

  callbacks: {
    // JWT 콜백: 토큰에 사용자 정보 추가
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as ExtendedUser).role || "user"
      }
      return token
    },

    // Session 콜백: 클라이언트에 노출할 세션 데이터
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  // Development 환경에서 디버그 활성화
  debug: process.env.NODE_ENV === "development",
})
