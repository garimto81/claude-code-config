# Claude CLI Bypass Permission 사용 가이드

## 🚀 자동 Bypass 실행 방법

### 방법 1: 자동 명령어 (가장 간단) ⭐
```powershell
# PowerShell에서
claude-bypass

# CMD에서
powershell -Command "claude-bypass"
```
> 권한 체크 없이 자동 실행됩니다!

### 방법 2: VSCode Task 실행 (추천)
1. `Ctrl+Shift+P` → "Tasks: Run Task"
2. **"Claude CLI (Auto Bypass)"** 선택
3. 통합 터미널에서 Claude 자동 시작

### 방법 3: 배치 파일 실행
```bash
# 자동 모드
.\start-claude-auto.bat

# 또는 기존 방식
.\start-claude-bypass.bat
```

### 방법 4: 설정 파일 사용
```bash
claude --settings ./claude-config.json
```

### 방법 5: 직접 플래그 사용
```bash
claude --dangerously-skip-permissions
```

## ⚙️ 추가 옵션

### Accept Edits 모드 (파일 편집 자동 승인)
```bash
claude --permission-mode acceptEdits
```

### Sandbox Bash 모드
```bash
claude --permission-mode sandboxBashMode
```

### 완전 Bypass 모드
```bash
claude --permission-mode bypassPermissions
# 또는
claude --dangerously-skip-permissions
```

## 🔒 보안 주의사항

⚠️ **경고**: `--dangerously-skip-permissions`는 모든 권한 체크를 우회합니다.

**안전한 사용 조건**:
- 신뢰할 수 있는 프로젝트에서만 사용
- 인터넷 접근이 제한된 샌드박스 환경 권장
- 민감한 파일/데이터가 없는 환경

## 📝 설정 파일

### 자동 실행 관련
- `claude-bypass.cmd`: 자동 bypass 명령어 (`C:\Users\레노버\AppData\Roaming\npm\`)
- `claude-config.json`: Claude CLI 설정 파일
- `start-claude-auto.bat`: 자동 모드 실행 스크립트

### VSCode 통합
- `.vscode/tasks.json`: VSCode 작업 정의 (4가지 모드)
  - Claude CLI (Auto Bypass) ⭐
  - Claude CLI (Bypass Permissions)
  - Claude CLI (With Config)
  - Claude CLI (Normal)

## 🔄 일반 모드로 돌아가기

권한 체크가 필요한 경우:
```bash
claude  # 플래그 없이 실행
```

## 📚 참고

- [Claude CLI 문서](https://docs.claude.com)
- [Permission Model 가이드](https://skywork.ai/blog/permission-model-claude-code-vs-code-jetbrains-cli/)
