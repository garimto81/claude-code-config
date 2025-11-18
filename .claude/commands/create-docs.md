---
name: create-docs
description: Analyze code structure to create comprehensive documentation
---

# /create-docs - Automatic Documentation Generator

Analyze code structure and create comprehensive documentation with examples.

## Usage

```
/create-docs [path] [--format=markdown|html|sphinx]
```

Default format: `markdown`

## Documentation Types

### 1. API Documentation

**For Functions/Methods**:
```markdown
## `login(email: str, password: str) -> User`

Authenticates user with email and password.

### Parameters
- `email` (str): User email address
- `password` (str): Plain text password

### Returns
- `User`: Authenticated user object

### Raises
- `AuthenticationError`: Invalid credentials
- `AccountLocked`: Too many failed attempts

### Example
```python
user = login("test@example.com", "password123")
print(f"Logged in as {user.name}")
```

### Edge Cases
- Empty email/password → raises ValueError
- Non-existent user → raises AuthenticationError
- Account locked → raises AccountLocked (retry after 10min)
```

### 2. Class Documentation

```markdown
## Class: `UserManager`

Manages user accounts and authentication.

### Attributes
- `session`: Database session
- `cache`: Redis cache instance

### Methods
- `create_user()`: Create new user
- `authenticate()`: Verify credentials
- `reset_password()`: Send reset email

### Usage
```python
manager = UserManager(session=db.session)
user = manager.create_user(
    email="test@example.com",
    password="secure123"
)
```
```

### 3. Module Documentation

```markdown
# auth Module

User authentication and session management.

## Overview
Provides OAuth2 and email/password authentication with session handling.

## Quick Start
```python
from auth import login, logout

user = login("test@example.com", "password")
logout(user.session_id)
```

## Components
- `login()`: User authentication
- `logout()`: Session termination
- `UserManager`: User account management
- `SessionStore`: Session persistence
```

## Auto-Generated Content

### Inputs/Outputs Analysis
- Analyzes function signatures
- Extracts type hints
- Documents return values

### Edge Cases Detection
- None/null handling
- Empty strings/lists
- Boundary conditions
- Error scenarios

### Code Examples
- Basic usage
- Advanced patterns
- Error handling
- Integration examples

## Phase Integration

### Phase 0: Requirements
- Document PRD specifications
- Create architecture diagrams

### Phase 1: Implementation
- `/create-docs` for each module
- Keep docs synced with code

### Phase 3: Versioning
- Update docs with version changes
- Changelog integration

## Output Structure

```
docs/
├── api/
│   ├── auth.md
│   ├── users.md
│   └── sessions.md
├── guides/
│   ├── quickstart.md
│   ├── authentication.md
│   └── deployment.md
├── reference/
│   ├── configuration.md
│   └── environment.md
└── index.md
```

## Templates

### README Template
```markdown
# Project Name

Brief description

## Installation
\`\`\`bash
npm install
\`\`\`

## Quick Start
\`\`\`javascript
// Example code
\`\`\`

## Documentation
- [API Reference](docs/api/)
- [Guides](docs/guides/)

## License
MIT
```

### API Reference Template
- Function signature
- Description
- Parameters
- Returns
- Examples
- Edge cases

## Integration with Agents

- **code-documentation** plugin: Deep analysis
- **docs-architect**: Structure design
- **tutorial-engineer**: Guide creation

## Related

- `/changelog` - Update changelog
- `code-documentation` plugin
- Phase 1 documentation requirement
