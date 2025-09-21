# Claude Code Quick Install Script for Windows PowerShell
# Usage: iwr -useb https://raw.githubusercontent.com/[username]/claude-code-config/main/quick-install.ps1 | iex

Write-Host "🚀 Claude Code 자동 설정 시작..." -ForegroundColor Green
Write-Host "📍 GitHub에서 최신 설정을 다운로드합니다..." -ForegroundColor Blue

# 설정 변수
$RepoUrl = "https://raw.githubusercontent.com/[username]/claude-code-config/main"
$ClaudeDir = "$env:USERPROFILE\.claude"

# 필수 파일 목록
$ConfigFiles = @(
    "CLAUDE.md",
    "COMMANDS.md", 
    "FLAGS.md",
    "PRINCIPLES.md",
    "RULES.md",
    "MCP.md",
    "PERSONAS.md",
    "ORCHESTRATOR.md",
    "MODES.md"
)

# Claude 설정 디렉토리 생성
if (!(Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Host "📁 Claude 설정 디렉토리 생성됨" -ForegroundColor Green
} else {
    Write-Host "📁 Claude 설정 디렉토리 이미 존재" -ForegroundColor Yellow
}

# 기존 설정 백업
if (Test-Path "$ClaudeDir\CLAUDE.md") {
    $BackupDir = "$ClaudeDir\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item "$ClaudeDir\*.md" $BackupDir -ErrorAction SilentlyContinue
    Write-Host "💾 기존 설정 백업 완료: $BackupDir" -ForegroundColor Green
}

# 설정 파일들 다운로드 및 설치
Write-Host "📥 설정 파일 다운로드 중..." -ForegroundColor Blue

foreach ($File in $ConfigFiles) {
    try {
        Write-Host "📥 다운로드: $File" -ForegroundColor Cyan
        $Url = "$RepoUrl/$File"
        $Destination = "$ClaudeDir\$File"
        
        # PowerShell 버전에 따른 다운로드 방법 선택
        if ($PSVersionTable.PSVersion.Major -ge 3) {
            Invoke-WebRequest -Uri $Url -OutFile $Destination -UseBasicParsing
        } else {
            $WebClient = New-Object System.Net.WebClient
            $WebClient.DownloadFile($Url, $Destination)
            $WebClient.Dispose()
        }
        
        Write-Host "  ✅ $File 설치 완료" -ForegroundColor Green
    }
    catch {
        Write-Host "  ⚠️ $File 다운로드 실패: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Claude Code 자동 설정 완료!" -ForegroundColor Green
Write-Host ""

# 설치된 파일들 확인
Write-Host "📋 설치된 파일들:" -ForegroundColor Blue
Get-ChildItem "$ClaudeDir\*.md" -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "  ✅ $($_.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✨ 이제 Claude Code를 실행하세요!" -ForegroundColor Magenta

# Claude CLI 설치 확인
try {
    $ClaudeVersion = & claude --version 2>$null
    if ($ClaudeVersion) {
        Write-Host "✅ Claude Code CLI 감지됨: $ClaudeVersion" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️ Claude Code CLI를 설치해주세요: https://claude.ai/code" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔄 향후 업데이트:" -ForegroundColor Blue
Write-Host "iwr -useb $RepoUrl/quick-install.ps1 | iex" -ForegroundColor Cyan