# 데이터베이스 마이그레이션 가이드

**VTC Story Ledger - Supabase 마이그레이션 실행**

---

## 🎯 마이그레이션 파일

### Migration 001: profiles 테이블
**파일**: [supabase/migrations/20250112000001_create_profiles.sql](supabase/migrations/20250112000001_create_profiles.sql)

**생성 내용**:
- `profiles` 테이블 (사용자 프로필)
- `update_updated_at_column()` 함수 (자동 업데이트)
- `handle_new_user()` 함수 (신규 사용자 자동 프로필 생성)
- RLS 정책 3개

---

## 📝 실행 방법

### Option 1: Supabase Dashboard (권장)

1. **Supabase Dashboard** 접속
   - [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 프로젝트 선택

2. **SQL Editor** 열기
   - 좌측 메뉴 **🗂️ SQL Editor** 클릭
   - 우측 상단 **"New query"** 버튼 클릭

3. **마이그레이션 파일 내용 복사**
   - [20250112000001_create_profiles.sql](supabase/migrations/20250112000001_create_profiles.sql) 파일 전체 복사
   - SQL Editor에 붙여넣기

4. **실행**
   - 우측 하단 **"Run"** 버튼 클릭 (또는 `Ctrl+Enter`)
   - ✅ "Success. No rows returned" 메시지 확인

5. **결과 확인**
   - 좌측 메뉴 **🗂️ Table Editor** 클릭
   - `profiles` 테이블 생성 확인

---

### Option 2: Supabase CLI (고급)

```bash
# 1. Supabase CLI 설치 (한 번만)
npm install -g supabase

# 2. 프로젝트 초기화
supabase init

# 3. 로컬 Supabase 시작
supabase start

# 4. 마이그레이션 실행
supabase db reset

# 5. 원격 프로젝트에 적용
supabase db push
```

---

## 🧪 테스트 사용자 생성

마이그레이션 실행 후 테스트 사용자 생성:

### Step 1: Authentication 메뉴

1. **Supabase Dashboard** → **👤 Authentication** → **Users**
2. 우측 상단 **"Add user"** 버튼 클릭

### Step 2: Logger 계정

| 항목 | 값 |
|------|-----|
| **Email** | `logger@vtc.com` |
| **Password** | `logger123!@#` |
| **Auto Confirm User** | ✅ 체크 |

**User Metadata (JSON)**:
```json
{
  "role": "logger",
  "display_name": "Test Logger"
}
```

### Step 3: Producer 계정

| 항목 | 값 |
|------|-----|
| **Email** | `producer@vtc.com` |
| **Password** | `producer123!@#` |
| **Auto Confirm User** | ✅ 체크 |

**User Metadata (JSON)**:
```json
{
  "role": "producer",
  "display_name": "Test Producer"
}
```

### Step 4: 자동 프로필 생성 확인

1. **Table Editor** → **profiles** 테이블 클릭
2. 2개의 행(row) 자동 생성 확인:
   - `logger@vtc.com` / `logger` / `Test Logger`
   - `producer@vtc.com` / `producer` / `Test Producer`

✅ `handle_new_user` 트리거가 자동으로 프로필을 생성했습니다!

---

## ✅ 검증 체크리스트

- [ ] `profiles` 테이블 생성됨
- [ ] 테이블 컬럼 확인:
  - [ ] `id` (uuid, primary key)
  - [ ] `email` (text, unique)
  - [ ] `role` (text, check constraint)
  - [ ] `display_name` (text)
  - [ ] `is_active` (boolean)
  - [ ] `created_at` (timestamptz)
  - [ ] `updated_at` (timestamptz)
- [ ] 인덱스 2개 생성됨 (`idx_profiles_role`, `idx_profiles_is_active`)
- [ ] 함수 2개 생성됨 (`update_updated_at_column`, `handle_new_user`)
- [ ] 트리거 2개 생성됨 (`update_profiles_updated_at`, `on_auth_user_created`)
- [ ] RLS 정책 3개 생성됨
- [ ] 테스트 사용자 2명 생성됨
- [ ] `profiles` 테이블에 2개 행 자동 생성됨

---

## 🐛 트러블슈팅

### "relation already exists"

**원인**: 이미 테이블이 존재함

**해결**:
```sql
-- 기존 테이블 삭제 후 재실행
DROP TABLE IF EXISTS profiles CASCADE;
```

### "trigger already exists"

**원인**: 이미 트리거가 존재함

**해결**:
```sql
-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS update_updated_at_column();
```

### profiles 테이블에 자동 생성 안 됨

**원인**: 사용자를 먼저 생성하고 트리거를 나중에 생성함

**해결**:
```sql
-- 수동으로 프로필 삽입
INSERT INTO profiles (id, email, role, display_name)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'role', 'logger'),
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.users.id);
```

---

## 🎉 완료!

마이그레이션이 성공적으로 완료되면:

1. **애플리케이션 실행**:
   ```bash
   cd vtc-app
   npm run dev
   ```

2. **로그인 테스트**:
   - `http://localhost:5173` 접속
   - `logger@vtc.com` / `logger123!@#` 로그인
   - 홈 화면에서 사용자 정보 확인

**다음 단계**: Week 1 - KP Dashboard 개발

---

**작성**: 2025-01-12
**버전**: Migration 001
