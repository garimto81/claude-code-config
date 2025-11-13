# Claude CLI Bypass Permission 빠른 시작

**목적**: 자동 권한 승인으로 Claude CLI 빠른 실행

**버전**: 2.0.37 | **환경**: Windows 11, VSCode

---

## 실행 방법

### 1. 자동 명령어 (가장 간단) ⭐

```powershell
# PowerShell
claude-bypass

# CMD
powershell -Command "claude-bypass"
```

### 2. VSCode Task (추천)

1. `Ctrl+Shift+P`
2. "Tasks: Run Task"
3. **"Claude CLI (Auto Bypass)"** 선택

### 3. 배치 파일

```bash
# 자동 모드
.\start-claude-auto.bat

# 기존 방식
.\start-claude-bypass.bat
```

---

## 실행 모드

| 모드 | 명령어 | 설명 |
|------|--------|------|
| Auto Bypass ⭐ | `claude-bypass` | 자동 권한 승인 |
| Bypass | `claude --dangerously-skip-permissions` | 플래그 사용 |
| Config | `claude --settings ./claude-config.json` | 설정 파일 |
| Normal | `claude` | 일반 모드 |

---

## 추가 옵션

```bash
# Accept Edits (파일 편집 자동 승인)
claude --permission-mode acceptEdits

# Sandbox Bash
claude --permission-mode sandboxBashMode

# Bypass
claude --permission-mode bypassPermissions
```

---

## 설정 파일

### 시스템 전역
- `%APPDATA%\npm\claude-bypass.cmd`
- `%APPDATA%\npm\claude-bypass.ps1`

### 프로젝트 로컬
- `.vscode/tasks.json` - VSCode 작업 (4모드)
- `claude-config.json` - CLI 설정
- `start-claude-auto.bat` - 빠른 실행

---

## 보안 주의

⚠️ **경고**: Bypass 모드는 모든 권한 체크를 우회합니다.

**안전한 사용**:
- ✅ 신뢰할 수 있는 프로젝트
- ✅ 로컬 개발 환경
- ❌ 프로덕션 서버 금지
- ❌ 민감한 데이터 주의

---

## 참고

- [Claude CLI 문서](https://docs.claude.com)
- [Permission Model](https://skywork.ai/blog/permission-model-claude-code-vs-code-jetbrains-cli/)
- [GitHub Issues](https://github.com/anthropics/claude-code/issues)

---

**설정일**: 2025-01-12
