from dataclasses import dataclass
from typing import Optional

@dataclass
class ConversionResult:
    markdown: str
    assets: list[str]
    project_id: str
    filename: str

@dataclass
class ProjectInfo:
    project_id: str
    created_at: str
    files: list[str]
    assets: list[str]

@dataclass
class OCRResult:
    text: str
    confidence: float
    source: str  # "tesseract" or "deepseek"