# Claude Code 환경 동기화 사용 가이드

## 🎯 개요

이 시스템을 사용하면 어떤 장비에서든 Claude Code를 실행할 때 동일한 환경과 설정을 사용할 수 있습니다.

## 📋 단계별 설정 가이드

### 1단계: GitHub 저장소 설정

1. **GitHub 계정에 새 저장소 생성**
   - 저장소 이름: `claude-code-config`
   - 공개/비공개: 개인 선택 (민감한 정보 없음)
   - README 초기화: 체크 해제

2. **로컬 저장소를 GitHub에 연결**
   ```bash
   cd claude-code-config
   git remote add origin https://github.com/[your-username]/claude-code-config.git
   git branch -M main
   git push -u origin main
   ```

### 2단계: 새 장비에서 환경 설정

1. **저장소 복제**
   ```bash
   cd ~
   git clone https://github.com/[your-username]/claude-code-config.git
   cd claude-code-config
   ```

2. **자동 설치 실행**
   
   **macOS/Linux:**
   ```bash
   chmod +x setup-claude.sh
   ./setup-claude.sh
   ```
   
   **Windows:**
   ```cmd
   setup-claude.bat
   ```

3. **설치 확인**
   ```bash
   claude config list
   ls -la ~/.claude/
   ```

## 🔄 일상적인 사용법

### 새 장비에서 작업 시작하기
```bash
# 1. 최신 설정 가져오기
cd ~/claude-code-config
git pull

# 2. 설정 업데이트 적용
./setup-claude.sh  # 또는 setup-claude.bat (Windows)

# 3. Claude Code 실행
claude
```

### 설정 변경사항 공유하기
```bash
# 1. 변경사항 커밋
cd ~/claude-code-config
git add .
git commit -m "Update: [변경 내용 설명]"

# 2. GitHub에 푸시
git push

# 3. 다른 장비에서 가져오기
git pull
./setup-claude.sh
```

## 🛠️ 설정 파일별 설명

### 핵심 설정 파일

| 파일 | 용도 | 주요 내용 |
|------|------|----------|
| `CLAUDE.md` | 프로젝트 지침 | 한국어 소통, 테스팅 전략, GitHub 연동 |
| `COMMANDS.md` | 명령어 시스템 | `/build`, `/analyze`, `/implement` 등 명령어 |
| `FLAGS.md` | 플래그 참조 | `--think`, `--uc`, `--persona-*` 등 플래그 |
| `PRINCIPLES.md` | 개발 원칙 | SOLID 원칙, 시니어 개발자 마인드셋 |
| `RULES.md` | 실행 규칙 | 파일 작업 보안, 프레임워크 준수 |

### 고급 설정 파일

| 파일 | 용도 | 주요 내용 |
|------|------|----------|
| `MCP.md` | MCP 서버 통합 | Context7, Sequential, Magic, Playwright |
| `PERSONAS.md` | 페르소나 시스템 | architect, frontend, backend 등 전문가 페르소나 |
| `ORCHESTRATOR.md` | 지능형 라우팅 | 패턴 인식, 도구 선택, 성능 최적화 |
| `MODES.md` | 운영 모드 | 작업 관리, 자기성찰, 토큰 효율성 모드 |

## ⚙️ 고급 사용법

### 장비별 사용자 정의

각 장비에서 `~/.claude/.claude-local.md` 파일을 편집하여 장비별 설정을 추가할 수 있습니다:

```markdown
# .claude-local.md

## 이 장비의 특별한 설정
- 개발용 서버: Windows Desktop
- 주요 프로젝트: React/TypeScript 웹 애플리케이션
- 특별한 요구사항: Docker 환경 우선 사용

## 사용자 정의 플래그
--local-dev-mode: 로컬 개발 환경 최적화
--docker-first: Docker 컨테이너 우선 사용
```

### 팀 설정 공유

팀에서 공통 설정을 사용하려면:

1. **팀 저장소 생성**
   ```bash
   # 회사/팀 계정에서 저장소 생성
   git clone https://github.com/company/claude-code-team-config.git
   ```

2. **개인 설정과 팀 설정 병합**
   ```bash
   # 개인 저장소에 팀 설정을 원격으로 추가
   git remote add team https://github.com/company/claude-code-team-config.git
   git fetch team
   git merge team/main
   ```

### 환경별 프로필

서로 다른 프로젝트나 환경에 따라 다른 설정을 사용하려면:

```bash
# 개발 환경
./setup-claude.sh --profile=development

# 프로덕션 환경
./setup-claude.sh --profile=production

# 특정 고객사 환경
./setup-claude.sh --profile=client-a
```

## 🚨 문제 해결

### 흔한 문제들

1. **Claude Code CLI가 없다고 나오는 경우**
   ```bash
   # Claude Code 설치 상태 확인
   which claude
   claude --version
   
   # 설치되지 않았다면 공식 사이트에서 설치
   # https://claude.ai/code
   ```

2. **설정이 적용되지 않는 경우**
   ```bash
   # 설정 파일 위치 확인
   ls -la ~/.claude/
   
   # 파일 내용 확인
   cat ~/.claude/CLAUDE.md
   
   # 재설치
   ./setup-claude.sh
   ```

3. **Git 동기화 문제**
   ```bash
   # 상태 확인
   git status
   git log --oneline -5
   
   # 강제 업데이트 (주의: 로컬 변경사항 손실 가능)
   git fetch origin
   git reset --hard origin/main
   ```

### 백업 복원

설치 스크립트는 자동으로 기존 설정을 백업합니다:

```bash
# 백업 폴더 확인
ls ~/.claude/backup-*

# 백업에서 복원
cp ~/.claude/backup-20241221-143022/* ~/.claude/
```

## 💡 팁과 요령

### 1. 빠른 동기화
매일 작업 시작 전에 실행할 스크립트:

```bash
#!/bin/bash
# sync-claude.sh
cd ~/claude-code-config
echo "📥 Updating Claude Code configuration..."
git pull
./setup-claude.sh --quiet
echo "✅ Configuration updated!"
```

### 2. 자동 백업
중요한 변경 전에 백업:

```bash
# 현재 설정 백업
cp -r ~/.claude ~/.claude-backup-$(date +%Y%m%d)
```

### 3. 설정 테스트
새 설정이 올바르게 작동하는지 테스트:

```bash
# Claude Code 설정 확인
claude config list

# 간단한 명령어 테스트
claude --help
```

### 4. 팀 협업
팀원과 설정을 공유할 때:

```bash
# 설정 변경사항을 명확하게 문서화
git commit -m "Add: New frontend persona configuration
- Enhanced React component generation
- Added TypeScript strict mode
- Updated accessibility guidelines"
```

## 🔗 추가 자료

- [Claude Code 공식 문서](https://claude.ai/code)
- [SuperClaude 프레임워크 가이드](./COMMANDS.md)
- [페르소나 시스템 가이드](./PERSONAS.md)
- [MCP 서버 통합 가이드](./MCP.md)

## 🆘 지원 요청

문제가 발생하면:

1. 이 가이드의 문제 해결 섹션 확인
2. GitHub Issues에서 유사한 문제 검색
3. 새로운 Issue 생성 (문제 재현 단계 포함)

---

**Happy Coding with Claude Code! 🚀**