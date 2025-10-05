.DEFAULT_GOAL := help

.PHONY: test
test:
	go test ./tests

.PHONY: sqlc
sqlc:
	docker run --rm -v $(PWD)/database:/src -w /src sqlc/sqlc generate

.PHONY: air
air:
	air

.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make test   - Run all tests in ./tests"
	@echo "  make sqlc   - Generate SQLC code using Docker"
	@echo "  make air    - Run Air for live reload"
