# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important User Requirements

When the user requests changes or modifications:
1. First update relevant MD files within the specific project to reflect the changes
2. Redesign the entire project plan according to the changes
3. Then execute the requirements

Always communicate in Korean with the user.

### Testing Strategy
1. **Always run actual tests** - Don't assume code works, verify it
2. **Check output matches requirements** - Ensure results align with user expectations
3. **Debug until resolution** - If issues arise, debug iteratively until fixed
4. **Report only after verification** - Only report completion after confirming functionality

## Additional Guidelines

### Sub-Agent Utilization
1. **Actively utilize appropriate sub-agents to enhance productivity**

### Comprehensive Testing
2. **After completing algorithms, coding, and logic, perform full end-to-end testing to minimize user trial and error**

### GitHub Repository Management
3. **When downloading materials from GitHub, create a subfolder with the same name as the repository or add/modify contents within the same folder**

## Project Management Fundamental Rules

### Version Control Management
- **Strategic version design and management** - Implement semantic versioning with clear upgrade paths
- **Mandatory version updates after modifications** - Always increment version numbers after any code changes
- **Version consistency across all project files** - Maintain unified versioning throughout the entire project

### Documentation Management
- **Comprehensive README.md updates after modifications** - Always update README.md with detailed change descriptions
- **Detailed development progress tracking in README.md** - Record current development status, ongoing work, and progress details
- **Live development journal** - Maintain real-time documentation of development decisions, blockers, and next steps

### Workspace Organization
- **Strict local folder isolation** - Never place any project files in the local working directory (E:\claude02)
- **Project-specific folder structure** - Always work within dedicated project subdirectories
- **Clean workspace maintenance** - Keep the root working directory free of project artifacts

### Documentation Standards
- **Change log documentation** - Every modification must include what was changed, why, and impact assessment  
- **Development status transparency** - Current issues, blockers, planned features, and completion estimates
- **Technical decision rationale** - Document architectural choices, trade-offs, and alternatives considered

### Git Repository Management
- **Automatic push after modifications** - Always commit and push changes when possible
- **Git connectivity check** - If GitHub integration is not available, skip this step without error
- **Commit message standards** - Use descriptive commit messages with change summary and impact

## Environment Configuration Management

### GitHub Configuration Repository Setup
- **Configuration Repository**: `claude-code-config` - Central repository for Claude Code environment settings
- **Repository URL**: `https://github.com/[username]/claude-code-config`
- **Purpose**: Synchronize Claude Code environment across multiple devices and installations

### Initial Environment Setup (Execute on every new device)
1. **Clone Configuration Repository**:
   ```bash
   cd ~
   git clone https://github.com/[username]/claude-code-config.git
   cd claude-code-config
   ```

2. **Run Auto-Setup Script**:
   ```bash
   chmod +x setup-claude.sh
   ./setup-claude.sh
   ```

3. **Verify Installation**:
   ```bash
   claude config list
   ls -la ~/.claude/
   ```

### Configuration Files Included
- **Core Configuration**: `CLAUDE.md`, `COMMANDS.md`, `FLAGS.md`, `PRINCIPLES.md`, `RULES.md`
- **Advanced Configuration**: `MCP.md`, `PERSONAS.md`, `ORCHESTRATOR.md`, `MODES.md`
- **Setup Scripts**: `setup-claude.sh` (Unix/Linux/macOS), `setup-claude.bat` (Windows)
- **Environment Templates**: Template files for different development environments

### Automatic Synchronization
- **Pull Latest Changes**: Run `git pull` in `~/claude-code-config` directory before starting work
- **Push Configuration Updates**: Automatically commit and push configuration changes when modified
- **Conflict Resolution**: Manual merge required for conflicting configurations

### Device-Specific Customization
- **Local Overrides**: Use `.claude-local.md` for device-specific settings (not tracked in Git)
- **Environment Variables**: Set device-specific paths and preferences in local environment
- **Optional Components**: Enable/disable features based on device capabilities

### Security Considerations
- **No Secrets in Repository**: Never commit API keys, tokens, or sensitive information
- **Use Environment Variables**: Store sensitive data in local environment variables
- **Git Ignore Configuration**: Comprehensive `.gitignore` to prevent accidental commits

These rules apply to all projects and are fundamental operational principles, not project-specific guidelines.