---
name: create-pr
description: Streamline PR creation with branch handling, commits, and formatting
---

# /create-pr - Pull Request Automation

Automate pull request creation with proper formatting and best practices.

## Usage

```
/create-pr [base-branch]
```

Default base branch: `master` (configured in CLAUDE.md)

## Workflow

1. **Verify Git State**
   - Check current branch
   - Ensure clean working directory
   - Verify commits exist

2. **Push Changes**
   - Push to remote with `-u` flag
   - Handle branch tracking

3. **Generate PR Description**
   - Analyze commits since base branch
   - Extract changes from `git log`
   - Format with template:
     ```markdown
     ## Summary
     - Key changes

     ## Test Plan
     - [ ] Testing checklist

     ## Related
     - PRD reference
     ```

4. **Create PR**
   - Use `gh pr create`
   - Apply labels automatically
   - Link to issues

## Phase Integration

- **Phase 4**: Primary use case
- Works with auto-pr-merge.yml workflow
- References `[PRD-NNNN]` or `[#issue]`

## Example

```bash
# Current branch: feature/PRD-0001-auth
/create-pr

# Output:
# ✓ Pushing to origin/feature/PRD-0001-auth
# ✓ Analyzing 3 commits
# ✓ Creating PR #42: Add OAuth2 authentication
# → https://github.com/user/repo/pull/42
```

## Auto-Merge Integration

If commit message matches pattern `(vX.Y.Z) [PRD-NNNN]`:
- PR auto-created by GitHub Actions
- CI runs automatically
- Auto-merges on pass
- Branch deleted

Manual `/create-pr` for:
- Draft PRs
- Custom descriptions
- Multiple reviewers

## Related

- `/commit` - Create commit first
- `/fix-pr` - Fix PR comments
- `.github/workflows/auto-pr-merge.yml`
