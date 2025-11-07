# Rule: Generating a Task List from a PRD

**Phase**: 0.5 (PRD 승인 후, 코드 작성 전)
**참조**: [CLAUDE.md - Phase 0.5](CLAUDE.md#-phase-05-task-list-생성)

## Goal

To guide an AI assistant in creating a detailed, step-by-step task list in Markdown format based on an existing Product Requirements Document (PRD). The task list should guide a developer through implementation.

## Quick Start

### 자동 생성 (추천)
```bash
python scripts/generate_tasks.py tasks/prds/0001-prd-user-auth.md
```

### 수동 생성 (AI 대화)
1. AI에게 PRD 파일 경로 제공
2. Parent Tasks 검토 후 "Go" 입력
3. Sub-Tasks 생성 확인

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/tasks/`
- **Filename:** `####-tasks-[feature-name].md` (PRD 번호와 동일)
  - 예: `0001-tasks-user-auth.md` (from `0001-prd-user-auth.md`)

## Task Status Markers

- `[ ]` 미시작
- `[x]` 완료
- `[!]` 실패 (테스트 실패)
- `[⏸]` 블락 (의존성 대기)

## Process

1.  **Receive PRD Reference:** The user points the AI to a specific PRD file
2.  **Analyze PRD:** The AI reads and analyzes the functional requirements, user stories, and other sections of the specified PRD.
3.  **Assess Current State:** Review the existing codebase to understand existing infrastructre, architectural patterns and conventions. Also, identify any existing components or features that already exist and could be relevant to the PRD requirements. Then, identify existing related files, components, and utilities that can be leveraged or need modification.
4.  **Phase 1: Generate Parent Tasks:** Based on the PRD analysis and current state assessment, create the file and generate the main, high-level tasks required to implement the feature. Use your judgement on how many high-level tasks to use. It's likely to be about five tasks. Present these tasks to the user in the specified format (without sub-tasks yet). Inform the user: "I have generated the high-level tasks based on the PRD. Ready to generate the sub-tasks? Respond with 'Go' to proceed."
5.  **Wait for Confirmation:** Pause and wait for the user to respond with "Go".
6.  **Phase 2: Generate Sub-Tasks:** Once the user confirms, break down each parent task into smaller, actionable sub-tasks necessary to complete the parent task. Ensure sub-tasks logically follow from the parent task, cover the implementation details implied by the PRD, and consider existing codebase patterns where relevant without being constrained by them.
7.  **Identify Relevant Files:** Based on the tasks and PRD, identify potential files that will need to be created or modified. List these under the `Relevant Files` section, including corresponding test files if applicable.
8.  **Generate Final Output:** Combine the parent tasks, sub-tasks, relevant files, and notes into the final Markdown structure.
9.  **Save Task List:** Save the generated document in the `/tasks/` directory with the filename `tasks-[prd-file-name].md`, where `[prd-file-name]` matches the base name of the input PRD file (e.g., if the input was `0001-prd-user-profile-editing.md`, the output is `tasks-0001-prd-user-profile-editing.md`).

## Output Format

The generated task list _must_ follow this structure:

```markdown
## Relevant Files

**IMPORTANT**: For EVERY implementation file, create a corresponding test file

### Implementation Files
- `path/to/potential/file1.ts` - Brief description of why this file is relevant (e.g., Contains the main component for this feature).
- `path/to/another/file.tsx` - Brief description (e.g., API route handler for data submission).
- `lib/utils/helpers.ts` - Brief description (e.g., Utility functions needed for calculations).

### Test Files (1:1 Pairing Required)
- `path/to/potential/file1.test.ts` - Unit tests for `file1.ts` (MUST exist)
- `path/to/another/file.test.tsx` - Unit tests for `another/file.tsx` (MUST exist)
- `lib/utils/helpers.test.ts` - Unit tests for `helpers.ts` (MUST exist)

### Notes

- **Test File Pairing Rule**: Every implementation file MUST have a corresponding test file
- **Test Location**: Place test files alongside implementation files (e.g., `MyComponent.tsx` + `MyComponent.test.tsx`)
- **Test Framework**:
  - JavaScript/TypeScript: `npx jest [optional/path/to/test/file]`
  - Python: `pytest tests/ -v`
  - Go: `go test ./...`
- **Minimum Coverage**: Each file should have at least basic happy path tests

## Instructions for Completing Tasks

**CRITICAL**: As you complete each sub-task, you MUST check it off by changing `[ ]` to `[x]`. This helps track progress and ensures no steps are skipped.

**Example**:
- Before: `- [ ] 1.1 Create user model`
- After:  `- [x] 1.1 Create user model`

**Update frequency**: After completing EACH sub-task, not just parent tasks.

## Tasks

- [ ] 0.0 Create feature branch
  - [ ] 0.1 Create and checkout new branch (e.g., `git checkout -b feature/user-auth`)
- [ ] 1.0 Parent Task Title
  - [ ] 1.1 [Sub-task description 1.1]
  - [ ] 1.2 [Sub-task description 1.2]
  - [ ] 1.3 Write tests for task 1.1-1.2 (MUST include test file paths)
- [ ] 2.0 Parent Task Title
  - [ ] 2.1 [Sub-task description 2.1]
  - [ ] 2.2 Write tests for task 2.1
- [ ] 3.0 Integration Testing
  - [ ] 3.1 Run all tests (`npm test` / `pytest` / `go test`)
  - [ ] 3.2 Fix any failing tests
  - [ ] 3.3 Verify test coverage meets minimum threshold
```

## Interaction Model

The process explicitly requires a pause after generating parent tasks to get user confirmation ("Go") before proceeding to generate the detailed sub-tasks. This ensures the high-level plan aligns with user expectations before diving into details.

## Target Audience

Assume the primary reader of the task list is a **junior developer** who will implement the feature with awareness of the existing codebase context.
