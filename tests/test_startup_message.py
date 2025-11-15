"""
Unit tests for startup_message module.

Tests the startup message display functions for bypass permission mode.
"""

import os
import pytest
from io import StringIO
from unittest.mock import patch
from src.startup_message import (
    print_startup_message,
    get_startup_message,
    _get_bypass_enabled_message,
    _get_bypass_disabled_message
)
from src.bypass_permission_config import BypassPermissionConfig


class TestStartupMessage:
    """Test suite for startup message functions."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_bypass_enabled_message_content(self):
        """Test bypass enabled message contains required elements."""
        message = _get_bypass_enabled_message()

        assert '⚡' in message or 'Bypass Permission Mode: ENABLED' in message
        assert 'ENABLED' in message
        assert 'auto-approved' in message
        assert 'CLAUDE_BYPASS_PERMISSION' in message
        assert '━' in message  # Box drawing character

    def test_bypass_disabled_message_content(self):
        """Test bypass disabled message contains required elements."""
        message = _get_bypass_disabled_message()

        assert '🔒' in message or 'Permission Mode' in message
        assert 'Standard' in message or 'manual approval' in message

    def test_get_startup_message_when_enabled(self):
        """Test get_startup_message returns enabled message when bypass is on."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()

        message = get_startup_message(config)

        assert 'ENABLED' in message
        assert 'auto-approved' in message

    def test_get_startup_message_when_disabled(self):
        """Test get_startup_message returns disabled message when bypass is off."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        config = BypassPermissionConfig()

        message = get_startup_message(config)

        assert 'Standard' in message or 'manual approval' in message
        assert 'ENABLED' not in message

    def test_get_startup_message_creates_config_if_none(self):
        """Test get_startup_message creates config if not provided."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'

        message = get_startup_message()

        assert 'ENABLED' in message

    @patch('sys.stdout', new_callable=StringIO)
    def test_print_startup_message_when_enabled(self, mock_stdout):
        """Test print_startup_message outputs enabled message."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()

        print_startup_message(config)

        output = mock_stdout.getvalue()
        assert 'ENABLED' in output
        assert 'auto-approved' in output

    @patch('sys.stdout', new_callable=StringIO)
    def test_print_startup_message_when_disabled(self, mock_stdout):
        """Test print_startup_message outputs disabled message."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        config = BypassPermissionConfig()

        print_startup_message(config)

        output = mock_stdout.getvalue()
        assert 'Standard' in output or 'manual approval' in output

    @patch('sys.stdout', new_callable=StringIO)
    def test_print_startup_message_creates_config_if_none(self, mock_stdout):
        """Test print_startup_message creates config if not provided."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'

        print_startup_message()

        output = mock_stdout.getvalue()
        assert 'ENABLED' in output

    def test_message_consistency(self):
        """Test get and print functions return same message."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        config = BypassPermissionConfig()

        get_message = get_startup_message(config)

        with patch('sys.stdout', new_callable=StringIO) as mock_stdout:
            print_startup_message(config)
            print_message = mock_stdout.getvalue()

        # Trim whitespace for comparison
        assert get_message.strip() in print_message.strip()


class TestStartupMessageAllModes:
    """Test startup messages for all configuration modes."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    @pytest.mark.parametrize("env_value,expected_keyword", [
        ('1', 'ENABLED'),
        ('true', 'ENABLED'),
        ('yes', 'ENABLED'),
        ('on', 'ENABLED'),
        ('0', 'Standard'),
        ('false', 'Standard'),
        ('no', 'Standard'),
        ('off', 'Standard'),
    ])
    def test_message_for_all_env_values(self, env_value, expected_keyword):
        """Test startup message for all supported environment values."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = env_value

        message = get_startup_message()

        assert expected_keyword in message

    def test_default_message_when_env_not_set(self):
        """Test default message when environment variable not set."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

        message = get_startup_message()

        # Default is enabled (ON)
        assert 'ENABLED' in message


class TestStartupMessageFormat:
    """Test message formatting and special characters."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_enabled_message_has_emoji(self):
        """Test enabled message includes lightning emoji."""
        message = _get_bypass_enabled_message()
        assert '⚡' in message

    def test_disabled_message_has_emoji(self):
        """Test disabled message includes lock emoji."""
        message = _get_bypass_disabled_message()
        assert '🔒' in message

    def test_enabled_message_has_box_drawing(self):
        """Test enabled message includes decorative box drawing."""
        message = _get_bypass_enabled_message()
        assert '━' in message

    def test_enabled_message_multiline(self):
        """Test enabled message is multiline."""
        message = _get_bypass_enabled_message()
        assert '\n' in message
        lines = message.strip().split('\n')
        assert len(lines) >= 3  # At least 3 lines

    def test_disabled_message_single_line(self):
        """Test disabled message is single line."""
        message = _get_bypass_disabled_message()
        # Should be a single line (no internal newlines)
        assert message.count('\n') == 0

    def test_enabled_message_includes_instructions(self):
        """Test enabled message includes disable instructions."""
        message = _get_bypass_enabled_message()
        assert 'export CLAUDE_BYPASS_PERMISSION=0' in message

    def test_messages_are_strings(self):
        """Test all message functions return strings."""
        assert isinstance(_get_bypass_enabled_message(), str)
        assert isinstance(_get_bypass_disabled_message(), str)
        assert isinstance(get_startup_message(), str)

    def test_messages_are_not_empty(self):
        """Test all messages contain content."""
        assert len(_get_bypass_enabled_message().strip()) > 0
        assert len(_get_bypass_disabled_message().strip()) > 0

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        assert len(get_startup_message().strip()) > 0

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        assert len(get_startup_message().strip()) > 0
