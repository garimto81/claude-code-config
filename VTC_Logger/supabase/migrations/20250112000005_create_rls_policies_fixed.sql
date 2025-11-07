-- ========================================
-- RLS (Row-Level Security) 정책 설정 (수정됨)
-- ========================================
-- 주의: profiles 테이블의 정책은 이미 존재하므로 건너뜁니다.

-- RLS 활성화
-- profiles는 이미 활성화되어 있으므로 건너뜀
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_streets ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Profiles 정책 (이미 존재하므로 주석 처리)
-- ========================================
-- 주의: 이미 20250112000001_create_profiles.sql에서 생성되었습니다.
-- 다시 실행하면 중복 오류가 발생합니다.

-- ========================================
-- KP Players 정책
-- ========================================

-- 모든 인증된 사용자는 KP 목록 조회 가능
CREATE POLICY "All users can view KP players"
  ON kp_players FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Logger/Producer는 KP Claim 가능
CREATE POLICY "Loggers can claim KP"
  ON kp_players FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer')
    )
  );

-- Producer는 KP 생성/삭제 가능
CREATE POLICY "Producers can manage KP"
  ON kp_players FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- ========================================
-- Hands 정책
-- ========================================

-- 모든 인증된 사용자는 핸드 조회 가능
CREATE POLICY "All users can view hands"
  ON hands FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Logger는 자신이 기록한 핸드 생성 가능
CREATE POLICY "Loggers can create hands"
  ON hands FOR INSERT
  WITH CHECK (
    logger_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer')
    )
  );

-- Logger는 자신이 기록한 핸드 수정 가능
CREATE POLICY "Loggers can update own hands"
  ON hands FOR UPDATE
  USING (logger_id = auth.uid());

-- Producer는 모든 핸드 수정/삭제 가능
CREATE POLICY "Producers can manage all hands"
  ON hands FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- ========================================
-- Hand Streets 정책
-- ========================================

-- 모든 인증된 사용자는 스트리트 조회 가능
CREATE POLICY "All users can view streets"
  ON hand_streets FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Logger는 자신의 핸드에 스트리트 생성 가능
CREATE POLICY "Loggers can create streets for own hands"
  ON hand_streets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hands
      WHERE hand_id = hand_streets.hand_id AND logger_id = auth.uid()
    )
  );

-- Logger는 자신의 핸드 스트리트 수정 가능
CREATE POLICY "Loggers can update streets for own hands"
  ON hand_streets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM hands
      WHERE hand_id = hand_streets.hand_id AND logger_id = auth.uid()
    )
  );

-- Producer는 모든 스트리트 관리 가능
CREATE POLICY "Producers can manage all streets"
  ON hand_streets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- ========================================
-- 코멘트
-- ========================================

COMMENT ON POLICY "All users can view KP players" ON kp_players IS '인증된 모든 사용자는 KP 목록 조회 가능';
COMMENT ON POLICY "Loggers can claim KP" ON kp_players IS 'Logger와 Producer는 KP를 Claim/Unclaim 가능';
COMMENT ON POLICY "Producers can manage KP" ON kp_players IS 'Producer는 KP 생성/삭제 가능';
COMMENT ON POLICY "All users can view hands" ON hands IS '인증된 모든 사용자는 핸드 조회 가능';
COMMENT ON POLICY "Loggers can create hands" ON hands IS 'Logger는 핸드 생성 가능';
COMMENT ON POLICY "Loggers can update own hands" ON hands IS 'Logger는 자신이 작성한 핸드만 수정 가능';
COMMENT ON POLICY "Producers can manage all hands" ON hands IS 'Producer는 모든 핸드 관리 가능';
