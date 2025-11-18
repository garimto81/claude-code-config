# 🚀 Photo Factory RxDB 초기화 가이드

**목적**: RxDB 데이터베이스 초기화 및 테스트

---

## 📋 사전 준비

### 1. 개발 서버 실행

```bash
cd D:\AI\claude01\contents-factory
npm run dev
```

**서버 주소**: http://localhost:3001 (또는 3000)

### 2. 브라우저 접속

http://localhost:3001/public/index.html

---

## 🔧 자동 초기화 (첫 실행 시)

앱을 처음 열면 자동으로 다음 작업이 실행됩니다:

1. ✅ **설정 검증** (`validateConfig()`)
2. ✅ **RxDB 데이터베이스 초기화** (`initializeDatabase()`)
3. ✅ **기본 사용자 생성** (`ensureDefaultUser()`)

**콘솔 출력 예시**:
```
🔧 RxDB 데이터베이스 초기화 중...
✅ RxDB 초기화 완료
📋 사용 가능한 컬렉션: jobs, photos, users, settings
👥 기존 사용자 수: 0
👤 기본 사용자 생성 중...
✅ 기본 사용자 생성 완료: 기본 기술자

📊 데이터베이스 통계:
   - 작업: 0개
   - 사진: 0개
   - 사용자: 1개
   - 설정: 0개

✅ 앱 초기화 완료
💡 브라우저 콘솔에서 사용 가능한 명령:
   - initDB(): 데이터베이스 초기화
   - resetDB(): 모든 데이터 삭제
   - createSampleData(): 샘플 데이터 생성
```

---

## 🎮 수동 초기화 명령 (브라우저 콘솔)

브라우저에서 F12를 눌러 개발자 도구를 열고 Console 탭에서 다음 명령을 실행하세요.

### 1. 데이터베이스 초기화

```javascript
await initDB()
```

**동작**: RxDB 초기화 및 기본 사용자 생성

**출력**:
```javascript
{
  success: true,
  message: "데이터베이스 초기화 완료",
  stats: {
    jobs: 0,
    photos: 0,
    users: 1,
    settings: 0
  }
}
```

### 2. 샘플 데이터 생성

```javascript
await createSampleData()
```

**동작**: 테스트용 샘플 작업 및 사진 생성

**생성되는 데이터**:
- 1개 작업 (Tesla Model 3)
- 5장 사진 (5개 카테고리)

**출력**:
```javascript
{
  success: true,
  message: "샘플 데이터 생성 완료",
  data: {
    job: { job_number: "WHL240117", car_model: "2024 Tesla Model 3", ... },
    photos: [...]
  }
}
```

### 3. 데이터베이스 초기화 (모든 데이터 삭제)

```javascript
await resetDB()
```

**⚠️ 주의**: 모든 작업과 사진이 삭제됩니다!

**동작**:
- 모든 작업 삭제
- 모든 사진 삭제
- 모든 설정 삭제
- 기본 사용자는 유지

**출력**:
```javascript
{
  success: true,
  message: "모든 데이터가 삭제되었습니다."
}
```

---

## 🔍 IndexedDB 확인

브라우저 개발자 도구에서 데이터베이스 확인:

1. **F12** → **Application** 탭
2. 왼쪽 메뉴: **Storage** → **IndexedDB** → **photofactory**
3. 테이블 선택:
   - `jobs` - 작업 목록
   - `photos` - 사진 목록
   - `users` - 사용자 목록
   - `settings` - 설정

**확인할 필드**:
- `synced`: `false` (로컬 저장, 아직 동기화 안 됨) / `true` (동기화 완료)
- `supabase_id`: `null` (동기화 전) / `"uuid..."` (동기화 후)

---

## 📝 테스트 시나리오

### 시나리오 1: 기본 초기화 테스트

```javascript
// 1. 데이터베이스 초기화
await initDB()

// 2. 샘플 데이터 생성
await createSampleData()

// 3. IndexedDB 확인 (F12 → Application → IndexedDB → photofactory → jobs)
// 예상: 1개 작업, 5장 사진

// 4. 갤러리 페이지 이동
window.location.href = '/public/gallery.html'

// 예상: 샘플 작업이 갤러리에 표시됨
```

### 시나리오 2: 데이터 초기화 및 재생성

```javascript
// 1. 모든 데이터 삭제
await resetDB()

// 2. IndexedDB 확인
// 예상: jobs, photos, settings 비어있음, users는 1개 (기본 사용자)

// 3. 샘플 데이터 재생성
await createSampleData()

// 4. 갤러리 확인
window.location.href = '/public/gallery.html'
```

### 시나리오 3: 실제 업로드 테스트

```javascript
// 1. 데이터 초기화
await resetDB()

// 2. 로그인 (자동 - 기본 사용자)
await window.handleSignIn()

// 3. 업로드 페이지로 이동
// 자동 리다이렉트됨: /public/upload.html

// 4. 사진 업로드
// - 카테고리별로 사진 선택
// - 제목 입력: "실제 테스트 작업"
// - "업로드 완료" 클릭

// 5. IndexedDB 확인
// 예상: 새 작업 및 사진이 synced: false 상태로 저장됨
```

---

## 🐛 문제 해결

### 문제 1: "initDB is not a function"

**원인**: 초기화 스크립트가 로드되지 않음

**해결**:
```javascript
// 페이지 새로고침 (Ctrl + R 또는 F5)
location.reload()
```

### 문제 2: IndexedDB에 데이터가 안 보임

**원인**: 데이터베이스 초기화 실패

**해결**:
```javascript
// 1. 브라우저 콘솔 확인 (에러 메시지)
// 2. IndexedDB 수동 삭제
// F12 → Application → IndexedDB → photofactory 우클릭 → Delete database

// 3. 페이지 새로고침
location.reload()

// 4. 다시 초기화
await initDB()
```

### 문제 3: 샘플 데이터 생성 실패

**원인**: 데이터베이스 미초기화

**해결**:
```javascript
// 1. 데이터베이스 초기화 먼저 실행
await initDB()

// 2. 그 다음 샘플 데이터 생성
await createSampleData()
```

---

## 🎯 다음 단계

초기화가 완료되면:

1. **로그인 테스트**: "Google로 시작하기" 클릭
2. **업로드 테스트**: 사진 업로드 및 제목 입력
3. **갤러리 확인**: 업로드된 작업 조회
4. **오프라인 테스트**: DevTools → Network → Offline 체크 후 동작 확인

---

## 📚 관련 문서

- **IMPLEMENTATION_REPORT.md**: 전체 구현 내용
- **README.md**: 프로젝트 개요
- **src/js/init-db.js**: 초기화 스크립트 소스 코드

---

**작성일**: 2025-11-17
**버전**: v2.0.0
