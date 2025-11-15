# Task List: Bypass Permission Mode (PRD-0006)

**생성일**: 2025-01-15
**상태**: In Progress
**PRD**: tasks/prds/0006-prd-bypass-permission-mode.md

---

## Task 0.0: Setup
**Duration**: 5 min

- [ ] Task 0.1: Create feature branch `feature/PRD-0006-bypass-permission-mode`
- [ ] Task 0.2: Update CLAUDE.md with bypass permission mode context

**Acceptance Criteria**:
- Feature branch exists
- CLAUDE.md includes bypass mode section

---

## Task 1.0: Phase 1 - Core Implementation
**Duration**: 2-3 hours

### Task 1.1: Create bypass configuration module
**Duration**: 30 min
- [ ] Task 1.1.1: Create `src/bypass_permission_config.py`
- [ ] Task 1.1.2: Implement `BypassPermissionConfig` class
  - `__init__()`: Read `CLAUDE_BYPASS_PERMISSION` env variable
  - `should_bypass(tool_name: str) -> bool`: Return bypass status
  - Default value: `'1'` (ON)
- [ ] Task 1.1.3: Create `tests/test_bypass_permission_config.py` (1:1 pair with 1.1.1)

**Acceptance Criteria**:
- Config class reads environment variable correctly
- Default behavior is ON (bypass enabled)
- Supports values: `1`, `true`, `yes`, `on` → enabled
- Supports values: `0`, `false`, `no`, `off` → disabled

---

### Task 1.2: Integrate bypass into tool execution
**Duration**: 1 hour
- [ ] Task 1.2.1: Create `src/tool_executor.py`
- [ ] Task 1.2.2: Implement `execute_tool()` function with bypass check
  - If `bypass_enabled`: Skip permission request, execute immediately
  - Else: Use existing permission request flow
- [ ] Task 1.2.3: Create `tests/test_tool_executor.py` (1:1 pair with 1.2.1)

**Acceptance Criteria**:
- Tool execution skips permission when bypass enabled
- Tool execution requests permission when bypass disabled
- All tools supported: Bash, Write, Edit, Read, etc.

---

### Task 1.3: Add startup message
**Duration**: 30 min
- [ ] Task 1.3.1: Create `src/startup_message.py`
- [ ] Task 1.3.2: Implement `print_startup_message()` function
  - Display bypass mode status on startup
  - Show warning if bypass enabled
  - Show instructions to disable
- [ ] Task 1.3.3: Create `tests/test_startup_message.py` (1:1 pair with 1.3.1)

**Acceptance Criteria**:
- Startup message displayed when Claude Code starts
- Clear indication of bypass mode status (ENABLED/DISABLED)
- Instructions to toggle mode included

---

### Task 1.4: Main integration
**Duration**: 30 min
- [ ] Task 1.4.1: Create `src/main.py` (if not exists)
- [ ] Task 1.4.2: Integrate bypass config, tool executor, and startup message
- [ ] Task 1.4.3: Create `tests/test_main.py` (1:1 pair with 1.4.1)

**Acceptance Criteria**:
- All components work together seamlessly
- Bypass mode activates on startup based on environment variable
- Tool execution respects bypass configuration

---

## Task 2.0: Phase 2 - Testing
**Duration**: 2-3 hours

### Task 2.1: Unit tests for configuration
**Duration**: 30 min
- [ ] Task 2.1.1: Test environment variable reading
  - Test `CLAUDE_BYPASS_PERMISSION=1` → enabled
  - Test `CLAUDE_BYPASS_PERMISSION=0` → disabled
  - Test default (no env var) → enabled (기본 ON)
  - Test various truthy values: `true`, `yes`, `on`
  - Test various falsy values: `false`, `no`, `off`
- [ ] Task 2.1.2: Test `should_bypass()` method
  - Test bypass returns True when enabled
  - Test bypass returns False when disabled

**Acceptance Criteria**:
- All unit tests pass
- Code coverage ≥ 90% for config module

---

### Task 2.2: Unit tests for tool executor
**Duration**: 1 hour
- [ ] Task 2.2.1: Test tool execution with bypass enabled
  - Mock tool execution
  - Verify permission request is skipped
  - Verify tool executes immediately
- [ ] Task 2.2.2: Test tool execution with bypass disabled
  - Mock permission request
  - Verify permission is requested
  - Verify tool executes after approval
- [ ] Task 2.2.3: Test all tool types
  - Bash, Write, Edit, Read, Grep, Glob, etc.

**Acceptance Criteria**:
- All unit tests pass
- Code coverage ≥ 85% for executor module
- All tool types tested

---

### Task 2.3: Integration tests
**Duration**: 1 hour
- [ ] Task 2.3.1: Create `tests/integration/test_bypass_e2e.py`
- [ ] Task 2.3.2: Test E2E file modification with bypass
  - Set `CLAUDE_BYPASS_PERMISSION=1`
  - Request file edit
  - Verify no permission prompt
  - Verify file modified correctly
- [ ] Task 2.3.3: Test E2E bash command with bypass
  - Set `CLAUDE_BYPASS_PERMISSION=1`
  - Execute bash command
  - Verify no permission prompt
  - Verify command executed
- [ ] Task 2.3.4: Test dangerous commands bypass
  - Test `rm -rf` (in safe test environment)
  - Test `git push --force` (mock)
  - Verify auto-approval

**Acceptance Criteria**:
- All integration tests pass
- E2E workflow works without permission prompts
- Dangerous commands execute automatically in bypass mode

---

### Task 2.4: E2E tests with Playwright (optional)
**Duration**: 30 min
- [ ] Task 2.4.1: Create `tests/e2e/test_bypass_playwright.py`
- [ ] Task 2.4.2: Test UI flow with bypass enabled
  - Launch Claude Code with bypass mode
  - Execute tool via UI
  - Verify no permission dialog appears
- [ ] Task 2.4.3: Test UI flow with bypass disabled
  - Launch Claude Code without bypass
  - Execute tool via UI
  - Verify permission dialog appears

**Acceptance Criteria**:
- Playwright tests pass (if UI available)
- Visual confirmation of bypass behavior

---

### Task 2.5: Run all tests and verify coverage
**Duration**: 15 min
- [ ] Task 2.5.1: Run `pytest tests/ -v --cov=src --cov-report=term-missing`
- [ ] Task 2.5.2: Verify overall code coverage ≥ 80%
- [ ] Task 2.5.3: Fix any failing tests

**Acceptance Criteria**:
- All tests pass (100% success rate)
- Code coverage ≥ 80%
- No critical issues

---

## Task 3.0: Phase 3 - Documentation
**Duration**: 1-2 hours

### Task 3.1: Update README.md
**Duration**: 30 min
- [ ] Task 3.1.1: Add "Bypass Permission Mode" section to README
- [ ] Task 3.1.2: Include environment variable setup instructions
- [ ] Task 3.1.3: Add usage examples (local dev, CI/CD)

**Acceptance Criteria**:
- README clearly explains bypass mode
- Setup instructions are accurate
- Examples are copy-paste ready

---

### Task 3.2: Update CLAUDE.md
**Duration**: 30 min
- [ ] Task 3.2.1: Add bypass mode section to CLAUDE.md
- [ ] Task 3.2.2: Document best practices
- [ ] Task 3.2.3: Add security warnings

**Acceptance Criteria**:
- CLAUDE.md includes bypass mode guide
- Best practices documented
- Security considerations highlighted

---

### Task 3.3: Create usage examples
**Duration**: 30 min
- [ ] Task 3.3.1: Create `docs/examples/bypass-mode-local.md`
  - Local development setup (.bashrc/.zshrc)
- [ ] Task 3.3.2: Create `docs/examples/bypass-mode-ci-cd.md`
  - GitHub Actions example
  - GitLab CI example
  - Jenkins example

**Acceptance Criteria**:
- Examples are complete and tested
- Cover major CI/CD platforms
- Include troubleshooting tips

---

## Task 4.0: Phase 4 - Git & Release
**Duration**: 30 min

### Task 4.1: Commit and version
**Duration**: 10 min
- [ ] Task 4.1.1: Run `bash scripts/validate-phase-1.sh` to verify test pairing
- [ ] Task 4.1.2: Commit changes with message: `feat: Add bypass permission mode (v1.0.0) [PRD-0006]`
- [ ] Task 4.1.3: Push to remote

**Acceptance Criteria**:
- All validation checks pass
- Commit follows convention
- Code pushed to remote

---

### Task 4.2: Create PR and auto-merge
**Duration**: 10 min
- [ ] Task 4.2.1: GitHub Actions auto-creates PR
- [ ] Task 4.2.2: CI runs all tests
- [ ] Task 4.2.3: Auto-merge on success

**Acceptance Criteria**:
- PR created automatically
- All CI checks pass (pytest, coverage)
- PR auto-merged to master

---

### Task 4.3: Verify deployment
**Duration**: 10 min
- [ ] Task 4.3.1: Pull latest master
- [ ] Task 4.3.2: Test bypass mode in clean environment
  - `export CLAUDE_BYPASS_PERMISSION=1`
  - Run Claude Code
  - Verify bypass mode active
- [ ] Task 4.3.3: Test bypass mode disabled
  - `export CLAUDE_BYPASS_PERMISSION=0`
  - Run Claude Code
  - Verify permission mode active

**Acceptance Criteria**:
- Bypass mode works as expected in production
- Environment variable toggle works correctly
- No regressions in existing functionality

---

## Summary

**Total Tasks**: 31
**Total Duration**: 6-9 hours
**Test Pairing**: 100% (all implementation files have corresponding tests)

**Phase Breakdown**:
- Phase 0 (Setup): 5 min
- Phase 1 (Implementation): 2-3 hours
- Phase 2 (Testing): 2-3 hours
- Phase 3 (Documentation): 1-2 hours
- Phase 4 (Release): 30 min

**Key Files**:
- `src/bypass_permission_config.py` → `tests/test_bypass_permission_config.py`
- `src/tool_executor.py` → `tests/test_tool_executor.py`
- `src/startup_message.py` → `tests/test_startup_message.py`
- `src/main.py` → `tests/test_main.py`

**Success Criteria**:
- ✅ All tests pass (100%)
- ✅ Code coverage ≥ 80%
- ✅ Environment variable toggle works
- ✅ Bypass mode activates automatically
- ✅ All tools respect bypass configuration
- ✅ Documentation complete
