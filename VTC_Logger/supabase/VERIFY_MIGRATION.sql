-- ========================================
-- 마이그레이션 확인 쿼리
-- ========================================
-- Supabase Dashboard → SQL Editor에서 실행

-- ========================================
-- 1. 테이블 목록 확인
-- ========================================
SELECT
  table_name,
  (SELECT COUNT(*)
   FROM information_schema.columns
   WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 예상 결과:
-- hand_streets    (7 columns)
-- hands           (12 columns)
-- kp_players      (11 columns)
-- profiles        (7 columns)

-- ========================================
-- 2. KP 플레이어 확인 (Seed 데이터)
-- ========================================
SELECT
  player_name,
  table_no,
  seat_no,
  chip_count,
  current_logger_id,
  claimed_at
FROM kp_players
ORDER BY player_name;

-- 예상 결과: 10명의 샘플 KP
-- Bryn Kenney, Daniel Negreanu, Fedor Holz, Jason Koon, Justin Bonomo,
-- Liv Boeree, Maria Ho, Phil Ivey, Tom Dwan, Vanessa Selbst

-- ========================================
-- 3. RLS 정책 확인
-- ========================================
SELECT
  tablename,
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 예상 결과:
-- hand_streets: 3개 정책
-- hands: 4개 정책
-- kp_players: 3개 정책
-- profiles: 3개 정책

-- ========================================
-- 4. RLS 정책 개수 요약
-- ========================================
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 예상 결과:
-- hand_streets: 3
-- hands: 4
-- kp_players: 3
-- profiles: 3

-- ========================================
-- 5. Supabase Functions 확인
-- ========================================
SELECT
  routine_name,
  routine_type
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- 예상 결과 (13개 함수):
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

-- ========================================
-- 6. Functions 테스트: KP 목록 조회
-- ========================================
SELECT get_kp_list_sparse();

-- 예상 결과: 10명의 KP JSON 배열
-- [{"kp_id": "...", "player_name": "Bryn Kenney", ...}, ...]

-- ========================================
-- 7. Storage Buckets 확인
-- ========================================
SELECT
  id,
  name,
  public,
  file_size_limit / 1024 / 1024 as size_limit_mb,
  allowed_mime_types
FROM storage.buckets;

-- 예상 결과:
-- kp-photos, true, 5, {image/jpeg, image/png, image/webp}

-- ========================================
-- 8. Storage RLS 정책 확인
-- ========================================
SELECT
  policyname,
  cmd as operation
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

-- 예상 결과 (4개 정책):
-- Authenticated users can view kp photos (SELECT)
-- Loggers can upload kp photos (INSERT)
-- Loggers can update kp photos (UPDATE)
-- Producers can delete kp photos (DELETE)

-- ========================================
-- 9. 전체 마이그레이션 상태 요약
-- ========================================
SELECT
  'Tables' as category,
  COUNT(*)::text as count
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'

UNION ALL

SELECT
  'RLS Policies (public schema)',
  COUNT(*)::text
FROM pg_policies
WHERE schemaname = 'public'

UNION ALL

SELECT
  'Functions',
  COUNT(*)::text
FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_type = 'FUNCTION'

UNION ALL

SELECT
  'Storage Buckets',
  COUNT(*)::text
FROM storage.buckets

UNION ALL

SELECT
  'KP Players (Seed data)',
  COUNT(*)::text
FROM kp_players;

-- 예상 결과:
-- Tables: 4
-- RLS Policies: 13
-- Functions: 13
-- Storage Buckets: 1
-- KP Players: 10

-- ========================================
-- ✅ 마이그레이션 완료 확인
-- ========================================
-- 위의 모든 쿼리가 예상 결과와 일치하면 마이그레이션 성공!
