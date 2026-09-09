"""Knovra Context Engine - Embedding Provider Adapters.

Supports:
1. DeterministicLocalEmbeddingProvider: 100% offline, zero external dependency,
   dense semantic-hash unit vector embedding (satisfies Invariant #7: Local-first).
2. OpenAIEmbeddingProvider: OpenAI embeddings (e.g. text-embedding-3-small).
3. OllamaEmbeddingProvider: Local Ollama daemon embeddings (e.g. nomic-embed-text).
"""

import abc
import hashlib
import math
import re
from typing import List, Optional
import httpx


class BaseEmbeddingProvider(abc.ABC):
    """Abstract base class for all embedding model adapters."""

    @property
    @abc.abstractmethod
    def model_name(self) -> str:
        """Returns the canonical model name and version."""
        pass

    @property
    @abc.abstractmethod
    def dimension(self) -> int:
        """Returns vector embedding dimension."""
        pass

    @abc.abstractmethod
    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        """Embeds a batch of texts into dense vectors."""
        pass

    async def embed_query(self, query: str) -> List[float]:
        """Embeds a single search query string."""
        results = await self.embed_texts([query])
        return results[0]


class DeterministicLocalEmbeddingProvider(BaseEmbeddingProvider):
    """Deterministic local embedding provider.

    Uses dense subword n-gram hashing and term-frequency pooling with L2 normalization.
    Guarantees deterministic, reproducible cosine similarity for testing, CI,
    and air-gapped local-first environments without GPU or external API keys.
    """

    def __init__(self, dimension: int = 384, version: str = "v1"):
        self._dim = dimension
        self._version = version

    @property
    def model_name(self) -> str:
        return f"knovra-deterministic-dense-{self._version}"

    @property
    def dimension(self) -> int:
        return self._dim

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        embeddings: List[List[float]] = []
        for text in texts:
            embeddings.append(self._compute_vector(text))
        return embeddings

    def _compute_vector(self, text: str) -> List[float]:
        vec = [0.0] * self._dim
        if not text:
            return vec

        # Tokenize words and character 3-grams
        words = re.findall(r"[a-zA-Z0-9_\-\./]+", text.lower())
        tokens = list(words)
        for w in words:
            if len(w) >= 3:
                tokens.extend([w[i : i + 3] for i in range(len(w) - 2)])

        if not tokens:
            return vec

        for token in tokens:
            # Hash token deterministically across dimensions
            h = hashlib.sha256(token.encode("utf-8")).digest()
            idx1 = int.from_bytes(h[:4], "big") % self._dim
            idx2 = int.from_bytes(h[4:8], "big") % self._dim
            sign1 = 1.0 if (h[8] % 2 == 0) else -1.0
            sign2 = 1.0 if (h[9] % 2 == 0) else -1.0

            vec[idx1] += sign1
            vec[idx2] += 0.5 * sign2

        # L2-normalize vector to unit length
        norm = math.sqrt(sum(x * x for x in vec))
        if norm > 0.0:
            vec = [x / norm for x in vec]

        return vec


class OpenAIEmbeddingProvider(BaseEmbeddingProvider):
    """Adapter for OpenAI Embeddings API (text-embedding-3-small, etc.)."""

    def __init__(self, api_key: str, model: str = "text-embedding-3-small", dimension: int = 1536):
        self._api_key = api_key
        self._model = model
        self._dim = dimension

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return self._dim

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        url = "https://api.openai.com/v1/embeddings"
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }
        payload = {
            "input": texts,
            "model": self._model,
        }
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(url, headers=headers, json=payload)
            resp.raise_for_status()
            data = resp.json()
            return [item["embedding"] for item in data["data"]]


class OllamaEmbeddingProvider(BaseEmbeddingProvider):
    """Adapter for local Ollama Embeddings API (nomic-embed-text, etc.)."""

    def __init__(self, base_url: str = "http://localhost:11434", model: str = "nomic-embed-text", dimension: int = 768):
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._dim = dimension

    @property
    def model_name(self) -> str:
        return self._model

    @property
    def dimension(self) -> int:
        return self._dim

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        url = f"{self._base_url}/api/embeddings"
        embeddings: List[List[float]] = []
        async with httpx.AsyncClient(timeout=30.0) as client:
            for text in texts:
                resp = await client.post(url, json={"model": self._model, "prompt": text})
                resp.raise_for_status()
                data = resp.json()
                embeddings.append(data["embedding"])
        return embeddings


def get_embedding_provider(
    provider_type: str = "local",
    api_key: Optional[str] = None,
    model_name: Optional[str] = None,
    dimension: int = 384,
) -> BaseEmbeddingProvider:
    """Factory helper to instantiate configured embedding provider."""
    provider_type = provider_type.lower()
    if provider_type == "openai" and api_key:
        return OpenAIEmbeddingProvider(api_key=api_key, model=model_name or "text-embedding-3-small", dimension=1536)
    elif provider_type == "ollama":
        return OllamaEmbeddingProvider(model=model_name or "nomic-embed-text", dimension=768)
    else:
        return DeterministicLocalEmbeddingProvider(dimension=dimension)
