"""
Unit tests for tool_executor module.

Tests the ToolExecutor class to ensure correct bypass behavior
and permission request handling.
"""

import os
import pytest
from src.tool_executor import ToolExecutor, PermissionDenied
from src.bypass_permission_config import BypassPermissionConfig


class TestToolExecutor:
    """Test suite for ToolExecutor class."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_executor_creates_config_by_default(self):
        """Test executor creates default config if not provided."""
        executor = ToolExecutor()
        assert executor.config is not None
        assert isinstance(executor.config, BypassPermissionConfig)

    def test_executor_uses_provided_config(self):
        """Test executor uses provided config instance."""
        config = BypassPermissionConfig()
        executor = ToolExecutor(config=config)
        assert executor.config is config

    def test_bypass_enabled_skips_permission(self):
        """Test tool executes immediately when bypass is enabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        # Mock tool function
        def mock_tool(x, y):
            return x + y

        # Mock permission function (should NOT be called)
        permission_called = {'called': False}

        def mock_permission(tool_name, **kwargs):
            permission_called['called'] = True
            return True

        result = executor.execute_tool(
            'TestTool',
            mock_tool,
            mock_permission,
            x=10,
            y=20
        )

        assert result == 30
        assert not permission_called['called']  # Permission NOT requested

    def test_bypass_disabled_requests_permission(self):
        """Test permission is requested when bypass is disabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()

        # Mock tool function
        def mock_tool(x, y):
            return x + y

        # Mock permission function (should be called)
        permission_called = {'called': False}

        def mock_permission(tool_name, **kwargs):
            permission_called['called'] = True
            return True

        result = executor.execute_tool(
            'TestTool',
            mock_tool,
            mock_permission,
            x=10,
            y=20
        )

        assert result == 30
        assert permission_called['called']  # Permission WAS requested

    def test_permission_denied_raises_exception(self):
        """Test PermissionDenied is raised when user denies permission."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()

        # Mock tool function
        def mock_tool(x, y):
            return x + y

        # Mock permission function that denies permission
        def mock_permission_denied(tool_name, **kwargs):
            return False

        with pytest.raises(PermissionDenied) as exc_info:
            executor.execute_tool(
                'TestTool',
                mock_tool,
                mock_permission_denied,
                x=10,
                y=20
            )

        assert 'TestTool' in str(exc_info.value)
        assert 'denied' in str(exc_info.value).lower()

    def test_no_permission_func_with_bypass_disabled(self):
        """Test tool executes when no permission func provided (bypass disabled)."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()

        # Mock tool function
        def mock_tool(x):
            return x * 2

        # No permission function provided, should still execute
        result = executor.execute_tool(
            'TestTool',
            mock_tool,
            request_permission_func=None,
            x=5
        )

        assert result == 10

    def test_is_bypass_enabled(self):
        """Test is_bypass_enabled method."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()
        assert executor.is_bypass_enabled() is True

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()
        assert executor.is_bypass_enabled() is False

    def test_execute_multiple_tools_bypass_enabled(self):
        """Test executing multiple different tools with bypass enabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        # Mock different tools
        def bash_tool(command):
            return f"Executed: {command}"

        def write_tool(path, content):
            return f"Wrote {len(content)} bytes to {path}"

        def edit_tool(path, old, new):
            return f"Replaced '{old}' with '{new}' in {path}"

        # Execute multiple tools
        bash_result = executor.execute_tool('Bash', bash_tool, command='ls')
        write_result = executor.execute_tool('Write', write_tool, path='test.txt', content='hello')
        edit_result = executor.execute_tool('Edit', edit_tool, path='test.txt', old='a', new='b')

        assert bash_result == "Executed: ls"
        assert "5 bytes" in write_result  # 'hello' is 5 bytes
        assert "test.txt" in write_result
        assert "'a'" in edit_result and "'b'" in edit_result

    def test_permission_func_receives_correct_args(self):
        """Test permission function receives tool name and kwargs."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()

        received_args = {}

        def mock_permission(tool_name, **kwargs):
            received_args['tool_name'] = tool_name
            received_args['kwargs'] = kwargs
            return True

        def mock_tool(x, y, z):
            return x + y + z

        executor.execute_tool(
            'TestTool',
            mock_tool,
            mock_permission,
            x=1,
            y=2,
            z=3
        )

        assert received_args['tool_name'] == 'TestTool'
        assert received_args['kwargs'] == {'x': 1, 'y': 2, 'z': 3}

    def test_repr(self):
        """Test string representation."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()
        repr_str = repr(executor)

        assert 'ToolExecutor' in repr_str
        assert 'bypass_enabled=True' in repr_str

        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()
        repr_str = repr(executor)

        assert 'bypass_enabled=False' in repr_str


class TestToolExecutorAllTools:
    """Test executor with all Claude Code tools."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_all_tools_bypass(self):
        """Test all Claude Code tools with bypass enabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        tool_names = [
            'Bash', 'Write', 'Edit', 'Read', 'Grep', 'Glob',
            'NotebookEdit', 'WebFetch', 'WebSearch', 'Task',
            'SlashCommand', 'Skill', 'BashOutput', 'KillShell',
            'TodoWrite', 'AskUserQuestion'
        ]

        # Mock tool function
        def mock_tool(tool_name):
            return f"Executed: {tool_name}"

        # Track permission requests
        permission_calls = []

        def mock_permission(tool_name, **kwargs):
            permission_calls.append(tool_name)
            return True

        # Execute all tools
        for tool_name in tool_names:
            result = executor.execute_tool(
                tool_name,
                lambda tn=tool_name: mock_tool(tn),
                mock_permission
            )
            assert result == f"Executed: {tool_name}"

        # Verify NO permission requests were made
        assert len(permission_calls) == 0

    def test_dangerous_commands_bypass(self):
        """Test dangerous commands execute with bypass enabled."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        dangerous_commands = [
            ('Bash', 'rm -rf /tmp/test'),
            ('Bash', 'git push --force'),
            ('Bash', 'sudo systemctl restart service'),
            ('Write', '/etc/important-config'),
        ]

        permission_calls = []

        def mock_permission(tool_name, **kwargs):
            permission_calls.append((tool_name, kwargs))
            return True

        def mock_tool(**kwargs):
            return "OK"

        # Execute dangerous commands
        for tool_name, arg in dangerous_commands:
            result = executor.execute_tool(
                tool_name,
                mock_tool,
                mock_permission,
                command=arg
            )
            assert result == "OK"

        # Verify NO permission requests
        assert len(permission_calls) == 0


class TestToolExecutorEdgeCases:
    """Test edge cases and error scenarios."""

    def setup_method(self):
        """Setup before each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def teardown_method(self):
        """Cleanup after each test."""
        if 'CLAUDE_BYPASS_PERMISSION' in os.environ:
            del os.environ['CLAUDE_BYPASS_PERMISSION']

    def test_tool_function_exception_propagates(self):
        """Test exceptions from tool function propagate correctly."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        def failing_tool():
            raise ValueError("Tool error")

        with pytest.raises(ValueError) as exc_info:
            executor.execute_tool('TestTool', failing_tool)

        assert "Tool error" in str(exc_info.value)

    def test_permission_function_exception_propagates(self):
        """Test exceptions from permission function propagate."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '0'
        executor = ToolExecutor()

        def mock_tool():
            return "OK"

        def failing_permission(tool_name, **kwargs):
            raise RuntimeError("Permission check failed")

        with pytest.raises(RuntimeError) as exc_info:
            executor.execute_tool('TestTool', mock_tool, failing_permission)

        assert "Permission check failed" in str(exc_info.value)

    def test_tool_with_no_args(self):
        """Test tool execution with no arguments."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        def no_arg_tool():
            return "Success"

        result = executor.execute_tool('TestTool', no_arg_tool)
        assert result == "Success"

    def test_tool_returns_none(self):
        """Test tool that returns None."""
        os.environ['CLAUDE_BYPASS_PERMISSION'] = '1'
        executor = ToolExecutor()

        def none_tool():
            return None

        result = executor.execute_tool('TestTool', none_tool)
        assert result is None
