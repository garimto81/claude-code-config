# Supabase 설정 완벽 가이드

**VTC Story Ledger - Week 0**

---

## 📝 목차

1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [환경 변수 설정](#2-환경-변수-설정)
3. [데이터베이스 마이그레이션](#3-데이터베이스-마이그레이션)
4. [테스트 사용자 생성](#4-테스트-사용자-생성)
5. [연동 확인](#5-연동-확인)

---

## 1. Supabase 프로젝트 생성

### Step 1: Supabase 회원가입/로그인
1. [https://supabase.com](https://supabase.com) 접속
2. 우측 상단 **"Start your project"** 클릭
3. GitHub 계정으로 로그인 (권장) 또는 이메일 회원가입

### Step 2: 새 프로젝트 생성
1. Dashboard에서 **"New Project"** 버튼 클릭
2. 프로젝트 정보 입력:

| 항목 | 값 | 설명 |
|------|-----|------|
| **Name** | `vtc-story-ledger` | 프로젝트 이름 |
| **Database Password** | (강력한 비밀번호 생성) | 예: `VTC_db2025!@#` |
| **Region** | `Northeast Asia (Seoul)` | 한국 서버 (권장) |
| **Pricing Plan** | `Free` | 무료 티어 (충분함) |

3. **"Create new project"** 클릭
4. ⏳ **약 2분 대기** (프로젝트 생성 중)

### Step 3: 프로젝트 생성 완료 확인
- 좌측 메뉴가 보이면 생성 완료
- 프로젝트 ID 확인 (예: `wkuxyqvstevyhxydsteg`)

---

## 2. 환경 변수 설정

### Step 1: API 키 복사

1. Supabase Dashboard 좌측 메뉴에서 **⚙️ Settings** 클릭
2. **API** 메뉴 클릭
3. 다음 정보를 복사:

#### 📋 Project URL
```
Configuration → Project URL
```
예시: `https://wkuxyqvstevyhxydsteg.supabase.co`

#### 🔑 anon public key
```
Project API keys → anon public
```
예시 (매우 긴 토큰):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind...
```

⚠️ **주의**: `service_role` 키는 복사하지 마세요 (서버 전용, 보안 위험)

### Step 2: `.env.local` 파일 생성

프로젝트 루트(`vtc-app/` 폴더)에서:

```bash
# 1. 샘플 파일 복사
cp .env.sample .env.local

# 또는 직접 생성
touch .env.local
```

### Step 3: `.env.local` 파일 수정

파일을 열어 복사한 정보로 교체:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_real_key_here
```

**실제 예시**:
```bash
VITE_SUPABASE_URL=https://wkuxyqvstevyhxydsteg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind...
```

### Step 4: 환경 변수 확인

```bash
# 파일 내용 확인 (Windows)
type .env.local

# 파일 내용 확인 (Mac/Linux)
cat .env.local
```

✅ **확인 사항**:
- `VITE_SUPABASE_URL`이 `https://`로 시작하는가?
- `VITE_SUPABASE_ANON_KEY`가 `eyJ`로 시작하는가?
- 키 값에 `your_`가 없는가? (샘플 값이 아닌가?)

---

## 3. 데이터베이스 마이그레이션

### Step 1: SQL Editor 열기

1. Supabase Dashboard 좌측 메뉴에서 **🗂️ SQL Editor** 클릭
2. 우측 상단 **"New query"** 버튼 클릭

### Step 2: profiles 테이블 생성

아래 SQL을 복사하여 붙여넣고 **"Run"** 버튼 클릭:

```sql
-- ========================================
-- 1. profiles 테이블 생성
-- ========================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('logger', 'camera_supervisor', 'producer')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- ========================================
-- 2. updated_at 자동 업데이트 함수
-- ========================================
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

-- ========================================
-- 3. 신규 사용자 자동 프로필 생성
-- ========================================
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

-- ========================================
-- 4. Row Level Security (RLS) 설정
-- ========================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 정책: Producer는 모든 프로필 조회 가능
CREATE POLICY "Producers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- 정책: 사용자는 자신의 프로필 업데이트 가능 (role 제외)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));
```

### Step 3: 실행 결과 확인

✅ **성공 메시지 예시**:
```
Success. No rows returned
```

❌ **에러 발생 시**:
- 에러 메시지 복사
- SQL 문법 확인
- 이미 테이블이 존재하는지 확인 (Table Editor에서)

### Step 4: 테이블 생성 확인

1. 좌측 메뉴 **🗂️ Table Editor** 클릭
2. `profiles` 테이블이 보이는지 확인
3. 컬럼 확인:
   - `id` (uuid)
   - `email` (text)
   - `role` (text)
   - `display_name` (text)
   - `is_active` (bool)
   - `created_at` (timestamptz)
   - `updated_at` (timestamptz)

---

## 4. 테스트 사용자 생성

### Step 1: Authentication 메뉴 열기

1. 좌측 메뉴 **👤 Authentication** 클릭
2. 상단 **Users** 탭 클릭 (기본값)
3. 우측 상단 **"Add user"** 버튼 클릭

### Step 2: Logger 계정 생성

**"Create a new user" 모달**에서:

| 항목 | 값 |
|------|-----|
| **Email** | `logger@vtc.com` |
| **Password** | `logger123!@#` |
| **Auto Confirm User** | ✅ 체크 (이메일 인증 건너뛰기) |

**User Metadata (JSON)** 섹션 펼치기 → 다음 JSON 입력:
```json
{
  "role": "logger",
  "display_name": "Test Logger"
}
```

**"Create user"** 버튼 클릭

### Step 3: Producer 계정 생성

동일한 방법으로 Producer 계정 생성:

| 항목 | 값 |
|------|-----|
| **Email** | `producer@vtc.com` |
| **Password** | `producer123!@#` |
| **Auto Confirm User** | ✅ 체크 |

**User Metadata**:
```json
{
  "role": "producer",
  "display_name": "Test Producer"
}
```

### Step 4: 사용자 생성 확인

1. **Authentication → Users** 목록에 2명의 사용자 표시
2. 각 사용자의 `Confirmed` 상태가 ✅ 인지 확인

### Step 5: profiles 테이블 자동 생성 확인

1. **Table Editor → profiles** 테이블 클릭
2. 2개의 행(row)이 자동으로 생성되었는지 확인:
   - `logger@vtc.com` / `logger` / `Test Logger`
   - `producer@vtc.com` / `producer` / `Test Producer`

✅ 자동으로 생성되었다면 `handle_new_user` 트리거 정상 동작!

---

## 5. 연동 확인

### Step 1: 개발 서버 실행

```bash
cd vtc-app
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### Step 2: 로그인 테스트

**Login Form**에서:
- **Email**: `logger@vtc.com`
- **Password**: `logger123!@#`

**"Login"** 버튼 클릭

### Step 3: 성공 확인

✅ **로그인 성공 시**:
1. 홈 화면(`/`)으로 자동 리디렉션
2. 헤더에 다음 정보 표시:
   ```
   VTC Story Ledger
   Test Logger • logger
   ```
3. 중앙에 "Welcome to VTC Story Ledger" 메시지
4. 녹색 배지: "✓ Week 0: Login system ready"

❌ **로그인 실패 시**:
- 빨간색 에러 박스에 메시지 표시
- 아래 [트러블슈팅](#트러블슈팅) 참고

### Step 4: 로그아웃 테스트

1. 우측 상단 **"Logout"** 버튼 클릭
2. 로그인 페이지(`/login`)로 자동 리디렉션
3. 다시 홈(`/`) 접속 시도 → 로그인 페이지로 리디렉션 (Protected Route 동작)

### Step 5: Producer 계정 테스트

1. `producer@vtc.com` / `producer123!@#` 로 로그인
2. 헤더에 `Test Producer • producer` 표시 확인

---

## 🎉 설정 완료!

모든 테스트를 통과했다면 Week 0 완료입니다.

**다음 단계**: Week 1 - KP Dashboard 개발 시작

---

## 🐛 트러블슈팅

### 문제 1: "Missing Supabase environment variables"

**증상**:
- 앱 실행 시 바로 에러 발생
- 콘솔에 "Missing Supabase environment variables" 출력

**원인**: `.env.local` 파일이 없거나 환경 변수가 잘못됨

**해결**:
1. `.env.local` 파일이 `vtc-app/` 루트에 있는지 확인
2. 파일 내용 확인:
   ```bash
   cat .env.local  # Mac/Linux
   type .env.local # Windows
   ```
3. `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY` 값이 올바른지 확인
4. 개발 서버 재시작:
   ```bash
   # Ctrl+C로 종료 후
   npm run dev
   ```

### 문제 2: "Invalid login credentials"

**증상**: 로그인 시 빨간색 에러 메시지

**원인**:
- 이메일/비밀번호가 잘못됨
- 사용자가 생성되지 않았음
- 이메일 인증이 안 됨

**해결**:
1. Supabase Dashboard → Authentication → Users 확인
2. 사용자가 존재하는지 확인
3. `Confirmed` 상태가 ✅ 인지 확인 (❌ 이면 "Auto Confirm User" 체크 안 한 것)
4. 비밀번호 정확히 입력 (`logger123!@#`)
5. 필요시 사용자 삭제 후 재생성

### 문제 3: 로그인 후 "Cannot read properties of null"

**증상**: 로그인은 되지만 에러 발생

**원인**: `profiles` 테이블에 데이터가 없음

**해결**:
1. Table Editor → `profiles` 테이블 확인
2. 사용자 행이 없다면 수동 삽입:
   ```sql
   -- SQL Editor에서 실행
   INSERT INTO profiles (id, email, role, display_name)
   VALUES (
     'user-uuid-from-auth-users',  -- Authentication → Users에서 ID 복사
     'logger@vtc.com',
     'logger',
     'Test Logger'
   );
   ```
3. 또는 사용자 삭제 후 재생성 (트리거가 자동으로 profile 생성)

### 문제 4: Supabase Dashboard 접속 안 됨

**증상**: 로그인/페이지 로딩 실패

**원인**:
- 네트워크 문제
- 브라우저 캐시

**해결**:
1. 브라우저 시크릿 모드로 재시도
2. 다른 브라우저 사용 (Chrome 권장)
3. VPN 사용 시 비활성화
4. [Supabase Status](https://status.supabase.com) 확인

### 문제 5: SQL 실행 에러

**증상**: "syntax error at or near..."

**원인**: SQL 문법 오류 또는 이미 존재하는 테이블

**해결**:
1. SQL 전체를 복사했는지 확인 (부분 복사 시 에러)
2. 이미 테이블이 존재하는지 확인:
   ```sql
   -- 테이블 삭제 후 재생성
   DROP TABLE IF EXISTS profiles CASCADE;
   ```
3. 전체 SQL을 다시 복사하여 실행

---

## 📚 참고 링크

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Auth 가이드](https://supabase.com/docs/guides/auth)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [MVP-DESIGN.md](../docs/MVP-DESIGN.md) - 전체 MVP 설계

---

**작성**: 2025-01-12
**버전**: Week 0
