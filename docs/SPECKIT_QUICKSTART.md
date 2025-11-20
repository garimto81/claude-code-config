# Spec Kit Quick Start Guide
*Start using Spec Kit with CLAUDE.md in 30 minutes*

**For**: Solo Developer (Vibe Coder)
**Goal**: Add Constitution file, prevent security bugs
**Time**: 30 minutes

> **🗣️ 언어 규칙**: CLAUDE.md Core Rules에 명시된 **“항상 한글로 말할 것”** 지침을 모든 사용자 응답·문서·커밋 설명에 최우선으로 적용하세요.

---

## Visual Comparison

### Before: CLAUDE.md Only
```
User Request
    ↓
PRD (10-30 min)
    ↓
Tasks (generate_tasks.py)
    ↓
Phase 1-6: Code → Test → Deploy
    ↓
❌ Risk: Forgot to check security/architecture
```

### After: Constitution + CLAUDE.md
```
User Request
    ↓
Constitution Check (2 min) ← NEW
    ↓
PRD (10-30 min)
    ↓
Tasks (generate_tasks.py)
    ↓
Phase 1-6: Code → Test → Deploy
    ↓
✅ Security/architecture verified upfront
```

---

## 30-Minute Setup

### Step 1: Create Constitution (10 min)

**Already done!** File created at: `d:\AI\claude01\.speckit\constitution.md`

**Action**: Review and customize for your needs:
```bash
# Review the file
cat "d:\AI\claude01\.speckit\constitution.md"

# Edit if needed
code "d:\AI\claude01\.speckit\constitution.md"
```

### Step 2: Update CLAUDE.md (5 min)

**Edit**: `d:\AI\claude01\CLAUDE.md`

**Find line 92** (Security Checklist section), add:
```markdown
**Constitution**: [.speckit/constitution.md](.speckit/constitution.md) - 프로젝트 원칙 (Phase 0 전에 항상 확인)
```

**Before**:
```markdown
## 🔐 보안 체크리스트

**필수**: 환경변수 | SQL Injection 방지 | ...
**.gitignore**: `.env*` | `*.key` | ...
```

**After**:
```markdown
## 🔐 보안 체크리스트

**필수**: 환경변수 | SQL Injection 방지 | ...
**Constitution**: [.speckit/constitution.md](.speckit/constitution.md) - 프로젝트 원칙 (Phase 0 전에 항상 확인)
**.gitignore**: `.env*` | `*.key` | ...
```

### Step 3: Update PRD Templates (10 min)

**Edit these 3 files**:
- `d:\AI\claude01\docs\guides\PRD_GUIDE_MINIMAL.md`
- `d:\AI\claude01\docs\guides\PRD_GUIDE_STANDARD.md`
- `d:\AI\claude01\docs\guides\PRD_GUIDE_JUNIOR.md`

**Add after "범위 제외" section**:

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

### Step 4: Create Check Command (5 min)

**Create**: `d:\AI\claude01\.claude\commands\check-constitution.md`

```markdown
Before starting Phase 1 (implementation), verify Constitution compliance:

1. Read `.speckit/constitution.md`
2. Check current task against all 8 sections
3. Report any violations or risks
4. Suggest mitigations if needed

If Constitution violation found:
- STOP implementation
- Update PRD to resolve conflict
- Get user approval for exception OR change approach
```

---

## Usage Examples

### Example 1: New Feature (Google OAuth)

**OLD workflow**:
```bash
python scripts/create_prd.py google-oauth "Add Google login"
# → Start coding immediately
# → Realize later: forgot to use .env for API keys
# → 2 hours wasted debugging
```

**NEW workflow**:
```bash
# 1. Quick Constitution check (2 min)
grep -A 5 "Environment Variables" .speckit/constitution.md

# 2. Create PRD with Constitution section
python scripts/create_prd.py google-oauth "Add Google login"
# → PRD now includes Constitution checklist

# 3. In Claude Code, before Phase 1:
"Check .speckit/constitution.md for Google OAuth requirements"
# → Claude reminds: Use .env, enable RLS, use Supabase Auth

# 4. Implementation with confidence
# → All security principles followed from the start
```

**Time saved**: 2-4 hours (prevented debugging session)

### Example 2: Database Table (User Photos)

**OLD workflow**:
```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY,
  user_id UUID,
  url TEXT
);
-- Forgot RLS, security bug discovered in production
```

**NEW workflow**:
```bash
# 1. Check Constitution first
grep -A 10 "Supabase RLS" .speckit/constitution.md

# 2. Apply Constitution rules
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS immediately (as per Constitution)
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_select_policy"
ON photos FOR SELECT
TO authenticated
USING (user_id = auth.uid());
-- ... (INSERT, UPDATE, DELETE policies)
```

**Result**: Security-first design, no production bugs

### Example 3: Multi-App SSO Integration

**OLD workflow**:
```bash
# In VTC_Logger
# Copy-paste auth code from contents-factory
# → Code duplication, inconsistent logic
```

**NEW workflow**:
```bash
# Check Constitution first
grep -A 10 "SSO System" .speckit/constitution.md

# Constitution says: SDK-FIRST
# → Create shared SDK instead of duplicating code

# In sso-system/sdk/
npm create vite@latest @yourorg/sso-sdk

# In VTC_Logger and contents-factory
npm install @yourorg/sso-sdk
# → Single source of truth, no duplication
```

**Result**: Consistent auth across all apps

---

## Integration with Phase 0-6

### Updated Workflow

```
Phase -1: Constitution Check (NEW - 2 min)
    ↓
    Read .speckit/constitution.md
    Verify feature complies with principles
    ↓
Phase 0: PRD (10-30 min)
    ↓
    Include Constitution checklist in PRD
    ↓
Phase 0.5: Task List (5-10 min)
    ↓
    Tasks include Constitution compliance steps
    ↓
Phase 1: Code (varies)
    ↓
    Implementation follows Constitution principles
    ↓
Phase 2-6: Test → Version → Git → Validation → Cache
    ↓
    All phases benefit from upfront Constitution check
```

### Time Investment vs Savings

**Investment**:
- Constitution creation: 20 min (one-time)
- Template updates: 10 min (one-time)
- Per-feature check: 2 min (recurring)

**Savings per feature**:
- Prevent 1 security bug: 2-4 hours
- Prevent 1 architecture mistake: 4-8 hours
- Prevent 1 test oversight: 1-2 hours

**Break-even**: After 2-3 features (~2 weeks)

---

## What NOT to Do

### Anti-Patterns

1. **DON'T create 50+ rules**
   - Start with 8 sections (current Constitution)
   - Add rules only when bugs repeat (2+ times)

2. **DON'T skip Constitution for "quick" features**
   - Quick features often have security bugs
   - 2-minute check prevents 2-hour debugging

3. **DON'T enforce manually**
   - Use grep/search to quickly find relevant sections
   - Consider automation later (pre-commit hooks)

4. **DON'T over-engineer**
   - Constitution is a markdown file, not a tool
   - Keep it simple, human-readable

---

## Success Metrics

### After 2 Weeks

Check these metrics:

```bash
# 1. No environment variable leaks
git log --all --full-history -- "**/.env"
# Should be empty (all .env files in .gitignore)

# 2. All new tables have RLS
# Manual check in Supabase Dashboard

# 3. Test pairing compliance
find src -name "*.ts" ! -name "*.test.ts" | wc -l  # Implementation files
find tests -name "*.test.ts" | wc -l               # Test files
# Should be equal (1:1 pairing)
```

### After 1 Month

**Evaluate**:
- [ ] Constitution prevented at least 2 bugs
- [ ] All PRDs include Constitution checklist
- [ ] Zero security-related production bugs
- [ ] Team member (if added) understood system from Constitution

**Decision**:
- Keep using Constitution: **YES** (almost zero overhead)
- Add more Spec Kit features: **MAYBE** (see full strategy doc)
- Revert to old workflow: **NO** (benefits proven)

---

## Next Steps

### Immediate (Today)

1. ✅ **Constitution file created** (already done)
2. [ ] Review and customize Constitution
3. [ ] Update CLAUDE.md (5 min)
4. [ ] Update PRD templates (10 min)
5. [ ] Create check-constitution command (5 min)

### This Week

6. [ ] Apply Constitution to current work (SSO project)
7. [ ] Test on one feature (measure time saved)
8. [ ] Update Constitution if needed (add/remove rules)

### Next Month

9. [ ] Evaluate ROI (use worksheet from full strategy doc)
10. [ ] Decide: Keep, expand, or revert
11. [ ] If successful, consider full Spec Kit integration

---

## FAQ

**Q: Do I need to install Specify CLI?**
A: Not for Strategy 1 (minimalist). Just create Constitution file manually.

**Q: What if I have multiple projects?**
A: Create separate Constitution per project, or one shared Constitution with project-specific sections.

**Q: Can I use Constitution without CLAUDE.md?**
A: Yes! Constitution is independent. Works with any workflow.

**Q: How often should I update Constitution?**
A: Monthly review, update when bugs repeat (2+ times).

**Q: What if Constitution conflicts with speed?**
A: Skip Constitution for prototypes/throwaway code. Use for production features.

---

## Resources

- **Full Strategy Document**: `d:\AI\claude01\docs\SPECKIT_INTEGRATION_STRATEGY.md`
- **Constitution File**: `d:\AI\claude01\.speckit\constitution.md`
- **CLAUDE.md Workflow**: `d:\AI\claude01\CLAUDE.md`
- **GitHub Spec Kit**: https://github.com/github/spec-kit

---

**Version**: 1.0.0
**Last Updated**: 2025-11-10
**Estimated Reading Time**: 10 minutes
**Estimated Setup Time**: 30 minutes
