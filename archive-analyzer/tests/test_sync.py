"""동기화 모듈 테스트

pokervod.db 동기화 서비스 테스트입니다.
"""

import pytest
import sqlite3
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

from archive_analyzer.sync import (
    SyncConfig,
    SyncResult,
    SyncService,
    SubcatalogMatch,
    generate_file_id,
    classify_path,
    classify_path_multilevel,
    local_to_nas,
    format_resolution,
)


class TestHelperFunctions:
    """헬퍼 함수 테스트"""

    def test_generate_file_id(self):
        """파일 ID 생성"""
        path1 = "//10.10.100.122/docker/test/file.mp4"
        path2 = "//10.10.100.122/docker/test/FILE.MP4"  # 대소문자 다름

        # 같은 경로는 같은 ID
        assert generate_file_id(path1) == generate_file_id(path1)

        # 대소문자 무시
        assert generate_file_id(path1) == generate_file_id(path2)

        # 다른 경로는 다른 ID
        path3 = "//10.10.100.122/docker/test/other.mp4"
        assert generate_file_id(path1) != generate_file_id(path3)

    def test_classify_path_wsop(self):
        """WSOP 경로 분류"""
        assert classify_path("WSOP/WSOP ARCHIVE/2024/file.mp4") == ("WSOP", "wsop-archive")
        assert classify_path("WSOP/WSOP-BR/WSOP-EUROPE/file.mp4") == ("WSOP", "wsop-europe")
        assert classify_path("WSOP/WSOP-BR/WSOP-PARADISE/file.mp4") == ("WSOP", "wsop-paradise")

    def test_classify_path_other_catalogs(self):
        """기타 카탈로그 분류"""
        assert classify_path("HCL/2024/file.mp4") == ("HCL", None)
        assert classify_path("PAD/file.mp4") == ("PAD", None)
        assert classify_path("MPP/test/file.mp4") == ("MPP", None)

    def test_classify_path_unknown(self):
        """알 수 없는 경로"""
        assert classify_path("UNKNOWN/file.mp4") == ("OTHER", None)


class TestMultilevelClassify:
    """다단계 분류 테스트"""

    def test_wsop_br_depth1(self):
        """WSOP-BR depth=1"""
        match = classify_path_multilevel("WSOP/WSOP-BR/somefile.mp4")
        assert match.catalog_id == "WSOP"
        assert match.subcatalog_id == "wsop-br"
        assert match.depth == 1
        assert match.year is None

    def test_wsop_europe_depth2(self):
        """WSOP Europe depth=2"""
        match = classify_path_multilevel("WSOP/WSOP-BR/WSOP-EUROPE/tournament.mp4")
        assert match.catalog_id == "WSOP"
        assert match.subcatalog_id == "wsop-europe"
        assert match.depth == 2
        assert match.year is None

    def test_wsop_europe_with_year_depth3(self):
        """WSOP Europe 2024 depth=3"""
        match = classify_path_multilevel("WSOP/WSOP-BR/WSOP-EUROPE/2024/main_event.mp4")
        assert match.catalog_id == "WSOP"
        assert match.subcatalog_id == "wsop-europe-{year}"
        assert match.full_subcatalog_id == "wsop-europe-2024"
        assert match.depth == 3
        assert match.year == "2024"

    def test_wsop_paradise_with_year(self):
        """WSOP Paradise 2023 depth=3"""
        match = classify_path_multilevel("WSOP/WSOP-BR/WSOP-PARADISE/2023/day1.mp4")
        assert match.catalog_id == "WSOP"
        assert match.full_subcatalog_id == "wsop-paradise-2023"
        assert match.depth == 3
        assert match.year == "2023"

    def test_wsop_archive_era_classification(self):
        """WSOP Archive 연대별 분류"""
        # 1973-2002
        match1 = classify_path_multilevel("WSOP/WSOP ARCHIVE/1995/classic.mp4")
        assert match1.full_subcatalog_id == "wsop-archive-1973-2002"
        assert match1.depth == 2

        # 2003-2010
        match2 = classify_path_multilevel("WSOP/WSOP ARCHIVE/2008/main.mp4")
        assert match2.full_subcatalog_id == "wsop-archive-2003-2010"
        assert match2.depth == 2

        # 2011-2016
        match3 = classify_path_multilevel("WSOP/WSOP ARCHIVE/2015/event.mp4")
        assert match3.full_subcatalog_id == "wsop-archive-2011-2016"
        assert match3.depth == 2

    def test_hcl_year_extraction(self):
        """HCL 연도 추출"""
        match = classify_path_multilevel("HCL/2025/episode1.mp4")
        assert match.catalog_id == "HCL"
        assert match.full_subcatalog_id == "hcl-2025"
        assert match.depth == 1

    def test_hcl_clips(self):
        """HCL 클립"""
        match = classify_path_multilevel("HCL/Poker Clips/highlight.mp4")
        assert match.catalog_id == "HCL"
        assert match.full_subcatalog_id == "hcl-clips"
        assert match.depth == 1

    def test_pad_season(self):
        """PAD 시즌"""
        match = classify_path_multilevel("PAD/Season 12/ep1.mp4")
        assert match.catalog_id == "PAD"
        assert match.full_subcatalog_id == "pad-s12"
        assert match.depth == 1

    def test_mpp_prize(self):
        """MPP 상금"""
        match = classify_path_multilevel("MPP/5M GTD Main/final.mp4")
        assert match.catalog_id == "MPP"
        assert match.full_subcatalog_id == "mpp-5m"
        assert match.depth == 1

    def test_unknown_path(self):
        """알 수 없는 경로"""
        match = classify_path_multilevel("RANDOM/folder/file.mp4")
        assert match.catalog_id == "OTHER"
        assert match.subcatalog_id is None
        assert match.depth == 0

    def test_local_to_nas(self):
        """경로 변환"""
        config = SyncConfig()
        local = "Z:/GGPNAs/ARCHIVE/WSOP/file.mp4"
        nas = local_to_nas(local, config)
        assert nas == "//10.10.100.122/docker/GGPNAs/ARCHIVE/WSOP/file.mp4"

    def test_format_resolution(self):
        """해상도 포맷"""
        assert format_resolution(1920, 1080) == "1920x1080"
        assert format_resolution(1280, 720) == "1280x720"
        assert format_resolution(None, 1080) is None
        assert format_resolution(1920, None) is None
        assert format_resolution(None, None) is None


class TestSyncResult:
    """SyncResult 테스트"""

    def test_default_values(self):
        """기본값"""
        result = SyncResult()
        assert result.inserted == 0
        assert result.updated == 0
        assert result.skipped == 0
        assert result.errors == []
        assert result.total == 0

    def test_total_calculation(self):
        """total 계산"""
        result = SyncResult(inserted=5, updated=3, skipped=2)
        assert result.total == 10


class TestSyncConfig:
    """SyncConfig 테스트"""

    def test_default_values(self):
        """기본값"""
        config = SyncConfig()
        assert config.archive_db == "data/output/archive.db"
        assert "pokervod.db" in config.pokervod_db
        assert config.default_analysis_status == "pending"


@pytest.fixture
def temp_archive_db():
    """임시 archive.db 생성"""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # files 테이블
    cursor.execute("""
        CREATE TABLE files (
            id INTEGER PRIMARY KEY,
            path TEXT NOT NULL,
            filename TEXT NOT NULL,
            extension TEXT,
            size_bytes INTEGER,
            file_type TEXT
        )
    """)

    # media_info 테이블
    cursor.execute("""
        CREATE TABLE media_info (
            id INTEGER PRIMARY KEY,
            file_id INTEGER,
            video_codec TEXT,
            width INTEGER,
            height INTEGER,
            duration_seconds REAL,
            framerate REAL,
            bitrate INTEGER
        )
    """)

    # 테스트 데이터
    cursor.execute("""
        INSERT INTO files (id, path, filename, extension, size_bytes, file_type)
        VALUES (1, 'Z:/GGPNAs/ARCHIVE/WSOP/WSOP ARCHIVE/2024/test.mp4', 'test.mp4', '.mp4', 1000000, 'video')
    """)
    cursor.execute("""
        INSERT INTO media_info (id, file_id, video_codec, width, height, duration_seconds, framerate, bitrate)
        VALUES (1, 1, 'h264', 1920, 1080, 3600.0, 29.97, 5000000)
    """)

    conn.commit()
    conn.close()

    yield db_path

    Path(db_path).unlink(missing_ok=True)


@pytest.fixture
def temp_pokervod_db():
    """임시 pokervod.db 생성"""
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # catalogs 테이블
    cursor.execute("""
        CREATE TABLE catalogs (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)

    # subcatalogs 테이블 (다단계 지원)
    cursor.execute("""
        CREATE TABLE subcatalogs (
            id VARCHAR(100) PRIMARY KEY,
            catalog_id VARCHAR(50) NOT NULL,
            parent_id VARCHAR(100),
            name VARCHAR(200) NOT NULL,
            description TEXT,
            depth INTEGER DEFAULT 1,
            path TEXT,
            display_order INTEGER,
            tournament_count INTEGER,
            file_count INTEGER,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)

    # files 테이블
    cursor.execute("""
        CREATE TABLE files (
            id VARCHAR(200) PRIMARY KEY,
            event_id VARCHAR(150),
            nas_path TEXT NOT NULL,
            filename VARCHAR(500) NOT NULL,
            size_bytes BIGINT,
            duration_sec FLOAT,
            resolution VARCHAR(20),
            codec VARCHAR(50),
            fps FLOAT,
            bitrate_kbps INTEGER,
            analysis_status VARCHAR(20) NOT NULL,
            analysis_error TEXT,
            analyzed_at TIMESTAMP,
            hands_count INTEGER,
            view_count INTEGER,
            last_viewed_at TIMESTAMP,
            created_at TIMESTAMP,
            updated_at TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()

    yield db_path

    Path(db_path).unlink(missing_ok=True)


class TestSyncService:
    """SyncService 테스트"""

    def test_init_with_missing_archive_db(self, temp_pokervod_db):
        """archive.db 없을 때"""
        config = SyncConfig(
            archive_db="/nonexistent/path/archive.db",
            pokervod_db=temp_pokervod_db,
        )
        with pytest.raises(FileNotFoundError):
            SyncService(config)

    def test_init_with_missing_pokervod_db(self, temp_archive_db):
        """pokervod.db 없을 때"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db="/nonexistent/path/pokervod.db",
        )
        with pytest.raises(FileNotFoundError):
            SyncService(config)

    def test_sync_files_dry_run(self, temp_archive_db, temp_pokervod_db):
        """파일 동기화 dry run"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)
        result = service.sync_files(dry_run=True)

        # dry run에서는 삽입 카운트만 증가
        assert result.inserted == 1
        assert result.updated == 0

        # 실제 DB에는 기록 없음
        conn = sqlite3.connect(temp_pokervod_db)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM files")
        assert cursor.fetchone()[0] == 0
        conn.close()

    def test_sync_files_actual(self, temp_archive_db, temp_pokervod_db):
        """파일 동기화 실제 실행"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)
        result = service.sync_files(dry_run=False)

        assert result.inserted == 1
        assert result.updated == 0

        # 실제 DB에 기록됨
        conn = sqlite3.connect(temp_pokervod_db)
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM files")
        assert cursor.fetchone()[0] == 1

        cursor.execute("SELECT filename, resolution, codec FROM files")
        row = cursor.fetchone()
        assert row[0] == "test.mp4"
        assert row[1] == "1920x1080"
        assert row[2] == "h264"
        conn.close()

    def test_sync_files_update(self, temp_archive_db, temp_pokervod_db):
        """파일 업데이트 동기화"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)

        # 첫 번째 동기화
        service.sync_files(dry_run=False)

        # 두 번째 동기화 (업데이트)
        result = service.sync_files(dry_run=False)
        assert result.inserted == 0
        assert result.updated == 1

    def test_sync_catalogs(self, temp_archive_db, temp_pokervod_db):
        """카탈로그 동기화"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)
        result = service.sync_catalogs(dry_run=False)

        # WSOP 카탈로그 + wsop-archive 서브카탈로그
        assert result.inserted == 2

        conn = sqlite3.connect(temp_pokervod_db)
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM catalogs")
        assert cursor.fetchone()[0] == "WSOP"
        cursor.execute("SELECT id FROM subcatalogs")
        assert cursor.fetchone()[0] == "wsop-archive"
        conn.close()

    def test_get_sync_stats(self, temp_archive_db, temp_pokervod_db):
        """동기화 통계"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)
        stats = service.get_sync_stats()

        assert stats["archive_video_count"] == 1
        assert stats["archive_media_info_count"] == 1
        assert stats["pokervod_file_count"] == 0

    def test_run_full_sync(self, temp_archive_db, temp_pokervod_db):
        """전체 동기화"""
        config = SyncConfig(
            archive_db=temp_archive_db,
            pokervod_db=temp_pokervod_db,
        )
        service = SyncService(config)
        results = service.run_full_sync(dry_run=False)

        assert "catalogs" in results
        assert "files" in results
        assert results["catalogs"].inserted >= 1
        assert results["files"].inserted == 1
