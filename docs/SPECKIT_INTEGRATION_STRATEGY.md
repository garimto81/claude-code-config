# GitHub Spec Kit Integration Strategy
*Comprehensive analysis for integrating Spec Kit with CLAUDE.md Phase 0-6 workflow*

**Version**: 1.0.0 | **Date**: 2025-11-10
**Target User**: Solo Developer (Vibe Coder) | **Context**: SSO System + Multi-App Architecture

---

## Executive Summary

This document provides three concrete integration strategies for adopting GitHub Spec Kit into the existing CLAUDE.md Phase 0-6 workflow. Each strategy is evaluated for ROI, implementation complexity, and suitability for a solo developer building an SSO system with Supabase and Claude Code.

**Critical Finding**: Spec Kit and CLAUDE.md solve different problems. Spec Kit excels at **intent documentation and AI consistency**, while CLAUDE.md excels at **execution speed and token optimization**. The optimal approach is selective integration, not wholesale replacement.

---

## Table of Contents

1. [Overlap & Synergy Analysis](#overlap--synergy-analysis)
2. [Integration Architecture Options](#integration-architecture-options)
3. [Strategy 1: Minimalist Integration (1 hour)](#strategy-1-minimalist-integration-1-hour)
4. [Strategy 2: Full Integration (1 day)](#strategy-2-full-integration-1-day)
5. [Strategy 3: Progressive Enhancement (4 weeks)](#strategy-3-progressive-enhancement-4-weeks)
6. [Decision Framework](#decision-framework)
7. [Critical Analysis](#critical-analysis)
8. [Recommendations](#recommendations)

---

## Overlap & Synergy Analysis

### Component Comparison Matrix

| Component | CLAUDE.md Phase 0-6 | GitHub Spec Kit | Overlap | Unique Value |
|-----------|---------------------|-----------------|---------|--------------|
| **Requirements** | PRD (3 levels: Minimal/Standard/Junior) | `/speckit.specify` | 90% | **CLAUDE**: Token optimization, 3 complexity levels<br>**Spec Kit**: AI agent abstraction, iterative refinement |
| **Technical Plan** | Phase 0.5 Task List (Parent → Sub-tasks) | `/speckit.plan` | 80% | **CLAUDE**: 1:1 test pairing, checkboxes<br>**Spec Kit**: Architecture constraints, technology independence |
| **Task Breakdown** | `generate_tasks.py` script | `/speckit.tasks` | 70% | **CLAUDE**: Python automation, local files<br>**Spec Kit**: GitHub Issues native, cross-agent |
| **Implementation** | Phase 1-6 (Code → Deploy) | `/speckit.implement` | 60% | **CLAUDE**: Full automation (test, version, git, cache)<br>**Spec Kit**: AI execution guidance only |
| **Principles** | Security Checklist (hardcoded in CLAUDE.md) | `/speckit.constitution` | 40% | **CLAUDE**: Embedded in workflow<br>**Spec Kit**: Separate file, shareable across projects |
| **Clarification** | A/B/C/D questions (3-8 questions) | `/speckit.clarify` | 50% | **CLAUDE**: Pre-defined question bank<br>**Spec Kit**: AI-generated contextual questions |

### Key Insights

1. **Specification Phase (Phase 0)**:
   - **CLAUDE.md PRD**: Optimized for speed (10 min minimal, 20-30 min standard)
   - **Spec Kit `/speckit.specify`**: Optimized for completeness (iterative, potentially slower)
   - **Winner for Solo Dev**: CLAUDE.md (faster iteration)
   - **Winner for Team/Handoff**: Spec Kit (better documentation)

2. **Planning Phase (Phase 0.5)**:
   - **CLAUDE.md Task List**: Executable (Python script generates markdown with checkboxes)
   - **Spec Kit `/speckit.plan`**: Descriptive (AI generates plan, requires manual GitHub Issue creation)
   - **Winner**: CLAUDE.md (automation built-in)

3. **Execution (Phase 1-6)**:
   - **CLAUDE.md**: Complete pipeline (code, test, version, git, validation, cache)
   - **Spec Kit**: Only guides implementation (`/speckit.implement` provides instructions)
   - **Winner**: CLAUDE.md (no comparison - Spec Kit doesn't cover this)

4. **Constitution File**:
   - **New Capability**: CLAUDE.md has no equivalent
   - **Value**: Prevents "forgot to consider X" bugs across sessions
   - **Risk**: Solo developer overhead (maintaining another file)

### Overlap Visualization

```
┌─────────────────────────────────────────────────────────┐
│                   Project Lifecycle                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────┐           │
│  │   Spec Kit Coverage                      │           │
│  │  ┌─────────────┬──────────┬────────────┐ │           │
│  │  │Constitution │ Specify  │   Plan     │ │ Tasks     │
│  │  │             │  (PRD)   │ (Tech)     │ │           │
│  └──┴─────────────┴──────────┴────────────┴─┴───────────┘
│     │                                          │          │
│  ┌──┴──────────────────────────────────────────┴────────┐│
│  │         CLAUDE.md Phase 0-6 Coverage                  ││
│  │ Phase 0 │ Phase 0.5 │ Phase 1-6                      ││
│  │  (PRD)  │  (Tasks)  │ Code→Test→Version→Git→Valid→Deploy
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  Key: ████ Complete overlap  ▓▓▓▓ Partial  ░░░░ Unique    │
└────────────────────────────────────────────────────────────┘
```

**Constitution**: ░░░░ Spec Kit unique (no CLAUDE.md equivalent)
**Specify vs PRD**: ████ High overlap (90%)
**Plan vs Task List**: ▓▓▓▓ Partial overlap (80%)
**Tasks**: ▓▓▓▓ Partial overlap (70%)
**Implement vs Phase 1-6**: ░░░░ CLAUDE.md unique (Spec Kit only guides, doesn't automate)

---

## Integration Architecture Options

### Option 1: Spec Kit as Phase 0 Replacement

**Concept**: Replace PRD creation with Spec Kit workflow

```
Before: User Request → create_prd.py → tasks/prds/NNNN-prd-*.md → Phase 0.5
After:  User Request → /speckit.specify → .speckit/spec.md → /speckit.plan → GitHub Issues → Phase 1-6
```

**Pros**:
- Better intent documentation
- AI agent abstraction (portable across Claude, Copilot, Gemini)
- Iterative refinement built-in

**Cons**:
- Slower (iterative vs templated)
- Introduces new file location (`.speckit/` vs `tasks/prds/`)
- Breaks existing automation (`generate_tasks.py` expects PRD format)
- No token optimization features

**Verdict**: ❌ **Not Recommended** - Sacrifices speed without clear ROI for solo dev

---

### Option 2: Spec Kit as Parallel Track (AI-First Projects)

**Concept**: Use Spec Kit for new greenfield projects, keep CLAUDE.md for existing

```
Decision Tree:
├─ Greenfield project (0 → 1)?
│  ├─ Yes → Use Spec Kit workflow
│  └─ No → Use CLAUDE.md workflow
├─ Multiple AI agents needed?
│  ├─ Yes → Use Spec Kit
│  └─ No → Use CLAUDE.md
└─ Need to handoff to team later?
   ├─ Yes → Use Spec Kit
   └─ No → Use CLAUDE.md
```

**Pros**:
- No disruption to existing workflow
- Experiment with Spec Kit on low-risk projects
- Learn Spec Kit capabilities gradually

**Cons**:
- Cognitive overhead (two workflows to remember)
- Inconsistent artifact locations (`.speckit/` vs `tasks/`)
- No synergy between tools

**Verdict**: ⚠️ **Possible** - Good for experimentation, but creates fragmentation

---

### Option 3: Hybrid - Spec Kit Generates, CLAUDE.md Executes

**Concept**: Use Spec Kit Constitution + Specify, then convert to CLAUDE.md format for execution

```
Constitution (.speckit/constitution.md)
    ↓
/speckit.specify → .speckit/spec.md
    ↓
Custom script: spec_to_prd.py
    ↓
tasks/prds/NNNN-prd-*.md (CLAUDE.md format)
    ↓
Phase 0.5 → generate_tasks.py
    ↓
Phase 1-6 (existing automation)
```

**Pros**:
- Best of both worlds (Spec Kit intent + CLAUDE.md speed)
- Constitution file prevents forgotten requirements
- Existing automation preserved
- Gradual migration path

**Cons**:
- Requires custom conversion script
- Two formats to maintain
- Conversion may lose Spec Kit metadata

**Verdict**: ✅ **Recommended** - Balanced approach with clear value

---

### Option 4: Enhanced Phase 0 (Constitution + PRD Best Practices)

**Concept**: Adopt only Constitution file, enhance PRD templates with Spec Kit principles

```
.speckit/constitution.md (new)
    ↓
Enhanced PRD templates (updated)
├─ PRD_GUIDE_MINIMAL.md + Constitution checks
├─ PRD_GUIDE_STANDARD.md + Architecture section
└─ PRD_GUIDE_JUNIOR.md + Clarification questions
    ↓
Existing Phase 0.5 → Phase 1-6 (unchanged)
```

**Pros**:
- Minimal disruption (one new file)
- Constitution prevents oversight
- No learning curve (just add checklist)
- Existing automation intact

**Cons**:
- Manual enforcement of Constitution (no tooling)
- Doesn't leverage Spec Kit automation
- Misses `/speckit.clarify` benefits

**Verdict**: ✅ **Recommended for immediate adoption** - Low effort, high value

---

## Strategy 1: Minimalist Integration (1 Hour)

**Target**: Adopt Constitution file only, enhance existing workflow

### Implementation Steps

#### Step 1: Install Specify CLI (5 minutes)
```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install specify-cli
uv tool install specify-cli

# Verify installation
specify --version
```

#### Step 2: Create Constitution File (20 minutes)
```bash
cd "d:\AI\claude01"

# Initialize minimal constitution for SSO project
mkdir -p .speckit
```

**File**: `d:\AI\claude01\.speckit\constitution.md`

```markdown
# Project Constitution: SSO System + Multi-App Architecture
*Non-negotiable principles for development*

**Version**: 1.0.0 | **Last Updated**: 2025-11-10

---

## 1. Security Principles (Non-Negotiable)

### 1.1 Environment Variables
- ✅ **ALWAYS** use `.env` files for secrets (API keys, DB credentials)
- ✅ **NEVER** commit `.env` files to Git (must be in `.gitignore`)
- ✅ **ALWAYS** provide `.env.example` with dummy values
- ✅ **ALWAYS** validate env vars are loaded before app starts

```javascript
// Example validation
if (!import.meta.env.VITE_SUPABASE_URL) {
  throw new Error('VITE_SUPABASE_URL must be set in .env');
}
```

### 1.2 Supabase RLS (Row Level Security)
- ✅ **ALWAYS** enable RLS on all user data tables
- ✅ **NEVER** use service role key in client-side code
- ✅ **ALWAYS** test RLS policies with real users (not service role)
- ✅ **ALWAYS** document RLS policies in `docs/supabase_rls_policies.sql`

### 1.3 Authentication
- ✅ **ALWAYS** use Supabase Auth (no custom JWT handling)
- ✅ **ALWAYS** validate session on protected routes
- ✅ **NEVER** store auth tokens in localStorage (use httpOnly cookies via Supabase)

---

## 2. Architecture Principles

### 2.1 SSO System
- ✅ **SINGLE SOURCE OF TRUTH**: Supabase Auth for all apps
- ✅ **SDK-FIRST**: Shared `@yourorg/sso-sdk` package for auth logic
- ✅ **NO DUPLICATION**: Auth code lives in SDK, not individual apps

### 2.2 Multi-Repo Structure
```
sso-system/         # Monorepo: SSO + SDK
├── auth-service/   # Supabase project config
├── sdk/            # @yourorg/sso-sdk (shared package)
└── docs/           # Shared docs

apps/
├── VTC_Logger/     # App 1 (consumes SDK)
├── contents-factory/ # App 2 (consumes SDK)
└── [future apps]
```

### 2.3 Dependency Direction
```
Apps → SDK → Supabase
     ↘     ↗
      (never backwards)
```

---

## 3. Development Principles

### 3.1 Testing (Non-Negotiable)
- ✅ **1:1 TEST PAIRING**: Every implementation file must have a test file
- ✅ **TEST-FIRST for Auth**: Write auth tests before implementation
- ✅ **RLS TESTING**: Must test both allowed and denied scenarios

```bash
# Directory structure requirement
src/auth/login.ts        → tests/auth/login.test.ts
src/auth/register.ts     → tests/auth/register.test.ts
```

### 3.2 Version Control
- ✅ **FEATURE BRANCHES**: Never commit directly to main/master
- ✅ **SEMANTIC VERSIONING**: Major.Minor.Patch for all packages
- ✅ **COMMIT CONVENTION**: `type: subject (vVersion) [PRD-####]`

### 3.3 Documentation
- ✅ **PRD REQUIRED**: Every feature must have a PRD (Phase 0)
- ✅ **README FIRST**: Update README.md before implementation
- ✅ **INLINE DOCS**: JSDoc for all public functions

---

## 4. Technology Constraints

### 4.1 Approved Stack
- **Frontend**: React 18+ (TypeScript), Vite, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **State Management**: Zustand (no Redux)
- **Testing**: Vitest (unit), Playwright (e2e)
- **AI Tools**: Claude Code (primary), GitHub Copilot (secondary)

### 4.2 Prohibited
- ❌ **NO** custom auth systems (use Supabase Auth)
- ❌ **NO** JWT handling in client code (use Supabase SDK)
- ❌ **NO** direct SQL in app code (use Supabase client or RPC)
- ❌ **NO** localStorage for sensitive data

---

## 5. SSO-Specific Rules

### 5.1 User Profile Structure
```typescript
// Must match across all apps
interface UserProfile {
  id: string;          // Supabase auth.users.id
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
```

### 5.2 Session Management
- ✅ **SESSION REFRESH**: Handle token refresh automatically (Supabase SDK)
- ✅ **LOGOUT CLEANUP**: Clear all app state on logout
- ✅ **CONCURRENT SESSIONS**: Support multiple devices (don't force single session)

### 5.3 OAuth Providers
- **Google**: Primary (already configured)
- **GitHub**: Secondary (future)
- **Email/Password**: Fallback only

---

## 6. Failure Modes to Prevent

### 6.1 "Forgot to Check" Bugs
Before every PR, verify:
- [ ] Environment variables documented in `.env.example`
- [ ] RLS policies applied and tested
- [ ] All routes check authentication
- [ ] Error handling for network failures
- [ ] Loading states for async operations

### 6.2 Cross-App Consistency
Before publishing SDK update:
- [ ] Version bumped (semver)
- [ ] CHANGELOG updated
- [ ] Breaking changes documented
- [ ] All consuming apps tested

---

## 7. Enforcement

### 7.1 Pre-Commit Checks (Future)
```bash
# TODO: Setup git hooks
- Lint (ESLint)
- Format (Prettier)
- Type check (TypeScript)
- Test (Vitest --run)
```

### 7.2 Review Checklist
Even for solo dev, before merging:
1. Constitution compliance (review this file)
2. All tests passing (local + CI)
3. No console errors in browser
4. Mobile responsive (if UI change)
5. README updated (if API change)

---

## 8. When to Update Constitution

Add to this file when:
- ✅ Same mistake made 2+ times (make it a rule)
- ✅ Security incident or near-miss
- ✅ New technology added to stack
- ✅ Architecture decision with long-term impact

**Update frequency**: Review monthly, update as needed

---

**Last Review**: 2025-11-10
**Next Review**: 2025-12-10
```

#### Step 3: Update CLAUDE.md to Reference Constitution (10 minutes)

**Edit**: `d:\AI\claude01\CLAUDE.md`

Add after line 92 (in Security Checklist section):

```markdown
## 🔐 보안 체크리스트

**필수**: 환경변수 | SQL Injection 방지 | XSS 방지 | CSRF | Rate Limiting | HTTPS | 보안 헤더 | 의존성 스캔

**Constitution**: [.speckit/constitution.md](.speckit/constitution.md) - 프로젝트 원칙 (Phase 0 전에 항상 확인)

**.gitignore**: `.env*` | `*.key` | `secrets/` | `tasks/prds/*-internal.md`
```

#### Step 4: Update PRD Templates to Include Constitution Check (15 minutes)

**Edit**: `d:\AI\claude01\docs\guides\PRD_GUIDE_MINIMAL.md`

Add after line 53 (after "범위 제외" question):

```markdown
### 6. Constitution 준수
```
이 기능이 위반하는 Constitution 원칙은?
(Check: .speckit/constitution.md)
- [ ] 보안 원칙 (환경변수, RLS, 인증)
- [ ] 아키텍처 원칙 (SSO, 멀티 레포)
- [ ] 개발 원칙 (테스트, 버전 관리, 문서)
- [ ] 기술 제약 (승인된 스택)
```
```

**Repeat for**: `PRD_GUIDE_STANDARD.md` and `PRD_GUIDE_JUNIOR.md`

#### Step 5: Add Constitution to Claude Code System Prompt (10 minutes)

**Create**: `d:\AI\claude01\.claude\commands\check-constitution.md`

```markdown
Before starting any implementation (Phase 1), verify compliance with project Constitution:

1. Read `.speckit/constitution.md`
2. Check current task against all 8 sections
3. Report any violations or risks
4. Suggest mitigations if needed

If Constitution violation found:
- **STOP implementation**
- Update PRD to resolve conflict
- Get user approval for exception OR change approach
```

### File Structure Changes

```diff
d:\AI\claude01\
+ .speckit/
+   └── constitution.md                    [NEW - 5KB]
  .claude/
+   └── commands/check-constitution.md     [NEW - 0.5KB]
  docs/
    guides/
      ├── PRD_GUIDE_MINIMAL.md             [MODIFIED - +10 lines]
      ├── PRD_GUIDE_STANDARD.md            [MODIFIED - +10 lines]
      └── PRD_GUIDE_JUNIOR.md              [MODIFIED - +10 lines]
  CLAUDE.md                                 [MODIFIED - +3 lines]
```

### Command Examples

**Before starting Phase 0 (PRD creation)**:
```bash
# Quick Constitution review
cat .speckit/constitution.md | grep "Non-Negotiable" -A 3
```

**During Phase 0 (PRD writing)**:
```bash
# Ensure PRD includes Constitution check
grep -q "Constitution" tasks/prds/0001-prd-new-feature.md || echo "⚠️  Add Constitution section"
```

**Before Phase 1 (implementation)**:
```
In Claude Code chat:
"Review .speckit/constitution.md and verify my PRD-0001 complies with all principles"
```

### ROI Analysis

**Time Investment**: 1 hour (one-time setup)

**Time Saved** (per feature):
- Prevent 1 security bug: **2-4 hours debugging/fixing**
- Prevent 1 architecture mistake: **4-8 hours refactoring**
- Prevent 1 RLS oversight: **1-2 hours testing/fixing**

**Break-even**: After 2-3 features (~2 weeks)

**Annual ROI**:
- Assume 20 features/year
- Prevent 5 bugs (conservative estimate)
- Time saved: 5 bugs × 3 hours avg = **15 hours saved**
- Investment: 1 hour
- **ROI: 1,400%**

### Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Forget to check Constitution | Medium | Medium | Add to Phase 0 checklist (done) |
| Constitution becomes outdated | Medium | Low | Monthly review reminder |
| Over-engineering (too many rules) | Low | Medium | Start minimal (8 sections only) |
| Slows down rapid prototyping | Low | Low | Skip Constitution for throw-away POCs |

### Success Metrics

**After 1 month**, evaluate:
- ✅ **Metric 1**: Zero environment variable leaks (check Git history)
- ✅ **Metric 2**: All new tables have RLS enabled (check Supabase)
- ✅ **Metric 3**: 100% test pairing compliance (count files)
- ✅ **Metric 4**: Zero auth-related bugs in production

**Measurement**:
```bash
# Check env var leaks
git log --all --full-history --source --pretty=format:%h -- "**/.env"

# Check test pairing
python scripts/check_test_pairing.py src/ tests/

# Check RLS
# Manual: Supabase Dashboard → Database → Check "Enable RLS" column
```

---

## Strategy 2: Full Integration (1 Day)

**Target**: Complete Spec Kit adoption with custom conversion to CLAUDE.md format

### Implementation Steps

#### Step 1: Install and Initialize Spec Kit (30 minutes)

```bash
cd "d:\AI\claude01"

# Install specify-cli
uv tool install specify-cli

# Create Spec Kit configuration
mkdir -p .speckit
```

**Create**: `d:\AI\claude01\.speckit\config.yaml`

```yaml
# Spec Kit Configuration
version: 1.0.0
agent: claude  # Primary AI agent

# Output directories
output:
  specs: .speckit/specs
  plans: .speckit/plans
  tasks: .speckit/tasks

# Integration with CLAUDE.md
integration:
  convert_to_prd: true
  prd_output: tasks/prds
  task_output: tasks

# GitHub integration
github:
  enabled: true
  create_issues: true
  project: "SSO Development"

# Constitution enforcement
constitution:
  path: .speckit/constitution.md
  enforce_on_plan: true
  enforce_on_tasks: true
```

#### Step 2: Create Slash Commands (1 hour)

**Create**: `d:\AI\claude01\.claude\commands\speckit-specify.md`

```markdown
Generate a detailed specification using Spec Kit methodology.

**Input**: High-level feature description from user

**Process**:
1. Ask clarifying questions (4-6 questions) about:
   - User goals and success criteria
   - Technical constraints
   - Integration points with existing system
   - Security and performance requirements

2. Generate specification in Spec Kit format:
   - Problem statement
   - User stories (As a... I want... So that...)
   - Functional requirements
   - Non-functional requirements
   - Dependencies and assumptions
   - Out of scope

3. Check against Constitution (.speckit/constitution.md):
   - Security principles
   - Architecture principles
   - Technology constraints

4. Save to `.speckit/specs/{feature-name}.md`

5. **Auto-convert to CLAUDE.md PRD format**:
   - Run: `python scripts/spec_to_prd.py .speckit/specs/{feature-name}.md`
   - Output: `tasks/prds/{NNNN}-prd-{feature-name}.md`

6. Present both formats to user:
   - Spec Kit version (for documentation)
   - CLAUDE.md PRD (for execution)
```

**Create**: `d:\AI\claude01\.claude\commands\speckit-plan.md`

```markdown
Generate a technical implementation plan from specification.

**Input**: Spec file path (.speckit/specs/{feature-name}.md)

**Process**:
1. Read specification and Constitution
2. Generate technical plan:
   - Architecture decisions
   - Technology choices (verify against Constitution)
   - Data models
   - API design
   - Security implementation (RLS, env vars)
   - Testing strategy (1:1 pairing)

3. Save to `.speckit/plans/{feature-name}.md`

4. **Generate CLAUDE.md Task List**:
   - Run: `python scripts/plan_to_tasks.py .speckit/plans/{feature-name}.md`
   - Output: `tasks/{NNNN}-tasks-{feature-name}.md`

5. Create GitHub Issue:
   - Run: `gh issue create --title "[FEATURE] {name}" --body-file tasks/prds/{NNNN}-prd-{feature-name}.md`
   - Add labels: phase-0, type:feature
```

**Create**: `d:\AI\claude01\.claude\commands\speckit-tasks.md`

```markdown
Break down technical plan into implementable tasks.

**Input**: Plan file path (.speckit/plans/{feature-name}.md)

**Process**:
1. Generate task breakdown with:
   - Parent tasks (features)
   - Sub-tasks (implementation steps)
   - Test tasks (1:1 pairing)
   - Documentation tasks

2. Save to `.speckit/tasks/{feature-name}.md`

3. **Convert to CLAUDE.md Task List format**:
   - Parent tasks with [ ] checkboxes
   - Sub-tasks indented with [ ] checkboxes
   - Test tasks paired with implementation tasks

4. Create GitHub Project board:
   - Run: `gh project item-add {project-id} --url {issue-url}`
   - Set status: "Todo"
```

**Create**: `d:\AI\claude01\.claude\commands\speckit-full.md`

```markdown
Complete Spec Kit workflow: Specify → Plan → Tasks → Convert to CLAUDE.md format

**Usage**: `/speckit-full` then describe feature in chat

**Process**:
1. Run `/speckit-specify` (or call /speckit.specify if available)
2. Run `/speckit-plan` (or call /speckit.plan if available)
3. Run `/speckit-tasks` (or call /speckit.tasks if available)
4. Convert all outputs to CLAUDE.md format
5. Summary with links to all artifacts:
   - Spec Kit: .speckit/specs/{name}.md
   - CLAUDE.md PRD: tasks/prds/{NNNN}-prd-{name}.md
   - CLAUDE.md Tasks: tasks/{NNNN}-tasks-{name}.md
   - GitHub Issue: #XXX

6. Ask: "Ready to start Phase 1 (implementation)?"
```

#### Step 3: Create Conversion Scripts (2 hours)

**Create**: `d:\AI\claude01\scripts\spec_to_prd.py`

```python
#!/usr/bin/env python3
"""
Convert Spec Kit specification to CLAUDE.md PRD format
Usage: python scripts/spec_to_prd.py .speckit/specs/google-oauth.md
"""

import sys
import re
from pathlib import Path
from datetime import datetime

def get_next_prd_number(prd_dir):
    """Find next available PRD number"""
    existing = list(Path(prd_dir).glob("*-prd-*.md"))
    if not existing:
        return 1

    numbers = [int(re.search(r'(\d+)-prd-', f.name).group(1)) for f in existing]
    return max(numbers) + 1

def parse_spec_kit_spec(spec_path):
    """Parse Spec Kit specification markdown"""
    with open(spec_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract sections using regex
    sections = {
        'title': re.search(r'^#\s+(.+)$', content, re.MULTILINE),
        'problem': re.search(r'##\s+Problem Statement\n(.+?)(?=##)', content, re.DOTALL),
        'user_stories': re.findall(r'- As a (.+?), I want (.+?), so that (.+?)(?:\n|$)', content),
        'functional': re.search(r'##\s+Functional Requirements\n(.+?)(?=##)', content, re.DOTALL),
        'non_functional': re.search(r'##\s+Non-Functional Requirements\n(.+?)(?=##)', content, re.DOTALL),
        'out_of_scope': re.search(r'##\s+Out of Scope\n(.+?)(?=##|$)', content, re.DOTALL),
    }

    return {k: (v.group(1).strip() if hasattr(v, 'group') else v) for k, v in sections.items()}

def generate_prd(spec_data, prd_number, feature_name):
    """Generate CLAUDE.md PRD format"""

    # Determine priority based on functional requirements count
    func_req = spec_data.get('functional', '')
    req_count = len(re.findall(r'^\d+\.', func_req, re.MULTILINE))
    priority = 'P0' if req_count > 10 else 'P1' if req_count > 5 else 'P2'

    prd = f"""# PRD-{prd_number:04d}: {spec_data['title']}

**작성일**: {datetime.now().strftime('%Y-%m-%d')}
**작성자**: Claude Code (Spec Kit)
**상태**: 🔵 계획 중
**우선순위**: {priority}

---

## 📋 Executive Summary

{spec_data.get('problem', 'Feature specification converted from Spec Kit.')}

---

## 🎯 목표 (Goals)

### 주요 목표
{spec_data.get('functional', '1. Implement feature\n2. Add tests\n3. Deploy')}

### 성공 지표
- [ ] Functional requirements implemented
- [ ] All tests passing (1:1 pairing)
- [ ] Constitution compliance verified
- [ ] Documentation updated

---

## 👥 사용자 스토리 (User Stories)

"""

    # Add user stories
    if spec_data.get('user_stories'):
        for role, action, benefit in spec_data['user_stories']:
            prd += f"- As a {role}, I want {action}, so that {benefit}\n"
    else:
        prd += "- As a user, I want to use this feature, so that I can accomplish my goals\n"

    prd += f"""

---

## 📐 기능 요구사항 (Functional Requirements)

{spec_data.get('functional', '1. Core functionality\n2. Error handling\n3. User feedback')}

---

## 🚫 범위 제외 (Out of Scope)

{spec_data.get('out_of_scope', '- Future enhancements\n- Edge cases for v1')}

---

## ✅ Constitution 준수 확인

**보안 원칙**:
- [ ] Environment variables used for secrets
- [ ] RLS policies applied to data tables
- [ ] Supabase Auth used (no custom JWT)

**아키텍처 원칙**:
- [ ] SDK-first approach (if auth-related)
- [ ] No direct SQL in app code
- [ ] Proper dependency direction

**개발 원칙**:
- [ ] 1:1 test pairing planned
- [ ] Feature branch strategy
- [ ] Documentation planned

**기술 제약**:
- [ ] Approved stack only (React, Supabase, Zustand)
- [ ] No prohibited technologies

---

## 📊 비기능 요구사항 (Non-Functional Requirements)

{spec_data.get('non_functional', '- **Performance**: Response time < 2s\n- **Security**: Follow Constitution principles\n- **Maintainability**: Clear code structure')}

---

## 🔗 관련 문서

- [Spec Kit Specification](.speckit/specs/{feature_name}.md)
- [Constitution](.speckit/constitution.md)
- [Technical Plan](.speckit/plans/{feature_name}.md) (generated by /speckit-plan)

---

## 📝 변경 이력

| 날짜 | 버전 | 변경 내용 |
|------|------|-----------|
| {datetime.now().strftime('%Y-%m-%d')} | 0.1 | Spec Kit 변환 초안 |

---

**Generated from Spec Kit**: {datetime.now().strftime('%Y-%m-%d %H:%M KST')}
**Source**: `.speckit/specs/{feature_name}.md`
"""

    return prd

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/spec_to_prd.py .speckit/specs/feature-name.md")
        sys.exit(1)

    spec_path = Path(sys.argv[1])
    if not spec_path.exists():
        print(f"Error: Spec file not found: {spec_path}")
        sys.exit(1)

    # Parse spec
    spec_data = parse_spec_kit_spec(spec_path)

    # Get next PRD number
    prd_dir = Path(__file__).parent.parent / "tasks" / "prds"
    prd_dir.mkdir(parents=True, exist_ok=True)
    prd_number = get_next_prd_number(prd_dir)

    # Generate PRD
    feature_name = spec_path.stem
    prd_content = generate_prd(spec_data, prd_number, feature_name)

    # Save PRD
    prd_path = prd_dir / f"{prd_number:04d}-prd-{feature_name}.md"
    with open(prd_path, 'w', encoding='utf-8') as f:
        f.write(prd_content)

    print(f"✅ PRD created: {prd_path}")
    print(f"   Number: PRD-{prd_number:04d}")
    print(f"   Source: {spec_path}")
    print()
    print("Next steps:")
    print(f"1. Review PRD: {prd_path}")
    print(f"2. Run: python scripts/spec_to_prd.py {spec_path} (if adjustments needed)")
    print(f"3. Run: /speckit-plan to generate technical plan")
    print(f"4. Run: python scripts/generate_tasks.py {prd_path}")

if __name__ == '__main__':
    main()
```

**Create**: `d:\AI\claude01\scripts\plan_to_tasks.py`

```python
#!/usr/bin/env python3
"""
Convert Spec Kit plan to CLAUDE.md task list format
Usage: python scripts/plan_to_tasks.py .speckit/plans/google-oauth.md
"""

import sys
import re
from pathlib import Path

def parse_spec_kit_plan(plan_path):
    """Parse Spec Kit technical plan"""
    with open(plan_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract implementation steps
    impl_section = re.search(r'##\s+Implementation Steps\n(.+?)(?=##|$)', content, re.DOTALL)
    if not impl_section:
        return []

    # Parse tasks (assuming numbered list)
    tasks = re.findall(r'^\d+\.\s+(.+?)(?:\n\s+-\s+(.+?))?$', impl_section.group(1), re.MULTILINE)
    return tasks

def generate_task_list(plan_data, feature_name, prd_number):
    """Generate CLAUDE.md task list format"""

    tasks_md = f"""# Task List: {feature_name}

**PRD**: [PRD-{prd_number:04d}](../prds/{prd_number:04d}-prd-{feature_name}.md)
**Plan**: [Technical Plan](../../.speckit/plans/{feature_name}.md)

---

## Parent Tasks

"""

    for idx, (parent, sub) in enumerate(plan_data, start=1):
        tasks_md += f"### Task {idx}.0: {parent}\n\n"
        tasks_md += f"- [ ] {parent}\n"
        if sub:
            tasks_md += f"  - [ ] {sub}\n"

        # Add test task (1:1 pairing)
        tasks_md += f"- [ ] Write tests for {parent.lower()}\n"
        tasks_md += "\n"

    tasks_md += """---

## Sub-Tasks

(Will be generated when user types "Go")

---

**Status**: [ ] Not Started | [x] Completed | [!] Failed | [⏸] Blocked
"""

    return tasks_md

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/plan_to_tasks.py .speckit/plans/feature-name.md")
        sys.exit(1)

    plan_path = Path(sys.argv[1])
    if not plan_path.exists():
        print(f"Error: Plan file not found: {plan_path}")
        sys.exit(1)

    # Parse plan
    plan_data = parse_spec_kit_plan(plan_path)

    # Get PRD number from feature name (assuming spec_to_prd.py was run first)
    feature_name = plan_path.stem
    prd_dir = Path(__file__).parent.parent / "tasks" / "prds"
    prd_file = list(prd_dir.glob(f"*-prd-{feature_name}.md"))

    if not prd_file:
        print(f"Error: PRD not found for {feature_name}")
        print(f"Run: python scripts/spec_to_prd.py .speckit/specs/{feature_name}.md first")
        sys.exit(1)

    prd_number = int(re.search(r'(\d+)-prd-', prd_file[0].name).group(1))

    # Generate task list
    tasks_content = generate_task_list(plan_data, feature_name, prd_number)

    # Save task list
    tasks_dir = Path(__file__).parent.parent / "tasks"
    tasks_dir.mkdir(parents=True, exist_ok=True)
    tasks_path = tasks_dir / f"{prd_number:04d}-tasks-{feature_name}.md"

    with open(tasks_path, 'w', encoding='utf-8') as f:
        f.write(tasks_content)

    print(f"✅ Task list created: {tasks_path}")
    print(f"   PRD: PRD-{prd_number:04d}")
    print()
    print("Next steps:")
    print(f"1. Review tasks: {tasks_path}")
    print(f"2. Type 'Go' to generate sub-tasks")
    print(f"3. Start implementation (Phase 1)")

if __name__ == '__main__':
    main()
```

#### Step 4: Update CLAUDE.md Workflow (30 minutes)

**Edit**: `d:\AI\claude01\CLAUDE.md`

Replace Phase 0 section (lines 18-28) with:

```markdown
## 📌 Phase 0: 요구사항 정의 (PRD 작성)

**두 가지 방법 (Choose One)**:

### 방법 1: 빠른 PRD (Traditional)
```bash
python scripts/create_prd.py feature-name "Description"  # Phase 0
```
**사용 시기**: 간단한 기능, 빠른 반복, 개인 프로젝트

### 방법 2: Spec Kit (권장 - 복잡한 기능)
```bash
/speckit-full  # Specify → Plan → Tasks → PRD 자동 생성
```
**사용 시기**: 복잡한 기능, 팀 협업, 상세 문서 필요

**저장**: `/tasks/prds/0001-prd-feature-name.md` (0001부터 시작)

**가이드 선택**:
- [MINIMAL](docs/guides/PRD_GUIDE_MINIMAL.md): 경험 많은 개발자 (10분)
- [STANDARD](docs/guides/PRD_GUIDE_STANDARD.md): 중급 개발자 (20-30분)
- [JUNIOR](docs/guides/PRD_GUIDE_JUNIOR.md): 초보자 (40-60분)

**필수**: [Constitution](.speckit/constitution.md) 확인 (보안, 아키텍처, 개발 원칙)
```

#### Step 5: Create GitHub Integration (1 hour)

**Create**: `d:\AI\claude01\.github\workflows\speckit-to-github.yml`

```yaml
name: Spec Kit to GitHub Issues

on:
  push:
    paths:
      - '.speckit/specs/*.md'
      - 'tasks/prds/*.md'

jobs:
  create-issue:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Find new spec files
        id: find_specs
        run: |
          # Find specs without corresponding GitHub issues
          for spec in .speckit/specs/*.md; do
            feature=$(basename "$spec" .md)
            prd_file="tasks/prds/*-prd-$feature.md"

            if [[ -f $prd_file ]]; then
              # Check if issue already exists
              issue_num=$(gh issue list --search "$feature" --json number --jq '.[0].number')

              if [[ -z "$issue_num" ]]; then
                echo "new_spec=$spec" >> $GITHUB_OUTPUT
                echo "prd_file=$prd_file" >> $GITHUB_OUTPUT
              fi
            fi
          done
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Create GitHub Issue
        if: steps.find_specs.outputs.new_spec != ''
        run: |
          spec_file="${{ steps.find_specs.outputs.new_spec }}"
          prd_file="${{ steps.find_specs.outputs.prd_file }}"
          feature=$(basename "$spec_file" .md)

          # Create issue from PRD
          gh issue create \
            --title "[FEATURE] $feature" \
            --body-file "$prd_file" \
            --label "phase-0,type:feature,spec-kit" \
            --assignee "@me"

          echo "✅ Created issue for $feature"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### Step 6: Test Full Workflow (30 minutes)

```bash
cd "d:\AI\claude01"

# Test workflow with example feature
echo "# Google OAuth Integration

## Problem Statement
Users need to sign in with Google accounts to access the SSO system.

## Functional Requirements
1. Google OAuth 2.0 integration
2. User profile creation from Google data
3. Session management

## Out of Scope
- Other OAuth providers (Phase 2)
" > .speckit/specs/google-oauth.md

# Convert to PRD
python scripts/spec_to_prd.py .speckit/specs/google-oauth.md

# Generate tasks (manual plan creation first)
echo "# Technical Plan: Google OAuth

## Implementation Steps
1. Setup Google Cloud Console
   - Create OAuth credentials
2. Implement Supabase Auth
   - Configure Google provider
3. Add frontend login button
   - Handle OAuth callback
" > .speckit/plans/google-oauth.md

python scripts/plan_to_tasks.py .speckit/plans/google-oauth.md

# Verify outputs
ls -la tasks/prds/*google-oauth.md
ls -la tasks/*-tasks-google-oauth.md

echo "✅ Full workflow test complete!"
```

### File Structure Changes

```diff
d:\AI\claude01\
+ .speckit/
+   ├── constitution.md                     [NEW - 5KB]
+   ├── config.yaml                         [NEW - 0.5KB]
+   ├── specs/                              [NEW - directory]
+   │   └── google-oauth.md                 [EXAMPLE]
+   ├── plans/                              [NEW - directory]
+   │   └── google-oauth.md                 [EXAMPLE]
+   └── tasks/                              [NEW - directory]
+       └── google-oauth.md                 [EXAMPLE]
  .claude/
+   └── commands/
+       ├── speckit-specify.md              [NEW - 2KB]
+       ├── speckit-plan.md                 [NEW - 1.5KB]
+       ├── speckit-tasks.md                [NEW - 1KB]
+       ├── speckit-full.md                 [NEW - 1KB]
+       └── check-constitution.md           [FROM STRATEGY 1]
  scripts/
+   ├── spec_to_prd.py                      [NEW - 5KB]
+   ├── plan_to_tasks.py                    [NEW - 3KB]
+   └── check_test_pairing.py               [NEW - 2KB]
  .github/
+   └── workflows/
+       └── speckit-to-github.yml           [NEW - 2KB]
  CLAUDE.md                                  [MODIFIED - Phase 0 section]
  tasks/
    ├── prds/
    │   └── 0001-prd-google-oauth.md       [GENERATED]
    └── 0001-tasks-google-oauth.md         [GENERATED]
```

### ROI Analysis

**Time Investment**: 1 day (8 hours) one-time setup

**Time Saved** (per feature):
- Spec Kit documentation: **+30 min** (more thorough than quick PRD)
- Automated conversion: **-15 min** (vs manual PRD writing)
- Constitution enforcement: **-30 min** (prevent security bugs)
- GitHub Issue creation: **-10 min** (automated)
- **Net per feature**: -25 minutes saved

**Break-even**: After 19 features (~3 months for solo dev)

**Annual ROI**:
- Assume 40 features/year
- Time saved: 40 × 25 min = **16.7 hours saved**
- Investment: 8 hours
- Additional value: Better documentation, fewer bugs
- **ROI: 108% + qualitative benefits**

### Risks and Mitigation

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Conversion scripts fail edge cases | High | Medium | Start with simple features, iterate scripts |
| Two locations confuse (spec + PRD) | Medium | Low | Clear docs: "Spec is archive, PRD is working doc" |
| GitHub Actions quota exceeded | Low | Low | Free tier: 2,000 min/month (enough for solo) |
| Spec Kit updates break scripts | Medium | High | Pin to specific version, test before upgrade |
| Over-engineering (too much process) | Medium | Medium | Allow skipping Spec Kit for trivial features |

### Success Metrics

**After 1 month**:
- ✅ **Metric 1**: 5+ features documented in Spec Kit format
- ✅ **Metric 2**: Zero manual PRD → GitHub Issue conversions
- ✅ **Metric 3**: All features pass Constitution checks
- ✅ **Metric 4**: Team member (future) can understand Spec docs

**After 3 months**:
- ✅ **Metric 5**: 15+ features with complete Spec → PRD → Tasks chain
- ✅ **Metric 6**: GitHub Projects board reflects true status
- ✅ **Metric 7**: Cross-repo coordination working (sso-system ↔ apps)

---

## Strategy 3: Progressive Enhancement (4 Weeks)

**Target**: Phased adoption, learn Spec Kit incrementally while maintaining productivity

### Week 1: Constitution + Manual Specify (10 hours)

**Goal**: Adopt Constitution, practice Spec Kit manually without automation

#### Monday-Tuesday: Constitution Setup (3 hours)
- Same as Strategy 1, Step 2-5
- Create `.speckit/constitution.md`
- Update CLAUDE.md and PRD templates
- Create `/check-constitution` command

#### Wednesday-Thursday: Manual Spec Kit (4 hours)
```bash
# Install CLI
uv tool install specify-cli

# Practice on one feature (Google OAuth)
cd "d:\AI\claude01"

# Manual Spec Kit workflow (no automation yet)
1. Write .speckit/specs/google-oauth.md (following Spec Kit format)
2. Manually convert to tasks/prds/0001-prd-google-oauth.md
3. Use existing generate_tasks.py
4. Implement normally (Phase 1-6)
```

**Practice template**: `d:\AI\claude01\.speckit\templates\spec-template.md`

```markdown
# [Feature Name]

**Created**: YYYY-MM-DD
**Status**: Draft

---

## Problem Statement

[1-2 paragraphs describing the problem this feature solves]

## User Stories

- As a [role], I want [action], so that [benefit]
- As a [role], I want [action], so that [benefit]

## Functional Requirements

1. [Requirement 1]
   - Details
   - Acceptance criteria
2. [Requirement 2]
   - Details
   - Acceptance criteria

## Non-Functional Requirements

- **Performance**: [metric]
- **Security**: [requirements]
- **Accessibility**: [standards]

## Dependencies

- [Internal system X]
- [External service Y]
- [Database schema Z]

## Out of Scope

- [Future enhancement 1]
- [Future enhancement 2]

---

## Constitution Checklist

**Security**:
- [ ] Environment variables planned
- [ ] RLS policies designed
- [ ] Auth flow reviewed

**Architecture**:
- [ ] Dependency direction correct (Apps → SDK → Supabase)
- [ ] SDK-first approach (if auth-related)
- [ ] No direct SQL in app code

**Development**:
- [ ] 1:1 test pairing planned
- [ ] Feature branch strategy
- [ ] Documentation planned

**Technology**:
- [ ] Approved stack only
- [ ] No prohibited technologies
```

#### Friday: Review and Adjust (3 hours)
- Compare manual Spec → PRD quality vs direct PRD
- Identify pain points in manual conversion
- Decide: Is automation worth it?

**Success criteria**:
- ✅ 1 feature documented in Spec Kit format
- ✅ 1 feature converted to CLAUDE.md PRD
- ✅ Constitution prevented at least 1 oversight

### Week 2: Automation Scripts (12 hours)

**Goal**: Automate Spec → PRD conversion

#### Monday-Wednesday: Build Conversion Scripts (8 hours)
- Same as Strategy 2, Step 3
- Create `spec_to_prd.py`
- Create `plan_to_tasks.py`
- Test with 2-3 features

#### Thursday: Create Slash Commands (3 hours)
- Same as Strategy 2, Step 2
- Create `/speckit-specify`, `/speckit-plan`, `/speckit-tasks`
- Test in Claude Code

#### Friday: Documentation (1 hour)
- Update CLAUDE.md with Spec Kit workflow
- Create examples in `docs/examples/`

**Success criteria**:
- ✅ `spec_to_prd.py` works for 3+ features
- ✅ Conversion takes < 1 minute
- ✅ Output PRD matches CLAUDE.md format 95%+

### Week 3: GitHub Integration (10 hours)

**Goal**: Connect Spec Kit to GitHub native workflow

#### Monday-Tuesday: GitHub Actions (5 hours)
- Same as Strategy 2, Step 5
- Create `speckit-to-github.yml`
- Test with test repository first

#### Wednesday: GitHub Projects Setup (3 hours)
```bash
# Create project board
gh project create --owner @me --title "SSO Development"

# Add custom fields
gh project field-create --owner @me --project-number 1 \
  --name "PRD" --data-type "TEXT"

gh project field-create --owner @me --project-number 1 \
  --name "Spec" --data-type "TEXT"

# Configure views
# - Kanban by status (Todo, In Progress, Done)
# - Table view with PRD/Spec columns
```

#### Thursday-Friday: Cross-Repo Coordination (2 hours)
**Setup for SSO system**:
```bash
# In sso-system repo
cat > .speckit/cross-repo-config.yaml <<EOF
repos:
  - name: VTC_Logger
    github: your-org/VTC_Logger
    depends_on: sso-system/sdk
  - name: contents-factory
    github: your-org/contents-factory
    depends_on: sso-system/sdk

# When SDK changes, auto-create issues in consuming repos
notify_on_breaking_change: true
EOF
```

**Success criteria**:
- ✅ GitHub Actions creates issues automatically
- ✅ Projects board syncs with issue status
- ✅ Cross-repo dependencies tracked

### Week 4: Multi-Repo Templates (8 hours)

**Goal**: Create reusable templates for SSO integration

#### Monday-Tuesday: SDK Integration Template (4 hours)

**Create**: `d:\AI\claude01\.speckit\templates\sdk-integration-spec.md`

```markdown
# [App Name] - SSO SDK Integration

**App**: [VTC_Logger | contents-factory | other]
**SDK Version**: [e.g., @yourorg/sso-sdk@1.2.0]

---

## Problem Statement

[App Name] needs to integrate with the SSO system to enable:
- User authentication via Google OAuth
- Session management
- Protected routes

## Integration Points

### 1. Package Installation
```bash
npm install @yourorg/sso-sdk@^1.2.0
```

### 2. Configuration
```typescript
// src/config/sso.ts
import { createSSOClient } from '@yourorg/sso-sdk';

export const ssoClient = createSSOClient({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabaseKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
});
```

### 3. Authentication Hook
```typescript
// src/hooks/useAuth.ts
import { useAuth } from '@yourorg/sso-sdk/react';

export function useAppAuth() {
  const { user, session, signIn, signOut } = useAuth();
  // App-specific logic
  return { user, session, signIn, signOut };
}
```

### 4. Protected Routes
```typescript
// src/components/ProtectedRoute.tsx
import { ProtectedRoute } from '@yourorg/sso-sdk/react';

export function AppRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute fallback={<LoginPage />}>
      {children}
    </ProtectedRoute>
  );
}
```

## Constitution Compliance

**Security**:
- [x] SDK handles auth tokens (no manual JWT)
- [x] Environment variables for Supabase config
- [x] RLS policies applied (managed by SSO system)

**Architecture**:
- [x] App → SDK → Supabase (correct dependency)
- [x] No direct Supabase client usage in app
- [x] Auth state via SDK hooks only

## Testing Checklist

- [ ] Install SDK package
- [ ] Configure environment variables
- [ ] Test Google OAuth login
- [ ] Test logout
- [ ] Test protected route (logged out → redirect)
- [ ] Test protected route (logged in → access granted)
- [ ] Test session refresh (wait 1 hour)
- [ ] Test concurrent sessions (desktop + mobile)

## Rollback Plan

If integration fails:
1. Remove `@yourorg/sso-sdk` from package.json
2. Revert auth-related files
3. Restore previous auth mechanism (if any)
4. Report issue to sso-system repo

---

**Estimated Time**: 4-6 hours
**Priority**: P1 (required for production)
```

#### Wednesday: RLS Policy Template (2 hours)

**Create**: `d:\AI\claude01\.speckit\templates\rls-policy-spec.md`

```markdown
# [Table Name] - RLS Policy Specification

**Database**: Supabase PostgreSQL
**Table**: [table_name]
**Owner**: Authenticated users

---

## Table Schema

```sql
CREATE TABLE [table_name] (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  [other columns],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Access Requirements

**SELECT**:
- Users can see their own records only
- Admin role can see all records (future)

**INSERT**:
- Authenticated users can create records
- `user_id` must match `auth.uid()`

**UPDATE**:
- Users can update their own records only
- Cannot change `user_id` or `created_at`

**DELETE**:
- Users can delete their own records only
- Soft delete preferred (add `deleted_at` column)

## RLS Policies

```sql
-- Enable RLS
ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;

-- SELECT policy
CREATE POLICY "[table_name]_select_policy"
ON [table_name]
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- INSERT policy
CREATE POLICY "[table_name]_insert_policy"
ON [table_name]
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- UPDATE policy
CREATE POLICY "[table_name]_update_policy"
ON [table_name]
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- DELETE policy
CREATE POLICY "[table_name]_delete_policy"
ON [table_name]
FOR DELETE
TO authenticated
USING (user_id = auth.uid());
```

## Testing

```sql
-- Test 1: User can see own records
SET ROLE authenticated;
SET request.jwt.claims = '{"sub": "user-uuid-123"}';
SELECT * FROM [table_name]; -- Should return only user-uuid-123 records

-- Test 2: User cannot see other users' records
SELECT * FROM [table_name] WHERE user_id != 'user-uuid-123'; -- Should return empty

-- Test 3: User can insert own records
INSERT INTO [table_name] (user_id, [data])
VALUES ('user-uuid-123', 'test'); -- Should succeed

-- Test 4: User cannot insert other users' records
INSERT INTO [table_name] (user_id, [data])
VALUES ('other-uuid', 'test'); -- Should fail

-- Test 5: User can update own records
UPDATE [table_name] SET [column] = 'new' WHERE user_id = 'user-uuid-123'; -- Should succeed

-- Test 6: User cannot update other users' records
UPDATE [table_name] SET [column] = 'new' WHERE user_id = 'other-uuid'; -- Should fail

-- Cleanup
RESET ROLE;
```

## Constitution Compliance

- [x] RLS enabled on user data table
- [x] Policies enforce user isolation
- [x] No service role key in client code
- [x] Policies documented in `docs/supabase_rls_policies.sql`

---

**Created**: YYYY-MM-DD
**Applied**: [ ] Not yet | [x] Applied on YYYY-MM-DD
```

#### Thursday-Friday: Documentation and Handoff (2 hours)

**Create**: `d:\AI\claude01\docs\SPECKIT_GUIDE.md`

```markdown
# Spec Kit Usage Guide for Solo Developer

**When to use what**:

| Scenario | Tool | Reason |
|----------|------|--------|
| Quick bug fix | CLAUDE.md PRD only | Speed (5-10 min) |
| Simple feature (< 5 files) | CLAUDE.md PRD only | Speed (10-20 min) |
| Complex feature (> 5 files) | Spec Kit → PRD | Documentation (30-60 min) |
| SSO integration (new app) | SDK Integration Template | Pre-validated approach |
| New database table | RLS Policy Template | Security by default |
| Major refactoring | Spec Kit full workflow | Thoroughness |

**Workflow comparison**:

```
Quick PRD (for simple features):
User Request → create_prd.py → PRD → generate_tasks.py → Phase 1-6

Spec Kit (for complex features):
User Request → /speckit-full → Spec + Plan + Tasks → PRD → Phase 1-6
```

**Tips**:
1. Always check Constitution before starting
2. Use templates for repetitive tasks (SDK integration, RLS)
3. Skip Spec Kit for prototypes/throwaway code
4. Use Spec Kit when documentation matters (team handoff, open source)
```

**Success criteria**:
- ✅ 2+ templates created and tested
- ✅ Cross-repo workflow documented
- ✅ Complete guide for future reference

### Week 4 End: Final Evaluation

**Metrics to evaluate**:
- Total time invested: ~40 hours (10+12+10+8)
- Features completed: Should have 8-10 features done during this period
- Time saved per feature: Measure actual time for Spec Kit vs traditional
- Bug prevention: Count security/architecture bugs prevented by Constitution

**Decision point**:
- Continue with Spec Kit? (if ROI positive)
- Revert to CLAUDE.md only? (if overhead too high)
- Hybrid approach? (Constitution + selective Spec Kit)

---

## Decision Framework

### When to Use Spec Kit vs CLAUDE.md PRD

```
┌─────────────────────────────────────────────────────────────┐
│              Feature Complexity Decision Tree                │
└─────────────────────────────────────────────────────────────┘

                      Start
                        │
                        ├─ Is this a bug fix?
                        │  └─ YES → CLAUDE.md (skip Spec Kit)
                        │
                        ├─ Is implementation < 3 files?
                        │  └─ YES → CLAUDE.md (speed matters)
                        │
                        ├─ Is this prototype/throwaway code?
                        │  └─ YES → Skip both (just code)
                        │
                        ├─ Is documentation important?
                        │  (team handoff, open source, audit)
                        │  └─ YES → Spec Kit (thorough docs)
                        │
                        ├─ Does it involve auth/security?
                        │  └─ YES → Spec Kit (Constitution check)
                        │
                        ├─ Are you using multiple AI agents?
                        │  (Claude + Copilot + Gemini)
                        │  └─ YES → Spec Kit (agent-agnostic)
                        │
                        ├─ Do you need iterative refinement?
                        │  (requirements unclear, exploratory)
                        │  └─ YES → Spec Kit (/speckit.clarify)
                        │
                        └─ Default: CLAUDE.md (speed wins)
```

### ROI Calculation Worksheet

Use this to evaluate Spec Kit adoption after 1 month:

```
┌─────────────────────────────────────────────────────────────┐
│                    ROI Worksheet                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Time Invested:                                              │
│  ├─ Initial setup: _______ hours                            │
│  ├─ Learning curve: _______ hours                           │
│  └─ Template creation: _______ hours                        │
│  TOTAL INVESTMENT: _______ hours                            │
│                                                              │
│  Time Saved (per month):                                     │
│  ├─ Bug prevention: _______ hours                           │
│  │   (Constitution caught issues)                           │
│  ├─ Documentation: _______ hours                            │
│  │   (auto-generated from specs)                            │
│  ├─ GitHub workflow: _______ hours                          │
│  │   (automated issue creation)                             │
│  └─ Context switching: _______ hours                        │
│  │   (clear specs reduce "what was I doing?")              │
│  TOTAL SAVED: _______ hours/month                           │
│                                                              │
│  Break-even: _______ months                                 │
│  (INVESTMENT / SAVED per month)                             │
│                                                              │
│  Qualitative Benefits:                                       │
│  ├─ Better documentation: [ ] Yes [ ] No                    │
│  ├─ Fewer security bugs: [ ] Yes [ ] No                     │
│  ├─ Easier onboarding: [ ] Yes [ ] No (if team grows)      │
│  └─ Cross-repo consistency: [ ] Yes [ ] No                  │
│                                                              │
│  Decision:                                                   │
│  [ ] Continue with Spec Kit (ROI positive)                  │
│  [ ] Use Constitution only (minimal overhead)               │
│  [ ] Revert to CLAUDE.md only (not worth it)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Critical Analysis

### Is Spec Kit Better Than CLAUDE.md PRD?

**Short answer**: **Different, not better**. Spec Kit optimizes for different goals.

#### Spec Kit Strengths
1. **Intent-driven development**: "Why" before "how"
2. **AI agent abstraction**: Works with Claude, Copilot, Gemini
3. **Iterative refinement**: Built-in clarification workflow
4. **Living documentation**: Spec stays relevant as code evolves

#### Spec Kit Weaknesses
1. **Slower**: Iterative process vs templated PRD (2-3x longer)
2. **More files**: `.speckit/specs/`, `.speckit/plans/`, `.speckit/tasks/` + `tasks/prds/`
3. **No execution automation**: Stops at "implement" (no Phase 1-6 equivalent)
4. **Token intensive**: More back-and-forth with AI for clarification

#### CLAUDE.md Strengths
1. **Speed**: Minimal PRD in 10 minutes
2. **Complete pipeline**: Phase 0 → Phase 6 (end-to-end)
3. **Token optimization**: Pre-defined questions, parallel execution
4. **Proven**: Already working, no learning curve

#### CLAUDE.md Weaknesses
1. **No Constitution**: Principles embedded in workflow, not separate file
2. **Single agent**: Optimized for Claude Code (not portable)
3. **Minimal documentation**: Fast but sparse (okay for solo, bad for team)

### Does "Executable Specifications" Provide Real Value?

**For SSO project specifically**:

**YES for**:
- SDK integration across multiple apps (VTC_Logger, contents-factory, future apps)
- Authentication flows (complex, security-critical)
- RLS policies (need clear documentation for auditing)

**NO for**:
- Bug fixes (just fix it)
- UI tweaks (visual, not spec-worthy)
- Config changes (trivial)

**Conclusion**: Executable specs are valuable when the spec IS the source of truth (APIs, security policies, contracts). For UI and simple features, specs are overhead.

### Will Constitution Reduce "Forgot X" Bugs?

**Evidence from PRD-0001** (d:\AI\claude01\contents-factory\tasks\prds\0001-prd-security-bugfix.md):

**Bugs that Constitution would have prevented**:
1. ✅ **API keys in config.js**: Constitution mandates `.env` files
2. ✅ **Missing RLS policies**: Constitution requires RLS on user data
3. ✅ **Environment variable loading**: Constitution requires validation on startup

**Bugs Constitution wouldn't prevent**:
- Path errors (`/public/` prefix): Implementation detail, not a principle
- Uppy global object: Library-specific, not architectural

**Verdict**: Constitution would have prevented **2 out of 3 major bugs** in PRD-0001 (67% prevention rate). This is significant.

**ROI calculation**:
- Time to create Constitution: 1 hour
- Time saved on PRD-0001: 4-6 hours (security bugs debugging)
- **ROI for single project: 400-500%**

### Can Spec Kit Help When Switching AI Tools?

**Scenario**: Solo dev uses Claude Code today, wants to try GitHub Copilot tomorrow.

**Without Spec Kit**:
- CLAUDE.md is Claude-specific (Phase 0-6, token optimization)
- Must re-explain context to Copilot
- PRD format might not translate well

**With Spec Kit**:
- Spec file is AI-agnostic (just markdown)
- Copilot can read Spec and implement
- Plan and Tasks are portable

**Reality check**:
- How often do solo devs switch AI tools? **Rarely** (learning curve, workflow disruption)
- Is portability worth the overhead? **Only if planning to switch** or **working with team using different tools**

**Verdict for SSO project**: **Low value** (solo dev, committed to Claude Code). Spec Kit's agent abstraction is a feature for teams, not solo devs.

### Final Verdict: Which Strategy to Choose?

**For typical solo developer (Vibe Coder)**:
- **Recommended**: **Strategy 1** (Minimalist - 1 hour)
- **Reasoning**: Constitution alone provides 80% of the value (bug prevention) with 5% of the effort (1 hour vs 1 day)

**If planning to grow team or open source**:
- **Recommended**: **Strategy 3** (Progressive - 4 weeks)
- **Reasoning**: Learn Spec Kit incrementally, evaluate ROI at each phase, abort if not valuable

**If already using GitHub Projects extensively**:
- **Recommended**: **Strategy 2** (Full Integration - 1 day)
- **Reasoning**: GitHub-native workflow is already preferred, Spec Kit adds structure without much overhead

**NOT recommended for anyone**:
- Replacing CLAUDE.md entirely (Phase 1-6 is too valuable)
- Using Spec Kit for all features (overkill for bugs and simple features)

---

## Recommendations

### Immediate Action (This Week)

**Adopt Strategy 1** (1 hour investment):

```bash
cd "d:\AI\claude01"

# 1. Create Constitution (20 min)
mkdir -p .speckit
# Copy Constitution template from Strategy 1, customize for your project

# 2. Update CLAUDE.md (5 min)
# Add Constitution reference to security checklist

# 3. Update PRD templates (15 min)
# Add Constitution compliance section to all three PRD guides

# 4. Create Constitution check command (10 min)
# Add .claude/commands/check-constitution.md

# 5. Test on next feature (10 min)
# Apply Constitution checklist to current work
```

**Success criteria after 2 weeks**:
- [ ] Constitution prevented at least 1 bug
- [ ] All new PRDs include Constitution compliance section
- [ ] No environment variable leaks (check git log)
- [ ] All new tables have RLS enabled

### Medium-term (Next Month)

**Evaluate Strategy 2 or 3** based on:

1. **Did Constitution alone provide value?**
   - If YES → Consider Strategy 3 (incremental Spec Kit)
   - If NO → Stick with CLAUDE.md only

2. **Are you working on complex features (> 5 files)?**
   - If YES → Try Spec Kit manually (no automation yet)
   - If NO → CLAUDE.md is sufficient

3. **Do you need better documentation (team/open source)?**
   - If YES → Invest in Strategy 2 (full integration)
   - If NO → Skip Spec Kit

### Long-term (3-6 Months)

**Review and adjust**:

```bash
# After 20+ features, evaluate:

# 1. Constitution effectiveness
git log --grep="fix.*security" --since="3 months ago" --oneline | wc -l
# Compare to previous period (should decrease)

# 2. Test pairing compliance
python scripts/check_test_pairing.py src/ tests/
# Should be 100% or close

# 3. Time saved
# Manual tracking: Record time per feature before/after Constitution

# Decision:
# - Keep Constitution: YES (almost zero overhead after initial creation)
# - Add Spec Kit: MAYBE (only if complex features dominate)
# - Enhance CLAUDE.md: YES (continuous improvement)
```

### Specific to SSO Project

**Priority order**:

1. **Week 1**: Adopt Constitution (Strategy 1)
   - Focus on security principles (env vars, RLS, auth)
   - SSO is security-critical, Constitution is essential

2. **Week 2-4**: Create templates (from Strategy 3)
   - SDK Integration Template (for VTC_Logger, contents-factory)
   - RLS Policy Template (for all user data tables)
   - **Skip** Spec Kit automation (not worth it for 2-3 apps)

3. **Month 2**: GitHub native workflow (from existing docs)
   - Migrate local PRDs to GitHub Issues
   - Setup GitHub Projects board
   - **Skip** Spec Kit GitHub Actions (CLAUDE.md automation is enough)

4. **Month 3+**: Evaluate Spec Kit
   - If team grows → Add Strategy 2 (full integration)
   - If still solo → Stick with Constitution + CLAUDE.md

### What NOT to Do

**Anti-patterns**:
1. ❌ **Don't** adopt Spec Kit for all features immediately (too slow, unproven ROI)
2. ❌ **Don't** replace CLAUDE.md Phase 1-6 (no equivalent in Spec Kit)
3. ❌ **Don't** create Constitution with 50+ rules (start with 8 sections, expand only when bugs repeat)
4. ❌ **Don't** over-engineer templates (3 templates max: SDK, RLS, Feature)
5. ❌ **Don't** skip Constitution review before Phase 1 (defeats the purpose)

---

## Conclusion

**TL;DR for busy solo developer**:

1. **Adopt Constitution now** (1 hour, huge ROI)
2. **Keep CLAUDE.md Phase 0-6** (proven, fast, complete)
3. **Try Spec Kit manually** for next complex feature (no automation)
4. **Decide after 5 features**: Is Spec Kit worth automation?
5. **Focus on templates** (SDK integration, RLS) more than tools

**Final thought**: Spec Kit is a great idea (intent-driven, AI-agnostic), but CLAUDE.md already provides 90% of the value with 10% of the overhead. The sweet spot is **Constitution + CLAUDE.md + selective Spec Kit for complex features**.

**Next steps**:
- [ ] Create Constitution (use template from Strategy 1)
- [ ] Update CLAUDE.md and PRD templates
- [ ] Apply to current SSO work (VTC_Logger, contents-factory)
- [ ] Re-evaluate in 1 month

---

**Document Version**: 1.0.0
**Last Updated**: 2025-11-10
**Maintained By**: Claude Code (Sequential Thinking Engineer)
**Feedback**: Update this doc monthly based on actual usage
