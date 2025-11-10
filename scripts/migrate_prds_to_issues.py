#!/usr/bin/env python3
"""
Migrate local PRD markdown files to GitHub issues
Usage: python scripts/migrate_prds_to_issues.py tasks/prds/*.md
"""

import os
import sys
import re
from pathlib import Path
from github import Github

def parse_prd(file_path):
    """Parse PRD markdown file and extract metadata"""
    with open(file_path, encoding='utf-8') as f:
        content = f.read()

    lines = content.split('\n')

    # Extract title (first heading)
    title = None
    for line in lines:
        if line.startswith('#'):
            title = line.replace('#', '').strip()
            break

    if not title:
        title = Path(file_path).stem

    # Extract priority from content
    priority_match = re.search(r'우선순위.*?P(\d)', content, re.IGNORECASE)
    priority = f"priority:p{priority_match.group(1)}" if priority_match else "priority:p2"

    # Extract status
    status_match = re.search(r'상태.*?(완료|진행|계획)', content)
    if status_match:
        status_map = {
            '완료': 'phase-6',
            '진행': 'phase-1',
            '계획': 'phase-0'
        }
        phase = status_map.get(status_match.group(1), 'phase-0')
    else:
        phase = 'phase-0'

    # Determine type
    if '[BUG]' in title or '버그' in title:
        issue_type = 'type:bug'
    elif '[FEATURE]' in title or '기능' in title:
        issue_type = 'type:feature'
    else:
        issue_type = 'type:feature'

    return {
        'title': title,
        'body': content,
        'labels': [phase, issue_type, priority, 'migrated-from-local']
    }

def main():
    github_token = os.getenv('GITHUB_TOKEN')
    repo_name = os.getenv('GITHUB_REPOSITORY')

    if not github_token:
        print("❌ GITHUB_TOKEN environment variable not set")
        print("Set it with: export GITHUB_TOKEN=<your-token>")
        sys.exit(1)

    if not repo_name:
        print("❌ GITHUB_REPOSITORY environment variable not set")
        print("Set it with: export GITHUB_REPOSITORY=owner/repo")
        sys.exit(1)

    g = Github(github_token)

    try:
        repo = g.get_repo(repo_name)
    except Exception as e:
        print(f"❌ Could not access repository: {e}")
        sys.exit(1)

    if len(sys.argv) < 2:
        print("Usage: python scripts/migrate_prds_to_issues.py tasks/prds/*.md")
        sys.exit(1)

    for prd_file in sys.argv[1:]:
        if not os.path.exists(prd_file):
            print(f"⚠️  File not found: {prd_file}")
            continue

        try:
            prd = parse_prd(prd_file)

            issue = repo.create_issue(
                title=prd['title'],
                body=prd['body'],
                labels=prd['labels']
            )

            print(f"✅ Created issue #{issue.number}: {prd['title']}")
            print(f"   URL: {issue.html_url}")
            print(f"   Labels: {', '.join(prd['labels'])}")
            print()

        except Exception as e:
            print(f"❌ Error processing {prd_file}: {e}")

if __name__ == '__main__':
    main()
