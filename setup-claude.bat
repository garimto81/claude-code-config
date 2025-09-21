@echo off
setlocal enabledelayedexpansion

REM Claude Code Configuration Setup Script for Windows
REM This script sets up Claude Code environment configuration across devices

echo 🚀 Starting Claude Code configuration setup...

REM Define paths
set "CLAUDE_DIR=%USERPROFILE%\.claude"
set "SCRIPT_DIR=%~dp0"

REM Create Claude directory if it doesn't exist
if not exist "%CLAUDE_DIR%" (
    echo 📁 Creating Claude configuration directory...
    mkdir "%CLAUDE_DIR%"
) else (
    echo 📁 Claude configuration directory already exists
)

REM Backup existing configuration files
if exist "%CLAUDE_DIR%\CLAUDE.md" (
    echo 💾 Backing up existing configuration...
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%c%%a%%b
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a%%b
    set "backup_dir=%CLAUDE_DIR%\backup-!mydate!-!mytime!"
    mkdir "!backup_dir!"
    copy "%CLAUDE_DIR%\*.md" "!backup_dir!\" >nul 2>&1
    echo ✅ Backup created at: !backup_dir!
)

REM Copy configuration files
echo 📋 Copying configuration files...

REM List of configuration files
set files=CLAUDE.md COMMANDS.md FLAGS.md PRINCIPLES.md RULES.md MCP.md PERSONAS.md ORCHESTRATOR.md MODES.md

for %%f in (%files%) do (
    if exist "%SCRIPT_DIR%%%f" (
        copy "%SCRIPT_DIR%%%f" "%CLAUDE_DIR%\" >nul
        echo   ✅ Copied %%f
    ) else (
        echo   ⚠️  Warning: %%f not found in source directory
    )
)

REM Verify installation
echo 🔍 Verifying installation...
if exist "%CLAUDE_DIR%\CLAUDE.md" (
    echo ✅ Core configuration file found
) else (
    echo ❌ Core configuration file missing
    pause
    exit /b 1
)

REM Check Claude Code installation
claude --version >nul 2>&1
if !errorlevel! == 0 (
    echo ✅ Claude Code CLI detected
    echo 📊 Current configuration:
    claude config list 2>nul || echo   (No previous configuration found)
) else (
    echo ⚠️  Claude Code CLI not found. Please install Claude Code first.
    echo    Visit: https://claude.ai/code for installation instructions
)

REM Create local override template
set "local_override=%CLAUDE_DIR%\.claude-local.md"
if not exist "%local_override%" (
    (
        echo # .claude-local.md
        echo # Device-specific Claude Code configuration (not tracked in Git^)
        echo.
        echo ## Local Settings
        echo # Add device-specific settings here
        echo # These settings override global configuration
        echo.
        echo ## Examples:
        echo # - Custom shortcuts
        echo # - Device-specific paths
        echo # - Local development preferences
        echo # - Environment-specific configurations
    ) > "%local_override%"
    echo 📝 Created local override template at: %local_override%
)

echo.
echo 🎉 Claude Code configuration setup completed!
echo.
echo 📋 Next steps:
echo 1. Restart your command prompt
echo 2. Verify with: claude config list
echo 3. Customize local settings in: %local_override%
echo.
echo 🔄 To sync latest changes: cd /d "%SCRIPT_DIR%" ^&^& git pull ^&^& setup-claude.bat
echo.
echo ✨ Happy coding with Claude Code!
echo.
pause