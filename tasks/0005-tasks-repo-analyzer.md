# Task List: PRD-0005 - GitHub Repository Analyzer & Improvement Suggester

**PRD 문서**: tasks/prds/0005-prd-repo-analyzer.md
**버전**: 1.0.0
**작성일**: 2025-01-14
**예상 기간**: 총 18일

---

## 📊 프로젝트 개요

**목적**: GitHub에서 claude01과 유사한 워크플로우/개발 도구 프로젝트를 자동으로 발견, 분석, 비교하여 실행 가능한 개선 아이디어를 생성하는 AI 기반 자동화 시스템

**핵심 가치**:
- ⏱️ 시간 절약: 수동 8시간 → 자동 30분 (94% 단축)
- 🎯 객관적: AI 기반 구조적 분석
- 🔄 지속적: 주기적 모니터링
- 📊 실행 가능: 분석 → PRD → Task → PR 자동화

**Quick Win**: 첫 저장소 분석 성공 (2일)

---

## Phase 1: Parent Tasks (검토 필요)

> **지시사항**: 아래 Parent Tasks를 검토 후 "Go"를 입력하면 상세 Sub-Tasks를 생성합니다.

### Task 0.0: 프로젝트 초기화 [필수]
- [x] 0.0.1: feature/PRD-0005-repo-analyzer 브랜치 생성
- [x] 0.0.2: 프로젝트 폴더 구조 생성 (repo-analyzer/)
- [ ] 0.0.3: 기본 설정 파일 작성 (.env.example, .gitignore)

**예상 시간**: 0.5일
**담당**: 개발자
**의존성**: 없음

---

### Task 1: GitHub API 클라이언트 구현
**목적**: GitHub Search/Repository/Contents API를 활용한 저장소 데이터 수집

**핵심 기능**:
- GitHub Search API로 저장소 자동 검색
- Repository API로 메타데이터 수집 (Stars, Forks, Language)
- Contents API로 파일 트리 및 핵심 파일 가져오기
- Rate limit 핸들링 및 Retry 로직

**파일**:
- `repo-analyzer/src/github_fetcher.py` (구현)
- `repo-analyzer/tests/test_github_fetcher.py` (테스트)

**예상 시간**: 1일
**의존성**: Task 0.0

---

### Task 2: Claude API 분석 엔진 구현
**목적**: Claude API를 활용한 저장소 심층 분석 및 개선 제안 생성

**핵심 기능**:
- 프롬프트 템플릿 설계 (구조화된 분석 요청)
- JSON 응답 파싱 및 검증
- 비교 분석 로직 (claude01 baseline 대비)
- Error 핸들링 및 Retry

**파일**:
- `repo-analyzer/src/analyzer.py` (구현)
- `repo-analyzer/tests/test_analyzer.py` (테스트)
- `repo-analyzer/templates/analysis-prompt.md` (프롬프트 템플릿)

**예상 시간**: 2일
**의존성**: Task 1

---

### Task 3: 리포트 생성기 구현
**목적**: 분석 결과를 마크다운 리포트 및 JSON으로 저장

**핵심 기능**:
- Jinja2 템플릿 기반 리포트 생성
- 마크다운 + JSON 파일 동시 저장
- 비교 매트릭스 생성
- 파일명 자동 생성 (번호 부여)

**파일**:
- `repo-analyzer/src/report_generator.py` (구현)
- `repo-analyzer/tests/test_report_generator.py` (테스트)
- `repo-analyzer/templates/report-template.md` (템플릿)

**예상 시간**: 1일
**의존성**: Task 2

---

### Task 4: CLI 기본 구조 구현
**목적**: Click 기반 CLI 인터페이스 제공

**핵심 명령어**:
- `discover`: 키워드로 저장소 자동 검색
- `analyze <owner/repo>`: 단일 저장소 분석
- `list`: 분석 완료 목록 조회
- `show <id>`: 특정 분석 결과 보기

**파일**:
- `repo-analyzer/cli.py` (메인 CLI)
- `repo-analyzer/tests/test_cli.py` (테스트)
- `repo-analyzer/src/utils.py` (유틸리티)

**예상 시간**: 1일
**의존성**: Task 3

**Quick Win Checkpoint**: Task 4 완료 시 첫 저장소 분석 가능 (2일 목표)

---

### Task 5: Batch 분석 시스템 구현
**목적**: 여러 저장소 병렬 분석 및 진행 상황 표시

**핵심 기능**:
- asyncio 기반 병렬 처리 (최대 5개 동시)
- Rich 라이브러리로 진행 상황 표시
- 실패 시 Retry 및 에러 로그
- 분석 결과 자동 집계

**파일**:
- `repo-analyzer/src/batch_processor.py` (구현)
- `repo-analyzer/tests/test_batch_processor.py` (테스트)

**예상 시간**: 1일
**의존성**: Task 4

---

### Task 6: PRD 자동 생성 구현
**목적**: 분석 결과에서 개선 제안을 PRD로 자동 변환

**핵심 기능**:
- 템플릿 기반 PRD 생성
- PRD 번호 자동 증가
- Git 브랜치 자동 생성 (feature/PRD-XXXX-*)
- 초기 scaffold 파일 생성

**파일**:
- `repo-analyzer/src/prd_generator.py` (구현)
- `repo-analyzer/tests/test_prd_generator.py` (테스트)
- `repo-analyzer/templates/prd-template.md` (템플릿)

**예상 시간**: 1일
**의존성**: Task 3

---

### Task 7: Issue 자동 생성 구현
**목적**: 개선 제안을 GitHub Issue로 자동 등록

**핵심 기능**:
- GitHub Issue API 활용
- 자동 라벨링 (enhancement, repo-analyzer)
- Task 체크리스트 포함
- 분석 결과 링크 첨부

**파일**:
- `repo-analyzer/src/issue_creator.py` (구현)
- `repo-analyzer/tests/test_issue_creator.py` (테스트)

**예상 시간**: 1일
**의존성**: Task 3

---

### Task 8: Streamlit 대시보드 구현
**목적**: 웹 기반 인터랙티브 대시보드 제공

**핵심 기능**:
- 분석 결과 시각화 (테이블, 차트)
- 비교 매트릭스 표시
- 실시간 분석 진행 상황
- 액션 버튼 (PRD/Issue 생성)

**화면 구성**:
- 사이드바: 저장소 선택 및 새 분석 시작
- 메인: 4개 탭 (개요, 상세 분석, 개선 제안, 비교)

**파일**:
- `repo-analyzer/dashboard.py` (메인 대시보드)
- `repo-analyzer/src/dashboard_utils.py` (유틸리티)
- `repo-analyzer/tests/test_dashboard.py` (테스트)

**예상 시간**: 4일
**의존성**: Task 7

---

### Task 9: 주기적 모니터링 (GitHub Actions)
**목적**: 주 1회 자동 저장소 발견 및 분석

**핵심 기능**:
- 스케줄링 (매주 일요일 00:00 UTC)
- 병렬 배치 분석 (matrix strategy)
- 주간 리포트 자동 생성
- GitHub Issue로 결과 알림

**파일**:
- `.github/workflows/repo-analyzer-weekly.yml` (워크플로우)
- `repo-analyzer/src/weekly_reporter.py` (주간 리포트 생성)
- `repo-analyzer/tests/test_weekly_reporter.py` (테스트)

**예상 시간**: 2일
**의존성**: Task 5, Task 8

---

### Task 10: 비교 시스템 구현
**목적**: 여러 저장소 간 비교 매트릭스 생성

**핵심 기능**:
- 특징 기반 비교표 생성
- Plotly 레이더 차트 시각화
- 우선순위 점수 계산
- 통합 개선 제안 (여러 저장소 아이디어 융합)

**파일**:
- `repo-analyzer/src/comparator.py` (구현)
- `repo-analyzer/tests/test_comparator.py` (테스트)

**예상 시간**: 1.5일
**의존성**: Task 3

---

### Task 11: 테스트 & 문서화
**목적**: 80% 테스트 커버리지 달성 및 사용 가이드 작성

**하위 작업**:
- 단위 테스트 보강 (pytest)
- E2E 테스트 (CLI 전체 플로우)
- README 작성 (설치, 사용법, 예시)
- API 문서 생성 (docstring → Sphinx)

**파일**:
- `repo-analyzer/README.md` (메인 문서)
- `repo-analyzer/docs/API.md` (API 문서)
- `repo-analyzer/docs/USER_GUIDE.md` (사용 가이드)
- `repo-analyzer/tests/test_e2e.py` (E2E 테스트)

**예상 시간**: 3일
**의존성**: Task 1~10 모두

---

### Task 12: Docker & 배포
**목적**: Docker 이미지 생성 및 첫 실행 검증

**하위 작업**:
- Dockerfile 작성 (Python 3.11 slim)
- docker-compose.yml 작성
- 환경 변수 설정 가이드
- 첫 저장소 분석 실행 검증

**파일**:
- `repo-analyzer/Dockerfile`
- `repo-analyzer/docker-compose.yml`
- `repo-analyzer/.env.example`

**예상 시간**: 1일
**의존성**: Task 11

---

## 📊 Phase별 타임라인

| Phase | Tasks | 예상 기간 | 누적 일수 |
|-------|-------|----------|----------|
| Phase 0 | 기획 (PRD) | 1일 | 1일 |
| Phase 0.5 | Task 생성 | 0.5일 | 1.5일 |
| Phase 1 | 코어 구현 (Task 1-4) | 5일 | 6.5일 |
| Phase 2 | 자동화 (Task 5-7) | 3일 | 9.5일 |
| Phase 3 | 대시보드 (Task 8) | 4일 | 13.5일 |
| Phase 4 | 모니터링 (Task 9-10) | 2일 | 15.5일 |
| Phase 5 | 테스트 & 문서화 (Task 11) | 3일 | 18.5일 |
| Phase 6 | 배포 (Task 12) | 1일 | 19.5일 |

**총 예상 기간**: 약 20일 (Quick Win: 2일)

---

## 🎯 Quick Win Milestone (2일)

**목표**: 첫 저장소 분석 성공

**범위**: Task 0.0 + Task 1-4

**검증 명령어**:
```bash
python repo-analyzer/cli.py analyze Zer0Daemon/PhaseFlow
# → repo-analyzer/outputs/analyses/001-PhaseFlow-analysis.md 생성
```

**성공 기준**:
- ✅ GitHub API로 PhaseFlow README 가져오기
- ✅ Claude API로 분석 완료
- ✅ 마크다운 리포트 생성
- ✅ 최소 1개 이상의 실행 가능한 개선 제안 포함

---

## 🔐 보안 체크리스트

- [ ] .env 파일을 .gitignore에 추가
- [ ] API 키는 환경 변수로만 관리
- [ ] GitHub Token은 최소 권한 (public_repo)
- [ ] Rate limit 핸들링 구현
- [ ] 민감 정보 필터링 (분석 대상 파일)
- [ ] Retry 로직에 exponential backoff 적용

---

## 📝 1:1 테스트 페어링 체크리스트

| 구현 파일 | 테스트 파일 | 상태 |
|----------|------------|------|
| src/github_fetcher.py | tests/test_github_fetcher.py | [ ] |
| src/analyzer.py | tests/test_analyzer.py | [ ] |
| src/report_generator.py | tests/test_report_generator.py | [ ] |
| cli.py | tests/test_cli.py | [ ] |
| src/utils.py | tests/test_utils.py | [ ] |
| src/batch_processor.py | tests/test_batch_processor.py | [ ] |
| src/prd_generator.py | tests/test_prd_generator.py | [ ] |
| src/issue_creator.py | tests/test_issue_creator.py | [ ] |
| dashboard.py | tests/test_dashboard.py | [ ] |
| src/weekly_reporter.py | tests/test_weekly_reporter.py | [ ] |
| src/comparator.py | tests/test_comparator.py | [ ] |
| - | tests/test_e2e.py | [ ] |

**목표 커버리지**: 80%+

---

## 🚀 다음 단계

1. **Parent Tasks 검토**: 위 Task 1-12 구조 확인
2. **"Go" 입력**: Sub-Tasks 상세 생성 시작
3. **Task 0.0 실행**: 브랜치 생성 및 초기화
4. **Quick Win 달성**: 2일 내 첫 분석 완료

---

**상태**: Parent Tasks 생성 완료 (검토 대기)
**작성일**: 2025-01-14
**다음 액션**: 사용자 "Go" 입력 대기
