# VTC Story Ledger - MVP Design Document
**버전**: 1.0.0 | **작성일**: 2025-01-12 | **기반**: PRD v3.2 FINAL

---

## 📋 목차
1. [Supabase 데이터베이스 설계](#1-supabase-데이터베이스-설계)
2. [React 컴포넌트 아키텍처](#2-react-컴포넌트-아키텍처)
3. [PWA 구성 및 오프라인 전략](#3-pwa-구성-및-오프라인-전략)
4. [성능 최적화 구현 계획](#4-성능-최적화-구현-계획)
5. [개발 로드맵](#5-개발-로드맵)

---

## 1. Supabase 데이터베이스 설계

### 1.1 마이그레이션 파일 구조

```
supabase/
├── migrations/
│   ├── 20250112000001_create_profiles.sql
│   ├── 20250112000002_create_kp_players.sql
│   ├── 20250112000003_create_hands.sql
│   ├── 20250112000004_create_hand_streets.sql
│   ├── 20250112000005_create_rls_policies.sql
│   ├── 20250112000006_create_functions.sql
│   └── 20250112000007_create_storage_buckets.sql
└── seed.sql
```

### 1.2 Core Tables

#### `20250112000001_create_profiles.sql`
```sql
-- 사용자 프로필 (Supabase Auth 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('logger', 'camera_supervisor', 'producer')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- Updated_at 자동 업데이트 트리거
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

-- Auth 사용자 생성 시 자동으로 profile 생성
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
```

#### `20250112000002_create_kp_players.sql`
```sql
-- KP 플레이어 (Primary Entity)
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

-- Updated_at 트리거
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
```

#### `20250112000003_create_hands.sql`
```sql
-- 핸드 기록
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
CREATE UNIQUE INDEX idx_hands_idempotency ON hands(client_uuid, started_at);

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
```

#### `20250112000004_create_hand_streets.sql`
```sql
-- 핸드 스트리트 (자동 확장)
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
```

### 1.3 RLS (Row-Level Security) 정책

#### `20250112000005_create_rls_policies.sql`
```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE kp_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE hand_streets ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Profiles 정책
-- ========================================

-- 모든 인증된 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Producer는 모든 프로필 조회 가능
CREATE POLICY "Producers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- 사용자는 자신의 프로필 업데이트 가능 (role 제외)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

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

-- Logger는 자신이 기록한 핸드 생성/수정 가능
CREATE POLICY "Loggers can create hands"
  ON hands FOR INSERT
  WITH CHECK (
    logger_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer')
    )
  );

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

-- Logger는 자신의 핸드에 스트리트 생성/수정 가능
CREATE POLICY "Loggers can create streets for own hands"
  ON hand_streets FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM hands
      WHERE hand_id = hand_streets.hand_id AND logger_id = auth.uid()
    )
  );

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
```

### 1.4 Supabase Functions (RPC)

#### `20250112000006_create_functions.sql`
```sql
-- ========================================
-- 1. 초기 앱 데이터 로드 (Batched API)
-- ========================================
CREATE OR REPLACE FUNCTION init_app(user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'profile', (SELECT row_to_json(p.*) FROM profiles p WHERE p.id = user_id),
    'kp_list', (
      SELECT COALESCE(json_agg(row_to_json(kp.*) ORDER BY kp.player_name), '[]'::json)
      FROM kp_players kp
    ),
    'my_claimed_kp', (
      SELECT COALESCE(json_agg(row_to_json(kp.*)), '[]'::json)
      FROM kp_players kp
      WHERE kp.current_logger_id = user_id
    ),
    'recent_hands', (
      SELECT COALESCE(json_agg(row_to_json(h.*) ORDER BY h.started_at DESC), '[]'::json)
      FROM (
        SELECT * FROM hands
        WHERE logger_id = user_id
        ORDER BY started_at DESC
        LIMIT 10
      ) h
    )
  ) INTO result;

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 2. KP Claim (Optimistic Locking)
-- ========================================
CREATE OR REPLACE FUNCTION claim_kp(
  p_kp_id UUID,
  p_logger_id UUID,
  p_expected_version INT
)
RETURNS JSON AS $$
DECLARE
  current_version INT;
  updated_kp JSON;
BEGIN
  -- 현재 버전 확인
  SELECT version INTO current_version
  FROM kp_players
  WHERE kp_id = p_kp_id
  FOR UPDATE NOWAIT;

  -- 버전 불일치 (충돌)
  IF current_version != p_expected_version THEN
    RETURN json_build_object(
      'success', false,
      'error', 'VERSION_CONFLICT',
      'current_version', current_version
    );
  END IF;

  -- 이미 다른 Logger가 Claim한 경우
  IF EXISTS (
    SELECT 1 FROM kp_players
    WHERE kp_id = p_kp_id AND current_logger_id IS NOT NULL AND current_logger_id != p_logger_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREADY_CLAIMED'
    );
  END IF;

  -- Claim 실행
  UPDATE kp_players
  SET
    current_logger_id = p_logger_id,
    claimed_at = NOW()
  WHERE kp_id = p_kp_id
  RETURNING row_to_json(kp_players.*) INTO updated_kp;

  RETURN json_build_object(
    'success', true,
    'kp', updated_kp
  );

EXCEPTION
  WHEN lock_not_available THEN
    RETURN json_build_object(
      'success', false,
      'error', 'LOCK_TIMEOUT'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 3. KP Unclaim
-- ========================================
CREATE OR REPLACE FUNCTION unclaim_kp(
  p_kp_id UUID,
  p_logger_id UUID
)
RETURNS JSON AS $$
DECLARE
  updated_kp JSON;
BEGIN
  -- 본인이 Claim한 KP만 Unclaim 가능
  IF NOT EXISTS (
    SELECT 1 FROM kp_players
    WHERE kp_id = p_kp_id AND current_logger_id = p_logger_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NOT_CLAIMED_BY_YOU'
    );
  END IF;

  UPDATE kp_players
  SET
    current_logger_id = NULL,
    claimed_at = NULL
  WHERE kp_id = p_kp_id
  RETURNING row_to_json(kp_players.*) INTO updated_kp;

  RETURN json_build_object(
    'success', true,
    'kp', updated_kp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 4. 핸드 생성 (with Streets)
-- ========================================
CREATE OR REPLACE FUNCTION create_hand_with_streets(
  p_hand JSON,
  p_streets JSON
)
RETURNS JSON AS $$
DECLARE
  new_hand_id UUID;
  result JSON;
BEGIN
  -- 핸드 생성
  INSERT INTO hands (
    kp_id,
    logger_id,
    started_at,
    table_no,
    opponents,
    result,
    notes,
    client_uuid
  )
  VALUES (
    (p_hand->>'kp_id')::UUID,
    (p_hand->>'logger_id')::UUID,
    (p_hand->>'started_at')::TIMESTAMPTZ,
    (p_hand->>'table_no')::INT,
    (p_hand->'opponents')::JSONB,
    p_hand->>'result',
    p_hand->>'notes',
    (p_hand->>'client_uuid')::UUID
  )
  RETURNING hand_id INTO new_hand_id;

  -- 스트리트 생성
  IF p_streets IS NOT NULL AND json_array_length(p_streets) > 0 THEN
    INSERT INTO hand_streets (hand_id, street, pot_before, pot_after, kp_action, board)
    SELECT
      new_hand_id,
      s->>'street',
      (s->>'pot_before')::BIGINT,
      (s->>'pot_after')::BIGINT,
      s->>'kp_action',
      (s->'board')::JSONB
    FROM json_array_elements(p_streets) AS s;
  END IF;

  -- 결과 조회
  SELECT json_build_object(
    'success', true,
    'hand', (
      SELECT row_to_json(h.*)
      FROM hands h
      WHERE h.hand_id = new_hand_id
    ),
    'streets', (
      SELECT COALESCE(json_agg(row_to_json(s.*) ORDER BY s.street_order), '[]'::json)
      FROM hand_streets s
      WHERE s.hand_id = new_hand_id
    )
  ) INTO result;

  RETURN result;

EXCEPTION
  WHEN unique_violation THEN
    -- Idempotency: 동일한 client_uuid + started_at 조합 발견
    SELECT json_build_object(
      'success', true,
      'duplicate', true,
      'hand', (
        SELECT row_to_json(h.*)
        FROM hands h
        WHERE h.client_uuid = (p_hand->>'client_uuid')::UUID
          AND h.started_at = (p_hand->>'started_at')::TIMESTAMPTZ
      )
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 5. KP 칩 업데이트
-- ========================================
CREATE OR REPLACE FUNCTION update_kp_chip(
  p_kp_id UUID,
  p_chip_count BIGINT,
  p_logger_id UUID
)
RETURNS JSON AS $$
DECLARE
  updated_kp JSON;
BEGIN
  -- 본인이 Claim한 KP만 칩 업데이트 가능
  IF NOT EXISTS (
    SELECT 1 FROM kp_players
    WHERE kp_id = p_kp_id AND current_logger_id = p_logger_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'NOT_CLAIMED_BY_YOU'
    );
  END IF;

  UPDATE kp_players
  SET
    chip_count = p_chip_count,
    last_chip_update_at = NOW()
  WHERE kp_id = p_kp_id
  RETURNING row_to_json(kp_players.*) INTO updated_kp;

  RETURN json_build_object(
    'success', true,
    'kp', updated_kp
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- 6. Sparse Column Reads (성능 최적화)
-- ========================================
CREATE OR REPLACE FUNCTION get_kp_list_sparse()
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      json_agg(
        json_build_object(
          'kp_id', kp_id,
          'player_name', player_name,
          'current_logger_id', current_logger_id,
          'table_no', table_no,
          'seat_no', seat_no,
          'chip_count', chip_count,
          'photo_url', photo_url,
          'version', version
        ) ORDER BY player_name
      ),
      '[]'::json
    )
    FROM kp_players
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_hands_sparse(p_logger_id UUID, p_limit INT DEFAULT 10)
RETURNS JSON AS $$
BEGIN
  RETURN (
    SELECT COALESCE(
      json_agg(
        json_build_object(
          'hand_id', hand_id,
          'hand_number', hand_number,
          'kp_id', kp_id,
          'started_at', started_at,
          'table_no', table_no,
          'result', result,
          'sync_status', sync_status
        ) ORDER BY started_at DESC
      ),
      '[]'::json
    )
    FROM (
      SELECT * FROM hands
      WHERE logger_id = p_logger_id
      ORDER BY started_at DESC
      LIMIT p_limit
    ) h
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 1.5 Storage Buckets

#### `20250112000007_create_storage_buckets.sql`
```sql
-- KP 사진 버킷 생성
INSERT INTO storage.buckets (id, name, public)
VALUES ('kp-photos', 'kp-photos', true);

-- RLS 정책: 모든 인증된 사용자는 사진 조회 가능
CREATE POLICY "Public kp photos are accessible to all users"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kp-photos' AND auth.uid() IS NOT NULL);

-- RLS 정책: Logger/Producer는 사진 업로드 가능
CREATE POLICY "Loggers can upload kp photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kp-photos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer')
    )
  );

-- RLS 정책: Producer는 사진 삭제 가능
CREATE POLICY "Producers can delete kp photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'kp-photos' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );
```

### 1.6 Seed Data

#### `seed.sql`
```sql
-- ========================================
-- 테스트 사용자 생성
-- ========================================
-- (실제로는 Supabase Dashboard에서 Auth Users를 수동으로 생성하거나
--  API를 통해 생성해야 함. 여기서는 프로필만 삽입 가정)

-- Producer
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  gen_random_uuid(),
  'producer@vtc.com',
  'producer',
  'VTC Producer'
);

-- Logger 1
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  gen_random_uuid(),
  'logger1@vtc.com',
  'logger',
  'Logger Alice'
);

-- Logger 2
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  gen_random_uuid(),
  'logger2@vtc.com',
  'logger',
  'Logger Bob'
);

-- Camera Supervisor
INSERT INTO profiles (id, email, role, display_name)
VALUES (
  gen_random_uuid(),
  'camera@vtc.com',
  'camera_supervisor',
  'Camera Supervisor'
);

-- ========================================
-- 샘플 KP 플레이어
-- ========================================
INSERT INTO kp_players (player_name, table_no, seat_no, chip_count)
VALUES
  ('Phil Ivey', 1, 3, 1500000),
  ('Daniel Negreanu', 2, 5, 2300000),
  ('Vanessa Selbst', 1, 7, 1800000),
  ('Tom Dwan', 3, 2, 900000),
  ('Fedor Holz', 2, 8, 3100000);

-- ========================================
-- 샘플 핸드 (Logger 1이 Phil Ivey 기록)
-- ========================================
DO $$
DECLARE
  logger1_id UUID;
  phil_ivey_id UUID;
  hand1_id UUID;
BEGIN
  -- Logger 1 ID
  SELECT id INTO logger1_id FROM profiles WHERE email = 'logger1@vtc.com';

  -- Phil Ivey ID
  SELECT kp_id INTO phil_ivey_id FROM kp_players WHERE player_name = 'Phil Ivey';

  -- 핸드 생성
  INSERT INTO hands (kp_id, logger_id, started_at, table_no, opponents, result)
  VALUES (
    phil_ivey_id,
    logger1_id,
    NOW() - INTERVAL '2 hours',
    1,
    '[{"name": "Alice", "seat": 5}, {"name": "Bob", "seat": 9}]'::JSONB,
    'win'
  )
  RETURNING hand_id INTO hand1_id;

  -- 스트리트 생성
  INSERT INTO hand_streets (hand_id, street, pot_before, pot_after, kp_action, board)
  VALUES
    (hand1_id, 'Preflop', 0, 150, 'Raise 150', '[]'::JSONB),
    (hand1_id, 'Flop', 150, 500, 'Bet 350', '["Ah", "Kd", "Qs"]'::JSONB),
    (hand1_id, 'Turn', 500, 1200, 'Bet 700', '["Ah", "Kd", "Qs", "Jc"]'::JSONB),
    (hand1_id, 'River', 1200, 3500, 'All-in', '["Ah", "Kd", "Qs", "Jc", "10h"]'::JSONB);
END $$;
```

---

## 2. React 컴포넌트 아키텍처

### 2.1 기술 스택

```json
{
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    "@supabase/supabase-js": "^2.39.0",
    "zustand": "^4.5.0",
    "dexie": "^3.2.5",
    "dexie-react-hooks": "^1.1.7",
    "@tanstack/react-query": "^5.17.0",
    "tailwindcss": "^3.4.1",
    "framer-motion": "^11.0.5",
    "date-fns": "^3.3.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "vite": "^5.0.11",
    "vite-plugin-pwa": "^0.17.4",
    "@vitejs/plugin-react": "^4.2.1",
    "vitest": "^1.2.1",
    "@testing-library/react": "^14.1.2"
  }
}
```

### 2.2 폴더 구조

```
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── layout/
│       ├── AppLayout.tsx
│       ├── Header.tsx
│       └── BottomNav.tsx
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   └── store/
│   │       └── authStore.ts
│   │
│   ├── kp-dashboard/
│   │   ├── components/
│   │   │   ├── KPDashboard.tsx (Screen 1)
│   │   │   ├── KPCard.tsx
│   │   │   ├── KPGridView.tsx
│   │   │   └── KPClaimModal.tsx
│   │   ├── hooks/
│   │   │   ├── useKPList.ts
│   │   │   └── useKPClaim.ts
│   │   └── store/
│   │       └── kpStore.ts
│   │
│   ├── hand-input/
│   │   ├── components/
│   │   │   ├── HandInput.tsx
│   │   │   ├── QuickLogMode.tsx (Screen 2)
│   │   │   ├── FullLogMode.tsx (Screen 3)
│   │   │   ├── StreetInput.tsx
│   │   │   ├── OpponentSelector.tsx
│   │   │   └── TimestampPicker.tsx
│   │   ├── hooks/
│   │   │   ├── useHandCreate.ts
│   │   │   └── useAutoExpand.ts
│   │   └── store/
│   │       └── handStore.ts
│   │
│   ├── admin-dashboard/
│   │   ├── components/
│   │   │   ├── AdminDashboard.tsx (Screen 4)
│   │   │   ├── RealTimeMap.tsx
│   │   │   ├── LoggerStatusPanel.tsx
│   │   │   └── HandLogTimeline.tsx
│   │   ├── hooks/
│   │   │   └── useRealtimeSubscription.ts
│   │   └── store/
│   │       └── adminStore.ts
│   │
│   └── photo-upload/
│       ├── components/
│       │   ├── PhotoUpload.tsx (Screen 5)
│       │   ├── CameraCapture.tsx
│       │   └── PhotoPreview.tsx
│       ├── hooks/
│       │   └── usePhotoUpload.ts
│       └── utils/
│           └── imageCompression.ts
│
├── shared/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── BottomSheet.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   └── Toast.tsx
│   │   └── common/
│   │       ├── ErrorBoundary.tsx
│   │       └── Suspense.tsx
│   │
│   ├── hooks/
│   │   ├── useHaptic.ts
│   │   ├── useOfflineQueue.ts
│   │   └── useNetworkStatus.ts
│   │
│   ├── utils/
│   │   ├── supabase.ts
│   │   ├── indexedDB.ts
│   │   ├── timestamp.ts
│   │   └── constants.ts
│   │
│   └── types/
│       ├── database.types.ts (Supabase CLI 자동 생성)
│       ├── models.ts
│       └── api.ts
│
└── main.tsx
```

### 2.3 핵심 컴포넌트 설계

#### `App.tsx`
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { AuthProvider } from '@/features/auth/components/AuthProvider';
import { OfflineQueueProvider } from '@/shared/hooks/useOfflineQueue';
import { ErrorBoundary } from '@/shared/components/common/ErrorBoundary';
import { Toaster } from '@/shared/components/ui/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      gcTime: 10 * 60 * 1000, // 10분 (구 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OfflineQueueProvider>
            <RouterProvider router={router} />
            <Toaster />
          </OfflineQueueProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
```

#### `router.tsx`
```tsx
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { KPDashboard } from '@/features/kp-dashboard/components/KPDashboard';
import { HandInput } from '@/features/hand-input/components/HandInput';
import { AdminDashboard } from '@/features/admin-dashboard/components/AdminDashboard';
import { PhotoUpload } from '@/features/photo-upload/components/PhotoUpload';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <KPDashboard />,
      },
      {
        path: 'hand-input/:kpId',
        element: <HandInput />,
      },
      {
        path: 'photo-upload/:kpId',
        element: <PhotoUpload />,
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requiredRole="producer">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
```

#### `KPDashboard.tsx` (Screen 1)
```tsx
import { useKPList } from '../hooks/useKPList';
import { useKPClaim } from '../hooks/useKPClaim';
import { KPCard } from './KPCard';
import { LoadingOverlay } from '@/shared/components/ui/LoadingOverlay';
import { useHaptic } from '@/shared/hooks/useHaptic';

export function KPDashboard() {
  const { data: kpList, isLoading } = useKPList();
  const { claimKP, unclaimKP } = useKPClaim();
  const { vibrate } = useHaptic();

  const handleClaim = async (kpId: string, version: number) => {
    vibrate('medium');
    await claimKP({ kpId, expectedVersion: version });
  };

  const handleUnclaim = async (kpId: string) => {
    vibrate('light');
    await unclaimKP({ kpId });
  };

  if (isLoading) {
    return <LoadingOverlay message="KP 목록 로딩 중..." />;
  }

  return (
    <div className="kp-dashboard">
      {/* 헤더 */}
      <header className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold text-white">KP Dashboard</h1>
        <p className="text-sm text-gray-400">
          {kpList?.filter(kp => kp.current_logger_id).length} / {kpList?.length} Claimed
        </p>
      </header>

      {/* KP 그리드 (1x) */}
      <div className="kp-grid p-4 space-y-3">
        {kpList?.map((kp) => (
          <KPCard
            key={kp.kp_id}
            kp={kp}
            onClaim={() => handleClaim(kp.kp_id, kp.version)}
            onUnclaim={() => handleUnclaim(kp.kp_id)}
          />
        ))}
      </div>
    </div>
  );
}
```

#### `KPCard.tsx`
```tsx
import { motion } from 'framer-motion';
import { KPPlayer } from '@/shared/types/models';
import { useAuthStore } from '@/features/auth/store/authStore';

interface KPCardProps {
  kp: KPPlayer;
  onClaim: () => void;
  onUnclaim: () => void;
}

export function KPCard({ kp, onClaim, onUnclaim }: KPCardProps) {
  const userId = useAuthStore((state) => state.user?.id);
  const isClaimed = !!kp.current_logger_id;
  const isClaimedByMe = kp.current_logger_id === userId;

  return (
    <motion.div
      className="kp-card bg-gray-800 rounded-lg p-4 border border-gray-700"
      whileTap={{ scale: 0.98 }}
    >
      {/* 상단: 사진 + 이름 + 칩 */}
      <div className="flex items-center gap-3 mb-3">
        <img
          src={kp.photo_url || '/default-avatar.png'}
          alt={kp.player_name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{kp.player_name}</h3>
          <p className="text-sm text-gray-400">
            Table {kp.table_no || '?'} • Seat {kp.seat_no || '?'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Chips</p>
          <p className="text-lg font-bold text-green-400">
            {kp.chip_count?.toLocaleString() || '0'}
          </p>
        </div>
      </div>

      {/* 하단: Claim 버튼 */}
      <div className="flex gap-2">
        {!isClaimed && (
          <button
            onClick={onClaim}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium"
          >
            Claim
          </button>
        )}
        {isClaimedByMe && (
          <>
            <button
              onClick={onUnclaim}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-md font-medium"
            >
              Unclaim
            </button>
            <button
              onClick={() => window.location.href = `/hand-input/${kp.kp_id}`}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-md font-medium"
            >
              Log Hand
            </button>
          </>
        )}
        {isClaimed && !isClaimedByMe && (
          <div className="flex-1 bg-gray-700 text-gray-400 py-2 rounded-md text-center font-medium">
            Claimed by Others
          </div>
        )}
      </div>
    </motion.div>
  );
}
```

#### `QuickLogMode.tsx` (Screen 2)
```tsx
import { useState } from 'react';
import { useHandCreate } from '../hooks/useHandCreate';
import { useParams } from 'react-router-dom';
import { TimestampPicker } from './TimestampPicker';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { useHaptic } from '@/shared/hooks/useHaptic';

export function QuickLogMode() {
  const { kpId } = useParams<{ kpId: string }>();
  const { createHand, isPending } = useHandCreate();
  const { vibrate } = useHaptic();

  const [timestamp, setTimestamp] = useState<Date>(new Date());
  const [result, setResult] = useState<'win' | 'lose' | 'unknown'>('unknown');

  const handleSubmit = async () => {
    vibrate('medium');
    await createHand({
      kpId: kpId!,
      startedAt: timestamp,
      result,
      mode: 'quick',
    });
  };

  return (
    <div className="quick-log p-4">
      <h2 className="text-xl font-bold text-white mb-4">Quick Log</h2>

      {/* Timestamp Picker */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Timestamp</label>
        <TimestampPicker
          value={timestamp}
          onChange={setTimestamp}
          tolerance={60} // ±60초
        />
      </div>

      {/* Result Selector */}
      <div className="mb-4">
        <label className="text-sm text-gray-400 mb-2 block">Result</label>
        <div className="grid grid-cols-3 gap-2">
          {(['win', 'lose', 'unknown'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setResult(r)}
              className={`py-3 rounded-md font-medium ${
                result === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-md font-bold text-lg"
      >
        {isPending ? 'Saving...' : 'Save Hand'}
      </button>
    </div>
  );
}
```

#### `FullLogMode.tsx` (Screen 3)
```tsx
import { useState } from 'react';
import { useHandCreate } from '../hooks/useHandCreate';
import { StreetInput } from './StreetInput';
import { OpponentSelector } from './OpponentSelector';
import { useAutoExpand } from '../hooks/useAutoExpand';

export function FullLogMode() {
  const { streets, addStreet, updateStreet } = useAutoExpand();
  const { createHand, isPending } = useHandCreate();
  const [opponents, setOpponents] = useState<Array<{ name: string; seat: number }>>([]);

  const handleSubmit = async () => {
    await createHand({
      kpId: kpId!,
      startedAt: timestamp,
      opponents,
      streets,
      result,
      mode: 'full',
    });
  };

  return (
    <div className="full-log p-4">
      <h2 className="text-xl font-bold text-white mb-4">Full Log</h2>

      {/* Opponents */}
      <OpponentSelector
        opponents={opponents}
        onChange={setOpponents}
      />

      {/* Street Auto-Expansion */}
      <div className="space-y-3 mt-4">
        {streets.map((street, idx) => (
          <StreetInput
            key={street.id}
            street={street}
            onUpdate={(updates) => updateStreet(idx, updates)}
            onNext={() => addStreet()}
          />
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-md font-bold text-lg mt-6"
      >
        {isPending ? 'Saving...' : 'Save Hand'}
      </button>
    </div>
  );
}
```

### 2.4 상태 관리 (Zustand)

#### `authStore.ts`
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/shared/utils/supabase';
import type { Profile } from '@/shared/types/models';

interface AuthState {
  user: Profile | null;
  session: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isLoading: true,

      initialize: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          set({ user: profile, session, isLoading: false });
        } else {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        set({ user: profile, session: data.session });
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null, session: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }), // session은 제외
    }
  )
);
```

#### `kpStore.ts`
```ts
import { create } from 'zustand';
import type { KPPlayer } from '@/shared/types/models';

interface KPState {
  kpList: KPPlayer[];
  setKPList: (list: KPPlayer[]) => void;
  updateKP: (kpId: string, updates: Partial<KPPlayer>) => void;
}

export const useKPStore = create<KPState>((set) => ({
  kpList: [],
  setKPList: (list) => set({ kpList: list }),
  updateKP: (kpId, updates) =>
    set((state) => ({
      kpList: state.kpList.map((kp) =>
        kp.kp_id === kpId ? { ...kp, ...updates } : kp
      ),
    })),
}));
```

---

## 3. PWA 구성 및 오프라인 전략

### 3.1 Vite PWA Plugin 설정

#### `vite.config.ts`
```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'VTC Story Ledger',
        short_name: 'VTC Ledger',
        description: 'Key Player journey tracking for Virtual Table Contents',
        theme_color: '#1f2937',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1시간
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 7, // 7일
              },
            },
          },
        ],
      },
    }),
  ],
});
```

### 3.2 IndexedDB Schema (Dexie.js)

#### `indexedDB.ts`
```ts
import Dexie, { Table } from 'dexie';
import type { Hand, HandStreet } from './types/models';

interface QueuedAction {
  id?: number;
  action: 'create_hand' | 'update_kp' | 'claim_kp' | 'unclaim_kp';
  payload: any;
  timestamp: number;
  retries: number;
  status: 'pending' | 'processing' | 'failed';
}

interface CachedKP {
  kp_id: string;
  data: any;
  cached_at: number;
}

class VTCDatabase extends Dexie {
  queuedActions!: Table<QueuedAction, number>;
  cachedKPs!: Table<CachedKP, string>;
  offlineHands!: Table<Hand, string>;

  constructor() {
    super('VTCDatabase');
    this.version(1).stores({
      queuedActions: '++id, action, status, timestamp',
      cachedKPs: 'kp_id, cached_at',
      offlineHands: 'hand_id, kp_id, sync_status, created_at',
    });
  }
}

export const db = new VTCDatabase();
```

### 3.3 Offline Queue Hook

#### `useOfflineQueue.ts`
```ts
import { useEffect, useCallback } from 'react';
import { db } from '@/shared/utils/indexedDB';
import { supabase } from '@/shared/utils/supabase';
import { useNetworkStatus } from './useNetworkStatus';

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus();

  const enqueue = useCallback(async (action: string, payload: any) => {
    await db.queuedActions.add({
      action: action as any,
      payload,
      timestamp: Date.now(),
      retries: 0,
      status: 'pending',
    });
  }, []);

  const processQueue = useCallback(async () => {
    const pendingActions = await db.queuedActions
      .where('status')
      .equals('pending')
      .sortBy('timestamp');

    for (const action of pendingActions) {
      try {
        // 상태 업데이트: processing
        await db.queuedActions.update(action.id!, { status: 'processing' });

        // 액션 실행
        switch (action.action) {
          case 'create_hand':
            await supabase.rpc('create_hand_with_streets', action.payload);
            break;
          case 'claim_kp':
            await supabase.rpc('claim_kp', action.payload);
            break;
          case 'unclaim_kp':
            await supabase.rpc('unclaim_kp', action.payload);
            break;
          case 'update_kp':
            await supabase.rpc('update_kp_chip', action.payload);
            break;
        }

        // 성공 시 큐에서 제거
        await db.queuedActions.delete(action.id!);
      } catch (error) {
        console.error('Queue processing error:', error);

        // 재시도 횟수 증가
        const newRetries = action.retries + 1;
        if (newRetries >= 3) {
          // 3회 실패 시 실패 상태로 변경
          await db.queuedActions.update(action.id!, {
            status: 'failed',
            retries: newRetries,
          });
        } else {
          // 재시도 대기 상태로 변경
          await db.queuedActions.update(action.id!, {
            status: 'pending',
            retries: newRetries,
          });
        }
      }
    }
  }, []);

  // 온라인 상태가 되면 자동으로 큐 처리
  useEffect(() => {
    if (isOnline) {
      processQueue();
    }
  }, [isOnline, processQueue]);

  return { enqueue, processQueue };
}
```

### 3.4 Background Sync (Service Worker)

#### `sw.js` (Custom Service Worker)
```js
// Background Sync 이벤트 리스너
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  const db = await openIndexedDB();
  const pendingActions = await db.queuedActions
    .where('status')
    .equals('pending')
    .toArray();

  for (const action of pendingActions) {
    try {
      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action),
      });

      if (response.ok) {
        await db.queuedActions.delete(action.id);
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// 네트워크 우선 전략 (API 요청)
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
  }
});
```

---

## 4. 성능 최적화 구현 계획

### 4.1 3단계 최적화 전략

#### Phase 1: Caching Layer (MVP 포함)
**목표**: 초기 로드 시간 91% 개선 (3.5s → 0.3s)

```ts
// useKPList.ts (React Query + Zustand 하이브리드)
export function useKPList() {
  const { setKPList } = useKPStore();

  return useQuery({
    queryKey: ['kp-list'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_kp_list_sparse');
      if (error) throw error;
      setKPList(data); // Zustand에 동기화
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5분
    gcTime: 10 * 60 * 1000, // 10분
    initialData: () => useKPStore.getState().kpList, // Zustand에서 초기값
  });
}
```

#### Phase 2: Sparse Column Reads (Week 2-3)
**목표**: 쿼리 성능 45% 개선 (0.5s → 0.275s)

- Supabase RPC `get_kp_list_sparse()` 사용 (필요한 컬럼만 SELECT)
- `get_hands_sparse()` 사용 (핸드 목록 조회 시 필수 컬럼만)

#### Phase 3: Smart Adaptive Loading (Week 3-4)
**목표**: 체감 성능 67% 개선 (깜빡임 제거)

```ts
// useSmartLoading.ts
export function useSmartLoading(threshold = 300) {
  const [isVisible, setIsVisible] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const show = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      setIsVisible(true);
    }, threshold);
  }, [threshold]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const elapsed = Date.now() - startTimeRef.current;
    if (elapsed < threshold) {
      // 깜빡임 방지: threshold 이하면 로딩 표시 안 함
      setIsVisible(false);
      return;
    }

    // 300ms 이상 걸린 경우에만 부드럽게 사라짐
    setTimeout(() => setIsVisible(false), 200);
  }, [threshold]);

  return { isVisible, show, hide };
}

// LoadingOverlay.tsx
export function LoadingOverlay({ message }: { message?: string }) {
  const { isVisible } = useSmartLoading();

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
    >
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4" />
        {message && <p className="text-white text-center">{message}</p>}
      </div>
    </motion.div>
  );
}
```

### 4.2 성능 목표 (Hand Logger 검증 기준)

| 지표 | 현재 (Archive) | MVP 목표 | 최종 목표 |
|------|----------------|----------|-----------|
| 초기 로드 | 1.8s | 0.5s | 0.475s |
| KP 목록 쿼리 | 0.5s | 0.35s | 0.275s |
| 핸드 생성 | 1.2s | 0.8s | 0.6s |
| 오프라인 전환 | 3s | 0.1s | 0.1s |
| 배터리 소모 | 12%/hour | 10%/hour | 8%/hour |

### 4.3 Realtime Subscription 최적화

```ts
// useRealtimeSubscription.ts
export function useRealtimeKPUpdates() {
  const { updateKP } = useKPStore();

  useEffect(() => {
    const channel = supabase
      .channel('kp-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kp_players',
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            updateKP(payload.new.kp_id, payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [updateKP]);
}
```

---

## 5. 개발 로드맵

### 5.1 MVP 개발 일정 (4주)

#### Week 1: 기반 구축
**Day 1-2**: 프로젝트 세팅
- [ ] Vite + React + TypeScript 초기화
- [ ] Supabase 프로젝트 생성 및 마이그레이션 실행
- [ ] 폴더 구조 생성
- [ ] Tailwind CSS + UI 컴포넌트 라이브러리 설정

**Day 3-4**: 인증 시스템
- [ ] Supabase Auth 연동
- [ ] Login/Logout 컴포넌트
- [ ] Protected Route 구현
- [ ] authStore 구현

**Day 5-7**: KP Dashboard (Screen 1)
- [ ] KPDashboard 컴포넌트
- [ ] KPCard 컴포넌트
- [ ] useKPList hook (React Query)
- [ ] Realtime subscription
- [ ] Claim/Unclaim 기능

#### Week 2: 핸드 입력 & 오프라인
**Day 8-10**: Hand Input (Screen 2 & 3)
- [ ] QuickLogMode 컴포넌트
- [ ] FullLogMode 컴포넌트
- [ ] StreetInput (자동 확장)
- [ ] TimestampPicker (±60초 추천)
- [ ] OpponentSelector (BottomSheet)

**Day 11-12**: Offline 기능
- [ ] IndexedDB 스키마 (Dexie.js)
- [ ] useOfflineQueue hook
- [ ] Background Sync 구현
- [ ] Network status 감지

**Day 13-14**: 성능 최적화 Phase 1
- [ ] Zustand persist 설정
- [ ] React Query caching 전략
- [ ] Sparse Column Reads 적용

#### Week 3: Admin & Photo
**Day 15-17**: Admin Dashboard (Screen 4)
- [ ] AdminDashboard 컴포넌트
- [ ] RealTimeMap (KP 위치 시각화)
- [ ] LoggerStatusPanel
- [ ] HandLogTimeline

**Day 18-20**: Photo Upload (Screen 5)
- [ ] PhotoUpload 컴포넌트
- [ ] CameraCapture (MediaDevices API)
- [ ] Image compression (browser-image-compression)
- [ ] Supabase Storage 연동

**Day 21**: 성능 최적화 Phase 2
- [ ] Smart Adaptive Loading 구현
- [ ] useSmartLoading hook
- [ ] LoadingOverlay 컴포넌트

#### Week 4: 테스트 & 최적화
**Day 22-24**: 통합 테스트
- [ ] E2E 테스트 (Playwright)
- [ ] Unit 테스트 (Vitest)
- [ ] Offline 시나리오 테스트
- [ ] 동시성 테스트 (10명 동시 접속)

**Day 25-26**: PWA & 배포
- [ ] PWA manifest 최종 점검
- [ ] Service Worker 테스트
- [ ] Lighthouse 성능 측정 (목표: 90+ 점수)
- [ ] Vercel/Netlify 배포

**Day 27-28**: 버퍼 & 문서화
- [ ] 버그 수정
- [ ] 사용자 가이드 작성
- [ ] 배포 매뉴얼
- [ ] MVP 회고 및 Phase 2 계획

### 5.2 Post-MVP 기능 (Week 5-7)

#### Week 5: 고급 기능
- [ ] CSV 플레이어 업로드
- [ ] Batch photo upload
- [ ] Hand 수정/삭제 기능
- [ ] Export to CSV

#### Week 6: UX 개선
- [ ] Dark mode toggle
- [ ] Haptic feedback 세부 조정
- [ ] 애니메이션 최적화
- [ ] Accessibility (ARIA labels)

#### Week 7: 최종 최적화
- [ ] 배터리 소모 최적화 (8시간 목표)
- [ ] 네트워크 요청 최소화
- [ ] 번들 사이즈 최적화 (Tree shaking)
- [ ] 프로덕션 배포

---

## 6. 개발 환경 설정

### 6.1 Supabase CLI 설정

```bash
# Supabase CLI 설치
npm install -g supabase

# 로컬 Supabase 초기화
supabase init

# 마이그레이션 실행
supabase db reset

# TypeScript 타입 생성
supabase gen types typescript --local > src/shared/types/database.types.ts

# 로컬 개발 서버 시작
supabase start
```

### 6.2 환경 변수

#### `.env.local`
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### `.env.production`
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### 6.3 개발 스크립트

#### `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint src --ext ts,tsx",
    "format": "prettier --write src",
    "supabase:start": "supabase start",
    "supabase:stop": "supabase stop",
    "supabase:reset": "supabase db reset",
    "supabase:types": "supabase gen types typescript --local > src/shared/types/database.types.ts"
  }
}
```

---

## 7. 다음 단계

### MVP 승인 후 진행 사항

1. **프로젝트 초기화**
   ```bash
   npm create vite@latest vtc-story-ledger -- --template react-ts
   cd vtc-story-ledger
   npm install
   npm install @supabase/supabase-js zustand dexie @tanstack/react-query
   npm install -D tailwindcss vite-plugin-pwa
   ```

2. **Supabase 프로젝트 생성**
   - Supabase Dashboard에서 새 프로젝트 생성
   - 마이그레이션 파일 실행
   - RLS 정책 활성화
   - Storage 버킷 생성

3. **Week 1 개발 시작**
   - Day 1-2: 프로젝트 세팅
   - Day 3-4: 인증 시스템
   - Day 5-7: KP Dashboard

---

**MVP 설계 완료**
이 문서는 PRD v3.2 FINAL을 기반으로 한 완전한 MVP 구현 가이드입니다.
다음 단계는 사용자 승인 후 개발 Phase로 진입합니다.

**작성자**: Claude (Sonnet 4.5)
**검토 필요**: 사용자 승인 대기 중
