from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    knovra_env: str = "development"
    knovra_log_level: str = "info"
    port_context_engine: int = 8000
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "knovra"
    postgres_password: str = "knovra_dev_password"
    postgres_db: str = "knovra"
    neo4j_uri: str = "bolt://localhost:7687"
    redis_url: str = "redis://localhost:6379/0"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
