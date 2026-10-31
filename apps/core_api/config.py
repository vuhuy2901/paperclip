from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./data/core.db"
    service_token: str = "dev-service-token"
    artifact_root: str = "./data/artifacts"
    max_repairs: int = 3
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
