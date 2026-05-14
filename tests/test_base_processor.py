import pytest
from pathlib import Path
from doc2md.processors.base import BaseProcessor
from doc2md.models import ConversionResult


class ConcreteProcessor(BaseProcessor):
    """Concrete implementation for testing BaseProcessor."""
    SUPPORTED_EXTENSIONS = [".test"]

    def process(self, file_path: str) -> ConversionResult:
        return ConversionResult(
            markdown="test",
            assets=[],
            project_id=self.project_id,
            filename="test.md"
        )


class TestBaseProcessor:
    """Test BaseProcessor methods."""

    def test_can_process_supported_extension(self):
        """Should return True for supported extensions."""
        assert ConcreteProcessor.can_process("file.test") is True
        assert ConcreteProcessor.can_process("file.TEST") is True

    def test_can_process_unsupported_extension(self):
        """Should return False for unsupported extensions."""
        assert ConcreteProcessor.can_process("file.txt") is False
        assert ConcreteProcessor.can_process("file.docx") is False

    def test_slugify_lowercase(self):
        """Should convert text to lowercase."""
        processor = ConcreteProcessor("test-project")
        result = processor.slugify("HelloWorld")
        assert result == "helloworld"

    def test_slugify_special_chars(self):
        """Should remove special characters."""
        processor = ConcreteProcessor("test-project")
        result = processor.slugify("Hello@World!Test")
        assert "@" not in result
        assert "!" not in result

    def test_slugify_spaces_become_hyphens(self):
        """Should replace spaces with hyphens."""
        processor = ConcreteProcessor("test-project")
        result = processor.slugify("hello world test")
        assert result == "hello-world-test"

    def test_slugify_trim_hyphens(self):
        """Should trim leading and trailing hyphens."""
        processor = ConcreteProcessor("test-project")
        result = processor.slugify("  hello world  ")
        assert not result.startswith("-")
        assert not result.endswith("-")

    def test_build_front_matter_empty(self):
        """Should return empty string for empty metadata."""
        processor = ConcreteProcessor("test-project")
        result = processor.build_front_matter({})
        assert result == ""

    def test_build_front_matter_with_values(self):
        """Should build valid YAML front matter."""
        processor = ConcreteProcessor("test-project")
        metadata = {"title": "Test Doc", "author": "John"}
        result = processor.build_front_matter(metadata)
        assert "---" in result
        assert "title: Test Doc" in result
        assert "author: John" in result

    def test_build_front_matter_skips_empty_values(self):
        """Should skip metadata fields with empty values."""
        processor = ConcreteProcessor("test-project")
        metadata = {"title": "Test", "author": ""}
        result = processor.build_front_matter(metadata)
        assert "title: Test" in result
        assert "author" not in result

    def test_extract_metadata_default(self):
        """Should return empty dict by default."""
        processor = ConcreteProcessor("test-project")
        result = processor.extract_metadata(None)
        assert result == {}