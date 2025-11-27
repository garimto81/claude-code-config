"""리포트 생성기 테스트

Issue #11: 상세 스캔 리포트 생성기 구현 (FR-005)
"""

import pytest
import json
import tempfile
import os
from datetime import datetime

from archive_analyzer.database import Database, FileRecord, MediaInfoRecord
from archive_analyzer.report_generator import (
    ReportGenerator,
    ReportFormatter,
    ArchiveReport,
    FileTypeStats,
    ResolutionStats,
    CodecStats,
    ContainerStats,
    FolderStats,
    DurationStats,
    BitrateStats,
    StreamingCompatibility,
    QualityIssues,
)


@pytest.fixture
def temp_db():
    """테스트용 임시 데이터베이스"""
    fd, path = tempfile.mkstemp(suffix=".db")
    os.close(fd)

    db = Database(path)
    yield db

    db.close()
    os.unlink(path)


@pytest.fixture
def populated_db(temp_db):
    """테스트 데이터가 채워진 데이터베이스"""
    # 파일 레코드 추가
    files = [
        FileRecord(path="/archive/movie1.mp4", filename="movie1.mp4", extension=".mp4",
                   size_bytes=5_000_000_000, file_type="video", parent_folder="/archive"),
        FileRecord(path="/archive/movie2.mkv", filename="movie2.mkv", extension=".mkv",
                   size_bytes=8_000_000_000, file_type="video", parent_folder="/archive"),
        FileRecord(path="/archive/show1.mp4", filename="show1.mp4", extension=".mp4",
                   size_bytes=2_000_000_000, file_type="video", parent_folder="/archive/shows"),
        FileRecord(path="/archive/audio1.mp3", filename="audio1.mp3", extension=".mp3",
                   size_bytes=10_000_000, file_type="audio", parent_folder="/archive"),
        FileRecord(path="/archive/sub1.srt", filename="sub1.srt", extension=".srt",
                   size_bytes=50_000, file_type="subtitle", parent_folder="/archive"),
        FileRecord(path="/archive/thumb.jpg", filename="thumb.jpg", extension=".jpg",
                   size_bytes=500_000, file_type="image", parent_folder="/archive"),
        FileRecord(path="/archive/info.nfo", filename="info.nfo", extension=".nfo",
                   size_bytes=5_000, file_type="metadata", parent_folder="/archive"),
        FileRecord(path="/archive/unknown.xyz", filename="unknown.xyz", extension=".xyz",
                   size_bytes=1_000, file_type="other", parent_folder="/archive"),
    ]

    for file in files:
        temp_db.insert_file(file)

    # 미디어 정보 추가
    from archive_analyzer.media_extractor import MediaInfo

    media_infos = [
        MediaInfo(file_id=1, file_path="/archive/movie1.mp4",
                  video_codec="h264", width=1920, height=1080, framerate=24.0,
                  audio_codec="aac", audio_channels=2, audio_sample_rate=48000,
                  duration_seconds=7200, bitrate=8_000_000,
                  container_format="mp4", has_video=True, has_audio=True,
                  video_stream_count=1, audio_stream_count=1,
                  extraction_status="success"),
        MediaInfo(file_id=2, file_path="/archive/movie2.mkv",
                  video_codec="hevc", width=3840, height=2160, framerate=30.0,
                  audio_codec="ac3", audio_channels=6, audio_sample_rate=48000,
                  duration_seconds=5400, bitrate=25_000_000,
                  container_format="matroska", has_video=True, has_audio=True,
                  video_stream_count=1, audio_stream_count=1,
                  extraction_status="success"),
        MediaInfo(file_id=3, file_path="/archive/show1.mp4",
                  video_codec="h264", width=1280, height=720, framerate=25.0,
                  audio_codec="aac", audio_channels=2, audio_sample_rate=44100,
                  duration_seconds=1800, bitrate=4_000_000,
                  container_format="mp4", has_video=True, has_audio=True,
                  video_stream_count=1, audio_stream_count=1,
                  extraction_status="success"),
    ]

    for info in media_infos:
        temp_db.insert_media_info(info)

    return temp_db


class TestFileTypeStats:
    """FileTypeStats 테스트"""

    def test_size_formatted_tb(self):
        stats = FileTypeStats(file_type="video", total_size=2_000_000_000_000)
        assert "TB" in stats.size_formatted

    def test_size_formatted_gb(self):
        stats = FileTypeStats(file_type="video", total_size=5_000_000_000)
        assert "GB" in stats.size_formatted

    def test_size_formatted_mb(self):
        stats = FileTypeStats(file_type="audio", total_size=50_000_000)
        assert "MB" in stats.size_formatted

    def test_size_gb_property(self):
        stats = FileTypeStats(file_type="video", total_size=1073741824)  # 1 GB
        assert stats.size_gb == pytest.approx(1.0, rel=0.01)


class TestResolutionStats:
    """ResolutionStats 테스트"""

    def test_creation(self):
        stats = ResolutionStats(resolution="1080p (FHD)", count=100, percentage=50.0)
        assert stats.resolution == "1080p (FHD)"
        assert stats.count == 100
        assert stats.percentage == 50.0


class TestArchiveReport:
    """ArchiveReport 테스트"""

    def test_total_size_formatted(self):
        report = ArchiveReport(total_size=18_000_000_000_000)  # 18 TB
        assert "TB" in report.total_size_formatted

    def test_to_dict(self):
        report = ArchiveReport(
            report_date="2025-11-27",
            total_files=100,
            total_size=1_000_000_000,
        )
        result = report.to_dict()

        assert result['report_date'] == "2025-11-27"
        assert result['summary']['total_files'] == 100
        assert result['summary']['total_size'] == 1_000_000_000

    def test_to_dict_with_stats(self):
        report = ArchiveReport()
        report.file_type_stats = [
            FileTypeStats(file_type="video", count=50, total_size=5_000_000_000)
        ]
        report.resolution_stats = [
            ResolutionStats(resolution="1080p", count=30, percentage=60.0)
        ]

        result = report.to_dict()

        assert len(result['file_type_stats']) == 1
        assert len(result['resolution_stats']) == 1


class TestReportGenerator:
    """ReportGenerator 테스트"""

    def test_generate_empty_db(self, temp_db):
        generator = ReportGenerator(temp_db)
        report = generator.generate()

        assert report.total_files == 0
        assert report.total_size == 0
        assert report.total_videos == 0

    def test_generate_with_files(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate(archive_path="/archive")

        assert report.total_files == 8
        assert report.total_videos == 3
        assert report.archive_path == "/archive"

    def test_file_type_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # 비디오 통계 확인
        video_stats = next(
            (s for s in report.file_type_stats if s.file_type == "video"),
            None
        )
        assert video_stats is not None
        assert video_stats.count == 3

    def test_resolution_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # 4K, 1080p, 720p 각각 1개씩
        assert len(report.resolution_stats) >= 2

        # 4K 확인
        res_4k = next(
            (s for s in report.resolution_stats if "4K" in s.resolution),
            None
        )
        assert res_4k is not None
        assert res_4k.count == 1

    def test_codec_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # h264, hevc 코덱 확인
        codec_names = [s.codec for s in report.codec_stats]
        assert "h264" in codec_names
        assert "hevc" in codec_names

    def test_container_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # mp4, matroska 컨테이너 확인
        container_names = [s.container for s in report.container_stats]
        assert "mp4" in container_names

    def test_folder_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        assert len(report.folder_stats) > 0
        # /archive 폴더 확인
        archive_folder = next(
            (s for s in report.folder_stats if s.folder == "/archive"),
            None
        )
        assert archive_folder is not None

    def test_duration_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # 단편, 중편, 장편 카테고리 확인
        categories = [s.category for s in report.duration_stats]
        assert len(categories) == 3

    def test_bitrate_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        assert len(report.bitrate_stats) > 0

    def test_streaming_compatibility(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        compat = report.streaming_compatibility
        assert compat is not None
        # mp4/h264는 호환, mkv/hevc는 부분 호환
        assert compat.compatible_count >= 2

    def test_extension_breakdown(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        assert ".mp4" in report.extension_breakdown
        assert report.extension_breakdown[".mp4"]["count"] == 2

    def test_total_duration_hours(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # 7200 + 5400 + 1800 = 14400 seconds = 4 hours
        assert report.total_duration_hours == pytest.approx(4.0, rel=0.1)


class TestReportFormatter:
    """ReportFormatter 테스트"""

    def test_to_json(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        json_output = ReportFormatter.to_json(report)

        # JSON 파싱 가능 확인
        parsed = json.loads(json_output)
        assert "summary" in parsed
        assert "file_type_stats" in parsed

    def test_to_json_indent(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        # 인덴트 확인
        json_output = ReportFormatter.to_json(report, indent=4)
        assert "\n    " in json_output

    def test_to_markdown(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        md_output = ReportFormatter.to_markdown(report)

        # Markdown 형식 확인
        assert "# 아카이브 분석 리포트" in md_output
        assert "## 1. 전체 요약" in md_output
        assert "| 항목 | 값 |" in md_output

    def test_to_markdown_contains_stats(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        md_output = ReportFormatter.to_markdown(report)

        # 파일 유형 테이블 확인
        assert "## 2. 파일 유형별 통계" in md_output
        assert "video" in md_output

    def test_to_console(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        console_output = ReportFormatter.to_console(report)

        # 콘솔 형식 확인
        assert "아카이브 분석 리포트" in console_output
        assert "[전체 요약]" in console_output
        assert "=" * 60 in console_output

    def test_to_console_progress_bar(self, populated_db):
        generator = ReportGenerator(populated_db)
        report = generator.generate()

        console_output = ReportFormatter.to_console(report)

        # 진행 바 확인
        assert "█" in console_output or "░" in console_output


class TestQualityIssues:
    """QualityIssues 테스트"""

    def test_failed_extraction(self, temp_db):
        # 실패한 미디어 정보 추가
        temp_db.insert_file(FileRecord(
            path="/archive/broken.mp4", filename="broken.mp4",
            extension=".mp4", size_bytes=1000, file_type="video",
            parent_folder="/archive"
        ))

        from archive_analyzer.media_extractor import MediaInfo
        temp_db.insert_media_info(MediaInfo(
            file_id=1, file_path="/archive/broken.mp4",
            extraction_status="failed",
            extraction_error="Could not read file"
        ))

        generator = ReportGenerator(temp_db)
        report = generator.generate()

        issues = report.quality_issues
        assert issues is not None
        assert len(issues.failed_extraction) == 1
        assert issues.failed_extraction[0]['error'] == "Could not read file"


class TestStreamingCompatibility:
    """StreamingCompatibility 테스트"""

    def test_compatible_video(self, temp_db):
        # mp4/h264 (호환)
        temp_db.insert_file(FileRecord(
            path="/archive/compat.mp4", filename="compat.mp4",
            extension=".mp4", size_bytes=1000, file_type="video",
            parent_folder="/archive"
        ))

        from archive_analyzer.media_extractor import MediaInfo
        temp_db.insert_media_info(MediaInfo(
            file_id=1, file_path="/archive/compat.mp4",
            video_codec="h264", container_format="mp4",
            has_video=True, extraction_status="success"
        ))

        generator = ReportGenerator(temp_db)
        report = generator.generate()

        compat = report.streaming_compatibility
        assert compat.compatible_count == 1
        assert compat.needs_transcode == 0

    def test_needs_transcode(self, temp_db):
        # avi/mpeg4 (트랜스코딩 필요)
        temp_db.insert_file(FileRecord(
            path="/archive/old.avi", filename="old.avi",
            extension=".avi", size_bytes=1000, file_type="video",
            parent_folder="/archive"
        ))

        from archive_analyzer.media_extractor import MediaInfo
        temp_db.insert_media_info(MediaInfo(
            file_id=1, file_path="/archive/old.avi",
            video_codec="mpeg4", container_format="avi",
            has_video=True, extraction_status="success"
        ))

        generator = ReportGenerator(temp_db)
        report = generator.generate()

        compat = report.streaming_compatibility
        assert compat.needs_transcode == 1
        assert compat.compatible_count == 0


class TestIntegration:
    """통합 테스트"""

    def test_full_report_cycle(self, populated_db):
        """전체 리포트 생성 사이클 테스트"""
        generator = ReportGenerator(populated_db)
        report = generator.generate(archive_path="/test/archive")

        # JSON 변환
        json_output = ReportFormatter.to_json(report)
        parsed = json.loads(json_output)

        # Markdown 변환
        md_output = ReportFormatter.to_markdown(report)

        # Console 변환
        console_output = ReportFormatter.to_console(report)

        # 모든 출력에 기본 정보 포함 확인
        assert parsed['summary']['total_files'] == 8
        assert "8" in md_output or "8개" in md_output
        assert "8" in console_output

    def test_report_with_no_media_info(self, temp_db):
        """미디어 정보 없이 파일만 있는 경우"""
        temp_db.insert_file(FileRecord(
            path="/archive/video.mp4", filename="video.mp4",
            extension=".mp4", size_bytes=5_000_000_000,
            file_type="video", parent_folder="/archive"
        ))

        generator = ReportGenerator(temp_db)
        report = generator.generate()

        # 파일 통계는 있어야 함
        assert report.total_files == 1
        assert report.total_videos == 1

        # 해상도 통계는 비어있어야 함
        assert len(report.resolution_stats) == 0
