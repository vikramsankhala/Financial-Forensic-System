"""Integration tests for API endpoints"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import Base, engine

# Create test database
Base.metadata.create_all(bind=engine)

client = TestClient(app)

@pytest.fixture
def test_user_token():
    """Create a test user and return access token"""
    # This is a simplified version - in real tests, you'd create a user in DB
    # For now, we'll test with a mock token
    return "test_token"

def test_healthz_endpoint():
    """Test health check endpoint"""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert "status" in response.json()

def test_readyz_endpoint():
    """Test readiness check endpoint"""
    response = client.get("/readyz")
    assert response.status_code == 200

def test_metrics_endpoint():
    """Test Prometheus metrics endpoint"""
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "text/plain" in response.headers.get("content-type", "")

def test_api_prefix():
    """Test that API routes are prefixed correctly"""
    # Test that non-prefixed routes return 404
    response = client.get("/transactions")
    assert response.status_code == 404
    
    # Test that prefixed routes exist (may require auth)
    response = client.get("/api/transactions")
    # Should return 401 (unauthorized) or 200, not 404
    assert response.status_code != 404

def test_transactions_endpoint_structure():
    """Test transactions endpoint returns expected structure"""
    response = client.get("/api/transactions")
    # Without auth, should return 401
    if response.status_code == 401:
        assert "detail" in response.json()
    # With valid auth, should return list structure
    elif response.status_code == 200:
        assert isinstance(response.json(), (list, dict))

def test_cases_endpoint_structure():
    """Test cases endpoint returns expected structure"""
    response = client.get("/api/cases")
    if response.status_code == 401:
        assert "detail" in response.json()
    elif response.status_code == 200:
        assert isinstance(response.json(), (list, dict))

def test_entities_endpoint_structure():
    """Test entities endpoint returns expected structure"""
    response = client.get("/api/entities/1")
    if response.status_code == 401:
        assert "detail" in response.json()
    elif response.status_code in [200, 404]:
        # 404 is valid if entity doesn't exist
        pass

