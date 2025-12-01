"""검색 API 테스트

FastAPI 검색 엔드포인트 테스트입니다.
주의: MeiliSearch 서버가 실행 중이면 실제 서비스에 연결됩니다.
"""

import pytest
from unittest.mock import MagicMock

# FastAPI 테스트 클라이언트
try:
    from fastapi.testclient import TestClient
    from fastapi import FastAPI
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False


@pytest.fixture
def mock_search_result():
    """SearchResult 모킹"""
    from archive_analyzer.search import SearchResult
    return SearchResult(
        hits=[{"id": 1, "filename": "test.mp4", "path": "/test/test.mp4"}],
        total_hits=1,
        processing_time_ms=5,
        query="test",
    )


@pytest.fixture
def mock_search_service(mock_search_result):
    """SearchService 모킹"""
    mock = MagicMock()
    mock.health_check.return_value = True
    mock.get_stats.return_value = {
        "files": {"numberOfDocuments": 100, "isIndexing": False},
        "media_info": {"numberOfDocuments": 50, "isIndexing": False},
        "clip_metadata": {"numberOfDocuments": 200, "isIndexing": False},
    }
    mock.search_files.return_value = mock_search_result
    mock.search_media.return_value = mock_search_result
    mock.search_clips.return_value = mock_search_result
    mock.index_from_db.return_value = {"files": 100, "media_info": 50, "clip_metadata": 200}
    return mock


@pytest.fixture(autouse=True)
def reset_api_module():
    """각 테스트 전후로 API 모듈 상태 초기화"""
    import archive_analyzer.api as api_module
    original_service = api_module._service
    yield
    api_module._service = original_service


@pytest.fixture
def mock_client(mock_search_service):
    """모킹된 서비스를 사용하는 테스트 클라이언트"""
    if not FASTAPI_AVAILABLE:
        pytest.skip("fastapi 패키지 필요")

    import archive_analyzer.api as api_module
    api_module._service = mock_search_service

    with TestClient(api_module.app) as client:
        yield client, mock_search_service


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestHealthEndpoint:
    """헬스체크 엔드포인트 테스트"""

    def test_health_returns_200(self, mock_client):
        """헬스체크 요청 성공"""
        client, mock_service = mock_client
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_ok_status(self, mock_client):
        """헬스체크 정상 상태"""
        client, mock_service = mock_client
        response = client.get("/health")
        data = response.json()
        assert "status" in data
        assert "meilisearch" in data

    @pytest.mark.skip(reason="MeiliSearch 실제 서버 실행 중에는 모킹 불가")
    def test_health_degraded_when_meilisearch_fails(self, mock_client):
        """MeiliSearch 비정상 시 degraded 상태"""
        client, mock_service = mock_client
        mock_service.health_check.return_value = False
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "degraded"


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestStatsEndpoint:
    """통계 엔드포인트 테스트"""

    def test_stats_returns_indexes(self, mock_client):
        """통계 조회 성공"""
        client, mock_service = mock_client
        response = client.get("/stats")
        assert response.status_code == 200
        data = response.json()
        assert "indexes" in data


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestSearchFilesEndpoint:
    """파일 검색 엔드포인트 테스트"""

    def test_search_files_success(self, mock_client):
        """파일 검색 성공"""
        client, mock_service = mock_client
        response = client.get("/search/files?q=test")
        assert response.status_code == 200
        data = response.json()
        assert "hits" in data
        assert "query" in data

    def test_search_files_empty_query_fails(self, mock_client):
        """빈 검색어 실패"""
        client, mock_service = mock_client
        response = client.get("/search/files?q=")
        assert response.status_code == 422


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestSearchMediaEndpoint:
    """미디어 검색 엔드포인트 테스트"""

    def test_search_media_success(self, mock_client):
        """미디어 검색 성공"""
        client, mock_service = mock_client
        response = client.get("/search/media?q=test")
        assert response.status_code == 200
        data = response.json()
        assert "hits" in data


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestSearchClipsEndpoint:
    """클립 검색 엔드포인트 테스트"""

    def test_search_clips_success(self, mock_client):
        """클립 검색 성공"""
        client, mock_service = mock_client
        response = client.get("/search/clips?q=test")
        assert response.status_code == 200
        data = response.json()
        assert "hits" in data


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestIndexEndpoint:
    """인덱싱 엔드포인트 테스트"""

    @pytest.mark.skip(reason="MeiliSearch 실제 서버 실행 중에는 실제 인덱싱 발생")
    def test_index_success(self, mock_client):
        """인덱싱 성공"""
        client, mock_service = mock_client
        response = client.post("/index?db_path=test.db")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    @pytest.mark.skip(reason="MeiliSearch 실제 서버 실행 중에는 모킹 불가")
    def test_index_file_not_found(self, mock_client):
        """인덱싱 파일 없음"""
        client, mock_service = mock_client
        mock_service.index_from_db.side_effect = FileNotFoundError()
        response = client.post("/index?db_path=nonexistent.db")
        assert response.status_code == 404


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestClearEndpoint:
    """초기화 엔드포인트 테스트"""

    def test_clear_success(self, mock_client):
        """인덱스 초기화 성공"""
        client, mock_service = mock_client
        response = client.delete("/clear")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


@pytest.mark.skipif(not FASTAPI_AVAILABLE, reason="fastapi 패키지 필요")
class TestServiceUnavailable:
    """서비스 비가용 테스트"""

    @pytest.mark.skip(reason="MeiliSearch 실제 서버 실행 중에는 서비스 자동 생성됨")
    def test_search_without_service(self):
        """MeiliSearch 서비스 없이 검색 시도"""
        import archive_analyzer.api as api_module
        api_module._service = None

        with TestClient(api_module.app) as client:
            response = client.get("/search/files?q=test")

        assert response.status_code == 503
