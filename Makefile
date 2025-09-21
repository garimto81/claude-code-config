# Claude Code Configuration Management
# Universal Makefile for development workflow

.PHONY: help install update health clean test lint docs

# Default target
help: ## Show this help message
	@echo "Claude Code Configuration Management"
	@echo "===================================="
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install Claude Code configuration
	@echo "🚀 Installing Claude Code configuration..."
	@bash scripts/install.sh

update: ## Update configuration from repository
	@echo "🔄 Updating configuration..."
	@cd ~/.claude-config && git pull --ff-only
	@rsync -a ~/.claude-config/.claude/ ~/.claude/
	@echo "✅ Configuration updated"

health: ## Run health check
	@echo "🔍 Running health check..."
	@bash scripts/healthcheck.sh

clean: ## Clean temporary files and caches
	@echo "🧹 Cleaning temporary files..."
	@rm -f ~/.claude/.sync.lock
	@rm -f ~/.claude/.install.lock
	@rm -rf ~/.claude/tmp/
	@echo "✅ Cleanup complete"

test: ## Test all scripts
	@echo "🧪 Testing scripts..."
	@echo "Testing install script..."
	@bash -n scripts/install.sh
	@echo "Testing healthcheck script..."
	@bash -n scripts/healthcheck.sh
	@echo "Testing migration script..."
	@bash -n .claude/migrations/migrate-1.x-to-2.x.sh
	@echo "✅ All scripts passed syntax check"

lint: ## Lint shell scripts
	@echo "📝 Linting shell scripts..."
	@if command -v shellcheck > /dev/null; then \
		find . -name "*.sh" -exec shellcheck {} +; \
		echo "✅ Shellcheck passed"; \
	else \
		echo "⚠️  shellcheck not installed, skipping lint"; \
	fi

docs: ## Generate documentation
	@echo "📚 Generating documentation..."
	@echo "# Claude Code Configuration" > DOCS.md
	@echo "" >> DOCS.md
	@echo "## Installation" >> DOCS.md
	@echo "\`\`\`bash" >> DOCS.md
	@echo "curl -sSL https://raw.githubusercontent.com/[username]/claude-code-config/main/quick-install.sh | bash" >> DOCS.md
	@echo "\`\`\`" >> DOCS.md
	@echo "" >> DOCS.md
	@echo "## Commands" >> DOCS.md
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "- **%s**: %s\n", $$1, $$2}' $(MAKEFILE_LIST) >> DOCS.md
	@echo "✅ Documentation generated: DOCS.md"

backup: ## Create backup of current configuration
	@echo "💾 Creating configuration backup..."
	@BACKUP_DIR="$$HOME/.claude.backup.$$(date +%Y%m%d%H%M%S)"; \
	cp -r ~/.claude "$$BACKUP_DIR"; \
	echo "✅ Backup created: $$BACKUP_DIR"

restore: ## Restore from latest backup (interactive)
	@echo "🔄 Available backups:"
	@ls -la ~/.claude.backup.* 2>/dev/null || echo "No backups found"
	@echo ""
	@read -p "Enter backup directory name to restore: " backup; \
	if [ -d "$$backup" ]; then \
		mv ~/.claude ~/.claude.replaced.$$(date +%Y%m%d%H%M%S); \
		cp -r "$$backup" ~/.claude; \
		echo "✅ Configuration restored from $$backup"; \
	else \
		echo "❌ Backup directory not found"; \
	fi

version: ## Show version information
	@echo "Claude Code Configuration Management"
	@echo "===================================="
	@if [ -f ~/.claude/version.json ]; then \
		VERSION=$$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' ~/.claude/version.json | sed 's/.*"\([^"]*\)"$$/\1/'); \
		SCHEMA=$$(grep -o '"schema"[[:space:]]*:[[:space:]]*"[^"]*"' ~/.claude/version.json | sed 's/.*"\([^"]*\)"$$/\1/'); \
		echo "Version: $$VERSION"; \
		echo "Schema: $$SCHEMA"; \
	else \
		echo "Version: Unknown (no version file)"; \
	fi
	@if command -v claude > /dev/null; then \
		echo "Claude CLI: $$(claude --version 2>/dev/null || echo 'Unknown')"; \
	else \
		echo "Claude CLI: Not installed"; \
	fi

setup: ## Initial setup for new projects
	@echo "🏗️  Setting up project..."
	@if [ -f package.json ]; then \
		echo "📦 Node.js project detected"; \
		npm install; \
	elif [ -f requirements.txt ]; then \
		echo "🐍 Python project detected"; \
		pip install -r requirements.txt; \
	elif [ -f Cargo.toml ]; then \
		echo "🦀 Rust project detected"; \
		cargo build; \
	elif [ -f go.mod ]; then \
		echo "🐹 Go project detected"; \
		go mod download; \
	else \
		echo "Generic project - no specific setup required"; \
	fi
	@echo "✅ Project setup complete"

dev: ## Start development environment
	@echo "🚀 Starting development environment..."
	@if [ -f .devcontainer/devcontainer.json ]; then \
		echo "🐳 Dev Container available - use 'Reopen in Container'"; \
	elif [ -f docker-compose.yml ]; then \
		docker-compose up -d; \
	elif [ -f package.json ] && grep -q '"dev"' package.json; then \
		npm run dev; \
	elif [ -f Cargo.toml ]; then \
		cargo run; \
	else \
		echo "No development server configuration found"; \
	fi