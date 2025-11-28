# 멀티 에이전트 병렬화 워크플로우 제안서

**버전**: 1.0.0
**작성일**: 2025-01-28
**기술 스택**: Claude Agent SDK + LangGraph

---

## 1. Executive Summary

### 1.1 목적
현재 Claude Code 기반 워크플로우를 **멀티 에이전트 병렬 실행 시스템**으로 확장하여 복잡한 작업의 처리 속도와 품질을 향상시킵니다.

### 1.2 핵심 가치
| 지표 | 현재 (Sequential) | 목표 (Parallel) | 개선율 |
|------|-------------------|-----------------|--------|
| 복잡 작업 처리 시간 | 10분 | 3분 | **70% 단축** |
| 컨텍스트 효율성 | 단일 윈도우 | 독립 윈도우 | **오버플로우 방지** |
| 정확도 (복합 쿼리) | 60% | 90% | **50% 향상** |

> Anthropic 내부 평가: 멀티 에이전트 시스템(Opus 4 리드 + Sonnet 4 서브에이전트)이 단일 에이전트 대비 **90.2% 더 우수**한 성능

---

## 2. 아키텍처 설계

### 2.1 하이브리드 아키텍처

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORCHESTRATION LAYER                          │
│                      (LangGraph)                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              StateGraph (DAG)                            │   │
│  │                                                          │   │
│  │    ┌──────┐    ┌──────────────────────┐    ┌──────┐    │   │
│  │    │ START│───▶│   Supervisor Node    │───▶│ END  │    │   │
│  │    └──────┘    │  (Task Decomposer)   │    └──────┘    │   │
│  │                └──────────┬───────────┘                 │   │
│  │                           │                              │   │
│  │           ┌───────────────┼───────────────┐              │   │
│  │           ▼               ▼               ▼              │   │
│  │    ┌───────────┐   ┌───────────┐   ┌───────────┐        │   │
│  │    │ SubAgent  │   │ SubAgent  │   │ SubAgent  │        │   │
│  │    │    A      │   │    B      │   │    C      │        │   │
│  │    └─────┬─────┘   └─────┬─────┘   └─────┬─────┘        │   │
│  │          │               │               │               │   │
│  │          └───────────────┼───────────────┘               │   │
│  │                          ▼                               │   │
│  │                   ┌───────────┐                          │   │
│  │                   │ Aggregator│                          │   │
│  │                   │   Node    │                          │   │
│  │                   └───────────┘                          │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXECUTION LAYER                              │
│                  (Claude Agent SDK)                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Subagent   │  │  Subagent   │  │  Subagent   │             │
│  │  Instance   │  │  Instance   │  │  Instance   │             │
│  │             │  │             │  │             │             │
│  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │             │
│  │ │ Context │ │  │ │ Context │ │  │ │ Context │ │             │
│  │ │ Window  │ │  │ │ Window  │ │  │ │ Window  │ │             │
│  │ │(Isolated)│ │  │ │(Isolated)│ │  │ │(Isolated)│ │             │
│  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 역할 분담

| 레이어 | 기술 | 역할 |
|--------|------|------|
| **Orchestration** | LangGraph | 워크플로우 정의, 병렬 브랜치, 상태 관리, 에러 핸들링 |
| **Execution** | Claude Agent SDK | 서브에이전트 실행, 컨텍스트 격리, 도구 호출 |
| **Connectivity** | MCP | 외부 데이터소스/도구 연결 |

### 2.3 병렬화 패턴

#### Pattern 1: Fan-Out / Fan-In (Sectioning)
```python
# 독립적인 서브태스크를 병렬로 실행 후 결과 집계
builder.add_edge(START, "supervisor")
builder.add_edge("supervisor", ["research_agent", "code_agent", "test_agent"])
builder.add_edge(["research_agent", "code_agent", "test_agent"], "aggregator")
builder.add_edge("aggregator", END)
```

#### Pattern 2: Map-Reduce
```python
# 리스트 아이템별 병렬 처리 후 리듀스
class ParentState(TypedDict):
    items: list[str]
    results: Annotated[list[str], operator.add]  # Reducer
```

#### Pattern 3: Hierarchical Teams
```python
# 서브그래프 단위로 팀 구성
research_team = create_research_subgraph()
development_team = create_dev_subgraph()

builder.add_node("research", research_team)
builder.add_node("development", development_team)
```

---

## 3. 구현 가이드

### 3.1 의존성 설치

```bash
# Claude Agent SDK
pip install claude-agent-sdk

# LangGraph + LangChain Anthropic
pip install langgraph langchain-anthropic

# MCP (선택)
pip install mcp
```

### 3.2 기본 구조

```python
# src/agents/parallel_workflow.py

from typing import TypedDict, Annotated
import operator
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic

# 1. 상태 정의
class WorkflowState(TypedDict):
    task: str
    subtasks: list[str]
    results: Annotated[list[dict], operator.add]
    final_output: str

# 2. 모델 초기화
lead_model = ChatAnthropic(model="claude-sonnet-4-20250514")
subagent_model = ChatAnthropic(model="claude-sonnet-4-20250514")

# 3. 노드 정의
def supervisor_node(state: WorkflowState) -> dict:
    """태스크를 서브태스크로 분해"""
    response = lead_model.invoke(
        f"다음 태스크를 3개의 독립적인 서브태스크로 분해하세요: {state['task']}"
    )
    subtasks = parse_subtasks(response.content)
    return {"subtasks": subtasks}

def create_subagent_node(agent_id: str):
    """서브에이전트 노드 팩토리"""
    def subagent_node(state: WorkflowState) -> dict:
        subtask = state["subtasks"][int(agent_id)]
        result = subagent_model.invoke(subtask)
        return {"results": [{"agent": agent_id, "output": result.content}]}
    return subagent_node

def aggregator_node(state: WorkflowState) -> dict:
    """결과 집계"""
    combined = "\n".join([r["output"] for r in state["results"]])
    final = lead_model.invoke(f"다음 결과를 종합하세요:\n{combined}")
    return {"final_output": final.content}

# 4. 그래프 구성
def build_parallel_workflow():
    builder = StateGraph(WorkflowState)

    # 노드 추가
    builder.add_node("supervisor", supervisor_node)
    builder.add_node("agent_0", create_subagent_node("0"))
    builder.add_node("agent_1", create_subagent_node("1"))
    builder.add_node("agent_2", create_subagent_node("2"))
    builder.add_node("aggregator", aggregator_node)

    # 엣지 정의 (병렬 실행)
    builder.add_edge(START, "supervisor")
    builder.add_edge("supervisor", ["agent_0", "agent_1", "agent_2"])  # Fan-out
    builder.add_edge(["agent_0", "agent_1", "agent_2"], "aggregator")  # Fan-in
    builder.add_edge("aggregator", END)

    return builder.compile()

# 5. 실행
workflow = build_parallel_workflow()
result = workflow.invoke({"task": "프로젝트 분석 및 개선안 제시"})
```

### 3.3 Claude Agent SDK 서브에이전트 통합

```python
# src/agents/claude_subagent.py

from claude_agent_sdk import Agent, Subagent

class ParallelResearchAgent:
    def __init__(self):
        self.lead_agent = Agent(
            model="claude-opus-4-20250514",
            system_prompt="당신은 리서치 리드입니다."
        )

    async def run_parallel_research(self, topics: list[str]):
        """여러 주제를 병렬로 리서치"""

        # 서브에이전트 병렬 생성
        subagents = [
            Subagent(
                model="claude-sonnet-4-20250514",
                task=f"주제 '{topic}'에 대해 조사하세요",
                context_isolation=True  # 독립 컨텍스트
            )
            for topic in topics
        ]

        # 병렬 실행
        results = await asyncio.gather(*[
            sa.execute() for sa in subagents
        ])

        # 리드 에이전트가 결과 종합
        summary = await self.lead_agent.synthesize(results)
        return summary
```

### 3.4 현재 프로젝트(claude01) 통합

```python
# .claude/agents/parallel_orchestrator.py

import sys
sys.path.insert(0, "D:/AI/claude01")

from src.agents.parallel_workflow import build_parallel_workflow

# Phase별 병렬 에이전트 매핑
PHASE_AGENTS = {
    "phase_0": ["requirements_agent", "stakeholder_agent"],
    "phase_1": ["code_agent", "test_agent", "docs_agent"],
    "phase_2": ["unit_test_runner", "integration_test_runner", "security_scanner"],
    "phase_2.5": ["code_reviewer", "design_reviewer", "security_auditor"],
}

def create_phase_workflow(phase: str):
    """Phase별 병렬 워크플로우 생성"""
    agents = PHASE_AGENTS.get(phase, [])
    return build_parallel_workflow(agents)
```

---

## 4. 사용 시나리오

### 4.1 시나리오 1: 복합 리서치

```
사용자: "S&P 500 IT 기업들의 이사회 멤버를 모두 찾아줘"

[기존 Sequential]
→ 한 기업씩 순차 검색 → 10분+ 소요, 일부 누락

[신규 Parallel]
→ Supervisor: 10개 기업 그룹으로 분할
→ 3-5개 서브에이전트가 병렬 검색
→ Aggregator: 결과 통합/중복 제거
→ 3분 소요, 정확도 90%+
```

### 4.2 시나리오 2: 코드 리뷰

```
/pragmatic-code-review 실행 시:

[병렬 에이전트 구성]
┌─────────────────────────────────────────┐
│           Supervisor Agent              │
│      (리뷰 범위 분석 및 할당)            │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┼────────────┬────────────┐
    ▼            ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│Security│  │ Logic  │  │ Style  │  │  Perf  │
│Reviewer│  │Reviewer│  │Reviewer│  │Reviewer│
└────┬───┘  └────┬───┘  └────┬───┘  └────┬───┘
     │           │           │           │
     └───────────┴───────────┴───────────┘
                 │
                 ▼
         ┌───────────────┐
         │  Aggregator   │
         │(종합 리포트)   │
         └───────────────┘
```

### 4.3 시나리오 3: 전체 Phase 검증

```python
# Phase 2 병렬 검증
async def validate_phase_2_parallel():
    validators = [
        ("unit", "pytest tests/unit -v"),
        ("integration", "pytest tests/integration -v"),
        ("security", "bandit -r src/"),
        ("lint", "ruff check src/"),
    ]

    results = await asyncio.gather(*[
        run_validator(name, cmd) for name, cmd in validators
    ])

    return all(r.success for r in results)
```

---

## 5. 성능 최적화

### 5.1 컨텍스트 관리

| 전략 | 설명 | 적용 |
|------|------|------|
| **컨텍스트 격리** | 각 서브에이전트 독립 윈도우 | Claude Agent SDK 기본값 |
| **결과만 반환** | 전체 컨텍스트 대신 요약만 전달 | 토큰 70% 절감 |
| **선택적 공유** | 필요한 상태만 공유 | LangGraph `channels` |

### 5.2 비용 최적화

```python
# 모델 티어링 전략
AGENT_MODEL_TIERS = {
    "supervisor": "claude-opus-4",      # 복잡한 의사결정
    "researcher": "claude-sonnet-4",     # 일반 태스크
    "validator": "claude-haiku-3",       # 간단한 검증
}
```

### 5.3 에러 핸들링

```python
# LangGraph 에러 복구
builder.add_conditional_edges(
    "subagent",
    lambda state: "retry" if state["error_count"] < 3 else "fallback",
    {
        "retry": "subagent",
        "fallback": "single_agent_fallback",
    }
)
```

---

## 6. 구현 로드맵

### Phase 1: 기반 구축 (1주)
- [ ] 의존성 설치 및 환경 설정
- [ ] 기본 LangGraph 워크플로우 구현
- [ ] Claude Agent SDK 서브에이전트 테스트

### Phase 2: 통합 (1주)
- [ ] 기존 slash command와 통합
- [ ] `/issue` 커맨드 병렬화
- [ ] Phase 검증 스크립트 병렬화

### Phase 3: 최적화 (1주)
- [ ] 성능 벤치마크
- [ ] 비용 최적화 적용
- [ ] 문서화 및 가이드 작성

---

## 7. 참고 자료

### 공식 문서
- [Claude Agent SDK Overview](https://docs.claude.com/en/api/agent-sdk/overview)
- [Anthropic - Building Agents](https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk)
- [Anthropic - Multi-Agent Research System](https://www.anthropic.com/engineering/multi-agent-research-system)
- [LangGraph Multi-Agent Workflows](https://blog.langchain.com/langgraph-multi-agent-workflows/)

### 튜토리얼
- [LangGraph Parallel Execution](https://medium.com/@vin4tech/parallel-execution-in-langgraph-350d8ca4cfa8)
- [DataCamp - Claude Agent SDK Tutorial](https://www.datacamp.com/tutorial/how-to-use-claude-agent-sdk)
- [Building Your Own AI Engineer with LangGraph](https://neurons-lab.com/article/building-your-own-ai-engineer/)

### GitHub 레포지토리
- [langchain-ai/langgraph](https://github.com/langchain-ai/langgraph)
- [anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)
- [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents)

---

## 8. 결론

**Claude Agent SDK + LangGraph** 조합은:

1. **최적의 병렬화**: LangGraph의 그래프 기반 워크플로우로 명시적 병렬 실행
2. **컨텍스트 효율성**: Claude Agent SDK의 격리된 서브에이전트로 토큰 절감
3. **프로덕션 레디**: 두 기술 모두 프로덕션 검증됨
4. **기존 시스템 통합**: 현재 claude01 워크플로우와 자연스럽게 통합

**예상 효과**:
- 복잡 작업 처리 시간 **70% 단축**
- 멀티 에이전트 정확도 **90%+ 달성**
- 토큰 비용 **30-50% 절감** (컨텍스트 격리)

---

*문서 끝*
