import pytest
from dataclasses import dataclass
from doc2md.models import ConversionResult, ProjectInfo, OCRResult


class TestModels:
    """Test data models."""

    def test_conversion_result_creation(self):
        """ConversionResult should store all fields."""
        result = ConversionResult(
            markdown="# Test",
            assets=["assets/test/image.png"],
            project_id="2026-05-14-1430",
            filename="test.md"
        )
        assert result.markdown == "# Test"
        assert result.assets == ["assets/test/image.png"]
        assert result.project_id == "2026-05-14-1430"
        assert result.filename == "test.md"

    def test_project_info_creation(self):
        """ProjectInfo should store all fields."""
        info = ProjectInfo(
            project_id="2026-05-14-1430",
            created_at="2026-05-14T14:30:00",
            files=["doc1.md", "doc2.md"],
            assets=["assets/doc1/img.png"]
        )
        assert info.project_id == "2026-05-14-1430"
        assert info.created_at == "2026-05-14T14:30:00"
        assert len(info.files) == 2
        assert len(info.assets) == 1

    def test_ocr_result_creation(self):
        """OCRResult should store all fields."""
        result = OCRResult(
            text="Hello World",
            confidence=0.95,
            source="tesseract"
        )
        assert result.text == "Hello World"
        assert result.confidence == 0.95
        assert result.source == "tesseract"

    def test_ocr_result_sources(self):
        """OCRResult source can be different values."""
        result_tesseract = OCRResult(text="text", confidence=0.8, source="tesseract")
        result_deepseek = OCRResult(text="text", confidence=0.9, source="deepseek")
        assert result_tesseract.source == "tesseract"
        assert result_deepseek.source == "deepseek"