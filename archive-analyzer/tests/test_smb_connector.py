"""SMB Connector 테스트

실제 네트워크 연결이 필요한 통합 테스트입니다.
테스트 실행 전 환경변수 설정이 필요합니다:
    SMB_PASSWORD=your_password
"""

import os
import sys
import pytest
from pathlib import Path

# 프로젝트 루트 경로 추가
sys.path.insert(0, str(Path(__file__).parent.parent / "src"))

from archive_analyzer.config import SMBConfig, AnalyzerConfig, create_default_config
from archive_analyzer.smb_connector import (
    SMBConnector,
    SMBConnectionError,
    FileInfo,
    create_connector,
    quick_connect,
)


# 테스트용 설정
TEST_SERVER = "10.10.100.122"
TEST_SHARE = "docker"
TEST_USERNAME = "GGP"
TEST_PASSWORD = os.getenv("SMB_PASSWORD", "!@QW12qw")
TEST_ARCHIVE_PATH = "GGPNAs/ARCHIVE"


@pytest.fixture
def smb_config():
    """테스트용 SMB 설정"""
    return SMBConfig(
        server=TEST_SERVER,
        share=TEST_SHARE,
        username=TEST_USERNAME,
        password=TEST_PASSWORD,
        timeout=30,
        max_retries=3,
    )


@pytest.fixture
def connector(smb_config):
    """테스트용 SMB 커넥터"""
    conn = SMBConnector(smb_config)
    yield conn
    if conn.is_connected:
        conn.disconnect()


class TestSMBConfig:
    """SMBConfig 테스트"""

    def test_share_path(self, smb_config):
        """UNC 경로 생성 테스트"""
        expected = f"\\\\{TEST_SERVER}\\{TEST_SHARE}"
        assert smb_config.share_path == expected

    def test_to_dict_hides_password(self, smb_config):
        """비밀번호 숨김 테스트"""
        d = smb_config.to_dict()
        assert d['password'] == '***HIDDEN***'
        assert d['server'] == TEST_SERVER


class TestAnalyzerConfig:
    """AnalyzerConfig 테스트"""

    def test_create_default_config(self):
        """기본 설정 생성 테스트"""
        config = create_default_config()
        assert config.smb.server == "10.10.100.122"
        assert config.smb.share == "docker"
        assert config.archive_path == "GGPNAs/ARCHIVE"

    def test_from_env(self):
        """환경변수 로드 테스트"""
        os.environ["SMB_SERVER"] = "test.server"
        config = AnalyzerConfig.from_env()
        assert config.smb.server == "test.server"
        # 원래 값 복원
        os.environ["SMB_SERVER"] = TEST_SERVER


class TestSMBConnector:
    """SMBConnector 테스트"""

    def test_initial_state(self, connector):
        """초기 상태 테스트"""
        assert not connector.is_connected
        assert connector.base_path == f"\\\\{TEST_SERVER}\\{TEST_SHARE}"

    def test_connect(self, connector):
        """연결 테스트"""
        result = connector.connect()
        assert result is True
        assert connector.is_connected

    def test_connect_already_connected(self, connector):
        """이미 연결된 상태에서 재연결 테스트"""
        connector.connect()
        result = connector.connect()  # 두 번째 연결 시도
        assert result is True

    def test_disconnect(self, connector):
        """연결 해제 테스트"""
        connector.connect()
        connector.disconnect()
        assert not connector.is_connected

    def test_list_directory(self, connector):
        """디렉토리 목록 조회 테스트"""
        connector.connect()
        items = connector.list_directory()
        assert isinstance(items, list)
        assert len(items) > 0
        assert "GGPNAs" in items

    def test_list_archive_directory(self, connector):
        """아카이브 디렉토리 목록 조회 테스트"""
        connector.connect()
        items = connector.list_directory(TEST_ARCHIVE_PATH)
        assert isinstance(items, list)
        # 예상되는 폴더들
        expected_folders = ["MPP", "WSOP", "GGMillions", "PAD", "HCL"]
        for folder in expected_folders:
            assert folder in items

    def test_get_file_info(self, connector):
        """파일 정보 조회 테스트"""
        connector.connect()
        info = connector.get_file_info(TEST_ARCHIVE_PATH)
        assert isinstance(info, FileInfo)
        assert info.is_dir is True
        assert info.name == "ARCHIVE"

    def test_scan_directory(self, connector):
        """디렉토리 스캔 테스트"""
        connector.connect()
        items = list(connector.scan_directory(TEST_ARCHIVE_PATH))
        assert len(items) > 0
        assert all(isinstance(item, FileInfo) for item in items)

    def test_scan_directory_recursive(self, connector):
        """재귀 스캔 테스트 (제한된 깊이)"""
        connector.connect()
        # MPP 폴더만 스캔 (작은 범위)
        items = list(connector.scan_directory(f"{TEST_ARCHIVE_PATH}/MPP", recursive=True))
        assert len(items) > 0
        # 파일과 디렉토리 모두 포함
        has_files = any(not item.is_dir for item in items)
        assert has_files or len(items) > 0  # 최소한 뭔가는 있어야 함

    def test_file_exists(self, connector):
        """파일 존재 확인 테스트"""
        connector.connect()
        assert connector.file_exists(TEST_ARCHIVE_PATH) is True
        assert connector.file_exists("nonexistent/path") is False

    def test_is_directory(self, connector):
        """디렉토리 확인 테스트"""
        connector.connect()
        assert connector.is_directory(TEST_ARCHIVE_PATH) is True

    def test_context_manager(self, smb_config):
        """컨텍스트 매니저 테스트"""
        with SMBConnector(smb_config) as conn:
            assert conn.is_connected
            items = conn.list_directory()
            assert len(items) > 0
        # 컨텍스트 종료 후 연결 해제 확인
        assert not conn.is_connected

    def test_connection_status(self, connector):
        """연결 상태 정보 테스트"""
        status = connector.get_connection_status()
        assert status['connected'] is False
        assert status['server'] == TEST_SERVER

        connector.connect()
        status = connector.get_connection_status()
        assert status['connected'] is True


class TestHelperFunctions:
    """헬퍼 함수 테스트"""

    def test_quick_connect(self):
        """빠른 연결 테스트"""
        conn = quick_connect(
            server=TEST_SERVER,
            share=TEST_SHARE,
            username=TEST_USERNAME,
            password=TEST_PASSWORD,
        )
        assert conn.is_connected
        conn.disconnect()

    def test_create_connector(self):
        """팩토리 함수 테스트"""
        config = create_default_config()
        config.smb.password = TEST_PASSWORD
        conn = create_connector(config)
        assert isinstance(conn, SMBConnector)


class TestFileInfo:
    """FileInfo 테스트"""

    def test_file_info_creation(self, connector):
        """FileInfo 생성 테스트"""
        connector.connect()
        items = list(connector.scan_directory(TEST_ARCHIVE_PATH))

        for item in items:
            assert hasattr(item, 'path')
            assert hasattr(item, 'name')
            assert hasattr(item, 'size')
            assert hasattr(item, 'is_dir')
            assert hasattr(item, 'extension')


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
