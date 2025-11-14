# PRD-0005: GitHub Repository Analyzer & Improvement Suggester

**작성일**: 2025-01-14
**버전**: 1.0.0
**상태**: 초안
**담당자**: claude01 maintainer

---

## 📋 명확화 질문 및 답변

### 1. 프로젝트 목적
**답변**: A - claude01 개선 - 다른 프로젝트 분석해서 claude01에 적용할 아이디어 발굴

### 2. 주요 사용자
**답변**: A - 본인만 - claude01 개선용 개인 도구

### 3. 초기 범위 (MVP)
**답변**: D - 완전 기능 - 대시보드 + 자동 PR + 주기적 모니터링
*(단, Phase별 단계적 구현)*

### 4. 분석 대상 저장소
**답변**: D - 자동 발견 - 키워드로 검색해서 자동 큐레이션

### 5. 분석 깊이
**답변**: D - 완전 - 코드 품질 + 성능 + 보안 + 테스트 커버리지

### 6. 결과물 형식
**답변**: B + C - Git 통합 (자동 커밋/PR) + 이슈 생성

### 7. 자동화 수준
**답변**: D - 인터랙티브 - 분석 중 사용자 피드백 반영

### 8. 우선순위
**답변**: D - 서브 에이전트로 모두 동시에 - Batch 분석부터

---

## 🎯 프로젝트 개요

### 목적 (Purpose)
GitHub에서 claude01과 유사한 워크플로우/개발 도구 프로젝트를 **자동으로 발견, 분석, 비교**하여 claude01 프로젝트에 적용 가능한 **실행 가능한 개선 아이디어를 생성**하는 AI 기반 자동화 시스템

### 핵심 가치 (Value Proposition)
- ⏱️ **시간 절약**: 수동 8시간 → 자동 30분 (94% 단축)
- 🎯 **객관적**: AI 기반 구조적 분석, 주관 배제
- 🔄 **지속적**: 주기적 모니터링으로 최신 트렌드 자동 반영
- 📊 **실행 가능**: 분석만이 아닌 PRD → Task → PR까지 자동화

### 비즈니스 임팩트
- **개인 생산성**: claude01 개선 속도 3배 향상
- **학습 효과**: 우수 사례 자동 수집 및 분석
- **품질 향상**: 데이터 기반 의사결정

---

## 🚀 핵심 기능 (Core Features)

### Phase 1: 자동 발견 & 수집 (Discovery Engine)

#### 1.1 GitHub 자동 검색
```python
# 키워드 기반 저장소 검색
keywords = [
    "claude code workflow",
    "PRD automation",
    "AI development workflow",
    "phase based development",
    "agent orchestration"
]

# 검색 조건
filters = {
    "stars": ">50",
    "updated": "last 6 months",
    "language": ["Python", "TypeScript", "JavaScript"],
    "has_readme": True,
    "exclude_forks": True
}
```

**기능**:
- GitHub Search API 활용
- 자동 필터링 (최소 Star 수, 업데이트 날짜)
- 중복 제거 (fork 제외)
- 우선순위 점수 계산 (Stars × 최신성 × 관련도)

#### 1.2 저장소 큐레이션
```python
# 자동 분류
categories = {
    "workflow": ["Phase 기반", "PRD 중심", "Task 관리"],
    "agents": ["Agent 시스템", "Sub-agent", "오케스트레이션"],
    "automation": ["CI/CD", "GitHub Actions", "자동 PR"],
    "documentation": ["문서화", "템플릿", "가이드"]
}
```

**기능**:
- AI 기반 자동 카테고리 분류
- 유사도 점수 계산 (claude01 대비)
- 우선순위 큐 생성

---

### Phase 2: 심층 분석 (Deep Analysis)

#### 2.1 구조 분석
**수집 데이터**:
- ✅ 저장소 메타데이터 (Stars, Forks, Language, License)
- ✅ 파일 트리 구조 (depth 3까지)
- ✅ 핵심 설정 파일 (package.json, pyproject.toml, Dockerfile)
- ✅ 워크플로우 (`.github/workflows/*.yml`)
- ✅ 문서 (README, CLAUDE.md, CONTRIBUTING, docs/)

#### 2.2 코드 품질 분석
**분석 항목**:
- 📊 **테스트 커버리지**: 테스트 파일 비율, 테스트 프레임워크
- 🔒 **보안**: `.env` 관리, 시크릿 하드코딩 여부
- 📦 **의존성**: 최신성, 취약점 (npm audit, pip-audit 패턴)
- 🏗️ **아키텍처**: 모듈화, 관심사 분리, 디자인 패턴

#### 2.3 AI 기반 심층 분석
**Claude API 활용**:
```python
analysis_prompt = f"""
저장소 분석 요청:

**대상**: {repo_name}
**README**: {readme_content}
**파일 구조**: {file_tree}
**핵심 코드**: {key_files}

**baseline (claude01)**:
- Phase 0-6 워크플로우
- Agent 최적화 시스템
- GitHub Actions 자동화
- 다국어 문서 (한글/영문)

다음을 분석하세요:
1. 이 저장소의 핵심 가치는?
2. claude01과 비교 시 차이점은?
3. claude01에 적용 가능한 개선사항은? (구체적 + 실행 가능)
4. 예상 효과 및 구현 난이도는?

JSON 형식으로 구조화된 결과를 제공하세요.
"""
```

**분석 결과**:
```json
{
  "repo_name": "Zer0Daemon/PhaseFlow",
  "analysis_date": "2025-01-14",
  "summary": {
    "purpose": "PRD를 Phase/Task로 자동 분해",
    "tech_stack": ["Next.js", "TypeScript", "AI"],
    "unique_features": ["UI 대시보드", "시각적 로드맵"]
  },
  "comparison": {
    "similarities": ["Phase 기반", "AI 활용"],
    "differences": ["UI 제공", "실시간 편집"],
    "unique_to_them": "대시보드 UI"
  },
  "suggestions": [
    {
      "title": "Phase 진행 시각화 대시보드 추가",
      "priority": "high",
      "effort": "3-5일",
      "impact": "사용자 경험 3배 향상",
      "implementation": "Streamlit + plotly 조합"
    }
  ]
}
```

---

### Phase 3: 비교 & 통합 (Comparison Matrix)

#### 3.1 다중 저장소 비교
**비교 매트릭스 생성**:
```markdown
| 특징 | claude01 | PhaseFlow | cc-sdd | wshobson/agents |
|------|----------|-----------|--------|-----------------|
| Phase 워크플로우 | ✅ 0-6 | ✅ 자동 분해 | ✅ 검증 게이트 | ❌ |
| UI 대시보드 | ❌ | ✅ | ❌ | ❌ |
| Agent 최적화 | ✅ Post-commit | ❌ | ❌ | ✅ 플러그인 |
| GitHub Actions | ✅ Auto PR | ❌ | ❌ | ⚠️ 일부 |
| 문서화 | ✅ 한/영 | ✅ | ✅ | ✅ |
```

#### 3.2 통합 개선 제안
**여러 저장소에서 아이디어 통합**:
```python
# 예시: PhaseFlow의 UI + cc-sdd의 검증 + wshobson의 플러그인
integrated_suggestion = {
    "title": "모듈형 Phase 검증 대시보드",
    "inspired_by": ["PhaseFlow", "cc-sdd", "wshobson/agents"],
    "description": "Streamlit 대시보드 + Phase별 자동 검증 + 플러그인 아키텍처",
    "expected_benefit": "생산성 5배, 확장성 10배"
}
```

---

### Phase 4: 자동화 (Automation Engine)

#### 4.1 PRD 자동 생성
**분석 결과 → PRD 변환**:
```python
# outputs/001-PhaseFlow-analysis.json
# → tasks/prds/0006-prd-phase-dashboard.md

prd_template = """
# PRD-{number}: {suggestion_title}

## 영감 출처
- 저장소: {source_repos}
- 분석 리포트: {analysis_files}

## 문제 정의
{problem_statement}

## 제안 솔루션
{solution}

## 기술 스택
{tech_stack}

## 성공 지표
{success_metrics}
"""
```

#### 4.2 자동 PR 생성
**워크플로우**:
```bash
# 1. 분석 완료
python repo-analyzer/cli.py analyze Zer0Daemon/PhaseFlow

# 2. 개선 아이디어 선택 (인터랙티브)
python repo-analyzer/cli.py suggest 001 --interactive

# 사용자가 선택: "Phase 진행 시각화 대시보드"

# 3. 자동 PRD 생성
# → tasks/prds/0006-prd-phase-dashboard.md

# 4. 자동 브랜치 생성
git checkout -b feature/PRD-0006-phase-dashboard

# 5. 초기 구조 생성 (scaffold)
mkdir -p phase-dashboard/src
touch phase-dashboard/{README.md,requirements.txt,app.py}

# 6. Git 커밋 + PR
git add .
git commit -m "feat: Initialize phase dashboard (v0.1.0) [PRD-0006]"
git push -u origin feature/PRD-0006-phase-dashboard

# 7. GitHub PR 생성 (gh CLI)
gh pr create --title "[PRD-0006] Phase 진행 시각화 대시보드" \
  --body "$(cat tasks/prds/0006-prd-phase-dashboard.md)"
```

#### 4.3 GitHub Issue 생성
**분석 결과를 Issue로 자동 등록**:
```python
# 각 개선 제안별로 Issue 생성
for suggestion in suggestions:
    issue_body = f"""
## 📊 분석 출처
- 저장소: {source_repo}
- 분석일: {analysis_date}

## 💡 개선 제안
{suggestion.description}

## 📈 예상 효과
{suggestion.impact}

## 🛠️ 구현 방법
{suggestion.implementation}

## 📋 Task Checklist
- [ ] PRD 작성
- [ ] 기술 검증
- [ ] 프로토타입 구현
- [ ] 테스트 작성
- [ ] 문서화

---
🤖 자동 생성: repo-analyzer v{version}
    """

    gh issue create \
      --title suggestion.title \
      --label "enhancement,repo-analyzer" \
      --body issue_body
```

---

### Phase 5: 대시보드 (Interactive Dashboard)

#### 5.1 Streamlit 대시보드
**화면 구성**:
```python
# dashboard.py
import streamlit as st

# 📊 메인 대시보드
st.title("🔍 Repository Analyzer Dashboard")

# 사이드바: 저장소 선택
with st.sidebar:
    st.header("저장소 관리")

    # 새 저장소 추가
    new_repo = st.text_input("GitHub URL")
    if st.button("분석 시작"):
        analyze_repo(new_repo)

    # 분석 완료된 저장소 목록
    repos = load_analyzed_repos()
    selected = st.selectbox("분석 결과 보기", repos)

# 메인: 분석 결과
if selected:
    analysis = load_analysis(selected)

    # 탭 구성
    tab1, tab2, tab3, tab4 = st.tabs([
        "📊 개요",
        "🔍 상세 분석",
        "💡 개선 제안",
        "📈 비교"
    ])

    with tab1:
        # KPI 카드
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("Stars", analysis.stars)
        col2.metric("유사도", f"{analysis.similarity}%")
        col3.metric("제안 수", len(analysis.suggestions))
        col4.metric("우선순위", analysis.priority_score)

        # 핵심 정보
        st.subheader("핵심 기능")
        st.write(analysis.summary)

    with tab2:
        # 파일 구조 시각화
        st.subheader("📁 파일 구조")
        st.code(analysis.file_tree, language="text")

        # 기술 스택
        st.subheader("🛠️ 기술 스택")
        for tech in analysis.tech_stack:
            st.badge(tech)

    with tab3:
        # 개선 제안 목록
        st.subheader("💡 개선 제안")

        for i, sug in enumerate(analysis.suggestions):
            with st.expander(f"#{i+1} {sug.title}"):
                st.write(f"**우선순위**: {sug.priority}")
                st.write(f"**예상 시간**: {sug.effort}")
                st.write(f"**예상 효과**: {sug.impact}")
                st.write(f"**구현 방법**:")
                st.write(sug.implementation)

                # 액션 버튼
                col1, col2 = st.columns(2)
                if col1.button("PRD 생성", key=f"prd_{i}"):
                    create_prd(sug)
                if col2.button("Issue 생성", key=f"issue_{i}"):
                    create_issue(sug)

    with tab4:
        # 비교 차트
        st.subheader("📊 다른 저장소와 비교")

        comparison_data = load_comparison_matrix()
        st.dataframe(comparison_data)

        # 레이더 차트
        st.plotly_chart(create_radar_chart(comparison_data))
```

#### 5.2 실시간 분석
**WebSocket 기반 진행 상황 표시**:
```python
# 분석 진행 중 실시간 업데이트
progress_bar = st.progress(0)
status_text = st.empty()

with st.spinner("저장소 분석 중..."):
    # 1. GitHub 데이터 수집
    status_text.text("📥 GitHub API 호출 중...")
    progress_bar.progress(20)

    # 2. 파일 분석
    status_text.text("📁 파일 구조 분석 중...")
    progress_bar.progress(40)

    # 3. AI 분석
    status_text.text("🤖 AI 분석 중 (Claude API)...")
    progress_bar.progress(70)

    # 4. 리포트 생성
    status_text.text("📝 리포트 생성 중...")
    progress_bar.progress(90)

    # 5. 완료
    status_text.text("✅ 분석 완료!")
    progress_bar.progress(100)
```

---

### Phase 6: 주기적 모니터링 (Continuous Monitoring)

#### 6.1 GitHub Actions 워크플로우
```yaml
# .github/workflows/repo-analyzer-weekly.yml
name: Weekly Repository Analysis

on:
  schedule:
    - cron: '0 0 * * 0'  # 매주 일요일 00:00 UTC
  workflow_dispatch:  # 수동 실행 가능

jobs:
  discover:
    name: Discover New Repositories
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install dependencies
        run: |
          pip install -r repo-analyzer/requirements.txt

      - name: Discover new repos
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python repo-analyzer/cli.py discover \
            --keywords "claude code workflow,PRD automation" \
            --min-stars 50 \
            --max-results 10

      - name: Save discovery results
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add repo-analyzer/discovered-repos.json
          git commit -m "chore: Update discovered repos (weekly)"
          git push

  analyze:
    name: Analyze Repositories
    needs: discover
    runs-on: ubuntu-latest
    strategy:
      matrix:
        # 병렬 실행 (최대 5개 동시)
        repo-batch: [1, 2, 3, 4, 5]
    steps:
      - uses: actions/checkout@v4

      - name: Analyze batch ${{ matrix.repo-batch }}
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python repo-analyzer/cli.py analyze-batch \
            --batch-number ${{ matrix.repo-batch }} \
            --parallel 5

      - name: Upload analysis results
        uses: actions/upload-artifact@v4
        with:
          name: analysis-batch-${{ matrix.repo-batch }}
          path: repo-analyzer/outputs/

  report:
    name: Generate Weekly Report
    needs: analyze
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Download all analyses
        uses: actions/download-artifact@v4
        with:
          path: repo-analyzer/outputs/

      - name: Generate comparison report
        run: |
          python repo-analyzer/cli.py compare-all \
            --output weekly-report.md

      - name: Create GitHub Issue
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh issue create \
            --title "📊 Weekly Repository Analysis Report - $(date +%Y-%m-%d)" \
            --label "repo-analyzer,weekly-report" \
            --body-file weekly-report.md

      - name: Commit results
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add repo-analyzer/outputs/
          git commit -m "docs: Add weekly analysis report"
          git push
```

#### 6.2 알림 시스템
**새로운 개선 아이디어 발견 시 알림**:
```python
# Slack/Discord/Email 알림
if new_high_priority_suggestions:
    notify(
        title="🚨 새로운 고우선순위 개선 아이디어 발견",
        message=f"{len(new_suggestions)}개의 새로운 제안이 있습니다.",
        suggestions=new_high_priority_suggestions,
        link=dashboard_url
    )
```

---

## 🛠️ 기술 스택 (Tech Stack)

### Backend
```python
# requirements.txt
anthropic>=0.40.0           # Claude API
PyGithub>=2.1.1             # GitHub API 클라이언트
click>=8.1.7                # CLI 프레임워크
jinja2>=3.1.2               # 템플릿 엔진
pyyaml>=6.0.1               # YAML 파싱
python-dotenv>=1.0.0        # 환경 변수
rich>=13.7.0                # 예쁜 CLI 출력
httpx>=0.25.0               # 비동기 HTTP
tenacity>=8.2.3             # Retry 로직

# 분석 도구
pylint>=3.0.0               # 코드 품질
bandit>=1.7.5               # 보안 분석
radon>=6.0.1                # 복잡도 분석

# 데이터 처리
pandas>=2.1.0               # 데이터 분석
plotly>=5.18.0              # 시각화
```

### Frontend (Dashboard)
```python
# Dashboard 의존성
streamlit>=1.29.0           # 대시보드 프레임워크
streamlit-aggrid>=0.3.4     # 고급 테이블
streamlit-plotly>=0.0.1     # Plotly 차트
```

### Infrastructure
```yaml
# Docker
# repo-analyzer/Dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["streamlit", "run", "dashboard.py"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  analyzer:
    build: ./repo-analyzer
    ports:
      - "8501:8501"  # Streamlit
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    volumes:
      - ./repo-analyzer/outputs:/app/outputs
      - ./repo-analyzer/config:/app/config
```

---

## 📊 성공 지표 (Success Metrics)

### 정량적 지표

#### 1. 효율성
- **분석 시간**: 수동 8시간 → 자동 30분 (목표: 94% 단축)
- **발견 저장소 수**: 주당 10-20개 (키워드 검색)
- **유효 제안 비율**: 분석 10개 → 실행 가능 제안 3개 이상 (30%+)

#### 2. 품질
- **제안 채택률**: 생성된 제안 중 실제 구현 비율 50%+
- **PRD 생성 시간**: 제안 → PRD 완성 1시간 이내
- **코드 커버리지**: 분석 엔진 테스트 커버리지 80%+

#### 3. 자동화
- **주기적 실행 성공률**: 99%+ (GitHub Actions)
- **API 호출 성공률**: 95%+ (GitHub + Claude API)
- **병렬 처리 속도**: 5개 저장소 동시 분석 30분 이내

### 정성적 지표

#### 1. 사용성
- ✅ CLI 명령어 3개 이하로 분석 완료
- ✅ 대시보드에서 5분 내 핵심 인사이트 파악
- ✅ 비개발자도 리포트 이해 가능

#### 2. 실행 가능성
- ✅ 제안에 구체적 구현 방법 포함
- ✅ 예상 시간 / 난이도 명시
- ✅ 우선순위 자동 계산

#### 3. 지속성
- ✅ 주 1회 자동 분석 실행
- ✅ 새로운 트렌드 자동 감지
- ✅ 히스토리 추적 (분석 결과 누적)

---

## 🚫 범위 제외 (Out of Scope)

### Phase 1에서 제외
- ❌ Private 저장소 분석 (Public만)
- ❌ 실시간 코드 실행 / 테스트
- ❌ 자동 코드 생성 (scaffold만 제공)
- ❌ 다국어 문서 번역 (한글 리포트만)
- ❌ 커뮤니티 기능 (개인 도구)

### 향후 고려 사항
- ⏳ GitLab, Bitbucket 지원
- ⏳ LLM 비용 최적화 (캐싱, 배치)
- ⏳ 플러그인 시스템 (사용자 정의 분석)
- ⏳ AI 모델 선택 (GPT-4, Gemini 등)

---

## 📅 Phase별 구현 계획

### Phase 0: 기획 (완료) - 1일
- ✅ PRD 작성
- ✅ 기술 검증
- ✅ 아키텍처 설계

### Phase 0.5: Task 생성 - 0.5일
```bash
python scripts/generate_tasks.py tasks/prds/0005-prd-repo-analyzer.md
# → tasks/0005-tasks-repo-analyzer.md
```

### Phase 1: 코어 구현 - 5일
**Task 1.1**: GitHub API 클라이언트 (1일)
- GitHub Search API
- Repository API
- Contents API
- Rate limit 핸들링

**Task 1.2**: Claude API 분석 엔진 (2일)
- 프롬프트 템플릿 설계
- JSON 파싱 및 검증
- Error 핸들링

**Task 1.3**: 리포트 생성기 (1일)
- Jinja2 템플릿
- 마크다운 생성
- 파일 저장

**Task 1.4**: CLI 기본 구조 (1일)
- Click 프레임워크
- 명령어: analyze, discover
- 설정 파일 관리

### Phase 2: 자동화 - 3일
**Task 2.1**: Batch 분석 (1일)
- 병렬 처리 (asyncio)
- 진행 상황 표시

**Task 2.2**: PRD 자동 생성 (1일)
- 템플릿 기반 PRD
- Git 브랜치 생성

**Task 2.3**: Issue 자동 생성 (1일)
- GitHub Issue API
- 라벨링 시스템

### Phase 3: 대시보드 - 4일
**Task 3.1**: Streamlit 기본 구조 (1일)
- 페이지 레이아웃
- 사이드바 네비게이션

**Task 3.2**: 분석 결과 시각화 (2일)
- 테이블, 차트
- 비교 매트릭스

**Task 3.3**: 인터랙티브 기능 (1일)
- 실시간 분석
- 액션 버튼 (PRD/Issue 생성)

### Phase 4: 주기적 모니터링 - 2일
**Task 4.1**: GitHub Actions (1일)
- 워크플로우 작성
- 스케줄링 설정

**Task 4.2**: 알림 시스템 (1일)
- Issue 자동 생성
- 주간 리포트

### Phase 5: 테스트 & 문서화 - 3일
**Task 5.1**: 단위 테스트 (1.5일)
- pytest 설정
- 80% 커버리지

**Task 5.2**: E2E 테스트 (0.5일)
- CLI 테스트
- 대시보드 테스트

**Task 5.3**: 문서화 (1일)
- README 작성
- 사용 가이드
- API 문서

### Phase 6: 배포 - 1일
**Task 6.1**: Docker 이미지 (0.5일)
**Task 6.2**: 첫 실행 & 검증 (0.5일)

---

## 🎯 첫 번째 마일스톤 (Quick Win)

### Goal: 첫 저장소 분석 성공
**예상 시간**: 2일

**Scope**:
1. GitHub API로 PhaseFlow README 가져오기
2. Claude API로 분석
3. 마크다운 리포트 생성
4. CLI로 실행

**Success Criteria**:
```bash
python repo-analyzer/cli.py analyze Zer0Daemon/PhaseFlow
# → repo-analyzer/outputs/001-PhaseFlow-analysis.md 생성
```

**예상 리포트**:
```markdown
# 저장소 분석: PhaseFlow

**Stars**: 127 | **언어**: TypeScript

## 핵심 기능
- PRD → Phase/Task 자동 분해
- UI 대시보드 제공
- 실시간 로드맵 편집

## claude01 비교
### 유사점
- Phase 기반 워크플로우
- AI 활용

### 차이점
- ✅ PhaseFlow: UI 대시보드
- ✅ claude01: CLI + 자동화

## 개선 제안
### #1: Phase 진행 시각화 대시보드
- **구현**: Streamlit + Plotly
- **시간**: 3-5일
- **효과**: 사용자 경험 3배 향상
```

---

## 🔐 보안 고려사항

### API 키 관리
```bash
# .env (절대 커밋 금지)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# .gitignore
.env
.env.*
!.env.example
repo-analyzer/config/secrets.json
```

### Rate Limit
```python
# GitHub API: 5000 req/hour (인증 시)
# Claude API: Usage tier에 따라 다름

# Retry 로직
@retry(
    wait=wait_exponential(min=1, max=60),
    stop=stop_after_attempt(3),
    retry=retry_if_exception_type(RateLimitError)
)
def call_api():
    pass
```

### 민감 정보 필터링
```python
# 분석 대상 파일에서 민감 정보 제외
exclude_patterns = [
    "*.env",
    "*.key",
    "secrets/*",
    "credentials.json",
    "**/node_modules/**",
    "**/.git/**"
]
```

---

## 📝 부록

### A. 참고 저장소 목록
```yaml
# repo-analyzer/config/target-repos.yml
priority_repos:
  - Zer0Daemon/PhaseFlow
  - gotalab/cc-sdd
  - wshobson/agents
  - VoltAgent/awesome-claude-code-subagents
  - jasonleinart/structured-ai-workflows

keywords:
  - "claude code workflow"
  - "PRD automation"
  - "AI development workflow"
  - "phase based development"
  - "agent orchestration"
  - "spec driven development"
```

### B. CLI 명령어 전체 목록
```bash
# 발견
repo-analyzer discover --keywords "AI workflow" --min-stars 50

# 단일 분석
repo-analyzer analyze <owner/repo>

# 배치 분석
repo-analyzer batch --file repos.txt
repo-analyzer batch --category workflow

# 비교
repo-analyzer compare 001 002 003

# 제안
repo-analyzer suggest 001 --create-prd
repo-analyzer suggest 001 --create-issue

# 대시보드
repo-analyzer dashboard

# 유틸리티
repo-analyzer list         # 분석 완료 목록
repo-analyzer show 001     # 특정 분석 결과 보기
repo-analyzer clean        # 캐시 삭제
```

### C. 폴더 구조
```
repo-analyzer/
├── README.md
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── cli.py                      # 메인 CLI
├── dashboard.py                # Streamlit 대시보드
│
├── src/
│   ├── __init__.py
│   ├── github_fetcher.py       # GitHub API
│   ├── analyzer.py             # Claude API
│   ├── comparator.py           # 비교 로직
│   ├── report_generator.py     # 리포트 생성
│   ├── prd_generator.py        # PRD 자동 생성
│   └── utils.py
│
├── templates/
│   ├── analysis-prompt.md      # Claude 프롬프트
│   ├── report-template.md      # 리포트 템플릿
│   └── prd-template.md         # PRD 템플릿
│
├── config/
│   ├── analysis-config.json    # 분석 설정
│   ├── target-repos.yml        # 대상 저장소
│   └── secrets.example.json    # 시크릿 예시
│
├── outputs/                    # 분석 결과
│   ├── analyses/
│   │   ├── 001-PhaseFlow-analysis.md
│   │   └── 001-PhaseFlow-analysis.json
│   ├── comparisons/
│   │   └── comparison-matrix-2025-01-14.md
│   └── weekly-reports/
│       └── 2025-W03-report.md
│
├── tests/
│   ├── test_github_fetcher.py
│   ├── test_analyzer.py
│   └── test_integration.py
│
└── .github/
    └── workflows/
        └── repo-analyzer-weekly.yml
```

---

**작성자**: Claude Code
**검토 필요**: 기술 스택, 타임라인, 리소스
**다음 단계**: Task 생성 (Phase 0.5)
