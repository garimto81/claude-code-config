# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Project**: NextAuth.js + Supabase SSO Integration
**Status**: Planning Phase (PRD v2.0 완료, 구현 대기 중)
**PRD**: See `docs/prd.md` for complete requirements (v2.0 - 2025-01-13 업데이트)

---

## Project Overview

This is a Next.js 14 authentication system integrating NextAuth.js v5 with Supabase. The project follows the Phase 0-6 development cycle defined in the parent repository's global workflow system.

**Key Technologies**:
- Next.js 14.2+ (App Router)
- NextAuth.js v5 beta.29+ (Auth.js)
- Supabase (PostgreSQL + Auth)
- TypeScript 5.0+
- TailwindCSS
- Sentry (에러 추적)
- Pino (구조화된 로깅)

**Authentication Flow**:
1. User submits credentials → NextAuth Credentials Provider
2. Supabase `signInWithPassword()` validates credentials
3. Fetch user profile with role from `profiles` table
4. Create NextAuth session with role included
5. Middleware protects `/admin` routes based on role

---

## Development Commands

### Initial Setup (Not Yet Run)
```bash
# Create Next.js project
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# Install dependencies
npm install next-auth@beta @supabase/supabase-js @auth/supabase-adapter zod

# Install dev dependencies
npm install -D @playwright/test @types/node @sentry/nextjs pino pino-pretty
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Run unit tests with coverage (목표: 80% 이상)
npm test -- --coverage

# Run E2E tests with Playwright
npx playwright test

# Run specific test file
npx playwright test tests/e2e/auth.spec.ts

# Run tests in UI mode
npx playwright test --ui

# Check test coverage
npm test -- --coverage --coverageReporters=text-summary
```

### Database Operations
```bash
# Create admin user (after implementation)
npx tsx scripts/create-admin.ts

# Run Supabase migrations (local development)
supabase migration up

# Generate types from Supabase
supabase gen types typescript --local > types/supabase.ts
```

### Code Quality
```bash
# TypeScript type checking
npx tsc --noEmit

# Lint
npm run lint

# Format
npm run format
```

---

## Architecture

### Authentication Components (To Be Implemented)

**Core Files**:
- `lib/auth.ts` - NextAuth configuration with Credentials Provider
- `app/api/auth/[...nextauth]/route.ts` - NextAuth API handler
- `middleware.ts` - Route protection and role-based access control
- `types/next-auth.d.ts` - TypeScript type extensions for session/user

**Key Routes**:
- `/login` - Login page (public)
- `/admin` - Protected admin dashboard (requires `role='admin'`)
- `/api/auth/*` - NextAuth endpoints

### Supabase Schema

**Tables**:
```sql
-- profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- login_attempts table (로그인 시도 기록)
CREATE TABLE login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT false,
  failure_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- account_lockouts table (계정 잠금)
CREATE TABLE account_lockouts (
  email TEXT PRIMARY KEY,
  locked_until TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Triggers**:
- `handle_new_user()` - Auto-creates profile when user signs up

**Migrations**:
- `20240101_create_profiles.sql` - profiles 테이블 및 RLS
- `20240102_create_trigger.sql` - 자동 프로필 생성 트리거
- `20240103_login_attempts.sql` - 로그인 시도 로깅 (신규)
- `20240104_account_lockouts.sql` - 계정 잠금 관리 (신규)

### Session Management

NextAuth.js uses JWT strategy with httpOnly cookies:
- Session includes: `{ user: { id, email, role, name } }`
- Token stored in httpOnly cookie (XSS prevention)
- CSRF protection built-in
- Session duration: 24 hours

### Middleware Protection

Routes matching `/admin/*` and `/dashboard/*` are protected:
1. Check if session exists → redirect to `/login` if not
2. Check if `session.user.role === 'admin'` → redirect to `/forbidden` if not
3. Allow access if both conditions pass

---

## Environment Variables

Required in `.env.local`:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-min-32-chars

# Generate secret with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

For production (Vercel):
- Set `NEXTAUTH_URL` to production domain
- Use different `NEXTAUTH_SECRET` than development
- Never commit `.env.local` to git

---

## Security Considerations

### Built-in Protections
- **httpOnly cookies** - Prevents XSS token theft (NextAuth default)
- **CSRF tokens** - Automatic CSRF protection (NextAuth built-in)
- **Secure headers** - X-Frame-Options, X-Content-Type-Options via `next.config.js`

### Required Implementation (PRD v2.0)
- [ ] **Rate limiting** - 5회 로그인 실패 시 10분간 계정 잠금
- [ ] **Login attempt logging** - IP 주소, User-Agent, 성공/실패 기록
- [ ] **Account lockout system** - `account_lockouts` 테이블 관리
- [ ] **Error handling strategy** - 7개 에러 코드 정의 (AUTH001~AUTH007)
- [ ] Content Security Policy (CSP) headers in middleware
- [ ] Password strength validation with Zod (min 8 chars, uppercase, lowercase, number, special char)
- [ ] RLS policies on Supabase tables (profiles, login_attempts, account_lockouts)
- [ ] Environment variable validation on startup

### Rate Limiting Implementation
로그인 시도 제한:
- 동일 이메일 5회 실패 → 10분 계정 잠금
- IP 주소별 시간당 최대 20회 시도
- 자동 해제: 10분 경과 후 또는 Admin 수동 해제

```typescript
// lib/rate-limiter.ts
export async function checkAccountLockout(email: string): Promise<boolean>
export async function recordLoginAttempt(email, ip, userAgent, success, failureReason)
```

### Supabase RLS Policies
```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## Testing Strategy

### Coverage Goals (PRD v2.0)
- **Unit Test Coverage**: 80% 이상
- **E2E Test Coverage**: 모든 critical path
- **Performance**: 로그인 응답시간 < 500ms (p95)

### Unit Tests (lib/__tests__/)
- Test NextAuth configuration callbacks
- Test credential validation logic
- Test session/JWT token generation
- Test rate limiting logic (checkAccountLockout, recordLoginAttempt)
- Test error handling (AuthError, AuthErrorCode)
- Test password validation (Zod schema)

### Integration Tests
- Test 회원가입 API (`/api/auth/register`)
- Test 로그인 시도 로깅
- Test 계정 잠금 로직 (5회 실패)
- Test Supabase RLS policies

### E2E Tests (tests/e2e/) - Playwright
- **로그인/로그아웃**
  - Login with valid credentials → success
  - Login with invalid credentials → error displayed
  - Logout → session cleared, redirect to `/login`
- **회원가입**
  - Register with valid data → success
  - Register with duplicate email → error
  - Register with weak password → validation error
- **계정 잠금/해제**
  - 5회 로그인 실패 → 계정 잠김
  - 10분 경과 후 자동 해제
- **Admin 권한 검증**
  - Access `/admin` without session → redirect to `/login`
  - Access `/admin` with non-admin role → redirect to `/forbidden`
  - Admin can access `/admin` → success

**Critical Test**: Admin role enforcement
```typescript
test('non-admin cannot access admin dashboard', async ({ page }) => {
  // Login as regular user
  await loginAs(page, 'user@example.com', 'password')

  // Try to access /admin
  await page.goto('/admin')

  // Should redirect to /forbidden
  await expect(page).toHaveURL('/forbidden')
})
```

**New Test**: Rate limiting enforcement
```typescript
test('account locks after 5 failed login attempts', async ({ page }) => {
  const email = 'test@example.com'

  // Attempt 5 failed logins
  for (let i = 0; i < 5; i++) {
    await loginAs(page, email, 'wrong-password')
  }

  // 6th attempt should show lockout message
  await loginAs(page, email, 'correct-password')
  await expect(page.locator('[role="alert"]')).toContainText('계정이 일시적으로 잠겼습니다')
})
```

---

## Development Workflow

This project follows the parent repository's Phase 0-6 workflow (PRD v2.0 확장):

1. **Phase 0**: 환경 설정
2. **Phase 1**: NextAuth.js 기본 설정
3. **Phase 1.5**: 보안 강화 (Rate limiting, 로깅) ← 신규
4. **Phase 2**: Supabase 통합
5. **Phase 2.5**: 사용자 등록 ← 신규
6. **Phase 3**: 인증 구현
7. **Phase 3.5**: UI/UX Polish (접근성) ← 신규
8. **Phase 4**: 보호된 페이지
9. **Phase 5**: 테스트 및 검증 (커버리지 80%)
10. **Phase 6**: Production 배포
11. **Phase 6.5**: 운영/모니터링 (Sentry, 헬스체크) ← 신규

**예상 시간**: 12-16시간 (경험 있는 개발자 기준)

**Commit Format**: `feat: Add rate limiting (v1.0.0) [PRD-0004]`

---

## Integration with Parent Workflow

This project is located in the global workflow repository at `D:\AI\claude01\`. Key integrations:

- **PRD Reference**: All commits should reference `[PRD-0004]`
- **Task Generation**: Use parent's `scripts/generate_tasks.py`
- **Agent Optimization**: Post-commit hooks analyze agent usage
- **GitHub Automation**: Auto PR/merge on feature branch push

**Important**: When committing, reference the parent PRD number to maintain traceability.

---

## Common Issues & Solutions

### Issue: NextAuth session undefined in Server Components
**Solution**: Use `await auth()` from `@/lib/auth`, not `useSession()` hook

### Issue: Supabase RLS blocking queries
**Solution**: Use service role key in `lib/auth.ts` for admin operations, anon key elsewhere

### Issue: Middleware not protecting routes
**Solution**: Check `matcher` config in `middleware.ts` includes the route pattern

### Issue: Role not included in session
**Solution**: Verify both `jwt()` and `session()` callbacks in `lib/auth.ts` pass role through

---

## Quick Reference

### File Locations (Once Implemented)
```
app/
├── api/
│   └── auth/
│       ├── [...nextauth]/route.ts  # NextAuth handler
│       └── register/route.ts       # 회원가입 API (신규)
├── login/page.tsx                  # Login UI
├── register/page.tsx               # 회원가입 UI (신규)
├── admin/page.tsx                  # Protected admin page
└── layout.tsx                      # Root layout with SessionProvider

lib/
├── auth.ts                         # NextAuth config
├── supabase.ts                     # Supabase client
├── validators.ts                   # Zod schemas
├── errors.ts                       # Error codes (신규)
└── rate-limiter.ts                 # Rate limiting (신규)

middleware.ts                       # Route protection
types/next-auth.d.ts                # Type extensions

supabase/migrations/
├── 20240101_create_profiles.sql
├── 20240102_create_trigger.sql
├── 20240103_login_attempts.sql     # 신규
└── 20240104_account_lockouts.sql   # 신규

scripts/create-admin.ts             # Admin user creation
tests/
├── unit/
│   ├── rate-limiter.test.ts        # 신규
│   └── validators.test.ts          # 신규
└── e2e/
    ├── auth.spec.ts
    ├── register.spec.ts            # 신규
    └── rate-limiting.spec.ts       # 신규
```

### Key Functions (To Be Implemented)
**Authentication**:
- `auth()` - Get session in Server Components
- `signIn(credentials, { email, password })` - Login
- `signOut()` - Logout

**Supabase**:
- `createClient()` - Supabase client factory

**Rate Limiting (신규)**:
- `checkAccountLockout(email)` - 계정 잠금 여부 확인
- `recordLoginAttempt(email, ip, userAgent, success, failureReason)` - 로그인 시도 기록

**Error Handling (신규)**:
- `AuthError(code, message)` - 인증 에러 클래스
- `ERROR_MESSAGES` - 에러 코드별 메시지 매핑

---

## Next Steps

PRD v2.0 완료 후 다음 단계:

1. **Task 생성**: `python ../scripts/generate_tasks.py docs/prd.md`
2. **Feature branch 생성**: `git checkout -b feature/PRD-0004-nextauth-supabase-v2`
3. **Next.js 프로젝트 초기화**: `npx create-next-app@latest`
4. **Task 리스트 따라 구현**

### 추천 Agent 활용 순서
1. **context7-engineer** ⭐ - NextAuth v5 beta.29 최신 문서 확인
2. **security-auditor** - 보안 요구사항 검토 (Phase 1.5)
3. **typescript-expert** - 타입 정의 작성 (errors.ts, rate-limiter.ts)
4. **database-optimizer** - Supabase 마이그레이션 최적화
5. **test-automator** - 테스트 커버리지 80% 달성
6. **playwright-engineer** ⭐ - E2E 테스트 (로그인, 회원가입, Rate limiting)

### Success Criteria
- [ ] 테스트 커버리지 80% 이상
- [ ] E2E 테스트 모든 critical path 통과
- [ ] 로그인 응답시간 < 500ms (p95)
- [ ] npm audit 0 high/critical vulnerabilities
- [ ] Lighthouse Score: Performance > 90, Accessibility > 90

---

**Version**: 0.0.0 (PRD v2.0 - 구현 대기 중)
**Last Updated**: 2025-01-13
**PRD Version**: 2.0 (보안/모니터링 강화)
**Estimated Effort**: 12-16 hours
**Parent Repository**: D:\AI\claude01 (Global Workflow System)
