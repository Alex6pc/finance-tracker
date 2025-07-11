.PHONY: start stop restart install db logs build status clean all docker-service dbonly migration-generate migration-run migration-revert backend-logs dev

# Default target
all: start

# Start Docker service
docker-service:
	sudo service docker start || true
	@echo "Waiting for Docker daemon to initialize..."
	@sleep 10
	@echo "Setting permissions on Docker socket..."
	@sudo chmod 666 /var/run/docker.sock || true
	@sleep 2

# Start just database containers
dbonly: docker-service
	docker-compose -f docker-compose.db.yml up -d

# Start all containers
start: docker-service
	docker-compose up -d

# Stop all containers
stop:
	docker-compose down

# Start containers in attached mode to see all logs
# dev: docker-service
# 	docker-compose up

# Restart all containers
restart: stop start

# Install all dependencies
install:
	npm run install:all

# Start just the database and pgAdmin
db: docker-service
	docker-compose -f docker-compose.db.yml up -d

# Stop database and pgAdmin
dbstop:
	docker-compose -f docker-compose.db.yml down

# Build Docker images
build: docker-service
	docker-compose build

# Show container status
status:
	docker-compose ps

# Remove all containers, volumes, and images
clean:
	docker-compose down -v --rmi all

# Enter backend container shell
backend:
	docker-compose exec backend sh

# Enter frontend container shell
frontend:
	docker-compose exec frontend sh

# Show logs
logs:
	docker-compose logs -f --tail=100

# Show only backend logs
# backend-logs:
# 	docker-compose logs -f backend

# Generate a new migration
migration-generate:
	@if [ -z "$(name)" ]; then \
		echo "Error: Migration name is required. Use 'make migration-generate name=YourMigrationName'"; \
		exit 1; \
	fi
	docker-compose exec backend npm run typeorm -- migration:generate src/database/migrations/$(name)

# Run pending migrations
migration-run:
	docker-compose exec backend npm run migration:run

# Revert the last migration
migration-revert:
	docker-compose exec backend npm run migration:revert

# Allow chaining commands with spaces
%:
	@:

.SERIAL: all start stop restart install db logs build status clean migration-generate migration-run migration-revert backend-logs dev 