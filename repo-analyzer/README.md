# Repository Analyzer

GitHub 저장소 자동 분석 및 개선 제안 도구

## Quick Start
```bash
# 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집 (GITHUB_TOKEN, ANTHROPIC_API_KEY)

# 첫 분석
python cli.py analyze Zer0Daemon/PhaseFlow
```

## 상태
🚧 Phase 1 개발 중 - Quick Win 목표: 첫 저장소 분석 성공

## 주요 기능 (계획)
- GitHub 저장소 자동 분석
- Claude API를 통한 워크플로우 평가
- 개선 제안 생성
- 주간 리포트 자동화

## 프로젝트 구조
```
repo-analyzer/
├── cli.py                      # CLI 엔트리포인트
├── dashboard.py                # Streamlit 대시보드 (향후)
├── src/                        # 핵심 로직
│   ├── github_fetcher.py       # GitHub API 클라이언트
│   ├── analyzer.py             # Claude API 분석 엔진
│   ├── comparator.py           # 비교 로직
│   └── report_generator.py     # 리포트 생성
├── templates/                  # 템플릿 파일
├── config/                     # 설정 파일
├── outputs/                    # 분석 결과 (gitignore)
└── tests/                      # 테스트 코드
```

## 개발 로드맵
- [x] Phase 0: PRD 작성
- [ ] Phase 1: 기본 구조 및 첫 분석 기능
- [ ] Phase 2: 자동화 및 비교 기능
- [ ] Phase 3: 대시보드 개발
- [ ] Phase 4: 주간 리포트 자동화

## 라이선스
MIT