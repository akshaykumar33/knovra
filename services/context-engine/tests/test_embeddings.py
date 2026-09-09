import math

import pytest

from app.embeddings.adapter import DeterministicLocalEmbeddingProvider


@pytest.mark.asyncio
async def test_deterministic_embedding_properties():
    provider = DeterministicLocalEmbeddingProvider(dimension=384)
    assert provider.dimension == 384
    assert "deterministic" in provider.model_name

    text = "Knovra parses AST syntax trees and extracts symbols"
    emb1 = await provider.embed_query(text)
    emb2 = await provider.embed_query(text)

    # Determinism
    assert emb1 == emb2
    assert len(emb1) == 384

    # Unit length (L2 norm should be 1.0)
    norm = math.sqrt(sum(x * x for x in emb1))
    assert pytest.approx(norm, rel=1e-5) == 1.0


@pytest.mark.asyncio
async def test_semantic_similarity_ranking():
    provider = DeterministicLocalEmbeddingProvider(dimension=384)

    query = "syntax tree parser for python and rust"
    related = "AST parser extracts abstract syntax tree symbols for rust and python code"
    unrelated = "chocolate banana cake recipe with sweet frosting and butter"

    v_query = await provider.embed_query(query)
    v_rel = await provider.embed_query(related)
    v_unrel = await provider.embed_query(unrelated)

    sim_rel = sum(a * b for a, b in zip(v_query, v_rel))
    sim_unrel = sum(a * b for a, b in zip(v_query, v_unrel))

    assert sim_rel > sim_unrel
    assert sim_rel > 0.3
