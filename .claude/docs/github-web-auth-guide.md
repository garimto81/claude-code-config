# GitHub CLI 웹 인증 가이드

## 🔐 웹 인증 설정 (토큰 불필요)

### 1단계: GitHub CLI 로그인
```powershell
gh auth login
```

### 2단계: 옵션 선택
다음 프롬프트에서 아래와 같이 선택하세요:

1. **What account do you want to log into?**
   - 선택: `GitHub.com`

2. **What is your preferred protocol for Git operations?**
   - 선택: `HTTPS`

3. **Authenticate GitHub CLI**
   - 선택: `Login with a web browser`

4. **일회용 코드 복사**
   - 화면에 표시되는 8자리 코드를 복사하세요
   - 예: `XXXX-XXXX`

### 3단계: 브라우저 인증
1. 브라우저가 자동으로 열립니다
   - 또는 수동으로 방문: https://github.com/login/device
2. 일회용 코드 입력
3. GitHub 계정으로 로그인 (이미 로그인된 경우 생략)
4. Claude Code 앱 권한 승인

### 4단계: 인증 확인
```powershell
gh auth status
```

성공 시 출력:
```
✓ Logged in to github.com as [your-username]
```

## 🔄 Gist 동기화 사용법

### 첫 백업 생성
```powershell
claude sync
```
또는
```powershell
node .claude\bin\claude-gist-sync.js create
```

### 백업 업데이트
```powershell
claude sync
```

### 백업 복원
```powershell
claude sync restore
```

### 동기화 상태 확인
```powershell
claude sync status
```

## 💡 장점

### 1. 토큰 관리 불필요
- 환경 변수 설정 불필요
- 토큰 만료 걱정 없음
- 보안 위험 감소

### 2. 멀티 디바이스 지원
- 각 디바이스에서 `gh auth login` 한 번만 실행
- 디바이스별로 독립적인 인증
- 토큰 공유 불필요

### 3. 자동 권한 관리
- GitHub이 자동으로 권한 관리
- 필요 시 재인증 요청
- OAuth 2.0 보안 표준

## 🔧 문제 해결

### 인증 실패 시
```powershell
# 기존 인증 제거
gh auth logout

# 다시 로그인
gh auth login
```

### Gist 권한 문제
```powershell
# 권한 갱신
gh auth refresh
```

### 프록시 환경
```powershell
# 프록시 설정
set HTTPS_PROXY=http://proxy.company.com:8080
gh auth login
```

## 📝 참고사항

- 인증은 디바이스당 1회만 필요
- 인증 정보는 안전하게 시스템에 저장됨
- GitHub CLI가 토큰을 자동 관리
- 90일마다 자동 갱신

---

마지막 업데이트: 2025-09-28
버전: v4.1 (Web Auth Edition)