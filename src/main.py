"""
Main Entry Point for Claude Code Bypass Permission Mode

This module provides the main integration of all bypass permission components.
It initializes the configuration, executor, and displays the startup message.
"""

from typing import Any, Callable, Optional
from src.bypass_permission_config import BypassPermissionConfig
from src.tool_executor import ToolExecutor, PermissionDenied
from src.startup_message import print_startup_message


# Global configuration and executor instances
bypass_config = BypassPermissionConfig()
tool_executor = ToolExecutor(config=bypass_config)


def initialize() -> None:
    """
    Initialize the bypass permission system.

    This should be called when Claude Code starts.
    Displays the startup message showing current bypass mode status.
    """
    print_startup_message(bypass_config)


def execute_tool(
    tool_name: str,
    tool_func: Callable,
    request_permission_func: Optional[Callable] = None,
    **kwargs
) -> Any:
    """
    Execute a tool with bypass permission checking.

    This is the main function to be used throughout Claude Code for
    executing tools with bypass permission support.

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

    Example:
        >>> def my_tool(x, y):
        ...     return x + y
        >>> result = execute_tool('MyTool', my_tool, x=10, y=20)
        >>> print(result)
        30
    """
    return tool_executor.execute_tool(
        tool_name,
        tool_func,
        request_permission_func,
        **kwargs
    )


def is_bypass_enabled() -> bool:
    """
    Check if bypass mode is currently enabled.

    Returns:
        bool: True if bypass is enabled, False otherwise

    Example:
        >>> if is_bypass_enabled():
        ...     print("Bypass mode is ON")
        ... else:
        ...     print("Standard permission mode")
    """
    return bypass_config.enabled


def get_config() -> BypassPermissionConfig:
    """
    Get the global bypass permission configuration.

    Returns:
        BypassPermissionConfig: The global configuration instance
    """
    return bypass_config


def get_executor() -> ToolExecutor:
    """
    Get the global tool executor.

    Returns:
        ToolExecutor: The global executor instance
    """
    return tool_executor


if __name__ == '__main__':
    # Example usage when running as script
    initialize()

    print("\n--- Example Tool Executions ---\n")

    # Example 1: Simple tool
    def example_tool(message):
        return f"Tool executed: {message}"

    result = execute_tool('ExampleTool', example_tool, message="Hello World")
    print(f"Result: {result}")

    # Example 2: Check bypass status
    print(f"\nBypass mode enabled: {is_bypass_enabled()}")

    # Example 3: Tool with permission function
    def permission_func(tool_name, **kwargs):
        print(f"Permission requested for {tool_name}")
        return True

    result2 = execute_tool(
        'AnotherTool',
        lambda x: x * 2,
        permission_func,
        x=21
    )
    print(f"Result: {result2}")
