# Google OAuth 빠른 설정 가이드 (5분)

**VTC Story Ledger - Google 로그인 활성화**

---

## ⚡ 빠른 설정 (5분)

### Step 1: Google Cloud Console (2분)

1. **[Google Cloud Console](https://console.cloud.google.com)** 접속

2. **프로젝트 생성**:
   - 상단 프로젝트 드롭다운 → "새 프로젝트"
   - 이름: `VTC Story Ledger`
   - "만들기" 클릭

3. **OAuth 동의 화면**:
   - 좌측 메뉴: "API 및 서비스" → "OAuth 동의 화면"
   - User Type: **외부 (External)** 선택
   - 앱 이름: `VTC Story Ledger`
   - 사용자 지원 이메일: (본인 Gmail)
   - 승인된 도메인: `supabase.co`
   - 개발자 이메일: (본인 Gmail)
   - "저장 후 계속" (3번)
   - 테스트 사용자 추가: (본인 Gmail)

4. **OAuth 클라이언트 ID 생성**:
   - 좌측 메뉴: "사용자 인증 정보"
   - "+ 사용자 인증 정보 만들기" → "OAuth 2.0 클라이언트 ID"
   - 유형: **웹 애플리케이션**
   - 이름: `VTC Web Client`
   - **승인된 리디렉션 URI** (⚠️ 중요):
     ```
     https://etbnuuwwqedmrvovycns.supabase.co/auth/v1/callback
     ```
     (실제 Supabase 프로젝트 ID로 교체)
   - "만들기" 클릭
   - ✅ **클라이언트 ID** 복사
   - ✅ **클라이언트 보안 비밀번호** 복사

---

### Step 2: Supabase 설정 (2분)

1. **[Supabase Dashboard](https://supabase.com/dashboard)** 접속

2. **프로젝트 선택**: `vtc-story-ledger`

3. **Google Provider 활성화**:
   - 좌측 메뉴: Authentication → Providers
   - **Google** 찾기 → 토글 ON
   - **Client ID**: (Google에서 복사한 값 붙여넣기)
   - **Client Secret**: (Google에서 복사한 값 붙여넣기)
   - **"Save"** 클릭

---

### Step 3: 테스트 (1분)

1. **개발 서버 실행**:
   ```bash
   cd vtc-app
   npm run dev
   ```

2. **브라우저 접속**: `http://localhost:5177`

3. **Google 로그인**:
   - "Continue with Google" 버튼 클릭
   - 테스트 사용자 Gmail 계정 선택
   - 권한 동의
   - ✅ 메인 화면으로 자동 리디렉션

---

## 🔑 필수 정보

### Supabase Callback URL (Google에 입력)

```
https://etbnuuwwqedmrvovycns.supabase.co/auth/v1/callback
```

⚠️ **프로젝트 ID 확인**: Supabase Dashboard → Settings → API → Project URL

---

## 🐛 문제 해결

### "redirect_uri_mismatch" 에러

**원인**: Google의 리디렉션 URI와 Supabase Callback URL 불일치

**해결**:
1. Supabase에서 **Callback URL** 정확히 복사
2. Google Cloud Console → OAuth 클라이언트 ID 수정
3. **승인된 리디렉션 URI**에 정확히 붙여넣기

### "Access blocked" 에러

**원인**: 테스트 사용자 미등록

**해결**:
1. Google Cloud Console → OAuth 동의 화면
2. 테스트 사용자 섹션 → "+ ADD USERS"
3. 로그인할 Gmail 주소 추가

### 프로필이 생성되지 않음

**원인**: Google OAuth 사용자용 트리거 미작동

**해결** (Supabase SQL Editor):
```sql
INSERT INTO profiles (id, email, role, display_name)
SELECT
  id,
  email,
  'logger',
  COALESCE(
    raw_user_meta_data->>'full_name',
    split_part(email, '@', 1)
  )
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);
```

---

## ✅ 완료!

**테스트 성공 기준**:
- ✅ Google 버튼 클릭 → 계정 선택 화면
- ✅ 권한 동의 → 자동 리디렉션
- ✅ 메인 화면 "Welcome, [이름]!" 표시

**상세 가이드**: [GOOGLE_OAUTH_SETUP.md](GOOGLE_OAUTH_SETUP.md)

---

**작성일**: 2025-01-12
