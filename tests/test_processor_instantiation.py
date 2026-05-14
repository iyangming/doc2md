import pytest
from doc2md.processors import get_processor
from doc2md.config import config


class TestProcessorInstantiation:
    """Test that get_processor returns a class that can be instantiated."""

    def test_get_processor_returns_class(self):
        """get_processor should return a class, not an instance."""
        processor_class = get_processor("test.pdf")
        # Should be a class
        assert isinstance(processor_class, type)

    def test_processor_class_has_process_method(self):
        """Processor class should have process method."""
        processor_class = get_processor("test.pdf")
        assert hasattr(processor_class, 'process')
        assert callable(processor_class.process)

    def test_processor_can_be_instantiated(self):
        """Processor class can be instantiated with project_id."""
        processor_class = get_processor("test.pdf")
        processor = processor_class(project_id="test-project")
        assert processor is not None
        assert processor.project_id == "test-project"

    def test_processor_instance_can_process(self):
        """Processor instance has process method that accepts file_path."""
        processor_class = get_processor("test.pdf")
        processor = processor_class(project_id="test-project")
        # process method should exist and be callable
        assert hasattr(processor, 'process')
        assert callable(processor.process)