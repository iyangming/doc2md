from abc import ABC, abstractmethod
from typing import Optional
from pathlib import Path
from doc2md.models import ConversionResult
from doc2md.config import config

class BaseProcessor(ABC):
    """Base class for all document processors."""

    SUPPORTED_EXTENSIONS: list[str] = []

    def __init__(self, project_id: str, ocr_mode: str = "full"):
        self.project_id = project_id
        self.ocr_mode = ocr_mode
        self.assets: list[str] = []

    @classmethod
    def can_process(cls, file_path: str) -> bool:
        """Check if this processor can handle the given file."""
        ext = Path(file_path).suffix.lower()
        return ext in cls.SUPPORTED_EXTENSIONS

    @abstractmethod
    def process(self, file_path: str) -> ConversionResult:
        """Process a document and return ConversionResult."""
        pass

    def get_asset_path(self, doc_name: str, image_name: str) -> Path:
        """Get the asset directory path for a document."""
        assets_dir = Path(config.PROJECTS_DIR) / self.project_id / config.ASSETS_DIR / doc_name
        assets_dir.mkdir(parents=True, exist_ok=True)
        return assets_dir / image_name

    def save_asset(self, doc_name: str, image_name: str, data: bytes) -> str:
        """Save an asset and return its relative path."""
        asset_path = self.get_asset_path(doc_name, image_name)
        asset_path.write_bytes(data)
        relative_path = f"{config.ASSETS_DIR}/{doc_name}/{image_name}"
        self.assets.append(relative_path)
        return relative_path

    def extract_metadata(self, doc) -> dict:
        """Extract metadata from document."""
        return {}

    def build_front_matter(self, metadata: dict) -> str:
        """Build YAML front-matter from metadata."""
        if not metadata:
            return ""
        lines = ["---"]
        for key, value in metadata.items():
            if value:
                lines.append(f"{key}: {value}")
        lines.append("---\n")
        return "\n".join(lines)

    def slugify(self, text: str) -> str:
        """Convert text to a URL-safe slug."""
        import re
        text = text.lower()
        text = re.sub(r'[^\w\s-]', '', text)
        text = re.sub(r'[\s_-]+', '-', text)
        text = re.sub(r'^-+|-+$', '', text)
        return text