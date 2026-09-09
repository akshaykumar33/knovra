from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    knovra_env: str = "development"
    knovra_log_level: str = "info"
    port_context_engine: int = 8000

    # PostgreSQL / pgvector
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "knovra"
    postgres_password: str = "knovra_dev_password"
    postgres_db: str = "knovra"

    # Neo4j & Redis
    neo4j_uri: str = "bolt://localhost:7687"
    redis_url: str = "redis://localhost:6379/0"

    # Semantic Memory Configuration (Phase 05)
    embedding_provider: str = "local"  # "local", "openai", "ollama"
    embedding_model: str = "knovra-deterministic-dense-v1"
    embedding_dimension: int = 384
    openai_api_key: Optional[str] = None
    ollama_base_url: str = "http://localhost:11434"

    # Chunking Configuration
    chunk_max_chars: int = 1200
    chunk_overlap_chars: int = 150

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
