-- KP 플레이어 테이블 (Primary Entity)
CREATE TABLE kp_players (
  kp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL UNIQUE,
  current_logger_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,

  -- 테이블 정보 (KP의 속성)
  table_no INT,
  seat_no INT CHECK (seat_no BETWEEN 1 AND 9),

  -- 칩 정보
  chip_count BIGINT,
  last_chip_update_at TIMESTAMPTZ,

  -- 사진
  photo_url TEXT,

  -- Optimistic Locking
  version INT DEFAULT 1,

  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- 제약조건
  CONSTRAINT valid_table_seat UNIQUE NULLS NOT DISTINCT (table_no, seat_no),
  CONSTRAINT claimed_consistency CHECK (
    (current_logger_id IS NULL AND claimed_at IS NULL) OR
    (current_logger_id IS NOT NULL AND claimed_at IS NOT NULL)
  )
);

-- 인덱스
CREATE INDEX idx_kp_players_logger ON kp_players(current_logger_id) WHERE current_logger_id IS NOT NULL;
CREATE INDEX idx_kp_players_table ON kp_players(table_no) WHERE table_no IS NOT NULL;
CREATE INDEX idx_kp_players_name ON kp_players(player_name);
CREATE INDEX idx_kp_players_claimed_at ON kp_players(claimed_at) WHERE claimed_at IS NOT NULL;

-- Updated_at 트리거 (update_updated_at_column 함수는 이미 profiles에서 생성됨)
CREATE TRIGGER update_kp_players_updated_at
  BEFORE UPDATE ON kp_players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Version 자동 증가 트리거
CREATE OR REPLACE FUNCTION increment_version()
RETURNS TRIGGER AS $$
BEGIN
  NEW.version = OLD.version + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_kp_players_version
  BEFORE UPDATE ON kp_players
  FOR EACH ROW
  EXECUTE FUNCTION increment_version();

-- 코멘트
COMMENT ON TABLE kp_players IS 'Key Player 정보 - VTC Story Ledger의 핵심 엔티티';
COMMENT ON COLUMN kp_players.current_logger_id IS '현재 이 KP를 담당하는 Logger (Claim 상태)';
COMMENT ON COLUMN kp_players.claimed_at IS 'KP가 Claim된 시간';
COMMENT ON COLUMN kp_players.version IS 'Optimistic Locking을 위한 버전 (동시성 제어)';
COMMENT ON CONSTRAINT valid_table_seat ON kp_players IS '같은 테이블의 같은 좌석에 두 명이 앉을 수 없음';
COMMENT ON CONSTRAINT claimed_consistency ON kp_players IS 'current_logger_id와 claimed_at는 함께 NULL이거나 함께 NOT NULL이어야 함';
