# 🚨 마이그레이션 오류 해결 가이드

## 발생한 오류들

### 1. ❌ RLS 정책 중복 오류
```
ERROR: 42710: policy "Users can view own profile" for table "profiles" already exists
```

**원인**: `profiles` 테이블의 RLS 정책이 이미 `20250112000001_create_profiles.sql`에서 생성됨

**해결**: `20250112000005_create_rls_policies_fixed.sql` 사용 (profiles 정책 제외)

---

### 2. ❌ Storage RLS 권한 오류
```
ERROR: 42501: must be owner of relation objects
```

**원인**: SQL Editor에서는 Storage RLS를 직접 생성할 수 없음

**해결**: Supabase Dashboard UI에서 수동으로 설정

---

## ✅ 올바른 마이그레이션 순서

### Step 1: SQL Editor에서 실행 (순서대로)

#### 1️⃣ KP Players 테이블
```sql
-- 파일: 20250112000002_create_kp_players.sql
-- 전체 복사 & 붙여넣기 → RUN
```

#### 2️⃣ Hands 테이블
```sql
-- 파일: 20250112000003_create_hands.sql
-- 전체 복사 & 붙여넣기 → RUN
```

#### 3️⃣ Hand Streets 테이블
```sql
-- 파일: 20250112000004_create_hand_streets.sql
-- 전체 복사 & 붙여넣기 → RUN
```

#### 4️⃣ RLS 정책 (수정된 버전)
```sql
-- 파일: 20250112000005_create_rls_policies_fixed.sql
-- 전체 복사 & 붙여넣기 → RUN
```

#### 5️⃣ Supabase Functions
```sql
-- 파일: 20250112000006_create_functions.sql
-- 전체 복사 & 붙여넣기 → RUN
```

#### 6️⃣ Seed 데이터 (선택사항)
```sql
-- 파일: seed.sql
-- 전체 복사 & 붙여넣기 → RUN
```

---

### Step 2: Storage Bucket 생성 (Dashboard UI)

SQL Editor가 아닌 **Dashboard UI**에서 수동으로 설정합니다.

#### A. Bucket 생성
1. Supabase Dashboard → **Storage** 클릭
2. **New bucket** 버튼 클릭
3. 설정:
   - **Name**: `kp-photos`
   - **Public bucket**: ✅ 체크
   - **File size limit**: `5 MB`
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
4. **Create bucket** 클릭

#### B. RLS 정책 설정
1. `kp-photos` 버킷 클릭
2. **Policies** 탭 클릭
3. **New policy** 버튼 클릭

**정책 1: 조회 권한**
- Policy name: `Authenticated users can view kp photos`
- Allowed operation: `SELECT`
- Policy definition:
  ```sql
  (bucket_id = 'kp-photos'::text) AND (auth.uid() IS NOT NULL)
  ```

**정책 2: 업로드 권한**
- Policy name: `Loggers can upload kp photos`
- Allowed operation: `INSERT`
- Policy definition:
  ```sql
  (bucket_id = 'kp-photos'::text) AND
  (auth.uid() IS NOT NULL) AND
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('logger', 'producer')
  ))
  ```

**정책 3: 업데이트 권한**
- Policy name: `Loggers can update kp photos`
- Allowed operation: `UPDATE`
- Policy definition:
  ```sql
  (bucket_id = 'kp-photos'::text) AND
  (auth.uid() IS NOT NULL) AND
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role IN ('logger', 'producer')
  ))
  ```

**정책 4: 삭제 권한**
- Policy name: `Producers can delete kp photos`
- Allowed operation: `DELETE`
- Policy definition:
  ```sql
  (bucket_id = 'kp-photos'::text) AND
  (EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'producer'
  ))
  ```

---

## 🧪 마이그레이션 확인

### SQL Editor에서 실행:

```sql
-- 1. 테이블 목록 확인
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 예상 결과:
-- hand_streets
-- hands
-- kp_players
-- profiles

-- 2. KP 플레이어 확인 (Seed 실행 후)
SELECT player_name, table_no, seat_no, chip_count
FROM kp_players
ORDER BY player_name;

-- 예상 결과: 10명의 샘플 KP (Phil Ivey, Daniel Negreanu 등)

-- 3. RLS 정책 확인
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 예상 결과:
-- hand_streets: 3개
-- hands: 4개
-- kp_players: 3개
-- profiles: 3개

-- 4. Functions 확인
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 예상 결과:
-- claim_kp
-- create_hand_with_streets
-- force_unclaim_kp
-- generate_hand_number
-- get_hands_sparse
-- get_kp_list_sparse
-- handle_new_user
-- increment_version
-- init_app
-- set_street_order
-- unclaim_kp
-- update_kp_chip
-- update_updated_at_column

-- 5. Storage Bucket 확인
SELECT id, name, public, file_size_limit / 1024 / 1024 as size_limit_mb
FROM storage.buckets;

-- 예상 결과:
-- kp-photos, true, 5
```

---

## ✅ 마이그레이션 완료 체크리스트

- [ ] `kp_players` 테이블 생성 완료
- [ ] `hands` 테이블 생성 완료
- [ ] `hand_streets` 테이블 생성 완료
- [ ] RLS 정책: `kp_players` 3개
- [ ] RLS 정책: `hands` 4개
- [ ] RLS 정책: `hand_streets` 3개
- [ ] Supabase Functions 7개 생성 완료
- [ ] Storage Bucket `kp-photos` 생성 완료
- [ ] Storage RLS 정책 4개 생성 완료
- [ ] Seed 데이터 10명 KP 플레이어 확인

---

## 🎯 다음 단계

마이그레이션 완료 후:

### 1. TypeScript 타입 생성
```bash
# Supabase CLI 사용
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > vtc-app/src/shared/types/database.types.ts

# 또는 Dashboard에서 복사
# Settings → API → Generate Types (TypeScript)
```

### 2. React 앱에서 테스트
```typescript
// vtc-app/src/shared/utils/supabase.ts
import { supabase } from '@/shared/utils/supabase';

// KP 목록 조회 테스트
const { data, error } = await supabase.rpc('get_kp_list_sparse');
console.log('KP List:', data);

// 예상 결과: 10명의 KP 플레이어 JSON 배열
```

### 3. Week 1 Day 5-7 시작: KP Dashboard 개발
- `useKPList` hook 구현
- `KPDashboard` 컴포넌트 구현
- `KPCard` 컴포넌트 구현
- Claim/Unclaim 기능 구현

---

**마이그레이션 성공!** 🎉

이제 데이터베이스가 준비되었고, KP Dashboard 개발을 시작할 수 있습니다.
