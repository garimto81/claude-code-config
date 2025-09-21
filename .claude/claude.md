# 🎯 Claude Code Universal Configuration v2.0
> 이 파일은 Claude Code가 자동으로 로드하며, 모든 작업의 기준이 됩니다.

## ⚡ INITIALIZATION PROTOCOL [자동 실행]
> 모든 세션 시작 시 아래 체크리스트를 순서대로 실행하고 결과를 보고하세요.

### Phase 1: 환경 검증
```bash
# 1. GitHub 연동 상태 확인
if command -v gh &> /dev/null; then
    gh auth status 2>/dev/null || echo "⚠️ GitHub 미연동 - Settings > Integrations 필요"
else
    echo "⚠️ GitHub CLI 미설치 - OAuth 웹 인증 필요"
fi

# 2. 설정 저장소 존재 확인
if [ ! -d ~/.claude-config ]; then
    echo "🔄 초기 설정 다운로드 중..."
    git clone --depth=1 https://github.com/[username]/claude-code-config.git ~/.claude-config
    rsync -a ~/.claude-config/.claude/ ~/.claude/
fi

# 3. 버전 확인 및 마이그레이션
LOCAL_VERSION=$(cat ~/.claude/version.json | jq -r .version 2>/dev/null || echo "0.0.0")
REMOTE_VERSION=$(curl -s https://api.github.com/repos/[username]/claude-code-config/contents/.claude/version.json | jq -r .content | base64 -d | jq -r .version)

if [ "$LOCAL_VERSION" != "$REMOTE_VERSION" ]; then
    echo "🔄 버전 업데이트 필요: $LOCAL_VERSION → $REMOTE_VERSION"
    cd ~/.claude-config && git pull --ff-only
    rsync -a ~/.claude-config/.claude/ ~/.claude/
    
    # 마이그레이션 실행
    if [ -f ~/.claude/migrations/migrate-${LOCAL_VERSION}-to-${REMOTE_VERSION}.sh ]; then
        bash ~/.claude/migrations/migrate-${LOCAL_VERSION}-to-${REMOTE_VERSION}.sh
    fi
fi
```

### Phase 2: 프로젝트 타입 감지 및 설정 적용
```bash
# 프로젝트 타입 자동 감지 및 템플릿 적용
detect_and_apply_project_config() {
    local project_type=""
    
    # Node.js/JavaScript
    if [ -f package.json ]; then
        project_type="javascript"
        echo "📦 Node.js project detected"
    # Python
    elif [ -f requirements.txt ] || [ -f pyproject.toml ] || [ -f Pipfile ]; then
        project_type="python"
        echo "🐍 Python project detected"
    # Rust
    elif [ -f Cargo.toml ]; then
        project_type="rust"
        echo "🦀 Rust project detected"
    # Go
    elif [ -f go.mod ]; then
        project_type="go"
        echo "🐹 Go project detected"
    fi
    
    # 템플릿 적용 (프로젝트별 CLAUDE.md 오버레이)
    if [ -n "$project_type" ] && [ -f ~/.claude-config/templates/$project_type/CLAUDE.md ]; then
        echo "✅ Loading $project_type specific configuration"
        # 프로젝트별 설정을 컨텍스트에 추가
        cat ~/.claude-config/templates/$project_type/CLAUDE.md
    fi
    
    # 로컬 프로젝트 CLAUDE.md 확인
    if [ -f ./CLAUDE.md ]; then
        echo "📌 Project-specific CLAUDE.md found - applying overrides"
    fi
}

detect_and_apply_project_config
```

### Phase 3: 개발 환경 설정
```bash
# Dev Container 감지 및 제안
if [ -f .devcontainer/devcontainer.json ]; then
    echo "🐳 Dev Container available - 'Reopen in Container' for consistent environment"
elif command -v docker &> /dev/null; then
    echo "🐳 Docker available - consider using Dev Container for consistency"
fi

# 필수 도구 확인
check_required_tools() {
    local missing_tools=()
    
    # 기본 도구 체크
    for tool in git curl jq; do
        if ! command -v $tool &> /dev/null; then
            missing_tools+=($tool)
        fi
    done
    
    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo "⚠️ Missing tools: ${missing_tools[*]}"
        echo "   Install with: [package manager] install ${missing_tools[*]}"
    fi
}

check_required_tools
```

### Phase 4: 동기화 잠금 및 상태 보고
```bash
# 동기화 잠금 및 상태 확인
LOCK_FILE=~/.claude/.sync.lock
STATE_DIR=~/.claude/state
mkdir -p "$STATE_DIR"

if [ -f "$LOCK_FILE" ]; then
    LOCK_AGE=$(($(date +%s) - $(stat -f %m "$LOCK_FILE" 2>/dev/null || stat -c %Y "$LOCK_FILE")))
    if [ $LOCK_AGE -gt 300 ]; then  # 5분 이상 된 잠금은 제거
        rm -f "$LOCK_FILE"
        echo "🔓 Removed stale lock file"
    fi
fi

# 상태 파일 업데이트
if [ -d ~/.claude-config/.git ]; then
    git -C ~/.claude-config rev-parse HEAD > "$STATE_DIR/HEAD" 2>/dev/null || true
    date +%FT%T > "$STATE_DIR/last_sync"
fi

# Stale 감지
if [ -f "$STATE_DIR/last_sync" ]; then
    LAST_SYNC=$(cat "$STATE_DIR/last_sync")
    HOURS_SINCE=$(( ($(date +%s) - $(date -d "$LAST_SYNC" +%s 2>/dev/null || echo 0)) / 3600 ))
    if [ $HOURS_SINCE -gt 24 ]; then
        echo "⚠️ Configuration is $HOURS_SINCE hours old - consider updating"
    fi
fi

# 최종 상태 보고
echo "
╔════════════════════════════════════════╗
║     Claude Code Environment Ready      ║
╠════════════════════════════════════════╣
║ Version: $(cat ~/.claude/version.json | jq -r .version 2>/dev/null || echo "unknown")
║ GitHub:  $(gh auth status 2>/dev/null | grep -q "Logged in" && echo "✅ Connected" || echo "⚠️ Not connected")
║ Project: $(basename $(pwd))
║ Type:    ${project_type:-"Generic"}
║ Updated: $(date -r ~/.claude/claude.md '+%Y-%m-%d %H:%M' 2>/dev/null || date '+%Y-%m-%d %H:%M')
╚════════════════════════════════════════╝
"
```

## 🎨 UNIVERSAL STANDARDS

### 한국어 소통 원칙
**Always communicate in Korean with the user.**

사용자와의 모든 소통은 한국어로 진행하며, 기술적 설명도 한국어로 제공합니다.

### Git Workflow
```yaml
commit_format: "type(scope): description"
types: [feat, fix, docs, style, refactor, test, chore, perf, build]
branch_naming:
  - feature/[ticket]-[description]
  - bugfix/[ticket]-[description]
  - hotfix/[ticket]-[description]
workflow:
  - Always pull before push
  - Rebase feature branches
  - Squash commits when merging
```

### Security Rules
```yaml
never_commit:
  - .env, .env.*
  - "*.key", "*.pem", "*.cert"
  - secrets/, credentials/
  - "*.sqlite", "*.db" (unless explicitly allowed)
  - ~/.claude/secrets/* (always local only)
api_keys: "Use environment variables only"
secrets_management: 
  - "~/.claude/secrets/ for local secrets (Git ignored)"
  - "OS keychain (Keychain/Credential Manager/gnome-keyring)"
  - "HashiCorp Vault or cloud KMS for production"
oauth_policy: "Each device requires manual 1-time authentication"
```

### Code Quality
```yaml
formatting:
  - Auto-format on save
  - Use project .editorconfig
linting:
  - Fix all warnings before commit
  - Run pre-commit hooks
testing:
  - Minimum 80% coverage
  - All tests must pass before push
  - Always run actual tests - Don't assume code works, verify it
  - Check output matches requirements - Ensure results align with user expectations
  - Debug until resolution - If issues arise, debug iteratively until fixed
  - Report only after verification - Only report completion after confirming functionality
documentation:
  - Update README for public changes
  - Document breaking changes
  - Keep CHANGELOG.md current
```

## 🔄 CONTINUOUS OPERATIONS

### Every Session Start
1. Sync configuration: `cd ~/.claude-config && git pull --ff-only`
2. Check for migrations: `~/.claude/migrations/check.sh`
3. Validate environment: `~/.claude-config/scripts/healthcheck.sh`
4. Load project context: `find . -name "CLAUDE.md" -exec cat {} \;`

### Every File Save
- Format code if formatter configured
- Update imports/dependencies
- Check for security issues

### Every Commit
- Validate commit message format
- Run linters and tests
- Update version if needed

## 🛠️ STANDARD COMMANDS
```makefile
# Universal commands available in every project
make setup      # Initialize project environment
make test       # Run all tests with coverage
make lint       # Run linters and formatters
make build      # Build project artifacts
make deploy     # Deploy to target environment
make clean      # Clean generated files
make help       # Show all available commands
```

## 📊 CONTEXT AWARENESS

### Information Hierarchy
1. **Current directory CLAUDE.md** (most specific)
2. **Parent directories CLAUDE.md** (inherited)
3. **Project root CLAUDE.md** (project-wide)
4. **Template CLAUDE.md** (language-specific)
5. **Global ~/.claude/claude.md** (universal)

### Smart Behaviors
- **On error**: Attempt auto-fix → Explain issue → Suggest solution
- **On conflict**: Show diff → Explain implications → Ask for decision
- **On performance issue**: Profile → Identify bottleneck → Optimize
- **On security warning**: Block action → Explain risk → Provide safe alternative

## 🚫 ABSOLUTE RESTRICTIONS
```yaml
never_modify:
  - /infra/prod/*
  - /.github/workflows/prod-*
  - "*.generated.*"
  - "*.lock" (unless explicitly requested)
read_only:
  - Production databases
  - Customer data
  - Audit logs
require_confirmation:
  - Deleting > 10 files
  - Modifying > 100 lines
  - Any destructive operation
```

## 🔌 MCP (Model Context Protocol) Tools
Refer to ~/.claude/settings/tools.md for available tools:
- File system operations (with restrictions)
- GitHub integration (PRs, issues, reviews)
- Database access (read-only by default)
- External API calls (with rate limiting)
- Shell command execution (sandboxed)

## 💡 DECISION FRAMEWORK
When facing choices, prioritize in order:
1. **Security** - Never compromise
2. **Data integrity** - Protect user data
3. **Performance** - Optimize when needed
4. **Maintainability** - Write clear code
5. **Features** - Implement requested functionality

## 📈 METRICS & REPORTING
Track and report:
- Task completion time
- Code quality metrics
- Test coverage changes
- Security scan results
- Performance benchmarks

---
Last updated: $(date)
Configuration version: 2.0.0