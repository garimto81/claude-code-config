---
description: Complete a design review of UI/UX changes on the current branch
---

# /design-review - 디자인 리뷰

Phase 2.5에서 UI/UX 변경사항을 리뷰하는 명령어.

## Usage

```
/design-review
```

## What it does

1. **변경사항 분석**: UI 관련 파일 변경 확인
2. **디자인 원칙 검토**: 일관성, 접근성, 반응형
3. **스타일 가이드 준수**: 디자인 시스템 체크
4. **리뷰 리포트 생성**: 시각적 피드백 포함

## Review Categories

- **Visual Consistency**: 색상, 타이포그래피, 간격
- **Accessibility**: WCAG 2.1 준수, 키보드 네비게이션
- **Responsive Design**: 모바일/태블릿/데스크탑
- **User Experience**: 인터랙션, 피드백, 로딩 상태
- **Component Reuse**: 기존 컴포넌트 활용

## When to Use

- UI 컴포넌트 추가/수정 시
- 스타일 변경 시
- 레이아웃 수정 시
- 새로운 페이지/뷰 추가 시

## Phase Integration

```
Phase 2 → Phase 2.5 (/design-review + /pragmatic-code-review) → Phase 3
```

## Related

- `/pragmatic-code-review` - 코드 품질 리뷰
- `/check` - 정적 분석
- `.claude/plugins/workflow-reviews/context/design-principles.md`
