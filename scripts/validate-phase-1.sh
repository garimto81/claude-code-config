#!/bin/bash
# Phase 1 검증: 1:1 테스트 페어링 확인
# Based on cc-sdd validation system (MIT License)
# Enforces 1:1 test file pairing rule from claude01 workflow

set -e

echo "🔍 Phase 1 검증 시작: 1:1 테스트 페어링 체크"

# Python 파일 체크
if [ -d "src" ]; then
  PYTHON_FILES=$(find src -name "*.py" ! -name "__init__.py" 2>/dev/null || true)

  for src_file in $PYTHON_FILES; do
    # src/module/file.py → tests/test_file.py
    base_name=$(basename "$src_file")
    test_file="tests/test_${base_name}"

    if [ ! -f "$test_file" ]; then
      echo "❌ 테스트 파일 없음:"
      echo "   구현: $src_file"
      echo "   필요: $test_file"
      exit 1
    fi
  done

  if [ -n "$PYTHON_FILES" ]; then
    PY_COUNT=$(echo "$PYTHON_FILES" | wc -l)
    echo "✅ Python 파일 검증 완료: ${PY_COUNT}개"
  fi
fi

# JavaScript/TypeScript 파일 체크
if [ -d "src" ]; then
  JS_FILES=$(find src -name "*.js" -o -name "*.ts" ! -name "*.d.ts" 2>/dev/null || true)

  for src_file in $JS_FILES; do
    base_name=$(basename "$src_file" .js)
    base_name=$(basename "$base_name" .ts)

    # src/file.js → tests/file.test.js
    test_file="tests/${base_name}.test.js"
    test_file_ts="tests/${base_name}.test.ts"

    if [ ! -f "$test_file" ] && [ ! -f "$test_file_ts" ]; then
      echo "❌ 테스트 파일 없음:"
      echo "   구현: $src_file"
      echo "   필요: $test_file 또는 $test_file_ts"
      exit 1
    fi
  done

  if [ -n "$JS_FILES" ]; then
    JS_COUNT=$(echo "$JS_FILES" | wc -l)
    echo "✅ JavaScript/TypeScript 파일 검증 완료: ${JS_COUNT}개"
  fi
fi

# 테스트 파일이 없으면 경고
if [ ! -d "tests" ]; then
  echo "⚠️  tests/ 폴더 없음 - 테스트 작성 시작 필요"
  exit 0
fi

# 테스트 실행 (선택)
if [ "$RUN_TESTS" = "true" ]; then
  echo ""
  echo "🧪 테스트 실행 중..."

  if [ -f "pytest.ini" ]; then
    pytest tests/ -v
  elif [ -f "package.json" ] && grep -q '"test"' package.json; then
    npm test
  fi
fi

echo ""
echo "✅ Phase 1 검증 통과: 1:1 테스트 페어링 준수"
exit 0
