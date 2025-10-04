# CLAUDE.md v6.0 - Project Mode

## 🎯 핵심 규칙
- 한국어 소통
- **문서 먼저** → 계획 → 실행
- 테스트 → 검증 → 완료 보고

## 📝 문서 관리 (프로젝트별)
### 각 프로젝트 폴더에 3대 문서 생성
```
e:/claude/[프로젝트명]/
  ├── PRD_[프로젝트].md   - 요구사항
  ├── LLD_[프로젝트].md   - 기술 설계
  └── PLAN_[프로젝트].md  - 실행 계획
```

### 원칙
- ❌ 새 문서 생성 금지 (위 3개 외)
- ✅ 기존 문서만 업데이트
- 📌 문서 없이 코드 작성 금지
- 🗂️ 프로젝트별 문서 분리 관리

## 🤖 에이전트
```yaml
active: [debugger, code-reviewer]
auto_detect: true
```

## 🔌 MCP 서버
```yaml
설정: .claude/mcp-servers.json
- context7: 문서
- github: Git
- exa: 검색
- chrome-devtools: 브라우저
```

## 🔧 설정
- `.claude/config.json` - 전역
- `.claude/settings.json` - 권한
- `.claude/workflows.yml` - 워크플로우
- `.claude/templates/` - 문서 템플릿
