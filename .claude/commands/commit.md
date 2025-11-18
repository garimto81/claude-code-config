---
name: commit
description: Create git commits using conventional commit format with emojis
---

# /commit - Conventional Commit Generator

Create well-formatted git commits following Conventional Commits specification with appropriate emojis.

## Usage

```
/commit
```

Claude Code will:
1. Analyze staged changes (`git diff --cached`)
2. Determine commit type (feat, fix, docs, refactor, etc.)
3. Generate descriptive commit message
4. Add appropriate emoji
5. Execute `git commit`

## Commit Format

```
<type>(<scope>): <subject> <emoji>

<body>

<footer>
```

## Commit Types

- **feat**: New feature (✨)
- **fix**: Bug fix (🐛)
- **docs**: Documentation (📝)
- **style**: Formatting (💄)
- **refactor**: Code restructuring (♻️)
- **perf**: Performance (⚡)
- **test**: Tests (✅)
- **chore**: Maintenance (🔧)
- **ci**: CI/CD (👷)

## Phase Integration

- **Phase 1**: Commit implementation changes
- **Phase 2**: Commit test files
- **Phase 3**: Commit version tags
- **Phase 4**: Auto-commit before PR (with auto-pr-merge.yml)

## Example

**Input**: Staged changes adding new authentication feature

**Output**:
```bash
git commit -m "feat(auth): Add OAuth2 authentication ✨

- Implement OAuth2 provider
- Add token validation
- Create auth middleware

[PRD-0001]"
```

## Related

- `/create-pr` - Create pull request after commit
- Phase 4 workflow in CLAUDE.md
- `.github/workflows/auto-pr-merge.yml`
