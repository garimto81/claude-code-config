---
name: check
description: Comprehensive code quality and security checks
---

# /check - Code Quality & Security Scanner

Perform comprehensive quality and security checks with static analysis.

## Usage

```
/check [--fix]
```

Options:
- `--fix`: Automatically fix issues where possible

## Check Categories

### 1. Static Analysis

**Python**:
```bash
# Type checking
mypy src/

# Linting
ruff check src/

# Code style
black --check src/
```

**JavaScript/TypeScript**:
```bash
# ESLint
npm run lint

# TypeScript
npx tsc --noEmit

# Prettier
npm run format:check
```

### 2. Security Scanning

**Dependency Vulnerabilities**:
```bash
# Python
pip-audit

# Node.js
npm audit

# Severity: CRITICAL, HIGH, MODERATE, LOW
```

**SAST (Static Application Security Testing)**:
```bash
# Check for:
- SQL injection vulnerabilities
- XSS vulnerabilities
- Hardcoded secrets
- Insecure configurations
```

### 3. Code Smells

- Duplicate code
- Long functions (>50 lines)
- High complexity (cyclomatic > 10)
- Too many parameters (>5)
- Deep nesting (>4 levels)

### 4. Test Coverage

```bash
# Python
pytest --cov=src --cov-report=term-missing

# JavaScript
npm run test:coverage

# Minimum: 80%
```

## Phase Integration

### Phase 1: Implementation
- Run `/check` before committing
- Fix issues before moving to Phase 2

### Phase 2: Testing
- `/check` validates test quality
- Coverage threshold: 80%

### Phase 5: E2E & Security
- Security scan mandatory
- No CRITICAL vulnerabilities allowed

### Phase 6: Deployment
- Final `/check` before deploy
- All checks must pass

## Output Format

```
🔍 Running Code Quality Checks...

✅ Static Analysis
   • Type checking: PASSED
   • Linting: PASSED (2 warnings)
   • Code style: PASSED

⚠️  Security Scan
   • Dependency vulnerabilities: 1 MODERATE
   • SAST: PASSED
   → Run: npm audit fix

✅ Code Smells
   • No critical issues found

✅ Test Coverage
   • Coverage: 87% (target: 80%)

Summary: 1 warning, 1 moderate issue
Action: Fix npm vulnerabilities before deploy
```

## Auto-Fix Mode

```bash
/check --fix

# Automatically fixes:
- Code formatting
- Import sorting
- Simple linting issues
- Moderate vulnerabilities (safe updates)

# Manual review needed:
- Breaking changes
- Major version updates
- Complex refactoring
```

## Integration with Agents

- **security-auditor**: Deep security analysis
- **code-reviewer**: Code quality review
- **performance-engineer**: Performance issues

## Related

- `/optimize` - Performance optimization
- `/tdd` - Test-driven development
- `security-scanning` plugin
- Phase 5 validation
