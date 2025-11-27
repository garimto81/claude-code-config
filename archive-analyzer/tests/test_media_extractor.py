"""미디어 메타데이터 추출기 테스트

Issue #8: 미디어 메타데이터 추출기 구현 (FR-002)
"""

import os
import sys
import tempfile
import pytest
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock

sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from archive_analyzer.media_extractor import (
    MediaInfo,
    FFprobeExtractor,
    SMBMediaExtractor,
    MediaMetadataExtractor,
    ExtractionProgress,
    extract_media_info,
)
from archive_analyzer.database import Database, MediaInfoRecord


class TestMediaInfo:
    """MediaInfo 데이터클래스 테스트"""

    def test_resolution_property(self):
        """해상도 문자열 테스트"""
        info = MediaInfo(width=1920, height=1080)
        assert info.resolution == "1920x1080"

    def test_resolution_none(self):
        """해상도 없을 때"""
        info = MediaInfo()
        assert info.resolution is None

    def test_resolution_label_4k(self):
        """4K 해상도 라벨"""
        info = MediaInfo(height=2160)
        assert info.resolution_label == "4K"

    def test_resolution_label_1080p(self):
        """1080p 해상도 라벨"""
        info = MediaInfo(height=1080)
        assert info.resolution_label == "1080p"

    def test_resolution_label_720p(self):
        """720p 해상도 라벨"""
        info = MediaInfo(height=720)
        assert info.resolution_label == "720p"

    def test_resolution_label_480p(self):
        """480p 해상도 라벨"""
        info = MediaInfo(height=480)
        assert info.resolution_label == "480p"

    def test_resolution_label_other(self):
        """기타 해상도 라벨"""
        info = MediaInfo(height=360)
        assert info.resolution_label == "360p"

    def test_duration_formatted(self):
        """재생 시간 포맷"""
        info = MediaInfo(duration_seconds=3661.5)  # 1시간 1분 1초
        assert info.duration_formatted == "01:01:01"

    def test_duration_formatted_none(self):
        """재생 시간 없을 때"""
        info = MediaInfo()
        assert info.duration_formatted is None

    def test_to_dict(self):
        """딕셔너리 변환"""
        info = MediaInfo(
            width=1920,
            height=1080,
            video_codec="h264",
            duration_seconds=120.0,
        )
        d = info.to_dict()
        assert d['resolution'] == "1920x1080"
        assert d['resolution_label'] == "1080p"
        assert d['video_codec'] == "h264"


class TestFFprobeExtractor:
    """FFprobe 추출기 테스트"""

    def test_init_success(self):
        """FFprobe 초기화 성공"""
        extractor = FFprobeExtractor()
        assert extractor.ffprobe_path == "ffprobe"

    def test_init_custom_path(self):
        """커스텀 FFprobe 경로"""
        with pytest.raises(RuntimeError):
            FFprobeExtractor(ffprobe_path="nonexistent_ffprobe")

    @patch('subprocess.run')
    def test_extract_success(self, mock_run):
        """메타데이터 추출 성공"""
        mock_run.return_value = Mock(
            returncode=0,
            stdout='{"format": {"duration": "120.5", "bit_rate": "5000000", "format_name": "mp4"}, "streams": []}',
            stderr=''
        )

        with patch.object(FFprobeExtractor, '_verify_ffprobe'):
            extractor = FFprobeExtractor()
            info = extractor.extract("test.mp4")

            assert info.extraction_status == "success"
            assert info.duration_seconds == 120.5
            assert info.bitrate == 5000000
            assert info.container_format == "mp4"

    @patch('subprocess.run')
    def test_extract_with_video_stream(self, mock_run):
        """비디오 스트림 추출"""
        mock_run.return_value = Mock(
            returncode=0,
            stdout='''{
                "format": {"duration": "60", "format_name": "mkv"},
                "streams": [{
                    "codec_type": "video",
                    "codec_name": "h264",
                    "codec_long_name": "H.264 / AVC",
                    "width": 1920,
                    "height": 1080,
                    "r_frame_rate": "30/1"
                }]
            }''',
            stderr=''
        )

        with patch.object(FFprobeExtractor, '_verify_ffprobe'):
            extractor = FFprobeExtractor()
            info = extractor.extract("test.mkv")

            assert info.has_video is True
            assert info.video_codec == "h264"
            assert info.width == 1920
            assert info.height == 1080
            assert info.framerate == 30.0

    @patch('subprocess.run')
    def test_extract_with_audio_stream(self, mock_run):
        """오디오 스트림 추출"""
        mock_run.return_value = Mock(
            returncode=0,
            stdout='''{
                "format": {"format_name": "mp4"},
                "streams": [{
                    "codec_type": "audio",
                    "codec_name": "aac",
                    "channels": 2,
                    "sample_rate": "48000"
                }]
            }''',
            stderr=''
        )

        with patch.object(FFprobeExtractor, '_verify_ffprobe'):
            extractor = FFprobeExtractor()
            info = extractor.extract("test.mp4")

            assert info.has_audio is True
            assert info.audio_codec == "aac"
            assert info.audio_channels == 2
            assert info.audio_sample_rate == 48000

    @patch('subprocess.run')
    def test_extract_failure(self, mock_run):
        """추출 실패"""
        mock_run.return_value = Mock(
            returncode=1,
            stdout='',
            stderr='File not found'
        )

        with patch.object(FFprobeExtractor, '_verify_ffprobe'):
            extractor = FFprobeExtractor()
            info = extractor.extract("nonexistent.mp4")

            assert info.extraction_status == "failed"
            assert "File not found" in info.extraction_error


class TestExtractionProgress:
    """추출 진행률 테스트"""

    def test_percentage(self):
        """진행률 계산"""
        progress = ExtractionProgress(
            total_files=100,
            processed_files=50,
            successful=45,
            failed=5,
            current_file="test.mp4",
            files_per_second=10.0,
            estimated_remaining=5.0,
        )
        assert progress.percentage == 50.0

    def test_percentage_zero_total(self):
        """총 파일 0개일 때"""
        progress = ExtractionProgress(
            total_files=0,
            processed_files=0,
            successful=0,
            failed=0,
            current_file="",
            files_per_second=0,
            estimated_remaining=0,
        )
        assert progress.percentage == 0.0

    def test_str_output(self):
        """문자열 출력"""
        progress = ExtractionProgress(
            total_files=100,
            processed_files=50,
            successful=45,
            failed=5,
            current_file="test.mp4",
            files_per_second=10.0,
            estimated_remaining=5.0,
        )
        s = str(progress)
        assert "50.0%" in s
        assert "50/100" in s
        assert "OK: 45" in s
        assert "Fail: 5" in s


class TestDatabaseMediaInfo:
    """데이터베이스 미디어 정보 테스트"""

    @pytest.fixture
    def db(self):
        """임시 데이터베이스"""
        with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
            db_path = f.name

        db = Database(db_path)
        yield db
        db.close()
        os.unlink(db_path)

    def test_insert_media_info(self, db):
        """미디어 정보 삽입"""
        info = MediaInfo(
            file_id=1,
            file_path="/test/video.mp4",
            video_codec="h264",
            width=1920,
            height=1080,
            duration_seconds=120.5,
            extraction_status="success",
        )

        record_id = db.insert_media_info(info)
        assert record_id > 0

    def test_get_media_info_by_file_id(self, db):
        """파일 ID로 미디어 정보 조회"""
        info = MediaInfo(
            file_id=42,
            file_path="/test/movie.mkv",
            video_codec="hevc",
            width=3840,
            height=2160,
            duration_seconds=7200.0,
            has_video=True,
            has_audio=True,
            extraction_status="success",
        )
        db.insert_media_info(info)

        found = db.get_media_info_by_file_id(42)
        assert found is not None
        assert found.video_codec == "hevc"
        assert found.width == 3840
        assert found.height == 2160
        assert found.resolution_label == "4K"

    def test_has_media_info(self, db):
        """미디어 정보 존재 확인"""
        info = MediaInfo(
            file_id=100,
            extraction_status="success",
        )
        db.insert_media_info(info)

        assert db.has_media_info(100) is True
        assert db.has_media_info(999) is False

    def test_has_media_info_failed_status(self, db):
        """실패 상태 미디어 정보"""
        info = MediaInfo(
            file_id=200,
            extraction_status="failed",
        )
        db.insert_media_info(info)

        # 실패 상태는 has_media_info에서 False 반환
        assert db.has_media_info(200) is False

    def test_get_media_info_count(self, db):
        """미디어 정보 수 조회"""
        for i in range(5):
            db.insert_media_info(MediaInfo(
                file_id=i,
                extraction_status="success" if i < 3 else "failed",
            ))

        assert db.get_media_info_count() == 5
        assert db.get_media_info_count("success") == 3
        assert db.get_media_info_count("failed") == 2

    def test_get_media_statistics(self, db):
        """미디어 통계 조회"""
        # 1080p h264
        db.insert_media_info(MediaInfo(
            file_id=1,
            video_codec="h264",
            height=1080,
            duration_seconds=3600,
            extraction_status="success",
        ))
        # 4K hevc
        db.insert_media_info(MediaInfo(
            file_id=2,
            video_codec="hevc",
            height=2160,
            duration_seconds=7200,
            extraction_status="success",
        ))
        # 실패
        db.insert_media_info(MediaInfo(
            file_id=3,
            extraction_status="failed",
        ))

        stats = db.get_media_statistics()

        assert stats['total'] == 3
        assert stats['successful'] == 2
        assert stats['failed'] == 1
        assert stats['by_resolution']['1080p'] == 1
        assert stats['by_resolution']['4K'] == 1
        assert stats['by_codec']['h264'] == 1
        assert stats['by_codec']['hevc'] == 1
        assert stats['total_duration_seconds'] == 10800


class TestMediaInfoRecord:
    """MediaInfoRecord 테스트"""

    def test_resolution(self):
        """해상도 속성"""
        record = MediaInfoRecord(width=1920, height=1080)
        assert record.resolution == "1920x1080"

    def test_resolution_label(self):
        """해상도 라벨 속성"""
        record = MediaInfoRecord(height=1080)
        assert record.resolution_label == "1080p"


# 통합 테스트 (실제 SMB 연결 필요)
TEST_SERVER = "10.10.100.122"
TEST_SHARE = "docker"
TEST_USERNAME = "GGP"
TEST_PASSWORD = os.getenv("SMB_PASSWORD", "!@QW12qw")
TEST_ARCHIVE_PATH = "GGPNAs/ARCHIVE"


@pytest.mark.integration
class TestSMBMediaExtractor:
    """SMB 미디어 추출기 통합 테스트"""

    @pytest.fixture
    def smb_connector(self):
        """SMB 커넥터"""
        from archive_analyzer.smb_connector import SMBConnector
        from archive_analyzer.config import SMBConfig

        config = SMBConfig(
            server=TEST_SERVER,
            share=TEST_SHARE,
            username=TEST_USERNAME,
            password=TEST_PASSWORD,
        )
        connector = SMBConnector(config)
        yield connector
        if connector.is_connected:
            connector.disconnect()

    def test_extract_from_smb(self, smb_connector):
        """SMB 파일에서 메타데이터 추출"""
        extractor = SMBMediaExtractor(smb_connector)

        # 실제 비디오 파일 경로 필요
        # result = extractor.extract("GGPNAs/ARCHIVE/somefile.mp4")
        # assert result.extraction_status == "success"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-m", "not integration"])
