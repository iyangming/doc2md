from doc2md.processors.base import BaseProcessor
from doc2md.processors.docx import DocxProcessor
from doc2md.processors.pdf import PdfProcessor
from doc2md.processors.pptx import PptxProcessor
from doc2md.processors.xlsx import XlsxProcessor

PROCESSORS = [DocxProcessor, PdfProcessor, PptxProcessor, XlsxProcessor]

def get_processor(file_path: str) -> BaseProcessor:
    """Get the appropriate processor for a file."""
    for processor in PROCESSORS:
        if processor.can_process(file_path):
            return processor
    raise ValueError(f"Unsupported file format: {file_path}")