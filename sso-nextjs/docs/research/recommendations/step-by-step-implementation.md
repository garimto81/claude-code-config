# 단계별 구현 가이드 (Step-by-Step Implementation)

**작성일**: 2025-01-14
**대상 Phase**: Phase 2 + 3
**예상 시간**: 4-5시간
**목표**: GitHub 레포 분석을 바탕으로 실제 코드 구현

---

## 🎯 구현 목표

이 가이드는 **복사/붙여넣기만으로 80% 완성**되도록 설계되었습니다.

**구현할 기능**:
1. ✅ Supabase Client 팩토리 (server/client)
2. ✅ 미들웨어 라우트 보호
3. ✅ Custom Hooks (useCurrentUser, useRole)
4. ✅ Shadcn UI 통합
5. ✅ 환경 변수 검증
6. ✅ 테마 시스템 (선택)

---

## 📦 사전 준비

### 1. Supabase 프로젝트 생성

1. https://supabase.com 접속
2. "New Project" 클릭
3. 프로젝트 이름: `sso-nextjs-dev`
4. Database Password: 강력한 비밀번호 생성
5. Region: Northeast Asia (Seoul)
6. 생성 완료 대기 (2-3분)

### 2. 환경 변수 수집

프로젝트 Settings → API에서:
```bash
# .env.local에 추가
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. 패키지 설치

```bash
# Supabase
npm install @supabase/ssr @supabase/supabase-js

# Validation
npm install zod

# UI (Phase 3)
npm install clsx tailwind-merge class-variance-authority
npm install next-themes

# Dev dependencies
npm install -D @types/node
```

---

## 🔧 Phase 2: Supabase 연동 및 미들웨어

### Step 1: Supabase Server Client 생성 (10분)

**파일 생성**: `lib/supabase/server.ts`

```typescript
// lib/supabase/server.ts
// 출처: Supabase 공식 문서 (MIT 라이선스)
// https://supabase.com/docs/guides/auth/server-side/nextjs

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
            // Server Component에서는 쿠키 설정 불가 (무시)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component에서는 쿠키 삭제 불가 (무시)
          }
        },
      },
    }
  )
}
```

**검증**:
```bash
# TypeScript 컴파일 확인
npx tsc --noEmit
```

---

### Step 2: Supabase Browser Client 생성 (5분)

**파일 생성**: `lib/supabase/client.ts`

```typescript
// lib/supabase/client.ts
// 출처: Supabase 공식 문서 (MIT 라이선스)
// https://supabase.com/docs/guides/auth/server-side/nextjs

import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

---

### Step 3: 환경 변수 검증 (10분)

**파일 생성**: `lib/env.ts`

```typescript
// lib/env.ts
// 참고: wpcodevo 패턴, Zod 공식 문서
// 재작성: 우리 프로젝트용

import { z } from 'zod'

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // NextAuth
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL'),
  NEXTAUTH_SECRET: z.string().min(32, 'NEXTAUTH_SECRET must be at least 32 characters'),
})

export type Env = z.infer<typeof envSchema>

// 환경 변수 검증 및 export
export const env: Env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
})

// 사용 예시:
// import { env } from '@/lib/env'
// const url = env.NEXT_PUBLIC_SUPABASE_URL
```

**lib/supabase/server.ts 업데이트**:
```typescript
// 상단에 추가
import { env } from '@/lib/env'

// createServerClient 호출 시
return createServerClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // ... 나머지 코드
)
```

**lib/supabase/client.ts 업데이트**:
```typescript
// 상단에 추가
import { env } from '@/lib/env'

// createBrowserClient 호출 시
return createBrowserClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
```

**검증**:
```bash
# 환경 변수 누락 시 에러 발생 확인
npm run dev
```

---

### Step 4: 미들웨어 구현 (20분)

**파일 생성**: `middleware.ts` (프로젝트 루트)

```typescript
// middleware.ts
// 참고: AsharibAli 패턴, NextAuth 공식 문서
// 재작성: 우리 프로젝트용
// https://authjs.dev/getting-started/session-management/protecting

import { auth } from "@/lib/auth"
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
```

**기존 admin/page.tsx 업데이트** (서버 컴포넌트 보호 제거):

```typescript
// app/admin/page.tsx
// 기존 코드에서 redirect 로직 제거 (미들웨어가 처리)

import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth()

  // 미들웨어에서 이미 체크했으므로 여기서는 표시만
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>환영합니다, {session?.user?.name}님!</p>
      <p>Role: {session?.user?.role}</p>
    </div>
  )
}
```

---

### Step 5: Forbidden 페이지 생성 (5분)

**파일 생성**: `app/forbidden/page.tsx`

```typescript
// app/forbidden/page.tsx
// 새로 작성

import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <p className="mt-4 text-xl text-gray-600">
          이 페이지에 접근할 권한이 없습니다.
        </p>
        <p className="mt-2 text-gray-500">
          Admin 권한이 필요합니다.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  )
}
```

---

### Step 6: Custom Hooks 추가 (10분)

**폴더 생성**: `hooks/`

**파일 생성**: `hooks/useCurrentUser.ts`

```typescript
// hooks/useCurrentUser.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)

'use client'

import { useSession } from "next-auth/react"

/**
 * 현재 로그인한 사용자 정보 반환
 * @returns User 객체 또는 undefined
 */
export function useCurrentUser() {
  const { data: session } = useSession()
  return session?.user
}
```

**파일 생성**: `hooks/useRole.ts`

```typescript
// hooks/useRole.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)

'use client'

import { useCurrentUser } from "./useCurrentUser"

/**
 * 현재 사용자의 역할 반환
 * @returns 'admin' | 'user' | undefined
 */
export function useRole() {
  const user = useCurrentUser()
  return user?.role
}
```

**Admin 페이지에서 사용** (app/admin/page.tsx를 Client Component로 변경):

```typescript
// app/admin/page.tsx
'use client'

import { useCurrentUser, useRole } from "@/hooks/useCurrentUser"

export default function AdminPage() {
  const user = useCurrentUser()
  const role = useRole()

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <p>환영합니다, {user.name}님!</p>
      <p>Role: {role}</p>
      <p>Email: {user.email}</p>
    </div>
  )
}
```

---

### Step 7: 테스트 (20분)

**E2E 테스트 업데이트**: `tests/e2e/auth.spec.ts`

```typescript
// tests/e2e/auth.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Middleware Protection', () => {
  test('non-authenticated user redirected to login from /admin', async ({ page }) => {
    await page.goto('http://localhost:3015/admin')

    // /login으로 리다이렉트 확인
    await expect(page).toHaveURL(/\/login/)

    // callbackUrl 파라미터 확인
    const url = new URL(page.url())
    expect(url.searchParams.get('callbackUrl')).toBe('/admin')
  })

  test('non-admin user redirected to /forbidden', async ({ page }) => {
    // 일반 사용자로 로그인
    await page.goto('http://localhost:3015/login')
    await page.fill('input[name="email"]', 'user@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')

    // Admin 페이지 접근 시도
    await page.goto('http://localhost:3015/admin')

    // /forbidden으로 리다이렉트 확인
    await expect(page).toHaveURL('http://localhost:3015/forbidden')
    await expect(page.locator('h1')).toContainText('403')
  })

  test('admin user can access /admin', async ({ page }) => {
    // Admin 사용자로 로그인
    await page.goto('http://localhost:3015/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Admin 페이지 접근
    await page.goto('http://localhost:3015/admin')

    // 접근 성공 확인
    await expect(page).toHaveURL('http://localhost:3015/admin')
    await expect(page.locator('h1')).toContainText('Admin Dashboard')
  })
})

test.describe('Custom Hooks', () => {
  test('useCurrentUser returns user data', async ({ page }) => {
    // Admin으로 로그인
    await page.goto('http://localhost:3015/login')
    await page.fill('input[name="email"]', 'admin@example.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')

    // Admin 페이지에서 user 정보 확인
    await page.goto('http://localhost:3015/admin')
    await expect(page.locator('text=환영합니다')).toBeVisible()
    await expect(page.locator('text=admin@example.com')).toBeVisible()
  })
})
```

**테스트 실행**:
```bash
# 개발 서버 시작 (테스트 포트)
npm run dev:test

# 다른 터미널에서 E2E 테스트 실행
npx playwright test tests/e2e/auth.spec.ts
```

---

## 🎨 Phase 3: UI/UX 개선

### Step 8: Shadcn UI 설치 (20분)

**1. Shadcn UI 초기화**:
```bash
npx shadcn-ui@latest init
```

**프롬프트 응답**:
```
✔ Would you like to use TypeScript (recommended)? … yes
✔ Which style would you like to use? › Default
✔ Which color would you like to use as base color? › Slate
✔ Where is your global CSS file? … app/globals.css
✔ Would you like to use CSS variables for colors? … yes
✔ Are you using a custom tailwind prefix eg. tw-? (Leave blank if not) …
✔ Where is your tailwind.config.js located? … tailwind.config.ts
✔ Configure the import alias for components: … @/components
✔ Configure the import alias for utils: … @/lib/utils
✔ Are you using React Server Components? … yes
```

**2. 필요한 컴포넌트 추가**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add label
```

**3. 생성된 파일 확인**:
- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/alert.tsx`
- `components/ui/label.tsx`
- `lib/utils.ts` (cn 함수)

---

### Step 9: 로그인 페이지 UI 개선 (30분)

**파일 업데이트**: `app/login/page.tsx`

```typescript
// app/login/page.tsx
'use client'

import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">로그인</CardTitle>
          <CardDescription>
            계정에 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 text-sm text-gray-600">
          <p>테스트 계정:</p>
          <p>Admin: admin@example.com / admin123</p>
          <p>User: user@example.com / password123</p>
        </CardFooter>
      </Card>
    </div>
  )
}
```

---

### Step 10: 테마 시스템 추가 (선택, 30분)

**1. next-themes 설치**:
```bash
npm install next-themes
```

**2. Providers 파일 생성**: `app/providers.tsx`

```typescript
// app/providers.tsx
'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
```

**3. Root Layout 업데이트**: `app/layout.tsx`

```typescript
// app/layout.tsx
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SSO Next.js",
  description: "NextAuth.js + Supabase Integration",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**4. 테마 토글 컴포넌트 생성**: `components/theme-toggle.tsx`

```typescript
// components/theme-toggle.tsx
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="fixed top-4 right-4"
    >
      {theme === 'dark' ? (
        <span className="text-lg">🌞</span>
      ) : (
        <span className="text-lg">🌙</span>
      )}
      <span className="sr-only">테마 전환</span>
    </Button>
  )
}
```

**5. Admin 페이지에 테마 토글 추가**:

```typescript
// app/admin/page.tsx
import { ThemeToggle } from "@/components/theme-toggle"

export default function AdminPage() {
  return (
    <>
      <ThemeToggle />
      <div className="p-8">
        {/* 기존 코드 */}
      </div>
    </>
  )
}
```

**6. globals.css에 Dark 모드 변수 추가**:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... Shadcn UI 기본 변수 ... */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... Shadcn UI dark 변수 ... */
  }
}
```

---

## ✅ 최종 검증

### Phase 2 체크리스트

```bash
# 1. TypeScript 컴파일 확인
npx tsc --noEmit

# 2. 개발 서버 시작
npm run dev:test

# 3. E2E 테스트 실행
npx playwright test

# 4. 수동 테스트
# - http://localhost:3015/login 접속
# - admin@example.com / admin123 로그인
# - http://localhost:3015/admin 접근 → 성공
# - 로그아웃
# - user@example.com / password123 로그인
# - http://localhost:3015/admin 접근 → /forbidden 리다이렉트
```

**기대 결과**:
- ✅ TypeScript 에러 없음
- ✅ E2E 테스트 모두 통과
- ✅ 미들웨어 라우트 보호 작동
- ✅ Custom Hooks 작동
- ✅ Forbidden 페이지 표시

### Phase 3 체크리스트

```bash
# 1. UI 컴포넌트 확인
# - Shadcn Button, Input, Card 작동
# - Alert 에러 메시지 표시
# - 로딩 상태 버튼 비활성화

# 2. 접근성 테스트
npx playwright test --project=chromium --grep "accessibility"

# 3. Lighthouse 점수 확인 (Chrome DevTools)
# - Performance > 90
# - Accessibility > 90
# - Best Practices > 90
```

**기대 결과**:
- ✅ Shadcn UI 컴포넌트 렌더링
- ✅ Dark/Light 테마 전환 작동
- ✅ 접근성 점수 > 90

---

## 🎉 완료 후 상태

**구현된 기능**:
- ✅ Supabase Client 팩토리 (server/client)
- ✅ 미들웨어 라우트 보호 (admin, dashboard)
- ✅ Custom Hooks (useCurrentUser, useRole)
- ✅ 환경 변수 검증 (Zod)
- ✅ Shadcn UI 통합
- ✅ 개선된 로그인 UI
- ✅ Forbidden 페이지
- ✅ (선택) Dark/Light 테마 모드

**예상 점수 향상**:
- **개선 전**: 18/25 (72%)
- **개선 후**: 22/25 (88%)

**다음 단계**:
- Phase 4: auth.ts를 Supabase로 마이그레이션 (또는 NextAuth 유지 결정)
- Phase 5: Rate Limiting, 로그인 시도 로깅 추가
- Phase 6: Production 배포 준비

---

## 🚨 문제 해결

### 문제 1: "Cannot find module '@/lib/env'"

**원인**: TypeScript 경로 설정 누락

**해결**:
```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### 문제 2: Supabase 환경 변수 에러

**원인**: `.env.local` 파일 누락 또는 잘못된 키

**해결**:
1. `.env.local` 파일 존재 확인
2. Supabase 프로젝트 Settings → API에서 키 재확인
3. 개발 서버 재시작 (`npm run dev`)

### 문제 3: 미들웨어 무한 리다이렉트

**원인**: `/login` 경로도 matcher에 포함됨

**해결**:
```typescript
// middleware.ts
export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    // '/login'을 포함하지 말 것!
  ]
}
```

### 문제 4: Shadcn UI 스타일 미적용

**원인**: `globals.css`에 Tailwind 지시어 누락

**해결**:
```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 반드시 최상단에 위치 */
```

---

**작성 완료**: 2025-01-14
**예상 구현 시간**: 4-5시간
**난이도**: 중 (복사/붙여넣기 80%, 커스터마이징 20%)
**법적 안전성**: ✅ 공식 문서 기반, MIT 라이선스 준수
