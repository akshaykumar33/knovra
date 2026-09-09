"""Test suite for Phase 07: Conversation and Git History Memory."""

from datetime import UTC, datetime

import pytest
from starlette.testclient import TestClient

from app.conversation import (
    ChatGPTTranscriptParser,
    ClaudeCodeTranscriptParser,
    CodexTranscriptParser,
    ConversationExtractor,
    ConversationSession,
    FactType,
    GenericTranscriptParser,
    Message,
    MessageRole,
)
from app.git_memory import (
    FileChange,
    GitBranch,
    GitCommit,
    GitMemoryStore,
    GitTag,
)
from app.main import app
from app.security.redactor import SecretRedactor


@pytest.fixture
def test_client():
    return TestClient(app)


def test_transcript_parsers_and_redaction():
    redactor = SecretRedactor()

    # 1. Generic transcript with AWS secret key
    generic_data = [
        {
            "id": "m1",
            "role": "user",
            "content": "Please inspect AWS key AKIAIOSFODNN7EXAMPLE for deployment.",
        },
        {
            "id": "m2",
            "role": "assistant",
            "content": "We decided to proceed with ADR-001 polyglot structure in services/runtime/cmd/main.go.",
        },
    ]
    gen_parser = GenericTranscriptParser(redactor=redactor)
    gen_session = gen_parser.parse(generic_data, default_title="Generic Test Session")

    assert len(gen_session.messages) == 2
    assert "AKIAIOSFODNN7EXAMPLE" not in gen_session.messages[0].content
    assert "[REDACTED_AWS_KEY]" in gen_session.messages[0].content
    assert gen_session.messages[1].role == MessageRole.ASSISTANT

    # 2. Claude Code transcript
    claude_data = [
        {
            "role": "user",
            "content": [{"type": "text", "text": "Can you check why build failed with exit code 1?"}],
        },
        {
            "role": "assistant",
            "content": [
                {"type": "tool_use", "name": "run_command", "input": {"command": "cargo check"}},
                {"type": "text", "text": "This was fixed by updating Cargo.toml dependency versions."},
            ],
        },
    ]
    claude_parser = ClaudeCodeTranscriptParser(redactor=redactor)
    claude_session = claude_parser.parse(claude_data, default_title="Claude Session")
    assert len(claude_session.messages) == 2
    assert "[Tool Use: run_command]" in claude_session.messages[1].content
    assert claude_session.source_format == "claude_code"

    # 3. ChatGPT transcript
    chatgpt_data = {
        "title": "ChatGPT Architecture Discussion",
        "mapping": {
            "node-1": {
                "message": {
                    "author": {"role": "user"},
                    "content": {"parts": ["The system must ensure zero secret leakage."]},
                    "create_time": 1700000000,
                }
            }
        },
    }
    chatgpt_parser = ChatGPTTranscriptParser(redactor=redactor)
    cg_session = chatgpt_parser.parse(chatgpt_data)
    assert len(cg_session.messages) == 1
    assert "zero secret leakage" in cg_session.messages[0].content

    # 4. Codex transcript
    codex_data = {
        "prompt": "Write a Cypher query for ADR-002",
        "completion": "MATCH (d:Decision {id: 'adr-002'}) RETURN d;",
    }
    codex_parser = CodexTranscriptParser(redactor=redactor)
    codex_session = codex_parser.parse(codex_data)
    assert len(codex_session.messages) == 2


def test_fact_extraction_and_summary():
    session = ConversationSession(
        id="test-session-001",
        title="Architecture & Bugfix Discussion",
        messages=[
            Message(
                id="m1",
                role=MessageRole.USER,
                content="The ingestion worker failed with exit code 1 due to permission denied on .knovra/",
            ),
            Message(
                id="m2",
                role=MessageRole.ASSISTANT,
                content="This was fixed by running chmod 755 on services/runtime/internal/ingest.go.",
            ),
            Message(
                id="m3",
                role=MessageRole.USER,
                content="We also decided to adopt ADR-004 for resilient hybrid vector storage.",
            ),
            Message(
                id="m4",
                role=MessageRole.ASSISTANT,
                content="Understood. The runtime must always operate offline without network per invariant #7.",
            ),
        ],
    )

    extractor = ConversationExtractor()
    facts = extractor.extract_facts(session)

    fact_types = {f.fact_type for f in facts}
    assert FactType.ERROR in fact_types
    assert FactType.SOLUTION in fact_types
    assert FactType.DECISION in fact_types
    assert FactType.REQUIREMENT in fact_types
    assert FactType.SUMMARY in fact_types
    assert FactType.ENTITY in fact_types

    # Verify decision linkage
    dec_facts = [f for f in facts if f.fact_type == FactType.DECISION]
    assert any("adr-004" in f.related_decisions for f in dec_facts)


def test_git_memory_store_and_lineage():
    store = GitMemoryStore()

    commit_1 = GitCommit(
        hash="1111111111111111111111111111111111111111",
        short_hash="1111111",
        author_name="Knovra Core",
        author_email="dev@knovra.io",
        date=datetime.now(UTC),
        subject="feat(core): setup monorepo structure per ADR-001",
        body="Initial monorepo commit implementing polyglot workspace.",
        changed_files=[
            FileChange(path="services/runtime/cmd/knovra/main.go", status="added", additions=120, deletions=0),
            FileChange(path="services/context-engine/app/main.py", status="added", additions=85, deletions=0),
        ],
        linked_decisions=["adr-001"],
    )

    commit_2 = GitCommit(
        hash="2222222222222222222222222222222222222222",
        short_hash="2222222",
        author_name="Knovra Core",
        author_email="dev@knovra.io",
        date=datetime.now(UTC),
        subject="feat(decision): integrate supersession tracking per ADR-004",
        body="Implement resilient storage fallback.",
        changed_files=[
            FileChange(path="services/context-engine/app/main.py", status="modified", additions=45, deletions=5),
        ],
        linked_decisions=["adr-004"],
    )

    store.add_commits([commit_1, commit_2])
    store.add_branches([GitBranch(name="main", commit_hash=commit_2.hash, is_head=True)])
    store.add_tags([GitTag(name="v0.1.0", commit_hash=commit_2.hash)])

    # Query commit by short hash
    retrieved = store.get_commit("1111111")
    assert retrieved is not None
    assert retrieved.subject == "feat(core): setup monorepo structure per ADR-001"

    # Query commits for a decision
    adr1_commits = store.get_commits_for_decision("adr-001")
    assert len(adr1_commits) == 1
    assert adr1_commits[0].short_hash == "1111111"

    # Query commits for file
    main_py_commits = store.get_commits_for_file("services/context-engine/app/main.py")
    assert len(main_py_commits) == 2

    # Trace decision
    trace = store.trace_decision("adr-001")
    assert trace.query_type == "decision"
    assert len(trace.commits) == 1
    assert "services/runtime/cmd/knovra/main.go" in trace.modified_files


def test_conversation_and_git_api_e2e(test_client):
    # 1. Ingest conversation via REST API
    conv_payload = {
        "title": "API Review and Decision Discussion",
        "format": "generic",
        "content": [
            {
                "role": "user",
                "content": "Let's review ADR-001 for monorepo and ADR-004 for vector storage.",
            },
            {
                "role": "assistant",
                "content": "The changes in services/context-engine/app/main.py satisfy all requirements.",
            },
        ],
        "project_id": "test-proj",
    }
    resp = test_client.post("/conversations/ingest", json=conv_payload)
    assert resp.status_code == 201
    ingest_data = resp.json()
    assert "adr-001" in ingest_data["decisions_detected"]
    assert "adr-004" in ingest_data["decisions_detected"]
    session_id = ingest_data["session_id"]

    # 2. Get sessions list
    resp = test_client.get("/conversations/sessions")
    assert resp.status_code == 200
    sessions = resp.json()
    assert any(s["id"] == session_id for s in sessions)

    # 3. Get session facts
    resp = test_client.get(f"/conversations/sessions/{session_id}/facts")
    assert resp.status_code == 200
    facts = resp.json()
    assert len(facts) > 0

    # 4. Ingest Git history via REST API
    git_payload = {
        "project_id": "test-proj",
        "repository_id": "knovra",
        "commits": [
            {
                "hash": "abcdef1234567890abcdef1234567890abcdef12",
                "short_hash": "abcdef1",
                "author_name": "Alice Developer",
                "author_email": "alice@knovra.io",
                "date": datetime.now(UTC).isoformat(),
                "subject": "feat: connect ADR-001 to services/context-engine/app/main.py",
                "body": "Connected architecture decision to codebase.",
                "changed_files": [
                    {
                        "path": "services/context-engine/app/main.py",
                        "status": "modified",
                        "additions": 30,
                        "deletions": 2,
                    }
                ],
                "linked_decisions": ["adr-001"],
                "pr_references": ["#42"],
            }
        ],
        "branches": [{"name": "develop", "commit_hash": "abcdef1234567890abcdef1234567890abcdef12"}],
        "tags": [{"name": "v0.2.0", "commit_hash": "abcdef1234567890abcdef1234567890abcdef12"}],
    }
    resp = test_client.post("/git/ingest", json=git_payload)
    assert resp.status_code == 201
    git_res = resp.json()
    assert git_res["commits_ingested"] == 1
    assert "adr-001" in git_res["decisions_linked"]

    # 5. Query commits
    resp = test_client.get("/git/commits?decision_id=adr-001")
    assert resp.status_code == 200
    commits = resp.json()
    assert len(commits) == 1
    assert commits[0]["short_hash"] == "abcdef1"

    # 6. Trace decision (Decision -> Commits -> Files -> Conversations)
    resp = test_client.get("/trace/decision/adr-001")
    assert resp.status_code == 200
    trace_dec = resp.json()
    assert trace_dec["decision_id"] == "adr-001"
    assert len(trace_dec["commits"]) == 1
    assert "services/context-engine/app/main.py" in trace_dec["modified_files"]
    assert len(trace_dec["conversations"]) >= 1

    # 7. Trace file (File -> Commits -> Decisions -> Conversations)
    resp = test_client.get("/trace/file/services/context-engine/app/main.py")
    assert resp.status_code == 200
    trace_file = resp.json()
    assert trace_file["query_type"] == "file"
    assert len(trace_file["commits"]) >= 1
    assert len(trace_file["conversations"]) >= 1
