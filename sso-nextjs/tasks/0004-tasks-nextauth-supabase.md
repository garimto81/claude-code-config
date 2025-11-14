# Task List: PRD-0004 NextAuth.js + Supabase SSO Integration

**PRD Version**: 2.0
**Generated**: 2025-01-13
**Status**: Ready for Implementation
**Estimated Time**: 12-16 hours

---

## Task 0.0: Branch Setup

- [ ] Create feature branch: `git checkout -b feature/PRD-0004-nextauth-supabase-v2`
- [ ] Verify PRD v2.0 in `docs/prd.md`
- [ ] Review CLAUDE.md for project guidelines

---

## Phase 0: 환경 설정 (예상: 1시간)

### Task 0.1: Next.js 프로젝트 생성
- [ ] Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir`
- [ ] Verify Next.js 14.2+ installed
- [ ] Configure `tsconfig.json` for path aliases (`@/*`)

### Task 0.2: 필수 패키지 설치
- [ ] Install auth packages: `npm install next-auth@beta @supabase/supabase-js @auth/supabase-adapter zod`
- [ ] Install dev dependencies: `npm install -D @playwright/test @types/node @sentry/nextjs pino pino-pretty`
- [ ] Verify `package.json` matches PRD requirements

### Task 0.3: Supabase 프로젝트 설정
- [ ] Create Supabase project at https://supabase.com
- [ ] Copy project URL and API keys
- [ ] Create `.env.local` with Supabase credentials
- [ ] Create `.env.example` template
- [ ] Add `.env.local` to `.gitignore`

### Task 0.4: 환경 변수 구성
- [ ] Generate `NEXTAUTH_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [ ] Set `NEXTAUTH_URL=http://localhost:3000`
- [ ] Verify all env vars in `.env.local`

---

## Phase 1: NextAuth.js 기본 설정 (예상: 2시간)

### Task 1.1: NextAuth 설정 파일 생성
- [ ] Create `lib/auth.ts` with NextAuth v5 configuration
- [ ] Import necessary providers and types
- [ ] Export `auth`, `signIn`, `signOut`, `handlers`

### Task 1.2: Credentials Provider 구성
- [ ] Add Credentials provider to `lib/auth.ts`
- [ ] Define credentials schema (email, password)
- [ ] Implement basic `authorize()` function (placeholder)

### Task 1.3: API Route Handler 설정
- [ ] Create `app/api/auth/[...nextauth]/route.ts`
- [ ] Export GET and POST handlers from `@/lib/auth`
- [ ] Test endpoint: `http://localhost:3000/api/auth/providers`

### Task 1.4: TypeScript 타입 확장
- [ ] Create `types/next-auth.d.ts`
- [ ] Extend `User` interface with `role` property
- [ ] Extend `Session` interface with user `role`
- [ ] Extend `JWT` interface with `role` and `id`

### Task 1.5: Session/JWT Callbacks 구현
- [ ] Implement `jwt()` callback to add role to token
- [ ] Implement `session()` callback to add role to session
- [ ] Configure session strategy: `jwt`
- [ ] Set session maxAge: 24 hours

---

## Phase 1.5: 보안 강화 (예상: 2시간) ← 신규

### Task 1.5.1: 에러 처리 전략 구현
- [ ] Create `lib/errors.ts`
- [ ] Define `AuthErrorCode` enum (AUTH001~AUTH007)
- [ ] Create `AuthError` class extending Error
- [ ] Define `ERROR_MESSAGES` mapping

### Task 1.5.2: Rate Limiter 구현
- [ ] Create `lib/rate-limiter.ts`
- [ ] Implement `checkAccountLockout(email)` function
- [ ] Implement `recordLoginAttempt(email, ip, userAgent, success, failureReason)` function
- [ ] Implement `handleFailedAttempt(email)` logic (5회 실패 감지)

### Task 1.5.3: Supabase Login Attempts 마이그레이션
- [ ] Create `supabase/migrations/20240103_login_attempts.sql`
- [ ] Define `login_attempts` table schema
- [ ] Add RLS policies (Admin만 조회 가능)
- [ ] Create indexes on email and created_at

### Task 1.5.4: Supabase Account Lockouts 마이그레이션
- [ ] Create `supabase/migrations/20240104_account_lockouts.sql`
- [ ] Define `account_lockouts` table schema
- [ ] Add RLS policies (Admin만 조회 가능)
- [ ] Create cleanup function `cleanup_expired_lockouts()`

---

## Phase 2: Supabase 통합 (예상: 1.5시간)

### Task 2.1: Supabase 클라이언트 초기화
- [ ] Create `lib/supabase.ts`
- [ ] Export `createClient()` factory function
- [ ] Configure with service role key for admin operations

### Task 2.2: Profiles 테이블 마이그레이션
- [ ] Create `supabase/migrations/20240101_create_profiles.sql`
- [ ] Define `profiles` table (id, email, role, display_name, created_at)
- [ ] Add RLS policies (users can view/update own profile)
- [ ] Create indexes on email and role

### Task 2.3: Auto-Create Profile Trigger
- [ ] Create `supabase/migrations/20240102_create_trigger.sql`
- [ ] Implement `handle_new_user()` function
- [ ] Create trigger `on_auth_user_created`
- [ ] Test trigger with test user creation

### Task 2.4: 초기 Admin 사용자 생성
- [ ] Create `scripts/create-admin.ts`
- [ ] Use Supabase Admin API to create user
- [ ] Set role to 'admin' in profiles table
- [ ] Document credentials in `.env.example`

### Task 2.5: 마이그레이션 실행
- [ ] Run all migrations: `supabase migration up`
- [ ] Verify tables created in Supabase dashboard
- [ ] Test RLS policies with test queries

---

## Phase 2.5: 사용자 등록 (예상: 1.5시간) ← 신규

### Task 2.5.1: Validation 스키마 작성
- [ ] Create `lib/validators.ts`
- [ ] Define `passwordSchema` with Zod (min 8 chars, uppercase, lowercase, number, special)
- [ ] Define `registerSchema` with email, password, confirmPassword, displayName
- [ ] Add password confirmation validation

### Task 2.5.2: 회원가입 API 구현
- [ ] Create `app/api/auth/register/route.ts`
- [ ] Implement POST handler
- [ ] Validate input with `registerSchema`
- [ ] Check for duplicate email
- [ ] Create user with Supabase Auth (`admin.createUser`)
- [ ] Handle errors with `AuthError`

### Task 2.5.3: 회원가입 UI 구현
- [ ] Create `app/register/page.tsx`
- [ ] Add form fields (email, displayName, password, confirmPassword)
- [ ] Add client-side validation
- [ ] Display error messages with `role="alert"`
- [ ] Add loading state during submission
- [ ] Redirect to `/login?registered=true` on success

### Task 2.5.4: 회원가입 테스트
- [ ] Test successful registration
- [ ] Test duplicate email error
- [ ] Test weak password validation
- [ ] Test password mismatch error

---

## Phase 3: 인증 구현 (예상: 2시간)

### Task 3.1: Credentials Provider 로직 완성
- [ ] Implement full `authorize()` function in `lib/auth.ts`
- [ ] Check account lockout with `checkAccountLockout(email)`
- [ ] Call Supabase `signInWithPassword()`
- [ ] Fetch user profile with role from `profiles` table
- [ ] Record login attempt with `recordLoginAttempt()`
- [ ] Return user object with role

### Task 3.2: 로그인 페이지 UI 구현
- [ ] Create `app/login/page.tsx`
- [ ] Add form with email and password fields
- [ ] Add proper labels and aria-attributes (accessibility)
- [ ] Implement `handleSubmit` with `signIn('credentials')`
- [ ] Display error messages
- [ ] Add link to `/register`
- [ ] Show success message if `?registered=true`

### Task 3.3: Session Provider 설정
- [ ] Update `app/layout.tsx`
- [ ] Wrap children with `<SessionProvider>`
- [ ] Configure for client components

### Task 3.4: 로그아웃 구현
- [ ] Create logout button component
- [ ] Use `signOut({ callbackUrl: '/login' })`
- [ ] Add to admin dashboard

---

## Phase 3.5: UI/UX Polish (예상: 1시간) ← 신규

### Task 3.5.1: 로딩 상태 표시
- [ ] Add Spinner component
- [ ] Add Skeleton loaders for protected pages
- [ ] Implement loading states in login/register forms

### Task 3.5.2: 에러 메시지 디자인
- [ ] Style error messages consistently
- [ ] Use `role="alert"` for accessibility
- [ ] Add error icons

### Task 3.5.3: 접근성 (a11y) 구현
- [ ] Add proper `<label>` elements with `htmlFor`
- [ ] Add `aria-label` where needed
- [ ] Add `aria-invalid` on error fields
- [ ] Add `aria-describedby` for error messages
- [ ] Test keyboard navigation (Tab, Enter)
- [ ] Verify focus indicators

### Task 3.5.4: 반응형 디자인 검증
- [ ] Test on mobile (375px)
- [ ] Test on tablet (768px)
- [ ] Test on desktop (1920px)
- [ ] Fix any layout issues

---

## Phase 4: 보호된 페이지 (예상: 1.5시간)

### Task 4.1: Middleware 설정
- [ ] Create `middleware.ts`
- [ ] Import `auth` from `@/lib/auth`
- [ ] Check session exists
- [ ] Check user role for `/admin/*` routes
- [ ] Redirect to `/login` if no session
- [ ] Redirect to `/forbidden` if insufficient permissions
- [ ] Configure matcher for `/admin/:path*` and `/dashboard/:path*`

### Task 4.2: Admin Dashboard 구현
- [ ] Create `app/admin/page.tsx` (Server Component)
- [ ] Use `await auth()` to get session
- [ ] Display user email and role
- [ ] Add logout button
- [ ] Show admin-only content

### Task 4.3: Forbidden 페이지
- [ ] Create `app/forbidden/page.tsx`
- [ ] Display "403 Forbidden" message
- [ ] Add link back to home

### Task 4.4: 권한 검증 테스트
- [ ] Test admin can access `/admin`
- [ ] Test non-admin cannot access `/admin`
- [ ] Test unauthenticated redirect to `/login`

---

## Phase 5: 테스트 및 검증 (예상: 3시간)

### Task 5.1: 유닛 테스트 작성
- [ ] Test `lib/rate-limiter.ts` (checkAccountLockout, recordLoginAttempt)
- [ ] Test `lib/validators.ts` (passwordSchema, registerSchema)
- [ ] Test `lib/errors.ts` (AuthError)
- [ ] Target: 80% code coverage

### Task 5.2: 통합 테스트 작성
- [ ] Test `/api/auth/register` API
- [ ] Test 로그인 시도 로깅
- [ ] Test 계정 잠금 로직 (5회 실패)
- [ ] Test Supabase RLS policies

### Task 5.3: E2E 테스트 작성 (Playwright)
- [ ] Install Playwright: `npx playwright install`
- [ ] Create `tests/e2e/auth.spec.ts` (로그인/로그아웃)
- [ ] Create `tests/e2e/register.spec.ts` (회원가입)
- [ ] Create `tests/e2e/rate-limiting.spec.ts` (계정 잠금)
- [ ] Create `tests/e2e/admin.spec.ts` (권한 검증)

### Task 5.4: 성능 테스트
- [ ] Measure login response time (목표: < 500ms p95)
- [ ] Run Lighthouse audit (목표: Performance > 90, Accessibility > 90)
- [ ] Optimize if needed

### Task 5.5: 보안 검증
- [ ] Run `npm audit` (목표: 0 high/critical vulnerabilities)
- [ ] Test rate limiting (5회 실패 → 계정 잠금)
- [ ] Test session expiration (24시간)
- [ ] Verify RLS policies working

---

## Phase 6: Production 배포 (예상: 1.5시간)

### Task 6.1: next.config.js 설정
- [ ] Add security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- [ ] Configure CSP headers
- [ ] Set up environment-specific configs

### Task 6.2: Vercel 환경 변수 설정
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `NEXTAUTH_URL` (production domain)
- [ ] Generate new `NEXTAUTH_SECRET` for production

### Task 6.3: Production 배포
- [ ] Push to GitHub
- [ ] Deploy to Vercel: `vercel --prod`
- [ ] Verify deployment successful
- [ ] Test production endpoints

### Task 6.4: 배포 후 검증
- [ ] Test login in production
- [ ] Test registration in production
- [ ] Test admin access in production
- [ ] Verify environment variables loaded

---

## Phase 6.5: 운영/모니터링 (예상: 1시간) ← 신규

### Task 6.5.1: Sentry 설정
- [ ] Create Sentry project
- [ ] Install: `npx @sentry/wizard@latest -i nextjs`
- [ ] Configure `sentry.client.config.ts`
- [ ] Configure `sentry.server.config.ts`
- [ ] Test error tracking

### Task 6.5.2: 구조화된 로깅 구현
- [ ] Create `lib/logger.ts` with pino
- [ ] Configure log levels (info, warn, error)
- [ ] Add logging to critical paths (login, register)
- [ ] Pretty print in development

### Task 6.5.3: 헬스체크 엔드포인트
- [ ] Create `app/api/health/route.ts`
- [ ] Check Supabase connection
- [ ] Check environment variables
- [ ] Return 200 OK or 503 Service Unavailable

### Task 6.5.4: Vercel Analytics
- [ ] Enable Vercel Analytics in dashboard
- [ ] Add `<Analytics />` component to layout
- [ ] Monitor performance metrics

---

## Task ∞: 문서화 및 정리

### Task ∞.1: README.md 작성
- [ ] Add project overview
- [ ] Add installation instructions
- [ ] Add development commands
- [ ] Add testing commands
- [ ] Add deployment guide

### Task ∞.2: API 문서화
- [ ] Document `/api/auth/register` endpoint
- [ ] Document `/api/auth/[...nextauth]` endpoints
- [ ] Document `/api/health` endpoint

### Task ∞.3: 트러블슈팅 가이드
- [ ] Document common issues and solutions
- [ ] Add NextAuth v5 migration notes
- [ ] Add Supabase setup tips

---

## Success Criteria

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
- [ ] 비밀번호 강도 검증 통과
- [ ] npm audit 0 high/critical vulnerabilities

### 테스트 요구사항
- [ ] 단위 테스트 커버리지 80% 이상
- [ ] E2E 테스트 모든 critical path 통과
- [ ] TypeScript 타입 에러 없음

### 성능 요구사항
- [ ] 로그인 응답 시간 < 500ms (p95)
- [ ] Lighthouse Score: Performance > 90, Accessibility > 90

### 배포 요구사항
- [ ] Production 배포 성공 (Vercel)
- [ ] Health check 엔드포인트 정상 응답
- [ ] Sentry 에러 추적 동작 확인

---

**Total Tasks**: 85+
**Estimated Completion**: 12-16 hours
**Last Updated**: 2025-01-13
