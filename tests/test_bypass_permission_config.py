"""
Unit tests for bypass_permission_config module.

Tests the BypassPermissionConfig class to ensure correct behavior
for environment variable reading and bypass decision logic.
"""

import os
import pytest
from src.bypass_permission_config import BypassPermissionConfig


class TestBypassPermissionConfig:
    """Test suite for BypassPermissionConfig class."""

    def setup_method(self):
        """Setup before each test - clear environment variable."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test - restore environment."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_bypass_enabled_with_1(self):
        """Test bypass is enabled when env var is '1'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()
        assert config.enabled is True

    def test_bypass_enabled_with_true(self):
        """Test bypass is enabled when env var is 'true'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'true'
        config = BypassPermissionConfig()
        assert config.enabled is True

    def test_bypass_enabled_with_yes(self):
        """Test bypass is enabled when env var is 'yes'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'yes'
        config = BypassPermissionConfig()
        assert config.enabled is True

    def test_bypass_enabled_with_on(self):
        """Test bypass is enabled when env var is 'on'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'on'
        config = BypassPermissionConfig()
        assert config.enabled is True

    def test_bypass_enabled_case_insensitive(self):
        """Test bypass is enabled with uppercase values."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'TRUE'
        config = BypassPermissionConfig()
        assert config.enabled is True

        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'ON'
        config = BypassPermissionConfig()
        assert config.enabled is True

    def test_bypass_disabled_with_0(self):
        """Test bypass is disabled when env var is '0'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_bypass_disabled_with_false(self):
        """Test bypass is disabled when env var is 'false'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'false'
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_bypass_disabled_with_no(self):
        """Test bypass is disabled when env var is 'no'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'no'
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_bypass_disabled_with_off(self):
        """Test bypass is disabled when env var is 'off'."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'off'
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_bypass_default_enabled(self):
        """Test bypass is enabled by default when env var is not set."""
        # Ensure env var is not set
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

        config = BypassPermissionConfig()
        assert config.enabled is True  # Default is ON

    def test_bypass_invalid_value_treated_as_disabled(self):
        """Test invalid env var values are treated as disabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = 'invalid'
        config = BypassPermissionConfig()
        assert config.enabled is False

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '2'
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_should_bypass_returns_true_when_enabled(self):
        """Test should_bypass returns True when bypass is enabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()

        assert config.should_bypass('Bash') is True
        assert config.should_bypass('Write') is True
        assert config.should_bypass('Edit') is True
        assert config.should_bypass('Read') is True

    def test_should_bypass_returns_false_when_disabled(self):
        """Test should_bypass returns False when bypass is disabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        config = BypassPermissionConfig()

        assert config.should_bypass('Bash') is False
        assert config.should_bypass('Write') is False
        assert config.should_bypass('Edit') is False
        assert config.should_bypass('Read') is False

    def test_should_bypass_works_for_all_tools(self):
        """Test should_bypass works for various tool names."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()

        tool_names = [
            'Bash', 'Write', 'Edit', 'Read', 'Grep', 'Glob',
            'NotebookEdit', 'WebFetch', 'WebSearch', 'Task',
            'SlashCommand', 'Skill', 'BashOutput', 'KillShell'
        ]

        for tool_name in tool_names:
            assert config.should_bypass(tool_name) is True

    def test_repr(self):
        """Test string representation of config."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()
        repr_str = repr(config)

        assert 'BypassPermissionConfig' in repr_str
        assert 'enabled=True' in repr_str
        assert 'ENABLED' in repr_str

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        config = BypassPermissionConfig()
        repr_str = repr(config)

        assert 'enabled=False' in repr_str
        assert 'DISABLED' in repr_str


class TestBypassPermissionConfigEdgeCases:
    """Test edge cases and special scenarios."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_empty_string_treated_as_disabled(self):
        """Test empty string env var is treated as disabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = ''
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_whitespace_treated_as_disabled(self):
        """Test whitespace env var is treated as disabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '  '
        config = BypassPermissionConfig()
        assert config.enabled is False

    def test_mixed_case_values(self):
        """Test mixed case values work correctly."""
        test_cases = [
            ('True', True),
            ('TRUE', True),
            ('TrUe', True),
            ('Yes', True),
            ('YES', True),
            ('On', True),
            ('ON', True),
            ('False', False),
            ('FALSE', False),
            ('No', False),
            ('NO', False),
            ('Off', False),
            ('OFF', False),
        ]

        for value, expected in test_cases:
            os.environ['CLAUDE_BYPASS_PERMISSION'] = value
            config = BypassPermissionConfig()
            assert config.enabled is expected, f"Failed for value: {value}"
