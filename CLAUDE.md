# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this claude-code-config repository.

## Project Purpose

This repository contains the Universal Claude Code Configuration System v2.1.0 - a comprehensive setup that provides:

- 31 specialized sub-agents for enhanced productivity
- 4-phase initialization protocol 
- Cross-platform installation scripts
- Automatic synchronization system
- Project type detection and templates

## Important User Requirements

When working on this configuration system:

1. **Always communicate in Korean with the user**
2. **Test all installation scripts** before pushing changes
3. **Maintain version consistency** across all configuration files
4. **Preserve backward compatibility** when making updates

### Installation Testing Strategy
1. **Test PowerShell script** on Windows environments
2. **Test Bash script** on macOS/Linux/WSL environments  
3. **Verify agent system** loads correctly after installation
4. **Check version synchronization** between components

## Development Guidelines

### Version Management
- Update `.claude/version.json` when making significant changes
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Document changes in commit messages

### Cross-Platform Compatibility
- Test installation scripts on Windows, macOS, and Linux
- Ensure path handling works across different operating systems
- Validate character encoding in scripts (avoid Korean in PowerShell)

### GitHub Repository Management
- Push changes to master branch after testing
- Use descriptive commit messages with proper prefixes
- Maintain clean repository structure

## Configuration Hierarchy

The installed system follows this priority order:
1. **Project CLAUDE.md** (highest priority - current directory)
2. **Parent directory CLAUDE.md** (inherited)
3. **Global ~/.claude/claude.md** (universal fallback)

This repository's `.claude/claude.md` becomes the global configuration when installed via the quick-install scripts.

## Testing Commands

```bash
# Test installation (macOS/Linux)
curl -sSL https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.sh | bash

# Test installation (Windows)
iwr -useb https://raw.githubusercontent.com/garimto81/claude-code-config/master/quick-install.ps1 | iex

# Verify installation
claude --version
ls ~/.claude/agents/
```

## Repository Structure

```
claude-code-config/
├── CLAUDE.md                 # Project-specific guidance (this file)
├── quick-install.ps1         # Windows PowerShell installer
├── quick-install.sh          # Unix/Linux installer  
├── .claude/                  # Configuration files to be installed globally
│   ├── claude.md            # Universal Configuration (becomes ~/.claude/claude.md)
│   ├── version.json         # Version tracking
│   ├── agents/              # 31 specialized sub-agents
│   ├── commands/            # Custom commands
│   └── *.json              # Additional configuration files
└── scripts/                 # Utility scripts
    └── healthcheck.sh       # System validation
```

This structure ensures proper separation between project-specific guidance and global configuration files.