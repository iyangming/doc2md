import pytest
from doc2md.config import config


class TestConfig:
    """Test configuration loading."""

    def test_config_exists(self):
        """Config should be loaded."""
        assert config is not None

    def test_config_attributes(self):
        """Config should have all required attributes."""
        assert hasattr(config, "DEEPSEEK_API_KEY")
        assert hasattr(config, "DEEPSEEK_MODEL")
        assert hasattr(config, "DEEPSEEK_API_BASE")
        assert hasattr(config, "DEEPSEEK_OCR_THRESHOLD")
        assert hasattr(config, "DEFAULT_OCR_MODE")
        assert hasattr(config, "MAX_FILE_SIZE_MB")
        assert hasattr(config, "MAX_FILE_SIZE_BYTES")
        assert hasattr(config, "PROJECTS_DIR")
        assert hasattr(config, "ASSETS_DIR")

    def test_projects_dir_default(self):
        """Default projects directory should be 'projects'."""
        assert config.PROJECTS_DIR == "projects"

    def test_assets_dir_default(self):
        """Default assets directory should be 'assets'."""
        assert config.ASSETS_DIR == "assets"

    def test_max_file_size_bytes_calculation(self):
        """MAX_FILE_SIZE_BYTES should be MB * 1024 * 1024."""
        expected = config.MAX_FILE_SIZE_MB * 1024 * 1024
        assert config.MAX_FILE_SIZE_BYTES == expected