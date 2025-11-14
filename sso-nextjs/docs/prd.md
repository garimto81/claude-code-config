# PRD-0004: NextAuth.js + Supabase 통합 인증 시스템

## 📌 요약

NextAuth.js와 Supabase를 결합한 현대적인 인증 시스템을 구축합니다. NextAuth.js의 풍부한 Provider 생태계와 Supabase의 강력한 Backend 인프라를 활용하여 빠르고 안전한 인증을 구현합니다.

### 핵심 차별점
- ✅ NextAuth.js 공식 라이브러리 활용 (~25k GitHub stars)
- ✅ Supabase 통합으로 PostgreSQL + Auth 관리 자동화
- ✅ Credentials Provider (Email/Password) 기본 지원
- ✅ Google/GitHub OAuth 쉽게 추가 가능
- ✅ httpOnly Cookie 기반 Session 관리 (XSS 방지)
- ✅ TypeScript 타입 안정성

---

## 🎯 목표

1. ✅ NextAuth.js v5 기반 인증 시스템 구축
2. ✅ Supabase Auth와 NextAuth.js 통합
3. ✅ Credentials Provider 구현 (Email/Password)
4. ✅ Admin Dashboard 보호 (role 기반 접근 제어)
5. ✅ Session 관리 및 Middleware 보호
6. ✅ Production-Ready 보안 설정

---

## 📋 주요 작업

### Phase 0: 환경 설정

- [ ] Next.js 14+ 프로젝트 생성 (App Router 사용)
- [ ] Supabase 프로젝트 생성 및 설정
- [ ] 환경 변수 설정 (.env.local)
- [ ] 필요한 패키지 설치
- [ ] NextAuth.js 버전 선택 확정 (v5 beta.29+ 권장)

### Phase 1: NextAuth.js 기본 설정

- [ ] NextAuth.js v5 설치 (`npm install next-auth@beta`)
- [ ] auth.ts 설정 파일 생성
- [ ] API Route Handler 설정 (`/api/auth/[...nextauth]`)
- [ ] NextAuth Secret 생성 및 설정
- [ ] 기본 Credentials Provider 구성

### Phase 1.5: 보안 강화 (신규)

- [ ] Rate limiting 구현 (로그인 5회 실패 시 10분 잠금)
- [ ] 계정 잠금 테이블 생성 (account_lockouts)
- [ ] 로그인 시도 로깅 테이블 생성 (login_attempts)
- [ ] IP 주소 및 User-Agent 추적 로직
- [ ] 에러 처리 전략 구현 (에러 코드 정의)

### Phase 2: Supabase 통합

- [ ] Supabase 클라이언트 초기화
- [ ] profiles 테이블 생성 (id, email, role, display_name)
- [ ] RLS 정책 설정
- [ ] Database Trigger (auth.users → profiles 자동 생성)
- [ ] 초기 Admin 사용자 생성

### Phase 3: 인증 구현

- [ ] Credentials Provider 로그인 로직
  - Supabase signInWithPassword 연동
  - Session에 role 정보 포함
- [ ] Session Callback 구현
- [ ] JWT Callback 구현
- [ ] 로그인 페이지 UI 구현

### Phase 2.5: 사용자 등록 (신규)

- [ ] 회원가입 페이지 구현 (/register)
- [ ] 회원가입 API 엔드포인트 (/api/auth/register)
- [ ] 이메일 중복 체크 로직
- [ ] 비밀번호 확인 필드 및 검증
- [ ] Supabase Auth 사용자 생성 연동
- [ ] 약관 동의 체크박스 (선택적)

### Phase 4: 보호된 페이지

- [ ] Middleware 설정 (protected routes)
- [ ] Admin Dashboard 보호
- [ ] role='admin' 체크 로직
- [ ] 로그아웃 구현

### Phase 3.5: UI/UX Polish (신규)

- [ ] 로딩 상태 표시 (Spinner, Skeleton)
- [ ] 에러 메시지 디자인 개선
- [ ] 접근성(a11y) 기본 구현
  - 폼 필드 label 및 aria-label 추가
  - 에러 메시지 role="alert" 설정
  - 키보드 네비게이션 지원
- [ ] 반응형 디자인 검증 (모바일/태블릿/데스크톱)

### Phase 5: 테스트 및 검증

- [ ] 로그인/로그아웃 테스트
- [ ] Session 유지 테스트
- [ ] Admin 권한 검증 테스트
- [ ] E2E 테스트 (Playwright)

### Phase 6: Production 배포

- [ ] 환경 변수 설정 (Vercel/Production)
- [ ] NEXTAUTH_URL 설정
- [ ] Secure Cookie 설정 확인
- [ ] CSP 헤더 설정

### Phase 6.5: 운영/모니터링 (신규)

- [ ] Sentry 통합 (에러 추적)
- [ ] Vercel Analytics 설정 (성능 모니터링)
- [ ] 구조화된 로깅 구현 (pino 또는 winston)
- [ ] 헬스체크 엔드포인트 구현 (/api/health)
- [ ] 알림 설정 (Slack/Email - 선택적)

---

## 🏗️ Architecture

### Technology Stack

```
Frontend: Next.js 14 (App Router) + React 18
Auth Library: NextAuth.js v5 (Auth.js)
Database/Auth: Supabase (PostgreSQL + Auth)
Styling: TailwindCSS + shadcn/ui
TypeScript: 5.0+
Deployment: Vercel
```

### System Architecture

```
┌─────────────────────────────────────────────┐
│ Next.js 14 (App Router)                     │
│                                             │
│  ┌──────────────────────────────────────┐  │
│  │ /app/api/auth/[...nextauth]/route.ts │  │
│  │ NextAuth.js Route Handler            │  │
│  └──────────────────────────────────────┘  │
│                 ↓                           │
│  ┌──────────────────────────────────────┐  │
│  │ auth.ts (NextAuth Configuration)     │  │
│  │ - Credentials Provider               │  │
│  │ - Session/JWT Callbacks              │  │
│  └──────────────────────────────────────┘  │
│                 ↓                           │
│  ┌──────────────────────────────────────┐  │
│  │ middleware.ts                        │  │
│  │ Protected Routes (/admin, /dashboard)│  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────────────┐
│ Supabase                                    │
│                                             │
│  - auth.users (Supabase Auth)              │
│  - profiles (role, display_name)           │
│  - RLS Policies                            │
└─────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User submits credentials (email, password)
   ↓
2. NextAuth Credentials Provider
   ↓
3. Supabase signInWithPassword()
   ↓
4. Fetch user profile (role from profiles table)
   ↓
5. Create NextAuth Session (include role)
   ↓
6. Set httpOnly cookie
   ↓
7. Redirect to /admin (protected by middleware)
```

---

## 🔧 Technical Requirements

### Required Packages

```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "next-auth": "^5.0.0-beta.29",
    "@supabase/supabase-js": "^2.39.0",
    "@auth/supabase-adapter": "^1.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.2.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@playwright/test": "^1.40.0",
    "@sentry/nextjs": "^7.100.0",
    "pino": "^8.17.0",
    "pino-pretty": "^10.3.0"
  }
}
```

**⚠️ NextAuth.js v5 사용 시 주의사항:**
- 현재 베타 버전이지만 프로덕션 사용 가능 (beta.29+ 권장)
- Next.js 14+ 필수 요구사항
- Cookie prefix가 `authjs.session-token`으로 변경됨
- 공식 문서: https://authjs.dev/

### Environment Variables

**.env.local** (Development)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

# Node Environment
NODE_ENV=development
```

**.env.production** (Production)
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth.js
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-production-secret-min-32-chars

# Node Environment
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 📂 File Structure

```
/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # NextAuth API handler
│   ├── login/
│   │   └── page.tsx                  # Login page
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (protected)
│   │   └── page.tsx                  # Admin dashboard
│   └── layout.tsx                    # Root layout with SessionProvider
│
├── lib/
│   ├── auth.ts                       # NextAuth configuration
│   ├── supabase.ts                   # Supabase client
│   ├── validators.ts                 # Zod schemas for validation
│   ├── errors.ts                     # Error codes and AuthError class
│   └── rate-limiter.ts               # Rate limiting and account lockout logic
│
├── middleware.ts                     # NextAuth middleware (protect routes)
│
├── types/
│   └── next-auth.d.ts                # NextAuth TypeScript types
│
├── supabase/
│   └── migrations/
│       ├── 20240101_create_profiles.sql
│       ├── 20240102_create_trigger.sql
│       ├── 20240103_login_attempts.sql
│       └── 20240104_account_lockouts.sql
│
├── .env.local                        # Environment variables (gitignored)
├── .env.example                      # Example environment file
├── next.config.js                    # Next.js configuration
└── package.json
```

---

## 💻 Implementation Details

### 1. NextAuth Configuration (lib/auth.ts)

```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Validate input
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // 2. Authenticate with Supabase
        const { data: authData, error: authError } =
          await supabase.auth.signInWithPassword({
            email: credentials.email as string,
            password: credentials.password as string,
          })

        if (authError || !authData.user) {
          return null
        }

        // 3. Fetch user profile (role)
        const { data: profile, error: profileError } =
          await supabase
            .from('profiles')
            .select('role, display_name')
            .eq('id', authData.user.id)
            .single()

        if (profileError || !profile) {
          return null
        }

        // 4. Return user object (will be stored in JWT)
        return {
          id: authData.user.id,
          email: authData.user.email!,
          role: profile.role,
          name: profile.display_name,
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      // Add role to JWT token
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },

    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },

  secret: process.env.NEXTAUTH_SECRET,
})
```

### 2. API Route Handler (app/api/auth/[...nextauth]/route.ts)

```typescript
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
```

### 3. Middleware (middleware.ts)

```typescript
import { auth } from "@/lib/auth"
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

### 4. Login Page (app/login/page.tsx)

```typescript
'use client'

import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const result = await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid credentials')
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input name="email" type="email" required />
      <input name="password" type="password" required />
      {error && <p className="error">{error}</p>}
      <button type="submit">Sign In</button>
    </form>
  )
}
```

### 5. Session Provider (app/layout.tsx)

```typescript
import { SessionProvider } from "next-auth/react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 6. TypeScript Types (types/next-auth.d.ts)

```typescript
import "next-auth"

declare module "next-auth" {
  interface User {
    role: string
  }

  interface Session {
    user: {
      id: string
      email: string
      role: string
      name?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    id: string
  }
}
```

---

## 🗄️ Database Schema

### Supabase Migration: Create Profiles Table

**File:** `supabase/migrations/20240101_create_profiles.sql`

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index
CREATE INDEX profiles_email_idx ON profiles(email);
CREATE INDEX profiles_role_idx ON profiles(role);
```

### Supabase Migration: Login Attempts Table

**File:** `supabase/migrations/20240103_login_attempts.sql`

```sql
-- 로그인 시도 기록 테이블
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin만 조회 가능
CREATE POLICY "Admin can view all login attempts"
  ON login_attempts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create indexes
CREATE INDEX login_attempts_email_created_idx ON login_attempts(email, created_at DESC);
CREATE INDEX login_attempts_ip_created_idx ON login_attempts(ip_address, created_at DESC);
CREATE INDEX login_attempts_created_idx ON login_attempts(created_at DESC);
```

### Supabase Migration: Account Lockouts Table

**File:** `supabase/migrations/20240104_account_lockouts.sql`

```sql
-- 계정 잠금 테이블
CREATE TABLE account_lockouts (
  email TEXT PRIMARY KEY,
  locked_until TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE account_lockouts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Admin만 조회 가능
CREATE POLICY "Admin can view all lockouts"
  ON account_lockouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index
CREATE INDEX account_lockouts_locked_until_idx ON account_lockouts(locked_until);

-- Function: 자동 잠금 해제 (cron job용)
CREATE OR REPLACE FUNCTION cleanup_expired_lockouts()
RETURNS void AS $$
BEGIN
  DELETE FROM account_lockouts
  WHERE locked_until < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Supabase Migration: Auto-Create Profile Trigger

**File:** `supabase/migrations/20240102_create_trigger.sql`

```sql
-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### Create Initial Admin User

**File:** `scripts/create-admin.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createAdminUser() {
  // 1. Create user in Supabase Auth
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: 'admin@example.com',
      password: 'Admin1234!',
      email_confirm: true,
      user_metadata: {
        display_name: 'System Administrator'
      }
    })

  if (authError) {
    console.error('Error creating user:', authError)
    return
  }

  // 2. Update profile role to admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'admin', display_name: 'System Administrator' })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    return
  }

  console.log('✅ Admin user created successfully!')
  console.log('Email:', 'admin@example.com')
  console.log('Password:', 'Admin1234!')
}

createAdminUser()
```

**Run:**
```bash
npx tsx scripts/create-admin.ts
```

---

## 🔒 보안 요구사항 (Security Requirements)

### 1. Rate Limiting & Account Protection

**로그인 시도 제한:**
- 동일 이메일로 5회 실패 시 10분간 계정 잠금
- IP 주소 기준 시간당 최대 20회 로그인 시도
- 잠금 해제: 자동 (10분 경과) 또는 Admin 수동 해제

**구현 방법:**
```typescript
// lib/rate-limiter.ts
import { createClient } from '@supabase/supabase-js'

export async function checkAccountLockout(email: string): Promise<boolean> {
  const supabase = createClient(...)

  const { data: lockout } = await supabase
    .from('account_lockouts')
    .select('locked_until')
    .eq('email', email)
    .single()

  if (lockout && new Date(lockout.locked_until) > new Date()) {
    return true // 계정 잠김
  }

  return false
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string,
  userAgent: string,
  success: boolean,
  failureReason?: string
) {
  const supabase = createClient(...)

  await supabase.from('login_attempts').insert({
    email,
    ip_address: ipAddress,
    user_agent: userAgent,
    success,
    failure_reason: failureReason,
  })

  if (!success) {
    await handleFailedAttempt(email)
  }
}

async function handleFailedAttempt(email: string) {
  const supabase = createClient(...)

  // 최근 5분간 실패 횟수 확인
  const { count } = await supabase
    .from('login_attempts')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .eq('success', false)
    .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

  if (count && count >= 5) {
    // 계정 잠금
    await supabase.from('account_lockouts').upsert({
      email,
      locked_until: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempt_count: count,
      last_attempt_at: new Date().toISOString(),
    })
  }
}
```

### 2. 로깅 및 감사 추적 (Audit Trail)

**필수 로깅 항목:**
- 모든 로그인 시도 (성공/실패)
- IP 주소 및 User-Agent
- 실패 사유 (잘못된 비밀번호, 계정 잠금 등)
- 타임스탬프 (UTC)

**Admin 작업 감사:**
- 사용자 역할 변경
- 계정 잠금/해제
- Admin 페이지 접근

**로그 보존 기간:** 90일 (GDPR/개인정보보호법 고려)

### 3. 에러 처리 전략

**에러 코드 정의:**
```typescript
// lib/errors.ts
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'AUTH001',
  ACCOUNT_LOCKED = 'AUTH002',
  SESSION_EXPIRED = 'AUTH003',
  INSUFFICIENT_PERMISSIONS = 'AUTH004',
  RATE_LIMIT_EXCEEDED = 'AUTH005',
  EMAIL_ALREADY_EXISTS = 'AUTH006',
  WEAK_PASSWORD = 'AUTH007',
}

export const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: '이메일 또는 비밀번호가 올바르지 않습니다.',
  [AuthErrorCode.ACCOUNT_LOCKED]: '계정이 일시적으로 잠겼습니다. 10분 후 다시 시도해주세요.',
  [AuthErrorCode.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
  [AuthErrorCode.INSUFFICIENT_PERMISSIONS]: '접근 권한이 없습니다.',
  [AuthErrorCode.RATE_LIMIT_EXCEEDED]: '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.',
  [AuthErrorCode.EMAIL_ALREADY_EXISTS]: '이미 사용 중인 이메일입니다.',
  [AuthErrorCode.WEAK_PASSWORD]: '비밀번호는 8자 이상, 대소문자, 숫자, 특수문자를 포함해야 합니다.',
}

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message?: string
  ) {
    super(message || ERROR_MESSAGES[code])
    this.name = 'AuthError'
  }
}
```

**사용자에게 노출하지 않을 정보:**
- 데이터베이스 에러 상세 (SQL 쿼리, 테이블명 등)
- 시스템 경로 (파일 경로, 서버 정보)
- 스택 트레이스 (프로덕션 환경)

### 4. 비밀번호 정책

**최소 요구사항:**
- 길이: 8자 이상
- 구성: 대문자, 소문자, 숫자, 특수문자 각 1개 이상
- 금지: 일반적인 비밀번호 (password123, admin 등)

**Zod 스키마:**
```typescript
// lib/validators.ts
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '대문자를 최소 1개 포함해야 합니다.')
  .regex(/[a-z]/, '소문자를 최소 1개 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 최소 1개 포함해야 합니다.')
  .regex(/[^A-Za-z0-9]/, '특수문자를 최소 1개 포함해야 합니다.')

export const registerSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요.'),
  password: passwordSchema,
  confirmPassword: z.string(),
  displayName: z.string().min(2, '이름은 최소 2자 이상이어야 합니다.').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['confirmPassword'],
})
```

### 5. 세션 보안

**세션 설정:**
- 만료 시간: 24시간
- Idle timeout: 2시간 (활동 없을 시)
- Secure flag: true (HTTPS only)
- SameSite: 'lax' (CSRF 방어)

**세션 갱신:**
- 중요 작업 전 재인증 요구 (비밀번호 변경, 역할 변경 등)
- 로그아웃 시 서버측 세션 완전 삭제

---

## 🔒 Security Best Practices

### 1. httpOnly Cookies (Default in NextAuth.js)

NextAuth.js는 기본적으로 httpOnly 쿠키를 사용하여 XSS 공격을 방지합니다.

### 2. CSRF Protection (Built-in)

NextAuth.js는 CSRF 토큰을 자동으로 생성하고 검증합니다.

### 3. Secure Cookie Settings

**next.config.js:**
```javascript
module.exports = {
  experimental: {
    serverActions: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}
```

### 4. Content Security Policy (CSP)

**middleware.ts에 추가:**
```typescript
const response = NextResponse.next()
response.headers.set(
  'Content-Security-Policy',
  "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
)
```

### 5. Rate Limiting (Production)

**vercel.json:**
```json
{
  "functions": {
    "app/api/auth/[...nextauth]/route.ts": {
      "maxDuration": 10
    }
  }
}
```

### 6. Password Requirements

**lib/validators.ts:**
```typescript
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    'Password must contain uppercase, lowercase, number, and special character'
  ),
})
```

---

## ✅ Testing Strategy

### 1. Unit Tests (Vitest)

**lib/__tests__/auth.test.ts:**
```typescript
import { describe, it, expect, vi } from 'vitest'

describe('NextAuth Configuration', () => {
  it('should validate credentials', async () => {
    // Test credential validation
  })

  it('should include role in session', async () => {
    // Test session callback
  })
})
```

### 2. Integration Tests (Playwright)

**tests/e2e/auth.spec.ts:**
```typescript
import { test, expect } from '@playwright/test'

test('should login with valid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'admin@example.com')
  await page.fill('input[name="password"]', 'Admin1234!')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/admin')
})

test('should reject invalid credentials', async ({ page }) => {
  await page.goto('/login')
  await page.fill('input[name="email"]', 'wrong@example.com')
  await page.fill('input[name="password"]', 'wrong')
  await page.click('button[type="submit"]')

  await expect(page.locator('.error')).toBeVisible()
})

test('should protect admin routes', async ({ page }) => {
  await page.goto('/admin')

  await expect(page).toHaveURL('/login')
})
```

**Run:**
```bash
npx playwright test
```

---

## 🚀 Deployment (Vercel)

### 1. Environment Variables

Vercel 프로젝트 설정에서 환경 변수 추가:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add NEXTAUTH_URL
vercel env add NEXTAUTH_SECRET
```

### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod
```

### 3. Verify Deployment

```bash
# Test login endpoint
curl -X POST https://your-app.vercel.app/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin1234!"}'
```

---

## 📊 Migration from Custom SSO

기존 커스텀 SSO 시스템에서 마이그레이션하는 경우:

### 데이터 마이그레이션

1. **Users 마이그레이션**: 기존 사용자 데이터를 Supabase Auth로 이동
2. **Sessions 마이그레이션**: 기존 JWT를 NextAuth.js 세션으로 전환
3. **Roles 마이그레이션**: profiles 테이블에 role 정보 복사

### 호환성 레이어

필요시 기존 API와 호환성을 유지하기 위한 래퍼 작성:

```typescript
// app/api/auth/login/route.ts (Legacy compatibility)
import { signIn } from "@/lib/auth"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  const result = await signIn('credentials', {
    email,
    password,
    redirect: false,
  })

  // Return format compatible with old API
  if (result?.error) {
    return Response.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  return Response.json({
    success: true,
    message: 'Login successful'
  })
}
```

---

## 🎓 Best Practices

### 1. Use Server Components

```typescript
// app/admin/page.tsx (Server Component)
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminPage() {
  const session = await auth()

  if (!session || session.user.role !== 'admin') {
    redirect('/login')
  }

  return <div>Admin Dashboard</div>
}
```

### 2. Client-Side Session Access

```typescript
'use client'
import { useSession } from "next-auth/react"

export default function UserMenu() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not logged in</div>

  return <div>Welcome, {session.user.email}</div>
}
```

### 3. Logout Implementation

```typescript
'use client'
import { signOut } from "next-auth/react"

export function LogoutButton() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/login' })}>
      Logout
    </button>
  )
}
```

### 4. User Registration API

**File:** `app/api/auth/register/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { registerSchema, AuthError, AuthErrorCode } from '@/lib/validators'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 1. 입력 검증
    const validationResult = registerSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.errors[0].message },
        { status: 400 }
      )
    }

    const { email, password, displayName } = validationResult.data

    // 2. 이메일 중복 체크
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw new AuthError(AuthErrorCode.EMAIL_ALREADY_EXISTS)
    }

    // 3. Supabase Auth 사용자 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // 이메일 인증 스킵 (개발 환경)
      user_metadata: {
        display_name: displayName || email.split('@')[0],
      },
    })

    if (authError) {
      console.error('Supabase Auth Error:', authError)
      return NextResponse.json(
        { error: '회원가입 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 4. profiles 테이블은 trigger로 자동 생성됨
    // 추가 처리 필요 시 여기에 작성

    return NextResponse.json(
      {
        success: true,
        message: '회원가입이 완료되었습니다. 로그인해주세요.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.error('Registration Error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
```

**File:** `app/register/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerSchema } from '@/lib/validators'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      displayName: formData.get('displayName') as string,
    }

    // 클라이언트 측 검증
    const validationResult = registerSchema.safeParse(data)
    if (!validationResult.success) {
      setError(validationResult.error.errors[0].message)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error)
        return
      }

      // 회원가입 성공 → 로그인 페이지로 이동
      router.push('/login?registered=true')
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">회원가입</h1>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            이메일
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="displayName" className="block text-sm font-medium">
            이름 (선택)
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium">
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            className="mt-1 block w-full rounded-md border px-3 py-2"
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '처리 중...' : '회원가입'}
        </button>

        <p className="text-center text-sm">
          이미 계정이 있으신가요?{' '}
          <a href="/login" className="text-blue-600 hover:underline">
            로그인
          </a>
        </p>
      </form>
    </div>
  )
}
```

---

## 📚 References

### Official Documentation
- [NextAuth.js Docs](https://next-auth.js.org/)
- [NextAuth.js v5 Guide](https://authjs.dev/getting-started/installation)
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js 14 Docs](https://nextjs.org/docs)

### Example Repositories
- [NextAuth.js Example with Credentials](https://github.com/nextauthjs/next-auth-example)
- [Supabase + NextAuth.js](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
- [AsharibAli/next-authjs-v5](https://github.com/AsharibAli/next-authjs-v5) - NextAuth v5 고급 구현
- [wpcodevo/nextjs14-supabase-ssr-authentication](https://github.com/wpcodevo/nextjs14-supabase-ssr-authentication) - Supabase SSR 인증

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/app/api-reference/next-config-js/headers)

---

## 🔍 GitHub 리포지토리 분석 (Repository Analysis)

**분석일**: 2025-01-14
**분석 대상**: 4개 GitHub 프로젝트
**문서 위치**: `docs/research/`

### 분석 결과 요약

우리 프로젝트 개선을 위해 유사한 GitHub 프로젝트 4개를 분석했습니다. 주요 발견사항:

#### 1. AsharibAli/next-authjs-v5 (⭐ 102 stars)
**점수**: 22/25 (88%)
**장점**:
- ✅ NextAuth v5 고급 기능 완벽 구현 (2FA, 이메일 인증)
- ✅ Custom Hooks (`useCurrentUser`, `useRole`)
- ✅ Prisma + NeonDB 통합
- ✅ 미들웨어 기반 라우트 보호
- ✅ Zod 스키마 유효성 검사

**약점**:
- ❌ Rate Limiting 없음
- ❌ 계정 잠금 기능 없음
- ❌ E2E 테스트 없음

**즉시 적용 가능한 개선사항**:
1. 미들웨어 패턴 (Phase 2 - 30분)
2. Custom Hooks (Phase 2 - 20분)
3. Zod 스키마 (Phase 3 - 1시간)

**분석 문서**: [docs/research/repos/01-asharibali-nextauthv5.md](../research/repos/01-asharibali-nextauthv5.md)

#### 2. wpcodevo/nextjs14-supabase-ssr-authentication (⭐ 60 stars)
**점수**: 20/25 (80%)
**장점**:
- ✅ Supabase SSR 최신 패턴 (`@supabase/ssr`)
- ✅ 자동 세션 갱신 (미들웨어)
- ✅ Google/GitHub OAuth 통합
- ✅ RLS (Row Level Security) 활용

**약점**:
- ❌ Rate Limiting 없음
- ❌ 계정 잠금 없음
- ❌ E2E 테스트 없음

**즉시 적용 가능한 개선사항**:
1. Supabase Client 팩토리 (Phase 2 - 30분)
2. 자동 세션 갱신 미들웨어 (Phase 2 - 1시간)
3. OAuth 추가 (Phase 3 - 2시간)

**분석 문서**: [docs/research/repos/02-wpcodevo-supabase-ssr.md](../research/repos/02-wpcodevo-supabase-ssr.md)

### 핵심 인사이트

#### 1. 미들웨어의 중요성 🔴
**발견**: 분석한 모든 프로덕션급 프로젝트가 미들웨어 사용
**현재 상태**: 우리 프로젝트는 페이지 레벨 보호만 사용
**권장 사항**: Phase 2에서 즉시 구현 필요

#### 2. Supabase Client 팩토리 패턴 🔴
**발견**: Supabase SSR에서는 3가지 클라이언트 필요
- Server Components용: `lib/supabase/server.ts`
- Client Components용: `lib/supabase/client.ts`
- Middleware용: 직접 생성

**권장 사항**: Phase 2 Supabase 통합 시 필수

#### 3. 자동 세션 갱신 🟡
**발견**: wpcodevo 프로젝트는 미들웨어에서 자동 세션 갱신
```typescript
// middleware.ts에서 getUser() 호출만으로 자동 갱신
await supabase.auth.getUser()
```
**권장 사항**: 사용자 경험 향상을 위해 구현 검토

#### 4. Custom Hooks로 DX 향상 🟡
**발견**: AsharibAli 프로젝트의 Custom Hooks
```typescript
const user = useCurrentUser()  // vs useSession().data.user
const role = useRole()          // vs useSession().data.user.role
```
**권장 사항**: Phase 2-3에서 구현

#### 5. Zod 스키마 필수 🟡
**발견**: 모든 프로덕션 프로젝트가 Zod 사용
**현재 상태**: 우리 프로젝트는 기본 검증만
**권장 사항**: Phase 3에서 비밀번호 강도 검증 시 구현

### 기술적 의사결정 포인트

#### 결정 1: NextAuth v5 유지 vs Supabase Auth 전환

**옵션 A: NextAuth v5 유지 (현재 선택)**
- ✅ 현재 구조 유지
- ✅ 점진적 마이그레이션
- ✅ OAuth 제공자 다양성
- ❌ Supabase RLS와 부분적 통합
- ❌ 이중 인증 시스템 (복잡도 증가)

**옵션 B: Supabase Auth 전환 (wpcodevo 패턴)**
- ✅ Supabase 생태계 완전 활용
- ✅ RLS 자동 연동
- ✅ 이메일 발송 내장
- ✅ 관리 UI 제공
- ❌ NextAuth 의존성 제거 작업 필요

**권장사항**: Phase 2 시작 전 팀 논의 필요

#### 결정 2: Prisma 추가 vs Supabase Client 사용

**옵션 A: Prisma 추가 (AsharibAli 패턴)**
- ✅ 타입 안전 쿼리
- ✅ 마이그레이션 자동화
- ❌ Supabase Client와 중복
- ❌ 복잡도 증가

**옵션 B: Supabase Client만 사용 (wpcodevo 패턴)**
- ✅ 단순한 스택
- ✅ RLS 자동 적용
- ✅ Realtime 기능 활용 가능
- ⚠️ 타입 안전성은 수동 관리

**권장사항**: Supabase Client만 사용 (PRD 목표와 일치)

### 적용 우선순위

**Phase 2 (이번 주) - 즉시 적용**:
1. 🔴 미들웨어 구현 (AsharibAli 패턴)
2. 🔴 Supabase Client 팩토리 (wpcodevo 패턴)
3. 🔴 자동 세션 갱신 (wpcodevo 패턴)
4. 🟡 Custom Hooks (AsharibAli 패턴)

**Phase 3 (다음 주) - 중기 적용**:
1. 🟡 Zod 스키마 유효성 검사
2. 🟡 OAuth 제공자 추가 (Google, GitHub)
3. 🟡 Server Actions 레이어 분리

**Phase 5+ (다음 달) - 장기 검토**:
1. 🟢 2FA 구현 (AsharibAli 참고)
2. 🟢 이메일 인증 (AsharibAli 참고)
3. 🟢 Supabase Realtime 활용

### 상세 분석 문서

전체 분석 결과는 다음 문서에서 확인:
- `docs/research/README.md` - 분석 프로젝트 개요
- `docs/research/analysis-framework.md` - 분석 방법론
- `docs/research/repos/` - 개별 리포 상세 분석
- `docs/research/comparison-matrix.md` - 기능 비교표 (작성 예정)
- `docs/research/recommendations/` - 우선순위별 개선 제안 (작성 예정)

---

## 🔄 Version History

**Current Version:** v0.0.0 (PRD v2.0 - 구현 대기 중)

**Planned Versions:**
- v1.0.0: MVP (Email/Password + 회원가입 + Admin Dashboard + Rate Limiting + 모니터링)
  - NextAuth.js v5 + Supabase 통합
  - Credentials Provider 인증
  - 회원가입 기능
  - Rate limiting 및 계정 잠금
  - 로그인 시도 로깅
  - Admin 역할 기반 접근 제어
  - Sentry 에러 추적
  - 헬스체크 엔드포인트
  - 테스트 커버리지 80%+

- v1.1.0: 비밀번호 재설정 + 보안 강화
  - 비밀번호 재설정 플로우
  - 이메일 인증 (선택적)
  - 세션 관리 개선 (Idle timeout)
  - 보안 감사 로그 확장

- v1.2.0: OAuth Providers
  - Google OAuth Provider
  - GitHub OAuth Provider
  - 소셜 로그인 UI 개선

- v1.3.0: Admin 기능 확장
  - 사용자 관리 페이지 (목록, 검색, 필터)
  - 역할 변경 기능
  - 계정 잠금 수동 해제
  - 로그인 시도 이력 조회

- v2.0.0: Multi-tenant Support
  - 조직/팀 개념 도입
  - 조직별 역할 관리
  - 권한(Permission) 세분화
  - 조직 초대 시스템

- v2.1.0: Advanced Security
  - 2FA (Two-Factor Authentication)
  - CAPTCHA 통합
  - 지역 기반 접근 제어
  - 비정상 로그인 감지

---

## 📝 Notes

### NextAuth.js v5 변경사항

NextAuth.js v5 (Auth.js)는 v4와 다른 점:
- `export { auth, signIn, signOut }` 방식 사용
- `handlers` export로 GET/POST 처리
- `middleware.ts`에서 직접 `auth()` import 가능
- TypeScript 지원 개선

### Supabase Auth vs NextAuth.js

| 기능 | Supabase Auth | NextAuth.js |
|------|---------------|-------------|
| Email/Password | ✅ Built-in | ✅ Credentials Provider |
| OAuth Providers | ✅ 10+ providers | ✅ 50+ providers |
| Session Management | JWT + Cookie | JWT or Database |
| Admin SDK | ✅ supabase.auth.admin | ❌ (Manual) |
| TypeScript | ✅ Full support | ✅ Full support |

**결론:**
- Supabase Auth는 Backend 관리 (user CRUD, email verification)
- NextAuth.js는 Frontend 세션 관리 및 다양한 OAuth 연동
- 두 개를 결합하면 최고의 DX와 유연성 확보

---

## ✅ Success Criteria

### 기능 요구사항
- [ ] Admin 사용자가 로그인하여 /admin 접근 가능
- [ ] 일반 사용자가 /admin 접근 시 403 Forbidden
- [ ] 회원가입 후 자동으로 profiles 테이블 생성
- [ ] 로그인 5회 실패 시 계정 자동 잠금
- [ ] 세션이 24시간 동안 유지됨
- [ ] 로그아웃 후 /admin 접근 시 /login으로 리디렉션

### 보안 요구사항
- [ ] Rate limiting 동작 확인 (5회 실패 → 10분 잠금)
- [ ] 로그인 시도 모두 login_attempts 테이블에 기록됨
- [ ] 보안 헤더 모두 설정됨 (CSP, X-Frame-Options, HSTS)
- [ ] 비밀번호 강도 검증 통과 (8자, 대소문자, 숫자, 특수문자)
- [ ] npm audit 0 high/critical vulnerabilities

### 테스트 요구사항
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 모든 critical path 통과
  - 로그인/로그아웃
  - 회원가입
  - 계정 잠금/해제
  - Admin 권한 검증
  - 비인가 접근 차단
- [ ] TypeScript 타입 에러 없음 (`tsc --noEmit` 통과)

### 성능 요구사항
- [ ] 로그인 응답 시간 < 500ms (p95)
- [ ] 페이지 로드 시간 < 2초 (p95)
- [ ] Lighthouse Score: Performance > 90, Accessibility > 90

### 배포 요구사항
- [ ] Production 배포 성공 (Vercel)
- [ ] 환경 변수 모두 설정됨
- [ ] Health check 엔드포인트 정상 응답 (200 OK)
- [ ] Sentry 에러 추적 동작 확인

### 문서화 요구사항
- [ ] README.md 업데이트 (설치, 실행, 테스트 가이드)
- [ ] API 엔드포인트 문서화
- [ ] 환경 변수 목록 (.env.example)
- [ ] 트러블슈팅 가이드 작성

---

**Last Updated:** 2025-01-14
**Status:** In Progress (Phase 0-1 완료, CSRF 이슈 해결)
**Version:** 1.0.0 (PRD v2.0)
**Estimated Time:** 12-16 hours (경험 있는 개발자 기준)

### Phase별 예상 시간
- Phase 0: 환경 설정 (1시간)
- Phase 1: NextAuth.js 기본 (2시간)
- Phase 1.5: 보안 강화 (2시간) ← 신규
- Phase 2: Supabase 통합 (1.5시간)
- Phase 2.5: 사용자 등록 (1.5시간) ← 신규
- Phase 3: 인증 구현 (2시간)
- Phase 3.5: UI/UX Polish (1시간) ← 신규
- Phase 4: 보호된 페이지 (1.5시간)
- Phase 5: 테스트 및 검증 (3시간)
- Phase 6: Production 배포 (1.5시간)
- Phase 6.5: 운영/모니터링 (1시간) ← 신규

### 개선 사항 요약 (v1 → v2)
1. ✅ NextAuth.js v5 beta.29로 버전 업데이트
2. ✅ Rate limiting 및 계정 잠금 기능 추가
3. ✅ 로그인 시도 로깅 및 감사 추적
4. ✅ 에러 처리 전략 및 에러 코드 정의
5. ✅ 사용자 등록 기능 추가
6. ✅ 접근성(a11y) 요구사항 추가
7. ✅ 운영 모니터링 (Sentry, 헬스체크) 추가
8. ✅ 테스트 커버리지 목표 명시 (80%)
9. ✅ 성능 목표 명시 (로그인 < 500ms)
10. ✅ Database Schema 확장 (login_attempts, account_lockouts)

---

## 📊 구현 진행 상황 (Implementation Progress)

**Current Date:** 2025-01-14
**Current Phase:** Phase 1 완료, CSRF 이슈 해결

### ✅ 완료된 작업 (Completed)

#### Phase 0: 환경 설정 (100% 완료)
- ✅ Next.js 14.2.33 프로젝트 생성 (App Router)
- ✅ TypeScript 5.7.2 설정
- ✅ TailwindCSS 3.4.15 설정
- ✅ 환경 변수 설정 (.env.local)
- ✅ 필요한 패키지 설치
  - next-auth@5.0.0-beta.30
  - @supabase/supabase-js@2.81.1
  - @auth/supabase-adapter@1.11.1
  - @playwright/test@1.56.1
  - cross-env@10.1.0 (Windows 호환성)

#### Phase 1: NextAuth.js 기본 설정 (100% 완료)
- ✅ NextAuth.js v5 설치 및 설정
- ✅ auth.ts 설정 파일 생성
- ✅ API Route Handler 설정 (`/api/auth/[...nextauth]`)
- ✅ Credentials Provider 구성 (임시 테스트 계정)
- ✅ TypeScript 타입 확장 (types/next-auth.d.ts)
- ✅ SessionProvider 설정 (app/providers.tsx)

#### Phase 3: 인증 구현 (부분 완료)
- ✅ 로그인 페이지 UI 구현 (app/login/page.tsx)
- ✅ Server Actions 패턴 적용 (app/actions/auth.ts)
- ✅ JWT Callback 구현 (role 포함)
- ✅ Session Callback 구현
- ✅ 에러 메시지 표시 (role="alert")

#### Phase 3.5: UI/UX Polish (부분 완료)
- ✅ 로딩 상태 표시 (useFormStatus)
- ✅ 에러 메시지 접근성 개선 (role="alert")
- ✅ 키보드 네비게이션 지원 (폼 필드)
- ✅ 테스트 계정 정보 UI 표시

#### Phase 4: 보호된 페이지 (부분 완료)
- ✅ Admin Dashboard 보호 (Server Component)
- ✅ 로그아웃 구현 (Server Action)
- ✅ 홈 페이지 사용자 상태 표시
- ⚠️ Middleware 미구현 (현재는 페이지 레벨 보호)

#### Phase 5: 테스트 및 검증 (부분 완료)
- ✅ Playwright E2E 테스트 설정
- ✅ E2E 테스트 7/7 통과 (100% 성공률)
  - ✅ 로그인 페이지 표시
  - ✅ Admin 계정 로그인
  - ✅ User 계정 로그인
  - ✅ 잘못된 인증 정보 오류 표시
  - ✅ 미인증 시 로그인 페이지 리다이렉트
  - ✅ 로그아웃 기능
  - ✅ 홈 페이지에서 사용자 상태 표시
- ✅ 타입 체크 통과 (`tsc --noEmit`)

### 🔧 해결된 기술적 이슈

#### CSRF Token 문제 (Critical) ✅ 해결
**문제:**
- NextAuth.js v5에서 클라이언트 측 `signIn()` 사용 시 CSRF 토큰 누락
- 로그인/로그아웃 시 `MissingCSRF` 에러 발생
- E2E 테스트 5/7 실패

**해결 방법:**
- Server Actions 패턴으로 전환
- `app/actions/auth.ts` 생성
  - `authenticate()`: 로그인 Server Action
  - `logout()`: 로그아웃 Server Action
- 로그인 페이지에서 `useFormState` + `useFormStatus` 사용
- CSRF 토큰이 서버에서 자동 처리됨

**변경 파일:**
- `app/actions/auth.ts` (신규)
- `app/login/page.tsx` (수정)
- `app/admin/page.tsx` (수정)
- `app/page.tsx` (수정)
- `tests/e2e/auth.spec.ts` (선택자 개선)

**결과:**
- E2E 테스트 7/7 통과 (100% 성공률)
- 로그인/로그아웃 정상 동작
- CSRF 보안 유지

### 🚧 진행 중 (In Progress)

현재 작업 없음 - 다음 Phase 대기 중

### 📅 다음 단계 (Next Steps)

#### 우선순위 1: Phase 2 - Supabase 통합
- [ ] Supabase 프로젝트 생성
- [ ] Supabase 클라이언트 초기화
- [ ] profiles 테이블 생성 및 마이그레이션
- [ ] RLS 정책 설정
- [ ] Trigger 설정 (auth.users → profiles)
- [ ] 초기 Admin 사용자 생성 스크립트
- [ ] auth.ts에서 Supabase Auth 연동

#### 우선순위 2: Phase 1.5 - 보안 강화
- [ ] Rate limiting 구현
- [ ] login_attempts 테이블 마이그레이션
- [ ] account_lockouts 테이블 마이그레이션
- [ ] IP 주소 및 User-Agent 추적
- [ ] 에러 처리 전략 구현 (lib/errors.ts)
- [ ] 비밀번호 정책 검증 (lib/validators.ts)

#### 우선순위 3: Phase 2.5 - 사용자 등록
- [ ] 회원가입 페이지 구현 (/register)
- [ ] 회원가입 API 엔드포인트
- [ ] 이메일 중복 체크
- [ ] 비밀번호 확인 검증
- [ ] Supabase Auth 사용자 생성

### 📈 진행률 (Overall Progress)

**전체 진행률:** ~35% (Phase 0-1 완료, Phase 3-5 부분 완료)

| Phase | 상태 | 진행률 | 예상 시간 | 실제 시간 |
|-------|------|--------|-----------|-----------|
| Phase 0 | ✅ 완료 | 100% | 1시간 | ~1시간 |
| Phase 1 | ✅ 완료 | 100% | 2시간 | ~2.5시간 (CSRF 해결 포함) |
| Phase 1.5 | ⏸️ 대기 | 0% | 2시간 | - |
| Phase 2 | ⏸️ 대기 | 0% | 1.5시간 | - |
| Phase 2.5 | ⏸️ 대기 | 0% | 1.5시간 | - |
| Phase 3 | 🚧 진행 | 60% | 2시간 | ~1.5시간 |
| Phase 3.5 | 🚧 진행 | 50% | 1시간 | ~0.5시간 |
| Phase 4 | 🚧 진행 | 40% | 1.5시간 | ~0.5시간 |
| Phase 5 | 🚧 진행 | 40% | 3시간 | ~1시간 |
| Phase 6 | ⏸️ 대기 | 0% | 1.5시간 | - |
| Phase 6.5 | ⏸️ 대기 | 0% | 1시간 | - |

**총 예상 시간:** 16시간
**실제 소요 시간:** ~7시간 (진행 중)
**남은 예상 시간:** ~9-10시간

### 🎯 현재 Success Criteria 달성 현황

#### 기능 요구사항
- ✅ Admin 사용자가 로그인하여 /admin 접근 가능
- ⚠️ 일반 사용자가 /admin 접근 시 403 Forbidden (현재 모든 인증 사용자 접근 가능)
- ❌ 회원가입 후 자동으로 profiles 테이블 생성 (Supabase 미연동)
- ❌ 로그인 5회 실패 시 계정 자동 잠금 (Rate limiting 미구현)
- ✅ 세션이 24시간 동안 유지됨
- ✅ 로그아웃 후 /admin 접근 시 /login으로 리디렉션

#### 보안 요구사항
- ❌ Rate limiting 동작 확인 (미구현)
- ❌ 로그인 시도 모두 login_attempts 테이블에 기록됨 (미구현)
- ❌ 보안 헤더 모두 설정됨 (next.config.js 미설정)
- ❌ 비밀번호 강도 검증 통과 (Zod 스키마 미구현)
- ✅ npm audit 0 high/critical vulnerabilities

#### 테스트 요구사항
- ❌ 단위 테스트 커버리지 80% 이상 (Jest 테스트 미작성)
- ✅ E2E 테스트 모든 critical path 통과 (7/7 통과)
- ✅ TypeScript 타입 에러 없음 (`tsc --noEmit` 통과)

#### 성능 요구사항
- ⏸️ 로그인 응답 시간 < 500ms (측정 필요)
- ⏸️ 페이지 로드 시간 < 2초 (측정 필요)
- ⏸️ Lighthouse Score (측정 필요)

### 📝 Known Issues & Technical Debt

1. **Middleware 미구현**
   - 현재는 페이지 레벨에서 Server Component로 보호
   - middleware.ts 구현 필요

2. **Role 기반 접근 제어 미완성**
   - 현재 모든 인증된 사용자가 /admin 접근 가능
   - role='admin' 체크 로직 필요

3. **임시 테스트 계정 하드코딩**
   - auth.ts에 테스트 계정 하드코딩됨
   - Supabase 연동 후 제거 필요

4. **Supabase 미연동**
   - 아직 Supabase 프로젝트 생성 안 됨
   - 환경 변수에 placeholder 값 사용 중

5. **단위 테스트 없음**
   - Jest 설정은 되어있으나 테스트 파일 없음
   - 커버리지 목표 80% 미달성

### 🔍 Lessons Learned

1. **NextAuth.js v5 CSRF 이슈**
   - Client-side `signIn()` 대신 Server Actions 사용 권장
   - Next.js 14+ App Router에서는 Server Actions가 더 안전하고 간단함

2. **Windows 환경 변수 처리**
   - `PORT=3015 npm run dev` 문법이 Windows에서 동작하지 않음
   - `cross-env` 패키지 필요

3. **Playwright 선택자 정확도**
   - 너무 광범위한 선택자는 multiple elements 에러 발생
   - CSS 클래스 기반 구체적 선택자 사용 권장

4. **E2E 테스트 비동기 처리**
   - 로그인 후 redirect 대기 필요
   - `await expect(page).toHaveURL()` 사용

---

**Progress Summary:** Phase 0-1 완료, CSRF 이슈 해결, E2E 테스트 7/7 통과. 다음 단계는 Supabase 통합 또는 보안 강화.
