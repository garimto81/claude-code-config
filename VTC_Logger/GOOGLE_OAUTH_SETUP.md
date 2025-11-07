# Google OAuth 설정 가이드

**VTC Story Ledger - Google 로그인 활성화**

---

## 📋 개요

이 가이드는 Supabase에서 Google OAuth 인증을 활성화하는 방법을 단계별로 설명합니다.

---

## 🔧 Step 1: Google Cloud Console 설정

### 1-1. Google Cloud Console 접속

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. Google 계정으로 로그인

### 1-2. 프로젝트 생성 (또는 기존 프로젝트 선택)

1. 상단 프로젝트 드롭다운 클릭
2. **"새 프로젝트"** 클릭
3. 프로젝트 정보 입력:
   - **프로젝트 이름**: `VTC Story Ledger` (또는 원하는 이름)
   - **위치**: 조직 없음
4. **"만들기"** 클릭
5. 프로젝트 생성 완료 대기 (약 30초)

### 1-3. OAuth 동의 화면 구성

1. 좌측 메뉴 **"API 및 서비스"** → **"OAuth 동의 화면"** 클릭
2. **User Type** 선택:
   - ✅ **외부 (External)** 선택 (테스트 사용자 추가 가능)
   - **"만들기"** 클릭

3. **OAuth 동의 화면 정보 입력**:

   **앱 정보**:
   - **앱 이름**: `VTC Story Ledger`
   - **사용자 지원 이메일**: (본인의 Gmail 주소)
   - **앱 로고**: (선택사항, 120x120px PNG/JPG)

   **앱 도메인**:
   - **애플리케이션 홈페이지**: `https://your-project.supabase.co` (Supabase URL)
   - **애플리케이션 개인정보처리방침**: (선택사항)
   - **애플리케이션 서비스 약관**: (선택사항)

   **승인된 도메인**:
   - `supabase.co` 입력 후 Enter

   **개발자 연락처 정보**:
   - (본인의 이메일 주소)

4. **"저장 후 계속"** 클릭

5. **범위 (Scopes)** 설정:
   - 기본값 유지 (`.../auth/userinfo.email`, `.../auth/userinfo.profile`)
   - **"저장 후 계속"** 클릭

6. **테스트 사용자** 추가 (개발 중):
   - **"+ ADD USERS"** 클릭
   - 테스트할 Gmail 주소 입력
   - **"추가"** 클릭
   - **"저장 후 계속"** 클릭

7. **요약** 확인 후 **"대시보드로 돌아가기"**

### 1-4. OAuth 2.0 클라이언트 ID 생성

1. 좌측 메뉴 **"사용자 인증 정보"** 클릭
2. 상단 **"+ 사용자 인증 정보 만들기"** 클릭
3. **"OAuth 2.0 클라이언트 ID"** 선택

4. **애플리케이션 유형**: `웹 애플리케이션`

5. **이름**: `VTC Story Ledger Web Client`

6. **승인된 자바스크립트 원본**:
   - **"+ URI 추가"** 클릭
   - `http://localhost:5177` 입력 (로컬 개발)
   - **"+ URI 추가"** 클릭 (한 번 더)
   - `https://your-project.supabase.co` 입력 (실제 URL로 교체)

7. **승인된 리디렉션 URI** (⚠️ 중요):
   - **"+ URI 추가"** 클릭
   - 다음 URL 입력 (Supabase에서 복사):
     ```
     https://your-project-id.supabase.co/auth/v1/callback
     ```
   - **예시**: `https://etbnuuwwqedmrvovycns.supabase.co/auth/v1/callback`

8. **"만들기"** 클릭

9. **OAuth 클라이언트 생성됨** 팝업:
   - ✅ **클라이언트 ID** 복사 (예: `123456789-abcdef.apps.googleusercontent.com`)
   - ✅ **클라이언트 보안 비밀번호** 복사 (예: `GOCSPX-...`)
   - 두 값을 안전한 곳에 저장
   - **"확인"** 클릭

---

## 🔐 Step 2: Supabase OAuth 설정

### 2-1. Supabase Dashboard 접속

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택: `vtc-story-ledger`

### 2-2. Google Provider 활성화

1. 좌측 메뉴 **🔒 Authentication** 클릭
2. 상단 **Providers** 탭 클릭
3. 목록에서 **Google** 찾기
4. **Google** 우측 토글 스위치 클릭 (활성화)

### 2-3. Google OAuth 정보 입력

**Google Provider 설정 화면**:

1. **Enabled**: ✅ ON

2. **Client ID (for OAuth)**:
   - Google Cloud Console에서 복사한 **클라이언트 ID** 붙여넣기
   - 예: `123456789-abcdefghijklmnop.apps.googleusercontent.com`

3. **Client Secret (for OAuth)**:
   - Google Cloud Console에서 복사한 **클라이언트 보안 비밀번호** 붙여넣기
   - 예: `GOCSPX-abc123def456ghi789`

4. **Authorized Client IDs** (선택사항):
   - 비워둠 (기본값)

5. **Skip nonce checks** (선택사항):
   - ❌ OFF (기본값)

6. **"Save"** 버튼 클릭

### 2-4. Redirect URL 확인

Supabase에서 제공하는 **Callback URL (for OAuth)**을 확인하고 Google Cloud Console에 정확히 입력했는지 재확인:

```
https://your-project-id.supabase.co/auth/v1/callback
```

⚠️ **주의**:
- URL 끝에 슬래시(`/`) 없음
- `http`가 아닌 `https`
- 프로젝트 ID 정확히 확인

---

## ✅ Step 3: 테스트

### 3-1. 로컬 개발 서버 확인

```bash
cd vtc-app
npm run dev
```

브라우저에서 `http://localhost:5177` 접속

### 3-2. Google 로그인 테스트

1. **"Continue with Google"** 버튼 클릭
2. Google 계정 선택 화면 표시
3. 테스트 사용자로 추가한 Gmail 계정 선택
4. **권한 동의** 화면:
   - ✅ 이메일 주소 보기
   - ✅ 개인정보 보기
   - **"허용"** 클릭
5. 자동으로 VTC Story Ledger 홈 화면(`/`)으로 리디렉션
6. 헤더에 Google 계정 정보 표시 확인

### 3-3. 성공 확인

✅ **로그인 성공 시**:
- 메인 화면에 "Welcome, [사용자 이름]!" 배지 표시
- 애니메이션 화면 정상 표시
- 우측 상단 "Logout" 버튼 동작

❌ **실패 시 체크리스트**:
- [ ] Google Cloud Console에서 리디렉션 URI 정확히 입력했는가?
- [ ] Supabase에서 Client ID/Secret 정확히 복사했는가?
- [ ] 테스트 사용자로 추가한 Gmail 계정으로 로그인했는가?
- [ ] OAuth 동의 화면 상태가 "테스트 중"인가?

---

## 🐛 트러블슈팅

### 문제 1: "redirect_uri_mismatch" 에러

**증상**: Google 로그인 시 "Error 400: redirect_uri_mismatch" 표시

**원인**:
- Google Cloud Console의 승인된 리디렉션 URI와 Supabase의 Callback URL이 일치하지 않음

**해결**:
1. Supabase Dashboard → Authentication → Providers → Google
2. **Callback URL (for OAuth)** 복사
3. Google Cloud Console → 사용자 인증 정보 → OAuth 2.0 클라이언트 ID 수정
4. **승인된 리디렉션 URI**에 정확히 붙여넣기
5. 저장 후 재시도

### 문제 2: "Access blocked" 에러

**증상**: "This app is blocked. This app tried to access sensitive info..."

**원인**:
- OAuth 동의 화면 상태가 "게시 필요"
- 테스트 사용자로 추가되지 않은 계정으로 로그인 시도

**해결 (옵션 1 - 테스트 사용자 추가)**:
1. Google Cloud Console → OAuth 동의 화면
2. **"테스트 사용자"** 섹션에서 **"+ ADD USERS"**
3. 로그인할 Gmail 주소 추가

**해결 (옵션 2 - 앱 게시)**:
1. Google Cloud Console → OAuth 동의 화면
2. **"앱 게시"** 버튼 클릭
3. ⚠️ 주의: 게시 후에는 Google 검토 필요 (내부 앱은 즉시 승인)

### 문제 3: "Invalid client" 에러

**증상**: Supabase에서 "Invalid OAuth client"

**원인**: Client ID 또는 Secret이 잘못됨

**해결**:
1. Google Cloud Console → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 클릭
3. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 재확인
4. Supabase에 정확히 복사/붙여넣기
5. **Save** 클릭

### 문제 4: 로그인 후 프로필이 없음

**증상**: 로그인은 되지만 `profiles` 테이블에 데이터 없음

**원인**: `handle_new_user` 트리거가 Google OAuth 사용자에게 작동하지 않음

**해결**:
1. Supabase Dashboard → SQL Editor
2. 다음 SQL 실행:
   ```sql
   -- Google OAuth 사용자 프로필 자동 생성
   INSERT INTO profiles (id, email, role, display_name)
   SELECT
     id,
     email,
     'logger', -- 기본 역할
     COALESCE(
       raw_user_meta_data->>'full_name',
       raw_user_meta_data->>'name',
       split_part(email, '@', 1)
     ) as display_name
   FROM auth.users
   WHERE NOT EXISTS (
     SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
   );
   ```

### 문제 5: 로컬호스트에서만 작동

**증상**: 배포 후 Google 로그인 실패

**원인**:
- 프로덕션 URL이 Google Cloud Console에 등록되지 않음
- Supabase URL이 잘못 입력됨

**해결**:
1. Google Cloud Console → OAuth 2.0 클라이언트 ID
2. **승인된 자바스크립트 원본**에 프로덕션 URL 추가
3. **승인된 리디렉션 URI**에 프로덕션 Supabase Callback URL 추가
4. 저장

---

## 📚 추가 리소스

- [Supabase Google OAuth 공식 문서](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 문서](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com)

---

## 🎉 설정 완료!

모든 단계를 완료하면 Google 로그인이 정상적으로 작동합니다.

**테스트 시나리오**:
1. ✅ Google 버튼 클릭
2. ✅ Google 계정 선택
3. ✅ 권한 동의
4. ✅ 자동 리디렉션
5. ✅ 메인 화면 표시
6. ✅ 프로필 정보 확인

**다음 단계**: Week 1 - KP Dashboard 개발

---

**작성일**: 2025-01-12
**버전**: 1.0.0
