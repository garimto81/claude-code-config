# Claude Code Configuration Repository

이 저장소는 Claude Code 환경 설정을 여러 장비에서 동일하게 유지하기 위한 중앙 집중식 구성 관리 시스템입니다.

## 🎯 목적

- **일관된 환경**: 모든 장비에서 동일한 Claude Code 설정 사용
- **자동 동기화**: GitHub를 통한 설정 파일 중앙 관리
- **쉬운 설정**: 스크립트를 통한 원클릭 환경 구성
- **백업 및 복원**: 기존 설정 백업 및 복원 기능

## 📁 포함된 파일들

### 핵심 설정 파일
- `CLAUDE.md` - 프로젝트별 Claude Code 지침
- `COMMANDS.md` - SuperClaude 명령어 시스템
- `FLAGS.md` - 플래그 시스템 참조
- `PRINCIPLES.md` - 개발 원칙 및 철학
- `RULES.md` - 실행 가능한 규칙

### 고급 설정 파일
- `MCP.md` - MCP 서버 통합 설정
- `PERSONAS.md` - 페르소나 시스템 설정
- `ORCHESTRATOR.md` - 지능형 라우팅 시스템
- `MODES.md` - 운영 모드 설정

### 설치 스크립트
- `setup-claude.sh` - Unix/Linux/macOS 자동 설치 스크립트
- `setup-claude.bat` - Windows 자동 설치 스크립트

## 🚀 새 장비에서 설정하기

### 1. 저장소 복제
```bash
cd ~
git clone https://github.com/[your-username]/claude-code-config.git
cd claude-code-config
```

### 2. 자동 설치 실행

**Unix/Linux/macOS:**
```bash
chmod +x setup-claude.sh
./setup-claude.sh
```

**Windows:**
```cmd
setup-claude.bat
```

### 3. 설치 확인
```bash
claude config list
ls -la ~/.claude/
```

## 🔄 설정 동기화

### 최신 설정 가져오기
```bash
cd ~/claude-code-config
git pull
./setup-claude.sh  # 또는 setup-claude.bat (Windows)
```

### 설정 변경사항 업로드
```bash
cd ~/claude-code-config
git add .
git commit -m "Update configuration: [변경 내용 설명]"
git push
```

## ⚙️ 장비별 사용자 정의

### 로컬 설정 오버라이드
`~/.claude/.claude-local.md` 파일에서 장비별 설정을 관리할 수 있습니다:

```markdown
# .claude-local.md
# 장비별 설정 (Git에서 추적되지 않음)

## 로컬 설정
- 사용자 정의 단축키
- 장비별 경로 설정
- 로컬 개발 환경 설정
```

## 🛡️ 보안 고려사항

- **민감한 정보 제외**: API 키, 토큰 등은 절대 커밋하지 않음
- **환경 변수 사용**: 민감한 데이터는 로컬 환경 변수로 관리
- **`.gitignore` 설정**: 실수로 인한 민감한 파일 커밋 방지

## 📋 지원 운영체제

- ✅ macOS
- ✅ Linux (Ubuntu, CentOS, etc.)
- ✅ Windows 10/11
- ✅ WSL (Windows Subsystem for Linux)

## 🆘 문제 해결

### Claude Code CLI가 설치되지 않은 경우
1. [Claude Code 공식 사이트](https://claude.ai/code) 방문
2. 운영체제에 맞는 설치 프로그램 다운로드
3. 설치 후 터미널/명령 프롬프트 재시작
4. 설치 스크립트 재실행

### 기존 설정과 충돌하는 경우
- 자동 백업이 `~/.claude/backup-[날짜-시간]` 폴더에 생성됨
- 필요시 백업 폴더에서 기존 설정 복원 가능

### Git 동기화 문제
```bash
# 충돌 해결
git pull --rebase origin main
# 수동 병합 후
git add .
git commit -m "Resolve configuration conflicts"
git push
```

## 🚀 고급 기능

### 자동 동기화 설정
Git hooks를 통해 자동 동기화 설정 가능:

```bash
# .git/hooks/post-checkout 파일 생성 (자동 생성됨)
#!/bin/bash
echo "📥 Configuration sync after git checkout..."
./setup-claude.sh --sync-only
```

### 여러 환경 프로필
환경별 설정 템플릿 사용:

```bash
# 개발 환경
./setup-claude.sh --profile=development

# 프로덕션 환경  
./setup-claude.sh --profile=production
```

## 📝 변경 로그

### v1.0.0 (2024-12-21)
- 초기 설정 시스템 구축
- 자동 설치 스크립트 생성
- 크로스 플랫폼 지원 추가
- 백업 및 복원 기능 구현

## 🤝 기여하기

1. 이 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙋‍♀️ 지원

문제가 발생하거나 질문이 있으시면 [Issues](https://github.com/[your-username]/claude-code-config/issues) 페이지에서 문의해 주세요.