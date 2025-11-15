"""
Bypass Permission Configuration Module

This module provides configuration for Claude Code's bypass permission mode.
When enabled, all tool permissions are automatically approved without user confirmation.
"""

import os


class BypassPermissionConfig:
    """
    Configuration class for bypass permission mode.

    Reads the CLAUDE_BYPASS_PERMISSION environment variable to determine
    whether to bypass permission requests for all tools.

    Attributes:
        enabled (bool): True if bypass mode is enabled, False otherwise
    """

    def __init__(self):
        """
        Initialize the bypass permission configuration.

        Reads CLAUDE_BYPASS_PERMISSION environment variable:
        - Values: '1', 'true', 'yes', 'on' → enabled
        - Values: '0', 'false', 'no', 'off' → disabled
        - Default: '1' (enabled if not set)
        """
        env_value = os.getenv('CLAUDE_BYPASS_PERMISSION', '1')
        self.enabled = env_value.lower() in ['1', 'true', 'yes', 'on']

    def should_bypass(self, tool_name: str) -> bool:
        """
        Check if permission should be bypassed for a given tool.

        Args:
            tool_name (str): Name of the tool (e.g., 'Bash', 'Write', 'Edit')

        Returns:
            bool: True if bypass is enabled, False otherwise

        Note:
            Currently returns the same value for all tools. In future versions,
            this could be extended to support per-tool bypass configuration.
        """
        return self.enabled

    def __repr__(self) -> str:
        """String representation of the config."""
        status = "ENABLED" if self.enabled else "DISABLED"
        return f"BypassPermissionConfig(enabled={self.enabled}, status={status})"
