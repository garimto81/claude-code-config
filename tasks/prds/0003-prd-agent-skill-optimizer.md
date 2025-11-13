# PRD-0003: Agent/Skill 자동 최적화 시스템 (Git Hooks 기반)

**작성일**: 2025-01-13
**버전**: 1.1.0 (Git Hooks 기반으로 수정)
**타입**: Feature
**우선순위**: High

---

## 1. 개요

Claude Code의 서브 에이전트 및 스킬 사용을 Git 커밋 시점에 분석하고, 실패 패턴을 감지하여 프롬프트 개선 제안을 자동 생성하는 시스템.

**핵심 변경**: MCP 실시간 모니터링 → Git Hooks 기반 사후 분석

---

## 2. 배경 및 목표

### 문제
- Agent/Skill 실행 실패 시 수동 디버깅 필요
- 모호한 프롬프트로 인한 반복적인 실패
- Agent 선택 오류로 인한 시간 낭비
- 실행 기록이 없어 패턴 분석 불가
- **제약**: MCP는 실시간 이벤트 스트리밍 미지원

### 목표
- 커밋 시점에 Claude Code 로그 분석
- Agent/Skill 사용 패턴 자동 추출
- 실패 감지 시 프롬프트 개선 제안 생성
- 실행 기록을 Git 커밋 메타데이터에 저장
- 성공/실패 패턴 학습 및 예방

---

## 3. 요구사항

### 3.1 기능 요구사항

#### FR-1: Git Hooks 구현
- `post-commit` hook 구현
- 커밋 발생 시 자동 실행
- Claude Code 로그 파일 위치 감지
- 백그라운드 실행 (커밋 속도 영향 최소화)

#### FR-2: 로그 파일 분석
- Claude Code 로그 파일 파싱
- Agent/Skill 실행 기록 추출:
  - Task() 호출: agent_type, prompt, parameters
  - Skill() 호출: skill_name, arguments
  - 실행 시간 (시작/종료)
  - 성공/실패 상태
  - 에러 메시지 (실패 시)

**로그 위치**:
- Windows: `%APPDATA%\Claude\logs\`
- macOS: `~/Library/Logs/Claude/`
- Linux: `~/.config/Claude/logs/`

#### FR-3: 실행 기록 추출
- 로그 파일에서 Agent/Skill 호출 패턴 감지
- JSON 형식으로 구조화:
  ```json
  {
    "timestamp": "2025-01-13T12:34:56Z",
    "type": "agent",
    "agent_type": "context7-engineer",
    "prompt": "GitHub Actions 최신 문법 확인",
    "status": "success",
    "duration": 3.2,
    "error": null
  }
  ```

#### FR-4: 실패 분석
- 에러 메시지 파싱 및 분류
- 실패 원인 자동 분석:
  - 모호한 프롬프트
  - 잘못된 Agent 선택
  - 파라미터 오류
  - 타임아웃
  - API 에러

#### FR-5: 프롬프트 개선 제안 생성
- 실패한 프롬프트를 Claude API로 분석
- 개선 제안 생성:
  - 모호한 표현 → 명확한 지시사항
  - 누락된 컨텍스트 추가
  - 예시 추가
  - 구체적인 기대 결과 명시
- 개선 제안을 `.claude/improvement-suggestions.md`에 저장

#### FR-6: Git 커밋 메타데이터 저장
- 커밋 메시지 트레일러 형식:
  ```
  Agent-Usage: [{"agent":"context7-engineer","status":"success","duration":"3.2s"},{"agent":"test-automator","status":"failed","error":"timeout"}]
  ```
- `git commit --amend` 사용하여 메타데이터 추가
- 실행 기록 누적 저장
- 커밋 히스토리로 추적 가능

#### FR-7: 개선 제안 알림
- 실패 감지 시 콘솔 출력:
  ```
  ⚠️ Agent 실행 실패 감지!
  - Agent: test-automator
  - 원인: timeout
  - 개선 제안: .claude/improvement-suggestions.md 참조
  ```
- 개선 제안 파일 자동 생성

### 3.2 비기능 요구사항

#### NFR-1: 성능
- post-commit hook 실행 시간: 3초 이내
- 로그 파일 파싱: 대용량 로그 처리 (스트리밍)
- 커밋 속도 영향: 5% 이내

#### NFR-2: 안정성
- Git hook 실패 시 커밋 진행 (non-blocking)
- 로그 파일 없을 시 graceful skip
- 파싱 에러 시 로그만 남기고 진행

#### NFR-3: 확장성
- 여러 레포지토리 지원
- 커스텀 개선 규칙 추가 가능
- 새 Agent/Skill 자동 지원

---

## 4. 기술 스택

- **Git Hooks**: post-commit (Bash/Python)
- **로그 파싱**: Python (정규식)
- **프롬프트 개선**: Claude API (Sonnet 4)
- **저장**: Git commit trailer + `.claude/improvement-suggestions.md`
- **설정**: `.claude/optimizer-config.json`

---

## 5. 구현 계획

### 5.1 핵심 컴포넌트

#### 1) Git Hooks (`.git/hooks/post-commit`)
```bash
#!/bin/bash
# post-commit hook
python .claude/scripts/analyze-agent-usage.py &
```

#### 2) 로그 분석 스크립트 (`.claude/scripts/analyze-agent-usage.py`)
```python
import json
import re
from pathlib import Path

def parse_claude_logs():
    # 로그 파일 위치 감지
    log_dir = get_claude_log_dir()

    # 최근 로그 파일 읽기
    latest_log = find_latest_log(log_dir)

    # Agent/Skill 호출 추출
    agent_calls = extract_agent_calls(latest_log)

    return agent_calls
```

#### 3) 실패 분석기 (`.claude/scripts/analyzer.py`)
```python
def analyze_failure(agent_call):
    if agent_call["status"] == "failed":
        cause = classify_error(agent_call["error"])
        return {
            "cause": cause,
            "original_prompt": agent_call["prompt"],
            "error_msg": agent_call["error"]
        }
```

#### 4) 프롬프트 개선기 (`.claude/scripts/optimizer.py`)
```python
import anthropic

def improve_prompt(failed_prompt, error_msg):
    client = anthropic.Anthropic()

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        messages=[{
            "role": "user",
            "content": f"""
            이 프롬프트가 실패했습니다:
            {failed_prompt}

            에러: {error_msg}

            더 명확하고 구체적인 프롬프트로 개선해주세요.
            """
        }]
    )

    return message.content[0].text
```

#### 5) Git 메타데이터 저장 (`.claude/scripts/git_metadata.py`)
```python
import subprocess

def add_agent_usage_trailer(agent_calls):
    # Agent 사용 기록을 JSON으로 직렬화
    usage_data = json.dumps([
        {
            "agent": call["agent_type"],
            "status": call["status"],
            "duration": f"{call['duration']}s"
        }
        for call in agent_calls
    ], separators=(',', ':'))

    # 커밋 메시지 수정
    subprocess.run([
        "git", "commit", "--amend", "--no-edit",
        "-m", f"Agent-Usage: {usage_data}"
    ])
```

### 5.2 워크플로우

```
[Commit 발생]
→ post-commit hook 실행
→ Claude Code 로그 파일 분석
→ Agent/Skill 실행 기록 추출
  ├─ 성공 → Git 메타데이터 저장
  └─ 실패 → 실패 분석
            → 프롬프트 개선 제안 생성
            → 개선 제안 파일 저장
            → Git 메타데이터 저장
→ 결과 출력 (콘솔)
```

---

## 6. 데이터 구조

### 6.1 Agent 실행 기록

```json
{
  "timestamp": "2025-01-13T12:34:56Z",
  "type": "agent",
  "agent_type": "context7-engineer",
  "prompt": "GitHub Actions 최신 문법 확인",
  "parameters": {
    "model": "sonnet"
  },
  "status": "success",
  "duration": 3.2,
  "error": null
}
```

### 6.2 Git 커밋 트레일러

```
feat: Add feature (v1.0.0) [PRD-0001]

Changes:
- Feature A
- Feature B

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
Agent-Usage: [{"agent":"context7-engineer","status":"success","duration":"3.2s"}]
```

### 6.3 개선 제안 파일 (`.claude/improvement-suggestions.md`)

```markdown
# Agent/Skill 개선 제안

## 2025-01-13 12:34:56

### 실패한 Agent: test-automator
**원본 프롬프트**:
```
테스트 작성
```

**실패 원인**: 모호한 프롬프트

**개선된 프롬프트**:
```
다음 파일에 대한 단위 테스트를 작성해주세요:
- 파일: src/utils.py
- 테스트 파일: tests/test_utils.py
- 프레임워크: pytest
- 커버리지 목표: 80% 이상
- 테스트 케이스: 정상 케이스, 엣지 케이스, 에러 케이스
```
```

### 6.4 설정 파일 (`.claude/optimizer-config.json`)

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

---

## 7. 로그 파일 분석 상세

### 7.1 Claude Code 로그 형식

Claude Code 로그 파일 예시:
```
[2025-01-13 12:34:56] INFO: Task execution started
[2025-01-13 12:34:56] DEBUG: Agent type: context7-engineer
[2025-01-13 12:34:56] DEBUG: Prompt: "GitHub Actions 최신 문법 확인"
[2025-01-13 12:34:59] INFO: Task execution completed (3.2s)
[2025-01-13 12:35:00] INFO: Task execution started
[2025-01-13 12:35:00] DEBUG: Agent type: test-automator
[2025-01-13 12:35:05] ERROR: Task execution failed: timeout
```

### 7.2 파싱 패턴

```python
import re

# Task 시작 패턴
TASK_START = re.compile(r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] INFO: Task execution started')

# Agent 타입 패턴
AGENT_TYPE = re.compile(r'\[.*?\] DEBUG: Agent type: (.+)')

# 프롬프트 패턴
PROMPT = re.compile(r'\[.*?\] DEBUG: Prompt: "(.+)"')

# 완료 패턴
TASK_COMPLETE = re.compile(r'\[.*?\] INFO: Task execution completed \((\d+\.\d+)s\)')

# 실패 패턴
TASK_FAILED = re.compile(r'\[.*?\] ERROR: Task execution failed: (.+)')
```

---

## 8. 테스트 계획

### 8.1 단위 테스트
- `tests/test_log_parser.py`: 로그 파싱 로직
- `tests/test_analyzer.py`: 실패 분석
- `tests/test_optimizer.py`: 프롬프트 개선
- `tests/test_git_metadata.py`: Git 메타데이터 저장

### 8.2 통합 테스트
- Git hook 실행 → 로그 분석 → 메타데이터 저장 전체 플로우

### 8.3 E2E 테스트
- 실제 커밋 → 로그 분석 → 개선 제안 생성 → Git 메타데이터 확인

---

## 9. 보안 고려사항

### 로그 파일 보안
- API 키, 비밀번호 등 민감 정보 필터링
- 프롬프트에서 민감 정보 자동 마스킹
- 개선 제안 파일 `.gitignore`에 추가

### Git 메타데이터 보안
- 민감 정보 포함 여부 자동 검사
- 검사 실패 시 메타데이터 저장 스킵

---

## 10. 제약사항 및 리스크

### 제약사항
- **실시간 모니터링 불가**: 커밋 시점에만 분석
- **재시도 불가**: 개선 제안만 생성, 자동 재실행은 불가
- 로그 파일 형식 변경 시 파서 업데이트 필요
- Git 커밋 메시지 길이 제한

### 리스크
- 로그 파일 형식 변경 → 파서 오류 → Fallback 메커니즘
- 대용량 로그 파일 → 파싱 지연 → 스트리밍 처리
- Git hook 실패 → 커밋 영향 없도록 non-blocking

---

## 11. 성공 지표

- Agent 실행 실패 재발률: 70% 감소
- 프롬프트 개선 제안 정확도: 80% 이상
- 커밋 속도 영향: 5% 이내
- 수동 디버깅 시간: 50% 감소

---

## 12. 향후 확장

- [ ] 패턴 학습: 유사 실패 패턴 자동 예방
- [ ] Agent 추천: 작업 유형별 최적 Agent 추천
- [ ] 대시보드: Agent 사용 통계 시각화
- [ ] 팀 공유: 개선된 프롬프트 템플릿 공유
- [ ] 실시간 모니터링: MCP 프로토콜 개선 시 추가

---

## 13. MCP 서버와의 비교

| 항목 | MCP 서버 (원안) | Git Hooks (수정안) |
|------|----------------|-------------------|
| 실시간 감지 | ✅ | ❌ (커밋 시점만) |
| 자동 재시도 | ✅ | ❌ (제안만) |
| 구현 복잡도 | 높음 | 낮음 |
| 기술 제약 | MCP 이벤트 미지원 | Git만 필요 |
| 성능 영향 | 상시 | 커밋 시점만 |
| 확장성 | 제한적 | 높음 |

---

## 14. 참조

- [Git Hooks Documentation](https://git-scm.com/docs/githooks)
- [Git Commit Trailers](https://git-scm.com/docs/git-interpret-trailers)
- [Claude API Documentation](https://docs.anthropic.com/)
- CLAUDE.md Agent 섹션
- docs/AGENTS_REFERENCE.md

---

**문서 버전**: 1.1.0 (Git Hooks 기반)
**작성자**: Claude Code
**검토 필요**: ✅ PRD 승인 후 Phase 1로 진행
