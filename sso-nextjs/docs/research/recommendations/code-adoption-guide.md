# 코드 채택 가이드 (Code Adoption Guide)

**작성일**: 2025-01-14
**목적**: 분석한 GitHub 레포에서 실제로 가져와 사용할 수 있는 코드 식별

---

## ⚖️ 라이선스 현황

| 레포 | 라이선스 | 코드 사용 가능 여부 | 주의사항 |
|------|----------|---------------------|----------|
| **AsharibAli/next-authjs-v5** | ❌ 불명 | ⚠️ 조심 필요 | 개념 참고, 재작성 권장 |
| **wpcodevo/nextjs14-supabase-ssr** | ❌ 불명 | ⚠️ 조심 필요 | Supabase 공식 문서 패턴 사용 권장 |
| **SarathAdhi/next-supabase-auth** | ❌ 불명 | ⚠️ 조심 필요 | Shadcn UI는 MIT (별도) |
| **mryechkin/nextjs-supabase-auth** | ✅ MIT | ✅ 자유 사용 | JavaScript → TypeScript 변환 필요 |

### 법적 안전 지침

**직접 복사 가능**:
- MIT 라이선스 명시 코드만 (mryechkin)
- 공식 문서의 예제 코드 (Supabase Docs, NextAuth Docs)
- Shadcn UI 컴포넌트 (MIT 라이선스)

**참고해서 재작성** (Clean Room Implementation):
- 라이선스 불명확한 레포의 로직
- 코드 구조를 이해하고 우리 방식으로 재구현
- 주석과 변수명은 반드시 변경

**피해야 할 행위**:
- 라이선스 불명 코드를 그대로 복사
- 저작권 표시 제거
- 상업적 사용 시 법적 검토 없이 진행

---

## 📦 Phase별 채택 전략

### Phase 2: Supabase 연동 및 미들웨어

#### 1. Supabase Client 팩토리 (wpcodevo 패턴)

**출처**: wpcodevo/nextjs14-supabase-ssr-authentication
**라이선스**: 불명 → **Supabase 공식 문서 패턴 사용**

**✅ 안전한 방법**: Supabase 공식 문서 참고
- https://supabase.com/docs/guides/auth/server-side/nextjs

**구현 파일**:
```typescript
// lib/supabase/server.ts
// 출처: Supabase 공식 문서 (MIT 라이선스)
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
            // Server Component에서 쿠키 설정 불가
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component에서 쿠키 삭제 불가
          }
        },
      },
    }
  )
}
```

```typescript
// lib/supabase/client.ts
// 출처: Supabase 공식 문서 (MIT 라이선스)
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**설치 필요 패키지**:
```bash
npm install @supabase/ssr @supabase/supabase-js
```

**통합 체크리스트**:
- [ ] `lib/supabase/` 폴더 생성
- [ ] `server.ts` 작성 (공식 문서 패턴)
- [ ] `client.ts` 작성 (공식 문서 패턴)
- [ ] `.env.local`에 Supabase 키 추가
- [ ] 환경 변수 검증 함수 추가

---

#### 2. 미들웨어 (AsharibAli 패턴 참고)

**출처**: AsharibAli/next-authjs-v5
**라이선스**: 불명 → **NextAuth 공식 문서 + 재작성**

**✅ 안전한 방법**: NextAuth 공식 문서 기반 재작성
- https://authjs.dev/getting-started/session-management/protecting

**구현 파일**:
```typescript
// middleware.ts
// 참고: AsharibAli 패턴, NextAuth 공식 문서
// 재작성: 우리 프로젝트용으로 커스터마이징
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Admin 라우트 보호
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // 역할 체크
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

**forbidden 페이지 생성**:
```typescript
// app/forbidden/page.tsx
// 새로 작성 (공통 패턴)
export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="text-xl">접근 권한이 없습니다.</p>
        <a href="/" className="text-blue-600 underline">
          홈으로 돌아가기
        </a>
      </div>
    </div>
  )
}
```

**통합 체크리스트**:
- [ ] `middleware.ts` 생성 (NextAuth 공식 패턴)
- [ ] `app/forbidden/page.tsx` 생성
- [ ] E2E 테스트 업데이트
- [ ] 테스트 실행 및 검증

---

#### 3. Custom Hooks (AsharibAli 패턴 참고)

**출처**: AsharibAli/next-authjs-v5
**라이선스**: 불명 → **재작성 (매우 간단한 로직)**

**✅ 안전한 방법**: 일반적인 React Hook 패턴 (공공재)

**구현 파일**:
```typescript
// hooks/useCurrentUser.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)
'use client'

import { useSession } from "next-auth/react"

export const useCurrentUser = () => {
  const { data: session } = useSession()
  return session?.user
}
```

```typescript
// hooks/useRole.ts
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)
'use client'

import { useCurrentUser } from "./useCurrentUser"

export const useRole = () => {
  const user = useCurrentUser()
  return user?.role
}
```

**통합 체크리스트**:
- [ ] `hooks/` 폴더 생성
- [ ] `useCurrentUser.ts` 작성
- [ ] `useRole.ts` 작성
- [ ] Admin 페이지에서 사용
- [ ] Home 페이지에서 사용

---

### Phase 3: UI/UX 개선

#### 4. Shadcn UI 통합 (SarathAdhi 패턴)

**출처**: SarathAdhi/next-supabase-auth
**Shadcn UI 라이선스**: ✅ MIT (자유 사용 가능)

**✅ 안전한 방법**: Shadcn CLI 사용 (공식 방법)
- https://ui.shadcn.com/docs/installation/next

**설치 및 설정**:
```bash
# Shadcn UI 초기화
npx shadcn-ui@latest init

# 컴포넌트 추가
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add dialog
```

**components.json 설정** (SarathAdhi 참고):
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "app/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

**cn() 유틸리티 함수**:
```typescript
// lib/utils.ts
// 출처: Shadcn UI 공식 (MIT 라이선스)
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**설치 필요 패키지**:
```bash
npm install clsx tailwind-merge class-variance-authority
npm install @radix-ui/react-slot
```

**통합 체크리스트**:
- [ ] Shadcn UI 초기화
- [ ] `components.json` 생성
- [ ] `lib/utils.ts` 생성 (cn 함수)
- [ ] 필요한 컴포넌트 추가
- [ ] 로그인 페이지 UI 개선
- [ ] 에러 Alert 컴포넌트 적용

---

#### 5. 테마 시스템 (SarathAdhi 패턴)

**출처**: SarathAdhi/next-supabase-auth
**next-themes 라이선스**: ✅ MIT

**설치**:
```bash
npm install next-themes
```

**구현 파일**:
```typescript
// app/providers.tsx
// 참고: SarathAdhi, next-themes 공식 문서
// 재작성: 우리 프로젝트용
'use client'

import { ThemeProvider } from 'next-themes'
import { SessionProvider } from 'next-auth/react'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>{children}</SessionProvider>
    </ThemeProvider>
  )
}
```

**Root Layout 업데이트**:
```typescript
// app/layout.tsx
import { Providers } from './providers'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
```

**테마 토글 컴포넌트**:
```typescript
// components/theme-toggle.tsx
// 참고: Shadcn UI 공식 예제 (MIT)
'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

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
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  )
}
```

**통합 체크리스트**:
- [ ] `next-themes` 설치
- [ ] `app/providers.tsx` 생성
- [ ] `app/layout.tsx` 업데이트
- [ ] `components/theme-toggle.tsx` 생성
- [ ] Dark 모드 CSS 변수 설정
- [ ] 테스트

---

## 🔧 공통 유틸리티

### 환경 변수 검증 (wpcodevo 패턴 참고)

**출처**: wpcodevo (라이선스 불명) → **Zod 공식 문서 패턴 사용**

```typescript
// lib/env.ts
// 참고: wpcodevo 패턴, Zod 공식 문서
// 재작성: 우리 프로젝트용
import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
})

export const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
})
```

**통합 체크리스트**:
- [ ] `lib/env.ts` 생성
- [ ] 모든 환경 변수 검증 스키마 추가
- [ ] 앱 시작 시 검증 실행
- [ ] 에러 메시지 개선

---

## 📋 전체 구현 순서

### Day 1: Supabase 연동 (2시간)

1. **패키지 설치** (5분)
```bash
npm install @supabase/ssr @supabase/supabase-js
```

2. **Supabase Client 생성** (20분)
- [ ] `lib/supabase/server.ts` 작성 (공식 문서)
- [ ] `lib/supabase/client.ts` 작성 (공식 문서)
- [ ] 환경 변수 설정

3. **미들웨어 구현** (30분)
- [ ] `middleware.ts` 작성 (NextAuth 공식 + 재작성)
- [ ] `app/forbidden/page.tsx` 생성

4. **Custom Hooks 추가** (15분)
- [ ] `hooks/useCurrentUser.ts` 작성
- [ ] `hooks/useRole.ts` 작성

5. **환경 변수 검증** (10분)
- [ ] `lib/env.ts` 작성 (Zod)

6. **테스트** (30분)
- [ ] E2E 테스트 업데이트
- [ ] 테스트 실행

---

### Day 2: UI 개선 (2-3시간)

1. **Shadcn UI 설치** (30분)
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button input card alert dialog
npm install clsx tailwind-merge class-variance-authority
```

2. **cn() 유틸리티** (5분)
- [ ] `lib/utils.ts` 작성

3. **테마 시스템** (30분)
- [ ] `next-themes` 설치
- [ ] `app/providers.tsx` 생성
- [ ] `app/layout.tsx` 업데이트
- [ ] `components/theme-toggle.tsx` 생성

4. **로그인 페이지 UI 개선** (1시간)
- [ ] Shadcn Button, Input, Card 사용
- [ ] Alert 컴포넌트로 에러 표시
- [ ] 로딩 상태 개선

5. **테스트** (30분)
- [ ] UI 컴포넌트 테스트
- [ ] 접근성 검증

---

## 🚨 주의사항

### 법적 위험 회피

**절대 하지 말 것**:
- ❌ 라이선스 불명 코드를 그대로 복사/붙여넣기
- ❌ 저작권 표시 제거
- ❌ 상업적 사용 시 법적 검토 없이 진행

**안전한 방법**:
- ✅ 공식 문서 예제 코드 사용 (Supabase, NextAuth, Shadcn UI)
- ✅ MIT 라이선스 코드 사용 (저작권 표시 유지)
- ✅ 개념 이해 후 재작성 (Clean Room Implementation)
- ✅ 일반적인 패턴 사용 (React Hook, TypeScript 타입 등)

### Clean Room Implementation 가이드

라이선스 불명 코드를 참고할 때:
1. **코드 읽기**: 로직과 구조 이해
2. **코드 닫기**: 원본 코드를 보지 않음
3. **재작성**: 우리 방식으로 처음부터 작성
4. **변수명/주석 변경**: 완전히 다른 이름 사용
5. **테스트**: 독립적으로 검증

**예시**:
```typescript
// ❌ 나쁜 예: 그대로 복사
// 출처: AsharibAli 레포 (라이선스 불명)
export const useCurrentUser = () => {
  const { data: session } = useSession()
  return session?.user
}

// ✅ 좋은 예: 재작성
// 참고: AsharibAli 패턴
// 재작성: 표준 React Hook 패턴 (공공재)
export function useCurrentUser() {
  const sessionData = useSession()
  return sessionData.data?.user ?? null
}
```

---

## 📊 채택 우선순위

| 항목 | 출처 | 라이선스 | 채택 방법 | 우선순위 |
|------|------|----------|-----------|----------|
| **Supabase Client** | wpcodevo | 불명 | 공식 문서 사용 | 🔴 Critical |
| **미들웨어** | AsharibAli | 불명 | NextAuth 공식 + 재작성 | 🔴 Critical |
| **Custom Hooks** | AsharibAli | 불명 | 재작성 (간단) | 🟡 Medium |
| **Shadcn UI** | SarathAdhi | MIT | CLI로 설치 | 🟡 Medium |
| **cn() 함수** | Shadcn UI | MIT | 공식 코드 사용 | 🟡 Medium |
| **테마 시스템** | SarathAdhi | MIT (next-themes) | 공식 문서 | 🟢 Low |
| **환경 변수 검증** | wpcodevo | 불명 | Zod 공식 문서 | 🟡 Medium |

---

## 🔗 공식 문서 참고

**Supabase**:
- https://supabase.com/docs/guides/auth/server-side/nextjs
- https://supabase.com/docs/reference/javascript/installing

**NextAuth.js**:
- https://authjs.dev/getting-started/installation
- https://authjs.dev/getting-started/session-management/protecting

**Shadcn UI**:
- https://ui.shadcn.com/docs/installation/next
- https://ui.shadcn.com/docs/components

**Zod**:
- https://zod.dev/?id=primitives
- https://zod.dev/?id=parsing

**next-themes**:
- https://github.com/pacocoursey/next-themes

---

## ✅ 최종 체크리스트

### Phase 2 완료 조건
- [ ] Supabase Client 팩토리 작동 (server/client)
- [ ] 미들웨어 라우트 보호 작동 (admin 접근 제한)
- [ ] Custom Hooks 사용 가능 (useCurrentUser, useRole)
- [ ] 환경 변수 검증 통과
- [ ] E2E 테스트 모두 통과
- [ ] TypeScript 에러 없음
- [ ] npm audit 0 high/critical

### Phase 3 완료 조건
- [ ] Shadcn UI 컴포넌트 설치 완료
- [ ] cn() 함수 작동
- [ ] 로그인 페이지 UI 개선
- [ ] (선택) 테마 모드 작동
- [ ] 접근성 점수 > 90 (Lighthouse)
- [ ] UI 컴포넌트 테스트 통과

---

**작성 완료**: 2025-01-14
**예상 구현 시간**: 4-5시간 (Phase 2 + 3)
**법적 안전성**: 공식 문서 및 MIT 라이선스 코드 기반
**다음 단계**: Phase 2 시작 전 팀 논의 (NextAuth vs Supabase Auth 결정)
