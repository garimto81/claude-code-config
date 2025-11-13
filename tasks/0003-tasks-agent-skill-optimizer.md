# Tasks for PRD-0003: Agent/Skill 자동 최적화 시스템 (Git Hooks 기반)

**PRD**: tasks/prds/0003-prd-agent-skill-optimizer.md
**생성일**: 2025-01-13
**버전**: 1.1.0 (Git Hooks 기반으로 수정)

---

## Parent Tasks (Phase 1-6)

### Task 0.0: Feature Branch 생성
- [x] 0.0.1 브랜치 생성: `feature/PRD-0003-agent-optimizer`
- [x] 0.0.2 로컬 환경 설정 확인

### Task 1.0: Git Hooks 구현
- [x] 1.1 `.git/hooks/post-commit` hook 작성
- [x] 1.2 백그라운드 실행 설정
- [x] 1.3 Hook 실행 테스트

### Task 2.0: 로그 파일 분석 시스템 구현
- [x] 2.1 `.claude/scripts/analyze-agent-usage.py` 작성
- [x] 2.2 Claude Code 로그 파일 위치 감지 로직
- [x] 2.3 로그 파일 파싱 (정규식)
- [x] 2.4 Agent/Skill 호출 추출

### Task 3.0: 실패 분석 엔진 구현
- [x] 3.1 `.claude/scripts/analyzer.py` 작성
- [x] 3.2 에러 메시지 파싱 로직
- [x] 3.3 실패 원인 분류 (모호한 프롬프트, 잘못된 Agent 등)
- [x] 3.4 실패 패턴 데이터베이스 구축

### Task 4.0: 프롬프트 개선 엔진 구현
- [x] 4.1 `.claude/scripts/optimizer.py` 작성
- [x] 4.2 Claude API 통합 (프롬프트 개선)
- [x] 4.3 개선 제안 생성 로직
- [x] 4.4 `.claude/improvement-suggestions.md` 파일 생성

### Task 5.0: Git 메타데이터 저장 구현
- [x] 5.1 `.claude/scripts/git_metadata.py` 작성
- [x] 5.2 커밋 메시지 트레일러 형식 구현
- [x] 5.3 민감 정보 필터링
- [x] 5.4 `git commit --amend` 통합

### Task 6.0: 설정 시스템 구현
- [x] 6.1 `.claude/optimizer-config.json` 템플릿 작성
- [x] 6.2 설정 파일 파서 구현
- [x] 6.3 런타임 설정 변경 지원
- [x] 6.4 기본값 및 검증 로직

### Task 7.0: 알림 시스템 구현
- [x] 7.1 콘솔 출력 포매팅
- [x] 7.2 실패 감지 시 알림 메시지 생성
- [x] 7.3 개선 제안 파일 링크 표시

### Task 8.0: 테스트 구현
- [x] 8.1 `tests/test_log_parser.py` 작성
- [x] 8.2 `tests/test_analyzer.py` 작성
- [x] 8.3 `tests/test_optimizer.py` 작성
- [x] 8.4 `tests/test_git_metadata.py` 작성
- [x] 8.5 통합 테스트 시나리오 작성

### Task 9.0: 문서 업데이트
- [x] 9.1 CLAUDE.md 업데이트 (Agent 최적화 섹션 추가)
- [x] 9.2 README.md 업데이트 (Git Hooks 설명 추가)
- [x] 9.3 사용 가이드 작성 (`docs/AGENT_OPTIMIZER_GUIDE.md`)
- [x] 9.4 Git Hooks 설치 가이드 작성

### Task 10.0: E2E 테스트
- [ ] 10.1 실제 커밋으로 전체 워크플로우 테스트
- [ ] 10.2 로그 분석 → 개선 제안 생성 시나리오 테스트
- [ ] 10.3 Git 메타데이터 저장 검증

### Task 11.0: 버전 관리 및 Git
- [ ] 11.1 버전 업데이트 (v1.2.0)
- [ ] 11.2 변경사항 커밋
- [ ] 11.3 PR 생성 (자동)

---

## 진행 상태

**총 Parent Tasks**: 12개 (MCP 서버 제거로 1개 감소)
**완료**: 9개 (Tasks 0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0)
**진행률**: 75%

---

## Sub-Tasks

> 사용자 승인 후 각 Parent Task의 상세 Sub-Tasks를 생성합니다.
> 승인 방법: "Go" 입력

---

## 주의사항

1. **1:1 Test Pairing**: Task 8.0의 모든 테스트 파일 필수
2. **Feature Branch**: Task 0.0부터 시작 필수
3. **체크박스 업데이트**: Sub-task 완료 시 즉시 `[x]` 표시
4. **Context7 검증**: Git Hooks 베스트 프랙티스 확인 (Task 1.0 전)
5. **Non-blocking**: Git hook 실패 시 커밋 진행 보장

---

## 기술 스택

- **Git Hooks**: post-commit (Bash wrapper + Python)
- **로그 파싱**: Python 3.11+ (정규식)
- **프롬프트 개선**: Claude API (Sonnet 4)
- **Git**: GitPython 라이브러리
- **테스트**: pytest

---

## 종속성

- Task 2.0 → Task 3.0 (로그 파싱 → 분석)
- Task 3.0 → Task 4.0 (분석 → 개선)
- Task 2.0 → Task 5.0 (로그 파싱 → Git 메타데이터)
- Task 1.0 → 모든 Task (Git hook이 모든 스크립트 실행)

---

## 핵심 변경사항 (v1.0 → v1.1)

**제거된 항목**:
- ❌ MCP 서버 구현 (Task 1.0)
- ❌ 실시간 모니터링 (Task 2.0)
- ❌ 자동 재시도 로직 (Task 5.0)
- ❌ Claude Code 통합 (Task 7.0)

**추가/변경된 항목**:
- ✅ Git Hooks 구현 (Task 1.0 - 신규)
- ✅ 로그 파일 분석 (Task 2.0 - 변경)
- ✅ 개선 제안 생성 (Task 4.0 - 변경, 재시도 대신 제안)
- ✅ 알림 시스템 (Task 7.0 - 신규)

---

## MCP 서버 대비 장단점

**장점**:
- ✅ 기술적 제약 없음 (MCP 이벤트 불필요)
- ✅ 구현 복잡도 낮음
- ✅ 커밋 시점에만 실행 (성능 영향 최소)
- ✅ Git과 자연스러운 통합

**단점**:
- ❌ 실시간 모니터링 불가 (커밋 시점만)
- ❌ 자동 재시도 불가 (제안만 제공)
- ❌ 로그 파일 형식 의존성

---

## 상세 작업 계획

### Phase 1: 코드 작성
1. Git hook 작성 (Bash wrapper)
2. 로그 파서 구현 (Python)
3. 실패 분석기 구현
4. 프롬프트 개선기 구현 (Claude API)
5. Git 메타데이터 저장기 구현
6. 설정 시스템 구현

### Phase 2: 테스트
1. 단위 테스트 (4개 파일)
2. 통합 테스트
3. E2E 테스트 (실제 커밋)

### Phase 3: 문서
1. CLAUDE.md 업데이트
2. README.md 업데이트
3. 사용 가이드 작성

### Phase 4-6: 버전/Git/검증
1. 버전 업데이트 (v1.2.0)
2. PR 생성 (자동 시스템 사용)
3. E2E 검증
