.DEFAULT_GOAL := help

NPM := npm
BACKEND_DIR := backend
FRONTEND_DIR := frontend
MVNW := ./mvnw

.PHONY: help install install-frontend install-backend run run-frontend run-backend \
	build test clean uninstall remove

help: ## Show the available Make commands
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: install-frontend install-backend ## Install frontend and backend dependencies

install-frontend: ## Install Node.js/frontend dependencies from the lockfile
	$(NPM) ci

install-backend: ## Download Maven/backend dependencies for offline use
	cd $(BACKEND_DIR) && $(MVNW) dependency:go-offline

run: ## Run the frontend and backend development servers
	$(NPM) run dev

run-frontend: ## Run only the Vite frontend
	$(NPM) run dev --workspace $(FRONTEND_DIR)

run-backend: ## Run only the Spring Boot backend
	cd $(BACKEND_DIR) && $(MVNW) spring-boot:run

build: ## Build the frontend and backend
	$(NPM) run build

test: ## Run frontend and backend tests
	$(NPM) test

clean: ## Remove generated build and test output
	rm -rf -- $(FRONTEND_DIR)/dist $(FRONTEND_DIR)/coverage coverage $(BACKEND_DIR)/target

uninstall: clean ## Remove installed dependencies and generated output
	@for directory in node_modules $(FRONTEND_DIR)/node_modules; do \
		attempt=1; \
		while [ -e "$$directory" ] && [ "$$attempt" -le 3 ]; do \
			rm -rf -- "$$directory"; \
			attempt=$$((attempt + 1)); \
			[ ! -e "$$directory" ] || sleep 1; \
		done; \
		if [ -e "$$directory" ]; then \
			echo "Could not remove $$directory after 3 attempts." >&2; \
			exit 1; \
		fi; \
	done
	@echo "Removed project dependencies and generated output."

remove: uninstall ## Alias for uninstall
