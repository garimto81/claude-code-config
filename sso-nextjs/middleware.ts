// middleware.ts
// 참고: AsharibAli 패턴, NextAuth 공식 문서
// 재작성: 우리 프로젝트용
// https://authjs.dev/getting-started/session-management/protecting

import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin 라우트 보호
  if (pathname.startsWith('/admin')) {
    // 로그인 체크
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Admin 역할 체크
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }
  }

  // Dashboard 라우트 보호 (로그인만 필요)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
})

export const config = {
  // 보호할 경로 패턴
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
  ]
}
