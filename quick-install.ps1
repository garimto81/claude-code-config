# Claude Code Quick Install Script for Windows PowerShell
# Usage: iwr -useb https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.ps1 | iex

Write-Host "🚀 Claude Code Universal Configuration v2.1.0 자동 설정 시작..." -ForegroundColor Green
Write-Host "📍 GitHub에서 최신 설정을 다운로드합니다..." -ForegroundColor Blue

# 설정 변수
$ClaudeDir = "$env:USERPROFILE\.claude"
$ConfigRepoDir = "$env:USERPROFILE\.claude-config"

# Claude 설정 디렉토리 생성
if (!(Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Host "📁 Claude 설정 디렉토리 생성됨" -ForegroundColor Green
} else {
    Write-Host "📁 Claude 설정 디렉토리 이미 존재" -ForegroundColor Yellow
}

# 기존 설정 백업
if (Test-Path "$ClaudeDir\claude.md") {
    $BackupDir = "$ClaudeDir\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item "$ClaudeDir\*" $BackupDir -Recurse -ErrorAction SilentlyContinue
    Write-Host "💾 기존 설정 백업 완료: $BackupDir" -ForegroundColor Green
}

Write-Host "📥 Claude Code 설정 저장소 클론 중..." -ForegroundColor Blue

# Git 설치 확인 및 저장소 클론/업데이트
try {
    $GitVersion = & git --version 2>$null
    if ($GitVersion) {
        Write-Host "✅ Git 감지됨: $GitVersion" -ForegroundColor Green
        
        # 기존 저장소가 있다면 업데이트, 없다면 클론
        if (Test-Path "$ConfigRepoDir\.git") {
            Write-Host "🔄 기존 설정 저장소 업데이트 중..." -ForegroundColor Cyan
            Set-Location $ConfigRepoDir
            & git pull --ff-only 2>$null
        } else {
            Write-Host "📥 설정 저장소 클론 중..." -ForegroundColor Cyan
            & git clone "https://github.com/garimto81/claude-code-config.git" $ConfigRepoDir 2>$null
        }
        
        # .claude 폴더 내용을 사용자 Claude 디렉토리로 복사
        if (Test-Path "$ConfigRepoDir\.claude") {
            Write-Host "📋 설정 파일 복사 중..." -ForegroundColor Cyan
            Copy-Item "$ConfigRepoDir\.claude\*" $ClaudeDir -Recurse -Force
            Write-Host "✅ 모든 설정 파일 복사 완료" -ForegroundColor Green
        }
        
    } else {
        throw "Git이 설치되지 않음"
    }
} catch {
    Write-Host "⚠️ Git을 찾을 수 없습니다. Git을 설치해주세요." -ForegroundColor Red
    Write-Host "Git 다운로드: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Claude Code 자동 설정 완료!" -ForegroundColor Green
Write-Host ""

# 설치된 파일들 확인
Write-Host "📋 설치된 구성 요소:" -ForegroundColor Blue
if (Test-Path "$ClaudeDir\claude.md") {
    Write-Host "  ✅ 메인 설정 파일 (claude.md)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\version.json") {
    $Version = (Get-Content "$ClaudeDir\version.json" | ConvertFrom-Json).version
    Write-Host "  ✅ 버전 파일 (v$Version)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\agents") {
    $AgentCount = (Get-ChildItem "$ClaudeDir\agents\*.md").Count
    Write-Host "  ✅ Sub-Agent 시스템 ($AgentCount 개 에이전트)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\commands") {
    $CommandCount = (Get-ChildItem "$ClaudeDir\commands\*.md").Count
    Write-Host "  ✅ 커스텀 명령어 ($CommandCount 개)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ 이제 Claude Code를 실행하세요!" -ForegroundColor Magenta

# Claude CLI 설치 확인
try {
    $ClaudeVersion = & claude --version 2>$null
    if ($ClaudeVersion) {
        Write-Host "✅ Claude Code CLI 감지됨: $ClaudeVersion" -ForegroundColor Green
        Write-Host "🚀 모든 준비가 완료되었습니다!" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Claude Code CLI를 설치해주세요: https://claude.ai/code" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 향후 업데이트:" -ForegroundColor Blue
Write-Host "iwr -useb https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.ps1 | iex" -ForegroundColor Cyan