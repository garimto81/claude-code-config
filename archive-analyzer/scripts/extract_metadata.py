#!/usr/bin/env python
"""미디어 메타데이터 추출 스크립트

NAS 아카이브의 비디오 파일에서 메타데이터를 추출하여 데이터베이스에 저장합니다.
Issue #8: 미디어 메타데이터 추출기 구현 (FR-002)
"""

import sys
import os
from pathlib import Path

# Windows 콘솔 UTF-8 설정
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# 프로젝트 경로 추가
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from archive_analyzer.config import SMBConfig
from archive_analyzer.smb_connector import SMBConnector
from archive_analyzer.database import Database
from archive_analyzer.media_extractor import SMBMediaExtractor, ExtractionProgress


# 설정
SERVER = "10.10.100.122"
SHARE = "docker"
USERNAME = "GGP"
PASSWORD = os.getenv("SMB_PASSWORD", "!@QW12qw")
ARCHIVE_PATH = "GGPNAs/ARCHIVE"
DB_PATH = "archive.db"


def progress_callback(progress: ExtractionProgress):
    """진행률 출력"""
    bar_width = 30
    filled = int(bar_width * progress.percentage / 100)
    bar = "█" * filled + "░" * (bar_width - filled)

    print(
        f"\r[{bar}] {progress.percentage:5.1f}% | "
        f"{progress.processed_files}/{progress.total_files} | "
        f"OK: {progress.successful}, Fail: {progress.failed} | "
        f"{progress.files_per_second:.1f} f/s",
        end="",
        flush=True
    )


def main():
    print("=" * 60)
    print("Media Metadata Extractor")
    print("=" * 60)
    print(f"Server: {SERVER}")
    print(f"Share: {SHARE}")
    print(f"Archive: {ARCHIVE_PATH}")
    print(f"Database: {DB_PATH}")
    print()

    # SMB 연결
    config = SMBConfig(
        server=SERVER,
        share=SHARE,
        username=USERNAME,
        password=PASSWORD,
    )

    connector = SMBConnector(config)
    database = Database(DB_PATH)

    try:
        print("Connecting to SMB server...")
        connector.connect()
        print("Connected!")
        print()

        # 비디오 파일 목록 조회
        video_files = database.get_files_by_type("video", limit=100000)
        print(f"Found {len(video_files)} video files in database")
        print()

        if not video_files:
            print("No video files found. Please run scan first.")
            return

        # SMB 메타데이터 추출기 생성
        extractor = SMBMediaExtractor(connector)

        # 샘플 테스트 (처음 5개 파일만)
        print("Testing with first 5 video files...")
        print("-" * 60)

        successful = 0
        failed = 0

        for i, file_record in enumerate(video_files[:5]):
            print(f"\n[{i+1}/5] {file_record.filename}")
            print(f"    Path: {file_record.path}")
            print(f"    Size: {file_record.size_bytes / (1024**3):.2f} GB")

            try:
                info = extractor.extract(file_record.path, file_id=file_record.id)

                if info.extraction_status == "success":
                    successful += 1
                    print(f"    Status: SUCCESS")
                    print(f"    Container: {info.container_format}")
                    print(f"    Video: {info.video_codec} {info.resolution} @ {info.framerate} fps")
                    print(f"    Audio: {info.audio_codec} {info.audio_channels}ch @ {info.audio_sample_rate} Hz")
                    print(f"    Duration: {info.duration_formatted}")
                    print(f"    Bitrate: {info.bitrate / 1000000:.2f} Mbps" if info.bitrate else "    Bitrate: N/A")

                    # 데이터베이스 저장
                    database.insert_media_info(info)
                else:
                    failed += 1
                    print(f"    Status: FAILED")
                    print(f"    Error: {info.extraction_error}")

            except Exception as e:
                failed += 1
                print(f"    Status: ERROR")
                print(f"    Exception: {e}")

        print()
        print("-" * 60)
        print(f"Test completed: {successful} successful, {failed} failed")
        print()

        # DB 통계 확인
        media_stats = database.get_media_statistics()
        print("Database Media Statistics:")
        print(f"  Total extracted: {media_stats['total']}")
        print(f"  Successful: {media_stats['successful']}")
        print(f"  Failed: {media_stats['failed']}")

        if media_stats['by_resolution']:
            print("  By Resolution:")
            for res, count in sorted(media_stats['by_resolution'].items()):
                print(f"    {res}: {count}")

        if media_stats['by_codec']:
            print("  By Codec:")
            for codec, count in sorted(media_stats['by_codec'].items()):
                print(f"    {codec}: {count}")

        if media_stats['total_duration_seconds'] > 0:
            hours = media_stats['total_duration_seconds'] / 3600
            print(f"  Total Duration: {hours:.1f} hours")

    except KeyboardInterrupt:
        print("\n\nExtraction interrupted by user")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        connector.disconnect()
        database.close()
        print()
        print("Done.")


if __name__ == "__main__":
    main()
