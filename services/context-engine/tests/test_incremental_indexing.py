"""Tests for Phase 11 Incremental Indexing and Freshness Lifecycle."""

from datetime import UTC, datetime

from starlette.testclient import TestClient

from app.freshness.models import FreshnessMetadata
from app.main import app


def test_freshness_metadata_lifecycle():
    freshness = FreshnessMetadata()
    assert freshness.stale is False
    assert freshness.valid_to is None
    assert freshness.superseded_by is None
    assert freshness.created_at <= datetime.now(UTC)

    freshness.invalidate(superseded_by="chunk-v2")
    assert freshness.stale is True
    assert freshness.valid_to is not None
    assert freshness.superseded_by == "chunk-v2"


def test_delta_index_and_freshness_filtering():
    client = TestClient(app)

    # 1. Initial delta index: Add two files
    resp = client.post(
        "/semantic/delta",
        json={
            "project_id": "knovra",
            "repository_id": "knovra",
            "added_files": [
                {
                    "path": "services/auth/login.py",
                    "content": "def login_user(username, password):\n    return authenticate(username, password)\n",
                    "doc_type": "code",
                },
                {
                    "path": "services/auth/token.py",
                    "content": "def create_token(user_id):\n    return jwt_sign(user_id)\n",
                    "doc_type": "code",
                },
            ],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["indexed_chunks"] >= 2
    assert data["invalidated_chunks"] == 0

    # 2. Search matches active chunks
    search_resp = client.post(
        "/semantic/search",
        json={
            "query": "authenticate login user",
            "top_k": 5,
        },
    )
    assert search_resp.status_code == 200
    results = search_resp.json()
    assert any("login.py" in r["provenance"]["file_path"] for r in results)

    # 3. Check Freshness status: should be active
    fresh_resp = client.get("/semantic/freshness?file_path=services/auth/login.py")
    assert fresh_resp.status_code == 200
    f_data = fresh_resp.json()
    assert f_data["total_chunks"] >= 1
    assert f_data["active_chunks"] >= 1
    assert f_data["stale_chunks"] == 0
    assert f_data["is_stale"] is False

    # 4. Modify login.py and mark token.py as invalidated dependent
    mod_resp = client.post(
        "/semantic/delta",
        json={
            "project_id": "knovra",
            "repository_id": "knovra",
            "modified_files": [
                {
                    "path": "services/auth/login.py",
                    "content": "def login_user_oauth(provider, token):\n    return oauth_verify(provider, token)\n",
                    "doc_type": "code",
                }
            ],
            "invalidated_dependents": ["services/auth/token.py"],
        },
    )
    assert mod_resp.status_code == 200
    mod_data = mod_resp.json()
    assert mod_data["indexed_chunks"] >= 1
    assert mod_data["invalidated_chunks"] >= 2  # old login.py + token.py
    assert "services/auth/token.py" in mod_data["stale_dependents"]

    # 5. Check token.py freshness: should now be stale
    token_fresh = client.get("/semantic/freshness?file_path=services/auth/token.py")
    assert token_fresh.status_code == 200
    tf_data = token_fresh.json()
    assert tf_data["stale_chunks"] >= 1
    assert tf_data["is_stale"] is True

    # 6. Verify stale chunks are excluded by default in search
    search_token = client.post(
        "/semantic/search",
        json={
            "query": "jwt_sign token",
            "top_k": 5,
            "include_stale": False,
        },
    )
    assert search_token.status_code == 200
    token_results = search_token.json()
    # token.py is stale, so should not appear in active search
    assert not any("token.py" in r["provenance"]["file_path"] for r in token_results)

    # 7. When include_stale=True, it should appear marked as stale
    search_stale = client.post(
        "/semantic/search",
        json={
            "query": "jwt_sign token",
            "top_k": 5,
            "include_stale": True,
        },
    )
    assert search_stale.status_code == 200
    stale_results = search_stale.json()
    assert any("token.py" in r["provenance"]["file_path"] and r["is_stale"] for r in stale_results)


def test_explicit_invalidation():
    client = TestClient(app)

    # Invalidate arbitrary path
    inv_resp = client.post(
        "/semantic/invalidate",
        json={
            "file_paths": ["services/auth/login.py"],
            "reason": "MANUAL_PURGE",
        },
    )
    assert inv_resp.status_code == 200
    inv_data = inv_resp.json()
    assert inv_data["status"] == "ok"
    assert inv_data["invalidated_chunks"] >= 1
