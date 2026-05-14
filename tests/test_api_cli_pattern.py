import pytest
from pathlib import Path
from doc2md.processors import get_processor
from doc2md.processors.pdf import PdfProcessor
from doc2md.processors.docx import DocxProcessor
from doc2md.config import config


class TestApiAndCliPattern:
    """
    Test that api.py and cli.py use the correct pattern:
    1. get_processor() returns a CLASS
    2. Must instantiate with project_id before calling process()
    """

    def test_api_cli_pattern_returns_class(self):
        """API/CLI pattern: get_processor returns class."""
        processor_class = get_processor("test.docx")
        # This is what api.py and cli.py should get
        assert isinstance(processor_class, type), "get_processor returns class, not instance"

    def test_must_instantiate_before_process(self):
        """Must instantiate processor before calling process()."""
        processor_class = get_processor("test.pdf")
        project_id = "test-project-123"

        # Correct pattern (what api.py/cli.py should do)
        processor = processor_class(project_id=project_id)
        assert processor.project_id == project_id

    def test_instantiation_sets_project_id(self):
        """project_id should be set during instantiation."""
        processor_class = get_processor("test.pdf")
        project_id = "my-custom-project"

        processor = processor_class(project_id=project_id)

        assert processor.project_id == project_id
        assert hasattr(processor, 'assets')
        assert isinstance(processor.assets, list)

    def test_instantiation_sets_ocr_mode(self):
        """ocr_mode should be set during instantiation."""
        processor_class = get_processor("test.pdf")

        processor_full = processor_class(project_id="p1", ocr_mode="full")
        processor_caption = processor_class(project_id="p2", ocr_mode="caption")

        assert processor_full.ocr_mode == "full"
        assert processor_caption.ocr_mode == "caption"


class TestProcessorWithTestFile:
    """Test processors with actual test files."""

    def test_pdf_processor_instantiation(self):
        """PdfProcessor can be instantiated."""
        processor = PdfProcessor(project_id="test-project")
        assert processor.project_id == "test-project"
        assert processor.SUPPORTED_EXTENSIONS == [".pdf"]

    def test_docx_processor_instantiation(self):
        """DocxProcessor can be instantiated."""
        processor = DocxProcessor(project_id="test-project")
        assert processor.project_id == "test-project"
        assert processor.SUPPORTED_EXTENSIONS == [".docx"]