-- ========================================
-- Supabase Functions (RPC)
-- ========================================

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

COMMENT ON FUNCTION init_app IS '앱 초기화 데이터 로드 (프로필, KP 목록, 내가 Claim한 KP, 최근 핸드)';

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
  -- 현재 버전 확인 (Row-Level Lock)
  SELECT version INTO current_version
  FROM kp_players
  WHERE kp_id = p_kp_id
  FOR UPDATE NOWAIT;

  -- 버전 불일치 (충돌)
  IF current_version != p_expected_version THEN
    RETURN json_build_object(
      'success', false,
      'error', 'VERSION_CONFLICT',
      'message', 'KP 정보가 변경되었습니다. 새로고침 후 다시 시도하세요.',
      'current_version', current_version
    );
  END IF;

  -- 이미 다른 Logger가 Claim한 경우
  IF EXISTS (
    SELECT 1 FROM kp_players
    WHERE kp_id = p_kp_id
      AND current_logger_id IS NOT NULL
      AND current_logger_id != p_logger_id
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'ALREADY_CLAIMED',
      'message', '다른 로거가 이미 이 KP를 담당하고 있습니다.'
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
      'error', 'LOCK_TIMEOUT',
      'message', '다른 로거가 이 KP를 처리 중입니다. 잠시 후 다시 시도하세요.'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION claim_kp IS 'KP Claim (Optimistic Locking + Row-Level Lock)';

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
      'error', 'NOT_CLAIMED_BY_YOU',
      'message', '본인이 담당하는 KP만 해제할 수 있습니다.'
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

COMMENT ON FUNCTION unclaim_kp IS 'KP Unclaim (담당 해제)';

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
    ended_at,
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
    (p_hand->>'ended_at')::TIMESTAMPTZ,
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
      'message', '이미 기록된 핸드입니다.',
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

COMMENT ON FUNCTION create_hand_with_streets IS '핸드 + 스트리트 일괄 생성 (Idempotency 지원)';

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
      'error', 'NOT_CLAIMED_BY_YOU',
      'message', '본인이 담당하는 KP만 칩 정보를 업데이트할 수 있습니다.'
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

COMMENT ON FUNCTION update_kp_chip IS 'KP 칩 카운트 업데이트';

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
          'version', version,
          'claimed_at', claimed_at
        ) ORDER BY player_name
      ),
      '[]'::json
    )
    FROM kp_players
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_kp_list_sparse IS 'KP 목록 조회 (필요한 컬럼만 선택, 성능 최적화)';

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

COMMENT ON FUNCTION get_hands_sparse IS '핸드 목록 조회 (필요한 컬럼만 선택, 성능 최적화)';

-- ========================================
-- 7. Producer 전용: 강제 Unclaim
-- ========================================
CREATE OR REPLACE FUNCTION force_unclaim_kp(
  p_kp_id UUID,
  p_producer_id UUID
)
RETURNS JSON AS $$
DECLARE
  updated_kp JSON;
BEGIN
  -- Producer 권한 확인
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = p_producer_id AND role = 'producer'
  ) THEN
    RETURN json_build_object(
      'success', false,
      'error', 'UNAUTHORIZED',
      'message', 'Producer 권한이 필요합니다.'
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

COMMENT ON FUNCTION force_unclaim_kp IS 'Producer 전용: KP 강제 Unclaim';
