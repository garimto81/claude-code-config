# Claude Code Quick Install Script for Windows PowerShell
# Usage: iwr -useb https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.ps1 | iex

Write-Host "Starting Claude Code Universal Configuration v2.1.0 setup..." -ForegroundColor Green
Write-Host "Downloading latest configuration from GitHub..." -ForegroundColor Blue

# Configuration variables
$ClaudeDir = "$env:USERPROFILE\.claude"
$ConfigRepoDir = "$env:USERPROFILE\.claude-config"

# Create Claude configuration directory
if (!(Test-Path $ClaudeDir)) {
    New-Item -ItemType Directory -Path $ClaudeDir -Force | Out-Null
    Write-Host "Created Claude configuration directory" -ForegroundColor Green
} else {
    Write-Host "Claude configuration directory already exists" -ForegroundColor Yellow
}

# Backup existing configuration
if (Test-Path "$ClaudeDir\claude.md") {
    $BackupDir = "$ClaudeDir\backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    Copy-Item "$ClaudeDir\*" $BackupDir -Recurse -ErrorAction SilentlyContinue
    Write-Host "Existing configuration backed up to: $BackupDir" -ForegroundColor Green
}

Write-Host "Cloning Claude Code configuration repository..." -ForegroundColor Blue

# Check Git installation and clone/update repository
try {
    $GitVersion = & git --version 2>$null
    if ($GitVersion) {
        Write-Host "Git detected: $GitVersion" -ForegroundColor Green
        
        # Update existing repository or clone new one
        if (Test-Path "$ConfigRepoDir\.git") {
            Write-Host "Updating existing configuration repository..." -ForegroundColor Cyan
            & git -C $ConfigRepoDir pull --ff-only 2>$null
        } else {
            Write-Host "Cloning configuration repository..." -ForegroundColor Cyan
            & git clone "https://github.com/garimto81/claude-code-config.git" $ConfigRepoDir 2>$null
        }
        
        # Copy main CLAUDE.md and .claude folder contents to user Claude directory
        if (Test-Path "$ConfigRepoDir\CLAUDE.md") {
            Write-Host "Copying main configuration file..." -ForegroundColor Cyan
            Copy-Item "$ConfigRepoDir\CLAUDE.md" "$ClaudeDir\CLAUDE.md" -Force
        }
        
        if (Test-Path "$ConfigRepoDir\.claude") {
            Write-Host "Copying additional configuration files..." -ForegroundColor Cyan
            Copy-Item "$ConfigRepoDir\.claude\*" $ClaudeDir -Recurse -Force
            Write-Host "All configuration files copied successfully" -ForegroundColor Green
        }
        
    } else {
        throw "Git not installed"
    }
} catch {
    Write-Host "Git not found. Please install Git first." -ForegroundColor Red
    Write-Host "Download Git: https://git-scm.com/downloads" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Claude Code setup completed successfully!" -ForegroundColor Green
Write-Host ""

# Check installed components
Write-Host "Installed components:" -ForegroundColor Blue
if (Test-Path "$ClaudeDir\claude.md") {
    Write-Host "  - Main configuration file (claude.md)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\version.json") {
    $Version = (Get-Content "$ClaudeDir\version.json" | ConvertFrom-Json).version
    Write-Host "  - Version file (v$Version)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\agents") {
    $AgentCount = (Get-ChildItem "$ClaudeDir\agents\*.md").Count
    Write-Host "  - Sub-Agent system ($AgentCount agents)" -ForegroundColor Green
}
if (Test-Path "$ClaudeDir\commands") {
    $CommandCount = (Get-ChildItem "$ClaudeDir\commands\*.md").Count
    Write-Host "  - Custom commands ($CommandCount commands)" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now run Claude Code!" -ForegroundColor Magenta

# Check Claude CLI installation
try {
    $ClaudeVersion = & claude --version 2>$null
    if ($ClaudeVersion) {
        Write-Host "Claude Code CLI detected: $ClaudeVersion" -ForegroundColor Green
        Write-Host "Everything is ready to go!" -ForegroundColor Green
    }
} catch {
    Write-Host "Please install Claude Code CLI: https://claude.ai/code" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "To update in the future, run:" -ForegroundColor Blue
Write-Host "iwr -useb https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.ps1 | iex" -ForegroundColor Cyan