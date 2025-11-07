-- ========================================
-- Seed Data for VTC Story Ledger
-- ========================================
-- 주의: 이 파일은 개발/테스트용입니다.
-- 프로덕션 환경에서는 실행하지 마세요!

-- ========================================
-- 샘플 KP 플레이어
-- ========================================
-- 유명 포커 프로 플레이어를 샘플 데이터로 사용
INSERT INTO kp_players (player_name, table_no, seat_no, chip_count)
VALUES
  ('Phil Ivey', 1, 3, 1500000),
  ('Daniel Negreanu', 2, 5, 2300000),
  ('Vanessa Selbst', 1, 7, 1800000),
  ('Tom Dwan', 3, 2, 900000),
  ('Fedor Holz', 2, 8, 3100000),
  ('Liv Boeree', 4, 4, 1200000),
  ('Jason Koon', 3, 6, 2500000),
  ('Maria Ho', 4, 2, 1600000),
  ('Justin Bonomo', 1, 1, 2800000),
  ('Bryn Kenney', 2, 3, 2100000)
ON CONFLICT (player_name) DO NOTHING;

-- ========================================
-- 테스트 핸드 데이터
-- ========================================
-- 주의: 실제 프로덕션에서는 사용하지 않습니다.
-- Logger가 로그인한 후 수동으로 핸드를 생성해야 합니다.

-- 예시: Phil Ivey의 샘플 핸드 (실제 환경에서는 삭제하세요)
DO $$
DECLARE
  phil_ivey_id UUID;
  sample_hand_id UUID;
BEGIN
  -- Phil Ivey ID 조회
  SELECT kp_id INTO phil_ivey_id FROM kp_players WHERE player_name = 'Phil Ivey';

  -- 샘플 핸드가 있는지 확인 (이미 있으면 건너뛰기)
  IF NOT EXISTS (
    SELECT 1 FROM hands WHERE kp_id = phil_ivey_id LIMIT 1
  ) THEN
    -- 주의: logger_id는 실제 로거의 UUID를 사용해야 합니다.
    -- 여기서는 테스트용으로 임시 UUID를 생성합니다.
    -- 실제 환경에서는 이 부분을 주석 처리하거나 삭제하세요.

    -- 샘플 핸드 생성 (실제 환경에서는 주석 처리)
    -- INSERT INTO hands (
    --   kp_id,
    --   logger_id,
    --   started_at,
    --   table_no,
    --   opponents,
    --   result,
    --   notes
    -- )
    -- VALUES (
    --   phil_ivey_id,
    --   (SELECT id FROM profiles WHERE role = 'logger' LIMIT 1),
    --   NOW() - INTERVAL '2 hours',
    --   1,
    --   '[{"name": "Alice", "seat": 5}, {"name": "Bob", "seat": 9}]'::JSONB,
    --   'win',
    --   'Sample hand for testing'
    -- )
    -- RETURNING hand_id INTO sample_hand_id;

    -- 샘플 스트리트 생성 (실제 환경에서는 주석 처리)
    -- IF sample_hand_id IS NOT NULL THEN
    --   INSERT INTO hand_streets (hand_id, street, pot_before, pot_after, kp_action, board)
    --   VALUES
    --     (sample_hand_id, 'Preflop', 0, 150, 'Raise 150', '[]'::JSONB),
    --     (sample_hand_id, 'Flop', 150, 500, 'Bet 350', '["Ah", "Kd", "Qs"]'::JSONB),
    --     (sample_hand_id, 'Turn', 500, 1200, 'Bet 700', '["Ah", "Kd", "Qs", "Jc"]'::JSONB),
    --     (sample_hand_id, 'River', 1200, 3500, 'All-in', '["Ah", "Kd", "Qs", "Jc", "10h"]'::JSONB);
    -- END IF;

    RAISE NOTICE 'Seed data created successfully';
  ELSE
    RAISE NOTICE 'Sample hands already exist, skipping';
  END IF;
END $$;

-- ========================================
-- 데이터 확인 쿼리
-- ========================================
-- 다음 쿼리로 Seed 데이터를 확인할 수 있습니다:
-- SELECT * FROM kp_players ORDER BY player_name;
-- SELECT * FROM hands ORDER BY started_at DESC;
-- SELECT * FROM hand_streets ORDER BY created_at DESC;
