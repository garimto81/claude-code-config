# Agent/Skill 자동 최적화 가이드

**버전**: 1.0.0 | **업데이트**: 2025-01-13

---

## 📌 개요

Agent/Skill 자동 최적화 시스템은 Claude Code의 Agent 및 Skill 사용 패턴을 자동으로 분석하고, 실패한 작업에 대해 개선 제안을 생성하는 Git Hooks 기반 시스템입니다.

### 핵심 기능

1. **자동 로그 분석**: 커밋 시 Claude Code 로그 파일 자동 파싱
2. **실패 원인 분류**: 5가지 실패 유형 자동 감지 및 분류
3. **프롬프트 개선**: Claude API를 활용한 자동 개선 제안 생성
4. **Git 메타데이터**: 커밋 메시지에 Agent 사용 정보 자동 추가
5. **알림 시스템**: 실패 감지 시 콘솔 알림 및 파일 저장

---

## 🚀 빠른 시작

### 1. 설치

시스템은 이미 설치되어 있으며, 다음 파일들이 포함되어 있습니다:

```bash
.claude/
├── hooks/
│   └── post-commit              # Git hook (자동 실행)
├── scripts/
│   └── analyze_agent_usage.py   # 분석 엔진
├── optimizer-config.json        # 설정 파일
└── improvement-suggestions.md   # 개선 제안 (자동 생성)
```

### 2. Git Hook 활성화

Windows (PowerShell):
```powershell
# Symlink 생성 (관리자 권한 필요)
New-Item -ItemType SymbolicLink -Path .git\hooks\post-commit -Target .claude\hooks\post-commit
```

Windows (Git Bash):
```bash
# 복사 방식
cp .claude/hooks/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

Unix/Linux/macOS:
```bash
# Symlink 생성 (권장)
ln -s ../../.claude/hooks/post-commit .git/hooks/post-commit

# 또는 복사 방식
cp .claude/hooks/post-commit .git/hooks/post-commit
chmod +x .git/hooks/post-commit
```

### 3. 의존성 설치

```bash
pip install -r requirements.txt
# 또는
pip install anthropic>=0.40.0
```

### 4. API 키 설정 (프롬프트 개선 사용 시)

```bash
# Windows
set ANTHROPIC_API_KEY=your_api_key_here

# Unix/Linux/macOS
export ANTHROPIC_API_KEY=your_api_key_here
```

또는 `.env` 파일 사용:
```bash
# .env
ANTHROPIC_API_KEY=your_api_key_here
```

---

## ⚙️ 설정

### 기본 설정 (`.claude/optimizer-config.json`)

```json
{
  "enabled": true,
  "log_analysis": {
    "max_log_size_mb": 10,
    "parse_timeout_seconds": 5
  },
  "improvement": {
    "auto_generate": true,
    "model": "claude-sonnet-4-20250514",
    "max_suggestions": 5
  },
  "git_metadata": {
    "enabled": true,
    "use_trailer": true,
    "amend_commit": true
  },
  "notification": {
    "console_output": true,
    "save_to_file": true
  }
}
```

### 설정 옵션 설명

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `enabled` | 시스템 전체 활성화 여부 | `true` |
| `log_analysis.max_log_size_mb` | 분석할 최대 로그 파일 크기 (MB) | `10` |
| `log_analysis.parse_timeout_seconds` | 로그 파싱 타임아웃 (초) | `5` |
| `improvement.auto_generate` | 자동 개선 제안 생성 여부 | `true` |
| `improvement.model` | Claude API 모델 | `claude-sonnet-4-20250514` |
| `improvement.max_suggestions` | 최대 개선 제안 개수 | `5` |
| `git_metadata.enabled` | Git 메타데이터 저장 여부 | `true` |
| `git_metadata.use_trailer` | Git trailer 형식 사용 | `true` |
| `git_metadata.amend_commit` | 커밋 메시지 자동 수정 | `true` |
| `notification.console_output` | 콘솔 출력 여부 | `true` |
| `notification.save_to_file` | 파일 저장 여부 | `true` |

---

## 📊 작동 방식

### 1. Git Hook 트리거

커밋이 완료되면 `post-commit` hook이 자동으로 실행됩니다:

```python
# .claude/hooks/post-commit
subprocess.Popen(
    ["python", "analyze_agent_usage.py"],
    # 백그라운드 실행 (커밋 블로킹 안 함)
)
```

### 2. 로그 파일 위치 감지

OS별로 Claude Code 로그 디렉토리를 자동 감지:

- **Windows**: `%APPDATA%\Claude\logs\`
- **macOS**: `~/Library/Logs/Claude/`
- **Linux**: `~/.config/Claude/logs/`

### 3. 로그 파싱

정규식을 사용하여 Agent/Skill 실행 정보 추출:

```python
# 추출 정보
{
  "timestamp": "2025-01-13T10:00:00Z",
  "agent_type": "context7-engineer",
  "prompt": "Verify React documentation",
  "status": "success",  # or "failed"
  "duration": 3.2,
  "error": None  # or error message
}
```

### 4. 실패 원인 분류

5가지 실패 유형 자동 감지:

| 실패 원인 | 키워드 | 예시 |
|-----------|--------|------|
| `timeout` | timeout, timed out, time limit | "Timeout after 30 seconds" |
| `missing_context` | not found, cannot find, missing | "Cannot find file test.py" |
| `parameter_error` | invalid, error, failed to parse | "Invalid parameter: missing file_path" |
| `ambiguous_prompt` | (프롬프트 길이 < 20자) | "Do task" |
| `api_error` | (기타 에러) | "API rate limit exceeded" |

### 5. 프롬프트 개선 생성

Claude API를 사용하여 개선된 프롬프트 생성:

```python
prompt = f"""이 프롬프트가 Agent 실행에 실패했습니다:

Agent: {agent_type}
원본 프롬프트: "{original_prompt}"
실패 원인: {failure_cause}
에러: {error}

더 명확하고 구체적인 프롬프트로 개선해주세요."""

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    messages=[{"role": "user", "content": prompt}]
)
```

### 6. Git 메타데이터 저장

커밋 메시지에 Agent 사용 정보 추가 (Git trailer 형식):

```bash
feat: Add auth system (v1.0.0) [PRD-0001]

Implementation details...

Agent-Usage: [{"agent":"context7-engineer","status":"success","duration":"3.2s"},{"agent":"playwright-engineer","status":"failed","error":"timeout"}]
```

---

## 📁 출력 파일

### `.claude/improvement-suggestions.md`

개선 제안이 자동으로 추가되는 마크다운 파일:

```markdown
## 2025-01-13 10:15:23

### Failed Agent: playwright-engineer
**Original Prompt**: Run E2E tests
**Error**: Timeout after 30 seconds
**Improved Prompt**: Run end-to-end authentication tests with explicit 60-second timeout and detailed element selectors for login flow

---

### Failed Agent: seq-engineer
**Original Prompt**: Do task
**Error**: Ambiguous prompt
**Improved Prompt**: Analyze the user authentication requirements and break down into sequential implementation steps including: 1) Database schema design, 2) API endpoint creation, 3) Frontend integration

---
```

### `.claude/optimizer-error.log`

에러 로그 파일 (디버깅용):

```
2025-01-13 10:15:23: Log parsing error: [Errno 2] No such file or directory
2025-01-13 10:16:45: Improvement generation error: API rate limit exceeded
```

---

## 🔍 사용 예시

### 정상 작동 시나리오

1. **커밋 실행**:
```bash
git commit -m "feat: Add feature (v1.0.0) [PRD-0001]"
```

2. **백그라운드 분석** (자동):
   - Claude Code 로그 파일 읽기
   - Agent 호출 3개 감지 (2개 성공, 1개 실패)
   - 실패 원인 분석: `timeout`

3. **개선 제안 생성** (자동):
   - Claude API 호출
   - 개선된 프롬프트 생성
   - `.claude/improvement-suggestions.md`에 추가

4. **Git 메타데이터 추가** (자동):
   - 커밋 메시지 수정: `Agent-Usage: [...]` 추가
   - `git commit --amend --no-verify`

5. **콘솔 알림**:
```
⚠️  Agent execution failures detected!
  - Agent: playwright-engineer
    Error: Timeout after 30 seconds

💡 See improvement suggestions: .claude/improvement-suggestions.md
```

### 실패 시 시나리오

시스템은 **절대 커밋을 블로킹하지 않습니다**:

- 로그 파일 없음 → 조용히 종료
- API 키 없음 → 개선 제안 스킵, 나머지는 실행
- Git 명령 실패 → 에러 로그에 기록, 커밋은 유지

---

## 🐛 문제 해결

### 1. Git Hook이 실행되지 않음

**증상**: 커밋 후 아무 출력도 없음

**해결**:
```bash
# Hook 파일 존재 확인
ls -la .git/hooks/post-commit

# 실행 권한 확인
chmod +x .git/hooks/post-commit

# 수동 실행 테스트
python .claude/scripts/analyze_agent_usage.py
```

### 2. 개선 제안이 생성되지 않음

**증상**: 실패 감지는 되지만 improvement-suggestions.md가 업데이트 안 됨

**해결**:
```bash
# API 키 확인
echo $ANTHROPIC_API_KEY  # Unix/Linux/macOS
echo %ANTHROPIC_API_KEY%  # Windows

# anthropic 패키지 설치 확인
pip show anthropic

# 수동 테스트
python -c "import anthropic; print('OK')"
```

**설정으로 비활성화**:
```json
{
  "improvement": {
    "auto_generate": false
  }
}
```

### 3. Git 메타데이터가 추가되지 않음

**증상**: 커밋 메시지에 `Agent-Usage:` 트레일러 없음

**해결**:
```bash
# 설정 확인
cat .claude/optimizer-config.json | grep -A3 git_metadata

# 수동 테스트 (마지막 커밋 메시지 확인)
git log -1 --pretty=%B

# 설정으로 비활성화/활성화
{
  "git_metadata": {
    "enabled": true,
    "amend_commit": true
  }
}
```

### 4. 커밋이 느려짐

**증상**: 커밋 후 대기 시간이 김

**원인**: Git hook이 백그라운드가 아닌 foreground에서 실행 중

**해결**:
1. `.git/hooks/post-commit` 파일이 올바른지 확인
2. 파일이 `.claude/hooks/post-commit`과 동일한지 확인
3. Python이 백그라운드로 실행되는지 확인

**임시 해결** (개선 제안 비활성화):
```json
{
  "improvement": {
    "auto_generate": false
  }
}
```

### 5. 로그 파일을 찾을 수 없음

**증상**: "No log file found" 에러

**해결**:
```bash
# OS별 로그 디렉토리 확인
# Windows
echo %APPDATA%\Claude\logs\
dir %APPDATA%\Claude\logs\

# macOS
ls ~/Library/Logs/Claude/

# Linux
ls ~/.config/Claude/logs/

# 로그 파일이 없다면 Claude Code 실행 후 재시도
```

---

## 🧪 테스트

### 단위 테스트 실행

```bash
# 의존성 설치
pip install -r requirements-test.txt

# 모든 테스트 실행
pytest tests/ -v

# 특정 테스트 파일 실행
pytest tests/test_log_parser.py -v

# 커버리지 리포트
pytest tests/ --cov=.claude/scripts --cov-report=html
```

### 수동 테스트

```bash
# 1. 분석 스크립트 직접 실행
python .claude/scripts/analyze_agent_usage.py

# 2. 특정 로그 파일 분석 (디버깅용)
# analyze_agent_usage.py 수정하여 log_path 하드코딩

# 3. 설정 변경 테스트
# optimizer-config.json 수정 후 재실행
```

---

## 📈 성능 및 영향

### 성능

- **로그 파싱**: < 1초 (10MB 로그 파일 기준)
- **실패 분석**: < 0.1초 (100개 호출 기준)
- **개선 제안 생성**: 2-5초 (Claude API 호출 당)
- **Git 메타데이터 추가**: < 0.5초

### 커밋 영향

- **백그라운드 실행**: 커밋 완료 즉시 반환
- **블로킹 없음**: 에러 발생 시에도 커밋은 완료됨
- **성능 저하 없음**: 사용자 경험에 영향 없음

---

## 🔒 보안 고려사항

### 민감 정보 필터링

Git 메타데이터에는 다음 정보만 포함:
- Agent 타입
- 실행 상태 (success/failed)
- 실행 시간 (duration)
- 실패 원인 (failure_cause)

다음 정보는 **포함되지 않음**:
- 프롬프트 원문
- 에러 메시지 상세
- 파일 경로
- API 키 등 credential

### API 키 관리

- `.env` 파일은 `.gitignore`에 포함
- API 키는 환경변수로만 관리
- 커밋에 API 키가 포함되지 않도록 주의

---

## 🔄 업데이트

### 시스템 업데이트

```bash
# 1. 최신 코드 Pull
git pull origin master

# 2. Git hook 재설정 (변경된 경우)
cp .claude/hooks/post-commit .git/hooks/post-commit

# 3. 의존성 업데이트
pip install -r requirements.txt --upgrade
```

### 설정 마이그레이션

새 버전에서 설정 옵션이 추가된 경우:
1. `.claude/optimizer-config.json` 백업
2. 새 템플릿 참조하여 옵션 추가
3. 기존 값 유지

---

## 🤝 기여

버그 리포트 및 기능 제안:
1. 이슈 생성: [GitHub Issues](https://github.com/your-repo/issues)
2. PR 제출: [Contributing Guide](../CONTRIBUTING.md)

---

## 📚 참조

- [CLAUDE.md](../CLAUDE.md) - 전체 개발 워크플로우
- [PRD-0003](../tasks/prds/0003-prd-agent-skill-optimizer.md) - 요구사항 문서
- [Claude Code Docs](https://docs.anthropic.com/en/docs/claude-code) - 공식 문서

---

*최종 업데이트: 2025-01-13*
