import pytest
from doc2md.processors import get_processor, PROCESSORS
from doc2md.processors.docx import DocxProcessor
from doc2md.processors.pdf import PdfProcessor
from doc2md.processors.pptx import PptxProcessor
from doc2md.processors.xlsx import XlsxProcessor


class TestProcessorDetection:
    """Test processor selection based on file extension."""

    def test_get_processor_docx(self):
        """Should return DocxProcessor class for .docx files."""
        processor_class = get_processor("test.docx")
        assert processor_class == DocxProcessor

    def test_get_processor_pdf(self):
        """Should return PdfProcessor class for .pdf files."""
        processor_class = get_processor("test.pdf")
        assert processor_class == PdfProcessor

    def test_get_processor_pptx(self):
        """Should return PptxProcessor class for .pptx files."""
        processor_class = get_processor("test.pptx")
        assert processor_class == PptxProcessor

    def test_get_processor_ppt(self):
        """Should return PptxProcessor class for .ppt files."""
        processor_class = get_processor("test.ppt")
        assert processor_class == PptxProcessor

    def test_get_processor_xlsx(self):
        """Should return XlsxProcessor class for .xlsx files."""
        processor_class = get_processor("test.xlsx")
        assert processor_class == XlsxProcessor

    def test_get_processor_xls(self):
        """Should return XlsxProcessor class for .xls files."""
        processor_class = get_processor("test.xls")
        assert processor_class == XlsxProcessor

    def test_get_processor_csv(self):
        """Should return XlsxProcessor class for .csv files."""
        processor_class = get_processor("test.csv")
        assert processor_class == XlsxProcessor

    def test_get_processor_unsupported(self):
        """Should raise ValueError for unsupported formats."""
        with pytest.raises(ValueError) as exc_info:
            get_processor("test.txt")
        assert "Unsupported file format" in str(exc_info.value)

    def test_get_processor_case_insensitive(self):
        """Should handle uppercase extensions."""
        processor_class = get_processor("test.DOCX")
        assert processor_class == DocxProcessor

    def test_processors_list_complete(self):
        """All processors should be in PROCESSORS list."""
        assert DocxProcessor in PROCESSORS
        assert PdfProcessor in PROCESSORS
        assert PptxProcessor in PROCESSORS
        assert XlsxProcessor in PROCESSORS
        assert len(PROCESSORS) == 4