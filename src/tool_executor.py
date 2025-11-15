"""
Tool Executor Module with Bypass Permission Support

This module provides the core tool execution logic with integrated bypass
permission checking. It determines whether to request user permission or
bypass it based on the configuration.
"""

from typing import Any, Callable, Dict, Optional
from src.bypass_permission_config import BypassPermissionConfig


class PermissionDenied(Exception):
    """Raised when user denies permission for a tool execution."""
    pass


class ToolExecutor:
    """
    Tool executor with bypass permission support.

    Attributes:
        config (BypassPermissionConfig): Bypass permission configuration
    """

    def __init__(self, config: Optional[BypassPermissionConfig] = None):
        """
        Initialize the tool executor.

        Args:
            config (BypassPermissionConfig, optional): Configuration instance.
                If not provided, creates a new one.
        """
        self.config = config if config is not None else BypassPermissionConfig()

    def execute_tool(
        self,
        tool_name: str,
        tool_func: Callable,
        request_permission_func: Optional[Callable] = None,
        **kwargs
    ) -> Any:
        """
        Execute a tool with bypass permission checking.

        Args:
            tool_name (str): Name of the tool (e.g., 'Bash', 'Write', 'Edit')
            tool_func (Callable): The tool function to execute
            request_permission_func (Callable, optional): Function to request
                user permission. If None, assumes permission is always granted
                when bypass is disabled.
            **kwargs: Arguments to pass to the tool function

        Returns:
            Any: Result from the tool function

        Raises:
            PermissionDenied: If bypass is disabled and user denies permission
        """
        if self.config.should_bypass(tool_name):
            # Bypass mode: Skip permission request, execute immediately
            return tool_func(**kwargs)
        else:
            # Standard mode: Request permission first
            if request_permission_func is None:
                # No permission function provided, assume granted
                return tool_func(**kwargs)

            # Request user permission
            permission_granted = request_permission_func(tool_name, **kwargs)

            if permission_granted:
                return tool_func(**kwargs)
            else:
                raise PermissionDenied(
                    f"User denied permission for tool: {tool_name}"
                )

    def is_bypass_enabled(self) -> bool:
        """
        Check if bypass mode is currently enabled.

        Returns:
            bool: True if bypass is enabled, False otherwise
        """
        return self.config.enabled

    def __repr__(self) -> str:
        """String representation of the executor."""
        return f"ToolExecutor(bypass_enabled={self.config.enabled})"
