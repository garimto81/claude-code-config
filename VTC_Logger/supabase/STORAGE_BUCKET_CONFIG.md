# Storage Bucket 설정 가이드

## 📦 현재 Bucket 설정 확인

### Supabase Dashboard에서 확인
1. **Storage** → `kp-photos` 버킷 클릭
2. **Configuration** 탭에서 현재 설정 확인

---

## ⚙️ 조절 가능한 설정들

### 1. 파일 크기 제한 (File Size Limit)

**현재 권장값**: `5MB` (5242880 bytes)

**변경 방법**:
- Dashboard: Storage → kp-photos → Configuration → File size limit
- 또는 SQL:
  ```sql
  UPDATE storage.buckets
  SET file_size_limit = 10485760  -- 10MB로 변경
  WHERE id = 'kp-photos';
  ```

**권장 크기별 용도**:
- **1-3MB**: 모바일 환경, 빠른 업로드 우선
- **5MB** (권장): 고화질 사진 + 적당한 속도
- **10MB**: 고해상도 필요 시
- **20MB+**: 필요 없음 (과도한 용량)

---

### 2. 허용 MIME 타입 (Allowed MIME Types)

**현재 권장값**: `image/jpeg, image/png, image/webp`

**변경 방법**:
```sql
UPDATE storage.buckets
SET allowed_mime_types = ARRAY[
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic'  -- iPhone 사진 추가
]
WHERE id = 'kp-photos';
```

**추가 가능한 타입**:
- `image/heic`: iPhone 사진 (iOS)
- `image/heif`: HEIF 포맷
- `image/gif`: GIF (애니메이션)
- `image/avif`: AVIF (최신 포맷, 압축률 우수)

**보안상 권장하지 않는 타입**:
- ❌ `image/svg+xml`: XSS 공격 가능
- ❌ `image/*`: 모든 이미지 (보안 취약)

---

### 3. Public vs Private

**현재 설정**: `Public = true`

**의미**:
- `true`: URL만 알면 누구나 접근 가능 (하지만 RLS로 제어)
- `false`: 인증된 요청만 접근 가능

**변경 방법**:
```sql
UPDATE storage.buckets
SET public = false  -- Private으로 변경
WHERE id = 'kp-photos';
```

**권장**:
- **Public (true)**: RLS 정책으로 보호하면서 CDN 캐싱 활용
- **Private (false)**: 매우 민감한 정보 (현재 KP 사진은 Public 권장)

---

### 4. 파일명 제한 (Avif Autodetection)

**Dashboard에서 설정**:
- Storage → kp-photos → Configuration → Avif autodetection

**옵션**:
- ✅ **Enabled**: AVIF 파일 자동 감지 및 최적화
- ❌ **Disabled**: 비활성화

---

## 🔐 RLS 정책 조절

### 현재 정책 확인
```sql
SELECT
  policyname,
  cmd as operation,
  qual as using_clause
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
  AND (qual LIKE '%kp-photos%' OR with_check LIKE '%kp-photos%')
ORDER BY policyname;
```

---

### 정책 1: 조회 권한 (SELECT)

**현재 정책**: 인증된 모든 사용자

**더 엄격하게 변경** (Logger/Producer만):
```sql
DROP POLICY "Authenticated users can view kp photos" ON storage.objects;

CREATE POLICY "Authenticated users can view kp photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kp-photos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer', 'camera_supervisor')
    )
  );
```

**더 관대하게 변경** (Public 완전 공개):
```sql
DROP POLICY "Authenticated users can view kp photos" ON storage.objects;

CREATE POLICY "Public can view kp photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'kp-photos');
```

---

### 정책 2: 업로드 권한 (INSERT)

**현재 정책**: Logger + Producer만

**Camera Supervisor 추가**:
```sql
DROP POLICY "Loggers can upload kp photos" ON storage.objects;

CREATE POLICY "Loggers can upload kp photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kp-photos' AND
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('logger', 'producer', 'camera_supervisor')
    )
  );
```

---

### 정책 3: 수정 권한 (UPDATE)

**현재 정책**: Logger + Producer만

**본인이 업로드한 파일만 수정 가능** (더 엄격):
```sql
DROP POLICY "Loggers can update kp photos" ON storage.objects;

CREATE POLICY "Loggers can update own kp photos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'kp-photos' AND
    auth.uid() = owner  -- 본인이 업로드한 파일만
  );
```

---

### 정책 4: 삭제 권한 (DELETE)

**현재 정책**: Producer만

**변경 필요 없음** (Producer만 삭제 권한 유지 권장)

---

## 📊 Storage 사용량 모니터링

### 현재 사용량 확인
```sql
-- 총 파일 수
SELECT COUNT(*) as total_files
FROM storage.objects
WHERE bucket_id = 'kp-photos';

-- 총 용량
SELECT
  COUNT(*) as total_files,
  pg_size_pretty(SUM(metadata->>'size')::bigint) as total_size,
  AVG((metadata->>'size')::bigint) / 1024 / 1024 as avg_size_mb
FROM storage.objects
WHERE bucket_id = 'kp-photos';

-- 가장 큰 파일 Top 5
SELECT
  name,
  (metadata->>'size')::bigint / 1024 / 1024 as size_mb,
  created_at
FROM storage.objects
WHERE bucket_id = 'kp-photos'
ORDER BY (metadata->>'size')::bigint DESC
LIMIT 5;
```

---

## 🎯 권장 설정 (프로덕션)

### 최적의 설정 조합

```sql
-- Bucket 설정
UPDATE storage.buckets
SET
  public = true,                    -- Public (RLS로 보호)
  file_size_limit = 5242880,        -- 5MB
  allowed_mime_types = ARRAY[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic'                    -- iPhone 사진 지원
  ]
WHERE id = 'kp-photos';
```

### RLS 정책 (현재 설정 유지)
- ✅ SELECT: 인증된 모든 사용자
- ✅ INSERT: Logger + Producer
- ✅ UPDATE: Logger + Producer
- ✅ DELETE: Producer만

---

## 🧪 테스트 방법

### 1. 파일 업로드 테스트 (JavaScript)
```typescript
import { supabase } from '@/shared/utils/supabase';

// 이미지 업로드
const file = new File(['...'], 'kp-photo.jpg', { type: 'image/jpeg' });

const { data, error } = await supabase.storage
  .from('kp-photos')
  .upload(`${kpId}/${Date.now()}.jpg`, file, {
    cacheControl: '3600',
    upsert: false
  });

if (error) {
  console.error('Upload failed:', error);
} else {
  console.log('Upload success:', data.path);

  // Public URL 생성
  const { data: publicUrl } = supabase.storage
    .from('kp-photos')
    .getPublicUrl(data.path);

  console.log('Public URL:', publicUrl.publicUrl);
}
```

### 2. 파일 조회 테스트
```typescript
// 버킷의 모든 파일 목록
const { data, error } = await supabase.storage
  .from('kp-photos')
  .list();

console.log('Files:', data);
```

### 3. 파일 삭제 테스트 (Producer만)
```typescript
const { data, error } = await supabase.storage
  .from('kp-photos')
  .remove(['path/to/file.jpg']);

console.log('Delete result:', data, error);
```

---

## 🔧 트러블슈팅

### 문제 1: 업로드 실패 (413 Payload Too Large)
**원인**: 파일 크기 초과

**해결**:
```sql
-- 파일 크기 제한 확인
SELECT file_size_limit / 1024 / 1024 as limit_mb
FROM storage.buckets
WHERE id = 'kp-photos';

-- 제한 증가
UPDATE storage.buckets
SET file_size_limit = 10485760  -- 10MB
WHERE id = 'kp-photos';
```

### 문제 2: 업로드 실패 (415 Unsupported Media Type)
**원인**: MIME 타입 불일치

**해결**:
```sql
-- 허용된 MIME 타입 확인
SELECT allowed_mime_types
FROM storage.buckets
WHERE id = 'kp-photos';

-- HEIC 추가
UPDATE storage.buckets
SET allowed_mime_types = array_append(allowed_mime_types, 'image/heic')
WHERE id = 'kp-photos';
```

### 문제 3: 조회 실패 (403 Forbidden)
**원인**: RLS 정책 위반

**해결**:
```sql
-- 현재 사용자 권한 확인
SELECT id, email, role
FROM profiles
WHERE id = auth.uid();

-- RLS 정책 확인
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';
```

---

## 📚 관련 문서

- [Supabase Storage Guide](https://supabase.com/docs/guides/storage)
- [Storage RLS](https://supabase.com/docs/guides/storage/security/access-control)
- [Image Optimization](https://supabase.com/docs/guides/storage/serving/image-transformations)

---

**마지막 업데이트**: 2025-01-12
**작성자**: VTC Logger Team
