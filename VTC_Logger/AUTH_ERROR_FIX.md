# "Failed to initialize auth" 에러 해결 가이드

**문제**: 브라우저에서 "Failed to initialize auth" 메시지 표시

---

## 🔍 원인

### 1. `profiles` 테이블이 없음
- Supabase 마이그레이션이 아직 실행되지 않음
- `authStore.ts`의 `initialize()` 함수에서 `profiles` 테이블 조회 실패

### 2. 코드 흐름
```typescript
// authStore.ts - initialize()
const { data: profile, error: profileError } = await supabase
  .from('profiles')  // ❌ 테이블이 없으면 에러 발생
  .select('*')
  .eq('id', session.user.id)
  .single();

if (profileError) throw profileError;  // 에러 발생
```

---

## ✅ 해결 방법

### Option 1: Supabase 마이그레이션 실행 (권장)

#### Step 1: SQL Editor 열기
1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. 좌측 메뉴 **SQL Editor** 클릭
4. **"New query"** 버튼 클릭

#### Step 2: 마이그레이션 실행
아래 SQL 복사 후 실행:

```sql
-- ========================================
-- VTC Story Ledger - profiles 테이블 생성
-- ========================================

-- 1. profiles 테이블 생성
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('logger', 'camera_supervisor', 'producer')),
  display_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);

-- 2. updated_at 자동 업데이트 함수
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

-- 3. 신규 사용자 자동 프로필 생성
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

-- 4. Row Level Security (RLS) 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 프로필 조회 가능
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- 정책: Producer는 모든 프로필 조회 가능
CREATE POLICY "Producers can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'producer'
    )
  );

-- 정책: 사용자는 자신의 프로필 업데이트 가능 (role 제외)
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role = (SELECT role FROM profiles WHERE id = auth.uid()));

-- 완료
DO $$
BEGIN
  RAISE NOTICE 'Migration completed: profiles table created';
END $$;
```

#### Step 3: 실행 확인
- ✅ "Success. No rows returned" 메시지 확인
- 좌측 메뉴 **Table Editor** 클릭 → `profiles` 테이블 확인

#### Step 4: 테스트 사용자 생성
1. 좌측 메뉴 **Authentication** → **Users** 클릭
2. **"Add user"** 버튼 클릭
3. 사용자 정보 입력:
   ```
   Email: logger@vtc.com
   Password: logger123!@#
   Auto Confirm User: ✅ 체크
   ```
4. **User Metadata (JSON)** 섹션 펼치기:
   ```json
   {
     "role": "logger",
     "display_name": "Test Logger"
   }
   ```
5. **"Create user"** 클릭

#### Step 5: 브라우저 새로고침
- 브라우저에서 `F5` 또는 `Ctrl+R`
- 로그인 시도

---

### Option 2: authStore 임시 수정 (빠른 테스트용)

마이그레이션 전에 임시로 에러를 무시하도록 수정:

#### `vtc-app/src/features/auth/store/authStore.ts` 수정

```typescript
initialize: async () => {
  try {
    set({ isLoading: true, error: null });

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) throw sessionError;

    if (session) {
      // ✨ profiles 테이블 조회 (에러 무시)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      // ⚠️ 임시: 프로필이 없어도 계속 진행
      if (profile) {
        set({ user: profile, session, isLoading: false });
      } else {
        // 프로필 없이도 로그인 유지 (임시)
        console.warn('Profile not found, using session only');
        set({
          user: {
            id: session.user.id,
            email: session.user.email!,
            role: 'logger',
            display_name: session.user.email?.split('@')[0] || 'User',
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          session,
          isLoading: false
        });
      }
    } else {
      set({ user: null, session: null, isLoading: false });
    }
  } catch (error) {
    console.error('Initialize error:', error);
    set({
      error: error instanceof Error ? error.message : 'Failed to initialize auth',
      isLoading: false,
      user: null,
      session: null,
    });
  }
},
```

⚠️ **주의**: 이 방법은 임시 테스트용입니다. 실제로는 Option 1 (마이그레이션)을 사용하세요.

---

### Option 3: 에러 메시지 개선

사용자에게 더 친절한 에러 메시지 표시:

#### `vtc-app/src/features/auth/components/ProtectedRoute.tsx` 수정

```typescript
// 에러 상태 표시
if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(17 24 39)' }}>
      <div className="max-w-md p-8 rounded-lg border" style={{ backgroundColor: 'rgb(31 41 55)', borderColor: 'rgb(220 38 38)' }}>
        <h2 className="text-2xl font-bold text-red-400 mb-4">Database Setup Required</h2>
        <p className="text-gray-300 mb-4">
          The database tables have not been created yet.
        </p>
        <div className="bg-gray-700 p-4 rounded text-sm text-gray-300 mb-4">
          <p className="font-semibold mb-2">To fix this:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Go to Supabase Dashboard</li>
            <li>Run the migration in SQL Editor</li>
            <li>Refresh this page</li>
          </ol>
        </div>
        <p className="text-sm text-gray-400">
          See <code className="bg-gray-700 px-2 py-1 rounded">MIGRATION_GUIDE.md</code> for details.
        </p>
      </div>
    </div>
  );
}
```

---

## 🚀 빠른 해결 (1분)

### 가장 빠른 방법

1. **Supabase Dashboard** 접속
2. **SQL Editor** 열기
3. 위의 SQL 전체 복사/붙여넣기
4. **"Run"** 클릭
5. 브라우저 새로고침

**완료!** 에러 해결됨.

---

## 🔍 에러 확인 방법

### 브라우저 개발자 도구
1. `F12` 키 (개발자 도구 열기)
2. **Console** 탭 클릭
3. 에러 메시지 확인:
   ```
   Initialize error: Error: relation "public.profiles" does not exist
   ```

### Supabase Dashboard
1. **Table Editor** → `profiles` 테이블 확인
2. 테이블이 없으면 → 마이그레이션 실행 필요

---

## 📋 체크리스트

에러 해결 후 확인:

- [ ] Supabase Dashboard → Table Editor → `profiles` 테이블 존재
- [ ] Supabase Dashboard → Authentication → Users → 테스트 사용자 생성
- [ ] 브라우저 새로고침 (`F5`)
- [ ] 로그인 페이지 정상 표시
- [ ] 이메일/비밀번호 로그인 성공
- [ ] 메인 화면 애니메이션 표시
- [ ] 헤더에 사용자 정보 표시

---

## 🎉 해결 완료!

마이그레이션 실행 후:
- ✅ "Failed to initialize auth" 에러 사라짐
- ✅ 로그인 정상 동작
- ✅ 메인 화면 표시
- ✅ Google OAuth 사용 가능

**상세 가이드**: [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

---

**작성일**: 2025-01-12
