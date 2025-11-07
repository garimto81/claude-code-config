# 이메일 확인 프로세스 설정 가이드

## 📧 이메일 확인 프로세스 개요

Supabase는 기본적으로 사용자 가입 시 이메일 확인을 요구합니다. 프로세스는 다음과 같습니다:

```
사용자 가입
    ↓
Supabase가 자동으로 확인 이메일 발송
    ↓
사용자가 이메일의 확인 링크 클릭
    ↓
Supabase가 이메일 확인 처리 (email_confirmed_at 업데이트)
    ↓
사용자가 로그인 가능
```

---

## 🛠️ Supabase 이메일 확인 설정

### 1. Supabase Dashboard 설정

#### **Authentication → Email Templates**
1. Supabase Dashboard 접속: https://supabase.com/dashboard
2. 프로젝트 선택: `VTC Logger`
3. 왼쪽 메뉴에서 **Authentication** → **Email Templates** 클릭

#### **Confirm signup 템플릿 커스터마이징** (선택사항)
기본 템플릿:
```html
<h2>Confirm your signup</h2>

<p>Follow this link to confirm your user:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your mail</a></p>
```

VTC Logger용 커스텀 템플릿:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(to right, #3b82f6, #a855f7); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">VTC Story Ledger</h1>
  </div>

  <div style="padding: 30px; background-color: #f9fafb;">
    <h2 style="color: #1f2937;">이메일 주소를 확인해주세요</h2>

    <p style="color: #4b5563; line-height: 1.6;">
      VTC Story Ledger에 가입해주셔서 감사합니다.<br>
      아래 버튼을 클릭하여 이메일 주소를 확인하고 계정을 활성화해주세요.
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .ConfirmationURL }}"
         style="background-color: #3b82f6; color: white; padding: 12px 30px;
                text-decoration: none; border-radius: 6px; display: inline-block;
                font-weight: bold;">
        이메일 확인하기
      </a>
    </div>

    <p style="color: #9ca3af; font-size: 14px;">
      버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
      <a href="{{ .ConfirmationURL }}" style="color: #3b82f6;">{{ .ConfirmationURL }}</a>
    </p>

    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

    <p style="color: #9ca3af; font-size: 12px;">
      이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.
    </p>
  </div>
</div>
```

---

### 2. 이메일 확인 필수 설정

#### **Authentication → Settings → Email Auth**

**옵션 1: 이메일 확인 필수 (권장 - 프로덕션)**
- **Enable email confirmations**: ✅ 켜기
- 사용자는 이메일 확인 후에만 로그인 가능

**옵션 2: 이메일 확인 선택 (개발 중 테스트용)**
- **Enable email confirmations**: ❌ 끄기
- 즉시 로그인 가능 (테스트용)

**현재 설정 확인 방법:**
```sql
-- Supabase SQL Editor에서 실행
SELECT
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

---

### 3. Redirect URL 설정

#### **Authentication → URL Configuration**

**Site URL** (메인 앱 URL):
```
http://localhost:5178
```

**Redirect URLs** (허용된 리다이렉트 URL):
```
http://localhost:5178
http://localhost:5178/**
http://localhost:5173
http://localhost:5174
http://localhost:5175
http://localhost:5176
http://localhost:5177
http://localhost:5178
```

프로덕션 배포 시 추가:
```
https://your-production-domain.com
https://your-production-domain.com/**
```

---

## 🎯 애플리케이션 코드 구현

### 1. 가입 시 자동 이메일 발송

```typescript
// Supabase signUp 호출 시 자동으로 확인 이메일 발송
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    emailRedirectTo: `${window.location.origin}/`,
  },
});

// data.user.email_confirmed_at === null (아직 확인 안됨)
```

### 2. 로그인 시 확인 체크

우리 앱 ([authStore.ts](../src/features/auth/store/authStore.ts))에서 이미 구현됨:

```typescript
login: async (email: string, password: string) => {
  const { data, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // "Email not confirmed" 에러 처리
    if (signInError.message.includes('Email not confirmed')) {
      set({
        needsEmailConfirmation: true,
        confirmationEmail: email,
      });
      return;
    }
  }

  // email_confirmed_at 필드 확인
  if (data.user && !data.user.email_confirmed_at) {
    set({
      needsEmailConfirmation: true,
      confirmationEmail: email,
    });
    return;
  }
}
```

### 3. 확인 UI 표시

[LoginForm.tsx](../src/features/auth/components/LoginForm.tsx)에서 이미 구현됨:
- 이메일 확인 필요 시 안내 화면 표시
- 3단계 가이드 제공
- 로그인 화면으로 돌아가기 버튼

---

## 📱 사용자 경험 흐름

### 정상 흐름

```
1. 사용자 가입 → 확인 이메일 발송
   "가입해주셔서 감사합니다. 이메일을 확인해주세요."

2. 사용자가 이메일 열기 → 확인 링크 클릭
   Supabase가 email_confirmed_at 업데이트

3. 앱으로 리다이렉트 → 자동 로그인
   바로 KP Dashboard로 이동

4. 이후 로그인 시
   이메일 확인 완료되어 즉시 접속 가능
```

### 확인 전 로그인 시도 시

```
1. 사용자가 확인 전 로그인 시도

2. 앱이 이메일 미확인 감지

3. 안내 화면 표시:
   ┌─────────────────────────────┐
   │  📧 이메일 확인이 필요합니다    │
   │                             │
   │  user@example.com 주소로     │
   │  확인 이메일을 보냈습니다.     │
   │                             │
   │  ✅ 이메일 받은편지함 확인      │
   │  ✅ 인증 링크 클릭            │
   │  ✅ 이 페이지로 돌아와서 로그인 │
   │                             │
   │  [로그인 화면으로 돌아가기]     │
   └─────────────────────────────┘
```

---

## 🧪 테스트 방법

### 개발 환경 테스트

#### **방법 1: 실제 이메일 (권장)**
1. 본인 이메일로 가입
2. 이메일 받은편지함 확인
3. 확인 링크 클릭
4. 앱으로 돌아와서 로그인

#### **방법 2: Supabase 이메일 로그 확인**
1. Supabase Dashboard → Logs → Auth Logs
2. 최근 이메일 발송 로그 확인
3. `confirmation_url` 복사
4. 브라우저에 직접 붙여넣기

#### **방법 3: 이메일 확인 강제 설정 (개발용)**
```sql
-- Supabase SQL Editor에서 실행 (테스트 계정만!)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'test@example.com';
```

---

## 🔐 보안 고려사항

### 1. 확인 링크 유효기간
- Supabase 기본값: **24시간**
- 설정: Authentication → Settings → **Email Auth** → **Email Confirmation Token Validity**

### 2. 재발송 기능 (향후 추가 가능)

```typescript
// 확인 이메일 재발송
const resendConfirmationEmail = async (email: string) => {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
    options: {
      emailRedirectTo: `${window.location.origin}/`,
    },
  });

  if (error) {
    console.error('Failed to resend:', error);
  } else {
    alert('확인 이메일을 다시 보냈습니다!');
  }
};
```

### 3. Rate Limiting
- Supabase 자동 적용
- 동일 이메일 재발송: 최대 1회/60초

---

## 🚀 프로덕션 체크리스트

- [ ] **Enable email confirmations** 켜기
- [ ] 커스텀 이메일 템플릿 적용
- [ ] 프로덕션 도메인을 Redirect URLs에 추가
- [ ] 이메일 발송 테스트 (실제 사용자 이메일로)
- [ ] 스팸 폴더 확인 안내 추가
- [ ] 확인 이메일 재발송 기능 구현 (선택)
- [ ] 이메일 제공업체 설정 (Supabase 기본 SMTP vs 커스텀 SMTP)

---

## 📚 관련 문서

- [Supabase Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Supabase Email Auth](https://supabase.com/docs/guides/auth/auth-email)
- [authStore.ts 구현](../src/features/auth/store/authStore.ts)
- [LoginForm.tsx 구현](../src/features/auth/components/LoginForm.tsx)

---

**마지막 업데이트**: 2025-01-12
**작성자**: Claude + VTC Logger Team
