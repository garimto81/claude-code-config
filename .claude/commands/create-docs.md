
---
name: create-docs
description: Create release note skeleton under docs/releases
---

# /create-docs - Release Notes Template Generator

`docs/releases/{version}.md` 파일이 없으면 자동으로 생성해 릴리스 메모 뼈대를 만든다. 실제 API/클래스 문서를 작성하지는 않으며, 템플릿은 사용자가 직접 채워 넣을 수 있도록 간단한 섹션을 포함한다.

## Usage

```
/create-docs [version-tag]
```

Phase Controller 예시:

```
python scripts/phase_controller.py --version v1.2.0 --phases 6 --auto-skills
```

## Behavior

- 대상 경로: `docs/releases/{version}.md`
- 파일이 이미 있으면 “기존 문서 유지” 메시지 출력
- 없으면 다음 템플릿 생성:

```
# Release Notes - vX.Y.Z

## Highlights
- TODO

## Verification
- Tests: TBD
- Security: TBD

## Deployment
- Checklist 항목을 채워주세요.
```

버전 태그가 없으면 `PRD-0001` 등 PRD 번호를 사용한다.

## Language

- Release notes와 모든 출력은 CLAUDE.md Core Rules의 사용자 응답=한글 규칙을 따른다.
- 동일한 경고 블록을 문서마다 반복하지 말고, CLAUDE.md를 전역 규칙의 단일 출처로 유지한다.

## Phase Integration

- **Phase 6 (Deployment)**: 릴리스 메모 초안을 자동으로 만들고 채워 넣기만 하면 됨

## Related

- `/changelog` – CHANGELOG 항목 생성
- `docs/releases/` – 릴리스 문서 저장소
