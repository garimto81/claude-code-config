#!/bin/bash
# Claude Code 시작 전 자동으로 전역 설정 동기화 및 변경사항 커밋

echo "🔄 전역 설정 업데이트 중..."

cd "$(dirname "$0")"

# CLAUDE.md 변경 전 내용 저장
BEFORE_HASH=""
if [ -f "CLAUDE.md" ]; then
    BEFORE_HASH=$(md5sum CLAUDE.md | awk '{print $1}')
fi

# Submodule 최신 버전 다운로드
git submodule update --remote --merge .claude-global

if [ $? -eq 0 ]; then
    echo "✅ 전역 설정 업데이트 완료!"
    echo "📚 CLAUDE.md: $(cat .claude-global/CLAUDE.md | head -1)"

    # CLAUDE.md 변경 후 내용 확인
    AFTER_HASH=""
    if [ -f "CLAUDE.md" ]; then
        AFTER_HASH=$(md5sum CLAUDE.md | awk '{print $1}')
    fi

    # 변경사항이 있으면 자동 커밋 & 푸시
    if [ "$BEFORE_HASH" != "$AFTER_HASH" ]; then
        echo "📝 CLAUDE.md 변경사항 감지"

        # 버전 정보 추출
        VERSION=$(grep "**버전**:" CLAUDE.md | sed -n 's/.*버전\*\*: \([^ ]*\).*/\1/p')

        # 변경사항 요약 생성
        CHANGES=$(git diff CLAUDE.md | grep "^+" | head -5 | sed 's/^+/  -/')

        # Git 상태 확인
        if git diff --quiet CLAUDE.md; then
            echo "ℹ️  커밋할 변경사항 없음"
        else
            # Stage CLAUDE.md
            git add CLAUDE.md

            # 커밋 메시지 생성
            COMMIT_MSG="chore: Sync to CLAUDE.md v${VERSION}"
            if [ ! -z "$CHANGES" ]; then
                COMMIT_MSG="${COMMIT_MSG}

주요 변경사항:
${CHANGES}"
            fi

            # 커밋 실행
            git commit -m "$COMMIT_MSG"

            if [ $? -eq 0 ]; then
                echo "✅ 커밋 완료: $COMMIT_MSG"

                # 푸시 (선택적)
                read -p "📤 GitHub에 푸시하시겠습니까? (y/n): " -n 1 -r
                echo
                if [[ $REPLY =~ ^[Yy]$ ]]; then
                    git push
                    if [ $? -eq 0 ]; then
                        echo "✅ 푸시 완료!"
                    else
                        echo "⚠️  푸시 실패"
                    fi
                else
                    echo "ℹ️  푸시 건너뜀 (나중에 'git push' 실행)"
                fi
            else
                echo "⚠️  커밋 실패"
            fi
        fi

        # 최적화 검토 제안
        echo ""
        echo "🔍 전역 지침 최적화 검토 권장사항:"
        LINES=$(wc -l < CLAUDE.md)
        if [ "$LINES" -gt 200 ]; then
            echo "  ⚠️  문서 길이: ${LINES}줄 (200줄 초과)"
            echo "  💡 불필요한 섹션 제거 고려"
        fi

        # 중복 키워드 검사
        DUPLICATES=$(grep -oE '\*\*[^*]+\*\*' CLAUDE.md | sort | uniq -d | wc -l)
        if [ "$DUPLICATES" -gt 5 ]; then
            echo "  ⚠️  중복 강조 항목: ${DUPLICATES}개"
            echo "  💡 중복 제거로 가독성 향상 가능"
        fi

        echo "  ✅ 상세 분석: python scripts/optimize_claude_md.py"
    else
        echo "ℹ️  CLAUDE.md 변경사항 없음"
    fi
else
    echo "⚠️  업데이트 실패 - 기존 버전 사용"
fi
