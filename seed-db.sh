#!/bin/bash

# Make the script executable
chmod +x ./backend/scripts/seed.sh

# Execute seed script in the backend container
echo "Running seed script in Docker container..."
docker exec -it finance-tracker-backend /app/scripts/seed.sh

echo "Database seeding process completed!" 