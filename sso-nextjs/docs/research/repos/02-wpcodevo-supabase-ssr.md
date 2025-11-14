# wpcodevo/nextjs14-supabase-ssr-authentication 분석

**분석일**: 2025-01-14
**분석자**: Claude Code Agent

---

## 📊 기본 정보

- **GitHub**: https://github.com/wpcodevo/nextjs14-supabase-ssr-authentication
- **Stars**: 60 ⭐
- **Forks**: 11
- **Last Updated**: 2024년 1월 생성
- **Commits**: 6개
- **문서화**: 상 (블로그 튜토리얼 2개 연동)
- **라이선스**: 확인 필요
- **Package Manager**: pnpm

**특징**: Supabase SSR 인증의 포괄적인 구현 예제 (이메일/비밀번호 + OAuth)

---

## 🛠️ 기술 스택

### 핵심 기술
- **Framework**: Next.js 14 (App Router)
- **Authentication**: Supabase Auth (네이티브)
- **SSR Package**: `@supabase/ssr` (최신 권장 방식)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (97.1%)
- **OAuth**: Google, GitHub 통합
- **Package Manager**: pnpm

### Supabase 관련 패키지 (추정)
```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x",  // 최신 SSR 패키지
  "next": "^14.x",
  "tailwindcss": "^3.x"
}
```

**중요**: `@supabase/auth-helpers` (deprecated) 대신 `@supabase/ssr` 사용

---

## 🏗️ 아키텍처 분석

### 폴더 구조
```
nextjs14-supabase-ssr-authentication/
├── app/                 # Next.js 14 App Router
│   ├── (auth)/          # 인증 라우트 (추정)
│   │   ├── login/
│   │   └── signup/
│   ├── (protected)/     # 보호된 라우트 (추정)
│   └── api/             # API 라우트 (선택적)
├── components/          # UI 컴포넌트
│   ├── auth/            # 인증 관련 컴포넌트 (추정)
│   └── ui/              # 공통 UI (추정)
├── lib/                 # 유틸리티
│   ├── supabase/
│   │   ├── client.ts    # 클라이언트 컴포넌트용
│   │   ├── server.ts    # 서버 컴포넌트용
│   │   └── middleware.ts # 미들웨어용
│   └── validation.ts    # 스키마 검증 (추정)
├── middleware.ts        # 쿠키 갱신 및 라우트 보호
├── example.env          # 환경 변수 템플릿
└── public/
```

### 핵심 아키텍처 패턴

#### 1. **Supabase Client 팩토리 패턴** (중요!)
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
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
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

#### 2. **Server Actions로 인증 처리**
```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}
```

#### 3. **미들웨어로 세션 갱신** (핵심!)
```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // 세션 자동 갱신 (중요!)
  await supabase.auth.getUser()

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 🔐 인증 흐름

### 지원 인증 방식
1. **Email/Password (Supabase Native)**
   - 회원가입 (signUp)
   - 로그인 (signInWithPassword)
   - 로그아웃 (signOut)

2. **OAuth (Google, GitHub)**
   - `signInWithOAuth({ provider: 'google' })`
   - `signInWithOAuth({ provider: 'github' })`
   - 콜백 URL 자동 처리

### 주요 워크플로우

#### 회원가입 흐름
```
사용자 입력 (이메일, 비밀번호)
    ↓
Server Action: signUp()
    ↓
Supabase: auth.signUp()
    ↓
이메일 인증 링크 발송 (Supabase 자동)
    ↓
사용자 클릭
    ↓
자동 로그인
    ↓
리다이렉트 → /dashboard
```

#### 로그인 흐름
```
Credentials/OAuth 제공
    ↓
Server Action: signIn()
    ↓
Supabase: auth.signInWithPassword()
    ↓
쿠키 설정 (httpOnly)
    ↓
Middleware: 세션 갱신
    ↓
React Server Component: 세션 가져오기
```

#### 자동 세션 갱신 (핵심 차별점!)
```
User Request
    ↓
Middleware 실행
    ↓
supabase.auth.getUser() 호출
    ↓
세션 만료 확인
    ↓
Yes → 자동 refresh_token으로 갱신
    ↓
새 쿠키 설정
    ↓
Response 반환
```

---

## 🎯 주요 기능

### 인증 기능
- [x] 이메일/비밀번호 회원가입
- [x] 이메일/비밀번호 로그인
- [x] Google OAuth
- [x] GitHub OAuth
- [x] 이메일 인증 (Supabase 자동)
- [x] 로그아웃
- [x] 세션 자동 갱신

### 보안 기능
- [x] httpOnly 쿠키 (Supabase 기본)
- [x] CSRF 보호 (Server Actions)
- [x] 미들웨어 기반 라우트 보호
- [x] 자동 세션 갱신
- [x] RLS (Row Level Security) - Supabase 기본

### 개발자 경험
- [x] Server Actions
- [x] React Server Components
- [x] TypeScript 타입 안정성
- [x] pnpm (빠른 설치)

### 미구현
- [ ] Rate Limiting
- [ ] 계정 잠금
- [ ] 로그인 시도 로깅
- [ ] 2FA
- [ ] 비밀번호 재설정 UI
- [ ] E2E 테스트

---

## 📊 평가

| 항목 | 점수 | 코멘트 |
|------|------|--------|
| **적용 용이성** | 5/5 | Supabase 네이티브라 우리 PRD와 완벽 호환 |
| **PRD 적합성** | 4/5 | 기본 인증은 완벽, 고급 기능(Rate Limiting 등) 없음 |
| **유지보수성** | 4/5 | 명확한 구조, 다만 문서화는 블로그 의존 |
| **커뮤니티 활성도** | 3/5 | 6개 커밋으로 제한적, 튜토리얼 목적 |
| **확장성** | 4/5 | Supabase 생태계로 확장 용이 |

**총점**: 20/25 (80%)

### 강점
- ✅ **Supabase SSR 최신 패턴**: `@supabase/ssr` 사용
- ✅ **자동 세션 갱신**: 미들웨어로 투명하게 처리
- ✅ **OAuth 통합**: Google, GitHub 간단히 추가
- ✅ **Server Actions**: CSRF 보호 자동
- ✅ **RLS 활용 가능**: Supabase 기본 기능

### 약점
- ❌ Rate Limiting 없음
- ❌ 계정 잠금 없음
- ❌ 로그인 시도 로깅 없음
- ❌ E2E 테스트 없음
- ⚠️ 문서화가 외부 블로그 의존

---

## 🔄 우리 프로젝트와 비교

| 항목 | 우리 프로젝트 | wpcodevo 프로젝트 | 차이점 | 우선순위 |
|------|--------------|-------------------|--------|----------|
| **인증**
| 인증 시스템 | NextAuth v5 | Supabase Auth | 완전히 다른 시스템 | 🔴 Phase 2 |
| Credentials | ✅ | ✅ | 둘 다 지원 | - |
| OAuth | ❌ | ✅ | OAuth 미구현 | 🟡 Medium |
| **보안**
| 미들웨어 | ❌ | ✅ | 라우트 보호 + 세션 갱신 | 🔴 High |
| 세션 갱신 | 수동 | ✅ 자동 | 자동 갱신 없음 | 🔴 High |
| Rate Limiting | ❌ | ❌ | 양쪽 다 없음 | 🔴 High |
| **데이터베이스**
| DB | ❌ | ✅ Supabase | DB 미연결 | 🔴 High |
| RLS | ❌ | ✅ | RLS 미사용 | 🔴 High |
| **아키텍처**
| Supabase Client | ❌ | ✅ 3종 | Client 팩토리 없음 | 🔴 High |
| Server Actions | ✅ | ✅ | 둘 다 사용 | - |
| **테스팅**
| E2E | ✅ | ❌ | 우리가 우수 | - |

---

## 💡 적용 가능한 개선사항

### 즉시 적용 가능 (Phase 2 - 이번 주)

#### 1. **Supabase Client 팩토리 생성** 🔴 High
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

```typescript
// lib/supabase/client.ts (클라이언트 컴포넌트용)
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**적용 이유**: Supabase 통합의 핵심 기반
**예상 시간**: 30분
**의존성**: `@supabase/ssr`, `@supabase/supabase-js`

#### 2. **Supabase 통합 미들웨어** 🔴 High
```typescript
// middleware.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

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

  // 세션 자동 갱신
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 보호된 라우트 체크
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // profiles 테이블에서 역할 확인 (Phase 2.5)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
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

**적용 이유**:
- 라우트 보호
- 자동 세션 갱신 (핵심!)
- 역할 기반 접근 제어

**예상 시간**: 1시간
**주의사항**: Supabase profiles 테이블 생성 필요

#### 3. **auth.ts를 Supabase로 마이그레이션** 🔴 High

**전략 A: NextAuth v5 + Supabase (현재 구조 유지)**
```typescript
// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@/lib/supabase/server"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const supabase = createClient()

        // Supabase로 검증
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email as string,
          password: credentials.password as string,
        })

        if (error || !data.user) return null

        // 프로필 가져오기
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, display_name')
          .eq('id', data.user.id)
          .single()

        return {
          id: data.user.id,
          email: data.user.email,
          name: profile?.display_name,
          role: profile?.role || 'user',
        }
      },
    }),
  ],
  // ... 기존 callbacks
})
```

**전략 B: Supabase Auth 완전 전환 (권장!)**
```typescript
// app/actions/auth.ts
'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signIn(formData: FormData) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/admin')
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/')
}
```

**적용 이유**:
- 전략 A: 점진적 마이그레이션 (안전)
- 전략 B: Supabase 생태계 완전 활용 (권장)

**예상 시간**:
- 전략 A: 2시간
- 전략 B: 4시간 (NextAuth 제거 포함)

**결정 필요**: 팀과 논의

---

### 중기 적용 (Phase 3-4 - 다음 주)

#### 4. **OAuth 제공자 추가** 🟡 Medium

**Supabase 대시보드 설정**:
1. Authentication → Providers
2. Google/GitHub 활성화
3. Client ID, Secret 입력
4. Redirect URL 설정

**코드 구현**:
```typescript
// app/actions/auth.ts
export async function signInWithOAuth(provider: 'google' | 'github') {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (data.url) {
    redirect(data.url)
  }

  if (error) {
    return { error: error.message }
  }
}
```

**적용 이유**: 사용자 편의성 향상
**예상 시간**: 2시간 (OAuth 앱 설정 포함)

#### 5. **Supabase 마이그레이션 생성** 🔴 High
```sql
-- supabase/migrations/20240101_create_profiles.sql
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text not null default 'user' check (role in ('admin', 'user')),
  display_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS 활성화
alter table profiles enable row level security;

-- 정책 생성
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- 트리거: 새 사용자 생성 시 자동 프로필 생성
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

**적용 이유**: Supabase 데이터베이스 구조 설정
**예상 시간**: 1시간

---

### 장기 검토 (Phase 5+ - 다음 달)

#### 6. **Supabase Realtime 활용** 🟢 Low (Optional)
- 실시간 사용자 상태 업데이트
- 관리자 대시보드 실시간 통계

**예상 시간**: 3-4시간

#### 7. **Supabase Storage 통합** 🟢 Low (Optional)
- 프로필 이미지 업로드
- 파일 첨부 기능

**예상 시간**: 2-3시간

---

## 📝 배운 점 (Key Takeaways)

### 1. **Supabase SSR의 핵심: Client 팩토리**
```typescript
// Server Components용
createClient() from '@/lib/supabase/server'

// Client Components용
createClient() from '@/lib/supabase/client'

// Middleware용
직접 createServerClient() 호출
```

**교훈**: 3가지 클라이언트 팩토리 필요 (서버/클라이언트/미들웨어)

### 2. **자동 세션 갱신의 중요성**
- 미들웨어에서 `getUser()` 호출만으로 자동 갱신
- refresh_token을 투명하게 처리
- 사용자 경험 향상 (강제 로그아웃 없음)

**교훈**: 미들웨어 구현 필수!

### 3. **NextAuth vs Supabase Auth 선택**
- **NextAuth v5**: OAuth 제공자 다양, 세션 커스터마이징
- **Supabase Auth**: RLS 통합, 이메일 발송, 관리 UI

**교훈**: Supabase 전면 사용 시 Supabase Auth 권장

### 4. **Server Actions로 간단한 인증**
- CSRF 보호 자동
- 타입 안전한 폼 처리
- API 라우트 불필요

**교훈**: 모든 인증 로직을 Server Actions로

### 5. **RLS로 데이터 보안**
```sql
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);
```

**교훈**: Supabase의 킬러 기능 활용

### 6. **pnpm 사용**
- npm보다 빠른 설치
- 디스크 공간 절약

**교훈**: 프로젝트에 pnpm 도입 검토

---

## ✅ 적용 체크리스트

### Phase 2 (이번 주) - Supabase 통합
- [ ] `@supabase/ssr`, `@supabase/supabase-js` 설치
- [ ] `lib/supabase/server.ts` 생성
- [ ] `lib/supabase/client.ts` 생성
- [ ] `middleware.ts` Supabase 통합 (세션 갱신)
- [ ] Supabase 프로젝트 생성 (supabase.com)
- [ ] `.env.local`에 Supabase 키 추가
- [ ] `supabase/migrations/` 폴더 생성
- [ ] profiles 테이블 마이그레이션 작성
- [ ] **결정**: NextAuth 유지 vs Supabase Auth 전환

### Phase 2.5 (다음 주) - 인증 마이그레이션
- [ ] auth.ts를 Supabase로 마이그레이션 (전략 선택)
- [ ] Server Actions 업데이트 (Supabase 사용)
- [ ] 로그인/로그아웃 테스트
- [ ] RLS 정책 테스트

### Phase 3 (다음 주) - OAuth 추가
- [ ] Supabase 대시보드에서 OAuth 설정
- [ ] Google OAuth 앱 생성
- [ ] GitHub OAuth 앱 생성
- [ ] OAuth 콜백 라우트 생성
- [ ] 로그인 페이지에 OAuth 버튼 추가

### Phase 4-5 (다음 달)
- [ ] Supabase Realtime 검토
- [ ] Supabase Storage 검토
- [ ] pnpm 마이그레이션 검토

---

## 🔗 참고 링크

- **GitHub**: https://github.com/wpcodevo/nextjs14-supabase-ssr-authentication
- **Supabase SSR Docs**: https://supabase.com/docs/guides/auth/server-side/nextjs
- **@supabase/ssr**: https://www.npmjs.com/package/@supabase/ssr
- **Supabase RLS**: https://supabase.com/docs/guides/auth/row-level-security
- **블로그 튜토리얼**: wpcodevo.com (확인 필요)

---

## ⚠️ 중요 결정사항

### NextAuth v5 vs Supabase Auth

**NextAuth v5 유지 (전략 A)**:
- ✅ 현재 구조 유지
- ✅ 점진적 마이그레이션
- ❌ Supabase RLS와 부분적 통합
- ❌ 이중 인증 시스템 (복잡도 증가)

**Supabase Auth 전환 (전략 B - 권장!)**:
- ✅ Supabase 생태계 완전 활용
- ✅ RLS 자동 연동
- ✅ 이메일 발송 내장
- ✅ 관리 UI 제공
- ❌ NextAuth 의존성 제거 작업 필요

**팀 논의 필요**: PRD 목표와 장기 비전 고려

---

**분석 완료**: 2025-01-14
**다음 단계**: SarathAdhi/next-supabase-auth 분석
**예상 적용 시간**:
- 전략 A: 8-12시간
- 전략 B: 12-16시간
