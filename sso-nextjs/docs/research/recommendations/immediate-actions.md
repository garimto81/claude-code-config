# 즉시 적용 가능한 개선사항 (Immediate Actions)

**대상 Phase**: Phase 2 (이번 주)
**예상 총 시간**: 4-5시간
**우선순위**: 🔴 High

---

## 개요

GitHub 리포지토리 분석 결과, 다음 4가지 개선사항은 즉시 적용 가능하며 프로젝트에 큰 영향을 미칩니다. 모두 프로덕션급 프로젝트에서 필수로 구현되어 있습니다.

---

## 1. 미들웨어 구현 (AsharibAli 패턴) 🔴 Critical

**문제**: 현재 `/admin` 라우트가 미들웨어로 보호되지 않음
**현재 상태**: 페이지 레벨 Server Component에서 보호
**참고**: `docs/research/repos/01-asharibali-nextauthv5.md`

### 구현 방법

```typescript
// middleware.ts (프로젝트 루트)
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Protect /admin routes
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Check admin role
    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
```

### 체크리스트
- [ ] `middleware.ts` 파일 생성
- [ ] 미들웨어에서 세션 체크 구현
- [ ] 역할 기반 리다이렉트 구현
- [ ] `/forbidden` 페이지 생성
- [ ] E2E 테스트 업데이트
- [ ] 테스트 실행 및 검증

**예상 시간**: 30분
**영향도**: 🔴 Critical - 보안 필수

---

## 2. Supabase Client 팩토리 생성 (wpcodevo 패턴) 🔴 Critical

**문제**: Supabase 미연동 (플레이스홀더 인증 사용 중)
**목표**: 실제 Supabase 데이터베이스 연결
**참고**: `docs/research/repos/02-wpcodevo-supabase-ssr.md`

### 구현 방법

#### Step 1: 패키지 설치
```bash
npm install @supabase/ssr @supabase/supabase-js
```

#### Step 2: Server Client 생성
```typescript
// lib/supabase/server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component에서 쿠키 설정 불가 - 무시
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component에서 쿠키 삭제 불가 - 무시
          }
        },
      },
    }
  )
}
```

#### Step 3: Client Client 생성
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

#### Step 4: Supabase 프로젝트 설정
1. https://supabase.com 에서 새 프로젝트 생성
2. `.env.local`에 키 추가:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

### 체크리스트
- [ ] Supabase 프로젝트 생성
- [ ] 환경 변수 설정
- [ ] `@supabase/ssr`, `@supabase/supabase-js` 설치
- [ ] `lib/supabase/server.ts` 생성
- [ ] `lib/supabase/client.ts` 생성
- [ ] 환경 변수 검증 함수 추가
- [ ] 연결 테스트

**예상 시간**: 30분
**영향도**: 🔴 Critical - DB 연결 필수

---

## 3. 자동 세션 갱신 미들웨어 (wpcodevo 패턴) 🔴 High

**문제**: 세션 만료 시 사용자가 강제 로그아웃됨
**목표**: 미들웨어에서 자동으로 세션 갱신
**참고**: `docs/research/repos/02-wpcodevo-supabase-ssr.md`

### 구현 방법

```typescript
// middleware.ts (Supabase 통합 버전)
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { auth } from "@/auth"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Supabase 세션 갱신
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // 세션 자동 갱신 (핵심!)
  await supabase.auth.getUser()

  // NextAuth 세션 체크 및 라우트 보호
  const { pathname } = request.nextUrl
  const session = await auth()

  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    if (session.user.role !== 'admin') {
      return NextResponse.redirect(new URL('/forbidden', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 체크리스트
- [ ] 미들웨어에 Supabase Client 생성 로직 추가
- [ ] `supabase.auth.getUser()` 호출 추가
- [ ] 쿠키 설정 핸들러 구현
- [ ] matcher 패턴 업데이트
- [ ] 세션 갱신 테스트

**예상 시간**: 1시간
**영향도**: 🔴 High - UX 향상

---

## 4. Custom Hooks 추가 (AsharibAli 패턴) 🟡 Medium

**문제**: 컴포넌트에서 반복적인 세션 접근 코드
**목표**: 개발자 경험 향상
**참고**: `docs/research/repos/01-asharibali-nextauthv5.md`

### 구현 방법

```typescript
// hooks/useCurrentUser.ts
'use client'

import { useSession } from "next-auth/react"

export const useCurrentUser = () => {
  const { data: session } = useSession()
  return session?.user
}

// 사용 예시
const user = useCurrentUser()
console.log(user?.email)
```

```typescript
// hooks/useRole.ts
'use client'

import { useCurrentUser } from "./useCurrentUser"

export const useRole = () => {
  const user = useCurrentUser()
  return user?.role
}

// 사용 예시
const role = useRole()
const isAdmin = role === 'admin'
```

### Before / After

**Before**:
```typescript
const { data: session } = useSession()
const userEmail = session?.user?.email
const userRole = session?.user?.role
const isAdmin = session?.user?.role === 'admin'
```

**After**:
```typescript
const user = useCurrentUser()
const role = useRole()
const isAdmin = role === 'admin'
```

### 체크리스트
- [ ] `hooks/` 폴더 생성
- [ ] `hooks/useCurrentUser.ts` 작성
- [ ] `hooks/useRole.ts` 작성
- [ ] Admin 페이지에서 사용
- [ ] Home 페이지에서 사용
- [ ] 타입 검증

**예상 시간**: 20분
**영향도**: 🟡 Medium - DX 향상

---

## 구현 순서 (권장)

### Day 1 (2시간)
1. ✅ Supabase 프로젝트 생성 및 환경 변수 설정 (30분)
2. ✅ Supabase Client 팩토리 구현 (30분)
3. ✅ 미들웨어 기본 구현 (30분)
4. ✅ Custom Hooks 추가 (20분)
5. ✅ 테스트 (10분)

### Day 2 (2-3시간)
6. ✅ 자동 세션 갱신 미들웨어 통합 (1시간)
7. ✅ auth.ts를 Supabase로 마이그레이션 (1-2시간)
8. ✅ E2E 테스트 업데이트 및 실행 (30분)

---

## 예상 결과

### 개선 전
- ❌ 미들웨어 없음 (페이지 레벨 보호)
- ❌ Supabase 미연동 (플레이스홀더 인증)
- ❌ 세션 만료 시 강제 로그아웃
- ❌ 반복적인 세션 접근 코드

### 개선 후
- ✅ 미들웨어로 중앙 집중식 라우트 보호
- ✅ Supabase 실제 DB 연결
- ✅ 세션 자동 갱신 (UX 향상)
- ✅ Custom Hooks로 코드 단순화

**종합 점수 예상**: 18/25 → 22/25 (88%)

---

## 주의사항

### 1. 환경 변수 보안
- `.env.local` 절대 커밋하지 말 것
- `.env.example` 업데이트
- Vercel 배포 시 환경 변수 별도 설정

### 2. Supabase RLS
- 초기에는 RLS 비활성화하고 테스트
- 작동 확인 후 RLS 정책 추가

### 3. 미들웨어 성능
- Edge Runtime 사용 (빠름)
- 복잡한 로직은 Server Components로

### 4. 테스트 필수
- E2E 테스트 모두 통과 확인
- TypeScript 에러 없음 확인
- 로그인/로그아웃 수동 테스트

---

## 참고 자료

1. **Supabase SSR Guide**: https://supabase.com/docs/guides/auth/server-side/nextjs
2. **NextAuth Middleware**: https://authjs.dev/getting-started/session-management/protecting
3. **분석 문서**:
   - `docs/research/repos/01-asharibali-nextauthv5.md`
   - `docs/research/repos/02-wpcodevo-supabase-ssr.md`
4. **PRD**: `docs/prd.md` Phase 2

---

**작성일**: 2025-01-14
**업데이트**: Phase 2 완료 후 체크리스트 업데이트 예정
**다음 단계**: Phase 3 중기 개선사항 참고 (`mid-term-improvements.md`)
