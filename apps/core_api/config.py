from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/core.db"
    service_token: str = "dev-service-token"
    artifact_root: str = "./data/artifacts"
    max_repairs: int = 3
    workspace_root: str = "./data/worktrees"
    default_runner: str = "ollama"
    default_model: str = "llama3.2:3b"
    ollama_base_url: str = "http://127.0.0.1:11434"
    ollama_model: str = "llama3.2:3b"
    force_ollama: bool = False
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
