# AsharibAli/next-authjs-v5 분석

**분석일**: 2025-01-14
**분석자**: Claude Code Agent

---

## 📊 기본 정보

- **GitHub**: https://github.com/AsharibAli/next-authjs-v5
- **Stars**: 102 ⭐
- **Forks**: 37
- **Last Updated**: 2024년 3월 생성 (비교적 최신)
- **Commits**: 11개
- **문서화**: 상 (YouTube 튜토리얼 포함)
- **라이선스**: 확인 필요
- **Node 요구사항**: 18.7.x 이상

**특징**: 교육용 리포지토리로 엔터프라이즈급 인증 시스템 구현 패턴 제공

---

## 🛠️ 기술 스택

### 핵심 기술
- **Framework**: Next.js 14 (App Router)
- **Authentication**: NextAuth v5 (Auth.js)
- **Database ORM**: Prisma
- **Validation**: Zod (schemas 폴더에서 추정)
- **Styling**: Tailwind CSS
- **Language**: TypeScript (98.1%)
- **OAuth**: Google, GitHub 통합

### 주요 의존성 (추정)
```json
{
  "next": "^14.x",
  "next-auth": "^5.0.0-beta.x",
  "@prisma/client": "^x.x.x",
  "zod": "^x.x.x",
  "tailwindcss": "^3.x",
  "resend": "^x.x.x"  // 이메일 발송
}
```

---

## 🏗️ 아키텍처 분석

### 폴더 구조
```
next-authjs-v5/
├── actions/          # Server Actions (인증 로직)
├── app/              # Next.js 14 App Router
│   ├── (auth)/       # 인증 관련 라우트 (추정)
│   ├── settings/     # 사용자 설정 페이지
│   └── api/          # API 라우트
├── components/       # UI 컴포넌트
│   ├── auth/         # 로그인, 회원가입, 인증 UI (추정)
│   └── ui/           # 재사용 가능한 UI (추정)
├── data/             # 데이터 액세스 레이어
├── hooks/            # Custom Hooks
│   ├── useCurrentUser
│   └── useRole
├── lib/              # 유틸리티 라이브러리
│   └── auth.ts       # NextAuth 설정 (추정)
├── prisma/           # Prisma 스키마 및 마이그레이션
│   └── schema.prisma
├── schemas/          # Zod 유효성 검사 스키마
└── middleware.ts     # 라우트 보호 미들웨어
```

### 핵심 아키텍처 패턴

#### 1. **Server Actions 중심 설계**
- `actions/` 폴더에 인증 로직 분리
- 클라이언트-서버 경계 명확히 구분
- Form Actions로 CSRF 보호 자동 적용

#### 2. **레이어드 아키텍처**
```
UI (components/)
    ↓
Server Actions (actions/)
    ↓
Data Layer (data/)
    ↓
Database (Prisma)
```

#### 3. **Route Groups 활용**
- `(auth)` 그룹으로 인증 관련 라우트 조직화
- 레이아웃 공유 및 미들웨어 적용 용이

#### 4. **Custom Hooks 패턴**
```typescript
// hooks/useCurrentUser.ts
export const useCurrentUser = () => {
  // 현재 로그인된 사용자 정보 반환
}

// hooks/useRole.ts
export const useRole = () => {
  // 사용자 역할 확인
}
```

---

## 🔐 인증 흐름

### 지원 인증 방식
1. **Credentials (이메일/비밀번호)**
   - 회원가입 → 이메일 인증 → 로그인
   - 비밀번호 찾기/재설정

2. **OAuth (Google, GitHub)**
   - 소셜 로그인
   - 계정 연결

3. **2FA (Two-Factor Authentication)**
   - TOTP 기반 (추정)
   - 설정 페이지에서 활성화/비활성화

### 주요 워크플로우

#### 회원가입 및 인증
```
사용자 입력 (이메일, 비밀번호)
    ↓
Server Action (validation with Zod)
    ↓
Prisma: User 생성
    ↓
Resend: 이메일 인증 링크 발송
    ↓
사용자 이메일 클릭
    ↓
이메일 인증 완료
    ↓
로그인 가능
```

#### 로그인 흐름
```
Credentials/OAuth 제공
    ↓
NextAuth v5 인증
    ↓
2FA 활성화? → Yes → TOTP 코드 입력
    ↓             ↓ No
Session 생성    Session 생성
    ↓
Middleware: 역할 기반 라우트 보호
```

---

## 🎯 주요 기능

### 인증 기능
- [x] 이메일/비밀번호 로그인
- [x] Google OAuth
- [x] GitHub OAuth
- [x] 회원가입
- [x] 이메일 인증
- [x] 비밀번호 찾기/재설정
- [x] 2FA (Two-Factor Authentication)
- [x] 로그아웃

### 권한 관리
- [x] 역할 기반 액세스 제어 (RBAC)
  - Admin 역할
  - User 역할
- [x] 미들웨어 기반 라우트 보호
- [x] API 라우트 보호
- [x] Server Actions 보호

### 사용자 설정
- [x] 이메일 변경
- [x] 비밀번호 변경
- [x] 2FA 활성화/비활성화
- [x] 계정 정보 관리

### 개발자 경험
- [x] Custom Hooks (`useCurrentUser`, `useRole`)
- [x] 재사용 가능한 컴포넌트
- [x] TypeScript 타입 안정성
- [x] Zod 스키마 유효성 검사

---

## 📊 평가

| 항목 | 점수 | 코멘트 |
|------|------|--------|
| **적용 용이성** | 4/5 | 잘 구조화되어 있으나 Prisma 의존성으로 약간의 학습 필요 |
| **PRD 적합성** | 5/5 | 우리 PRD의 모든 요구사항 충족 + α |
| **유지보수성** | 5/5 | 명확한 폴더 구조, TypeScript, Zod 활용 |
| **커뮤니티 활성도** | 3/5 | 교육용 리포, 11개 커밋으로 제한적 |
| **확장성** | 5/5 | 엔터프라이즈급 패턴 적용 |

**총점**: 22/25 (88%)

### 강점
- ✅ **완벽한 NextAuth v5 구현**: 모든 고급 기능 포함
- ✅ **2FA 구현**: 우리 PRD에 없는 추가 보안 기능
- ✅ **이메일 인증**: Resend 활용한 프로덕션급 구현
- ✅ **Custom Hooks**: 개발자 경험 향상
- ✅ **역할 기반 보호**: Admin/User 구분

### 약점
- ❌ Rate Limiting 미구현 (우리 PRD 요구사항)
- ❌ 계정 잠금 기능 없음 (우리 PRD 요구사항)
- ❌ 로그인 시도 로깅 없음
- ❌ E2E 테스트 없음 (Playwright 등)
- ⚠️ Prisma 의존성 (우리는 Supabase 사용 예정)

---

## 🔄 우리 프로젝트와 비교

| 항목 | 우리 프로젝트 | AsharibAli 프로젝트 | 차이점 | 우선순위 |
|------|--------------|---------------------|--------|----------|
| **인증**
| NextAuth v5 | ✅ Credentials | ✅ Credentials + OAuth | OAuth 미구현 | 🟡 Medium |
| 이메일 인증 | ❌ | ✅ Resend | 이메일 인증 없음 | 🟢 Low |
| 2FA | ❌ | ✅ TOTP | 2FA 없음 | 🟢 Low |
| 비밀번호 재설정 | ❌ | ✅ | 기능 없음 | 🟡 Medium |
| **보안**
| 미들웨어 | ❌ | ✅ | 라우트 보호 없음 | 🔴 High |
| Rate Limiting | ❌ | ❌ | 양쪽 다 없음 | 🔴 High |
| 계정 잠금 | ❌ | ❌ | 양쪽 다 없음 | 🔴 High |
| 역할 기반 보호 | ✅ Session | ✅ Middleware | 미들웨어 미적용 | 🔴 High |
| **데이터베이스**
| ORM | ❌ | ✅ Prisma | Supabase 예정 | 🔴 High |
| 스키마 | ❌ | ✅ | DB 미연결 | 🔴 High |
| **UI/UX**
| 컴포넌트 | 기본 | 재사용 가능 | 구조화 부족 | 🟡 Medium |
| 설정 페이지 | ❌ | ✅ | 사용자 설정 없음 | 🟢 Low |
| **개발자 경험**
| Custom Hooks | ❌ | ✅ | Hooks 없음 | 🟡 Medium |
| Zod 검증 | ❌ | ✅ | 검증 로직 미흡 | 🟡 Medium |
| **테스팅**
| E2E 테스트 | ✅ Playwright | ❌ | 우리가 우수 | - |
| Unit 테스트 | ❌ | ❌ | 양쪽 다 없음 | 🟡 Medium |

---

## 💡 적용 가능한 개선사항

### 즉시 적용 가능 (Phase 2 - 이번 주)

#### 1. **미들웨어 패턴 적용** 🔴 High
```typescript
// middleware.ts
import { auth } from "@/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin")

  if (isAdminRoute && !isLoggedIn) {
    return Response.redirect(new URL("/login", req.url))
  }

  if (isAdminRoute && req.auth?.user?.role !== "admin") {
    return Response.redirect(new URL("/forbidden", req.url))
  }
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
```

**적용 이유**: 현재 `/admin` 라우트가 보호되지 않음
**예상 시간**: 30분
**참고 파일**: `middleware.ts`

#### 2. **Custom Hooks 도입** 🟡 Medium
```typescript
// hooks/useCurrentUser.ts
import { useSession } from "next-auth/react"

export const useCurrentUser = () => {
  const { data: session } = useSession()
  return session?.user
}

// hooks/useRole.ts
export const useRole = () => {
  const user = useCurrentUser()
  return user?.role
}
```

**적용 이유**: 컴포넌트 코드 단순화
**예상 시간**: 20분
**참고 파일**: `hooks/useCurrentUser.ts`, `hooks/useRole.ts`

#### 3. **폴더 구조 개선** 🟡 Medium
```
현재:
app/
├── actions/auth.ts
├── admin/page.tsx
└── login/page.tsx

개선안:
app/
├── (auth)/          # 인증 관련 라우트 그룹
│   ├── login/
│   └── register/    # 추후 추가
├── (protected)/     # 보호된 라우트 그룹
│   ├── admin/
│   └── dashboard/   # 추후 추가
└── actions/
    └── auth.ts
```

**적용 이유**: 라우트 조직화 및 레이아웃 공유
**예상 시간**: 1시간
**참고**: Next.js Route Groups 문서

---

### 중기 적용 (Phase 3-4 - 다음 주)

#### 4. **Server Actions 레이어 분리** 🟡 Medium
```
현재:
app/actions/auth.ts (모든 인증 로직)

개선안:
actions/
├── auth/
│   ├── login.ts
│   ├── logout.ts
│   └── register.ts   # 추후
├── user/
│   └── update-profile.ts
└── admin/
    └── manage-users.ts
```

**적용 이유**: 코드 재사용성 및 테스트 용이성
**예상 시간**: 2시간

#### 5. **Zod 스키마 유효성 검사** 🟡 Medium
```typescript
// schemas/auth.ts
import { z } from "zod"

export const LoginSchema = z.object({
  email: z.string().email("유효한 이메일을 입력하세요"),
  password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다")
})

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(/[A-Z]/, "대문자 포함")
    .regex(/[a-z]/, "소문자 포함")
    .regex(/[0-9]/, "숫자 포함")
    .regex(/[^A-Za-z0-9]/, "특수문자 포함"),
  name: z.string().min(2)
})
```

**적용 이유**: PRD 요구사항 (비밀번호 강도 검증)
**예상 시간**: 1시간
**참고**: PRD v2.0 보안 요구사항

#### 6. **OAuth 제공자 추가** 🟡 Medium
```typescript
// auth.ts
import Google from "next-auth/providers/google"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({ /* ... */ }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
})
```

**적용 이유**: 사용자 편의성 향상
**예상 시간**: 2시간 (OAuth 앱 설정 포함)

---

### 장기 검토 (Phase 5+ - 다음 달)

#### 7. **2FA 구현** 🟢 Low (Optional)
- TOTP 기반 2FA
- QR 코드 생성
- 복구 코드 제공

**적용 이유**: 추가 보안 레이어 (PRD에는 없지만 권장)
**예상 시간**: 4-6시간
**의존성**: `@otplib/core`, `qrcode`

#### 8. **이메일 인증** 🟢 Low (Optional)
- 회원가입 시 이메일 인증
- Resend 또는 SendGrid 통합

**적용 이유**: 스팸 방지 및 사용자 확인
**예상 시간**: 3-4시간

---

## 📝 배운 점 (Key Takeaways)

### 1. **Server Actions의 강력함**
- CSRF 보호 자동 적용
- 타입 안전한 클라이언트-서버 통신
- Form Actions로 간단한 구현

**교훈**: 우리도 모든 인증 로직을 Server Actions로 유지해야 함 ✅ (이미 적용 중)

### 2. **미들웨어의 중요성**
- 라우트 보호의 중앙 집중화
- 중복 코드 제거
- 성능 최적화 (Edge Runtime)

**교훈**: Phase 2에서 즉시 구현 필요 🔴

### 3. **Custom Hooks로 DX 향상**
```typescript
// Before
const { data: session } = useSession()
const userRole = session?.user?.role

// After
const role = useRole()
```

**교훈**: 반복되는 패턴은 Hooks로 추상화

### 4. **Zod로 타입 안전성 강화**
- 런타임 유효성 검사
- TypeScript 타입 자동 추론
- 에러 메시지 커스터마이징

**교훈**: 모든 입력 검증은 Zod 스키마로 정의

### 5. **Route Groups로 조직화**
- `(auth)`, `(protected)` 그룹으로 레이아웃 공유
- 미들웨어 적용 범위 명확화

**교훈**: 폴더 구조 개선 검토 필요

### 6. **Prisma의 장단점**
- 장점: 타입 안전, 마이그레이션 자동화
- 단점: Supabase와 중복 (우리는 Supabase 선택)

**교훈**: Supabase Client로 충분, Prisma 불필요

---

## ✅ 적용 체크리스트

### Phase 2 (이번 주)
- [ ] `middleware.ts` 생성 및 라우트 보호 구현
- [ ] `hooks/useCurrentUser.ts` 생성
- [ ] `hooks/useRole.ts` 생성
- [ ] Admin 페이지에서 Custom Hooks 사용
- [ ] Route Groups 폴더 구조로 리팩토링 검토

### Phase 3 (다음 주)
- [ ] `schemas/auth.ts` 생성 (Zod)
- [ ] 비밀번호 강도 검증 추가
- [ ] Server Actions 폴더 구조 개선
- [ ] OAuth 제공자 추가 (Google, GitHub)

### Phase 4-5 (다음 달)
- [ ] 2FA 구현 검토
- [ ] 이메일 인증 구현 검토
- [ ] 사용자 설정 페이지 추가
- [ ] 비밀번호 재설정 기능 추가

---

## 🔗 참고 링크

- **GitHub**: https://github.com/AsharibAli/next-authjs-v5
- **NextAuth v5 Docs**: https://authjs.dev
- **Prisma Docs**: https://www.prisma.io/docs
- **Route Groups**: https://nextjs.org/docs/app/building-your-application/routing/route-groups
- **Resend**: https://resend.com/docs

---

**분석 완료**: 2025-01-14
**다음 단계**: wpcodevo 리포지토리 분석
**예상 적용 시간**: 10-15시간 (Phase 2-5 전체)
