import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_semantic_index_and_search_api():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # 1. Health check
        health_resp = await client.get("/health")
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert health_data["status"] == "ok"
        assert health_data["details"]["semantic_retrieval"] == "ready"

        # 2. Index batch of documents with provenance
        payload = {
            "documents": [
                {
                    "document_id": "doc-readme",
                    "project_id": "knovra-core",
                    "repository_id": "knovra",
                    "doc_type": "doc",
                    "title": "Knovra Documentation",
                    "content": "# Knovra Core\nContext engine for AI coding agents with property graph and semantic memory.",
                    "provenance": {
                        "file_path": "README.md",
                        "byte_start": 0,
                        "byte_end": 85,
                        "line_start": 1,
                        "line_end": 2,
                        "content_hash": "sha256readmehash123",
                        "repo_name": "knovra",
                    },
                    "metadata": {"section": "overview"},
                },
                {
                    "document_id": "code-parser",
                    "project_id": "knovra-core",
                    "repository_id": "knovra",
                    "doc_type": "code_summary",
                    "title": "TypeScript Parser",
                    "content": "Function parse_typescript extracts AST symbols, imports, and calls using tree-sitter-typescript.",
                    "provenance": {
                        "file_path": "services/code-indexer/crates/core/src/parser/typescript.rs",
                        "byte_start": 100,
                        "byte_end": 350,
                        "line_start": 10,
                        "line_end": 25,
                        "content_hash": "sha256parserhash456",
                        "repo_name": "knovra",
                    },
                    "metadata": {"language": "rust", "target_lang": "typescript"},
                },
                {
                    "document_id": "adr-001",
                    "project_id": "knovra-core",
                    "repository_id": "knovra",
                    "doc_type": "decision",
                    "title": "ADR 001: Vector Storage in PostgreSQL",
                    "content": "Decision: Use pgvector inside PostgreSQL for transactional semantic vector memory.",
                    "provenance": {
                        "file_path": "docs/decisions/001_pgvector.md",
                        "content_hash": "sha256adrhash789",
                        "repo_name": "knovra",
                    },
                    "metadata": {"status": "accepted"},
                },
            ]
        }

        index_resp = await client.post("/semantic/index", json=payload)
        assert index_resp.status_code == 200
        index_data = index_resp.json()
        assert index_data["indexed_documents"] == 3
        assert index_data["indexed_chunks"] >= 3

        # 3. Check stats
        stats_resp = await client.get("/semantic/stats")
        assert stats_resp.status_code == 200
        stats_data = stats_resp.json()
        assert stats_data["total_documents"] == 3
        assert stats_data["by_doc_type"]["doc"] == 1
        assert stats_data["by_doc_type"]["code_summary"] == 1
        assert stats_data["by_doc_type"]["decision"] == 1

        # 4. Search for code parser
        search_query = {
            "query": "tree-sitter ast symbol parser for typescript",
            "top_k": 5,
            "min_score": 0.0,
        }
        search_resp = await client.post("/semantic/search", json=search_query)
        assert search_resp.status_code == 200
        results = search_resp.json()
        assert len(results) > 0
        top = results[0]
        assert top["doc_type"] == "code_summary"
        assert "provenance" in top
        assert top["provenance"]["file_path"] == "services/code-indexer/crates/core/src/parser/typescript.rs"
        assert top["score"] > 0.0

        # 5. Search with type filter (only decisions)
        decision_query = {
            "query": "postgresql pgvector storage choice",
            "doc_types": ["decision"],
            "top_k": 5,
        }
        dec_resp = await client.post("/semantic/search", json=decision_query)
        assert dec_resp.status_code == 200
        dec_results = dec_resp.json()
        assert len(dec_results) == 1
        assert dec_results[0]["document_id"] == "adr-001"

        # 6. Deletion propagation
        del_resp = await client.delete("/semantic/documents/adr-001")
        assert del_resp.status_code == 200
        del_data = del_resp.json()
        assert del_data["status"] == "deleted"

        # Verify document is gone from stats
        stats_after = await client.get("/semantic/stats")
        assert stats_after.json()["total_documents"] == 2
