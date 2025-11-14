# Repository Workflow Analysis Prompt Template

## Context
You are analyzing a GitHub repository to evaluate its development workflow maturity, automation level, and alignment with best practices.

## Repository Information
- **Name**: {{ repo_name }}
- **Owner**: {{ owner }}
- **Description**: {{ description }}
- **Primary Language**: {{ language }}
- **Stars**: {{ stars }}
- **Last Updated**: {{ updated_at }}

## Available Data

### README Content
```
{{ readme_content }}
```

### GitHub Actions Workflows
{% for workflow in workflows %}
#### {{ workflow.name }}
- **File**: {{ workflow.path }}
- **Triggers**: {{ workflow.triggers }}
- **Jobs**: {{ workflow.jobs }}
{% endfor %}

### Repository Structure
```
{{ file_structure }}
```

## Analysis Tasks

### 1. Phase 0-6 Adoption Assessment
Evaluate the repository's adoption of the Phase 0-6 development methodology:
- Phase 0: Requirements documentation (PRD)
- Phase 0.5: Task breakdown and planning
- Phase 1: Code implementation
- Phase 2: Testing practices
- Phase 3: Version management
- Phase 4: Git workflow and automation
- Phase 5: End-to-end testing
- Phase 6: Deployment automation

### 2. Automation Level Analysis
Assess the level of automation:
- CI/CD pipeline maturity
- Automated testing coverage
- Code quality checks
- Deployment automation
- Documentation generation
- Release management

### 3. Workflow Pattern Identification
Identify key workflow patterns:
- Branching strategy
- PR review process
- Issue management
- Release cycle
- Documentation practices

### 4. Strengths and Weaknesses
List the repository's:
- **Strengths**: What the repository does well
- **Weaknesses**: Areas needing improvement
- **Opportunities**: Quick wins and potential enhancements

### 5. Improvement Recommendations
Provide specific, actionable recommendations:
- Priority 1 (Quick Wins): Improvements that can be implemented immediately
- Priority 2 (Medium-term): Enhancements requiring moderate effort
- Priority 3 (Long-term): Strategic improvements

## Output Format
Please provide your analysis in the following JSON structure:
```json
{
  "workflow_score": 0-100,
  "automation_level": "basic|intermediate|advanced",
  "phase_adoption": {
    "phase_0_prd": boolean,
    "phase_1_code": boolean,
    "phase_2_test": boolean,
    "phase_3_version": boolean,
    "phase_4_git": boolean,
    "phase_5_e2e": boolean,
    "phase_6_deploy": boolean
  },
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "recommendations": [
    {
      "priority": 1,
      "title": "Recommendation title",
      "description": "Detailed description",
      "expected_impact": "high|medium|low"
    }
  ],
  "automation_patterns": {
    "ci_cd": "description",
    "testing": "description",
    "deployment": "description"
  },
  "notable_features": ["feature1", "feature2", ...],
  "overall_assessment": "Brief summary of the repository's workflow maturity"
}
```