# Claude AI 전역 지침 레포

**목적**: Claude Code 작업을 위한 전역 워크플로우 및 가이드 관리

**버전**: 4.2.0 | **업데이트**: 2025-01-13

---

## 📚 핵심 문서

### 1. **워크플로우 (필수)**
- **[CLAUDE.md](CLAUDE.md)** - Phase 0-6 개발 사이클 (핵심)

### 2. **GitHub 네이티브 워크플로우**
- **[깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md)** - GitHub 기반 작업 (5분)
- **[깃허브_빠른시작.md](깃허브_빠른시작.md)** - 30분 설정 가이드
- **[docs/깃허브_워크플로우_색인.md](docs/깃허브_워크플로우_색인.md)** - 전체 네비게이션
- **[README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md)** - 문서 안내

### 3. **Spec Kit 통합**
- **[docs/SPECKIT_EXECUTIVE_SUMMARY.md](docs/SPECKIT_EXECUTIVE_SUMMARY.md)** - 5분 개요
- **[docs/SPECKIT_QUICKSTART.md](docs/SPECKIT_QUICKSTART.md)** - 30분 설정
- **[.speckit/constitution.md](.speckit/constitution.md)** - Constitution 템플릿

### 4. **자동화 도구**
- **[scripts/setup-github-labels.sh](scripts/setup-github-labels.sh)** - GitHub 라벨 생성
- **[scripts/github-issue-dev.sh](scripts/github-issue-dev.sh)** - 이슈 작업 시작
- **[scripts/check-phase-completion.py](scripts/check-phase-completion.py)** - Phase 완료 감지
- **[scripts/create-phase-pr.sh](scripts/create-phase-pr.sh)** - PR 자동 생성

### 5. **자동 PR/머지 시스템 (NEW)**
- **[.github/workflows/auto-pr-merge.yml](.github/workflows/auto-pr-merge.yml)** - GitHub Actions 워크플로우
- **[docs/BRANCH_PROTECTION_GUIDE.md](docs/BRANCH_PROTECTION_GUIDE.md)** - Branch Protection 설정 가이드
- **[.github/pull_request_template.md](.github/pull_request_template.md)** - PR 템플릿

---

## 🚀 빠른 시작 (사용자 유형별)

### 처음 사용하는 경우
1. **[CLAUDE.md](CLAUDE.md) 읽기** (10분) - Phase 0-6 워크플로우 완전 이해
2. **Context7 검증 습관화** - 외부 기술 사용 전 최신 문서 확인
3. **Phase 0 실습** - PRD 작성 연습
   ```bash
   # 로컬 방식
   mkdir -p tasks/prds
   vim tasks/prds/0001-prd-test-feature.md
   ```
4. **다음 단계** - [GitHub 워크플로우](#github-워크플로우-채택) 또는 [Spec Kit](#spec-kit-constitution-사용) 도입 고려

### GitHub 워크플로우 도입하려는 경우
1. **[깃허브_워크플로우_개요.md](깃허브_워크플로우_개요.md)** (5분) - ROI 및 Before/After 파악
2. **[docs/깃허브_의사결정_프레임워크.md](docs/깃허브_의사결정_프레임워크.md)** (10분) - 도입 여부 결정
3. **[깃허브_빠른시작.md](깃허브_빠른시작.md)** (30분) - GitHub CLI 설치 및 라벨 설정 실행
4. **첫 이슈 시작**
   ```bash
   gh issue create --template 01-feature-prd.yml
   bash scripts/github-issue-dev.sh 123
   ```

### Spec Kit Constitution 사용하려는 경우
1. **[docs/SPECKIT_EXECUTIVE_SUMMARY.md](docs/SPECKIT_EXECUTIVE_SUMMARY.md)** (5분) - Constitution의 67% 버그 예방 효과 확인
2. **[.speckit/constitution.md](.speckit/constitution.md) 복사** - 프로젝트에 맞게 수정
   ```bash
   cp .speckit/constitution.md your-project/
   code your-project/constitution.md
   ```
3. **Phase 0 전 체크 습관화** - PRD 작성 전 Constitution 검토 (2분)

---

## 📂 폴더 구조

```
d:\AI\claude01\              # 전역 지침 레포
├── CLAUDE.md               # 핵심 Phase 0-6 워크플로우
├── README.md               # 이 파일
│
├── 깃허브_워크플로우_개요.md
├── 깃허브_빠른시작.md
├── README_GITHUB_WORKFLOW.md
│
├── docs/                   # 상세 가이드
│   ├── 깃허브_워크플로우_색인.md
│   ├── 깃허브_의사결정_프레임워크.md
│   ├── GITHUB_*.md         # GitHub 워크플로우 (영문 참조)
│   ├── SPECKIT_*.md        # Spec Kit 통합
│   └── QUICK_COMMANDS.md
│
├── scripts/                # 자동화 스크립트
│   ├── setup-github-labels.sh
│   └── github-issue-dev.sh
│
├── .speckit/               # Spec Kit 템플릿
│   └── constitution.md
│
└── .gitignore              # Git 제외 설정
```

---

## 🚫 이 레포에 포함하지 않는 것

### 프로젝트별 폴더 (.gitignore 등록됨)
```
actiontracker/
contents-factory/
VTC_Logger/
sso-system/
... 기타 프로젝트
```

**원칙**:
- 이 레포 = **전역 지침만**
- 각 프로젝트 = **별도 레포**

---

## 🎯 사용 방법

### 새 프로젝트 시작

```bash
# 1. 전역 워크플로우 참조
cat CLAUDE.md

# 2. 프로젝트 폴더 생성 (claude01 밖에)
cd d:\Projects
mkdir my-new-project
cd my-new-project

# 3. Git 초기화
git init

# 4. Phase 0 시작
# PRD 작성 → Task List → 구현
```

### GitHub 워크플로우 채택

```bash
# 1. 개요 읽기 (5분)
cat 깃허브_워크플로우_개요.md

# 2. 라벨 설정 (2분)
bash scripts/setup-github-labels.sh

# 3. 이슈 템플릿 추가
cp -r .github/ISSUE_TEMPLATE/ your-project/

# 4. 작업 시작
bash scripts/github-issue-dev.sh 123
```

### Spec Kit Constitution 사용

```bash
# 1. Constitution 파일 복사
cp .speckit/constitution.md your-project/

# 2. 프로젝트 맞게 수정
code your-project/constitution.md

# 3. Phase 0 전에 체크
# Constitution 검토 → PRD 작성
```

---

## 📊 구현 상태

### ✅ 완전 구현
- **Phase 0-6 워크플로우** - 핵심 개발 사이클
- **GitHub 네이티브 워크플로우** - 이슈 중심 개발
- **자동화 스크립트** - 이슈 작업 시작, 라벨 설정
- **문서 체계** - MINIMAL/STANDARD/JUNIOR PRD 가이드
- **Context7 검증** - 외부 기술 최신 문서 확인
- **Playwright E2E** - Phase 5 실제 작동 검증 필수

### 🔧 선택 구현 (프로젝트별)
- **GitHub Actions** - CI/CD 자동화 (템플릿 제공)
- **Task 생성 자동화** - PRD → Task List 변환
- **토큰 최적화 스크립트** - 고급 최적화 도구

### 📁 폴더 구조
```
tasks/
├── prds/       ✅ PRD 저장 (로컬 워크플로우)
└── tickets/    ✅ 버그 티켓 추적
```

**참조**: 구현 여부는 [CLAUDE.md](CLAUDE.md)의 각 섹션 참조

---

## 📖 주요 개념

### Phase 0-6 워크플로우
```
Phase 0: 요구사항 (PRD)
  ↓
Phase 0.5: Task List 생성
  ↓
Phase 1: 코드 작성
  ↓
Phase 2: 테스트
  ↓
Phase 3: 버전 관리
  ↓
Phase 4: Git 커밋
  ↓
Phase 5: 검증
  ↓
Phase 6: 배포 및 캐시
```

### GitHub 네이티브
- 로컬 PRD 파일 → GitHub Issues
- 로컬 Task List → GitHub Projects
- 크로스 레포 자동 링크
- GitHub Actions 자동화

### Spec Kit Constitution
- 프로젝트 원칙 정의
- 보안 체크리스트
- 아키텍처 가이드
- "깜빡" 버그 예방

### Context7 MCP 활용
- 외부 라이브러리/프레임워크 최신 문서 검증
- Deprecated API 사용 방지
- Breaking changes 사전 확인
- Best practices 자동 적용

### Playwright E2E 검증
- Phase 5 배포 전 필수 검증
- 실제 브라우저 환경 테스트
- 모든 테스트 통과 시에만 완료 처리
- "로컬에선 되는데?" 버그 제로화

---

## 📊 버전 히스토리

### v4.1.0 (2025-01-12)
- README 전역 지침 중심으로 재작성
- sso-system .gitignore 추가
- 프로젝트/전역 분리 명확화

### v4.0.0 (2025-01-12)
- GitHub 네이티브 워크플로우 추가
- Spec Kit 통합 가이드
- 한글 문서 완성
- CLAUDE.md 54% 축소 (373줄 → 171줄)

### v3.x
- Phase 0-6 워크플로우 확립
- PRD 가이드 3종 (MINIMAL/STANDARD/JUNIOR)
- Two-Phase Task Generation

---

## 🤝 기여

개인 워크플로우 관리용이지만 개선 제안 환영합니다.

- Issue 생성
- Pull Request

---

## 📝 라이센스

MIT License

---

## 🎓 빠른 참조

### 문서 네비게이션
- **워크플로우 전체**: [docs/깃허브_워크플로우_색인.md](docs/깃허브_워크플로우_색인.md)
- **영문 참조**: [README_GITHUB_WORKFLOW.md](README_GITHUB_WORKFLOW.md)

### 자주 사용하는 명령어
```bash
# GitHub 라벨 설정
bash scripts/setup-github-labels.sh

# 이슈로 작업 시작
bash scripts/github-issue-dev.sh 123

# 진행률 확인
grep -oP '\[.\]' tasks/0001-*.md | sort | uniq -c
```

---

**관리자**: 바이브 코더
**도구**: Claude Code + GitHub
**최종 업데이트**: 2025-01-12
