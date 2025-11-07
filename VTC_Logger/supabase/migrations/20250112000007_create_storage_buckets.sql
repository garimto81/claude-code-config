-- ========================================
-- Supabase Storage: KP Photos Bucket
-- ========================================

-- KP 사진 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kp-photos',
  'kp-photos',
  true,  -- Public bucket (인증된 사용자만 접근 가능하도록 RLS로 제어)
  5242880,  -- 5MB 제한
  ARRAY['image/jpeg', 'image/png', 'image/webp']  -- 이미지 파일만 허용
);

-- ========================================
-- Storage RLS 정책
-- ========================================

-- RLS 정책: 모든 인증된 사용자는 사진 조회 가능
CREATE POLICY "Authenticated users can view kp photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kp-photos' AND
    auth.uid() IS NOT NULL
  );

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

-- RLS 정책: Logger/Producer는 사진 업데이트 가능
CREATE POLICY "Loggers can update kp photos"
  ON storage.objects FOR UPDATE
  USING (
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

-- ========================================
-- 코멘트
-- ========================================

COMMENT ON POLICY "Authenticated users can view kp photos" ON storage.objects IS '인증된 모든 사용자는 KP 사진 조회 가능';
COMMENT ON POLICY "Loggers can upload kp photos" ON storage.objects IS 'Logger와 Producer는 KP 사진 업로드 가능';
COMMENT ON POLICY "Loggers can update kp photos" ON storage.objects IS 'Logger와 Producer는 KP 사진 업데이트 가능';
COMMENT ON POLICY "Producers can delete kp photos" ON storage.objects IS 'Producer는 KP 사진 삭제 가능';
