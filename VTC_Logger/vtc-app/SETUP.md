# VTC Story Ledger - Setup Guide
**Week 0: 로그인 & Supabase 연동 확인**

---

## 🎯 완료된 작업

### 1. 프로젝트 초기화 ✅
- [x] Vite + React + TypeScript 프로젝트 생성
- [x] Tailwind CSS 설정
- [x] 경로 별칭 (`@/`) 설정

### 2. 의존성 설치 ✅
```bash
# Core dependencies
@supabase/supabase-js  # Supabase 클라이언트
zustand                # 상태 관리
@tanstack/react-query  # 데이터 페칭 (추후 사용)
react-router-dom       # 라우팅
date-fns              # 날짜 유틸리티
uuid                  # UUID 생성

# Dev dependencies
tailwindcss           # CSS 프레임워크
@types/uuid           # UUID 타입
```

### 3. 폴더 구조 ✅
```
src/
├── app/
│   ├── layout/
│   │   └── AppLayout.tsx        # 메인 레이아웃
│   └── router.tsx               # 라우팅 설정
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx    # 로그인 폼
│       │   └── ProtectedRoute.tsx # 보호된 라우트
│       └── store/
│           └── authStore.ts     # 인증 상태 관리
└── shared/
    ├── types/
    │   └── models.ts            # 타입 정의
    └── utils/
        └── supabase.ts          # Supabase 클라이언트
```

### 4. 구현된 기능 ✅
- [x] Supabase 클라이언트 유틸리티
- [x] Auth Store (Zustand + persist)
- [x] Login 컴포넌트 (이메일/비밀번호)
- [x] Protected Route (인증 확인 + 역할 기반 접근)
- [x] App Layout (헤더 + Outlet)
- [x] 라우팅 설정

---

## 📋 다음 단계: Supabase 설정

### Step 1: Supabase 프로젝트 생성

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - **Name**: `vtc-story-ledger`
   - **Database Password**: 안전한 비밀번호 생성
   - **Region**: `Northeast Asia (Seoul)` 권장
4. 프로젝트 생성 완료 대기 (약 2분)

### Step 2: 환경 변수 설정

1. Supabase Dashboard → Settings → API
2. 다음 정보 복사:
   - **Project URL**: `https://your-project.supabase.co`
   - **anon public key**: `eyJhbG...` (긴 토큰)

3. `.env.local` 파일 업데이트:
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: 데이터베이스 마이그레이션 실행

Supabase Dashboard → SQL Editor → New Query 에서 다음 파일들을 순서대로 실행:

#### 1. `20250112000001_create_profiles.sql`
```sql
-- 사용자 프로필 테이블
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('logger', 'camera_supervisor', 'producer')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auth 사용자 생성 시 자동 프로필 생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'logger'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

#### 2. 테스트 사용자 생성

Supabase Dashboard → Authentication → Users → Add User:

**Logger 계정**:
- Email: `logger@vtc.com`
- Password: `logger123!@#`
- User Metadata:
  ```json
  {
    "role": "logger",
    "display_name": "Test Logger"
  }
  ```

**Producer 계정**:
- Email: `producer@vtc.com`
- Password: `producer123!@#`
- User Metadata:
  ```json
  {
    "role": "producer",
    "display_name": "Test Producer"
  }
  ```

### Step 4: 애플리케이션 실행

```bash
cd vtc-app
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### Step 5: 로그인 테스트

1. 로그인 페이지에서 테스트 계정 사용:
   - Email: `logger@vtc.com`
   - Password: `logger123!@#`

2. 로그인 성공 시:
   - 홈 화면으로 리디렉션
   - 헤더에 "Test Logger • logger" 표시
   - "Welcome to VTC Story Ledger" 메시지 확인

3. 로그아웃 테스트:
   - 우측 상단 "Logout" 버튼 클릭
   - 로그인 페이지로 리디렉션

---

## 🔍 테스트 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 마이그레이션 실행 완료
- [ ] 테스트 사용자 생성 완료
- [ ] 애플리케이션 실행 (npm run dev)
- [ ] 로그인 성공 (`logger@vtc.com`)
- [ ] 홈 화면 접근 확인
- [ ] 사용자 정보 표시 확인 (헤더)
- [ ] 로그아웃 성공
- [ ] Protected Route 동작 확인 (로그아웃 후 홈 접근 → 로그인 페이지로 리디렉션)

---

## 🐛 트러블슈팅

### 문제: "Missing Supabase environment variables" 에러
**해결**: `.env.local` 파일이 `vtc-app/` 폴더 루트에 있는지 확인. 개발 서버 재시작.

### 문제: 로그인 시 "Invalid login credentials" 에러
**해결**:
1. Supabase Dashboard → Authentication → Users 에서 사용자 존재 확인
2. 이메일/비밀번호 정확히 입력했는지 확인
3. Supabase Dashboard → Authentication → Policies 에서 Email 인증 비활성화 확인

### 문제: 로그인 후 "Cannot read properties of null" 에러
**해결**:
1. SQL Editor에서 `profiles` 테이블 확인
2. `handle_new_user` 함수가 정상 동작하는지 확인
3. 필요시 수동으로 profile 삽입:
```sql
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  'user-uuid-from-auth-users',
  'logger@vtc.com',
  'logger',
  'Test Logger'
);
```

---

## 📚 참고 문서

- [MVP-DESIGN.md](../docs/MVP-DESIGN.md) - 전체 MVP 설계 문서
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Zustand Docs](https://docs.pmnd.rs/zustand)

---

**Week 0 완료 조건**:
✅ 로그인 성공
✅ Supabase 연동 확인
✅ Protected Route 동작 확인

**다음 단계**: Week 1 - KP Dashboard 개발
