# PRD-0003: Agent/Skill 자동 최적화 시스템

**작성일**: 2025-01-13
**버전**: 1.0.0
**타입**: Feature
**우선순위**: High

---

## 1. 개요

Claude Code의 서브 에이전트 및 스킬 사용을 실시간으로 모니터링하고, 실패 시 프롬프트를 자동으로 개선하여 재시도하는 자율 최적화 시스템.

---

## 2. 배경 및 목표

### 문제
- Agent/Skill 실행 실패 시 수동 디버깅 및 재시도 필요
- 모호한 프롬프트로 인한 반복적인 실패
- Agent 선택 오류로 인한 시간 낭비
- 실행 기록이 없어 패턴 분석 불가

### 목표
- Agent/Skill 실행을 실시간으로 모니터링
- 실패 시 프롬프트를 자동으로 개선하여 즉시 재시도
- 실행 기록을 Git 커밋 메타데이터에 저장
- 성공/실패 패턴 학습 및 예방

---

## 3. 요구사항

### 3.1 기능 요구사항

#### FR-1: MCP 서버 구현
- Claude Code와 통신하는 MCP (Model Context Protocol) 서버
- Agent/Skill 실행 이벤트 수신
- 실시간 모니터링 및 로깅

#### FR-2: 실행 감지 및 기록
- Task() 및 Skill() 호출 감지
- Agent 타입, 프롬프트, 파라미터 기록
- 실행 시작/종료 시간 기록
- 성공/실패 상태 감지

#### FR-3: 실패 분석
- 에러 메시지 파싱 및 분류
- 실패 원인 자동 분석:
  - 모호한 프롬프트
  - 잘못된 Agent 선택
  - 파라미터 오류
  - 타임아웃

#### FR-4: 프롬프트 자동 개선
- 실패한 프롬프트를 분석하여 개선:
  - 모호한 표현 → 명확한 지시사항
  - 누락된 컨텍스트 추가
  - 예시 추가
  - 구체적인 기대 결과 명시

#### FR-5: 자동 재시도
- 개선된 프롬프트로 즉시 재실행
- 최대 3회 재시도 (설정 가능)
- 재시도 간격: 지수 백오프 (1s, 2s, 4s)

#### FR-6: Git 커밋 메타데이터 저장
- 커밋 메시지 트레일러 형식:
  ```
  Agent-Usage: [{"agent": "context7-engineer", "status": "success", "duration": "3.2s"}]
  ```
- 실행 기록 누적 저장
- 커밋 히스토리로 추적 가능

### 3.2 비기능 요구사항

#### NFR-1: 성능
- MCP 서버 응답 시간: 100ms 이하
- 프롬프트 개선 시간: 5초 이내
- 최소 오버헤드: 전체 실행 시간의 5% 이내

#### NFR-2: 안정성
- MCP 서버 장애 시 Claude Code 정상 작동
- 네트워크 오류 시 로컬 캐시 사용
- 재시도 실패 시 graceful degradation

#### NFR-3: 확장성
- 여러 레포지토리 지원
- 커스텀 개선 규칙 추가 가능
- 새 Agent/Skill 자동 지원

---

## 4. 기술 스택

- **MCP 서버**: Python (FastAPI 또는 Flask)
- **통신**: WebSocket (실시간) 또는 HTTP (폴링)
- **프롬프트 개선**: Claude API (Sonnet 4)
- **저장**: Git commit trailer
- **설정**: `.claude/optimizer-config.json`

---

## 5. 구현 계획

### 5.1 핵심 컴포넌트

#### 1) MCP 서버 (`mcp-servers/agent-optimizer/`)
```
mcp-servers/agent-optimizer/
├── server.py              # MCP 서버 메인
├── monitor.py             # Agent/Skill 모니터링
├── analyzer.py            # 실패 분석
├── optimizer.py           # 프롬프트 개선
├── git_metadata.py        # Git 메타데이터 저장
└── config.json            # 설정 파일
```

#### 2) Claude Code 통합
- `.claude/claude_desktop_config.json`에 MCP 서버 등록
- Agent/Skill 실행 시 자동으로 MCP 서버에 알림

#### 3) Git Hooks
- `post-commit` 훅: 커밋 메시지에 Agent 사용 기록 추가

### 5.2 워크플로우

```
[Agent/Skill 실행]
→ MCP 서버 이벤트 수신
→ 실행 모니터링
→ 성공/실패 감지
  ├─ 성공 → Git 메타데이터 저장
  └─ 실패 → 실패 분석
            → 프롬프트 개선
            → 자동 재시도 (최대 3회)
            → 최종 결과 저장
```

### 5.3 프롬프트 개선 알고리즘

```python
def improve_prompt(failed_prompt, error_msg):
    analysis = analyze_failure(failed_prompt, error_msg)

    if analysis["cause"] == "ambiguous":
        # 모호한 표현 구체화
        return add_specificity(failed_prompt)

    elif analysis["cause"] == "missing_context":
        # 누락된 컨텍스트 추가
        return add_context(failed_prompt, analysis["context"])

    elif analysis["cause"] == "wrong_agent":
        # 다른 Agent 제안
        return suggest_alternative_agent(failed_prompt)

    else:
        # Claude API로 자동 개선
        return claude_improve(failed_prompt, error_msg)
```

---

## 6. 데이터 구조

### 6.1 Agent 실행 기록

```json
{
  "timestamp": "2025-01-13T12:34:56Z",
  "agent_type": "context7-engineer",
  "prompt": "GitHub Actions 최신 문법 확인",
  "parameters": {
    "model": "sonnet",
    "timeout": 300
  },
  "status": "success",
  "duration": 3.2,
  "attempts": 1,
  "error": null,
  "improved_prompt": null
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
Agent-Usage: [{"agent":"context7-engineer","status":"success","duration":"3.2s"},{"agent":"test-automator","status":"success","duration":"5.1s"}]
```

### 6.3 설정 파일 (`.claude/optimizer-config.json`)

```json
{
  "enabled": true,
  "max_retries": 3,
  "retry_backoff": [1, 2, 4],
  "auto_improve": true,
  "save_to_git": true,
  "improvement_model": "claude-sonnet-4",
  "monitored_agents": ["*"],
  "excluded_agents": []
}
```

---

## 7. 테스트 계획

### 7.1 단위 테스트
- `tests/test_monitor.py`: 모니터링 로직
- `tests/test_analyzer.py`: 실패 분석
- `tests/test_optimizer.py`: 프롬프트 개선
- `tests/test_git_metadata.py`: Git 메타데이터 저장

### 7.2 통합 테스트
- MCP 서버 ↔ Claude Code 통신
- 실패 → 개선 → 재시도 전체 플로우

### 7.3 E2E 테스트
- 실제 Agent 실행 → 실패 유도 → 자동 개선 → 성공 확인

---

## 8. 보안 고려사항

### MCP 서버 보안
- 로컬 전용 (127.0.0.1)
- 인증 토큰 (옵션)
- 프롬프트 민감 정보 필터링

### Git 메타데이터 보안
- API 키, 비밀번호 등 민감 정보 제외
- 프롬프트에서 민감 정보 자동 마스킹

---

## 9. 제약사항 및 리스크

### 제약사항
- MCP 프로토콜 지원 필요 (Claude Code 최신 버전)
- 프롬프트 개선에 Claude API 사용 (비용 발생)
- Git 커밋 메시지 길이 제한

### 리스크
- MCP 서버 장애 시 Claude Code 작동 중단 → Fallback 메커니즘
- 무한 재시도 루프 → 최대 재시도 횟수 제한
- 개선된 프롬프트도 실패 → 수동 개입 필요

---

## 10. 성공 지표

- Agent 실행 성공률: 85% → 95% 향상
- 평균 재시도 횟수: 2회 → 1회 이하
- 수동 디버깅 시간: 70% 감소
- 프롬프트 개선 성공률: 80% 이상

---

## 11. 향후 확장

- [ ] 패턴 학습: 유사 실패 패턴 자동 예방
- [ ] Agent 추천: 작업 유형별 최적 Agent 추천
- [ ] 대시보드: Agent 사용 통계 시각화
- [ ] 팀 공유: 개선된 프롬프트 템플릿 공유
- [ ] A/B 테스트: 여러 프롬프트 버전 자동 테스트

---

## 12. 참조

- [MCP Specification](https://modelcontextprotocol.io/)
- [Claude API Documentation](https://docs.anthropic.com/)
- [Git Commit Trailers](https://git-scm.com/docs/git-interpret-trailers)
- CLAUDE.md Agent 섹션
- docs/AGENTS_REFERENCE.md

---

**문서 버전**: 1.0.0
**작성자**: Claude Code
**검토 필요**: ✅ PRD 승인 후 Phase 0.5로 진행
