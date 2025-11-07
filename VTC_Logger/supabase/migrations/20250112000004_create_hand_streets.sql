-- 핸드 스트리트 테이블 (자동 확장)
CREATE TABLE hand_streets (
  street_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hand_id UUID NOT NULL REFERENCES hands(hand_id) ON DELETE CASCADE,

  -- 스트리트 정보
  street TEXT NOT NULL CHECK (street IN ('Preflop', 'Flop', 'Turn', 'River')),
  street_order INT NOT NULL CHECK (street_order BETWEEN 1 AND 4),

  -- 팟 정보 (칩 카운트)
  pot_before BIGINT NOT NULL,
  pot_after BIGINT NOT NULL,

  -- KP 액션
  kp_action TEXT, -- "Raise 500", "Call", "Fold", etc.

  -- 보드 (Flop/Turn/River만)
  board JSONB DEFAULT '[]'::JSONB,
  -- 예: ["Ah", "Kd", "Qs"] (Flop), ["Ah", "Kd", "Qs", "Jc"] (Turn)

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT valid_pot_range CHECK (pot_after >= pot_before),
  CONSTRAINT unique_street_per_hand UNIQUE (hand_id, street)
);

-- 인덱스
CREATE INDEX idx_hand_streets_hand ON hand_streets(hand_id);
CREATE INDEX idx_hand_streets_order ON hand_streets(hand_id, street_order);

-- Street Order 자동 설정
CREATE OR REPLACE FUNCTION set_street_order()
RETURNS TRIGGER AS $$
BEGIN
  NEW.street_order = CASE NEW.street
    WHEN 'Preflop' THEN 1
    WHEN 'Flop' THEN 2
    WHEN 'Turn' THEN 3
    WHEN 'River' THEN 4
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_street_order
  BEFORE INSERT ON hand_streets
  FOR EACH ROW
  EXECUTE FUNCTION set_street_order();

-- 코멘트
COMMENT ON TABLE hand_streets IS '핸드 스트리트 기록 - 각 핸드의 Preflop/Flop/Turn/River 정보';
COMMENT ON COLUMN hand_streets.street IS '스트리트 타입 (Preflop, Flop, Turn, River)';
COMMENT ON COLUMN hand_streets.street_order IS '스트리트 순서 (자동 설정: Preflop=1, Flop=2, Turn=3, River=4)';
COMMENT ON COLUMN hand_streets.pot_before IS '이 스트리트 시작 시 팟 크기';
COMMENT ON COLUMN hand_streets.pot_after IS '이 스트리트 종료 후 팟 크기';
COMMENT ON COLUMN hand_streets.kp_action IS 'KP의 액션 (Raise 500, Call, Fold, All-in 등)';
COMMENT ON COLUMN hand_streets.board IS '보드 카드 (JSONB 배열, Flop 이후만 사용)';
COMMENT ON CONSTRAINT unique_street_per_hand ON hand_streets IS '한 핸드에서 같은 스트리트는 한 번만 기록 가능';
