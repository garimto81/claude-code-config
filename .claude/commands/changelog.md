---
name: changelog
description: Add changelog entries maintaining format consistency
---

# /changelog - Changelog Entry Generator

Automatically add changelog entries following project standards.

## Usage

```
/changelog [version]
```

If version not specified, uses current version from `CLAUDE.md` or `package.json`.

## Changelog Format

Following [Keep a Changelog](https://keepachangelog.com/):

```markdown
# Changelog

## [Unreleased]

### Added
- New features

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Removed features

### Fixed
- Bug fixes

### Security
- Security fixes

## [1.0.0] - 2025-01-18

### Added
- Initial release
```

## Workflow

1. **Analyze Recent Changes**
   ```bash
   git log --oneline --since="last tag"
   ```

2. **Categorize Commits**
   - `feat:` → Added
   - `fix:` → Fixed
   - `docs:` → Changed (documentation)
   - `refactor:` → Changed
   - `perf:` → Changed (performance)
   - `test:` → Added (tests)
   - `chore:` → Internal changes (not in changelog)

3. **Extract PRD References**
   - `[PRD-0001]` → Link to PRD
   - `[#123]` → Link to issue/PR

4. **Format Entry**
   ```markdown
   ### Added
   - OAuth2 authentication [PRD-0001]
   - User profile API [#123]

   ### Fixed
   - Login timeout on slow connections [#124]
   ```

## Phase Integration

### Phase 3: Versioning
- `/changelog` before creating version tag
- Update CHANGELOG.md
- Commit changelog
- Create git tag

### Phase 4: PR
- Auto-update changelog in PR
- Review before merge

## Example

```bash
# Current state
CHANGELOG.md:
## [Unreleased]
(empty)

# Run command
/changelog 1.2.0

# Result
CHANGELOG.md:
## [Unreleased]

## [1.2.0] - 2025-01-18

### Added
- OAuth2 authentication provider [PRD-0001]
- User session management
- Password reset functionality [#125]

### Fixed
- Login timeout on slow connections [#124]
- Memory leak in session store [#126]

### Changed
- Improved error messages for auth failures
- Updated dependencies to latest versions

[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
```

## Auto-Detection

Analyzes commits to auto-categorize:

```bash
# Commit history:
feat: Add OAuth2 provider
fix: Resolve login timeout
docs: Update API documentation
refactor: Simplify auth logic

# Auto-generated changelog:
### Added
- OAuth2 provider

### Fixed
- Login timeout issue

### Changed
- API documentation
- Simplified authentication logic
```

## PRD Integration

Links to PRD files:
```markdown
### Added
- New authentication feature [PRD-0001](tasks/prds/0001-prd-auth.md)
```

## Related Projects

- **Conventional Commits**: https://www.conventionalcommits.org/
- **Keep a Changelog**: https://keepachangelog.com/
- **Semantic Versioning**: https://semver.org/

## Related Commands

- `/commit` - Create conventional commits
- `/create-pr` - Create pull request
- Phase 3 versioning workflow
- `scripts/validate-phase-3.sh`
