import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
    DEEPSEEK_MODEL = os.getenv("DEEPSEEK_MODEL", "gpt-4.1")
    DEEPSEEK_API_BASE = os.getenv("DEEPSEEK_API_BASE", "https://api.deepseek.com/v1")
    DEEPSEEK_OCR_THRESHOLD = float(os.getenv("DEEPSEEK_OCR_THRESHOLD", "0.8"))
    DEFAULT_OCR_MODE = os.getenv("DEFAULT_OCR_MODE", "full")
    MAX_FILE_SIZE_MB = int(os.getenv("MAX_FILE_SIZE_MB", "50"))
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    PROJECTS_DIR = "projects"
    ASSETS_DIR = "assets"

config = Config()