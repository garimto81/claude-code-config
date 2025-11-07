# Supabase 마이그레이션 가이드

## 📋 마이그레이션 파일 목록

```
supabase/
├── migrations/
│   ├── 20250112000001_create_profiles.sql       ✅ (이미 실행됨)
│   ├── 20250112000002_create_kp_players.sql     🆕 (새로 생성)
│   ├── 20250112000003_create_hands.sql          🆕 (새로 생성)
│   ├── 20250112000004_create_hand_streets.sql   🆕 (새로 생성)
│   ├── 20250112000005_create_rls_policies.sql   🆕 (새로 생성)
│   ├── 20250112000006_create_functions.sql      🆕 (새로 생성)
│   └── 20250112000007_create_storage_buckets.sql 🆕 (새로 생성)
└── seed.sql                                      🆕 (테스트용 샘플 데이터)
```

---

## 🚀 마이그레이션 실행 방법

### 방법 1: Supabase Dashboard (GUI) - 추천

#### Step 1: Supabase Dashboard 접속
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택: **VTC Logger**

#### Step 2: SQL Editor에서 실행
1. 왼쪽 메뉴에서 **SQL Editor** 클릭
2. **New query** 버튼 클릭
3. 각 마이그레이션 파일을 순서대로 실행:

**실행 순서 (매우 중요!):**
```sql
-- 1. KP Players 테이블
-- 파일: 20250112000002_create_kp_players.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 2. Hands 테이블
-- 파일: 20250112000003_create_hands.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 3. Hand Streets 테이블
-- 파일: 20250112000004_create_hand_streets.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 4. RLS 정책
-- 파일: 20250112000005_create_rls_policies.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 5. Supabase Functions
-- 파일: 20250112000006_create_functions.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 6. Storage Buckets
-- 파일: 20250112000007_create_storage_buckets.sql
-- 복사 & 붙여넣기 → RUN 클릭

-- 7. Seed Data (선택사항)
-- 파일: seed.sql
-- 복사 & 붙여넣기 → RUN 클릭
```

#### Step 3: 확인
각 마이그레이션 실행 후 확인:
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- KP 플레이어 확인 (Seed 실행 후)
SELECT * FROM kp_players ORDER BY player_name;

-- Functions 확인
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- Storage Bucket 확인
SELECT * FROM storage.buckets;
```

---

### 방법 2: Supabase CLI (로컬 개발)

#### Step 1: Supabase CLI 설치
```bash
# npm으로 설치
npm install -g supabase

# 또는 Homebrew (macOS)
brew install supabase/tap/supabase
```

#### Step 2: 프로젝트 연결
```bash
# 프로젝트 루트로 이동
cd d:/AI/claude01/VTC_Logger

# Supabase 로그인
supabase login

# 기존 프로젝트 연결
supabase link --project-ref YOUR_PROJECT_REF
```

**YOUR_PROJECT_REF 찾는 방법:**
- Supabase Dashboard → Settings → General → Reference ID

#### Step 3: 마이그레이션 실행
```bash
# 모든 마이그레이션 파일 실행
supabase db push

# 또는 개별 파일 실행
supabase db execute -f supabase/migrations/20250112000002_create_kp_players.sql
supabase db execute -f supabase/migrations/20250112000003_create_hands.sql
supabase db execute -f supabase/migrations/20250112000004_create_hand_streets.sql
supabase db execute -f supabase/migrations/20250112000005_create_rls_policies.sql
supabase db execute -f supabase/migrations/20250112000006_create_functions.sql
supabase db execute -f supabase/migrations/20250112000007_create_storage_buckets.sql
```

#### Step 4: Seed 데이터 실행 (선택사항)
```bash
supabase db execute -f supabase/seed.sql
```

---

## 🧪 마이그레이션 검증

### 1. 테이블 구조 확인
```sql
-- KP Players 테이블
\d kp_players

-- Hands 테이블
\d hands

-- Hand Streets 테이블
\d hand_streets

-- 모든 테이블 목록
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 2. RLS 정책 확인
```sql
-- 모든 RLS 정책 조회
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### 3. Functions 확인
```sql
-- 모든 함수 목록
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 특정 함수 테스트
SELECT * FROM get_kp_list_sparse();
```

### 4. Storage Bucket 확인
```sql
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets;
```

---

## ⚠️ 주의사항

### 1. 마이그레이션 순서
**반드시 파일 번호 순서대로 실행하세요!**
- `20250112000002` → `20250112000003` → ... → `20250112000007`
- 순서가 잘못되면 외래 키 오류가 발생합니다.

### 2. profiles 테이블
- `20250112000001_create_profiles.sql`은 이미 실행되어 있습니다.
- 다시 실행하면 오류가 발생할 수 있습니다.

### 3. Seed 데이터
- `seed.sql`은 **개발/테스트용**입니다.
- 프로덕션 환경에서는 실행하지 마세요.
- 샘플 KP 플레이어 10명을 생성합니다.

### 4. Storage Bucket
- `kp-photos` 버킷은 **public: true**로 설정되어 있습니다.
- 하지만 RLS 정책으로 **인증된 사용자만 접근** 가능합니다.

---

## 🔧 트러블슈팅

### 문제 1: "relation already exists"
**원인**: 테이블이 이미 존재합니다.

**해결**:
```sql
-- 테이블 삭제 후 다시 생성
DROP TABLE IF EXISTS hand_streets CASCADE;
DROP TABLE IF EXISTS hands CASCADE;
DROP TABLE IF EXISTS kp_players CASCADE;

-- 그 후 마이그레이션 다시 실행
```

### 문제 2: "function already exists"
**원인**: 함수가 이미 존재합니다.

**해결**:
```sql
-- CREATE OR REPLACE FUNCTION을 사용하면 자동으로 업데이트됩니다.
-- 마이그레이션 파일을 그냥 다시 실행하면 됩니다.
```

### 문제 3: "foreign key constraint"
**원인**: 외래 키 참조 오류 (순서 문제)

**해결**:
- 마이그레이션을 **순서대로** 다시 실행하세요.
- 모든 테이블을 삭제하고 처음부터 다시 시작하세요.

---

## 📊 마이그레이션 후 데이터 확인

```sql
-- 1. 전체 스키마 확인
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. KP 플레이어 목록 (Seed 실행 후)
SELECT player_name, table_no, seat_no, chip_count
FROM kp_players
ORDER BY player_name;

-- 3. RLS 정책 개수
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 4. Functions 개수
SELECT COUNT(*) as function_count
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION';

-- 5. Storage Buckets
SELECT id, name, public, file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets;
```

---

## ✅ 마이그레이션 완료 체크리스트

- [ ] `kp_players` 테이블 생성 완료
- [ ] `hands` 테이블 생성 완료
- [ ] `hand_streets` 테이블 생성 완료
- [ ] RLS 정책 4개 테이블 모두 활성화
- [ ] Supabase Functions 7개 생성 완료
- [ ] Storage Bucket `kp-photos` 생성 완료
- [ ] Seed 데이터 10명 KP 플레이어 확인
- [ ] 테스트 쿼리 실행 성공

---

## 🎯 다음 단계

마이그레이션 완료 후:
1. TypeScript 타입 생성
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_REF > vtc-app/src/shared/types/database.types.ts
   ```

2. React 앱에서 Supabase 연결 테스트
   ```typescript
   import { supabase } from '@/shared/utils/supabase';
   const { data, error } = await supabase.rpc('get_kp_list_sparse');
   console.log(data); // KP 목록 출력
   ```

3. KP Dashboard 개발 시작 (Week 1, Day 5-7)

---

**마이그레이션 완료!** 🎉
이제 KP Dashboard 개발을 시작할 준비가 되었습니다.
