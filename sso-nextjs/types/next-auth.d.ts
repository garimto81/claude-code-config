import { DefaultSession } from "next-auth"

// NextAuth Session 타입 확장
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
    } & DefaultSession["user"] // name, email, image 유지
  }

  interface User {
    role?: string
  }
}

// NextAuth JWT 타입 확장
declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}
