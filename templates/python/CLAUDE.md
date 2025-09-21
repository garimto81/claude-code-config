# Python 프로젝트 설정

## 프로젝트 특화 설정
- **언어**: Python
- **버전**: Python 3.8+ 권장
- **패키지 매니저**: pip/poetry/pipenv 자동 감지

## 필수 도구
- Python 3.8+
- pip/poetry/pipenv
- Black (코드 포매터)
- pylint/flake8 (린터)
- mypy (타입 체커)

## 코딩 표준
```yaml
formatting:
  - Black 포매터 사용
  - PEP 8 스타일 가이드 준수
  - 4-space 들여쓰기
linting:
  - pylint/flake8 규칙 적용
  - mypy 타입 힌트 검사
testing:
  - pytest 단위 테스트
  - 최소 80% 커버리지
  - doctest 사용 권장
```

## 표준 명령어
```bash
python -m venv venv     # 가상환경 생성
source venv/bin/activate # 가상환경 활성화
pip install -e .        # 개발 모드 설치
pytest                  # 테스트 실행
black .                 # 코드 포매팅
pylint src/             # 린팅 검사
mypy src/              # 타입 검사
```

## 보안 고려사항
- requirements.txt 버전 고정
- bandit 보안 스캐너 사용
- .env 파일 gitignore 추가
- 의존성 취약점 정기 검사