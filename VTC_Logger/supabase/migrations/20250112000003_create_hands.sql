-- 핸드 기록 테이블
CREATE TABLE hands (
  hand_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_number TEXT NOT NULL UNIQUE, -- HAND-001, HAND-002, ...

  -- 관계
  kp_id UUID NOT NULL REFERENCES kp_players(kp_id) ON DELETE CASCADE,
  logger_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,

  -- 핸드 정보
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  table_no INT NOT NULL,

  -- 상대 플레이어 (JSONB)
  opponents JSONB DEFAULT '[]'::JSONB,
  -- 예: [{"name": "Alice", "seat": 3}, {"name": "Bob", "seat": 7}]

  -- 결과
  result TEXT CHECK (result IN ('win', 'lose', 'unknown')),
  notes TEXT,

  -- 중복 방지 (Idempotency)
  client_uuid UUID,

  -- 메타데이터
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('pending', 'synced', 'error')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT valid_time_range CHECK (ended_at IS NULL OR ended_at >= started_at)
);

-- 인덱스
CREATE INDEX idx_hands_kp ON hands(kp_id);
CREATE INDEX idx_hands_logger ON hands(logger_id);
CREATE INDEX idx_hands_started_at ON hands(started_at DESC);
CREATE INDEX idx_hands_sync_status ON hands(sync_status) WHERE sync_status != 'synced';
CREATE UNIQUE INDEX idx_hands_idempotency ON hands(client_uuid, started_at) WHERE client_uuid IS NOT NULL;

-- Auto Hand Number (시퀀스 기반)
CREATE SEQUENCE hand_number_seq START 1;

CREATE OR REPLACE FUNCTION generate_hand_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.hand_number IS NULL THEN
    NEW.hand_number = 'HAND-' || LPAD(nextval('hand_number_seq')::TEXT, 3, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_hand_number
  BEFORE INSERT ON hands
  FOR EACH ROW
  EXECUTE FUNCTION generate_hand_number();

-- Updated_at 트리거
CREATE TRIGGER update_hands_updated_at
  BEFORE UPDATE ON hands
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 코멘트
COMMENT ON TABLE hands IS '핸드 기록 - KP의 개별 핸드 정보';
COMMENT ON COLUMN hands.hand_number IS '자동 생성되는 핸드 번호 (HAND-001, HAND-002, ...)';
COMMENT ON COLUMN hands.started_at IS '핸드 시작 시간 (타임스탬프 매칭의 핵심)';
COMMENT ON COLUMN hands.opponents IS '상대 플레이어 목록 (JSONB 배열)';
COMMENT ON COLUMN hands.client_uuid IS '클라이언트에서 생성한 UUID (오프라인 중복 방지)';
COMMENT ON COLUMN hands.sync_status IS '동기화 상태 (pending: 오프라인 큐, synced: 완료, error: 실패)';
