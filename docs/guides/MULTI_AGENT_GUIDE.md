# 멀티 에이전트 병렬 워크플로우 가이드

**버전**: 1.0.0
**기술 스택**: Claude Agent SDK + LangGraph

---

## 1. 개요

이 가이드는 멀티 에이전트 병렬 워크플로우 시스템의 사용법을 설명합니다.

### 핵심 특징
- **병렬 실행**: 3-5개 서브에이전트가 동시에 작업
- **컨텍스트 격리**: 각 에이전트 독립 컨텍스트 윈도우
- **LangGraph 기반**: 그래프 기반 워크플로우 정의
- **Phase 통합**: 기존 Phase 검증 시스템과 연동

---

## 2. 설치

```bash
# 의존성 설치
pip install langgraph langchain-anthropic

# 설치 확인
pip show langgraph langchain-anthropic
```

### 환경 변수

```bash
# .env 파일 또는 환경 변수 설정
export ANTHROPIC_API_KEY="your-api-key"
```

---

## 3. 기본 사용법

### 3.1 병렬 태스크 실행

```python
from src.agents.parallel_workflow import run_parallel_task

# 간단한 태스크 실행
result = run_parallel_task(
    task="웹 프레임워크 비교 분석",
    num_agents=3
)

print(result["final_output"])
```

### 3.2 비동기 실행

```python
import asyncio
from src.agents.parallel_workflow import run_parallel_task_async

async def main():
    result = await run_parallel_task_async(
        task="프로젝트 구조 분석",
        num_agents=4
    )
    print(result["final_output"])

asyncio.run(main())
```

---

## 4. Slash Commands

### 사용 가능한 병렬 커맨드

| 커맨드 | 설명 |
|--------|------|
| `/parallel-research` | 멀티 에이전트 병렬 리서치 |
| `/parallel-review` | 4개 전문 에이전트 코드 리뷰 |
| `/issue` | 병렬 솔루션 검색 (업데이트됨) |

### 사용 예시

```
/parallel-research

리서치 주제: React vs Vue vs Angular 비교

[결과]
- Agent 1: React 분석 완료
- Agent 2: Vue 분석 완료
- Agent 3: Angular 분석 완료
- Aggregator: 종합 비교표 생성
```

---

## 5. 아키텍처

### 5.1 Fan-Out / Fan-In 패턴

```
START → Supervisor → [Agent1, Agent2, Agent3] → Aggregator → END
                         (병렬 실행)
```

### 5.2 모듈 구조

```
src/agents/
├── __init__.py           # 패키지 초기화
├── config.py             # 설정 (모델 티어, Phase 매핑)
├── parallel_workflow.py  # LangGraph 워크플로우
├── phase_validator.py    # Phase 병렬 검증
├── benchmark.py          # 성능 벤치마크
└── utils.py              # 유틸리티 함수
```

---

## 6. 설정

### 6.1 모델 티어링

```python
# src/agents/config.py

AGENT_MODEL_TIERS = {
    "supervisor": "claude-sonnet-4-20250514",  # 복잡한 의사결정
    "researcher": "claude-sonnet-4-20250514",  # 일반 태스크
    "validator": "claude-haiku-3-20240307",    # 간단한 검증
}
```

### 6.2 Phase별 에이전트 매핑

```python
PHASE_AGENTS = {
    "phase_0": ["requirements_agent", "stakeholder_agent"],
    "phase_1": ["code_agent", "test_agent", "docs_agent"],
    "phase_2": ["unit_test_runner", "integration_test_runner"],
    "phase_2.5": ["code_reviewer", "security_auditor"],
}
```

---

## 7. 성능

### 7.1 벤치마크 결과

| 시나리오 | Sequential | Parallel | 속도 향상 |
|----------|------------|----------|-----------|
| 3개 태스크 | 30초 | 12초 | **2.5x** |
| 5개 태스크 | 50초 | 15초 | **3.3x** |
| 코드 리뷰 (4 reviewers) | 120초 | 35초 | **3.4x** |

### 7.2 벤치마크 실행

```bash
python src/agents/benchmark.py
```

---

## 8. 에러 핸들링

### 8.1 재시도 로직

```python
# 자동 재시도 (최대 3회)
builder.add_conditional_edges(
    "subagent",
    lambda state: "retry" if state["error_count"] < 3 else "fallback",
    {
        "retry": "subagent",
        "fallback": "single_agent_fallback",
    }
)
```

### 8.2 타임아웃 설정

```python
from src.agents.config import AgentConfig

config = AgentConfig(
    name="researcher",
    role="리서치",
    timeout_seconds=120,  # 2분 타임아웃
    max_retries=3
)
```

---

## 9. 비용 최적화

### 9.1 컨텍스트 격리

- 각 서브에이전트는 독립 컨텍스트 사용
- 결과만 Aggregator에 전달 → 토큰 70% 절감

### 9.2 모델 티어링

| 역할 | 모델 | 비용 |
|------|------|------|
| Supervisor | Sonnet 4 | $$ |
| Researcher | Sonnet 4 | $$ |
| Validator | Haiku 3 | $ |

---

## 10. 문제 해결

### Q1: 병렬 실행이 안 됩니다
```python
# LangGraph의 병렬 엣지 확인
builder.add_edge("supervisor", ["agent_0", "agent_1", "agent_2"])  # 리스트로 전달
```

### Q2: API 키 오류
```bash
# 환경 변수 확인
echo $ANTHROPIC_API_KEY

# 또는 .env 파일 생성
echo 'ANTHROPIC_API_KEY=sk-...' > .env
```

### Q3: 타임아웃 발생
```python
# 타임아웃 증가
config = AgentConfig(timeout_seconds=300)  # 5분
```

---

## 11. 참고 자료

- [LangGraph 문서](https://python.langchain.com/docs/langgraph)
- [Claude Agent SDK](https://docs.claude.com/en/api/agent-sdk/overview)
- [Anthropic Multi-Agent System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [프로젝트 제안서](../proposals/MULTI_AGENT_PARALLEL_WORKFLOW.md)

---

*마지막 업데이트: 2025-01-28*
