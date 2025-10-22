from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    
    # Auth settings
    SECRET_KEY: str = "your-super-secret-key-change-this" # Change this!
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env" # In case you want to use a .env file locally

# Create a single instance to be imported by other modules
settings = Settings()