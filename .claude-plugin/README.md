# Plugin Registry

**Version**: 5.4.0 | **Updated**: 2025-12-03

이 디렉토리는 Claude Code 플러그인 관리를 위한 설정 파일들을 포함합니다.

## 파일 설명

### registry.json (Primary)
현재 프로젝트에 설치된 플러그인 목록 및 상태.

```json
{
  "version": "5.4.0",
  "plugins": [
    { "id": "plugin-name", "status": "active", ... }
  ]
}
```

**사용**: 플러그인 활성화/비활성화, 버전 관리

### marketplace.json (Reference)
[wshobson/agents](https://github.com/wshobson/agents) 레포지토리의 플러그인 카탈로그.

- 64개 플러그인 정의
- 87개 에이전트
- 44개 도구

**사용**: 새 플러그인 검색 및 설치 참조용

### registry-schema.json
registry.json 유효성 검사를 위한 JSON 스키마.

## 플러그인 관리

```bash
# 플러그인 목록
python scripts/plugin_manager.py list

# 플러그인 상태
python scripts/plugin_manager.py status <plugin-id>

# 플러그인 업데이트
python scripts/plugin_manager.py update <plugin-id>
```

## 현재 설치된 플러그인

| Plugin | Version | Status | Type |
|--------|---------|--------|------|
| python-development | 1.2.0 | active | upstream |
| javascript-typescript | 1.2.0 | active | upstream |
| debugging-toolkit | 1.2.0 | active | upstream |
| meta-development | 1.0.0 | active | upstream |
| workflow-reviews | 1.0.0 | active | upstream |
| phase-0-planning | 5.4.0 | active | local |
| phase-1-development | 5.4.0 | active | local |
| phase-2-testing | 5.4.0 | active | local |

## 관련 문서

- [PLUGIN_SYSTEM_GUIDE.md](../docs/PLUGIN_SYSTEM_GUIDE.md)
- [PLUGIN_COORDINATION_GUIDE.md](../docs/PLUGIN_COORDINATION_GUIDE.md)
