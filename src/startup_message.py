"""
Startup Message Module for Bypass Permission Mode

This module provides functions to display the bypass permission mode
status when Claude Code starts.
"""

from typing import Optional
from src.bypass_permission_config import BypassPermissionConfig


def print_startup_message(config: Optional[BypassPermissionConfig] = None) -> None:
    """
    Print startup message showing bypass permission mode status.

    Args:
        config (BypassPermissionConfig, optional): Configuration instance.
            If not provided, creates a new one.
    """
    if config is None:
        config = BypassPermissionConfig()

    if config.enabled:
        print(_get_bypass_enabled_message())
    else:
        print(_get_bypass_disabled_message())


def _get_bypass_enabled_message() -> str:
    """Get the message for bypass enabled mode."""
    return """
⚡ Bypass Permission Mode: ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
All tool permissions will be auto-approved.
To disable: export CLAUDE_BYPASS_PERMISSION=0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""


def _get_bypass_disabled_message() -> str:
    """Get the message for bypass disabled mode."""
    return "🔒 Permission Mode: Standard (manual approval required)"


def get_startup_message(config: Optional[BypassPermissionConfig] = None) -> str:
    """
    Get startup message as a string without printing.

    Args:
        config (BypassPermissionConfig, optional): Configuration instance.
            If not provided, creates a new one.

    Returns:
        str: The startup message
    """
    if config is None:
        config = BypassPermissionConfig()

    if config.enabled:
        return _get_bypass_enabled_message()
    else:
        return _get_bypass_disabled_message()
