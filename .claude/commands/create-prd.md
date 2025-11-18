---
name: create-prd
description: Generate comprehensive Product Requirement Document interactively
---

# /create-prd - Interactive PRD Generator

Generate comprehensive PRD following Phase 0 workflow with guided questions.

## Usage

```
/create-prd [feature-name]
```

## Interactive Workflow

### Step 1: Clarification Questions (A/B/C/D)

Claude Code asks 3-8 clarifying questions following PRD_GUIDE_MINIMAL.md:

```
Let's create a PRD for [feature-name]. I'll ask some questions:

A. Target Users
   A) End users only
   B) Admins only
   C) Both end users and admins
   D) External API consumers

B. Authentication Method
   A) Email/Password
   B) OAuth2 (Google, GitHub)
   C) SSO integration
   D) No authentication needed

C. Expected Load
   A) <100 users
   B) 100-1,000 users
   C) 1,000-10,000 users
   D) >10,000 users
```

### Step 2: PRD Generation

Based on answers, generates structured PRD:

```markdown
# PRD: [Feature Name]

**Version**: 1.0
**Date**: 2025-01-18
**Author**: [Your Name]
**Status**: Draft

---

## 1. Purpose

[Auto-generated based on questions]

## 2. Target Users

- Primary: [From question A]
- Secondary: [If applicable]

## 3. Core Features

### 3.1 [Feature 1]
**Description**: [Auto-generated]
**Priority**: High
**Effort**: Medium

### 3.2 [Feature 2]
**Description**: [Auto-generated]
**Priority**: Medium
**Effort**: Low

## 4. Technical Requirements

### 4.1 Authentication
- Method: [From question B]
- Implementation: [Specific details]

### 4.2 Performance
- Expected load: [From question C]
- Response time: <500ms

## 5. Success Metrics

- [Auto-generated KPIs]
- [Specific to feature]

## 6. Timeline

- Phase 0: Requirements (1-2 days)
- Phase 1: Implementation (3-5 days)
- Phase 2: Testing (2-3 days)
- Phase 3-6: Deploy (1-2 days)

---

**Next Steps**: Run `/todo` to generate task list
```

### Step 3: File Creation

```bash
# Creates file:
tasks/prds/0001-prd-feature-name.md

# Validates with:
bash scripts/validate-phase-0.sh 0001
```

## PRD Templates

### MINIMAL (10 min, ~1270 tokens)
- Quick questions
- Essential sections only
- For experienced developers

### STANDARD (20-30 min)
- Comprehensive questions
- Full documentation
- For most projects

### JUNIOR (40-60 min, ~4500 tokens)
- Detailed guidance
- Step-by-step instructions
- For beginners

Select template:
```bash
/create-prd --template=minimal
/create-prd --template=standard  # default
/create-prd --template=junior
```

## Phase Integration

### Phase 0: Requirements
- **Primary use case**
- Replaces manual PRD writing
- Time savings: 67% (45min → 15min with MINIMAL)

### Phase 0.5: Task Generation
- After PRD completion
- Run `/todo` to generate task list
- Or: `python scripts/generate_tasks_ai.py`

## Example Session

```
User: /create-prd user-authentication

Claude: Let's create a PRD for user-authentication. I'll ask 5 quick questions:

1. Authentication Method?
   A) Email/Password
   B) OAuth2
   C) Both
   D) SSO only

User: C

Claude: 2. User Roles?
   A) Single role (user)
   B) User + Admin
   C) Multiple custom roles
   D) Role-based permissions

User: B

... [3 more questions]

Claude: ✓ PRD generated: tasks/prds/0001-prd-user-authentication.md
        ✓ Validated: 78 lines, all sections present

Next steps:
1. Review PRD
2. Run: /todo to generate task list
3. Run: bash scripts/validate-phase-0.sh 0001
```

## Auto-Numbering

Automatically finds next PRD number:
```bash
# Existing PRDs:
tasks/prds/0001-prd-auth.md
tasks/prds/0002-prd-dashboard.md

# Next PRD:
/create-prd search-feature
→ Creates: 0003-prd-search-feature.md
```

## Integration with Scripts

Works with existing validation:
```bash
# After /create-prd
bash scripts/validate-phase-0.sh 0003

# ✅ Confirms:
# - PRD exists
# - Minimum 50 lines
# - Required sections present
```

## Related

- `/todo` - Generate task list from PRD
- `docs/guides/PRD_GUIDE_*.md`
- Phase 0 workflow
- `scripts/validate-phase-0.sh`
