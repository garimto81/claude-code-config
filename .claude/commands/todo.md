---
name: todo
description: Manage project todos with priorities, due dates, and tracking
---

# /todo - Todo List Manager

Manage project tasks with priorities, due dates, and progress tracking.

## Usage

```
/todo [action] [args]
```

## Actions

### 1. List Todos

```bash
/todo list

# Output:
📋 Todo List (5 tasks)

🔴 HIGH PRIORITY
[!] Task 1: Fix critical security bug
    Due: 2025-01-19 (tomorrow)
    Tags: security, urgent

🟡 MEDIUM PRIORITY
[⏸] Task 2: Implement user dashboard
    Due: 2025-01-22
    Tags: feature, frontend
    Blocked by: Task 1

🟢 LOW PRIORITY
[ ] Task 3: Update documentation
    Due: 2025-01-25
    Tags: docs

✅ COMPLETED (2)
```

### 2. Add Todo

```bash
/todo add "Implement OAuth2" --priority=high --due=2025-01-20 --tags=auth,security
```

**Parameters**:
- `--priority`: low | medium | high
- `--due`: YYYY-MM-DD
- `--tags`: comma-separated
- `--assignee`: @username
- `--estimate`: hours

### 3. Update Status

```bash
/todo status 2 in_progress
/todo status 1 completed
/todo status 3 blocked

# Status options:
# - pending [ ]
# - in_progress [→]
# - completed [x]
# - failed [!]
# - blocked [⏸]
```

### 4. Set Priority

```bash
/todo priority 2 high
```

### 5. Add Dependencies

```bash
/todo depends 3 on 1,2
# Task 3 depends on tasks 1 and 2
```

## Phase Integration

### Phase 0.5: Task Generation
Generate from PRD:
```bash
/todo generate tasks/prds/0001-prd-auth.md

# Auto-creates todos:
# - Task 0.0: Setup
# - Task 1.0: Implementation
# - Task 2.0: Testing
# - etc.
```

### Phase 1-6: Execution
Track progress:
```bash
/todo list --phase=1
/todo complete 1.1
/todo next  # Shows next pending task
```

## Progress Tracking

### Overall Progress
```bash
/todo progress

# Output:
📊 Progress Report

Overall: 7/10 (70%)
█████████████░░░░░░░

By Phase:
Phase 0: ✅ 100% (2/2)
Phase 1: ⏳  60% (3/5)
Phase 2: ⏸️   0% (0/3)

By Priority:
High:   ✅ 100% (2/2)
Medium: ⏳  50% (2/4)
Low:    ⏸️   0% (0/4)
```

### Burndown Chart
```bash
/todo burndown

# 10 │     ●
#    │   ●
#  5 │ ●
#    │●
#  0 └─────────
#    Mon Tue Wed
```

## Integration with TodoWrite

Uses existing `TodoWrite` tool:
```python
# .claude/commands/todo.md calls:
TodoWrite({
    "todos": [
        {
            "content": "Implement feature",
            "status": "in_progress",
            "activeForm": "Implementing feature"
        }
    ]
})
```

## Task File Format

Stores in `tasks/NNNN-tasks-feature.md`:

```markdown
# Task List: User Authentication (PRD-0001)

## Task 0.0: Setup
- [x] Create feature branch
- [x] Update CLAUDE.md

## Task 1.0: Implementation
- [→] Task 1.1: Create auth module
  Priority: High
  Due: 2025-01-20
  Estimate: 4h

- [ ] Task 1.2: Write tests
  Priority: High
  Due: 2025-01-20
  Estimate: 2h
  Depends: 1.1
```

## Shortcuts

```bash
/todo add "Quick task"           # Add with defaults
/todo 1 done                     # Mark #1 complete
/todo 2 blocked "Waiting for PR" # Block with reason
/todo next                       # Show next task
/todo today                      # Show today's tasks
```

## Notifications

```bash
# Set reminder
/todo remind 1 "2025-01-19 09:00"

# Daily summary
/todo summary

# Output:
📅 Today's Tasks (3)
- [!] Fix security bug (OVERDUE)
- [ ] Implement dashboard
- [ ] Review PR #42
```

## Integration with GitHub

Sync with GitHub Issues:
```bash
/todo sync github

# Two-way sync:
# - Local todos → GitHub issues
# - GitHub issues → Local todos
# - Status updates propagate
```

## Related

- `/create-prd` - Generate PRD first
- `TodoWrite` tool
- Phase 0.5 task generation
- `tasks/NNNN-tasks-*.md` files
